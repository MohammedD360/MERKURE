'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle, ArrowRight, Brain, CheckCircle2, History, Lightbulb, Loader2,
  MessageSquare, Sparkles, Target, Zap, type LucideIcon,
} from 'lucide-react'

import { useAiScore } from '@/lib/hooks/use-kpis'
import { useAiJournal, useGenerateAiAnalysis } from '@/lib/hooks/use-ai-journal'
import { HeadlineKpis } from '@/features/dashboard/components/HeadlineKpis'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function ToolLink({ href, icon: Icon, title, description }: {
  href: string
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {title}
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </Link>
  )
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 30) return `il y a ${days} jours`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function AiHomePage() {
  const { data: score } = useAiScore('30d')
  const { data: entries = [], isLoading: entriesLoading } = useAiJournal()
  const generate = useGenerateAiAnalysis()

  const latest = entries[0] ?? null

  return (
    <div className="space-y-6">

      {/* Les quatre KPI d'entrée, identiques à la vue d'ensemble */}
      <HeadlineKpis
        actions={
          <button
            type="button"
            onClick={() => generate.mutate({})}
            disabled={generate.isPending}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {latest ? 'Actualiser l’analyse' : 'Générer une analyse'}
          </button>
        }
      />

      {/* Recommandations de la dernière analyse */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Recommandations</h3>
              <p className="text-sm text-muted-foreground">
                {latest ? `Analyse du ${new Date(latest.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : 'Aucune analyse disponible'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {score && (
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
                score.score >= 70 ? 'border-green-500/30 bg-green-500/10 text-green-500'
                : score.score >= 45 ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                : 'border-red-500/30 bg-red-500/10 text-red-500',
              )}>
                Score IA {score.score} · {score.label}
              </span>
            )}
          {entries.length > 1 && (
            <Link
              href="/app/ia/history"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <History className="h-4 w-4" />
              Historique
            </Link>
          )}
          </div>
        </div>

        {entriesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : !latest ? (
          <p className="text-sm text-muted-foreground">
            Générez une analyse pour obtenir des points forts, des axes d’amélioration et des actions concrètes,
            calculés sur vos trades récents.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <InsightList
              icon={CheckCircle2}
              tone="text-green-500"
              title="Points forts"
              items={latest.insights?.strengths ?? []}
            />
            <InsightList
              icon={AlertTriangle}
              tone="text-amber-500"
              title="Axes d’amélioration"
              items={latest.insights?.improvements ?? []}
            />
            <InsightList
              icon={Lightbulb}
              tone="text-primary"
              title="Actions prioritaires"
              items={latest.insights?.actions ?? []}
              numbered
            />
          </div>
        )}
      </section>

      {/* Outils de la section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Outils IA</h3>
          <p className="text-sm text-muted-foreground">Chaque outil travaille sur vos trades synchronisés</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ToolLink
            href="/app/ia/strategy-validator"
            icon={Target}
            title="Validateur de stratégie"
            description="Contrôlez les règles, le risque et la cohérence d’un setup avant de le jouer."
          />
          <ToolLink
            href="/app/ia/chat"
            icon={MessageSquare}
            title="Chat IA"
            description="Interrogez votre historique en langage naturel."
          />
          <ToolLink
            href="/app/ia/biais"
            icon={Brain}
            title="Biais comportementaux"
            description="Revenge trading, overtrading, FOMO : ce qui revient dans vos séances."
          />
        </div>
      </section>
    </div>
  )
}

function InsightList({ icon: Icon, tone, title, items, numbered }: {
  icon: LucideIcon
  tone: string
  title: string
  items: string[]
  numbered?: boolean
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              {numbered ? (
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary text-xs font-medium text-primary">
                  {i + 1}
                </span>
              ) : (
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone)} />
              )}
              <span className="text-sm leading-6 text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
