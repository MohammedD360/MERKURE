import { env } from '../../../config/env.js'
import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'

const PROVISION_URL = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'

interface MetaDeal {
  id:          string
  type:        string   // DEAL_TYPE_BUY | DEAL_TYPE_SELL | DEAL_TYPE_BALANCE | ...
  entryType?:  string   // DEAL_ENTRY_IN | DEAL_ENTRY_OUT | DEAL_ENTRY_INOUT
  positionId?: string
  orderId?:    string
  symbol?:     string
  volume?:     number
  price?:      number
  profit?:     number
  commission?: number
  swap?:       number
  time:        string
  brokerTime?: string
}

interface MetaAccountInfo {
  balance:  number
  equity:   number
  currency: string
  leverage: number
}

function clientUrl(region: string): string {
  return `https://mt-client-api-v1.${region}.agiliumtrade.ai`
}

function token(): string {
  const t = env.METAAPI_TOKEN ?? env.META_API_TOKEN
  if (!t) throw new Error('METAAPI_TOKEN not configured')
  return t
}

/** Traduit les erreurs MetaAPI en messages actionnables affichables au client. */
function translateMetaApiError(status: number, msg: string): string {
  const m = msg.toLowerCase()

  if (m.includes('top up')) {
    return "Le quota MetaAPI est épuisé : le compte MetaAPI doit être crédité pour connecter un compte supplémentaire."
  }
  if (status === 401 || status === 403) {
    return "Accès MetaAPI refusé : vérifiez le jeton d'API MetaAPI."
  }
  if (m.includes('invalid account credentials') || m.includes('authentication failed')) {
    return "Identifiants refusés par le broker : vérifiez le numéro de compte, le mot de passe investisseur et le nom du serveur."
  }
  if (m.includes('server') && m.includes('not found')) {
    return "Serveur broker introuvable : le nom doit être identique à celui affiché dans votre terminal MT4/MT5."
  }
  return `MetaAPI ${status}: ${msg}`
}

async function metaFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { 'auth-token': token(), 'Content-Type': 'application/json', ...init?.headers },
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text).message ?? text } catch { /* raw */ }
    // Le client ne voit qu'un message traduit : on garde le brut côté serveur.
    console.error(`[metaapi] ${init?.method ?? 'GET'} ${url} → ${res.status}: ${text.slice(0, 500)}`)
    throw new Error(translateMetaApiError(res.status, msg))
  }
  return text ? JSON.parse(text) : null
}

export interface MetaApiAccount {
  _id:    string
  login:  string
  server: string
  state?: string
  name?:  string
}

/**
 * Liste tous les comptes du parc MetaAPI, page par page.
 *
 * L'API plafonne chaque réponse : sans pagination, un parc de plus de 100 comptes
 * renverrait une liste tronquée, un compte existant passerait pour absent, et on
 * en provisionnerait un doublon — facturé.
 */
export async function listAllAccounts(): Promise<MetaApiAccount[]> {
  const PAGE = 100
  const all: MetaApiAccount[] = []

  for (let offset = 0; ; offset += PAGE) {
    const page: MetaApiAccount[] = await metaFetch(
      `${PROVISION_URL}/users/current/accounts?limit=${PAGE}&offset=${offset}`,
    )
    if (!page?.length) break
    all.push(...page)
    if (page.length < PAGE) break
  }

  return all
}

export class MetaApiAdapter implements BrokerAdapter {
  private metaApiId: string | null = null
  private region:    string        = 'london'

  async connect(credentials: Record<string, string>): Promise<void> {
    const accountId   = credentials['accountId']   ?? ''
    const upass       = credentials['upass']       ?? ''
    const tradeserver = credentials['tradeserver'] ?? ''
    const platform    = credentials['platform']    ?? 'mt4'
    const metaApiId   = credentials['metaApiId']

    this.metaApiId = metaApiId ?? (await this.findOrProvision(accountId, upass, tradeserver, platform))

    const account = await metaFetch(`${PROVISION_URL}/users/current/accounts/${this.metaApiId}`)
    this.region = account.region ?? 'london'

    if (account.state === 'UNDEPLOYED' || account.state === 'DEPLOYING') {
      await this.deploy()
    }

    if (account.connectionStatus !== 'CONNECTED') {
      await this.waitForConnection(90_000)
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    if (!this.metaApiId) throw new Error('Not connected')
    const info: MetaAccountInfo = await metaFetch(
      `${clientUrl(this.region)}/users/current/accounts/${this.metaApiId}/account-information`,
    )
    return {
      balance:  info.balance,
      equity:   info.equity,
      currency: info.currency ?? 'USD',
    }
  }

  async getTradeHistory(from: Date, to: Date): Promise<TradeData[]> {
    if (!this.metaApiId) throw new Error('Not connected')

    const fromEnc = encodeURIComponent(from.toISOString())
    const toEnc   = encodeURIComponent(to.toISOString())
    const deals: MetaDeal[] = await metaFetch(
      `${clientUrl(this.region)}/users/current/accounts/${this.metaApiId}/history-deals/time/${fromEnc}/${toEnc}`,
    )

    return this.dealsToTrades(deals ?? [])
  }

  providerAccountId(): string | null {
    return this.metaApiId
  }

  /**
   * Supprime définitivement le compte chez MetaAPI. Appelé quand le client
   * déconnecte son broker : sans cela le compte reste provisionné et facturé.
   */
  async deleteRemoteAccount(providerAccountId: string): Promise<void> {
    await metaFetch(`${PROVISION_URL}/users/current/accounts/${providerAccountId}`, {
      method: 'DELETE',
    })
  }

  /**
   * MetaAPI facture les comptes *déployés* : on éteint le terminal dès la
   * synchronisation terminée. Le compte reste provisionné, donc la prochaine
   * synchro le redéploie sans le recréer.
   */
  async disconnect(): Promise<void> {
    const id = this.metaApiId
    this.metaApiId = null
    if (!id || !env.METAAPI_UNDEPLOY_AFTER_SYNC) return

    try {
      await metaFetch(`${PROVISION_URL}/users/current/accounts/${id}/undeploy`, {
        method: 'POST', body: '{}',
      })
    } catch (err) {
      // Un undeploy raté ne doit jamais faire échouer une synchro réussie.
      console.error(`[metaapi] undeploy ${id} a échoué :`, err instanceof Error ? err.message : err)
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async findOrProvision(
    login: string, password: string, server: string, platform: string,
  ): Promise<string> {
    // Ce balayage n'a lieu qu'au tout premier rattachement : ensuite l'identifiant
    // est persisté en base et passé directement dans les credentials.
    const accounts = await listAllAccounts()

    // Try exact match first, then fall back to login-only (server name format may differ)
    const byLoginServer = accounts.find(a => a.login === login && a.server === server)
    if (byLoginServer) return byLoginServer._id

    const byLogin = accounts.find(a => a.login === login)
    if (byLogin) return byLogin._id

    // Provision new account — use the broker server name as-is
    return this.createAccountWithRetry(login, password, server, platform)
  }

  /**
   * MetaAPI valide les identifiants auprès du serveur broker de façon
   * asynchrone : le POST de création répond en 202 avec
   * {"error":"AcceptedError", ...} tant que la validation n'est pas terminée.
   * C'est un statut 2xx, donc metaFetch() ne lève pas — sans ce garde-fou, on
   * prenait ce champ `id` (un ticket de validation temporaire, ex: 2030,
   * 14793…) pour un vrai identifiant de compte MetaAPI, et le GET suivant
   * échouait systématiquement en 404 ("Trading account with id X not found").
   */
  private async createAccountWithRetry(
    login: string, password: string, server: string, platform: string,
  ): Promise<string> {
    const MAX_ATTEMPTS = 6
    const RETRY_DELAY_MS = 20_000

    const body = JSON.stringify({
      name:     `${login}@${server}`,
      type:     'cloud',
      login,
      password,
      server,
      platform,
      magic:    0,
      reliability: env.METAAPI_RELIABILITY,
    })

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const created = await metaFetch(`${PROVISION_URL}/users/current/accounts`, { method: 'POST', body })

      if (created?.error === 'AcceptedError') {
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(
            'MetaAPI met plus de temps que prévu à valider ces identifiants. Réessayez la synchronisation dans une minute.',
          )
        }
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
        continue
      }

      const id = created?._id ?? created?.id
      if (!id) throw new Error('MetaAPI : réponse de création de compte inattendue')
      return String(id)
    }

    throw new Error('MetaAPI : délai de validation du compte dépassé')
  }

  private async deploy(): Promise<void> {
    await metaFetch(
      `${PROVISION_URL}/users/current/accounts/${this.metaApiId}/deploy`,
      { method: 'POST', body: '{}' },
    )
  }

  private async waitForConnection(timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 5_000))
      const account = await metaFetch(`${PROVISION_URL}/users/current/accounts/${this.metaApiId}`)
      if (account.connectionStatus === 'CONNECTED') return
      if (account.connectionStatus === 'ERROR') {
        throw new Error(`MetaAPI connection error: ${account.connectionError ?? 'unknown'}`)
      }
    }
    throw new Error('MetaAPI: délai de connexion dépassé (90s)')
  }

  private dealsToTrades(deals: MetaDeal[]): TradeData[] {
    const TRADE_TYPES = new Set(['DEAL_TYPE_BUY', 'DEAL_TYPE_SELL'])

    // Index IN deals by positionId for open price/time lookup
    const inDeals = new Map<string, MetaDeal>()
    for (const d of deals) {
      if (TRADE_TYPES.has(d.type) && d.entryType === 'DEAL_ENTRY_IN' && d.positionId) {
        inDeals.set(d.positionId, d)
      }
    }

    const trades: TradeData[] = []
    for (const d of deals) {
      if (!TRADE_TYPES.has(d.type)) continue
      if (d.entryType !== 'DEAL_ENTRY_OUT' && d.entryType !== 'DEAL_ENTRY_INOUT') continue
      if (!d.symbol) continue

      const inDeal = d.positionId ? inDeals.get(d.positionId) : undefined
      const openTime  = inDeal ? new Date(inDeal.time) : new Date(d.time)
      const closeTime = new Date(d.time)

      trades.push({
        externalId:  d.positionId ?? d.id,
        symbol:      d.symbol,
        direction:   d.type === 'DEAL_TYPE_BUY' ? 'LONG' : 'SHORT',
        openTime,
        closeTime,
        openPrice:   inDeal?.price ?? d.price ?? 0,
        closePrice:  d.price ?? null,
        lotSize:     d.volume ?? 0,
        pnl:         d.profit ?? null,
        swap:        d.swap ?? 0,
        commission:  d.commission ?? 0,
        status:      'CLOSED',
      })
    }

    return trades
  }
}
