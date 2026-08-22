import type { TradingPlanData } from '@/lib/hooks/use-trading-plan'

/**
 * Points de départ, appliqués côté client dans le formulaire.
 * Ce ne sont pas des plans « officiels » : le trader les édite ensuite.
 */
export interface PlanTemplate {
  key:         string
  label:       string
  description: string
  plan:        TradingPlanData
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    key: 'intraday',
    label: 'Intraday discipliné',
    description: 'Sessions Londres/NY, risque serré, peu de trades',
    plan: {
      objectives: {
        main:         'Rester constant sur 3 mois',
        profitTarget: '5 % par mois',
        horizon:      '3 mois',
        focus:        'Discipline et sélectivité',
        keyMetric:    'Respect du plan > 90 %',
      },
      strategy: {
        style:      'Intraday',
        markets:    'Forex majeures, indices',
        timeframes: 'H1 pour le biais, M5 pour l’exécution',
        primary:    'Cassure de range de session',
        secondary:  'Retour à la moyenne sur extrêmes',
      },
      risk: {
        perTrade:    '0,5 %',
        daily:       '1,5 %',
        weekly:      '3 %',
        maxDrawdown: '6 %',
        minRR:       '1:2',
      },
      entryRules: [
        'Biais H1 défini avant l’ouverture',
        'Niveau clé identifié et annoté',
        'Confirmation sur M5 (rejet ou cassure nette)',
        'Stop placé avant l’entrée',
      ],
      exitRules: [
        'Premier objectif à +1R, sortie de la moitié',
        'Stop remonté à l’équilibre après +1R',
        'Sortie complète si la structure s’invalide',
      ],
      filters: [
        'Pas de trade 15 min avant/après une news à impact élevé',
        'Pas plus de 3 trades par jour',
        'Arrêt de la journée après 2 pertes consécutives',
      ],
      checklist: [
        'Le setup est-il dans mon plan ?',
        'Mon risque est-il calculé et saisi ?',
        'Le ratio est-il au moins de 1:2 ?',
        'Suis-je serein, sans besoin de me refaire ?',
      ],
      mindset: [
        'Je suis un exécutant, pas un prévisionniste',
        'Une perte respectant le plan est un bon trade',
        'Ne pas trader est une position',
      ],
    },
  },
  {
    key: 'swing',
    label: 'Swing patient',
    description: 'Peu de positions, horizon plusieurs jours',
    plan: {
      objectives: {
        main:         'Capturer les mouvements de fond',
        profitTarget: '8 % par trimestre',
        horizon:      '6 mois',
        focus:        'Patience et qualité des points d’entrée',
        keyMetric:    'Ratio gain/perte moyen > 2',
      },
      strategy: {
        style:      'Swing',
        markets:    'Indices, matières premières',
        timeframes: 'D1 pour le biais, H4 pour l’exécution',
        primary:    'Continuation de tendance sur repli',
        secondary:  'Retournement sur zone hebdomadaire',
      },
      risk: {
        perTrade:    '1 %',
        daily:       '2 %',
        weekly:      '4 %',
        maxDrawdown: '10 %',
        minRR:       '1:3',
      },
      entryRules: [
        'Tendance D1 clairement établie',
        'Repli sur zone de valeur identifiée à l’avance',
        'Bougie de confirmation clôturée en H4',
      ],
      exitRules: [
        'Objectif au prochain niveau hebdomadaire',
        'Stop suiveur sous les plus bas H4',
        'Sortie si la tendance D1 s’inverse',
      ],
      filters: [
        'Pas d’entrée la veille d’une décision de banque centrale',
        'Maximum 3 positions ouvertes simultanément',
      ],
      checklist: [
        'La tendance de fond est-elle avec moi ?',
        'Mon stop tient-il compte de la volatilité D1 ?',
        'Ai-je la place dans mon exposition globale ?',
      ],
      mindset: [
        'Le marché sera encore là demain',
        'Je ne cherche pas le point bas exact',
      ],
    },
  },
  {
    key: 'propfirm',
    label: 'Challenge prop firm',
    description: 'Objectif de passage, limites strictes',
    plan: {
      objectives: {
        main:         'Valider le challenge sans violer une règle',
        profitTarget: '10 % sur la phase 1',
        horizon:      '30 jours',
        focus:        'Respect des limites de perte',
        keyMetric:    'Perte journalière jamais dépassée',
      },
      strategy: {
        style:      'Intraday sélectif',
        markets:    'Forex majeures',
        timeframes: 'H1 / M15',
        primary:    'Structure de marché sur niveaux clés',
        secondary:  '—',
      },
      risk: {
        perTrade:    '0,5 %',
        daily:       '2 % (limite firme : 5 %)',
        weekly:      '4 %',
        maxDrawdown: '6 % (limite firme : 10 %)',
        minRR:       '1:2',
      },
      entryRules: [
        'Setup présent dans le plan, sans exception',
        'Risque calculé sur le capital du challenge',
        'Pas de position gardée pendant une news majeure',
      ],
      exitRules: [
        'Prise partielle à +1R',
        'Break-even systématique après +1R',
        'Clôture avant le week-end',
      ],
      filters: [
        'Arrêt immédiat à −2 % sur la journée',
        'Pas de trade le jour d’une décision de taux',
        'Pas de martingale, jamais',
      ],
      checklist: [
        'Où en suis-je de ma limite journalière ?',
        'Ce trade met-il le challenge en danger ?',
        'Mon lot est-il calculé, pas estimé ?',
      ],
      mindset: [
        'Passer le challenge est un marathon, pas un sprint',
        'Une journée sans trade est une journée sans risque de violation',
      ],
    },
  },
]
