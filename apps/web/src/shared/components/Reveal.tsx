'use client'

/**
 * Reveal — apparition au scroll (reveal-on-scroll).
 *
 * Suit le skill "animate" : entrée en `ease-out` (quint), 200-600ms,
 * uniquement `opacity` + `transform`, joué une seule fois.
 * Respecte `prefers-reduced-motion` (rendu statique, aucun mouvement).
 *
 * Pour animer une liste en cascade, envelopper les enfants dans
 * <Reveal stagger> et chaque enfant dans <RevealItem>.
 */

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE_OUT_QUINT = [0.23, 1, 0.32, 1] as const

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.6,
  stagger = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
  /** Orchestre l'apparition en cascade des <RevealItem> enfants. */
  stagger?: boolean
}) {
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  if (stagger) {
    const container: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: 0.09, delayChildren: delay } },
    }
    return (
      <motion.div
        className={className}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, ease: EASE_OUT_QUINT, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Élément enfant d'un <Reveal stagger>. */
export function RevealItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>

  const item: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_QUINT } },
  }
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}
