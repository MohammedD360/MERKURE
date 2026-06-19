'use client'

import {
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  LineChart,
  Loader2,
  PlaySquare,
  ShieldCheck,
  Share2,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  X,
} from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAiJournal, useGenerateAiAnalysis } from '@/lib/hooks/use-ai-journal'

const purple = 'hsl(var(--primary))'
const green = '#16a34a'
const blue = '#2563eb'

type Tone = 'purple' | 'green' | 'blue' | 'red' | 'amber'

function toneClass(tone: Tone) {
  return {
    purple: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] border-[hsl(var(--primary)/0.16)]',
    green:  'text-emerald-600 bg-emerald-50 border-emerald-200',
    blue:   'text-blue-600 bg-blue-50 border-blue-200',
    red:    'text-red-600 bg-red-50 border-red-200',
    amber:  'text-amber-600 bg-amber-50 border-amber-200',
  }[tone]
}

function formatReportDate(date?: string) {
  const d = date ? new Date(date) : new Date('2026-06-16T12:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-white p-5 shadow-sm', className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[hsl(var(--primary)/0.16)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
          {icon}
        </div>
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[hsl(var(--primary))]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function ScoreRing({
  value,
  size = 132,
  stroke = 13,
  color = purple,
  label,
  sublabel,
  delta,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  label?: string
  sublabel?: string
  delta?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(value, 100)) / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={cn('font-mono font-black leading-none text-foreground', size > 150 ? 'text-6xl' : 'text-3xl')}>
            {value}<span className={cn('font-medium text-muted-foreground', size > 150 ? 'text-xl' : 'text-sm')}>/100</span>
          </div>
          {label && <p className="mt-2 text-sm font-bold text-[hsl(var(--primary))]">{label}</p>}
          {sublabel && <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{sublabel}</p>}
        </div>
      </div>
      {delta && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          {delta}
        </div>
      )}
    </div>
  )
}

function SmallScore({
  icon,
  label,
  value,
  delta,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  delta: string
  color: string
}) {
  return (
    <div className="flex min-w-[120px] flex-col items-center">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
        {icon}
        {label}
      </div>
      <ScoreRing value={value} size={92} stroke={7} color={color} />
      <p className="mt-1 text-[11px] font-bold text-emerald-600">{delta}</p>
    </div>
  )
}

function AiPortrait() {
  return (
    <div className="relative flex min-h-[210px] items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_50%_32%,hsl(var(--primary)/0.20),transparent_36%),linear-gradient(180deg,#fff,rgba(246,247,249,0.8))]">
      <div className="absolute inset-x-0 bottom-0 h-24 opacity-60 [background-image:radial-gradient(circle,hsl(var(--primary)/0.30)_1px,transparent_1px)] [background-size:13px_13px] [mask-image:linear-gradient(to_top,black,transparent)]" />
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.16)] bg-white/80 shadow-[0_20px_70px_hsl(var(--primary)/0.18)]">
        <div className="absolute inset-3 rounded-full border border-[hsl(var(--primary)/0.20)]" />
        <Brain className="h-12 w-12 text-[hsl(var(--primary))]" />
        <span className="absolute -right-2 top-5 rounded-full bg-[hsl(var(--primary))] px-2 py-1 text-[10px] font-black text-white">
          IA
        </span>
      </div>
    </div>
  )
}

const timeline = [
  { day: 'Lundi',    pnl: '+2.10R', trades: '6 trades', rate: 'Win rate 67%', tone: 'green' as Tone, note: null },
  { day: 'Mardi',    pnl: '+1.40R', trades: '5 trades', rate: 'Win rate 60%', tone: 'green' as Tone, note: null },
  { day: 'Mercredi', pnl: '-1.80R', trades: '7 trades', rate: 'Win rate 29%', tone: 'red' as Tone, note: 'Revenge trade détecté' },
  { day: 'Jeudi',    pnl: '+2.60R', trades: '4 trades', rate: 'Win rate 75%', tone: 'green' as Tone, note: 'Discipline parfaite' },
  { day: 'Vendredi', pnl: '+3.20R', trades: '3 trades', rate: 'Win rate 100%', tone: 'green' as Tone, note: 'Meilleure journée' },
]

const psychology = [
  { label: 'Confiance',   value: 82, tone: 'green' as Tone },
  { label: 'Stress',      value: 35, tone: 'purple' as Tone },
  { label: 'Patience',    value: 90, tone: 'green' as Tone },
  { label: 'Impulsivité', value: 20, tone: 'purple' as Tone },
]

const profitable = [
  ['Respect du plan', '+420€'],
  ['Trades sur Londres uniquement', '+310€'],
  ['Gestion du risque constante', '+180€'],
  ['Attente des confirmations', '+160€'],
  ['Sorties selon le plan', '+130€'],
]

const costly = [
  ['Revenge Trade', '-180€'],
  ['Trades en session Asiatique', '-240€'],
  ['Entrées prématurées', '-90€'],
  ['Déplacement du stop', '-120€'],
  ['Overtrading', '-80€'],
]

const actions = [
  ['Éviter la session Asiatique', '+240€'],
  ['Attendre 20 min après une perte', '+180€'],
  ['Confirmation H1 obligatoire', '+180€'],
  ['Maximum 3 trades par jour', '+110€'],
]

export function IaRapportPage() {
  const { data: entries, isLoading } = useAiJournal()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()
  const latest = entries?.[0]
  const score = latest?.score ?? 84

  const insights = useMemo(() => {
    const strengths = latest?.insights?.strengths ?? []
    const improvements = latest?.insights?.improvements ?? []
    return [
      strengths[0] ?? 'Cette semaine marque une amélioration importante de ta discipline.',
      strengths[1] ?? 'Tu as réduit de 73% les trades impulsifs par rapport à la semaine dernière.',
      strengths[2] ?? 'Tes performances sont désormais principalement générées pendant la session Londres.',
      improvements[0] ?? "Cependant l'IA détecte encore une faiblesse récurrente : les trades ouverts après une perte.",
    ]
  }, [latest])

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">Rapport de Performance IA</h1>
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Votre analyse complète de la semaine par l’intelligence artificielle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-bold text-foreground shadow-sm"
            >
              09 Juin - 16 Juin 2026
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-[hsl(var(--accent))]"
            >
              <Download className="h-4 w-4" />
              Exporter le rapport
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[hsl(244_42%_44%)]"
            >
              <Share2 className="h-4 w-4" />
              Partager
            </button>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="grid items-center gap-8 xl:grid-cols-[1.1fr_1fr_2.2fr]">
            <div>
              <span className="inline-flex rounded-md border border-[hsl(var(--primary)/0.14)] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[hsl(var(--primary))]">
                Rapport hebdomadaire
              </span>
              <h2 className="mt-5 text-3xl font-black text-foreground">{formatReportDate(latest?.date)}</h2>
              <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-muted-foreground">
                Voici votre analyse de performance de la semaine. Découvrez vos forces,
                vos axes d’amélioration et notre plan d’action personnalisé.
              </p>
              <button
                type="button"
                onClick={() => generate({})}
                disabled={isPending}
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-[hsl(var(--primary)/0.25)] bg-white px-4 py-2.5 text-xs font-black text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)/0.06)] disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlaySquare className="h-4 w-4" />}
                {isPending ? 'Génération du rapport...' : 'Voir la vidéo récapitulative'}
              </button>
            </div>

            <ScoreRing
              value={score}
              size={210}
              stroke={16}
              label={score >= 80 ? 'Excellent' : score >= 65 ? 'Solide' : 'À renforcer'}
              delta="+12 points vs semaine précédente"
            />

            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <SmallScore icon={<Target className="h-4 w-4" />} label="Discipline" value={86} delta="+15" color={green} />
              <SmallScore icon={<ShieldCheck className="h-4 w-4" />} label="Gestion du risque" value={78} delta="+8" color={purple} />
              <SmallScore icon={<Brain className="h-4 w-4" />} label="Psychologie" value={81} delta="+10" color={blue} />
              <SmallScore icon={<Zap className="h-4 w-4" />} label="Exécution" value={88} delta="+14" color={purple} />
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.15fr]">
          <SectionCard title="Ce que l’IA a compris de toi cette semaine" icon={<Brain className="h-4 w-4" />}>
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <AiPortrait />
              <div className="space-y-4">
                {insights.map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', index === 3 ? toneClass('amber') : toneClass(index === 0 ? 'green' : 'purple'))}>
                      {index === 3 ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </div>
                    <p className="text-sm font-medium leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Timeline de ta semaine" icon={<Calendar className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-5">
              {timeline.map((day) => (
                <div key={day.day} className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground">{day.day}</p>
                  <div className={cn('mx-auto mt-4 flex h-8 w-8 items-center justify-center rounded-full border', toneClass(day.tone))}>
                    {day.tone === 'red' ? <X className="h-4 w-4" /> : day.note?.includes('Meilleure') ? <Trophy className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </div>
                  <p className={cn('mt-4 font-mono text-lg font-black', day.tone === 'red' ? 'text-red-600' : 'text-emerald-600')}>
                    {day.pnl}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">{day.trades}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{day.rate}</p>
                  {day.note && (
                    <div className={cn('mt-4 rounded-md border px-2 py-2 text-[11px] font-bold', toneClass(day.tone))}>
                      {day.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <SectionCard title="Psychologie du trader" icon={<LineChart className="h-4 w-4" />}>
            <div className="space-y-4">
              {psychology.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{item.label}</span>
                    <span className="font-mono text-sm font-bold text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--accent))]">
                    <div
                      className={cn('h-full rounded-full', item.tone === 'green' ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]')}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-[#f8fafc] p-3">
                <p className="text-xs font-bold text-muted-foreground">Profil détecté</p>
                <p className="mt-1 text-sm font-medium leading-6 text-foreground">
                  Trader discipliné avec excès de confiance après deux gains consécutifs.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Les comportements rentables" icon={<CheckCircle2 className="h-4 w-4" />}>
            <MoneyRows rows={profitable} positive footerLabel="Total contribué" footer="+1,200€" />
          </SectionCard>

          <SectionCard title="Les comportements coûteux" icon={<CircleAlert className="h-4 w-4" />}>
            <MoneyRows rows={costly} positive={false} footerLabel="Total coûté" footer="-710€" />
          </SectionCard>

          <SectionCard title="Et si tu avais suivi nos recommandations ?" icon={<Clock3 className="h-4 w-4" />}>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Résultat réel</p>
                <p className="mt-2 font-mono text-2xl font-black text-[hsl(var(--primary))]">+1,240€</p>
              </div>
              <span className="text-xs font-bold text-muted-foreground">vs</span>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Résultat optimisé</p>
                <p className="mt-2 font-mono text-2xl font-black text-[hsl(var(--primary))]">+1,930€</p>
              </div>
            </div>
            <div className="mt-6 flex h-32 items-end justify-center gap-8 border-b border-dashed border-[hsl(var(--primary)/0.25)]">
              <div className="w-14 rounded-t bg-[hsl(var(--primary)/0.78)]" style={{ height: '54%' }} />
              <div className="w-14 rounded-t bg-[hsl(var(--primary))]" style={{ height: '90%' }} />
            </div>
            <div className="mt-4 rounded-lg border border-[hsl(var(--primary)/0.16)] bg-[hsl(var(--primary)/0.06)] p-3 text-center">
              <p className="font-mono text-xl font-black text-[hsl(var(--primary))]">+690€</p>
              <p className="text-xs font-semibold text-[hsl(var(--primary))]">de gains manqués</p>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr_1.05fr]">
          <SectionCard title="Plan d’action IA - semaine prochaine" icon={<Target className="h-4 w-4" />}>
            <div className="grid gap-4 md:grid-cols-4">
              {actions.map(([title, impact], index) => (
                <div key={title} className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-xs font-black text-[hsl(var(--primary))]">
                      {index + 1}
                    </span>
                    {index < actions.length - 1 && <span className="hidden h-px flex-1 border-t border-dashed border-[hsl(var(--primary)/0.28)] md:block" />}
                  </div>
                  <div className="rounded-lg border border-border bg-[#f8fafc] p-3">
                    <p className="text-sm font-black leading-5 text-foreground">{title}</p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">Impact estimé : {impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Évolution de vos rapports IA" icon={<BarChart3 className="h-4 w-4" />}>
            <svg viewBox="0 0 360 160" className="h-40 w-full" aria-hidden="true">
              <defs>
                <linearGradient id="reportLineGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="hsl(var(--primary))" stopOpacity="0.18" />
                  <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M28 122 L110 101 L194 83 L304 58 L304 142 L28 142 Z" fill="url(#reportLineGradient)" />
              <path d="M28 122 L110 101 L194 83 L304 58" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
              {[
                ['S19', '68/100', 28, 122],
                ['S20', '72/100', 110, 101],
                ['S21', '76/100', 194, 83],
                ['S22', '84/100', 304, 58],
              ].map(([week, value, x, y]) => (
                <g key={week}>
                  <circle cx={Number(x)} cy={Number(y)} r="5" fill="hsl(var(--primary))" />
                  <text x={Number(x)} y={Number(y) - 20} textAnchor="middle" className="fill-foreground text-[12px] font-bold">{week}</text>
                  <text x={Number(x)} y={Number(y) - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">{value}</text>
                </g>
              ))}
            </svg>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              Progression constante sur 4 semaines
            </p>
          </SectionCard>

          <SectionCard title="Verdict IA" icon={<Trophy className="h-4 w-4" />}>
            <p className="text-sm font-medium leading-7 text-muted-foreground">
              Tu es actuellement dans ta meilleure phase de progression depuis 3 mois.
              Si tu élimines les trades de session asiatique, ton score pourrait atteindre
              <span className="font-black text-foreground"> 91/100 </span>
              dès la semaine prochaine.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">Niveau actuel</p>
                <p className="mt-1 text-sm font-black text-foreground">Trader Intermédiaire Confirmé</p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.08)] p-4">
                <p className="text-xs font-bold text-[hsl(var(--primary))]">Objectif suivant</p>
                <p className="mt-1 text-sm font-black text-foreground">Trader Consistant</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-border bg-white p-4 text-sm font-semibold text-muted-foreground shadow-sm">
            Chargement de vos derniers rapports IA...
          </div>
        )}
      </div>
    </div>
  )
}

function MoneyRows({
  rows,
  positive,
  footerLabel,
  footer,
}: {
  rows: string[][]
  positive: boolean
  footerLabel: string
  footer: string
}) {
  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground">
            {positive ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <X className="h-4 w-4 shrink-0 text-red-600" />}
            <span className="truncate">{label}</span>
          </span>
          <span className={cn('font-mono text-sm font-black', positive ? 'text-emerald-600' : 'text-red-600')}>
            {value}
          </span>
        </div>
      ))}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-[#f8fafc] px-3 py-3">
        <span className="text-sm font-black text-foreground">{footerLabel}</span>
        <span className={cn('font-mono text-sm font-black', positive ? 'text-emerald-600' : 'text-red-600')}>
          {footer}
        </span>
      </div>
    </div>
  )
}
