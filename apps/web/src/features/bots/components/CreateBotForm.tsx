'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Wallet, SlidersHorizontal, Rocket } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateBot, type BotMode } from '@/lib/hooks/use-bots'

const CATEGORIES = ['Crypto', 'Économie', 'Politique', 'Sport']

export function CreateBotForm() {
  const router = useRouter()
  const createBot = useCreateBot()

  const [name, setName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [minLiquidityUsd, setMinLiquidityUsd] = useState(5_000)
  const [maxMarkets, setMaxMarkets] = useState(3)
  const [maxSessionLossPct, setMaxSessionLossPct] = useState(5)
  const [maxPositionSizeUsd, setMaxPositionSizeUsd] = useState(100)
  const [maxConcurrentPositions, setMaxConcurrentPositions] = useState(3)
  const [mode, setMode] = useState<BotMode>('DRY_RUN')
  const [sessionStartEquity, setSessionStartEquity] = useState(1_000)
  const [liveConfirmed, setLiveConfirmed] = useState(false)

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  const canSubmit =
    name.trim().length > 0 &&
    walletAddress.trim().length > 0 &&
    privateKey.trim().length > 0 &&
    (mode === 'DRY_RUN' || liveConfirmed)

  async function handleSubmit() {
    const bot = await createBot.mutateAsync({
      name: name.trim(),
      walletAddress: walletAddress.trim(),
      privateKey: privateKey.trim(),
      mode,
      marketFilters: { categories, minLiquidityUsd, maxMarkets },
      riskConfig: { maxSessionLossPct, maxPositionSizeUsd, maxConcurrentPositions },
      sessionStartEquity,
    })
    if (bot) router.push('/app/bots')
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card">
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
          <Wallet className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm font-black uppercase tracking-wider text-white/70">1. Wallet Polymarket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bot-name" className="text-xs text-white/60">Nom du bot</Label>
            <Input id="bot-name" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Whale Tracker BTC" className="mt-1 border-[hsl(var(--border))] bg-white/5 text-white" />
          </div>
          <div>
            <Label htmlFor="wallet-address" className="text-xs text-white/60">Adresse wallet (Polygon)</Label>
            <Input id="wallet-address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..." className="mt-1 border-[hsl(var(--border))] bg-white/5 font-mono-terminal text-white" />
          </div>
          <div>
            <Label htmlFor="private-key" className="text-xs text-white/60">Clé privée</Label>
            <Input id="private-key" type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x..." className="mt-1 border-[hsl(var(--border))] bg-white/5 font-mono-terminal text-white" />
            <p className="mt-1.5 text-[11px] text-white/40">
              Chiffrée (AES-256-GCM) avant stockage, jamais renvoyée au navigateur.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
          <SlidersHorizontal className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm font-black uppercase tracking-wider text-white/70">2. Marchés &amp; risque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-white/60">Catégories suivies (vide = toutes)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => toggleCategory(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    categories.includes(c)
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.18)] text-[hsl(var(--primary))]'
                      : 'border-white/15 text-white/50 hover:border-white/30'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/60">Liquidité min. (USD)</Label>
              <Input type="number" value={minLiquidityUsd} onChange={(e) => setMinLiquidityUsd(Number(e.target.value))}
                className="mt-1 border-[hsl(var(--border))] bg-white/5 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Marchés max. analysés</Label>
              <Input type="number" value={maxMarkets} onChange={(e) => setMaxMarkets(Number(e.target.value))}
                className="mt-1 border-[hsl(var(--border))] bg-white/5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.06)] p-3">
            <div>
              <Label className="flex items-center gap-1 text-xs text-white/70">
                <ShieldAlert className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" /> Perte max. session (%)
              </Label>
              <Input type="number" value={maxSessionLossPct} onChange={(e) => setMaxSessionLossPct(Number(e.target.value))}
                className="mt-1 border-[hsl(var(--destructive)/0.3)] bg-white/5 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/70">Taille max. position (USD)</Label>
              <Input type="number" value={maxPositionSizeUsd} onChange={(e) => setMaxPositionSizeUsd(Number(e.target.value))}
                className="mt-1 border-[hsl(var(--destructive)/0.3)] bg-white/5 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/70">Positions concurrentes max.</Label>
              <Input type="number" value={maxConcurrentPositions} onChange={(e) => setMaxConcurrentPositions(Number(e.target.value))}
                className="mt-1 border-[hsl(var(--destructive)/0.3)] bg-white/5 text-white" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-white/60">Capital de départ (USD, pour le calcul du circuit breaker)</Label>
            <Input type="number" value={sessionStartEquity} onChange={(e) => setSessionStartEquity(Number(e.target.value))}
              className="mt-1 max-w-xs border-[hsl(var(--border))] bg-white/5 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
          <Rocket className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm font-black uppercase tracking-wider text-white/70">3. Mode de lancement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMode('DRY_RUN')}
              className={`rounded-lg border p-3 text-left transition-colors ${
                mode === 'DRY_RUN' ? 'border-[hsl(var(--chart-win))] bg-[hsl(var(--chart-win)/0.1)]' : 'border-white/15 hover:border-white/30'
              }`}>
              <p className="text-sm font-bold text-white">Dry-run (recommandé)</p>
              <p className="mt-1 text-xs text-white/50">Paper trading — aucun fonds réel engagé.</p>
            </button>
            <button type="button" onClick={() => setMode('LIVE')}
              className={`rounded-lg border p-3 text-left transition-colors ${
                mode === 'LIVE' ? 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)]' : 'border-white/15 hover:border-white/30'
              }`}>
              <p className="text-sm font-bold text-white">Live</p>
              <p className="mt-1 text-xs text-white/50">Ordres réels — fonds réellement engagés.</p>
            </button>
          </div>

          {mode === 'LIVE' && (
            <label className="flex items-start gap-2 rounded-lg border border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.08)] p-3 text-xs text-white/80">
              <input type="checkbox" checked={liveConfirmed} onChange={(e) => setLiveConfirmed(e.target.checked)} className="mt-0.5" />
              Je comprends que ce bot engagera des fonds réels via la wallet connectée et respecte le risque de perte totale du capital alloué.
            </label>
          )}

          <Button onClick={handleSubmit} disabled={!canSubmit || createBot.isPending}
            className="w-full bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.85)]">
            {createBot.isPending ? 'Création...' : 'Créer le bot'}
          </Button>
          {createBot.isError && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              {createBot.error instanceof Error ? createBot.error.message : 'Erreur lors de la création.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
