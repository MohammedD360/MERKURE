'use client'

import type { ComponentType, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * En-tête de section unifié (eyebrow + titre + action optionnelle).
 * Source unique de l'échelle typographique des cartes du dashboard.
 */
export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    // Anatomie du CardHeader de la référence : titre 24px/600 tracking-tight,
    // sous-titre 14px muted, action alignée à droite.
    <div className={cn('mb-6 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 space-y-1.5">
        <h3 className="truncate text-2xl font-semibold leading-none tracking-tight text-foreground">{title}</h3>
        {eyebrow && <p className="truncate text-sm text-muted-foreground">{eyebrow}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * État vide unifié (icône + titre + indication + action optionnelle).
 * Un seul ton, un seul style pour tout le dashboard.
 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: ComponentType<LucideProps>
  title: string
  hint?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center',
        className,
      )}
    >
      {Icon && <Icon className="h-7 w-7 text-muted-foreground/60" />}
      <p className="text-xs font-semibold text-foreground">{title}</p>
      {hint && <p className="max-w-xs text-[11px] leading-5 text-muted-foreground">{hint}</p>}
      {action}
    </div>
  )
}
