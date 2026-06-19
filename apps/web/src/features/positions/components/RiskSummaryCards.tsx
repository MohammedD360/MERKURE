'use client'

import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react'
import { useOpenPositions, usePortfolioSummary } from '@/lib/hooks/use-portfolio'

function formatDuration(openTime: string): string {
  const ms       = Date.now() - new Date(openTime).getTime()
  const totalMin = Math.floor(ms / 60_000)
  const h        = Math.floor(totalMin / 60)
  const d        = Math.floor(h / 24)
  const hrs      = h % 24
  const m        = totalMin % 60
  if (d > 0) return `${d}j ${hrs}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function Card({ label, value, sub, icon: Icon, iconClass, loading }: {
  label: string; value: string; sub?: string | undefined
  icon: React.ElementType; iconClass: string; loading: boolean
}) {
  return (
    <div className="bg-card border border-[hsl(var(--border))] rounded-xl p-4 flex items-start gap-3">
      <div className={`mt-0.5 rounded-lg p-2 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium">{label}</p>
        {loading ? (
          <div className="h-7 w-20 animate-pulse bg-[hsl(var(--accent))] rounded mt-1" />
        ) : (
          <>
            <p className="text-2xl font-bold text-foreground font-mono mt-0.5">{value}</p>
            {sub && <p className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">{sub}</p>}
          </>
        )}
      </div>
    </div>
  )
}

export function RiskSummaryCards() {
  const { data: positions = [], isLoading: posLoading } = useOpenPositions()
  const { data: summary,          isLoading: sumLoading } = usePortfolioSummary()
  const loading = posLoading || sumLoading

  const sorted    = [...positions].sort((a, b) => b.pnl - a.pnl)
  const best      = sorted[0]
  const worst     = sorted[sorted.length - 1]

  const avgDurMs  = positions.length > 0
    ? positions.reduce((s, p) => s + (Date.now() - new Date(p.openTime).getTime()), 0) / positions.length
    : 0

  const totalPnl  = positions.reduce((s, p) => s + p.pnl, 0)
  const pnlColor  = totalPnl >= 0 ? 'text-emerald-600' : 'text-red-500'
  const pnlPrefix = totalPnl >= 0 ? '+' : ''

  const riskPct   = summary?.riskPct ?? 0
  const riskColor = riskPct > 5 ? 'text-red-500' : riskPct > 2 ? 'text-amber-600' : 'text-emerald-600'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* P&L flottant */}
      <div className="bg-card border border-[hsl(var(--border))] rounded-xl p-4 flex items-start gap-3">
        <div className={`mt-0.5 rounded-lg p-2 ${totalPnl >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {totalPnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium">P&L flottant</p>
          {loading ? <div className="h-7 w-20 animate-pulse bg-[hsl(var(--accent))] rounded mt-1" /> : (
            <>
              <p className={`text-2xl font-bold font-mono mt-0.5 ${pnlColor}`}>
                {pnlPrefix}{totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">{positions.length} position{positions.length > 1 ? 's' : ''}</p>
            </>
          )}
        </div>
      </div>

      {/* Risque courant */}
      <div className="bg-card border border-[hsl(var(--border))] rounded-xl p-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-lg p-2 bg-amber-50 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium">Risque courant</p>
          {loading ? <div className="h-7 w-20 animate-pulse bg-[hsl(var(--accent))] rounded mt-1" /> : (
            <>
              <p className={`text-2xl font-bold font-mono mt-0.5 ${riskColor}`}>{riskPct.toFixed(1)} %</p>
              <p className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">du capital exposé</p>
            </>
          )}
        </div>
      </div>

      {/* Meilleure position */}
      <div className="bg-card border border-[hsl(var(--border))] rounded-xl p-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-lg p-2 bg-emerald-50 text-emerald-600">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium">Meilleure</p>
          {loading ? <div className="h-7 w-20 animate-pulse bg-[hsl(var(--accent))] rounded mt-1" /> : !best ? (
            <p className="text-2xl font-bold text-foreground/30 font-mono mt-0.5">—</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">
                +{best.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">{best.symbol} {best.direction}</p>
            </>
          )}
        </div>
      </div>

      {/* Durée moyenne */}
      <Card
        label="Durée moyenne"
        value={loading || positions.length === 0 ? '—' : formatDuration(new Date(Date.now() - avgDurMs).toISOString())}
        sub={worst && !loading ? `Pire : ${worst.symbol} (${worst.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })})` : undefined}
        icon={Clock}
        iconClass="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
        loading={loading}
      />
    </div>
  )
}
