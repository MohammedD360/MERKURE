import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  BrainCircuit,
  FileText,
  MessageSquare,
  Shield,
  Trophy,
} from 'lucide-react-native'
import { AiAnalysisBanner } from '@/src/components/AiAnalysisBanner'
import { IaHubHero } from '@/src/components/ia/IaHubHero'
import { IaModuleCard } from '@/src/components/ia/IaModuleCard'
import { PlanUpgradeCard } from '@/src/components/profile/PlanUpgradeCard'
import { Screen } from '@/src/components/ui/Screen'
import { useGenerateAiAnalysis } from '@/src/hooks/use-ai'
import { useCurrentUser } from '@/src/hooks/use-current-user'
import { useAiScore } from '@/src/hooks/use-kpis'
import { isProPlan } from '@/src/lib/plans'
import { colors, fonts } from '@/src/lib/theme'

export default function IaHubScreen() {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const aiScore = useAiScore('1M')
  const { mutate: generate, isPending } = useGenerateAiAnalysis()
  const isPro = isProPlan(user?.plan)

  return (
    <Screen
      refreshing={aiScore.isFetching}
      onRefresh={() => void aiScore.refetch()}
    >
      <Text style={styles.eyebrow}>Intelligence</Text>
      <Text style={styles.pageTitle}>IA & Analyses</Text>
      <Text style={styles.subtitle}>Coaching, rapports et insights personnalisés</Text>

      <IaHubHero
        score={aiScore.data}
        isLoading={aiScore.isLoading}
        onRefresh={() => generate({ context: 'Analyse hub IA mobile' })}
        refreshing={isPending}
      />

      <AiAnalysisBanner />

      {!isPro ? (
        <View style={styles.upgradeWrap}>
          <PlanUpgradeCard onPress={() => router.push('/settings')} />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Analyses</Text>
      <IaModuleCard
        title="Rapport de performance"
        desc="Synthèse IA de votre période, forces et axes d'amélioration"
        icon={FileText}
        featured
        badge="IA"
        badgeTone="primary"
        onPress={() => router.push('/ia/rapport')}
      />
      <IaModuleCard
        title="Analyse comportementale"
        desc="Biais cognitifs, patterns émotionnels et discipline"
        icon={BrainCircuit}
        onPress={() => router.push('/ia/rapport')}
      />

      <Text style={styles.sectionTitle}>Coaching</Text>
      <IaModuleCard
        title="Coach discipline"
        desc="Garde-fous, prévention du revenge trading et alertes"
        icon={Shield}
        badge="Prévention"
        badgeTone="amber"
        onPress={() => router.push('/ia/coach')}
      />

      <Text style={styles.sectionTitle}>Outils</Text>
      <IaModuleCard
        title="Chat IA"
        desc="Posez vos questions trading en langage naturel"
        icon={MessageSquare}
        badge="Elite"
        badgeTone="muted"
        locked={!isPro}
        onPress={() => router.push('/ia/chat')}
      />
      <IaModuleCard
        title="Prop Firm"
        desc="Conformité challenge, règles et suivi des objectifs"
        icon={Trophy}
        onPress={() => router.push('/ia/rapport')}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  pageTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground, marginTop: 4 },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 19,
  },
  upgradeWrap: { marginTop: 12, marginBottom: 4 },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 4,
  },
})