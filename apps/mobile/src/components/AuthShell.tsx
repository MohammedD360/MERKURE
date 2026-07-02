import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, type ViewProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BrandLogo } from '@/src/components/BrandLogo'
import { DotGridBackground } from '@/src/components/DotGridBackground'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props extends ViewProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthShell({ title, description, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.hero}>
        <DotGridBackground />
        <View style={styles.heroContent}>
          <BrandLogo size="md" light />
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroDesc}>{description}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.formCard}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { height: 220, overflow: 'hidden' },
  heroContent: { flex: 1, justifyContent: 'flex-end', padding: 24, gap: 8 },
  heroTitle: { fontFamily: fonts.bold, fontSize: 26, color: colors.white, marginTop: 16 },
  heroDesc: { fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  formArea: { flex: 1, marginTop: -20 },
  formCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingTop: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
})