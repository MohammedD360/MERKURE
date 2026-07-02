import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiFetch, type JournalEntryPayload } from '@/src/lib/api-client'

export function useJournalCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['journal', 'calendar', year, month],
    queryFn: () => api.journal.calendar(year, month),
  })
}

export function useJournalEntry(date: string | null) {
  return useQuery({
    queryKey: ['journal', 'entry', date],
    queryFn: () => api.journal.entry(date!),
    enabled: !!date,
  })
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => apiFetch<void>(`/api/v1/journal/entry/${date}`, { method: 'DELETE' }),
    onSuccess: (_, date) => {
      const d = new Date(date)
      void qc.invalidateQueries({ queryKey: ['journal', 'entry', date] })
      void qc.invalidateQueries({
        queryKey: ['journal', 'calendar', d.getFullYear(), d.getMonth() + 1],
      })
    },
  })
}

export function useUpsertJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: JournalEntryPayload }) =>
      api.journal.upsert(date, data),
    onSuccess: (_, { date }) => {
      const d = new Date(date)
      void qc.invalidateQueries({ queryKey: ['journal', 'entry', date] })
      void qc.invalidateQueries({
        queryKey: ['journal', 'calendar', d.getFullYear(), d.getMonth() + 1],
      })
    },
  })
}