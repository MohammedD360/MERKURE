import type { BrokerType } from '@/lib/hooks/use-accounts'

export const brokerMeta: Record<BrokerType, { name: string; color: string; bg: string; desc: string }> = {
  MT4:       { name: 'MetaTrader 4',        color: '#3b82f6', bg: '#1d4ed820', desc: 'Connexion via MetaAPI' },
  MT5:       { name: 'MetaTrader 5',        color: '#6366f1', bg: '#4f46e520', desc: 'Connexion via MetaAPI' },
  BINANCE:   { name: 'Binance',             color: '#f59e0b', bg: '#78350f20', desc: 'API Key + Secret' },
  IB:        { name: 'Interactive Brokers', color: '#22c55e', bg: '#14532d20', desc: 'Connexion TWS API' },
  CTRADER:   { name: 'cTrader',             color: '#06b6d4', bg: '#0e7490/10', desc: 'Open API cTrader' },
  TRADOVATE: { name: 'Tradovate',           color: '#f97316', bg: '#7c2d1220', desc: 'Futures — Apex Trader Funding' },
}
