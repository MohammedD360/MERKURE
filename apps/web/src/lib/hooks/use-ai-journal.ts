'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useLatestAiAnalysis() {
  return useQuery({
    queryKey: ['ai', 'journal', 'latest'],
    queryFn:  () => api.ai.journal(1),
    select:   (data) => data.entries[0] ?? null,
  })
}

export function useGenerateAiAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ date, context }: { date?: string; context?: string }) =>
      api.ai.analyze(date, context),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ai', 'journal'] })
    },
  })
}
