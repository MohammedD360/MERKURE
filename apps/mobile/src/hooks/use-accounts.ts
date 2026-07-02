import { useQuery } from '@tanstack/react-query'
import { api } from '@/src/lib/api-client'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.accounts.list(),
  })
}