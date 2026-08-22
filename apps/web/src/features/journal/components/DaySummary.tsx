'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { Trade } from '@/lib/hooks/use-trades'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { buildIntradayCurve, computeDayStats } from '../day-stats'

/**
 * Bandeau « Daily Stats » — les 8 métriques que Tradezella / TraderSync
 * affichent en tête de journée : P&L net, trades, win rate, gagnants,
 * perdants, volume, profit factor, frais.
 */
function StatTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="min-w-0 px-3 py-3">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 truncate text-lg font-semibold tabular-nums',
          tone === 'up' ? 'text-green-500' : tone === 'down' ? 'text-red-500' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function DayStatsBar({ trades, isLoading }: { trades: Trade[]; isLoading: boolean }) {
  const currency = useCurrency()
  const s = computeDayStats(trades)

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[70px] bg-card" />
        ))}
      </div>
    )
  }

  const tiles: Array<{ label: string; value: string; tone?: 'up' | 'down' | 'neutral' }> = [
    { label: 'P&L net',       value: s.trades ? formatMoney(s.netPnl, { currency, signed: true }) : '—', tone: s.netPnl > 0 ? 'up' : s.netPnl < 0 ? 'down' : 'neutral' },
    { label: 'Trades',        value: String(s.trades) },
    { label: 'Win rate',      value: s.winRate == null ? '—' : formatPercent(s.winRate) },
    { label: 'Gagnants',      value: String(s.winners), tone: s.winners > 0 ? 'up' : 'neutral' },
    { label: 'Perdants',      value: String(s.losers), tone: s.losers > 0 ? 'down' : 'neutral' },
    { label: 'Volume',        value: s.volume ? `${s.volume.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} lots` : '—' },
    { label: 'Profit factor', value: s.trades === 0 ? '—' : s.profitFactor == null ? '∞' : s.profitFactor.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'Frais',         value: s.trades ? formatMoney(-Math.abs(s.fees), { currency, signed: true }) : '—' },
  ]

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {tiles.map(t => (
        <div key={t.label} className="bg-card">
          <StatTile {...t} />
        </div>
      ))}
    </div>
  )
}

/** Courbe cumulée intrajournalière — l'« Intraday Cumulative Net P&L » de la référence. */
export function DayPnlChart({ trades }: { trades: Trade[] }) {
  const currency = useCurrency()
  const curve = buildIntradayCurve(trades)

  if (curve.length < 2) return null

  // Même parti pris que la courbe equity : la trajectoire est à la marque.
  const color = 'hsl(var(--primary))'

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 space-y-1.5">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">P&L cumulé de la séance</h3>
        <p className="text-sm text-muted-foreground">Évolution au fil des clôtures</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={curve} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="dayPnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)))}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]!.payload as { time: string; cum: number; pnl: number; symbol: string }
              return (
                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                  <div className="mb-1 text-muted-foreground">{p.time} · {p.symbol}</div>
                  <div className="font-medium">
                    Trade :{' '}
                    <span className={p.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatMoney(p.pnl, { currency, signed: true })}
                    </span>
                  </div>
                  <div className="font-medium">
                    Cumulé :{' '}
                    <span className={p.cum >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatMoney(p.cum, { currency, signed: true })}
                    </span>
                  </div>
                </div>
              )
            }}
          />
          <Area type="monotone" dataKey="cum" stroke={color} strokeWidth={2} fill="url(#dayPnlGradient)" dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
