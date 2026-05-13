// Données locales — sera remplacé par l'API réelle
const mockTrades = [
  { id: '1', symbol: 'EURUSD', direction: 'LONG' as const, openTime: '21/04 09:32', closeTime: '21/04 14:18', lotSize: 0.1, pnl: 120.5, pnlPct: 0.012, status: 'CLOSED' as const },
  { id: '2', symbol: 'XAUUSD', direction: 'LONG' as const, openTime: '21/04 10:05', closeTime: '21/04 16:44', lotSize: 0.05, pnl: 310.0, pnlPct: 0.031, status: 'CLOSED' as const },
  { id: '3', symbol: 'GBPUSD', direction: 'SHORT' as const, openTime: '18/04 08:55', closeTime: '18/04 12:30', lotSize: 0.1, pnl: -45.0, pnlPct: -0.0045, status: 'CLOSED' as const },
  { id: '4', symbol: 'US30', direction: 'LONG' as const, openTime: '17/04 15:00', closeTime: '17/04 21:10', lotSize: 0.02, pnl: 450.0, pnlPct: 0.045, status: 'CLOSED' as const },
  { id: '5', symbol: 'BTCUSD', direction: 'SHORT' as const, openTime: '16/04 11:20', closeTime: '16/04 18:55', lotSize: 0.01, pnl: -120.0, pnlPct: -0.012, status: 'CLOSED' as const },
  { id: '6', symbol: 'USDJPY', direction: 'LONG' as const, openTime: '14/04 07:45', closeTime: '14/04 13:20', lotSize: 0.1, pnl: 75.0, pnlPct: 0.0075, status: 'CLOSED' as const },
  { id: '7', symbol: 'EURUSD', direction: 'SHORT' as const, openTime: '24/04 09:10', closeTime: undefined, lotSize: 0.15, pnl: 38.2, pnlPct: 0.0038, status: 'OPEN' as const },
]
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

export function TradesTable() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-gray-400">Trades Récents</h3>
        <button className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Voir tout →
        </button>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Instrument', 'Direction', 'Ouverture', 'Fermeture', 'Lots', 'P&L'].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-gray-500 pb-3 pr-4 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {mockTrades.map((trade) => {
              const isProfit = (trade.pnl ?? 0) >= 0
              const isOpen = trade.status === 'OPEN'

              return (
                <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors group">
                  {/* Instrument */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-300 group-hover:bg-gray-700 transition-colors">
                        {trade.symbol.slice(0, 2)}
                      </div>
                      <span className="font-medium text-white">{trade.symbol}</span>
                      {isOpen && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          Live
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Direction */}
                  <td className="py-3 pr-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      trade.direction === 'LONG'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {trade.direction === 'LONG'
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownRight className="w-3 h-3" />
                      }
                      {trade.direction}
                    </div>
                  </td>

                  {/* Ouverture */}
                  <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{trade.openTime}</td>

                  {/* Fermeture */}
                  <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                    {trade.closeTime ?? (
                      <span className="flex items-center gap-1 text-brand-400">
                        <Clock className="w-3 h-3" />
                        En cours
                      </span>
                    )}
                  </td>

                  {/* Lots */}
                  <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{trade.lotSize}</td>

                  {/* P&L */}
                  <td className="py-3">
                    <div className={`font-mono font-semibold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}
                      {trade.pnl?.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                    </div>
                    <div className={`text-[10px] font-mono ${isProfit ? 'text-green-500/70' : 'text-red-500/70'}`}>
                      {isProfit ? '+' : ''}{((trade.pnlPct ?? 0) * 100).toFixed(2)}%
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
