import { mockStats, mockStrategies } from '@/lib/mock-data'

export function StatsCles() {
  const fmt = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  const rows = [
    { label: 'Nb total de trades',         value: mockStats.totalTrades.toString(),                   color: 'text-white' },
    { label: 'Trades gagnants',             value: `${mockStats.winTrades} (${mockStats.totalTrades > 0 ? ((mockStats.winTrades / mockStats.totalTrades) * 100).toFixed(1) : 0}%)`, color: 'text-green-400' },
    { label: 'Trades perdants',             value: `${mockStats.lossTrades} (${mockStats.totalTrades > 0 ? ((mockStats.lossTrades / mockStats.totalTrades) * 100).toFixed(1) : 0}%)`, color: 'text-red-400' },
    { label: 'Meilleur trade',              value: `+${fmt(mockStats.bestTrade)}`,                    color: 'text-green-400' },
    { label: 'Pire trade',                  value: fmt(mockStats.worstTrade),                         color: 'text-red-400' },
    { label: 'Gain moyen',                  value: `+${fmt(mockStats.avgWin)}`,                       color: 'text-green-400' },
    { label: 'Perte moyenne',               value: fmt(mockStats.avgLoss),                            color: 'text-red-400' },
    { label: 'Durée moyenne des trades',    value: mockStats.avgDuration,                             color: 'text-gray-300' },
  ]

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Statistiques clés</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Voir toutes</button>
      </div>
      <div className="space-y-2.5">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-xs font-semibold font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StrategyPerformance() {
  const maxAbs = Math.max(...mockStrategies.map((s) => Math.abs(s.pct)))

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Performance par stratégie</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Voir toutes</button>
      </div>
      <div className="space-y-3">
        {mockStrategies.map((s) => {
          const barWidth = (Math.abs(s.pct) / maxAbs) * 100
          return (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{s.name}</span>
                <span className={`text-xs font-semibold font-mono ${s.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {s.positive ? '+' : ''}{s.pct.toFixed(2)}%
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
    </div>
  )
}
