'use client'

import { useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock3,
  FileUp,
  Gauge,
  ListChecks,
  Loader2,
  Scale,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useAnalyzeStrategy,
  useStrategyHistory,
  type AdviceItem as AdviceItemType,
  type ControlCheck,
  type StrategyAnalysisResult,
} from '@/lib/hooks/use-strategy-validator'

type Tone = 'purple' | 'green' | 'amber' | 'red' | 'blue' | 'slate'

const toneStyles: Record<Tone, string> = {
  purple: 'border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  green:  'border-green-500/30 bg-green-500/10 text-green-400',
  amber:  'border-amber-500/30 bg-amber-500/10 text-amber-400',
  red:    'border-red-500/30 bg-red-500/10 text-red-400',
  blue:   'border-blue-500/30 bg-blue-500/10 text-blue-400',
  slate:  'border-border bg-accent text-muted-foreground',
}

const toneBars: Record<Tone, string> = {
  purple: 'bg-[hsl(var(--primary))]',
  green:  'bg-emerald-500',
  amber:  'bg-amber-500',
  red:    'bg-red-500',
  blue:   'bg-blue-500',
  slate:  'bg-slate-400',
}

type VerdictTone = 'green' | 'amber' | 'red'

function toneForScore(value: number): Tone {
  if (value >= 75) return 'green'
  if (value >= 50) return 'amber'
  return 'red'
}

function verdictCopy(verdict: 'enter' | 'wait' | 'avoid'): { label: string; tone: VerdictTone; Icon: LucideIcon } {
  if (verdict === 'enter') return { label: 'Entrer', tone: 'green', Icon: CheckCircle2 }
  if (verdict === 'wait')  return { label: 'Attendre', tone: 'amber', Icon: Clock3 }
  return { label: 'Éviter', tone: 'red', Icon: XCircle }
}

const VERDICT_PALETTE: Record<VerdictTone, { bg: string; border: string; text: string; track: string }> = {
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', track: '#10b981' },
  amber: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   track: '#f59e0b' },
  red:   { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     track: '#ef4444' },
}

function Badge({ children, tone = 'purple' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold', toneStyles[tone])}>
      {children}
    </span>
  )
}

function SectionCard({
  title, icon: Icon, children, className,
}: { title: string; icon: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-border bg-background p-5 shadow-sm', className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--primary)/0.16)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-xs font-medium text-[hsl(var(--primary))]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ScoreCircle({ value, size = 144 }: { value: number; size?: number }) {
  const stroke = size >= 130 ? 12 : 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const tone = toneForScore(value)
  const strokeColor = tone === 'green' ? '#10b981' : tone === 'amber' ? '#f59e0b' : '#ef4444'
  const label = tone === 'green' ? 'Solide' : tone === 'amber' ? 'À confirmer' : 'Faible'

  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--accent))" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={strokeColor}
          strokeLinecap="round" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('tabular-nums font-semibold leading-none text-foreground', size >= 130 ? 'text-5xl' : 'text-2xl')}>{value}</span>
        <span className="mt-1 text-xs font-bold text-muted-foreground">/100</span>
        {size >= 130 && (
          <span className={cn('mt-2 text-xs font-semibold', tone === 'green' ? 'text-green-500' : tone === 'amber' ? 'text-amber-500' : 'text-red-500')}>{label}</span>
        )}
      </div>
    </div>
  )
}

function VerdictHero({ result, verdict }: { result: StrategyAnalysisResult; verdict: { label: string; tone: VerdictTone; Icon: LucideIcon } }) {
  const palette = VERDICT_PALETTE[verdict.tone]
  const { Icon } = verdict

  return (
    <div className={cn('rounded-2xl border p-6 sm:p-8', palette.bg, palette.border)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className={cn('inline-flex items-center gap-2 text-xs font-medium', palette.text)}>
            <Icon className="h-4 w-4" />
            Verdict de l&apos;IA
          </div>
          <h2 className={cn('font-primary mt-1 text-4xl leading-none sm:text-[3.25rem]', palette.text)}>{verdict.label}</h2>
          <p className="mt-3 max-w-xl text-sm font-semibold text-foreground">{result.headline}</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-foreground/75">{result.decision.explanation}</p>
        </div>
        <div className="flex shrink-0 items-center justify-center self-center sm:self-auto">
          <ScoreCircle value={result.score} size={108} />
        </div>
      </div>
    </div>
  )
}

function StatStrip({ items }: { items: { label: string; value: string; helper: string }[] }) {
  return (
    <div className="grid divide-y divide-border rounded-xl border border-border bg-background sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1.5 truncate tabular-nums text-xl font-semibold text-foreground">{item.value}</p>
          <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">{item.helper}</p>
        </div>
      ))}
    </div>
  )
}

function TextField({
  label, placeholder, value, onChange, readOnly, type = 'text',
}: { label: string; placeholder: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        className={cn(
          'h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-[hsl(var(--primary)/0.45)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.08)]',
          readOnly && 'bg-accent text-muted-foreground',
        )}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  )
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <select
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-[hsl(var(--primary)/0.45)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.08)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function ControlItem({ title, description, status }: ControlCheck) {
  const config = {
    valid:   { icon: Check,         tone: 'green' as Tone, titleClass: 'text-green-400' },
    warning: { icon: AlertTriangle, tone: 'amber' as Tone, titleClass: 'text-amber-800' },
    error:   { icon: XCircle,       tone: 'red'   as Tone, titleClass: 'text-red-800' },
  }[status]
  const Icon = config.icon

  return (
    <div className={cn('flex gap-3 rounded-xl border p-3', toneStyles[config.tone])}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={cn('text-sm font-semibold', config.titleClass)}>{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ValidControlRow({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
      {title}
    </div>
  )
}

function CriteriaRow({ label, value }: { label: string; value: number }) {
  const tone = toneForScore(value)
  return (
    <div className="grid grid-cols-[130px_1fr_42px] items-center gap-3 sm:grid-cols-[170px_1fr_42px]">
      <span className="min-w-0 text-xs font-bold text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-accent">
        <div className={cn('h-full rounded-full', toneBars[tone])} style={{ width: `${value}%` }} />
      </div>
      <span className={cn('tabular-nums text-sm font-semibold', tone === 'red' ? 'text-red-500' : tone === 'amber' ? 'text-amber-500' : 'text-green-500')}>
        {value}
      </span>
    </div>
  )
}

function AdviceRow({ index, title, text, impact }: { index: number } & AdviceItemType) {
  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-xs font-semibold text-[hsl(var(--primary))]">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <Badge tone="green">{impact}</Badge>
        </div>
        <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function HistoryRow({ instrument, direction, timeframe, style, score, createdAt }: {
  instrument: string; direction: string; timeframe: string; style: string; score: number; createdAt: string
}) {
  const tone = toneForScore(score)
  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center">
      <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-accent">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{instrument} · {direction} · {timeframe}</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          {new Date(createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {style}
        </p>
      </div>
      <Badge tone={tone}>Score {score}</Badge>
    </div>
  )
}

const CRITERIA_LABELS = ['Structure de marché', "Zone d'entrée", 'Stop Loss', 'Take Profit', 'Confluences', 'Timing / Session', 'Risk reward']

export function IaStrategyValidatorPage() {
  const [instrument, setInstrument] = useState('EURUSD')
  const [timeframe, setTimeframe]   = useState('H1 - 1 heure')
  const [direction, setDirection]   = useState('Long (achat)')
  const [style, setStyle]           = useState('Price Action')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss]     = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [thesis, setThesis]         = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyze = useAnalyzeStrategy()
  const history = useStrategyHistory(10)
  const [result, setResult] = useState<StrategyAnalysisResult | null>(null)

  const rr = (() => {
    const e = Number(entryPrice), s = Number(stopLoss), t = Number(takeProfit)
    if (!e || !s || !t || e === s) return null
    return Number((Math.abs(t - e) / Math.abs(e - s)).toFixed(2))
  })()

  function handleFile(file: File | null) {
    if (!file) { setImageBase64(null); setImagePreview(null); return }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setImageBase64(dataUrl)
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function handleAnalyze() {
    const res = await analyze.mutateAsync({
      instrument, timeframe, direction, style,
      ...(entryPrice ? { entryPrice: Number(entryPrice) } : {}),
      ...(stopLoss   ? { stopLoss: Number(stopLoss) }     : {}),
      ...(takeProfit ? { takeProfit: Number(takeProfit) } : {}),
      ...(thesis ? { thesis } : {}),
      ...(imageBase64 ? { imageBase64 } : {}),
    })
    setResult(res)
  }

  const verdict = result ? verdictCopy(result.decision.verdict) : null

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Validateur de stratégie</h1>
          <Badge tone="purple"><Sparkles className="h-3.5 w-3.5" />Analyse IA</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
          Déposez votre analyse technique, renseignez le plan de trade et obtenez une validation avant exécution.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
        <SectionCard title="Déposer l'analyse" icon={UploadCloud}>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--primary)/0.32)] bg-[hsl(var(--primary)/0.04)] px-5 py-8 text-center transition hover:bg-[hsl(var(--primary)/0.08)]">
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.2)] bg-background text-[hsl(var(--primary))] shadow-sm">
                <FileUp className="h-6 w-6" />
              </span>
              <span className="mt-4 text-sm font-semibold text-foreground">Glissez votre screenshot ici</span>
              <span className="mt-2 max-w-[260px] text-xs font-semibold leading-5 text-muted-foreground">
                TradingView, MT4, MT5 ou capture mobile. JPG, PNG, WEBP.
              </span>
              <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-white shadow-sm">
                <UploadCloud className="h-4 w-4" />
                Choisir un fichier
              </span>
            </label>

            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Screenshot du setup" className="max-h-[260px] w-full object-contain bg-black/5" />
                  <button
                    type="button"
                    onClick={() => { handleFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex min-h-[212px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-accent/40 p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    Sans screenshot, l&apos;IA analyse uniquement les paramètres du setup ci-contre.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Paramètres du setup" icon={Settings2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Instrument" placeholder="ex : EURUSD" value={instrument} onChange={setInstrument} />
            <SelectField label="Unité de temps" value={timeframe} onChange={setTimeframe} options={['H1 - 1 heure', 'H4 - 4 heures', 'D1 - Daily', 'M15 - 15 minutes']} />
            <SelectField label="Direction" value={direction} onChange={setDirection} options={['Long (achat)', 'Short (vente)']} />
            <SelectField label="Style de trading" value={style} onChange={setStyle} options={['Price Action', 'Smart Money / ICT', 'Breakout', 'Indicateurs']} />
            <TextField label="Point d'entrée" placeholder="ex : 1.08420" value={entryPrice} onChange={setEntryPrice} type="number" />
            <TextField label="Stop Loss" placeholder="ex : 1.08150" value={stopLoss} onChange={setStopLoss} type="number" />
            <TextField label="Take Profit" placeholder="ex : 1.09200" value={takeProfit} onChange={setTakeProfit} type="number" />
            <TextField label="R:R calculé" placeholder="Auto-calculé" value={rr != null ? String(rr) : ''} readOnly />
          </div>
          <label className="mt-4 grid gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">Thèse de trading</span>
            <textarea
              className="min-h-[92px] resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold leading-6 text-foreground outline-none transition focus:border-[hsl(var(--primary)/0.45)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.08)]"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Décrivez votre lecture du marché et la logique de l'entrée..."
            />
          </label>
          {analyze.isError && (
            <p className="mt-3 text-xs font-bold text-red-500">
              L&apos;analyse a échoué. Réessaie dans un instant.
            </p>
          )}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyze.isPending || !instrument.trim()}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(var(--primary)/0.9)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyze.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" />Analyse en cours...</>
              : <><BrainCircuit className="h-4 w-4" />Analyser ce setup</>}
          </button>
        </SectionCard>
      </section>

      {!result ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-accent/30 px-6 py-14 text-center">
          <Gauge className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">Aucune analyse pour l&apos;instant</p>
          <p className="max-w-md text-xs font-semibold text-muted-foreground">
            Renseigne les paramètres de ton setup ci-dessus (et idéalement un screenshot) puis clique sur &laquo;&nbsp;Analyser ce setup&nbsp;&raquo;.
          </p>
        </div>
      ) : (
        <>
          {verdict && <VerdictHero result={result} verdict={verdict} />}

          <StatStrip
            items={[
              {
                label: 'Risk / Reward',
                value: result.riskReward != null ? String(result.riskReward) : '—',
                helper: result.riskReward != null && result.riskReward >= 2 ? 'Ratio favorable' : 'Ratio à surveiller',
              },
              {
                label: 'Confiance IA',
                value: `${result.confidencePct}%`,
                helper: result.confidencePct >= 70 ? 'Analyse fiable' : 'Données limitées',
              },
              {
                label: 'Timing / Session',
                value: result.timingAssessment,
                helper: `Analysé à ${new Date(result.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
              },
            ]}
          />

          <section className="rounded-xl border border-border bg-background p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
              <p className="text-xs font-medium text-[hsl(var(--primary))]">Lecture technique</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-foreground/85">{result.aiReading}</p>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <SectionCard title="Points de contrôle" icon={ListChecks}>
              <div className="space-y-3">
                {result.controls.filter((c) => c.status !== 'valid').map((item) => <ControlItem key={item.title} {...item} />)}
              </div>
              {result.controls.some((c) => c.status === 'valid') && (
                <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-accent/40 p-3">
                  {result.controls.filter((c) => c.status === 'valid').map((item) => <ValidControlRow key={item.title} title={item.title} />)}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Score par critère" icon={BarChart3}>
              <p className="mb-4 -mt-1 text-xs font-semibold text-muted-foreground">Du point le plus faible au plus solide.</p>
              <div className="space-y-4">
                {[...(result.criteria.length ? result.criteria : CRITERIA_LABELS.map((label) => ({ label, value: 0 })))]
                  .sort((a, b) => a.value - b.value)
                  .map((item) => <CriteriaRow key={item.label} {...item} />)}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Ajustements recommandés" icon={Target}>
              {result.advice.map((item, index) => <AdviceRow key={item.title} index={index + 1} {...item} />)}
            </SectionCard>

            <SectionCard title="Règle de discipline" icon={CheckCircle2}>
              <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <p className="text-xs font-semibold leading-6 text-green-400">{result.disciplineNote}</p>
              </div>
            </SectionCard>
          </section>
        </>
      )}

      <SectionCard title="Analyses récentes" icon={Clock3}>
        {history.isLoading ? (
          <p className="text-xs font-semibold text-muted-foreground">Chargement...</p>
        ) : !history.data?.analyses.length ? (
          <p className="text-xs font-semibold text-muted-foreground">Aucune analyse enregistrée pour l&apos;instant.</p>
        ) : (
          <>
            {history.data.analyses.map((item) => <HistoryRow key={item.id} {...item} />)}
            {history.data.analyses.length >= 10 && (
              <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                Historique limité aux 10 dernières analyses <ArrowRight className="h-3.5 w-3.5" />
              </p>
            )}
          </>
        )}
      </SectionCard>
    </div>
  )
}
