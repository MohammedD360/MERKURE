'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  ChevronRight,
  CircleDollarSign,
  Command,
  Database,
  Eye,
  Gauge,
  Layers3,
  LineChart,
  Lock,
  Network,
  PanelTop,
  PlayCircle,
  Radar,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { setToken } from '@/lib/api-client'

function MarketConstellationScene() {
  const mountRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    const canvas = canvasRef.current
    if (!mount || !canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120)
    camera.position.set(0, 1.4, 10.4)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: process.env.NODE_ENV !== 'production',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const root = new THREE.Group()
    const orbit = new THREE.Group()
    const bars = new THREE.Group()
    scene.add(root)
    scene.add(orbit)
    root.add(bars)

    scene.add(new THREE.AmbientLight(0xbad6ff, 0.8))
    const keyLight = new THREE.PointLight(0x7c5cff, 5.8, 24)
    keyLight.position.set(-4, 4, 7)
    scene.add(keyLight)
    const rimLight = new THREE.PointLight(0x18c7ff, 4.4, 26)
    rimLight.position.set(5, -2, 5)
    scene.add(rimLight)

    const coreGeometry = new THREE.IcosahedronGeometry(1.65, 4)
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x5b6dff,
      emissive: 0x17205c,
      metalness: 0.25,
      roughness: 0.34,
      transparent: true,
      opacity: 0.72,
      wireframe: true,
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    root.add(core)

    const shell = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.1, 0.018, 220, 10, 2, 5),
      new THREE.MeshBasicMaterial({ color: 0x18c7ff, transparent: true, opacity: 0.72 }),
    )
    shell.rotation.x = 1.05
    root.add(shell)

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    })
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1 + i * 0.72, 0.012, 8, 180), ringMaterial)
      ring.rotation.x = Math.PI / 2 + i * 0.32
      ring.rotation.y = i * 0.72
      orbit.add(ring)
    }

    const barMaterialUp = new THREE.MeshStandardMaterial({
      color: 0x39e681,
      emissive: 0x073f23,
      metalness: 0.2,
      roughness: 0.45,
    })
    const barMaterialDown = new THREE.MeshStandardMaterial({
      color: 0xff5e70,
      emissive: 0x471018,
      metalness: 0.2,
      roughness: 0.5,
    })
    for (let i = 0; i < 34; i += 1) {
      const wave = Math.sin(i * 0.56) + Math.cos(i * 0.22)
      const height = 0.22 + Math.abs(wave) * 0.42
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, height, 0.08),
        wave >= 0 ? barMaterialUp : barMaterialDown,
      )
      bar.position.set(-3.6 + i * 0.22, -2.55 + height / 2, -0.55 + Math.sin(i * 0.31) * 0.18)
      bars.add(bar)
    }

    const particleCount = 680
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i += 1) {
      const angle = i * 0.39
      const radius = 2.4 + (i % 41) * 0.078
      const y = Math.sin(i * 0.19) * 2.9
      particlePositions[i * 3] = Math.cos(angle) * radius
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius - 0.8
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x9fb7ff,
        size: 0.024,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    )
    scene.add(particles)

    const linePositions = new Float32Array(96 * 3)
    for (let i = 0; i < 48; i += 1) {
      const a = i * 0.62
      const r1 = 2.7 + (i % 7) * 0.24
      const r2 = r1 + 0.45
      linePositions[i * 6] = Math.cos(a) * r1
      linePositions[i * 6 + 1] = Math.sin(i * 0.4) * 1.9
      linePositions[i * 6 + 2] = Math.sin(a) * r1 - 0.7
      linePositions[i * 6 + 3] = Math.cos(a + 0.24) * r2
      linePositions[i * 6 + 4] = Math.sin(i * 0.4 + 0.5) * 1.9
      linePositions[i * 6 + 5] = Math.sin(a + 0.24) * r2 - 0.7
    }
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: 0x18c7ff, transparent: true, opacity: 0.18 }),
    )
    scene.add(lines)

    const floor = new THREE.GridHelper(12, 34, 0x263a66, 0x182744)
    floor.position.y = -3.05
    floor.position.z = -0.8
    const floorMaterial = floor.material as THREE.Material
    floorMaterial.transparent = true
    floorMaterial.opacity = 0.22
    scene.add(floor)

    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }
    mount.addEventListener('pointermove', onPointerMove)

    const resize = () => {
      const rect = mount.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      camera.aspect = width / height
      camera.position.z = width < 700 ? 12.5 : 10.4
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      const elapsed = clock.getElapsedTime()
      root.rotation.y = elapsed * 0.18 + pointer.x * 0.08
      root.rotation.x = Math.sin(elapsed * 0.28) * 0.08 - pointer.y * 0.05
      orbit.rotation.y = -elapsed * 0.12
      orbit.rotation.z = Math.sin(elapsed * 0.22) * 0.1
      particles.rotation.y = elapsed * 0.035
      lines.rotation.y = elapsed * 0.045
      bars.position.y = Math.sin(elapsed * 0.9) * 0.035
      camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.035
      camera.position.y += (1.4 - pointer.y * 0.22 - camera.position.y) * 0.035
      camera.lookAt(0, -0.08, -0.4)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      mount.removeEventListener('pointermove', onPointerMove)
      observer.disconnect()
      renderer.dispose()
      coreGeometry.dispose()
      coreMaterial.dispose()
      shell.geometry.dispose()
      ;(shell.material as THREE.Material).dispose()
      ringMaterial.dispose()
      barMaterialUp.dispose()
      barMaterialDown.dispose()
      particleGeometry.dispose()
      ;(particles.material as THREE.Material).dispose()
      lineGeometry.dispose()
      ;(lines.material as THREE.Material).dispose()
      floor.geometry.dispose()
      floorMaterial.dispose()
    }
  }, [])

  return (
    <div ref={mountRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  )
}

function DemoButton({ variant = 'primary' }: { variant?: 'primary' | 'ghost' }) {
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

  const className = variant === 'primary'
    ? 'inline-flex items-center justify-center gap-3 rounded-2xl border border-[#9b79ff]/70 bg-[#7c5cff] px-8 py-4 text-base font-black text-white shadow-[0_0_0_1px_rgba(24,199,255,0.28),0_20px_70px_rgba(124,92,255,0.48)] transition-colors hover:bg-[#8d72ff] disabled:opacity-60'
    : 'inline-flex items-center justify-center gap-3 rounded-2xl border border-[#18c7ff]/50 bg-[#0b1527]/60 px-6 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-colors hover:border-[#7c5cff]/70 hover:bg-[#142139]/80 disabled:opacity-60'

  return (
    <button onClick={handleDemo} disabled={loading} className={className}>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      ) : (
        <PlayCircle className="h-4 w-4" />
      )}
      Démo live
    </button>
  )
}

const sectionLinks = [
  { id: 'platform', label: 'Plateforme' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'pricing', label: 'Offres' },
  { id: 'security', label: 'Sécurité' },
  { id: 'resources', label: 'Avantages' },
]
const sectionIds = sectionLinks.map((link) => link.id)

const heroSignals = [
  { icon: Network, label: 'Broker sync' },
  { icon: Gauge, label: 'Risk lens' },
  { icon: Brain, label: 'Coach IA' },
  { icon: Radar, label: 'Alertes live' },
]

const heroLabels = [
  { label: 'Analyse IA', tone: 'purple', className: 'left-[42%] top-[22%]' },
  { label: 'Signal', tone: 'cyan', className: 'right-[33%] top-[34%]' },
  { label: 'Détection', tone: 'purple', className: 'left-[38%] bottom-[36%]' },
  { label: 'Optimisation', tone: 'cyan', className: 'right-[35%] bottom-[28%]' },
]

const heroStats: Array<{
  icon: LucideIcon
  value: string
  label: string
}> = [
  { icon: Server, value: '5', label: 'Brokers compatibles' },
  { icon: Gauge, value: 'Illimité', label: 'Trades importés' },
  { icon: SlidersHorizontal, value: 'AES-256', label: 'Chiffrement credentials' },
  { icon: Brain, value: '24/7', label: 'Sync & alertes actives' },
  { icon: Eye, value: 'Read-only', label: 'Accès lecture seule' },
]

const platformModules: Array<{
  id: string
  icon: LucideIcon
  title: string
  kicker: string
  text: string
  points: string[]
}> = [
  {
    id: 'performance',
    icon: LineChart,
    title: 'Performance lisible',
    kicker: 'Clarté opérationnelle',
    text: 'Les indicateurs critiques restent visibles sans transformer le dashboard en tableau de chiffres illisible.',
    points: ['P&L et drawdown contextualisés', 'Vue portefeuille et actifs', 'Historique exploitable'],
  },
  {
    id: 'discipline',
    icon: Target,
    title: 'Discipline mesurable',
    kicker: 'Comportements de trading',
    text: 'MERKURE isole les habitudes qui reviennent dans vos sessions pour rendre le travail de progression plus concret.',
    points: ['Journal structuré', 'Revenge trading repéré', 'Routines comparables'],
  },
  {
    id: 'automation',
    icon: SlidersHorizontal,
    title: 'Pilotage sans friction',
    kicker: 'Flux de données',
    text: 'Les comptes, transactions et snapshots alimentent la lecture produit sans vous forcer à recopier votre activité.',
    points: ['Import broker', 'Synchronisation continue', 'Segmentation par compte'],
  },
  {
    id: 'coach',
    icon: Bot,
    title: 'Coach contextualisé',
    kicker: 'IA utile',
    text: 'Le coach part de vos trades réels pour produire une lecture exploitable, pas un conseil générique détaché de vos décisions.',
    points: ['Feedback journalier', 'Axes de travail', 'Synthèse lisible'],
  },
]

const differentiators: Array<{
  icon: LucideIcon
  title: string
  text: string
}> = [
  {
    icon: Layers3,
    title: 'Unifier au lieu d’empiler',
    text: 'Comptes, trades, journal, KPIs et abonnement restent dans un parcours unique.',
  },
  {
    icon: BarChart3,
    title: 'Décider au lieu de subir',
    text: 'Les vues privilégient la lecture rapide, les écarts de comportement et les signaux d’action.',
  },
  {
    icon: ShieldCheck,
    title: 'Séparer contrôle et sécurité',
    text: 'Lecture seule, chiffrement côté API et logique d’accès par plan restent clairement séparés.',
  },
]

function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const onScroll = () => {
      let next = ''
      for (let index = sectionIds.length - 1; index >= 0; index -= 1) {
        const id = sectionIds[index]
        if (!id) continue
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= 140) {
          next = id
          break
        }
      }

      if (next) setActiveSection(next)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sectionIds])

  return activeSection
}

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] via-[#5f77ff] to-[#18c7ff] font-black text-white shadow-[0_12px_30px_rgba(124,92,255,0.35)] ${
          small ? 'h-7 w-7 text-sm' : 'h-11 w-11 text-xl'
        }`}
      >
        M
      </div>
      <span className={small ? 'font-black text-white' : 'text-xl font-black text-white'}>MERKURE</span>
    </div>
  )
}

function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const activeSection = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fermer le menu au clic sur un lien
  const handleNavClick = () => setMobileOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || mobileOpen ? 'border-b border-[#172842] bg-[#050b16]/95 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-[1560px] items-center justify-between px-5 sm:px-8 lg:px-11">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-10 md:flex">
          {sectionLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`relative py-2 text-sm font-medium transition-colors ${
                activeSection === link.id ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-0 -bottom-0.5 h-px bg-[#7c5cff]"
                />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white sm:block">
            Connexion
          </Link>
          <div className="hidden sm:block">
            <DemoButton variant="ghost" />
          </div>

          {/* Burger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2b456d] bg-[#0b1527]/70 text-slate-300 transition-colors hover:bg-[#142139] md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#172842] bg-[#050b16]/98 px-5 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-1">
            {sectionLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNavClick}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#7c5cff]/15 text-white'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-[#172842] pt-5">
            <Link
              href="/sign-up"
              onClick={handleNavClick}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#8d72ff]"
            >
              Créer un compte
            </Link>
            <Link
              href="/sign-in"
              onClick={handleNavClick}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#2b456d] px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.04]"
            >
              Connexion
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function HeroOperationalPanel() {
  const modules = [
    { icon: Command, title: 'Importer', text: 'Comptes et transactions', state: 'idle' },
    { icon: Activity, title: 'Lire', text: 'Performance et risque', state: 'syncing' },
    { icon: Brain, title: 'Comprendre', text: 'Coach et journal IA', state: 'idle' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 32, y: 18 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="absolute right-10 top-[20%] z-20 hidden w-[440px] rounded-xl border border-[#2b456d] bg-[#091221]/80 p-4 shadow-[0_30px_110px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl xl:block 2xl:right-[calc((100vw-1560px)/2)]"
    >
      <div className="mb-4 flex items-start justify-between border-b border-[#2a3b59] pb-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#c3a7ff]">Couche opérationnelle</p>
          <p className="mt-3 text-lg font-black text-white">Cockpit de décision</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#18c7ff]/30 bg-[#18c7ff]/10 text-[#18c7ff]">
          <PanelTop className="h-4 w-4" />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em]">
        <span className="flex items-center gap-2 text-[#38e476]">
          <span className="h-2 w-2 rounded-full bg-[#38e476]" />
          Système actif
        </span>
        <span className="text-slate-500">Mis à jour en temps réel</span>
      </div>

      <div className="space-y-2">
        {modules.map((module, index) => {
          const Icon = module.icon
          return (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.5 + index * 0.08 }}
              className="flex items-center gap-3 rounded-lg border border-[#263a66] bg-[#0b1527]/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7c5cff]/20 text-[#c4b7ff]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-white">{module.title}</p>
                <p className="text-sm text-slate-500">{module.text}</p>
              </div>
              <span className="h-3 w-3 rounded-full border border-slate-600" />
            </motion.div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-[#f7b84b]/25 bg-[#f7b84b]/10 px-4 py-3 text-sm font-bold text-[#f7b84b]">
        <span className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4" />
          3 anomalies détectées
        </span>
        <ChevronRight className="h-4 w-4" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#263a66] bg-[#07101f]/90 p-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Risk score
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-600 text-[10px]">?</span>
          </div>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-3xl font-black text-white">72</span>
            <span className="pb-1 text-sm text-slate-500">/100</span>
          </div>
        </div>
        <div className="rounded-lg border border-[#263a66] bg-[#07101f]/90 p-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Confiance IA</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-3xl font-black text-white">85%</span>
            <div className="h-11 w-11 rounded-full border-[6px] border-[#7c5cff] border-l-[#1f3150]" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-[#38e476]/20 bg-[#38e476]/20 px-4 py-3 text-sm font-semibold text-[#8ef0b0]">
        <span>Mode lecture seule</span>
        <span className="h-2 w-2 rounded-full bg-[#38e476]" />
      </div>
    </motion.div>
  )
}

function HeroFloatingLabels() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
      {heroLabels.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.42 + index * 0.08 }}
          className={`absolute ${item.className} rounded-lg border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md ${
            item.tone === 'cyan'
              ? 'border-[#18c7ff]/60 bg-[#07101f]/80 text-[#18e0ff]'
              : 'border-[#7c5cff]/60 bg-[#120b2b]/80 text-[#c4a7ff]'
          }`}
        >
          {item.label}
        </motion.div>
      ))}
    </div>
  )
}

function HeroCandlesBackdrop() {
  const candles = [
    44, 68, 52, 84, 46, 72, 104, 60, 92, 128, 86, 142, 106, 154, 118, 164,
  ]

  return (
    <div className="pointer-events-none absolute right-[12%] top-[7%] z-[1] hidden h-[330px] w-[310px] opacity-45 lg:block">
      {candles.map((height, index) => {
        const up = index % 3 !== 1
        return (
          <div
            key={`${height}-${index}`}
            className="absolute bottom-0 w-3 rounded-sm"
            style={{
              height,
              left: index * 18,
              backgroundColor: up ? 'rgba(16,185,129,0.55)' : 'rgba(124,92,255,0.5)',
              boxShadow: up ? '0 0 24px rgba(16,185,129,0.35)' : '0 0 24px rgba(124,92,255,0.35)',
            }}
          >
            <span
              className="absolute left-1/2 top-[-36px] w-px -translate-x-1/2 bg-current opacity-60"
              style={{ height: height + 54, color: up ? '#10b981' : '#7c5cff' }}
            />
          </div>
        )
      })}
    </div>
  )
}

function HeroStatsStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.65 }}
      className="absolute inset-x-0 bottom-7 z-20 hidden px-11 lg:block"
    >
      <div className="mx-auto grid max-w-[1560px] grid-cols-5 rounded-2xl border border-[#263a66] bg-[#07101f]/70 shadow-[0_0_0_1px_rgba(124,92,255,0.08),0_0_80px_rgba(124,92,255,0.16),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
        {heroStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`flex items-center gap-4 px-8 py-6 ${index > 0 ? 'border-l border-[#2a3b59]' : ''}`}
            >
              <Icon className="h-9 w-9 text-[#a779ff]" />
              <div>
                <p className="whitespace-nowrap text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#03070f]">
      <MarketConstellationScene />
      <HeroCandlesBackdrop />
      <HeroFloatingLabels />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070f_0%,rgba(3,7,15,0.82)_30%,rgba(3,7,15,0.28)_58%,rgba(3,7,15,0.68)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#03070f] to-transparent" />
      <HeroOperationalPanel />
      <HeroStatsStrip />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1560px] items-center px-5 pb-36 pt-28 sm:px-8 lg:px-11 lg:pb-48">
        <div className="max-w-[780px]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#7c5cff]/50 bg-[#160d33]/60 px-5 py-3 shadow-[0_0_40px_rgba(124,92,255,0.18)] backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-[#a798ff]" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#b9a8ff]">Cockpit IA pour traders exigeants</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-5xl font-black leading-[1.04] text-white sm:text-6xl lg:text-7xl xl:text-[74px] 2xl:text-[80px]"
          >
            Trade avec <br />
            des <span className="bg-gradient-to-r from-[#7c5cff] via-[#80a8ff] to-[#18c7ff] bg-clip-text text-transparent">données.</span><br />
            Pas des émotions.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="mt-7 max-w-2xl text-lg leading-9 text-slate-300"
          >
            MERKURE connecte vos comptes, transforme vos trades en signaux lisibles, et met en évidence les habitudes qui impactent votre edge.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="mt-12 flex flex-col gap-5 sm:flex-row"
          >
            <DemoButton />
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#2b456d] bg-[#0b1527]/70 px-8 py-4 text-base font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-colors hover:bg-[#142139]"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.42 }}
            className="mt-12 grid max-w-[720px] gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {heroSignals.map((signal, index) => {
              const Icon = signal.icon
              return (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.48 + index * 0.06 }}
                  className="flex items-center gap-3 rounded-lg border border-[#2b456d] bg-[#07101f]/62 px-5 py-3 text-sm font-medium text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4 text-[#18e0ff]" />
                  {signal.label}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#a798ff]">{eyebrow}</p>
      <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-400">{text}</p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      whileHover={{ y: -5, rotateX: 2, rotateY: -2 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[#7c5cff]/25 bg-[#7c5cff]/10 text-[#b9a8ff]">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{children}</p>
    </motion.div>
  )
}

function PlatformSection() {
  const [activeModuleId, setActiveModuleId] = useState(platformModules[0]?.id ?? '')
  const activeModule = platformModules.find((module) => module.id === activeModuleId) ?? platformModules[0]!
  const ActiveIcon = activeModule.icon

  return (
    <section id="platform" className="scroll-mt-20 bg-[#050b16] px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Plateforme OS"
          title="Une interface qui ressemble à un cockpit, pas à un tableur."
          text="MERKURE rassemble vos comptes, vos métriques et vos signaux comportementaux dans une interface pensée pour décider plus vite."
        />

        <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-3">
            {platformModules.map((module) => {
              const Icon = module.icon
              const active = module.id === activeModule.id

              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModuleId(module.id)}
                  className={`group flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                    active
                      ? 'border-[#7c5cff]/70 bg-[#101a32] shadow-[0_18px_60px_rgba(0,0,0,0.22)]'
                      : 'border-[#1e2f4a] bg-[#0b1527] hover:border-[#314767] hover:bg-[#0e1a2e]'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      active
                        ? 'border-[#7c5cff]/30 bg-[#7c5cff]/20 text-[#c4b7ff]'
                        : 'border-[#243957] bg-[#07101f] text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a798ff]">{module.kicker}</p>
                    <h3 className="mt-1 text-lg font-bold text-white">{module.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{module.text}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <motion.div
            key={activeModule.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-lg border border-[#263a66] bg-[#07101f] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_24px_90px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18c7ff] to-transparent" />
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#18c7ff]/25 bg-[#18c7ff]/10 text-[#18c7ff]">
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7ddcff]">{activeModule.kicker}</p>
                    <h3 className="mt-1 text-2xl font-black text-white">{activeModule.title}</h3>
                  </div>
                </div>

                <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">{activeModule.text}</p>

                <div className="mt-8 divide-y divide-[#243957] border-y border-[#243957]">
                  {activeModule.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 py-4 text-sm font-medium text-slate-300">
                      <Check className="h-4 w-4 text-[#38e476]" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-[#1e2f4a] bg-[#050b16]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(24,199,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(124,92,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
                <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  <span>Carte des signaux</span>
                  <span>Lecture seule</span>
                </div>
                <div className="absolute left-8 right-8 top-20 h-px bg-[#243957]" />
                <div className="absolute left-8 right-8 top-1/2 h-px bg-[#243957]" />
                <div className="absolute bottom-20 left-8 right-8 h-px bg-[#243957]" />

                {['Broker', 'KPIs', 'Journal', 'Coach'].map((label, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="absolute left-8 right-8 flex items-center gap-3 rounded-lg border border-[#263a66] bg-[#0b1527]/90 px-4 py-3 text-sm font-semibold text-slate-300 backdrop-blur-sm"
                    style={{ top: 64 + index * 58 }}
                  >
                    <span className="h-2 w-2 rounded-full bg-[#38e476]" />
                    {label}
                    <span className="ml-auto h-px w-12 bg-[#18c7ff]/40" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  const steps = [
    { icon: <CircleDollarSign className="h-5 w-5" />, title: 'Connecter', text: 'Ajoutez un compte broker en lecture seule et gardez le contrôle complet.' },
    { icon: <Zap className="h-5 w-5" />, title: 'Synchroniser', text: 'Les trades alimentent les pages dashboard, transactions et performance.' },
    { icon: <Bot className="h-5 w-5" />, title: 'Analyser', text: 'MERKURE révèle vos forces, faiblesses et comportements à risque.' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Améliorer', text: 'Vous suivez la progression dans le temps avec des repères visuels cohérents.' },
  ]

  return (
    <section id="workflow" className="relative scroll-mt-20 overflow-hidden bg-[#07101f] px-5 py-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Workflow"
          title="Un parcours direct entre connexion, lecture et décision."
          text="Le parcours reste centré sur vos vraies données: connexion broker, synchronisation, analyse, puis amélioration mesurable."
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="relative rounded-lg border border-[#1e2f4a] bg-[#0b1527]/90 p-6"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#18c7ff]/25 bg-[#18c7ff]/10 text-[#18c7ff]">
                  {step.icon}
                </div>
                <span className="font-mono text-sm font-bold text-slate-600">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{step.text}</p>
              {index < steps.length - 1 && (
                <ChevronRight className="absolute -right-3 top-10 hidden h-6 w-6 text-[#314767] lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DifferentiatorSection() {
  return (
    <section id="resources" className="scroll-mt-20 bg-[#07101f] px-5 py-24 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#a798ff]">Edge produit</p>
          <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
            Une salle de contrôle personnelle pour votre discipline de trading.
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            MERKURE réduit le bruit, hiérarchise les signaux et garde la prochaine décision au centre.
          </p>
        </div>

        <div className="rounded-lg border border-[#263a66] bg-[#0b1527] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_24px_90px_rgba(0,0,0,0.26)]">
          {differentiators.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className={`grid gap-4 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                  index < differentiators.length - 1 ? 'border-b border-[#243957]' : ''
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#18c7ff]/25 bg-[#18c7ff]/10 text-[#18c7ff]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{item.text}</p>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-[#314767] sm:block" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const planOffers = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthly: 19,
    annual: 190,
    tagline: 'Pour poser une base solide.',
    description: 'Sync un broker, KPIs complets et journal IA pour structurer votre progression.',
    features: [
      '1 compte broker connecté',
      'Import trades illimité',
      'KPIs avancés — P&L, drawdown, win rate',
      'Journal de trading structuré',
      'Analyse IA journalière',
      'Alertes email',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    monthly: 49,
    annual: 490,
    tagline: 'Pour analyser plusieurs comptes.',
    description: 'Multi-brokers, analytics granulaires, coach IA sans limite et alertes en temps réel.',
    features: [
      'Tout Starter, plus :',
      '3 comptes brokers',
      'Analytics par actif et stratégie',
      'Coach IA illimité',
      'Alertes temps réel',
      'Rapport hebdomadaire automatique',
    ],
    highlighted: true,
  },
  {
    id: 'ELITE',
    name: 'Elite',
    monthly: 129,
    annual: 1290,
    tagline: 'Pour les traders qui veulent tout.',
    description: 'Brokers illimités, rapports PDF, accès API et support prioritaire réactif.',
    features: [
      'Tout Pro, plus :',
      'Comptes brokers illimités',
      'Export rapports PDF',
      'Accès API MERKURE',
      'Webhooks & intégrations',
      'Support prioritaire < 4h',
    ],
  },
]

const pricingFaq = [
  {
    q: 'Y a-t-il une période d\'essai ?',
    a: 'Oui. Les 14 premiers jours sont offerts sur tous les plans payants, sans carte bancaire. Vous ne serez débité qu\'à la fin de l\'essai.',
  },
  {
    q: 'Puis-je changer de plan à tout moment ?',
    a: 'Oui. Vous pouvez upgrader ou downgrader depuis votre espace abonnement. Le changement prend effet immédiatement, avec prorata sur la facturation.',
  },
  {
    q: 'Quels brokers sont supportés ?',
    a: 'MetaTrader 4, MetaTrader 5, Binance, Interactive Brokers et cTrader. D\'autres brokers sont en cours d\'intégration.',
  },
  {
    q: 'Mes identifiants broker sont-ils en sécurité ?',
    a: 'Vos credentials sont chiffrés AES-256 côté serveur avant stockage. MERKURE utilise uniquement le mot de passe investisseur (lecture seule) — aucun ordre ne peut être passé.',
  },
]

function PricingFaq() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#a798ff]">Questions fréquentes</p>
      <div className="divide-y divide-[#1e2f4a] rounded-lg border border-[#1e2f4a]">
        {pricingFaq.map((item, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white transition-colors hover:text-[#b9a8ff]"
            >
              {item.q}
              <ChevronRight className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm leading-7 text-slate-400">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="scroll-mt-20 bg-[#050b16] px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Offres"
          title="Un plan pour chaque étape de votre progression."
          text="Démarrez avec un essai gratuit de 14 jours. Sans carte bancaire, sans engagement."
        />

        {/* Toggle mensuel / annuel */}
        <div className="mb-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-semibold transition-colors ${!annual ? 'text-white' : 'text-slate-500'}`}>Mensuel</span>
          <button
            type="button"
            onClick={() => setAnnual(a => !a)}
            className={`relative h-6 w-11 rounded-full border transition-colors ${annual ? 'border-[#7c5cff]/60 bg-[#7c5cff]/30' : 'border-[#2b456d] bg-[#0b1527]'}`}
            aria-label="Basculer facturation annuelle"
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${annual ? 'left-5' : 'left-0.5'}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors ${annual ? 'text-white' : 'text-slate-500'}`}>
            Annuel
            <span className="ml-2 rounded-full bg-[#38e476]/15 px-2 py-0.5 text-[10px] font-bold text-[#38e476]">−2 mois offerts</span>
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {planOffers.map((plan, index) => {
            const price    = annual ? Math.round(plan.annual / 12) : plan.monthly
            const priceStr = `${price} €`
            const saving   = plan.monthly * 12 - plan.annual

            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className={`relative flex flex-col rounded-xl border p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)] ${
                  plan.highlighted
                    ? 'border-[#7c5cff]/70 bg-[#101a32] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(124,92,255,0.15),0_24px_80px_rgba(124,92,255,0.18)]'
                    : 'border-[#1e2f4a] bg-[#0b1527]'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-[#7c5cff]/40 bg-[#7c5cff] px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(124,92,255,0.5)]">
                    Le plus populaire
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a798ff]">{plan.name}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{plan.tagline}</p>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-5xl font-black text-white">{priceStr}</span>
                    <div className="flex flex-col pb-1.5">
                      <span className="text-xs font-semibold text-slate-500">/ mois</span>
                      {annual && (
                        <span className="text-[10px] font-bold text-[#38e476]">économisez {saving} €/an</span>
                      )}
                    </div>
                  </div>

                  {annual && (
                    <p className="mt-1 text-xs text-slate-600">
                      Facturé {plan.annual} € par an
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-6 text-slate-400">{plan.description}</p>
                </div>

                <div className="my-6 h-px bg-[#243957]" />

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-3 text-sm ${feature.endsWith(':') ? 'font-bold text-slate-300' : 'text-slate-400'}`}>
                      {!feature.endsWith(':') && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#38e476]" />}
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/sign-up?plan=${plan.id.toLowerCase()}`}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                    plan.highlighted
                      ? 'bg-[#7c5cff] text-white hover:bg-[#8d72ff] shadow-[0_8px_30px_rgba(124,92,255,0.4)]'
                      : 'border border-[#243957] bg-[#0b1527]/80 text-slate-200 hover:border-[#314767] hover:bg-[#142139]'
                  }`}
                >
                  Essayer 14 jours gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            )
          })}
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            '✓ 14 jours d\'essai gratuit',
            '✓ Sans carte bancaire',
            '✓ Résiliable à tout moment',
            '✓ Données chiffrées AES-256',
          ].map(item => (
            <span key={item} className="text-xs font-medium text-slate-500">{item}</span>
          ))}
        </div>

        <PricingFaq />
      </div>
    </section>
  )
}

function SecuritySection() {
  const items = [
    { icon: <Lock className="h-5 w-5" />, title: 'Identifiants chiffrés', text: 'Les accès broker sont chiffrés côté API avant stockage.' },
    { icon: <Eye className="h-5 w-5" />, title: 'Lecture seule', text: "MERKURE lit vos historiques et ne place pas d'ordre pour vous." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Accès sécurisé', text: "Authentification par email ou OAuth. Vos sessions sont isolées et vos données ne sont jamais partagées." },
    { icon: <Database className="h-5 w-5" />, title: 'Base structurée', text: 'Prisma/Postgres séparent utilisateurs, comptes, trades, snapshots et abonnements.' },
  ]

  return (
    <section id="security" className="scroll-mt-20 bg-[#050b16] px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Sécurité"
          title="Une base produit sérieuse pour connecter, lire et progresser."
          text="L'expérience garde une séparation nette entre authentification, stockage, synchronisation broker et restitution des performances."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              {item.text}
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-[#07101f] px-5 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg border border-[#243957] bg-[#0b1527] px-6 py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a798ff]">Prêt à ouvrir le cockpit</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
            Visualisez vos performances depuis vos vraies données.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Connectez votre broker, importez votre historique et obtenez un tableau de bord complet en quelques minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#9b79ff]/70 bg-[#7c5cff] px-8 py-4 text-base font-black text-white shadow-[0_0_0_1px_rgba(24,199,255,0.28),0_20px_70px_rgba(124,92,255,0.48)] transition-colors hover:bg-[#8d72ff]"
            >
              Créer un compte — dès 19 €/mois
              <ArrowRight className="h-4 w-4" />
            </Link>
            <DemoButton variant="ghost" />
          </div>
          <p className="mt-5 text-xs text-slate-600">Aucune carte bancaire requise pour la démo · Résiliable à tout moment</p>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#172842] bg-[#050b16] px-5 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
        <div className="flex items-center gap-3">
          <BrandMark small />
        </div>
        <p>© 2026 MERKURE. Tous droits réservés.</p>
        <div className="flex gap-5">
          <a href="mailto:contact@merkure.app" className="transition-colors hover:text-white">Contact</a>
          <Link href="/sign-in" className="transition-colors hover:text-white">Connexion</Link>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050b16] text-white">
      <Navbar />
      <main>
        <Hero />
        <PlatformSection />
        <WorkflowSection />
        <PricingSection />
        <SecuritySection />
        <DifferentiatorSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
