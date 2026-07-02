import { Image, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { CurrentUser } from '@/src/lib/api-client'
import { getPlanDisplayLabel } from '@/src/lib/plans'
import { formatMoney, formatPct } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

function getDisplayName(user?: CurrentUser) {
  if (user?.firstName) {
    return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
  }
  return user?.email?.split('@')[0] ?? 'Trader'
}

function getInitials(user?: CurrentUser) {
  const name = getDisplayName(user)
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

interface Props {
  user?: CurrentUser
  totalPnl?: number
  winRate?: number | null
  nbTrades?: number
}

export function ProfileHeroCard({ user, totalPnl, winRate, nbTrades }: Props) {
  const name = getDisplayName(user)
  const initials = getInitials(user)
  const planLabel = getPlanDisplayLabel(user?.plan)

  return (
    <LinearGradient
      colors={['#2f2860', '#1a1042']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarArea}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{user?.email ?? '—'}</Text>
          </View>
        </View>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{planLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{nbTrades ?? 0}</Text>
          <Text style={styles.statLabel}>Trades</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: (totalPnl ?? 0) >= 0 ? '#86EFAC' : '#FCA5A5' }]}>
            {totalPnl != null ? formatMoney(totalPnl, true).replace('€', '$') : '—'}
          </Text>
          <Text style={styles.statLabel}>Profit net</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {winRate != null ? formatPct(winRate * 100) : '—'}
          </Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    padding: 18,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
  info: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  email: { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  planBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  planText: { fontFamily: fonts.bold, fontSize: 10, color: colors.white },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  statSep: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },
})
