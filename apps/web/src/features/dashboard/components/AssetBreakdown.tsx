'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronDown } from 'lucide-react'
import { useKpiBreakdown } from '@/lib/hooks/use-kpis'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; pct: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-medium text-white">{d.label}</div>
      <div className="text-gray-400 mt-0.5">{d.pct}% des trades</div>
    </div>
  )
}

export function AssetBreakdown() {
  const { data, isLoading } = useKpiBreakdown('30d')
  const assets = data?.bySymbol ?? []

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Répartition des actifs</h3>
        <button className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/60 border border-gray-700/60 rounded-lg px-2.5 py-1.5 hover:bg-gray-700/60 transition-colors">
          Par volume
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-gray-800 rounded-full w-[200px] h-[200px] mx-auto mb-4" />
      ) : assets.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-gray-600 text-sm">
          Aucun trade sur cette période
        </div>
      ) : (
        <>
          <div className="relative flex justify-center mb-4">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={assets}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="pct"
                  strokeWidth={0}
                >
                  {assets.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-base font-bold text-white font-mono">
                {assets.reduce((s, a) => s + a.nbTrades, 0)}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">trades</div>
            </div>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: asset.color }} />
                <span className="text-xs text-gray-400 flex-1">{asset.label}</span>
                <span className="text-xs font-semibold text-white font-mono">{asset.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="mt-4 w-full text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-left">
        Voir le portefeuille →
      </button>
    </div>
  )
}
