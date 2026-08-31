'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface Quote {
  symbol: string
  name: string
  price: number
  change: number
  percentChange: number
  previousClose: number
  isMarketOpen: boolean
  datetime: string | null
}

interface QuotesResponse {
  configured: boolean
  quotes: Quote[]
  error?: string
}

export function useMarketQuotes() {
  return useQuery({
    queryKey: ['market-data', 'quotes'],
    queryFn: () => apiFetch<QuotesResponse>('/api/v1/market-data/quotes'),
    // Le backend met en cache 30s côté serveur — pas besoin de repoller plus vite.
    refetchInterval: 30_000,
  })
}
