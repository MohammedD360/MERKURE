'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface RiskStatus {
  riskPerTrade: number
  todayPnl: number
  todayTrades: number
  consecutiveLosses: number
  weeklyPnl: number
  alerts: string[]
}

export function useRiskStatus() {
  return useQuery({
    queryKey: ['risk', 'status'],
    queryFn: () => apiFetch<RiskStatus>('/api/v1/risk/status'),
  })
}

export function useUpdateRisk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (riskPerTrade: number) =>
      apiFetch<{ riskPerTrade: number }>('/api/v1/risk/settings', {
        method: 'PATCH',
        body: JSON.stringify({ riskPerTrade }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['risk', 'status'] })
    },
  })
}
