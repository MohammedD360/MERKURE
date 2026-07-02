import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={`${colors.muted}88`}
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