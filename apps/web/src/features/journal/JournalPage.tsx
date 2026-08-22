'use client'

import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { useJournalCalendar } from '@/lib/hooks/use-journal'
import { useTrades } from '@/lib/hooks/use-trades'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { JournalCalendar }    from './components/JournalCalendar'
import { JournalEntryEditor } from './components/JournalEntryEditor'
import { DayStatsBar, DayPnlChart } from './components/DaySummary'
import { DayTrades } from './components/DayTrades'
import { computeDayStats, dayBounds } from './day-stats'

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateFr(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`)
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function JournalPage() {
  const today = todayStr()
  const currency = useCurrency()

  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [viewYear,  setViewYear]  = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1)

  const { data: calDays = [], isLoading: calLoading } = useJournalCalendar(viewYear, viewMonth)

  const { dateFrom, dateTo } = dayBounds(selectedDate)
  // limit plafonnée à 100 côté API (schéma zod) — au-delà la requête est rejetée.
  const { data: tradesData, isLoading: tradesLoading } = useTrades({ dateFrom, dateTo, limit: 100, status: 'CLOSED' })
  const dayTrades = tradesData?.items ?? []
  const stats = computeDayStats(dayTrades)

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  /** Changer de jour recale le mois affiché si on sort du mois courant. */
  const goToDate = (date: string) => {
    setSelectedDate(date)
    const y = Number(date.slice(0, 4))
    const m = Number(date.slice(5, 7))
    if (y !== viewYear)  setViewYear(y)
    if (m !== viewMonth) setViewMonth(m)
  }

  const navBtn =
    'flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'

  return (
    <div className="grid gap-4 lg:grid-cols-7">

      {/* ── Colonne principale : la journée ──────────────────────────── */}
      <div className="min-w-0 space-y-4 lg:col-span-4">

        {/* En-tête de journée */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-6">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold leading-none tracking-tight text-foreground first-letter:uppercase">
              {formatDateFr(selectedDate)}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {stats.trades === 0
                ? 'Aucun trade clôturé ce jour'
                : `${stats.trades} trade${stats.trades > 1 ? 's' : ''} · résultat net `}
              {stats.trades > 0 && (
                <span className={cn('font-medium', stats.netPnl >= 0 ? 'text-green-500' : 'text-red-500')}>
                  {formatMoney(stats.netPnl, { currency, signed: true })}
                </span>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => goToDate(shiftDate(selectedDate, -1))} className={navBtn} aria-label="Jour précédent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goToDate(today)}
              disabled={selectedDate === today}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarDays className="h-4 w-4" />
              Aujourd’hui
            </button>
            <button
              type="button"
              onClick={() => goToDate(shiftDate(selectedDate, 1))}
              disabled={selectedDate >= today}
              className={cn(navBtn, 'disabled:cursor-not-allowed disabled:opacity-50')}
              aria-label="Jour suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats du jour */}
        <DayStatsBar trades={dayTrades} isLoading={tradesLoading} />

        {/* Courbe cumulée intrajournalière */}
        <DayPnlChart trades={dayTrades} />

        {/* Trades de la séance + annotations */}
        <DayTrades trades={dayTrades} isLoading={tradesLoading} />

        {/* Plan / notes / revue */}
        <JournalEntryEditor key={selectedDate} date={selectedDate} />
      </div>

      {/* ── Colonne latérale : calendrier du mois ────────────────────── */}
      <div className="min-w-0 lg:col-span-3">
        <div className="lg:sticky lg:top-20">
          <JournalCalendar
            year={viewYear}
            month={viewMonth}
            days={calDays}
            selectedDate={selectedDate}
            onSelectDate={goToDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            isLoading={calLoading}
          />
        </div>
      </div>
    </div>
  )
}
