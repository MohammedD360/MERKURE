'use client'

/**
 * CountUp — compteur qui s'incrémente quand il entre dans le viewport.
 *
 * Easing `ease-out-cubic` (démarrage rapide, arrivée douce), joué une fois.
 * Respecte `prefers-reduced-motion` : affiche directement la valeur finale.
 * Formatage FR (séparateur de milliers), avec préfixe/suffixe libres.
 */

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className,
}: {
  value: number
  decimals?: number
  prefix?: string | undefined
  suffix?: string | undefined
  duration?: number
  className?: string | undefined
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(value)
      return
    }
    let raf = 0
    let startTs = 0
    const step = (ts: number) => {
      if (!startTs) startTs = ts
      const p = Math.min((ts - startTs) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out-cubic
      setDisplay(value * eased)
      if (p < 1) raf = requestAnimationFrame(step)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, reduce, duration])

  const formatted = display.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
