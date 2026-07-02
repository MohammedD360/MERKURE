import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, MoreHorizontal, TrendingUp } from 'lucide-react-native'
import { MiniSparkline } from '@/src/components/home/MiniSparkline'
import { colors, fonts, radius } from '@/src/lib/theme'

const TABS = ['Mes backtests', 'Nouveau backtest'] as const
type TabKey = typeof TABS[number]

interface Backtest {
  name: string
  timeframe: string
  pair: string
  profitNet: number
  trades: number
  winRate: number
}

const BACKTESTS: Backtest[] = [
  { name: 'Breakout London', timeframe: 'H4', pair: 'EURUSD', profitNet: 1250, trades: 128, winRate: 61 },
  { name: 'Rejet Order Block', timeframe: 'M5', pair: 'XAUUSD', profitNet: 980, trades: 98, winRate: 58 },
  { name: 'ICT 2022 Model', timeframe: 'H1', pair: 'GBPUSD', profitNet: 2100, trades: 210, winRate: 64 },
]

export default function BacktestScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('Mes backtests')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Backtest IA</Text>
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
        {BACKTESTS.map((bt) => (
          <Pressable key={bt.name} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.btName}>{bt.name}</Text>
                <Text style={styles.btMeta}>{bt.timeframe} · {bt.pair}</Text>
              </View>
              <TrendingUp size={20} color={colors.profit} />
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Profit net</Text>
                <Text style={[styles.statValue, { color: colors.profit }]}>+{bt.profitNet.toLocaleString('fr-FR')} $</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Trades</Text>
                <Text style={styles.statValue}>{bt.trades}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Win Rate</Text>
                <Text style={styles.statValue}>{bt.winRate}%</Text>
              </View>
              <MiniSparkline color={colors.profit} width={60} height={28} />
            </View>
          </Pressable>
        ))}
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
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  btName: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground },
  btMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  stat: { flex: 1 },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
  statValue: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground, marginTop: 2 },
})
