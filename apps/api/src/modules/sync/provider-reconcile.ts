import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'
import {
  listAllAccounts,
  MetaApiAdapter,
  type MetaApiAccount,
} from '../brokers/adapters/meta-api-adapter.js'

export interface ReconcileReport {
  providerAccounts: number
  knownAccounts:    number
  orphans:          { id: string; login: string; name: string; state: string }[]
  deleted:          string[]
}

/**
 * Compare le parc du fournisseur de données à ce que MERKURE connaît.
 *
 * Un compte présent chez MetaAPI mais absent de notre base est facturé sans
 * contrepartie : c'est ce qui arrive quand une suppression échoue côté fournisseur,
 * ou quand un compte a été provisionné hors de l'application. Sans réconciliation
 * ces fuites ne se voient que sur la facture.
 *
 * Un compte est déclaré orphelin uniquement s'il échoue aux **deux** rattachements :
 * par identifiant fournisseur, et par numéro de compte broker. Le second protège
 * d'une course : un compte provisionné à l'instant, dont l'identifiant n'est pas
 * encore persisté, reste reconnu par son login et n'est donc jamais supprimé.
 */
export async function reconcileProviderAccounts(): Promise<ReconcileReport> {
  const providerAccounts = await listAllAccounts()

  const known = await prisma.brokerAccount.findMany({
    where:  { deletedAt: null, brokerType: { in: ['MT4', 'MT5'] } },
    select: { providerAccountId: true, accountId: true },
  })

  const knownProviderIds = new Set(known.map(a => a.providerAccountId).filter(Boolean))
  const knownLogins      = new Set(known.map(a => a.accountId))

  const isOrphan = (a: MetaApiAccount) =>
    !knownProviderIds.has(a._id) && !knownLogins.has(a.login)

  const orphans = providerAccounts.filter(isOrphan)
  const deleted: string[] = []

  for (const orphan of orphans) {
    const label = `${orphan.login}@${orphan.server} (${orphan._id})`

    if (!env.PROVIDER_RECONCILE_DELETE) {
      console.warn(`[reconcile] compte orphelin facturé chez MetaAPI : ${label} — suppression désactivée`)
      continue
    }

    try {
      await new MetaApiAdapter().deleteRemoteAccount(orphan._id)
      deleted.push(orphan._id)
      console.warn(`[reconcile] compte orphelin supprimé chez MetaAPI : ${label}`)
    } catch (err) {
      console.error(`[reconcile] suppression impossible pour ${label} :`, err instanceof Error ? err.message : err)
    }
  }

  return {
    providerAccounts: providerAccounts.length,
    knownAccounts:    known.length,
    orphans: orphans.map(o => ({
      id:    o._id,
      login: o.login,
      name:  o.name  ?? '',
      state: o.state ?? '',
    })),
    deleted,
  }
}
