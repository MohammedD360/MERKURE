export type BrokerType = 'mt4' | 'mt5' | 'binance' | 'ib' | 'ctrader'
export type SyncStatus = 'pending' | 'syncing' | 'success' | 'error'

export interface BrokerAccount {
  id: string
  userId: string
  brokerType: BrokerType
  accountId: string          // ID externe chez le broker
  label: string
  isActive: boolean
  lastSyncAt?: string
  syncStatus: SyncStatus
  syncError?: string
  createdAt: string
}

export interface ConnectBrokerPayload {
  brokerType: BrokerType
  label: string
  credentials: {
    // MT4/MT5 via MetaAPI
    metaApiAccountId?: string
    // Binance
    apiKey?: string
    apiSecret?: string
    // IB
    accountNumber?: string
    // cTrader
    clientId?: string
    clientSecret?: string
    accessToken?: string
  }
}

export interface AccountInfo {
  balance: number
  equity: number
  margin: number
  freeMargin: number
  currency: string
  leverage: number
  server?: string
}
