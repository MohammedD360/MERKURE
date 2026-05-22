'use client'

import { useState } from 'react'
import { X, ChevronRight, ArrowLeft, Eye, EyeOff, Check, Lock, AlertCircle } from 'lucide-react'
import { brokerMeta } from '@/lib/mock-comptes'
import { useCreateAccount, type BrokerType, type AccountType } from '@/lib/hooks/use-accounts'

interface Props {
  open:    boolean
  onClose: () => void
}

type Step = 'choose' | 'form' | 'success'

const BROKERS: BrokerType[] = ['MT5', 'MT4', 'BINANCE', 'IB', 'CTRADER']

function BrokerIcon({ broker }: { broker: BrokerType }) {
  const meta = brokerMeta[broker]
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}
    >
      {broker === 'MT4' || broker === 'MT5' ? 'MT' : broker.slice(0, 2)}
    </div>
  )
}

interface FormState {
  label:       string
  accountId:   string
  accountType: AccountType
  password:    string
  server:      string
  apiKey:      string
  apiSecret:   string
  port:        string
  clientId:    string
  clientSecret:string
}

const DEFAULT_FORM: FormState = {
  label: '', accountId: '', accountType: 'LIVE',
  password: '', server: '',
  apiKey: '', apiSecret: '',
  port: '7497',
  clientId: '', clientSecret: '',
}

function Field({
  label, value, onChange, placeholder, type = 'text', hint, showToggle,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; hint?: string; showToggle?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {showToggle && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-600 mt-1">{hint}</p>}
    </div>
  )
}

function AccountTypeSelect({ value, onChange }: { value: AccountType; onChange: (v: AccountType) => void }) {
  const options: { value: AccountType; label: string }[] = [
    { value: 'LIVE',           label: 'Live' },
    { value: 'DEMO',           label: 'Demo' },
    { value: 'PROP_FUNDED',    label: 'Prop Funded' },
    { value: 'PROP_CHALLENGE', label: 'Prop Challenge' },
  ]
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Type de compte</label>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-2 rounded-lg text-xs font-medium transition-all border ${
              value === opt.value
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-gray-800/40 border-gray-700/40 text-gray-500 hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function BrokerFormFields({ broker, form, setForm }: {
  broker: BrokerType
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const set = (key: keyof FormState) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  const common = (
    <>
      <Field label="Libellé du compte"   value={form.label}     onChange={set('label')}     placeholder="Ex : Compte Principal Forex" />
      <AccountTypeSelect value={form.accountType} onChange={v => setForm(f => ({ ...f, accountType: v }))} />
    </>
  )

  if (broker === 'MT4' || broker === 'MT5') return (
    <div className="space-y-4">
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
        <p className="text-xs text-indigo-300 leading-relaxed">
          Tes identifiants sont chiffrés AES-256 et servent uniquement à lire ton historique.
          Utilise le <span className="font-semibold">mot de passe investisseur</span> (lecture seule) de préférence.
        </p>
      </div>
      {common}
      <Field label="Numéro de compte MT4" value={form.accountId} onChange={set('accountId')} placeholder="Ex : 1234567" />
      <Field label="Mot de passe investisseur" value={form.password} onChange={set('password')} placeholder="••••••••" showToggle hint="Utilise le mot de passe investisseur (lecture seule) de ton compte MT4." />
      <Field label="Serveur du broker" value={form.server} onChange={set('server')} placeholder="Ex : PepperstoneUK-Demo03" hint="Nom du serveur MT4 tel qu'il apparaît dans ton terminal (ex: PepperstoneUK-Demo03, ICMarkets-Demo)." />
    </div>
  )

  if (broker === 'BINANCE') return (
    <div className="space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
        <p className="text-xs text-amber-300 leading-relaxed">
          Crée une clé API Binance en <span className="font-semibold">lecture seule</span> depuis Paramètres → Gestion des API.
        </p>
      </div>
      {common}
      <Field label="Account ID / UID"   value={form.accountId} onChange={set('accountId')} placeholder="Ton UID Binance" />
      <Field label="API Key"            value={form.apiKey}    onChange={set('apiKey')}    placeholder="Colle ta clé API ici" />
      <Field label="API Secret"         value={form.apiSecret} onChange={set('apiSecret')} placeholder="Colle ton secret API ici" showToggle />
    </div>
  )

  if (broker === 'IB') return (
    <div className="space-y-4">
      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
        <p className="text-xs text-green-300 leading-relaxed">
          Connexion via l'API TWS. Assure-toi que TWS ou IB Gateway est ouvert et que l'accès API est activé.
        </p>
      </div>
      {common}
      <Field label="Numéro de compte IB" value={form.accountId} onChange={set('accountId')} placeholder="Ex : U1234567" />
      <Field label="Port TWS"            value={form.port}      onChange={set('port')}       placeholder="7497 (live) ou 7496 (paper)" />
    </div>
  )

  return (
    <div className="space-y-4">
      {common}
      <Field label="Account ID"    value={form.accountId}    onChange={set('accountId')}    placeholder="Ton identifiant cTrader" />
      <Field label="Client ID"     value={form.clientId}     onChange={set('clientId')}     placeholder="Open API Client ID" />
      <Field label="Client Secret" value={form.clientSecret} onChange={set('clientSecret')} placeholder="••••••••" showToggle />
    </div>
  )
}

function buildCredentials(broker: BrokerType, form: FormState): Record<string, string> {
  if (broker === 'MT4' || broker === 'MT5') {
    return {
      accountId:   form.accountId,
      upass:       form.password,
      tradeserver: form.server,
      platform:    broker.toLowerCase(),
    }
  }
  if (broker === 'BINANCE') {
    return { apiKey: form.apiKey, apiSecret: form.apiSecret }
  }
  if (broker === 'IB') {
    return { port: form.port }
  }
  return { clientId: form.clientId, clientSecret: form.clientSecret }
}

export function ConnectBrokerModal({ open, onClose }: Props) {
  const [step,     setStep]     = useState<Step>('choose')
  const [selected, setSelected] = useState<BrokerType | null>(null)
  const [form,     setForm]     = useState<FormState>(DEFAULT_FORM)

  const { mutate: createAccount, isPending, error } = useCreateAccount()

  if (!open) return null

  const handleClose = () => {
    setStep('choose'); setSelected(null); setForm(DEFAULT_FORM); onClose()
  }

  const isFormValid = (): boolean => {
    if (!selected) return false
    if (!form.label.trim() || !form.accountId.trim()) return false
    if ((selected === 'MT4' || selected === 'MT5') && !form.password.trim()) return false
    if (selected === 'BINANCE' && (!form.apiKey.trim() || !form.apiSecret.trim())) return false
    return true
  }

  const handleConnect = () => {
    if (!selected || !isFormValid()) return
    createAccount(
      {
        brokerType:  selected,
        accountType: form.accountType,
        accountId:   form.accountId.trim(),
        label:       form.label.trim(),
        credentials: buildCredentials(selected, form),
      },
      { onSuccess: () => setStep('success') },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-[#111827] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
          <div className="flex items-center gap-2">
            {step === 'form' && (
              <button onClick={() => setStep('choose')}
                className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-white">
                {step === 'choose'  && 'Connecter un broker'}
                {step === 'form'    && selected && `Connexion ${brokerMeta[selected].name}`}
                {step === 'success' && 'Compte connecté !'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {step === 'choose'  && 'Choisis ton broker pour commencer'}
                {step === 'form'    && 'Renseigne tes identifiants'}
                {step === 'success' && 'La synchronisation démarre…'}
              </p>
            </div>
          </div>
          <button onClick={handleClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* Étape 1 */}
          {step === 'choose' && (
            <div className="space-y-2">
              {BROKERS.map(broker => (
                <button key={broker}
                  onClick={() => { setSelected(broker); setStep('form') }}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-gray-700/40 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group text-left"
                >
                  <BrokerIcon broker={broker} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{brokerMeta[broker].name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{brokerMeta[broker].desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Étape 2 */}
          {step === 'form' && selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                <BrokerIcon broker={selected} />
                <div>
                  <p className="text-sm font-semibold text-white">{brokerMeta[selected].name}</p>
                  <p className="text-[11px] text-gray-500">{brokerMeta[selected].desc}</p>
                </div>
              </div>

              <BrokerFormFields broker={selected} form={form} setForm={setForm} />

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    {error instanceof Error && error.message.includes('account_already_exists')
                      ? 'Ce compte existe déjà. Supprime-le depuis la page Comptes avant de le recréer.'
                      : error instanceof Error ? error.message : 'Erreur lors de la connexion.'}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 text-[11px] text-gray-600">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                Tes identifiants sont chiffrés AES-256. MERKURE ne peut jamais placer d'ordres.
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white mb-1">Compte connecté !</p>
                <p className="text-sm text-gray-400">
                  La synchronisation de l'historique est en cours.<br />
                  Cela peut prendre 1 à 2 minutes.
                </p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse w-1/2" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="px-6 py-4 border-t border-gray-800/60 flex gap-3">
            <button onClick={() => setStep('choose')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 transition-colors">
              Annuler
            </button>
            <button onClick={handleConnect} disabled={isPending || !isFormValid()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion…</>
              ) : 'Connecter le compte'}
            </button>
          </div>
        )}
        {step === 'success' && (
          <div className="px-6 py-4 border-t border-gray-800/60">
            <button onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">
              Voir mes comptes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
