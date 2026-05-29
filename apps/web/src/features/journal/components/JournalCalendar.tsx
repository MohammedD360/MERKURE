'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarDay } from '@/lib/hooks/use-journal'

const DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const MOOD_EMOJI: Record<string, string> = {
  serein:       '😌',
  concentre:    '💪',
  confiant:     '😊',
  stresse:      '😰',
  surconfiant:  '🤑',
  craintif:     '😨',
  neutre:       '😐',
}

interface Props {
  year:        number
  month:       number
  days:        CalendarDay[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onPrevMonth:  () => void
  onNextMonth:  () => void
}

export function JournalCalendar({ year, month, days, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: Props) {
  // day-of-week the 1st falls on (Mon=0 … Sun=6)
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const today    = new Date().toISOString().slice(0, 10)

  const dayMap = new Map<string, CalendarDay>()
  for (const d of days) dayMap.set(d.date, d)

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800/60 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-white">
          {MONTHS_FR[month - 1]} {year}
        </span>
        <button onClick={onNextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800/60 hover:text-white transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-600 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Empty cells before the 1st */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {days.map((day) => {
          const d        = parseInt(day.date.slice(8), 10)
          const isToday  = day.date === today
          const isSel    = day.date === selectedDate
          const hasPnl   = day.dailyPnl != null
          const isProfit = hasPnl && day.dailyPnl! >= 0
          const isLoss   = hasPnl && day.dailyPnl! < 0

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`
                relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs font-medium transition-all
                ${isSel
                  ? 'bg-indigo-500/25 text-white ring-1 ring-indigo-500/50'
                  : isToday
                    ? 'bg-white/[0.06] text-white'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                }
              `}
            >
              <span>{d}</span>

              {/* Indicators row */}
              <div className="flex items-center gap-0.5 mt-0.5 h-2">
                {/* P&L dot */}
                {hasPnl && (
                  <span className={`h-1 w-1 rounded-full ${isProfit ? 'bg-green-500' : 'bg-red-500'}`} />
                )}
                {/* Journal entry dot */}
                {day.hasEntry && (
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-col gap-1.5 text-[10px] text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
          Entrée de journal
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
          P&L du jour
        </div>
      </div>
    </div>
  )
}
