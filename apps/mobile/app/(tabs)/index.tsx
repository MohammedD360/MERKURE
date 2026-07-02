import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { HomeHeader } from '@/src/components/home/HomeHeader'
import { InsightDuJourCard } from '@/src/components/home/InsightDuJourCard'
import { OverviewGrid } from '@/src/components/home/OverviewGrid'
import { QuickToolsRow } from '@/src/components/home/QuickToolsRow'
import { Screen } from '@/src/components/ui/Screen'
import { useCurrentUser } from '@/src/hooks/use-current-user'
import { useLatestAiAnalysis } from '@/src/hooks/use-ai'
import { useAdvancedStats } from '@/src/hooks/use-performance'
import { useAiScore, useKpiSummary } from '@/src/hooks/use-kpis'
import { colors, fonts } from '@/src/lib/theme'

function displayFirstName(firstName?: string | null) {
  if (!firstName) return 'Alex'
  if (firstName.toLowerCase().startsWith('alex')) return 'Alex'
  return firstName
}

export default function HomeScreen() {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const summary = useKpiSummary('1M')
  const aiScore = useAiScore('1M')
  const advanced = useAdvancedStats('1M')
  const aiInsight = useLatestAiAnalysis()

  const firstName = displayFirstName(user?.firstName)
  const insightText =
    aiInsight.data?.aiAnalysis ??
    aiInsight.data?.insights?.improvements?.[0] ??
    null

  const refreshing = summary.isFetching || aiScore.isFetching || aiInsight.isFetching

  return (
    <Screen
      backgroundColor={colors.white}
      style={styles.screen}
      padded={false}
      refreshing={refreshing}
      onRefresh={() => {
        void summary.refetch()
        void aiScore.refetch()
        void advanced.refetch()
        void aiInsight.refetch()
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.content}>
        <HomeHeader
          onMenuPress={() => router.push('/(tabs)/plus')}
          onBellPress={() => router.push('/alerts')}
        />

        <Text style={styles.greeting}>Bienvenue {firstName} 👋</Text>
        <Text style={styles.greetingSub}>
          Voici votre performance et les insights IA du jour.
        </Text>

        <InsightDuJourCard
          quote={insightText}
          onCtaPress={() => router.push('/ia/rapport')}
        />

        <View style={styles.section}>
          <OverviewGrid
            isLoading={summary.isLoading}
            totalPnl={summary.data?.totalPnl ?? 2450.75}
            winRate={summary.data?.winRate ?? 0.624}
            nbTrades={summary.data?.nbTrades ?? 78}
            avgRr={advanced.data?.avgRR ?? 1.85}
            aiScore={aiScore.data?.score ?? 78}
            onVoirTout={() => router.push('/performance')}
          />
        </View>

        <View style={styles.section}>
          <QuickToolsRow onNavigate={(route) => router.push(route as never)} />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, paddingBottom: 24 },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.foreground,
    marginTop: 4,
  },
  greetingSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  section: { marginTop: 24 },
})