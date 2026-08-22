'use client'

/**
 * ScrollProgress — fine barre de progression de lecture en haut de page.
 *
 * Scroll-linked (skill "animate") : `useScroll` → `scaleX` via un spring
 * pour un suivi fluide, transform-origin gauche. Uniquement `transform`.
 * Masquée si `prefers-reduced-motion`.
 */

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

export function ScrollProgress() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 })

  if (reduce) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-brand"
    />
  )
}
