import Anthropic from '@anthropic-ai/sdk'
import type { TradingBot } from '@prisma/client'
import { env } from '../../config/env.js'
import { polymarketClient } from '../../infrastructure/polymarket/clob-client.js'
import { duneClient } from '../../infrastructure/dune/dune-client.js'
import type { MarketFilters, RiskConfig } from './bots.types.js'

const MODEL = 'claude-opus-4-8'
const MAX_TOOL_ITERATIONS = 6

export interface TradingCycleResult {
  marketId:  string
  question:  string
  side:      'YES' | 'NO' | 'HOLD'
  sizeUsd:   number
  price:     number
  status:    'SIMULATED' | 'SUBMITTED' | 'FILLED' | 'REJECTED' | 'FAILED'
  pnl:       number | null
  reasoning: unknown[] // trace complète (thinking + appels d'outils) — persistée dans BotDecision.reasoning
  summary:   string
}

interface WalletCredentials {
  privateKey:    string
  walletAddress: string
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_market_data',
    description:
      "Liste les marchés Polymarket correspondant aux filtres du bot (catégories, liquidité minimale). " +
      "À appeler en premier pour voir quels marchés sont disponibles.",
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_order_book',
    description: "Récupère le carnet d'ordres (bids/asks) d'un marché Polymarket précis, via son tokenId YES ou NO.",
    input_schema: {
      type: 'object',
      properties: {
        marketId: { type: 'string', description: 'ID du marché (condition ID)' },
        tokenId:  { type: 'string', description: 'Token ID (YES ou NO) dont on veut le carnet' },
      },
      required: ['marketId', 'tokenId'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_whale_activity',
    description:
      "Renvoie l'activité récente des wallets baleines sur Polymarket (via Dune Analytics) : " +
      "montants, sens (BUY/SELL). Utile pour détecter un momentum avant de décider.",
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'place_order',
    description:
      "Passe un ordre sur un marché Polymarket (achat de shares YES ou NO). " +
      "En mode DRY_RUN, l'ordre est simulé (aucun fonds réel engagé). " +
      "Respecte impérativement riskConfig.maxPositionSizeUsd — ne jamais dépasser cette taille.",
    input_schema: {
      type: 'object',
      properties: {
        marketId: { type: 'string' },
        question: { type: 'string', description: 'Question du marché, pour le journal' },
        tokenId:  { type: 'string', description: 'Token ID du côté choisi (YES ou NO)' },
        side:     { type: 'string', enum: ['YES', 'NO'] },
        price:    { type: 'number', description: 'Prix limite (0 à 1)' },
        sizeUsd:  { type: 'number', description: 'Montant en USD à engager' },
      },
      required: ['marketId', 'question', 'tokenId', 'side', 'price', 'sizeUsd'],
      additionalProperties: false,
    },
  },
]

function buildSystemPrompt(bot: TradingBot, filters: MarketFilters, risk: RiskConfig): string {
  return [
    `Tu es un agent de trading autonome sur Polymarket pour le compte "${bot.name}".`,
    `Mode actuel : ${bot.mode} ${bot.mode === 'DRY_RUN' ? '(paper trading — aucun ordre réel ne sera envoyé)' : '(LIVE — les ordres sont réels, engage des fonds véritables)'}.`,
    ``,
    `Contraintes strictes de risque (ne jamais les dépasser) :`,
    `- Taille maximale par position : ${risk.maxPositionSizeUsd} USD`,
    `- Positions concurrentes maximum : ${risk.maxConcurrentPositions}`,
    `- Perte de session maximale avant arrêt automatique : ${risk.maxSessionLossPct}%`,
    ``,
    `Filtres de marché : catégories = [${filters.categories.join(', ') || 'toutes'}], ` +
      `liquidité minimale = ${filters.minLiquidityUsd} USD, ${filters.maxMarkets} marché(s) max analysé(s).`,
    ``,
    `Démarche attendue à chaque cycle : consulte les marchés disponibles, le carnet d'ordres du ou des ` +
      `marchés les plus pertinents, et l'activité des wallets baleines pour détecter un signal de momentum. ` +
      `Décide ensuite de passer un ordre (outil place_order) ou de ne rien faire ce cycle. ` +
      `Termine toujours par un résumé en 1-2 phrases de ta décision et de sa justification.`,
  ].join('\n')
}

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: { bot: TradingBot; wallet: WalletCredentials; filters: MarketFilters; risk: RiskConfig; decision: { value: TradingCycleResult | null } },
): Promise<unknown> {
  switch (name) {
    case 'get_market_data': {
      const markets = await polymarketClient.getMarkets()
      const filtered = markets.filter((m) =>
        (ctx.filters.categories.length === 0 || ctx.filters.categories.includes(m.category)) &&
        m.liquidityUsd >= ctx.filters.minLiquidityUsd,
      )
      return { markets: filtered.slice(0, ctx.filters.maxMarkets) }
    }

    case 'get_order_book': {
      const marketId = String(input['marketId'] ?? '')
      const tokenId  = String(input['tokenId'] ?? '')
      return polymarketClient.getOrderBook(marketId, tokenId)
    }

    case 'get_whale_activity': {
      const signals = await duneClient.getWhaleActivity()
      return { signals }
    }

    case 'place_order': {
      const sizeUsd = Number(input['sizeUsd'] ?? 0)
      if (sizeUsd > ctx.risk.maxPositionSizeUsd) {
        return { error: `sizeUsd (${sizeUsd}) dépasse riskConfig.maxPositionSizeUsd (${ctx.risk.maxPositionSizeUsd}) — ordre refusé.` }
      }

      const marketId = String(input['marketId'] ?? '')
      const question = String(input['question'] ?? 'Marché Polymarket')
      const side     = input['side'] === 'NO' ? 'NO' as const : 'YES' as const
      const price    = Number(input['price'] ?? 0.5)
      const tokenId  = String(input['tokenId'] ?? '')

      if (ctx.bot.mode === 'DRY_RUN' || !polymarketClient.isLiveConfigured()) {
        ctx.decision.value = {
          marketId, question, side, sizeUsd, price,
          status: 'SIMULATED', pnl: null, reasoning: [], summary: '',
        }
        return { simulated: true, message: 'Ordre simulé (mode DRY_RUN) — aucun fonds réel engagé.' }
      }

      try {
        const result = await polymarketClient.placeOrder({
          privateKey: ctx.wallet.privateKey,
          tokenId,
          side: 'BUY',
          price,
          sizeUsd,
        })
        ctx.decision.value = {
          marketId, question, side, sizeUsd, price,
          status: result.status === 'FILLED' ? 'FILLED' : 'SUBMITTED',
          pnl: null, reasoning: [], summary: '',
        }
        return result
      } catch (err) {
        ctx.decision.value = {
          marketId, question, side, sizeUsd, price,
          status: 'FAILED', pnl: null, reasoning: [], summary: '',
        }
        return { error: err instanceof Error ? err.message : 'order_failed' }
      }
    }

    default:
      return { error: `outil inconnu: ${name}` }
  }
}

export async function runTradingCycle(bot: TradingBot, wallet: WalletCredentials): Promise<TradingCycleResult> {
  const filters = bot.marketFilters as unknown as MarketFilters
  const risk    = bot.riskConfig as unknown as RiskConfig

  if (!env.ANTHROPIC_API_KEY) {
    return {
      marketId: '', question: '', side: 'HOLD', sizeUsd: 0, price: 0,
      status: 'SIMULATED', pnl: null, reasoning: [],
      summary: "Clé ANTHROPIC_API_KEY absente — cycle ignoré.",
    }
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  const decision: { value: TradingCycleResult | null } = { value: null }
  const trace: unknown[] = []

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: 'Nouveau cycle de trading. Analyse la situation et décide.' },
  ]

  let finalText = ''

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: buildSystemPrompt(bot, filters, risk),
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      tools: TOOLS,
      messages,
    })

    trace.push({ iteration: i, stopReason: response.stop_reason, content: response.content })

    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    const textBlocks     = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text')
    const lastTextBlock = textBlocks[textBlocks.length - 1]
    if (lastTextBlock) finalText = lastTextBlock.text

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) break

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of toolUseBlocks) {
      const output = await executeTool(block.name, block.input as Record<string, unknown>, { bot, wallet, filters, risk, decision })
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(output) })
    }
    messages.push({ role: 'user', content: toolResults })
  }

  if (decision.value) {
    return { ...decision.value, reasoning: trace, summary: finalText || 'Décision prise sans résumé.' }
  }

  return {
    marketId: '', question: '', side: 'HOLD', sizeUsd: 0, price: 0,
    status: 'SIMULATED', pnl: null, reasoning: trace,
    summary: finalText || "Aucune action ce cycle.",
  }
}
