'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface BrokerAccount {
  id:          string
  brokerType:  string
  accountType: string
  label:       string
  syncStatus:  string
  lastSyncAt:  string | null
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn:  () => apiFetch<BrokerAccount[]>('/api/v1/accounts'),
  })
}
