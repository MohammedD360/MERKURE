import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/src/lib/api-client'

export function useAlerts(unreadOnly = false) {
  return useQuery({
    queryKey: ['alerts', unreadOnly],
    queryFn: () => api.alerts.list(unreadOnly),
  })
}

export function useMarkAlertRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.alerts.markRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}