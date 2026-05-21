'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

interface Alert {
  id:        string
  type:      string
  message:   string
  isRead:    boolean
  createdAt: string
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn:  () => apiFetch<{ alerts: Alert[]; total: number }>('/api/v1/alerts').then(r => r.alerts),
  })
}
