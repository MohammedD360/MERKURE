import type { BrokerType, AccountType, SyncStatus } from '@prisma/client'
import { prisma } from '../../infrastructure/database/client.js'
import type { CreateAccountInput } from './accounts.types.js'

export const accountsRepository = {
  findAll(userId: string) {
    return prisma.brokerAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string, userId: string) {
    return prisma.brokerAccount.findFirst({ where: { id, userId } })
  },

  // Seuls MT4/MT5 passent par la synchro broker automatique : les comptes
  // POLYMARKET (wallets de bots) ont leur propre cycle (bot-trading-cycle) et
  // ne doivent jamais atterrir dans broker-sync, faute d'adapter dédié.
  findAllActive() {
    return prisma.brokerAccount.findMany({
      where: { isActive: true, brokerType: { in: ['MT4', 'MT5'] } },
      select: { id: true, userId: true, brokerType: true },
    })
  },

  async create(userId: string, input: CreateAccountInput, credentialsEnc?: Buffer) {
    // Si un compte soft-deleted existe déjà, on le réactive avec les nouvelles credentials
    const existing = await prisma.brokerAccount.findFirst({
      where: { userId, brokerType: input.brokerType as BrokerType, accountId: input.accountId },
    })

    if (existing) {
      return prisma.brokerAccount.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          deletedAt: null,
          label: input.label,
          accountType: input.accountType as AccountType,
          credentialsEnc: credentialsEnc ?? null,
          syncStatus: 'PENDING',
          syncError: null,
        },
      })
    }

    return prisma.brokerAccount.create({
      data: {
        userId,
        brokerType: input.brokerType as BrokerType,
        accountType: input.accountType as AccountType,
        accountId: input.accountId,
        label: input.label,
        credentialsEnc: credentialsEnc ?? null,
      },
    })
  },

  updateSyncStatus(id: string, status: SyncStatus, error?: string) {
    return prisma.brokerAccount.update({
      where: { id },
      data: {
        syncStatus: status,
        syncError: error ?? null,
        ...(status === 'SUCCESS' ? { lastSyncAt: new Date() } : {}),
      },
    })
  },

  // Suppression réelle (pas soft-delete) : le compte et toutes ses données
  // dérivées (trades, bots, décisions/événements de bot) disparaissent avec
  // lui, via les cascades Prisma déjà définies sur ces relations.
  async hardDelete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.brokerAccount.deleteMany({ where: { id, userId } })
    return result.count > 0
  },
}
