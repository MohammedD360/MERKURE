'use client'

import { AlertTriangle, Bell, CheckCircle2, Loader2, PauseCircle, ShieldCheck, Zap } from 'lucide-react'
import { useGenerateAiAnalysis, useLatestAiAnalysis } from '@/lib/hooks/use-ai-journal'

const guardrails = [
  {
    title: 'Série perdante',
    value: '2 pertes',
    text: 'Réduire automatiquement la taille de position recommandée après deux pertes consécutives.',
    tone:  'border-amber-400/20 bg-amber-400/[0.08] text-amber-300',
  },
  {
    title: 'Risque excessif',
    value: '> 1,5R',
    text: 'Signaler les trades qui dépassent votre cadre de risque habituel.',
    tone:  'border-red-400/20 bg-red-400/[0.08] text-red-300',
  },
  {
    title: 'Fenêtre fragile',
    value: 'Fin de session',
    text: 'Identifier les créneaux horaires où la discipline baisse le plus.',
    tone:  'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
  },
]

export function IaCoachPage() {
  const { data: latest, isLoading } = useLatestAiAnalysis()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()
  const actions = latest?.insights?.actions ?? []

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.08]">
            <Bell className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">Coach de discipline</h1>
              <span className="rounded border border-amber-400/20 bg-amber-400/[0.08] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                Prévention
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
              Le coach transforme vos analyses en garde-fous concrets : pause, réduction du risque, ou rappel de règle avant de forcer un trade.
            </p>
          </div>
        </div>

        <button
          onClick={() => generate({ context: 'Audit discipline et risque de revenge trading' })}
          disabled={isPending}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#56bf6b]/30 bg-[#56bf6b]/[0.10] px-4 py-2 text-xs font-black text-[#56bf6b] transition hover:bg-[#56bf6b]/[0.18] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          Actualiser le coach
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-white/10 bg-background p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/[0.08]">
              <AlertTriangle className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Signal prioritaire</p>
              <p className="mt-1 text-xs text-muted-foreground">Dernière lecture IA disponible</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/[0.06] bg-[#071017] p-5">
            {isLoading ? (
              <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse en cours de lecture...
              </div>
            ) : actions.length > 0 ? (
              <ul className="space-y-3">
                {actions.slice(0, 4).map((action, index) => (
                  <li key={action} className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-[10px] font-black text-amber-300">
                      {index + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
                <PauseCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                Aucune alerte prioritaire. Lancez une nouvelle analyse après votre prochaine session pour alimenter le coach.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-background p-5">
          <p className="text-sm font-black text-white">Cadre recommandé</p>
          <div className="mt-4 space-y-3">
            {['Pause obligatoire après 2 pertes', 'Risque plafonné si drawdown journalier atteint', 'Aucun trade hors setup annoté'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#071017] px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#56bf6b]" />
                <span className="text-xs font-semibold text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {guardrails.map(({ title, value, text, tone }) => (
          <article key={title} className={`rounded-xl border p-4 ${tone}`}>
            <ShieldCheck className="h-5 w-5" />
            <p className="mt-4 text-xs font-black uppercase tracking-wider">{title}</p>
            <p className="mt-1 text-xl font-black text-white">{value}</p>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
