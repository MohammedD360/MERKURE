import { z } from 'zod'

export const CreateAccountSchema = z.object({
  brokerType: z.enum(['MT4', 'MT5', 'BINANCE', 'IB', 'CTRADER', 'TRADOVATE', 'POLYMARKET']),
  accountType: z.enum(['LIVE', 'DEMO', 'PROP_FUNDED', 'PROP_CHALLENGE']).default('DEMO'),
  accountId: z.string().min(1),
  label: z.string().min(1).max(100),
  credentials: z.record(z.string()).optional(),
})

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>
