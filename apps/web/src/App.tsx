'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  Brain,
  Check,
  Lock,
  NotebookPen,
  PieChart,
  PlayCircle,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
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

const heroAssurances = ['Aucune carte bancaire', 'Analyse en 2 min', 'Résultats immédiats']

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
  return null
}

function Hero() {
  return (
    <section id="produit" className="relative overflow-hidden bg-[#030305] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_18%,rgba(124,58,237,0.2),transparent_34%),linear-gradient(180deg,#020204_0%,#050816_100%)]" />

      <div className="relative mx-auto min-h-[720px] max-w-[1586px] overflow-hidden rounded-[22px] border border-white/12 bg-[#050816] shadow-[0_32px_120px_rgba(0,0,0,0.62)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_44%,rgba(124,58,237,0.38),transparent_30%),radial-gradient(circle_at_74%_66%,rgba(139,92,246,0.2),transparent_36%),linear-gradient(90deg,#050506_0%,#070719_48%,#080316_100%)]" />
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.22)_0_1px,transparent_1.8px),radial-gradient(circle_at_75%_15%,rgba(139,92,246,0.36)_0_1px,transparent_2px)] [background-size:180px_140px,230px_190px]" />
        <div className="absolute inset-y-0 left-0 w-[56%] bg-gradient-to-r from-black via-black/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[radial-gradient(ellipse_at_66%_0%,rgba(124,58,237,0.34),transparent_56%),linear-gradient(180deg,transparent,rgba(0,0,0,0.9)_82%)]" />

        <div className="pointer-events-none absolute bottom-[4%] right-[2.6%] top-[15%] w-[58%] overflow-hidden max-lg:opacity-35">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_38%,rgba(139,92,246,0.28),transparent_48%)]" />
          <Image
            src="/hero/merkure-portal-scene.png"
            alt=""
            width={610}
            height={470}
            priority
            sizes="(min-width: 1280px) 760px, 60vw"
            className="absolute left-1/2 top-1/2 w-[min(100%,760px)] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_0_48px_rgba(139,92,246,0.26)]"
          />
          <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#050506] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050506] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080316] to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[720px] flex-col px-6 py-7 sm:px-10 lg:px-12">
          <header className="flex items-center justify-between gap-6">
            <BrandMark />
            <nav className="hidden items-center gap-10 xl:flex">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-semibold text-white/86 transition hover:text-white">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="hidden rounded-lg border border-white/15 bg-black/22 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/8 sm:inline-flex">
                Se connecter
              </Link>
              <PrimaryCta href="/sign-up" className="rounded-lg px-6 py-3">
                Démarrer gratuitement
              </PrimaryCta>
            </div>
          </header>

          <div className="flex flex-1 items-center py-12 lg:py-16">
            <div className="max-w-[610px]">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#c084fc]">Plateforme de performance trading</p>
              <h1 className="mt-7 text-[40px] font-black uppercase leading-[1.08] tracking-[-0.035em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.55)] sm:text-[56px] lg:text-[64px] 2xl:text-[72px]">
                Devenez le trader
                <br />
                que vos <span className="text-[#8b5cf6] drop-shadow-[0_0_26px_rgba(139,92,246,0.5)]">émotions</span>
                <br />
                <span className="text-[#7c3aed] drop-shadow-[0_0_30px_rgba(124,58,237,0.55)]">empêchent d'être.</span>
              </h1>

              <p className="mt-8 max-w-[480px] text-base font-normal leading-[1.75] text-white/78">
                MERKURE analyse vos décisions en profondeur, détecte vos biais comportementaux et vous donne un plan d'amélioration clair pour performer durablement.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <PrimaryCta href="/sign-up" className="min-h-[60px] rounded-xl px-8 text-base font-bold">
                  Démarrer mon analyse IA
                </PrimaryCta>
                <a
                  href="#fonctionnalites"
                  className="inline-flex min-h-[60px] items-center justify-center gap-4 rounded-xl border border-white/18 bg-black/22 px-8 text-base font-medium text-white shadow-[0_0_28px_rgba(124,58,237,0.12)] backdrop-blur-md transition hover:bg-white/[0.07]"
                >
                  Voir comment ça marche
                  <PlayCircle className="h-5 w-5" />
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                {heroAssurances.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-sm font-medium text-white/86">
                    <Check className="h-4 w-4 rounded-full border border-emerald-400/40 bg-emerald-400/10 p-0.5 text-emerald-300" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <div className="flex -space-x-3">
                  {['YD', 'AM', 'JL', '+10K'].map((initials) => (
                    <span key={initials} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#080816] bg-[linear-gradient(135deg,#1f2937,#8b5cf6)] text-xs font-black text-white shadow-[0_0_20px_rgba(124,58,237,0.28)]">
                      {initials}
                    </span>
                  ))}
                </div>
                <p className="text-lg font-semibold leading-snug text-white">
                  +10 000 traders
                  <br />
                  <span className="font-normal text-white/72">nous font déjà confiance</span>
                </p>
              </div>
            </div>
          </div>
        </div>
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
