import type { BrokerType, AccountType, SyncStatus } from '@prisma/client'
import { prisma } from '../../infrastructure/database/client.js'
import type { CreateAccountInput, UpdateAccountInput } from './accounts.types.js'

export const accountsRepository = {
  findAll(userId: string) {
    return prisma.brokerAccount.findMany({
      where: { userId, isActive: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string, userId: string) {
    return prisma.brokerAccount.findFirst({ where: { id, userId, deletedAt: null } })
  },

  // Seuls MT4/MT5 passent par la synchro broker automatique : les comptes
  // POLYMARKET (wallets de bots) ont leur propre cycle (bot-trading-cycle) et
  // ne doivent jamais atterrir dans broker-sync, faute d'adapter dédié.
  findAllActive() {
    return prisma.brokerAccount.findMany({
      where: { isActive: true, deletedAt: null, brokerType: { in: ['MT4', 'MT5'] } },
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
          startingBalance: input.startingBalance ?? null,
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
        startingBalance: input.startingBalance ?? null,
      },
    })
  },

  update(id: string, userId: string, input: UpdateAccountInput) {
    return prisma.brokerAccount.updateMany({
      where: { id, userId },
      data: {
        ...(input.startingBalance !== undefined ? { startingBalance: input.startingBalance } : {}),
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

  // Soft-delete RGPD (comportement par défaut) : les trades et bots associés
  // survivent, seul le compte est marqué supprimé. C'est ce que `create()`
  // réactive déjà plus haut quand un compte revient — hardDelete cassait cette
  // moitié du cycle en supprimant physiquement au lieu de marquer deletedAt.
  async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.brokerAccount.updateMany({
      where: { id, userId },
      data:  { isActive: false, deletedAt: new Date() },
    })
    return result.count > 0
  },

  // Suppression réelle : le compte et toutes ses données dérivées (trades,
  // bots, décisions/événements de bot) disparaissent avec lui, via les cascades
  // Prisma déjà définies sur ces relations. Réservée à une purge différée
  // (job planifié), jamais appelée directement depuis une déconnexion utilisateur.
  async hardDelete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.brokerAccount.deleteMany({ where: { id, userId } })
    return result.count > 0
  },
}
