'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

/**
 * Devise préférée de l'utilisateur (issue du profil), avec repli sur 'EUR'.
 * Partage la clé de cache ['users','me'] avec la page profil.
 */
export function useCurrency(): string {
  const { data } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  api.users.me,
    staleTime: 5 * 60 * 1000,
  })
  return data?.currency || 'EUR'
}
