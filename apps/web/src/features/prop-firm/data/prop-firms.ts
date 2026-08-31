// Données statiques des prop firms supportées : challenges, règles visibles et
// règles cachées. Les pourcentages sont approximatifs (communication publique
// des firmes) — ils servent de référence pour calculer la conformité à partir
// des trades réels de l'utilisateur, pas de source de vérité contractuelle.

export type RuleType =
  | 'daily_drawdown'
  | 'max_drawdown'
  | 'profit_target'
  | 'min_days'
  | 'consistency'
  | 'news'

export interface PropFirmRule {
  id:          string
  type:        RuleType
  label:       string
  description: string
  /** Seuil en % du capital (ou en jours pour min_days). Non utilisé pour 'news'. */
  limitPct:    number
  /** Valeur affichée telle quelle (ex. "5%", "4 jours", "Autorisé"). */
  limit:       string
}

export interface HiddenRule {
  id:          string
  title:       string
  description: string
  /** Le piège concret dans lequel tombent la plupart des traders. */
  trap:        string
  /** Ce qui se passe en cas de non-respect. */
  consequence: string
  severity:    'critique' | 'important' | 'info'
  /** Si présent, la règle est suivie automatiquement à partir de la conformité calculée. */
  metric?:     'consistency' | 'daily_dd' | 'max_dd'
  threshold?:  number
}

export interface PropFirmChallengeSize {
  value:       number
  label:       string
  fee:         number
  profitSplit: number
}

export interface PropFirmChallenge {
  id:           string
  name:         string
  description:  string
  badge:        string
  badgeColor:   string
  rules:        PropFirmRule[]
  hiddenRules:  HiddenRule[]
  sizes:        PropFirmChallengeSize[]
  accountTypes: string[]
  currencies:   string[]
  leverages:    string[]
}

export interface PropFirmStat {
  label: string
  value: string
}

export interface PropFirm {
  id:          string
  name:        string
  tagline:     string
  description: string
  accentColor: string
  stats:       PropFirmStat[]
  challenges:  PropFirmChallenge[]
}

// ── FTMO ─────────────────────────────────────────────────────────────────────

const ftmo: PropFirm = {
  id: 'ftmo',
  name: 'FTMO',
  tagline: 'Le standard de référence',
  description: "Challenge en deux étapes suivi d'un compte financé réel, jusqu'à 90% de partage des profits.",
  accentColor: '#1a1a2e',
  stats: [
    { label: 'Comptes financés', value: '180 000+' },
    { label: 'Capital max',      value: '$2M' },
  ],
  challenges: [
    {
      id: 'ftmo-challenge',
      name: 'FTMO Challenge',
      description: 'Évaluation classique en deux étapes (Challenge puis Verification) avant le compte financé.',
      badge: '2 étapes',
      badgeColor: 'bg-blue-500/10 text-blue-400',
      rules: [
        { id: 'ftmo-ch-dd',  type: 'daily_drawdown', label: 'Perte journalière max',  description: "Perte maximale autorisée en une seule journée de trading, calculée sur l'équité.", limitPct: 5,  limit: '5%' },
        { id: 'ftmo-ch-mdd', type: 'max_drawdown',   label: 'Perte totale max',       description: "Perte maximale cumulée depuis le début du challenge par rapport au capital initial.", limitPct: 10, limit: '10%' },
        { id: 'ftmo-ch-pt',  type: 'profit_target',  label: 'Objectif de profit',     description: 'Gain requis pour valider cette étape.', limitPct: 10, limit: '10%' },
        { id: 'ftmo-ch-md',  type: 'min_days',       label: 'Jours de trading min.',  description: 'Nombre minimum de jours distincts avec au moins un trade clôturé.', limitPct: 4, limit: '4 jours' },
      ],
      hiddenRules: [
        {
          id: 'ftmo-ch-consistency',
          title: 'Règle de consistance (best day)',
          description: "Aucun jour ne doit représenter une part disproportionnée du profit total accumulé.",
          trap: "Un seul très bon trade fait passer un jour à 40-50% du profit total : la validation peut être refusée même si l'objectif est techniquement atteint.",
          consequence: 'Refus de la validation du compte, challenge à recommencer.',
          severity: 'important',
          metric: 'consistency',
          threshold: 25,
        },
        {
          id: 'ftmo-ch-weekend',
          title: 'Positions ouvertes le week-end',
          description: 'Certains types de compte interdisent de conserver des positions ouvertes pendant la fermeture des marchés.',
          trap: "Laisser une position ouverte le vendredi soir « pour voir » expose à une clôture forcée et à une violation, même sans mouvement de prix.",
          consequence: 'Violation immédiate de la règle, indépendamment du résultat du trade.',
          severity: 'critique',
        },
      ],
      sizes: [
        { value: 10_000,  label: '$10,000',  fee: 155,  profitSplit: 80 },
        { value: 25_000,  label: '$25,000',  fee: 250,  profitSplit: 80 },
        { value: 50_000,  label: '$50,000',  fee: 345,  profitSplit: 80 },
        { value: 100_000, label: '$100,000', fee: 540,  profitSplit: 80 },
        { value: 200_000, label: '$200,000', fee: 1080, profitSplit: 80 },
      ],
      accountTypes: ['Normal', 'Aggressive', 'Swing'],
      currencies:   ['USD', 'EUR', 'GBP'],
      leverages:    ['1:100', '1:30', '1:10'],
    },
    {
      id: 'ftmo-swing',
      name: 'FTMO Swing',
      description: 'Variante pensée pour le swing trading : levier réduit mais positions ouvrables sur le week-end.',
      badge: '2 étapes',
      badgeColor: 'bg-purple-500/10 text-purple-400',
      rules: [
        { id: 'ftmo-sw-dd',  type: 'daily_drawdown', label: 'Perte journalière max', description: "Perte maximale autorisée en une seule journée de trading.", limitPct: 5,  limit: '5%' },
        { id: 'ftmo-sw-mdd', type: 'max_drawdown',   label: 'Perte totale max',      description: 'Perte maximale cumulée par rapport au capital initial.', limitPct: 10, limit: '10%' },
        { id: 'ftmo-sw-pt',  type: 'profit_target',  label: 'Objectif de profit',    description: 'Gain requis pour valider cette étape.', limitPct: 10, limit: '10%' },
        { id: 'ftmo-sw-md',  type: 'min_days',       label: 'Jours de trading min.', description: 'Nombre minimum de jours distincts avec au moins un trade clôturé.', limitPct: 4, limit: '4 jours' },
      ],
      hiddenRules: [
        {
          id: 'ftmo-sw-consistency',
          title: 'Règle de consistance (best day)',
          description: 'Aucun jour ne doit représenter une part disproportionnée du profit total.',
          trap: 'Un gap favorable pendant le week-end peut créer un jour disproportionné sans aucune action délibérée du trader.',
          consequence: 'Refus de la validation du compte.',
          severity: 'important',
          metric: 'consistency',
          threshold: 25,
        },
      ],
      sizes: [
        { value: 10_000,  label: '$10,000',  fee: 165,  profitSplit: 80 },
        { value: 25_000,  label: '$25,000',  fee: 265,  profitSplit: 80 },
        { value: 50_000,  label: '$50,000',  fee: 360,  profitSplit: 80 },
        { value: 100_000, label: '$100,000', fee: 560,  profitSplit: 80 },
      ],
      accountTypes: ['Swing'],
      currencies:   ['USD', 'EUR'],
      leverages:    ['1:30', '1:10'],
    },
  ],
}

// ── Apex Trader Funding ──────────────────────────────────────────────────────

const apexFunded: PropFirm = {
  id: 'apex-funded',
  name: 'Apex Trader Funding',
  tagline: 'Futures — évaluation en un temps',
  description: 'Évaluation sur contrats à terme (futures) avec drawdown suiveur et sans limite de perte journalière.',
  accentColor: '#0f4c75',
  stats: [
    { label: 'Marché',        value: 'Futures CME' },
    { label: 'Comptes actifs', value: '250 000+' },
  ],
  challenges: [
    {
      id: 'apex-pa',
      name: 'Performance Account (PA)',
      description: 'Drawdown suiveur (trailing) qui se fige une fois le seuil de profit atteint. Une seule étape avant le compte financé.',
      badge: 'Trailing DD',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
      rules: [
        { id: 'apex-pa-mdd', type: 'max_drawdown',  label: 'Drawdown suiveur',      description: "Écart maximal toléré entre le point culminant de l'équité et sa valeur actuelle.", limitPct: 10, limit: '10%' },
        { id: 'apex-pa-pt',  type: 'profit_target',  label: 'Objectif de profit',    description: 'Gain requis pour débloquer le compte financé.', limitPct: 6, limit: '6%' },
        { id: 'apex-pa-md',  type: 'min_days',       label: 'Jours de trading min.', description: 'Nombre minimum de jours distincts avec au moins un trade clôturé.', limitPct: 8, limit: '8 jours' },
        { id: 'apex-pa-news', type: 'news',          label: 'Trading pendant les news', description: 'Politique vis-à-vis des annonces économiques à fort impact.', limitPct: 0, limit: 'Autorisé' },
      ],
      hiddenRules: [
        {
          id: 'apex-pa-trailing-freeze',
          title: 'Le trailing ne se fige qu’au seuil de profit',
          description: "Tant que l'objectif de profit n'est pas atteint, le seuil de drawdown continue de suivre chaque nouveau sommet d'équité.",
          trap: "Un trader qui engrange puis redonne une partie de ses gains avant d'avoir atteint l'objectif voit son seuil de sécurité reculer avec lui, sans jamais se figer.",
          consequence: 'Compte clôturé si le seuil suiveur est franchi, même après une belle série de gains.',
          severity: 'critique',
          metric: 'max_dd',
          threshold: 10,
        },
        {
          id: 'apex-pa-contracts',
          title: 'Limite de contrats par palier',
          description: 'Le nombre de contrats simultanés autorisés dépend de la taille du compte et évolue par palier.',
          trap: 'Ouvrir une position surdimensionnée par rapport au palier de compte en cours est une violation, indépendamment du résultat.',
          consequence: 'Violation de la règle de sizing, pouvant entraîner une clôture du compte.',
          severity: 'important',
        },
      ],
      sizes: [
        { value: 50_000,  label: '$50,000',  fee: 137, profitSplit: 90 },
        { value: 100_000, label: '$100,000', fee: 167, profitSplit: 90 },
        { value: 150_000, label: '$150,000', fee: 207, profitSplit: 90 },
        { value: 250_000, label: '$250,000', fee: 297, profitSplit: 90 },
      ],
      accountTypes: ['Performance Account'],
      currencies:   ['USD'],
      leverages:    ['N/A'],
    },
    {
      id: 'apex-static',
      name: 'Static Account',
      description: 'Drawdown fixe (non suiveur), calculé une fois pour toutes sur le capital initial.',
      badge: 'Drawdown fixe',
      badgeColor: 'bg-amber-500/10 text-amber-400',
      rules: [
        { id: 'apex-st-mdd', type: 'max_drawdown', label: 'Drawdown maximum',       description: 'Perte maximale tolérée par rapport au capital initial, sans effet suiveur.', limitPct: 8, limit: '8%' },
        { id: 'apex-st-pt',  type: 'profit_target', label: 'Objectif de profit',     description: 'Gain requis pour débloquer le compte financé.', limitPct: 6, limit: '6%' },
        { id: 'apex-st-md',  type: 'min_days',      label: 'Jours de trading min.',  description: 'Nombre minimum de jours distincts avec au moins un trade clôturé.', limitPct: 8, limit: '8 jours' },
      ],
      hiddenRules: [
        {
          id: 'apex-st-consistency',
          title: 'Régularité attendue par le desk de risque',
          description: "Un profil de gains trop concentré sur une poignée de trades attire l'attention du desk de risque avant le passage en compte financé.",
          trap: "Réussir l'objectif en un ou deux trades exceptionnels peut retarder ou compliquer l'activation du compte financé.",
          consequence: 'Revue manuelle supplémentaire avant financement, dans certains cas.',
          severity: 'info',
        },
      ],
      sizes: [
        { value: 50_000,  label: '$50,000',  fee: 137, profitSplit: 90 },
        { value: 100_000, label: '$100,000', fee: 167, profitSplit: 90 },
      ],
      accountTypes: ['Static Account'],
      currencies:   ['USD'],
      leverages:    ['N/A'],
    },
  ],
}

// ── FundingPips ───────────────────────────────────────────────────────────────

const fundingPips: PropFirm = {
  id: 'fundingpips',
  name: 'FundingPips',
  tagline: 'Sans exigence de jours minimum',
  description: "Challenge MT5 sans nombre minimum de jours de trading, avec règle de consistance sur le meilleur jour.",
  accentColor: '#0ea5e9',
  stats: [
    { label: 'Plateforme',   value: 'MT5' },
    { label: 'Split max',    value: '90%' },
  ],
  challenges: [
    {
      id: 'fundingpips-two-step',
      name: 'Two-Step Challenge',
      description: 'Évaluation en deux phases, sans exigence de nombre minimum de jours de trading.',
      badge: '2 étapes',
      badgeColor: 'bg-sky-500/10 text-sky-400',
      rules: [
        { id: 'fp-2s-dd',  type: 'daily_drawdown', label: 'Perte journalière max', description: "Perte maximale autorisée en une seule journée de trading.", limitPct: 5, limit: '5%' },
        { id: 'fp-2s-mdd', type: 'max_drawdown',   label: 'Perte totale max',      description: 'Perte maximale cumulée par rapport au capital initial.', limitPct: 10, limit: '10%' },
        { id: 'fp-2s-pt',  type: 'profit_target',  label: 'Objectif de profit',    description: 'Gain requis pour valider cette étape.', limitPct: 8, limit: '8%' },
        { id: 'fp-2s-cons', type: 'consistency',   label: 'Règle de consistance',  description: "Part maximale du profit total pouvant provenir d'une seule journée.", limitPct: 30, limit: '30%' },
      ],
      hiddenRules: [
        {
          id: 'fp-2s-copy',
          title: 'Trading copié ou mutualisé interdit',
          description: 'Les stratégies copiées entre plusieurs comptes du même trader ou de traders différents sont interdites.',
          trap: "Utiliser un copieur de trades entre un compte personnel et le compte challenge semble pratique mais constitue une violation des conditions.",
          consequence: 'Disqualification du challenge ou clôture du compte financé.',
          severity: 'critique',
        },
        {
          id: 'fp-2s-news',
          title: "Restriction sur certains instruments pendant les news",
          description: "Certains instruments à fort spread sont restreints dans les minutes qui entourent une annonce macro majeure.",
          trap: "Ouvrir une position juste avant une publication à fort impact sur un instrument restreint sans le savoir.",
          consequence: 'Annulation du trade concerné, avertissement en cas de récidive.',
          severity: 'info',
        },
      ],
      sizes: [
        { value: 5_000,   label: '$5,000',   fee: 39,  profitSplit: 80 },
        { value: 10_000,  label: '$10,000',  fee: 59,  profitSplit: 80 },
        { value: 25_000,  label: '$25,000',  fee: 139, profitSplit: 80 },
        { value: 50_000,  label: '$50,000',  fee: 249, profitSplit: 80 },
        { value: 100_000, label: '$100,000', fee: 439, profitSplit: 90 },
      ],
      accountTypes: ['Standard', 'Rapid'],
      currencies:   ['USD', 'EUR'],
      leverages:    ['1:100', '1:50'],
    },
    {
      id: 'fundingpips-instant',
      name: 'Instant Funding',
      description: 'Accès immédiat à un compte financé, sans phase de challenge, en échange de règles de risque plus strictes.',
      badge: 'Sans challenge',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
      rules: [
        { id: 'fp-in-dd',   type: 'daily_drawdown', label: 'Perte journalière max', description: 'Perte maximale autorisée en une seule journée de trading.', limitPct: 4, limit: '4%' },
        { id: 'fp-in-mdd',  type: 'max_drawdown',   label: 'Perte totale max',      description: 'Perte maximale cumulée par rapport au capital initial.', limitPct: 8, limit: '8%' },
        { id: 'fp-in-cons', type: 'consistency',    label: 'Règle de consistance',  description: "Part maximale du profit total pouvant provenir d'une seule journée.", limitPct: 20, limit: '20%' },
      ],
      hiddenRules: [
        {
          id: 'fp-in-payout',
          title: 'Premier retrait plafonné',
          description: 'Le tout premier retrait après activation du compte est plafonné à un montant réduit, indépendamment du profit réalisé.',
          trap: "Prévoir un premier retrait équivalent au profit total réalisé alors qu'un plafond réduit s'applique à ce premier paiement.",
          consequence: 'Demande de retrait partiellement refusée ou reportée au cycle suivant.',
          severity: 'important',
        },
      ],
      sizes: [
        { value: 5_000,  label: '$5,000',  fee: 89,  profitSplit: 80 },
        { value: 10_000, label: '$10,000', fee: 159, profitSplit: 80 },
        { value: 25_000, label: '$25,000', fee: 339, profitSplit: 80 },
      ],
      accountTypes: ['Instant'],
      currencies:   ['USD', 'EUR'],
      leverages:    ['1:50', '1:30'],
    },
  ],
}

export const PROP_FIRMS: PropFirm[] = [ftmo, apexFunded, fundingPips]

export function getPropFirm(id: string): PropFirm | undefined {
  return PROP_FIRMS.find(f => f.id === id)
}

export function getChallenge(firmId: string, challengeId: string): PropFirmChallenge | undefined {
  return getPropFirm(firmId)?.challenges.find(c => c.id === challengeId)
}
