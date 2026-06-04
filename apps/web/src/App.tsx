'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart2,
  Bell,
  Brain,
  Check,
  Lock,
  Menu,
  NotebookPen,
  PieChart,
  PlayCircle,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react'

import { setToken } from '@/lib/api-client'

const navLinks = [
  { href: '#produit', label: 'Produit' },
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#ressources', label: 'Ressources' },
  { href: '#apropos', label: 'À propos' },
]

const heroPills: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Server, label: 'Connexion multi-brokers' },
  { icon: Brain, label: 'Analyse IA avancée' },
  { icon: NotebookPen, label: 'Journal de trading' },
  { icon: Bell, label: 'Alertes intelligentes' },
]

const operationalSteps: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Brain, title: 'Importer', text: 'Comptes et transactions' },
  { icon: Activity, title: 'Lire', text: 'Performance et risque' },
  { icon: Sparkles, title: 'Comprendre', text: 'Coach et journal IA' },
]

const stats = [
  { icon: Activity, value: '127 842', label: 'Trades analysés' },
  { icon: Brain, value: '+2.4M$', label: 'De données traitées' },
  { icon: Target, value: '83%', label: 'Des traders améliorent leur RR' },
  { icon: BarChart2, value: '18', label: 'Brokers compatibles' },
  { icon: Sparkles, value: '24/7', label: 'IA & système actif' },
]

const problemCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Server, title: 'Donnees eparpillees', text: 'Entre plusieurs plateformes' },
  { icon: Lock, title: 'Aucune vision claire', text: 'Performance reelle inconnue' },
  { icon: Brain, title: 'Decisions emotionnelles', text: 'Pas basees sur des faits' },
]

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: TrendingUp, title: 'Performance', text: 'Win rate, profit factor, esperance, RR...' },
  { icon: ShieldCheck, title: 'Risque', text: 'Drawdown, daily risk, max loss, Sharpe...' },
  { icon: PieChart, title: 'Sessions', text: 'Heatmaps, horaires, jours les plus rentables' },
  { icon: NotebookPen, title: 'Journal IA', text: 'Chaque trade analyse et note' },
  { icon: Sparkles, title: 'Insights IA', text: 'Recommandations personnalisees' },
  { icon: Target, title: 'Tracking avance', text: 'Objectifs, habitudes, streaks, KPIs' },
]

const cockpitChecks = [
  'Synchronisation automatique',
  'Donnees en temps reel',
  'Analyse multi-comptes',
  'Disponible sur tous vos appareils',
]

const plans = [
  {
    name: 'Starter',
    price: '9€',
    subtitle: 'Parfait pour commencer',
    features: ['1 compte MT4/MT5', 'IA & insights de base', 'Journal de trading', 'Support prioritaire'],
  },
  {
    name: 'Pro',
    price: '19€',
    subtitle: 'Pour traders actifs',
    features: ['2 comptes MT4/MT5', 'Analyses avancees', 'Insights IA illimites', 'Alertes intelligentes'],
    popular: true,
  },
  {
    name: 'Elite',
    price: '49€',
    subtitle: 'Pour traders exigeants',
    features: ['5 comptes MT4/MT5', 'Deep analytics', 'Backtesting avance', 'Export & rapports pro'],
  },
  {
    name: 'Agency',
    price: '149€',
    subtitle: 'Pour prop firms & coachs',
    features: ['20 comptes MT4/MT5', 'Gestion multi-utilisateurs', 'API & acces complet', 'Support dedie'],
  },
  {
    name: 'Free',
    price: '0€',
    subtitle: 'Pour decouvrir',
    features: ['Import CSV uniquement', 'Fonctions limitees', 'Pas de MetaApi'],
  },
]

const testimonials = [
  { name: 'Alex D.', role: 'Trader Forex', quote: "Enfin un outil qui me montre exactement ou je me trompe." },
  { name: 'Julien M.', role: 'Swing Trader', quote: 'Mes resultats ont augmente de 37% grace aux insights IA.' },
  { name: 'Thomas B.', role: 'Prop Trader', quote: "Le dashboard le plus complet que j'ai jamais utilise." },
]

const brokerLogos = [
  { name: 'MetaTrader 4', src: '/partners/metatrader-4.png', width: 120, height: 60 },
  { name: 'MetaTrader 5', src: '/partners/metatrader-5.png', width: 120, height: 60 },
  { name: 'cTrader', src: '/brokers/ctrader.png', width: 128, height: 56 },
  { name: 'Binance', src: '/brokers/binance.svg', width: 130, height: 40 },
]

function BrandIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={`${className} text-current`} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M12 27V13l8 8 8-8v14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="MERKURE">
      <BrandIcon className="h-8 w-8 text-violet-400 drop-shadow-[0_0_18px_rgba(139,92,246,0.55)]" />
      <span className="text-[22px] font-black tracking-[0.12em] text-white">MERKURE</span>
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/14 bg-white/[0.025] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/[0.07] disabled:opacity-60 ${className}`}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <PlayCircle className="h-4 w-4" />}
      Voir la démo live
    </button>
  )
}

function PrimaryCta({ children = 'Démarrer gratuitement', href = '/sign-up', className = '' }: { children?: string; href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#6d28d9_0%,#7c3aed_48%,#a855f7_100%)] px-6 py-3 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(124,58,237,0.34)] transition hover:-translate-y-0.5 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 px-5 py-3.5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-6">
        <BrandMark />

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[13px] font-semibold transition-colors hover:text-white ${index === 0 ? 'border-b border-violet-400 pb-1 text-white' : 'text-slate-300'}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/sign-in" className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/[0.08]">
            Se connecter
          </Link>
          <PrimaryCta href="/sign-up">Démarrer gratuitement</PrimaryCta>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-label="Ouvrir le menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-4 grid w-full max-w-[1680px] gap-3 rounded-lg border border-white/10 bg-[#071020] p-4 lg:hidden">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/[0.06]">
              {link.label}
            </a>
          ))}
          <Link href="/sign-in" onClick={() => setOpen(false)} className="rounded-lg border border-white/15 px-4 py-3 text-center text-sm font-black text-white">
            Se connecter
          </Link>
          <PrimaryCta href="/sign-up" className="w-full">Démarrer gratuitement</PrimaryCta>
        </div>
      )}
    </header>
  )
}

function GlobeVisual() {
  return (
    <div className="relative flex h-[480px] items-center justify-center overflow-hidden xl:h-[560px]">
      {/* Halo violet derrière le globe */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[80px]" />
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[60px]" />
      </div>

      {/* Globe iframe — fixe, pas d'interaction utilisateur */}
      <iframe
        src="https://my.spline.design/3dglobe-fF7pTN8k830L2ACIFwixbdia/"
        title="Globe 3D MERKURE"
        className="relative z-10 h-full w-full border-0 pointer-events-none select-none"
        loading="lazy"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        scrolling="no"
      />

      {/* Fondu sur les bords pour intégrer au fond */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_55%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-[#050816] to-transparent" />

      {/* Badges flottants */}
      <div className="absolute left-[8%] top-[18%] z-30 rounded-lg border border-violet-400/30 bg-[#080d1b]/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-200 backdrop-blur-md">
        Analyse IA
      </div>
      <div className="absolute right-[8%] top-[22%] z-30 rounded-lg border border-cyan-400/30 bg-[#080d1b]/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-200 backdrop-blur-md">
        Signal
      </div>
      <div className="absolute bottom-[22%] left-[8%] z-30 rounded-lg border border-violet-400/30 bg-[#080d1b]/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-200 backdrop-blur-md">
        Détection
      </div>
      <div className="absolute bottom-[18%] right-[8%] z-30 rounded-lg border border-cyan-400/30 bg-[#080d1b]/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-200 backdrop-blur-md">
        Optimisation
      </div>
    </div>
  )
}

function OperationalPanel() {
  return (
    <aside className="relative rounded-xl border border-cyan-300/12 bg-[#07111e]/76 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.40)] backdrop-blur-xl">
      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-300">
        <Server className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">Couche opérationnelle</p>
      <h2 className="mt-2 text-base font-extrabold text-white">Cockpit de décision</h2>

      <div className="mt-5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
        <span className="flex items-center gap-2 text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Système actif
        </span>
        <span className="text-slate-500">Mis à jour en temps réel</span>
      </div>

      <div className="mt-4 grid gap-2.5">
        {operationalSteps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/14 text-violet-300">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-white">{title}</span>
                <span className="text-[11px] font-semibold text-slate-500">{text}</span>
              </span>
            </div>
            <span className="h-2 w-2 rounded-full border border-slate-500" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3.5">
          <p className="text-[10px] font-black uppercase text-slate-500">Risk score</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-mono text-2xl font-black text-white">72</span>
            <span className="pb-1 text-sm font-bold text-slate-500">/100</span>
          </div>
          <svg viewBox="0 0 120 36" className="mt-2 h-8 w-full" aria-hidden="true">
            <polyline points="0,26 18,25 34,20 50,23 68,17 84,15 102,10 120,7" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3.5">
          <p className="text-[10px] font-black uppercase text-slate-500">Confiance IA</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-2xl font-black text-white">85%</span>
            <span className="h-12 w-12 rounded-full border-[6px] border-violet-500 border-l-cyan-400" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-400/20 bg-emerald-400/12 px-4 py-3 text-sm font-extrabold text-emerald-300">
        Mode lecture seule
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
      </div>
    </aside>
  )
}

function Hero() {
  return (
    <section id="produit" className="relative overflow-hidden bg-[#050816] px-5 pb-5 pt-7 text-white sm:px-8 lg:pb-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_540px_at_50%_28%,rgba(37,99,235,0.20),transparent_60%),radial-gradient(780px_520px_at_78%_34%,rgba(124,58,237,0.24),transparent_62%),linear-gradient(180deg,#050816_0%,#07101c_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(124,58,237,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] [background-size:76px_76px]" />

      <div className="relative mx-auto grid w-full max-w-[1680px] gap-7 xl:grid-cols-[0.84fr_1.26fr_0.64fr] xl:items-center">
        <div className="relative z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Cockpit IA pour traders exigeants
          </div>

          <h1 className="mt-7 max-w-2xl text-[44px] font-extrabold leading-[1.05] tracking-[-0.015em] text-white sm:text-[56px] 2xl:text-[66px]">
            Trade avec
            <br />
            des <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-300 bg-clip-text text-transparent">données.</span>
            <br />
            Pas des émotions.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] font-medium leading-8 text-slate-300">
            MERKURE connecte vos comptes, analyse chaque trade avec l'IA et vous donne un avantage mesurable sur le marché.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta>Démarrer gratuitement</PrimaryCta>
            <DemoButton />
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {heroPills.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.028] px-4 py-3 text-xs font-bold text-slate-300">
                <Icon className="h-4 w-4 text-emerald-300" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <GlobeVisual />

        <div className="hidden xl:block">
          <OperationalPanel />
        </div>
      </div>

      <div className="relative mx-auto mt-5 grid w-full max-w-[1680px] gap-3 rounded-xl border border-white/10 bg-white/[0.032] p-4 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ icon: Icon, value, label }, index) => (
          <div key={label} className={`flex items-center gap-4 px-3 py-1.5 ${index > 0 ? 'lg:border-l lg:border-white/10' : ''}`}>
            <Icon className="h-8 w-8 text-violet-300" />
            <div>
              <p className="font-mono text-xl font-black text-white">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="bg-[#050816] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto grid w-full max-w-[1680px] gap-6 rounded-xl border border-white/10 bg-[#07101c]/82 p-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
            Le probleme
          </p>
          <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
            Pourquoi <span className="text-violet-400">90%</span> des traders stagnent.
          </h2>
          <p className="mt-4 text-sm font-medium leading-7 text-slate-400">Sans donnees fiables, impossible de s'ameliorer.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {problemCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
              <Icon className="h-7 w-7 text-red-400" />
              <h3 className="mt-6 text-base font-black text-white">{title}</h3>
              <p className="mt-2 text-sm font-medium text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  return (
    <section id="fonctionnalites" className="bg-[#050816] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto grid w-full max-w-[1680px] gap-7 rounded-xl border border-white/10 bg-[#07101c]/82 p-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
            MERKURE analyse tout
          </p>
          <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
            Tout ce qu'un trader doit vraiment <span className="text-violet-400">comprendre.</span>
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <Icon className="h-6 w-6 text-violet-300" />
              <h3 className="mt-5 text-sm font-black text-white">{title}</h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardMockup() {
  const chartPoints = '0,146 52,138 104,120 156,132 208,96 260,72 312,88 364,56 416,42 468,24 520,18'

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#070d19] shadow-[0_30px_110px_rgba(0,0,0,0.48)]">
      <div className="grid min-h-[470px] lg:grid-cols-[170px_1fr]">
        <aside className="hidden border-r border-white/10 bg-[#071020] p-5 lg:block">
          <BrandMark />
          <nav className="mt-8 grid gap-2 text-sm font-semibold text-slate-400">
            {['Dashboard', 'Analyse', 'Journal', 'Objectifs', 'Alertes', 'Parametres'].map((item, index) => (
              <span key={item} className={`rounded-lg px-3 py-2 ${index === 0 ? 'bg-violet-600 text-white' : 'hover:bg-white/[0.04]'}`}>
                {item}
              </span>
            ))}
          </nav>
        </aside>

        <div className="p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-black text-white">Vue d'ensemble</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="rounded-lg border border-white/10 px-3 py-2">30 derniers jours</span>
              <span className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,#7c3aed,#22d3ee)]" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['Profit net', '+2 450,75 €', '+12,4%'],
              ['Win Rate', '61,42%', '+4,3%'],
              ['Profit Factor', '1,72', '+0,31'],
              ['Drawdown Max', '-8,37%', '-2,11%'],
            ].map(([label, value, trend]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-3 font-mono text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs font-black text-emerald-300">{trend}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-white">Evolution de la performance</p>
                <span className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-blue-200">21 Mai 2026</span>
              </div>
              <svg viewBox="0 0 520 180" className="h-56 w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="dashChart" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#7c3aed" stopOpacity="0.44" />
                    <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40, 80, 120, 160].map((y) => <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="rgba(148,163,184,0.10)" strokeDasharray="4 8" />)}
                <path d={`M${chartPoints} L520,180 L0,180 Z`} fill="url(#dashChart)" />
                <polyline points={chartPoints} fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="mb-4 text-sm font-black text-white">Repartition des actifs</p>
                <div className="flex items-center justify-center">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#7c3aed 0 42%, #22d3ee 42% 70%, #22c55e 70% 88%, #f59e0b 88% 100%)' }}>
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#07101c]">
                      <span className="font-mono text-lg font-black text-white">127 890€</span>
                      <span className="text-[10px] font-bold text-slate-500">Total</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="mb-3 text-sm font-black text-white">Insights IA</p>
                {['Performance 22% meilleure entre 09h et 11h', 'Risque reduit apres 3 pertes consecutives', 'Edge detecte sur les paires majeures'].map((item) => (
                  <p key={item} className="mb-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-400">{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <p className="mb-3 text-sm font-black text-white">Heatmap des sessions</p>
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 72 }, (_, index) => (
                  <span key={index} className={`h-3 rounded-sm ${index % 7 === 0 ? 'bg-cyan-400/70' : index % 5 === 0 ? 'bg-violet-500/70' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <p className="mb-3 text-sm font-black text-white">Derniers trades</p>
              {['EUR/USD Buy +104,35 €', 'XAU/USD Sell +72,10 €', 'US30 Buy +82,90 €'].map((trade) => (
                <div key={trade} className="mb-2 flex justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300">
                  <span>{trade.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="text-emerald-300">{trade.split(' ').slice(2).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CockpitSection() {
  return (
    <section id="ressources" className="bg-[#050816] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 rounded-xl border border-white/10 bg-[#07101c]/82 p-7 lg:grid-cols-[0.55fr_1.45fr]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
              Votre cockpit
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
              Votre performance.
              <br />
              En temps reel.
            </h2>
            <p className="mt-5 max-w-md text-sm font-medium leading-7 text-slate-400">Un dashboard puissant, clair et intuitif pour piloter votre trading comme un pro.</p>
            <div className="mt-7 grid gap-3">
              {cockpitChecks.map((item) => (
                <span key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                  <Check className="h-4 w-4 text-violet-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <DemoButton className="mt-8 w-full sm:w-fit" />
        </div>

        <DashboardMockup />
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="tarifs" className="bg-[#050816] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto w-full max-w-[1680px] rounded-xl border border-white/10 bg-[#07101c]/82 p-7">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
              Tarifs simples & transparents
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
              Un plan pour chaque trader.
              <br />
              Du debutant a la prop firm.
            </h2>
          </div>
          <div className="flex rounded-lg border border-white/10 bg-white/[0.035] p-1 text-sm font-black">
            <span className="rounded-md bg-violet-600 px-10 py-3 text-white">Mensuel</span>
            <span className="px-10 py-3 text-slate-400">Annuel <span className="ml-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-violet-200">-20%</span></span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative rounded-lg border p-5 ${plan.popular ? 'border-violet-400/45 bg-violet-500/10' : 'border-white/10 bg-white/[0.035]'}`}>
              {plan.popular && <span className="absolute right-4 top-4 rounded-full bg-violet-500 px-2 py-1 text-[9px] font-black uppercase text-white">Populaire</span>}
              <h3 className="text-lg font-black text-white">{plan.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{plan.subtitle}</p>
              <p className="mt-6 font-mono text-4xl font-black text-white">{plan.price}<span className="text-sm font-bold text-slate-500"> /mois</span></p>
              <ul className="mt-6 grid gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm font-semibold text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <PrimaryCta href="/sign-up" className="mt-7 w-full py-2.5">{plan.name === 'Agency' ? 'Contactez-nous' : 'Commencer'}</PrimaryCta>
              {plan.name !== 'Free' && <p className="mt-3 text-center text-[11px] font-bold text-emerald-300">MetaApi non inclus</p>}
            </article>
          ))}
        </div>

        <p className="mt-5 text-center text-xs font-semibold text-slate-500">Tous les plans incluent securisation, synchro en temps reel et support reactif.</p>
      </div>
    </section>
  )
}

function SocialProofSection() {
  return (
    <section id="apropos" className="bg-[#050816] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 rounded-xl border border-white/10 bg-[#07101c]/82 p-7 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
            Ils ameliorent leur trading avec MERKURE
          </p>
          <h2 className="mt-4 text-2xl font-black text-white">+127 000 traders deja conquis.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <p className="text-sm font-medium leading-6 text-slate-300">"{testimonial.quote}"</p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-[linear-gradient(135deg,#7c3aed,#22d3ee)]" />
                    <span>
                      <span className="block text-sm font-black text-white">{testimonial.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{testimonial.role}</span>
                    </span>
                  </div>
                  <span className="flex gap-1 text-amber-300">
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current" />)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-6 text-center text-sm font-semibold text-slate-400">Compatible avec les meilleurs brokers</p>
          <div className="grid grid-cols-2 gap-4">
            {brokerLogos.map((logo) => (
              <div key={logo.name} className="flex h-20 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <Image src={logo.src} alt={`Logo ${logo.name}`} width={logo.width} height={logo.height} className="max-h-10 w-auto object-contain" />
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm font-bold text-slate-500">+14 autres</p>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#050816] px-5 pb-0 pt-5 text-white sm:px-8">
      <div className="relative mx-auto min-h-[140px] w-full max-w-[1680px] overflow-hidden rounded-t-xl border border-violet-400/20 bg-[radial-gradient(640px_220px_at_20%_100%,rgba(34,211,238,0.20),transparent_60%),radial-gradient(640px_220px_at_55%_80%,rgba(124,58,237,0.38),transparent_60%),#070b18] p-7 text-center">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-200">Pret a passer au niveau superieur ?</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">Votre edge commence ici.</h2>
        <p className="mt-2 text-sm font-semibold text-slate-300">Rejoignez MERKURE et transformez vos donnees en performance.</p>
        <PrimaryCta href="/sign-up" className="mt-5">Demarrer gratuitement</PrimaryCta>
        <p className="mt-2 text-xs font-semibold text-slate-500">Aucune carte bancaire requise</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050816] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <BrandMark />
        <nav className="flex flex-wrap gap-6 text-sm font-semibold text-slate-400">
          {navLinks.map((link) => <a key={link.href} href={link.href} className="hover:text-white">{link.label}</a>)}
          <Link href="/legal/mentions-legales" className="hover:text-white">Contact</Link>
        </nav>
        <p className="text-sm font-semibold text-slate-500">© 2026 MERKURE. Tous droits reserves.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#050816]">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <FeatureSection />
        <CockpitSection />
        <PricingSection />
        <SocialProofSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
