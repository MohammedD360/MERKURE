import { describe, expect, it, vi, beforeEach } from 'vitest'

const listAllAccounts   = vi.fn()
const deleteRemote      = vi.fn()
const findManyAccounts  = vi.fn()

vi.mock('../brokers/adapters/meta-api-adapter.js', () => ({
  listAllAccounts: () => listAllAccounts(),
  MetaApiAdapter: class { deleteRemoteAccount = deleteRemote },
}))
vi.mock('../../infrastructure/database/client.js', () => ({
  prisma: { brokerAccount: { findMany: () => findManyAccounts() } },
}))
vi.mock('../../config/env.js', () => ({
  env: { get PROVIDER_RECONCILE_DELETE() { return deleteEnabled } },
}))

let deleteEnabled = false

const { reconcileProviderAccounts } = await import('./provider-reconcile.js')

const providerAccount = (id: string, login: string) => ({
  _id: id, login, server: 'Broker-Server', state: 'UNDEPLOYED', name: `${login}@Broker-Server`,
})

describe('reconcileProviderAccounts', () => {
  beforeEach(() => {
    deleteEnabled = false
    listAllAccounts.mockReset()
    deleteRemote.mockReset()
    findManyAccounts.mockReset()
  })

  it('ne signale rien quand chaque compte du fournisseur est rattaché', async () => {
    listAllAccounts.mockResolvedValue([providerAccount('meta-1', '5001')])
    findManyAccounts.mockResolvedValue([{ providerAccountId: 'meta-1', accountId: '5001' }])

    const report = await reconcileProviderAccounts()

    expect(report.orphans).toHaveLength(0)
    expect(deleteRemote).not.toHaveBeenCalled()
  })

  it('signale un compte facturé qu’aucune ligne ne réclame', async () => {
    listAllAccounts.mockResolvedValue([providerAccount('meta-orphan', '9999')])
    findManyAccounts.mockResolvedValue([{ providerAccountId: 'meta-1', accountId: '5001' }])

    const report = await reconcileProviderAccounts()

    expect(report.orphans).toHaveLength(1)
    expect(report.orphans[0]).toMatchObject({ id: 'meta-orphan', login: '9999' })
  })

  it('épargne un compte tout juste provisionné, dont l’identifiant n’est pas encore persisté', async () => {
    // La synchro a créé le compte chez le fournisseur mais n'a pas fini d'écrire
    // providerAccountId : seul le login rattache encore les deux côtés.
    listAllAccounts.mockResolvedValue([providerAccount('meta-fresh', '5001')])
    findManyAccounts.mockResolvedValue([{ providerAccountId: null, accountId: '5001' }])

    const report = await reconcileProviderAccounts()

    expect(report.orphans).toHaveLength(0)
  })

  it('ne supprime rien tant que la suppression automatique n’est pas activée', async () => {
    listAllAccounts.mockResolvedValue([providerAccount('meta-orphan', '9999')])
    findManyAccounts.mockResolvedValue([])

    const report = await reconcileProviderAccounts()

    expect(report.orphans).toHaveLength(1)
    expect(report.deleted).toHaveLength(0)
    expect(deleteRemote).not.toHaveBeenCalled()
  })

  it('supprime les orphelins une fois la suppression automatique activée', async () => {
    deleteEnabled = true
    listAllAccounts.mockResolvedValue([providerAccount('meta-orphan', '9999')])
    findManyAccounts.mockResolvedValue([])
    deleteRemote.mockResolvedValue(undefined)

    const report = await reconcileProviderAccounts()

    expect(deleteRemote).toHaveBeenCalledWith('meta-orphan')
    expect(report.deleted).toEqual(['meta-orphan'])
  })

  it('poursuit la réconciliation quand une suppression échoue', async () => {
    deleteEnabled = true
    listAllAccounts.mockResolvedValue([
      providerAccount('meta-ko', '8888'),
      providerAccount('meta-ok', '9999'),
    ])
    findManyAccounts.mockResolvedValue([])
    deleteRemote.mockRejectedValueOnce(new Error('MetaAPI 500')).mockResolvedValueOnce(undefined)

    const report = await reconcileProviderAccounts()

    expect(report.orphans).toHaveLength(2)
    expect(report.deleted).toEqual(['meta-ok'])
  })
})
