'use client'

import { useState, type ReactNode } from 'react'
import {
  Plus, RefreshCw, Wallet, TrendingUp, ShieldAlert, BarChart2,
} from 'lucide-react'
import { CompteCard } from './components/CompteCard'
import { ConnectBrokerModal } from './components/ConnectBrokerModal'
import { mockComptes } from '@/lib/mock-comptes'

function GlobalKpi({ icon, label, value, sub, color = 'text-white' }: {
  icon: ReactNode; label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold font-mono mt-0.5 ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function ComptesPage() {
  const [modalOpen, setModalOpen] = useState(false)

  // Agrégats globaux sur tous les comptes actifs
  const actifs = mockComptes.filter((c) => c.syncStatus !== 'ERROR')
  const totalBalance = actifs.reduce((s, c) => s + c.balance, 0)
  const totalPnl = mockComptes.reduce((s, c) => s + c.totalPnl, 0)
  const totalTrades = mockComptes.reduce((s, c) => s + c.totalTrades, 0)
  const avgWinRate = mockComptes.length
    ? mockComptes.reduce((s, c) => s + c.winRate, 0) / mockComptes.length
    : 0

  const fmt = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <>
      <div className="px-6 py-5 space-y-5">
        {/* ── Header page ─────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Mes Comptes</h2>
            <p className="text-xs text-gray-500 mt-1">
              {mockComptes.length} compte{mockComptes.length > 1 ? 's' : ''} connecté{mockComptes.length > 1 ? 's' : ''} ·{' '}
              {actifs.length} actif{actifs.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/40 text-xs text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Tout synchroniser
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Connecter un broker
            </button>
          </div>
        </div>

        {/* ── KPIs globaux ────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <GlobalKpi
            icon={<Wallet className="w-5 h-5" />}
            label="Solde total (tous comptes)"
            value={fmt(totalBalance)}
            sub={`${mockComptes.length} comptes agrégés`}
          />
          <GlobalKpi
            icon={<TrendingUp className="w-5 h-5" />}
            label="P&L total"
            value={`${totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)}`}
            sub="Depuis connexion"
            color={totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <GlobalKpi
            icon={<BarChart2 className="w-5 h-5" />}
            label="Trades total"
            value={totalTrades.toString()}
            sub={`Win Rate moy. ${avgWinRate.toFixed(0)}%`}
          />
          <GlobalKpi
            icon={<ShieldAlert className="w-5 h-5" />}
            label="Comptes en erreur"
            value={`${mockComptes.filter((c) => c.syncStatus === 'ERROR').length}`}
            sub="Reconnecter pour reprendre le suivi"
            color={mockComptes.some((c) => c.syncStatus === 'ERROR') ? 'text-red-400' : 'text-green-400'}
          />
        </div>

        {/* ── Liste des comptes ────────────────────────── */}
        <div className="space-y-4">
          {mockComptes.map((compte) => (
            <CompteCard key={compte.id} compte={compte} />
          ))}
        </div>

        {/* ── Empty state si aucun compte ──────────────── */}
        {mockComptes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Aucun compte connecté</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Connecte ton premier compte broker pour commencer à suivre tes performances en temps réel.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
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
