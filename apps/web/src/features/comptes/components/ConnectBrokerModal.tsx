'use client'

import { useState } from 'react'
import { X, ChevronRight, ArrowLeft, Eye, EyeOff, Check, Lock, AlertCircle } from 'lucide-react'
import { brokerMeta } from '@/lib/mock-comptes'
import { useCreateAccount, type BrokerType, type AccountType } from '@/lib/hooks/use-accounts'
import { BrokerLogo } from '@/shared/components/BrokerLogo'

interface Props {
  open:    boolean
  onClose: () => void
}

type Step = 'choose' | 'form' | 'success'

const BROKERS: BrokerType[] = ['MT5', 'MT4', 'IB', 'CTRADER']
const COMING_SOON: BrokerType[] = ['BINANCE']


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
      <label className="mb-1.5 block text-xs font-black text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-[#071017] px-3 py-2.5 text-sm font-semibold text-white placeholder-slate-600 transition-all focus:border-[#56bf6b]/60 focus:outline-none focus:ring-1 focus:ring-[#56bf6b]/20"
        />
        {showToggle && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[10px] font-semibold leading-4 text-muted-foreground/60">{hint}</p>}
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
      <label className="mb-1.5 block text-xs font-black text-muted-foreground">Type de compte</label>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border py-2 text-xs font-black transition-colors ${
              value === opt.value
                ? 'border-[#56bf6b]/30 bg-[#56bf6b]/[0.10] text-[#56bf6b]'
                : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
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
      <div className="rounded-lg border border-blue-400/20 bg-blue-400/[0.08] p-3">
        <p className="text-xs font-semibold leading-relaxed text-blue-200">
          Vos identifiants sont chiffrés AES-256 et servent uniquement à lire votre historique.
          Utilisez le <span className="font-semibold">mot de passe investisseur</span> en lecture seule de préférence.
        </p>
      </div>
      {common}
      <Field label={`Numéro de compte ${broker}`} value={form.accountId} onChange={set('accountId')} placeholder="Ex : 1234567" />
      <Field label="Mot de passe investisseur" value={form.password} onChange={set('password')} placeholder="••••••••" showToggle hint={`Utilisez le mot de passe investisseur en lecture seule de votre compte ${broker}.`} />
      <Field label="Serveur du broker" value={form.server} onChange={set('server')} placeholder="Ex : PepperstoneUK-Demo03" hint={`Nom du serveur ${broker} tel qu'il apparaît dans votre terminal (ex: PepperstoneUK-Demo03, ICMarkets-Demo).`} />
    </div>
  )

  if (broker === 'BINANCE') return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.08] p-3">
        <p className="text-xs font-semibold leading-relaxed text-amber-200">
          Créez une clé API Binance en <span className="font-semibold">lecture seule</span> depuis Paramètres → Gestion des API.
        </p>
      </div>
      {common}
      <Field label="Account ID / UID"   value={form.accountId} onChange={set('accountId')} placeholder="Votre UID Binance" />
      <Field label="API Key"            value={form.apiKey}    onChange={set('apiKey')}    placeholder="Collez votre clé API ici" />
      <Field label="API Secret"         value={form.apiSecret} onChange={set('apiSecret')} placeholder="Collez votre secret API ici" showToggle />
    </div>
  )

  if (broker === 'IB') return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#56bf6b]/20 bg-[#56bf6b]/[0.08] p-3">
        <p className="text-xs font-semibold leading-relaxed text-emerald-200">
          Connexion via l'API TWS. Assurez-vous que TWS ou IB Gateway est ouvert et que l'accès API est activé.
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
      <Field label="Account ID"    value={form.accountId}    onChange={set('accountId')}    placeholder="Votre identifiant cTrader" />
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            {step === 'form' && (
              <button onClick={() => setStep('choose')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-white">
                {step === 'choose'  && 'Connecter un broker'}
                {step === 'form'    && selected && `Connexion ${brokerMeta[selected].name}`}
                {step === 'success' && 'Compte connecté !'}
              </h2>
              <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                {step === 'choose'  && 'Choisissez votre broker pour commencer'}
                {step === 'form'    && 'Renseignez vos identifiants'}
                {step === 'success' && 'La synchronisation démarre…'}
              </p>
            </div>
          </div>
          <button onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Étape 1 */}
          {step === 'choose' && (
            <div className="space-y-2">
              {BROKERS.map(broker => (
                <button key={broker}
                  onClick={() => { setSelected(broker); setStep('form') }}
                  className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-3.5 text-left transition-colors hover:border-[#56bf6b]/30 hover:bg-[#56bf6b]/[0.06]"
                >
                  <BrokerLogo broker={broker} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white">{brokerMeta[broker].name}</div>
                    <div className="mt-0.5 text-xs font-semibold text-muted-foreground">{brokerMeta[broker].desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-[#56bf6b]" />
                </button>
              ))}
              {COMING_SOON.map(broker => (
                <div key={broker}
                  className="flex w-full items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5 opacity-50 cursor-not-allowed"
                >
                  <BrokerLogo broker={broker} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-muted-foreground">{brokerMeta[broker].name}</div>
                    <div className="mt-0.5 text-xs font-semibold text-muted-foreground/60">{brokerMeta[broker].desc}</div>
                  </div>
                  <span className="rounded border border-slate-600/40 bg-slate-800/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Bientôt
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Étape 2 */}
          {step === 'form' && selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <BrokerLogo broker={selected} />
                <div>
                  <p className="text-sm font-black text-white">{brokerMeta[selected].name}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{brokerMeta[selected].desc}</p>
                </div>
              </div>

              <BrokerFormFields broker={selected} form={form} setForm={setForm} />

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-6 text-rose-200">
                    {error instanceof Error && error.message.includes('account_already_exists')
                      ? 'Ce compte existe déjà. Supprime-le depuis la page Comptes avant de le recréer.'
                      : error instanceof Error ? error.message : 'Erreur lors de la connexion.'}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 text-[11px] font-semibold leading-5 text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#56bf6b]" />
                Vos identifiants sont chiffrés AES-256. MERKURE ne peut jamais placer d'ordres.
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#56bf6b]/30 bg-[#56bf6b]/[0.12]">
                <Check className="h-8 w-8 text-[#56bf6b]" />
              </div>
              <div>
                <p className="mb-1 text-base font-black text-white">Compte connecté !</p>
                <p className="text-sm font-medium leading-6 text-muted-foreground">
                  La synchronisation de l'historique est en cours.<br />
                  Cela peut prendre 1 à 2 minutes.
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[#56bf6b]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
            <button onClick={() => setStep('choose')}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-2.5 text-sm font-black text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground">
              Annuler
            </button>
            <button onClick={handleConnect} disabled={isPending || !isFormValid()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#56bf6b] py-2.5 text-sm font-black text-white transition-colors hover:bg-[#49ab5e] disabled:cursor-not-allowed disabled:opacity-50">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion…</>
              ) : 'Connecter le compte'}
            </button>
          </div>
        )}
        {step === 'success' && (
          <div className="border-t border-white/[0.06] px-6 py-4">
            <button onClick={handleClose}
              className="w-full rounded-lg bg-[#56bf6b] py-2.5 text-sm font-black text-white transition-colors hover:bg-[#49ab5e]">
              Voir mes comptes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
