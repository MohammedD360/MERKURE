import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { MiniSparkline } from '@/src/components/home/MiniSparkline'
import { formatMoney, formatPct } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  totalPnl?: number
  winRate?: number | null
  nbTrades?: number
  avgRr?: number | null
  aiScore?: number | null
  isLoading?: boolean
  onVoirTout?: () => void
}

function formatPnlDisplay(value: number) {
  return formatMoney(value, true).replace('€', '$')
}

function ScoreRing({ score }: { score: number }) {
  const circ = 2 * Math.PI * 22
  const progress = (score / 100) * circ
  return (
    <View style={styles.scoreWrap}>
      <Svg width={52} height={52}>
        <Circle cx={26} cy={26} r={22} stroke={colors.border} strokeWidth={4.5} fill="none" />
        <Circle
          cx={26} cy={26} r={22}
          stroke={colors.primary}
          strokeWidth={4.5}
          fill="none"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90, 26, 26)"
        />
      </Svg>
      <View style={styles.scoreCenter}>
        <Text style={styles.scoreNum}>{score}</Text>
        <Text style={styles.scoreSub}>/100</Text>
      </View>
    </View>
  )
}

export function OverviewGrid({
  totalPnl = 2450.75,
  winRate = 0.624,
  nbTrades = 78,
  avgRr = 1.85,
  aiScore = 78,
  isLoading,
  onVoirTout,
}: Props) {
  const row1 = [
    {
      title: 'Profit Net',
      value: formatPnlDisplay(totalPnl),
      delta: '+18.7%',
      valueColor: totalPnl >= 0 ? colors.profit : colors.loss,
      spark: colors.profit,
    },
    {
      title: 'Win Rate',
      value: winRate != null ? formatPct(winRate * 100) : '—',
      delta: '+6.2%',
      valueColor: colors.foreground,
      spark: colors.primary,
    },
    {
      title: 'R:R Moyen',
      value: avgRr != null ? avgRr.toFixed(2) : '—',
      delta: '+0.27',
      valueColor: colors.foreground,
      spark: colors.profit,
    },
  ]

  const row2 = [
    {
      title: 'Trades',
      value: String(nbTrades),
      delta: '+12',
      valueColor: colors.foreground,
      spark: colors.profit,
    },
    {
      title: 'Expectancy',
      value: '0.73',
      delta: '+0.35',
      valueColor: colors.foreground,
      spark: colors.profit,
    },
  ]

  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.sectionTitle}>VUE D'ENSEMBLE</Text>
        <Pressable onPress={onVoirTout}>
          <Text style={styles.link}>Voir tout</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
      ) : (
        <>
          <View style={styles.row}>
            {row1.map((m) => (
              <View key={m.title} style={styles.card}>
                <Text style={styles.cardTitle}>{m.title}</Text>
                <Text style={[styles.cardValue, { color: m.valueColor }]} numberOfLines={1} adjustsFontSizeToFit>{m.value}</Text>
                <Text style={styles.cardDelta}>{m.delta}</Text>
                <MiniSparkline color={m.spark} width={56} height={22} />
              </View>
            ))}
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            {row2.map((m) => (
              <View key={m.title} style={styles.card}>
                <Text style={styles.cardTitle}>{m.title}</Text>
                <Text style={[styles.cardValue, { color: m.valueColor }]}>{m.value}</Text>
                <Text style={styles.cardDelta}>{m.delta}</Text>
                <MiniSparkline color={m.spark} width={56} height={22} />
              </View>
            ))}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Score Global IA</Text>
              <ScoreRing score={aiScore ?? 78} />
            </View>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.foreground,
    letterSpacing: 0.6,
  },
  link: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  row: { flexDirection: 'row', gap: 8 },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    minHeight: 108,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontFamily: fonts.medium, fontSize: 10, color: colors.muted },
  cardValue: { fontFamily: fonts.bold, fontSize: 17, marginTop: 3, marginBottom: 1 },
  cardDelta: { fontFamily: fonts.medium, fontSize: 10, color: colors.profit, marginBottom: 4 },
  scoreWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  scoreCenter: { position: 'absolute', alignItems: 'center' },
  scoreNum: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  scoreSub: { fontFamily: fonts.regular, fontSize: 7, color: colors.muted },
})
