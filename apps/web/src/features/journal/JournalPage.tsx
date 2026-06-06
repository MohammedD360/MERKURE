'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useJournalCalendar } from '@/lib/hooks/use-journal'
import { JournalCalendar }    from './components/JournalCalendar'
import { JournalEntryEditor } from './components/JournalEntryEditor'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function JournalPage() {
  const today = todayStr()
  const [selectedDate, setSelectedDate] = useState<string>(today)

  const [viewYear,  setViewYear]  = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1)

  const { data: calDays = [], isLoading: calLoading } = useJournalCalendar(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {/* ── Left: Calendar sidebar ─────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-gray-800/60 px-4 py-6">
        {calLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-800" />
            ))}
          </div>
        ) : (
          <JournalCalendar
            year={viewYear}
            month={viewMonth}
            days={calDays}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        )}

        {/* Quick jump to today */}
        {selectedDate !== today && (
          <button
            onClick={() => {
              setSelectedDate(today)
              const now = new Date()
              setViewYear(now.getFullYear())
              setViewMonth(now.getMonth() + 1)
            }}
            className="mt-6 w-full rounded-xl border border-gray-800/60 py-2 text-xs font-medium text-gray-500 hover:text-foreground hover:border-gray-700 transition-colors"
          >
            Revenir à aujourd'hui
          </button>
        )}
      </aside>

      {/* ── Right: Entry editor ────────────────────────────────── */}
      <main className="flex-1 px-6 py-6 min-w-0">
        {selectedDate ? (
          <JournalEntryEditor key={selectedDate} date={selectedDate} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <BookOpen className="h-10 w-10 text-gray-700" />
            <p className="text-sm text-gray-600">Sélectionne un jour dans le calendrier</p>
          </div>
        )}
      </main>
    </div>
  )
}
