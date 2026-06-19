import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileUp,
  Link2,
  ListChecks,
  RefreshCcw,
  Scale,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'purple' | 'green' | 'amber' | 'red' | 'blue' | 'slate'

type Criterion = {
  label: string
  value: number
  tone: Tone
}

type ControlCheck = {
  title: string
  description: string
  status: 'valid' | 'warning' | 'error'
}

const toneStyles: Record<Tone, string> = {
  purple: 'border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  green:  'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber:  'border-amber-200 bg-amber-50 text-amber-700',
  red:    'border-red-200 bg-red-50 text-red-700',
  blue:   'border-blue-200 bg-blue-50 text-blue-700',
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

const setupMetrics = [
  { label: 'Risque prévu', value: '0,75R', helper: 'sous limite journalière', tone: 'green' as Tone },
  { label: 'R:R', value: '2,85', helper: 'minimum requis 1,50', tone: 'green' as Tone },
  { label: 'Timing', value: '22h47', helper: 'session asiatique', tone: 'amber' as Tone },
  { label: 'Confiance', value: '70%', helper: 'confirmation manquante', tone: 'purple' as Tone },
]

const controls: ControlCheck[] = [
  {
    title: 'Structure de marché haussière',
    description: 'HH/HL identifiés sur H1 et H4. La tendance reste alignée sur les deux unités de temps.',
    status: 'valid',
  },
  {
    title: 'Stop Loss cohérent',
    description: 'Le SL est placé sous le dernier Higher Low. L’invalidation du scénario est claire.',
    status: 'valid',
  },
  {
    title: 'R:R excellent à 2,85',
    description: 'Le ratio dépasse votre minimum configuré. Le setup reste rentable si le win rate dépasse 26%.',
    status: 'valid',
  },
  {
    title: 'Confluence TP1 insuffisante',
    description: 'Le TP à 1.09200 ne correspond à aucune résistance propre sur H1. 1.09150 paraît plus réaliste.',
    status: 'warning',
  },
  {
    title: 'Orderblock non confirmé',
    description: 'Attendez une clôture H1 au-dessus de 1.08420 avant de valider l’entrée.',
    status: 'warning',
  },
  {
    title: 'Session non optimale',
    description: 'Votre historique EURUSD hors session de Londres affiche une baisse nette de performance.',
    status: 'error',
  },
]

const criteria: Criterion[] = [
  { label: 'Structure de marché', value: 85, tone: 'purple' },
  { label: 'Zone d’entrée', value: 70, tone: 'purple' },
  { label: 'Stop Loss', value: 90, tone: 'green' },
  { label: 'Take Profit', value: 55, tone: 'amber' },
  { label: 'Confluences', value: 65, tone: 'amber' },
  { label: 'Timing / Session', value: 30, tone: 'red' },
  { label: 'Risk reward', value: 95, tone: 'green' },
]

const advice = [
  {
    title: 'Attendre la clôture de la bougie H1',
    text: 'Valider uniquement si le prix clôture au-dessus de 1.08420. Les entrées avant confirmation représentent 23% de vos pertes récentes.',
    impact: '+0,42R estimé',
  },
  {
    title: 'Déplacer le TP à 1.09150',
    text: 'Cette zone correspond à la résistance H4 visible. Le R:R passe à 2,72 mais la probabilité de clôture complète augmente.',
    impact: '+11% qualité',
  },
  {
    title: 'Programmer une alerte Londres',
    text: 'Revoir le setup à 7h00 plutôt que d’entrer en session asiatique, qui reste votre plage la moins performante sur EURUSD.',
    impact: '-38% erreur timing',
  },
]

const history = [
  {
    asset: 'GBPUSD',
    direction: 'Short',
    timeframe: 'H4',
    date: 'Hier à 14h22',
    strategy: 'Smart Money',
    score: 88,
    result: '+2,1R',
    tone: 'green' as Tone,
  },
  {
    asset: 'XAUUSD',
    direction: 'Long',
    timeframe: 'H1',
    date: '13 juin à 09h15',
    strategy: 'Price Action',
    score: 42,
    result: 'Trade évité',
    tone: 'red' as Tone,
  },
  {
    asset: 'EURUSD',
    direction: 'Long',
    timeframe: 'M15',
    date: '12 juin à 16h40',
    strategy: 'Breakout',
    score: 65,
    result: '-0,8R',
    tone: 'amber' as Tone,
  },
]

function Badge({ children, tone = 'purple' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-black', toneStyles[tone])}>
      {children}
    </span>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-background p-5 shadow-sm', className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--primary)/0.16)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[hsl(var(--primary))]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ScoreCircle({ value }: { value: number }) {
  const size = 144
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
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
          stroke="#f59e0b"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-5xl font-black leading-none text-foreground">70</span>
        <span className="mt-1 text-xs font-bold text-muted-foreground">/100</span>
        <span className="mt-2 text-xs font-black text-amber-600">À confirmer</span>
      </div>
    </div>
  )
}

function TextField({
  label,
  placeholder,
  defaultValue,
  readOnly,
}: {
  label: string
  placeholder: string
  defaultValue?: string
  readOnly?: boolean
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input
        className={cn(
          'h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-[hsl(var(--primary)/0.45)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.08)]',
          readOnly && 'bg-accent text-muted-foreground',
        )}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </label>
  )
}

function SelectField({
  label,
  defaultValue,
  options,
}: {
  label: string
  defaultValue: string
  options: string[]
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <select
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-[hsl(var(--primary)/0.45)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.08)]"
        defaultValue={defaultValue}
      >
        {options.map(option => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function ChartPreview() {
  return (
    <div className="relative min-h-[212px] overflow-hidden rounded-xl border border-border bg-[linear-gradient(180deg,#fff,rgba(248,250,252,0.78))] p-4">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-foreground">EURUSD · H1</p>
          <p className="mt-1 text-[11px] font-bold text-muted-foreground">Zone orderblock détectée</p>
        </div>
        <Badge tone="green">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Screenshot lisible
        </Badge>
      </div>
      <svg viewBox="0 0 620 220" className="relative mt-3 h-[156px] w-full" aria-hidden="true">
        <rect x="64" y="52" width="210" height="74" rx="10" fill="hsl(var(--primary))" opacity="0.08" />
        <path
          d="M24 168 C70 132 104 146 142 110 C178 76 216 92 248 68 C294 34 322 70 366 58 C420 44 452 76 492 50 C534 22 566 46 604 32"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M24 190 C76 156 116 166 160 138 C202 112 236 122 278 96 C324 68 360 98 404 84 C462 66 494 96 538 72 C574 54 590 62 604 54"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {[
          [86, 134, 24, 52, '#16a34a'],
          [136, 102, 24, 58, '#16a34a'],
          [188, 82, 24, 50, '#ef4444'],
          [244, 72, 24, 76, '#16a34a'],
          [304, 48, 24, 68, '#16a34a'],
          [362, 64, 24, 58, '#ef4444'],
          [424, 48, 24, 74, '#16a34a'],
          [484, 66, 24, 46, '#ef4444'],
          [540, 38, 24, 62, '#16a34a'],
        ].map(([x, y, w, h, color]) => (
          <g key={`${x}-${y}`}>
            <line x1={Number(x) + 12} x2={Number(x) + 12} y1={Number(y) - 18} y2={Number(y) + Number(h) + 18} stroke={String(color)} strokeWidth="3" />
            <rect x={Number(x)} y={Number(y)} width={Number(w)} height={Number(h)} rx="4" fill={String(color)} />
          </g>
        ))}
        <line x1="42" y1="126" x2="600" y2="126" stroke="#f59e0b" strokeDasharray="8 8" strokeWidth="2" />
        <line x1="42" y1="172" x2="600" y2="172" stroke="#ef4444" strokeDasharray="8 8" strokeWidth="2" />
        <text x="486" y="119" fill="#92400e" fontSize="14" fontWeight="700">Entrée 1.08420</text>
        <text x="504" y="165" fill="#b91c1c" fontSize="14" fontWeight="700">SL 1.08150</text>
      </svg>
    </div>
  )
}

function MetricCard({ label, value, helper, tone }: (typeof setupMetrics)[number]) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black text-foreground">{value}</p>
      <div className={cn('mt-3 inline-flex rounded-md border px-2 py-1 text-[11px] font-black', toneStyles[tone])}>
        {helper}
      </div>
    </div>
  )
}

function ControlItem({ title, description, status }: ControlCheck) {
  const config = {
    valid:   {
      icon: Check,
      tone: 'green' as Tone,
      titleClass: 'text-emerald-800',
    },
    warning: {
      icon: AlertTriangle,
      tone: 'amber' as Tone,
      titleClass: 'text-amber-800',
    },
    error:   {
      icon: XCircle,
      tone: 'red' as Tone,
      titleClass: 'text-red-800',
    },
  }[status]
  const Icon = config.icon

  return (
    <div className={cn('flex gap-3 rounded-xl border p-3', toneStyles[config.tone])}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={cn('text-sm font-black', config.titleClass)}>{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function CriteriaRow({ label, value, tone }: Criterion) {
  return (
    <div className="grid grid-cols-[130px_1fr_42px] items-center gap-3 sm:grid-cols-[170px_1fr_42px]">
      <span className="min-w-0 text-xs font-bold text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-accent">
        <div className={cn('h-full rounded-full', toneBars[tone])} style={{ width: `${value}%` }} />
      </div>
      <span className={cn('font-mono text-sm font-black', tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : tone === 'green' ? 'text-emerald-600' : 'text-[hsl(var(--primary))]')}>
        {value}
      </span>
    </div>
  )
}

function AdviceItem({ index, title, text, impact }: { index: number; title: string; text: string; impact: string }) {
  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-xs font-black text-[hsl(var(--primary))]">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-black text-foreground">{title}</p>
          <Badge tone="green">{impact}</Badge>
        </div>
        <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function HistoryRow({ asset, direction, timeframe, date, strategy, score, result, tone }: (typeof history)[number]) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center">
      <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-accent">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-foreground">{asset} · {direction} · {timeframe}</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{date} · {strategy}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone}>Score {score}</Badge>
        <Badge tone={tone === 'red' ? 'amber' : tone}>{result}</Badge>
        <button type="button" className="inline-flex h-8 items-center gap-2 rounded-lg border border-border px-3 text-xs font-black text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <Eye className="h-3.5 w-3.5" />
          Voir
        </button>
      </div>
    </div>
  )
}

export function IaStrategyValidatorPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-foreground">Validateur de stratégie</h1>
            <Badge tone="purple">
              <Sparkles className="h-3.5 w-3.5" />
              Analyse IA
            </Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            Déposez votre analyse technique, renseignez le plan de trade et obtenez une validation avant exécution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-accent p-1">
            <button type="button" className="rounded-md bg-background px-3 py-2 text-xs font-black text-foreground shadow-sm">
              Nouvelle analyse
            </button>
            <button type="button" className="rounded-md px-3 py-2 text-xs font-black text-muted-foreground transition hover:text-foreground">
              Historique
            </button>
          </div>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-black text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <RefreshCcw className="h-4 w-4" />
            Réinitialiser
          </button>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
        <SectionCard title="Déposer l’analyse" icon={UploadCloud}>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--primary)/0.32)] bg-[hsl(var(--primary)/0.04)] px-5 py-8 text-center transition hover:bg-[hsl(var(--primary)/0.08)]">
              <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" />
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.2)] bg-background text-[hsl(var(--primary))] shadow-sm">
                <FileUp className="h-6 w-6" />
              </span>
              <span className="mt-4 text-sm font-black text-foreground">Glissez votre screenshot ici</span>
              <span className="mt-2 max-w-[260px] text-xs font-semibold leading-5 text-muted-foreground">
                TradingView, MT4, MT5 ou capture mobile. JPG, PNG, WEBP jusqu’à 10 Mo.
              </span>
              <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-black text-white shadow-sm">
                <UploadCloud className="h-4 w-4" />
                Choisir un fichier
              </span>
            </label>

            <div className="space-y-3">
              <ChartPreview />
              <div className="flex items-start gap-3 rounded-xl border border-border bg-accent p-3">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                <div>
                  <p className="text-xs font-black text-foreground">Alternative rapide</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                    Collez un lien TradingView ou ajoutez une note si vous n’avez pas encore de capture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Paramètres du setup" icon={Settings2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Instrument" placeholder="ex : EURUSD" defaultValue="EURUSD" />
            <SelectField label="Unité de temps" defaultValue="H1 - 1 heure" options={['H1 - 1 heure', 'H4 - 4 heures', 'D1 - Daily', 'M15 - 15 minutes']} />
            <SelectField label="Direction" defaultValue="Long (achat)" options={['Long (achat)', 'Short (vente)']} />
            <SelectField label="Style de trading" defaultValue="Price Action" options={['Price Action', 'Smart Money / ICT', 'Breakout', 'Indicateurs']} />
            <TextField label="Point d’entrée" placeholder="ex : 1.08420" defaultValue="1.08420" />
            <TextField label="Stop Loss" placeholder="ex : 1.08150" defaultValue="1.08150" />
            <TextField label="Take Profit" placeholder="ex : 1.09200" defaultValue="1.09200" />
            <TextField label="R:R calculé" placeholder="Auto-calculé" defaultValue="2.85" readOnly />
          </div>
          <label className="mt-4 grid gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">Thèse de trading</span>
            <textarea
              className="min-h-[92px] resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold leading-6 text-foreground outline-none transition focus:border-[hsl(var(--primary)/0.45)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.08)]"
              defaultValue="Pullback vers une zone de support H1 après cassure de structure. Recherche d’une continuation haussière avec invalidation sous le dernier HL."
            />
          </label>
          <button type="button" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[hsl(var(--primary)/0.9)]">
            <BrainCircuit className="h-4 w-4" />
            Analyser ce setup
          </button>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Résultat de l’analyse</p>
              <h2 className="mt-1 text-lg font-black text-foreground">Setup correct, confirmation requise</h2>
            </div>
            <Badge tone="purple">
              <Clock3 className="h-3.5 w-3.5" />
              Dernière analyse · il y a 2 min
            </Badge>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <ScoreCircle value={70} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-7 text-muted-foreground">
                MERKURE valide la structure générale du setup, mais bloque la prise immédiate à cause du timing et de l’absence de clôture de confirmation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="amber">
                  <Clock3 className="h-3.5 w-3.5" />
                  Attendre confirmation
                </Badge>
                <Badge tone="green">
                  <Scale className="h-3.5 w-3.5" />
                  R:R favorable
                </Badge>
                <Badge tone="amber">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Session à risque
                </Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-black text-muted-foreground transition hover:bg-accent hover:text-foreground">
                  <Download className="h-4 w-4" />
                  Exporter
                </button>
                <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-black text-muted-foreground transition hover:bg-accent hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {setupMetrics.map(metric => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.06)] shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
          <div className="relative hidden min-h-[190px] items-center justify-center overflow-hidden border-r border-[hsl(var(--primary)/0.12)] lg:flex">
            <div className="absolute inset-0 [background-image:radial-gradient(circle,hsl(var(--primary)/0.18)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.18)] bg-background shadow-[0_22px_70px_hsl(var(--primary)/0.18)]">
              <BrainCircuit className="h-10 w-10 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <div className="p-5 lg:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[hsl(var(--primary))]">Lecture IA du setup</p>
            </div>
            <p className="mt-4 text-sm font-semibold leading-7 text-[hsl(var(--foreground))]">
              La structure H1 montre une tendance haussière avec une succession de Higher High et Higher Low. Votre entrée se situe dans une zone de support pertinente, mais le prix travaille encore à l’intérieur d’un orderblock non confirmé. Une clôture sous 1.08380 invaliderait la lecture. Le stop est propre, le ratio est attractif, mais l’exécution maintenant augmente le risque d’entrée prématurée.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Points de contrôle" icon={ListChecks}>
          <div className="space-y-3">
            {controls.map(item => (
              <ControlItem key={item.title} {...item} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Score par critère" icon={BarChart3}>
          <div className="space-y-4">
            {criteria.map(item => (
              <CriteriaRow key={item.label} {...item} />
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-accent p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Comparaison historique</p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Ce setup</span>
                  <span>70/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full w-[70%] rounded-full bg-[hsl(var(--primary))]" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Vos meilleurs setups gagnants</span>
                  <span>84/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full w-[84%] rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Ajustements recommandés" icon={Target}>
          {advice.map((item, index) => (
            <AdviceItem key={item.title} index={index + 1} {...item} />
          ))}
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="Décision finale" icon={ShieldCheck}>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-black text-amber-900">Ne pas entrer immédiatement</p>
                  <p className="mt-2 text-xs font-semibold leading-6 text-amber-800">
                    Le trade devient valide uniquement si la clôture H1 confirme la reprise au-dessus de 1.08420 et si le setup est revu pendant la session Londres.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarClock, label: 'Alerte', value: '07h00' },
                { icon: TrendingUp, label: 'TP ajusté', value: '1.09150' },
                { icon: ShieldCheck, label: 'Risque max', value: '0,75R' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-background p-3">
                  <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                  <p className="mt-1 font-mono text-sm font-black text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Règle de discipline" icon={CheckCircle2}>
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-black text-emerald-900">Plan respecté si vous attendez la confirmation</p>
                <p className="mt-2 text-xs font-semibold leading-6 text-emerald-800">
                  Cette décision est alignée avec votre objectif actuel: réduire les entrées prématurées et prioriser les setups notés au-dessus de 80.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>

      <SectionCard title="Analyses récentes" icon={Clock3}>
        {history.map(item => (
          <HistoryRow key={`${item.asset}-${item.date}`} {...item} />
        ))}
        <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-black text-muted-foreground transition hover:bg-accent hover:text-foreground">
          Voir tout l’historique
          <ArrowRight className="h-4 w-4" />
        </button>
      </SectionCard>
    </div>
  )
}
