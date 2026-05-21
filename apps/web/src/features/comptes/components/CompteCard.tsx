'use client'

import { useState } from 'react'
import {
  RefreshCw, Unlink, ArrowLeftRight,
  AlertTriangle, Wifi, WifiOff, Loader2, Clock,
} from 'lucide-react'
import { brokerMeta } from '@/lib/mock-comptes'
import {
  useSyncAccount, useDeleteAccount,
  type BrokerAccount, type BrokerType, type SyncStatus,
} from '@/lib/hooks/use-accounts'

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  LIVE:           'Live',
  DEMO:           'Démo',
  PROP_FUNDED:    'Prop Funded',
  PROP_CHALLENGE: 'Prop Challenge',
}

function SyncBadge({ status, lastSyncAt }: { status: SyncStatus; lastSyncAt: string | null }) {
  const fmtDate = (iso: string | null) => {
    if (!iso) return 'Jamais'
    const d = new Date(iso)
    const diff = Math.round((Date.now() - d.getTime()) / 60000)
    if (diff < 1)   return 'à l\'instant'
    if (diff < 60)  return `il y a ${diff} min`
    if (diff < 1440) return `il y a ${Math.round(diff / 60)}h`
    return d.toLocaleDateString('fr-FR')
  }

  const configs: Record<SyncStatus, { icon: React.ReactNode; text: string; cls: string }> = {
    SUCCESS: {
      icon: <Wifi className="w-3 h-3" />,
      text: `Sync ${fmtDate(lastSyncAt)}`,
      cls:  'text-green-400 bg-green-500/10 border-green-500/20',
    },
    SYNCING: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      text: 'Synchronisation…',
      cls:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    ERROR: {
      icon: <WifiOff className="w-3 h-3" />,
      text: 'Erreur de sync',
      cls:  'text-red-400 bg-red-500/10 border-red-500/20',
    },
    PENDING: {
      icon: <Clock className="w-3 h-3" />,
      text: 'En attente',
      cls:  'text-gray-400 bg-gray-500/10 border-gray-500/20',
    },
  }

  const c = configs[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg border ${c.cls}`}>
      {c.icon}{c.text}
    </span>
  )
}

interface Props {
  compte:    BrokerAccount
  onNavigateToTrades?: (accountId: string) => void
}

export function CompteCard({ compte, onNavigateToTrades }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta     = brokerMeta[compte.brokerType as BrokerType] ?? brokerMeta['MT5']
  const hasError = compte.syncStatus === 'ERROR'

  const { mutate: sync,   isPending: syncing }  = useSyncAccount()
  const { mutate: remove, isPending: deleting }  = useDeleteAccount()

  const handleSync   = () => sync(compte.id)
  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    remove(compte.id)
  }

  return (
    <div className={`bg-[#111827] rounded-xl border transition-all ${
      hasError ? 'border-red-500/30' : 'border-gray-800/60 hover:border-gray-700/60'
    }`}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="p-5 border-b border-gray-800/60">
        <div className="flex items-start justify-between gap-3">
          {/* Logo + infos */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}
            >
              {compte.brokerType === 'MT4' || compte.brokerType === 'MT5'
                ? 'MT'
                : compte.brokerType.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{compte.label}</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-700/60 text-gray-500 bg-gray-800/60">
                  {ACCOUNT_TYPE_LABEL[compte.accountType] ?? compte.accountType}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium" style={{ color: meta.color }}>{meta.name}</span>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-600 font-mono">#{compte.accountId}</span>
              </div>
            </div>
          </div>

          {/* Sync badge + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SyncBadge status={compte.syncStatus} lastSyncAt={compte.lastSyncAt} />

            {/* Sync */}
            <button
              onClick={handleSync}
              disabled={syncing || compte.syncStatus === 'SYNCING'}
              title="Synchroniser maintenant"
              className="w-7 h-7 rounded-lg bg-gray-800/60 hover:bg-indigo-600/20 hover:text-indigo-400 border border-gray-700/40 hover:border-indigo-500/30 flex items-center justify-center text-gray-500 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Voir les trades */}
            <button
              onClick={() => onNavigateToTrades?.(compte.id)}
              title="Voir les trades"
              className="w-7 h-7 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 flex items-center justify-center text-gray-500 hover:text-white transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Déconnecter */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              title={confirmDelete ? 'Confirmer la suppression' : 'Déconnecter ce compte'}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 ${
                confirmDelete
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                  : 'bg-gray-800/60 hover:bg-red-500/10 hover:text-red-400 border-gray-700/40 hover:border-red-500/30 text-gray-500'
              }`}
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Confirmation suppression */}
        {confirmDelete && (
          <div className="mt-3 flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300 flex-1">
              Clique à nouveau sur <strong>Déconnecter</strong> pour confirmer la suppression.
            </p>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Erreur sync */}
        {hasError && compte.syncError && !confirmDelete && (
          <div className="mt-3 flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 flex-1">{compte.syncError}</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-xs font-medium text-red-400 hover:text-red-300 whitespace-nowrap transition-colors disabled:opacity-40"
            >
              Relancer →
            </button>
          </div>
        )}
      </div>

      {/* ── Infos compte ───────────────────────────────── */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Type</p>
          <p className="text-sm font-bold text-white">{meta.name}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{meta.desc}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Compte</p>
          <p className="text-sm font-bold text-white font-mono">#{compte.accountId}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {ACCOUNT_TYPE_LABEL[compte.accountType]}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Connecté le</p>
          <p className="text-sm font-bold text-white">
            {new Date(compte.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {compte.syncStatus === 'SUCCESS'
              ? 'Données à jour'
              : compte.syncStatus === 'PENDING'
                ? 'Sync en attente'
                : compte.syncStatus === 'SYNCING'
                  ? 'Sync en cours…'
                  : 'Sync en erreur'}
          </p>
        </div>
      </div>

      {/* ── Bannière sync requis si jamais synchronisé ── */}
      {compte.syncStatus === 'PENDING' && (
        <div className="mx-5 mb-4 flex items-center justify-between gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <p className="text-xs text-indigo-300">
            Lance la synchronisation pour importer ton historique de trades.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            Synchroniser
          </button>
        </div>
      )}
    </div>
  )
}
