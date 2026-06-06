'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, BookOpen, Brain, Calendar, Check,
  Database, Menu, PlayCircle, X,
} from 'lucide-react'
import { setToken } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/* ─── Brand ─────────────────────────────────────────────────────────────── */

function BrandIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={cn('text-current', className)} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 27V13l8 8 8-8v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── CTA / Demo buttons ─────────────────────────────────────────────────── */

function PrimaryButton({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex justify-center items-center px-8 py-2.5 h-10',
        'bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary)/0.9)]',
        'shadow-[0_0_0_6px_hsl(var(--sidebar-primary)/0.1),0_0_0_2px_hsl(var(--sidebar-primary)/0.25),0_1px_3px_rgba(0,0,0,0.1)]',
        'hover:shadow-[0_0_0_6px_hsl(var(--sidebar-primary)/0.2),0_0_0_2px_hsl(var(--sidebar-primary)/0.35),0_2px_4px_rgba(0,0,0,0.2)]',
        'rounded-xl transition-all duration-200',
        className,
      )}
    >
      <span className="font-medium text-sm text-white">{children}</span>
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
        'inline-flex items-center gap-2 px-6 py-2.5 h-10 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60',
        className,
      )}
    >
      {loading
        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : <PlayCircle className="h-4 w-4" />}
      Voir la demo
    </button>
  )
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

const mobileListVariant = {
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  hidden: { opacity: 0 },
}
const mobileItemVariant = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const navLinks = [
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const control = () => {
      const scrollPct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      if (scrollPct <= 25) { setIsVisible(true) }
      else if (window.scrollY > lastScrollY) { setIsVisible(false) }
      else { setIsVisible(true) }
      setLastScrollY(window.scrollY)
    }
    window.addEventListener('scroll', control)
    return () => window.removeEventListener('scroll', control)
  }, [lastScrollY])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const transCls = `transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`

  return (
    <>
      {/* Backdrop blur sur hover des nav items — identique deltalytix */}
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${hoveredItem ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      <span className={cn('h-14 fixed top-0 left-0 right-0 bg-background z-50', transCls)} />
      <header className={cn('max-w-7xl mx-auto fixed top-0 left-0 right-0 px-4 lg:px-6 h-14 flex items-center justify-between z-50 text-foreground', transCls)}>
        <Link href="/" className="flex items-center space-x-2">
          <BrandIcon className="h-6 w-6 text-[hsl(var(--sidebar-primary))]" />
          <span className="font-bold text-xl">MERKURE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center">
          <nav className="flex items-center">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onMouseEnter={() => setHoveredItem(l.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <span className="h-6 w-px bg-border mx-4" />
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
          >
            Se connecter
          </Link>
        </div>

        <button type="button" className="lg:hidden p-2 text-foreground" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-background z-40" />
            <motion.div
              className="fixed inset-0 z-50 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <motion.div
                className="mt-4 flex justify-between items-center py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <BrandIcon className="h-6 w-6 text-[hsl(var(--sidebar-primary))]" />
                  <span className="font-black text-xl tracking-[0.12em]">MERKURE</span>
                </Link>
                <button type="button" className="p-2" onClick={() => setIsOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </motion.div>
              <motion.ul initial="hidden" animate="show" className="pt-10 text-xl text-muted-foreground space-y-8" variants={mobileListVariant}>
                {navLinks.map((l) => (
                  <motion.li key={l.href} variants={mobileItemVariant}>
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <a href={l.href} className="block hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>{l.label}</a>
                    </motion.div>
                  </motion.li>
                ))}
                <motion.li className="border-t border-border pt-8" variants={mobileItemVariant}>
                  <Link href="/sign-in" className="text-xl text-[hsl(var(--sidebar-primary))]" onClick={() => setIsOpen(false)}>Se connecter</Link>
                </motion.li>
                <motion.li variants={mobileItemVariant}>
                  <PrimaryButton href="/sign-up" className="w-full h-12 text-base">Demarrer gratuitement</PrimaryButton>
                </motion.li>
              </motion.ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Dashboard Mockup ───────────────────────────────────────────────────── */

function DashboardMockup() {
  const pts = '0,146 52,138 104,120 156,132 208,96 260,72 312,88 364,56 416,42 468,24 520,18'
  return (
    <div className="overflow-hidden rounded-[14.5867px] border-[1.82333px] border-gray-800 bg-card">
      <div className="grid min-h-[260px] sm:min-h-[360px] md:min-h-[440px] lg:grid-cols-[164px_1fr]">
        <aside className="hidden border-r border-border bg-[hsl(var(--sidebar-background))] p-4 lg:block">
          <div className="flex items-center gap-2 mb-7">
            <BrandIcon className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            <span className="font-black text-sm tracking-[0.12em]">MERKURE</span>
          </div>
          <nav className="grid gap-1 text-xs font-medium text-muted-foreground">
            {['Dashboard', 'Analyse', 'Journal', 'Objectifs', 'Alertes', 'Parametres'].map((item, i) => (
              <span key={item} className={cn('rounded-md px-3 py-2', i === 0 ? 'bg-[hsl(var(--sidebar-accent))] font-medium text-foreground' : '')}>{item}</span>
            ))}
          </nav>
        </aside>
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Vue d'ensemble - 30 jours</h3>
            <span className="rounded-md border border-[hsl(var(--sidebar-primary)/0.3)] bg-[hsl(var(--sidebar-primary)/0.08)] px-3 py-1 text-[11px] text-[hsl(var(--sidebar-primary))]">Mai 2026</span>
          </div>
          <div className="grid gap-2 grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Profit net', value: '+2 450 EUR', up: true },
              { label: 'Win Rate', value: '61,4%', up: true },
              { label: 'Profit Factor', value: '1,72', up: true },
              { label: 'Drawdown Max', value: '-8,4%', up: false },
            ].map(({ label, value, up }) => (
              <div key={label} className="rounded-lg border border-border bg-background p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={cn('mt-2 font-mono text-lg font-semibold', up ? 'text-emerald-400' : 'text-red-400')}>{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <p className="mb-3 text-xs font-medium text-foreground">Evolution de la performance</p>
            <svg viewBox="0 0 520 160" className="h-36 w-full" aria-hidden="true">
              <defs>
                <linearGradient id="hg" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="hsl(var(--sidebar-primary))" stopOpacity="0.3" />
                  <stop offset="1" stopColor="hsl(var(--sidebar-primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 80, 120].map((y) => <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 8" />)}
              <path d={`M${pts} L520,160 L0,160 Z`} fill="url(#hg)" />
              <polyline points={pts} fill="none" stroke="hsl(var(--sidebar-primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="container px-4 md:px-6 mx-auto">
      <div className="flex flex-col w-full gap-y-10 sm:gap-y-16 md:gap-y-24">
        <div className="flex flex-col justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto sm:mb-8 inline-flex items-center px-4 py-2 h-[26px] bg-[hsl(var(--sidebar-primary)/0.08)] border border-[hsl(var(--sidebar-primary)/0.3)] rounded-[26px] text-[10px] font-semibold leading-5 tracking-[0.35px] uppercase text-[hsl(var(--sidebar-primary)/0.8)]">
              Plateforme de performance trading
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Devenez le trader que vos emotions empechent d'etre.
            </h1>
            <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
              MERKURE analyse vos trades en profondeur, detecte vos biais comportementaux et vous donne un plan d'amelioration clair pour performer durablement.
            </p>
          </div>
          <div className="flex w-full justify-center gap-3 flex-wrap">
            <PrimaryButton href="/sign-up">Demarrer mon analyse IA</PrimaryButton>
            <DemoButton />
          </div>
        </div>
        <div className="flex w-full items-center justify-center relative rounded-lg">
          <div className="relative w-full h-full">
            <span className="absolute inset-[-12px] md:inset-[-24px] bg-[hsl(var(--sidebar-primary)/0.15)] rounded-[14.5867px] -z-10 animate-pulse" />
            <span className="absolute inset-[-4px] md:inset-[-8px] bg-[hsl(var(--sidebar-primary)/0.25)] rounded-[14.5867px] -z-20 animate-pulse" />
            <span className="absolute inset-0 shadow-[0_9.1167px_13.675px_-2.735px_hsl(var(--sidebar-primary)/0.1)] md:shadow-[0_18.2333px_27.35px_-5.47px_hsl(var(--sidebar-primary)/0.1)] rounded-[14.5867px] -z-30" />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Partners ───────────────────────────────────────────────────────────── */

function Partners() {
  const brokers = ['MT4', 'MT5', 'cTrader', 'Binance', 'TopStep', 'FTMO']
  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-5xl">Compatible avec vos plateformes</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
            Synchronisez vos comptes en lecture seule depuis n'importe quel broker ou prop firm.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 items-center justify-items-center w-full mt-8">
          {brokers.map((b) => (
            <div key={b} className="flex h-12 w-full max-w-[140px] items-center justify-center rounded-lg border border-border bg-card px-4">
              <span className="text-sm font-semibold text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Features ───────────────────────────────────────────────────────────── */

function JournalMockup() {
  const msgs = [
    { ai: true, text: 'EUR/USD : entree trop tardive apres cassure. RR sous-optimal 1:1.2. Zone optimale 8-12 pips plus bas.' },
    { ai: false, text: 'Comment ameliorer mon entree ?' },
    { ai: true, text: 'Attendez la cloture de la bougie de confirmation. Sur vos 47 derniers trades, cette regle ameliore le win rate de +11%.' },
  ]
  return (
    <div className="flex flex-col gap-2 p-2 w-full">
      {msgs.map((m, i) => (
        <div key={i} className={cn('rounded-xl px-3 py-2 text-xs max-w-[90%]', m.ai ? 'bg-muted text-foreground self-start' : 'bg-[hsl(var(--sidebar-primary)/0.15)] text-[hsl(var(--sidebar-primary))] self-end')}>
          {m.text}
        </div>
      ))}
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <span className="flex-1 text-xs text-muted-foreground">Poser une question sur ce trade...</span>
        <div className="h-5 w-5 rounded-full bg-[hsl(var(--sidebar-primary))]" />
      </div>
    </div>
  )
}

function PerformanceMockup() {
  const bars = [32, 48, 22, 65, 55, 80, 45, 92, 60, 75, 58, 88]
  return (
    <div className="flex items-end gap-1.5 h-[200px] w-full px-2 pb-2">
      {bars.map((h, i) => (
        <div key={i} className="flex-1">
          <div style={{ height: `${h}%` }} className={cn('w-full rounded-sm', h > 60 ? 'bg-[hsl(var(--sidebar-primary)/0.8)]' : h > 40 ? 'bg-[hsl(var(--sidebar-primary)/0.5)]' : 'bg-[hsl(var(--sidebar-primary)/0.25)]')} />
        </div>
      ))}
    </div>
  )
}

function CalendarMockup() {
  const days = [null, null, [120, true], [-45, false], [230, true], [180, true], null,
    [-90, false], [310, true], [150, true], null, [290, true], [-60, false], [400, true],
    [220, true], [-30, false], [190, true], [340, true], [120, true], null, null]
  return (
    <div className="w-full p-2">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['L','M','M','J','V','S','D'].map((d, i) => <span key={i} className="text-center text-[10px] text-muted-foreground">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className={cn('aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium',
            !d ? '' : (d[1] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'))}>
            {d && (Number(d[0]) > 0 ? `+${d[0]}` : d[0])}
          </div>
        ))}
      </div>
    </div>
  )
}

function ImportMockup() {
  return (
    <div className="flex flex-col gap-3 w-full p-2">
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 py-6">
        <Database className="h-8 w-8 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground">Glisser un fichier CSV / MT4 / MT5</span>
      </div>
      <p className="text-center text-xs text-muted-foreground">ou connecter directement</p>
      {['MetaTrader 4', 'MetaTrader 5', 'cTrader'].map((b) => (
        <div key={b} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
          <span className="text-xs font-medium text-foreground">{b}</span>
          <span className="rounded-md bg-[hsl(var(--sidebar-primary)/0.1)] px-2 py-0.5 text-[10px] text-[hsl(var(--sidebar-primary))]">Connecter</span>
        </div>
      ))}
    </div>
  )
}

function Features() {
  const cards = [
    { id: 'ai-journaling', title: 'Journal IA', icon: <Brain className="h-5 w-5 text-muted-foreground" />, stat: '+37% de progression', desc: "L'IA analyse chaque trade, detecte vos erreurs recurrentes et vous propose un plan d'amelioration personnalise.", preview: <JournalMockup /> },
    { id: 'performance-visualization', title: 'Visualisation performance', icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />, stat: '20+ metriques', desc: 'Win rate, profit factor, esperance mathematique, Sharpe... Toutes vos statistiques au meme endroit.', preview: <PerformanceMockup />, minH: 'min-h-[420px]' },
    { id: 'daily-performance', title: 'Performance journaliere', icon: <Calendar className="h-5 w-5 text-muted-foreground" />, stat: 'Vue calendrier', desc: 'Identifiez vos meilleures sessions, vos jours problematiques et vos patterns hebdomadaires.', preview: <CalendarMockup />, minH: 'min-h-[420px] lg:min-h-[480px]' },
    { id: 'data-import', title: 'Import multi-source', icon: <Database className="h-5 w-5 text-muted-foreground" />, stat: '10+ sources', desc: 'Importez depuis MT4, MT5, cTrader, CSV ou synchronisez via MetaApi en temps reel.', preview: <ImportMockup /> },
  ]

  return (
    <main id="features" className="container mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">Des outils pour chaque dimension du trading</h2>
      <p className="text-base sm:text-lg md:text-xl text-center text-gray-600 dark:text-gray-400 mb-8 md:mb-12">Identifiez vos forces, corrigez vos faiblesses, progressez vraiment.</p>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {cards.map((f, index) => (
          <Card id={f.id} key={f.id} className={cn('bg-card', index < 2 ? 'lg:col-span-3' : index === 2 ? 'lg:col-span-4' : 'lg:col-span-2')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{f.title}</CardTitle>
              {f.icon}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div>
                  <div className="text-2xl font-bold">{f.stat}</div>
                  <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                </div>
                <div className={cn('relative w-full flex justify-center items-center rounded-xl overflow-hidden', f.minH ?? 'h-[300px]')}>
                  {f.preview}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */

const PLANS = [
  { name: 'Starter', price: '9', sub: 'Pour commencer', features: ['1 compte MT4/MT5', 'Toutes les métriques', 'Journal IA de base', 'Support prioritaire'] },
  { name: 'Pro', price: '19', sub: 'Pour traders actifs', features: ['2 comptes MT4/MT5', 'Analyses avancées', 'Insights IA illimités', 'Alertes intelligentes'], popular: true },
  { name: 'Elite', price: '49', sub: 'Pour traders exigeants', features: ['5 comptes MT4/MT5', 'Deep analytics', 'Backtesting avancé', 'Export & rapports pro'] },
  { name: 'Agency', price: '149', sub: 'Pour prop firms & coachs', features: ['20 comptes MT4/MT5', 'Multi-utilisateurs', 'API complète', 'Support dédié'] },
  { name: 'Free', price: '0', sub: 'Pour découvrir', features: ['Import CSV uniquement', 'Métriques de base', 'Journal limité'] },
]

function PricingSection() {
  return (
    <section id="tarifs" className="container mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">Un plan pour chaque trader</h2>
      <p className="text-base sm:text-xl text-center text-gray-600 dark:text-gray-400 mb-8 md:mb-12">Du débutant à la prop firm.</p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {PLANS.map((plan) => (
          <article key={plan.name} className={cn('relative rounded-xl border p-5 flex flex-col', (plan as { popular?: boolean }).popular ? 'border-[hsl(var(--sidebar-primary)/0.5)] bg-[hsl(var(--sidebar-primary)/0.05)]' : 'border-border bg-card')}>
            {(plan as { popular?: boolean }).popular && (
              <span className="absolute right-4 top-4 rounded-full bg-[hsl(var(--sidebar-primary))] px-2 py-0.5 text-[9px] font-semibold uppercase text-white">Populaire</span>
            )}
            <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.sub}</p>
            <p className="mt-5 font-mono text-4xl font-bold text-foreground">{plan.price}€<span className="text-sm font-medium text-muted-foreground"> /mois</span></p>
            <ul className="mt-5 flex-1 grid gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{f}
                </li>
              ))}
            </ul>
            <PrimaryButton href="/sign-up" className="mt-6 w-full h-9 text-sm">
              {plan.name === 'Agency' ? 'Nous contacter' : 'Commencer'}
            </PrimaryButton>
          </article>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Tous les plans incluent la securisation des donnees, la synchronisation en temps reel et un support reactif.</p>
    </section>
  )
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

const FAQS = [
  { q: 'Comment MERKURE se connecte a mes comptes de trading ?', a: "MERKURE utilise MetaApi pour une connexion en lecture seule a votre broker MT4/MT5. Aucun acces en ecriture n'est jamais accorde - vos fonds sont 100% proteges." },
  { q: 'Mes donnees sont-elles securisees ?', a: "Toutes vos donnees sont chiffrees et hebergees en Europe. Nous n'accedons jamais a vos identifiants broker et ne partageons aucune donnee avec des tiers." },
  { q: 'Est-ce que MERKURE fonctionne avec les prop firms ?', a: 'Oui. MERKURE est compatible avec la plupart des prop firms qui utilisent MT4, MT5 ou cTrader (FTMO, TopStep, MyForexFunds...).' },
  { q: 'Quelle est la difference entre le plan Free et Pro ?', a: 'Le plan Free permet l\'import CSV manuel avec des metriques basiques. Le plan Pro ajoute la synchronisation temps reel, les insights IA illimites et les alertes de risque.' },
  { q: 'Puis-je annuler a tout moment ?', a: "Oui, sans engagement. Vous pouvez annuler votre abonnement depuis les parametres et conserver l'acces jusqu'a la fin de la periode payee." },
  { q: 'Comment fonctionne l\'analyse IA ?', a: "L'IA analyse vos trades selon 20+ criteres (timing, risque, symbole, session...), detecte vos patterns comportementaux et genere des recommandations personnalisees chaque semaine." },
]

function FAQSection() {
  return (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Questions fréquentes</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="border-b border-border pb-4 group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-4 text-foreground hover:text-[hsl(var(--sidebar-primary))] transition-colors">
                {q}
                <span className="shrink-0 text-lg text-muted-foreground group-open:rotate-45 transition-transform duration-200 inline-block">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Community ──────────────────────────────────────────────────────────── */

function CommunitySection() {
  return (
    <div className="px-4 mb-8 md:mb-16 lg:mb-32">
      <div className="mb-6 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-4 font-medium text-[hsl(var(--sidebar-primary))]">
          +10 000 traders font confiance a MERKURE
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-[500px]">
          Rejoignez une communaute qui utilise la data pour progresser, pas l'instinct.
        </p>
      </div>
      <Card className="border border-border bg-background p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8 xl:space-x-16 gap-8">
          <div className="lg:basis-1/2 space-y-0">
            {[
              { icon: <Brain className="h-5 w-5 md:h-6 md:w-6" />, title: 'IA de journalisation', desc: "Chaque trade est analyse automatiquement pour detecter vos biais et patterns comportementaux." },
              { icon: <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />, title: 'Analytics avances', desc: "Plus de 20 metriques de performance pour comprendre exactement ou vous gagnez et ou vous perdez." },
              { icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6" />, title: 'Roadmap publique', desc: "Suivez et votez pour les prochaines fonctionnalites. Votre feedback guide notre developpement." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="border-b border-border py-4 last:border-0">
                <div className="flex items-center space-x-2 text-[hsl(var(--sidebar-primary))] mb-2">
                  {icon}
                  <span className="text-sm md:text-base lg:text-lg font-medium">{title}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="lg:basis-1/2">
            <Card className="w-full h-full border border-border bg-card p-4 md:p-6 flex flex-col gap-4">
              <div className="text-center py-4">
                <p className="font-mono text-5xl font-bold text-[hsl(var(--sidebar-primary))]">+10K</p>
                <p className="text-sm text-muted-foreground mt-1">traders actifs</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[{ v: '2M+', l: 'Trades analyses' }, { v: '98%', l: 'Satisfaction' }, { v: '24/7', l: 'Synchronisation' }].map(({ v, l }) => (
                  <div key={l} className="rounded-lg border border-border bg-background p-3">
                    <p className="font-mono text-xl font-bold text-foreground">{v}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-2">
                <PrimaryButton href="/sign-up" className="w-full h-10">Rejoindre MERKURE</PrimaryButton>
                <DemoButton className="w-full justify-center" />
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  const nav = {
    product: [
      { name: 'Fonctionnalites', href: '#features' },
      { name: 'Tarifs', href: '#tarifs' },
      { name: 'Prop firms', href: '#tarifs' },
      { name: 'FAQ', href: '#faq' },
    ],
    company: [
      { name: 'A propos', href: '#' },
      { name: 'Contact', href: 'mailto:support@merkure360.com' },
    ],
    legal: [
      { name: 'Confidentialite', href: '/legal/confidentialite' },
      { name: 'CGU', href: '/legal/cgu' },
      { name: 'Mentions legales', href: '/legal/mentions-legales' },
    ],
  }
  return (
    <footer className="py-12 max-w-7xl mx-auto">
      <div className="container mx-auto px-4">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <BrandIcon className="h-7 w-7 text-[hsl(var(--sidebar-primary))]" />
              <h3 className="text-lg font-black tracking-[0.12em] text-foreground">MERKURE</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">La plateforme de performance trading qui transforme vos donnees en edge durable.</p>
            <div className="flex space-x-6">
              <a href="https://discord.gg/merkure" className="text-gray-400 hover:text-gray-300" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Discord</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 md:col-span-2 md:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold leading-6 text-foreground">Produit</h4>
                <ul className="mt-6 space-y-4">
                  {nav.product.map((item) => (
                    <li key={item.name}><a href={item.href} className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{item.name}</a></li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h4 className="text-sm font-semibold leading-6 text-foreground">Entreprise</h4>
                <ul className="mt-6 space-y-4">
                  {nav.company.map((item) => (
                    <li key={item.name}><a href={item.href} className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{item.name}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold leading-6 text-foreground">Legal</h4>
              <ul className="mt-6 space-y-4">
                {nav.legal.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} MERKURE. Tous droits reserves.</div>
          <div className="mt-4 text-center text-xs text-gray-500">Le trading comporte des risques de perte en capital. Les performances passees ne prejudgent pas des performances futures.</div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Root ───────────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-2 sm:px-6 lg:px-32">
        <Navbar />
        <div className="mt-8 sm:mt-20 max-w-screen-xl mx-auto">
          <main className="flex flex-col gap-16 sm:gap-24 md:gap-28">
            <section className="w-full py-14 md:py-12 lg:py-16 xl:py-24">
              <Hero />
            </section>
            <section className="w-full">
              <Partners />
            </section>
            <section className="w-full">
              <Features />
            </section>
            <section className="w-full">
              <PricingSection />
            </section>
            <section className="w-full">
              <FAQSection />
            </section>
            <section className="w-full">
              <CommunitySection />
            </section>
          </main>
        </div>
        <Footer />
      </div>
    </div>
  )
}
