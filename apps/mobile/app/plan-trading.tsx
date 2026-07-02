import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors, fonts, radius } from '@/src/lib/theme'

const TABS = ['Mon plan', 'Templates', 'Mes versions'] as const
type TabKey = typeof TABS[number]

interface PlanSection {
  title: string
  status: string
  tone: 'ok' | 'neutral'
  detail: string
}

const SECTIONS: PlanSection[] = [
  { title: 'Objectifs', status: 'Définis', tone: 'ok', detail: '' },
  { title: 'Stratégie', status: 'Définie', tone: 'ok', detail: '' },
  { title: "Règles d'entrée", status: '5 règles', tone: 'neutral', detail: '' },
  { title: 'Règles de sortie', status: '4 règles', tone: 'neutral', detail: '' },
  { title: 'Gestion du risque', status: 'Définie', tone: 'ok', detail: '' },
  { title: 'Filtres de trading', status: '4 filtres', tone: 'neutral', detail: '' },
  { title: 'Checklists', status: '2 checklists', tone: 'neutral', detail: '' },
  { title: 'Plan psychologique', status: 'Défini', tone: 'ok', detail: '' },
]

const SCORE = 92

function ScoreRing({ score }: { score: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <Svg width={100} height={100}>
      <Circle cx={50} cy={50} r={r} stroke="#EDE9FE" strokeWidth={8} fill="none" />
      <Circle
        cx={50} cy={50} r={r}
        stroke={colors.primary}
        strokeWidth={8}
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        rotation={-90}
        origin="50, 50"
      />
    </Svg>
  )
}

export default function PlanTradingScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('Mon plan')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Plan de trading</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.updateDate}>Dernière mise à jour : 12 Mai 2024 à 14:30</Text>

        {/* Score ring */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.ringWrap}>
              <ScoreRing score={SCORE} />
              <View style={styles.ringCenter}>
                <Text style={styles.ringNum}>{SCORE}%</Text>
              </View>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreInfoLabel}>Score d'alignement</Text>
              <Text style={styles.scoreInfoValue}>Très bon</Text>
              <Pressable style={styles.analyseBtn}>
                <Text style={styles.analyseBtnText}>Voir l'analyse IA</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Sections */}
        <Text style={styles.sectionTitle}>Sections du plan</Text>
        <View style={styles.sectionsCard}>
          {SECTIONS.map((sec, i) => (
            <Pressable
              key={sec.title}
              style={[styles.sectionRow, i < SECTIONS.length - 1 && styles.sectionRowBorder]}
            >
              <Text style={styles.sectionLabel}>{sec.title}</Text>
              <View style={[styles.sectionStatus, sec.tone === 'ok' ? styles.statusOk : styles.statusNeutral]}>
                <Text style={[styles.sectionStatusText, { color: sec.tone === 'ok' ? '#166534' : colors.muted }]}>
                  {sec.status}
                </Text>
              </View>
              <ChevronRight size={14} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: { width: 32, alignItems: 'flex-start' },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
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
  updateDate: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginBottom: 16 },
  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringWrap: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringNum: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary },
  scoreInfo: { flex: 1, gap: 6 },
  scoreInfoLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  scoreInfoValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.foreground },
  analyseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
  },
  analyseBtnText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 10,
  },
  sectionsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.foreground },
  sectionStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusOk: { backgroundColor: '#DCFCE7' },
  statusNeutral: { backgroundColor: colors.primaryLight },
  sectionStatusText: { fontFamily: fonts.bold, fontSize: 10 },
})
