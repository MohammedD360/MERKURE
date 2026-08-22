'use client'

import { useState } from 'react'

import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'
import { AiScoreCard } from './AiScoreCard'
import { BehavioralCard } from './BehavioralCard'
import { AiAnalysisBanner } from './AiAnalysisBanner'

type Tab = 'score' | 'comportements' | 'analyse'

const TABS: Array<{ key: Tab; label: string; hint: string }> = [
  { key: 'score',         label: 'Score',         hint: 'Note globale de votre trading' },
  { key: 'comportements', label: 'Comportements', hint: 'Biais détectés sur vos dernières sessions' },
  { key: 'analyse',       label: 'Analyse',       hint: 'Synthèse rédigée par l’IA, à la demande' },
]

/**
 * Les trois blocs IA réunis dans une seule carte à onglets.
 * Ils occupaient 27 % de la hauteur de la page en étant dispersés, et
 * « Score » et « Analyse » s'appuient sur deux endpoints distincts — les
 * présenter l'un après l'autre évite d'afficher deux notes concurrentes.
 */
export function AiPanel({ period = '30d' }: { period?: KpiPeriod }) {
  const [tab, setTab] = useState<Tab>('score')
  const current = TABS.find(t => t.key === tab)!

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            Intelligence artificielle
          </h3>
          <p className="text-sm text-muted-foreground">{current.hint}</p>
        </div>

        <div role="tablist" aria-label="Vues IA" className="flex flex-wrap items-center gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'h-9 rounded-md px-3 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chaque vue est montée à la demande : pas de requête inutile au chargement */}
      {tab === 'score'         && <AiScoreCard period={period} bare />}
      {tab === 'comportements' && <BehavioralCard period={period} bare />}
      {tab === 'analyse'       && <AiAnalysisBanner bare />}
    </section>
  )
}
