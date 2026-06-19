import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

type ModulePlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
  status?: string
  icon: LucideIcon
  primaryAction?: {
    href: string
    label: string
  }
  items: string[]
}

export function ModulePlaceholderPage({
  eyebrow,
  title,
  description,
  status = 'Module en préparation',
  icon: Icon,
  primaryAction,
  items,
}: ModulePlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-[#f6f7f9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
              <Icon className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
            {status}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Ce qui sera présenté ici</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-md border border-border bg-[#f8fafc] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>

          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[hsl(244_42%_44%)]"
            >
              {primaryAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      </div>
    </div>
  )
}
