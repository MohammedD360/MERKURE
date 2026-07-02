import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { colors, fonts, radius } from '@/src/lib/theme'

export default function IaChatScreen() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: 'Bonjour ! Je suis votre assistant MERKURE. Posez-moi une question sur votre performance ou votre discipline.' },
  ])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages((m) => [
      ...m,
      { role: 'user', text: message.trim() },
      { role: 'ai', text: 'Analyse en cours… Connectez un plan Elite pour activer le chat IA complet.' },
    ])
    setMessage('')
  }

  return (
    <Screen>
      <ScreenHeader title="Chat IA" subtitle="Elite" showBack />

      {messages.map((msg, i) => (
        <Card
          key={i}
          style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
        >
          <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.text}</Text>
        </Card>
      ))}

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Votre question…"
          placeholderTextColor={`${colors.muted}88`}
          style={styles.input}
        />
        <Button label="Envoyer" onPress={handleSend} style={styles.sendBtn} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  bubble: { marginBottom: 8, maxWidth: '90%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primaryLight, borderColor: colors.primary },
  aiBubble: { alignSelf: 'flex-start' },
  bubbleText: { fontFamily: fonts.regular, fontSize: 14, color: colors.foreground, lineHeight: 20 },
  userText: { color: colors.primary },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    backgroundColor: colors.white,
  },
  sendBtn: { height: 44, paddingHorizontal: 16 },
})