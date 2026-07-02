import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronRight, Zap } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  onPress: () => void
}

export function PlanUpgradeCard({ onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={['#2f2860', '#1e1a42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wrap}
      >
        <View style={styles.head}>
          <Zap size={16} color="#A78BFA" />
          <Text style={styles.title}>Passer à Pro</Text>
        </View>
        <Text style={styles.desc}>
          Débloquez l'IA complète, les alertes temps réel et les rapports avancés.
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Voir les plans</Text>
          <ChevronRight size={14} color={colors.white} />
        </View>
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 13, color: colors.white },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: `${colors.white}99`,
    lineHeight: 18,
    marginTop: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  ctaText: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },
})