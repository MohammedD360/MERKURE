import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { colors, fonts, radius } from '@/src/lib/theme'

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
}

let messageIdCounter = 0
function createMessageId(): string {
  messageIdCounter += 1
  return `${Date.now()}-${messageIdCounter}`
}

export default function IaChatScreen() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createMessageId(),
      role: 'ai',
      text: 'Bonjour ! Je suis votre assistant MERKURE. Posez-moi une question sur votre performance ou votre discipline.',
    },
  ])
  const listRef = useRef<FlatList<ChatMessage>>(null)

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true })
  }, [messages.length])

  const handleSend = () => {
    if (!message.trim()) return
    const aiText = 'Analyse en cours… Connectez un plan Elite pour activer le chat IA complet.'
    setMessages((m) => [
      ...m,
      { id: createMessageId(), role: 'user', text: message.trim() },
      { id: createMessageId(), role: 'ai', text: aiText },
    ])
    setMessage('')
    // Un utilisateur de lecteur d'écran n'a autrement aucun moyen de savoir
    // qu'une réponse est arrivée après avoir appuyé sur "Envoyer".
    AccessibilityInfo.announceForAccessibility(`Assistant MERKURE : ${aiText}`)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScreenHeader title="Chat IA" subtitle="Elite" showBack />

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(msg) => msg.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item: msg }) => (
            <Card
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
              accessible
              accessibilityLabel={`${msg.role === 'user' ? 'Vous avez dit' : 'Assistant MERKURE'} : ${msg.text}`}
            >
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.text}</Text>
            </Card>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Votre question…"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Votre question pour l'assistant IA"
            style={styles.input}
          />
          <Button label="Envoyer" onPress={handleSend} style={styles.sendBtn} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16, paddingBottom: 0 },
  list: { flex: 1 },
  listContent: { paddingBottom: 12 },
  bubble: { marginBottom: 8, maxWidth: '90%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primaryLight, borderColor: colors.primary },
  aiBubble: { alignSelf: 'flex-start' },
  bubbleText: { fontFamily: fonts.regular, fontSize: 14, color: colors.foreground, lineHeight: 20 },
  userText: { color: colors.primary },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' },
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
