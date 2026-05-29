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
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4 flex items-start gap-3">
      <div className={`mt-0.5 rounded-lg p-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        {loading ? (
          <div className="h-7 w-24 animate-pulse bg-gray-800 rounded mt-1" />
        ) : (
          <>
            <p className="text-2xl font-bold text-white font-mono mt-0.5">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
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

  const pnlColor   = (data?.totalPnlOpen ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
  const pnlPrefix  = (data?.totalPnlOpen ?? 0) >= 0 ? '+' : ''

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Positions ouvertes"
        value={String(data?.openPositionsCount ?? 0)}
        sub="trades actifs"
        icon={Activity}
        color="bg-indigo-500/15 text-indigo-400"
        loading={isLoading}
      />
      <Card
        label="Exposition (lots)"
        value={data ? `${data.totalExposureLots.toFixed(2)} L` : '—'}
        sub="volume total engagé"
        icon={TrendingUp}
        color="bg-blue-500/15 text-blue-400"
        loading={isLoading}
      />
      <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4 flex items-start gap-3">
        <div className={`mt-0.5 rounded-lg p-2 ${(data?.totalPnlOpen ?? 0) >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          {(data?.totalPnlOpen ?? 0) >= 0
            ? <TrendingUp className="w-4 h-4" />
            : <TrendingDown className="w-4 h-4" />
          }
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">P&L flottant</p>
          {isLoading ? (
            <div className="h-7 w-24 animate-pulse bg-gray-800 rounded mt-1" />
          ) : (
            <>
              <p className={`text-2xl font-bold font-mono mt-0.5 ${pnlColor}`}>
                {pnlPrefix}{fmt(data?.totalPnlOpen ?? 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
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
        color="bg-amber-500/15 text-amber-400"
        loading={isLoading}
      />
    </div>
  )
}
