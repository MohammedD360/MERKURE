'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronDown } from 'lucide-react'
import { mockAssets, mockKpis } from '@/lib/mock-data'

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-medium text-white">{d.label}</div>
      <div className="text-gray-400 mt-0.5">{d.pct}% du portefeuille</div>
    </div>
  )
}

export function AssetBreakdown() {
  const total = mockKpis.balanceTotal

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Répartition des actifs</h3>
        <button className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/60 border border-gray-700/60 rounded-lg px-2.5 py-1.5 hover:bg-gray-700/60 transition-colors">
          Par classe d'actifs
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Donut + centre */}
      <div className="relative flex justify-center mb-4">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={mockAssets}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="pct"
              strokeWidth={0}
            >
              {mockAssets.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Texte centré dans le donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-base font-bold text-white font-mono">
            {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Total</div>
        </div>
      </div>

      {/* Légende */}
      <div className="space-y-2">
        {mockAssets.map((asset) => (
          <div key={asset.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: asset.color }} />
            <span className="text-xs text-gray-400 flex-1">{asset.label}</span>
            <span className="text-xs font-semibold text-white font-mono">{asset.pct}%</span>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-left">
        Voir le portefeuille →
      </button>
    </div>
  )
}
