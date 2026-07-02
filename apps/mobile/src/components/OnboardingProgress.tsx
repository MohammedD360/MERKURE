import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

const STEPS = ['Profil', 'Broker', 'Plan', 'Terminé']

interface Props {
  current: number
}

export function OnboardingProgress({ current }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const active = stepNum === current
          const done = stepNum < current
          return (
            <View key={label} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  active && styles.dotActive,
                ]}
              >
                <Text style={[styles.dotText, active && styles.dotTextOnPrimary, done && !active && styles.dotTextActive]}>
                  {stepNum}
                </Text>
              </View>
              {i < STEPS.length - 1 ? (
                <View style={[styles.line, done && styles.lineDone]} />
              ) : null}
            </View>
          )
        })}
      </View>
      <Text style={styles.label}>
        Étape {current}/{STEPS.length} · {STEPS[current - 1]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  track: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dotDone: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  dotText: { fontFamily: fonts.bold, fontSize: 11, color: colors.muted },
  dotTextActive: { color: colors.primary },
  dotTextOnPrimary: { color: colors.white },
  line: { width: 28, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
  lineDone: { backgroundColor: colors.primary },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },
})