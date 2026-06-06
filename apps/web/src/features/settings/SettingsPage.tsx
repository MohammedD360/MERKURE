'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  LayoutDashboard,
  Moon,
  SlidersHorizontal,
  Sun,
  User,
} from 'lucide-react'

import { useTheme } from '@/lib/context/theme-context'
import { useRiskStatus, useUpdateRisk } from '@/lib/hooks/use-risk'

const DASHBOARD_PERIODS = ['7J', '1M', '3M', '1Y', 'ALL'] as const
type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number]

const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, string> = {
  '7J': '7 jours',
  '1M': '1 mois',
  '3M': '3 mois',
  '1Y': '1 an',
  ALL:  'Tout',
}

const DASHBOARD_PERIOD_KEY = 'merkure_dashboard_period'
const QUICK_ACTIONS_DISMISSED_KEY = 'dashboard-quick-actions-dismissed'

function isDashboardPeriod(value: string | null): value is DashboardPeriod {
  return DASHBOARD_PERIODS.includes(value as DashboardPeriod)
}

function SuccessBanner({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm font-semibold text-emerald-300">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {children}
    </div>
  )
}

function ErrorBanner({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm font-semibold text-rose-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {children}
    </div>
  )
}

function SectionCard({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon:        typeof SlidersHorizontal
  tone:        'green' | 'blue' | 'amber'
  title:       string
  description: string
  children:    React.ReactNode
}) {
  const iconClass = {
    green: 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
    blue:  'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
    amber: 'border-amber-400/20 bg-amber-400/[0.08] text-amber-300',
  }[tone]

  return (
    <section className="rounded-lg border border-slate-800 bg-background p-5 shadow-[0_14px_46px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">{title}</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label:       string
  description: string
  enabled:     boolean
  onChange:    (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#071017] p-4">
      <div>
        <p className="text-sm font-black text-white">{label}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
          enabled
            ? 'border-[#56bf6b]/40 bg-[#56bf6b]/25'
            : 'border-slate-700 bg-slate-900'
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function RiskSettingsCard() {
  const { data, isLoading } = useRiskStatus()
  const updateRisk = useUpdateRisk()
  const [riskPerTrade, setRiskPerTrade] = useState('1')

  useEffect(() => {
    if (data?.riskPerTrade !== undefined) {
      setRiskPerTrade(String(data.riskPerTrade))
    }
  }, [data?.riskPerTrade])

  const riskValue = Number(riskPerTrade)
  const riskInvalid = Number.isNaN(riskValue) || riskValue < 0.1 || riskValue > 10

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!riskInvalid) updateRisk.mutate(riskValue)
  }

  return (
    <SectionCard
      icon={Gauge}
      tone="green"
      title="Cadre de risque"
      description="Définissez le risque maximum par trade utilisé dans les alertes et les lectures de discipline."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-[#071017] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Risque par trade</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Valeur acceptée entre 0,1 % et 10 %.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={riskPerTrade}
                disabled={isLoading}
                onChange={(event) => setRiskPerTrade(event.target.value)}
                className="w-24 rounded-lg border border-slate-800 bg-background px-3 py-2 text-right font-mono text-sm font-black text-white outline-none transition-colors focus:border-[#56bf6b]/60"
              />
              <span className="text-sm font-black text-slate-400">%</span>
            </div>
          </div>

          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={riskInvalid ? 1 : riskValue}
            disabled={isLoading}
            onChange={(event) => setRiskPerTrade(event.target.value)}
            className="mt-5 h-1.5 w-full cursor-pointer rounded-full accent-[#56bf6b]"
          />
          <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-600">
            <span>0,1 %</span>
            <span>10 %</span>
          </div>
        </div>

        {riskInvalid && <ErrorBanner>Le risque doit rester entre 0,1 % et 10 %.</ErrorBanner>}
        {updateRisk.isSuccess && <SuccessBanner>Cadre de risque mis à jour.</SuccessBanner>}
        {updateRisk.isError && <ErrorBanner>Impossible d’enregistrer le risque pour le moment.</ErrorBanner>}

        <button
          type="submit"
          disabled={isLoading || updateRisk.isPending || riskInvalid}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#49ab5e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateRisk.isPending ? 'Enregistrement...' : 'Enregistrer le risque'}
        </button>
      </form>
    </SectionCard>
  )
}

function AppearanceSettingsCard() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const setTheme = (next: 'dark' | 'light') => {
    if (next !== theme) toggleTheme()
  }

  return (
    <SectionCard
      icon={Sun}
      tone="blue"
      title="Affichage"
      description="Choisissez le thème utilisé dans l’espace connecté. Ce réglage est appliqué immédiatement sur cet appareil."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`rounded-lg border p-4 text-left transition-colors ${
            isDark
              ? 'border-[#56bf6b]/45 bg-[#56bf6b]/10'
              : 'border-slate-800 bg-[#071017] hover:border-slate-700'
          }`}
        >
          <Moon className="h-5 w-5 text-blue-300" />
          <p className="mt-3 text-sm font-black text-white">Sombre</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Lecture dense, adaptée au suivi quotidien.</p>
        </button>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`rounded-lg border p-4 text-left transition-colors ${
            !isDark
              ? 'border-[#56bf6b]/45 bg-[#56bf6b]/10'
              : 'border-slate-800 bg-[#071017] hover:border-slate-700'
          }`}
        >
          <Sun className="h-5 w-5 text-amber-300" />
          <p className="mt-3 text-sm font-black text-white">Clair</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Pratique pour rapports, captures et revues.</p>
        </button>
      </div>
    </SectionCard>
  )
}

function DashboardSettingsCard() {
  const [defaultPeriod, setDefaultPeriod] = useState<DashboardPeriod>('1M')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const storedPeriod = window.localStorage.getItem(DASHBOARD_PERIOD_KEY)
    if (isDashboardPeriod(storedPeriod)) setDefaultPeriod(storedPeriod)
    setShowQuickActions(window.localStorage.getItem(QUICK_ACTIONS_DISMISSED_KEY) !== '1')
  }, [])

  const savePreferences = () => {
    window.localStorage.setItem(DASHBOARD_PERIOD_KEY, defaultPeriod)
    if (showQuickActions) {
      window.localStorage.removeItem(QUICK_ACTIONS_DISMISSED_KEY)
    } else {
      window.localStorage.setItem(QUICK_ACTIONS_DISMISSED_KEY, '1')
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3000)
  }

  const selectedPeriodLabel = useMemo(() => DASHBOARD_PERIOD_LABELS[defaultPeriod], [defaultPeriod])

  return (
    <SectionCard
      icon={LayoutDashboard}
      tone="amber"
      title="Dashboard"
      description="Réglez le comportement d’ouverture du tableau de bord sur cet appareil."
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-[#071017] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Période par défaut</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Le dashboard s’ouvrira sur {selectedPeriodLabel}.</p>
            </div>
            <select
              value={defaultPeriod}
              onChange={(event) => setDefaultPeriod(event.target.value as DashboardPeriod)}
              className="rounded-lg border border-slate-800 bg-background px-3 py-2 text-sm font-black text-white outline-none transition-colors focus:border-[#56bf6b]/60"
            >
              {DASHBOARD_PERIODS.map(period => (
                <option key={period} value={period}>{DASHBOARD_PERIOD_LABELS[period]}</option>
              ))}
            </select>
          </div>
        </div>

        <ToggleRow
          label="Actions rapides"
          description="Afficher les raccourcis broker, journal et alertes sur le dashboard."
          enabled={showQuickActions}
          onChange={setShowQuickActions}
        />

        {saved && <SuccessBanner>Préférences dashboard enregistrées.</SuccessBanner>}

        <button
          type="button"
          onClick={savePreferences}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#49ab5e]"
        >
          Enregistrer l’affichage
        </button>
      </div>
    </SectionCard>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Compte</p>
          <h1 className="mt-1 text-xl font-black text-white">Paramètres produit</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Configurez l’expérience MERKURE sans dupliquer la page Profil, qui reste dédiée à votre identité et à la sécurité.
          </p>
        </div>

        <Link
          href="/app/profile"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-background px-4 py-2.5 text-sm font-black text-slate-200 transition-colors hover:border-slate-700 hover:text-white"
        >
          <User className="h-4 w-4" />
          Ouvrir le profil
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <RiskSettingsCard />
        <AppearanceSettingsCard />
        <div className="xl:col-span-2">
          <DashboardSettingsCard />
        </div>
      </div>
    </div>
  )
}
