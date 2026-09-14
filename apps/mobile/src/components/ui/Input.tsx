import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: Props) {
  // `${colors.muted}88` (opacité 53%) faisait chuter le contraste du
  // placeholder à ~2.3:1 sur fond blanc, bien en dessous du minimum WCAG AA
  // (4.5:1) — colors.muted en pleine opacité tient ~6.3:1.
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        accessibilityLabel={error ? `${label}, erreur : ${error}` : label}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.loss },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.loss },
})