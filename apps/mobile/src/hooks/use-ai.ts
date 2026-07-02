import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/src/lib/api-client'

export function useLatestAiAnalysis() {
  return useQuery({
    queryKey: ['ai', 'journal', 'latest'],
    queryFn: () => api.ai.journal(1),
    select: (data) => data.entries[0] ?? null,
  })
}

export function useGenerateAiAnalysis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { date?: string; context?: string }) =>
      api.ai.analyze(args.date, args.context),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ai'] }),
  })
}