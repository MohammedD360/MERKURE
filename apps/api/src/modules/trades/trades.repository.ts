import type { Direction, TradeStatus } from '@prisma/client'
import { prisma } from '../../infrastructure/database/client.js'
import type { TradesQuery, AnnotateTradeInput } from './trades.types.js'

export const tradesRepository = {
  async findMany(userId: string, query: TradesQuery) {
    const where = {
      userId,
      ...(query.symbol && { symbol: query.symbol.toUpperCase() }),
      ...(query.direction && { direction: query.direction as Direction }),
      ...(query.status && { status: query.status as TradeStatus }),
      ...(query.accountId && { brokerAccountId: query.accountId }),
      ...((query.dateFrom ?? query.dateTo) && {
        closeTime: {
          ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
          ...(query.dateTo && { lte: new Date(query.dateTo) }),
        },
      }),
    }

    const [items, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { closeTime: 'desc' },
      }),
      prisma.trade.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  },

  findById(id: string, userId: string) {
    return prisma.trade.findFirst({ where: { id, userId } })
  },

  annotate(id: string, userId: string, input: AnnotateTradeInput) {
    return prisma.trade.update({
      where: { id, userId },
      data: {
        ...(input.strategyTag !== undefined ? { strategyTag: input.strategyTag } : {}),
        ...(input.note        !== undefined ? { note:        input.note        } : {}),
      },
    })
  },
}
