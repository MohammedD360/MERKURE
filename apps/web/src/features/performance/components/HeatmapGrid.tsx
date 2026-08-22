'use client'

import { useMemo, useState } from 'react'
import { useHeatmapData } from '@/lib/hooks/use-performance'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

/** Séances de marché, en heures locales — bandeau de repère au-dessus de la grille. */
const SESSIONS = [
  { label: 'Asie',      from: 0,  to: 7  },
  { label: 'Londres',   from: 8,  to: 12 },
  { label: 'New York',  from: 13, to: 17 },
  { label: 'Après-clôture', from: 18, to: 23 },
] as const

interface Cell { pnl: number; count: number }
interface Hover extends Cell { day: number; hour: number; x: number; y: number }

/** Gabarit de colonnes partagé par toutes les lignes de la grille. */
const GRID = '52px repeat(24, minmax(0, 1fr)) 92px'

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}h`
}

export function HeatmapGrid({ period, accountId }: Props) {
  const query = useHeatmapData(period, accountId)
  const currency = useCurrency()
  const [hover, setHover] = useState<Hover | null>(null)

  const { cells, maxAbs, totalPnl, totalTrades, activeSlots, best, worst, dayTotals } = useMemo(() => {
    const map = new Map<string, Cell>()
    const totals = DAY_LABELS.map(() => ({ pnl: 0, count: 0 }))
    let strongest = 0, pnlSum = 0, tradeSum = 0, slots = 0
    let bestCell: (Cell & { day: number; hour: number }) | null = null
    let worstCell: (Cell & { day: number; hour: number }) | null = null

    for (const item of query.data ?? []) {
      const day = Number(item.dayOfWeek)
      const hour = Number(item.hour)
      const cell: Cell = { pnl: Number(item.pnl ?? 0), count: Number(item.count ?? 0) }
      map.set(`${day}-${hour}`, cell)
      strongest = Math.max(strongest, Math.abs(cell.pnl))

      if (cell.count > 0) {
        slots += 1
        pnlSum += cell.pnl
        tradeSum += cell.count
        const t = totals[day]
        if (t) { t.pnl += cell.pnl; t.count += cell.count }
        if (!bestCell  || cell.pnl > bestCell.pnl)  bestCell  = { ...cell, day, hour }
        if (!worstCell || cell.pnl < worstCell.pnl) worstCell = { ...cell, day, hour }
      }
    }

    return {
      cells: map, maxAbs: strongest, totalPnl: pnlSum, totalTrades: tradeSum,
      activeSlots: slots, best: bestCell, worst: worstCell, dayTotals: totals,
    }
  }, [query.data])

  const hasData = totalTrades > 0
  const money = (v: number, signed = true) => formatMoney(v, { currency, signed })

  /**
   * Vide = surface neutre du thème (plus de gris clair figé qui écrasait la
   * grille en sombre). Sinon, teinte verte ou rouge dont seule l'opacité varie :
   * une échelle, une lecture.
   */
  function cellStyle(cell: Cell) {
    if (cell.count === 0 || maxAbs === 0) return undefined
    const intensity = Math.min(Math.abs(cell.pnl) / maxAbs, 1)
    const alpha = 0.18 + intensity * 0.72
    return { backgroundColor: cell.pnl >= 0 ? `rgba(34, 197, 94, ${alpha})` : `rgba(239, 68, 68, ${alpha})` }
  }

  const tiles: Array<{ label: string; value: string; tone?: 'up' | 'down' }> = [
    { label: 'P&L total',      value: hasData ? money(totalPnl) : '—', ...(hasData ? { tone: totalPnl >= 0 ? 'up' as const : 'down' as const } : {}) },
    { label: 'Trades',         value: totalTrades.toLocaleString('fr-FR') },
    { label: 'Moyenne / trade', value: hasData ? money(totalPnl / totalTrades) : '—', ...(hasData ? { tone: totalPnl >= 0 ? 'up' as const : 'down' as const } : {}) },
    { label: 'Créneaux actifs', value: `${activeSlots} / 168` },
  ]

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 space-y-1.5">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Heatmap horaire</h3>
        <p className="text-sm text-muted-foreground">P&amp;L réalisé par créneau jour × heure</p>
      </div>

      {/* Métriques de cadrage */}
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {tiles.map(t => (
          <div key={t.label} className="bg-card px-3 py-3">
            <p className="truncate text-xs text-muted-foreground">{t.label}</p>
            <p className={cn(
              'mt-1 truncate text-lg font-semibold tabular-nums',
              t.tone === 'up' ? 'text-green-500' : t.tone === 'down' ? 'text-red-500' : 'text-foreground',
            )}>
              {t.value}
            </p>
          </div>
        ))}
      </div>

      {query.isLoading ? (
        <div className="space-y-[2px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-7 animate-pulse rounded bg-secondary" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-lg border border-dashed border-red-500/40 px-5 py-10 text-center">
          <p className="text-sm font-medium text-red-500">Impossible de charger la heatmap</p>
          <p className="mt-1 text-sm text-muted-foreground">Réessayez après une synchronisation.</p>
        </div>
      ) : !hasData ? (
        <div className="rounded-lg border border-dashed border-border px-5 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Aucun trade sur cette période</p>
          <p className="mt-1 text-sm text-muted-foreground">
            La heatmap se remplit dès qu'un trade est clôturé.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-[2px]">

            {/* Séances */}
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: GRID }}>
              <div />
              {SESSIONS.map(s => (
                <div
                  key={s.label}
                  style={{ gridColumn: `span ${s.to - s.from + 1}` }}
                  className="truncate rounded bg-secondary/60 px-2 py-1 text-center text-xs text-muted-foreground"
                >
                  {s.label}
                </div>
              ))}
              <div />
            </div>

            {/* Heures — une graduation sur deux pour laisser respirer */}
            <div className="grid gap-[2px] pb-1" style={{ gridTemplateColumns: GRID }}>
              <div />
              {HOURS.map(h => (
                <div key={h} className="text-center text-xs tabular-nums text-muted-foreground">
                  {h % 2 === 0 ? String(h).padStart(2, '0') : ''}
                </div>
              ))}
              <div className="text-right text-xs text-muted-foreground">Total</div>
            </div>

            {/* Lignes de jours */}
            {DAY_LABELS.map((label, day) => {
              const total = dayTotals[day] ?? { pnl: 0, count: 0 }
              return (
                <div key={label} className="grid items-center gap-[2px]" style={{ gridTemplateColumns: GRID }}>
                  <div className="text-sm text-muted-foreground">{label}</div>

                  {HOURS.map(hour => {
                    const cell = cells.get(`${day}-${hour}`) ?? { pnl: 0, count: 0 }
                    const isBest  = best?.day === day && best.hour === hour
                    const isWorst = worst && worst.pnl < 0 && worst.day === day && worst.hour === hour
                    return (
                      <button
                        type="button"
                        key={hour}
                        style={cellStyle(cell)}
                        onMouseEnter={e => setHover({ ...cell, day, hour, x: e.clientX, y: e.clientY })}
                        onMouseMove={e => setHover(h => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                        onMouseLeave={() => setHover(null)}
                        onFocus={e => {
                          const r = e.currentTarget.getBoundingClientRect()
                          setHover({ ...cell, day, hour, x: r.left + r.width / 2, y: r.top })
                        }}
                        onBlur={() => setHover(null)}
                        aria-label={`${label} ${formatHour(hour)} — ${cell.count} trade${cell.count > 1 ? 's' : ''}, ${money(cell.pnl)}`}
                        className={cn(
                          'h-7 rounded-[3px] transition-[outline-color,opacity] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          cell.count === 0 && 'bg-secondary/40',
                          cell.count > 0 && 'hover:opacity-80',
                          (isBest || isWorst) && 'outline outline-1 outline-offset-1',
                          isBest && 'outline-green-400',
                          isWorst && 'outline-red-400',
                        )}
                      />
                    )
                  })}

                  <div className={cn(
                    'text-right text-sm tabular-nums',
                    total.count === 0 ? 'text-muted-foreground' : total.pnl >= 0 ? 'text-green-500' : 'text-red-500',
                  )}>
                    {total.count === 0 ? '—' : money(total.pnl)}
                  </div>
                </div>
              )
            })}

            {/* Une seule échelle, bornée par les valeurs réelles */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">{money(-maxAbs)}</span>
                <span
                  className="h-2 w-40 rounded-full"
                  style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.9), hsl(var(--secondary)), rgba(34,197,94,0.9))' }}
                />
                <span className="tabular-nums">{money(maxAbs)}</span>
                <span className="ml-2 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-secondary/40" /> aucun trade
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Meilleur créneau :{' '}
                <span className="font-medium text-green-500">
                  {best ? `${DAY_LABELS[best.day]} ${formatHour(best.hour)} (${money(best.pnl)})` : '—'}
                </span>
                <span className="mx-2">·</span>
                Pire créneau :{' '}
                <span className={cn('font-medium', worst && worst.pnl < 0 ? 'text-red-500' : 'text-muted-foreground')}>
                  {worst && worst.pnl < 0
                    ? `${DAY_LABELS[worst.day]} ${formatHour(worst.hour)} (${money(worst.pnl)})`
                    : 'aucun créneau perdant'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Infobulle : suit le curseur et reste dans la fenêtre */}
      {hover && (
        <div
          className="pointer-events-none fixed z-50 w-52 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg"
          style={{
            left: Math.min(hover.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1600) - 220),
            top: Math.max(12, hover.y - 96),
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{DAY_LABELS[hover.day]} · {formatHour(hover.hour)}</p>
            {hover.count > 0 && (
              <p className={cn('text-sm font-semibold tabular-nums', hover.pnl >= 0 ? 'text-green-500' : 'text-red-500')}>
                {money(hover.pnl)}
              </p>
            )}
          </div>
          {hover.count === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">Aucun trade sur ce créneau</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {hover.count} trade{hover.count > 1 ? 's' : ''} · {money(hover.pnl / hover.count)} en moyenne
            </p>
          )}
        </div>
      )}
    </section>
  )
}
