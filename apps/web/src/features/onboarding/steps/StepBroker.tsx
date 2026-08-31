'use client'

import { useState } from 'react'
import { ChevronRight, ArrowLeft, Eye, EyeOff, Lock, SkipForward } from 'lucide-react'
import type { BrokerPayload } from '../api'
import { BrokerLogo } from '@/shared/components/BrokerLogo'

type BrokerType = 'MT5' | 'MT4'

// Seuls MT4/MT5 disposent d'une synchronisation automatique fiable (MetaAPI) —
// voir l'audit de la synchro par compte.
const BROKERS: { id: BrokerType; name: string; desc: string }[] = [
  { id: 'MT5', name: 'MetaTrader 5', desc: 'Forex, indices, matières premières' },
  { id: 'MT4', name: 'MetaTrader 4', desc: 'Forex classique' },
]

interface FormState {
  label:     string
  accountId: string
  password:  string
  server:    string
}

interface Props {
  onConnect: (payload: BrokerPayload) => void
  onSkip:    () => void
  loading?:  boolean
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
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
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
      {hint && <p className="text-xs text-muted-foreground/60 mt-1">{hint}</p>}
    </div>
  )
}

export function StepBroker({ onConnect, onSkip, loading }: Props) {
  const [selected, setSelected] = useState<BrokerType | null>(null)
  const [form, setForm] = useState<FormState>({
    label: '', accountId: '', password: '', server: '',
  })

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleConnect = () => {
    if (!selected) return
    onConnect({
      brokerType:  selected,
      accountType: 'LIVE',
      accountId:   form.accountId,
      label:       form.label || `${selected} — compte principal`,
      credentials: {
        accountId:   form.accountId,
        upass:       form.password,
        tradeserver: form.server,
        platform:    selected.toLowerCase(),
      },
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
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Changer de broker
      </button>

      <div className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
        <BrokerLogo broker={broker.id} />
        <div>
          <p className="text-sm font-semibold text-foreground">{broker.name}</p>
          <p className="text-xs text-muted-foreground">{broker.desc}</p>
        </div>
      </div>

      <Field label="Libellé du compte" value={form.label} onChange={set('label')}
        placeholder={`Ex : ${broker.name} Principal`} />

      <Field label="Numéro de compte MT" value={form.accountId} onChange={set('accountId')} placeholder="Ex : 1234567" />
      <Field label="Mot de passe" value={form.password} onChange={set('password')} placeholder="••••••••" type="password"
        hint="Utilisez le mot de passe en lecture seule pour plus de sécurité." />
      <Field label="Serveur MetaTrader" value={form.server} onChange={set('server')} placeholder="Ex : Pepperstone-MT5" />

      <div className="flex items-start gap-2">
        <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--primary))]" />
        <span className="text-xs text-muted-foreground/60">
          Identifiants chiffrés AES-256. MERKURE ne peut jamais placer d&apos;ordres en votre nom.
        </span>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(243_90%_58%)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
