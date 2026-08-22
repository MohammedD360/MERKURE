'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarDay } from '@/lib/hooks/use-journal'
import { cn } from '@/lib/utils'

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

/** Montants compacts : les cases sont étroites, on vise la lisibilité. */
function compact(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '-'
  const abs = Math.abs(pnl)
  if (abs >= 10000) return `${sign}${(abs / 1000).toFixed(0)}k`
  if (abs >= 1000)  return `${sign}${(abs / 1000).toFixed(1)}k`
  return `${sign}${Math.round(abs)}`
}

interface Props {
  year:         number
  month:        number
  days:         CalendarDay[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onPrevMonth:  () => void
  onNextMonth:  () => void
  isLoading?:   boolean
}

interface WeekRow {
  key:    string
  cells:  Array<CalendarDay | null>
  pnl:    number
  active: number
}

/** Découpe le mois en semaines (lundi → dimanche) et calcule le total hebdo. */
function buildWeeks(year: number, month: number, days: CalendarDay[]): WeekRow[] {
  const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7
  const cells: Array<CalendarDay | null> = [...Array<null>(firstDow).fill(null), ...days]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: WeekRow[] = []
  for (let i = 0; i < cells.length; i += 7) {
    const slice = cells.slice(i, i + 7)
    const withTrades = slice.filter((d): d is CalendarDay => d != null && d.dailyPnl != null)
    weeks.push({
      key:    `w${i / 7}`,
      cells:  slice,
      pnl:    withTrades.reduce((s, d) => s + (d.dailyPnl ?? 0), 0),
      active: withTrades.length,
    })
  }
  return weeks
}

export function JournalCalendar({
  year, month, days, selectedDate, onSelectDate, onPrevMonth, onNextMonth, isLoading = false,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const weeks = buildWeeks(year, month, days)

  const tradedDays = days.filter(d => d.dailyPnl != null)
  const monthPnl   = tradedDays.reduce((s, d) => s + (d.dailyPnl ?? 0), 0)
  const winDays    = tradedDays.filter(d => (d.dailyPnl ?? 0) > 0).length
  const dayWinRate = tradedDays.length > 0 ? Math.round((winDays / tradedDays.length) * 100) : null

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* En-tête : navigation + résumé du mois */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            {MONTHS_FR[month - 1]} {year}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tradedDays.length === 0
              ? 'Aucune séance ce mois-ci'
              : `${tradedDays.length} séance${tradedDays.length > 1 ? 's' : ''} · ${dayWinRate} % de jours positifs`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Mois précédent"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Mois suivant"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* P&L du mois */}
      {tradedDays.length > 0 && (
        <div className="mb-4 flex items-baseline gap-2">
          <span className={cn('text-2xl font-bold tabular-nums', monthPnl >= 0 ? 'text-green-500' : 'text-red-500')}>
            {compact(monthPnl)}
          </span>
          <span className="text-sm text-muted-foreground">sur le mois</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-md bg-secondary" />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Jours de la semaine + colonne des totaux hebdo */}
          <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_64px] gap-1.5">
            {DAYS_SHORT.map(d => (
              <div key={d} className="py-1 text-center text-xs text-muted-foreground">{d}</div>
            ))}
            <div className="py-1 text-center text-xs text-muted-foreground">Sem.</div>
          </div>

          {weeks.map(week => (
            <div key={week.key} className="grid grid-cols-[repeat(7,minmax(0,1fr))_64px] gap-1.5">
              {week.cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />

                const dayNum   = Number(day.date.slice(8))
                const pnl      = day.dailyPnl
                const selected = day.date === selectedDate
                const isToday  = day.date === today
                const positive = (pnl ?? 0) > 0
                const negative = (pnl ?? 0) < 0

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => onSelectDate(day.date)}
                    aria-current={selected ? 'date' : undefined}
                    title={pnl != null ? `${day.tradeCount} trade${day.tradeCount > 1 ? 's' : ''}` : undefined}
                    className={cn(
                      'flex h-14 flex-col items-start justify-between rounded-md border p-1.5 text-left transition-colors',
                      positive && 'border-green-500/30 bg-green-500/10 hover:bg-green-500/15',
                      negative && 'border-red-500/30 bg-red-500/10 hover:bg-red-500/15',
                      pnl == null && 'border-border hover:bg-secondary/60',
                      pnl === 0 && 'border-border bg-secondary/40',
                      selected && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                    )}
                  >
                    <span className={cn(
                      'text-xs tabular-nums',
                      isToday ? 'font-semibold text-primary' : 'text-muted-foreground',
                    )}>
                      {dayNum}
                    </span>
                    <span className="flex w-full items-end justify-between gap-1">
                      <span className={cn(
                        'truncate text-xs font-medium tabular-nums',
                        positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-transparent',
                      )}>
                        {pnl != null ? compact(pnl) : ''}
                      </span>
                      {day.hasEntry && <span className="mb-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </span>
                  </button>
                )
              })}

              {/* Total de la semaine */}
              <div className={cn(
                'flex h-14 flex-col items-center justify-center rounded-md border border-border px-1',
                week.active === 0 && 'opacity-40',
              )}>
                <span className={cn(
                  'text-xs font-medium tabular-nums',
                  week.pnl > 0 ? 'text-green-500' : week.pnl < 0 ? 'text-red-500' : 'text-muted-foreground',
                )}>
                  {week.active > 0 ? compact(week.pnl) : '—'}
                </span>
                <span className="text-xs text-muted-foreground">{week.active} j</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Légende */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-green-500/30 bg-green-500/10" /> Jour positif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-red-500/30 bg-red-500/10" /> Jour négatif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Entrée de journal
        </span>
      </div>
    </div>
  )
}
