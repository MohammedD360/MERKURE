'use client'

/**
 * MagneticButton — CTA "magnétique" : le bouton suit légèrement le curseur.
 *
 * Ressort interruptible (skill "animate" : springs pour les interactions),
 * uniquement `transform`. Désactivé si `prefers-reduced-motion` ou sur
 * appareil tactile (le hover n'a pas de sens). Rend un <Link> Next.js.
 */

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export function MagneticButton({
  href,
  children,
  className,
  strength = 0.35,
}: {
  href: string
  children: ReactNode
  className?: string
  /** Fraction du déplacement curseur répercutée (0 = fixe, 1 = colle au curseur). */
  strength?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  if (reduce) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="inline-block [@media(hover:none)]:transform-none"
    >
      <Link ref={ref} href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  )
}
