import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BrainCircuit } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

const DEFAULT_QUOTE =
  "Votre discipline s'améliore, mais attention au sur-trading en session Londres."

interface Props {
  quote?: string | null
  onCtaPress?: () => void
  loading?: boolean
}

export function InsightDuJourCard({ quote, onCtaPress, loading }: Props) {
  const text = quote?.trim() || DEFAULT_QUOTE

  return (
    <LinearGradient
      colors={['#2f2860', '#1a1042']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.head}>
        <Text style={styles.eyebrow}>INSIGHT IA DU JOUR</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NOUVEAU</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.quote}>"{text}"</Text>
        <View style={styles.illusWrap}>
          <View style={styles.illusGlow} />
          <View style={styles.illus}>
            <BrainCircuit size={30} color="#A78BFA" />
          </View>
        </View>
      </View>

      <Pressable style={styles.cta} onPress={onCtaPress} disabled={loading}>
        <Text style={styles.ctaText}>Voir l'analyse complète →</Text>
      </Pressable>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: 16,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#C4B5FD',
    letterSpacing: 0.8,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 8, color: colors.white, letterSpacing: 0.5 },
  body: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  quote: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#E9D5FF',
  },
  illusWrap: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  illusGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(167,139,250,0.18)',
  },
  illus: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  cta: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: fonts.bold, fontSize: 13, color: colors.white },
})
