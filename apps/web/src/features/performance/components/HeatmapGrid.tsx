'use client'

import { useState } from 'react'
import { useHeatmapData } from '@/lib/hooks/use-performance'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

const DAY_LABELS  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS       = Array.from({ length: 24 }, (_, i) => i)

function cellColor(pnl: number, count: number, maxAbs: number): string {
  if (count === 0 || maxAbs === 0) return '#1f2937'  // gris neutre
  const intensity = Math.min(Math.abs(pnl) / maxAbs, 1)
  if (pnl > 0) {
    // Vert, de très sombre (#052e16) à vif (#22c55e)
    const l = Math.round(8 + intensity * 30)
    const s = Math.round(40 + intensity * 60)
    return `hsl(142, ${s}%, ${l}%)`
  } else {
    // Rouge, de très sombre (#450a0a) à vif (#ef4444)
    const l = Math.round(8 + intensity * 30)
    const s = Math.round(40 + intensity * 60)
    return `hsl(0, ${s}%, ${l}%)`
  }
}

interface TooltipState {
  day:   number
  hour:  number
  pnl:   number
  count: number
  x:     number
  y:     number
}

function Skeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: '40px repeat(24, 1fr)', minWidth: 600 }}>
        {Array.from({ length: 7 * 24 + 24 + 7 }).map((_, i) => (
          <div key={i} className="h-6 animate-pulse rounded-sm bg-slate-800/60" />
        ))}
      </div>
    </div>
  )
}

export function HeatmapGrid({ period, accountId }: Props) {
  const query   = useHeatmapData(period, ...accountId ? [accountId] : [])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const cells = query.data ?? []

  // Index par [day][hour]
  const cellMap = new Map<string, { pnl: number; count: number }>()
  let maxAbs = 0
  for (const c of cells) {
    const key = `${c.dayOfWeek}-${c.hour}`
    cellMap.set(key, { pnl: c.pnl, count: c.count })
    if (Math.abs(c.pnl) > maxAbs) maxAbs = Math.abs(c.pnl)
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-4 shadow-[0_14px_46px_rgba(0,0,0,0.18)]">
      <h2 className="mb-4 text-sm font-black text-white">Heatmap P&L (jour × heure)</h2>

      {query.isLoading ? <Skeleton /> : (
        <div className="relative overflow-x-auto">
          {/* Grille : 25 colonnes (1 label + 24h) × 8 lignes (1 header + 7 jours) */}
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: '40px repeat(24, minmax(24px, 1fr))', minWidth: 640 }}
          >
            {/* Header row */}
            <div /> {/* coin vide */}
            {HOURS.map(h => (
              <div key={h} className="pb-1 text-center font-mono text-[10px] text-slate-500">
                {String(h).padStart(2, '0')}
              </div>
            ))}

            {/* Rows pour chaque jour */}
            {DAY_LABELS.map((dayLabel, dayIdx) => (
              <>
                <div key={`label-${dayIdx}`} className="flex items-center pr-1 text-[11px] font-medium text-slate-400">
                  {dayLabel}
                </div>
                {HOURS.map(hour => {
                  const key   = `${dayIdx}-${hour}`
                  const cell  = cellMap.get(key) ?? { pnl: 0, count: 0 }
                  const color = cellColor(cell.pnl, cell.count, maxAbs)

                  return (
                    <div
                      key={key}
                      className="h-6 cursor-default rounded-sm transition-opacity hover:opacity-80"
                      style={{ backgroundColor: color }}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({
                          day: dayIdx, hour, pnl: cell.pnl, count: cell.count,
                          x: rect.left, y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </>
            ))}
          </div>

          {/* Légende */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1f2937' }} />
              <span>Aucun trade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#166534' }} />
              <span>Profit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7f1d1d' }} />
              <span>Perte</span>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip flottant via portal-like fixed */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-700/70 bg-[#071017] px-3 py-2 text-xs shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
        >
          <p className="mb-0.5 font-medium text-slate-300">
            {DAY_LABELS[tooltip.day]} — {String(tooltip.hour).padStart(2, '0')}h
          </p>
          <p className="text-slate-400">{tooltip.count} trade{tooltip.count > 1 ? 's' : ''}</p>
          <p className={`font-mono font-semibold ${tooltip.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {tooltip.pnl >= 0 ? '+' : ''}{tooltip.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
      )}
    </div>
  )
}
