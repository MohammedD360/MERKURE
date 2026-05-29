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
  { id: 'LOW', label: 'Conservateur', color: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/[0.08]' },
  { id: 'MEDIUM', label: 'Modéré', color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/[0.08]' },
  { id: 'HIGH', label: 'Dynamique', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/[0.08]' },
  { id: 'AGGRESSIVE', label: 'Agressif', color: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/[0.08]' },
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
          <TrendingUp className="w-4 h-4 text-blue-300" />
          <span className="text-sm font-black text-white">Style de trading</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ style: s.id })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.style === s.id
                  ? 'border-blue-500/60 bg-blue-500/[0.08] ring-1 ring-blue-500/25'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <p className="text-sm font-black text-white">{s.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Appétit au risque */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span className="text-sm font-black text-white">Appétit au risque</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {RISKS.map((r) => (
            <button
              key={r.id}
              onClick={() => onChange({ riskAppetite: r.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                data.riskAppetite === r.id
                  ? `${r.border} ${r.bg} ring-1 ring-current`
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <p className={`text-sm font-semibold ${data.riskAppetite === r.id ? r.color : 'text-slate-300'}`}>
                {r.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Marchés */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-emerald-300" />
          <span className="text-sm font-black text-white">Marchés tradés</span>
          <span className="text-[11px] text-slate-600">(plusieurs possibles)</span>
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
                    ? 'border-blue-500/60 bg-blue-500/10 text-blue-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
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
          <Clock className="w-4 h-4 text-violet-300" />
          <span className="text-sm font-black text-white">Années d'expérience</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 5, 7, 10, 15].map((y) => (
            <button
              key={y}
              onClick={() => onChange({ experienceYears: y })}
              className={`w-14 py-2 rounded-xl text-sm font-semibold border transition-all ${
                data.experienceYears === y
                  ? 'border-blue-500/60 bg-blue-500/[0.08] text-blue-300'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
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
