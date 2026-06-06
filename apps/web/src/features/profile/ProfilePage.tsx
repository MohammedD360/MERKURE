'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  BadgeEuro,
  CalendarDays,
  Camera,
  CheckCircle2,
  Globe2,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  User,
} from 'lucide-react'

import { api, type UserProfile } from '@/lib/api-client'
import { getPlanDisplayName } from '@/lib/plans'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD'] as const
const TIMEZONES = ['Europe/Paris', 'Europe/London', 'America/New_York', 'America/Toronto', 'Asia/Dubai'] as const

type ProfileForm = {
  firstName: string
  lastName:  string
  timezone:  string
  currency:  string
}

function getDisplayName(profile?: UserProfile) {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return fullName || profile?.email?.split('@')[0] || 'Trader MERKURE'
}

function getInitials(profile?: UserProfile) {
  const displayName = getDisplayName(profile)
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(date?: string) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  }).format(new Date(date))
}

function planLabel(plan?: string) {
  return getPlanDisplayName(plan)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Impossible de lire cette image.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image invalide ou corrompue.'))
    image.src = src
  })
}

async function createAvatarDataUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Sélectionnez une image PNG, JPG ou WebP.')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image trop lourde. Taille maximale : 5 Mo.')
  }

  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const maxSize = 512
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Votre navigateur ne peut pas préparer cette image.')

  ctx.drawImage(image, 0, 0, width, height)
  const optimized = canvas.toDataURL('image/jpeg', 0.86)
  if (optimized.length > 400_000) {
    throw new Error('Image encore trop lourde après optimisation.')
  }
  return optimized
}

function SuccessBanner({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm font-semibold text-emerald-300">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {children}
    </div>
  )
}

function ErrorBanner({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm font-semibold text-rose-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {children}
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon:  typeof User
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      {children}
    </label>
  )
}

function inputClass() {
  return 'w-full rounded-lg border border-white/10 bg-[#071017] px-4 py-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#56bf6b]/60 focus:ring-1 focus:ring-[#56bf6b]/20'
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="h-52 animate-pulse rounded-xl bg-white/[0.04]" />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="h-80 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-80 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  )
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => api.users.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(true)
      window.setTimeout(() => setSuccess(false), 3200)
    },
    onError: (err: Error) => {
      if (err.message.includes('wrong_password')) setError('Le mot de passe actuel est incorrect.')
      else if (err.message.includes('no_password_set')) setError('Ce compte utilise une connexion externe. Aucun mot de passe local n’est défini.')
      else setError('Impossible de modifier le mot de passe pour le moment.')
    },
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }
    mutation.mutate()
  }

  return (
    <section className="rounded-xl border border-white/10 bg-background p-6 shadow-[0_12px_46px_rgba(0,0,0,0.18)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/10 text-blue-300">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">Sécurité</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Mettez à jour votre mot de passe local.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 lg:grid-cols-3">
        <Field label="Mot de passe actuel" icon={Lock}>
          <input
            type="password"
            value={currentPassword}
            onChange={event => setCurrentPassword(event.target.value)}
            required
            placeholder="••••••••"
            className={inputClass()}
          />
        </Field>
        <Field label="Nouveau mot de passe" icon={ShieldCheck}>
          <input
            type="password"
            value={newPassword}
            onChange={event => setNewPassword(event.target.value)}
            required
            placeholder="8 caractères minimum"
            className={inputClass()}
          />
        </Field>
        <Field label="Confirmation" icon={ShieldCheck}>
          <input
            type="password"
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            required
            placeholder="Répétez le mot de passe"
            className={inputClass()}
          />
        </Field>

        <div className="lg:col-span-3">
          {success && <SuccessBanner>Mot de passe mis à jour.</SuccessBanner>}
          {error && <ErrorBanner>{error}</ErrorBanner>}
        </div>

        <div className="lg:col-span-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#49ab5e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Mettre à jour
          </button>
        </div>
      </form>
    </section>
  )
}

export function ProfilePage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hydratedProfileId, setHydratedProfileId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName:  '',
    timezone:  'Europe/Paris',
    currency:  'EUR',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  api.users.me,
  })

  useEffect(() => {
    if (!profile || hydratedProfileId === profile.id) return
    setForm({
      firstName: profile.firstName ?? '',
      lastName:  profile.lastName ?? '',
      timezone:  profile.timezone ?? 'Europe/Paris',
      currency:  profile.currency ?? 'EUR',
    })
    setHydratedProfileId(profile.id)
  }, [profile, hydratedProfileId])

  const invalidateUser = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] }),
      queryClient.invalidateQueries({ queryKey: ['me'] }),
    ])
  }

  const profileMutation = useMutation({
    mutationFn: () => api.users.updateProfile({
      firstName: form.firstName,
      lastName:  form.lastName,
      timezone:  form.timezone,
      currency:  form.currency,
    }),
    onSuccess: async () => {
      await invalidateUser()
      setProfileSaved(true)
      window.setTimeout(() => setProfileSaved(false), 3200)
    },
  })

  const avatarMutation = useMutation({
    mutationFn: (avatarUrl: string | null) => api.users.updateProfile({ avatarUrl }),
    onSuccess: async () => {
      setAvatarPreview(null)
      await invalidateUser()
    },
  })

  if (isLoading) return <ProfileSkeleton />

  const avatarUrl = avatarPreview ?? profile?.avatarUrl ?? null
  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)
  const avatarStyle = avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined

  const onChange = (key: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(current => ({ ...current, [key]: event.target.value }))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    profileMutation.mutate()
  }

  const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setAvatarError(null)
    try {
      const optimized = await createAvatarDataUrl(file)
      setAvatarPreview(optimized)
      await avatarMutation.mutateAsync(optimized)
    } catch (err) {
      setAvatarPreview(null)
      setAvatarError(err instanceof Error ? err.message : 'Impossible d’enregistrer cette photo.')
    }
  }

  const removeAvatar = () => {
    setAvatarError(null)
    avatarMutation.mutate(null)
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_12px_52px_rgba(0,0,0,0.20)]">
        <div className="relative border-b border-white/[0.06] px-6 py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(86,191,107,0.14),transparent_32%),radial-gradient(circle_at_78%_5%,rgba(124,92,255,0.12),transparent_34%)]" />
          <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#56bf6b]">Profil utilisateur</p>
          <h1 className="mt-2 text-2xl font-black text-white">Gérez votre identité MERKURE</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted-foreground">
            Votre photo et vos informations apparaissent dans l’espace connecté. Gardez un profil clair pour identifier rapidement votre compte.
          </p>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[380px_1fr]">
          <aside className="border-b border-white/[0.06] p-6 xl:border-b-0 xl:border-r">
            <div className="flex flex-col items-center text-center">
              <div
                className="relative flex h-32 w-32 items-center justify-center rounded-full border border-border bg-slate-800 bg-cover bg-center text-3xl font-black text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
                style={avatarStyle}
                aria-label={`Photo de profil de ${displayName}`}
              >
                {!avatarUrl && initials}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#56bf6b] text-white shadow-lg transition-colors hover:bg-[#49ab5e]"
                  aria-label="Changer la photo de profil"
                >
                  {avatarMutation.isPending && avatarPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onAvatarChange}
              />

              <h2 className="mt-5 text-xl font-black text-white">{displayName}</h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">{profile?.email ?? '—'}</p>

              <div className="mt-6 grid w-full gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-slate-200 transition-colors hover:bg-white/[0.07] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {avatarMutation.isPending && avatarPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Importer une photo
                </button>
                {profile?.avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={avatarMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400/25 px-4 py-3 text-sm font-black text-rose-300 transition-colors hover:bg-rose-400/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {avatarMutation.isPending && !avatarPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Supprimer la photo
                  </button>
                )}
              </div>

              <p className="mt-4 max-w-xs text-xs font-medium leading-5 text-muted-foreground">
                Formats acceptés : JPG, PNG, WebP. L’image est redimensionnée automatiquement.
              </p>

              {avatarError && <div className="mt-4 w-full"><ErrorBanner>{avatarError}</ErrorBanner></div>}
            </div>

            <div className="mt-8 grid gap-3 text-left">
              <div className="rounded-lg border border-white/[0.06] bg-[#071017] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/60">Plan actif</p>
                <p className="mt-2 text-sm font-black text-white">{planLabel(profile?.subscription?.plan)}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-[#071017] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground/60">Inscription</p>
                <p className="mt-2 text-sm font-black text-white">{formatDate(profile?.createdAt)}</p>
              </div>
            </div>
          </aside>

          <form onSubmit={onSubmit} className="p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Prénom" icon={User}>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={onChange('firstName')}
                  maxLength={50}
                  placeholder="Votre prénom"
                  className={inputClass()}
                />
              </Field>

              <Field label="Nom" icon={User}>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={onChange('lastName')}
                  maxLength={50}
                  placeholder="Votre nom"
                  className={inputClass()}
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={profile?.email ?? ''}
                  disabled
                  className={`${inputClass()} cursor-not-allowed opacity-60`}
                />
              </Field>

              <Field label="Fuseau horaire" icon={Globe2}>
                <select value={form.timezone} onChange={onChange('timezone')} className={inputClass()}>
                  {TIMEZONES.map(timezone => (
                    <option key={timezone} value={timezone}>{timezone}</option>
                  ))}
                </select>
              </Field>

              <Field label="Devise" icon={BadgeEuro}>
                <select value={form.currency} onChange={onChange('currency')} className={inputClass()}>
                  {CURRENCIES.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </Field>

              <div className="rounded-lg border border-white/[0.06] bg-[#071017] p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Préférences
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  La devise et le fuseau horaire servent à normaliser les rapports, les graphiques et les exports.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {profileSaved && <SuccessBanner>Profil mis à jour.</SuccessBanner>}
              {profileMutation.isError && <ErrorBanner>Impossible d’enregistrer le profil pour le moment.</ErrorBanner>}

              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#49ab5e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer le profil
              </button>
            </div>
          </form>
        </div>
      </section>

      <PasswordCard />
    </div>
  )
}
