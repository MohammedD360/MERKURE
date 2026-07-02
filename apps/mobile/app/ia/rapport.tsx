import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, MoreHorizontal } from 'lucide-react-native'
import Svg, { Circle } from 'react-native-svg'
import { MiniSparkline } from '@/src/components/home/MiniSparkline'
import { useAiScore, useKpiSummary } from '@/src/hooks/use-kpis'
import { colors, fonts, radius } from '@/src/lib/theme'
import { formatMoney, formatPct } from '@/src/lib/format'

const TABS = ['Résumé', 'Performance', 'Psychologie', 'Insights'] as const
type TabKey = typeof TABS[number]

interface KeyPoint {
  label: string
  status: string
  tone: 'ok' | 'warning' | 'info'
  desc: string
}

const KEY_POINTS: KeyPoint[] = [
  { label: 'Discipline', status: 'En amélioration', tone: 'ok', desc: "Vos règles d'entrée sont mieux respectées." },
  { label: 'Gestion du risque', status: 'Excellente', tone: 'ok', desc: 'Vous risquez en moyenne 0.98% par trade.' },
  { label: 'Psychologie', status: 'À surveiller', tone: 'warning', desc: 'Vous forcez encore 1,2 trade/jour en moyenne.' },
  { label: 'Exécution', status: 'Bon', tone: 'info', desc: 'Votre timing est en progression.' },
]

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <Svg width={136} height={136}>
      <Circle cx={68} cy={68} r={r} stroke="#EDE9FE" strokeWidth={10} fill="none" />
      <Circle
        cx={68} cy={68} r={r}
        stroke={colors.primary}
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        rotation={-90}
        origin="68, 68"
      />
    </Svg>
  )
}

function toneStyle(tone: KeyPoint['tone']) {
  if (tone === 'ok') return { bg: '#DCFCE7', text: '#166534' }
  if (tone === 'warning') return { bg: '#FEF3C7', text: '#92400E' }
  return { bg: '#DBEAFE', text: '#1E40AF' }
}

export default function AnalyseIaScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('Résumé')
  const aiScore = useAiScore('1M')
  const summary = useKpiSummary('1M')

  const score = aiScore.data?.score ?? 78
  const totalPnl = summary.data?.totalPnl ?? 2450.75
  const winRate = summary.data?.winRate ?? 0.624

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Analyse IA</Text>
        <Pressable>
          <MoreHorizontal size={20} color={colors.muted} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {/* Contenu scrollable */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {aiScore.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Score Global */}
            <View style={styles.scoreSection}>
              <View style={styles.scoreRingWrap}>
                <ScoreRing score={score} />
                <View style={styles.scoreCenter}>
                  <Text style={styles.scoreNum}>{score}</Text>
                  <Text style={styles.scoreSub}>/100</Text>
                </View>
              </View>
              <View style={styles.scoreRight}>
                <View style={styles.scoreLabelBadge}>
                  <Text style={styles.scoreLabelText}>Bon</Text>
                </View>
                <Text style={styles.scoreDelta}>+12 points</Text>
                <Text style={styles.scoreDeltaSub}>vs la semaine dernière</Text>
              </View>
            </View>

            {/* Points clés */}
            <Text style={styles.sectionTitle}>Points clés</Text>
            <View style={styles.pointsCard}>
              {KEY_POINTS.map((point, i) => {
                const t = toneStyle(point.tone)
                return (
                  <View key={point.label} style={[styles.pointRow, i < KEY_POINTS.length - 1 && styles.pointRowBorder]}>
                    <View style={styles.pointTop}>
                      <Text style={styles.pointLabel}>{point.label}</Text>
                      <View style={[styles.pointBadge, { backgroundColor: t.bg }]}>
                        <Text style={[styles.pointBadgeText, { color: t.text }]}>{point.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.pointDesc}>{point.desc}</Text>
                  </View>
                )
              })}
            </View>

            {/* Performance globale */}
            <Text style={styles.sectionTitle}>Performance globale</Text>
            <View style={styles.perfCard}>
              <View style={styles.perfRow}>
                <View style={styles.perfMetric}>
                  <Text style={styles.perfLabel}>Profit Net</Text>
                  <Text style={[styles.perfValue, { color: colors.profit }]}>
                    {formatMoney(totalPnl, true).replace('€', '$')}
                  </Text>
                  <Text style={styles.perfDelta}>+18.7%</Text>
                  <MiniSparkline color={colors.profit} width={90} height={28} />
                </View>
                <View style={styles.perfDivider} />
                <View style={styles.perfMetric}>
                  <Text style={styles.perfLabel}>Win Rate</Text>
                  <Text style={styles.perfValue}>{formatPct(winRate * 100)}</Text>
                  <Text style={styles.perfDelta}>+6.2%</Text>
                  <MiniSparkline color={colors.primary} width={90} height={28} />
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 32, alignItems: 'flex-start' },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: colors.primary },
  tabLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  tabLabelActive: { fontFamily: fonts.bold, color: colors.primary },
  scroll: { padding: 20, paddingBottom: 40 },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
  },
  scoreRingWrap: { width: 136, height: 136, alignItems: 'center', justifyContent: 'center' },
  scoreCenter: { position: 'absolute', alignItems: 'center' },
  scoreNum: { fontFamily: fonts.bold, fontSize: 36, color: colors.primary },
  scoreSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  scoreRight: { alignItems: 'flex-start', gap: 6 },
  scoreLabelBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  scoreLabelText: { fontFamily: fonts.bold, fontSize: 14, color: '#166534' },
  scoreDelta: { fontFamily: fonts.bold, fontSize: 14, color: '#22C55E' },
  scoreDeltaSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 10,
    marginTop: 8,
  },
  pointsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  pointRow: { paddingVertical: 14, paddingHorizontal: 14 },
  pointRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  pointTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pointLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  pointBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pointBadgeText: { fontFamily: fonts.bold, fontSize: 10 },
  pointDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, lineHeight: 17 },
  perfCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  perfRow: { flexDirection: 'row', alignItems: 'center' },
  perfMetric: { flex: 1, alignItems: 'flex-start' },
  perfDivider: { width: 1, height: 80, backgroundColor: colors.border, marginHorizontal: 16 },
  perfLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted, marginBottom: 4 },
  perfValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground, marginBottom: 2 },
  perfDelta: { fontFamily: fonts.medium, fontSize: 11, color: '#22C55E', marginBottom: 6 },
})
