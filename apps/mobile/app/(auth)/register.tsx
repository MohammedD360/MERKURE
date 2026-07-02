import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { AuthShell } from '@/src/components/AuthShell'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { useAuth } from '@/src/lib/auth'
import { colors, fonts } from '@/src/lib/theme'

export default function RegisterScreen() {
  const router = useRouter()
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await register({ email: email.trim(), password, firstName: firstName.trim() || undefined })
      router.replace('/(onboarding)/profile')
    } catch {
      setError('Impossible de créer le compte. Cet email est peut-être déjà utilisé.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Créer un compte" description="Rejoignez MERKURE gratuitement">
      <View style={styles.form}>
        <Input label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Alex" />
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
          placeholder="8 caractères minimum"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Créer mon compte" onPress={handleSubmit} loading={loading} />
      </View>

      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>
          Déjà inscrit ? <Text style={styles.linkBold}>Se connecter</Text>
        </Text>
      </Pressable>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  form: { gap: 14, marginBottom: 24 },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.loss },
  link: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  linkBold: { fontFamily: fonts.bold, color: colors.primary },
})