'use client'

import { useMonthlyStats } from '@/lib/hooks/use-stats'

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function pnlColor(pnl: number) {
  return pnl >= 0 ? 'text-emerald-600' : 'text-red-500'
}
function pnlBg(pnl: number) {
  if (pnl > 500)  return 'bg-emerald-50'
  if (pnl > 0)    return 'bg-emerald-50/60'
  if (pnl < -200) return 'bg-red-50'
  if (pnl < 0)    return 'bg-red-50/60'
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
    <div className="bg-card border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <h2 className="text-sm font-semibold text-foreground">Bilan mensuel</h2>
        <p className="text-[11px] text-[hsl(var(--foreground-soft))] mt-0.5">12 derniers mois</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {['Mois', 'Trades', 'Win Rate', 'P&L', 'Profit Factor'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse bg-[hsl(var(--accent))] rounded w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[hsl(var(--foreground-soft))] text-sm">
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              [...rows].reverse().map(row => {
                const [year, month] = row.month.split('-')
                const label = `${MONTH_LABELS[month!] ?? month} ${year}`
                return (
                  <tr key={row.month} className={`hover:bg-[hsl(var(--accent))] transition-colors ${pnlBg(row.totalPnl)}`}>
                    <td className="px-4 py-3 font-medium text-foreground/80 w-24">{label}</td>
                    <td className="px-4 py-3 text-[hsl(var(--foreground-soft))] font-mono">{row.nbTrades}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[hsl(var(--accent))] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.winRate >= 0.5 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${row.winRate * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${row.winRate >= 0.5 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {(row.winRate * 100).toFixed(0)} %
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-mono font-semibold ${pnlColor(row.totalPnl)}`}>
                      {row.totalPnl >= 0 ? '+' : ''}
                      {row.totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground/80">
                      {row.profitFactor != null ? row.profitFactor.toFixed(2) : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {!isLoading && rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
                <td className="px-4 py-3 text-[11px] text-[hsl(var(--foreground-soft))] uppercase font-medium">Total</td>
                <td className="px-4 py-3 text-foreground/80 font-mono font-medium">{totalTrades}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono font-medium ${avgWr >= 0.5 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {(avgWr * 100).toFixed(1)} %
                  </span>
                </td>
                <td className={`px-4 py-3 font-mono font-bold ${pnlColor(totalPnl)}`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="px-4 py-3 text-foreground/50">—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
