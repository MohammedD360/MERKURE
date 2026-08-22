export interface TradeData {
  externalId: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  openTime: Date
  closeTime: Date | null
  openPrice: number | null
  closePrice: number | null
  lotSize: number
  pnl: number | null
  swap: number
  commission: number
  status: 'OPEN' | 'CLOSED'
}

export interface AccountInfo {
  balance: number
  equity: number
  currency: string
}

export interface BrokerAdapter {
  connect(credentials: Record<string, string>): Promise<void>
  getAccountInfo(): Promise<AccountInfo>
  getTradeHistory(from: Date, to: Date): Promise<TradeData[]>
  /** Libère les ressources distantes. Peut être asynchrone (ex. undeploy MetaAPI). */
  disconnect(): void | Promise<void>

  /**
   * Identifiant du compte chez le fournisseur de données, connu après `connect()`.
   * Persisté par le worker pour éviter de rechercher le compte à chaque synchro,
   * et pour pouvoir le supprimer chez le fournisseur à la déconnexion du client.
   */
  providerAccountId?(): string | null

  /** Supprime le compte chez le fournisseur. Sans effet si non applicable. */
  deleteRemoteAccount?(providerAccountId: string): Promise<void>
}
