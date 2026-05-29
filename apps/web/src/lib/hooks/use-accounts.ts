'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export type BrokerType  = 'MT4' | 'MT5' | 'BINANCE' | 'IB' | 'CTRADER'
export type AccountType = 'LIVE' | 'DEMO' | 'PROP_FUNDED' | 'PROP_CHALLENGE'
export type SyncStatus  = 'PENDING' | 'SYNCING' | 'SUCCESS' | 'ERROR'

export interface BrokerAccount {
  id:          string
  brokerType:  BrokerType
  accountType: AccountType
  accountId:   string
  label:       string
  isActive:    boolean
  syncStatus:  SyncStatus
  syncError:   string | null
  lastSyncAt:  string | null
  createdAt:   string
}

export interface CreateAccountBody {
  brokerType:  BrokerType
  accountType: AccountType
  accountId:   string
  label:       string
  credentials?: Record<string, string>
}

export function useAccounts() {
  return useQuery<BrokerAccount[]>({
    queryKey: ['accounts'],
    queryFn:  () => apiFetch<BrokerAccount[]>('/api/v1/accounts'),
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAccountBody) =>
      apiFetch<BrokerAccount>('/api/v1/accounts', {
        method: 'POST',
        body:   JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useSyncAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ queued: boolean }>(`/api/v1/accounts/${id}/sync`, { method: 'POST', body: '{}' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/accounts/${id}`,
        {
          method:  'DELETE',
          headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('merkure_token') ?? '' : ''}`,
          },
        },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}
