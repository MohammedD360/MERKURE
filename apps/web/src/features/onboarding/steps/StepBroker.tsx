'use client'

import { useState } from 'react'
import { ChevronRight, ArrowLeft, Eye, EyeOff, Lock, SkipForward } from 'lucide-react'
import type { BrokerPayload } from '../api'
import { BrokerLogo } from '@/shared/components/BrokerLogo'

type BrokerType = 'MT5' | 'MT4' | 'BINANCE' | 'IB' | 'CTRADER'

const BROKERS: { id: BrokerType; name: string; desc: string }[] = [
  { id: 'MT5',     name: 'MetaTrader 5',         desc: 'Forex, indices, matières premières' },
  { id: 'MT4',     name: 'MetaTrader 4',          desc: 'Forex classique' },
  { id: 'IB',      name: 'Interactive Brokers',   desc: 'Actions, options, obligations' },
  { id: 'CTRADER', name: 'cTrader',               desc: 'Forex, CFDs' },
]

const COMING_SOON: { id: BrokerType; name: string; desc: string }[] = [
  { id: 'BINANCE', name: 'Binance', desc: 'Crypto spot & futures' },
]

interface FormState {
  label: string
  accountId: string
  password: string
  server: string
  apiKey: string
  apiSecret: string
  port: string
  clientId: string
  clientSecret: string
}

interface Props {
  onConnect: (payload: BrokerPayload) => void
  onSkip: () => void
  loading?: boolean
}

function Field({
  label, value, onChange, placeholder, type = 'text', hint,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; hint?: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 rounded-lg border border-[hsl(var(--border))] bg-background px-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--accent))] transition-all"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/60 mt-1">{hint}</p>}
    </div>
  )
}

export function StepBroker({ onConnect, onSkip, loading }: Props) {
  const [selected, setSelected] = useState<BrokerType | null>(null)
  const [form, setForm] = useState<FormState>({
    label: '', accountId: '', password: '', server: '',
    apiKey: '', apiSecret: '', port: '', clientId: '', clientSecret: '',
  })

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleConnect = () => {
    if (!selected) return
    const credentials: Record<string, string> = {}
    if (selected === 'MT4' || selected === 'MT5') {
      credentials.password = form.password
      credentials.server = form.server
    } else if (selected === 'BINANCE') {
      credentials.apiKey = form.apiKey
      credentials.apiSecret = form.apiSecret
    } else if (selected === 'IB') {
      credentials.port = form.port
    } else {
      credentials.clientId = form.clientId
      credentials.clientSecret = form.clientSecret
    }
    onConnect({
      brokerType: selected,
      accountType: 'LIVE',
      accountId: form.accountId,
      label: form.label || `${selected} — compte principal`,
      credentials,
    })
  }

  if (!selected) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground mb-4">
          Connectez votre broker pour synchroniser automatiquement vos trades.
          Vous pourrez en ajouter d&apos;autres plus tard.
        </p>
            {BROKERS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-[hsl(var(--border))] bg-background hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-all group text-left"
              >
                <BrokerLogo broker={b.id} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{b.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
              </button>
            ))}
            {COMING_SOON.map((b) => (
              <div
                key={b.id}
                className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-[hsl(var(--border))] bg-background opacity-50 cursor-not-allowed"
              >
                <BrokerLogo broker={b.id} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-muted-foreground">{b.name}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{b.desc}</div>
                </div>
                <span className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Bientôt
                </span>
              </div>
            ))}
        <button
          onClick={onSkip}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-2"
        >
          <SkipForward className="w-4 h-4" />
          Passer cette étape
        </button>
      </div>
    )
  }

  const broker = BROKERS.find((b) => b.id === selected)!

  return (
    <div className="space-y-5">
      <button
        onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Changer de broker
      </button>

      <div className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
        <BrokerLogo broker={broker.id} />
        <div>
          <p className="text-sm font-semibold text-foreground">{broker.name}</p>
          <p className="text-[11px] text-muted-foreground">{broker.desc}</p>
        </div>
      </div>

      <Field label="Libellé du compte" value={form.label} onChange={set('label')}
        placeholder={`Ex : ${broker.name} Principal`} />

      {(selected === 'MT4' || selected === 'MT5') && <>
        <Field label="Numéro de compte MT" value={form.accountId} onChange={set('accountId')} placeholder="Ex : 1234567" />
        <Field label="Mot de passe" value={form.password} onChange={set('password')} placeholder="••••••••" type="password"
          hint="Utilisez le mot de passe en lecture seule pour plus de sécurité." />
        <Field label="Serveur MetaTrader" value={form.server} onChange={set('server')} placeholder="Ex : Pepperstone-MT5" />
      </>}

      {selected === 'BINANCE' && <>
        <Field label="API Key" value={form.apiKey} onChange={set('apiKey')} placeholder="Clé API Binance" />
        <Field label="API Secret" value={form.apiSecret} onChange={set('apiSecret')} placeholder="Secret API" type="password"
          hint="Créez une clé en lecture seule depuis Paramètres → Gestion des API." />
        <input type="hidden" value="binance_main" readOnly />
      </>}

      {selected === 'IB' && <>
        <Field label="Numéro de compte IB" value={form.accountId} onChange={set('accountId')} placeholder="Ex : U1234567" />
        <Field label="Port TWS/Gateway" value={form.port} onChange={set('port')} placeholder="7497 (live) ou 7496 (paper)" />
      </>}

      {selected === 'CTRADER' && <>
        <Field label="Client ID" value={form.clientId} onChange={set('clientId')} placeholder="ID cTrader Open API" />
        <Field label="Client Secret" value={form.clientSecret} onChange={set('clientSecret')} placeholder="••••••••" type="password" />
      </>}

      <div className="flex items-start gap-2">
        <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--primary))]" />
        <span className="text-[11px] text-muted-foreground/60">
          Identifiants chiffrés AES-256. MERKURE ne peut jamais placer d&apos;ordres en votre nom.
        </span>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full h-11 rounded-lg text-sm font-black text-white bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        Connecter le compte
      </button>
      <button
        onClick={onSkip}
        className="w-full py-2 text-xs font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        Passer cette étape
      </button>
    </div>
  )
}
