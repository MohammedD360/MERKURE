'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarDay } from '@/lib/hooks/use-journal'

const DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function pnlBg(pnl: number | null | undefined, isSelected: boolean, isToday: boolean) {
  if (isSelected) return 'bg-violet-500/25 ring-1 ring-violet-500/50'
  if (isToday)    return 'bg-white/[0.06]'
  if (pnl == null) return ''
  if (pnl > 200)  return 'bg-green-500/25'
  if (pnl > 0)    return 'bg-green-500/12'
  if (pnl < -200) return 'bg-red-500/25'
  if (pnl < 0)    return 'bg-red-500/12'
  return 'bg-slate-700/20'
}

function pnlTextColor(pnl: number | null | undefined) {
  if (pnl == null) return 'text-slate-400'
  if (pnl > 0) return 'text-green-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-slate-500'
}

function fmtPnl(pnl: number): string {
  const abs = Math.abs(pnl)
  if (abs >= 1000) return `${pnl >= 0 ? '+' : ''}${(pnl / 1000).toFixed(1)}k`
  return `${pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}`
}

interface Props {
  year:         number
  month:        number
  days:         CalendarDay[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onPrevMonth:  () => void
  onNextMonth:  () => void
}

export function JournalCalendar({ year, month, days, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: Props) {
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const today    = new Date().toISOString().slice(0, 10)

  const dayMap = new Map<string, CalendarDay>()
  for (const d of days) dayMap.set(d.date, d)

  // Monthly totals for context
  const monthPnl   = days.reduce((s, d) => s + (d.dailyPnl ?? 0), 0)
  const tradingDays = days.filter(d => d.dailyPnl != null).length
  const winDays     = days.filter(d => (d.dailyPnl ?? 0) > 0).length

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-white">
          {MONTHS_FR[month - 1]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Monthly summary */}
      {tradingDays > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-800/60 bg-[#0d1521] px-3 py-2">
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">P&L</p>
            <p className={`text-xs font-black font-mono ${monthPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fmtPnl(monthPnl)}$
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Sessions</p>
            <p className="text-xs font-black text-white">{tradingDays}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Win days</p>
            <p className={`text-xs font-black font-mono ${winDays / tradingDays >= 0.5 ? 'text-green-400' : 'text-amber-400'}`}>
              {tradingDays > 0 ? `${Math.round((winDays / tradingDays) * 100)}%` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="py-1 text-center text-[10px] font-bold text-slate-700">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {days.map((day) => {
          const d       = parseInt(day.date.slice(8), 10)
          const isToday = day.date === today
          const isSel   = day.date === selectedDate
          const hasPnl  = day.dailyPnl != null

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`
                relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs font-medium transition-all
                ${pnlBg(day.dailyPnl, isSel, isToday)}
                ${isSel ? 'text-white' : isToday ? 'text-white' : hasPnl ? 'text-slate-200' : 'text-slate-500'}
                hover:opacity-90
              `}
            >
              <span className="text-[11px] font-bold leading-none">{d}</span>

              {/* P&L mini display */}
              {hasPnl && (
                <span className={`mt-0.5 text-[8px] font-black font-mono leading-none ${pnlTextColor(day.dailyPnl)}`}>
                  {fmtPnl(day.dailyPnl!)}
                </span>
              )}

              {/* Journal dot */}
              {day.hasEntry && (
                <span className="absolute bottom-0.5 right-0.5 h-1 w-1 rounded-full bg-violet-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1.5 text-[10px] text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          Entrée de journal
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-green-500/25 shrink-0" />
          <span className="h-2.5 w-2.5 rounded bg-red-500/25 shrink-0" />
          Jour positif / négatif
        </div>
      </div>
    </div>
  )
}
