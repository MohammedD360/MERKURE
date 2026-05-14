'use client'

import { useKpiSummary, useKpiDetailedStats, useKpiBreakdown } from '@/lib/hooks/use-kpis'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function Skeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-800 rounded h-4" />
      ))}
    </div>
  )
}

export function StatsCles() {
  const { data: summary, isLoading: l1 } = useKpiSummary('30d')
  const { data: stats,   isLoading: l2 } = useKpiDetailedStats('30d')
  const isLoading = l1 || l2

  const total     = summary?.nbTrades ?? 0
  const winCount  = stats?.winTrades  ?? 0
  const lossCount = stats?.lossTrades ?? 0

  const rows = [
    { label: 'Nb total de trades',      value: total.toString(),                                                                  color: 'text-white' },
    { label: 'Trades gagnants',         value: `${winCount} (${total > 0 ? ((winCount / total) * 100).toFixed(1) : 0}%)`,       color: 'text-green-400' },
    { label: 'Trades perdants',         value: `${lossCount} (${total > 0 ? ((lossCount / total) * 100).toFixed(1) : 0}%)`,     color: 'text-red-400' },
    { label: 'Meilleur trade',          value: stats?.bestTrade  ? `+${fmt(stats.bestTrade)}`  : '—',                            color: 'text-green-400' },
    { label: 'Pire trade',              value: stats?.worstTrade ? fmt(stats.worstTrade)        : '—',                            color: 'text-red-400' },
    { label: 'Gain moyen',              value: stats?.avgWin     ? `+${fmt(stats.avgWin)}`     : '—',                            color: 'text-green-400' },
    { label: 'Perte moyenne',           value: stats?.avgLoss    ? fmt(stats.avgLoss)           : '—',                            color: 'text-red-400' },
  ]

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Statistiques clés</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Voir toutes</button>
      </div>
      {isLoading ? <Skeleton /> : (
        <div className="space-y-2.5">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-semibold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StrategyPerformance() {
  const { data, isLoading } = useKpiBreakdown('30d')
  const strategies = data?.byStrategy ?? []

  const maxAbs = strategies.length > 0
    ? Math.max(...strategies.map(s => Math.abs(s.pnl)), 1)
    : 1

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Performance par stratégie</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Voir toutes</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800 rounded h-8" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-gray-600 text-xs">
          Annotez vos trades avec une stratégie pour voir cette section
        </div>
      ) : (
        <div className="space-y-3">
          {strategies.map((s) => {
            const barWidth = (Math.abs(s.pnl) / maxAbs) * 100
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 truncate max-w-[60%]">{s.name}</span>
                  <span className={`text-xs font-semibold font-mono ${s.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {s.positive ? '+' : ''}{s.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${s.positive ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
