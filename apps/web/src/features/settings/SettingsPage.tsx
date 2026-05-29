'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, User, Lock } from 'lucide-react'
import { api } from '@/lib/api-client'

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
      <Check className="h-4 w-4 flex-shrink-0" />
      {message}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  )
}

function ProfileSection() {
  const qc = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: api.users.me,
  })

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [success,   setSuccess]   = useState(false)

  const mutation = useMutation({
    mutationFn: () => api.users.updateProfile({
      ...(firstName ? { firstName } : {}),
      ...(lastName  ? { lastName  } : {}),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] })
      qc.invalidateQueries({ queryKey: ['current-user'] })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10">
          <User className="h-4 w-4 text-[#b9a8ff]" />
        </div>
        <h3 className="text-base font-bold text-white">Profil</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Prénom</label>
            <input
              type="text"
              value={firstName || profile?.firstName || ''}
              onChange={e => setFirstName(e.target.value)}
              placeholder={profile?.firstName ?? 'Votre prénom'}
              className="w-full rounded-xl border border-[#1e2f4a] bg-[#07101f] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#7c5cff]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Nom</label>
            <input
              type="text"
              value={lastName || profile?.lastName || ''}
              onChange={e => setLastName(e.target.value)}
              placeholder={profile?.lastName ?? 'Votre nom'}
              className="w-full rounded-xl border border-[#1e2f4a] bg-[#07101f] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#7c5cff]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Email</label>
          <input
            type="email"
            value={profile?.email ?? ''}
            disabled
            className="w-full rounded-xl border border-[#1e2f4a] bg-[#07101f]/50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-600">L&apos;email ne peut pas être modifié pour l&apos;instant.</p>
        </div>

        {success && <SuccessBanner message="Profil mis à jour" />}
        {mutation.isError && <ErrorBanner message="Erreur lors de la mise à jour." />}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#8d72ff] disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </button>
      </form>
    </div>
  )
}

function PasswordSection() {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => api.users.changePassword(current, next),
    onSuccess: () => {
      setCurrent(''); setNext(''); setConfirm('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (e: Error) => {
      setError(e.message.includes('wrong_password')
        ? 'Mot de passe actuel incorrect.'
        : 'Erreur lors du changement.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (next !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (next.length < 8)  { setError('Minimum 8 caractères.'); return }
    mutation.mutate()
  }

  return (
    <div className="rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#18c7ff]/30 bg-[#18c7ff]/10">
          <Lock className="h-4 w-4 text-[#18c7ff]" />
        </div>
        <h3 className="text-base font-bold text-white">Changer le mot de passe</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le nouveau'] as const).map((label, i) => {
          const value = [current, next, confirm][i]!
          const setter = [setCurrent, setNext, setConfirm][i]!
          return (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">{label}</label>
              <input
                type="password"
                required
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#1e2f4a] bg-[#07101f] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#7c5cff]"
              />
            </div>
          )
        })}

        {success && <SuccessBanner message="Mot de passe mis à jour" />}
        {error   && <ErrorBanner message={error} />}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#8d72ff] disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Mettre à jour
        </button>
      </form>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-6 px-6 py-5">
      <div className="border-t border-[#1b2a42] pt-4">
        <h2 className="text-base font-bold text-white">Paramètres</h2>
        <p className="mt-1 text-xs text-slate-500">Gérez votre profil et votre sécurité.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileSection />
        <PasswordSection />
      </div>
    </div>
  )
}
