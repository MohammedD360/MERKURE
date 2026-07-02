import { useQuery } from '@tanstack/react-query'
import { api } from '@/src/lib/api-client'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.me(),
    staleTime: 5 * 60 * 1000,
  })
}