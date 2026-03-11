// app/(tabs)/index.tsx — Parea Mobile
import { Feather, Ionicons } from '@expo/vector-icons'
import Svg, { Circle, Path } from 'react-native-svg'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Alert, Animated, Dimensions, Image,
  KeyboardAvoidingView, Modal, Platform, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'

const { width: W } = Dimensions.get('window')
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY || ''

// ─── DATA ─────────────────────────────────────────────────────────────────────

const LANDING_SLIDES = [
  {
    img: require('../../assets/images/characters.png.png'),
    title: 'Your city,\nyour crew.',
    sub: 'Events are happening around you right now. Find people who want to go together.',
    bg: ['#F5F3FF', '#EDE9FE', '#DDD6FE'],
    accent: '#6366F1', titleColor: '#1E1B4B', subColor: '#475569',
  },
  {
    img: require('../../assets/images/Gemini_Generated_Image_55nnbe55nnbe55nn-removebg-preview.png'),
    title: 'Match with real\npeople.',
    sub: "Like profiles of people going to the same event. Match — and you're in a group.",
    bg: ['#FFF0F9', '#FCE7F3', '#FBCFE8'],
    accent: '#EC4899', titleColor: '#1E1B4B', subColor: '#475569',
  },
  {
    img: require('../../assets/images/unnamed__2_-removebg-preview.png'),
    title: 'Show up.\nEnjoy together.',
    sub: 'Coffee on the beach, a board game evening, a concert — find your people.',
    bg: ['#F0FDF4', '#DCFCE7', '#BBF7D0'],
    accent: '#10B981', titleColor: '#1E1B4B', subColor: '#475569',
  },
]

const INTERESTS_LIST = [
  '☕ Coffee', '🍷 Wine', '🎾 Tennis', '🎬 Movies', '🥾 Hiking',
  '🍕 Foodie', '🧘 Yoga', '🎨 Art', '🎸 Music', '✈️ Travel',
  '💃 Dance', '📚 Books', '💻 Tech', '🎮 Gaming', '📷 Photography',
  '🎭 Theatre', '🏖️ Beach', '🎲 Board Games', '🎤 Concerts', '🏊 Swimming',
]

const LANGUAGES_LIST = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Russian' },
  { code: 'el', flag: '🇬🇷', label: 'Greek' },
  { code: 'uk', flag: '🇺🇦', label: 'Ukrainian' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'he', flag: '🇮🇱', label: 'Hebrew' },
]

const CITIES = ['Limassol', 'Nicosia', 'Larnaca', 'Paphos']

const MOCK_EVENTS = [
  { id: 1, city: 'Limassol', type: 'official', title: 'Tennis Tournament at Aphrodite Hills', time: 'Today, 18:00', distance: '2km', category: 'sports', gradient: ['#667eea', '#764ba2'], seekerColors: ['#818CF8', '#4CAF50', '#2196F3'], slots: '2 spots left', seekingCount: 12 },
  { id: 2, city: 'Limassol', type: 'official', title: 'Limassol Wine Festival 2025', time: 'Tomorrow, 20:00', distance: '1.2km', category: 'wine', gradient: ['#f093fb', '#f5576c'], seekerColors: ['#9C27B0', '#E91E63'], slots: '4 spots left', seekingCount: 28 },
  { id: 9, city: 'Limassol', type: 'official', title: 'CyprusTech Conference 2025', time: 'Sat, 10:00', distance: '3km', category: 'tech', gradient: ['#0f2027', '#2c5364'], seekerColors: ['#2196F3', '#FF9800', '#9C27B0', '#22c55e'], slots: 'Open event', seekingCount: 7 },
  { id: 5, city: 'Paphos', type: 'official', title: 'Sunset Hike to Troodos', time: 'Sat, 07:00', distance: '8km', category: 'sports', gradient: ['#fa8231', '#f7b731'], seekerColors: ['#334155', '#818CF8', '#22c55e'], slots: '6 spots left', seekingCount: 9 },
  { id: 3, city: 'Limassol', type: 'community', title: 'Morning Coffee & Chat', time: 'Today, 09:30', distance: '0.5km', category: 'coffee', gradient: ['#4facfe', '#00c6fb'], seekerColors: ['#FF9800', '#03A9F4', '#8BC34A', '#FF5722'], slots: '3 spots left', seekingCount: 4 },
  { id: 4, city: 'Nicosia', type: 'community', title: 'Board Games Night', time: 'Fri, 19:00', distance: '3km', category: 'gaming', gradient: ['#43e97b', '#38f9d7'], seekerColors: ['#FF5722', '#9C27B0'], slots: '5 spots left', seekingCount: 2 },
  { id: 6, city: 'Nicosia', type: 'community', title: 'Specialty Coffee Tour', time: 'Sun, 11:00', distance: '1km', category: 'coffee', gradient: ['#a18cd1', '#fbc2eb'], seekerColors: ['#818CF8', '#22c55e'], slots: '3 spots left', seekingCount: 2 },
  { id: 7, city: 'Larnaca', type: 'community', title: 'Beach Volleyball', time: 'Today, 17:00', distance: '4km', category: 'sports', gradient: ['#ffecd2', '#fcb69f'], seekerColors: ['#2196F3', '#FF9800', '#9C27B0'], slots: '4 spots left', seekingCount: 3 },
  { id: 8, city: 'Larnaca', type: 'community', title: 'Wine & Jazz Evening', time: 'Sat, 20:00', distance: '2km', category: 'wine', gradient: ['#c471f5', '#fa71cd'], seekerColors: ['#818CF8', '#4CAF50'], slots: '6 spots left', seekingCount: 5 },
]

const CATEGORY_EMOJI: Record<string, string> = { coffee: '☕', sports: '🎾', wine: '🍷', gaming: '🎮', tech: '💻' }
const FLAG_MAP: Record<string, string> = { en: '🇬🇧', ru: '🇷🇺', el: '🇬🇷', uk: '🇺🇦', de: '🇩🇪', he: '🇮🇱', fr: '🇫🇷' }
const TRANSPORT_LABEL: Record<string, string> = { car: '🚗 Can give a lift', lift: '🙋 Needs a lift', meet: '📍 Meeting there' }

const MOCK_SEEKERS = [
  { id: 1, name: 'Elena', age: 27, langs: ['en', 'el'], transport: 'car', color: '#818CF8', photo: 'https://i.pravatar.cc/300?img=47', bio: 'Love exploring local spots 🌿 Cyprus local, always up for something new' },
  { id: 2, name: 'Dmitri', age: 31, langs: ['ru', 'en'], transport: 'lift', color: '#4CAF50', photo: 'https://i.pravatar.cc/300?img=12', bio: 'IT engineer, moved here from Moscow 🇷🇺 Looking for people to explore the island' },
  { id: 3, name: 'Sarah', age: 24, langs: ['en', 'de'], transport: 'meet', color: '#2196F3', photo: 'https://i.pravatar.cc/300?img=32', bio: 'Expat from Berlin 🌊 Obsessed with sunsets and good coffee' },
  { id: 4, name: 'Yael', age: 29, langs: ['he', 'en'], transport: 'car', color: '#9C27B0', photo: 'https://i.pravatar.cc/300?img=25', bio: 'Tel Aviv → Limassol 🌞 Digital nomad, loves big groups and good vibes' },
  { id: 5, name: 'Marcus', age: 34, langs: ['de', 'en'], transport: 'lift', color: '#FF9800', photo: 'https://i.pravatar.cc/300?img=8', bio: 'Freelance designer from Hamburg 🎨 Here for the winter, looking for adventure' },
]

const MOCK_CHATS = [
  { id: 1, type: 'duo', name: 'Elena', age: 27, transport: 'car', color: '#818CF8', photo: 'https://i.pravatar.cc/150?img=47', lastMsg: 'See you at the event! 🎾', time: '2m', isNew: true, expiresIn: 18, event: 'Tennis @ Marina', eventEmoji: '🎾' },
  { id: 2, type: 'duo', name: 'Sarah', age: 24, transport: 'meet', color: '#2196F3', photo: 'https://i.pravatar.cc/150?img=32', lastMsg: "Let's meet at 17:45", time: '1h', isNew: false, expiresIn: 6, event: 'Wine Tasting', eventEmoji: '🍷' },
  { id: 3, type: 'group', event: 'Tennis @ Marina', eventEmoji: '🎾', members: 8, avatars: ['https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=25', 'https://i.pravatar.cc/150?img=8'], colors: ['#4CAF50', '#9C27B0', '#FF9800'], lastMsg: 'Dmitri: Anyone bringing extra rackets?', time: '15m', isNew: false, expiresIn: 31 },
  { id: 4, type: 'group', event: 'Wine Tasting Old Town', eventEmoji: '🍷', members: 4, avatars: ['https://i.pravatar.cc/150?img=20', 'https://i.pravatar.cc/150?img=15', 'https://i.pravatar.cc/150?img=39'], colors: ['#E91E63', '#9C27B0', '#818CF8'], lastMsg: "Yael: I know a great parking spot!", time: '3h', isNew: false, expiresIn: 3 },
]

const MOCK_MESSAGES: Record<number, Array<{ from: string; text: string; time: string; senderName?: string; senderPhoto?: string; senderColor?: string }>> = {
  1: [
    { from: 'them', text: 'Hi! Are you going to the tennis thing tonight?', time: '1h', senderName: 'Elena', senderPhoto: 'https://i.pravatar.cc/40?img=47', senderColor: '#818CF8' },
    { from: 'me', text: 'Yes! Looking forward to it 🎾', time: '58m' },
    { from: 'them', text: 'See you at the event! 🎾', time: '2m', senderName: 'Elena', senderPhoto: 'https://i.pravatar.cc/40?img=47', senderColor: '#818CF8' },
  ],
  2: [
    { from: 'them', text: 'Hey! Wine tasting tonight?', time: '2h', senderName: 'Sarah', senderPhoto: 'https://i.pravatar.cc/40?img=32', senderColor: '#2196F3' },
    { from: 'me', text: 'Absolutely! What time works?', time: '1h 30m' },
    { from: 'them', text: "Let's meet at 17:45", time: '1h', senderName: 'Sarah', senderPhoto: 'https://i.pravatar.cc/40?img=32', senderColor: '#2196F3' },
  ],
  3: [
    { from: 'them', text: 'Hey everyone! 🎾', time: '1h', senderName: 'Dmitri', senderPhoto: 'https://i.pravatar.cc/40?img=12', senderColor: '#4CAF50' },
    { from: 'them', text: "What time exactly?", time: '58m', senderName: 'Yael', senderPhoto: 'https://i.pravatar.cc/40?img=25', senderColor: '#9C27B0' },
    { from: 'me', text: "I'll be there by 19:00 sharp", time: '55m' },
    { from: 'them', text: 'Anyone bringing extra rackets?', time: '15m', senderName: 'Dmitri', senderPhoto: 'https://i.pravatar.cc/40?img=12', senderColor: '#4CAF50' },
  ],
  4: [
    { from: 'them', text: 'This place is amazing 🍷', time: '4h', senderName: 'Yael', senderPhoto: 'https://i.pravatar.cc/40?img=20', senderColor: '#E91E63' },
    { from: 'me', text: 'See you all there!', time: '3h 10m' },
    { from: 'them', text: 'I know a great parking spot!', time: '3h', senderName: 'Yael', senderPhoto: 'https://i.pravatar.cc/40?img=20', senderColor: '#E91E63' },
  ],
}

// ─── IMAGE SAFETY ─────────────────────────────────────────────────────────────

async function isImageSafe(base64: string): Promise<boolean> {
  if (!ANTHROPIC_KEY) return true
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 10,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          { type: 'text', text: 'Does this image contain nudity, explicit sexual content, or anyone who appears to be under 18? Answer YES or NO only.' },
        ]}],
      }),
    })
    const data = await res.json()
    const answer = data?.content?.[0]?.text?.trim().toUpperCase() || 'NO'
    return !answer.startsWith('YES')
  } catch { return true }
}

// ─── LANDING SCREEN ───────────────────────────────────────────────────────────

function LandingScreen({ onCreateAccount, onLogin }: { onCreateAccount: () => void; onLogin: () => void }) {
  const [slide, setSlide] = useState(0)
  const slideAnim = useRef(new Animated.Value(0)).current
  const touchX = useRef<number | null>(null)

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= LANDING_SLIDES.length) return
    slideAnim.setValue(idx > slide ? W : -W)
    setSlide(idx)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start()
  }

  const cur = LANDING_SLIDES[slide]
  const isLast = slide === LANDING_SLIDES.length - 1

  return (
    <LinearGradient
      colors={cur.bg as any} style={s.fill}
      onTouchStart={e => { touchX.current = e.nativeEvent.pageX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.nativeEvent.pageX - touchX.current
        if (dx < -50) goTo(slide + 1)
        else if (dx > 50) goTo(slide - 1)
        touchX.current = null
      }}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.fill}>
        <View style={s.logoRow}>
          <Image source={require('../../assets/images/logo.png')} style={s.logo} resizeMode="contain" />
        </View>

        <Animated.View style={[s.slideImgWrap, { transform: [{ translateX: slideAnim }] }]}>
          <Image source={cur.img} style={s.slideImg} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[s.slideTextWrap, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={[s.slideTitle, { color: cur.titleColor }]}>{cur.title}</Text>
          <Text style={[s.slideSub, { color: cur.subColor }]}>{cur.sub}</Text>
        </Animated.View>

        <View style={s.dotsRow}>
          {LANDING_SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[s.dot, { backgroundColor: i === slide ? cur.accent : 'rgba(0,0,0,0.12)' }, i === slide && { width: 28, borderRadius: 4 }]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.landingBtns}>
          {isLast ? (
            <>
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: '#6366F1', shadowColor: '#6366F1', shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 }]} onPress={onCreateAccount}>
                <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Create Account ✦</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnSecondary, { borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.06)' }]} onPress={onLogin}>
                <Text style={[s.btnSecondaryText, { color: '#6366F1' }]}>Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: cur.accent, shadowColor: cur.accent, shadowOpacity: 0.45, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 10 }]} onPress={() => goTo(slide + 1)}>
                <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Next  →</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onLogin} style={{ alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ fontSize: 14, color: '#94A3B8', letterSpacing: 0.1 }}>
                  Already have an account? <Text style={{ color: '#6366F1', fontWeight: '700' }}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── REGISTRATION SCREEN ──────────────────────────────────────────────────────

function RegistrationScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [tab, setTab] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const isPhoneValid = phone.replace(/\D/g, '').length >= 7
  const isValid = tab === 'email' ? isEmailValid : isPhoneValid

  const handleContinue = () => {
    if (!isValid || isChecking) return
    setIsChecking(true)
    setTimeout(() => { setIsChecking(false); onContinue() }, 900)
  }

  return (
    <LinearGradient colors={['#EDE9FE', '#E0E7FF', '#DBEAFE']} style={s.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.fill}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

            {/* Top bar */}
            <View style={s.authTopBar}>
              <TouchableOpacity onPress={onBack} style={s.authBackBtn}>
                <Ionicons name="chevron-back" size={22} color="rgba(51,65,85,0.7)" />
              </TouchableOpacity>
              <Image source={require('../../assets/images/logo.png')} style={s.authLogo} resizeMode="contain" />
              <View style={{ width: 40 }} />
            </View>

            <View style={s.authContent}>

              {/* Heading */}
              <View style={{ alignItems: 'center', marginBottom: 36 }}>
                <Text style={[s.authTitle, { fontSize: 32, textAlign: 'center' }]}>Find your people</Text>
                <Text style={[s.authSub, { marginTop: 8 }]}>Join companions going to the same{'\n'}events in your city.</Text>
              </View>

              {/* Tab toggle */}
              <View style={s.tabToggle}>
                {(['email', 'phone'] as const).map(t => (
                  <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tabBtn, tab === t && s.tabBtnOn]}>
                    <Text style={[s.tabBtnTxt, tab === t && s.tabBtnTxtOn]}>{t === 'email' ? '✉️  Email' : '📱  Phone'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input */}
              <View style={s.glassInput}>
                <Text style={{ fontSize: 17, marginRight: 10 }}>{tab === 'email' ? '✉️' : '📱'}</Text>
                {tab === 'email' ? (
                  <TextInput
                    style={s.glassInputText} value={email}
                    onChangeText={t => setEmail(t.replace(/\s/g, ''))}
                    placeholder="your@email.com" placeholderTextColor="#94A3B8"
                    keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                ) : (
                  <TextInput
                    style={s.glassInputText} value={phone}
                    onChangeText={t => setPhone(t.replace(/[^\d\s\-+()\s]/g, ''))}
                    placeholder="+357 99 000 000" placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad" />
                )}
                {isValid && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
              </View>

              {/* Continue button */}
              <TouchableOpacity
                style={[s.btnPrimary, { backgroundColor: isValid ? '#6366F1' : 'rgba(99,102,241,0.35)', marginTop: 14, shadowColor: '#6366F1', shadowOpacity: isValid ? 0.45 : 0, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: isValid ? 8 : 0 }]}
                onPress={handleContinue} disabled={!isValid || isChecking}>
                {isChecking ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Continue</Text>}
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(100,116,139,0.18)' }} />
                <Text style={{ fontSize: 13, color: '#94A3B8', letterSpacing: 0.3 }}>or continue with</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(100,116,139,0.18)' }} />
              </View>

              {/* Social buttons */}
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <TouchableOpacity style={[s.iconSocialBtn, { backgroundColor: '#fff' }]}>
                  <Svg width={28} height={28} viewBox="0 0 48 48">
                    <Path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                    <Path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                    <Path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                    <Path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                  </Svg>
                </TouchableOpacity>

                <TouchableOpacity style={[s.iconSocialBtn, { backgroundColor: '#111', borderColor: '#111' }]}>
                  <Ionicons name="logo-apple" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 28, lineHeight: 18 }}>
                By continuing you agree to our{' '}
                <Text style={{ color: '#6366F1', fontWeight: '600' }}>Terms</Text>
                {' '}and{' '}
                <Text style={{ color: '#6366F1', fontWeight: '600' }}>Privacy Policy</Text>
              </Text>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── OTP SCREEN ───────────────────────────────────────────────────────────────

function OTPScreen({ onBack, onVerify }: { onBack: () => void; onVerify: () => void }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [seconds, setSeconds] = useState(55)
  const [canResend, setCanResend] = useState(false)
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)]
  const isFull = digits.every(d => d !== '')

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(id); setCanResend(true); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(id)
  }, [])

  const handleDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = v; setDigits(next)
    if (v && i < 3) refs[i + 1].current?.focus()
    if (!v && i > 0) refs[i - 1].current?.focus()
  }

  return (
    <LinearGradient colors={['#EDE9FE', '#E0E7FF', '#DBEAFE']} style={s.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.fill}>
        <View style={s.authTopBar}>
          <TouchableOpacity onPress={onBack} style={s.authBackBtn}>
            <Ionicons name="chevron-back" size={22} color="rgba(51,65,85,0.7)" />
          </TouchableOpacity>
          <Image source={require('../../assets/images/logo.png')} style={s.authLogo} resizeMode="contain" />
          <View style={{ width: 40 }} />
        </View>

        <View style={[s.authContent, { alignItems: 'center' }]}>
          <Text style={[s.authTitle, { marginBottom: 12 }]}>Verify your account</Text>
          <Text style={[s.authSub, { marginBottom: 48 }]}>Enter the code sent to your{'\n'}email or phone number.</Text>

          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}>
            {digits.map((d, i) => (
              <TextInput
                key={i} ref={refs[i]}
                style={[s.otpBox, d ? s.otpBoxFilled : {}]}
                value={d} onChangeText={v => handleDigit(i, v)}
                keyboardType="number-pad" maxLength={1}
                autoFocus={i === 0} textAlign="center" />
            ))}
          </View>

          {canResend ? (
            <TouchableOpacity onPress={() => { setSeconds(55); setCanResend(false); setDigits(['', '', '', '']); refs[0].current?.focus() }}>
              <Text style={{ fontSize: 14, color: '#818CF8', fontWeight: '600' }}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Resend code in 00:{String(seconds).padStart(2, '0')}</Text>
          )}

          <TouchableOpacity
            style={[s.btnPrimary, { width: '100%', marginTop: 48, backgroundColor: isFull ? '#818CF8' : 'rgba(129,140,248,0.4)', shadowColor: '#818CF8', shadowOpacity: isFull ? 0.38 : 0, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: isFull ? 6 : 0 }]}
            onPress={() => isFull && onVerify()} disabled={!isFull}>
            <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Verify</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── ONBOARDING SCREEN ────────────────────────────────────────────────────────

function OnboardingScreen({ onBack, onFinish }: { onBack: () => void; onFinish: (data: any) => void }) {
  const TOTAL = 5
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<string | null>(null)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null])
  const [photoLoading, setPhotoLoading] = useState([false, false, false])
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [langs, setLangs] = useState<string[]>([])
  const [hasCar, setHasCar] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current

  const animSlide = (dir = 1) => {
    slideAnim.setValue(dir * 40)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }).start()
  }

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2 && age.length > 0 && !!gender
    if (step === 2) return photos.some(Boolean)
    if (step === 3) return bio.trim().length >= 10
    if (step === 4) return interests.length > 0
    if (step === 5) return langs.length > 0
    return true
  }

  const next = () => {
    if (step < TOTAL) { animSlide(1); setStep(p => p + 1) }
    else onFinish({ name, age, gender, photos, bio, interests, langs, hasCar })
  }

  const back = () => {
    if (step > 1) { animSlide(-1); setStep(p => p - 1) }
    else onBack()
  }

  const pickPhoto = async (idx: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photos.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: true, aspect: [3, 4] })
    if (result.canceled || !result.assets?.[0]) return
    const asset = result.assets[0]
    setPhotoLoading(l => { const n = [...l]; n[idx] = true; return n })
    const safe = await isImageSafe(asset.base64 ?? '')
    setPhotoLoading(l => { const n = [...l]; n[idx] = false; return n })
    if (!safe) { Alert.alert('Photo not allowed ❌', 'This photo was flagged. Please use an appropriate profile photo.'); return }
    setPhotos(p => { const n = [...p]; n[idx] = asset.uri; return n })
  }

  const progress = (step / TOTAL) * 100

  return (
    <LinearGradient colors={['#EDE9FE', '#E0E7FF', '#DBEAFE']} style={s.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.fill}>
        <View style={s.onbHeader}>
          <TouchableOpacity onPress={back} style={s.authBackBtn}>
            <Ionicons name="chevron-back" size={22} color="rgba(51,65,85,0.7)" />
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B' }}>Step {step} of {TOTAL}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` as any }]} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.stepScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>

              {step === 1 && (
                <View>
                  <Text style={s.stepTitle}>Tell us about yourself</Text>
                  <Text style={s.stepSub}>This info will be visible on your profile</Text>
                  <Text style={s.label}>Your name</Text>
                  <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#94A3B8" maxLength={30} />
                  <Text style={s.label}>Age</Text>
                  <TextInput style={[s.input, { width: 110 }]} value={age} onChangeText={t => setAge(t.replace(/\D/g, ''))} placeholder="18" placeholderTextColor="#94A3B8" keyboardType="number-pad" maxLength={2} />
                  <Text style={s.label}>Gender</Text>
                  <View style={s.row}>
                    {['Male', 'Female', 'Non-binary'].map(g => (
                      <TouchableOpacity key={g} onPress={() => setGender(g)} style={[s.chip, gender === g && s.chipOn]}>
                        <Text style={[s.chipTxt, gender === g && s.chipTxtOn]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {step === 2 && (
                <View>
                  <Text style={s.stepTitle}>Add your photos</Text>
                  <Text style={s.stepSub}>First photo required · All photos are automatically checked</Text>
                  <View style={s.photosRow}>
                    {photos.map((uri, idx) => (
                      <TouchableOpacity key={idx} style={[s.photoSlot, idx === 0 && s.photoSlotMain]} onPress={() => !uri && pickPhoto(idx)} activeOpacity={0.85}>
                        {photoLoading[idx] ? (
                          <View style={s.photoCenter}><ActivityIndicator color="#818CF8" /><Text style={s.photoCheckTxt}>Checking...</Text></View>
                        ) : uri ? (
                          <>
                            <Image source={{ uri }} style={s.photoImg} />
                            <TouchableOpacity style={s.photoRemoveBtn} onPress={() => setPhotos(p => { const n = [...p]; n[idx] = null; return n })}>
                              <Ionicons name="close" size={13} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.photoEditBtn} onPress={() => pickPhoto(idx)}>
                              <Feather name="edit-2" size={12} color="#818CF8" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={s.photoCenter}>
                            <Ionicons name="add" size={30} color="rgba(99,102,241,0.45)" />
                            {idx === 0 && <Text style={s.photoMainTxt}>main</Text>}
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text style={s.stepTitle}>About you</Text>
                  <Text style={s.stepSub}>A few words so people know who they're meeting</Text>
                  <TextInput
                    style={[s.input, s.bioInput]} value={bio}
                    onChangeText={t => setBio(t.slice(0, 150))}
                    placeholder={'e.g. Love jazz, good coffee\nand spontaneous adventures 🎷'}
                    placeholderTextColor="#94A3B8" multiline maxLength={150} textAlignVertical="top" />
                  <Text style={s.charCount}>{bio.length} / 150</Text>
                </View>
              )}

              {step === 4 && (
                <View>
                  <Text style={s.stepTitle}>What are you into?</Text>
                  <Text style={s.stepSub}>Select at least 1 interest to help us find your people</Text>
                  <View style={s.chipsWrap}>
                    {INTERESTS_LIST.map(item => (
                      <TouchableOpacity key={item} onPress={() => setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])} style={[s.chip, interests.includes(item) && s.chipOn]}>
                        <Text style={[s.chipTxt, interests.includes(item) && s.chipTxtOn]}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{ textAlign: 'center', fontSize: 13, color: interests.length > 0 ? '#22c55e' : '#94A3B8', marginTop: 4 }}>
                    {interests.length === 0 ? 'Pick at least one' : `${interests.length} selected ✓`}
                  </Text>
                </View>
              )}

              {step === 5 && (
                <View>
                  <Text style={s.stepTitle}>Languages & extras</Text>
                  <Text style={s.stepSub}>Pick at least 1 language</Text>
                  <Text style={s.label}>Languages I speak</Text>
                  <View style={s.chipsWrap}>
                    {LANGUAGES_LIST.map(l => (
                      <TouchableOpacity key={l.code} onPress={() => setLangs(prev => prev.includes(l.code) ? prev.filter(x => x !== l.code) : [...prev, l.code])} style={[s.chip, langs.includes(l.code) && s.chipOn]}>
                        <Text style={[s.chipTxt, langs.includes(l.code) && s.chipTxtOn]}>{l.flag}  {l.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={s.carRow} onPress={() => setHasCar(v => !v)} activeOpacity={0.85}>
                    <View style={[s.checkbox, hasCar && s.checkboxOn]}>
                      {hasCar && <Ionicons name="checkmark" size={15} color="#fff" />}
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

        <View style={s.bottomBar}>
          <TouchableOpacity style={[s.btnPrimary, !canNext() && { opacity: 0.4 }]} onPress={next} disabled={!canNext()}>
            <Text style={[s.btnPrimaryText, { color: '#fff' }]}>{step === TOTAL ? 'Finish 🎉' : 'Continue'}</Text>
          </TouchableOpacity>
          <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', fontWeight: '600' }}>{step} / {TOTAL}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────

function HomeTab({ city, setCityOpen, feedFilter, setFeedFilter, onEventPress }: any) {
  const cityEvents = MOCK_EVENTS.filter(e => e.city === city)
  const officialEvents = cityEvents.filter(e => e.type === 'official')
  const communityEvents = cityEvents.filter(e => e.type === 'community')
  const showOfficial = feedFilter === 'all' || feedFilter === 'official'
  const showCommunity = feedFilter === 'all' || feedFilter === 'community'

  return (
    <View style={{ flex: 1 }}>
      <View style={s.feedHeader}>
        <Image source={require('../../assets/images/logo.png')} style={{ width: 80, height: 24 }} resizeMode="contain" />
        <TouchableOpacity style={s.cityBtn} onPress={() => setCityOpen(true)}>
          <Text style={s.cityBtnTxt}>{city}</Text>
          <Ionicons name="chevron-down" size={14} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={s.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {[{ id: 'all', label: 'Everything' }, { id: 'official', label: '🌟 Big Events' }, { id: 'community', label: '☕ Social' }].map(f => (
          <TouchableOpacity key={f.id} style={[s.filterTab, feedFilter === f.id && s.filterTabOn]} onPress={() => setFeedFilter(f.id)}>
            <Text style={[s.filterTabTxt, feedFilter === f.id && s.filterTabTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {showOfficial && officialEvents.length > 0 && (
          <>
            <Text style={s.sectionHeader}>🌟 Big Events</Text>
            {officialEvents.map(ev => (
              <TouchableOpacity key={ev.id} style={s.officialCard} onPress={() => onEventPress(ev)} activeOpacity={0.9}>
                <LinearGradient colors={ev.gradient as any} style={s.officialCardInner}>
                  <Text style={s.officialCardCat}>{CATEGORY_EMOJI[ev.category] || '📍'} {ev.category?.toUpperCase()}  ·  {ev.distance}</Text>
                  <Text style={s.officialCardTitle}>{ev.title}</Text>
                  <Text style={s.officialCardTime}>🕐 {ev.time}</Text>
                  <View style={s.officialCardFooter}>
                    <View style={{ flexDirection: 'row' }}>
                      {ev.seekerColors.slice(0, 4).map((c, i) => (
                        <View key={i} style={[s.seekerDot, { backgroundColor: c, marginLeft: i > 0 ? -7 : 0, zIndex: 10 - i }]} />
                      ))}
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 10, alignSelf: 'center' }}>{ev.seekingCount} seekers</Text>
                    </View>
                    <View style={s.slotBadge}>
                      <Text style={s.slotBadgeTxt}>{ev.slots}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </>
        )}

        {showCommunity && communityEvents.length > 0 && (
          <>
            <Text style={s.sectionHeader}>☕ Social</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {communityEvents.map(ev => (
                <TouchableOpacity key={ev.id} style={s.communityCard} onPress={() => onEventPress(ev)} activeOpacity={0.9}>
                  <LinearGradient colors={ev.gradient as any} style={s.communityCardTop}>
                    <Text style={{ fontSize: 26 }}>{CATEGORY_EMOJI[ev.category] || '📍'}</Text>
                  </LinearGradient>
                  <View style={s.communityCardBody}>
                    <Text style={s.communityCardTitle} numberOfLines={2}>{ev.title}</Text>
                    <Text style={s.communityCardTime}>{ev.time}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      {ev.seekerColors.slice(0, 3).map((c, i) => (
                        <View key={i} style={[s.seekerDotSm, { backgroundColor: c, marginLeft: i > 0 ? -6 : 0, zIndex: 5 - i }]} />
                      ))}
                      <Text style={{ fontSize: 11, color: '#64748B', marginLeft: 4 }}>{ev.seekingCount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {officialEvents.length === 0 && communityEvents.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🏙️</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155' }}>No events in {city} yet</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Try a different city or filter</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// ─── MESSAGES TAB ─────────────────────────────────────────────────────────────

function MessagesTab({ chatList, onOpenChat }: { chatList: any[]; onOpenChat: (c: any) => void }) {
  const [subTab, setSubTab] = useState<'messages' | 'vibecheck'>('messages')
  const hasNew = chatList.some(c => c.isNew)

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: 52, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#818CF8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Parea</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.8 }}>My Chats</Text>
          </View>
          {hasNew && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, backgroundColor: '#6366F1' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>✨ New match!</Text>
            </View>
          )}
        </View>
        <View style={s.subTabRow}>
          {[{ id: 'messages', label: '💬 Messages' }, { id: 'vibecheck', label: '🔥 Vibe Check' }].map(t => (
            <TouchableOpacity key={t.id} style={[s.subTab, subTab === t.id && s.subTabOn]} onPress={() => setSubTab(t.id as any)}>
              <Text style={[s.subTabTxt, subTab === t.id && s.subTabTxtOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {subTab === 'messages' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
          {chatList.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#334155' }}>No chats yet</Text>
              <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Go explore events and find your Parea!</Text>
            </View>
          )}
          {chatList.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={[s.chatCard, chat.isNew && { borderColor: 'rgba(99,102,241,0.4)', borderWidth: 2, shadowColor: '#6366F1', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }]}
              onPress={() => onOpenChat(chat)} activeOpacity={0.8}>
              {chat.expiresIn <= 6 && <View style={{ height: 3, backgroundColor: '#EF4444', borderRadius: 99 }} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
                {chat.type === 'duo' ? (
                  <View style={[s.chatAvatar, { backgroundColor: chat.color }]}>
                    <Image source={{ uri: chat.photo }} style={{ width: '100%', height: '100%', borderRadius: 28 }} />
                  </View>
                ) : (
                  <View style={{ width: 56, height: 42 }}>
                    {chat.avatars.slice(0, 3).map((av: string, ai: number) => (
                      <Image key={ai} source={{ uri: av }} style={[s.chatAvatarOverlap, { left: ai * 15, backgroundColor: chat.colors[ai] }]} />
                    ))}
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={[{ fontSize: 15, fontWeight: '700', color: '#1E1B4B' }, chat.isNew && { color: '#4338CA' }]}>
                      {chat.type === 'duo' ? `${chat.name}, ${chat.age}` : chat.event}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>{chat.time}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#818CF8', marginBottom: 2 }}>
                    {chat.eventEmoji || ''} {chat.type === 'duo' ? chat.event : `${chat.members} members`}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B' }} numberOfLines={1}>{chat.lastMsg}</Text>
                </View>
                {chat.isNew && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' }} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔥</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155' }}>Vibe Check</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8, textAlign: 'center', paddingHorizontal: 48 }}>
            Join an event to see who's interested in the same activities
          </Text>
        </View>
      )}
    </View>
  )
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────

function ProfileTab({ userData }: { userData: any }) {
  const nm = userData?.name || 'Your Profile'
  const ag = userData?.age || ''

  return (
    <ScrollView contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 }}>
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View style={s.profileAvatar}>
          {userData?.photos?.[0] ? (
            <Image source={{ uri: userData.photos[0] }} style={{ width: '100%', height: '100%', borderRadius: 60 }} />
          ) : (
            <Text style={{ fontSize: 44 }}>😊</Text>
          )}
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E1B4B', marginTop: 14, letterSpacing: -0.4 }}>{nm}{ag ? `, ${ag}` : ''}</Text>
        {userData?.bio ? <Text style={{ fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>{userData.bio}</Text> : null}
        {userData?.hasCar && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(99,102,241,0.08)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 }}>
            <Text style={{ fontSize: 14 }}>🚗</Text>
            <Text style={{ fontSize: 13, color: '#6366F1', fontWeight: '600' }}>Has a car</Text>
          </View>
        )}
      </View>

      {(userData?.interests || []).length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={s.profileSectionTitle}>Interests</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(userData.interests || []).map((item: string) => (
              <View key={item} style={s.profileChip}><Text style={s.profileChipTxt}>{item}</Text></View>
            ))}
          </View>
        </View>
      )}

      {(userData?.langs || []).length > 0 && (
        <View style={{ marginBottom: 28 }}>
          <Text style={s.profileSectionTitle}>Languages</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(userData.langs || []).map((code: string) => {
              const l = LANGUAGES_LIST.find(x => x.code === code)
              return l ? <View key={code} style={s.profileChip}><Text style={s.profileChipTxt}>{l.flag} {l.label}</Text></View> : null
            })}
          </View>
        </View>
      )}

      {[
        { icon: 'settings', label: 'Settings' },
        { icon: 'shield', label: 'Privacy Policy' },
        { icon: 'file-text', label: 'Terms of Service' },
        { icon: 'log-out', label: 'Log Out', color: '#EF4444' },
      ].map(item => (
        <TouchableOpacity key={item.label} style={s.profileActionRow}>
          <Feather name={item.icon as any} size={18} color={item.color || '#64748B'} />
          <Text style={[{ flex: 1, fontSize: 15, color: '#334155', marginLeft: 14 }, item.color ? { color: item.color } : {}]}>{item.label}</Text>
          <Feather name="chevron-right" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

// ─── FEED SCREEN ──────────────────────────────────────────────────────────────

function FeedScreen({ userData = {} }: { userData?: any }) {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'messages' | 'profile'>('home')
  const [city, setCity] = useState('Limassol')
  const [cityOpen, setCityOpen] = useState(false)
  const [feedFilter, setFeedFilter] = useState('all')
  const [eventDetail, setEventDetail] = useState<any>(null)
  const [matchedWith, setMatchedWith] = useState<any>(null)
  const [vibeResults, setVibeResults] = useState<Record<number, string>>({})
  const [openChat, setOpenChat] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<Record<number, any[]>>({ ...MOCK_MESSAGES })
  const [chatInput, setChatInput] = useState('')
  const [chatList] = useState(MOCK_CHATS)
  const scrollRef = useRef<ScrollView>(null)

  const handleLike = (seeker: any) => {
    setVibeResults(prev => ({ ...prev, [seeker.id]: 'vibe' }))
    if (seeker.id === 1) setTimeout(() => setMatchedWith(seeker), 300)
  }

  const handlePass = (id: number) => setVibeResults(prev => ({ ...prev, [id]: 'pass' }))

  const handleSend = () => {
    if (!chatInput.trim() || !openChat) return
    const newMsg = { from: 'me', text: chatInput.trim(), time: 'now' }
    setChatMessages(prev => ({ ...prev, [openChat.id]: [...(prev[openChat.id] || []), newMsg] }))
    setChatInput('')
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60)
  }

  return (
    <LinearGradient colors={['#F5F3FF', '#EEF2FF', '#F0F9FF']} style={s.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.fill}>
        <View style={{ flex: 1 }}>
          {activeTab === 'home' && <HomeTab city={city} setCityOpen={setCityOpen} feedFilter={feedFilter} setFeedFilter={setFeedFilter} onEventPress={setEventDetail} />}
          {activeTab === 'search' && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🗺️</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155' }}>Map Search</Text>
              <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Coming soon</Text>
            </View>
          )}
          {activeTab === 'messages' && <MessagesTab chatList={chatList} onOpenChat={setOpenChat} />}
          {activeTab === 'profile' && <ProfileTab userData={userData} />}
        </View>

        {/* Bottom nav */}
        <View style={s.bottomNav}>
          {([
            { id: 'home', icon: 'home', label: 'Home' },
            { id: 'search', icon: 'search', label: 'Explore' },
            { id: 'messages', icon: 'message-circle', label: 'Chats' },
            { id: 'profile', icon: 'user', label: 'Profile' },
          ] as const).map(tab => (
            <TouchableOpacity key={tab.id} style={s.navItem} onPress={() => setActiveTab(tab.id)}>
              <Feather name={tab.icon} size={22} color={activeTab === tab.id ? '#6366F1' : '#94A3B8'} />
              <Text style={[s.navLabel, activeTab === tab.id && { color: '#6366F1' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* City picker */}
      <Modal visible={cityOpen} transparent animationType="fade" onRequestClose={() => setCityOpen(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setCityOpen(false)}>
          <View style={s.cityPickerSheet}>
            <Text style={s.cityPickerTitle}>Select City</Text>
            {CITIES.map(c => (
              <TouchableOpacity key={c} style={[s.cityPickerItem, city === c && { backgroundColor: 'rgba(99,102,241,0.08)' }]}
                onPress={() => { setCity(c); setCityOpen(false) }}>
                <Text style={[{ fontSize: 16, color: '#334155' }, city === c && { color: '#6366F1', fontWeight: '700' }]}>{c}</Text>
                {city === c && <Ionicons name="checkmark" size={18} color="#6366F1" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Event detail */}
      {eventDetail && (
        <Modal visible animationType="slide" onRequestClose={() => { setEventDetail(null); setVibeResults({}) }}>
          <LinearGradient colors={['#F5F3FF', '#EEF2FF', '#F0F9FF']} style={s.fill}>
            <StatusBar style="dark" />
            <SafeAreaView style={s.fill}>
              <LinearGradient colors={eventDetail.gradient as any} style={s.detailHeader}>
                <TouchableOpacity onPress={() => { setEventDetail(null); setVibeResults({}) }} style={s.detailBackBtn}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1, paddingRight: 56 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    {CATEGORY_EMOJI[eventDetail.category] || '📍'} {eventDetail.category?.toUpperCase()}  ·  {eventDetail.distance}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4, lineHeight: 28 }}>{eventDetail.title}</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>🕐 {eventDetail.time}</Text>
                </View>
              </LinearGradient>

              <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3 }}>People going to this event</Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Like someone to start chatting 💬</Text>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {MOCK_SEEKERS.map(sk => {
                  const result = vibeResults[sk.id]
                  return (
                    <View key={sk.id} style={[s.seekerCard, result === 'vibe' && { borderColor: '#818CF8', borderWidth: 2 }, result === 'pass' && { opacity: 0.35 }]}>
                      <Image source={{ uri: sk.photo }} style={s.seekerPhoto} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1B4B' }}>{sk.name}, {sk.age}</Text>
                          {sk.langs.map(l => <Text key={l} style={{ fontSize: 14 }}>{FLAG_MAP[l] || '🌍'}</Text>)}
                        </View>
                        <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 17 }} numberOfLines={2}>{sk.bio}</Text>
                        <Text style={{ fontSize: 11, color: '#818CF8', marginTop: 4, fontWeight: '600' }}>{TRANSPORT_LABEL[sk.transport]}</Text>
                      </View>
                      {!result ? (
                        <View style={{ gap: 8 }}>
                          <TouchableOpacity style={s.passBtn} onPress={() => handlePass(sk.id)}>
                            <Ionicons name="close" size={20} color="#94A3B8" />
                          </TouchableOpacity>
                          <TouchableOpacity style={s.vibeBtn} onPress={() => handleLike(sk)}>
                            <Ionicons name="heart" size={20} color="#818CF8" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: result === 'vibe' ? 'rgba(129,140,248,0.15)' : 'rgba(0,0,0,0.05)' }}>
                          <Text style={{ fontSize: 18 }}>{result === 'vibe' ? '💜' : '✕'}</Text>
                        </View>
                      )}
                    </View>
                  )
                })}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      )}

      {/* Match modal */}
      {matchedWith && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setMatchedWith(null)}>
          <View style={s.matchOverlay}>
            <View style={s.matchCard}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>✨</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.6, marginBottom: 8 }}>It's a Vibe!</Text>
              <Text style={{ fontSize: 15, color: '#64748B', marginBottom: 28 }}>You and {matchedWith.name} are both going!</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 28 }}>
                <Image source={{ uri: 'https://i.pravatar.cc/100?img=1' }} style={[s.matchAvatar, { zIndex: 2 }]} />
                <Image source={{ uri: matchedWith.photo }} style={[s.matchAvatar, { marginLeft: -18, zIndex: 1 }]} />
              </View>
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: '#818CF8', shadowColor: '#818CF8', shadowOpacity: 0.38, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 }]}
                onPress={() => { setMatchedWith(null); setEventDetail(null); setVibeResults({}); setActiveTab('messages') }}>
                <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Send a message 💬</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMatchedWith(null)} style={{ marginTop: 14, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 14 }}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Chat screen */}
      {openChat && (
        <Modal visible animationType="slide" onRequestClose={() => setOpenChat(null)}>
          <LinearGradient colors={['#F5F3FF', '#EEF2FF', '#F0F9FF']} style={s.fill}>
            <StatusBar style="dark" />
            <SafeAreaView style={s.fill}>
              <View style={s.chatHeader}>
                <TouchableOpacity onPress={() => setOpenChat(null)}>
                  <Ionicons name="chevron-back" size={24} color="#1E1B4B" />
                </TouchableOpacity>
                {openChat.type === 'duo' ? (
                  <View style={[s.chatHeaderAvatar, { backgroundColor: openChat.color }]}>
                    <Image source={{ uri: openChat.photo }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                  </View>
                ) : (
                  <View style={{ width: 44, height: 40, marginLeft: 10 }}>
                    {openChat.avatars?.slice(0, 2).map((av: string, ai: number) => (
                      <Image key={ai} source={{ uri: av }} style={[s.chatAvatarOverlap, { left: ai * 16, zIndex: 2 - ai }]} />
                    ))}
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B' }}>
                    {openChat.type === 'duo' ? `${openChat.name}, ${openChat.age}` : openChat.event}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>
                    {openChat.eventEmoji} {openChat.type === 'duo' ? openChat.event : `${openChat.members} members`}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Feather name="more-horizontal" size={22} color="#334155" />
                </TouchableOpacity>
              </View>

              <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
                {(chatMessages[openChat.id] || []).map((msg: any, i: number) => (
                  <View key={i} style={{ marginBottom: 10, alignItems: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                    {msg.from === 'them' && openChat.type === 'group' && (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                        <Image source={{ uri: msg.senderPhoto }} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: msg.senderColor }} />
                        <View style={{ maxWidth: W * 0.72 }}>
                          {msg.senderName && <Text style={{ fontSize: 11, color: msg.senderColor || '#818CF8', fontWeight: '600', marginBottom: 3, marginLeft: 4 }}>{msg.senderName}</Text>}
                          <View style={s.msgBubbleThem}>
                            <Text style={{ fontSize: 14, color: '#1E1B4B', lineHeight: 20 }}>{msg.text}</Text>
                          </View>
                          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, marginLeft: 4 }}>{msg.time}</Text>
                        </View>
                      </View>
                    )}
                    {msg.from === 'them' && openChat.type === 'duo' && (
                      <View style={{ maxWidth: W * 0.72 }}>
                        <View style={s.msgBubbleThem}>
                          <Text style={{ fontSize: 14, color: '#1E1B4B', lineHeight: 20 }}>{msg.text}</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, marginLeft: 4 }}>{msg.time}</Text>
                      </View>
                    )}
                    {msg.from === 'me' && (
                      <View style={{ maxWidth: W * 0.72 }}>
                        <View style={s.msgBubbleMe}>
                          <Text style={{ fontSize: 14, color: '#fff', lineHeight: 20 }}>{msg.text}</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, textAlign: 'right', marginRight: 4 }}>{msg.time}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>

              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={s.chatInputRow}>
                  <TextInput
                    style={s.chatInput} value={chatInput} onChangeText={setChatInput}
                    placeholder="Message..." placeholderTextColor="#94A3B8" multiline />
                  <TouchableOpacity
                    style={[s.sendBtn, { backgroundColor: chatInput.trim() ? '#6366F1' : '#E2E8F0' }]}
                    onPress={handleSend} disabled={!chatInput.trim()}>
                    <Ionicons name="arrow-up" size={20} color={chatInput.trim() ? '#fff' : '#94A3B8'} />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      )}
    </LinearGradient>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'register' | 'otp' | 'onboarding' | 'feed'>('landing')
  const [userData, setUserData] = useState<any>({})

  if (screen === 'landing') return <LandingScreen onCreateAccount={() => setScreen('register')} onLogin={() => setScreen('feed')} />
  if (screen === 'register') return <RegistrationScreen onBack={() => setScreen('landing')} onContinue={() => setScreen('otp')} />
  if (screen === 'otp') return <OTPScreen onBack={() => setScreen('register')} onVerify={() => setScreen('onboarding')} />
  if (screen === 'onboarding') return <OnboardingScreen onBack={() => setScreen('otp')} onFinish={data => { setUserData(data); setScreen('feed') }} />
  return <FeedScreen userData={userData} />
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  fill: { flex: 1 },

  // Landing
  logoRow: { alignItems: 'center', paddingTop: 36, paddingBottom: 8 },
  logo: { width: 200, height: 64 },
  slideImgWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  slideImg: { width: W * 0.88, height: W * 0.88 },
  slideTextWrap: { paddingHorizontal: 28, marginBottom: 20, alignItems: 'center' },
  slideTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, marginBottom: 12, lineHeight: 44, textAlign: 'center' },
  slideSub: { fontSize: 16, lineHeight: 26, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  landingBtns: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },

  // Buttons
  btnPrimary: { height: 58, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#818CF8', shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  btnPrimaryText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  btnSecondary: { height: 52, borderRadius: 32, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },

  // Auth
  authTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 4 },
  authBackBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  authLogo: { width: 150, height: 48 },
  authContent: { flex: 1, paddingHorizontal: 26, paddingTop: 12, paddingBottom: 44 },
  authTitle: { fontSize: 30, fontWeight: '800', color: '#334155', letterSpacing: -0.5, marginBottom: 10 },
  authSub: { fontSize: 15, color: '#64748B', lineHeight: 22, textAlign: 'center' },
  tabToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  tabBtn: { flex: 1, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabBtnOn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabBtnTxt: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  tabBtnTxtOn: { fontSize: 14, fontWeight: '600', color: '#334155' },
  glassInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 18, height: 58, marginBottom: 4 },
  glassInputText: { flex: 1, fontSize: 16, color: '#334155' },
  socialBtn: { flex: 1, height: 56, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  socialBtnFull: { height: 56, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.7)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  socialBtnTxt: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  googleG: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  iconSocialBtn: { flex: 1, height: 60, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },

  // OTP
  otpBox: { width: 68, height: 72, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', fontSize: 26, fontWeight: '700', color: '#334155', textAlign: 'center' },
  otpBoxFilled: { borderColor: 'rgba(129,140,248,0.7)', borderWidth: 2, shadowColor: '#818CF8', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },

  // Onboarding
  onbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 6 },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 20, borderRadius: 99, marginBottom: 6 },
  progressFill: { height: 4, backgroundColor: '#818CF8', borderRadius: 99 },
  stepScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.4, marginBottom: 6 },
  stepSub: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 28 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#334155', marginBottom: 20 },
  bioInput: { height: 130, paddingTop: 14 },
  charCount: { fontSize: 12, color: '#94A3B8', textAlign: 'right', marginTop: -16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
  chipOn: { backgroundColor: '#818CF8', borderColor: '#818CF8' },
  chipTxt: { fontSize: 14, color: '#334155', fontWeight: '500' },
  chipTxtOn: { color: '#fff', fontWeight: '700' },
  photosRow: { flexDirection: 'row', gap: 10, height: 240, marginBottom: 8 },
  photoSlot: { flex: 1, borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(185,208,235,0.4)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.75)' },
  photoSlotMain: { flex: 1.4, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(99,102,241,0.45)' },
  photoImg: { width: '100%', height: '100%' },
  photoCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  photoCheckTxt: { fontSize: 11, color: '#818CF8', fontWeight: '600' },
  photoMainTxt: { fontSize: 10, fontWeight: '700', color: '#6366F1', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 },
  photoRemoveBtn: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  photoEditBtn: { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  carRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 16, marginTop: 4 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(99,102,241,0.45)', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#818CF8', borderColor: '#818CF8' },
  carLabel: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 2 },
  carSub: { fontSize: 12, color: '#64748B' },
  bottomBar: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 8, gap: 10 },

  // Feed bottom nav
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 8, paddingBottom: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },

  // Feed header
  feedHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, gap: 8 },
  cityBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(99,102,241,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  cityBtnTxt: { fontSize: 14, fontWeight: '700', color: '#6366F1' },
  bellBtn: { marginLeft: 'auto' as any },
  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  filterTabOn: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterTabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  filterTabTxtOn: { color: '#fff' },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3, marginTop: 4, marginBottom: 4 },

  // Event cards
  officialCard: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  officialCardInner: { padding: 20, minHeight: 160 },
  officialCardCat: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  officialCardTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4, lineHeight: 26, marginBottom: 6 },
  officialCardTime: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  officialCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  communityCard: { width: (W - 44) / 2, borderRadius: 18, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  communityCardTop: { height: 64, alignItems: 'center', justifyContent: 'center' },
  communityCardBody: { padding: 12 },
  communityCardTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B', lineHeight: 19, marginBottom: 4 },
  communityCardTime: { fontSize: 11, color: '#64748B' },
  seekerDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff' },
  seekerDotSm: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#fff' },
  slotBadge: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  slotBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  cityPickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  cityPickerTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B4B', marginBottom: 16, textAlign: 'center' },
  cityPickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12 },

  // Event detail
  detailHeader: { padding: 20, paddingTop: 56, paddingBottom: 24, flexDirection: 'row', alignItems: 'flex-start' },
  detailBackBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },

  // Seekers
  seekerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  seekerPhoto: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0' },
  passBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  vibeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(129,140,248,0.12)', alignItems: 'center', justifyContent: 'center' },

  // Match
  matchOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  matchCard: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  matchAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },

  // Chat list
  chatCard: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  chatAvatar: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' },
  chatAvatarOverlap: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#fff' },

  // Sub tabs
  subTabRow: { flexDirection: 'row', backgroundColor: 'rgba(99,102,241,0.07)', borderRadius: 14, padding: 4, marginBottom: 4, borderWidth: 1, borderColor: 'rgba(99,102,241,0.12)' },
  subTab: { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  subTabOn: { backgroundColor: '#fff', shadowColor: '#6366F1', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  subTabTxt: { fontSize: 13, fontWeight: '500', color: '#94A3B8' },
  subTabTxtOn: { fontSize: 13, fontWeight: '700', color: '#4338CA' },

  // Chat screen
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: 'rgba(255,255,255,0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)', gap: 8 },
  chatHeaderAvatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', marginLeft: 8 },
  msgBubbleMe: { backgroundColor: '#6366F1', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleThem: { backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: 24, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  chatInput: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#334155', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  // Profile
  profileAvatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#6366F1', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  profileSectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 },
  profileChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: 'rgba(99,102,241,0.08)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)' },
  profileChipTxt: { fontSize: 13, color: '#4338CA', fontWeight: '600' },
  profileActionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
})
