import type { Metadata } from 'next'

import { LegalCard, LegalGrid, LegalList, LegalPage, LegalSection } from '../_components/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | MERKURE',
  description: 'Traitements de données personnelles réalisés par MERKURE.',
}

export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Données personnelles"
      title="Politique de confidentialité"
      description="Cette politique explique quelles données MERKURE traite, pourquoi elles sont utilisées, avec quels prestataires, pendant combien de temps et comment exercer vos droits."
      updatedAt="29 mai 2026"
    >
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est MERKURE, éditeur du service. Pour toute question relative à vos données personnelles ou à l’exercice de vos droits, contactez privacy@merkure.app.
        </p>
      </LegalSection>

      <LegalSection title="Données traitées">
        <LegalGrid>
          <LegalCard title="Compte et identité">
            <p>Email, prénom, nom, photo de profil, préférences d’affichage, devise, fuseau horaire et informations d’authentification.</p>
          </LegalCard>
          <LegalCard title="Données de trading">
            <p>Trades importés, comptes connectés, instruments, P&L, drawdown, stratégies, notes de journal, captures et tags fournis par l’utilisateur.</p>
          </LegalCard>
          <LegalCard title="Facturation">
            <p>Plan choisi, statut d’abonnement, identifiants client Stripe, historique de paiement et informations nécessaires à la gestion contractuelle.</p>
          </LegalCard>
          <LegalCard title="Technique et sécurité">
            <p>Journaux d’événements, adresse IP, navigateur, erreurs applicatives, traces de synchronisation et éléments nécessaires à la prévention des abus.</p>
          </LegalCard>
        </LegalGrid>
      </LegalSection>

      <LegalSection title="Finalités et bases légales">
        <LegalList
          items={[
            'Création et gestion du compte utilisateur : exécution du contrat.',
            'Import, synchronisation et analyse des trades : exécution du contrat.',
            'Génération de rapports, alertes et analyses IA : exécution du contrat et intérêt légitime d’amélioration du service.',
            'Paiement, facturation et gestion des abonnements : exécution du contrat et obligations légales comptables.',
            'Sécurité, prévention de la fraude, diagnostic technique et support : intérêt légitime de MERKURE.',
            'Communications produit ou emails de service : exécution du contrat ou intérêt légitime, selon le cas.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Connexions broker et imports">
        <p>
          Les connexions broker sont conçues pour un accès en lecture seule lorsque le broker ou le fournisseur technique le permet. MERKURE ne doit pas pouvoir passer d’ordres en votre nom.
        </p>
        <p>
          Les identifiants ou jetons nécessaires à la synchronisation sont protégés par chiffrement côté backend. Vous pouvez supprimer une connexion broker depuis votre espace compte lorsque cette fonctionnalité est disponible dans l’interface.
        </p>
      </LegalSection>

      <LegalSection title="IA et analyses automatisées">
        <p>
          MERKURE peut traiter vos données de trading et vos notes afin de produire des synthèses, signaux comportementaux, alertes de discipline et rapports personnalisés. Ces analyses sont informatives et ne constituent pas une recommandation d’investissement.
        </p>
        <p>
          Lorsque des prestataires IA sont utilisés, seules les données nécessaires à la génération de l’analyse sont transmises dans le cadre contractuel du service.
        </p>
      </LegalSection>

      <LegalSection title="Sous-traitants et destinataires">
        <p>Les données sont accessibles uniquement aux personnes habilitées de MERKURE et aux sous-traitants nécessaires au fonctionnement du service.</p>
        <LegalGrid>
          <LegalCard title="Infrastructure">
            <p>Vercel, Railway, Neon, Upstash.</p>
          </LegalCard>
          <LegalCard title="Compte, paiement et emails">
            <p>Clerk, Stripe, Resend.</p>
          </LegalCard>
          <LegalCard title="Monitoring et IA">
            <p>Sentry, Anthropic ou prestataire IA équivalent configuré par MERKURE.</p>
          </LegalCard>
          <LegalCard title="Synchronisation trading">
            <p>MetaAPI, MTConnectAPI ou connecteurs brokers activés par l’utilisateur.</p>
          </LegalCard>
        </LegalGrid>
      </LegalSection>

      <LegalSection title="Transferts hors Union européenne">
        <p>
          Certains prestataires peuvent être établis hors de l’Union européenne. Dans ce cas, MERKURE s’appuie sur les garanties prévues par le RGPD, notamment les clauses contractuelles types, les décisions d’adéquation ou les engagements contractuels équivalents du prestataire.
        </p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <LegalList
          items={[
            'Données de compte : pendant la durée d’utilisation du service, puis suppression ou archivage limité après clôture du compte.',
            'Données de trading et journal : conservées tant que le compte est actif, sauf suppression demandée ou fonctionnalité d’effacement utilisée.',
            'Factures et données comptables : jusqu’à 10 ans lorsque la réglementation l’exige.',
            'Logs techniques et sécurité : durée limitée nécessaire au diagnostic, à la sécurité et à la preuve d’événements techniques.',
            'Demandes support : durée nécessaire au traitement de la demande puis archivage proportionné.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookies, local storage et traceurs">
        <p>
          MERKURE utilise des traceurs strictement nécessaires au fonctionnement du service, notamment la session de connexion, le jeton d’authentification, le thème d’interface et certains choix d’affichage.
        </p>
        <p>
          MERKURE n’utilise pas de cookie publicitaire sur les pages actuellement livrées. Si des traceurs de mesure d’audience ou de marketing non essentiels sont ajoutés, ils devront être soumis au consentement préalable de l’utilisateur.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition au traitement et la portabilité de vos données lorsque ces droits s’appliquent.
        </p>
        <p>
          Pour exercer vos droits : privacy@merkure.app. Vous pouvez également introduire une réclamation auprès de la CNIL si vous estimez que vos droits ne sont pas respectés.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
