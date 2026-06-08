'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  Brain, Target, AlertTriangle, CheckCircle2,
  Info, Lock, ChevronRight, Upload, FileText, Play,
  Download, Calendar,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis,
  ResponsiveContainer,
} from 'recharts'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useKpiSummary } from '@/lib/hooks/use-kpis'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

// ── Color tokens ──────────────────────────────────────────────────────────────
const C_PURPLE   = '#534AB7'
const C_PURPLE_L = '#7B6FCC'
const C_GREEN    = '#0FBF7A'
const C_RED      = '#FF4D6D'
const C_AMBER    = '#F59E0B'
const C_BLUE     = '#3B82F6'
const C_CARD     = '#0D1021'
const C_CARD2    = '#121629'
const C_BORDER   = 'rgba(255,255,255,0.06)'
const C_MUTED    = '#6B7280'
const C_TEXT     = '#E8EAF0'

// ── Static demo data ──────────────────────────────────────────────────────────
const RADAR_DATA = [
  { subject: 'Discipline',        A: 80 },
  { subject: 'Stratégie',         A: 65 },
  { subject: 'Psychologie',       A: 55 },
  { subject: 'Gestion du risque', A: 75 },
  { subject: 'Exécution',         A: 70 },
]

const ERRORS_DATA = [
  { label: 'Entrée prématurée',    pct: 23 },
  { label: 'Stop déplacé',         pct: 18 },
  { label: 'Over leverage',        pct: 15 },
  { label: 'Trade hors stratégie', pct: 12 },
  { label: 'Trade impulsif',       pct: 9  },
]

const PSYCH_BAR = [
  { d: 'L', v: 55 }, { d: 'M', v: 70 }, { d: 'M', v: 62 },
  { d: 'J', v: 80 }, { d: 'V', v: 68 },
]

const JOURNAL_BAR = [
  { d: 'S1', v: 12 }, { d: 'S2', v: 18 }, { d: 'S3', v: 14 }, { d: 'S4', v: 22 },
]

// ── Utility ───────────────────────────────────────────────────────────────────
function fmtMoney(value: number, signed = false) {
  const abs = Math.abs(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const sign = signed && value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${abs} $`
}

function fmtPct(value: number, signed = false) {
  const s = value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return signed && value > 0 ? `+${s}%` : `${s}%`
}

// ── MiniSparkline ─────────────────────────────────────────────────────────────
function Spark({ data, color }: { data: number[]; color: string }) {
  const W = 72; const H = 28
  const min = Math.min(...data); const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-[72px] overflow-visible shrink-0" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${pts} ${W},${H} 0,${H}`} fill={color} opacity="0.12" stroke="none" />
    </svg>
  )
}

const SPARK_DATA = [14, 18, 17, 20, 19, 24, 22, 27, 30, 28, 31, 35]

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: C_PURPLE }}
      >
        {num}
      </div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: C_MUTED }}>
        {title}
      </h2>
    </div>
  )
}

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({
  label, value, delta, positive, sparkColor, right,
}: {
  label: string; value: ReactNode; delta: string; positive: boolean
  sparkColor: string; right?: ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3"
      style={{ background: C_CARD, border: `1px solid ${C_BORDER}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium" style={{ color: C_MUTED }}>{label}</p>
          <div className="mt-1 text-lg font-bold leading-none text-white">{value}</div>
          <p
            className="mt-1 text-[11px] font-medium"
            style={{ color: positive ? C_GREEN : C_RED }}
          >
            {positive ? '↑' : '↓'} {delta}
          </p>
        </div>
        {right}
      </div>
      <div className="flex justify-end">
        <Spark data={SPARK_DATA} color={sparkColor} />
      </div>
    </div>
  )
}

// ── GaugeCircle ───────────────────────────────────────────────────────────────
function GaugeCircle({
  value, color, label, subLabel, size = 'md',
}: {
  value: number; color: string; label?: string; subLabel?: string; size?: 'sm' | 'md' | 'lg'
}) {
  const sz    = size === 'lg' ? 130 : size === 'md' ? 110 : 80
  const outer = size === 'lg' ? 52  : size === 'md' ? 44  : 32
  const inner = outer - 14
  const data  = [{ v: value }, { v: 100 - value }]
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: sz, height: sz }} className="relative">
        <PieChart width={sz} height={sz}>
          <Pie
            data={data} cx={sz / 2 - 1} cy={sz / 2 - 1}
            innerRadius={inner} outerRadius={outer}
            startAngle={90} endAngle={-270}
            dataKey="v" strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill={C_BORDER} />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-white"
            style={{ fontSize: size === 'lg' ? 22 : size === 'md' ? 18 : 14 }}
          >
            {value}%
          </span>
        </div>
      </div>
      {label    && <p className="text-sm font-bold text-white">{label}</p>}
      {subLabel && <p className="text-xs" style={{ color: C_MUTED }}>{subLabel}</p>}
    </div>
  )
}

// ── AlertItem ─────────────────────────────────────────────────────────────────
function AlertItem({ type, message }: { type: 'warning' | 'info' | 'success'; message: string }) {
  const cfg = {
    warning: { Icon: AlertTriangle, color: C_AMBER, bg: `${C_AMBER}18` },
    info:    { Icon: Info,          color: C_BLUE,  bg: `${C_BLUE}18`  },
    success: { Icon: CheckCircle2,  color: C_GREEN, bg: `${C_GREEN}18` },
  }[type]
  return (
    <div className="flex gap-2.5 rounded-lg p-2.5" style={{ background: cfg.bg }}>
      <cfg.Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
      <p className="text-[11px] leading-relaxed" style={{ color: C_TEXT }}>{message}</p>
    </div>
  )
}

// ── Card container helper ─────────────────────────────────────────────────────
function DCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-xl p-4', className)}
      style={{ background: C_CARD, border: `1px solid ${C_BORDER}` }}
    >
      {children}
    </div>
  )
}

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C_MUTED }}>
      {children}
    </p>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 0
// ═══════════════════════════════════════════════════════════════════════════════

function InsightIACard() {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5"
      style={{
        background: 'linear-gradient(135deg, #0D0B22 0%, #0D1021 100%)',
        border: `1px solid ${C_PURPLE}50`,
      }}
    >
      <span
        className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
        style={{ background: C_PURPLE }}
      >
        Nouveau
      </span>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C_PURPLE_L }}>
        Insight IA du Jour
      </p>
      <p className="mt-3 text-sm font-semibold italic leading-relaxed text-white">
        "Votre discipline s'améliore, mais attention au sur-trading en session Londres."
      </p>
      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: C_MUTED }}>
        Vous prenez 62% de vos pertes après 15h00. Réduire votre activité à 2 trades max
        pourrait augmenter votre profitabilité de 18%.
      </p>
      <Link
        href="/app/ia"
        className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: C_PURPLE }}
      >
        Voir l'analyse complète <ChevronRight className="h-3 w-3" />
      </Link>
      <Brain
        className="pointer-events-none absolute bottom-2 right-4 h-28 w-28 select-none opacity-[0.07]"
        style={{ color: C_PURPLE_L }}
      />
    </div>
  )
}

function VueEnsembleCard({
  totalPnl, winRate, rr, nbTrades, aiScore,
}: {
  totalPnl: number; winRate: number; rr: number; nbTrades: number; aiScore: number
}) {
  const expectancy = 0.73
  return (
    <DCard>
      <CardLabel>Vue d'Ensemble</CardLabel>
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="Profit Net"
          value={<span style={{ color: totalPnl >= 0 ? C_GREEN : C_RED }}>{fmtMoney(totalPnl, true)}</span>}
          delta="+18.7%"
          positive={totalPnl >= 0}
          sparkColor={C_GREEN}
        />
        <MetricCard
          label="Win Rate"
          value={<span className="text-white">{fmtPct(winRate)}</span>}
          delta="+6.2%"
          positive
          sparkColor={C_PURPLE_L}
        />
        <MetricCard
          label="R:R Moyen"
          value={<span className="text-white">{rr.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>}
          delta="+0.27"
          positive
          sparkColor={C_GREEN}
        />
        <MetricCard
          label="Trades"
          value={<span className="text-white">{nbTrades}</span>}
          delta="+12"
          positive
          sparkColor={C_GREEN}
        />
        <MetricCard
          label="Expectancy"
          value={<span className="text-white">{expectancy.toFixed(2)}</span>}
          delta="+0.15"
          positive
          sparkColor={C_GREEN}
        />
        {/* Score Global IA */}
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-lg p-2"
          style={{ background: C_CARD2, border: `1px solid ${C_BORDER}` }}
        >
          <p className="text-[10px] font-medium" style={{ color: C_MUTED }}>Score Global IA</p>
          <GaugeCircle value={aiScore} color={C_PURPLE} size="sm" />
        </div>
      </div>
    </DCard>
  )
}

function PropFirmCard() {
  return (
    <DCard className="flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C_MUTED }}>
          Votre Profil
        </p>
        <p className="mt-2 text-2xl font-black text-white">PROP FIRM</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: `${C_PURPLE}30` }}>
            <Target className="h-4 w-4" style={{ color: C_PURPLE_L }} />
          </div>
          <span className="text-sm font-bold text-white">FTMO</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed" style={{ color: C_MUTED }}>
          Plan optimisé pour réussir votre challenge FTMO
        </p>
      </div>
      <Link
        href="/app/ia/propfirm"
        className="inline-flex items-center gap-1 text-xs font-bold"
        style={{ color: C_PURPLE_L }}
      >
        Voir mon plan <ChevronRight className="h-3 w-3" />
      </Link>
    </DCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1
// ═══════════════════════════════════════════════════════════════════════════════

function PiliersPerformanceCard() {
  return (
    <DCard>
      <CardLabel>Piliers de Performance</CardLabel>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={RADAR_DATA} cx="50%" cy="50%">
          <PolarGrid stroke={C_BORDER} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: C_MUTED, fontSize: 11, fontWeight: 500 }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke={C_PURPLE}
            fill={C_PURPLE}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </DCard>
  )
}

function ErreursRepetitivesCard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Erreurs Répétitives</CardLabel>
      <div className="flex-1 space-y-3">
        {ERRORS_DATA.map((item, i) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-slate-300">
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: `${C_PURPLE}30`, color: C_PURPLE_L }}
                >
                  {i + 1}
                </span>
                {item.label}
              </span>
              <span className="text-[11px] font-medium" style={{ color: C_RED }}>
                {item.pct}% des pertes
              </span>
            </div>
            <Progress value={item.pct} className="h-1.5 [&>div]:bg-[#FF4D6D]" />
          </div>
        ))}
      </div>
      <Link
        href="/app/ia/rapport"
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold"
        style={{ color: C_PURPLE_L }}
      >
        Voir le rapport complet <ChevronRight className="h-3 w-3" />
      </Link>
    </DCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2
// ═══════════════════════════════════════════════════════════════════════════════

function RiskManagerCard() {
  return (
    <DCard className="flex flex-col gap-3">
      <CardLabel>Risk Manager IA</CardLabel>
      <div>
        <p className="text-[11px]" style={{ color: C_MUTED }}>Risque actuel</p>
        <p className="text-2xl font-black text-white">2.00%</p>
      </div>
      <div>
        <p className="text-[11px]" style={{ color: C_MUTED }}>Recommandé</p>
        <p className="text-base font-bold" style={{ color: C_GREEN }}>0.75%</p>
      </div>
      <div>
        <p className="text-[11px]" style={{ color: C_MUTED }}>Niveau de danger</p>
        <span
          className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold"
          style={{ background: `${C_RED}20`, color: C_RED }}
        >
          Élevé
        </span>
      </div>
    </DCard>
  )
}

function PsychologieCard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Psychologie IA</CardLabel>
      <div className="space-y-2">
        <div>
          <p className="text-[11px]" style={{ color: C_MUTED }}>Indice émotionnel</p>
          <p className="text-2xl font-black text-white">68%</p>
        </div>
        {[
          { label: 'Stress',    value: 'Moyen',  color: C_AMBER },
          { label: 'Confiance', value: 'Forte',  color: C_GREEN },
          { label: 'Fatigue',   value: 'Élevée', color: C_RED   },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span style={{ color: C_MUTED }}>{row.label}</span>
            <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex-1">
        <ResponsiveContainer width="100%" height={50}>
          <BarChart data={PSYCH_BAR} barSize={8}>
            <Bar dataKey="v" fill={C_PURPLE} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-[10px]" style={{ color: C_MUTED }}>78 trades analysés</p>
      </div>
    </DCard>
  )
}

function JournalIACard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Journal IA</CardLabel>
      <p className="text-[11px]" style={{ color: C_MUTED }}>Analyse automatique de vos trades</p>
      <div className="mt-3 flex-1">
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={JOURNAL_BAR} barSize={16}>
            <Bar dataKey="v" fill={C_PURPLE} radius={[2, 2, 0, 0]} />
            <XAxis
              dataKey="d"
              tick={{ fill: C_MUTED, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Link
        href="/app/journal"
        className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-bold"
        style={{ color: C_PURPLE_L }}
      >
        Ouvrir le journal <ChevronRight className="h-3 w-3" />
      </Link>
    </DCard>
  )
}

function AnalyseSetupCard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Analyse de Setup IA</CardLabel>
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg p-4"
        style={{ border: `1px dashed ${C_MUTED}50` }}
      >
        <Upload className="h-8 w-8" style={{ color: C_MUTED }} />
        <div className="text-center">
          <p className="text-xs font-medium text-slate-300">
            Glissez votre image ici ou cliquez pour importer
          </p>
          <p className="mt-1 text-[10px]" style={{ color: C_MUTED }}>
            Formats acceptés : JPG, PNG (max 10Mo)
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: C_PURPLE }}
        >
          Importer
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10px]" style={{ color: C_MUTED }}>Dernières analyses</p>
        <Link href="/app/ia" className="text-[10px] font-bold" style={{ color: C_PURPLE_L }}>
          Voir toutes →
        </Link>
      </div>
    </DCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3
// ═══════════════════════════════════════════════════════════════════════════════

function ChallengeTrackerCard() {
  return (
    <DCard>
      <CardLabel>Challenge Tracker – FTMO</CardLabel>
      <div className="flex items-center gap-4">
        <GaugeCircle value={68} color={C_PURPLE} size="md" />
        <div className="space-y-2">
          <div>
            <p className="text-[10px]" style={{ color: C_MUTED }}>Objectif</p>
            <p className="text-sm font-bold text-white">+10%</p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: C_MUTED }}>Actuel</p>
            <p className="text-sm font-bold" style={{ color: C_GREEN }}>+6.80%</p>
          </div>
        </div>
      </div>
      <div
        className="mt-3 grid grid-cols-3 gap-2 border-t pt-3"
        style={{ borderColor: C_BORDER }}
      >
        {[
          { label: 'Profit',         value: '6.80%',   color: C_GREEN },
          { label: 'Gain',           value: '$680.00',  color: C_GREEN },
          { label: 'Jours restants', value: '18',       color: 'white' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-[10px]" style={{ color: C_MUTED }}>{item.label}</p>
            <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
    </DCard>
  )
}

function ReglesControlesCard() {
  const [tab, setTab] = useState<'prioritaires' | 'cachees'>('prioritaires')
  const rules = [
    { label: 'Daily Drawdown',        ok: true  },
    { label: 'Max Drawdown',          ok: true  },
    { label: 'Minimum Trading Days',  ok: true  },
    { label: 'Consistency Rule',      ok: false },
  ]
  return (
    <DCard>
      <CardLabel>Règles & Contrôles</CardLabel>
      <div
        className="mb-3 inline-flex overflow-hidden rounded-lg text-[11px]"
        style={{ border: `1px solid ${C_BORDER}` }}
      >
        {(['prioritaires', 'cachees'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-3 py-1.5 font-medium transition-colors"
            style={{
              background: tab === t ? C_PURPLE : 'transparent',
              color: tab === t ? 'white' : C_MUTED,
            }}
          >
            {t === 'prioritaires' ? 'Règles Prioritaires' : 'Règles Cachées IA'}
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-center justify-between">
            <span className="text-xs text-slate-300">{rule.label}</span>
            {rule.ok ? (
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: C_GREEN }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Respectée
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: C_AMBER }}>
                <AlertTriangle className="h-3.5 w-3.5" /> Attention
              </span>
            )}
          </div>
        ))}
      </div>
    </DCard>
  )
}

function ProbabiliteCard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Probabilité de Réussite</CardLabel>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-2">
        <GaugeCircle value={83} color={C_GREEN} label="Excellente" size="md" />
        <p className="text-center text-xs leading-relaxed" style={{ color: C_MUTED }}>
          Continuez comme ça !<br />Votre gestion est optimale.
        </p>
      </div>
      <button
        type="button"
        className="mt-3 w-full rounded-lg py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: C_PURPLE }}
      >
        Voir le plan d'action
      </button>
    </DCard>
  )
}

function DernieresAlertesCard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Dernières Alertes IA</CardLabel>
      <div className="flex-1 space-y-2">
        <AlertItem
          type="warning"
          message="Vous gagnez 70% de vos profits sur seulement 2 jours. Risque de violation de Consistency Rule."
        />
        <AlertItem type="info"    message="Réduisez votre risque en session Londres." />
        <AlertItem type="success" message="Bonne amélioration de votre discipline cette semaine." />
      </div>
      <Link
        href="/app/alerts"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold"
        style={{ color: C_PURPLE_L }}
      >
        Voir toutes les alertes <ChevronRight className="h-3 w-3" />
      </Link>
    </DCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4
// ═══════════════════════════════════════════════════════════════════════════════

function ParcoursCard() {
  const modules = [
    { title: 'Gestion du risque',   progress: 100, status: 'completed'   as const },
    { title: 'Discipline & Plan',   progress: 75,  status: 'in-progress' as const },
    { title: 'Structure de marché', progress: 50,  status: 'in-progress' as const },
    { title: 'Psychologie avancée', progress: 0,   status: 'locked'      as const },
  ]
  return (
    <DCard>
      <CardLabel>Votre Parcours</CardLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {modules.map((mod, i) => (
          <div
            key={mod.title}
            className="rounded-lg p-3"
            style={{ background: C_CARD2, border: `1px solid ${C_BORDER}` }}
          >
            <p className="text-[10px] font-medium" style={{ color: C_MUTED }}>Module {i + 1}</p>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-white">{mod.title}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-white">{mod.progress}%</span>
              {mod.status === 'completed' && (
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: C_GREEN }} />
              )}
              {mod.status === 'locked' && (
                <Lock className="h-3.5 w-3.5" style={{ color: C_MUTED }} />
              )}
            </div>
            <Progress
              value={mod.progress}
              className={cn('mt-1.5 h-1', mod.status === 'completed' && '[&>div]:bg-[#0FBF7A]')}
            />
          </div>
        ))}
      </div>
      <Link
        href="/app/ia"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold"
        style={{ color: C_PURPLE_L }}
      >
        Voir tout le parcours <ChevronRight className="h-3 w-3" />
      </Link>
    </DCard>
  )
}

function CompetencesCard() {
  const skills = [
    { label: 'Market Structure', pct: 80, trend: 'up'   as const },
    { label: 'Risk Management',  pct: 40, trend: 'down' as const },
    { label: 'Psychologie',      pct: 60, trend: 'up'   as const },
    { label: 'Liquidité',        pct: 70, trend: 'flat' as const },
    { label: 'Exécution',        pct: 65, trend: 'up'   as const },
  ]
  return (
    <DCard>
      <CardLabel>Compétences</CardLabel>
      <div className="space-y-2.5">
        {skills.map((skill) => (
          <div key={skill.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-300">{skill.label}</span>
              <span className="flex items-center gap-1">
                <span className="text-xs font-bold text-white">{skill.pct}%</span>
                {skill.trend === 'up'   && <span className="text-[10px]" style={{ color: C_GREEN }}>↑</span>}
                {skill.trend === 'down' && <span className="text-[10px]" style={{ color: C_RED   }}>↓</span>}
                {skill.trend === 'flat' && <span className="text-[10px]" style={{ color: C_MUTED }}>→</span>}
              </span>
            </div>
            <Progress value={skill.pct} className="h-1" />
          </div>
        ))}
      </div>
    </DCard>
  )
}

function FormationContextuelleCard() {
  return (
    <DCard className="flex flex-col">
      <CardLabel>Formation Contextuelle</CardLabel>
      <p className="text-xs leading-relaxed" style={{ color: C_MUTED }}>
        Vous venez de perdre sur un faux breakout.<br />Cours recommandé :
      </p>
      <div
        className="mt-3 flex items-start gap-3 rounded-lg p-3"
        style={{ background: C_CARD2, border: `1px solid ${C_BORDER}` }}
      >
        <div
          className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md"
          style={{ background: `${C_PURPLE}25` }}
        >
          <Play className="h-5 w-5" style={{ color: C_PURPLE_L }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-tight text-white">
            Comprendre les pièges de liquidité
          </p>
          <p className="mt-1 text-[10px]" style={{ color: C_MUTED }}>Vidéo · 18 min</p>
        </div>
      </div>
      <Link
        href="/app/ia"
        className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold"
        style={{ color: C_PURPLE_L }}
      >
        Voir toutes les formations <ChevronRight className="h-3 w-3" />
      </Link>
    </DCard>
  )
}

function RessourcesCard() {
  const items = [
    { label: 'Checklist Pre-Market', meta: 'PDF · Checklist' },
    { label: 'Journal Template Pro', meta: 'PDF · Template'  },
    { label: 'Plan de Trading Pro',  meta: 'PDF · Template'  },
  ]
  return (
    <DCard>
      <CardLabel>Ressources Recommandées</CardLabel>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
            style={{ background: C_CARD2, border: `1px solid ${C_BORDER}` }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0" style={{ color: C_MUTED }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{item.label}</p>
                <p className="text-[10px]" style={{ color: C_MUTED }}>{item.meta}</p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded p-1 transition-colors hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" style={{ color: C_MUTED }} />
            </button>
          </div>
        ))}
      </div>
    </DCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardPage() {
  const { data: user } = useCurrentUser()
  const summaryQuery = useKpiSummary('30d')

  const firstName = user?.firstName ?? 'Alex'
  const summary   = summaryQuery.data

  const totalPnl = Number(summary?.totalPnl    ?? 2450.75)
  const winRate  = summary ? summary.winRate * 100 : 62.4
  const rr       = Number(summary?.profitFactor ?? 1.85)
  const nbTrades = Number(summary?.nbTrades     ?? 78)
  const aiScore  = 78

  return (
    <div className="min-h-screen px-4 pb-10 pt-6 sm:px-6 lg:px-8" style={{ background: '#080B14' }}>
      <div className="mx-auto max-w-[1680px] space-y-7">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Bienvenue {firstName} 👋</h1>
            <p className="mt-1 text-sm" style={{ color: C_MUTED }}>
              Voici votre performance et les insights IA du jour.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.04]"
              style={{ border: `1px solid ${C_BORDER}` }}
            >
              <Calendar className="h-3.5 w-3.5" />
              01 Mai – 31 Mai 2024
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.04]"
              style={{ border: `1px solid ${C_BORDER}` }}
            >
              Personnaliser
            </button>
          </div>
        </div>

        {/* ── Section 0 ── */}
        <div className="grid gap-4 lg:grid-cols-[2fr_2fr_1fr]">
          <InsightIACard />
          <VueEnsembleCard
            totalPnl={totalPnl} winRate={winRate}
            rr={rr} nbTrades={nbTrades} aiScore={aiScore}
          />
          <PropFirmCard />
        </div>

        {/* ── Section 1 ── */}
        <div className="space-y-3">
          <SectionHeader num={1} title="Performance & Analyse IA" />
          <div className="grid gap-4 md:grid-cols-2">
            <PiliersPerformanceCard />
            <ErreursRepetitivesCard />
          </div>
        </div>

        {/* ── Section 2 ── */}
        <div className="space-y-3">
          <SectionHeader num={2} title="Outils IA d'Analyse" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RiskManagerCard />
            <PsychologieCard />
            <JournalIACard />
            <AnalyseSetupCard />
          </div>
        </div>

        {/* ── Section 3 ── */}
        <div className="space-y-3">
          <SectionHeader num={3} title="Dashboard Adaptatif" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ChallengeTrackerCard />
            <ReglesControlesCard />
            <ProbabiliteCard />
            <DernieresAlertesCard />
          </div>
        </div>

        {/* ── Section 4 ── */}
        <div className="space-y-3">
          <SectionHeader num={4} title="Académie & Parcours Personnalisé" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ParcoursCard />
            <CompetencesCard />
            <FormationContextuelleCard />
            <RessourcesCard />
          </div>
        </div>

      </div>
    </div>
  )
}
