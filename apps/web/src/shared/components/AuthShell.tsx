import type { ReactNode } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { BrandLogo } from '@/shared/components/BrandLogo'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  contentClassName?: string
}

function VisualPanel() {
  return (
    <aside className="relative hidden h-screen flex-col overflow-hidden lg:flex" style={{ background: 'hsl(244 42% 14%)' }}>
      {/* Grille de points */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(244 42% 51% / 0.22) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Vague décorative */}
      <div className="absolute inset-0 overflow-hidden">
        <svg viewBox="0 0 800 800" className="absolute -bottom-40 -right-40 h-[700px] w-[700px] opacity-20" fill="none">
          <circle cx="400" cy="400" r="380" stroke="hsl(244 42% 65%)" strokeWidth="1" />
          <circle cx="400" cy="400" r="280" stroke="hsl(244 42% 65%)" strokeWidth="1" />
          <circle cx="400" cy="400" r="180" stroke="hsl(244 42% 65%)" strokeWidth="1" />
        </svg>
        <div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(244 42% 51%) 0%, transparent 70%)' }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-20 p-10">
        <Link href="/" aria-label="Accueil MERKURE">
          <BrandLogo iconClassName="h-10 w-10" textClassName="text-lg font-semibold tracking-tight" />
        </Link>
      </div>

      {/* Témoignage */}
      <blockquote className="relative z-20 mt-auto p-10 space-y-4">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-balance text-xl font-medium leading-relaxed text-white/90">
          MERKURE m&apos;a aidé à comprendre mes comportements de trading et à trouver de nouvelles stratégies rentables.
        </p>
        <footer className="text-sm font-semibold uppercase tracking-wide text-white/55">
          Hugo DEMENEZ — Trader indépendant
        </footer>
      </blockquote>
    </aside>
  )
}

export function AuthShell({ title, description, children, contentClassName }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-2">
      <VisualPanel />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 lg:px-8 bg-background">
        {/* Logo mobile */}
        <div className="absolute left-6 top-6 lg:hidden">
          <Link href="/" aria-label="Accueil MERKURE">
            <BrandLogo
              className="text-foreground"
              iconClassName="h-9 w-9 text-[hsl(var(--sidebar-primary))]"
              textClassName="text-2xl font-bold tracking-tight"
            />
          </Link>
        </div>

        <div className={cn('mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]', contentClassName)}>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="font-primary text-3xl tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-balance text-sm leading-6 text-[hsl(var(--foreground-soft))]">
              {description}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
