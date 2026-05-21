'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  ChevronRight,
  CircleDollarSign,
  Database,
  Eye,
  Layers3,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
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
    ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_48px_rgba(124,92,255,0.35)] transition-colors hover:bg-[#8d72ff] disabled:opacity-60'
    : 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#243957] bg-[#0b1527]/80 px-5 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-[#142139] disabled:opacity-60'

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

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-[#172842] bg-[#050b16]/88 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] via-[#5f77ff] to-[#18c7ff] text-base font-black text-white shadow-[0_12px_30px_rgba(124,92,255,0.35)]">
            M
          </div>
          <span className="text-base font-black text-white">MERKURE</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#platform" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Plateforme</a>
          <a href="#workflow" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Workflow</a>
          <a href="#security" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Sécurité</a>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white sm:block">
            Connexion
          </Link>
          <DemoButton variant="ghost" />
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[#050b16]">
      <MarketConstellationScene />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050b16] via-[#050b16]/68 to-[#050b16]/15" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050b16] to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl items-center px-5 pb-16 pt-28 sm:px-6">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-[#a798ff]" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#b9a8ff]">Cockpit IA pour traders exigeants</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl"
          >
            MERKURE, le cockpit 3D de votre performance trading.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="mt-6 max-w-2xl text-base leading-8 text-slate-300"
          >
            MERKURE connecte vos comptes, transforme vos trades en signaux lisibles, et met en évidence les habitudes qui impactent votre edge.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <DemoButton />
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#243957] bg-[#0b1527]/80 px-5 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-[#142139]"
            >
              Entrer dans MERKURE
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.42 }}
            className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3"
          >
            {['Lecture seule broker', 'KPIs synchronisés', 'Coach IA contextualisé'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                <Check className="h-4 w-4 text-[#38e476]" />
                {item}
              </div>
            ))}
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
  return (
    <section id="platform" className="bg-[#050b16] px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Plateforme"
          title="Une présentation claire de ce qui se passe vraiment dans vos trades."
          text="MERKURE rassemble vos comptes, vos métriques et vos signaux comportementaux dans une interface pensée pour décider plus vite."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <FeatureCard icon={<BarChart3 className="h-5 w-5" />} title="Performance lisible">
            P&L, drawdown, win rate, profit factor et répartition par actif sont pensés pour être scannés rapidement, sans surcharge visuelle.
          </FeatureCard>
          <FeatureCard icon={<Brain className="h-5 w-5" />} title="Coaching contextualisé">
            L&apos;IA analyse votre historique de trading et transforme vos comportements répétitifs en axes de travail actionnables.
          </FeatureCard>
          <FeatureCard icon={<Layers3 className="h-5 w-5" />} title="Vue multi-comptes">
            Les comptes broker deviennent une couche unifiée pour comparer vos résultats, isoler un compte, ou suivre la synchronisation.
          </FeatureCard>
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
    <section id="workflow" className="relative overflow-hidden bg-[#07101f] px-5 py-24 sm:px-6">
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
              className="relative rounded-lg border border-[#1e2f4a] bg-[#0b1527]/85 p-6"
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

function SecuritySection() {
  const items = [
    { icon: <Lock className="h-5 w-5" />, title: 'Identifiants chiffrés', text: 'Les accès broker sont chiffrés côté API avant stockage.' },
    { icon: <Eye className="h-5 w-5" />, title: 'Lecture seule', text: "MERKURE lit vos historiques et ne place pas d'ordre pour vous." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Auth flexible', text: "Mode démo local-first et Clerk disponible quand l'environnement est configuré." },
    { icon: <Database className="h-5 w-5" />, title: 'Base structurée', text: 'Prisma/Postgres séparent utilisateurs, comptes, trades, snapshots et abonnements.' },
  ]

  return (
    <section id="security" className="bg-[#050b16] px-5 py-24 sm:px-6">
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
            Entrez dans MERKURE et visualisez vos performances depuis vos vraies données.
          </h2>
          <div className="mt-8 flex justify-center">
            <DemoButton />
          </div>
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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] via-[#5f77ff] to-[#18c7ff] text-sm font-black text-white">
            M
          </div>
          <span className="font-black text-white">MERKURE</span>
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
        <SecuritySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
