import { Prisma } from '@prisma/client'
import { prisma } from './client.js'

export type AuditAction = 'soft_delete' | 'restore'
export type AuditEntityType = 'trade' | 'broker_account'

export function writeAuditLog(params: {
  entityType:  AuditEntityType
  entityId:    string
  action:      AuditAction
  performedBy: string
  metadata?:   Record<string, Prisma.InputJsonValue | null>
}) {
  return prisma.auditLog.create({
    data: {
      entityType:  params.entityType,
      entityId:    params.entityId,
      action:      params.action,
      performedBy: params.performedBy,
      ...(params.metadata ? { metadata: params.metadata as Prisma.InputJsonValue } : {}),
    },
  })
}
