'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

type IconVariant = 'current' | 'gradient'

/**
 * Le M de MERKURE dessiné comme une structure de marché : creux, sommet,
 * repli sur un point haut plus élevé, puis cassure. La lettre EST la courbe —
 * c'est ce qui distingue le signe d'un monogramme interchangeable.
 *
 * `gradient` reprend le dégradé de marque (vert → violet) ; `current` hérite
 * de la couleur du parent, pour les fonds déjà colorés (tuile du rail).
 */
export function BrandIcon({
  className = 'h-6 w-6',
  variant = 'current',
}: {
  className?: string
  variant?: IconVariant
}) {
  // Plusieurs logos coexistent sur une page (navbar, menu mobile, footer) :
  // sans identifiant unique, le premier dégradé écraserait les suivants.
  const uid = useId().replace(/:/g, '')
  const strokeId = `merkure-stroke-${uid}`
  const isGradient = variant === 'gradient'

  return (
    <svg
      className={cn('shrink-0', className)}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="MERKURE"
    >
      {isGradient && (
        <defs>
          <linearGradient id={strokeId} x1="6" y1="33" x2="34" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="hsl(141 92% 46%)" />
            <stop offset="55%"  stopColor="hsl(200 90% 58%)" />
            <stop offset="100%" stopColor="hsl(243 90% 65%)" />
          </linearGradient>
        </defs>
      )}

      {/* Le M — creux, sommet, repli sur point haut, cassure, sortie au-dessus du départ */}
      <path
        d="M6.5 32.5 L13 13.5 L19.8 24 L26.8 6.5 L33.5 25.5"
        stroke={isGradient ? `url(#${strokeId})` : 'currentColor'}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>
  )
}

interface BrandLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  iconVariant?: IconVariant
}

export function BrandLogo({
  className,
  iconClassName = 'h-8 w-8',
  textClassName = 'text-xl font-bold tracking-tight',
  iconVariant = 'current',
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5 text-white', className)}>
      <BrandIcon className={iconClassName} variant={iconVariant} />
      <span className={cn('text-current', textClassName)}>MERKURE</span>
    </div>
  )
}
