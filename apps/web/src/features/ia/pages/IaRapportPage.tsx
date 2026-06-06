'use client'

import { FileText, Loader2, Sparkles, Zap } from 'lucide-react'
import { useAiJournal, useGenerateAiAnalysis } from '@/lib/hooks/use-ai-journal'

export function IaRapportPage() {
  const { data: entries, isLoading } = useAiJournal()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.08]">
            <FileText className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">Rapport narratif</h1>
              <span className="rounded border border-blue-400/20 bg-blue-400/[0.08] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300">
                Hebdomadaire
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Un rapport rédigé chaque semaine : causes des pertes + 3 actions concrètes.
            </p>
          </div>
        </div>

        <button
          onClick={() => generate({})}
          disabled={isPending}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-[#56bf6b]/30 bg-[#56bf6b]/[0.10] px-4 py-2 text-xs font-black text-[#56bf6b] transition hover:bg-[#56bf6b]/[0.18] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          {isPending ? 'Génération…' : 'Générer'}
        </button>
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry) => {
            const color = !entry.score ? 'text-muted-foreground' : entry.score >= 70 ? 'text-emerald-400' : entry.score >= 50 ? 'text-amber-400' : 'text-red-400'
            const strengths = entry.insights?.strengths ?? []
            const improvements = entry.insights?.improvements ?? []
            const actions = entry.insights?.actions ?? []

            return (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-background p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">
                    {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  {entry.score != null && (
                    <span className={`text-sm font-black ${color}`}>{entry.score}/100</span>
                  )}
                </div>

                {entry.aiAnalysis && (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{entry.aiAnalysis}</p>
                )}

                {(strengths.length > 0 || improvements.length > 0 || actions.length > 0) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {strengths.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">Points forts</p>
                        <ul className="space-y-1">
                          {strengths.map((s, i) => (
                            <li key={i} className="text-[11px] leading-4 text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {improvements.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">À améliorer</p>
                        <ul className="space-y-1">
                          {improvements.map((s, i) => (
                            <li key={i} className="text-[11px] leading-4 text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {actions.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-blue-300">Actions</p>
                        <ul className="space-y-1">
                          {actions.map((s, i) => (
                            <li key={i} className="text-[11px] leading-4 text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-background py-16 text-center">
          <Sparkles className="h-7 w-7 text-muted-foreground/60" />
          <p className="text-sm font-black text-muted-foreground">Aucun rapport disponible</p>
          <p className="text-xs text-muted-foreground">
            Clique sur "Générer" pour créer ton premier rapport IA.
          </p>
        </div>
      )}
    </div>
  )
}
