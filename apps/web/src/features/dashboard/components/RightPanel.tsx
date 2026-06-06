'use client'

import { useState } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { useLatestAiAnalysis } from '@/lib/hooks/use-ai-journal'
import { useAlerts } from '@/lib/hooks/use-alerts'

// ── Journal assisté ────────────────────────────────────────────────
function AssistantPanel() {
  const [tab, setTab] = useState<'insights' | 'alert'>('insights')
  const { data: entry, isLoading } = useLatestAiAnalysis()
  const { data: alertsData }       = useAlerts()
  const alerts = alertsData?.alerts ?? []

  const insights    = entry?.insights
  const allInsights = [
    ...(insights?.strengths    ?? []).map(s => ({ text: s, type: 'strength' as const })),
    ...(insights?.actions      ?? []).map(s => ({ text: s, type: 'action'   as const })),
  ]

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-sm font-black text-white">Insights IA</h3>
        <span className="rounded border border-blue-400/20 bg-blue-400/[0.08] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300">BETA</span>
        {entry?.score != null && (
          <span className="ml-auto text-[11px] font-black text-muted-foreground">Score {entry.score}/100</span>
        )}
      </div>

      <div className="mb-3 flex gap-1 border-b border-white/10 mt-3">
        {(['insights', 'alert'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-[11px] font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              tab === t ? 'text-blue-300 border-blue-400' : 'text-muted-foreground/60 border-transparent hover:text-muted-foreground'
            }`}
          >
            {t === 'insights' ? 'Insights' : `Alertes${alerts.length > 0 ? ` (${alerts.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'insights' && (
        isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded bg-white/[0.04]" />)}
          </div>
        ) : allInsights.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Bot className="h-7 w-7 text-muted-foreground/60" />
            <p className="text-xs font-semibold text-muted-foreground">Aucune analyse disponible</p>
            <p className="text-[11px] text-muted-foreground/60">Générez depuis la section ci-dessus</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allInsights.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-lg border p-2.5 text-left ${
                  item.type === 'strength'
                    ? 'border-emerald-400/15 bg-emerald-400/[0.05]'
                    : 'border-blue-400/15 bg-blue-400/[0.05]'
                }`}
              >
                <Sparkles className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${item.type === 'strength' ? 'text-emerald-400' : 'text-blue-300'}`} />
                <p className="text-[11px] leading-relaxed text-muted-foreground">{item.text}</p>
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
                <p className="text-[11px] text-red-300">{a.body ?? a.title}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export function RightPanel() {
  return <AssistantPanel />
}
