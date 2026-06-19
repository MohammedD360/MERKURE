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
  tone = 'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
  tone?: string
}) {
  return (
    <article className="rounded-xl border border-[hsl(var(--border))] bg-background p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-foreground">{value}</p>
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
        <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-background p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-lg bg-[hsl(var(--accent))]" />
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-[hsl(var(--accent))]" />
              <div className="h-3 w-28 animate-pulse rounded bg-[hsl(var(--accent))]" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[hsl(var(--border))] pt-4">
            {[1, 2, 3].map(j => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-[hsl(var(--accent))]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[hsl(var(--accent))]" />
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
        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-background shadow-sm">
          <div className="relative flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,hsl(var(--primary)/0.06),transparent_32%),radial-gradient(circle_at_80%_15%,hsl(var(--primary)/0.04),transparent_34%)]" />
            <div className="relative">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Connexions broker</p>
              <h2 className="mt-3 text-2xl font-black text-foreground">Centralisez vos comptes de trading</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                Connectez vos brokers en lecture seule, synchronisez l'historique et retrouvez vos trades dans un espace unique.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Lecture seule
                </span>
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Synchronisation manuelle
                </span>
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Multi-comptes
                </span>
              </div>
            </div>

            <div className="relative flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <button
                onClick={handleSyncAll}
                disabled={syncingAll || isLoading || comptes.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-4 py-3 text-sm font-black text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RefreshCw className={`h-4 w-4 ${syncingAll ? 'animate-spin' : ''}`} />
                Tout synchroniser
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-[hsl(244_42%_44%)]"
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
            tone="border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
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
            tone={erreurs.length > 0 ? 'border-rose-200 bg-red-50 text-red-500' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-black text-red-500">Impossible de charger les comptes</p>
              <p className="mt-1 text-xs font-medium text-red-500/80">Vérifiez que l'API est démarrée puis réessayez.</p>
            </div>
          </div>
        )}

        {isLoading && <Skeleton />}

        {!isLoading && comptes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-foreground">Comptes connectés</h2>
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
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-background px-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)]">
              <Link2 className="h-9 w-9 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="mt-6 text-lg font-black text-foreground">Aucun compte connecté</h3>
            <p className="mt-3 max-w-md text-sm font-medium leading-7 text-muted-foreground">
              Connectez votre premier compte broker pour commencer à suivre vos performances et synchroniser votre historique.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[hsl(244_42%_44%)]"
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
