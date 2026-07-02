import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MoreHorizontal, Plus } from 'lucide-react-native'
import { TradeRow } from '@/src/components/TradeRow'
import { useTrades } from '@/src/hooks/use-trades'
import { colors, fonts, radius } from '@/src/lib/theme'

const TABS = ['Tous', 'Trades', 'Analyses', 'Notes'] as const
type Tab = typeof TABS[number]

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function getWeekDays(pivot: Date): { date: Date; label: number; dow: string }[] {
  const dow = (pivot.getDay() + 6) % 7 // 0=Mon
  const monday = new Date(pivot)
  monday.setDate(pivot.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { date: d, label: d.getDate(), dow: DAY_LABELS[i] }
  })
}

export default function JournalScreen() {
  const router = useRouter()
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [activeTab, setActiveTab] = useState<Tab>('Tous')

  const weekDays = getWeekDays(selectedDate)
  const trades = useTrades({ limit: 20 })

  const todayStr = today.toISOString().slice(0, 10)
  const selStr = selectedDate.toISOString().slice(0, 10)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Journal de trading</Text>
        <Pressable>
          <MoreHorizontal size={20} color={colors.muted} />
        </Pressable>
      </View>

      {/* Semaine */}
      <View style={styles.weekWrap}>
        <View style={styles.weekRow}>
          {weekDays.map(({ date, label, dow }) => {
            const dStr = date.toISOString().slice(0, 10)
            const isSelected = dStr === selStr
            const isToday = dStr === todayStr
            return (
              <Pressable
                key={dStr}
                style={styles.dayCol}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dowLabel, isSelected && styles.dowActive]}>{dow}</Text>
                <View style={[
                  styles.dayCircle,
                  isSelected && styles.dayCircleActive,
                  isToday && !isSelected && styles.dayCircleToday,
                ]}>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{label}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
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

      {/* Contenu */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {trades.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : trades.data?.items.length ? (
          <>
            <View style={styles.tradeList}>
              {trades.data.items.slice(0, 5).map((trade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))}
            </View>
            <Pressable onPress={() => router.push('/(tabs)/trades')}>
              <Text style={styles.voirTous}>Voir tous les trades →</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun trade pour cette journée</Text>
          </View>
        )}
      </ScrollView>

      {/* Bouton Ajouter */}
      <View style={styles.addWrap}>
        <Pressable style={styles.addBtn} onPress={() => {}}>
          <Plus size={18} color={colors.white} />
          <Text style={styles.addLabel}>Ajouter un trade</Text>
        </Pressable>
      </View>
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
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground },
  weekWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dowLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  dowActive: { color: colors.primary },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: colors.primary },
  dayCircleToday: { backgroundColor: colors.primaryLight },
  dayNum: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  dayNumActive: { color: colors.white },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: colors.primary },
  tabLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  tabLabelActive: { fontFamily: fonts.bold, color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  tradeList: { borderTopWidth: 1, borderTopColor: colors.border },
  voirTous: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  addWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
})
