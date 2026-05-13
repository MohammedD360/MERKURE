'use client'

import { TrendingUp, AlertTriangle, Globe, Clock } from 'lucide-react'
import type { ProfilePayload } from '../api'

interface Props {
  data: ProfilePayload
  onChange: (patch: Partial<ProfilePayload>) => void
}

const STYLES = [
  { id: 'SCALPER', label: 'Scalper', desc: '< 15 min par trade' },
  { id: 'DAYTRADER', label: 'Day Trader', desc: 'Clôture le soir' },
  { id: 'SWINGTRADER', label: 'Swing Trader', desc: 'Quelques jours' },
  { id: 'INVESTOR', label: 'Investisseur', desc: 'Semaines / mois' },
] as const

const RISKS = [
  { id: 'LOW', label: 'Conservateur', color: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/8' },
  { id: 'MEDIUM', label: 'Modéré', color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/8' },
  { id: 'HIGH', label: 'Dynamique', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/8' },
  { id: 'AGGRESSIVE', label: 'Agressif', color: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/8' },
] as const

const MARKETS = ['Forex', 'Indices', 'Crypto', 'Actions', 'Matières premières', 'Obligations', 'Options', 'Futures']

export function StepProfile({ data, onChange }: Props) {
  const toggleMarket = (market: string) => {
    const current = data.markets ?? []
    const next = current.includes(market) ? current.filter((m) => m !== market) : [...current, market]
    onChange({ markets: next })
  }

  return (
    <div className="space-y-8">
      {/* Style de trading */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Style de trading</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ style: s.id })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.style === s.id
                  ? 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/60 hover:bg-gray-800/60'
              }`}
            >
              <p className="text-sm font-semibold text-white">{s.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Appétit au risque */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Appétit au risque</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {RISKS.map((r) => (
            <button
              key={r.id}
              onClick={() => onChange({ riskAppetite: r.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                data.riskAppetite === r.id
                  ? `${r.border} ${r.bg} ring-1 ring-current`
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/60 hover:bg-gray-800/60'
              }`}
            >
              <p className={`text-sm font-semibold ${data.riskAppetite === r.id ? r.color : 'text-gray-300'}`}>
                {r.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Marchés */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Marchés tradés</span>
          <span className="text-[11px] text-gray-600">(plusieurs possibles)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MARKETS.map((m) => {
            const active = (data.markets ?? []).includes(m)
            return (
              <button
                key={m}
                onClick={() => toggleMarket(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
                    : 'border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expérience */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Années d'expérience</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 5, 7, 10, 15].map((y) => (
            <button
              key={y}
              onClick={() => onChange({ experienceYears: y })}
              className={`w-14 py-2 rounded-xl text-sm font-semibold border transition-all ${
                data.experienceYears === y
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
                  : 'border-gray-700/50 text-gray-400 hover:border-gray-600'
              }`}
            >
              {y === 15 ? '15+' : y === 0 ? '< 1' : y}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
