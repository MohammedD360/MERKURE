import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'outlineLight'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const isPrimary = variant === 'primary'
  const isOutline = variant === 'outline'
  const isOutlineLight = variant === 'outlineLight'
  const isGhost = variant === 'ghost'

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isOutline && styles.outline,
        isOutlineLight && styles.outlineLight,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            (isOutline || isGhost) && styles.labelAccent,
            isOutlineLight && styles.labelLight,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineLight: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontFamily: fonts.bold, fontSize: 14 },
  labelPrimary: { color: colors.white },
  labelAccent: { color: colors.primary },
  labelLight: { color: colors.white },
})