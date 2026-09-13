import { z } from 'zod'

export const CreateAccountSchema = z.object({
  // Seuls MT4/MT5 ont une synchro automatique fiable (MetaAPI) ; POLYMARKET
  // reste nécessaire pour les wallets de bots (bots.service.ts), qui créent
  // leur BrokerAccount via ce même schéma sans passer par la route HTTP.
  // MANUAL n'a pas d'adapter : le compte n'est jamais synchronisé, il est
  // alimenté uniquement via l'import CSV (voir csv-import.routes.ts).
  brokerType: z.enum(['MT4', 'MT5', 'POLYMARKET', 'MANUAL']),
  accountType: z.enum(['LIVE', 'DEMO', 'PROP_FUNDED', 'PROP_CHALLENGE']).default('DEMO'),
  accountId: z.string().min(1),
  label: z.string().min(1).max(100),
  credentials: z.record(z.string()).optional(),
  // Capital de départ — seule source de solde pour les comptes MANUAL, qui
  // n'ont pas de sync broker capable de le fournir en direct.
  startingBalance: z.number().nonnegative().optional(),
})

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>

export const UpdateAccountSchema = z.object({
  startingBalance: z.number().nonnegative().nullable().optional(),
})

export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>
