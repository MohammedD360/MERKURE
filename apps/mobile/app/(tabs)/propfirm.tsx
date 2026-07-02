import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CheckCircle, Clock, MoreHorizontal } from 'lucide-react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors, fonts, radius } from '@/src/lib/theme'

interface ChallengeRule {
  label: string
  status: 'ok' | 'pending'
  current: string
  limit: string
}

const RULES: ChallengeRule[] = [
  { label: 'Drawdown journalier', status: 'ok', current: '-2.1%', limit: '-5%' },
  { label: 'Drawdown maximal', status: 'ok', current: '-4.8%', limit: '-10%' },
  { label: 'Objectif de profit', status: 'pending', current: '42%', limit: '10%' },
]

const PROFIT = 4240
const TARGET = 10000
const PROGRESS = PROFIT / TARGET

function ProgressRing({ progress }: { progress: number }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(progress, 1)
  return (
    <Svg width={80} height={80}>
      <Circle cx={40} cy={40} r={r} stroke="#E9D5FF" strokeWidth={6} fill="none" />
      <Circle
        cx={40} cy={40} r={r}
        stroke={colors.primary}
        strokeWidth={6}
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        rotation={-90}
        origin="40, 40"
      />
    </Svg>
  )
}

export default function PropFirmScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Prop Firm Center</Text>
          <Pressable><MoreHorizontal size={20} color={colors.muted} /></Pressable>
        </View>

        <Text style={styles.sectionTitle}>Vos challenges</Text>

        {/* Challenge card */}
        <View style={styles.challengeCard}>
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <View style={styles.logoWrap}>
                <Text style={styles.logoText}>◆</Text>
              </View>
              <View>
                <Text style={styles.challengeName}>FTMO Challenge</Text>
              </View>
            </View>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseText}>Phase 1</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressArea}>
            <View style={styles.ringWrap}>
              <ProgressRing progress={PROGRESS} />
              <View style={styles.ringCenter}>
                <Text style={styles.ringPct}>{Math.round(PROGRESS * 100)}%</Text>
              </View>
            </View>
            <View style={styles.progressInfo}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${PROGRESS * 100}%` }]} />
              </View>
              <Text style={styles.progressLabel}>${PROFIT.toLocaleString()} / ${TARGET.toLocaleString()}</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>${PROFIT.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Profit actuel</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>18</Text>
              <Text style={styles.statLabel}>Jours restants</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: '#22C55E' }]}>En cours</Text>
              <Text style={styles.statLabel}>Statut</Text>
            </View>
          </View>

          <Pressable style={styles.detailBtn} onPress={() => {}}>
            <Text style={styles.detailBtnText}>Voir le détail</Text>
          </Pressable>
        </View>

        {/* Règles */}
        <Text style={styles.sectionTitle}>Règles principales</Text>
        <View style={styles.rulesCard}>
          {RULES.map((rule, i) => (
            <View key={rule.label} style={[styles.ruleRow, i < RULES.length - 1 && styles.ruleRowBorder]}>
              {rule.status === 'ok' ? (
                <CheckCircle size={18} color="#22C55E" />
              ) : (
                <Clock size={18} color="#D97706" />
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.ruleLabel}>{rule.label}</Text>
              </View>
              <View style={[styles.ruleStatus, rule.status === 'ok' ? styles.statusOk : styles.statusPending]}>
                <Text style={[styles.ruleStatusText, { color: rule.status === 'ok' ? '#166534' : '#92400E' }]}>
                  {rule.status === 'ok' ? 'Respecté ✓' : 'En cours'}
                </Text>
              </View>
              <Text style={styles.ruleValues}>{rule.current} / {rule.limit}</Text>
            </View>
          ))}
        </View>
        <Pressable>
          <Text style={styles.voirTout}>Voir toutes les règles (13) →</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.foreground,
    marginBottom: 12,
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, color: colors.primary },
  challengeName: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground },
  phaseBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  phaseText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary },
  progressArea: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  ringWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  progressInfo: { flex: 1 },
  progressBar: {
    height: 8,
    backgroundColor: '#EDE9FE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    marginBottom: 14,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginTop: 2 },
  statSep: { width: 1, backgroundColor: colors.border },
  detailBtn: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  rulesCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  ruleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  ruleLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.foreground },
  ruleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOk: { backgroundColor: '#DCFCE7' },
  statusPending: { backgroundColor: '#FEF3C7' },
  ruleStatusText: { fontFamily: fonts.bold, fontSize: 10 },
  ruleValues: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  voirTout: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: 12,
  },
})
