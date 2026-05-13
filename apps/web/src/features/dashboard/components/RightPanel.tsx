'use client'

import { useState, type ReactNode } from 'react'
import { Shield, PieChart, Clock, ChevronRight, Plus, LineChart } from 'lucide-react'
import { mockRecommendations, mockMatchingStrategies } from '@/lib/mock-data'

const iconMap: Record<string, ReactNode> = {
  shield: <Shield className="w-4 h-4 text-indigo-400" />,
  pie:    <PieChart className="w-4 h-4 text-indigo-400" />,
  clock:  <Clock className="w-4 h-4 text-indigo-400" />,
}

// ── Assistant IA ───────────────────────────────────────────────────
function AssistantPanel() {
  const [tab, setTab] = useState<'reco' | 'alert'>('reco')

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-bold text-white">Assistant IA</h3>
        <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">BETA</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Bonjour <span className="text-white font-medium">Alexandre !</span><br />
        Voici vos recommandations personnalisées.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800/60 mb-3">
        {(['reco', 'alert'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-[11px] font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'text-indigo-400 border-indigo-400'
                : 'text-gray-600 border-transparent hover:text-gray-400'
            }`}
          >
            {t === 'reco' ? 'Recommandations' : 'Alertes'}
          </button>
        ))}
      </div>

      {/* Recommandations */}
      {tab === 'reco' && (
        <div className="space-y-2.5">
          {mockRecommendations.map((r) => (
            <button
              key={r.title}
              className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/30 hover:border-gray-700/60 transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                {iconMap[r.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white mb-0.5">{r.title}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed">{r.body}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
            </button>
          ))}
          <button className="w-full mt-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
            Voir toutes les recommandations
          </button>
        </div>
      )}

      {tab === 'alert' && (
        <div className="text-xs text-gray-500 text-center py-6">Aucune alerte active</div>
      )}
    </div>
  )
}

// ── Matching IA ───────────────────────────────────────────────────
function MatchingPanel() {
  const [tab, setTab] = useState<'strat' | 'traders'>('strat')

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-bold text-white">Matching IA</h3>
        <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">NOUVEAU</span>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        L'IA a trouvé des stratégies et traders similaires à votre profil.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800/60 mb-3">
        {(['strat', 'traders'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-[11px] font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'text-indigo-400 border-indigo-400'
                : 'text-gray-600 border-transparent hover:text-gray-400'
            }`}
          >
            {t === 'strat' ? 'Stratégies' : 'Traders'}
          </button>
        ))}
      </div>

      {/* Stratégies matchées */}
      {tab === 'strat' && (
        <div className="space-y-2.5">
          {mockMatchingStrategies.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/70 hover:border-gray-700/60 transition-all group"
            >
              {/* Icône */}
              <div className="w-8 h-8 rounded-lg bg-gray-700/60 flex items-center justify-center flex-shrink-0">
                <LineChart className="w-4 h-4 text-indigo-400" />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{s.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-indigo-400 font-medium">
                    Compatibilité {s.compatibility}%
                  </span>
                  <span className={`text-[10px] font-medium ${s.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {s.positive ? '+' : ''}{s.perf3m}% (3 mois)
                  </span>
                </div>
              </div>

              {/* Bouton + */}
              <button className="w-7 h-7 rounded-full border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/25 flex items-center justify-center flex-shrink-0 transition-colors">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          ))}

          <button className="w-full mt-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
            Voir plus de matchs
          </button>
        </div>
      )}

      {tab === 'traders' && (
        <div className="text-xs text-gray-500 text-center py-6">Matching traders — bientôt disponible</div>
      )}
    </div>
  )
}

export function RightPanel() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <AssistantPanel />
      <MatchingPanel />
    </div>
  )
}
