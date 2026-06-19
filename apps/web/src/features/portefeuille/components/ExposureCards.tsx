'use client'

import { TrendingUp, TrendingDown, Activity, Wallet } from 'lucide-react'
import { usePortfolioSummary } from '@/lib/hooks/use-portfolio'

function Card({
  label, value, sub, icon: Icon, color, loading,
}: {
  label:   string
  value:   string
  sub?:    string | undefined
  icon:    React.ElementType
  color:   string
  loading: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className={`mt-0.5 rounded-lg p-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-24 animate-pulse rounded bg-accent/70" />
        ) : (
          <>
            <p className="mt-0.5 font-mono text-2xl font-black text-foreground">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </>
        )}
      </div>
    </div>
  )
}

function fmt(n: number, currency = true) {
  return n.toLocaleString('fr-FR', currency
    ? { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
    : { maximumFractionDigits: 2 })
}

export function ExposureCards() {
  const { data, isLoading } = usePortfolioSummary()

  const pnlColor   = (data?.totalPnlOpen ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
  const pnlPrefix  = (data?.totalPnlOpen ?? 0) >= 0 ? '+' : ''

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Positions ouvertes"
        value={String(data?.openPositionsCount ?? 0)}
        sub="trades actifs"
        icon={Activity}
        color="bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
        loading={isLoading}
      />
      <Card
        label="Exposition (lots)"
        value={data ? `${data.totalExposureLots.toFixed(2)} L` : '—'}
        sub="volume total engagé"
        icon={TrendingUp}
        color="bg-cyan-50 text-cyan-600"
        loading={isLoading}
      />
      <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-sm">
        <div className={`mt-0.5 rounded-lg p-2 ${(data?.totalPnlOpen ?? 0) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {(data?.totalPnlOpen ?? 0) >= 0
            ? <TrendingUp className="w-4 h-4" />
            : <TrendingDown className="w-4 h-4" />
          }
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">P&L flottant</p>
          {isLoading ? (
            <div className="mt-1 h-7 w-24 animate-pulse rounded bg-accent/70" />
          ) : (
            <>
              <p className={`mt-0.5 font-mono text-2xl font-black ${pnlColor}`}>
                {pnlPrefix}{fmt(data?.totalPnlOpen ?? 0)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                risque : {data?.riskPct.toFixed(1)} % du capital
              </p>
            </>
          )}
        </div>
      </div>
      <Card
        label="Équity"
        value={data ? fmt(data.equity) : '—'}
        sub={data ? `Balance : ${fmt(data.balance)}` : undefined}
        icon={Wallet}
        color="bg-amber-50 text-amber-600"
        loading={isLoading}
      />
    </div>
  )
}
