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

export const CreateTradeSchema = z.object({
  brokerAccountId: z.string().uuid(),
  symbol:          z.string().min(1).max(20).transform(s => s.toUpperCase()),
  direction:       z.enum(['LONG', 'SHORT']),
  status:          z.enum(['OPEN', 'CLOSED']).default('CLOSED'),
  openTime:        z.string().datetime({ offset: true }),
  closeTime:       z.string().datetime({ offset: true }).optional().nullable(),
  openPrice:       z.coerce.number().positive(),
  closePrice:      z.coerce.number().positive().optional().nullable(),
  lotSize:         z.coerce.number().positive(),
  pnl:             z.coerce.number().optional().nullable(),
  swap:            z.coerce.number().default(0),
  commission:      z.coerce.number().default(0),
  strategyTag:     z.string().max(100).optional().nullable(),
  note:            z.string().max(2000).optional().nullable(),
})

export type CreateTradeInput = z.infer<typeof CreateTradeSchema>
