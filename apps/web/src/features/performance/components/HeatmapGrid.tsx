'use client'

import { useMemo, useState } from 'react'
import { Activity, Clock, Info, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { useHeatmapData } from '@/lib/hooks/use-performance'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const CURRENCY = 'EUR'

const SESSIONS = [
  { label: 'Asia', from: 0, to: 7 },
  { label: 'London', from: 8, to: 12 },
  { label: 'NY', from: 13, to: 17 },
  { label: 'After', from: 18, to: 23 },
] as const

interface TooltipState {
  day:      number
  hour:     number
  pnl:      number
  count:    number
  avgPnl:   number
  strength: number
  x:        number
  y:        number
}

interface NormalizedCell {
  pnl:   number
  count: number
}

function formatMoney(value: number, signed = false) {
  const formatted = value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return signed && value > 0 ? `+${formatted}` : formatted
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}h`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCellStyle(cell: NormalizedCell, maxAbs: number) {
  if (cell.count === 0 || maxAbs === 0) {
    return {
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.34))',
      borderColor: 'rgba(148, 163, 184, 0.08)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025)',
    }
  }

  const intensity = clamp(Math.abs(cell.pnl) / maxAbs, 0.12, 1)
  const alpha = 0.16 + intensity * 0.62
  const glow = 0.12 + intensity * 0.28
  const rgb = cell.pnl >= 0 ? '34, 197, 94' : '244, 63, 94'

  return {
    background: `linear-gradient(180deg, rgba(${rgb}, ${alpha}), rgba(${rgb}, ${Math.max(alpha - 0.22, 0.08)}))`,
    borderColor: `rgba(${rgb}, ${0.18 + intensity * 0.3})`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 ${Math.round(10 + intensity * 18)}px rgba(${rgb}, ${glow})`,
  }
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-lg border border-white/10 bg-white/[0.035]" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#080d15] p-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: '76px repeat(24, minmax(30px, 1fr)) 86px', minWidth: 930 }}>
          {Array.from({ length: 9 * 26 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-md bg-white/[0.035]" />
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'green' | 'red' | 'violet' | 'neutral'
}) {
  const toneClass = {
    green: 'text-emerald-400',
    red: 'text-rose-400',
    violet: 'text-violet-300',
    neutral: 'text-white',
  }[tone]

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04]', toneClass)}>
          {icon}
        </div>
      </div>
      <p className={cn('mt-3 font-mono text-xl font-black tracking-tight', toneClass)}>{value}</p>
    </div>
  )
}

export function HeatmapGrid({ period, accountId }: Props) {
  const query = useHeatmapData(period, accountId)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const {
    cellMap,
    maxAbs,
    totalPnl,
    totalTrades,
    activeSlots,
    bestCell,
    worstCell,
    daySummaries,
  } = useMemo(() => {
    const map = new Map<string, NormalizedCell>()
    let strongest = 0
    let pnlTotal = 0
    let tradeTotal = 0
    let slots = 0
    let best: (NormalizedCell & { day: number; hour: number }) | null = null
    let worst: (NormalizedCell & { day: number; hour: number }) | null = null
    const summaries = DAY_LABELS.map(() => ({ pnl: 0, count: 0 }))

    for (const item of query.data ?? []) {
      const cell = {
        pnl: Number(item.pnl ?? 0),
        count: Number(item.count ?? 0),
      }
      const day = Number(item.dayOfWeek)
      const hour = Number(item.hour)
      const key = `${day}-${hour}`

      map.set(key, cell)
      strongest = Math.max(strongest, Math.abs(cell.pnl))

      if (cell.count > 0) {
        slots += 1
        pnlTotal += cell.pnl
        tradeTotal += cell.count
        if (summaries[day]) {
          summaries[day].pnl += cell.pnl
          summaries[day].count += cell.count
        }
        if (!best || cell.pnl > best.pnl) best = { ...cell, day, hour }
        if (!worst || cell.pnl < worst.pnl) worst = { ...cell, day, hour }
      }
    }

    return {
      cellMap: map,
      maxAbs: strongest,
      totalPnl: pnlTotal,
      totalTrades: tradeTotal,
      activeSlots: slots,
      bestCell: best,
      worstCell: worst,
      daySummaries: summaries,
    }
  }, [query.data])

  const hasData = totalTrades > 0
  const averagePnl = totalTrades > 0 ? totalPnl / totalTrades : 0

  return (
    <section className="rounded-lg border border-white/10 bg-[#090e17] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-violet-500/20 bg-violet-500/10 text-violet-300">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">Heatmap P&L</h2>
              <p className="mt-1 text-sm font-medium text-slate-400">Lecture des créneaux jour × heure par P&L réalisé.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 shadow-[0_0_14px_rgba(34,197,94,0.45)]" />
            Profit
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.45)]" />
            Perte
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-800" />
            Aucun trade
          </div>
          <div className="hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-slate-500 md:flex">
            <Info className="h-3.5 w-3.5" />
            Intensité = amplitude du P&L
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <MetricCard
          icon={totalPnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          label="P&L total"
          value={formatMoney(totalPnl, true)}
          tone={totalPnl >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          icon={<Activity className="h-4 w-4" />}
          label="Trades"
          value={totalTrades.toLocaleString('fr-FR')}
          tone="neutral"
        />
        <MetricCard
          icon={<Zap className="h-4 w-4" />}
          label="Moyenne / trade"
          value={formatMoney(averagePnl, true)}
          tone={averagePnl >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          icon={<Clock className="h-4 w-4" />}
          label="Créneaux actifs"
          value={`${activeSlots}/168`}
          tone="violet"
        />
      </div>

      {query.isLoading ? (
        <div className="mt-5"><Skeleton /></div>
      ) : query.isError ? (
        <div className="mt-5 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-5 py-10 text-center">
          <p className="text-sm font-black text-rose-300">Impossible de charger la heatmap</p>
          <p className="mt-2 text-xs font-semibold text-slate-400">Réessayez après synchronisation des données.</p>
        </div>
      ) : !hasData ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center">
          <p className="text-sm font-black text-white">Aucun trade sur cette période</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">La heatmap se remplira dès que des trades clôturés seront disponibles.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-[#070b12] p-4">
          <div
            className="grid items-stretch gap-1.5"
            style={{ gridTemplateColumns: '76px repeat(24, minmax(30px, 1fr)) 86px', minWidth: 930 }}
          >
            <div className="h-7" />
            {SESSIONS.map((session) => (
              <div
                key={session.label}
                className="flex h-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.025] text-[10px] font-black uppercase tracking-[0.12em] text-slate-500"
                style={{ gridColumn: `span ${session.to - session.from + 1}` }}
              >
                {session.label}
              </div>
            ))}
            <div className="h-7" />

            <div className="pb-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">Jour</div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className={cn(
                  'pb-1 text-center font-mono text-[10px] font-bold',
                  hour % 4 === 0 ? 'text-slate-400' : 'text-slate-700',
                )}
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
            <div className="pb-1 text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">Total</div>

            {DAY_LABELS.map((dayLabel, dayIndex) => (
              <div key={dayLabel} className="contents">
                <div className="flex h-9 items-center justify-between gap-2 rounded-md border border-white/10 bg-white/[0.025] px-2">
                  <span className="text-xs font-black text-slate-200">{dayLabel}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-500">{daySummaries[dayIndex]?.count ?? 0}</span>
                </div>

                {HOURS.map((hour) => {
                  const key = `${dayIndex}-${hour}`
                  const cell = cellMap.get(key) ?? { pnl: 0, count: 0 }
                  const strength = maxAbs > 0 ? Math.abs(cell.pnl) / maxAbs : 0
                  const style = getCellStyle(cell, maxAbs)
                  const isBest = bestCell?.day === dayIndex && bestCell.hour === hour
                  const isWorst = worstCell?.day === dayIndex && worstCell.hour === hour

                  return (
                    <button
                      type="button"
                      key={key}
                      className={cn(
                        'relative h-9 rounded-md border transition-transform hover:z-10 hover:scale-[1.08] focus:outline-none focus:ring-2 focus:ring-violet-400/60',
                        cell.count === 0 && 'opacity-70',
                      )}
                      style={style}
                      aria-label={`${dayLabel} ${formatHour(hour)} : ${cell.count} trade${cell.count > 1 ? 's' : ''}, ${formatMoney(cell.pnl, true)}`}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        setTooltip({
                          day: dayIndex,
                          hour,
                          pnl: cell.pnl,
                          count: cell.count,
                          avgPnl: cell.count > 0 ? cell.pnl / cell.count : 0,
                          strength,
                          x: rect.left,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        setTooltip({
                          day: dayIndex,
                          hour,
                          pnl: cell.pnl,
                          count: cell.count,
                          avgPnl: cell.count > 0 ? cell.pnl / cell.count : 0,
                          strength,
                          x: rect.left,
                          y: rect.top,
                        })
                      }}
                      onBlur={() => setTooltip(null)}
                    >
                      {cell.count > 0 && (
                        <span className="absolute inset-x-0 bottom-1 mx-auto h-0.5 w-3 rounded-full bg-white/55" />
                      )}
                      {isBest && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-200" />}
                      {isWorst && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-200" />}
                    </button>
                  )
                })}

                <div className={cn(
                  'flex h-9 items-center justify-end rounded-md border border-white/10 bg-white/[0.025] px-2 font-mono text-xs font-black',
                  (daySummaries[dayIndex]?.pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
                )}>
                  {formatMoney(daySummaries[dayIndex]?.pnl ?? 0, true)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Faible</span>
              <div className="h-2 w-28 rounded-full bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-400" />
              <span>Profit fort</span>
              <div className="ml-3 h-2 w-28 rounded-full bg-gradient-to-r from-slate-800 via-rose-700 to-rose-400" />
              <span>Perte forte</span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Pic positif : {bestCell ? `${DAY_LABELS[bestCell.day]} ${formatHour(bestCell.hour)} (${formatMoney(bestCell.pnl, true)})` : '—'}
              <span className="mx-2 text-slate-700">•</span>
              Pic négatif : {worstCell ? `${DAY_LABELS[worstCell.day]} ${formatHour(worstCell.hour)} (${formatMoney(worstCell.pnl, true)})` : '—'}
            </p>
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 w-56 rounded-lg border border-white/10 bg-[#0d1320] px-3 py-3 text-xs shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
          style={{ left: tooltip.x + 14, top: Math.max(12, tooltip.y - 18) }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-black text-white">{DAY_LABELS[tooltip.day]} · {formatHour(tooltip.hour)}</p>
            <p className={cn('font-mono font-black', tooltip.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {formatMoney(tooltip.pnl, true)}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md bg-white/[0.04] px-2 py-1.5">
              <p className="text-slate-500">Trades</p>
              <p className="mt-0.5 font-mono font-black text-white">{tooltip.count}</p>
            </div>
            <div className="rounded-md bg-white/[0.04] px-2 py-1.5">
              <p className="text-slate-500">Moyenne</p>
              <p className={cn('mt-0.5 font-mono font-black', tooltip.avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {formatMoney(tooltip.avgPnl, true)}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-500">
              <span>Intensité</span>
              <span>{Math.round(tooltip.strength * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn('h-full rounded-full', tooltip.pnl >= 0 ? 'bg-emerald-400' : 'bg-rose-400')}
                style={{ width: `${Math.max(tooltip.strength * 100, tooltip.count > 0 ? 12 : 0)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
