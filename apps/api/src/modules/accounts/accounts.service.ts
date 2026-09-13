import { accountsRepository } from './accounts.repository.js'
import { encrypt } from '../../infrastructure/crypto/encryption.js'
import { prisma } from '../../infrastructure/database/client.js'
import { writeAuditLog } from '../../infrastructure/database/audit.js'
import type { CreateAccountInput, UpdateAccountInput } from './accounts.types.js'
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
    return prisma.brokerAccount.count({ where: { userId, isActive: true, deletedAt: null } })
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

  async update(id: string, userId: string, input: UpdateAccountInput) {
    const result = await accountsRepository.update(id, userId, input)
    if (result.count === 0) {
      const err = new Error('account_not_found')
      Object.assign(err, { status: 404 })
      throw err
    }
    // Le capital de départ entre dans le calcul du solde du portefeuille :
    // sans purge, la carte "Valeur du portefeuille" resterait figée sur le
    // montant caché jusqu'à expiration du TTL.
    await Promise.all([
      cache.del(`portfolio:summary:${userId}`),
      cache.del(`portfolio:equity:${userId}`),
    ])
    return accountsRepository.findById(id, userId)
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

    await accountsRepository.softDelete(id, userId)

    // Les trades et bots du compte survivent (soft-delete), mais les agrégats
    // restent en cache jusqu'à expiration : sans purge, le dashboard
    // continuerait d'afficher le P&L d'un compte qui vient d'être déconnecté.
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
      action:      'soft_delete',
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
