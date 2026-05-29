'use client'

import { useMonthlyStats } from '@/lib/hooks/use-stats'

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function pnlColor(pnl: number) {
  return pnl >= 0 ? 'text-green-400' : 'text-red-400'
}
function pnlBg(pnl: number) {
  if (pnl > 500)  return 'bg-green-500/25'
  if (pnl > 0)    return 'bg-green-500/10'
  if (pnl < -200) return 'bg-red-500/20'
  if (pnl < 0)    return 'bg-red-500/8'
  return ''
}

export function MonthlyTable() {
  const { data: rows = [], isLoading } = useMonthlyStats(12)

  const totalPnl    = rows.reduce((s, r) => s + r.totalPnl, 0)
  const totalTrades = rows.reduce((s, r) => s + r.nbTrades, 0)
  const avgWr       = totalTrades > 0
    ? rows.reduce((s, r) => s + r.winRate * r.nbTrades, 0) / totalTrades
    : 0

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/60">
        <h2 className="text-sm font-semibold text-white">Bilan mensuel</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">12 derniers mois</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/40">
              {['Mois', 'Trades', 'Win Rate', 'P&L', 'Profit Factor'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/30">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse bg-gray-800 rounded w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-600 text-sm">
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              [...rows].reverse().map(row => {
                const [year, month] = row.month.split('-')
                const label = `${MONTH_LABELS[month!] ?? month} ${year}`
                return (
                  <tr key={row.month} className={`hover:bg-white/[0.02] transition-colors ${pnlBg(row.totalPnl)}`}>
                    <td className="px-4 py-3 font-medium text-gray-200 w-24">{label}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{row.nbTrades}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.winRate >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${row.winRate * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${row.winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                          {(row.winRate * 100).toFixed(0)} %
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-mono font-semibold ${pnlColor(row.totalPnl)}`}>
                      {row.totalPnl >= 0 ? '+' : ''}
                      {row.totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-300">
                      {row.profitFactor != null ? row.profitFactor.toFixed(2) : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {!isLoading && rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-700/60 bg-gray-900/40">
                <td className="px-4 py-3 text-[11px] text-gray-500 uppercase font-medium">Total</td>
                <td className="px-4 py-3 text-gray-300 font-mono font-medium">{totalTrades}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono font-medium ${avgWr >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {(avgWr * 100).toFixed(1)} %
                  </span>
                </td>
                <td className={`px-4 py-3 font-mono font-bold ${pnlColor(totalPnl)}`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="px-4 py-3 text-gray-600">—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
