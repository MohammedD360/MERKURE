'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface CalendarDay {
  date:       string
  hasEntry:   boolean
  mood:       string | null
  dailyPnl:   number | null
  tradeCount: number
}

export interface JournalEntry {
  id:          string
  date:        string
  mood:        string | null
  planBefore:  string | null
  reviewAfter: string | null
  notes:       string | null
  createdAt:   string
  updatedAt:   string
}

export interface JournalEntryPayload {
  mood?:        string | null
  planBefore?:  string | null
  reviewAfter?: string | null
  notes?:       string | null
}

export function useJournalCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['journal', 'calendar', year, month],
    queryFn:  () => apiFetch<CalendarDay[]>(`/api/v1/journal/calendar?year=${year}&month=${month}`),
  })
}

export function useJournalEntry(date: string | null) {
  return useQuery({
    queryKey: ['journal', 'entry', date],
    queryFn:  () => apiFetch<JournalEntry | null>(`/api/v1/journal/entry/${date}`),
    enabled:  !!date,
  })
}

export function useUpsertJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: JournalEntryPayload }) =>
      apiFetch<JournalEntry>(`/api/v1/journal/entry/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { date }) => {
      const d = new Date(date)
      void qc.invalidateQueries({ queryKey: ['journal', 'entry', date] })
      void qc.invalidateQueries({ queryKey: ['journal', 'calendar', d.getUTCFullYear(), d.getUTCMonth() + 1] })
    },
  })
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (date: string) =>
      apiFetch(`/api/v1/journal/entry/${date}`, { method: 'DELETE' }),
    onSuccess: (_, date) => {
      const d = new Date(date)
      void qc.invalidateQueries({ queryKey: ['journal', 'entry', date] })
      void qc.invalidateQueries({ queryKey: ['journal', 'calendar', d.getUTCFullYear(), d.getUTCMonth() + 1] })
    },
  })
}
