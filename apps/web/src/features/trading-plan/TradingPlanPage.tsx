'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type BulletItem  = { label?: string; text: string }
type TableRow    = { cells: string[]; danger?: boolean; warning?: boolean; info?: boolean }

type Section =
  | { kind: 'intro';   text: string }
  | { kind: 'bullets'; title: string; items: BulletItem[] }
  | { kind: 'table';   title?: string; headers: string[]; rows: TableRow[] }
  | { kind: 'rules';   items: { n: number; title: string; text: string }[] }
  | { kind: 'setups';  items: { dir: 'LONG' | 'SHORT'; title: string; detail: string; rr: string }[] }
  | { kind: 'errors';  items: { label: string; desc: string; fix: string }[] }

interface Phase {
  number:      number
  title:       string
  subtitle:    string
  accent:      string
  sections:    Section[]
  metrics:     { label: string; value: string; accent?: string }[]
}

// ── Phase data ────────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  // ── Phase 1 ────────────────────────────────────────────────────────────────
  {
    number:   1,
    title:    'Fondation mentale et cadre de travail',
    subtitle: 'Avant de toucher un seul graphique — construire la bonne base',
    accent:   '#6B63D4',
    sections: [
      {
        kind: 'bullets',
        title: 'Les 3 vérités absolues du trading professionnel',
        items: [
          {
            label: 'Le trading est un jeu de probabilités',
            text: 'Pas de certitudes. Chaque trade est un échantillon d\'une série de 100. Évalue ta stratégie sur 100 trades, jamais sur 3 trades isolés. Un bon trader ne juge pas un trade individuel — il juge le processus sur un grand nombre d\'échantillons.',
          },
          {
            label: 'Le résultat ≠ qualité de la décision',
            text: 'Un bon trade peut perdre, un mauvais peut gagner. C\'est la variance. Un trader professionnel juge la qualité de son process, pas le résultat de chaque trade individuel. Exécuter un bon setup qui perd reste une bonne exécution.',
          },
          {
            label: 'La régularité bat la performance',
            text: '2% par mois pendant 36 mois = +106% sur le capital. Un mois exceptionnel à +50% suivi d\'un blowout = zéro. La consistance est la seule métrique qui compte sur le long terme.',
          },
        ],
      },
      {
        kind: 'table',
        title: 'Environnement de travail',
        headers: ['Outil', 'Usage', 'Priorité'],
        rows: [
          { cells: ['TradingView Pro', 'Graphiques multi-timeframe, alertes, replay', 'Obligatoire'], info: true },
          { cells: ['Forex Factory', 'Calendrier économique — vérifier chaque matin', 'Obligatoire'], info: true },
          { cells: ['Notion / Excel', 'Journal de trading — noter chaque trade sans exception', 'Obligatoire'], info: true },
          { cells: ['TraderSync', 'Analytics automatisées sur ton historique de trades', 'Recommandé'] },
          { cells: ['Investing.com', 'Données macro, indices corrélés (SPX, DOW)', 'Utile'] },
        ],
      },
      {
        kind: 'bullets',
        title: 'Ton Playbook — le document fondateur',
        items: [
          {
            label: 'Vision & objectifs',
            text: 'Pourquoi tu trades, quel est ton objectif financier à 6 mois / 1 an / 3 ans, quel est ton capital de départ.',
          },
          { label: 'Règles d\'entrée',    text: 'Les exactes conditions pour entrer un trade — aucune ambiguïté tolérée.' },
          { label: 'Règles de sortie',    text: 'SL, TP, trailing, partial close — tout est défini avant l\'entrée.' },
          { label: 'Règles de risque',    text: 'Taille de position, stop journalier, conditions d\'arrêt.' },
          { label: 'Horaires de trading', text: 'Les fenêtres où tu as le droit de trader — et les zones interdites.' },
          { label: 'Liste des interdictions', text: 'Comportements prohibés : revenge trade, move du SL, FOMO, overtrading.' },
        ],
      },
    ],
    metrics: [
      { label: 'Durée minimale', value: '1 semaine' },
      { label: 'Livrable clé',   value: 'Playbook v1', accent: '#f59e0b' },
      { label: 'Engagement',     value: '100%',        accent: '#10b981' },
    ],
  },

  // ── Phase 2 ────────────────────────────────────────────────────────────────
  {
    number:   2,
    title:    'Lecture de la structure de marché',
    subtitle: 'Comprendre où tu es avant de savoir où aller',
    accent:   '#10b981',
    sections: [
      {
        kind: 'intro',
        text: 'Le principe fondamental : le timeframe supérieur (HTF) dicte le biais. Le timeframe inférieur (LTF) sert uniquement à affiner l\'entrée dans la direction du HTF. Trader contre le HTF est la cause n°1 de pertes chez les traders intermédiaires.',
      },
      {
        kind: 'table',
        title: 'La hiérarchie des timeframes — lire du grand vers le petit',
        headers: ['Timeframe', 'Rôle', 'Ce qu\'on cherche', 'Temps passé'],
        rows: [
          { cells: ['Daily / H4', 'Biais directionnel',       'Tendance globale HH/HL ou LH/LL',       '10 min/jour'] },
          { cells: ['H1',         'Structure intermédiaire',  'Zones de valeur : OB, FVG, liquidity',  '10 min/jour'] },
          { cells: ['30min',      'Timing d\'entrée',         'Confirmation setup, BB, structure',      '20 min/session'] },
          { cells: ['15min',      'Confirmation LTF',         'Engulfing, rejet wick, BOS',            '5 min/trade'] },
          { cells: ['5min',       'Exécution fine',           'Trigger précis, lecture momentum',      'Au moment de l\'entrée'] },
        ],
      },
      {
        kind: 'bullets',
        title: 'Les 4 zones clés à identifier chaque matin',
        items: [
          {
            label: 'Order Block (OB)',
            text: 'Dernière bougie haussière avant un move baissier fort (OB baissier) ou dernière bougie baissière avant un move haussier fort (OB haussier). Ces zones représentent des ordres institutionnels non remplis. Le marché y revient souvent pour les combler.',
          },
          {
            label: 'Fair Value Gap (FVG)',
            text: 'Gap créé entre les mèches de 3 bougies consécutives lors d\'un move fort. Zone d\'inefficacité que le marché cherche à combler. Se trade en attente du retour en zone puis confirmation de rebond.',
          },
          {
            label: 'Previous Day High/Low (PDH/PDL)',
            text: 'Les plus hauts et plus bas de la session précédente sont des aimants à liquidité sur NAS100. Les stops des traders sont concentrés à ces niveaux — le marché les chasse souvent avant de partir dans la vraie direction.',
          },
          {
            label: 'Niveaux psychologiques ronds',
            text: 'Sur NAS100 : 30 000 / 30 500 / 31 000 / 31 500. La liquidité est concentrée sur ces niveaux ronds. Ils agissent comme support/résistance naturels et sont des zones de prise de profit institutionnelle.',
          },
        ],
      },
      {
        kind: 'table',
        title: 'Identifier la tendance — méthode HH/HL / LH/LL',
        headers: ['Structure', 'Biais', 'Action', 'NE PAS faire'],
        rows: [
          { cells: ['Higher High + Higher Low (HH/HL)', 'HAUSSIER', 'Chercher des longs sur OB/FVG', 'Shorter contre la tendance'], info: true },
          { cells: ['Lower High + Lower Low (LH/LL)',   'BAISSIER', 'Chercher des shorts sur OB/FVG','Longer contre la tendance'], warning: true },
          { cells: ['Highs égaux + Lows égaux',          'RANGE',    'Attendre cassure / ne pas trader', 'Forcer un trade en range'], danger: false },
        ],
      },
    ],
    metrics: [
      { label: 'Durée', value: '2 semaines' },
      { label: 'Pratique quotidienne', value: 'Identifier zones avant ouverture', accent: '#10b981' },
      { label: 'Objectif', value: 'Lire sans indicateurs', accent: '#f59e0b' },
    ],
  },

  // ── Phase 3 ────────────────────────────────────────────────────────────────
  {
    number:   3,
    title:    'Construction des setups d\'entrée',
    subtitle: 'Définir exactement quand et comment entrer — pas avant',
    accent:   '#f59e0b',
    sections: [
      {
        kind: 'intro',
        text: 'Un setup valide exige MINIMUM 3 éléments simultanément. Si un seul manque : pas de trade. Cette règle seule éliminera 80% de tes mauvais trades.',
      },
      {
        kind: 'table',
        title: 'La règle des 3 confluences — obligatoire',
        headers: ['Confluence', 'Critère', 'Explication'],
        rows: [
          { cells: ['Confluence 1', 'Biais HTF (H1/H4/Daily)', 'La direction globale est claire — HH/HL (long) ou LH/LL (short). Ne jamais trader contre le HTF.'], info: true },
          { cells: ['Confluence 2', 'Zone de valeur identifiée', 'Le prix est sur un OB, un FVG, un PDH/PDL, ou un niveau psychologique fort. Entrée en zone uniquement.'], info: true },
          { cells: ['Confluence 3', 'Confirmation LTF', 'Signal sur 5min ou 15min : engulfing, rejet wick, break of structure (BOS), double bottom/top.'], info: true },
        ],
      },
      {
        kind: 'setups',
        items: [
          {
            dir: 'LONG',
            title: 'Rejet Order Block haussier en tendance HTF',
            detail: 'Biais H4 haussier + prix sur OB haussier + engulfing bullish 15min | SL : sous le bas de l\'OB',
            rr: '1:3',
          },
          {
            dir: 'LONG',
            title: 'FVG bullish + Previous Day Low hold',
            detail: 'FVG non rempli + PDL tient comme support + wick rejection 5min | SL : sous le PDL',
            rr: '1:2.5',
          },
          {
            dir: 'SHORT',
            title: 'Rejet résistance majeure + lower high confirmé',
            detail: 'Biais H4 baissier + prix sur résistance + double top 15min | SL : au-dessus du dernier HH',
            rr: '1:3',
          },
          {
            dir: 'SHORT',
            title: 'Break of Structure baissier + retest OB',
            detail: 'BOS baissier confirmé + retest de l\'OB baissier + rejection 5min | SL : au-dessus de l\'OB',
            rr: '1:2',
          },
        ],
      },
      {
        kind: 'table',
        title: 'Fenêtres horaires optimales — NAS100',
        headers: ['Session', 'Horaire UTC', 'Caractéristiques', 'Action'],
        rows: [
          { cells: ['London Open',     '08h00 – 10h00', 'Manipulation des niveaux de nuit, premier move directionnel', 'Surveiller, attendre confirmation'] },
          { cells: ['NY Open',         '13h30 – 16h00', 'Volume maximal, mouvements les plus propres, meilleure liquidité', 'Session principale — setups prioritaires'], info: true },
          { cells: ['NY Continuation', '16h00 – 19h00', 'Continuation du move NY, tendance souvent maintenue', 'Trailing SL, gestion de position'] },
          { cells: ['DEAD ZONE',       '11h30 – 13h30', 'Faible liquidité, faux moves, spreads élargis', 'INTERDICTION de trader'], danger: true },
          { cells: ['Nuit asiatique',  '20h00 – 07h00', 'Très faible liquidité, moves aléatoires', 'INTERDICTION de trader'], danger: true },
        ],
      },
    ],
    metrics: [
      { label: 'R:R minimum',         value: '1:2' },
      { label: 'Confluences minimum', value: '3',            accent: '#f59e0b' },
      { label: 'Setups validés',      value: '4 patterns',   accent: '#10b981' },
    ],
  },

  // ── Phase 4 ────────────────────────────────────────────────────────────────
  {
    number:   4,
    title:    'Gestion du risque — le moteur de la survie',
    subtitle: 'La seule chose qui garantit que tu seras encore là dans 1 an',
    accent:   '#ef4444',
    sections: [
      {
        kind: 'rules',
        items: [
          {
            n: 1,
            title: '1% maximum par trade',
            text: 'Calcule la taille de position depuis le SL, jamais en lots fixes. Formule : Taille = (Capital × 1%) ÷ Distance SL en points. Un compte de 10 000€ avec un SL de 50 points = 2 lots mini maximum.',
          },
          {
            n: 2,
            title: '−2% stop journalier absolu',
            text: '2 pertes de 1% = fin de trading pour la journée. Ferme ta plateforme. Sortir, faire autre chose. Cette règle seule empêche 90% des blowouts.',
          },
          {
            n: 3,
            title: 'R:R minimum 1:2 obligatoire',
            text: 'Calculer le R:R avant d\'entrer le trade. Si l\'objectif ne permet pas 1:2, le trade n\'existe pas. Un seul trade à 1:1 dans ta session et tu travailles à perte sur le long terme.',
          },
          {
            n: 4,
            title: 'Jamais modifier le SL vers le bas',
            text: 'Le SL représente l\'invalidation de ton analyse. Si le marché l\'atteint, c\'est que tu avais tort. Déplacer le SL vers le bas = refuser d\'accepter d\'avoir tort = comportement de perte.',
          },
          {
            n: 5,
            title: 'Maximum 3 trades par jour',
            text: 'Après 3 trades (gagnants ou perdants), stop total quelle que soit la situation. Le 4ème trade est statistiquement le plus souvent un trade émotionnel.',
          },
        ],
      },
      {
        kind: 'table',
        title: 'Gestion active des positions — maximiser les gagnants',
        headers: ['Étape', 'Quand', 'Action', 'Pourquoi'],
        rows: [
          { cells: ['Breakeven',     'Prix atteint 1:1',         'Déplacer le SL au prix d\'entrée',          'Trade gratuit — risque zéro sur le capital'] },
          { cells: ['Partial close', 'Premier TP atteint (1:1–1:1.5)', 'Fermer 50% de la position',          'Sécuriser profit, réduire pression émotionnelle'] },
          { cells: ['Trailing SL',   'Après partial close',      'Suivre les HH/HL sur 15min',               'Laisser courir les trades gagnants'], info: true },
          { cells: ['Full close',    'TP final ou structure cassée', 'Fermer 100% du reste',                 'Ne pas être gourmand — le marché peut retourner'] },
        ],
      },
      {
        kind: 'table',
        title: 'Winrate nécessaire selon le R:R — la mathématique du trading',
        headers: ['R:R', 'Winrate minimum', 'Profit Factor cible', 'Commentaire'],
        rows: [
          { cells: ['1:1',   '51%', '> 1.0', 'Insuffisant — la moindre erreur de commission = perte nette'], danger: true },
          { cells: ['1:1.5', '40%', '> 1.2', 'Limite acceptable — marge très faible'], warning: true },
          { cells: ['1:2',   '34%', '> 1.5', 'Standard élite — un trade sur 3 suffit pour gagner'], info: true },
          { cells: ['1:3',   '25%', '> 2.0', 'Optimal — 1 trade sur 4 et tu es profitable'], info: true },
          { cells: ['1:4',   '20%', '> 2.5', 'Elite — stratégies à haute précision requises'], info: true },
        ],
      },
    ],
    metrics: [
      { label: 'Risque / trade',    value: '1%',        accent: '#ef4444' },
      { label: 'Stop journalier',   value: '−2%',       accent: '#ef4444' },
      { label: 'R:R cible NAS100', value: '1:2 à 1:3', accent: '#f59e0b' },
      { label: 'Max trades/jour',   value: '3',         accent: '#6B63D4' },
    ],
  },

  // ── Phase 5 ────────────────────────────────────────────────────────────────
  {
    number:   5,
    title:    'Protocole d\'exécution quotidien',
    subtitle: 'La routine qui transforme une stratégie en résultats',
    accent:   '#6B63D4',
    sections: [
      {
        kind: 'bullets',
        title: 'Pre-market — 30 min avant ouverture (07h30–08h00 UTC)',
        items: [
          { label: 'Calendrier économique', text: 'Y a-t-il un événement majeur ? NFP / FOMC / CPI / PMI → réduire taille de 50% ou ne pas trader. Vérifier Forex Factory ou Investing.com.' },
          { label: 'Analyse HTF Daily',     text: 'Ouvrir le Daily : la tendance s\'est-elle maintenue ? Y a-t-il une zone clé touchée ? Mettre à jour le biais.' },
          { label: 'Analyse H4',            text: 'Confirmer le biais H4. Identifier les OB/FVG/niveaux encore actifs. Mettre à jour ta liste de zones.' },
          { label: 'Construire les scénarios', text: '"Si le prix touche X → long avec SL Y et TP Z" — "Si le prix touche A → short avec SL B et TP C". Écrire ces scénarios avant d\'ouvrir la session.' },
          { label: 'Configurer les alertes', text: 'Mettre des alertes TradingView sur les zones identifiées. Ne pas rester fixé sur l\'écran à attendre.' },
        ],
      },
      {
        kind: 'bullets',
        title: 'Session de trading — 08h00 à 19h00 UTC',
        items: [
          { label: 'Attendre le setup',     text: 'Si après 90 minutes le setup n\'arrive pas, le marché ne donne rien. Passer à autre chose. L\'absence de trade EST une décision.' },
          { label: 'Exécuter sans hésitation', text: 'Le setup correspond au plan : entrer. L\'hésitation après signal valide = erreur de process. Si tu hésites, c\'est que le setup n\'était pas assez clair → revoir la Phase 3.' },
          { label: 'Gestion en cours',      text: 'Appliquer le protocole : breakeven à 1:1, partial close, trailing. Ne pas regarder les P&L en temps réel — regarder la structure.' },
          { label: 'Règle des 3 trades',    text: 'Après 3 trades (peu importe le résultat), fermer la plateforme de trading. Continuer à analyser en read-only si souhaité.' },
        ],
      },
      {
        kind: 'bullets',
        title: 'Post-session — obligatoire chaque jour',
        items: [
          { label: 'Journal immédiat',    text: 'Screenshot du trade, raison d\'entrée exacte (quel setup), émotion ressentie (1–5), résultat, ce qui s\'est passé vs le plan.' },
          { label: 'Note de qualité',     text: 'A : parfait, suivi le plan à 100%. B : quelques ajustements. C : compromis sur les règles. D : ne jamais refaire.' },
          { label: 'Review hebdomadaire', text: 'Chaque dimanche : analyser les 5 jours. Quel setup a le mieux performé ? Y a-t-il des patterns d\'erreurs récurrents ?' },
        ],
      },
      {
        kind: 'errors',
        items: [
          { label: 'FOMO entry',     desc: 'Entrer un trade parce que "ça monte vite" sans setup valide',            fix: 'Lister les setups avant l\'ouverture. Si ce n\'est pas dans la liste, ce n\'est pas un trade.' },
          { label: 'Revenge trade',  desc: 'Entrer un trade pour "récupérer" une perte',                              fix: 'Règle automatique : après 2 pertes consécutives, pause 30min minimum.' },
          { label: 'Move SL',        desc: 'Déplacer le SL vers le bas pour éviter d\'être stoppé',                  fix: 'Le SL ne se touche JAMAIS après l\'entrée. Si déclenché = l\'analyse était fausse.' },
          { label: 'Overtrading',    desc: 'Prendre des trades de mauvaise qualité pour "s\'occuper"',               fix: 'Max 3 trades par jour. Fermer TradingView après le 3ème.' },
          { label: 'Ignorer le macro', desc: 'Trader normalement pendant NFP / FOMC / CPI',                          fix: 'Vérifier Forex Factory chaque matin. Réduire ou annuler les trades les jours à impact fort.' },
        ],
      },
    ],
    metrics: [
      { label: 'Pre-market', value: '30 min' },
      { label: 'Session principale', value: '08h–19h UTC', accent: '#6B63D4' },
      { label: 'Journal', value: 'Chaque trade', accent: '#10b981' },
    ],
  },

  // ── Phase 6 ────────────────────────────────────────────────────────────────
  {
    number:   6,
    title:    'Journal de trading et backtesting',
    subtitle: 'Les données qui transforment l\'intuition en edge statistique',
    accent:   '#10b981',
    sections: [
      {
        kind: 'table',
        title: 'Template de journal — chaque trade, sans exception',
        headers: ['Champ', 'Contenu', 'Exemple'],
        rows: [
          { cells: ['Date / Heure',    'UTC, heure d\'entrée exacte',         '22/06/2026 09h15 UTC'] },
          { cells: ['Instrument',      'Asset tradé',                          'NAS100'] },
          { cells: ['Direction',       'Long ou Short',                        'Long'] },
          { cells: ['Setup',           'Quel pattern exact',                   'OB bullish H1 + FVG + engulfing 15min'] },
          { cells: ['Entrée',          'Prix d\'entrée',                       '30 133'] },
          { cells: ['Stop Loss',       'Prix + distance en points',            '30 080 (53 pts)'] },
          { cells: ['Take Profit',     'TP1 et TP2',                           'TP1: 30 291 (1:3)  TP2: 30 420 (1:5.5)'] },
          { cells: ['Résultat',        'Gain/Perte en R et en €',              '+2R = +106€'], info: true },
          { cells: ['Émotion (1–5)',   '1=calme, 5=panique',                  '2 — légère impatience à l\'entrée'] },
          { cells: ['Respect du plan', 'As-tu suivi ton plan à 100% ?',        'Oui — breakeven à 1:1, partial close à TP1'] },
          { cells: ['Note qualité',    'A / B / C / D',                        'A'], info: true },
          { cells: ['Leçon',           'Ce que tu as appris ou confirmé',      'OB H1 + FVG = confluence très fiable en NY open'] },
        ],
      },
      {
        kind: 'table',
        title: 'Métriques clés à suivre chaque semaine',
        headers: ['Métrique', 'Formule', 'Objectif', 'Alerte si'],
        rows: [
          { cells: ['Winrate',           '(Trades gagnants / Total) × 100', '40–55%',          '< 30% pendant 20+ trades'], warning: true },
          { cells: ['R:R moyen réalisé', 'R total gagné / Nb de trades',   '> 1.5',            '< 1.0'], warning: true },
          { cells: ['Profit Factor',     'Somme gains / Somme pertes',     '> 1.5 (élite > 2)','< 1.2'], warning: true },
          { cells: ['Max drawdown',      'Plus grande série de pertes',    '< 5% du capital',  '> 8%'], danger: true },
          { cells: ['Série de pertes',   'Plus grand nb de pertes à la suite', '< 4 trades',   '5+ trades = review obligatoire'], danger: true },
          { cells: ['Best setup',        'Setup avec le meilleur PF',      'Focus dessus',     'Si PF < 1 → retirer le setup'], info: true },
        ],
      },
      {
        kind: 'bullets',
        title: 'Protocole de backtesting — valider avant le réel',
        items: [
          { label: 'Minimum 100 trades',        text: 'Ne pas trader un nouveau setup en réel sans 100 trades de backtest. Statistiquement, 30 trades ne sont pas suffisants pour valider un edge.' },
          { label: 'Bar Replay TradingView',     text: 'Utiliser l\'outil Bar Replay pour rejouer le marché en temps réel. Pratiquer l\'exécution comme en live — ne pas tricher en regardant le futur.' },
          { label: 'Mêmes règles qu\'en live',  text: 'Appliquer exactement les règles du playbook : SL, TP, taille, conditions d\'entrée. Un backtest "flexible" ne vaut rien.' },
          { label: 'Documenter chaque trade',   text: 'Même en backtest, noter chaque trade dans le journal. Les patterns apparaissent seulement sur de grosses données.' },
          { label: 'Période minimum : 3 mois',  text: 'Backtester sur au minimum 3 mois de données. Inclure des périodes volatiles (NFP, FOMC) et des périodes calmes.' },
        ],
      },
    ],
    metrics: [
      { label: 'Backtest minimum',    value: '100 trades' },
      { label: 'Profit Factor cible', value: '> 1.5',   accent: '#10b981' },
      { label: 'Durée backtest',      value: '3 mois+',  accent: '#f59e0b' },
    ],
  },

  // ── Phase 7 ────────────────────────────────────────────────────────────────
  {
    number:   7,
    title:    'Scale et progression vers le trading professionnel',
    subtitle: 'Quand et comment grossir — le chemin vers le pro',
    accent:   '#f59e0b',
    sections: [
      {
        kind: 'table',
        title: 'Les 4 niveaux du trader — progression structurée',
        headers: ['Niveau', 'Conditions pour y entrer', 'Durée min.', 'Objectif', 'Passer au suivant si'],
        rows: [
          { cells: ['1 — Démo',           'Playbook écrit, stratégie définie', '3 mois', 'Exécuter sans émotions, valider le process', 'Profit Factor > 1.5 sur 100 trades'] },
          { cells: ['2 — Petit réel',     '3 mois de démo profitable',         '3 mois', 'Gérer les émotions avec argent réel',         '3 mois consécutifs profitables'] },
          { cells: ['3 — Capital standard','3 mois profitable en petit réel',  '6 mois+','Maximiser le edge, optimiser',               'Drawdown < 5%, PF > 2.0'], info: true },
          { cells: ['4 — Prop Firm',      'Track record 6 mois+, discipline totale', 'Continu', 'Capital externe, partage des profits 80/20', 'Résultats constants, règles strictes'], info: true },
        ],
      },
      {
        kind: 'table',
        title: 'Les Prop Firms — trader avec du capital externe',
        headers: ['Firm', 'Capital max', 'Partage profits', 'Drawdown max', 'Particularité'],
        rows: [
          { cells: ['FTMO',           '200 000€', '90%',      '10% max DD',   'Le plus connu, règles strictes'] },
          { cells: ['MyFundedFX',     '200 000€', '80–85%',   '12% max DD',   'Plus flexible, scaling rapide'] },
          { cells: ['The5ers',        '100 000$', '50–100%',  '6% daily DD',  'Démarrage immédiat sans challenge'] },
          { cells: ['E8 Funding',     '250 000$', '80%',      '8% max DD',    'Scaling jusqu\'à 1M, règles claires'] },
          { cells: ['True Forex',     '200 000$', '80%',      '10% max DD',   'Bon pour NAS100 / Indices'] },
        ],
      },
      {
        kind: 'bullets',
        title: 'Review mensuelle — optimisation continue',
        items: [
          { label: 'Quel setup est le plus rentable ?', text: 'Identifier le Profit Factor de chaque setup. Concentrer 80% des trades sur les 2 meilleurs setups. Retirer les setups avec PF < 1.' },
          { label: 'Quelle session performe le mieux ?', text: 'Comparer London Open vs NY Open vs Continuation. Éliminer les sessions où tu perds régulièrement.' },
          { label: 'Y a-t-il des patterns d\'erreurs ?', text: 'Regarder les trades notés C et D. S\'il y a un pattern récurrent (ex: "trade avant événement macro"), ajouter une règle d\'interdiction dans le playbook.' },
          { label: 'Le profit factor monte-t-il ?', text: 'Si PF > 2.0 sur 3 mois consécutifs = setup élite, ne rien changer. Si PF stagne, revoir la gestion des positions, pas les entrées.' },
          { label: 'Es-tu prêt à grossir ?', text: 'Condition pour doubler la taille : 3 mois profitables consécutifs avec drawdown < 5%. Jamais grossir après un bon mois isolé.' },
        ],
      },
    ],
    metrics: [
      { label: 'Capital Prop max',  value: '200 000€',    accent: '#f59e0b' },
      { label: 'Profit sharing',    value: '80–90%',      accent: '#10b981' },
      { label: 'PF élite',          value: '> 2.0',       accent: '#6B63D4' },
      { label: 'Timeline pro',      value: '12–18 mois' },
    ],
  },
]

// ── Rendering helpers ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  )
}

function BulletsSection({ section }: { section: Extract<Section, { kind: 'bullets' }> }) {
  return (
    <div>
      <SectionTitle>{section.title}</SectionTitle>
      <ul className="space-y-3">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
            <div>
              {item.label && <span className="text-xs font-black text-foreground">{item.label} — </span>}
              <span className="text-xs text-muted-foreground leading-relaxed">{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TableSection({ section }: { section: Extract<Section, { kind: 'table' }> }) {
  return (
    <div>
      {section.title && <SectionTitle>{section.title}</SectionTitle>}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-[hsl(var(--accent))]">
              {section.headers.map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-border last:border-0',
                  row.danger  ? 'bg-red-50'    :
                  row.warning ? 'bg-amber-50'  :
                  row.info    ? 'bg-emerald-50/50' : 'bg-white',
                )}
              >
                {row.cells.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      'px-3 py-2.5 leading-relaxed',
                      j === 0 ? 'font-bold text-foreground' : 'text-muted-foreground',
                      row.danger  ? 'text-red-700'    :
                      row.warning ? 'text-amber-700'  : '',
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RulesSection({ section }: { section: Extract<Section, { kind: 'rules' }> }) {
  return (
    <div>
      <SectionTitle>Les 5 règles absolues — non négociables</SectionTitle>
      <div className="space-y-3">
        {section.items.map((rule) => (
          <div key={rule.n} className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white">
              {rule.n}
            </div>
            <div>
              <p className="text-xs font-black text-foreground">{rule.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{rule.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SetupsSection({ section }: { section: Extract<Section, { kind: 'setups' }> }) {
  return (
    <div>
      <SectionTitle>Les 4 setups élite sur NAS100</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {section.items.map((s, i) => (
          <div
            key={i}
            className={cn(
              'rounded-xl border p-4',
              s.dir === 'LONG' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn(
                'rounded-md px-2 py-0.5 text-[9px] font-black',
                s.dir === 'LONG' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
              )}>
                {s.dir}
              </span>
              <span className={cn(
                'text-sm font-black',
                s.dir === 'LONG' ? 'text-emerald-600' : 'text-red-600',
              )}>
                {s.rr}
              </span>
            </div>
            <p className="mt-2 text-xs font-black text-foreground">{s.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{s.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorsSection({ section }: { section: Extract<Section, { kind: 'errors' }> }) {
  return (
    <div>
      <SectionTitle>Les 5 erreurs fatales — comportements interdits</SectionTitle>
      <div className="space-y-2.5">
        {section.items.map((e, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-3.5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-red-600">{e.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{e.desc}</p>
                <div className="mt-2 flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                  <p className="text-[11px] font-medium text-foreground">{e.fix}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhaseMetrics({ metrics }: { metrics: Phase['metrics'] }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-[10px] text-muted-foreground">{m.label}</p>
          <p
            className="mt-0.5 text-sm font-black"
            style={{ color: m.accent ?? 'hsl(var(--foreground))' }}
          >
            {m.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TradingPlanPage() {
  const [activePhase, setActivePhase] = useState(0)
  const phase = PHASES[activePhase]!

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h1 className="text-lg font-black text-foreground">Stratégie NAS100 Élite</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan A → Z · 7 Phases · De la fondation au trading professionnel
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Phases',        value: '7',         color: '#6B63D4' },
          { label: 'R:R cible',     value: '1:2+',      color: '#10b981' },
          { label: 'Risque max',    value: '1%',         color: '#ef4444' },
          { label: 'Timeframe',     value: '30 min',     color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3.5">
            <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            <div>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Phase tabs */}
      <div className="overflow-x-auto pb-1 [scrollbar-width:none]">
        <div className="flex gap-2 min-w-max">
          {PHASES.map((p, i) => (
            <button
              key={p.number}
              type="button"
              onClick={() => setActivePhase(i)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all',
                activePhase === i
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-border bg-white text-muted-foreground hover:text-foreground hover:border-[hsl(var(--primary)/0.3)]',
              )}
              style={activePhase === i ? { background: p.accent } : {}}
            >
              <span className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                activePhase === i ? 'bg-white/25 text-white' : 'bg-[hsl(var(--accent))] text-muted-foreground',
              )}>
                {p.number}
              </span>
              <span className="hidden sm:inline">{p.title.split(' — ')[0]}</span>
              <span className="sm:hidden">Phase {p.number}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phase content */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">

        {/* Phase header */}
        <div
          className="px-6 py-5"
          style={{ background: `linear-gradient(135deg, ${phase.accent}18 0%, ${phase.accent}08 100%)`, borderBottom: `3px solid ${phase.accent}` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white"
              style={{ background: phase.accent }}
            >
              {phase.number}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-foreground">{phase.title}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{phase.subtitle}</p>
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 sm:flex text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Instrument : NAS100 · 30min</span>
            </div>
          </div>
          {/* Phase progress */}
          <div className="mt-4 flex items-center gap-2">
            {PHASES.map((p, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all"
                style={{ background: i <= activePhase ? phase.accent : 'hsl(var(--border))' }}
              />
            ))}
            <span className="shrink-0 text-[10px] font-bold text-muted-foreground ml-1">
              {activePhase + 1}/7
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-border">
          {phase.sections.map((section, i) => (
            <div key={i} className="px-6 py-5">
              {section.kind === 'intro'   && <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>}
              {section.kind === 'bullets' && <BulletsSection section={section} />}
              {section.kind === 'table'   && <TableSection   section={section} />}
              {section.kind === 'rules'   && <RulesSection   section={section} />}
              {section.kind === 'setups'  && <SetupsSection  section={section} />}
              {section.kind === 'errors'  && <ErrorsSection  section={section} />}
            </div>
          ))}
        </div>

        {/* Metrics footer */}
        <div className="px-6 pb-6">
          <PhaseMetrics metrics={phase.metrics} />
        </div>
      </div>

      {/* Navigation prev / next */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActivePhase(p => Math.max(0, p - 1))}
          disabled={activePhase === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground disabled:opacity-30"
        >
          ← Phase précédente
        </button>

        <div className="flex items-center gap-2">
          {PHASES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActivePhase(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                activePhase === i ? 'w-6 bg-[hsl(var(--primary))]' : 'w-2 bg-border hover:bg-muted-foreground/40',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setActivePhase(p => Math.min(PHASES.length - 1, p + 1))}
          disabled={activePhase === PHASES.length - 1}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground disabled:opacity-30"
        >
          Phase suivante <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Récapitulatif règles d'or */}
      <div className="rounded-2xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
          <p className="text-sm font-black text-foreground">Récapitulatif — les 10 règles d'or</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { n: 1,  text: 'Trader dans le sens du HTF — toujours. Le LTF confirme, le HTF décide.' },
            { n: 2,  text: 'Minimum 3 confluences pour entrer. OB/FVG + structure + confirmation LTF.' },
            { n: 3,  text: '1% de risque maximum par trade. Calculé depuis le SL, jamais en lots fixes.' },
            { n: 4,  text: '−2% de perte = stop journalier absolu. Fermer la plateforme, pas de négociation.' },
            { n: 5,  text: 'R:R minimum 1:2 pour chaque setup. En dessous, le trade n\'existe pas.' },
            { n: 6,  text: 'Ne jamais modifier le SL vers le bas. Le SL = invalidation. Respecter l\'analyse.' },
            { n: 7,  text: 'Maximum 3 trades par jour. Le 4ème est toujours émotionnel.' },
            { n: 8,  text: 'Journal pour chaque trade sans exception. Sans données, pas de progression.' },
            { n: 9,  text: 'Vérifier le calendrier macro chaque matin. NFP/FOMC = réduire ou ne pas trader.' },
            { n: 10, text: 'Backtester 100 trades avant le réel. Valider l\'edge statistiquement.' },
          ].map((r) => (
            <div key={r.n} className="flex items-start gap-3 rounded-xl border border-[hsl(var(--primary)/0.15)] bg-white p-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-black text-white">
                {r.n}
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/70 italic">
          La stratégie la plus rentable est celle que tu appliques avec une discipline absolue — pas nécessairement la plus complexe.
        </p>
      </div>

    </div>
  )
}
