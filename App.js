// App.js — Parea Mobile (Expo)
// npx expo install expo-image-picker expo-linear-gradient expo-blur @expo/vector-icons

import { Feather, Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native'

const { width: W, height: H } = Dimensions.get('window')
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY || ''

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    img: require('./assets/characters.png.png'),
    title: 'Your city,\nyour crew.',
    sub: 'Events are happening around you right now. Find people who want to go together.',
    bg: ['#1a0533', '#0a0814', '#050509'],
    accent: '#BB86FC',
    textAccent: '#fff',
  },
  {
    img: require('./assets/unnamed-removebg-preview.PNG'),
    title: 'Match with real\npeople.',
    sub: "Like profiles of people going to the same event. Match — and you're in a group.",
    bg: ['#1a1a35', '#0a0a20', '#050509'],
    accent: '#6C63FF',
    textAccent: '#fff',
  },
  {
    img: require('./assets/unnamed__2_-removebg-preview.png'),
    title: 'Show up.\nEnjoy together.',
    sub: 'Coffee on the beach, a board game evening, a concert — find your people.',
    bg: ['#0a2020', '#051515', '#050509'],
    accent: '#CCFF00',
    textAccent: '#050509',
  },
]

const INTERESTS = [
  '🎵 Music', '🎨 Art', '💻 Tech', '⚽ Sports', '✈️ Travel',
  '🍕 Food', '🎬 Cinema', '📚 Books', '🧘 Yoga', '📷 Photography',
  '🎮 Gaming', '💃 Dancing', '🎭 Theatre', '🏖️ Beach', '🥾 Hiking',
  '🍷 Wine', '☕ Coffee', '🎲 Board Games', '🎤 Concerts', '🏊 Swimming',
]

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Russian' },
  { code: 'el', flag: '🇬🇷', label: 'Greek' },
  { code: 'uk', flag: '🇺🇦', label: 'Ukrainian' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic' },
  { code: 'zh', flag: '🇨🇳', label: 'Chinese' },
]

// ─── MODERATION ───────────────────────────────────────────────────────────────

async function isImageSafe(base64) {
  if (!ANTHROPIC_KEY) return true
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
            },
            {
              type: 'text',
              text: 'Does this image contain nudity, explicit sexual content, or anyone who appears to be under 18? Answer YES or NO only.',
            },
          ],
        }],
      }),
    })
    const data = await res.json()
    const answer = data?.content?.[0]?.text?.trim().toUpperCase() || 'NO'
    return !answer.startsWith('YES')
  } catch {
    return true
  }
}

// ─── LANDING SCREEN ───────────────────────────────────────────────────────────

function LandingScreen({ onCreateAccount, onLogin }) {
  const [slide, setSlide] = useState(0)
  const slideAnim = useRef(new Animated.Value(0)).current
  const touchX = useRef(null)

  const goTo = (idx) => {
    if (idx < 0 || idx >= SLIDES.length) return
    const fromRight = idx > slide
    slideAnim.setValue(fromRight ? W : -W)
    setSlide(idx)
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 80, friction: 12,
    }).start()
  }

  const onTouchStart = (e) => { touchX.current = e.nativeEvent.pageX }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.nativeEvent.pageX - touchX.current
    if (dx < -50) goTo(slide + 1)
    else if (dx > 50) goTo(slide - 1)
    touchX.current = null
  }

  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <LinearGradient colors={current.bg} style={s.fill}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <StatusBar style="light" />
      <SafeAreaView style={s.fill}>

        {/* Logo */}
        <View style={s.logoRow}>
          <Image source={require('./assets/logo.png')} style={s.logo} resizeMode="contain" />
        </View>

        {/* Illustration */}
        <Animated.View style={[s.slideImgWrap, { transform: [{ translateX: slideAnim }] }]}>
          <Image source={current.img} style={s.slideImg} resizeMode="contain" />
        </Animated.View>

        {/* Text */}
        <Animated.View style={[s.slideTextWrap, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={s.slideTitle}>{current.title}</Text>
          <Text style={s.slideSub}>{current.sub}</Text>
        </Animated.View>

        {/* Dots */}
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[
                s.dot,
                i === slide && { width: 22, backgroundColor: current.accent },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={s.landingBtns}>
          {isLast ? (
            <>
              <TouchableOpacity
                style={[s.btnPrimary, { backgroundColor: current.accent }]}
                onPress={onCreateAccount}>
                <Text style={[s.btnPrimaryText, { color: current.textAccent }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSecondary} onPress={onLogin}>
                <Text style={s.btnSecondaryText}>Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[s.btnPrimary, { backgroundColor: current.accent }]}
              onPress={() => goTo(slide + 1)}>
              <Text style={[s.btnPrimaryText, { color: current.textAccent }]}>Next</Text>
            </TouchableOpacity>
          )}
        </View>

      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── ONBOARDING SCREEN ────────────────────────────────────────────────────────

function OnboardingScreen({ onFinish }) {
  const TOTAL = 5
  const [step, setStep] = useState(1)

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState(null)
  const [photos, setPhotos] = useState([null, null, null])
  const [photoLoading, setPhotoLoading] = useState([false, false, false])
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState([])
  const [langs, setLangs] = useState([])
  const [hasCar, setHasCar] = useState(false)

  const slideAnim = useRef(new Animated.Value(0)).current

  const animSlide = (dir = 1) => {
    slideAnim.setValue(dir * 40)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }).start()
  }

  const next = () => {
    if (step < TOTAL) { animSlide(1); setStep(p => p + 1) }
    else onFinish({ name, age, gender, photos, bio, interests, langs, hasCar })
  }

  const back = () => {
    if (step > 1) { animSlide(-1); setStep(p => p - 1) }
  }

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2 && age.length > 0 && !!gender
    if (step === 2) return photos.some(Boolean)
    if (step === 3) return bio.trim().length >= 10
    if (step === 4) return interests.length > 0
    if (step === 5) return langs.length > 0
    return true
  }

  const pickPhoto = async (idx) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [3, 4],
    })
    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setPhotoLoading(l => { const n = [...l]; n[idx] = true; return n })

    const safe = await isImageSafe(asset.base64)
    setPhotoLoading(l => { const n = [...l]; n[idx] = false; return n })

    if (!safe) {
      Alert.alert(
        'Photo not allowed ❌',
        'This photo was flagged by our moderation system. Please use an appropriate profile photo.',
      )
      return
    }
    setPhotos(p => { const n = [...p]; n[idx] = asset.uri; return n })
  }

  const removePhoto = (idx) =>
    setPhotos(p => { const n = [...p]; n[idx] = null; return n })

  const toggleInterest = (item) =>
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])

  const toggleLang = (code) =>
    setLangs(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code])

  const progress = (step / TOTAL) * 100

  return (
    <LinearGradient colors={['#1a0533', '#0a0814', '#050509']} style={s.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={s.fill}>

        {/* Header */}
        <View style={s.onbHeader}>
          {step > 1
            ? <TouchableOpacity onPress={back} style={s.backBtn}>
                <Ionicons name="chevron-back" size={22} color="#BB86FC" />
              </TouchableOpacity>
            : <View style={{ width: 36 }} />}
          <Image source={require('./assets/logo.png')} style={s.headerLogo} resizeMode="contain" />
          <View style={{ width: 36 }} />
        </View>

        {/* Progress */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={s.stepScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>

              {/* ── STEP 1: Name / Age / Gender ── */}
              {step === 1 && (
                <View>
                  <Text style={s.stepTitle}>Tell us about yourself</Text>
                  <Text style={s.stepSub}>This info will be visible on your profile</Text>

                  <Text style={s.label}>Your name</Text>
                  <TextInput
                    style={s.input} value={name} onChangeText={setName}
                    placeholder="Name" placeholderTextColor="rgba(255,255,255,0.3)"
                    maxLength={30} />

                  <Text style={s.label}>Age</Text>
                  <TextInput
                    style={[s.input, { width: 110 }]} value={age}
                    onChangeText={t => setAge(t.replace(/\D/g, ''))}
                    placeholder="18" placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="number-pad" maxLength={2} />

                  <Text style={s.label}>Gender</Text>
                  <View style={s.row}>
                    {['Man', 'Woman', 'Other'].map(g => (
                      <TouchableOpacity key={g} onPress={() => setGender(g)}
                        style={[s.chip, gender === g && s.chipOn]}>
                        <Text style={[s.chipTxt, gender === g && s.chipTxtOn]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* ── STEP 2: Photos ── */}
              {step === 2 && (
                <View>
                  <Text style={s.stepTitle}>Add your photos</Text>
                  <Text style={s.stepSub}>
                    At least 1 required. All photos are automatically checked — no nudity or minors.
                  </Text>

                  <View style={s.photosRow}>
                    {photos.map((uri, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[s.photoSlot, idx === 0 && s.photoSlotMain]}
                        onPress={() => !uri && pickPhoto(idx)}
                        activeOpacity={0.85}>
                        {photoLoading[idx] ? (
                          <View style={s.photoCenter}>
                            <ActivityIndicator color="#BB86FC" />
                            <Text style={s.photoCheckTxt}>Checking...</Text>
                          </View>
                        ) : uri ? (
                          <>
                            <Image source={{ uri }} style={s.photoImg} />
                            <TouchableOpacity style={s.photoRemoveBtn} onPress={() => removePhoto(idx)}>
                              <Ionicons name="close" size={13} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.photoEditBtn} onPress={() => pickPhoto(idx)}>
                              <Feather name="edit-2" size={12} color="#BB86FC" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={s.photoCenter}>
                            <Ionicons name="add" size={30} color="rgba(187,134,252,0.45)" />
                            {idx === 0 && (
                              <Text style={s.photoMainTxt}>main</Text>
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* ── STEP 3: Bio ── */}
              {step === 3 && (
                <View>
                  <Text style={s.stepTitle}>About you</Text>
                  <Text style={s.stepSub}>A few words so people know who they're meeting</Text>

                  <TextInput
                    style={[s.input, s.bioInput]} value={bio}
                    onChangeText={t => setBio(t.slice(0, 150))}
                    placeholder={'e.g. Love jazz, good coffee\nand spontaneous adventures 🎷'}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline maxLength={150} textAlignVertical="top" />
                  <Text style={s.charCount}>{bio.length} / 150</Text>
                </View>
              )}

              {/* ── STEP 4: Interests ── */}
              {step === 4 && (
                <View>
                  <Text style={s.stepTitle}>Your vibe</Text>
                  <Text style={s.stepSub}>Pick at least 1 — this powers your vibe-match</Text>

                  <View style={s.chipsWrap}>
                    {INTERESTS.map(item => (
                      <TouchableOpacity key={item} onPress={() => toggleInterest(item)}
                        style={[s.chip, interests.includes(item) && s.chipOn]}>
                        <Text style={[s.chipTxt, interests.includes(item) && s.chipTxtOn]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* ── STEP 5: Languages + Car ── */}
              {step === 5 && (
                <View>
                  <Text style={s.stepTitle}>Languages & extras</Text>
                  <Text style={s.stepSub}>Key features for Cyprus — pick at least 1 language</Text>

                  <Text style={s.label}>Languages I speak</Text>
                  <View style={s.chipsWrap}>
                    {LANGUAGES.map(l => (
                      <TouchableOpacity key={l.code} onPress={() => toggleLang(l.code)}
                        style={[s.chip, langs.includes(l.code) && s.chipOn]}>
                        <Text style={[s.chipTxt, langs.includes(l.code) && s.chipTxtOn]}>
                          {l.flag}  {l.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={s.carRow} onPress={() => setHasCar(v => !v)} activeOpacity={0.85}>
                    <View style={[s.checkbox, hasCar && s.checkboxOn]}>
                      {hasCar && <Ionicons name="checkmark" size={15} color="#050509" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.carLabel}>🚗  I have a car</Text>
                      <Text style={s.carSub}>You can offer rides to fellow event-goers</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom button */}
        <View style={s.bottomBar}>
          <TouchableOpacity
            style={[s.btnPrimary, !canNext() && s.btnDisabled]}
            onPress={next}
            disabled={!canNext()}>
            <Text style={[s.btnPrimaryText, { color: '#050509' }]}>
              {step === TOTAL ? 'Finish 🎉' : 'Continue'}
            </Text>
          </TouchableOpacity>
          <Text style={s.stepCounter}>{step} / {TOTAL}</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── FEED PLACEHOLDER ─────────────────────────────────────────────────────────

function FeedScreen() {
  return (
    <LinearGradient colors={['#1a0533', '#050509']} style={[s.fill, s.center]}>
      <StatusBar style="light" />
      <Image source={require('./assets/logo.png')} style={{ width: 160, height: 50 }} resizeMode="contain" />
      <Text style={{ color: '#BB86FC', fontSize: 20, fontWeight: '800', marginTop: 28 }}>
        You're in! 🎉
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.45)', marginTop: 10, textAlign: 'center', paddingHorizontal: 48, lineHeight: 22 }}>
        Feed is coming. The hard part is done.
      </Text>
    </LinearGradient>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('landing')

  if (screen === 'landing')
    return (
      <LandingScreen
        onCreateAccount={() => setScreen('onboarding')}
        onLogin={() => setScreen('feed')}
      />
    )
  if (screen === 'onboarding')
    return <OnboardingScreen onFinish={() => setScreen('feed')} />

  return <FeedScreen />
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },

  // ── Landing
  logoRow: { alignItems: 'center', paddingTop: 16, paddingBottom: 4 },
  logo: { width: 150, height: 48 },
  slideImgWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  slideImg: { width: W * 0.72, height: H * 0.36, maxHeight: 300 },
  slideTextWrap: { paddingHorizontal: 32, marginBottom: 14 },
  slideTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 10, lineHeight: 36 },
  slideSub: { fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)' },
  landingBtns: { paddingHorizontal: 28, paddingBottom: 44, gap: 10 },

  // ── Buttons
  btnPrimary: {
    height: 54, borderRadius: 16, backgroundColor: '#BB86FC',
    alignItems: 'center', justifyContent: 'center',
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    height: 48, borderRadius: 16, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  btnDisabled: { opacity: 0.3 },

  // ── Onboarding header
  onbHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(187,134,252,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLogo: { width: 90, height: 28 },

  // ── Progress
  progressTrack: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20, borderRadius: 99, marginBottom: 6,
  },
  progressFill: { height: 3, backgroundColor: '#BB86FC', borderRadius: 99 },

  // ── Step content
  stepScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 6 },
  stepSub: { fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 20, marginBottom: 28 },
  label: {
    fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },

  // ── Input
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#fff', marginBottom: 20,
  },
  bioInput: { height: 130, paddingTop: 14 },
  charCount: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'right', marginTop: -16, marginBottom: 8 },

  // ── Chips
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  chipOn: { backgroundColor: 'rgba(187,134,252,0.18)', borderColor: '#BB86FC' },
  chipTxt: { fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  chipTxtOn: { color: '#BB86FC', fontWeight: '700' },

  // ── Photos
  photosRow: { flexDirection: 'row', gap: 10, height: 240, marginBottom: 8 },
  photoSlot: {
    flex: 1, borderRadius: 18, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  photoSlotMain: {
    flex: 1.4, borderRadius: 22,
    borderWidth: 2, borderColor: 'rgba(187,134,252,0.4)',
  },
  photoImg: { width: '100%', height: '100%' },
  photoCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  photoCheckTxt: { fontSize: 11, color: '#BB86FC', fontWeight: '600' },
  photoMainTxt: { fontSize: 10, fontWeight: '700', color: '#BB86FC', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 },
  photoRemoveBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },
  photoEditBtn: {
    position: 'absolute', bottom: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
  },

  // ── Car row
  carRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginTop: 4,
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: 'rgba(187,134,252,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#CCFF00', borderColor: '#CCFF00' },
  carLabel: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  carSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  // ── Bottom bar
  bottomBar: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 8, gap: 10 },
  stepCounter: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: '600' },
})
