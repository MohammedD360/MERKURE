'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

interface CurrentUser {
  id:        string
  email:     string | null
  firstName: string | null
  lastName:  string | null
  avatarUrl: string | null
  plan:      string
  authMode:  string
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn:  () => apiFetch<CurrentUser>('/api/v1/me'),
    staleTime: 5 * 60 * 1000,
  })
}
