import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Sparkle } from '../phosphor-icons'
import { scoreRequesterForHost } from '../feed-helpers'
import { CATEGORY_EMOJI } from '../feed-constants'

type Member = {
  id: string
  name: string
  age?: string | number
  photo?: string | null
  photos?: string[]
  color?: string
  bio?: string
  interests?: string[]
  langs?: string[]
  drinksPref?: string
  smokingPref?: string
  hasPets?: boolean
  transport?: string | null
  status?: string
}

type UserProfile = {
  interests?: string[]
  langs?: string[]
  age?: string | number
  drinksPref?: string
  smokingPref?: string
  dealbreakers?: string[]
}

export function CrewPoolSheet({
  visible,
  event,
  members,
  userProfile,
  passedIds,
  onPass,
  onJoin,
  onClose,
  onOpenProfile,
}: {
  visible: boolean
  event: any | null
  members: Member[]
  userProfile: UserProfile
  passedIds: Set<string>
  onPass: (profileId: string) => void
  onJoin: () => void
  onClose: () => void
  onOpenProfile?: (m: Member) => void
}) {
  const insets = useSafeAreaInsets()
  const screenH = Dimensions.get('window').height
  const sheetMaxH = screenH - insets.top - 16
  const slideAnim = useRef(new Animated.Value(600)).current

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(600)
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start()
    }
  }, [visible])

  const close = () => {
    Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(onClose)
  }

  // Filter out anyone the user has passed in this event, then score & sort by vibe match.
  // Prefer the AI-computed `score` already present on eventAttendeesMap entries (matches
  // what VibeCheck shows — applies dealbreakers like age mismatch). Fall back to a local
  // rule-based score only when AI hasn't returned yet (`score == null`).
  const visibleMembers = useMemo(() => {
    const filtered = members.filter(m => !passedIds.has(m.id))
    const userForScore = {
      interests: userProfile.interests,
      langs: userProfile.langs,
      age: typeof userProfile.age === 'string' ? parseInt(userProfile.age || '25') : (userProfile.age || 25),
      drinksPref: userProfile.drinksPref,
      smokingPref: userProfile.smokingPref,
    }
    return filtered.map(m => {
      const aiScore: number | null | undefined = (m as any).score
      const score = (aiScore != null) ? aiScore : scoreRequesterForHost(
        {
          langs: m.langs,
          age: typeof m.age === 'string' ? parseInt(m.age || '25') : (m.age as number || 25),
          drinksPref: m.drinksPref,
          smokingPref: m.smokingPref,
          interests: m.interests,
          hasPets: m.hasPets,
        },
        {
          langs: userForScore.langs,
          age: userForScore.age,
          drinksPref: userForScore.drinksPref,
          smokingPref: userForScore.smokingPref,
          interests: userForScore.interests,
          dealbreakers: userProfile.dealbreakers,
        },
        event?.category
      )
      return { ...m, _score: score }
    }).sort((a, b) => (b._score || 0) - (a._score || 0))
  }, [members, passedIds, userProfile, event?.category])

  if (!visible || !event) return null

  const eventEmoji = CATEGORY_EMOJI[event.category as string] || '🎉'

  return (
    <Modal transparent statusBarTranslucent animationType="none" onRequestClose={close}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(5,3,15,0.72)' }} activeOpacity={1} onPress={close} />
      <Animated.View
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          maxHeight: sheetMaxH,
          transform: [{ translateY: slideAnim }],
          backgroundColor: '#0A0812',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: -8 }, elevation: 20,
        }}>
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        </View>

        {/* Header */}
        <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(67,233,123,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>{eventEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Crew at
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: '900', color: '#fff' }}>
              {event.title}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
              {visibleMembers.length === 0
                ? 'Be the first to join'
                : `${visibleMembers.length} ${visibleMembers.length === 1 ? 'person is' : 'people are'} looking for crew`}
            </Text>
          </View>
          <TouchableOpacity onPress={close} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="x" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Member cards */}
        <ScrollView
          style={{ maxHeight: sheetMaxH - 220 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 10 }}
          showsVerticalScrollIndicator={false}>
          {visibleMembers.length === 0 ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>👥</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', paddingHorizontal: 24 }}>
                No one in the pool yet. Tap "Join crew" to be the first — others will see your profile when they look.
              </Text>
            </View>
          ) : (
            visibleMembers.map((m: any) => {
              const score = m._score || 0
              const scoreColor = score >= 80 ? '#43E97B' : score >= 60 ? '#FBBF24' : '#A78BFA'
              const topInterests = (m.interests || []).slice(0, 3)
              return (
                <View key={m.id} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {/* Avatar — tap opens full profile */}
                    <TouchableOpacity onPress={() => onOpenProfile?.(m)} activeOpacity={0.85}>
                      {m.photo ? (
                        <Image source={{ uri: m.photo }} style={{ width: 64, height: 64, borderRadius: 18, borderWidth: 1.5, borderColor: scoreColor + '50' }} />
                      ) : (
                        <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: m.color || '#818CF8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: scoreColor + '50' }}>
                          <Text style={{ fontSize: 26 }}>👤</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      {/* Name + age + score */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '900', color: '#fff', flex: 1 }}>
                          {m.name}{m.age ? `, ${m.age}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: scoreColor + '20', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Sparkle size={11} color={scoreColor} weight="fill" />
                          <Text style={{ fontSize: 11, fontWeight: '900', color: scoreColor }}>{score}%</Text>
                        </View>
                      </View>

                      {/* Bio */}
                      {!!m.bio && (
                        <Text numberOfLines={2} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, lineHeight: 17 }}>
                          {m.bio}
                        </Text>
                      )}

                      {/* Interests */}
                      {topInterests.length > 0 && (
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {topInterests.map((i: string) => (
                            <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
                              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>{i}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Pass button */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      onPress={() => onPass(m.id)}
                      activeOpacity={0.8}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 99, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)' }}>Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onOpenProfile?.(m)}
                      activeOpacity={0.8}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 99, alignItems: 'center', backgroundColor: 'rgba(99,102,241,0.18)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#A5B4FC' }}>View profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>

        {/* Sticky CTA */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 14) + 4, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => { onJoin(); close() }}
            style={{ borderRadius: 99, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, backgroundColor: '#43E97B', shadowColor: '#43E97B', shadowOpacity: 0.4, shadowRadius: 14, elevation: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#052e16' }}>
              {visibleMembers.length === 0 ? 'Be first to join' : `Join crew with ${visibleMembers.length}`}
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 8 }}>
            Pass anyone you'd rather not crew with — they won't show up here again for this event
          </Text>
        </View>
      </Animated.View>
    </Modal>
  )
}
