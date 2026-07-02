import { useQuery } from '@tanstack/react-query'
import { api, type Trade, type TradesResponse } from '@/src/lib/api-client'

export interface TradesFilters {
  page?: number
  limit?: number
  symbol?: string
  direction?: 'LONG' | 'SHORT' | ''
  status?: 'OPEN' | 'CLOSED' | ''
}

function buildQs(filters: TradesFilters): string {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit ?? 20))
  if (filters.symbol) params.set('symbol', filters.symbol)
  if (filters.direction) params.set('direction', filters.direction)
  if (filters.status) params.set('status', filters.status)
  return params.toString()
}

export function useTrades(filters: TradesFilters = { limit: 20 }) {
  return useQuery({
    queryKey: ['trades', filters],
    queryFn: () => api.trades.list(buildQs(filters)),
  })
}

export function useTrade(id: string | null) {
  return useQuery({
    queryKey: ['trades', id],
    queryFn: () => api.trades.get(id!),
    enabled: !!id,
  })
}

export type { Trade, TradesResponse }