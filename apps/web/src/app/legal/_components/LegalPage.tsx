import Link from 'next/link'
import type { ReactNode } from 'react'

type LegalPageProps = {
  eyebrow: string
  title: string
  description: string
  updatedAt: string
  children: ReactNode
}

export function LegalPage({ eyebrow, title, description, updatedAt, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#070b10] px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/" className="inline-flex text-sm font-bold text-blue-300 transition-colors hover:text-blue-200">
          Retour à l'accueil
        </Link>

        <header className="mt-10 rounded-xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300">{description}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Dernière mise à jour : {updatedAt}</p>
        </header>

        <div className="mt-8 space-y-5">{children}</div>
      </div>
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-background p-6 shadow-[0_14px_54px_rgba(0,0,0,0.20)]">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm font-medium leading-7 text-slate-300">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item} className="flex gap-3">
          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#56bf6b]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function LegalGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

export function LegalCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
      <h3 className="text-sm font-black text-white">{title}</h3>
      <div className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-400">{children}</div>
    </div>
  )
}
