import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Sparkles, Zap } from 'lucide-react-native'
import { Card } from '@/src/components/ui/Card'
import { useGenerateAiAnalysis, useLatestAiAnalysis } from '@/src/hooks/use-ai'
import { colors, fonts, radius } from '@/src/lib/theme'

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 70 ? colors.profit : score >= 50 ? colors.amber : colors.loss
  return (
    <View style={[styles.scoreCircle, { borderColor: color }]}>
      <Text style={[styles.scoreNum, { color }]}>{score}</Text>
      <Text style={styles.scoreSub}>/100</Text>
    </View>
  )
}

export function AiAnalysisBanner() {
  const { data: entry, isLoading } = useLatestAiAnalysis()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()

  const score = entry?.score ?? null
  const strengths = entry?.insights?.strengths ?? []
  const improvements = entry?.insights?.improvements ?? []

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Sparkles size={16} color={colors.primary} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Analyse de performance</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </View>
            <Text style={styles.sub}>Insights IA sur votre dernière session</Text>
          </View>
        </View>
        <Pressable
          style={styles.refreshBtn}
          onPress={() => generate({ context: 'Analyse performance mobile' })}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Zap size={16} color={colors.primary} />
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
      ) : score != null ? (
        <View style={styles.body}>
          <ScoreCircle score={score} />
          <View style={styles.insights}>
            {strengths[0] ? (
              <Text style={styles.insightGood}>+ {strengths[0]}</Text>
            ) : null}
            {improvements[0] ? (
              <Text style={styles.insightWarn}>· {improvements[0]}</Text>
            ) : null}
            {entry?.aiAnalysis ? (
              <Text style={styles.analysis} numberOfLines={3}>
                {entry.aiAnalysis}
              </Text>
            ) : null}
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>Générez votre première analyse IA depuis le dashboard.</Text>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
  betaBadge: {
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: { fontFamily: fonts.bold, fontSize: 8, color: colors.primary, letterSpacing: 0.5 },
  sub: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flexDirection: 'row', padding: 16, gap: 14, alignItems: 'center' },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: { fontFamily: fonts.bold, fontSize: 22 },
  scoreSub: { fontFamily: fonts.regular, fontSize: 9, color: colors.muted },
  insights: { flex: 1, gap: 4 },
  insightGood: { fontFamily: fonts.medium, fontSize: 12, color: colors.profit },
  insightWarn: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  analysis: { fontFamily: fonts.regular, fontSize: 12, color: colors.foreground, lineHeight: 18, marginTop: 4 },
  empty: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, padding: 16 },
})