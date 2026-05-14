'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface Trade {
  id:             string
  brokerAccountId: string
  symbol:         string
  direction:      'LONG' | 'SHORT'
  status:         'OPEN' | 'CLOSED'
  openTime:       string
  closeTime:      string | null
  openPrice:      string
  closePrice:     string | null
  lotSize:        string
  pnl:            string | null
  pnlPct:         string | null
  swap:           string
  commission:     string
  strategyTag:    string | null
  note:           string | null
  createdAt:      string
}

export interface TradesResponse {
  items:  Trade[]
  total:  number
  page:   number
  limit:  number
}

export interface TradesFilters {
  page?:      number
  limit?:     number
  symbol?:    string
  direction?: 'LONG' | 'SHORT' | ''
  status?:    'OPEN' | 'CLOSED' | ''
  accountId?: string
  dateFrom?:  string
  dateTo?:    string
}

export function buildQs(filters: TradesFilters): string {
  const params = new URLSearchParams()
  if (filters.page)      params.set('page',      String(filters.page))
  if (filters.limit)     params.set('limit',     String(filters.limit))
  if (filters.symbol)    params.set('symbol',    filters.symbol)
  if (filters.direction) params.set('direction', filters.direction)
  if (filters.status)    params.set('status',    filters.status)
  if (filters.accountId) params.set('accountId', filters.accountId)
  if (filters.dateFrom)  params.set('dateFrom',  filters.dateFrom)
  if (filters.dateTo)    params.set('dateTo',    filters.dateTo)
  return params.toString()
}

export function useTrades(filters: TradesFilters = {}) {
  return useQuery({
    queryKey: ['trades', filters],
    queryFn:  () => apiFetch<TradesResponse>(`/api/v1/trades?${buildQs(filters)}`),
  })
}

export function useTrade(id: string | null) {
  return useQuery({
    queryKey: ['trades', id],
    queryFn:  () => apiFetch<Trade>(`/api/v1/trades/${id}`),
    enabled:  Boolean(id),
  })
}

export function useAnnotateTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, strategyTag, note }: { id: string; strategyTag?: string; note?: string }) =>
      apiFetch<Trade>(`/api/v1/trades/${id}`, {
        method: 'PATCH',
        body:   JSON.stringify({ strategyTag, note }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}
