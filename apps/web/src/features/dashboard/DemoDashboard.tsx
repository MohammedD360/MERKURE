'use client'

/**
 * DemoDashboard — version 100% statique du tableau de bord, pour l'aperçu
 * de la landing page. Aucun fetch réseau : des données de démo attractives
 * sont câblées en dur pour "donner envie" au visiteur. Reprend le langage
 * visuel du vrai dashboard (cartes blanches, chiffres mono, violet/vert de
 * marque) sans dépendre de l'API.
 */

import {
  Activity, ArrowDownRight, ArrowUpRight, Brain, CalendarDays, Download,
  RefreshCw, ShieldCheck, Sparkles, Target, TrendingDown, TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'

/* ── Données de démo ──────────────────────────────────────────────────────── */

const EQUITY = [
  0, 320, 210, 640, 980, 820, 1240, 1680, 1510, 2100, 2560, 2380, 2980,
  3520, 3410, 4020, 4680, 4520, 5240, 5980, 6420, 6180, 7080, 7920, 8460,
  8210, 9240, 10120, 10880, 11360, 12040, 12480,
].map((v, i) => ({ i, day: i + 1, pnl: v }))

const ASSETS = [
  { name: 'EUR/USD', pct: 34, color: 'hsl(243 90% 65%)' },
  { name: 'XAU/USD', pct: 24, color: 'hsl(141 92% 46%)' },
  { name: 'US30', pct: 18, color: 'hsl(210 90% 60%)' },
  { name: 'GBP/USD', pct: 14, color: 'hsl(38 92% 55%)' },
  { name: 'BTC/USD', pct: 10, color: 'hsl(280 80% 65%)' },
]

const STRATEGIES = [
  { name: 'Breakout Londres', pnl: 4820, pct: 100 },
  { name: 'Scalping US', pnl: 3110, pct: 65 },
  { name: 'Swing tendance', pnl: 2540, pct: 53 },
  { name: 'Pullback H1', pnl: 1560, pct: 32 },
  { name: 'News trading', pnl: -540, pct: -11 },
]

const TRADES = [
  { sym: 'EUR/USD', side: 'Achat', size: '1.2 lot', pnl: 486, when: "Aujourd'hui 14:32" },
  { sym: 'XAU/USD', side: 'Vente', size: '0.5 lot', pnl: 312, when: "Aujourd'hui 11:08" },
  { sym: 'US30', side: 'Achat', size: '2.0 lot', pnl: -128, when: 'Hier 17:45' },
  { sym: 'GBP/USD', side: 'Achat', size: '0.8 lot', pnl: 241, when: 'Hier 09:20' },
  { sym: 'BTC/USD', side: 'Vente', size: '0.1 lot', pnl: 903, when: '18 juil. 22:10' },
]

const BEHAVIORS = [
  { label: 'Discipline du plan', value: 88, tone: 'good' as const },
  { label: 'Respect du risk/reward', value: 82, tone: 'good' as const },
  { label: 'Overtrading', value: 21, tone: 'good' as const },
  { label: 'Coupe les gains trop tôt', value: 46, tone: 'warn' as const },
]

const STATS = [
  { label: 'Espérance / trade', value: '+50,5 €' },
  { label: 'Gain moyen', value: '+184 €' },
  { label: 'Perte moyenne', value: '-98 €' },
  { label: 'Meilleure série', value: '9 gains' },
  { label: 'Ratio risque/gain', value: '1 : 2,1' },
  { label: 'Trades / jour', value: '8,2' },
]

const EVENTS = [
  { time: '14:30', title: 'NFP — Emploi US', impact: 'high' as const },
  { time: '16:00', title: 'ISM Services', impact: 'medium' as const },
  { time: '20:00', title: 'Minutes FOMC', impact: 'high' as const },
]

/* ── Primitives ───────────────────────────────────────────────────────────── */

function Panel({ eyebrow, title, action, children, className }: {
  eyebrow?: string; title?: string; action?: ReactNode; children: ReactNode; className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-5 shadow-sm', className)}>
      {(title || eyebrow) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p>}
            {title && <h3 className="mt-1 truncate text-sm font-bold text-foreground">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

function KpiCard({ title, icon, value, sub, tone = 'neutral', children }: {
  title: string; icon: ReactNode; value?: string; sub?: ReactNode
  tone?: 'up' | 'down' | 'neutral'; children?: ReactNode
}) {
  return (
    <div className="flex h-full min-h-[120px] flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">{icon}</div>
      </div>
      <div className="flex flex-1 flex-col justify-end">
        {children ?? (
          <>
            <p className={cn('tabular-nums text-2xl font-bold tracking-tight',
              tone === 'up' ? 'text-green-500' : tone === 'down' ? 'text-red-500' : 'text-foreground')}>
              {value}
            </p>
            {sub && <p className="mt-2 text-xs text-muted-foreground">{sub}</p>}
          </>
        )}
      </div>
    </div>
  )
}

function Ring({ value, color = 'hsl(243 90% 65%)', size = 52 }: { value: number; color?: string; size?: number }) {
  const r = 20
  const c = 2 * Math.PI * r
  const filled = (Math.max(0, Math.min(value, 100)) / 100) * c
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${c - filled}`} strokeLinecap="round" transform="rotate(-90 28 28)" />
    </svg>
  )
}

function fmt(n: number) {
  const s = Math.abs(n).toLocaleString('fr-FR')
  return `${n >= 0 ? '+' : '-'}${s} €`
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */

export function DemoDashboard() {
  return (
    <div className="min-h-screen bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* Barre de titre */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Bonjour Alexandre</h1>
            <p className="text-xs text-muted-foreground">Vue d'ensemble · 30 derniers jours</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border bg-card p-1">
              {['7J', '1M', '3M', 'YTD', 'ALL'].map((p) => (
                <span key={p} className={cn('h-8 rounded px-3 text-xs font-bold leading-8',
                  p === '1M' ? 'bg-foreground text-white' : 'text-muted-foreground')}>{p}</span>
              ))}
            </div>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-bold text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />Sync
            </span>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-bold text-muted-foreground">
              <Download className="h-3.5 w-3.5" />Export
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard title="P&L 30 jours" tone="up" value="+12 480 €" sub="247 trades"
            icon={<TrendingUp className="h-4 w-4 text-green-500" />} />
          <KpiCard title="Trades" value="247" sub="62,4 % de réussite"
            icon={<Activity className="h-4 w-4 text-[hsl(var(--primary))]" />} />
          <KpiCard title="Drawdown Max" tone="down" value="-6,4 %" sub="Risque contenu"
            icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
          <KpiCard title="Win Rate" icon={<Target className="h-4 w-4 text-[hsl(var(--primary))]" />}>
            <div className="flex items-center gap-3">
              <Ring value={62.4} />
              <div className="min-w-0">
                <p className="tabular-nums text-2xl font-bold text-foreground">62,4 %</p>
                <p className="mt-1 text-xs text-muted-foreground">154 / 247</p>
              </div>
            </div>
          </KpiCard>
          <KpiCard title="Profit Factor" value="1,87" icon={<Target className="h-4 w-4 text-green-500" />}
            sub={<span className="font-medium text-green-500">Solide</span>} />
          <KpiCard title="Meilleur jour" tone="up" value="+1 240 €" sub="12 juil. 2026"
            icon={<CalendarDays className="h-4 w-4 text-green-500" />} />
        </div>

        {/* IA Row */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel eyebrow="Intelligence artificielle" title="Score de trading"
            action={<Brain className="h-4 w-4 text-[hsl(var(--primary))]" />}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Ring value={78} size={92} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="tabular-nums text-xl font-bold text-foreground">78</span>
                  <span className="text-[9px] text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">Trader discipliné</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Excellente gestion du risque. Principal axe de progression : laisser courir les gains
                  gagnants (+11 % de PnL potentiel).
                </p>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Comportements" title="Biais détectés"
            action={<Sparkles className="h-4 w-4 text-[hsl(141_92%_46%)]" />}>
            <div className="space-y-3">
              {BEHAVIORS.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="tabular-nums font-bold text-foreground">{b.value} %</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className={cn('h-full rounded-full', b.tone === 'good' ? 'bg-[hsl(141_92%_46%)]' : 'bg-amber-400')}
                      style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Contenu principal */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">

            {/* Courbe equity */}
            <Panel eyebrow="Courbe equity" title="Évolution de la performance"
              action={
                <span className="rounded-md bg-green-500/10 px-2 py-1 text-xs font-bold text-green-500">
                  +12 480 € ce mois
                </span>
              }>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={EQUITY} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="demo-eq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={5} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={44}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v.toLocaleString('fr-FR')} €`, 'PnL cumulé']}
                      labelFormatter={(l) => `Jour ${l}`}
                      contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                    <Area type="monotone" dataKey="pnl" stroke="#16a34a" strokeWidth={2.5} fill="url(#demo-eq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Bandeau analyse IA */}
            <div className="flex items-start gap-4 rounded-lg border border-[hsl(var(--primary)/0.25)] bg-gradient-to-r from-[hsl(243_90%_97%)] to-[hsl(141_92%_97%)] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
                <Brain className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">Analyse hebdomadaire de l'IA</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Vos entrées sur cassure de Londres sont vos plus rentables (+4 820 €). Attention : vos trades
                  « news » pèsent sur la performance (-540 €). Réduire leur taille améliorerait votre profit factor à 2,1.
                </p>
              </div>
            </div>

            {/* Répartition + Stratégies */}
            <div className="grid gap-5 2xl:grid-cols-2">
              <Panel eyebrow="Répartition" title="Actifs tradés">
                <div className="flex items-center gap-5">
                  <DonutChart data={ASSETS} />
                  <div className="min-w-0 flex-1 space-y-2">
                    {ASSETS.map((a) => (
                      <div key={a.name} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />{a.name}
                        </span>
                        <span className="tabular-nums font-bold text-foreground">{a.pct} %</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel eyebrow="Performance" title="Par stratégie">
                <div className="space-y-3">
                  {STRATEGIES.map((s) => {
                    const pos = s.pnl >= 0
                    return (
                      <div key={s.name}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="truncate text-muted-foreground">{s.name}</span>
                          <span className={cn('tabular-nums font-bold', pos ? 'text-green-500' : 'text-red-500')}>{fmt(s.pnl)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                          <div className={cn('h-full rounded-full', pos ? 'bg-emerald-500' : 'bg-red-400')}
                            style={{ width: `${Math.abs(s.pct)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </div>

            {/* Table des trades */}
            <Panel eyebrow="Journal" title="Derniers trades">
              <div className="overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 font-semibold">Actif</th>
                      <th className="pb-2 font-semibold">Sens</th>
                      <th className="pb-2 font-semibold">Taille</th>
                      <th className="pb-2 text-right font-semibold">Résultat</th>
                      <th className="pb-2 text-right font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRADES.map((t) => {
                      const pos = t.pnl >= 0
                      return (
                        <tr key={t.sym + t.when} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 font-semibold text-foreground">{t.sym}</td>
                          <td className="py-2.5">
                            <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium',
                              t.side === 'Achat' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                              {t.side === 'Achat' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {t.side}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted-foreground">{t.size}</td>
                          <td className={cn('py-2.5 text-right tabular-nums font-bold', pos ? 'text-green-500' : 'text-red-500')}>{fmt(t.pnl)}</td>
                          <td className="py-2.5 text-right text-muted-foreground">{t.when}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Sidebar droite */}
          <aside className="min-w-0 space-y-5">
            <Panel eyebrow="Contrôle" title="Gestion du risque"
              action={<ShieldCheck className="h-4 w-4 text-green-500" />}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Ring value={82} color="#16a34a" size={80} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="tabular-nums text-lg font-bold text-foreground">82</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-1 text-xs">
                  <p className="font-bold text-green-500">Risque maîtrisé</p>
                  <p className="text-muted-foreground">Exposition : <span className="tabular-nums font-bold text-foreground">2,1 %</span></p>
                  <p className="text-muted-foreground">Marge libre : <span className="tabular-nums font-bold text-foreground">86 %</span></p>
                </div>
              </div>
            </Panel>

            <Panel eyebrow="Lecture rapide" title="Statistiques clés">
              <div className="grid grid-cols-2 gap-3">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-md border border-border bg-muted p-3">
                    <p className="tabular-nums text-sm font-bold text-foreground">{s.value}</p>
                    <p className="mt-0.5 text-[10px] leading-3 text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel eyebrow="Agenda" title="Économique du jour">
              <div className="space-y-2.5">
                {EVENTS.map((e) => (
                  <div key={e.title} className="flex items-center gap-3">
                    <span className="tabular-nums text-xs font-bold text-muted-foreground">{e.time}</span>
                    <span className={cn('h-2 w-2 shrink-0 rounded-full',
                      e.impact === 'high' ? 'bg-red-500' : 'bg-amber-400')} />
                    <span className="truncate text-xs text-foreground">{e.title}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>

      </div>
    </div>
  )
}

/* ── Donut ────────────────────────────────────────────────────────────────── */

function DonutChart({ data }: { data: { name: string; pct: number; color: string }[] }) {
  const r = 32
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
      {data.map((d) => {
        const len = (d.pct / 100) * c
        const seg = (
          <circle key={d.name} cx="48" cy="48" r={r} fill="none" stroke={d.color} strokeWidth="12"
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 48 48)" />
        )
        offset += len
        return seg
      })}
    </svg>
  )
}
