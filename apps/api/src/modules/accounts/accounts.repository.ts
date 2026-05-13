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

  findAllActive() {
    return prisma.brokerAccount.findMany({
      where: { isActive: true },
      select: { id: true, userId: true, brokerType: true },
    })
  },

  create(userId: string, input: CreateAccountInput, credentialsEnc?: Buffer) {
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

  softDelete(id: string, userId: string) {
    return prisma.brokerAccount.update({
      where: { id, userId },
      data: { isActive: false },
    })
  },
}
