'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useMarketQuotes, type Quote } from '@/lib/hooks/use-market-data'
import { cn } from '@/lib/utils'

const LABELS: Record<string, string> = {
  XAUUSD: 'Or (XAU/USD)',
  NAS100: 'Nasdaq 100',
}

function QuoteChip({ quote }: { quote: Quote }) {
  const isUp = quote.change >= 0

  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
      <span className="text-sm font-medium text-foreground">{LABELS[quote.symbol] ?? quote.symbol}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {quote.price.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
      </span>
      <span
        className={cn(
          'flex items-center gap-1 text-xs font-medium tabular-nums',
          isUp ? 'text-green-500' : 'text-red-500',
        )}
      >
        {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {isUp ? '+' : ''}{quote.percentChange.toFixed(2)} %
      </span>
    </div>
  )
}

/**
 * Cotations live (Twelve Data). Composant silencieux : pas de clé configurée
 * ou erreur de fournisseur → rien ne s'affiche, le dashboard reste intact.
 */
export function MarketTicker() {
  const { data } = useMarketQuotes()

  if (!data?.configured || data.quotes.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      {data.quotes.map((q) => (
        <QuoteChip key={q.symbol} quote={q} />
      ))}
    </div>
  )
}
