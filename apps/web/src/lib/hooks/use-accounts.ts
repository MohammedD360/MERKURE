'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export type BrokerType  = 'MT4' | 'MT5' | 'BINANCE' | 'IB' | 'CTRADER' | 'TRADOVATE' | 'POLYMARKET'
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
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useSyncAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ queued: boolean }>(`/api/v1/accounts/${id}/sync`, { method: 'POST', body: '{}' }),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    /**
     * Supprimer un compte efface aussi ses trades côté serveur (cascade).
     * Toutes les vues dérivées — KPI, performance, statistiques, portefeuille,
     * journal, risque, prop firm — deviennent donc fausses d'un coup : on
     * invalide l'intégralité du cache client plutôt qu'une liste de clés qu'on
     * oublierait de tenir à jour.
     */
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
    onSuccess: () => qc.invalidateQueries(),
  })
}
