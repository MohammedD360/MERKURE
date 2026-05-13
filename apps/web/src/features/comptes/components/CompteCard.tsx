import {
  RefreshCw, Unlink, ExternalLink, AlertTriangle,
  TrendingUp, TrendingDown, Wifi, WifiOff, Loader2,
} from 'lucide-react'
import { type MockCompte, brokerMeta } from '@/lib/mock-comptes'

interface Props {
  compte: MockCompte
}

function SyncBadge({ status, lastSync }: { status: MockCompte['syncStatus']; lastSync: string }) {
  const configs = {
    SUCCESS: {
      icon: <Wifi className="w-3 h-3" />,
      text: `Synchronisé ${lastSync}`,
      cls: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    SYNCING: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      text: 'Synchronisation…',
      cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    ERROR: {
      icon: <WifiOff className="w-3 h-3" />,
      text: 'Erreur de sync',
      cls: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    PENDING: {
      icon: <Loader2 className="w-3 h-3" />,
      text: 'En attente',
      cls: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    },
  }
  const c = configs[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg border ${c.cls}`}>
      {c.icon}
      {c.text}
    </span>
  )
}

function StatCell({ label, value, sub, color = 'text-white' }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

// Mini bar de performance (win rate)
function WinRateBar({ pct }: { pct: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">Win Rate</span>
        <span className="text-[11px] font-semibold text-white">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function CompteCard({ compte }: Props) {
  const meta = brokerMeta[compte.broker]
  const isProfit = compte.totalPnl >= 0
  const hasError = compte.syncStatus === 'ERROR'

  // USDT/USDC/BTC ne sont pas des codes ISO 4217 — on mappe vers un code valide pour l'affichage
  const ISO_MAP: Record<string, string> = { USDT: 'USD', USDC: 'USD', BTC: 'USD', ETH: 'USD' }
  const displayCurrency = ISO_MAP[compte.currency] ?? compte.currency
  const fmtCur = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 })

  return (
    <div className={`bg-[#111827] rounded-xl border transition-all ${
      hasError ? 'border-red-500/30' : 'border-gray-800/60 hover:border-gray-700/60'
    }`}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="p-5 border-b border-gray-800/60">
        <div className="flex items-start justify-between gap-3">
          {/* Logo broker + infos */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}
            >
              {compte.broker === 'MT4' || compte.broker === 'MT5' ? 'MT' : compte.broker.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{compte.label}</h3>
                {!compte.isActive && (
                  <span className="text-[9px] font-bold bg-gray-700/60 text-gray-400 border border-gray-700/60 px-1.5 py-0.5 rounded">
                    INACTIF
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500" style={{ color: meta.color }}>{meta.name}</span>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-600 font-mono">#{compte.accountId}</span>
                {compte.server && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-600">{compte.server}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badge sync + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SyncBadge status={compte.syncStatus} lastSync={compte.lastSync} />
            <button
              className="w-7 h-7 rounded-lg bg-gray-800/60 hover:bg-indigo-600/20 hover:text-indigo-400 border border-gray-700/40 hover:border-indigo-500/30 flex items-center justify-center text-gray-500 transition-all"
              title="Synchroniser"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-7 h-7 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              title="Voir les trades"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-7 h-7 rounded-lg bg-gray-800/60 hover:bg-red-500/10 hover:text-red-400 border border-gray-700/40 hover:border-red-500/30 flex items-center justify-center text-gray-500 transition-all"
              title="Déconnecter"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Erreur */}
        {hasError && compte.syncError && (
          <div className="mt-3 flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{compte.syncError}</p>
            <button className="ml-auto text-xs font-medium text-red-400 hover:text-red-300 whitespace-nowrap transition-colors">
              Reconnecter →
            </button>
          </div>
        )}
      </div>

      {/* ── Métriques principales ───────────────────────── */}
      <div className="px-5 py-4 grid grid-cols-4 gap-4 border-b border-gray-800/60">
        <StatCell
          label="Solde"
          value={fmtCur(compte.balance)}
          sub={`Équité ${fmtCur(compte.equity)}`}
        />
        <StatCell
          label="P&L Total"
          value={`${isProfit ? '+' : ''}${fmtCur(compte.totalPnl)}`}
          sub={`${isProfit ? '+' : ''}${compte.totalPnlPct.toFixed(1)}%`}
          color={isProfit ? 'text-green-400' : 'text-red-400'}
        />
        <StatCell
          label="Marge libre"
          value={fmtCur(compte.freeMargin)}
          sub={`Levier 1:${compte.leverage}`}
        />
        <StatCell
          label="Trades"
          value={compte.totalTrades.toString()}
          sub={`Depuis le ${compte.connectedAt}`}
        />
      </div>

      {/* ── Win Rate + devise ──────────────────────────── */}
      <div className="px-5 py-4 grid grid-cols-3 gap-6 items-center">
        <div className="col-span-2">
          <WinRateBar pct={compte.winRate} />
        </div>

        {/* Indicateur P&L visuel */}
        <div className={`flex items-center gap-2 justify-end ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {isProfit
            ? <TrendingUp className="w-4 h-4" />
            : <TrendingDown className="w-4 h-4" />
          }
          <span className="text-sm font-bold font-mono">
            {isProfit ? '+' : ''}{compte.totalPnlPct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-600">depuis connexion</span>
        </div>
      </div>
    </div>
  )
}
