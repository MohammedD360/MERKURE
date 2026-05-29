'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useAlerts(unreadOnly = false) {
  return useQuery({
    queryKey: ['alerts', unreadOnly],
    queryFn: () => api.alerts.list(unreadOnly),
    refetchInterval: 60_000,
  })
}

export function useMarkAlertRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.alerts.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.alerts.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useDeleteAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.alerts.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
