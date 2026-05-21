'use client'

import { useState } from 'react'
import { Bot, LineChart, Sparkles } from 'lucide-react'
import { useLatestAiAnalysis } from '@/lib/hooks/use-ai-journal'
import { useAlerts } from '@/lib/hooks/use-alerts'

// ── Assistant IA ───────────────────────────────────────────────────
function AssistantPanel() {
  const [tab, setTab] = useState<'insights' | 'alert'>('insights')
  const { data: entry, isLoading } = useLatestAiAnalysis()
  const { data: alerts = [] }      = useAlerts()

  const insights    = entry?.insights
  const allInsights = [
    ...(insights?.strengths    ?? []).map(s => ({ text: s, type: 'strength' as const })),
    ...(insights?.actions      ?? []).map(s => ({ text: s, type: 'action'   as const })),
  ]

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-bold text-white">Assistant IA</h3>
        <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">BETA</span>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        {entry?.score != null
          ? `Score du jour : ${entry.score}/100`
          : 'Générez votre analyse IA pour voir vos recommandations.'}
      </p>

      <div className="flex gap-1 border-b border-gray-800/60 mb-3">
        {(['insights', 'alert'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-[11px] font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              tab === t ? 'text-indigo-400 border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-400'
            }`}
          >
            {t === 'insights' ? 'Insights' : `Alertes${alerts.length > 0 ? ` (${alerts.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'insights' && (
        isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-gray-800 rounded h-10" />)}
          </div>
        ) : allInsights.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Bot className="w-7 h-7 text-gray-700" />
            <p className="text-xs text-gray-500">Aucune analyse disponible</p>
            <p className="text-[11px] text-gray-600">Cliquez sur &quot;Générer l&apos;analyse&quot; ci-dessous</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allInsights.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-left ${
                  item.type === 'strength'
                    ? 'bg-green-500/5 border-green-500/15'
                    : 'bg-indigo-500/5 border-indigo-500/15'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${item.type === 'strength' ? 'text-green-400' : 'text-indigo-400'}`} />
                <p className="text-[11px] text-gray-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'alert' && (
        alerts.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-6">Aucune alerte active</div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15">
                <p className="text-[11px] text-red-300">{a.message}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── Matching IA ───────────────────────────────────────────────────
function MatchingPanel() {
  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-bold text-white">Matching IA</h3>
        <span className="text-[9px] font-bold bg-gray-700/60 text-gray-500 border border-gray-700/40 px-1.5 py-0.5 rounded">BIENTÔT</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 text-center">
        <LineChart className="w-8 h-8 text-gray-700" />
        <div>
          <p className="text-xs font-medium text-gray-500">Matching de stratégies</p>
          <p className="text-[11px] text-gray-600 mt-1">
            L&apos;IA recommandera des stratégies <br />compatibles avec votre profil — Phase 3
          </p>
        </div>
      </div>
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
