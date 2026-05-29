'use client'

import { useOpenPositions, usePortfolioSummary } from '@/lib/hooks/use-portfolio'

const SYMBOL_COLORS: Record<string, string> = {
  EURUSD: '#6366f1', GBPUSD: '#8b5cf6', USDJPY: '#f59e0b',
  GBPJPY: '#ef4444', XAUUSD: '#fbbf24', US30: '#22c55e',
  NAS100: '#06b6d4', BTCUSD: '#f97316',
}
function color(s: string) { return SYMBOL_COLORS[s] ?? '#6b7280' }

export function RiskExposureChart() {
  const { data: positions = [], isLoading: pLoading } = useOpenPositions()
  const { data: summary,          isLoading: sLoading } = usePortfolioSummary()

  const loading = pLoading || sLoading
  const balance = summary?.balance ?? 10_000

  // Aggregate lots by symbol
  const bySymbol = new Map<string, { lots: number; pnl: number }>()
  for (const p of positions) {
    const s = bySymbol.get(p.symbol) ?? { lots: 0, pnl: 0 }
    s.lots += p.lotSize
    s.pnl  += p.pnl
    bySymbol.set(p.symbol, s)
  }
  const rows = Array.from(bySymbol.entries())
    .map(([symbol, v]) => ({
      symbol,
      lots:    v.lots,
      pnl:     v.pnl,
      riskPct: balance > 0 ? Math.abs(v.pnl) / balance * 100 : 0,
    }))
    .sort((a, b) => b.riskPct - a.riskPct)

  const maxRisk = Math.max(...rows.map(r => r.riskPct), 0.01)

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-white mb-4">Exposition au risque par instrument</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse bg-gray-800/60 rounded" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-gray-600 text-sm">
          Aucune position ouverte
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.symbol} className="flex items-center gap-3">
              {/* Symbol */}
              <div className="flex items-center gap-2 w-24 flex-shrink-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color(row.symbol) }} />
                <span className="text-xs font-mono font-medium text-gray-300">{row.symbol}</span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-5 bg-gray-900 rounded-md overflow-hidden relative">
                <div
                  className="h-full rounded-md transition-all"
                  style={{
                    width:           `${(row.riskPct / maxRisk) * 100}%`,
                    backgroundColor: color(row.symbol),
                    opacity:         0.8,
                  }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-white/80">
                  {row.lots.toFixed(2)} lots
                </span>
              </div>

              {/* Risk % */}
              <div className="w-12 text-right flex-shrink-0">
                <span className={`text-xs font-mono font-medium ${
                  row.riskPct > 3 ? 'text-red-400' : row.riskPct > 1 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {row.riskPct.toFixed(1)}%
                </span>
              </div>

              {/* P&L */}
              <div className="w-20 text-right flex-shrink-0">
                <span className={`text-xs font-mono ${row.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {row.pnl >= 0 ? '+' : ''}{row.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-2 border-t border-gray-800/60 flex items-center gap-3">
            <span className="text-[11px] text-gray-500 w-24 flex-shrink-0">TOTAL</span>
            <div className="flex-1" />
            <div className="w-12 text-right">
              <span className={`text-xs font-mono font-bold ${(summary?.riskPct ?? 0) > 3 ? 'text-red-400' : 'text-amber-400'}`}>
                {(summary?.riskPct ?? 0).toFixed(1)}%
              </span>
            </div>
            <div className="w-20 text-right">
              <span className={`text-xs font-mono font-bold ${(summary?.totalPnlOpen ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(summary?.totalPnlOpen ?? 0) >= 0 ? '+' : ''}
                {(summary?.totalPnlOpen ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
