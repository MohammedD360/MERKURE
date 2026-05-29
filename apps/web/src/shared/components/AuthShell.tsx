import type { ReactNode } from 'react'
import Link from 'next/link'
import { Check, Lock, ShieldCheck, TrendingUp } from 'lucide-react'

interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

const productStats = [
  { value: '< 5 min', label: 'Pour tout configurer' },
  { value: '15+', label: 'Brokers supportés' },
  { value: '100%', label: 'Lecture seule' },
]

const assuranceItems = [
  'Accès broker en lecture seule — votre argent est intouchable',
  'Aucune carte bancaire requise pour démarrer',
  'Supprimez vos données à tout moment',
]

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <svg className="h-8 w-8 text-white" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M12 27V13l8 8 8-8v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[22px] font-black tracking-[0.12em] text-white">MERKURE</span>
    </div>
  )
}

function ProductPanel() {
  return (
    <aside className="hidden border-l border-white/10 bg-[#060c14] lg:flex lg:flex-col lg:overflow-y-auto">
      <div className="relative flex flex-1 flex-col justify-center px-10 py-12">
        {/* Glow accent */}
        <div className="pointer-events-none absolute left-0 top-1/4 h-72 w-72 rounded-full bg-blue-600/[0.08] blur-[80px]" aria-hidden />
        <div className="pointer-events-none absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-emerald-600/[0.06] blur-[70px]" aria-hidden />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Plateforme d&apos;analyse</p>
          <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight text-white">
            Là où vos données deviennent des décisions.
          </h2>
          <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-slate-400">
            Connectez vos brokers, analysez vos performances et identifiez vos edges — tout en un.
          </p>

          {/* Stats strip */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {productStats.map(({ value, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <p className="font-mono text-xl font-black text-white">{value}</p>
                <p className="mt-1.5 text-[10px] font-semibold leading-4 text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Dashboard preview */}
          <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#0b111c] shadow-[0_24px_80px_rgba(0,0,0,0.40)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <p className="text-xs font-black text-white">Dashboard · 30 derniers jours</p>
              <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-4">
              {[
                { label: 'P&L net', value: '+2 930 €', color: 'text-emerald-300' },
                { label: 'Win Rate', value: '58,1 %', color: 'text-white' },
                { label: 'Drawdown', value: '−3,2 %', color: 'text-red-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                  <p className={`mt-2.5 font-mono text-sm font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400">Courbe equity · Cumulé</p>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <svg viewBox="0 0 520 120" className="h-24 w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="authPanelChart" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#38e476" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#38e476" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[30, 60, 90].map((y) => (
                    <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
                  ))}
                  <path
                    d="M0 90 L46 84 L92 98 L138 76 L184 80 L230 56 L276 40 L322 48 L368 32 L414 38 L460 16 L520 8 L520 120 L0 120 Z"
                    fill="url(#authPanelChart)"
                  />
                  <polyline
                    points="0,90 46,84 92,98 138,76 184,80 230,56 276,40 322,48 368,32 414,38 460,16 520,8"
                    fill="none"
                    stroke="#38e476"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="0,90 46,84 92,98"
                    fill="none"
                    stroke="#ff5e70"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/25 bg-blue-400/10 text-sm font-black text-blue-300">
                T
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium italic leading-6 text-slate-300">
                  &ldquo;En une semaine, j&apos;ai vu que je perdais systématiquement le vendredi après-midi. J&apos;ai arrêté ce créneau — mon win rate est passé de 51 à 62 %.&rdquo;
                </p>
                <p className="mt-3 text-xs font-black text-white">T.R.</p>
                <p className="text-[11px] font-semibold text-slate-500">Day trader Forex · 3 ans d&apos;expérience</p>
              </div>
            </div>
          </div>

          {/* Assurance */}
          <div className="mt-6 space-y-3">
            {assuranceItems.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-400">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                  <Check className="h-3 w-3 text-emerald-300" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#070b10] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute -right-32 bottom-1/3 h-[360px] w-[360px] rounded-full bg-emerald-600/[0.05] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1fr_1fr]">
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Accueil MERKURE">
            <BrandMark />
          </Link>

          <div className="flex flex-1 items-center py-10">
            <div className="w-full max-w-[480px]">
              <div className="mb-8">
                <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300">
                  {eyebrow}
                </span>
                <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-[2.4rem]">{title}</h1>
                <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-400">{description}</p>
              </div>

              {children}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Données chiffrées
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-300" />
              Connexion sécurisée
            </span>
          </div>
        </section>

        <ProductPanel />
      </div>
    </main>
  )
}
