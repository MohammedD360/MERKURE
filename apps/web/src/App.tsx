'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, BookOpen, Brain, Calendar, Check,
  Database, Menu, PlayCircle, Sparkles, TrendingUp, X,
} from 'lucide-react'
import { setToken } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/shared/components/BrandLogo'
import { DashboardPage } from '@/features/dashboard/DashboardPage'

/* ─── CTA / Demo buttons — style Maven ──────────────────────────────────── */

function PrimaryButton({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'min-w-48 px-9 py-3 h-12',
        'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.88)]',
        'text-white text-base font-medium',
        'rounded-sm transition-all duration-200',
        className,
      )}
    >
      {children}
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
        'inline-flex items-center justify-center gap-2',
        'min-w-48 px-9 py-3 h-12',
        'border border-border bg-transparent text-base font-medium text-foreground/70',
        'hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]',
        'rounded-sm transition-all duration-200',
        'disabled:opacity-60',
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
      <span className={cn('h-14 fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/[0.07]', transCls)} />
      <header className={cn('max-w-7xl mx-auto fixed top-0 left-0 right-0 px-4 lg:px-6 h-14 flex items-center justify-between z-50', transCls)}>
        <Link href="/" className="flex items-center">
          <BrandLogo
            className="text-foreground"
            iconClassName="h-9 w-9 text-[hsl(var(--sidebar-primary))]"
            textClassName="text-[28px] font-bold leading-none tracking-tight"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center">
          <nav className="flex items-center">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <span className="h-6 w-px bg-border mx-4" />
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
          >
            Se connecter
          </Link>
          <Link
            href="/sign-up"
            className="ml-2 inline-flex items-center justify-center rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(244_42%_44%)]"
          >
            Démarrer mon analyse
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
                <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                  <BrandLogo
                    className="text-foreground"
                    iconClassName="h-9 w-9 text-[hsl(var(--sidebar-primary))]"
                    textClassName="text-[28px] font-bold leading-none tracking-tight"
                  />
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

/* ─── Real Dashboard Preview ─────────────────────────────────────────────── */

const PREVIEW_SCALE = 0.62

function RealDashboardPreview() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-violet-300/25 shadow-[0_0_0_1px_rgba(139,92,246,0.10),0_30px_100px_rgba(0,0,0,0.72),0_0_80px_rgba(124,58,237,0.16)]"
      style={{ height: 520 }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ background: '#0D1021', borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(239,68,68,0.6)' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(234,179,8,0.6)' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(34,197,94,0.6)' }} />
        <span className="ml-3 flex-1 rounded px-3 py-0.5 text-[10px]" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.28)' }}>
          app.merkure.app/dashboard
        </span>
      </div>
      {/* Scaled dashboard content */}
      <div style={{ height: 484, overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: 'top left',
            width: `${(100 / PREVIEW_SCALE).toFixed(2)}%`,
            height: `${Math.round(484 / PREVIEW_SCALE)}px`,
            pointerEvents: 'none',
          }}
        >
          <DashboardPage />
        </div>
      </div>
    </div>
  )
}

/* ─── Hero 3D Chart Background ──────────────────────────────────────────── */

function Hero3DChartBackground() {
  // Courbes organiques fluides — pas de grille, juste des vagues en perspective
  const w1 = 'M-100,340 C100,308 280,258 480,298 C650,332 800,268 980,292 C1140,313 1300,282 1540,292'
  const w2 = 'M-100,295 C100,263 280,213 480,253 C650,287 800,223 980,247 C1140,268 1300,237 1540,247'
  const w3 = 'M-100,250 C100,218 280,168 480,208 C650,242 800,178 980,202 C1140,223 1300,192 1540,202'

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ top: 0, zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Masque dégradé : s'efface vers le bas pour laisser place au dashboard */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 68%, hsl(var(--background)) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Container perspective 3D */}
      <div
        className="absolute inset-0"
        style={{ perspective: '1000px', perspectiveOrigin: '50% 35%' }}
      >
        <div className="hero-3d-wrapper w-full h-full">
          <svg
            viewBox="0 0 1440 520"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="wg1" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="hsl(244 42% 51%)" stopOpacity="0.22" />
                <stop offset="1" stopColor="hsl(244 42% 51%)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wg2" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="hsl(249 38% 58%)" stopOpacity="0.13" />
                <stop offset="1" stopColor="hsl(249 38% 58%)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wg3" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="hsl(255 35% 65%)" stopOpacity="0.07" />
                <stop offset="1" stopColor="hsl(255 35% 65%)" stopOpacity="0" />
              </linearGradient>
              <filter id="wave-glow" x="-5%" y="-300%" width="110%" height="700%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Vague 3 — arrière, la plus haute et la plus subtile */}
            <path d={`${w3} L1540,520 L-100,520 Z`} fill="url(#wg3)" />
            <path
              d={w3}
              fill="none"
              stroke="hsl(255 35% 65%)"
              strokeOpacity="0.38"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="hero-chart-line-3"
            />

            {/* Vague 2 — milieu */}
            <path d={`${w2} L1540,520 L-100,520 Z`} fill="url(#wg2)" />
            <path
              d={w2}
              fill="none"
              stroke="hsl(249 38% 58%)"
              strokeOpacity="0.55"
              strokeWidth="2"
              strokeLinecap="round"
              className="hero-chart-line-2"
            />

            {/* Vague 1 — avant, la plus lumineuse */}
            <path d={`${w1} L1540,520 L-100,520 Z`} fill="url(#wg1)" />
            <g filter="url(#wave-glow)" className="hero-chart-glow">
              <path
                d={w1}
                fill="none"
                stroke="hsl(244 42% 51%)"
                strokeOpacity="0.9"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="hero-chart-line-1"
              />
            </g>

            {/* Point "live" en bout de la courbe principale */}
            <g className="hero-live-dot" style={{ transformOrigin: '1440px 292px' }}>
              <circle cx="1440" cy="292" r="6" fill="hsl(244 42% 51%)" opacity="0.25" />
              <circle cx="1440" cy="292" r="3.5" fill="hsl(244 42% 51%)" opacity="0.9" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ─── Hero ── style Maven (fond clair, grille de points, police display) ─── */

function HeroStatCard({
  label, value, tag, tagColor, sparkPoints, dotColor, side,
}: {
  label: string
  value: string
  tag: string
  tagColor: string
  sparkPoints: string
  dotColor: string
  side: 'left' | 'right'
}) {
  const delay = side === 'left' ? '' : ' animate-float-card-delay'
  return (
    <div
      className={`hidden xl:block pointer-events-none absolute z-20 animate-float-card${delay}`}
      style={
        side === 'left'
          ? { left: '1.5%', top: '38%', transform: 'translateY(-50%)' }
          : { right: '1.5%', top: '26%', transform: 'translateY(-50%)' }
      }
    >
      <div className="w-48 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <p className="text-xs font-medium text-[hsl(var(--foreground-soft))]">{label}</p>
        <p className="mt-1 text-[1.4rem] font-bold leading-tight text-foreground">{value}</p>
        <span
          className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ color: tagColor, background: `${tagColor}18` }}
        >
          <TrendingUp className="h-3 w-3" />
          {tag}
        </span>
        <svg viewBox="0 0 80 28" className="mt-2 h-7 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`sg-${side}`} x1="0" x2="0" y1="0" y2="1">
              <stop stopColor={dotColor} stopOpacity="0.18" />
              <stop offset="1" stopColor={dotColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M${sparkPoints.split(' ').join(' L')} L80,28 L0,28 Z`} fill={`url(#sg-${side})`} />
          <polyline
            points={sparkPoints}
            fill="none"
            stroke={dotColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={sparkPoints.split(' ').at(-1)?.split(',')[0]} cy={sparkPoints.split(' ').at(-1)?.split(',')[1]} r="2.5" fill={dotColor} />
        </svg>
      </div>
    </div>
  )
}

function Hero() {
  const trustItems = ['Analyse IA avancée', 'Insights personnalisés', "Plan d'amélioration clair", '100% sécurisé']

  return (
    <div className="relative isolate overflow-hidden bg-background pt-28 sm:pt-32 lg:pt-36 pb-0">
      {/* Grille de points subtile */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(244 42% 51% / 0.10) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* Dégradé radial pour atténuer les bords */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 0%, transparent 35%, hsl(var(--background)) 100%)',
        }}
      />

      {/* Courbes 3D animées */}
      <Hero3DChartBackground />

      {/* ── Cartes flottantes ── */}
      <HeroStatCard
        side="left"
        label="Win Rate"
        value="62.4%"
        tag="+6.2% ce mois"
        tagColor="#10b981"
        dotColor="#3b82f6"
        sparkPoints="0,22 13,18 26,20 39,14 52,16 65,10 80,7"
      />
      <HeroStatCard
        side="right"
        label="Performance"
        value="+2 450,75 $"
        tag="+18.7% ce mois"
        tagColor="#10b981"
        dotColor="#10b981"
        sparkPoints="0,24 13,20 26,16 39,18 52,11 65,7 80,4"
      />

      {/* ── Icônes décoratives flottantes ── */}
      <div
        className="hidden lg:flex pointer-events-none absolute z-20 items-center gap-1.5 rounded-full border border-gray-100 bg-white/85 px-3 py-1.5 shadow-md animate-float-card-delay"
        style={{ left: '6%', bottom: '28%' }}
        aria-hidden="true"
      >
        <Brain className="h-4 w-4 text-[hsl(var(--primary))]" />
        <span className="text-xs font-semibold text-foreground/70">IA</span>
      </div>
      <div
        className="hidden lg:flex pointer-events-none absolute z-20 items-center justify-center rounded-full border border-gray-100 bg-white/85 p-2 shadow-md animate-float-card"
        style={{ right: '8%', bottom: '34%' }}
        aria-hidden="true"
      >
        <Sparkles className="h-4 w-4 text-violet-400" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col items-center px-4 md:px-6">
        <div className="flex max-w-4xl flex-col justify-center space-y-7 text-center">

          {/* Badge */}
          <div className="animate-fade-in mx-auto inline-flex items-center rounded-full border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.06)] px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary))]">
            Plateforme de performance trading
          </div>

          {/* H1 */}
          <h1 className="animate-fade-in-up font-primary mx-auto max-w-4xl text-5xl leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Devenez le trader que vos{' '}
            <em className="not-italic text-[hsl(var(--primary))]">émotions</em>
            {' '}empêchent d&apos;être.
          </h1>

          {/* Sous-titre */}
          <p className="animate-fade-in-up-1 mx-auto max-w-[600px] text-balance text-lg leading-relaxed text-[hsl(var(--foreground-soft))] md:text-xl">
            MERKURE analyse vos trades en profondeur, détecte vos biais comportementaux
            et vous donne un plan d&apos;amélioration clair pour performer durablement.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up-2 flex w-full flex-wrap justify-center gap-4 pt-1">
            <PrimaryButton href="/sign-up">
              Démarrer mon analyse IA →
            </PrimaryButton>
            <DemoButton />
          </div>

          {/* Badges de confiance */}
          <div className="animate-fade-in-up-3 flex flex-wrap justify-center gap-x-6 gap-y-2 pt-1">
            {trustItems.map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-sm text-[hsl(var(--foreground-soft))]">
                <Check className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="animate-slide-up relative mt-14 flex w-full max-w-6xl items-center justify-center md:mt-16">
          <div className="relative w-full">
            <span className="absolute inset-[-24px] rounded-3xl bg-[hsl(var(--primary)/0.10)] blur-3xl" />
            <RealDashboardPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Partners ───────────────────────────────────────────────────────────── */

const platformLogos = [
  {
    name: 'MetaTrader 4',
    src: '/partners/metatrader-4.png',
    width: 500,
    height: 250,
    tone: 'light',
    logoClass: 'h-16 w-[150px] scale-[1.45]',
  },
  {
    name: 'MetaTrader 5',
    src: '/partners/metatrader-5.png',
    width: 1200,
    height: 600,
    tone: 'light',
    logoClass: 'h-16 w-[150px] scale-[1.7]',
  },
  {
    name: 'cTrader',
    src: '/brokers/ctrader.png',
    width: 36,
    height: 35,
    tone: 'light',
    logoClass: 'h-11 w-11',
  },
  {
    name: 'Binance',
    src: '/brokers/binance.svg',
    width: 127,
    height: 127,
    tone: 'dark',
    logoClass: 'h-11 w-11',
  },
  {
    name: 'Interactive Brokers',
    src: '/partners/interactive-brokers.png',
    width: 486,
    height: 75,
    tone: 'dark',
    logoClass: 'h-10 w-[142px] scale-110',
  },
  {
    name: 'TradingView',
    src: '/partners/tradingview.svg',
    width: 32,
    height: 16,
    tone: 'light',
    logoClass: 'h-10 w-20',
  },
  {
    name: 'OANDA',
    src: '/partners/oanda.svg',
    width: 128,
    height: 35,
    tone: 'light',
    logoClass: 'h-10 w-[136px]',
  },
  {
    name: 'TradeLocker',
    src: '/partners/tradelocker.svg',
    width: 199,
    height: 61,
    tone: 'dark',
    logoClass: 'h-11 w-[144px]',
  },
  {
    name: 'Pepperstone',
    src: '/partners/pepperstone.svg',
    width: 233,
    height: 46,
    tone: 'dark',
    logoClass: 'h-10 w-[150px]',
  },
] as const

function PlatformLogoTile({ logo }: { logo: (typeof platformLogos)[number] }) {
  return (
    <div
      className={cn(
        'group flex h-20 w-[174px] shrink-0 items-center justify-center overflow-hidden rounded-lg border px-6 shadow-[0_16px_44px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5',
        logo.tone === 'light'
          ? 'border-white/20 bg-white'
          : 'border-white/10 bg-neutral-950',
      )}
    >
      <div className={cn('flex items-center justify-center', logo.logoClass)}>
        <Image
          src={logo.src}
          alt={logo.name}
          width={logo.width}
          height={logo.height}
          unoptimized={logo.src.endsWith('.svg')}
          sizes="174px"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}

function Partners() {
  return (
    <div className="container px-4 md:px-6 overflow-hidden">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-5xl">Compatible avec vos plateformes</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
            Synchronisez vos comptes en lecture seule depuis n'importe quel broker ou prop firm.
          </p>
        </div>
        <div className="platform-marquee relative mt-8 w-full max-w-5xl overflow-hidden py-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
          <div className="flex w-max animate-platform-marquee">
            {[0, 1].map((loop) => (
              <div key={loop} className="flex shrink-0 items-center gap-4 pr-4" aria-hidden={loop === 1}>
                {platformLogos.map((logo) => (
                  <PlatformLogoTile key={`${loop}-${logo.name}`} logo={logo} />
                ))}
              </div>
            ))}
          </div>
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
    <main id="features" className="container mx-auto px-4 py-16 md:py-24">
      <h2 className="font-primary text-3xl sm:text-4xl md:text-5xl text-center text-foreground mb-4">
        Des outils pour chaque dimension du trading
      </h2>
      <p className="text-base sm:text-lg md:text-xl text-center text-muted-foreground mb-10 md:mb-14 max-w-[600px] mx-auto">
        Identifiez vos forces, corrigez vos faiblesses, progressez vraiment.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {cards.map((f, index) => (
          <Card
            id={f.id}
            key={f.id}
            className={cn(
              'border-border bg-card hover:border-[hsl(var(--primary)/0.4)] transition-colors duration-300',
              index < 2 ? 'lg:col-span-3' : index === 2 ? 'lg:col-span-4' : 'lg:col-span-2',
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-foreground">{f.title}</CardTitle>
              {f.icon}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div>
                  <div className="text-2xl font-bold text-[hsl(var(--primary))]">{f.stat}</div>
                  <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                </div>
                <div className={cn('relative w-full flex justify-center items-center rounded-xl overflow-hidden bg-section-alt', f.minH ?? 'h-[300px]')}>
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
    <section id="tarifs" className="container mx-auto px-4 py-16 md:py-24">
      <h2 className="font-primary text-3xl sm:text-4xl md:text-5xl text-center text-foreground mb-4">
        Un plan pour chaque trader
      </h2>
      <p className="text-base sm:text-xl text-center text-muted-foreground mb-10 md:mb-14">
        Du débutant à la prop firm.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              'relative rounded-sm border p-6 flex flex-col transition-colors duration-300',
              (plan as { popular?: boolean }).popular
                ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.04)] hover:border-[hsl(var(--primary))]'
                : 'border-border bg-card hover:border-[hsl(var(--primary)/0.4)]',
            )}
          >
            {(plan as { popular?: boolean }).popular && (
              <span className="absolute right-4 top-4 rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[9px] font-semibold uppercase text-white">
                Populaire
              </span>
            )}
            <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.sub}</p>
            <p className="mt-5 font-mono text-4xl font-bold text-foreground">
              {plan.price}€<span className="text-sm font-medium text-muted-foreground"> /mois</span>
            </p>
            <ul className="mt-5 flex-1 grid gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]" />{f}
                </li>
              ))}
            </ul>
            <PrimaryButton href="/sign-up" className="mt-6 w-full min-w-0 h-10 text-sm px-4">
              {plan.name === 'Agency' ? 'Nous contacter' : 'Commencer'}
            </PrimaryButton>
          </article>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Tous les plans incluent la securisation des donnees, la synchronisation en temps reel et un support reactif.
      </p>
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
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="font-primary text-3xl sm:text-4xl md:text-5xl text-center text-foreground mb-10 md:mb-14">
          Questions fréquentes
        </h2>
        <div className="max-w-3xl mx-auto space-y-0">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="border-b border-border py-5 group">
              <summary className="font-medium cursor-pointer list-none flex items-center justify-between gap-4 text-foreground hover:text-[hsl(var(--primary))] transition-colors duration-200">
                {q}
                <span className="shrink-0 text-xl text-muted-foreground group-open:rotate-45 transition-transform duration-200 inline-block leading-none">+</span>
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
    <div className="px-4 mb-8 md:mb-16 lg:mb-24">
      <div className="mb-6 md:mb-10">
        <h2 className="font-primary text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-5 text-foreground">
          +10 000 traders font confiance à MERKURE
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-[500px]">
          Rejoignez une communauté qui utilise la data pour progresser, pas l'instinct.
        </p>
      </div>
      <div className="rounded-sm border border-border bg-section-alt p-4 md:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:gap-16 gap-8">
          <div className="lg:basis-1/2 space-y-0">
            {[
              { icon: <Brain className="h-5 w-5 md:h-6 md:w-6" />, title: 'IA de journalisation', desc: 'Chaque trade est analysé automatiquement pour détecter vos biais et patterns comportementaux.' },
              { icon: <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />, title: 'Analytics avancés', desc: 'Plus de 20 métriques de performance pour comprendre exactement où vous gagnez et où vous perdez.' },
              { icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6" />, title: 'Roadmap publique', desc: 'Suivez et votez pour les prochaines fonctionnalités. Votre feedback guide notre développement.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="border-b border-border py-5 last:border-0 group">
                <div className="flex items-center gap-2 text-[hsl(var(--primary))] mb-2 transition-colors duration-200">
                  {icon}
                  <span className="text-sm md:text-base font-medium text-foreground">{title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="lg:basis-1/2">
            <div className="rounded-sm border border-border bg-background p-6 md:p-8 flex flex-col gap-5 h-full">
              <div className="text-center py-3">
                <p className="font-primary text-6xl text-[hsl(var(--primary))]">+10K</p>
                <p className="text-sm text-muted-foreground mt-2">traders actifs</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[{ v: '2M+', l: 'Trades analysés' }, { v: '98%', l: 'Satisfaction' }, { v: '24/7', l: 'Synchronisation' }].map(({ v, l }) => (
                  <div key={l} className="rounded-sm border border-border bg-section-alt p-3">
                    <p className="font-mono text-xl font-bold text-foreground">{v}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-3 pt-2">
                <PrimaryButton href="/sign-up" className="w-full min-w-0">Rejoindre MERKURE</PrimaryButton>
                <DemoButton className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
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
              <BrandLogo
                className="gap-2 text-foreground"
                iconClassName="h-7 w-7 text-[hsl(var(--sidebar-primary))]"
                textClassName="text-lg font-black tracking-[0.12em]"
              />
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
          <div className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MERKURE. Tous droits réservés.</div>
          <div className="mt-4 text-center text-xs text-muted-foreground/70">Le trading comporte des risques de perte en capital. Les performances passées ne préjugent pas des performances futures.</div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Root ── alternance blanc / beige comme Maven ───────────────────────── */

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — fond blanc avec grille de points, full-bleed */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <Hero />
      </section>

      {/* Partners — fond beige */}
      <section className="w-full bg-section-alt py-14 md:py-20">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8 lg:px-16">
          <Partners />
        </div>
      </section>

      {/* Features — fond blanc */}
      <section className="w-full bg-background">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8 lg:px-16">
          <Features />
        </div>
      </section>

      {/* Pricing — fond beige */}
      <section className="w-full bg-section-alt">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8 lg:px-16">
          <PricingSection />
        </div>
      </section>

      {/* FAQ — fond blanc */}
      <section className="w-full bg-background">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8 lg:px-16">
          <FAQSection />
        </div>
      </section>

      {/* Community — fond beige */}
      <section className="w-full bg-section-alt py-14 md:py-20">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8 lg:px-16">
          <CommunitySection />
        </div>
      </section>

      {/* Footer — fond beige */}
      <div className="bg-section-alt border-t border-border">
        <Footer />
      </div>
    </div>
  )
}
