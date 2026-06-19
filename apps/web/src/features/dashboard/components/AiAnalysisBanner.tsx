'use client'

import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Zap } from 'lucide-react'
import { useLatestAiAnalysis, useGenerateAiAnalysis } from '@/lib/hooks/use-ai-journal'

function ScoreCircle({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width="96" height="96" className="absolute">
        <circle cx="48" cy="48" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="z-10 text-center">
        <div className="font-mono text-2xl font-black leading-none text-foreground">{score}</div>
        <div className="text-[10px] font-semibold text-muted-foreground">/100</div>
      </div>
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[hsl(var(--accent))] ${className}`} />
}

export function AiAnalysisBanner() {
  const { data: entry, isLoading } = useLatestAiAnalysis()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()

  const score      = entry?.score ?? null
  const strengths  = entry?.insights?.strengths    ?? []
  const improv     = entry?.insights?.improvements ?? []
  const actions    = entry?.insights?.actions      ?? []
  const scoreLabel = score == null ? null : score >= 70 ? 'Bon travail !' : score >= 50 ? 'À consolider' : 'À améliorer'
  const scoreColor = score == null ? '' : score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.06)]">
            <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-foreground">Analyse de performance</h3>
              <span className="rounded border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.06)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[hsl(var(--primary))]">
                BETA
              </span>
            </div>
            {entry && (
              <p className="text-[11px] font-semibold text-muted-foreground">
                Mise à jour le{' '}
                {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => generate({})}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-[hsl(244_42%_44%)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isPending ? (
            <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Analyse…</>
          ) : (
            <><Zap className="h-3.5 w-3.5" />{entry ? 'Actualiser' : 'Générer'}</>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ) : !entry ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">Aucune analyse disponible</p>
            <p className="mt-1.5 max-w-xs text-xs font-medium leading-5 text-muted-foreground">
              Générez votre première analyse pour obtenir des insights personnalisés sur votre trading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
            {/* Points forts */}
            <div>
              <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Points forts</p>
              {strengths.length > 0 ? (
                <div className="space-y-2">
                  {strengths.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span className="text-xs font-medium leading-5 text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60">—</p>
              )}
            </div>

            {/* Axes d'amélioration */}
            <div>
              <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Axes d&apos;amélioration
              </p>
              {improv.length > 0 ? (
                <div className="space-y-2">
                  {improv.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span className="text-xs font-medium leading-5 text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60">—</p>
              )}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2 sm:items-start xl:items-center">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Score</p>
              {score != null ? (
                <>
                  <ScoreCircle score={score} />
                  {scoreLabel && (
                    <p className={`text-xs font-black ${scoreColor}`}>{scoreLabel}</p>
                  )}
                </>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-2 text-center text-[11px] font-semibold text-muted-foreground">
                  —
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions prioritaires */}
        {!isLoading && actions.length > 0 && (
          <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Actions prioritaires</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((a: string, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-3 py-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[9px] font-black text-[hsl(var(--primary))]">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium leading-5 text-muted-foreground">{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
