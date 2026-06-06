'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight, Brain, Check, Lock, NotebookPen,
  PieChart, PlayCircle, Server, ShieldCheck,
  Sparkles, Star, Target, TrendingUp, type LucideIcon,
} from 'lucide-react'
import { setToken } from '@/lib/api-client'
import { cn } from '@/lib/utils'

/* ─── Data ──────────────────────────────────────────────────────────────── */

const navLinks = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#apropos', label: 'À propos' },
]

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: TrendingUp, title: 'Performance', text: 'Win rate, profit factor, espérance, RR…' },
  { icon: ShieldCheck, title: 'Risque', text: 'Drawdown, daily risk, max loss, Sharpe…' },
  { icon: PieChart, title: 'Sessions', text: 'Heatmaps, horaires, jours les plus rentables' },
  { icon: NotebookPen, title: 'Journal IA', text: 'Chaque trade analysé et noté' },
  { icon: Sparkles, title: 'Insights IA', text: 'Recommandations personnalisées' },
  { icon: Target, title: 'Tracking avancé', text: 'Objectifs, habitudes, streaks, KPIs' },
]

const plans = [
  { name: 'Starter', price: '9€', subtitle: 'Parfait pour commencer', features: ['1 compte MT4/MT5', 'IA & insights de base', 'Journal de trading', 'Support prioritaire'] },
  { name: 'Pro', price: '19€', subtitle: 'Pour traders actifs', features: ['2 comptes MT4/MT5', 'Analyses avancées', 'Insights IA illimités', 'Alertes intelligentes'], popular: true },
  { name: 'Elite', price: '49€', subtitle: 'Pour traders exigeants', features: ['5 comptes MT4/MT5', 'Deep analytics', 'Backtesting avancé', 'Export & rapports pro'] },
  { name: 'Agency', price: '149€', subtitle: 'Pour prop firms & coachs', features: ['20 comptes MT4/MT5', 'Gestion multi-utilisateurs', 'API & accès complet', 'Support dédié'] },
  { name: 'Free', price: '0€', subtitle: 'Pour découvrir', features: ['Import CSV uniquement', 'Fonctions limitées', 'Pas de MetaApi'] },
]

const testimonials = [
  { name: 'Alex D.', role: 'Trader Forex', quote: 'Enfin un outil qui me montre exactement où je me trompe.' },
  { name: 'Julien M.', role: 'Swing Trader', quote: 'Mes résultats ont augmenté de 37% grâce aux insights IA.' },
  { name: 'Thomas B.', role: 'Prop Trader', quote: 'Le dashboard le plus complet que j\'ai jamais utilisé.' },
]

const brokerLogos = [
  { name: 'MetaTrader 4', src: '/partners/metatrader-4.png', width: 120, height: 60 },
  { name: 'MetaTrader 5', src: '/partners/metatrader-5.png', width: 120, height: 60 },
  { name: 'cTrader', src: '/brokers/ctrader.png', width: 128, height: 56 },
  { name: 'Binance', src: '/brokers/binance.svg', width: 130, height: 40 },
]

/* ─── Logo / Brand ──────────────────────────────────────────────────────── */

function BrandIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={cn('text-current', className)} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 27V13l8 8 8-8v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="MERKURE">
      <BrandIcon className={cn('h-7 w-7', light ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-primary))]')} />
      <span className={cn('text-[17px] font-black tracking-[0.12em]', light ? 'text-foreground' : 'text-foreground')}>
        MERKURE
      </span>
    </Link>
  )
}

/* ─── Buttons ───────────────────────────────────────────────────────────── */

function PrimaryCta({ children = 'Démarrer gratuitement', href = '/sign-up', className = '' }: { children?: string; href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200',
        'bg-[hsl(var(--sidebar-primary))]',
        'shadow-[0_0_0_4px_hsl(var(--sidebar-primary)/0.12),0_0_0_1px_hsl(var(--sidebar-primary)/0.3),0_1px_3px_rgba(0,0,0,0.2)]',
        'hover:shadow-[0_0_0_6px_hsl(var(--sidebar-primary)/0.2),0_0_0_2px_hsl(var(--sidebar-primary)/0.4),0_2px_6px_rgba(0,0,0,0.3)]',
        'hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

function DemoButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  const handleDemo = async () => {
    setLoading(true)
    try {
      const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${api}/api/v1/auth/demo`, { method: 'POST' })
      const data = await res.json() as { token?: string; error?: string }
      if (!res.ok || !data.token) throw new Error(data.error ?? 'demo_login_failed')
      setToken(data.token)
      window.location.href = '/app/dashboard'
    } catch (err) {
      console.error('Demo login failed:', err)
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDemo}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60',
        className,
      )}
    >
      {loading
        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : <PlayCircle className="h-4 w-4" />}
      Voir la démo
    </button>
  )
}

/* ─── Navbar ────────────────────────────────────────────────────────────── */

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Se connecter
          </Link>
          <PrimaryCta href="/sign-up">Démarrer gratuitement</PrimaryCta>
        </div>
      </div>
    </header>
  )
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-20 pt-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-16">

        {/* Text block — centered */}
        <div className="flex flex-col items-center space-y-6 text-center">
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--sidebar-primary)/0.3)] bg-[hsl(var(--sidebar-primary)/0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-primary))]">
            Plateforme de performance trading
          </span>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            Devenez le trader que vos{' '}
            <span className="text-[hsl(var(--sidebar-primary))]">émotions</span>{' '}
            empêchent d&apos;être.
          </h1>

          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            MERKURE analyse vos décisions en profondeur, détecte vos biais comportementaux
            et vous donne un plan d&apos;amélioration clair pour performer durablement.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <PrimaryCta href="/sign-up" className="h-11 px-8 text-base">
              Démarrer mon analyse IA
            </PrimaryCta>
            <DemoButton className="h-11 px-8 text-base" />
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {['Aucune carte bancaire', 'Analyse en 2 min', 'Résultats immédiats'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </span>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {['YD', 'AM', 'JL'].map((initials) => (
                <span
                  key={initials}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[hsl(var(--sidebar-primary)/0.2)] text-xs font-semibold text-[hsl(var(--sidebar-primary))]"
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">+10 000 traders</span> nous font confiance
            </p>
          </div>
        </div>

        {/* Dashboard mockup with glow */}
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-[-16px] -z-10 rounded-2xl bg-[hsl(var(--sidebar-primary)/0.08)] blur-xl" />
          <div className="pointer-events-none absolute inset-[-4px] -z-20 rounded-2xl bg-[hsl(var(--sidebar-primary)/0.12)]" />
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}

/* ─── Dashboard Mockup ──────────────────────────────────────────────────── */

function DashboardMockup() {
  const chartPoints = '0,146 52,138 104,120 156,132 208,96 260,72 312,88 364,56 416,42 468,24 520,18'

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <div className="grid min-h-[460px] lg:grid-cols-[164px_1fr]">
        {/* Sidebar mockup */}
        <aside className="hidden border-r border-border bg-[hsl(var(--sidebar-background))] p-4 lg:block">
          <BrandMark />
          <nav className="mt-7 grid gap-1 text-xs font-medium text-muted-foreground">
            {['Dashboard', 'Analyse', 'Journal', 'Objectifs', 'Alertes', 'Paramètres'].map((item, index) => (
              <span
                key={item}
                className={cn(
                  'rounded-md px-3 py-2 transition-colors',
                  index === 0
                    ? 'bg-[hsl(var(--sidebar-accent))] font-medium text-foreground'
                    : 'hover:bg-[hsl(var(--sidebar-accent))]',
                )}
              >
                {item}
              </span>
            ))}
          </nav>
        </aside>

        {/* Content mockup */}
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-foreground">Vue d&apos;ensemble</h3>
            <span className="rounded-md border border-border px-3 py-1 text-[11px] text-muted-foreground">30 derniers jours</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Profit net', value: '+2 450,75 €', trend: '+12,4%', up: true },
              { label: 'Win Rate', value: '61,42%', trend: '+4,3%', up: true },
              { label: 'Profit Factor', value: '1,72', trend: '+0,31', up: true },
              { label: 'Drawdown Max', value: '-8,37%', trend: '-2,11%', up: false },
            ].map(({ label, value, trend, up }) => (
              <div key={label} className="rounded-lg border border-border bg-background p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 font-mono text-lg font-semibold text-foreground">{value}</p>
                <p className={cn('mt-0.5 text-xs', up ? 'text-emerald-400' : 'text-red-400')}>{trend}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">Évolution de la performance</p>
                <span className="rounded-md border border-[hsl(var(--sidebar-primary)/0.3)] bg-[hsl(var(--sidebar-primary)/0.08)] px-2 py-0.5 text-[10px] text-[hsl(var(--sidebar-primary))]">
                  Mai 2026
                </span>
              </div>
              <svg viewBox="0 0 520 160" className="h-44 w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="mockChart" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="hsl(var(--sidebar-primary))" stopOpacity="0.3" />
                    <stop offset="1" stopColor="hsl(var(--sidebar-primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40, 80, 120].map((y) => (
                  <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 8" />
                ))}
                <path d={`M${chartPoints} L520,160 L0,160 Z`} fill="url(#mockChart)" />
                <polyline points={chartPoints} fill="none" stroke="hsl(var(--sidebar-primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-foreground">Insights IA</p>
                {['Meilleure perf. entre 9h–11h', 'Réduire le risque après 3 pertes', 'Edge sur les paires majeures'].map((item) => (
                  <p key={item} className="mb-1.5 rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Features ──────────────────────────────────────────────────────────── */

function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--sidebar-primary)/0.3)] bg-[hsl(var(--sidebar-primary)/0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-primary))]">
            Fonctionnalités
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tout ce qu&apos;un trader doit vraiment <span className="text-[hsl(var(--sidebar-primary))]">comprendre.</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Des outils précis pour identifier vos forces, corriger vos faiblesses et progresser.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--sidebar-primary)/0.2)] bg-[hsl(var(--sidebar-primary)/0.08)]">
                <Icon className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Problem ───────────────────────────────────────────────────────────── */

function ProblemSection() {
  const items: Array<{ icon: LucideIcon; title: string; text: string }> = [
    { icon: Server, title: 'Données éparpillées', text: 'Entre plusieurs plateformes, aucune vue globale.' },
    { icon: Lock, title: 'Performance inconnue', text: 'Impossible de mesurer son vrai edge sans données.' },
    { icon: Brain, title: 'Décisions émotionnelles', text: 'Sans analyse, le biais prend le dessus.' },
  ]

  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-red-400/30 bg-red-400/08 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-400">
              Le problème
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pourquoi <span className="text-[hsl(var(--sidebar-primary))]">90%</span> des traders stagnent.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">Sans données fiables, impossible de s&apos;améliorer.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-lg border border-border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-red-400/20 bg-red-400/08">
                <Icon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="mt-5 text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */

function PricingSection() {
  return (
    <section id="tarifs" className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--sidebar-primary)/0.3)] bg-[hsl(var(--sidebar-primary)/0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-primary))]">
            Tarifs
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Un plan pour chaque trader.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">Du débutant à la prop firm.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                'relative rounded-xl border p-5 transition-colors',
                plan.popular
                  ? 'border-[hsl(var(--sidebar-primary)/0.5)] bg-[hsl(var(--sidebar-primary)/0.05)]'
                  : 'border-border bg-card hover:bg-accent',
              )}
            >
              {plan.popular && (
                <span className="absolute right-4 top-4 rounded-full bg-[hsl(var(--sidebar-primary))] px-2 py-0.5 text-[9px] font-semibold uppercase text-white">
                  Populaire
                </span>
              )}
              <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{plan.subtitle}</p>
              <p className="mt-5 font-mono text-4xl font-bold text-foreground">
                {plan.price}
                <span className="text-sm font-medium text-muted-foreground"> /mois</span>
              </p>
              <ul className="mt-5 grid gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <PrimaryCta
                href="/sign-up"
                className={cn('mt-6 w-full py-2 text-sm', !plan.popular && 'bg-[hsl(var(--sidebar-primary)/0.85)] shadow-none hover:bg-[hsl(var(--sidebar-primary))]')}
              >
                {plan.name === 'Agency' ? 'Nous contacter' : 'Commencer'}
              </PrimaryCta>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Tous les plans incluent sécurisation, synchro temps réel et support réactif.
        </p>
      </div>
    </section>
  )
}

/* ─── Social proof ───────────────────────────────────────────────────────── */

function SocialProofSection() {
  return (
    <section id="apropos" className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ils améliorent leur trading avec MERKURE
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <article key={t.name} className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm leading-6 text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary)/0.15)] text-xs font-semibold text-[hsl(var(--sidebar-primary))]">
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </div>
                <span className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <p className="mb-5 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest">Compatible avec les meilleurs brokers</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {brokerLogos.map((logo) => (
              <div key={logo.name} className="flex h-16 w-36 items-center justify-center rounded-lg border border-border bg-background px-4 py-3">
                <Image src={logo.src} alt={`Logo ${logo.name}`} width={logo.width} height={logo.height} className="max-h-8 w-auto object-contain opacity-60 transition-opacity hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA final ──────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="border-t border-[hsl(var(--sidebar-primary)/0.2)] bg-[hsl(var(--sidebar-primary)/0.04)]">
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center rounded-full border border-[hsl(var(--sidebar-primary)/0.3)] bg-[hsl(var(--sidebar-primary)/0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-primary))]">
          Prêt à passer au niveau supérieur ?
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Votre edge commence ici.
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Rejoignez MERKURE et transformez vos données en performance.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <PrimaryCta href="/sign-up" className="h-11 px-10 text-base">
            Démarrer gratuitement
          </PrimaryCta>
          <DemoButton className="h-11 px-10 text-base" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Aucune carte bancaire requise</p>
      </div>
    </section>
  )
}

/* ─── Footer ────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <BrandMark />
        <nav className="flex flex-wrap justify-center gap-6">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
          <Link href="/legal/mentions-legales" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Mentions légales
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 MERKURE.</p>
      </div>
    </footer>
  )
}

/* ─── Root ──────────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <PricingSection />
        <SocialProofSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
