'use client'

import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Zap } from 'lucide-react'
import { useLatestAiAnalysis, useGenerateAiAnalysis } from '@/lib/hooks/use-ai-journal'

function ScoreCircle({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? '#56bf6b' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width="96" height="96" className="absolute">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="z-10 text-center">
        <div className="font-mono text-2xl font-black leading-none text-white">{score}</div>
        <div className="text-[10px] font-semibold text-slate-500">/100</div>
      </div>
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/[0.04] ${className}`} />
}

export function AiAnalysisBanner() {
  const { data: entry, isLoading } = useLatestAiAnalysis()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()

  const score      = entry?.score ?? null
  const strengths  = entry?.insights?.strengths    ?? []
  const improv     = entry?.insights?.improvements ?? []
  const actions    = entry?.insights?.actions      ?? []
  const scoreLabel = score == null ? null : score >= 70 ? 'Bon travail !' : score >= 50 ? 'À consolider' : 'À améliorer'
  const scoreColor = score == null ? '' : score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b111c]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/[0.08]">
            <Sparkles className="h-4 w-4 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Analyse de performance</h3>
              <span className="rounded border border-blue-400/20 bg-blue-400/[0.08] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300">
                BETA
              </span>
            </div>
            {entry && (
              <p className="text-[11px] font-semibold text-slate-500">
                Mise à jour le{' '}
                {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => generate({})}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-[#56bf6b] px-3.5 py-2 text-xs font-black text-white shadow-[0_4px_12px_rgba(86,191,107,0.20)] transition-all hover:bg-[#49ab5e] hover:shadow-[0_6px_16px_rgba(86,191,107,0.26)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Sparkles className="h-5 w-5 text-slate-500" />
            </div>
            <p className="mt-3 text-sm font-semibold text-white">Aucune analyse disponible</p>
            <p className="mt-1.5 max-w-xs text-xs font-medium leading-5 text-slate-500">
              Générez votre première analyse pour obtenir des insights personnalisés sur votre trading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
            {/* Points forts */}
            <div>
              <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">Points forts</p>
              {strengths.length > 0 ? (
                <div className="space-y-2">
                  {strengths.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span className="text-xs font-medium leading-5 text-slate-300">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">—</p>
              )}
            </div>

            {/* Axes d'amélioration */}
            <div>
              <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Axes d&apos;amélioration
              </p>
              {improv.length > 0 ? (
                <div className="space-y-2">
                  {improv.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="text-xs font-medium leading-5 text-slate-300">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">—</p>
              )}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2 sm:items-start xl:items-center">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Score</p>
              {score != null ? (
                <>
                  <ScoreCircle score={score} />
                  {scoreLabel && (
                    <p className={`text-xs font-black ${scoreColor}`}>{scoreLabel}</p>
                  )}
                </>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-2 text-center text-[11px] font-semibold text-slate-500">
                  —
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions prioritaires */}
        {!isLoading && actions.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">Actions prioritaires</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((a: string, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-400/15 text-[9px] font-black text-blue-300">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium leading-5 text-slate-300">{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
