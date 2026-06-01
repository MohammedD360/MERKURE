'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart2,
  Bell,
  Brain,
  Briefcase,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  Headphones,
  LayoutDashboard,
  Lock,
  Menu,
  NotebookPen,
  PieChart,
  PlayCircle,
  Power,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Settings2,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { setToken } from '@/lib/api-client'

const navLinks = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#methode', label: 'Méthode' },
  { href: '#ia', label: 'IA' },
  { href: '#analyses', label: 'Analyses' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#securite', label: 'Sécurité' },
]

const legalLinks = [
  { href: '/legal/mentions-legales', label: 'Mentions légales' },
  { href: '/legal/confidentialite', label: 'Politique de confidentialité' },
  { href: '/legal/cgu', label: 'CGU' },
]

const heroBenefits: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: NotebookPen, title: 'Journal intelligent', text: 'Structurez vos décisions.' },
  { icon: Brain, title: 'Analyse comportementale', text: 'Détectez vos biais.' },
  { icon: Sparkles, title: 'Coach IA personnalisé', text: 'Recevez des actions concrètes.' },
  { icon: ArrowLeftRight, title: 'Simulations & scénarios', text: 'Testez vos règles.' },
]

const heroBenefitDelayClasses = ['hero-delay-4', 'hero-delay-5', 'hero-delay-6', 'hero-delay-7'] as const

const features: Array<{ icon: LucideIcon; title: string; text: string; badge?: string }> = [
  {
    icon: ClipboardList,
    title: 'Journal de trading',
    text: "Enregistrez chaque trade avec vos notes, captures d'écran et émotions.",
  },
  {
    icon: ShieldCheck,
    title: 'Analyses avancées',
    text: 'Identifiez vos setups rentables et vos erreurs récurrentes.',
  },
  {
    icon: TrendingUp,
    title: 'Suivi du risque',
    text: 'Gardez le contrôle avec des indicateurs de risque clairs et personnalisables.',
  },
  {
    icon: Briefcase,
    title: 'Connexion broker',
    text: 'Importez automatiquement vos trades en toute sécurité, en lecture seule.',
  },
  {
    icon: Download,
    title: 'Rapports & Exports',
    text: 'Générez des rapports détaillés et exportez vos données facilement.',
  },
  {
    icon: Brain,
    title: 'Analyse comportementale',
    text: 'Comprenez vos biais cognitifs et améliorez votre discipline.',
    badge: 'IA',
  },
]

const analysisBullets = [
  'Statistiques détaillées et filtres avancés',
  'Analyse par setup, actif, période et plus encore',
  'Visualisations claires et actionnables',
  'Identification automatique de vos tendances',
]

const workflowOutcomes = [
  'Setup rentable identifié',
  'Risque maîtrisé',
  'Erreur récurrente visible',
  'Rapport exportable',
]

const traderProfiles: Array<{
  icon:        LucideIcon
  label:       string
  title:       string
  pain:        string
  discovery:   string
  points:      string[]
  accentColor: string
}> = [
  {
    icon:        Target,
    label:       'Moins de 2 ans',
    title:       'Tu cherches encore ton edge.',
    pain:        'Tu finis la semaine sans savoir exactement pourquoi tu as gagné ou perdu. Tu as des impressions, pas de données.',
    discovery:   'MERKURE te montre quel setup a réellement fonctionné — pas celui que tu crois avoir bien exécuté.',
    points:      ['Erreurs récurrentes visibles', 'Journal structuré', 'Premières règles solides'],
    accentColor: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon:        TrendingUp,
    label:       '2 à 5 ans',
    title:       'Tu gagnes, mais pas assez régulièrement.',
    pain:        'Tu as des bons mois et des mauvais mois sans comprendre ce qui fait la différence. Ton edge existe mais tu ne sais pas le protéger.',
    discovery:   'MERKURE isole les conditions exactes où ton win rate dépasse 60 % — et celles où tu perds du capital inutilement.',
    points:      ['Analyse par session et actif', 'Drawdown maîtrisé', 'Rapport mensuel automatique'],
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon:        ShieldCheck,
    label:       'Prop / Multi-comptes',
    title:       'Tu trades sous pression de règles externes.',
    pain:        'Tu gères plusieurs comptes, des limites de drawdown strictes, et une discipline qui doit tenir même les mauvais jours.',
    discovery:   "MERKURE centralise tout et t'alerte avant que tu approches d'une limite — pas après l'avoir franchie.",
    points:      ['Suivi multi-comptes en temps réel', 'Alertes avant les seuils', 'Exports pour justification'],
    accentColor: 'text-violet-600 bg-violet-50 border-violet-100',
  },
]

const auditScenarios: Array<{
  icon:     LucideIcon
  profile:  string
  problem:  string
  signal:   string
  decision: string
  metric:   string
  label:    string
  tone:     string
  visual:   'time' | 'risk' | 'setup'
}> = [
  {
    icon:     CalendarDays,
    profile:  'Timing',
    problem:  'Pertes répétées en fin de journée',
    signal:   '73% des pertes après 17h',
    decision: 'Bloquer ce créneau 30 jours',
    metric:   '17h',
    label:    'zone rouge',
    tone:     'text-amber-300 border-amber-400/20 bg-amber-400/10',
    visual:   'time',
  },
  {
    icon:     ShieldCheck,
    profile:  'Discipline',
    problem:  'Risque qui monte après une série perdante',
    signal:   'Taille moyenne multipliée par 2',
    decision: 'Alerte pause après 2 pertes',
    metric:   '2x',
    label:    'risque',
    tone:     'text-rose-300 border-rose-400/20 bg-rose-400/10',
    visual:   'risk',
  },
  {
    icon:     Target,
    profile:  'Setup',
    problem:  'Trop de setups diluent votre edge',
    signal:   "3 setups génèrent l'essentiel du P&L",
    decision: 'Garder A, retirer les neutres',
    metric:   '3',
    label:    'setups',
    tone:     'text-emerald-300 border-emerald-400/20 bg-emerald-400/10',
    visual:   'setup',
  },
]

const securityChecks = [
  'Connexion en lecture seule à vos brokers',
  'Données chiffrées et stockées en Europe',
  'Aucune possibilité de passer des ordres',
  'Vous pouvez supprimer vos données à tout moment',
]

const securityCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Lock,
    title: 'Lecture seule',
    text: "Nous n'avons aucun accès à votre argent.",
  },
  {
    icon: Server,
    title: 'Hébergement en Europe',
    text: 'Conforme RGPD. Vos données restent en Europe.',
  },
  {
    icon: Shield,
    title: 'Vous gardez le contrôle',
    text: 'Exportez ou supprimez vos données à tout moment.',
  },
]

type AiVisualType = 'behavior' | 'weekly' | 'alert'

const aiAdvantages: Array<{
  icon:    LucideIcon
  badge:   string
  title:   string
  text:    string
  insight: string
  visual:  AiVisualType
}> = [
  {
    icon:    Brain,
    badge:   'Exclusif',
    title:   'Biais comportementaux',
    text:    "L'IA analyse tes 100 derniers trades et identifie ce que tu ne vois pas toi-même. Revenge trading, overtrading, émotions.",
    insight: "Tu perds 73% de tes trades ouverts après 17h — évite cette fenêtre horaire.",
    visual:  'behavior',
  },
  {
    icon:    FileText,
    badge:   'Chaque lundi',
    title:   'Rapport narratif',
    text:    "Un rapport rédigé en français : ta semaine, les causes de tes pertes, et 3 actions concrètes pour la suivante.",
    insight: "Ton win rate a chuté de 62% à 41% — cause : 8 trades session asiatique alors que ton edge est sur Londres.",
    visual:  'weekly',
  },
  {
    icon:    Bell,
    badge:   'Temps réel',
    title:   'Coach de discipline',
    text:    "Si l'IA détecte un pattern de revenge trading en cours, elle t'alerte avant que tu aggraves la situation.",
    insight: "3 pertes consécutives détectées. Risque de tilt élevé — pause recommandée avant le prochain trade.",
    visual:  'alert',
  },
]

const competitorRows = [
  { feature: 'Analyse comportementale', tradeZella: 'Basique', tradesViz: false, edgewonk: false, traderSync: 'Limitée' },
  { feature: 'Rapport narratif hebdo',  tradeZella: false,      tradesViz: false, edgewonk: false, traderSync: false },
  { feature: 'Coach discipline temps réel', tradeZella: false,  tradesViz: false, edgewonk: false, traderSync: false },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 9,
    description: 'Idéal pour bien démarrer',
    features: ['Journal de trading', 'Statistiques de base', 'Import manuel & CSV', '1 compte broker'],
  },
  {
    name: 'Trader',
    price: 19,
    description: 'Pour passer à la vitesse supérieure',
    features: ['Toutes les fonctionnalités Starter', 'Analyses avancées', 'Suivi du risque', 'Rapports personnalisés', 'Connexions brokers illimitées'],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 49,
    description: 'Pour les traders exigeants',
    features: ['Toutes les fonctionnalités Trader', 'Analyse comportementale', 'Objectifs & plans de trading', 'Exports avancés', 'Support prioritaire'],
  },
]

const assuranceItems: Array<{ icon: LucideIcon; title: string }> = [
  { icon: ShieldCheck, title: 'Paiement 100% sécurisé via Stripe' },
  { icon: Power, title: 'Abonnement mensuel sans engagement' },
  { icon: Zap, title: 'Accès immédiat après inscription' },
  { icon: Headphones, title: 'Support réactif par des traders' },
]

const partnerLogos: Array<{
  name:       string
  src:        string
  width:      number
  height:     number
  className?: string
  label?:     string
}> = [
  {
    name:      'Interactive Brokers',
    src:       '/partners/interactive-brokers.png',
    width:     194,
    height:    30,
    className: 'max-h-8',
  },
  {
    name:      'TradeLocker',
    src:       '/partners/tradelocker.svg',
    width:     130,
    height:    40,
    className: 'max-h-9',
  },
  {
    name:      'TradingView',
    src:       '/partners/tradingview.svg',
    width:     64,
    height:    32,
    className: 'max-h-8',
    label:     'TradingView',
  },
  {
    name:      'MetaTrader 4',
    src:       '/partners/metatrader-4.png',
    width:     128,
    height:    64,
    className: 'max-h-10 rounded bg-white',
  },
  {
    name:      'MetaTrader 5',
    src:       '/partners/metatrader-5.png',
    width:     128,
    height:    64,
    className: 'max-h-10 rounded bg-white',
  },
  {
    name:      'OANDA',
    src:       '/partners/oanda.svg',
    width:     126,
    height:    34,
    className: 'max-h-8',
  },
  {
    name:      'Pepperstone',
    src:       '/partners/pepperstone.svg',
    width:     150,
    height:    34,
    className: 'max-h-8',
  },
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
    <div className="flex items-center gap-3">
      <BrandIcon className="h-8 w-8 text-violet-400 drop-shadow-[0_0_18px_rgba(139,92,246,0.55)]" />
      <span className="text-[22px] font-black tracking-[0.12em] text-white">MERKURE</span>
    </div>
  )
}

function DemoButton({
  compact = false,
  dark = true,
  className = '',
  label = 'Voir une analyse réelle',
}: {
  compact?: boolean
  dark?: boolean
  className?: string
  label?: string
}) {
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
      className={`inline-flex items-center justify-center gap-2 rounded-md border font-bold transition-colors disabled:opacity-60 ${
        compact ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm'
      } ${
        dark
          ? 'border-white/30 bg-transparent text-white hover:bg-white/10'
          : 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100'
      } ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <PlayCircle className="h-4 w-4" />
      )}
      {label}
    </button>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(navLinks[0]?.href ?? '')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateActiveSection = () => {
      const offset = 120
      let current = navLinks[0]?.href ?? ''

      navLinks.forEach((link) => {
        const section = document.querySelector(link.href)
        if (section && section.getBoundingClientRect().top <= offset) {
          current = link.href
        }
      })

      setActiveSection(current)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/5 bg-[#070b10]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] w-full max-w-[1680px] items-center justify-between px-5 sm:px-8 xl:px-10">
        <Link href="/" aria-label="Accueil MERKURE">
          <BrandMark />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-1 text-sm font-bold transition-colors hover:text-white ${
                activeSection === link.href
                  ? 'text-white underline underline-offset-4'
                  : 'text-white/70'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <Link href="/sign-in" className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
            Se connecter
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_52%,#2563eb_100%)] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(124,58,237,0.36)] transition-transform hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-[#070b10] px-5 py-5 lg:hidden">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-bold text-white/80 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-5 grid gap-3 border-t border-white/10 pt-5">
            <Link href="/sign-in" onClick={() => setOpen(false)} className="rounded-md border border-white/20 px-4 py-3 text-center text-sm font-bold text-white">
              Se connecter
            </Link>
            <DemoButton compact className="w-full py-3" />
            <Link href="/sign-up" onClick={() => setOpen(false)} className="rounded-md bg-[linear-gradient(135deg,#7c3aed,#a855f7_52%,#2563eb)] px-4 py-3 text-center text-sm font-black text-white">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function PrimaryCta({ children = 'Commencer maintenant', href = '/sign-up' }: { children?: string; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_52%,#2563eb_100%)] px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(124,58,237,0.34)] transition-transform hover:-translate-y-0.5"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

function HeroDepthScene() {
  const mountRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    const canvas = canvasRef.current
    if (!mount || !canvas) return

    const resources: Array<{ dispose: () => void }> = []
    const track = <T extends { dispose: () => void }>(resource: T) => {
      resources.push(resource)
      return resource
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0.18, 7)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: process.env.NODE_ENV !== 'production',
      })
    } catch {
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    scene.add(new THREE.AmbientLight(0x8fb6ff, 1.4))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3)
    keyLight.position.set(-2, 3, 4)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x56bf6b, 1.35)
    rimLight.position.set(3, 1.5, -2)
    scene.add(rimLight)

    const group = new THREE.Group()
    group.rotation.set(-0.48, -0.5, 0.08)
    group.position.set(0.15, -0.05, 0)
    scene.add(group)

    const slabGeometry = track(new THREE.BoxGeometry(3.35, 1.6, 0.06))
    const slabMaterials = [
      track(new THREE.MeshStandardMaterial({ color: 0xeaf2ff, transparent: true, opacity: 0.72, metalness: 0.08, roughness: 0.62 })),
      track(new THREE.MeshStandardMaterial({ color: 0xbfd7ff, transparent: true, opacity: 0.24, metalness: 0.12, roughness: 0.68 })),
      track(new THREE.MeshStandardMaterial({ color: 0x56bf6b, transparent: true, opacity: 0.16, metalness: 0.16, roughness: 0.74 })),
    ]
    const edgeMaterial = track(new THREE.LineBasicMaterial({ color: 0x79a9ef, transparent: true, opacity: 0.58 }))

    slabMaterials.forEach((material, index) => {
      const slab = new THREE.Mesh(slabGeometry, material)
      slab.position.set(index * 0.18, index * 0.1, -index * 0.36)
      slab.rotation.z = (index - 1) * 0.018
      group.add(slab)

      const edges = new THREE.LineSegments(track(new THREE.EdgesGeometry(slabGeometry)), edgeMaterial)
      edges.position.copy(slab.position)
      edges.rotation.copy(slab.rotation)
      group.add(edges)
    })

    const barGeometry = track(new THREE.BoxGeometry(0.09, 1, 0.08))
    const profitMaterial = track(new THREE.MeshStandardMaterial({ color: 0x56bf6b, emissive: 0x163d22, emissiveIntensity: 0.45, roughness: 0.55 }))
    const lossMaterial = track(new THREE.MeshStandardMaterial({ color: 0xf15d5d, emissive: 0x3d1111, emissiveIntensity: 0.32, roughness: 0.58 }))
    const heights = [0.28, 0.52, 0.34, 0.78, 0.44, 0.9, 0.62, 0.36, 0.72]
    heights.forEach((height, index) => {
      const bar = new THREE.Mesh(barGeometry, index === 2 || index === 7 ? lossMaterial : profitMaterial)
      bar.scale.y = height
      bar.position.set(-1.35 + index * 0.33, -0.68 + height / 2, 0.18)
      group.add(bar)
    })

    const lineMaterial = track(new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.88 }))
    const lineGeometry = track(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.48, 0.34, 0.22),
      new THREE.Vector3(-1.1, 0.18, 0.22),
      new THREE.Vector3(-0.68, 0.42, 0.22),
      new THREE.Vector3(-0.25, 0.3, 0.22),
      new THREE.Vector3(0.22, 0.58, 0.22),
      new THREE.Vector3(0.7, 0.5, 0.22),
      new THREE.Vector3(1.18, 0.82, 0.22),
    ]))
    group.add(new THREE.Line(lineGeometry, lineMaterial))

    const resize = () => {
      const rect = mount.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startedAt = performance.now()
    let raf = 0

    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000
      group.rotation.y = -0.5 + Math.sin(elapsed * 0.45) * 0.045
      group.rotation.x = -0.48 + Math.cos(elapsed * 0.35) * 0.025
      group.position.y = -0.05 + Math.sin(elapsed * 0.8) * 0.055
      lineMaterial.opacity = 0.68 + Math.sin(elapsed * 1.4) * 0.18
      renderer.render(scene, camera)
      if (!prefersReducedMotion) raf = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      renderer.dispose()
      resources.forEach((resource) => resource.dispose())
    }
  }, [])

  return (
    <div ref={mountRef} className="hero-depth-scene pointer-events-none absolute -right-8 -top-16 z-0 hidden h-[290px] w-[390px] md:block" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

function _DashboardPreview() {
  const sideNavSections: Array<{
    label: string
    items: Array<{ icon: LucideIcon; label: string; active?: boolean }>
  }> = [
    {
      label: 'Pilotage',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: Wallet, label: 'Comptes' },
        { icon: BriefcaseBusiness, label: 'Portefeuille' },
        { icon: TrendingUp, label: 'Positions' },
        { icon: ArrowLeftRight, label: 'Transactions' },
      ],
    },
    {
      label: 'Analyse',
      items: [
        { icon: BarChart2, label: 'Performance' },
        { icon: PieChart, label: 'Statistiques' },
        { icon: NotebookPen, label: 'Journal' },
        { icon: FileText, label: 'Rapports' },
      ],
    },
    {
      label: 'Compte',
      items: [
        { icon: CreditCard, label: 'Abonnement' },
        { icon: Bell, label: 'Alertes' },
        { icon: Settings2, label: 'Paramètres' },
      ],
    },
  ]
  const actionCards: Array<{ icon: LucideIcon; title: string; text: string; tone: string }> = [
    {
      icon: WalletCards,
      title: 'Comptes connectés',
      text: 'Vérifiez la dernière synchronisation de vos comptes.',
      tone: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    },
    {
      icon: Activity,
      title: 'Revue de session',
      text: 'Documentez vos erreurs récurrentes et vos setups propres.',
      tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    },
    {
      icon: AlertTriangle,
      title: 'Alertes de risque',
      text: 'Surveillez drawdown, séries de pertes et anomalies.',
      tone: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    },
  ]
  const kpis: Array<{ icon: LucideIcon; label: string; value: string; helper: string; color: string; iconColor: string }> = [
    { icon: TrendingUp, label: 'P&L 30 jours', value: '+2 930 €', helper: 'Données synchronisées', color: 'text-[#38e476]', iconColor: 'text-[#38e476]' },
    { icon: Activity, label: 'Trades', value: '62', helper: 'Trades clôturés', color: 'text-white', iconColor: 'text-blue-300' },
    { icon: TrendingDown, label: 'Drawdown Max', value: '-33,7%', helper: 'Maximum observé', color: 'text-[#ff5e70]', iconColor: 'text-[#ff5e70]' },
    { icon: Target, label: 'Win Rate', value: '58,1%', helper: '36 / 62 trades', color: 'text-white', iconColor: 'text-blue-300' },
    { icon: Target, label: 'Profit Factor', value: '1,62', helper: 'Solide', color: 'text-white', iconColor: 'text-[#38e476]' },
    { icon: CalendarDays, label: 'Meilleur jour', value: '+420 €', helper: '19 mai 2026', color: 'text-[#38e476]', iconColor: 'text-[#38e476]' },
  ]
  const assets: Array<[symbol: string, pct: string, pnl: string, color: string]> = [
    ['EURUSD', '42%', '+1 240 €', '#2563eb'],
    ['NAS100', '31%', '+860 €', '#38e476'],
    ['XAUUSD', '18%', '-210 €', '#ff5e70'],
  ]

  return (
    <div className="hero-preview-stage relative mx-auto w-full max-w-[900px] lg:mr-0 xl:max-w-[920px] 2xl:max-w-[980px]">
      <HeroDepthScene />

      <div className="hero-floating-chip hero-floating-chip-profit pointer-events-none absolute -left-5 top-24 z-20 hidden rounded-lg border border-emerald-400/20 bg-[#0b111c]/95 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-md lg:block">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Session propre</p>
        <p className="mt-1 font-mono text-lg font-black text-[#38e476]">+240 €</p>
      </div>

      <div className="hero-floating-chip hero-floating-chip-risk pointer-events-none absolute -right-3 bottom-20 z-20 hidden rounded-lg border border-blue-400/20 bg-[#0b111c]/95 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-md lg:block">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Risque / trade</p>
        <p className="mt-1 font-mono text-lg font-black text-white">1,5%</p>
      </div>

      <div className="hero-preview relative z-10 h-[430px] overflow-hidden rounded-xl border border-slate-800 bg-[#070b12] shadow-[0_22px_70px_rgba(0,0,0,0.42)] sm:h-[455px] xl:h-[480px]">
        <div className="grid h-full lg:grid-cols-[188px_1fr]">
          <aside className="hidden border-r border-slate-800 bg-[#070b12] lg:flex lg:flex-col">
            <div className="border-b border-slate-800 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-sm font-black text-white">
                  M
                </div>
                <span className="text-sm font-black tracking-normal text-white">MERKURE</span>
              </div>
            </div>

            <nav className="flex-1 space-y-5 overflow-hidden px-2.5 py-4">
              {sideNavSections.map((section) => (
                <div key={section.label}>
                  <p className="mb-1.5 px-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold ${
                          active
                            ? 'border border-slate-700 bg-slate-900 text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-slate-800 p-3">
              <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-3">
                <p className="text-xs font-bold text-white/80">Plan Pro</p>
                <button className="mt-3 w-full rounded-lg border border-slate-800 bg-transparent py-2 text-[10px] font-semibold text-slate-500">
                  Gérer l'abonnement →
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 overflow-hidden bg-[#070b12]">
            <header className="flex min-h-[58px] items-center justify-between gap-4 border-b border-slate-800 bg-[#0b111c]/85 px-4 backdrop-blur">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold leading-none text-white sm:text-base">Vue d'ensemble</h2>
                <p className="mt-1.5 hidden truncate text-[11px] text-slate-500 sm:block">
                  Performance, risque et synchronisation des comptes
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {[Search, Sun, Bell].map((Icon, index) => (
                  <div key={index} className="relative hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 sm:flex">
                    <Icon className="h-3.5 w-3.5" />
                    {Icon === Bell && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </div>
                ))}
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[10px] font-bold text-white">
                  LD
                </div>
              </div>
            </header>

            <div className="space-y-3 p-3 sm:p-4">
              <div className="grid gap-2 lg:grid-cols-3">
                {actionCards.map(({ icon: Icon, title, text, tone }, index) => (
                  <div
                    key={title}
                    className="hero-metric-pop rounded-lg border border-slate-800 bg-[#0b111c] p-3"
                    style={{ animationDelay: `${430 + index * 80}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white">{title}</p>
                        <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">{text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
                {kpis.map(({ icon: Icon, label, value, helper, color, iconColor }, index) => (
                  <div
                    key={label}
                    className="hero-metric-pop min-h-[100px] rounded-lg border border-slate-800 bg-[#0b111c] p-3"
                    style={{ animationDelay: `${600 + index * 60}ms` }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="truncate text-[8px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-800 bg-[#071017]">
                        <Icon className={`h-3 w-3 ${iconColor}`} />
                      </div>
                    </div>
                    <p className={`font-mono text-base font-black ${color}`}>{value}</p>
                    <p className="mt-2 truncate text-[10px] font-semibold text-slate-500">{helper}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.55fr_0.95fr]">
                <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-3">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Courbe equity</p>
                      <h3 className="mt-1 text-xs font-black text-white">Évolution de la performance</h3>
                      <div className="mt-2 inline-flex overflow-hidden rounded-md border border-slate-800 bg-[#071017] text-[10px] font-bold">
                        <span className="bg-blue-700 px-2.5 py-1 text-white">Cumulé</span>
                        <span className="border-l border-slate-800 px-2.5 py-1 text-slate-500">Journalier</span>
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-800 bg-[#071017] px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                      Tous les comptes
                    </div>
                  </div>
                  <div className="h-32 sm:h-36">
                    <svg viewBox="0 0 520 190" className="h-full w-full" aria-hidden="true">
                      <defs>
                        <linearGradient id="heroChart" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#38e476" stopOpacity="0.34" />
                          <stop offset="100%" stopColor="#38e476" stopOpacity="0.03" />
                        </linearGradient>
                      </defs>
                      {[42, 80, 118, 156].map((y) => (
                        <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="#1f2937" strokeDasharray="3 3" />
                      ))}
                      <line x1="0" x2="520" y1="138" y2="138" stroke="#334155" strokeDasharray="3 3" />
                      <path d="M0 138 L32 132 L58 145 L88 128 L112 150 L145 136 L178 139 L205 112 L232 88 L260 80 L292 64 L325 78 L350 74 L378 83 L405 54 L434 62 L462 42 L492 48 L520 27 L520 190 L0 190 Z" fill="url(#heroChart)" />
                      <polyline
                        className="hero-chart-draw"
                        points="0,138 32,132 58,145 88,128 112,150 145,136 178,139 205,112 232,88 260,80 292,64 325,78 350,74 378,83 405,54 434,62 462,42 492,48 520,27"
                        fill="none"
                        stroke="#38e476"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        className="hero-chart-draw-loss"
                        points="0,138 32,132 58,145 88,128 112,150"
                        fill="none"
                        stroke="#ff5e70"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 flex gap-1 text-[10px] font-semibold">
                    {['1J', '7J', '1M', '3M', '6M', 'YTD'].map((period) => (
                      <span key={period} className={`rounded-lg px-2 py-1 ${period === '1M' ? 'bg-blue-700 text-white' : 'text-slate-500'}`}>
                        {period}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Allocation trades</p>
                      <h3 className="mt-1 text-xs font-black text-white">Répartition des actifs</h3>
                    </div>
                    <div className="hidden overflow-hidden rounded-md border border-slate-800 bg-[#071017] text-[10px] font-bold sm:inline-flex">
                      <span className="bg-blue-700 px-2 py-1 text-white">Nb trades</span>
                    </div>
                  </div>
                  <div className="grid items-center gap-3 sm:grid-cols-[120px_1fr] lg:grid-cols-1 xl:grid-cols-[120px_1fr]">
                    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                      <div
                        className="hero-soft-pulse absolute inset-0 rounded-full"
                        style={{ background: 'conic-gradient(#2563eb 0 42%, #38e476 42% 73%, #ff5e70 73% 91%, #f59e0b 91% 100%)' }}
                      />
                      <div className="relative flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-[#0b111c]">
                        <span className="text-[10px] text-slate-500">trades</span>
                        <span className="font-mono text-lg font-black text-white">62</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {assets.map(([symbol, pct, pnl, color]) => (
                        <div key={symbol} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[11px]">
                          <span className="flex min-w-0 items-center gap-2 text-slate-300">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                            <span className="truncate">{symbol}</span>
                          </span>
                          <span className="font-mono text-slate-300">{pct}</span>
                          <span className={`text-right font-mono ${pnl.startsWith('+') ? 'text-[#38e476]' : 'text-[#ff5e70]'}`}>{pnl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const heroBrainChips: Array<{
  icon: LucideIcon
  title: string
  text: string
  position: string
}> = [
  { icon: Brain, title: 'Détection de biais', text: 'Patterns récurrents', position: 'left-0 top-16' },
  { icon: Sparkles, title: 'Coaching IA', text: 'Conseils personnalisés', position: 'right-4 top-24' },
  { icon: ShieldCheck, title: 'Analyse IA', text: 'Temps réel', position: 'left-12 bottom-24' },
  { icon: TrendingUp, title: "Plan d'amélioration", text: 'Actions concrètes', position: 'right-10 bottom-28' },
]

function HeroBrainVisual() {
  return (
    <div className="hero-fade-up hero-delay-4 relative mx-auto hidden h-[560px] w-full max-w-[820px] xl:block">
      <div className="absolute inset-[-36px] rounded-full bg-[radial-gradient(circle_at_54%_44%,rgba(168,85,247,0.36),transparent_38%),radial-gradient(circle_at_68%_55%,rgba(37,99,235,0.22),transparent_36%),radial-gradient(circle_at_56%_82%,rgba(109,40,217,0.24),transparent_28%)] blur-3xl" />
      <div className="absolute left-[57%] top-[56%] h-[230px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,0.08),rgba(168,85,247,0.22),rgba(236,72,153,0.10))] blur-2xl" />
      <div className="hero-brain-orbit absolute left-[58%] top-[48%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20" />
      <div className="hero-brain-orbit hero-brain-orbit-slow absolute left-[58%] top-[48%] h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/10" />
      <div className="hero-brain-orbit hero-brain-orbit-reverse absolute left-[58%] top-[48%] h-[315px] w-[315px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/20" />

      <div className="hero-brain-art-frame absolute inset-y-[-26px] right-[-48px] w-[98%] overflow-hidden">
        <Image
          src="/hero/merkure-brain-profile.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 760px, 0px"
          className="hero-brain-art object-contain object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_0%,transparent_48%,rgba(5,8,22,0.72)_76%,#050816_100%),linear-gradient(90deg,#050816_0%,rgba(5,8,22,0.26)_18%,rgba(5,8,22,0)_56%,#050816_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050816] via-[#050816]/72 to-transparent" />
      </div>

      <div className="pointer-events-none absolute left-[58.4%] top-[41.8%] z-20 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-violet-500/18 blur-2xl" />
        <BrandIcon className="relative h-16 w-16 text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.86)]" />
      </div>

      {heroBrainChips.map(({ icon: Icon, title, text, position }, index) => (
        <div
          key={title}
          className={`hero-floating-chip absolute z-30 ${position} min-w-[190px] rounded-lg border border-violet-300/15 bg-[#0c1020]/86 px-4 py-3 shadow-[0_18px_46px_rgba(0,0,0,0.35)] backdrop-blur-md`}
          style={{ animationDelay: `${900 + index * 170}ms` }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300/15 bg-violet-500/15 text-violet-300">
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[10px] font-black uppercase tracking-wider text-white">{title}</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">{text}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#050816] px-5 pb-8 pt-24 text-white sm:px-8 lg:pb-10 lg:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(980px_560px_at_75%_24%,rgba(124,58,237,0.34),transparent_60%),radial-gradient(720px_440px_at_58%_70%,rgba(37,99,235,0.18),transparent_58%),radial-gradient(520px_380px_at_18%_70%,rgba(168,85,247,0.16),transparent_62%),linear-gradient(135deg,#050816_0%,#080b18_34%,#120b2a_66%,#050816_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[620px] w-[980px] -translate-x-[10%] rounded-full bg-[conic-gradient(from_210deg,rgba(37,99,235,0),rgba(124,58,237,0.20),rgba(236,72,153,0.10),rgba(37,99,235,0.16),rgba(37,99,235,0))] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-[88px] h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto grid w-full max-w-[1680px] items-center gap-10 xl:grid-cols-[0.82fr_1.18fr] xl:gap-8 2xl:gap-12">
        <div className="relative z-10">
          <div className="hero-fade-up hero-delay-1 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-violet-300">
            Plateforme de performance trading
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.85)]" />
          </div>

          <h1 className="hero-fade-up hero-delay-2 mt-7 max-w-3xl text-4xl font-black leading-[1.08] tracking-normal text-white sm:text-5xl xl:text-[62px]">
            Devenez le trader
            <br />
            que vos <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(139,92,246,0.44)]">émotions</span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(139,92,246,0.44)]">empêchent d’être.</span>
          </h1>

          <p className="hero-fade-up hero-delay-3 mt-7 max-w-xl text-base font-medium leading-8 text-slate-300">
            MERKURE analyse vos décisions, détecte vos biais comportementaux et vous aide à construire une discipline durable.
          </p>

          <div className="hero-fade-up hero-delay-7 mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta>Commencer gratuitement</PrimaryCta>
            <DemoButton />
          </div>

          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroBenefits.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className={`hero-fade-up ${heroBenefitDelayClasses[index] ?? 'hero-delay-4'} flex items-center gap-3`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-white">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-fade-up hero-delay-8 mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-violet-300">Early access</span>
            <span>Rejoignez les premiers traders qui construisent leur avantage comportemental avec MERKURE.</span>
          </div>

          <p className="hero-fade-up hero-delay-8 mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Lock className="h-4 w-4 text-violet-300" />
            Aucune carte bancaire requise
          </p>
        </div>

        <HeroBrainVisual />
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, dark = false }: { eyebrow: string; title: string; dark?: boolean }) {
  return (
    <div className="max-w-5xl text-left">
      <p className={`text-xs font-black uppercase tracking-[0.24em] ${dark ? 'text-blue-300' : 'text-blue-700'}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
    </div>
  )
}

function FeatureSection() {
  return (
    <section id="fonctionnalites" className="scroll-mt-24 bg-white px-5 py-16 text-slate-950 sm:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-[1680px]">
        <SectionHeading eyebrow="Tout ce dont vous avez besoin" title="Un outil complet pour chaque étape de votre progression" />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {features.map(({ icon: Icon, title, text, badge }, index) => (
            <article key={title} className={`rounded-lg border border-slate-200 bg-white p-6 ${index > 0 ? '2xl:border-l 2xl:border-slate-200' : ''}`}>
              <div className="relative mb-7 flex h-10 w-10 items-center justify-center text-blue-700">
                <Icon className="h-8 w-8 stroke-[1.8]" />
                {badge && (
                  <span className="absolute -right-5 -top-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-950">{title}</h3>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImportWorkflowVisual() {
  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-lg border border-blue-400/20 bg-[#0b111c] p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500" />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Import</p>
          <h3 className="mt-2 text-lg font-black text-white">Trades centralisés</h3>
        </div>
        <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">
          Sync OK
        </div>
      </div>

      <div className="mt-7 grid gap-3">
        {[
          ['Interactive Brokers', '128 trades', 'bg-blue-500'],
          ['MetaTrader 5', '64 trades', 'bg-emerald-500'],
          ['CSV manuel', '31 trades', 'bg-amber-400'],
        ].map(([broker, trades, color], index) => (
          <div key={broker} className="hero-metric-pop flex items-center justify-between rounded-lg border border-slate-800 bg-[#071017] p-4" style={{ animationDelay: `${160 + index * 80}ms` }}>
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              <span className="text-sm font-black text-white">{broker}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-400">{trades}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>Contrôle qualité</span>
          <span>Lecture seule</span>
        </div>
        <div className="grid grid-cols-12 items-end gap-1.5">
          {[36, 56, 42, 78, 62, 88, 44, 70, 52, 94, 74, 98].map((height, index) => (
            <div key={index} className="rounded-t-sm bg-blue-500/70" style={{ height: `${height}px` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function JournalWorkflowVisual() {
  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-lg border border-emerald-400/20 bg-[#ecfdf5] p-5 text-slate-950 shadow-[0_24px_70px_rgba(6,95,70,0.16)]">
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-200/70 to-blue-100/60" />
      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Journal</p>
        <h3 className="mt-2 text-lg font-black">La décision derrière le trade</h3>
      </div>

      <div className="relative mt-7 rounded-lg border border-emerald-200 bg-white p-4 shadow-xl shadow-emerald-900/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-slate-950">Breakout NAS100</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">Session New York · 16:42</p>
          </div>
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">+345 €</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Setup', 'A+'],
            ['Risque', '1,2%'],
            ['Émotion', 'Calme'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-slate-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-1 font-mono text-sm font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          <div className="h-2 rounded-full bg-slate-200" />
          <div className="h-2 w-10/12 rounded-full bg-slate-200" />
          <div className="h-2 w-7/12 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-4 gap-2">
        {['Plan', 'Capture', 'Erreur', 'Règle'].map((item) => (
          <div key={item} className="rounded-md border border-emerald-200 bg-white/70 px-2 py-2 text-center text-[10px] font-black text-emerald-800">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function DecisionWorkflowVisual() {
  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-lg border border-amber-400/20 bg-[#0b111c] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Décision</p>
          <h3 className="mt-2 text-lg font-black text-white">Ce qu'il faut changer</h3>
        </div>
        <AlertTriangle className="h-6 w-6 text-amber-300" />
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-slate-800 bg-[#071017] p-4">
          <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(#38e476 0 58%, #f59e0b 58% 76%, #ff5e70 76% 100%)' }}
            />
            <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#0b111c]">
              <span className="text-[10px] font-semibold text-slate-500">score</span>
              <span className="font-mono text-2xl font-black text-white">72</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ['Garder', 'Breakout A+', 'text-emerald-300'],
            ['Réduire', 'Trades après 18h', 'text-amber-300'],
            ['Stopper', 'Entrées sans plan', 'text-rose-300'],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-lg border border-slate-800 bg-[#071017] p-4">
              <p className={`text-[10px] font-black uppercase tracking-wider ${color}`}>{label}</p>
              <p className="mt-1 text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {workflowOutcomes.map((item) => (
          <span key={item} className="rounded-md border border-slate-800 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-slate-300">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function WorkflowSection() {
  return (
    <section id="methode" className="scroll-mt-24 bg-[#071017] px-5 py-14 text-white sm:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-[1680px]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Méthode MERKURE</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Importer. Comprendre. Corriger.
          </h2>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-300">
            Une méthode courte pour transformer vos trades en règles de décision.
          </p>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-[0.95fr_1.05fr_1fr]">
          <ImportWorkflowVisual />
          <JournalWorkflowVisual />
          <DecisionWorkflowVisual />
        </div>
      </div>
    </section>
  )
}

function AnalyticsPreview() {
  const heatCells = Array.from({ length: 7 * 14 }, (_, index) => {
    if ([8, 19, 41, 64, 83].includes(index)) return '#fca5a5'
    if ([4, 11, 27, 35, 52, 71, 90].includes(index)) return '#22c55e'
    if (index % 9 === 0) return '#86efac'
    if (index % 13 === 0) return '#fecaca'
    return '#e5e7eb'
  })
  const statCards = [
    ['Profit net', '+2 930 €', 'text-emerald-600'],
    ['Win rate', '58,1%', 'text-slate-950'],
    ['Profit factor', '1,62', 'text-slate-950'],
    ['Drawdown', '-33,7%', 'text-red-600'],
  ]
  const symbolRows: Array<[symbol: string, trades: string, winRate: string, pnl: string]> = [
    ['EURUSD', '14', '64%', '+1 250 €'],
    ['NAS100', '8', '58%', '+860 €'],
    ['XAUUSD', '6', '33%', '-210 €'],
  ]

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/25 to-transparent" />

      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Performance</p>
            <h3 className="mt-1 text-base font-black text-slate-950">Analyse détaillée des résultats</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
              {['7j', '30j', '90j', '1an'].map((period) => (
                <span key={period} className={`rounded-md px-2.5 py-1 ${period === '30j' ? 'bg-blue-700 text-white' : 'text-slate-500'}`}>
                  {period}
                </span>
              ))}
            </div>
            <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 sm:block">
              Tous les comptes
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
              <Download className="h-3.5 w-3.5" />
              Rapport PDF
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(([label, value, color], index) => (
            <div
              key={label}
              className="hero-metric-pop rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              style={{ animationDelay: `${220 + index * 80}ms` }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
              <p className={`mt-4 font-mono text-xl font-black ${color}`}>{value}</p>
              <p className="mt-2 text-[11px] font-semibold text-slate-500">Période 30 jours</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">P&L cumulé & Drawdown</p>
                <h4 className="mt-1 text-sm font-black text-slate-950">Lecture du risque dans la performance</h4>
              </div>
              <div className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-[11px] font-bold">
                <span className="bg-blue-700 px-3 py-1.5 text-white">P&L</span>
                <span className="border-l border-slate-200 px-3 py-1.5 text-slate-500">Drawdown</span>
              </div>
            </div>
            <div className="h-56">
              <svg viewBox="0 0 620 230" className="h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="analysisPnlGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[42, 82, 122, 162, 202].map((y) => (
                  <line key={y} x1="0" x2="620" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              ))}
                <line x1="0" x2="620" y1="154" y2="154" stroke="#cbd5e1" strokeDasharray="4 4" />
                <path d="M0 154 L38 148 L76 164 L114 141 L152 150 L190 132 L228 112 L266 118 L304 88 L342 96 L380 72 L418 78 L456 60 L494 66 L532 42 L570 50 L620 30 L620 230 L0 230 Z" fill="url(#analysisPnlGradient)" />
                <polyline
                  className="hero-chart-draw"
                  points="0,154 38,148 76,164 114,141 152,150 190,132 228,112 266,118 304,88 342,96 380,72 418,78 456,60 494,66 532,42 570,50 620,30"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  className="hero-chart-draw-loss"
                  points="0,178 38,182 76,194 114,184 152,188 190,176 228,172 266,180 304,166 342,170 380,158 418,162 456,152 494,156 532,144 570,148 620,138"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5 6"
                />
              </svg>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Performance par session</p>
              <div className="mt-5 space-y-4">
                {[
                  ['Londres', '+1 120 €', '72%', 'w-[72%]', 'text-emerald-600', 'bg-emerald-500'],
                  ['New York', '+620 €', '58%', 'w-[58%]', 'text-emerald-600', 'bg-emerald-500'],
                  ['Asie', '-180 €', '34%', 'w-[34%]', 'text-red-600', 'bg-red-500'],
                ].map(([name, pnl, rate, width, textColor, barColor]) => (
                  <div key={name}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700">{name}</span>
                      <span className={`font-mono ${textColor}`}>{pnl}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${barColor} ${width}`} />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-slate-500">{rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Statistiques par instrument</p>
              <div className="mt-4 space-y-3">
                {symbolRows.map(([symbol, trades, winRate, pnl]) => (
                  <div key={symbol} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-[11px]">
                    <span className="font-semibold text-slate-700">{symbol}</span>
                    <span className="font-mono text-slate-500">{trades}</span>
                    <span className="font-mono text-slate-500">{winRate}</span>
                    <span className={`font-mono font-black ${pnl.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{pnl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-950">Heatmap P&L (jour x heure)</h4>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#e5e7eb]" />Aucun trade</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#22c55e]" />Profit</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#fca5a5]" />Perte</span>
            </div>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: '34px repeat(14, minmax(16px, 1fr))' }}>
            <div />
            {Array.from({ length: 14 }, (_, index) => (
              <div key={index} className="text-center font-mono text-[9px] text-slate-600">
                {String(index + 7).padStart(2, '0')}
              </div>
            ))}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, dayIndex) => (
              <div key={day} className="contents">
                <div className="flex items-center text-[10px] font-medium text-slate-400">{day}</div>
                {heatCells.slice(dayIndex * 14, dayIndex * 14 + 14).map((color, cellIndex) => (
                  <div
                    key={`${day}-${cellIndex}`}
                    className="h-4 rounded-sm transition-opacity hover:opacity-80"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalysisSection() {
  return (
    <section id="analyses" className="scroll-mt-24 bg-[#f4f8fd] px-5 py-16 text-slate-950 sm:px-8 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1680px] items-center gap-12 xl:grid-cols-[1.15fr_0.85fr] xl:gap-16">
        <AnalyticsPreview />

        <div className="lg:pl-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">Analysez. Comprenez. Progressez.</p>
          <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
            Une lecture concrète de votre performance
          </h2>
          <p className="mt-7 max-w-xl text-base font-medium leading-8 text-slate-700">
            MERKURE transforme vos trades en lecture exploitable : périodes, instruments, sessions, drawdown et habitudes récurrentes.
          </p>

          <ul className="mt-7 space-y-4">
            {analysisBullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-md bg-[#56bf6b] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(86,191,107,0.22)] transition-colors hover:bg-[#49ab5e]"
          >
            Explorer les analyses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TraderProfilesSection() {
  return (
    <section className="bg-white px-5 py-16 text-slate-950 sm:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
          <SectionHeading eyebrow="Adapté à votre niveau" title="Un dashboard utile à chaque étape de maturité" />

          <div className="grid gap-5 md:grid-cols-3">
            {traderProfiles.map(({ icon: Icon, label, title, pain, discovery, points, accentColor }) => (
              <article key={title} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${accentColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{pain}</p>
                <p className="mt-4 border-l-2 border-blue-400 pl-3 text-sm font-semibold italic leading-6 text-slate-700">{discovery}</p>
                <ul className="mt-5 space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AuditScenarioVisual({ type }: { type: 'time' | 'risk' | 'setup' }) {
  if (type === 'time') {
    const cells = Array.from({ length: 24 }, (_, index) => {
      if ([17, 18, 22].includes(index)) return 'bg-rose-400'
      if ([14, 15, 16, 19].includes(index)) return 'bg-amber-300'
      if ([4, 5, 8, 9, 10].includes(index)) return 'bg-emerald-400'
      return 'bg-slate-800'
    })

    return (
      <div className="rounded-lg border border-slate-800 bg-[#071017] p-4">
        <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>Heatmap horaire</span>
          <span>17h</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {cells.map((color, index) => (
            <div key={index} className={`h-7 rounded-md ${color} ${index === 17 ? 'ring-2 ring-white/50' : ''}`} />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'risk') {
    return (
      <div className="rounded-lg border border-slate-800 bg-[#071017] p-4">
        <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>Risque session</span>
          <span className="text-rose-300">alerte</span>
        </div>
        <div className="space-y-3">
          {[
            ['Trade 1', 'w-[34%]', 'bg-emerald-400'],
            ['Trade 2', 'w-[54%]', 'bg-amber-300'],
            ['Trade 3', 'w-[88%]', 'bg-rose-400'],
          ].map(([label, width, color]) => (
            <div key={label} className="grid grid-cols-[54px_1fr] items-center gap-3">
              <span className="text-[10px] font-black text-slate-500">{label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${width} ${color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-[#071017] p-4">
      <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
        <span>Ranking setups</span>
        <span>top 3</span>
      </div>
      <div className="space-y-3">
        {[
          ['Breakout A+', '+1 240 €', 'w-[92%]', 'text-emerald-300', 'bg-emerald-400'],
          ['Pullback', '+420 €', 'w-[58%]', 'text-emerald-300', 'bg-emerald-400'],
          ['News', '-310 €', 'w-[38%]', 'text-rose-300', 'bg-rose-400'],
        ].map(([setup, pnl, width, textColor, barColor]) => (
          <div key={setup}>
            <div className="mb-1 flex items-center justify-between text-[10px] font-black">
              <span className="text-slate-300">{setup}</span>
              <span className={textColor}>{pnl}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className={`h-full rounded-full ${width} ${barColor}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UseCasesSection() {
  return (
    <section className="bg-[#070b10] px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-10 grid gap-6 xl:grid-cols-[0.75fr_1.25fr] xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Cas d'usage</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl">
              Trois signaux qui changent la décision.
            </h2>
          </div>
          <p className="max-w-2xl text-sm font-medium leading-7 text-slate-400 xl:justify-self-end">
            Une lecture rapide : le problème, le signal, puis l'action à tester. Pas de promesse de rendement, seulement des décisions plus claires.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {auditScenarios.map((scenario) => {
            const Icon = scenario.icon

            return (
              <article
                key={scenario.profile}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.20)]"
              >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${scenario.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Signal détecté</p>
                    <h3 className="mt-1 text-lg font-black text-white">{scenario.profile}</h3>
                  </div>
                </div>
                <div className={`rounded-lg border px-3 py-2 text-right ${scenario.tone}`}>
                  <p className="font-mono text-2xl font-black">{scenario.metric}</p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider opacity-80">{scenario.label}</p>
                </div>
              </div>

              <div className="mt-5">
                <AuditScenarioVisual type={scenario.visual} />
              </div>

              <div className="mt-5 grid gap-2">
                <div className="grid grid-cols-[84px_1fr] items-center rounded-lg border border-slate-800 bg-[#0b111c] px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Problème</p>
                  <p className="text-sm font-black text-slate-200">{scenario.problem}</p>
                </div>

                <div className="grid grid-cols-[84px_1fr] items-center rounded-lg border border-blue-400/15 bg-blue-400/[0.06] px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">Signal</p>
                  <p className="text-sm font-black text-slate-100">{scenario.signal}</p>
                </div>

                <div className="grid grid-cols-[84px_1fr] items-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Décision</p>
                  <p className="text-sm font-black text-slate-100">{scenario.decision}</p>
                </div>
              </div>
            </article>
            )
          })}
        </div>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-4 text-sm font-semibold text-slate-400 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
              Scénarios anonymisés
            </div>
            <div className="flex items-center gap-3">
              <BarChart2 className="h-5 w-5 text-blue-300" />
              Lecture orientée décision
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-300" />
              Aucune promesse de performance
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
function SecuritySection() {
  return (
    <section id="securite" className="scroll-mt-24 bg-[#071017] px-5 py-16 text-white sm:px-8 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1680px] gap-12 xl:grid-cols-[0.62fr_1.38fr] xl:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Sécurité & confidentialité</p>
          <h2 className="mt-5 max-w-md text-3xl font-black leading-tight sm:text-4xl">
            Vos données sont sécurisées. Vous gardez le contrôle.
          </h2>
          <ul className="mt-7 space-y-3">
            {securityChecks.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#56bf6b]" />
                {item}
              </li>
            ))}
          </ul>
          <a href="#fonctionnalites" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-300 hover:text-blue-200">
            En savoir plus sur la sécurité
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {securityCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="min-h-[220px] rounded-lg border border-white/10 bg-white/[0.04] p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10 text-blue-300">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-9 text-lg font-black text-blue-200">{title}</h3>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AiToolVisual({ type, badge }: { type: AiVisualType; badge: string }) {
  const navDots = Array.from({ length: 7 }, (_, index) => index)

  return (
    <div className="relative h-44 overflow-hidden rounded-lg border border-slate-800 bg-[#071017] p-3 shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.16),transparent_36%)]" />
      <div className="relative flex h-full gap-3">
        <div className="hidden w-6 shrink-0 flex-col items-center gap-2 border-r border-slate-800/80 pr-2 sm:flex">
          <div className="mb-1 h-3 w-3 rounded-sm border border-white/20" />
          {navDots.map((dot) => (
            <span key={dot} className={`h-1.5 w-1.5 rounded-full ${dot === 2 ? 'bg-violet-400' : 'bg-slate-700'}`} />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700">
              {badge}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">MERKURE</span>
          </div>

          {type === 'behavior' && (
            <div className="rounded-lg border border-slate-800 bg-[#0b111c]/90 p-3">
              <p className="text-[10px] font-black text-slate-300">Biais détectés</p>
              <div className="mt-3 space-y-2.5">
                {[
                  ['Revenge trading', 'Élevé', 'text-red-400'],
                  ['Aversion à la perte', 'Moyen', 'text-amber-300'],
                  ['Sur-confiance', 'Faible', 'text-emerald-300'],
                ].map(([name, level, color]) => (
                  <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[10px]">
                    <span className="flex min-w-0 items-center gap-2 text-slate-400">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                      <span className="truncate">{name}</span>
                    </span>
                    <span className={`font-black ${color}`}>{level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'weekly' && (
            <div className="grid h-[122px] gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-[#0b111c]/90 p-3">
                <p className="text-[10px] font-black text-slate-300">Performance globale</p>
                <p className="mt-4 font-mono text-lg font-black text-white">+2 930,16 €</p>
                <p className="mt-1 font-mono text-xs font-black text-emerald-300">+5,27%</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0b111c]/90 p-3">
                <p className="text-[10px] font-black text-slate-300">Points clés</p>
                <div className="mt-3 space-y-2 text-[9px] font-semibold text-slate-400">
                  {['Focus clair', 'Drawdown maîtrisé', 'Structure gagnante'].map((item) => (
                    <p key={item} className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-300" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === 'alert' && (
            <div className="rounded-lg border border-slate-800 bg-[#0b111c]/90 p-3">
              <p className="text-[10px] font-black text-slate-300">Alerte de discipline</p>
              <p className="mt-4 text-sm font-black text-white">Risque de revenge trading</p>
              <div className="mt-3 rounded-md border border-slate-800 bg-[#071017] p-3">
                <p className="text-[10px] font-semibold text-slate-500">Conseil IA</p>
                <p className="mt-1 text-[10px] font-black text-slate-300">Pause de 20 minutes recommandée.</p>
              </div>
              <button className="mt-3 rounded-md bg-blue-700 px-3 py-1.5 text-[10px] font-black text-white">
                Voir le détail
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function MetricsStrip() {
  return (
    <section id="ia" className="scroll-mt-24 bg-[#f8fbff] px-5 py-16 text-slate-950 sm:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="grid gap-10 xl:grid-cols-[300px_1fr] 2xl:grid-cols-[340px_1fr]">
          <div className="xl:pt-9">
            <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-violet-700">
              <span className="h-5 w-0.5 rounded-full bg-violet-700" />
              Nos outils IA
            </p>
            <h2 className="mt-6 max-w-sm text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              L'IA au service de votre progression
            </h2>
            <p className="mt-6 max-w-sm text-base font-medium leading-8 text-slate-700">
              Des analyses intelligentes pour comprendre vos comportements, détecter vos biais et vous proposer des actions concrètes.
            </p>

            <Link
              href="/sign-up"
              className="mt-9 inline-flex items-center justify-center gap-3 rounded-md bg-[#56bf6b] px-7 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(86,191,107,0.24)] transition-colors hover:bg-[#49ab5e]"
            >
              Découvrir les outils IA
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {aiAdvantages.map(({ icon: Icon, badge, title, text, insight, visual }, index) => (
                <article
                  key={title}
                  className="hero-metric-pop overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_54px_rgba(15,23,42,0.10)]"
                  style={{ animationDelay: `${120 + index * 70}ms` }}
                >
                  <AiToolVisual type={visual} badge={badge} />
                  <div className="pt-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-lg font-black text-slate-950">{title}</h3>
                    </div>
                    <p className="mt-4 min-h-[72px] text-sm font-semibold leading-7 text-slate-600">{text}</p>

                    <div className="mt-4">
                      <span className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">
                        Exemple d&apos;insight
                      </span>
                      <div className="mt-2 min-h-[80px] rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-black italic leading-7 text-slate-800">&ldquo;{insight}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Tableau comparatif concurrents */}
            <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Comparatif concurrents</p>
                <p className="mt-1 text-base font-black text-slate-950">Ce que tes concurrents ne font pas</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Feature</th>
                      {['TradeZella', 'TradesViz', 'Edgewonk', 'TraderSync'].map(c => (
                        <th key={c} className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">{c}</th>
                      ))}
                      <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-wider text-violet-700">MERKURE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorRows.map(({ feature, tradeZella, tradesViz, edgewonk, traderSync }, i) => (
                      <tr key={feature} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="px-6 py-3 text-sm font-semibold text-slate-700">{feature}</td>
                        {[tradeZella, tradesViz, edgewonk, traderSync].map((val, j) => (
                          <td key={j} className="px-4 py-3 text-center">
                            {val === false
                              ? <span className="text-slate-300 text-base">✗</span>
                              : <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600">{val}</span>
                            }
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className="text-[#56bf6b] text-base font-black">✓</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                <p className="text-[11px] font-semibold text-slate-400">
                  TradesViz &amp; Edgewonk : 0 fonctionnalité IA.&nbsp;
                  TradeZella &amp; TraderSync : IA basique sans coaching narratif ni rapport hebdomadaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="tarifs" className="scroll-mt-24 bg-[#f4f8fd] px-5 py-16 text-slate-950 sm:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-[1680px]">
        <SectionHeading eyebrow="Tarifs simples et transparents" title="Choisissez l'offre qui vous correspond" />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr_1fr_1.08fr]">
          {pricingPlans.map((plan) => (
            <article key={plan.name} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              {plan.highlighted && (
                <div className="absolute inset-x-0 top-0 bg-[#56bf6b] px-4 py-2 text-center text-xs font-black text-white">
                  Le plus populaire
                </div>
              )}
              <div className={plan.highlighted ? 'pt-6' : ''}>
                <h3 className="text-xl font-black text-slate-950">{plan.name}</h3>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-black text-slate-950">{plan.price} €</span>
                  <span className="pb-1 text-sm font-black text-slate-600">/ mois</span>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-600">{plan.description}</p>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-black transition-colors ${
                    plan.highlighted
                      ? 'bg-[#56bf6b] text-white hover:bg-[#49ab5e]'
                      : 'border border-[#56bf6b] text-[#24823b] hover:bg-[#56bf6b]/10'
                  }`}
                >
                  Commencer
                </Link>
              </div>
            </article>
          ))}

          <aside className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
            <div className="space-y-7">
              {assuranceItems.map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black leading-6 text-slate-700">{title}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function BrokersStrip() {
  return (
    <section className="border-y border-white/10 bg-[#071017] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">Connecteurs & partenaires</p>
            <h2 className="mt-2 text-xl font-black text-white">Les plateformes que vous utilisez déjà</h2>
          </div>
          <span className="text-sm font-semibold text-white/45">Et plus à venir...</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {partnerLogos.map((partner) => (
            <div
              key={partner.name}
              className="flex h-20 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-5 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              title={partner.name}
            >
              <div className="flex items-center justify-center gap-3">
                <Image
                  src={partner.src}
                  alt={`Logo ${partner.name}`}
                  width={partner.width}
                  height={partner.height}
                  className={`h-auto w-auto object-contain ${partner.className ?? ''}`}
                />
                {partner.label && (
                  <span className="text-sm font-black text-white/85">{partner.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#071017] px-5 py-14 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-black sm:text-4xl">Prêt à transformer votre trading ?</h2>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-400">
            Rejoignez MERKURE et commencez à prendre de meilleures décisions dès aujourd'hui.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryCta />
          <DemoButton />
        </div>
      </div>

      <div className="mx-auto mt-9 flex w-full max-w-[1680px] flex-wrap gap-x-10 gap-y-3 text-xs font-semibold text-slate-400 lg:justify-end">
        {['Configuration en 2 minutes', 'Aucune carte bancaire requise', 'Annulez à tout moment'].map((item) => (
          <span key={item} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#56bf6b]" />
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05080d] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-500">
            MERKURE est un outil d'analyse et de journalisation. Il ne fournit pas de conseil en investissement et ne permet pas de passer des ordres.
          </p>
          <p className="mt-4 text-xs font-semibold text-slate-600">
            Les performances passées ne préjugent pas des performances futures. Le trading comporte un risque de perte en capital.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[auto_auto] lg:gap-12">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Produit</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-400">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Légal</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-400">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1680px] flex-col gap-3 border-t border-white/10 pt-6 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} MERKURE. Tous droits réservés.</span>
        <span>Données chiffrées. Connexions broker en lecture seule.</span>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#070b10] text-white">
      <Header />
      <main>
        <Hero />
        <FeatureSection />
        <WorkflowSection />
        <MetricsStrip />
        <AnalysisSection />
        <TraderProfilesSection />
        <UseCasesSection />
        <SecuritySection />
        <PricingSection />
        <BrokersStrip />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
