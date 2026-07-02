import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Sparkles, User } from 'lucide-react-native'
import { DEMO_ACCOUNT } from '@/src/lib/demo-account'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  onPress: () => void
  loading?: boolean
  compact?: boolean
}

export function DemoAccountCard({ onPress, loading, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <View style={styles.iconWrap}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <User size={20} color={colors.primary} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>Compte démo</Text>
          <View style={styles.badge}>
            <Sparkles size={10} color={colors.primary} />
            <Text style={styles.badgeText}>ELITE</Text>
          </View>
        </View>
        <Text style={styles.name}>
          {DEMO_ACCOUNT.firstName} {DEMO_ACCOUNT.lastName}
        </Text>
        {!compact ? (
          <Text style={styles.meta}>
            336 trades · journal · alertes · IA · 3 comptes brokers
          </Text>
        ) : (
          <Text style={styles.meta}>Explorez l'app avec des données mock</Text>
        )}
      </View>

      <Text style={styles.cta}>{loading ? '…' : '→'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}44`,
    backgroundColor: colors.primaryLight,
  },
  cardCompact: { padding: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: `${colors.primary}22`,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 8, color: colors.primary },
  name: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground, marginTop: 4 },
  meta: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 3, lineHeight: 16 },
  cta: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
})