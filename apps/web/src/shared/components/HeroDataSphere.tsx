'use client'

/**
 * HeroDataSphere — sphère de données / "cerveau" MERKURE.
 *
 * WebGL (three.js brut, aucune dépendance ajoutée). Nuage de nœuds répartis
 * en spirale de Fibonacci, reliés à leurs plus proches voisins :
 *  - shader custom → profondeur réelle (les nœuds arrière s'assombrissent) + scintillement
 *  - impulsions lumineuses ("synapses") qui circulent le long des connexions
 *  - respiration, rotation lente, parallax vers le curseur
 * Couleurs de la marque : violet (#635BFF) → vert néon (#09E354), blending additif.
 *
 * Robustesse : SSR-safe (tout dans useEffect), resize, DPR plafonné,
 * prefers-reduced-motion, pause hors écran (IntersectionObserver),
 * cleanup complet (dispose + removeEventListener + cancelAnimationFrame).
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const VIOLET = new THREE.Color('#635BFF')
const GREEN = new THREE.Color('#09E354')

// ── Paramètres facilement ajustables ──────────────────────────────────────
const COUNT = 660 // densité de nœuds
const RADIUS = 1.75 // taille de la sphère
const MAX_LINKS = 3 // arêtes max par nœud
const MAX_DIST = 0.63 // distance max d'une arête
const ROT_SPEED = 0.0016 // vitesse de rotation
const PULSE_COUNT = 46 // nombre d'impulsions circulant simultanément

/** Sprite circulaire doux généré en canvas (pour les impulsions). */
function makeDotTexture(): THREE.Texture {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(255,255,255,0.8)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

const NODE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    // Profondeur : plus c'est loin de la caméra, plus c'est sombre
    float depthFade = clamp((6.6 - dist) / (6.6 - 2.6), 0.14, 1.0);
    // Scintillement individuel
    float tw = 0.72 + 0.28 * sin(uTime * 2.0 + aPhase);
    gl_PointSize = uSize * uPixelRatio * (300.0 / dist) * tw;
    vColor = aColor;
    vAlpha = depthFade * tw;
    gl_Position = projectionMatrix * mv;
  }
`

const NODE_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`

export function HeroDataSphere({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = mount.clientWidth || 1
    let height = mount.clientHeight || 1

    // ── Scene / camera / renderer ──────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.z = 4.3

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return // pas de contexte WebGL → on laisse le fond CSS
    }
    const dpr = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    group.rotation.x = 0.35
    scene.add(group)

    // ── Nœuds répartis en spirale de Fibonacci ──────────────────────────────
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const phases = new Float32Array(COUNT)
    const nodes: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      const v = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(RADIUS)
      nodes.push(v)
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
      const t = (y + 1) / 2
      const col = VIOLET.clone().lerp(GREEN, t * 0.75)
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
      // phase pseudo-aléatoire déterministe (pas de Math.random pour rester SSR-safe/reproductible)
      phases[i] = (i * 1.6180339) % (Math.PI * 2)
    }

    const nodesGeo = new THREE.BufferGeometry()
    nodesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    nodesGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    nodesGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

    const nodesMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.09 },
        uPixelRatio: { value: dpr },
      },
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(nodesGeo, nodesMat)
    points.frustumCulled = false
    group.add(points)

    // ── Arêtes : chaque nœud relié à ses plus proches voisins ───────────────
    const linePos: number[] = []
    const lineCol: number[] = []
    const edges: number[][] = [] // [ax,ay,az,bx,by,bz] par arête (pour les impulsions)
    for (let i = 0; i < COUNT; i++) {
      let links = 0
      const a = nodes[i]
      if (!a) continue
      for (let j = i + 1; j < COUNT && links < MAX_LINKS; j++) {
        const b = nodes[j]
        if (b && a.distanceTo(b) < MAX_DIST) {
          linePos.push(a.x, a.y, a.z, b.x, b.y, b.z)
          const ci = (a.y + RADIUS) / (2 * RADIUS)
          const cj = (b.y + RADIUS) / (2 * RADIUS)
          const c1 = VIOLET.clone().lerp(GREEN, ci * 0.75)
          const c2 = VIOLET.clone().lerp(GREEN, cj * 0.75)
          lineCol.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b)
          edges.push([a.x, a.y, a.z, b.x, b.y, b.z])
          links++
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry()
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
    linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3))
    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const lines = new THREE.LineSegments(linesGeo, linesMat)
    lines.frustumCulled = false
    group.add(lines)

    // ── Impulsions "synapses" circulant le long des arêtes ──────────────────
    const dotTex = makeDotTexture()
    const pulsePos = new Float32Array(PULSE_COUNT * 3)
    const pulses = edges.length
      ? Array.from({ length: PULSE_COUNT }, (_, k) => ({
          edge: (k * 97) % edges.length,
          t: (k / PULSE_COUNT), // réparties dès le départ
          speed: 0.006 + ((k * 13) % 10) * 0.0016,
        }))
      : []
    const pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3))
    const pulseMat = new THREE.PointsMaterial({
      size: 0.14,
      map: dotTex,
      color: new THREE.Color('#b9ffe4'),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat)
    pulsePoints.frustumCulled = false
    group.add(pulsePoints)

    function updatePulses(advance: boolean) {
      for (let k = 0; k < pulses.length; k++) {
        const p = pulses[k]
        if (!p) continue
        if (advance) {
          p.t += p.speed
          if (p.t >= 1) {
            p.t = 0
            p.edge = (p.edge + 131) % edges.length // saute vers une autre arête
          }
        }
        const e = edges[p.edge]
        if (!e) continue
        pulsePos[k * 3] = e[0]! + (e[3]! - e[0]!) * p.t
        pulsePos[k * 3 + 1] = e[1]! + (e[4]! - e[1]!) * p.t
        pulsePos[k * 3 + 2] = e[2]! + (e[5]! - e[2]!) * p.t
      }
      pulseGeo.attributes.position!.needsUpdate = true
    }
    if (pulses.length) updatePulses(false)

    // ── Halo central diffus ─────────────────────────────────────────────────
    const glowMat = new THREE.SpriteMaterial({
      map: dotTex,
      color: new THREE.Color('#4b47c9'),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const glow = new THREE.Sprite(glowMat)
    glow.scale.set(6.2, 6.2, 1)
    scene.add(glow)

    // ── Interaction souris (parallax) ───────────────────────────────────────
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    function onPointerMove(e: PointerEvent) {
      const rect = mount!.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    if (!reduceMotion) window.addEventListener('pointermove', onPointerMove, { passive: true })

    // ── Resize ──────────────────────────────────────────────────────────────
    function onResize() {
      if (!mount) return
      width = mount.clientWidth || 1
      height = mount.clientHeight || 1
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    // ── Pause hors écran ────────────────────────────────────────────────────
    let visible = true
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true
        if (visible && frame === 0 && !reduceMotion) loop()
      },
      { threshold: 0 },
    )
    io.observe(mount)

    // ── Boucle d'animation ──────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let frame = 0

    function loop() {
      if (!visible) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(loop)
      const t = clock.getElapsedTime()
      nodesMat.uniforms.uTime!.value = t

      group.rotation.y += ROT_SPEED
      pointer.x += (target.x - pointer.x) * 0.04
      pointer.y += (target.y - pointer.y) * 0.04
      group.rotation.x = 0.35 + pointer.y * 0.25
      group.rotation.z = pointer.x * 0.12
      group.scale.setScalar(1 + Math.sin(t * 0.9) * 0.02)
      glowMat.opacity = 0.42 + Math.sin(t * 1.3) * 0.08

      updatePulses(true)
      renderer.render(scene, camera)
    }

    // premier rendu (statique si reduce-motion)
    nodesMat.uniforms.uTime!.value = 0
    renderer.render(scene, camera)
    if (!reduceMotion) loop()

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      nodesGeo.dispose()
      linesGeo.dispose()
      pulseGeo.dispose()
      nodesMat.dispose()
      linesMat.dispose()
      pulseMat.dispose()
      glowMat.dispose()
      dotTex.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  )
}
