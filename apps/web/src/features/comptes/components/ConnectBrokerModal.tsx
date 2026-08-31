'use client'

import { useState } from 'react'
import { X, ChevronRight, ArrowLeft, Eye, EyeOff, Check, Lock, AlertCircle } from 'lucide-react'
import { brokerMeta } from '@/lib/broker-config'
import { useCreateAccount, type BrokerType, type AccountType } from '@/lib/hooks/use-accounts'
import { BrokerLogo } from '@/shared/components/BrokerLogo'
import { FirmLogo } from '@/features/prop-firm/components/StepFirmSelect'
import { getPropFirm } from '@/features/prop-firm/data/prop-firms'

interface Props {
  open:    boolean
  onClose: () => void
}

type Step = 'choose' | 'form' | 'success'

// Seuls MT4/MT5 disposent d'une synchronisation automatique fiable (MetaAPI).
// Les autres brokers restent désactivés tant que leur adapter n'est pas remis
// en service — voir l'audit de la synchro par compte.
const BROKERS: BrokerType[] = ['MT5', 'MT4']

// Prop firms sans plateforme technique dédiée : on les connecte via un broker
// existant (ici MT5) tout en gardant leur identité visuelle et un rappel
// contextuel dans le formulaire.
const PROP_FIRM_SHORTCUTS: { id: string; broker: BrokerType; prefillLabel: string }[] = [
  { id: 'fundingpips', broker: 'MT5', prefillLabel: 'FundingPips – Challenge' },
]


interface FormState {
  label:       string
  accountId:   string
  accountType: AccountType
  password:    string
  server:      string
}

const DEFAULT_FORM: FormState = {
  label: '', accountId: '', accountType: 'PROP_CHALLENGE',
  password: '', server: '',
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
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-background px-3 py-2.5 text-sm font-semibold text-foreground placeholder-[hsl(var(--foreground-soft))] transition-all focus:border-[hsl(var(--primary)/0.6)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.2)]"
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
                ? 'border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground hover:bg-[hsl(var(--accent))] hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function BrokerFormFields({ broker, propFirmId, form, setForm }: {
  broker: BrokerType
  propFirmId: string | null
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

  return (
    <div className="space-y-4">
      {propFirmId === 'fundingpips' ? (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
          <p className="text-xs font-semibold leading-relaxed text-orange-700">
            Connexion à votre compte <span className="font-bold">FundingPips</span> via MetaTrader.
            Utilisez les identifiants MT4/MT5 reçus par email lors de l&apos;activation de votre challenge.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] p-3">
          <p className="text-xs font-semibold leading-relaxed text-[hsl(var(--primary))]">
            Vos identifiants sont chiffrés AES-256 et servent uniquement à lire votre historique.
            Utilisez le <span className="font-semibold">mot de passe investisseur</span> en lecture seule de préférence.
          </p>
        </div>
      )}
      {common}
      <Field label={`Numéro de compte ${broker}`} value={form.accountId} onChange={set('accountId')} placeholder="Ex : 1234567" />
      <Field label="Mot de passe investisseur" value={form.password} onChange={set('password')} placeholder="••••••••" showToggle hint={`Utilisez le mot de passe investisseur en lecture seule de votre compte ${broker}.`} />
      <Field label="Serveur du broker" value={form.server} onChange={set('server')} placeholder="Ex : PepperstoneUK-Demo03" hint={`Nom du serveur ${broker} tel qu'il apparaît dans votre terminal (ex: PepperstoneUK-Demo03, ICMarkets-Demo).`} />
    </div>
  )
}

function buildCredentials(broker: BrokerType, form: FormState): Record<string, string> {
  return {
    accountId:   form.accountId,
    upass:       form.password,
    tradeserver: form.server,
    platform:    broker.toLowerCase(),
  }
}

export function ConnectBrokerModal({ open, onClose }: Props) {
  const [step,       setStep]       = useState<Step>('choose')
  const [selected,   setSelected]   = useState<BrokerType | null>(null)
  const [propFirmId, setPropFirmId] = useState<string | null>(null)
  const [form,       setForm]       = useState<FormState>(DEFAULT_FORM)

  const { mutate: createAccount, isPending, error } = useCreateAccount()

  if (!open) return null

  const handleClose = () => {
    setStep('choose'); setSelected(null); setPropFirmId(null); setForm(DEFAULT_FORM); onClose()
  }

  const isFormValid = (): boolean => {
    if (!selected) return false
    if (!form.label.trim()) return false
    if (!form.accountId.trim()) return false
    if (!form.password.trim()) return false
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-background shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div className="flex items-center gap-2">
            {step === 'form' && (
              <button onClick={() => { setStep('choose'); setPropFirmId(null) }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {step === 'choose'  && 'Connecter un broker'}
                {step === 'form'    && selected && `Connexion ${propFirmId ? getPropFirm(propFirmId)?.name : brokerMeta[selected].name}`}
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Étape 1 */}
          {step === 'choose' && (
            <div className="space-y-2">
              {PROP_FIRM_SHORTCUTS.map(({ id, broker, prefillLabel }) => {
                const firm = getPropFirm(id)
                if (!firm) return null
                return (
                  <button key={id}
                    onClick={() => {
                      setSelected(broker)
                      setPropFirmId(id)
                      setForm(f => ({ ...f, label: f.label || prefillLabel }))
                      setStep('form')
                    }}
                    className="group flex w-full items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-background p-3.5 text-left transition-colors hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.06)]"
                  >
                    <FirmLogo id={id} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-foreground">{firm.name}</div>
                      <div className="mt-0.5 text-xs font-semibold text-muted-foreground">{firm.tagline}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-[hsl(var(--primary))]" />
                  </button>
                )
              })}
              {BROKERS.map(broker => (
                <button key={broker}
                  onClick={() => {
                    setSelected(broker)
                    setPropFirmId(null)
                    setStep('form')
                  }}
                  className="group flex w-full items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-background p-3.5 text-left transition-colors hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.06)]"
                >
                  <BrokerLogo broker={broker} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-foreground">{brokerMeta[broker].name}</div>
                    <div className="mt-0.5 text-xs font-semibold text-muted-foreground">{brokerMeta[broker].desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-[hsl(var(--primary))]" />
                </button>
              ))}
            </div>
          )}

          {/* Étape 2 */}
          {step === 'form' && selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))] p-3">
                {propFirmId ? <FirmLogo id={propFirmId} size="sm" /> : <BrokerLogo broker={selected} />}
                <div>
                  <p className="text-sm font-black text-foreground">{propFirmId ? getPropFirm(propFirmId)?.name : brokerMeta[selected].name}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    {propFirmId ? `via ${brokerMeta[selected].name}` : brokerMeta[selected].desc}
                  </p>
                </div>
              </div>

              <BrokerFormFields broker={selected} propFirmId={propFirmId} form={form} setForm={setForm} />

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-6 text-red-500">
                    {error instanceof Error && error.message.includes('account_already_exists')
                      ? 'Ce compte existe déjà. Supprime-le depuis la page Comptes avant de le recréer.'
                      : error instanceof Error ? error.message : 'Erreur lors de la connexion.'}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 text-[11px] font-semibold leading-5 text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--primary))]" />
                Vos identifiants sont chiffrés AES-256. MERKURE ne peut jamais placer d'ordres.
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.10)]">
                <Check className="h-8 w-8 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="mb-1 text-base font-black text-foreground">Compte connecté !</p>
                <p className="text-sm font-medium leading-6 text-muted-foreground">
                  La synchronisation de l'historique est en cours.<br />
                  Cela peut prendre 1 à 2 minutes.
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--accent))]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="border-t border-[hsl(var(--border))] px-6 py-4 space-y-2">
            <div className="flex gap-3">
              <button onClick={() => setStep('choose')}
                className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] py-2.5 text-sm font-black text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground">
                Annuler
              </button>
              <button onClick={handleConnect} disabled={isPending || !isFormValid()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] py-2.5 text-sm font-black text-white transition-colors hover:bg-[hsl(243_90%_58%)] disabled:cursor-not-allowed disabled:opacity-50">
                {isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion…</>
                ) : 'Connecter le compte'}
              </button>
            </div>
            {!isFormValid() && !isPending && (
              <p className="text-center text-[11px] font-semibold text-muted-foreground/70">
                {!form.label.trim()
                  ? 'Renseignez le libellé du compte pour continuer'
                  : 'Remplissez tous les champs requis'}
              </p>
            )}
          </div>
        )}
        {step === 'success' && (
          <div className="border-t border-[hsl(var(--border))] px-6 py-4">
            <button onClick={handleClose}
              className="w-full rounded-lg bg-[hsl(var(--primary))] py-2.5 text-sm font-black text-white transition-colors hover:bg-[hsl(243_90%_58%)]">
              Voir mes comptes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
