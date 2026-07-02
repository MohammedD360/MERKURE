import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { OnboardingProgress } from '@/src/components/OnboardingProgress'
import { Button } from '@/src/components/ui/Button'
import { Screen } from '@/src/components/ui/Screen'
import { api, type ProfilePayload } from '@/src/lib/api-client'
import { colors, fonts, radius } from '@/src/lib/theme'

const STYLES = [
  { id: 'SCALPER', label: 'Scalper', desc: '< 15 min' },
  { id: 'DAYTRADER', label: 'Day Trader', desc: 'Clôture le soir' },
  { id: 'SWINGTRADER', label: 'Swing', desc: 'Quelques jours' },
  { id: 'INVESTOR', label: 'Investisseur', desc: 'Long terme' },
] as const

const RISKS = [
  { id: 'LOW', label: 'Conservateur' },
  { id: 'MEDIUM', label: 'Modéré' },
  { id: 'HIGH', label: 'Dynamique' },
  { id: 'AGGRESSIVE', label: 'Agressif' },
] as const

export default function OnboardingProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfilePayload>({ style: 'DAYTRADER', riskAppetite: 'MEDIUM' })
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    setLoading(true)
    try {
      await api.onboarding.profile(profile)
      router.push('/(onboarding)/broker')
    } catch {
      router.push('/(onboarding)/broker')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <OnboardingProgress current={1} />
      <Text style={styles.title}>Votre profil de trader</Text>
      <Text style={styles.sub}>Personnalisez vos analyses MERKURE</Text>

      <Text style={styles.section}>Style de trading</Text>
      <View style={styles.grid}>
        {STYLES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setProfile((p) => ({ ...p, style: s.id }))}
            style={[styles.tile, profile.style === s.id && styles.tileActive]}
          >
            <Text style={styles.tileLabel}>{s.label}</Text>
            <Text style={styles.tileDesc}>{s.desc}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Appétit au risque</Text>
      <View style={styles.riskRow}>
        {RISKS.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => setProfile((p) => ({ ...p, riskAppetite: r.id }))}
            style={[styles.riskChip, profile.riskAppetite === r.id && styles.riskActive]}
          >
            <Text style={[styles.riskText, profile.riskAppetite === r.id && styles.riskTextActive]}>
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button label="Continuer" onPress={handleNext} loading={loading} style={{ marginTop: 24 }} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  step: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground, marginTop: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 20 },
  section: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground, marginBottom: 10, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '48%',
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tileActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  tileLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
  tileDesc: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  riskRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  riskChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  riskActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  riskText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  riskTextActive: { color: colors.primary },
})