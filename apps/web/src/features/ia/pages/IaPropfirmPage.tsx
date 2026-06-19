'use client'

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'

const compatibilityCards: Array<{
  title: string
  match: string
  profile: string
  rules: string[]
  tone: string
}> = [
  {
    title:   'Challenge prudent',
    match:   '94%',
    profile: 'Profil compatible avec une limite de drawdown stricte et une progression régulière.',
    rules:   ["Drawdown journalier maîtrisé", "Risque moyen inférieur à 1R", 'Régularité supérieure à la médiane'],
    tone:    'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  {
    title:   'Challenge agressif',
    match:   '71%',
    profile: 'Potentiel intéressant, mais le rythme de trading doit être encadré avant inscription.',
    rules:   ["Réduire les trades après perte", "Limiter le risque hors setup", 'Éviter les fins de session'],
    tone:    'border-amber-200 bg-amber-50 text-amber-600',
  },
  {
    title:   'Compte scaling',
    match:   '86%',
    profile: 'Votre régularité rend ce format pertinent si les règles de taille sont respectées.',
    rules:   ["Montée progressive", "Objectif hebdomadaire réaliste", 'Pas de sur-risque sur news'],
    tone:    'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  },
]

const criteria: Array<{
  icon: LucideIcon
  label: string
  value: string
  helper: string
  tone: string
}> = [
  {
    icon:   ShieldCheck,
    label:  'Risque moyen',
    value:  '0,9R',
    helper: 'Compatible avec un cadre prudent',
    tone:   'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  {
    icon:   TrendingDown,
    label:  'Drawdown maximal',
    value:  '-4,8%',
    helper: 'Marge avant seuil critique',
    tone:   'border-red-200 bg-red-50 text-red-500',
  },
  {
    icon:   Target,
    label:  'Objectif réaliste',
    value:  '6,2%',
    helper: 'Estimé selon votre historique',
    tone:   'border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
  },
  {
    icon:   Gauge,
    label:  'Stabilité',
    value:  '82/100',
    helper: 'Régularité exploitable',
    tone:   'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  },
]

const actionPlan = [
  'Réduire le risque à 0,75R sur les trois premières semaines de challenge.',
  'Bloquer les trades après deux pertes consécutives sur la même session.',
  "Éviter les jours de news majeures si le setup n'est pas annoté avant l'entrée.",
  'Exporter le rapport hebdomadaire pour justifier la discipline et la progression.',
]

function PropFirmVisual() {
  return (
    <div className="relative hidden min-h-[250px] overflow-hidden lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_34%,rgba(83,74,183,0.10),transparent_30%),radial-gradient(circle_at_38%_78%,rgba(124,92,255,0.08),transparent_28%)]" />
      <div className="absolute right-8 top-7 w-[360px] rounded-xl border border-[hsl(var(--border))] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[hsl(var(--foreground-soft))]">Compatibilité</p>
            <p className="mt-2 text-3xl font-black text-foreground">94%</p>
          </div>
          <BriefcaseBusiness className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <div className="mt-5 space-y-3">
          {[
            ["Drawdown", "Respecté", 'text-emerald-600'],
            ["Risque / trade", "Stable", 'text-emerald-600'],
            ["Objectif", "Réaliste", 'text-[hsl(var(--primary))]'],
            ["News trading", "À surveiller", 'text-amber-600'],
          ].map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-4 py-3">
              <span className="text-xs font-semibold text-[hsl(var(--foreground-soft))]">{label}</span>
              <span className={`text-xs font-black ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 right-16 h-px w-[450px] bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
    </div>
  )
}

export function IaPropfirmPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-background shadow-sm">
        <div className="relative grid lg:grid-cols-[1fr_0.92fr]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(83,74,183,0.08),transparent_30%),radial-gradient(circle_at_82%_42%,rgba(124,92,255,0.06),transparent_32%)]" />
          <div className="relative px-7 py-8">
            <span className="rounded-md border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
              Prop firms
            </span>
            <h1 className="mt-5 max-w-2xl text-3xl font-black text-foreground">
              Vérifiez si votre style respecte un challenge avant de payer.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[hsl(var(--foreground-soft))]">
              L'IA lit votre risque, votre drawdown et votre régularité pour estimer le format de challenge le plus cohérent avec vos données.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-[hsl(var(--foreground-soft))]">
              {[
                { icon: ShieldAlert, label: 'Seuils de drawdown' },
                { icon: ClipboardCheck, label: 'Règles de challenge' },
                { icon: Lock, label: 'Aucune affiliation implicite' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <PropFirmVisual />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {criteria.map(({ icon: Icon, label, value, helper, tone }) => (
          <article key={label} className="rounded-xl border border-[hsl(var(--border))] bg-background p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[hsl(var(--foreground-soft))]">{label}</p>
                <p className="mt-2 font-mono text-3xl font-black text-foreground">{value}</p>
                <p className="mt-1 text-xs font-semibold text-[hsl(var(--foreground-soft))]">{helper}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-foreground">Formats compatibles</h2>
            <p className="mt-1 text-xs font-semibold text-[hsl(var(--foreground-soft))]">
              Exemples de formats. Les noms de prop firms réels seront ajoutés uniquement avec données vérifiées.
            </p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {compatibilityCards.map(card => (
            <article key={card.title} className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-background shadow-sm">
              <div className="border-b border-[hsl(var(--border))] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-foreground">{card.title}</h3>
                    <p className="mt-2 text-xs font-medium leading-6 text-[hsl(var(--foreground-soft))]">{card.profile}</p>
                  </div>
                  <span className={`rounded-lg border px-3 py-2 font-mono text-xl font-black ${card.tone}`}>
                    {card.match}
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-5">
                {card.rules.map(rule => (
                  <div key={rule} className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                    <span className="text-xs font-semibold leading-5 text-[hsl(var(--foreground-soft))]">{rule}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-xl border border-[hsl(var(--border))] bg-background p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-base font-black text-foreground">Ce que MERKURE vérifie</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-[hsl(var(--foreground-soft))]">
            Le module ne choisit pas à votre place. Il signale les écarts entre votre historique et les contraintes habituelles : drawdown, taille moyenne, séries de pertes, news trading et fréquence de prise de position.
          </p>
        </article>

        <article className="rounded-xl border border-[hsl(var(--border))] bg-background p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-black text-foreground">Plan d'action avant challenge</h2>
            <BadgeCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {actionPlan.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-4 py-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[10px] font-black text-[hsl(var(--primary))]">
                  {index + 1}
                </span>
                <span className="text-xs font-semibold leading-5 text-[hsl(var(--foreground-soft))]">{item}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-background px-5 py-4 text-sm font-semibold text-[hsl(var(--foreground-soft))] sm:flex-row sm:items-center">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[hsl(var(--primary))]" />
        Les compatibilités sont des analyses de préparation. Elles ne garantissent pas l'acceptation ou la réussite d'un challenge.
        <button className="inline-flex items-center gap-2 text-xs font-black text-[hsl(var(--primary))] sm:ml-auto">
          Préparer mon profil <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
