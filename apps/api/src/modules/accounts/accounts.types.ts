import { z } from 'zod'

export const CreateAccountSchema = z.object({
  // Seuls MT4/MT5 ont une synchro automatique fiable (MetaAPI) ; POLYMARKET
  // reste nécessaire pour les wallets de bots (bots.service.ts), qui créent
  // leur BrokerAccount via ce même schéma sans passer par la route HTTP.
  brokerType: z.enum(['MT4', 'MT5', 'POLYMARKET']),
  accountType: z.enum(['LIVE', 'DEMO', 'PROP_FUNDED', 'PROP_CHALLENGE']).default('DEMO'),
  accountId: z.string().min(1),
  label: z.string().min(1).max(100),
  credentials: z.record(z.string()).optional(),
})

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>
