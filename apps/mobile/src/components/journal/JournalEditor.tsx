import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Trash2 } from 'lucide-react-native'
import { Button } from '@/src/components/ui/Button'
import { useDeleteJournalEntry, useJournalEntry, useUpsertJournalEntry } from '@/src/hooks/use-journal'
import { colors, fonts, radius } from '@/src/lib/theme'

const MOODS = [
  { key: 'serein', emoji: '😌', label: 'Serein' },
  { key: 'concentre', emoji: '💪', label: 'Concentré' },
  { key: 'confiant', emoji: '😊', label: 'Confiant' },
  { key: 'neutre', emoji: '😐', label: 'Neutre' },
  { key: 'stresse', emoji: '😰', label: 'Stressé' },
  { key: 'surconfiant', emoji: '🤑', label: 'Surconfiant' },
  { key: 'craintif', emoji: '😨', label: 'Craintif' },
]

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function formatDateFr(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

interface Props {
  date: string
}

export function JournalEditor({ date }: Props) {
  const { data: entry, isLoading } = useJournalEntry(date)
  const upsert = useUpsertJournalEntry()
  const del = useDeleteJournalEntry()

  const [mood, setMood] = useState<string | null>(null)
  const [planBefore, setPlanBefore] = useState('')
  const [reviewAfter, setReviewAfter] = useState('')
  const [notes, setNotes] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setMood(entry?.mood ?? null)
    setPlanBefore(entry?.planBefore ?? '')
    setReviewAfter(entry?.reviewAfter ?? '')
    setNotes(entry?.notes ?? '')
    setDirty(false)
  }, [entry, date])

  const handleSave = () => {
    upsert.mutate(
      {
        date,
        data: {
          mood,
          planBefore: planBefore || null,
          reviewAfter: reviewAfter || null,
          notes: notes || null,
        },
      },
      { onSuccess: () => setDirty(false) },
    )
  }

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cette entrée ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          del.mutate(date, {
            onSuccess: () => {
              setMood(null)
              setPlanBefore('')
              setReviewAfter('')
              setNotes('')
              setDirty(false)
            },
          }),
      },
    ])
  }

  if (isLoading) {
    return <Text style={styles.loading}>Chargement…</Text>
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.dateTitle}>{formatDateFr(date)}</Text>
        {entry ? (
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Trash2 size={16} color={colors.loss} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.label}>Humeur du jour</Text>
      <View style={styles.moods}>
        {MOODS.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => {
              setMood(mood === m.key ? null : m.key)
              setDirty(true)
            }}
            style={[styles.moodChip, mood === m.key && styles.moodChipActive]}
          >
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={[styles.moodLabel, mood === m.key && styles.moodLabelActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Field
        label="Plan pré-marché"
        value={planBefore}
        onChange={(v) => {
          setPlanBefore(v)
          setDirty(true)
        }}
        placeholder="Paires, niveaux clés, biais directionnel…"
      />
      <Field
        label="Revue post-séance"
        value={reviewAfter}
        onChange={(v) => {
          setReviewAfter(v)
          setDirty(true)
        }}
        placeholder="As-tu respecté ton plan ? Surprises ?"
      />
      <Field
        label="Notes libres"
        value={notes}
        onChange={(v) => {
          setNotes(v)
          setDirty(true)
        }}
        placeholder="Leçons, setups ratés, idées pour demain…"
        rows={3}
      />

      <Button
        label={dirty ? 'Sauvegarder' : 'Sauvegardé'}
        onPress={handleSave}
        loading={upsert.isPending}
        disabled={!dirty && !!entry}
        variant={dirty ? 'primary' : 'secondary'}
      />
    </View>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows?: number
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline
        numberOfLines={rows}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={`${colors.muted}66`}
        style={[styles.textarea, { minHeight: rows * 22 }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  loading: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center', padding: 24 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground, textTransform: 'capitalize', flex: 1 },
  deleteBtn: { padding: 8 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 8,
  },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  moodChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  moodEmoji: { fontSize: 14 },
  moodLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted },
  moodLabelActive: { color: colors.primary },
  field: { marginTop: 4 },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.foreground,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
})