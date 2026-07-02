import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  title: string
  desc: string
  icon: LucideIcon
  onPress: () => void
  badge?: string
  badgeTone?: 'primary' | 'amber' | 'muted'
  featured?: boolean
  locked?: boolean
}

export function IaModuleCard({
  title,
  desc,
  icon: Icon,
  onPress,
  badge,
  badgeTone = 'muted',
  featured,
  locked,
}: Props) {
  const badgeStyle =
    badgeTone === 'primary'
      ? styles.badgePrimary
      : badgeTone === 'amber'
        ? styles.badgeAmber
        : styles.badgeMuted

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, featured && styles.cardFeatured, locked && styles.cardLocked]}
    >
      {featured ? <View style={styles.accentBar} /> : null}
      <View style={styles.row}>
        <View style={[styles.iconWrap, featured && styles.iconWrapFeatured]}>
          <Icon size={20} color={featured ? colors.white : colors.primary} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge ? (
              <View style={[styles.badge, badgeStyle]}>
                <Text
                  style={[
                    styles.badgeText,
                    badgeTone === 'primary' && styles.badgeTextPrimary,
                    badgeTone === 'amber' && styles.badgeTextAmber,
                  ]}
                >
                  {badge}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.desc}>{desc}</Text>
          {locked ? <Text style={styles.lockedHint}>Plan Pro requis</Text> : null}
        </View>
        <ChevronRight size={18} color={colors.muted} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardFeatured: {
    borderColor: `${colors.primary}44`,
    backgroundColor: `${colors.primaryLight}88`,
  },
  cardLocked: { opacity: 0.85 },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFeatured: { backgroundColor: colors.primary },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  desc: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 17 },
  lockedHint: { fontFamily: fonts.medium, fontSize: 10, color: colors.amber, marginTop: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgePrimary: { backgroundColor: colors.primary },
  badgeAmber: { backgroundColor: colors.amberBg },
  badgeMuted: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.border },
  badgeText: { fontFamily: fonts.bold, fontSize: 9, color: colors.muted, textTransform: 'uppercase' },
  badgeTextPrimary: { color: colors.white },
  badgeTextAmber: { color: colors.amber },
})