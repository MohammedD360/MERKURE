export type BrokerType = 'MT4' | 'MT5' | 'BINANCE' | 'IB' | 'CTRADER'
export type SyncStatus = 'SUCCESS' | 'SYNCING' | 'ERROR' | 'PENDING'

export interface MockCompte {
  id: string
  label: string
  broker: BrokerType
  accountId: string
  server?: string
  currency: string
  balance: number
  equity: number
  margin: number
  freeMargin: number
  leverage: number
  totalPnl: number
  totalPnlPct: number
  totalTrades: number
  winRate: number
  syncStatus: SyncStatus
  lastSync: string
  connectedAt: string
  isActive: boolean
  syncError?: string
}

export const mockComptes: MockCompte[] = [
  {
    id: '1',
    label: 'Compte Principal Forex',
    broker: 'MT5',
    accountId: '1234567',
    server: 'Pepperstone-MT5',
    currency: 'USD',
    balance: 12_450.80,
    equity: 12_680.20,
    margin: 320.00,
    freeMargin: 12_360.20,
    leverage: 100,
    totalPnl: 2_450.80,
    totalPnlPct: 24.5,
    totalTrades: 47,
    winRate: 64,
    syncStatus: 'SUCCESS',
    lastSync: 'il y a 3 min',
    connectedAt: '12/01/2024',
    isActive: true,
  },
  {
    id: '2',
    label: 'Compte Crypto Binance',
    broker: 'BINANCE',
    accountId: 'binance_xxxx_1829',
    currency: 'USDT',
    balance: 4_210.50,
    equity: 4_210.50,
    margin: 0,
    freeMargin: 4_210.50,
    leverage: 10,
    totalPnl: 710.50,
    totalPnlPct: 20.3,
    totalTrades: 18,
    winRate: 72,
    syncStatus: 'SUCCESS',
    lastSync: 'il y a 1 min',
    connectedAt: '03/03/2024',
    isActive: true,
  },
  {
    id: '3',
    label: 'Compte Indices MT4',
    broker: 'MT4',
    accountId: '9876543',
    server: 'XTB-MT4-2',
    currency: 'EUR',
    balance: 8_900.00,
    equity: 8_900.00,
    margin: 0,
    freeMargin: 8_900.00,
    leverage: 200,
    totalPnl: -100.00,
    totalPnlPct: -1.1,
    totalTrades: 12,
    winRate: 50,
    syncStatus: 'ERROR',
    lastSync: 'il y a 2h',
    connectedAt: '20/03/2024',
    isActive: false,
    syncError: 'Token expiré — reconnexion requise via MetaAPI',
  },
]

export const brokerMeta: Record<BrokerType, { name: string; color: string; bg: string; desc: string }> = {
  MT4: { name: 'MetaTrader 4', color: '#3b82f6', bg: '#1d4ed820',  desc: 'Connexion via MetaAPI' },
  MT5: { name: 'MetaTrader 5', color: '#6366f1', bg: '#4f46e520', desc: 'Connexion via MetaAPI' },
  BINANCE: { name: 'Binance',  color: '#f59e0b', bg: '#78350f20', desc: 'API Key + Secret' },
  IB: { name: 'Interactive Brokers', color: '#22c55e', bg: '#14532d20', desc: 'Connexion TWS API' },
  CTRADER: { name: 'cTrader', color: '#06b6d4', bg: '#0e7490/10', desc: 'Open API cTrader' },
}
