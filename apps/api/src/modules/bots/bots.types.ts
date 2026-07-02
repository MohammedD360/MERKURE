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
  name:        z.string().min(1).max(100),
  walletAddress: z.string().min(1),
  privateKey:    z.string().min(1),
  mode:          z.enum(['DRY_RUN', 'LIVE']).default('DRY_RUN'),
  marketFilters: MarketFiltersSchema.default({}),
  riskConfig:    RiskConfigSchema.default({}),
  sessionStartEquity: z.number().nonnegative().default(0),
})

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
