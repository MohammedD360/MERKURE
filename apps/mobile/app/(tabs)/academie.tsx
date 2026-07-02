import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Menu, Play, X } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

const CATEGORIES = [
  { title: 'Débutant', count: 12, color: '#7C3AED', emoji: '🎯' },
  { title: 'Intermédiaire', count: 18, color: '#2563EB', emoji: '📊' },
  { title: 'Avancé', count: 15, color: '#D97706', emoji: '🏆' },
]

const COURSES = [
  { title: 'Gestion du risque', type: 'Vidéo', duration: '22 min', progress: 72 },
  { title: 'Psychologie du trader', type: 'Vidéo', duration: '16 min', progress: 0 },
  { title: 'Structures de marché ICT', type: 'Vidéo', duration: '34 min', progress: 0 },
]

export default function AcademieScreen() {
  const [showReco, setShowReco] = useState(true)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Menu size={22} color={colors.foreground} />
          <Text style={styles.title}>Académie</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Recommandé */}
        {showReco ? (
          <View style={styles.recoSection}>
            <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
            <View style={styles.recoCard}>
              <View style={styles.recoTop}>
                <View style={styles.playCircle}>
                  <Play size={20} color={colors.white} fill={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recoTitle}>Comprendre les pièges de liquidité</Text>
                  <Text style={styles.recoMeta}>Vidéo · 18 min</Text>
                </View>
                <Pressable onPress={() => setShowReco(false)} hitSlop={8}>
                  <X size={18} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {/* Catégories */}
        <Text style={styles.sectionTitle}>Catégories</Text>
        <View style={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat.title} style={styles.catCard}>
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={styles.catTitle}>{cat.title}</Text>
              <Text style={styles.catCount}>{cat.count} cours</Text>
            </Pressable>
          ))}
        </View>

        {/* Derniers cours */}
        <Text style={styles.sectionTitle}>Derniers cours</Text>
        <View style={styles.courseList}>
          {COURSES.map((course, i) => (
            <Pressable key={course.title} style={[styles.courseRow, i < COURSES.length - 1 && styles.courseRowBorder]}>
              <View style={styles.courseThumbnail}>
                <Play size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseMeta}>{course.type} · {course.duration}</Text>
                {course.progress > 0 ? (
                  <View style={styles.courseProgress}>
                    <View style={[styles.courseProgressFill, { width: `${course.progress}%` }]} />
                  </View>
                ) : null}
              </View>
              {course.progress > 0 ? (
                <Text style={styles.progressPct}>{course.progress}%</Text>
              ) : null}
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.foreground },
  recoSection: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  recoCard: {
    backgroundColor: '#1a1042',
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 4,
  },
  recoTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.white, flex: 1 },
  recoMeta: { fontFamily: fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  catRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  catCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  catEmoji: { fontSize: 24, marginBottom: 6 },
  catTitle: { fontFamily: fonts.bold, fontSize: 12, color: colors.foreground, textAlign: 'center' },
  catCount: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginTop: 2 },
  courseList: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  courseRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  courseThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
  courseMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  courseProgress: {
    height: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
    width: '100%',
  },
  courseProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  progressPct: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
})
