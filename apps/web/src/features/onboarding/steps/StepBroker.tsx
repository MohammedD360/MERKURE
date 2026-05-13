'use client'

import { useState } from 'react'
import { ChevronRight, ArrowLeft, Eye, EyeOff, Lock, SkipForward } from 'lucide-react'
import type { BrokerPayload } from '../api'

type BrokerType = 'MT5' | 'MT4' | 'BINANCE' | 'IB' | 'CTRADER'

const BROKERS: { id: BrokerType; name: string; desc: string; bg: string; color: string }[] = [
  { id: 'MT5', name: 'MetaTrader 5', desc: 'Forex, indices, matières premières', bg: '#1a2744', color: '#4f8ef7' },
  { id: 'MT4', name: 'MetaTrader 4', desc: 'Forex classique', bg: '#1a2744', color: '#4f8ef7' },
  { id: 'BINANCE', name: 'Binance', desc: 'Crypto spot & futures', bg: '#261f00', color: '#f0b90b' },
  { id: 'IB', name: 'Interactive Brokers', desc: 'Actions, options, obligations', bg: '#001a12', color: '#00c080' },
  { id: 'CTRADER', name: 'cTrader', desc: 'Forex, CFDs', bg: '#1a1a2e', color: '#a855f7' },
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
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-600 mt-1">{hint}</p>}
    </div>
  )
}

export function StepBroker({ onConnect, onSkip }: Props) {
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
        <p className="text-sm text-gray-400 mb-4">
          Connecte ton broker pour synchroniser automatiquement tes trades.
          Tu pourras en ajouter d'autres plus tard.
        </p>
        {BROKERS.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b.id)}
            className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-gray-700/40 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: b.bg, color: b.color, border: `1px solid ${b.color}40` }}>
              {b.id === 'MT4' || b.id === 'MT5' ? 'MT' : b.id.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{b.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{b.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </button>
        ))}
        <button onClick={onSkip}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-300 transition-colors mt-2">
          <SkipForward className="w-4 h-4" />
          Passer cette étape
        </button>
      </div>
    )
  }

  const broker = BROKERS.find((b) => b.id === selected)!

  return (
    <div className="space-y-5">
      <button onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Changer de broker
      </button>

      <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: broker.bg, color: broker.color, border: `1px solid ${broker.color}40` }}>
          {broker.id === 'MT4' || broker.id === 'MT5' ? 'MT' : broker.id.slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{broker.name}</p>
          <p className="text-[11px] text-gray-500">{broker.desc}</p>
        </div>
      </div>

      <Field label="Libellé du compte" value={form.label} onChange={set('label')}
        placeholder={`Ex : ${broker.name} Principal`} />

      {(selected === 'MT4' || selected === 'MT5') && <>
        <Field label="Numéro de compte MT" value={form.accountId} onChange={set('accountId')} placeholder="Ex : 1234567" />
        <Field label="Mot de passe" value={form.password} onChange={set('password')} placeholder="••••••••" type="password"
          hint="Utilise le mot de passe en lecture seule pour plus de sécurité." />
        <Field label="Serveur MetaTrader" value={form.server} onChange={set('server')} placeholder="Ex : Pepperstone-MT5" />
      </>}

      {selected === 'BINANCE' && <>
        <Field label="API Key" value={form.apiKey} onChange={set('apiKey')} placeholder="Clé API Binance" />
        <Field label="API Secret" value={form.apiSecret} onChange={set('apiSecret')} placeholder="Secret API" type="password"
          hint="Crée une clé en lecture seule depuis Paramètres → Gestion des API." />
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

      <div className="flex items-start gap-2 text-[11px] text-gray-600">
        <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
        Identifiants chiffrés AES-256. MERKURE ne peut jamais placer d'ordres en ton nom.
      </div>

      <button onClick={handleConnect}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">
        Connecter le compte
      </button>
      <button onClick={onSkip}
        className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Passer cette étape
      </button>
    </div>
  )
}
