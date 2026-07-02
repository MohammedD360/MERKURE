import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Sparkles, Zap } from 'lucide-react-native'
import Svg, { Circle } from 'react-native-svg'
import type { AiScore } from '@/src/lib/api-client'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  score?: AiScore | null
  isLoading?: boolean
  onRefresh?: () => void
  refreshing?: boolean
}

export function IaHubHero({ score, isLoading, onRefresh, refreshing }: Props) {
  const ringProgress = score ? (score.score / 100) * 138 : 0
  const scoreColor =
    score && score.score >= 70 ? colors.profit : score && score.score >= 50 ? colors.amber : colors.loss

  return (
    <LinearGradient
      colors={[colors.primaryDark, '#1a1740']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <View style={styles.iconWrap}>
            <Sparkles size={18} color="#C4B5FD" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Intelligence MERKURE</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>IA</Text>
              </View>
            </View>
            <Text style={styles.sub}>Analyses, coaching et insights personnalisés</Text>
          </View>
        </View>
        {onRefresh ? (
          <Pressable onPress={onRefresh} disabled={refreshing} style={styles.refreshBtn}>
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Zap size={16} color={colors.white} />
            )}
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.white} style={{ marginVertical: 16 }} />
      ) : score ? (
        <View style={styles.body}>
          <View style={styles.ringWrap}>
            <Svg width={72} height={72}>
              <Circle cx={36} cy={36} r={28} stroke={`${colors.white}33`} strokeWidth={6} fill="none" />
              <Circle
                cx={36}
                cy={36}
                r={28}
                stroke={scoreColor}
                strokeWidth={6}
                fill="none"
                strokeDasharray={`${ringProgress} 176`}
                strokeLinecap="round"
                rotation={-90}
                origin="36, 36"
              />
            </Svg>
            <Text style={styles.scoreNum}>{score.score}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Score de performance</Text>
            <Text style={styles.scoreTitle}>{score.label}</Text>
            <Text style={styles.scoreSub}>Basé sur {score.nbTrades} trades · 30 derniers jours</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>Importez des trades pour activer le score IA.</Text>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    marginBottom: 12,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.white}15`,
    borderWidth: 1,
    borderColor: `${colors.white}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  betaBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  betaText: { fontFamily: fonts.bold, fontSize: 8, color: colors.white, letterSpacing: 0.5 },
  sub: { fontFamily: fonts.regular, fontSize: 11, color: `${colors.white}88`, marginTop: 3 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.white}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 },
  ringWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { position: 'absolute', fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  scoreInfo: { flex: 1 },
  scoreLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: `${colors.white}88`,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.white, marginTop: 2 },
  scoreSub: { fontFamily: fonts.regular, fontSize: 11, color: `${colors.white}77`, marginTop: 4 },
  empty: { fontFamily: fonts.regular, fontSize: 12, color: `${colors.white}88`, marginTop: 14 },
})