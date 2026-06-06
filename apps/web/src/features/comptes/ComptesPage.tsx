'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, BarChart2, Link2, Plus, RefreshCw, ShieldCheck, Wallet } from 'lucide-react'
import { CompteCard } from './components/CompteCard'
import { ConnectBrokerModal } from './components/ConnectBrokerModal'
import { useAccounts, useSyncAccount } from '@/lib/hooks/use-accounts'

function StatCard({
  icon,
  label,
  value,
  helper,
  tone = 'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
  tone?: string
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-background p-5 shadow-[0_12px_46px_rgba(0,0,0,0.18)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{helper}</p>
        </div>
      </div>
    </article>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {[1, 2].map(i => (
        <div key={i} className="rounded-xl border border-white/10 bg-background p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-lg bg-white/[0.05]" />
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-white/[0.05]" />
              <div className="h-3 w-28 animate-pulse rounded bg-white/[0.04]" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4">
            {[1, 2, 3].map(j => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-white/[0.04]" />
                <div className="h-4 w-20 animate-pulse rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ComptesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: comptes = [], isLoading, error } = useAccounts()
  const { mutate: syncAll, isPending: syncingAll } = useSyncAccount()
  const router = useRouter()

  const actifs = comptes.filter(c => c.syncStatus !== 'ERROR')
  const erreurs = comptes.filter(c => c.syncStatus === 'ERROR')
  const brokerCount = new Set(comptes.map(c => c.brokerType)).size

  const handleSyncAll = () => {
    actifs.forEach(c => syncAll(c.id))
  }

  const handleNavigateToTrades = (accountId: string) => {
    router.push(`/app/trades?accountId=${accountId}`)
  }

  return (
    <>
      <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_12px_52px_rgba(0,0,0,0.20)]">
          <div className="relative flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(86,191,107,0.14),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(37,99,235,0.12),transparent_34%)]" />
            <div className="relative">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#56bf6b]">Connexions broker</p>
              <h2 className="mt-3 text-2xl font-black text-white">Centralisez vos comptes de trading</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                Connectez vos brokers en lecture seule, synchronisez l’historique et retrouvez vos trades dans un espace unique.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#56bf6b]" />
                  Lecture seule
                </span>
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-300" />
                  Synchronisation manuelle
                </span>
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-violet-300" />
                  Multi-comptes
                </span>
              </div>
            </div>

            <div className="relative flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <button
                onClick={handleSyncAll}
                disabled={syncingAll || isLoading || comptes.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RefreshCw className={`h-4 w-4 ${syncingAll ? 'animate-spin' : ''}`} />
                Tout synchroniser
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(86,191,107,0.22)] transition-colors hover:bg-[#49ab5e]"
              >
                <Plus className="h-4 w-4" />
                Connecter un broker
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<Wallet className="h-5 w-5" />}
            label="Comptes connectés"
            value={isLoading ? '…' : comptes.length.toString()}
            helper={`${actifs.length} actifs, ${erreurs.length} en erreur`}
            tone="border-[#56bf6b]/20 bg-[#56bf6b]/[0.08] text-[#56bf6b]"
          />
          <StatCard
            icon={<BarChart2 className="h-5 w-5" />}
            label="Brokers différents"
            value={isLoading ? '…' : brokerCount.toString()}
            helper="Types de connexion"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Comptes en erreur"
            value={isLoading ? '…' : erreurs.length.toString()}
            helper={erreurs.length > 0 ? 'Reconnecter pour reprendre' : 'Tout est opérationnel'}
            tone={erreurs.length > 0 ? 'border-rose-400/20 bg-rose-400/[0.08] text-rose-300' : 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300'}
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-5 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
            <div>
              <p className="text-sm font-black text-rose-200">Impossible de charger les comptes</p>
              <p className="mt-1 text-xs font-medium text-rose-300/80">Vérifiez que l’API est démarrée puis réessayez.</p>
            </div>
          </div>
        )}

        {isLoading && <Skeleton />}

        {!isLoading && comptes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-white">Comptes connectés</h2>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {comptes.length} compte{comptes.length > 1 ? 's' : ''} configuré{comptes.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {comptes.map(compte => (
                <CompteCard
                  key={compte.id}
                  compte={compte}
                  onNavigateToTrades={handleNavigateToTrades}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && !error && comptes.length === 0 && (
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-white/10 bg-background px-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#56bf6b]/20 bg-[#56bf6b]/[0.08]">
              <Link2 className="h-9 w-9 text-[#56bf6b]" />
            </div>
            <h3 className="mt-6 text-lg font-black text-white">Aucun compte connecté</h3>
            <p className="mt-3 max-w-md text-sm font-medium leading-7 text-muted-foreground">
              Connectez votre premier compte broker pour commencer à suivre vos performances et synchroniser votre historique.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#49ab5e]"
            >
              <Plus className="h-4 w-4" />
              Connecter un broker
            </button>
          </section>
        )}
      </div>

      <ConnectBrokerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
