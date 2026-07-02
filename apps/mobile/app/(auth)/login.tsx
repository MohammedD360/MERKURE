import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { DemoAccountCard } from '@/src/components/DemoAccountCard'
import { AuthShell } from '@/src/components/AuthShell'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { useAuth } from '@/src/lib/auth'
import { colors, fonts } from '@/src/lib/theme'

export default function LoginScreen() {
  const router = useRouter()
  const { login, loginDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      router.replace('/(tabs)')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setError(null)
    setDemoLoading(true)
    try {
      await loginDemo()
      router.replace('/(tabs)')
    } catch {
      setError('Compte démo indisponible — lancez l\'API (port 3002) puis pnpm db:seed:demo')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <AuthShell title="Connexion" description="Accédez à votre espace MERKURE">
      <DemoAccountCard onPress={handleDemo} loading={demoLoading} />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou avec votre compte</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vous@email.com"
        />
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Se connecter" onPress={handleSubmit} loading={loading} disabled={demoLoading} />
      </View>

      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>
          Pas encore de compte ? <Text style={styles.linkBold}>Créer un compte</Text>
        </Text>
      </Pressable>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted },
  form: { gap: 14, marginBottom: 24 },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.loss },
  link: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  linkBold: { fontFamily: fonts.bold, color: colors.primary },
})