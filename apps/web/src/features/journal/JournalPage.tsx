'use client'

import { useState } from 'react'
import { Bot, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react'
import { useAiJournal, useAiAnalyze } from '@/lib/hooks/use-ai-journal'
import type { AiJournalEntry } from '@/lib/api-client'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function scoreColor(score: number): string {
  if (score >= 70) return '#38e476'
  if (score >= 45) return '#fbbf24'
  return '#ff5e70'
}

function ScoreArc({ score }: { score: number | null }) {
  const safeScore = score == null ? 0 : Math.max(0, Math.min(score, 100))
  const radius = 28
  const cx = 36
  const cy = 38
  const startAngle = 200
  const endAngle = 340
  const totalArc = endAngle

  function polarToXY(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  function describeArc(startDeg: number, endDeg: number, r: number) {
    const start = polarToXY(startDeg, r)
    const end = polarToXY(endDeg, r)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  const arcStart = 200
  const arcEnd = 200 + (safeScore / 100) * 140
  const color = scoreColor(safeScore)

  return (
    <svg width="72" height="66" viewBox="0 0 72 66" className="shrink-0">
      <path
        d={describeArc(200, 340, radius)}
        fill="none"
        stroke="#1d2b44"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {safeScore > 0 && (
        <path
          d={describeArc(arcStart, arcEnd, radius)}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fontFamily="ui-monospace, monospace" fill={score == null ? '#475569' : color}>
        {score == null ? '—' : score}
      </text>
    </svg>
  )
}

function AccordionSection({
  title,
  items,
  accentColor,
}: {
  title: string
  items: string[]
  accentColor: string
}) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <div className="border-t border-[#1e2f4a]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        )}
      </button>
      {open && (
        <ul className="space-y-2 px-5 pb-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function JournalEntryCard({ entry }: { entry: AiJournalEntry }) {
  const strengths    = entry.insights?.strengths    ?? []
  const improvements = entry.insights?.improvements ?? []
  const actions      = entry.insights?.actions      ?? []
  const hasInsights  = strengths.length > 0 || improvements.length > 0 || actions.length > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e2f4a] bg-[#0b1527] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-4 p-5">
        <ScoreArc score={entry.score} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {formatDateFr(entry.date)}
          </p>
          {entry.score != null && (
            <p className="mt-0.5 text-xs font-medium" style={{ color: scoreColor(entry.score) }}>
              Score {entry.score}/100
            </p>
          )}
        </div>
      </div>

      {entry.aiAnalysis ? (
        <p className="px-5 pb-5 text-sm leading-relaxed text-slate-300">{entry.aiAnalysis}</p>
      ) : (
        <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-2 text-center">
          <Bot className="h-8 w-8 text-slate-600" />
          <p className="text-xs text-slate-500">Aucune analyse. Cliquez sur "Analyser aujourd'hui".</p>
        </div>
      )}

      {hasInsights && (
        <div>
          <AccordionSection title="Points forts ✓" items={strengths}    accentColor="#38e476" />
          <AccordionSection title="Axes d'amélioration" items={improvements} accentColor="#fbbf24" />
          <AccordionSection title="Actions pour demain" items={actions}   accentColor="#18c7ff" />
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-5">
      <div className="flex items-center gap-4">
        <div className="h-[66px] w-[72px] animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-36 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </div>
  )
}

function EmptyState({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#1e2f4a] bg-[#0b1527] px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1e2f4a] bg-[#07101f]">
        <Bot className="h-7 w-7 text-[#7c5cff]" />
      </div>
      <div>
        <p className="text-base font-bold text-white">Aucune analyse encore</p>
        <p className="mt-1 text-sm text-slate-500">
          Cliquez sur "Analyser aujourd'hui" pour démarrer
        </p>
      </div>
      <button
        type="button"
        onClick={onAnalyze}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#7c5cff]/40 bg-[#7c5cff]/15 px-5 py-2.5 text-sm font-semibold text-[#b9a8ff] transition-colors hover:bg-[#7c5cff]/25"
      >
        <Sparkles className="h-4 w-4" />
        Analyser aujourd'hui
      </button>
    </div>
  )
}

function AnalyzePanel({ onClose }: { onClose: () => void }) {
  const [date, setDate]       = useState(getTodayDate())
  const [context, setContext] = useState('')
  const mutation              = useAiAnalyze()

  function handleSubmit() {
    const trimmed = context.trim()
    mutation.mutate(
      trimmed ? { date, context: trimmed } : { date },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="rounded-2xl border border-[#7c5cff]/30 bg-[#0b1527] p-5 shadow-[0_0_0_1px_rgba(124,92,255,0.08),0_18px_60px_rgba(0,0,0,0.22)]">
      <p className="mb-4 text-sm font-bold text-white">Nouvelle analyse IA</p>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[#1e2f4a] bg-[#07101f] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-[#7c5cff]/50 [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Contexte <span className="text-slate-600">(optionnel)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            placeholder="Ex : J'ai tradé sur une news, j'étais stressé…"
            className="w-full resize-none rounded-xl border border-[#1e2f4a] bg-[#07101f] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-[#7c5cff]/50"
          />
        </div>
      </div>

      {mutation.isError && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#18c7ff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(124,92,255,0.28)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              L'IA analyse vos trades…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Générer l'analyse
            </>
          )}
        </button>

        {!mutation.isPending && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1e2f4a] px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  )
}

export function JournalPage() {
  const [showPanel, setShowPanel] = useState(false)
  const { data: entries, isLoading } = useAiJournal()

  return (
    <div className="space-y-5 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-t border-[#1b2a42] pt-4">
        <div>
          <h1 className="text-lg font-black text-white">Journal IA</h1>
          <p className="mt-0.5 text-xs text-slate-500">Analyse quotidienne de vos trades par l'IA</p>
        </div>

        {!showPanel && (
          <button
            type="button"
            onClick={() => setShowPanel(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#7c5cff]/40 bg-[#7c5cff]/15 px-4 py-2.5 text-sm font-semibold text-[#b9a8ff] transition-colors hover:bg-[#7c5cff]/25"
          >
            <Sparkles className="h-4 w-4" />
            Analyser aujourd'hui
          </button>
        )}
      </div>

      {showPanel && (
        <AnalyzePanel onClose={() => setShowPanel(false)} />
      )}

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !entries || entries.length === 0 ? (
        <EmptyState onAnalyze={() => setShowPanel(true)} />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
