'use client'

import { useState, type ReactNode } from 'react'
import { Plus, RefreshCw, Wallet, ShieldAlert, BarChart2, Link2 } from 'lucide-react'
import { CompteCard } from './components/CompteCard'
import { ConnectBrokerModal } from './components/ConnectBrokerModal'
import { useAccounts, useSyncAccount } from '@/lib/hooks/use-accounts'
import { useRouter } from 'next/navigation'

function GlobalKpi({ icon, label, value, sub, color = 'text-white' }: {
  icon: ReactNode; label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div className="glass p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/40 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold font-mono mt-0.5 ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="bg-[#111827] rounded-xl border border-gray-800/60 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded bg-gray-800 animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-gray-800 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-800/60">
            {[1, 2, 3].map(j => (
              <div key={j} className="space-y-1.5">
                <div className="h-2 w-16 rounded bg-gray-800 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-gray-800 animate-pulse" />
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

  const actifs  = comptes.filter(c => c.syncStatus !== 'ERROR')
  const erreurs = comptes.filter(c => c.syncStatus === 'ERROR')

  const handleSyncAll = () => {
    actifs.forEach(c => syncAll(c.id))
  }

  const handleNavigateToTrades = (accountId: string) => {
    router.push(`/app/trades?accountId=${accountId}`)
  }

  return (
    <>
      <div className="px-6 py-5 space-y-5">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Mes Comptes</h2>
            <p className="text-xs text-white/30 mt-1">
              {isLoading
                ? 'Chargement…'
                : `${comptes.length} compte${comptes.length > 1 ? 's' : ''} connecté${comptes.length > 1 ? 's' : ''} · ${actifs.length} actif${actifs.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={syncingAll || isLoading || comptes.length === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              Tout synchroniser
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-[12px] !py-2 !px-4"
            >
              <Plus className="w-4 h-4" />
              Connecter un broker
            </button>
          </div>
        </div>

        {/* ── KPIs ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <GlobalKpi
            icon={<Wallet className="w-5 h-5" />}
            label="Comptes connectés"
            value={isLoading ? '…' : comptes.length.toString()}
            sub={`${actifs.length} actifs, ${erreurs.length} en erreur`}
          />
          <GlobalKpi
            icon={<BarChart2 className="w-5 h-5" />}
            label="Brokers différents"
            value={isLoading ? '…' : new Set(comptes.map(c => c.brokerType)).size.toString()}
            sub="Types de connexion"
          />
          <GlobalKpi
            icon={<ShieldAlert className="w-5 h-5" />}
            label="Comptes en erreur"
            value={isLoading ? '…' : erreurs.length.toString()}
            sub={erreurs.length > 0 ? 'Reconnecter pour reprendre' : 'Tout est opérationnel'}
            color={erreurs.length > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}
          />
        </div>

        {/* ── Erreur API ─────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">
              Impossible de charger les comptes. Vérifiez que l'API est démarrée.
            </p>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────── */}
        {isLoading && <Skeleton />}

        {/* ── Liste des comptes ────────────────────────── */}
        {!isLoading && comptes.length > 0 && (
          <div className="space-y-4">
            {comptes.map(compte => (
              <CompteCard
                key={compte.id}
                compte={compte}
                onNavigateToTrades={handleNavigateToTrades}
              />
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────── */}
        {!isLoading && !error && comptes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mb-4">
              <Link2 className="w-8 h-8 text-[#00d4ff]" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Aucun compte connecté</h3>
            <p className="text-sm text-white/40 max-w-xs mb-6">
              Connecte ton premier compte broker pour commencer à suivre tes performances en temps réel.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-[13px]"
            >
              <Plus className="w-4 h-4" />
              Connecter un broker
            </button>
          </div>
        )}
      </div>

      <ConnectBrokerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
