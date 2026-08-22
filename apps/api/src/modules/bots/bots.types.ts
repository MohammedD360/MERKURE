import { z } from 'zod'

export const RiskConfigSchema = z.object({
  maxSessionLossPct:      z.number().min(0.5).max(50).default(5),
  maxPositionSizeUsd:     z.number().positive().default(100),
  maxConcurrentPositions: z.number().int().positive().default(3),
})

export const MarketFiltersSchema = z.object({
  categories:      z.array(z.string()).default([]),
  minLiquidityUsd: z.number().nonnegative().default(5_000),
  maxMarkets:      z.number().int().positive().max(10).default(3),
})

export const CreateBotSchema = z.object({
  name:          z.string().min(1).max(100),
  walletAddress: z.string().min(1),
  privateKey:    z.string().min(1),
  // Adresse du proxy wallet Polymarket qui détient les fonds — distincte de
  // walletAddress (l'EOA qui signe). Visible sur polymarket.com une fois
  // connecté. Nécessaire uniquement pour le mode LIVE.
  funderAddress: z.string().min(1).optional(),
  // Détermine le signatureType EIP-712 attendu par le CLOB Polymarket.
  accountKind:   z.enum(['MAGIC_EMAIL', 'FRESH_WALLET']).default('FRESH_WALLET'),
  mode:          z.enum(['DRY_RUN', 'LIVE']).default('DRY_RUN'),
  marketFilters: MarketFiltersSchema.default({}),
  riskConfig:    RiskConfigSchema.default({}),
  sessionStartEquity: z.number().nonnegative().default(0),
}).refine(
  (data) => data.mode !== 'LIVE' || Boolean(data.funderAddress),
  { message: 'funderAddress est requis en mode LIVE', path: ['funderAddress'] },
)

export const UpdateBotSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  status:      z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED']).optional(),
  mode:        z.enum(['DRY_RUN', 'LIVE']).optional(),
  marketFilters: MarketFiltersSchema.optional(),
  riskConfig:    RiskConfigSchema.optional(),
})

export type CreateBotInput = z.infer<typeof CreateBotSchema>
export type UpdateBotInput = z.infer<typeof UpdateBotSchema>
export type RiskConfig     = z.infer<typeof RiskConfigSchema>
export type MarketFilters  = z.infer<typeof MarketFiltersSchema>
