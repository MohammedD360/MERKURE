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

function RotatingEarthScene() {
  const mountRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    const canvas = canvasRef.current
    if (!mount || !canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120)
    camera.position.set(0, 0.35, 8.2)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: process.env.NODE_ENV !== 'production',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const earthGroup = new THREE.Group()
    earthGroup.position.set(1.65, -0.05, 0)
    scene.add(earthGroup)

    scene.add(new THREE.AmbientLight(0x6f88bb, 1.15))
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.8)
    sunLight.position.set(-4, 3, 5)
    scene.add(sunLight)
    const rimLight = new THREE.DirectionalLight(0x18c7ff, 2.2)
    rimLight.position.set(5, 1.8, -2)
    scene.add(rimLight)

    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 2048
    textureCanvas.height = 1024
    const ctx = textureCanvas.getContext('2d')
    if (!ctx) return

    const ocean = ctx.createLinearGradient(0, 0, textureCanvas.width, textureCanvas.height)
    ocean.addColorStop(0, '#0a2e66')
    ocean.addColorStop(0.45, '#0b58a4')
    ocean.addColorStop(1, '#041431')
    ctx.fillStyle = ocean
    ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height)

    ctx.strokeStyle = 'rgba(130, 190, 255, 0.11)'
    ctx.lineWidth = 1
    for (let x = 0; x <= textureCanvas.width; x += 128) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, textureCanvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= textureCanvas.height; y += 128) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(textureCanvas.width, y)
      ctx.stroke()
    }

    const land = ctx.createLinearGradient(0, 0, 0, textureCanvas.height)
    land.addColorStop(0, '#81c982')
    land.addColorStop(0.5, '#2f8757')
    land.addColorStop(1, '#1f6a44')
    ctx.fillStyle = land
    ctx.shadowColor = 'rgba(100, 255, 190, 0.32)'
    ctx.shadowBlur = 18

    const drawLand = (points: Array<[number, number]>) => {
      ctx.beginPath()
      points.forEach(([x, y], index) => {
        const px = x * textureCanvas.width
        const py = y * textureCanvas.height
        if (index === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.closePath()
      ctx.fill()
    }

    drawLand([[0.08, 0.23], [0.18, 0.16], [0.29, 0.22], [0.31, 0.34], [0.24, 0.44], [0.14, 0.39]])
    drawLand([[0.22, 0.45], [0.31, 0.50], [0.34, 0.65], [0.29, 0.78], [0.22, 0.68], [0.18, 0.55]])
    drawLand([[0.42, 0.24], [0.55, 0.19], [0.69, 0.27], [0.70, 0.42], [0.57, 0.49], [0.44, 0.41]])
    drawLand([[0.53, 0.42], [0.66, 0.45], [0.70, 0.61], [0.61, 0.77], [0.51, 0.68], [0.47, 0.52]])
    drawLand([[0.72, 0.50], [0.86, 0.45], [0.94, 0.56], [0.88, 0.66], [0.74, 0.62]])
    drawLand([[0.80, 0.72], [0.88, 0.70], [0.91, 0.78], [0.84, 0.84]])

    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
    for (let i = 0; i < 52; i += 1) {
      const x = (Math.sin(i * 12.9898) * 43758.5453) % 1
      const y = (Math.sin(i * 78.233) * 24634.6345) % 1
      const px = Math.abs(x) * textureCanvas.width
      const py = Math.abs(y) * textureCanvas.height
      const width = 22 + (i % 6) * 10
      const height = 5 + (i % 4) * 3
      ctx.beginPath()
      ctx.ellipse(px, py, width, height, (i % 8) * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }

    const earthTexture = new THREE.CanvasTexture(textureCanvas)
    earthTexture.colorSpace = THREE.SRGBColorSpace
    earthTexture.anisotropy = 8

    const earthGeometry = new THREE.SphereGeometry(2.45, 96, 96)
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.04,
      roughness: 0.78,
      emissive: 0x06152f,
      emissiveIntensity: 0.3,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.rotation.z = -0.22
    earthGroup.add(earth)

    const atmosphereGeometry = new THREE.SphereGeometry(2.53, 96, 96)
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fb9ff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    earthGroup.add(atmosphere)

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
      camera.position.z = width < 700 ? 9.2 : 8.2
      earthGroup.position.x = width < 700 ? 0.9 : 1.65
      earthGroup.position.y = width < 700 ? -0.85 : -0.05
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
      earth.rotation.y = elapsed * 0.16 + pointer.x * 0.08
      atmosphere.rotation.y = elapsed * 0.11
      earthGroup.rotation.x = -pointer.y * 0.035
      camera.position.x += (pointer.x * 0.24 - camera.position.x) * 0.035
      camera.position.y += (0.35 - pointer.y * 0.12 - camera.position.y) * 0.035
      camera.lookAt(earthGroup.position.x * 0.35, earthGroup.position.y * 0.25, 0)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      mount.removeEventListener('pointermove', onPointerMove)
      observer.disconnect()
      renderer.dispose()
      earthGeometry.dispose()
      earthMaterial.dispose()
      earthTexture.dispose()
      atmosphereGeometry.dispose()
      atmosphereMaterial.dispose()
    }
  }, [])

  return (
    <div ref={mountRef} className="absolute inset-0">
      <canvas
        key="merkure-rotating-earth-v1"
        ref={canvasRef}
        className="h-full w-full"
        aria-hidden="true"
      />
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
      className="absolute right-10 top-[18%] z-20 hidden w-[440px] rounded-3xl p-4 xl:block 2xl:right-[calc((100vw-1560px)/2)]"
      style={{ background: 'rgba(8,14,30,0.72)', border: '1px solid rgba(120,110,255,0.35)', backdropFilter: 'blur(18px)', boxShadow: '0 0 60px rgba(83,74,183,0.22), 0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)' }}
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
    <section
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 68% 42%, rgba(83,74,183,.38) 0%, transparent 52%), radial-gradient(ellipse at 25% 62%, rgba(0,209,255,.24) 0%, transparent 46%), linear-gradient(180deg, #050816 0%, #02040a 100%)' }}
    >
      {/* Starfield */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: [
            'radial-gradient(1.5px 1.5px at 12% 8%, rgba(255,255,255,0.55) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 28% 22%, rgba(255,255,255,0.35) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 44% 6%, rgba(255,255,255,0.45) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 63% 18%, rgba(255,255,255,0.40) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 78% 11%, rgba(255,255,255,0.30) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 92% 27%, rgba(255,255,255,0.50) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 8% 38%, rgba(255,255,255,0.35) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 18% 55%, rgba(255,255,255,0.25) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 36% 47%, rgba(255,255,255,0.40) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 55% 72%, rgba(255,255,255,0.30) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 72% 58%, rgba(255,255,255,0.35) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 88% 45%, rgba(255,255,255,0.45) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 5% 78%, rgba(255,255,255,0.30) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 24% 88%, rgba(255,255,255,0.25) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 50% 92%, rgba(255,255,255,0.35) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 82% 84%, rgba(255,255,255,0.40) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 96% 68%, rgba(255,255,255,0.30) 0%, transparent 100%)',
          ].join(', '),
        }}
      />
      {/* Sphere ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[46%] z-[1] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.22) 0%, rgba(24,199,255,0.12) 38%, transparent 68%)' }}
      />
      <RotatingEarthScene />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#050816_0%,rgba(5,8,22,0.88)_28%,rgba(5,8,22,0.12)_55%,rgba(5,8,22,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#02040a] to-transparent" />
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
              Entrer dans MERKURE →
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
