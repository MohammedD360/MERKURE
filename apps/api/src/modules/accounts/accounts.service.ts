import { accountsRepository } from './accounts.repository.js'
import { encrypt } from '../../infrastructure/crypto/encryption.js'
import { prisma } from '../../infrastructure/database/client.js'
import { writeAuditLog } from '../../infrastructure/database/audit.js'
import type { CreateAccountInput } from './accounts.types.js'
import { cache } from '../../infrastructure/cache/redis.js'
import { MetaApiAdapter } from '../brokers/adapters/meta-api-adapter.js'

/**
 * Supprime le compte chez le fournisseur de données qui le facture.
 *
 * Volontairement non bloquant : si le fournisseur est injoignable, la suppression
 * côté MERKURE doit aboutir quand même — un client qui demande à se déconnecter
 * ne doit pas rester bloqué. Le job de réconciliation rattrapera l'orphelin.
 */
async function releaseProviderAccount(account: {
  id: string
  brokerType: string
  providerAccountId: string | null
}): Promise<void> {
  if (!account.providerAccountId) return
  if (account.brokerType !== 'MT4' && account.brokerType !== 'MT5') return

  try {
    await new MetaApiAdapter().deleteRemoteAccount(account.providerAccountId)
  } catch (err) {
    console.error(
      `[accounts] échec de la suppression du compte ${account.providerAccountId} chez MetaAPI ` +
      `(compte ${account.id}) — il reste facturé jusqu'à la réconciliation :`,
      err instanceof Error ? err.message : err,
    )
  }
}

export const accountsService = {
  count(userId: string) {
    return prisma.brokerAccount.count({ where: { userId, isActive: true } })
  },

  list(userId: string) {
    return accountsRepository
      .findAll(userId)
      .then((rows) => rows.map((a) => ({ ...a, credentialsEnc: undefined })))
  },

  findById(id: string, userId: string) {
    return accountsRepository.findById(id, userId)
  },

  async create(userId: string, input: CreateAccountInput) {
    const credentialsEnc = input.credentials ? encrypt(input.credentials) : undefined
    const account = await accountsRepository.create(userId, input, credentialsEnc)
    return { ...account, credentialsEnc: undefined }
  },

  async delete(id: string, userId: string) {
    const account = await accountsRepository.findById(id, userId)
    if (!account) {
      const err = new Error('account_not_found')
      Object.assign(err, { status: 404 })
      throw err
    }
    // Libérer le compte chez le fournisseur de données AVANT de perdre son
    // identifiant : sinon il y reste provisionné et facturé, sans plus aucune
    // trace côté MERKURE permettant de le retrouver.
    await releaseProviderAccount(account)

    await accountsRepository.hardDelete(id, userId)

    // La cascade Prisma supprime les trades et les bots du compte, mais les
    // agrégats restent en cache jusqu'à expiration : sans purge, le dashboard
    // continuerait d'afficher le P&L d'un compte qui n'existe plus.
    await Promise.all([
      cache.delPattern(`trades:${userId}:*`),
      cache.delPattern(`kpis:${userId}:*`),
      cache.delPattern(`performance:${userId}:*`),
      cache.delPattern(`stats:${userId}:*`),
      cache.delPattern(`portfolio:${userId}:*`),
      cache.delPattern(`propfirm:compliance:${userId}:*`),
      cache.delPattern(`ai:score:${userId}:*`),
      cache.del(`trades:live:${id}`),
    ])

    await writeAuditLog({
      entityType:  'broker_account',
      entityId:    id,
      action:      'hard_delete',
      performedBy: userId,
      metadata: {
        brokerType:  account.brokerType,
        accountId:   account.accountId,
        label:       account.label,
        accountType: account.accountType,
      },
    })
  },
}
