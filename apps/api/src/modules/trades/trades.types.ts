import { z } from 'zod'

export const TradesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  symbol: z.string().optional(),
  direction: z.enum(['LONG', 'SHORT']).optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  accountId: z.string().uuid().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
})

export type TradesQuery = z.infer<typeof TradesQuerySchema>

export const AnnotateTradeSchema = z.object({
  note: z.string().max(2000).optional(),
  strategyTag: z.string().max(100).optional(),
})

export type AnnotateTradeInput = z.infer<typeof AnnotateTradeSchema>
