import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { BrandLogo } from '@/shared/components/BrandLogo'

interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  contentClassName?: string
}

function VisualPanel() {
  return (
    <aside className="relative hidden h-screen flex-col overflow-hidden bg-[#101827] p-10 text-white lg:flex">
      <Image
        src="/auth-background.jpeg"
        alt="Fond abstrait de connexion"
        fill
        priority
        sizes="50vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/45" />

      <div className="relative z-20 flex items-center text-lg font-medium">
        <Link href="/" aria-label="Accueil MERKURE">
          <BrandLogo iconClassName="h-10 w-10" textClassName="text-lg font-semibold tracking-tight" />
        </Link>
      </div>

      <blockquote className="relative z-20 mt-auto max-w-[880px] space-y-4">
        <p className="text-balance text-2xl font-semibold leading-snug">
          MERKURE m&apos;a aidé à comprendre mes comportements de trading et à trouver de nouvelles stratégies rentables.
        </p>
        <footer className="text-sm font-semibold uppercase tracking-wide text-white/85">
          Hugo DEMENEZ
        </footer>
      </blockquote>
    </aside>
  )
}

export function AuthShell({ title, description, children, contentClassName }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-black text-white lg:grid lg:grid-cols-2">
      <VisualPanel />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 lg:px-8">
        <div className="absolute left-6 top-6 lg:hidden">
          <Link href="/" aria-label="Accueil MERKURE">
            <BrandLogo iconClassName="h-10 w-10" textClassName="text-3xl font-semibold tracking-tight" />
          </Link>
        </div>

        <div className={cn('mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]', contentClassName)}>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-balance text-sm font-medium leading-6 text-zinc-400">
              {description}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
