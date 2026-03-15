// app/(tabs)/index.tsx — Parea Mobile
import { Feather, Ionicons } from '@expo/vector-icons'
import Svg, { Circle, Path } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Alert, Animated, Dimensions, Image, Linking,
  KeyboardAvoidingView, LayoutAnimation, Modal, PanResponder, Platform,
  ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import ConfettiCannon from 'react-native-confetti-cannon'

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
    imgScale: 0.78,
  },
  {
    img: require('../../assets/images/Gemini_Generated_Image_55nnbe55nnbe55nn-removebg-preview.png'),
    title: 'Match with real\npeople.',
    sub: "Like profiles of people going to the same event. Match — and you're in a group.",
    bg: ['#FFF0F9', '#FCE7F3', '#FBCFE8'],
    accent: '#EC4899', titleColor: '#1E1B4B', subColor: '#475569',
    imgScale: 1.0,
  },
  {
    img: require('../../assets/images/unnamed__2_-removebg-preview.png'),
    title: 'Show up.\nEnjoy together.',
    sub: 'Coffee on the beach, a board game evening, a concert — find your people.',
    bg: ['#F0FDF4', '#DCFCE7', '#BBF7D0'],
    accent: '#10B981', titleColor: '#1E1B4B', subColor: '#475569',
    imgScale: 1.0,
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
  { id: 1,  city: 'Limassol', type: 'official',   title: 'Tennis Tournament at Aphrodite Hills', time: 'Today, 18:00',    distance: '2km',   category: 'sports',  gradient: ['#667eea', '#764ba2'], seekerColors: ['#818CF8', '#4CAF50', '#2196F3'],          seekingCount: 12, participantsCount: 22, maxParticipants: 24,  organizer: { name: 'Cyprus Sports Federation', emoji: '🎾' }, ticketLink: 'https://tickets.cy/tennis2025',        source: 'Official Website', description: 'Official singles & doubles tournament at the iconic Aphrodite Hills resort. Open to all levels — bring your racket or rent one on site. Refreshments included.' },
  { id: 2,  city: 'Limassol', type: 'official',   title: 'Limassol Wine Festival 2025',          time: 'Tomorrow, 20:00', distance: '1.2km', category: 'wine',    gradient: ['#f093fb', '#f5576c'], seekerColors: ['#9C27B0', '#E91E63'],                     seekingCount: 28, participantsCount: 40, maxParticipants: 200, organizer: { name: 'SoldOut Tickets',              emoji: '🍷' }, ticketLink: 'https://soldout.com.cy/wine-festival', source: 'SoldOut Tickets',  description: 'The biggest wine celebration on the island. 40+ local wineries, live music, and Cypriot mezze. Ticket includes unlimited tastings from 20:00 to midnight.' },
  { id: 9,  city: 'Limassol', type: 'official',   title: 'CyprusTech Conference 2025',           time: 'Sat, 10:00',     distance: '3km',   category: 'tech',    gradient: ['#0f2027', '#2c5364'], seekerColors: ['#2196F3', '#FF9800', '#9C27B0', '#22c55e'], seekingCount: 7,  participantsCount: 80, maxParticipants: 150, organizer: { name: 'CyprusTech Events',             emoji: '💻' }, ticketLink: 'https://cyprustech.io/2025',           source: 'Official Website', description: 'Annual tech conference with speakers from EU startups, AI panels, and networking sessions. Great for founders, devs, and investors looking to connect in Cyprus.' },
  { id: 5,  city: 'Paphos',   type: 'official',   title: 'Sunset Hike to Troodos',               time: 'Sat, 07:00',     distance: '8km',   category: 'sports',  gradient: ['#fa8231', '#f7b731'], seekerColors: ['#334155', '#818CF8', '#22c55e'],          seekingCount: 9,  participantsCount: 14, maxParticipants: 20,  organizer: { name: 'Paphos Outdoor Club',          emoji: '🥾' }, ticketLink: null,                                  source: 'Official Website', description: 'Guided 12km trail through pine forest with panoramic summit views. Moderate difficulty. Bring water, snacks, and layers — it gets cool at the top.' },
  { id: 3,  city: 'Limassol', type: 'community',  title: 'Morning Coffee & Chat',               time: 'Today, 09:30',   distance: '0.5km', category: 'coffee',  gradient: ['#4facfe', '#00c6fb'], seekerColors: ['#FF9800', '#03A9F4', '#8BC34A', '#FF5722'], seekingCount: 4,  participantsCount: 8,  maxParticipants: 8,  description: 'Casual meetup at a specialty café near the marina. No agenda, just good coffee and good conversation. Perfect for remote workers and people new to the city.' },
  { id: 4,  city: 'Nicosia',  type: 'community',  title: 'Board Games Night',                   time: 'Fri, 19:00',     distance: '3km',   category: 'gaming',  gradient: ['#43e97b', '#38f9d7'], seekerColors: ['#FF5722', '#9C27B0'],                     seekingCount: 2,  participantsCount: 3,  maxParticipants: 10, description: 'Friendly evening of strategy and party games — Catan, Codenames, Ticket to Ride and more. All experience levels welcome. Snacks provided, BYO drinks.' },
  { id: 6,  city: 'Nicosia',  type: 'community',  title: 'Specialty Coffee Tour',               time: 'Sun, 11:00',     distance: '1km',   category: 'coffee',  gradient: ['#a18cd1', '#fbc2eb'], seekerColors: ['#818CF8', '#22c55e'],                     seekingCount: 2,  participantsCount: 6,  maxParticipants: 6,  description: 'Walk through 3 of Nicosia\'s best third-wave coffee spots. Each stop features a different brew method. Great way to explore the old city on foot.' },
  { id: 7,  city: 'Larnaca',  type: 'community',  title: 'Beach Volleyball',                    time: 'Today, 17:00',   distance: '4km',   category: 'sports',  gradient: ['#ffecd2', '#fcb69f'], seekerColors: ['#2196F3', '#FF9800', '#9C27B0'],          seekingCount: 3,  participantsCount: 12, maxParticipants: 12, description: 'Casual 3v3 volleyball on Mackenzie Beach. All skill levels welcome — we play for fun, not for points. Bring sunscreen, we\'re usually there till sunset.' },
  { id: 8,  city: 'Larnaca',  type: 'community',  title: 'Wine & Jazz Evening',                 time: 'Sat, 20:00',     distance: '2km',   category: 'wine',    gradient: ['#c471f5', '#fa71cd'], seekerColors: ['#818CF8', '#4CAF50'],                     seekingCount: 5,  participantsCount: 8,  maxParticipants: 20, description: 'Laid-back evening with live jazz duo, Cypriot wines, and a selection of local cheeses. Held in a rooftop bar overlooking the salt lake. No reservation needed.' },
  { id: 10, city: 'Limassol', type: 'community',  title: 'Sunset Picnic at Dasoudi Beach',      time: 'Today, 17:30',   distance: '1.5km', category: 'outdoors',gradient: ['#134e5e', '#71b280'], seekerColors: ['#818CF8', '#22c55e', '#f59e0b'],          seekingCount: 6,  participantsCount: 9,  maxParticipants: 15, description: 'Bring a blanket and something to share — we\'ll have music, golden hour views, and good company on the beachfront. It\'s a vibe, not an event.' },
  { id: 11, city: 'Limassol', type: 'official',   title: 'Mediterranean Food Festival',         time: 'Tomorrow, 12:00',distance: '0.8km', category: 'food',    gradient: ['#f7971e', '#ffd200'], seekerColors: ['#ef4444', '#f97316', '#818CF8'],          seekingCount: 19, participantsCount: 55, maxParticipants: 500, organizer: { name: 'Limassol Municipality',      emoji: '🍕' }, ticketLink: 'https://limassol.gov.cy/food-fest',   source: 'Official Website', description: 'Two-day street food festival celebrating Mediterranean cuisine. 60+ food stalls, cooking demos, and live folk music from Greece, Lebanon, and Cyprus.' },
  { id: 12, city: 'Limassol', type: 'community',  title: 'Photography Walk — Old Port',         time: 'Sun, 09:00',     distance: '1km',   category: 'culture', gradient: ['#232526', '#414345'], seekerColors: ['#818CF8', '#22c55e'],                     seekingCount: 3,  participantsCount: 7,  maxParticipants: 10, description: 'Slow morning walk through the old port and castle district. Shoot on any camera or phone. We share and discuss photos over coffee at the end.' },
  { id: 13, city: 'Nicosia',  type: 'official',   title: 'Open Air Cinema Night',               time: 'Sat, 21:00',     distance: '2km',   category: 'culture', gradient: ['#0f0c29', '#302b63'], seekerColors: ['#a78bfa', '#f472b6', '#34d399'],          seekingCount: 11, participantsCount: 30, maxParticipants: 50,  organizer: { name: 'Coca-Cola Arena Nicosia',      emoji: '🎬' }, ticketLink: 'https://tickets.cy/cinema-night',     source: 'Coca-Cola Arena',  description: 'Classic film screening under the stars in the courtyard of the Nicosia Municipal Garden. Bring a picnic blanket. This week\'s film announced on the day.' },
]

// Maps INTERESTS_LIST labels → event categories for Data Matching
const INTEREST_TO_CATEGORY: Record<string, string> = {
  '☕ Coffee': 'coffee', '🍷 Wine': 'wine', '🎾 Tennis': 'sports', '🎬 Movies': 'culture',
  '🥾 Hiking': 'outdoors', '🍕 Foodie': 'food', '🧘 Yoga': 'sports', '🎨 Art': 'culture',
  '🎸 Music': 'music', '✈️ Travel': 'outdoors',
}

const CATEGORY_EMOJI: Record<string, string> = { coffee: '☕', sports: '🎾', wine: '🍷', gaming: '🎮', tech: '💻', outdoors: '🌿', food: '🍕', culture: '🎨', music: '🎵' }

const BENTO_SONGS = ['Pop 🎤', 'Hip-Hop 🎧', 'R&B / Soul 🎶', 'Electronic / House 🎛️', 'Indie / Alternative 🎸', 'Jazz / Blues 🎷', 'Classical 🎻', 'Rock / Metal 🤘', 'Reggaeton / Latin 💃', 'Afrobeats 🥁', 'K-Pop 🌸', 'Lo-fi / Chillhop 🌙', 'Country 🤠', 'Funk / Disco 🕺']
const BENTO_FLAGS = ['Spontaneous plans 🟢', 'Great listener 🟢', 'Dog lover 🟢', 'Always on time 🟢', 'Foodie 🟢', 'Late replies 🚩', "Cancels last minute 🚩", 'No sense of humour 🚩', "Can't make plans 🚩"]
const BENTO_MOODS = ['Rooftop bar 🍸', 'Beach sunset 🌊', 'Cozy café ☕', 'Hiking adventure 🥾', 'Art gallery 🎨', 'House party 🎉', 'Chill picnic 🧺', 'Live concert 🎶']
const MAGIC_BIOS = [
  "Searching for my concert partner-in-crime 🎸",
  "Professional event-hopper, amateur chef 🍝",
  "Can't sit still — always planning the next adventure ✈️",
  "Here for the vibes and the people behind them 🌟",
  "Late night coffee, good music, and great company ☕🎶",
  "Living for unexpected Fridays and good conversations 💬",
]
const FLAG_MAP: Record<string, string> = { en: '🇬🇧', ru: '🇷🇺', el: '🇬🇷', uk: '🇺🇦', de: '🇩🇪', he: '🇮🇱', fr: '🇫🇷' }
const TRANSPORT_LABEL: Record<string, string> = { car: '🚗 Can give a lift', lift: '🙋 Needs a lift', meet: '📍 Meeting there' }

const MOCK_SEEKERS = [
  { id: 1, name: 'Elena',  age: 27, langs: ['en', 'el'], transport: 'car',  format: '1+1',   color: '#818CF8', photo: 'https://i.pravatar.cc/300?img=47', bio: 'Love exploring local spots 🌿 Cyprus local, always up for something new' },
  { id: 2, name: 'Dmitri', age: 31, langs: ['ru', 'en'], transport: 'lift', format: 'squad', color: '#4CAF50', photo: 'https://i.pravatar.cc/300?img=12', bio: 'IT engineer, moved here from Moscow 🇷🇺 Looking for people to explore the island' },
  { id: 3, name: 'Sarah',  age: 24, langs: ['en', 'de'], transport: 'meet', format: '1+1',   color: '#2196F3', photo: 'https://i.pravatar.cc/300?img=32', bio: 'Expat from Berlin 🌊 Obsessed with sunsets and good coffee' },
  { id: 4, name: 'Yael',   age: 29, langs: ['he', 'en'], transport: 'car',  format: 'party', color: '#9C27B0', photo: 'https://i.pravatar.cc/300?img=25', bio: 'Tel Aviv → Limassol 🌞 Digital nomad, loves big groups and good vibes' },
  { id: 5, name: 'Marcus', age: 34, langs: ['de', 'en'], transport: 'lift', format: 'squad', color: '#FF9800', photo: 'https://i.pravatar.cc/300?img=8',  bio: 'Freelance designer from Hamburg 🎨 Here for the winter, looking for adventure' },
]

const FORMAT_BADGE: Record<string, { color: string; label: string }> = {
  '1+1':   { color: '#f472b6', label: '1+1' },
  'squad': { color: '#818CF8', label: 'Squad' },
  'party': { color: '#fb923c', label: 'Party' },
}

const MOCK_CHATS: any[] = []

const MOCK_MESSAGES: Record<number, Array<{ from: string; text: string; time: string; senderName?: string; senderPhoto?: string; senderColor?: string }>> = {}

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
          <Image source={cur.img} style={[s.slideImg, { width: W * 0.88 * (cur.imgScale ?? 1), height: W * 0.88 * (cur.imgScale ?? 1) }]} resizeMode="contain" />
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

const COUNTRIES = [
  { flag: '🇨🇾', code: '+357', name: 'Cyprus',      digits: 8,  groups: [2, 3, 3] },
  { flag: '🇬🇧', code: '+44',  name: 'UK',           digits: 10, groups: [4, 3, 3] },
  { flag: '🇩🇪', code: '+49',  name: 'Germany',      digits: 10, groups: [3, 3, 4] },
  { flag: '🇬🇷', code: '+30',  name: 'Greece',       digits: 10, groups: [3, 3, 4] },
  { flag: '🇫🇷', code: '+33',  name: 'France',       digits: 9,  groups: [1, 2, 2, 2, 2] },
  { flag: '🇮🇹', code: '+39',  name: 'Italy',        digits: 10, groups: [3, 3, 4] },
  { flag: '🇪🇸', code: '+34',  name: 'Spain',        digits: 9,  groups: [3, 3, 3] },
  { flag: '🇳🇱', code: '+31',  name: 'Netherlands',  digits: 9,  groups: [2, 3, 4] },
  { flag: '🇵🇱', code: '+48',  name: 'Poland',       digits: 9,  groups: [3, 3, 3] },
  { flag: '🇨🇿', code: '+420', name: 'Czech Rep.',   digits: 9,  groups: [3, 3, 3] },
  { flag: '🇷🇴', code: '+40',  name: 'Romania',      digits: 9,  groups: [3, 3, 3] },
  { flag: '🇮🇱', code: '+972', name: 'Israel',       digits: 9,  groups: [2, 3, 4] },
  { flag: '🇺🇦', code: '+380', name: 'Ukraine',      digits: 9,  groups: [2, 3, 2, 2] },
  { flag: '🇷🇺', code: '+7',   name: 'Russia',       digits: 10, groups: [3, 3, 2, 2] },
]

function formatLocal(digits: string, groups: number[]) {
  let result = ''; let pos = 0
  for (const g of groups) {
    if (pos >= digits.length) break
    if (pos > 0) result += ' '
    result += digits.slice(pos, pos + g)
    pos += g
  }
  return result
}

function RegistrationScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [tab, setTab] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [localPhone, setLocalPhone] = useState('')
  const [country, setCountry] = useState(COUNTRIES[0])
  const [countryModal, setCountryModal] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const isPhoneValid = localPhone.replace(/\D/g, '').length >= country.digits
  const isValid = tab === 'email' ? isEmailValid : isPhoneValid

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, country.digits)
    setLocalPhone(formatLocal(digits, country.groups))
  }

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
              {tab === 'email' ? (
                <View style={s.glassInput}>
                  <Text style={{ fontSize: 17, marginRight: 10 }}>✉️</Text>
                  <TextInput
                    style={s.glassInputText} value={email}
                    onChangeText={t => setEmail(t.replace(/\s/g, ''))}
                    placeholder="your@email.com" placeholderTextColor="#94A3B8"
                    keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                  {isValid && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
                </View>
              ) : (
                <View style={s.glassInput}>
                  <TouchableOpacity onPress={() => setCountryModal(true)} style={s.countryBtn}>
                    <Text style={{ fontSize: 20 }}>{country.flag}</Text>
                    <Text style={s.countryCode}>{country.code}</Text>
                    <Ionicons name="chevron-down" size={13} color="#94A3B8" />
                  </TouchableOpacity>
                  <View style={s.countryDivider} />
                  <TextInput
                    style={[s.glassInputText, { flex: 1 }]} value={localPhone}
                    onChangeText={handlePhoneChange}
                    placeholder="99 123 456" placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad" />
                  {isPhoneValid && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
                </View>
              )}

              {/* Country picker modal */}
              <Modal visible={countryModal} transparent animationType="slide" onRequestClose={() => setCountryModal(false)}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => setCountryModal(false)} />
                <View style={s.countryModal}>
                  <View style={s.countryModalHandle} />
                  <Text style={s.countryModalTitle}>Select country</Text>
                  <ScrollView>
                    {COUNTRIES.map(c => (
                      <TouchableOpacity key={c.code + c.name} style={[s.countryRow, country.name === c.name && { backgroundColor: 'rgba(99,102,241,0.07)' }]}
                        onPress={() => { setCountry(c); setLocalPhone(''); setCountryModal(false) }}>
                        <Text style={{ fontSize: 24 }}>{c.flag}</Text>
                        <Text style={s.countryRowName}>{c.name}</Text>
                        <Text style={s.countryRowCode}>{c.code}</Text>
                        {country.name === c.name && <Ionicons name="checkmark" size={18} color="#6366F1" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Modal>

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
                {'By tapping "Continue" you agree to our '}
                <Text style={{ color: '#6366F1', fontWeight: '600' }} onPress={() => Alert.alert('Terms of Service', 'Link will be added soon.')}>Terms of Service</Text>
                {' and '}
                <Text style={{ color: '#6366F1', fontWeight: '600' }} onPress={() => Alert.alert('Privacy Policy', 'Link will be added soon.')}>Privacy Policy</Text>
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
  const [seconds, setSeconds] = useState(59)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)]
  const shakeAnim = useRef(new Animated.Value(0)).current
  const isFull = digits.every(d => d !== '')

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(id); setCanResend(true); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(id)
  }, [])

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start()
  }

  const handleDigit = (i: number, val: string) => {
    setError('')
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = v; setDigits(next)
    if (v && i < 3) refs[i + 1].current?.focus()
    if (!v && i > 0) refs[i - 1].current?.focus()
    if (v && i === 3) {
      const code = [...next.slice(0, 3), v].join('')
      if (code.length === 4) setTimeout(() => handleVerify([...next.slice(0, 3), v]), 100)
    }
  }

  const handleVerify = (d = digits) => {
    if (!d.every(x => x !== '') || isVerifying) return
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      if (d.join('') === '1234') {
        onVerify()
      } else {
        setError('Wrong code. Please try again.')
        shake()
        setDigits(['', '', '', ''])
        setTimeout(() => refs[0].current?.focus(), 50)
      }
    }, 800)
  }

  const handleResend = () => {
    setSeconds(59); setCanResend(false)
    setDigits(['', '', '', '']); setError('')
    refs[0].current?.focus()
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
          <Text style={[s.authTitle, { marginBottom: 12 }]}>Verify your number</Text>
          <Text style={[s.authSub, { marginBottom: 48 }]}>Enter the code sent to{'\n'}your phone number.</Text>

          <Animated.View style={{ flexDirection: 'row', gap: 16, marginBottom: 16, transform: [{ translateX: shakeAnim }] }}>
            {digits.map((d, i) => (
              <View key={i} style={[s.otpCell, d && s.otpCellFilled, error ? { borderBottomColor: '#EF4444' } : {}]}>
                <TextInput
                  ref={refs[i]}
                  style={s.otpInput}
                  value={d} onChangeText={v => handleDigit(i, v)}
                  keyboardType="number-pad" maxLength={1}
                  autoFocus={i === 0} textAlign="center"
                  caretHidden={true}
                  underlineColorAndroid="transparent" />
              </View>
            ))}
          </Animated.View>

          {error ? (
            <Text style={{ fontSize: 13, color: '#EF4444', marginBottom: 16, fontWeight: '500' }}>{error}</Text>
          ) : (
            <View style={{ height: 29 }} />
          )}

          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ fontSize: 14, color: '#818CF8', fontWeight: '600' }}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Resend code in 00:{String(seconds).padStart(2, '0')}</Text>
          )}

          <TouchableOpacity
            style={[s.btnPrimary, { width: '100%', marginTop: 40, backgroundColor: isFull && !isVerifying ? '#6366F1' : 'rgba(99,102,241,0.35)', shadowColor: '#6366F1', shadowOpacity: isFull ? 0.45 : 0, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: isFull ? 8 : 0 }]}
            onPress={() => handleVerify()} disabled={!isFull || isVerifying}>
            {isVerifying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Verify</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── ONBOARDING SCREEN ────────────────────────────────────────────────────────

function OnboardingScreen({ onBack, onFinish }: { onBack: () => void; onFinish: (data: any) => void }) {
  const insets = useSafeAreaInsets()
  const TOTAL = 5
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<string | null>(null)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null])
  const [photoLoading, setPhotoLoading] = useState([false, false, false])
  const [photoStatus, setPhotoStatus] = useState<('idle' | 'verified' | 'error')[]>(['idle', 'idle', 'idle'])
  const [photoError, setPhotoError] = useState<(string | null)[]>([null, null, null])
  const [photoBadge, setPhotoBadge] = useState([false, false, false])
  const [checklist, setChecklist] = useState<('idle' | 'ok' | 'warn')[]>(['idle', 'idle', 'idle'])
  const photoFadeAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [langs, setLangs] = useState<string[]>([])
  const [bentoSong, setBentoSong] = useState('')
  const [bentoFlags, setBentoFlags] = useState('')
  const [bentoMood, setBentoMood] = useState('')
  const [bentoModal, setBentoModal] = useState<{ visible: boolean; type: 'song' | 'flags' | 'mood' | null }>({ visible: false, type: null })
  const [vibeCheckPassed, setVibeCheckPassed] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const vibeFlashAnim = useRef(new Animated.Value(0)).current
  const counterBounceAnim = useRef(new Animated.Value(1)).current
  const barAnims = useRef([new Animated.Value(0.3), new Animated.Value(0.6), new Animated.Value(0.45), new Animated.Value(0.75)]).current
  const [emojiParticles, setEmojiParticles] = useState<Array<{ id: number; x: Animated.Value; y: Animated.Value; opacity: Animated.Value; rotate: Animated.Value }>>([])
  const slideAnim = useRef(new Animated.Value(0)).current
  const ageRef = useRef<TextInput>(null)

  // Music visualizer animation
  useEffect(() => {
    if (!bentoSong) { barAnims.forEach(a => a.setValue(0.2)); return }
    const loops = barAnims.map((anim, i) =>
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 250 + i * 90, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.15, duration: 250 + i * 90, useNativeDriver: true }),
      ]))
    )
    loops.forEach(l => l.start())
    return () => loops.forEach(l => l.stop())
  }, [bentoSong])

  const ageNum = parseInt(age, 10)
  const ageError = age.length === 2 && (ageNum < 18 || ageNum > 99)
  const ageValid = age.length >= 2 && ageNum >= 18 && ageNum <= 99

  const handleAgeChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 2)
    setAge(digits)
    if (digits.length === 2) ageRef.current?.blur()
  }

  const handleGender = (g: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setGender(g)
  }

  const animSlide = (dir = 1) => {
    slideAnim.setValue(dir * 40)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }).start()
  }

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2 && ageValid && !!gender
    if (step === 2) return photoStatus[0] === 'verified'
    if (step === 3) return interests.length > 0
    if (step === 4) return langs.length > 0
    if (step === 5) return bio.trim().length >= 20 || [bentoSong, bentoFlags, bentoMood].filter(Boolean).length >= 2
    return true
  }

  const fireEmojiBurst = () => {
    const raw = bentoMood || bentoFlags || '🎉'
    const emoji = raw.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u)?.[0] ?? '🎉'
    const particles = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: new Animated.Value(W / 2),
      y: new Animated.Value(700),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
    setEmojiParticles(particles)
    particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2
      const dist = 120 + Math.random() * 220
      const dur = 700 + Math.random() * 500
      Animated.parallel([
        Animated.timing(p.x, { toValue: W / 2 + Math.cos(angle) * dist, duration: dur, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: 150 + Math.random() * 450, duration: dur, useNativeDriver: true }),
        Animated.timing(p.rotate, { toValue: (Math.random() - 0.5) * 6, duration: dur, useNativeDriver: true }),
        Animated.sequence([Animated.delay(dur * 0.6), Animated.timing(p.opacity, { toValue: 0, duration: dur * 0.4, useNativeDriver: true })]),
      ]).start()
    })
    setTimeout(() => setEmojiParticles([]), 1400)
  }

  const next = () => {
    if (step < TOTAL) { animSlide(1); setStep(p => p + 1) }
    else {
      fireEmojiBurst()
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
        onFinish({ name, age, gender, photos, bio, interests, langs, bentoSong, bentoFlags, bentoMood })
      }, 2200)
    }
  }

  const back = () => {
    if (step > 1) { animSlide(-1); setStep(p => p - 1) }
    else onBack()
  }

  const removePhoto = (idx: number) => {
    setPhotos(p => { const n = [...p]; n[idx] = null; return n })
    setPhotoStatus(s => { const n = [...s]; n[idx] = 'idle'; return n })
    setPhotoError(e => { const n = [...e]; n[idx] = null; return n })
    if (idx === 0) setChecklist(['idle', 'idle', 'idle'])
  }

  // ── Replace this function body with a real API call when ready ──────────────
  // Expected: return 'verified' | 'error'
  const verifyPhoto = (imageUri: string, base64: string): Promise<'verified' | 'error'> =>
    new Promise(resolve =>
      setTimeout(async () => {
        const isTestFail = imageUri.toLowerCase().includes('test_fail')
        const safe = await isImageSafe(base64)
        resolve(isTestFail || !safe ? 'error' : 'verified')
      }, 2500)
    )
  // ─────────────────────────────────────────────────────────────────────────────

  const pickPhoto = async (idx: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photos.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: true, aspect: [3, 4] })
    if (result.canceled || !result.assets?.[0]) return
    const asset = result.assets[0]

    setPhotos(p => { const n = [...p]; n[idx] = null; return n })
    setPhotoStatus(s => { const n = [...s]; n[idx] = 'idle'; return n })
    setPhotoError(e => { const n = [...e]; n[idx] = null; return n })
    setPhotoLoading(l => { const n = [...l]; n[idx] = true; return n })

    const result2 = await verifyPhoto(asset.uri, asset.base64 ?? '')
    setPhotoLoading(l => { const n = [...l]; n[idx] = false; return n })

    if (result2 === 'error') {
      setPhotoStatus(s => { const n = [...s]; n[idx] = 'error'; return n })
      setPhotoError(e => { const n = [...e]; n[idx] = 'Face not detected. Try another photo.'; return n })
      return
    }

    setPhotos(p => { const n = [...p]; n[idx] = asset.uri; return n })
    setPhotoStatus(s => { const n = [...s]; n[idx] = 'verified'; return n })
    setPhotoError(e => { const n = [...e]; n[idx] = null; return n })
    setPhotoBadge(b => { const n = [...b]; n[idx] = true; return n })
    if (idx === 0) {
      const hasGlasses = asset.uri.toLowerCase().includes('glasses')
      setChecklist(['ok', 'ok', hasGlasses ? 'warn' : 'ok'])
      if (hasGlasses) Alert.alert('Sunglasses detected', 'Your photo may be rejected by moderation. Consider using a photo without sunglasses.')
    }
    photoFadeAnims[idx].setValue(0)
    Animated.timing(photoFadeAnims[idx], { toValue: 1, duration: 400, useNativeDriver: true }).start()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setTimeout(() => setPhotoBadge(b => { const n = [...b]; n[idx] = false; return n }), 1500)
  }

  const onPhotoPress = (idx: number) => {
    if (photos[idx]) {
      Alert.alert('Photo options', '', [
        { text: 'Replace photo', onPress: () => pickPhoto(idx) },
        { text: 'Delete', style: 'destructive', onPress: () => removePhoto(idx) },
        { text: 'Cancel', style: 'cancel' },
      ])
    } else if (!photoLoading[idx]) {
      pickPhoto(idx)
    }
  }

  const handleBioChange = (text: string) => {
    setBio(text.slice(0, 150))
    // Counter bounce
    counterBounceAnim.setValue(1.18)
    Animated.spring(counterBounceAnim, { toValue: 1, useNativeDriver: true, friction: 4 }).start()
    // Vibe check at 20 chars
    if (!vibeCheckPassed && text.length >= 20) {
      setVibeCheckPassed(true)
      Animated.sequence([
        Animated.timing(vibeFlashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(vibeFlashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
    if (text.length < 20) setVibeCheckPassed(false)
  }

  const magicRewrite = () => {
    if (magicLoading) return
    setMagicLoading(true)
    setTimeout(() => {
      setBio(MAGIC_BIOS[Math.floor(Math.random() * MAGIC_BIOS.length)])
      setMagicLoading(false)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, 1500)
  }

  const openBento = (type: 'song' | 'flags' | 'mood') => setBentoModal({ visible: true, type })
  const closeBento = () => setBentoModal({ visible: false, type: null })
  const selectBentoOption = (value: string) => {
    if (bentoModal.type === 'song') setBentoSong(value)
    else if (bentoModal.type === 'flags') setBentoFlags(value)
    else if (bentoModal.type === 'mood') setBentoMood(value)
    Haptics.selectionAsync()
    closeBento()
  }
  const bentoModalOptions = bentoModal.type === 'song' ? BENTO_SONGS : bentoModal.type === 'flags' ? BENTO_FLAGS : BENTO_MOODS
  const bentoModalValue = bentoModal.type === 'song' ? bentoSong : bentoModal.type === 'flags' ? bentoFlags : bentoMood
  const bentoModalTitle = bentoModal.type === 'song' ? '🎧  Music Taste' : bentoModal.type === 'flags' ? '🚩🟢  My Flag' : '⚡  Weekend Mood'

  const step5BgColors = (): [string, string, string] => {
    if (step !== 5) return ['#EDE9FE', '#E0E7FF', '#DBEAFE']
    if (/sport|tennis|gym|swim|run|hik/i.test(bio)) return ['#F0FDF4', '#DCFCE7', '#D1FAE5']
    if (/music|concert|jazz|guitar|song|beat/i.test(bio)) return ['#F5F3FF', '#EDE9FE', '#DDD6FE']
    if (/coffee|food|eat|restaurant|wine/i.test(bio)) return ['#FFF7ED', '#FEF3C7', '#FDE68A']
    if (/travel|beach|sea|explore|adventure/i.test(bio)) return ['#EFF6FF', '#DBEAFE', '#BFDBFE']
    return ['#EDE9FE', '#E0E7FF', '#DBEAFE']
  }

  const progress = (step / TOTAL) * 100

  return (
    <LinearGradient colors={step5BgColors()} style={s.fill}>
      <StatusBar style="dark" />
      {/* Vibe flash overlay */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', opacity: vibeFlashAnim, zIndex: 99 }} />
      {/* Confetti */}
      {showConfetti && <ConfettiCannon count={180} origin={{ x: W / 2, y: -20 }} fadeOut autoStart />}
      {/* Emoji burst particles */}
      {emojiParticles.map(p => (
        <Animated.Text key={p.id} style={{ position: 'absolute', fontSize: 28, zIndex: 101, transform: [{ translateX: p.x }, { translateY: p.y }, { rotate: p.rotate.interpolate({ inputRange: [-6, 6], outputRange: ['-360deg', '360deg'] }) }], opacity: p.opacity, pointerEvents: 'none' }}>
          {(bentoMood || bentoFlags || '🎉').match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u)?.[0] ?? '🎉'}
        </Animated.Text>
      ))}
      <SafeAreaView style={s.fill}>
        <View style={s.onbHeader}>
          <TouchableOpacity onPress={back} style={s.authBackBtn}>
            <Ionicons name="chevron-back" size={22} color="rgba(51,65,85,0.7)" />
          </TouchableOpacity>
          <Image source={require('../../assets/images/logo.png')} style={{ width: 110, height: 36 }} resizeMode="contain" />
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 99 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366F1' }}>{step}/{TOTAL}</Text>
          </View>
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
                  <TextInput style={s.input} value={name} onChangeText={t => setName(t.replace(/[^a-zA-ZА-Яа-яЁёÀ-ÿ\s\-']/g, ''))} placeholder="Name" placeholderTextColor="#94A3B8" maxLength={30} autoCapitalize="words" />

                  <Text style={s.label}>Age</Text>
                  <TextInput
                    ref={ageRef}
                    style={[s.input, { width: 110 }, ageError && { borderColor: '#EF4444', borderWidth: 1.5 }]}
                    value={age} onChangeText={handleAgeChange}
                    placeholder="18" placeholderTextColor="#94A3B8"
                    keyboardType="number-pad" maxLength={2} />
                  {ageError && (
                    <Text style={{ fontSize: 12, color: '#EF4444', marginTop: -12, marginBottom: 16 }}>
                      You must be 18 or older to use Parea
                    </Text>
                  )}

                  <Text style={s.label}>Gender</Text>
                  <View style={s.row}>
                    {['Male', 'Female', 'Non-binary'].map(g => (
                      <TouchableOpacity key={g} onPress={() => handleGender(g)}
                        style={[s.chip, gender === g && s.chipOn]}>
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

                  {/* Dynamic checklist */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Clear face', ci: 0 },
                      { label: 'Good lighting', ci: 1 },
                      { label: 'No sunglasses', ci: 2 },
                    ].map(({ label, ci }) => {
                      const st = checklist[ci]
                      const bg = st === 'ok' ? 'rgba(34,197,94,0.15)' : st === 'warn' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.55)'
                      const border = st === 'ok' ? 'rgba(34,197,94,0.4)' : st === 'warn' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.8)'
                      const color = st === 'ok' ? '#16a34a' : st === 'warn' ? '#DC2626' : '#64748B'
                      const icon = st === 'ok' ? '✅ ' : st === 'warn' ? '❌ ' : '◦ '
                      return (
                        <View key={label} style={{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: border }}>
                          <Text style={{ fontSize: 12, color, fontWeight: '500' }}>{icon}{label}</Text>
                        </View>
                      )
                    })}
                  </View>

                  {/* Photo slots */}
                  <View style={s.photosRow}>
                    {photos.map((uri, idx) => (
                      <View key={idx} style={{ flex: idx === 0 ? 1.4 : 1 }}>
                        <TouchableOpacity
                          style={[s.photoSlot, idx === 0 && s.photoSlotMain, photoStatus[idx] === 'verified' && { borderColor: '#22c55e', borderWidth: 2 }, photoStatus[idx] === 'error' && { borderColor: '#EF4444', borderWidth: 2 }]}
                          onPress={() => onPhotoPress(idx)} activeOpacity={0.85}>
                          {photoLoading[idx] ? (
                            <View style={s.photoCenter}>
                              <ActivityIndicator color="#6366F1" size="large" />
                              <Text style={s.photoCheckTxt}>Analyzing photo...</Text>
                            </View>
                          ) : uri ? (
                            <>
                              <Animated.Image source={{ uri }} style={[s.photoImg, { opacity: photoFadeAnims[idx] }]} />
                              <TouchableOpacity
                                style={s.photoRemoveBtn}
                                onPress={() => removePhoto(idx)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={14} color="#fff" />
                              </TouchableOpacity>
                              {idx === 0 && photoStatus[0] === 'verified' && (
                                <View style={s.mainBadge}>
                                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 1 }}>MAIN</Text>
                                </View>
                              )}
                              {photoBadge[idx] && (
                                <View style={s.verifiedBadge}>
                                  <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>Face verified ✅</Text>
                                </View>
                              )}
                            </>
                          ) : (
                            <View style={s.photoCenter}>
                              <Ionicons name="add" size={30} color="rgba(99,102,241,0.45)" />
                              {idx === 0 && <Text style={s.photoMainTxt}>MAIN</Text>}
                              <Text style={s.photoCropHint}>Tap · drag to crop</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        {photoError[idx] && (
                          <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 5, textAlign: 'center', fontWeight: '500' }}>{photoError[idx]}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {step === 3 && (
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

              {step === 4 && (
                <View>
                  <Text style={s.stepTitle}>Languages</Text>
                  <Text style={s.stepSub}>Pick at least 1 language</Text>
                  <View style={s.chipsWrap}>
                    {LANGUAGES_LIST.map(l => (
                      <TouchableOpacity key={l.code} onPress={() => setLangs(prev => prev.includes(l.code) ? prev.filter(x => x !== l.code) : [...prev, l.code])} style={[s.chip, langs.includes(l.code) && s.chipOn]}>
                        <Text style={[s.chipTxt, langs.includes(l.code) && s.chipTxtOn]}>{l.flag}  {l.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {step === 5 && (
                <View>
                  <Text style={s.stepTitle}>The Vibe Check ✨</Text>
                  <Text style={s.stepSub}>Make your profile unforgettable</Text>

                  {/* Bento grid */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, height: 220 }}>

                    {/* Song card */}
                    <TouchableOpacity onPress={() => openBento('song')} activeOpacity={0.8}
                      style={{ flex: 1.1, borderRadius: 22, overflow: 'hidden' }}>
                      <LinearGradient
                        colors={bentoSong ? ['#4c1d95', '#6d28d9'] : ['#7c3aed', '#a78bfa']}
                        style={[s.bentoCard, { borderColor: 'rgba(255,255,255,0.18)' }]}>
                        <Text style={{ fontSize: 28, marginBottom: 8 }}>🎧</Text>
                        <Text style={[s.bentoLabel, { color: 'rgba(255,255,255,0.6)' }]}>MUSIC TASTE</Text>
                        <Text style={{ fontSize: 13, color: '#fff', fontWeight: bentoSong ? '700' : '400', lineHeight: 18, marginTop: 2, flex: 1, opacity: bentoSong ? 1 : 0.55 }} numberOfLines={4}>
                          {bentoSong || '+ add'}
                        </Text>
                        {!!bentoSong && (
                          <View style={{ flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 20, marginTop: 8 }}>
                            {barAnims.map((anim, i) => (
                              <Animated.View key={i} style={{ width: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.85)', height: 20, transform: [{ scaleY: anim }] }} />
                            ))}
                          </View>
                        )}
                        {!bentoSong && (
                          <View style={{ position: 'absolute', bottom: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18, color: '#fff', lineHeight: 22 }}>+</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Right column */}
                    <View style={{ flex: 1, gap: 10 }}>
                      <TouchableOpacity onPress={() => openBento('flags')} activeOpacity={0.8}
                        style={{ flex: 1, borderRadius: 22, overflow: 'hidden' }}>
                        <LinearGradient
                          colors={bentoFlags ? ['#064e3b', '#059669'] : ['#10b981', '#34d399']}
                          style={[s.bentoCard, { borderColor: 'rgba(255,255,255,0.18)' }]}>
                          <Text style={{ fontSize: 20, marginBottom: 4 }}>🚩🟢</Text>
                          <Text style={[s.bentoLabel, { color: 'rgba(255,255,255,0.6)' }]}>MY FLAG</Text>
                          <Text style={{ fontSize: 11, color: '#fff', fontWeight: bentoFlags ? '700' : '400', flex: 1, opacity: bentoFlags ? 1 : 0.55 }} numberOfLines={2}>
                            {bentoFlags || '+ add'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => openBento('mood')} activeOpacity={0.8}
                        style={{ flex: 1, borderRadius: 22, overflow: 'hidden' }}>
                        <LinearGradient
                          colors={bentoMood ? ['#92400e', '#b45309'] : ['#f97316', '#fbbf24']}
                          style={[s.bentoCard, { borderColor: 'rgba(255,255,255,0.18)' }]}>
                          <Text style={{ fontSize: 20, marginBottom: 4 }}>⚡</Text>
                          <Text style={[s.bentoLabel, { color: 'rgba(255,255,255,0.6)' }]}>WEEKEND MOOD</Text>
                          <Text style={{ fontSize: 11, color: '#fff', fontWeight: bentoMood ? '700' : '400', flex: 1, opacity: bentoMood ? 1 : 0.55 }} numberOfLines={2}>
                            {bentoMood || '+ add'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* About me (compact) */}
                  <TextInput
                    style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                    value={bio} onChangeText={handleBioChange}
                    placeholder="Add a short note about yourself..."
                    placeholderTextColor="#94A3B8" multiline maxLength={150} />

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 14 }}>
                    <Animated.Text style={[s.charCount, { transform: [{ scale: counterBounceAnim }] }]}>{bio.length} / 150</Animated.Text>
                    {vibeCheckPassed && <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '700' }}>Vibe Check Passed! ✅</Text>}
                  </View>

                  {/* Magic Rewrite */}
                  <TouchableOpacity onPress={magicRewrite} disabled={magicLoading} activeOpacity={0.85}>
                    <LinearGradient colors={['#7c3aed', '#4f46e5', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ borderRadius: 16, paddingVertical: 13, alignItems: 'center', shadowColor: '#6366F1', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 }}>
                        {magicLoading ? 'Vibing... ✨' : 'Magic Rewrite ✨'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bento picker bottom sheet */}
              <Modal visible={bentoModal.visible} transparent animationType="slide" onRequestClose={closeBento}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={closeBento} />
                <View style={s.bentoSheet}>
                  <View style={s.bentoSheetHandle} />
                  <Text style={s.bentoSheetTitle}>{bentoModalTitle}</Text>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                    {bentoModalOptions.map(opt => {
                      const selected = bentoModalValue === opt
                      return (
                        <TouchableOpacity key={opt} onPress={() => selectBentoOption(opt)} activeOpacity={0.75}
                          style={[s.bentoSheetItem, selected && s.bentoSheetItemOn]}>
                          <Text style={[s.bentoSheetItemTxt, selected && { color: '#6366F1', fontWeight: '700' }]}>{opt}</Text>
                          {selected && <Ionicons name="checkmark-circle" size={20} color="#6366F1" />}
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>
              </Modal>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom + 24, 80) }]}>
          {step === TOTAL ? (
            <TouchableOpacity style={[s.bentoFinishBtn, !canNext() && { opacity: 0.5 }, canNext() && { shadowOpacity: 0.55, shadowRadius: 28, elevation: 14 }]} onPress={next} disabled={!canNext() || showConfetti} activeOpacity={0.88}>
              <BlurView intensity={40} tint="light" style={s.bentoFinishBlur}>
                <LinearGradient colors={['#a78bfa', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.bentoFinishGrad}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.3 }}>Let's slay! 🚀</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btnPrimary, !canNext() && { opacity: 0.4 }]} onPress={next} disabled={!canNext()}>
              <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────

function HomeTab({ city, setCityOpen, feedFilter, setFeedFilter, onEventPress, joinedEvents, onJoin, userInterests, setUserEventFormat, setUserEventTransport, onJoinConfirmed, pendingJoinEv, onPendingJoinConsumed, extraEvents }: any) {
  const now = Date.now()
  const allCityEvents = [...MOCK_EVENTS, ...(extraEvents || [])].filter(e => {
    if (e.city !== city) return false
    if (e.isHosted && e.expiresAt && e.expiresAt < now) return false
    return true
  })

  // Data Matching: events whose category matches user interests float to top
  const userCategories = (userInterests as string[]).map((i: string) => INTEREST_TO_CATEGORY[i]).filter(Boolean)

  const FILTERS = [
    { id: 'all', label: '✦ All' },
    { id: 'official', label: '🌟 Events' },
    { id: 'outdoors', label: '🌿 Outdoors' },
    { id: 'coffee', label: '☕ Social' },
    { id: 'food', label: '🍕 Food' },
    { id: 'culture', label: '🎨 Culture' },
    { id: 'sports', label: '🎾 Sports' },
  ]

  const filteredEvents = allCityEvents.filter(ev => {
    if (feedFilter === 'all') return true
    if (feedFilter === 'official') return ev.type === 'official'
    return ev.category === feedFilter
  })

  // Sort: matching interests first, then rest
  const visibleEvents = userCategories.length > 0
    ? [...filteredEvents].sort((a, b) => {
        const aMatch = userCategories.includes(a.category) ? 1 : 0
        const bMatch = userCategories.includes(b.category) ? 1 : 0
        return bMatch - aMatch
      })
    : filteredEvents

  const featured = visibleEvents[0]
  const rest = visibleEvents.slice(1)

  // ── Join Bottom Sheet state ──────────────────────────────────────────────
  const [joinSheet, setJoinSheet] = useState<{ visible: boolean; ev: any | null; step: 1 | 2; format: string; transport: string }>(
    { visible: false, ev: null, step: 1, format: '', transport: '' }
  )

  const openJoinSheet = (ev: any) => {
    setJoinSheet({ visible: true, ev, step: 1, format: '', transport: '' })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  // When FeedScreen asks to re-open join sheet (from "Update my plans")
  useEffect(() => {
    if (pendingJoinEv) {
      openJoinSheet(pendingJoinEv)
      onPendingJoinConsumed?.()
    }
  }, [pendingJoinEv])
  const closeJoinSheet = () => setJoinSheet(prev => ({ ...prev, visible: false }))

  const confirmJoin = () => {
    onJoin(joinSheet.ev)
    if (joinSheet.ev?.id) {
      if (joinSheet.format)    setUserEventFormat?.((prev: Record<number, string>) => ({ ...prev, [joinSheet.ev.id]: joinSheet.format }))
      if (joinSheet.transport) setUserEventTransport?.((prev: Record<number, string>) => ({ ...prev, [joinSheet.ev.id]: joinSheet.transport }))
    }
    onJoinConfirmed?.(joinSheet.ev, joinSheet.format, joinSheet.transport)
    closeJoinSheet()
  }

  const getJoinState = (ev: any) => {
    if (ev.participantsCount >= ev.maxParticipants) return 'full'
    return joinedEvents?.[ev.id] || 'none'
  }

  const JoinButton = ({ ev, large, onDark = false }: { ev: any; large?: boolean; onDark?: boolean }) => {
    const state = getJoinState(ev)
    const isFull = state === 'full'
    const joinLabel = ev.type === 'official' ? "I'm Going" : 'Join →'
    const label = isFull ? 'Full' : state === 'joined' ? 'Joined ✓' : state === 'pending' ? 'Pending…' : joinLabel

    // onDark=true (featured card): white translucent. onDark=false (list cards): solid colors
    let bg: string, textColor: string
    if (onDark) {
      bg = isFull ? 'rgba(255,255,255,0.10)' : state !== 'none' ? 'rgba(99,255,180,0.22)' : 'rgba(255,255,255,0.22)'
      textColor = '#fff'
    } else {
      if (isFull)             { bg = 'rgba(100,116,139,0.1)';  textColor = '#94A3B8' }
      else if (state === 'joined')  { bg = 'rgba(34,197,94,0.12)'; textColor = '#16a34a' }
      else if (state === 'pending') { bg = 'rgba(251,191,36,0.15)'; textColor = '#d97706' }
      else                          { bg = '#6366F1';              textColor = '#fff' }
    }

    return (
      <TouchableOpacity
        onPress={() => { if (!isFull && state === 'none') openJoinSheet(ev); else if (!isFull) onJoin(ev) }}
        activeOpacity={isFull ? 1 : 0.75}
        style={[s.joinBtn, { backgroundColor: bg, opacity: isFull ? 0.55 : 1, borderColor: onDark ? 'rgba(255,255,255,0.4)' : 'transparent' }, large && { paddingHorizontal: 22, paddingVertical: 12 }]}>
        <Text style={{ fontSize: large ? 14 : 11, fontWeight: '700', color: textColor }}>{label}</Text>
      </TouchableOpacity>
    )
  }

  // ── Format & Transport options ────────────────────────────────────────────
  const FORMAT_OPTIONS = [
    { id: '1+1',   emoji: '🧑‍🤝‍🧑', label: 'Duo',   sub: 'Me + 1 person' },
    { id: 'squad', emoji: '🫂', label: 'Squad',  sub: 'Me + 4 people' },
    { id: 'party', emoji: '🎉', label: 'Party',  sub: 'Me + up to 19' },
  ]
  const TRANSPORT_OPTIONS = [
    { id: 'car',  emoji: '🚗', label: "I'm driving",    sub: 'Can give a lift' },
    { id: 'lift', emoji: '🙋', label: 'Need a ride',    sub: "I'll hop in with someone" },
    { id: 'meet', emoji: '📍', label: 'Meet you there', sub: 'Getting there solo' },
  ]
  const todayEvents = rest.filter(e => e.time.toLowerCase().includes('today'))
  const upcoming = rest.filter(e => !e.time.toLowerCase().includes('today'))

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        stickyHeaderIndices={[0]}>

        {/* ── STICKY: Header + Filter chips ── */}
        <View style={{ backgroundColor: '#F8F7FF' }}>
          <View style={s.feedHeader}>
            <TouchableOpacity style={s.cityBtn} onPress={() => setCityOpen(true)}>
              <Text style={{ fontSize: 12, marginRight: 2 }}>📍</Text>
              <Text style={s.cityBtnTxt}>{city}</Text>
              <Ionicons name="chevron-down" size={13} color="#4338CA" />
            </TouchableOpacity>
          </View>
          <View style={{ height: 52 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterContent}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f.id} onPress={() => setFeedFilter(f.id)} activeOpacity={0.75}
                  style={[s.filterTab, feedFilter === f.id && s.filterTabOn]}>
                  <Text style={[s.filterTabTxt, feedFilter === f.id && s.filterTabTxtOn]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── SCROLLABLE CONTENT ── */}

        {/* Featured card */}
        {featured && (
          <TouchableOpacity onPress={() => onEventPress(featured)} activeOpacity={0.92} style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 6 }}>
            <LinearGradient colors={featured.gradient as any} style={s.featuredCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {featured.type === 'official' && (
                    <View style={s.officialBadge}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>OFFICIAL</Text>
                    </View>
                  )}
                  {featured.time.toLowerCase().includes('today') && (
                    <View style={[s.officialBadge, { backgroundColor: 'rgba(239,68,68,0.75)' }]}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginRight: 4 }} />
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>TODAY</Text>
                    </View>
                  )}
                </View>
                <View style={s.categoryCircle}>
                  <Text style={{ fontSize: 20 }}>{CATEGORY_EMOJI[featured.category] || '📍'}</Text>
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={s.featuredTitle} numberOfLines={2}>{featured.title}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 14 }}>
                  <View style={s.infoPill}><Text style={s.infoPillTxt}>🕐 {featured.time.split(', ')[1] || featured.time}</Text></View>
                  <View style={s.infoPill}><Text style={s.infoPillTxt}>📍 {featured.distance}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {featured.seekerColors.slice(0, 4).map((c: string, i: number) => (
                      <View key={i} style={[s.avatarDot, { backgroundColor: c, marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }]}>
                        <Ionicons name="person" size={11} color="rgba(255,255,255,0.9)" />
                      </View>
                    ))}
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginLeft: 10, fontWeight: '600' }}>
                      {featured.seekingCount} looking for company
                    </Text>
                  </View>
                  <JoinButton ev={featured} onDark />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Today section - horizontal scroll */}
        {todayEvents.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionHeader}>🔥 Happening Today</Text>
              <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '700' }}>{todayEvents.length} events</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}>
              {todayEvents.map(ev => (
                <TouchableOpacity key={ev.id} onPress={() => onEventPress(ev)} activeOpacity={0.85} style={s.compactCardShadow}>
                  <View style={s.compactCard}>
                    <LinearGradient colors={ev.gradient as any} style={s.compactCardGrad}>
                      <Text style={{ fontSize: 26 }}>{CATEGORY_EMOJI[ev.category] || '📍'}</Text>
                      {ev.type === 'official' && (
                        <View style={[s.officialBadge, { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2 }]}>
                          <Text style={{ fontSize: 8, fontWeight: '800', color: '#fff' }}>★</Text>
                        </View>
                      )}
                    </LinearGradient>
                    <View style={s.compactCardBody}>
                      <Text style={s.compactCardTitle} numberOfLines={2}>{ev.title}</Text>
                      <Text style={s.compactCardTime}>{ev.time.split(', ')[1] || ev.time}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {ev.seekerColors.slice(0, 3).map((c: string, i: number) => (
                            <View key={i} style={[s.avatarDotSm, { backgroundColor: c, marginLeft: i > 0 ? -5 : 0 }]} />
                          ))}
                          <Text style={{ fontSize: 10, color: '#6366F1', marginLeft: 6, fontWeight: '700' }}>{ev.seekingCount} going</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => { const st = getJoinState(ev); if (st === 'none') openJoinSheet(ev); else if (st !== 'full') onJoin(ev) }}
                          activeOpacity={getJoinState(ev) === 'full' ? 1 : 0.75}
                          style={{ backgroundColor: getJoinState(ev) === 'full' ? 'rgba(100,116,139,0.1)' : getJoinState(ev) === 'joined' ? 'rgba(34,197,94,0.12)' : getJoinState(ev) === 'pending' ? 'rgba(251,191,36,0.15)' : '#6366F1', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, opacity: getJoinState(ev) === 'full' ? 0.55 : 1 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: getJoinState(ev) === 'full' ? '#94A3B8' : getJoinState(ev) === 'joined' ? '#16a34a' : getJoinState(ev) === 'pending' ? '#d97706' : '#fff' }}>
                            {getJoinState(ev) === 'full' ? 'Full' : getJoinState(ev) === 'joined' ? 'Joined ✓' : getJoinState(ev) === 'pending' ? 'Pending…' : ev.type === 'official' ? "Going →" : 'Join →'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Upcoming - vertical list */}
        {upcoming.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionHeader}>📅 Coming Up</Text>
            </View>
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              {upcoming.map(ev => (
                <TouchableOpacity key={ev.id} onPress={() => onEventPress(ev)} activeOpacity={0.88} style={s.listCardShadow}>
                  <View style={s.listCard}>
                    <LinearGradient colors={ev.gradient as any} style={s.listCardLeft}>
                      <Text style={{ fontSize: 24 }}>{CATEGORY_EMOJI[ev.category] || '📍'}</Text>
                    </LinearGradient>
                    <View style={s.listCardBody}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        {ev.type === 'official' && (
                          <View style={[s.officialBadge, { paddingHorizontal: 7, paddingVertical: 2 }]}>
                            <Text style={{ fontSize: 8, fontWeight: '800', color: '#fff' }}>OFFICIAL</Text>
                          </View>
                        )}
                        <Text style={{ fontSize: 11, color: '#94A3B8' }}>{ev.distance}</Text>
                      </View>
                      <Text style={s.listCardTitle} numberOfLines={1}>{ev.title}</Text>
                      <Text style={s.listCardTime}>{ev.time}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6, paddingRight: 14 }}>
                      <View style={{ flexDirection: 'row' }}>
                        {ev.seekerColors.slice(0, 3).map((c: string, i: number) => (
                          <View key={i} style={[s.avatarDotSm, { backgroundColor: c, marginLeft: i > 0 ? -5 : 0 }]} />
                        ))}
                      </View>
                      <JoinButton ev={ev} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {visibleEvents.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 14 }}>🌴</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>Nothing here yet</Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>Try another vibe or check back later</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Join Bottom Sheet ──────────────────────────────────────── */}
      <Modal visible={joinSheet.visible} transparent animationType="slide" onRequestClose={closeJoinSheet}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,8,30,0.75)' }} activeOpacity={1} onPress={closeJoinSheet} />
        <View style={s.joinSheetWrap}>
          <View style={s.joinSheetHandle} />

          {/* Step indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2].map(n => (
                <View key={n} style={{ width: joinSheet.step === n ? 20 : 6, height: 6, borderRadius: 3,
                  backgroundColor: joinSheet.step >= n ? '#6366F1' : 'rgba(99,102,241,0.2)' }} />
              ))}
            </View>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Step {joinSheet.step} of 2</Text>
          </View>

          {joinSheet.step === 1 ? (
            <>
              <Text style={s.joinSheetTitle}>How many people are{'\n'}you looking for? 👥</Text>
              <View style={{ gap: 10, marginTop: 4 }}>
                {FORMAT_OPTIONS.map(opt => {
                  const active = joinSheet.format === opt.id
                  return (
                    <TouchableOpacity key={opt.id} activeOpacity={0.8}
                      onPress={() => {
                        setJoinSheet(prev => ({ ...prev, format: opt.id }))
                        Haptics.selectionAsync()
                      }}
                      style={[s.joinSheetCard, active && s.joinSheetCardOn]}>
                      <View style={[s.joinSheetIconWrap, active && { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
                        <Text style={{ fontSize: 26 }}>{opt.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.joinSheetCardLabel, active && { color: '#6366F1' }]}>{opt.label}</Text>
                        <Text style={s.joinSheetCardSub}>{opt.sub}</Text>
                      </View>
                      {active && <Ionicons name="checkmark-circle" size={22} color="#6366F1" />}
                    </TouchableOpacity>
                  )
                })}
              </View>
              <TouchableOpacity
                style={[s.joinSheetNext, !joinSheet.format && { opacity: 0.4 }]}
                disabled={!joinSheet.format}
                onPress={() => setJoinSheet(prev => ({ ...prev, step: 2 }))}>
                <Text style={s.joinSheetNextTxt}>Next →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setJoinSheet(prev => ({ ...prev, step: 1 }))}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <Ionicons name="chevron-back" size={14} color="#6366F1" />
                <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
              <Text style={s.joinSheetTitle}>How are you getting{'\n'}there? 🗺️</Text>
              <View style={{ gap: 10, marginTop: 4 }}>
                {TRANSPORT_OPTIONS.map(opt => {
                  const active = joinSheet.transport === opt.id
                  return (
                    <TouchableOpacity key={opt.id} activeOpacity={0.8}
                      onPress={() => {
                        setJoinSheet(prev => ({ ...prev, transport: opt.id }))
                        Haptics.selectionAsync()
                      }}
                      style={[s.joinSheetCard, active && s.joinSheetCardOn]}>
                      <View style={[s.joinSheetIconWrap, active && { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
                        <Text style={{ fontSize: 26 }}>{opt.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.joinSheetCardLabel, active && { color: '#6366F1' }]}>{opt.label}</Text>
                        <Text style={s.joinSheetCardSub}>{opt.sub}</Text>
                      </View>
                      {active && <Ionicons name="checkmark-circle" size={22} color="#6366F1" />}
                    </TouchableOpacity>
                  )
                })}
              </View>
              <TouchableOpacity
                style={[s.joinSheetNext, !joinSheet.transport && { opacity: 0.4 }, joinSheet.transport && { shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }]}
                disabled={!joinSheet.transport}
                onPress={confirmJoin}>
                <Text style={s.joinSheetNextTxt}>
                  {joinSheet.ev?.type === 'official' ? "I'm Going 🎉" : "Join Event →"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        </View>
      </Modal>

    </View>
  )
}

// ─── MESSAGES TAB ─────────────────────────────────────────────────────────────

function MessagesTab({ chatList, onOpenChat, onLeaveChat, joinedEvents = {}, userEventFormat = {}, userEventTransport = {}, onVibeCheck, onLeaveEvent, onUpdatePlans, initialSubTab, hostedEvents = [] }: {
  chatList: any[]; onOpenChat: (c: any) => void; onLeaveChat?: (id: number, addSystemMsg?: boolean) => void;
  joinedEvents?: Record<number, string>; userEventFormat?: Record<number, string>; userEventTransport?: Record<number, string>;
  onVibeCheck?: (ev: any) => void; onLeaveEvent?: (ev: any) => void; onUpdatePlans?: (ev: any) => void;
  initialSubTab?: 'going' | 'messages'; hostedEvents?: any[];
}) {
  const [subTab, setSubTab] = useState<'going' | 'messages'>(initialSubTab || 'going')
  const [crewSheet, setCrewSheet] = useState<{ ev: any; profiles: any[]; found: number; cap: number } | null>(null)
  const crewSheetAnim = useRef(new Animated.Value(0)).current
  const hasNew = chatList.some(c => c.isNew)

  const openCrewSheet = (ev: any, profiles: any[], found: number, cap: number) => {
    setCrewSheet({ ev, profiles, found, cap })
    Animated.spring(crewSheetAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }).start()
  }
  const closeCrewSheet = () => {
    Animated.timing(crewSheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setCrewSheet(null))
  }

  const now = Date.now()
  const myEvents = MOCK_EVENTS.filter(ev => ['joined', 'pending', 'confirmed'].includes(joinedEvents[ev.id]))
  const activeHostedEvents = hostedEvents.filter(ev => !ev.expiresAt || ev.expiresAt > now)

  const FORMAT_CHIP: Record<string, { emoji: string; label: string; color: string }> = {
    '1+1':   { emoji: '👥', label: 'Duo',   color: '#f472b6' },
    'squad': { emoji: '🫂', label: 'Squad', color: '#818CF8' },
    'party': { emoji: '🎉', label: 'Party', color: '#fb923c' },
  }
  const TRANSPORT_CHIP: Record<string, { emoji: string; label: string }> = {
    car:  { emoji: '🚗', label: 'Driving' },
    lift: { emoji: '🙋', label: 'Need a ride' },
    meet: { emoji: '📍', label: 'Meeting there' },
  }

  const isToday = (t: string) => t.startsWith('Today')
  const isTomorrow = (t: string) => t.startsWith('Tomorrow')

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 52, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#818CF8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Parea</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.8 }}>
              {subTab === 'going' ? 'My Plans' : 'Chats'}
            </Text>
          </View>
          {hasNew && subTab === 'messages' && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, backgroundColor: '#6366F1' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>✨ New match!</Text>
            </View>
          )}
        </View>

        {/* Pill switcher */}
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 99, padding: 4, marginBottom: 16 }}>
          {([
            { id: 'going',    label: `🎪 Plans${myEvents.length + activeHostedEvents.length > 0 ? ` (${myEvents.length + activeHostedEvents.length})` : ''}` },
            { id: 'messages', label: `💬 Chats${chatList.length > 0 ? ` (${chatList.length})` : ''}` },
          ] as const).map(t => (
            <TouchableOpacity key={t.id} activeOpacity={0.8}
              onPress={() => { setSubTab(t.id); Haptics.selectionAsync() }}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 99, alignItems: 'center',
                backgroundColor: subTab === t.id ? '#6366F1' : 'transparent' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: subTab === t.id ? '#fff' : '#64748B' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Going tab */}
      {subTab === 'going' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 14 }}>
          {/* Hosted events section */}
          {activeHostedEvents.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366F1', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 4 }}>Hosting 👑</Text>
              {activeHostedEvents.map((ev: any) => (
                <View key={ev.id} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 2, borderColor: 'rgba(99,102,241,0.25)', shadowColor: '#6366F1', shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 }}>
                  <LinearGradient colors={ev.gradient as any} style={{ height: 6 }} />
                  <View style={{ padding: 16, gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E1B4B', flex: 1 }} numberOfLines={1}>{ev.title}</Text>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(99,102,241,0.1)' }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366F1' }}>Host 👑</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 }}>
                        <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>📅 {ev.time}</Text>
                      </View>
                      {ev.location ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 }}>
                          <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>📍 {ev.location}</Text>
                        </View>
                      ) : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 }}>
                        <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>👥 {ev.participantsCount}/{ev.maxParticipants}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              {myEvents.length > 0 && (
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 4, marginTop: 4 }}>Attending</Text>
              )}
            </View>
          )}
          {myEvents.length === 0 && activeHostedEvents.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 44, marginBottom: 14 }}>🎪</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 8 }}>No plans yet</Text>
              <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
                Go join something 👀{'\n'}Your events will show up here
              </Text>
            </View>
          ) : (
            myEvents.map(ev => {
              const fmt    = FORMAT_CHIP[userEventFormat[ev.id]]
              const trsp   = TRANSPORT_CHIP[userEventTransport[ev.id]]
              const isLive = isToday(ev.time)

              // Mirror Vibe Check math
              const format        = userEventFormat[ev.id] || 'squad'
              const cap           = VIBE_FORMAT_MAX[format] || 5
              const threshold     = VIBE_FORMAT_THRESHOLD[format] || cap
              const partnersFound = Math.min(cap - 1, (ev.id % Math.max(1, threshold - 1)) + 1)
              const found         = 1 + partnersFound
              const isActive      = found >= threshold
              const crewProfiles  = QUEUE_PROFILES.slice(0, partnersFound)

              // Smart status badge
              const isConfirmed = joinedEvents[ev.id] === 'confirmed'
              const statusLabel = isConfirmed ? 'Confirmed ✅'
                : isActive ? 'Group Ready!'
                : partnersFound > 0 ? 'Building crew...' : 'Matching...'
              const statusColor = isConfirmed ? '#16a34a' : isActive ? '#16a34a' : partnersFound > 0 ? '#6366F1' : '#d97706'
              const statusBg    = isConfirmed ? 'rgba(34,197,94,0.12)' : isActive ? 'rgba(34,197,94,0.12)' : partnersFound > 0 ? 'rgba(99,102,241,0.1)' : 'rgba(251,191,36,0.15)'

              return (
                <View key={ev.id} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 0, borderWidth: 1, borderColor: isActive ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.08)' }}>
                  <LinearGradient colors={ev.gradient as any} style={{ height: 6 }} />

                  <View style={{ padding: 16 }}>
                    {/* Title row */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.3, marginBottom: 4 }} numberOfLines={2}>{ev.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          {isLive && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' }} />
                              <Text style={{ fontSize: 11, fontWeight: '800', color: '#ef4444' }}>TODAY</Text>
                            </View>
                          )}
                          <Text style={{ fontSize: 12, color: '#64748B' }}>⏰ {ev.time}  ·  📍 {ev.distance}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: statusBg }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>{statusLabel}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            Alert.alert(ev.title, 'What do you want to do?', [
                              { text: '✏️  Update my plans', onPress: () => onUpdatePlans?.(ev) },
                              { text: '😔  Can\'t make it', style: 'destructive', onPress: () => {
                                Alert.alert('Leave event?', `Your spot will be freed and${ev.type === 'community' ? ' the group will be notified' : ' your details will be removed'}.`, [
                                  { text: 'Yes, leave', style: 'destructive', onPress: () => onLeaveEvent?.(ev) },
                                  { text: 'Cancel', style: 'cancel' },
                                ])
                              }},
                              { text: 'Cancel', style: 'cancel' },
                            ])
                          }}
                          style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(100,116,139,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="more-horizontal" size={16} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Format + transport chips */}
                    {(fmt || trsp) && (
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                        {fmt && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${fmt.color}18`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
                            <Text style={{ fontSize: 13 }}>{fmt.emoji}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: fmt.color }}>{fmt.label}</Text>
                          </View>
                        )}
                        {trsp && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(100,116,139,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
                            <Text style={{ fontSize: 13 }}>{trsp.emoji}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>{trsp.label}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={{ height: 1, backgroundColor: 'rgba(99,102,241,0.08)', marginBottom: 14 }} />

                    {/* Crew avatars + counter + button */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ flexDirection: 'row' }}>
                          {/* Me */}
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#6366F1', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <Text style={{ fontSize: 12 }}>😊</Text>
                          </View>
                          {/* Found partners */}
                          {crewProfiles.map((p, i) => (
                            <View key={i} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: p.color, borderWidth: 2, borderColor: '#fff', marginLeft: -8, alignItems: 'center', justifyContent: 'center', zIndex: 9 - i }}>
                              <Text style={{ fontSize: 11 }}>{p.emoji}</Text>
                            </View>
                          ))}
                        </View>
                        <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                          {found}/{cap} joined
                        </Text>
                      </View>

                      <TouchableOpacity activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          if (isConfirmed) {
                            openCrewSheet(ev, crewProfiles, found, cap)
                          } else {
                            onVibeCheck?.(ev)
                          }
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{"Who's going? →"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>
      )}

      {/* Chats tab */}
      {subTab === 'messages' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
          {chatList.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#334155' }}>No chats yet</Text>
              <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Join an event to find your crew!</Text>
            </View>
          )}
          {chatList.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={[s.chatCard, chat.isNew && { borderColor: 'rgba(99,102,241,0.4)', borderWidth: 2, shadowColor: '#6366F1', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }]}
              onPress={() => onOpenChat(chat)}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                const msg = chat.type === 'duo'
                  ? `${chat.name} will see that your plans changed 📅`
                  : `The group will see you've left. Your spot will be freed.`
                Alert.alert(
                  chat.type === 'duo' ? `Leave chat with ${chat.name}?` : `Leave "${chat.event}"?`,
                  msg,
                  [
                    { text: 'Leave', style: 'destructive', onPress: () => onLeaveChat?.(chat.id, true) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                )
              }}
              activeOpacity={0.8}>
              {chat.expiresIn <= 6 && <View style={{ height: 3, backgroundColor: '#EF4444', borderRadius: 99 }} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
                {chat.type === 'duo' ? (
                  <View style={[s.chatAvatar, { backgroundColor: chat.color, alignItems: 'center', justifyContent: 'center' }]}>
                    {chat.photo ? <Image source={{ uri: chat.photo }} style={{ width: '100%', height: '100%', borderRadius: 28 }} /> : <Text style={{ fontSize: 22 }}>👤</Text>}
                  </View>
                ) : (() => {
                  const shown = (chat.avatars || []).slice(0, 3)
                  const extra = (chat.members || 1) - 1 - shown.length
                  const cols = (chat.colors || ['#818CF8', '#6366F1', '#4F46E5'])
                  if (shown.length === 0) {
                    const gc0 = (cols[0] && typeof cols[0] === 'string') ? cols[0] : '#818CF8'
                    const gc1 = (cols[1] && typeof cols[1] === 'string') ? cols[1] : '#6366F1'
                    return (
                      <LinearGradient
                        colors={[gc0, gc1]}
                        style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>{chat.eventEmoji || '🎉'}</Text>
                      </LinearGradient>
                    )
                  }
                  return (
                    <View style={{ width: 64, height: 42, position: 'relative' }}>
                      {shown.map((av: string, ai: number) => (
                        <View key={ai} style={{ position: 'absolute', left: ai * 18, top: ai === 1 ? 2 : 0, width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#fff', overflow: 'hidden', backgroundColor: cols[ai] || '#818CF8', zIndex: 3 - ai }}>
                          <Image source={{ uri: av }} style={{ width: '100%', height: '100%' }} />
                        </View>
                      ))}
                      {extra > 0 && (
                        <View style={{ position: 'absolute', right: -2, bottom: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff' }}>
                          <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff' }}>+{extra}</Text>
                        </View>
                      )}
                    </View>
                  )
                })()}
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
      )}

      {/* Crew Sheet — who's going (confirmed events) */}
      {crewSheet && (
        <Modal transparent animationType="none" onRequestClose={closeCrewSheet}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={closeCrewSheet} />
            <Animated.View style={{
              transform: [{ translateY: crewSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
              backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
              paddingBottom: 32, maxHeight: '85%',
            }}>
              {/* Handle */}
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
              </View>

              {/* Header */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(99,102,241,0.08)' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.3 }}>{crewSheet.ev.title}</Text>
                <Text style={{ fontSize: 13, color: '#6366F1', fontWeight: '700', marginTop: 4 }}>
                  🎉 {crewSheet.found}/{crewSheet.cap} confirmed · Your crew
                </Text>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                {/* Me */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, backgroundColor: 'rgba(99,102,241,0.06)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)' }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>😊</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>You</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, backgroundColor: '#6366F1' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>ME</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>That's you 👋</Text>
                  </View>
                </View>

                {/* Each partner */}
                {crewSheet.profiles.map((p: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: 18, backgroundColor: `${p.color}08`, borderWidth: 1, borderColor: `${p.color}20` }}>
                    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>{p.name}</Text>
                        <Text style={{ fontSize: 13, color: '#64748B' }}>{p.age}</Text>
                        <Text style={{ fontSize: 14 }}>{p.flag}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 8 }}>{p.bio}</Text>
                      {/* Transport + goal */}
                      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: 'rgba(100,116,139,0.1)' }}>
                          <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600' }}>
                            {p.transport === 'car' ? '🚗 Driving' : p.transport === 'lift' ? '🙋 Needs lift' : '🚶 Meet there'}
                          </Text>
                        </View>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: 'rgba(100,116,139,0.1)' }}>
                          <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600' }}>
                            {p.goal === 'chill' ? '😌 Chill' : p.goal === 'networking' ? '🤝 Networking' : '⚡ Activity'}
                          </Text>
                        </View>
                      </View>
                      {/* Interests */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {p.interests.slice(0, 3).map((tag: string, ti: number) => (
                          <View key={ti} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: `${p.color}15`, borderWidth: 1, borderColor: `${p.color}30` }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: p.color }}>{tag}</Text>
                          </View>
                        ))}
                        {/* Languages */}
                        {p.langs.map((l: string, li: number) => (
                          <Text key={`l${li}`} style={{ fontSize: 14 }}>{l}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  )
}

// ─── VIBE CHECK TAB ───────────────────────────────────────────────────────────

const QUEUE_PROFILES = [
  { id: 1,  name: 'Alex',    age: 29, flag: '🇬🇧', color: '#818CF8', colors: ['#818CF8','#6366F1'], emoji: '🎾',
    photo: 'https://i.pravatar.cc/400?img=11',
    bio: 'Tennis addict & coffee snob. Love meeting new people over a good game.',
    interests: ['Tennis','Coffee','Tech','Travel'], langs: ['🇬🇧','🇷🇺'], transport: 'car',  goal: 'networking' },
  { id: 2,  name: 'Maya',    age: 26, flag: '🇷🇺', color: '#4CAF50', colors: ['#43E97B','#38f9d7'], emoji: '📚',
    bio: 'Book lover, yoga fan. Looking for chill hangouts with good vibes.',
    interests: ['Yoga','Books','Art','Wine'],       langs: ['🇷🇺','🇬🇧','🇩🇪'], transport: 'meet', goal: 'chill' },
  { id: 3,  name: 'Luca',    age: 32, flag: '🇮🇹', color: '#FF9800', colors: ['#f97316','#fbbf24'], emoji: '🍕',
    bio: 'Italian who takes food seriously. Can talk for hours about pasta.',
    interests: ['Food','Football','Music','Wine'],  langs: ['🇮🇹','🇬🇧'], transport: 'car',  goal: 'chill' },
  { id: 4,  name: 'Sara',    age: 27, flag: '🇩🇪', color: '#2196F3', colors: ['#667eea','#764ba2'], emoji: '💻',
    bio: 'Product designer at a startup. Into hiking and craft beer.',
    interests: ['Design','Hiking','Beer','Tech'],   langs: ['🇩🇪','🇬🇧','🇫🇷'], transport: 'meet', goal: 'networking' },
  { id: 5,  name: 'Noa',     age: 24, flag: '🇮🇱', color: '#E91E63', colors: ['#f093fb','#f5576c'], emoji: '🎵',
    bio: 'Music producer by night, beach person by day. Always down for adventures.',
    interests: ['Music','Beach','Photography'],     langs: ['🇮🇱','🇬🇧'], transport: 'lift', goal: 'activity' },
  { id: 6,  name: 'Chris',   age: 31, flag: '🇨🇾', color: '#22c55e', colors: ['#134e5e','#71b280'], emoji: '🏄',
    bio: 'Local Cypriot. I know every hidden beach spot on the island.',
    interests: ['Surfing','Diving','Outdoors'],     langs: ['🇨🇾','🇬🇧','🇬🇷'], transport: 'car',  goal: 'activity' },
]

const VIBE_FORMAT_MAX: Record<string, number>       = { '1+1': 2, squad: 5, party: 20 }
const VIBE_FORMAT_THRESHOLD: Record<string, number> = { '1+1': 2, squad: 5, party: 12 } // party goes active at 12, cap stays 20
const VIBE_FORMAT_LABEL: Record<string, string>     = { '1+1': 'Duo · me +1', squad: 'Squad · me +4', party: 'Party · me +19' }
const GOAL_LABEL: Record<string, string>            = { chill: '😌 Chill', networking: '🤝 Networking', activity: '⚡ Activity' }

function ProfilePreviewSheet({ profile, onClose }: { profile: any; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const slideAnim = useRef(new Animated.Value(300)).current

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start()
  }, [])

  const close = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start(onClose)
  }

  // 3 gradient combos per person as photo placeholders
  const c0 = (profile.colors?.[0]) || profile.color || '#6366F1'
  const c1 = (profile.colors?.[1]) || profile.color || '#818CF8'
  const photoPalettes = [
    [c0, c1],
    [c1, '#0A0812'],
    ['#0A0812', c0],
  ]

  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(5,3,15,0.72)' }} activeOpacity={1} onPress={close} />
      <Animated.View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#100D20', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        overflow: 'hidden', transform: [{ translateY: slideAnim }],
      }}>
        {/* Photo carousel */}
        <View style={{ height: 280, position: 'relative' }}>
          <LinearGradient colors={photoPalettes[photoIdx] as any} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {profile.photo && photoIdx === 0
              ? <Image source={{ uri: profile.photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <Text style={{ fontSize: 72 }}>{profile.emoji}</Text>
            }
          </LinearGradient>
          {/* Gradient overlay bottom */}
          <LinearGradient colors={['transparent', '#100D20']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }} />
          {/* Dot indicators */}
          <View style={{ position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {photoPalettes.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setPhotoIdx(i)}>
                <View style={{ width: i === photoIdx ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.3)' }} />
              </TouchableOpacity>
            ))}
          </View>
          {/* Swipe areas */}
          <TouchableOpacity style={{ position: 'absolute', left: 0, top: 0, width: '45%', height: '100%', justifyContent: 'center', paddingLeft: 14, opacity: photoIdx > 0 ? 1 : 0 }}
            onPress={() => setPhotoIdx(i => Math.max(0, i - 1))}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="chevron-left" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ position: 'absolute', right: 0, top: 0, width: '45%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 14, opacity: photoIdx < photoPalettes.length - 1 ? 1 : 0 }}
            onPress={() => setPhotoIdx(i => Math.min(photoPalettes.length - 1, i + 1))}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="chevron-right" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          {/* Close */}
          <TouchableOpacity onPress={close} style={{
            position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
          }}>
            <Feather name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 22, paddingBottom: 40 }}>
          {/* Name + age */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 }}>{profile.name}</Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{profile.age}</Text>
            <Text style={{ fontSize: 20 }}>{profile.flag}</Text>
          </View>

          {/* Bio */}
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 21, marginBottom: 18 }}>{profile.bio}</Text>

          {/* Transport + goal */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                {profile.transport === 'car' ? '🚗 Driving' : profile.transport === 'lift' ? '🙋 Needs lift' : '📍 Meet there'}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>{GOAL_LABEL[profile.goal] || '😌 Chill'}</Text>
            </View>
          </View>

          {/* Languages */}
          {(profile.langs || []).length > 0 && (
            <>
              <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8 }}>LANGUAGES</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                {(profile.langs || []).map((l: string, i: number) => (
                  <View key={i} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)' }}>
                    <Text style={{ fontSize: 14 }}>{l}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Interests */}
          {(profile.interests || []).length > 0 && (
            <>
              <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8 }}>INTERESTS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(profile.interests || []).map((tag: string, i: number) => (
                  <View key={i} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: `${c0}22`, borderWidth: 1, borderColor: `${c0}44` }}>
                    <Text style={{ fontSize: 12, color: c0, fontWeight: '700' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  )
}

function SeekersListWithProfile({ vibeResults, onPass, onLike }: { vibeResults: Record<number, string>; onPass: (id: number) => void; onLike: (sk: any) => void }) {
  const [preview, setPreview] = useState<any>(null)
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {MOCK_SEEKERS.map(sk => {
          const result = vibeResults[sk.id]
          return (
            <View key={sk.id} style={[s.seekerCard, result === 'vibe' && { borderColor: '#818CF8', borderWidth: 2 }, result === 'pass' && { opacity: 0.35 }]}>
              <TouchableOpacity onPress={() => { setPreview({ ...sk, colors: [sk.color, '#1E1B4B'], flag: FLAG_MAP[sk.langs[0]] || '🌍', langs: sk.langs.map((l: string) => FLAG_MAP[l] || '🌍'), interests: [], goal: sk.format === '1+1' ? 'networking' : 'chill', emoji: FORMAT_BADGE[sk.format]?.label || '👤' }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} activeOpacity={0.8}>
                <Image source={{ uri: sk.photo }} style={s.seekerPhoto} />
                {FORMAT_BADGE[sk.format] && (
                  <View style={[s.formatBadge, { backgroundColor: FORMAT_BADGE[sk.format].color }]}>
                    <Text style={{ fontSize: 8, fontWeight: '800', color: '#fff' }}>{FORMAT_BADGE[sk.format].label}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1B4B' }}>{sk.name}, {sk.age}</Text>
                  {sk.langs.map((l: string) => <Text key={l} style={{ fontSize: 14 }}>{FLAG_MAP[l] || '🌍'}</Text>)}
                </View>
                <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 17 }} numberOfLines={2}>{sk.bio}</Text>
                <Text style={{ fontSize: 11, color: '#818CF8', marginTop: 4, fontWeight: '600' }}>{TRANSPORT_LABEL[sk.transport]}</Text>
              </View>
              {!result ? (
                <View style={{ gap: 8 }}>
                  <TouchableOpacity style={s.passBtn} onPress={() => onPass(sk.id)}>
                    <Ionicons name="close" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.vibeBtn} onPress={() => onLike(sk)}>
                    <Text style={{ fontSize: 18 }}>⭐</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: result === 'vibe' ? 'rgba(129,140,248,0.15)' : 'rgba(0,0,0,0.05)' }}>
                  <Text style={{ fontSize: 18 }}>{result === 'vibe' ? '⭐' : '✕'}</Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
      {preview && <InlineProfileSheet profile={preview} onClose={() => setPreview(null)} />}
    </View>
  )
}

function InlineProfileSheet({ profile, onClose }: { profile: any; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const slideAnim = useRef(new Animated.Value(400)).current
  const leftArrow = useRef(new Animated.Value(0)).current
  const rightArrow = useRef(new Animated.Value(0)).current

  const flash = (anim: Animated.Value) => {
    anim.setValue(1)
    Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }).start()
  }

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start()
  }, [])

  const close = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start(onClose)
  }

  const photoPalettes = [
    profile.colors,
    [profile.colors[1], '#0A0812'],
    ['#0A0812', profile.colors[0]],
  ]

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(5,3,15,0.72)' }} activeOpacity={1} onPress={close} />
      <Animated.View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#100D20', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        transform: [{ translateY: slideAnim }],
        maxHeight: '90%',
      }}>
        {/* Photo carousel */}
        <View style={{ height: 280, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }}>
          <LinearGradient colors={photoPalettes[photoIdx] as any} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {profile.photo && photoIdx === 0
              ? <Image source={{ uri: profile.photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <Text style={{ fontSize: 72 }}>{profile.emoji}</Text>
            }
          </LinearGradient>
          <LinearGradient colors={['transparent', '#100D20']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }} pointerEvents="none" />
          <TouchableOpacity onPress={() => setPhotoIdx(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: 14, top: 120, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', opacity: photoIdx > 0 ? 1 : 0 }}>
            <Feather name="chevron-left" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPhotoIdx(i => Math.min(photoPalettes.length - 1, i + 1))} style={{ position: 'absolute', right: 14, top: 120, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', opacity: photoIdx < photoPalettes.length - 1 ? 1 : 0 }}>
            <Feather name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={close} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Контент — свой ScrollView */}
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 }}>{profile.name}</Text>
              <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{profile.age}</Text>
              <Text style={{ fontSize: 20 }}>{profile.flag}</Text>
            </View>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 21, marginBottom: 18 }}>{profile.bio}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                  {profile.transport === 'car' ? '🚗 Driving' : profile.transport === 'lift' ? '🙋 Needs lift' : '📍 Meet there'}
                </Text>
              </View>
              {profile.goal && (
                <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>{GOAL_LABEL[profile.goal] || '😌 Chill'}</Text>
                </View>
              )}
            </View>
            {profile.langs?.length > 0 && (
              <>
                <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8 }}>LANGUAGES</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                  {profile.langs.map((l: string, i: number) => (
                    <View key={i} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)' }}>
                      <Text style={{ fontSize: 14 }}>{l}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {profile.interests?.length > 0 && (
              <>
                <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8 }}>INTERESTS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {profile.interests.map((tag: string, i: number) => (
                    <View key={i} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: `${profile.colors[0]}22`, borderWidth: 1, borderColor: `${profile.colors[0]}44` }}>
                      <Text style={{ fontSize: 12, color: profile.colors[0], fontWeight: '700' }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  )
}

function VibeCheckTab({ joinedEvents, allEvents, userEventFormat, userEventTransport, onGoHome, onConfirm, onLeave, hostedEvents = [], pendingJoinRequests = {}, onApproveJoiner, onRejectJoiner }: any) {
  const myEvents = (allEvents || []).filter((e: any) => joinedEvents?.[e.id] && joinedEvents[e.id] !== 'confirmed')
  const activeHosted = (hostedEvents || []).filter((e: any) => !e.expiresAt || e.expiresAt > Date.now())
  const hasHostActivity = activeHosted.some((e: any) => (pendingJoinRequests[e.id] || []).length > 0)
  const [previewProfile, setPreviewProfile] = useState<any>(null)

  // aurora blob animations
  const blob1 = useRef(new Animated.Value(0)).current
  const blob2 = useRef(new Animated.Value(0)).current
  const blob3 = useRef(new Animated.Value(0)).current
  const radar1 = useRef(new Animated.Value(0)).current
  const radar2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = (val: Animated.Value, dur: number, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue: 1, duration: dur, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0, duration: dur, useNativeDriver: true }),
      ])).start()
    loop(blob1, 3200, 0); loop(blob2, 2800, 600); loop(blob3, 3600, 1200)
    Animated.loop(Animated.sequence([
      Animated.timing(radar1, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(radar1, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start()
    Animated.loop(Animated.sequence([
      Animated.delay(900),
      Animated.timing(radar2, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(radar2, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start()
  }, [])

  const AuroraBg = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Animated.View style={{
        position: 'absolute', top: -60, left: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: '#FF6B6B',
        opacity: blob1.interpolate({ inputRange: [0,1], outputRange: [0.18, 0.32] }),
        transform: [{ scale: blob1.interpolate({ inputRange: [0,1], outputRange: [1, 1.2] }) }],
      }} />
      <Animated.View style={{
        position: 'absolute', top: 120, right: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: '#43E97B',
        opacity: blob2.interpolate({ inputRange: [0,1], outputRange: [0.14, 0.26] }),
        transform: [{ scale: blob2.interpolate({ inputRange: [0,1], outputRange: [1, 1.15] }) }],
      }} />
      <Animated.View style={{
        position: 'absolute', bottom: 80, left: 40, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6366F1',
        opacity: blob3.interpolate({ inputRange: [0,1], outputRange: [0.16, 0.28] }),
        transform: [{ scale: blob3.interpolate({ inputRange: [0,1], outputRange: [1, 1.1] }) }],
      }} />
    </View>
  )

  if (myEvents.length === 0 && !hasHostActivity) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0812' }}>
        <AuroraBg />
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <Animated.View style={{
                position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.6)',
                opacity: radar1.interpolate({ inputRange: [0,0.5,1], outputRange: [0.8,0.3,0] }),
                transform: [{ scale: radar1.interpolate({ inputRange: [0,1], outputRange: [0.4,1] }) }],
              }} />
              <Animated.View style={{
                position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1.5, borderColor: 'rgba(67,233,123,0.5)',
                opacity: radar2.interpolate({ inputRange: [0,0.5,1], outputRange: [0.8,0.3,0] }),
                transform: [{ scale: radar2.interpolate({ inputRange: [0,1], outputRange: [0.4,1] }) }],
              }} />
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 32 }}>✨</Text>
              </View>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginBottom: 10 }}>Your crew awaits</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
              Join an event and we'll find{'\n'}the perfect people to go with
            </Text>
            <TouchableOpacity onPress={onGoHome} activeOpacity={0.85} style={{ paddingHorizontal: 28, paddingVertical: 14, borderRadius: 99, backgroundColor: '#6366F1', shadowColor: '#6366F1', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Browse Events →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0812' }}>
      <AuroraBg />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.8 }}>Vibe Check</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
            {hasHostActivity ? '👑 You have join requests' : `${myEvents.length} event${myEvents.length > 1 ? 's' : ''} · tap avatars to vet your crew`}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
          {/* Host approval section */}
          {activeHosted.map((ev: any) => {
            const requests: any[] = pendingJoinRequests[ev.id] || []
            if (requests.length === 0) return null
            return (
              <View key={`host-${ev.id}`} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' }}>
                <LinearGradient colors={ev.gradient as any} style={{ height: 5 }} />
                <View style={{ padding: 16, gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff', flex: 1 }} numberOfLines={1}>{ev.title}</Text>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFD700' }}>HOST 👑</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                    {requests.length} request{requests.length > 1 ? 's' : ''} to join
                  </Text>
                  {requests.map((req: any) => (
                    <View key={req.requestId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12 }}>
                      <TouchableOpacity onPress={() => {
                        setPreviewProfile({
                          ...req,
                          colors: [req.color, '#1E1B4B'],
                          flag: FLAG_MAP[req.langs?.[0]] || '🌍',
                          langs: (req.langs || []).map((l: string) => FLAG_MAP[l] || l),
                          interests: [],
                          goal: 'chill',
                          emoji: '👤',
                        })
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      }} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                        <Image source={{ uri: req.photo }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#333' }} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{req.name}, {req.age}</Text>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>tap to view →</Text>
                          </View>
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }} numberOfLines={1}>{req.bio}</Text>
                          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                            {req.langs.map((l: string) => (
                              <Text key={l} style={{ fontSize: 13 }}>{FLAG_MAP[l] || '🌐'}</Text>
                            ))}
                          </View>
                        </View>
                      </TouchableOpacity>
                      <View style={{ gap: 8 }}>
                        <TouchableOpacity onPress={() => onApproveJoiner?.(ev.id, req)} activeOpacity={0.8}
                          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(67,233,123,0.2)', borderWidth: 1.5, borderColor: '#43E97B', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 18 }}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onRejectJoiner?.(ev.id, req)} activeOpacity={0.8}
                          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
          {myEvents.map((ev: any) => {
            const format     = userEventFormat?.[ev.id]    || 'squad'
            const transport  = userEventTransport?.[ev.id] || 'meet'
            const cap        = VIBE_FORMAT_MAX[format] || 5
            const threshold  = VIBE_FORMAT_THRESHOLD[format] || cap
            const isParty    = format === 'party'
            // found = total slots filled INCLUDING me (slot #1)
            // partners = found - 1 (the other people in the queue)
            const partnersFound = Math.min(cap - 1, (ev.id % Math.max(1, threshold - 1)) + 1)
            const found      = 1 + partnersFound   // me + partners
            const isActive   = found >= threshold
            const partners   = QUEUE_PROFILES.slice(0, partnersFound) // only partners, not me

            // Status label
            const statusLabel = isActive
              ? (isParty ? 'GROUP ACTIVE 🔥' : 'READY ✓')
              : 'SCANNING…'
            const statusColor = isActive ? '#43E97B' : '#818CF8'
            const statusBg    = isActive ? 'rgba(67,233,123,0.15)' : 'rgba(99,102,241,0.13)'
            const statusBorder= isActive ? 'rgba(67,233,123,0.35)' : 'rgba(99,102,241,0.28)'

            return (
              <View key={ev.id} style={{
                borderRadius: 28, overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1, borderColor: isActive ? 'rgba(67,233,123,0.35)' : 'rgba(255,255,255,0.09)',
              }}>
                <LinearGradient colors={ev.gradient as any} style={{ height: 4 }} />

                <View style={{ padding: 20 }}>
                  {/* Title + status */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3, lineHeight: 21 }} numberOfLines={2}>{ev.title}</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{ev.time} · {ev.distance}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: statusBg, borderWidth: 1, borderColor: statusBorder }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: statusColor }}>{statusLabel}</Text>
                    </View>
                  </View>

                  {/* My choices pills */}
                  <View style={{ flexDirection: 'row', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[VIBE_FORMAT_LABEL[format], TRANSPORT_LABEL[transport]].map((label, i) => (
                      <View key={i} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.07)' }}>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>{label || '—'}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Progress */}
                  <View style={{ marginBottom: 18 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 0.5 }}>
                        {isParty && isActive ? 'GROUP ACTIVE · STILL OPEN' : 'CREW FOUND'}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: statusColor }}>
                        {isParty ? `${found} / ${cap} joined` : `${found} / ${cap}`}
                      </Text>
                    </View>
                    {/* Two-segment bar for party: threshold zone + overflow zone */}
                    <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
                      <LinearGradient
                        colors={isActive ? ['#43E97B','#22c55e'] : ['#6366F1','#818CF8']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ height: 3, borderRadius: 99, width: `${(found / cap) * 100}%` as any }}
                      />
                      {/* Threshold marker for party */}
                      {isParty && (
                        <View style={{ position: 'absolute', left: `${(threshold / cap) * 100}%` as any, top: -2, width: 2, height: 7, backgroundColor: '#43E97B', borderRadius: 1 }} />
                      )}
                    </View>
                    {isParty && (
                      <Text style={{ fontSize: 10, color: 'rgba(67,233,123,0.6)', marginTop: 5, fontWeight: '600' }}>
                        {isActive ? `${found - threshold} more joined after launch · ${cap - found} spots left` : `Group launches at ${threshold} people`}
                      </Text>
                    )}
                  </View>

                  {/* Clickable avatars */}
                  <View style={{ marginBottom: isActive ? 20 : 0 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, marginBottom: 12 }}>
                      TAP TO VET YOUR CREW
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      {/* Me — always first */}
                      <View>
                        <LinearGradient colors={['#6366F1','#818CF8']} style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }}>
                          <Text style={{ fontSize: 22 }}>😊</Text>
                        </LinearGradient>
                        <Text style={{ fontSize: 10, color: '#818CF8', textAlign: 'center', marginTop: 4, fontWeight: '700' }}>You</Text>
                      </View>
                      {/* Partners */}
                      {partners.map((p, i) => (
                        <TouchableOpacity key={i} onPress={() => { setPreviewProfile(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} activeOpacity={0.75}>
                          <LinearGradient colors={p.colors as any} style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }}>
                            <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                          </LinearGradient>
                          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 4, fontWeight: '600' }}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                      {/* Empty slots = cap - found (me already counted in found) */}
                      {found < cap && (
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.2)' }}>+{cap - found}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* CTA */}
                  {isActive && (
                    <View style={{ gap: 10 }}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => onConfirm?.(ev, partners, format)}
                        style={{ borderRadius: 99, paddingVertical: 14, alignItems: 'center', backgroundColor: '#43E97B', shadowColor: '#43E97B', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: '#052e16' }}>
                          {isParty ? 'Join the chat 🚀' : "Let's go! 🚀"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onLeave?.(ev)}
                        style={{ borderRadius: 99, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.35)' }}>Plans changed</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </ScrollView>
      </SafeAreaView>

      {previewProfile && <ProfilePreviewSheet profile={previewProfile} onClose={() => setPreviewProfile(null)} />}
    </View>
  )
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────

function ProfileTab({ userData, onLogOut }: { userData: any; onLogOut?: () => void }) {
  const nm = userData?.name || 'Your Profile'
  const ag = userData?.age || ''
  const userPhotos: string[] = (userData?.photos || []).filter(Boolean)
  const [previewIdx, setPreviewIdx] = useState<number | null>(null)

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Full-screen photo preview with info overlay */}
      <Modal visible={previewIdx !== null} transparent animationType="fade" onRequestClose={() => setPreviewIdx(null)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {previewIdx !== null && userPhotos[previewIdx] && (
            <Image source={{ uri: userPhotos[previewIdx] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          )}
          {/* Gradient + info at bottom */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 60 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>{nm}{ag ? `, ${ag}` : ''}</Text>
            {userData?.bio ? <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6, lineHeight: 20 }}>{userData.bio}</Text> : null}
            {(userData?.interests || []).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {(userData.interests || []).map((item: string) => (
                  <View key={item} style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {(userData?.langs || []).length > 0 && (
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                {(userData.langs || []).map((code: string) => {
                  const l = LANGUAGES_LIST.find(x => x.code === code)
                  return l ? <Text key={code} style={{ fontSize: 18 }}>{l.flag}</Text> : null
                })}
              </View>
            )}
          </LinearGradient>
          {/* Left arrow */}
          {previewIdx !== null && previewIdx > 0 && (
            <TouchableOpacity onPress={() => setPreviewIdx(i => (i !== null ? i - 1 : i))}
              style={{ position: 'absolute', left: 16, top: '45%', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="chevron-left" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          {/* Right arrow */}
          {previewIdx !== null && previewIdx < userPhotos.length - 1 && (
            <TouchableOpacity onPress={() => setPreviewIdx(i => (i !== null ? i + 1 : i))}
              style={{ position: 'absolute', right: 16, top: '45%', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="chevron-right" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          {/* Dots */}
          {userPhotos.length > 1 && (
            <View style={{ flexDirection: 'row', gap: 6, position: 'absolute', top: 52, alignSelf: 'center', left: 0, right: 0, justifyContent: 'center' }}>
              {userPhotos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPreviewIdx(i)}>
                  <View style={{ width: previewIdx === i ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: previewIdx === i ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Close */}
          <TouchableOpacity onPress={() => setPreviewIdx(null)}
            style={{ position: 'absolute', top: 44, right: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.4 }}>My Profile</Text>
      </View>

      {/* Photo grid */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        {userPhotos.length > 0 ? (
          userPhotos.length === 1 ? (
            <TouchableOpacity onPress={() => setPreviewIdx(0)} style={{ width: '100%', height: 260, borderRadius: 20, overflow: 'hidden' }}>
              <Image source={{ uri: userPhotos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </TouchableOpacity>
          ) : userPhotos.length === 2 ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {userPhotos.map((uri, i) => (
                <TouchableOpacity key={i} onPress={() => setPreviewIdx(i)} style={{ flex: 1, height: 200, borderRadius: 16, overflow: 'hidden' }}>
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setPreviewIdx(0)} style={{ flex: 2, height: 240, borderRadius: 16, overflow: 'hidden' }}>
                <Image source={{ uri: userPhotos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
              <View style={{ flex: 1, gap: 8 }}>
                {userPhotos.slice(1).map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setPreviewIdx(i + 1)} style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        ) : (
          <View style={[s.profileAvatar, { alignSelf: 'center' }]}>
            <Text style={{ fontSize: 44 }}>😊</Text>
          </View>
        )}
      </View>

      {/* Name + bio compact */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3 }}>{nm}{ag ? `, ${ag}` : ''}</Text>
        {userData?.bio ? <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4, lineHeight: 20 }}>{userData.bio}</Text> : null}
      </View>

      {[
        { icon: 'settings', label: 'Settings' },
        { icon: 'shield', label: 'Privacy Policy' },
        { icon: 'file-text', label: 'Terms of Service' },
        { icon: 'log-out', label: 'Log Out', color: '#EF4444' },
      ].map(item => (
        <TouchableOpacity key={item.label} style={s.profileActionRow} onPress={item.label === 'Log Out' ? onLogOut : undefined}>
          <Feather name={item.icon as any} size={18} color={item.color || '#64748B'} />
          <Text style={[{ flex: 1, fontSize: 15, color: '#334155', marginLeft: 14 }, item.color ? { color: item.color } : {}]}>{item.label}</Text>
          <Feather name="chevron-right" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

// ─── FEED SCREEN ──────────────────────────────────────────────────────────────

const CREATE_EVENT_TYPES = [
  { id: 'coffee',      label: 'Coffee',      emoji: '☕' },
  { id: 'bar',         label: 'Bar / Drinks', emoji: '🍹' },
  { id: 'beach',       label: 'Beach',        emoji: '🏖️' },
  { id: 'hiking',      label: 'Hiking',       emoji: '🥾' },
  { id: 'walk',        label: 'Walk',         emoji: '🚶' },
  { id: 'it',          label: 'IT Meetup',    emoji: '💻' },
  { id: 'boardgames',  label: 'Board Games',  emoji: '🎲' },
  { id: 'daytrip',     label: 'Day Trip',     emoji: '🗺️' },
  { id: 'dinner',      label: 'Dinner',       emoji: '🍽️' },
  { id: 'cinema',      label: 'Cinema',       emoji: '🎬' },
  { id: 'boat',        label: 'Boat Trip',    emoji: '⛵' },
  { id: 'picnic',      label: 'Picnic',       emoji: '🧺' },
]

function FeedScreen({ userData = {}, onLogOut }: { userData?: any; onLogOut?: () => void }) {
  const [activeTab, setActiveTab] = useState<'home' | 'vibecheck' | 'messages' | 'profile'>('home')
  const [messagesInitialSubTab, setMessagesInitialSubTab] = useState<'going' | 'messages'>('going')
  const [createOpen, setCreateOpen] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [createSize, setCreateSize] = useState<string | null>(null)
  const [createType, setCreateType] = useState<string | null>(null)
  const [createDay, setCreateDay] = useState('')
  const [createHour, setCreateHour] = useState('')
  const [createLocation, setCreateLocation] = useState('')
  const [createDriving, setCreateDriving] = useState(false)
  const [createLangs, setCreateLangs] = useState<string[]>([])
  const [calViewYear, setCalViewYear] = useState(new Date().getFullYear())
  const [calViewMonth, setCalViewMonth] = useState(new Date().getMonth())
  const [createCategory, setCreateCategory] = useState<string>('Sport')
  const [createVibe, setCreateVibe] = useState<string | null>(null)
  const [createCustom, setCreateCustom] = useState('')
  const [city, setCity] = useState('Limassol')
  const [cityOpen, setCityOpen] = useState(false)
  const [feedFilter, setFeedFilter] = useState('all')
  const [eventDetail, setEventDetail] = useState<any>(null)
  const [matchedWith, setMatchedWith] = useState<any>(null)
  const [vibeResults, setVibeResults] = useState<Record<number, string>>({})
  const [openChat, setOpenChat] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<Record<number, any[]>>({ ...MOCK_MESSAGES })
  const [chatInput, setChatInput] = useState('')
  const [chatList, setChatList] = useState(MOCK_CHATS)
  const [chatPartnerPreview, setChatPartnerPreview] = useState<any>(null)
  const [groupMembersOpen, setGroupMembersOpen] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const [joinedEvents, setJoinedEvents] = useState<Record<number, 'pending' | 'joined' | 'confirmed'>>({})
  const [vibes, setVibes] = useState<number[]>([])
  const evHost = eventDetail?.type === 'community' ? MOCK_SEEKERS[(eventDetail.id - 1) % MOCK_SEEKERS.length] : null
  const evSpotsLeft = eventDetail?.maxParticipants ? eventDetail.maxParticipants - eventDetail.participantsCount : null
  const evIsFull = evSpotsLeft !== null && evSpotsLeft <= 0
  const [userEventFormat, setUserEventFormat] = useState<Record<number, string>>({})
  const [userEventTransport, setUserEventTransport] = useState<Record<number, string>>({})
  const [pendingJoinEv, setPendingJoinEv] = useState<any>(null)
  const [userCreatedEvents, setUserCreatedEvents] = useState<any[]>([])
  const [pendingJoinRequests, setPendingJoinRequests] = useState<Record<number, any[]>>({})
  const [approvedJoiners, setApprovedJoiners] = useState<Record<number, any[]>>({})

  // ── Notifications ─────────────────────────────────────────────────────────
  type Notif = { id: string; type: string; title: string; body: string; emoji: string; color: string; time: number; read: boolean }
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const bellShake = useRef(new Animated.Value(0)).current
  const notifPanelY = useRef(new Animated.Value(-600)).current
  const prevPendingRef = useRef<Record<number, any[]>>({})
  const prevChatCountRef = useRef(0)

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotif = (n: Omit<Notif, 'id' | 'time' | 'read'>) => {
    const newN: Notif = { ...n, id: `${Date.now()}-${Math.random()}`, time: Date.now(), read: false }
    setNotifications(prev => [newN, ...prev].slice(0, 30))
    // Bell shake animation
    bellShake.setValue(0)
    Animated.sequence([
      Animated.timing(bellShake, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(bellShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(bellShake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(bellShake, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(bellShake, { toValue: 3, duration: 40, useNativeDriver: true }),
      Animated.timing(bellShake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }

  const openNotifPanel = () => {
    setNotifOpen(true)
    Animated.spring(notifPanelY, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start()
  }
  const closeNotifPanel = () => {
    Animated.timing(notifPanelY, { toValue: -600, duration: 260, useNativeDriver: true }).start(() => setNotifOpen(false))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  // Watch for new join requests
  useEffect(() => {
    Object.entries(pendingJoinRequests).forEach(([evId, reqs]) => {
      const prev = prevPendingRef.current[Number(evId)] || []
      reqs.filter(r => !prev.find((p: any) => p.requestId === r.requestId)).forEach(req => {
        const ev = userCreatedEvents.find(e => e.id === Number(evId))
        addNotif({ type: 'join_request', emoji: '🙋', color: '#6366F1', title: `${req.name} wants to join`, body: ev?.title || 'your social' })
      })
    })
    prevPendingRef.current = pendingJoinRequests
  }, [pendingJoinRequests])

  // Watch for new chats (approvals / matches)
  useEffect(() => {
    if (chatList.length > prevChatCountRef.current && prevChatCountRef.current > 0) {
      const newest = chatList[0]
      if (newest.type === 'duo') {
        addNotif({ type: 'match', emoji: '✨', color: '#EC4899', title: `You matched with ${newest.name}!`, body: newest.event || 'Check your chats' })
      } else {
        addNotif({ type: 'group_chat', emoji: '🎉', color: '#10B981', title: 'Group chat is live!', body: newest.event || 'Your crew is ready' })
      }
    }
    prevChatCountRef.current = chatList.length
  }, [chatList.length])

  const timeAgo = (ms: number) => {
    const s = Math.floor((Date.now() - ms) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }
  // ── End Notifications ──────────────────────────────────────────────────────

  const [toast, setToast] = useState<{ visible: boolean; text: string }>({ visible: false, text: '' })
  const toastAnim = useRef(new Animated.Value(0)).current

  const showToast = (text: string) => {
    setToast({ visible: true, text })
    toastAnim.setValue(0)
    Animated.sequence([
      Animated.spring(toastAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setToast({ visible: false, text: '' }))
  }

  const handleJoinConfirmed = (ev: any, format: string, transport: string) => {
    const FORMAT_EMOJI: Record<string, string> = { '1+1': '👥', squad: '🫂', party: '🎉' }
    const TRANSPORT_EMOJI: Record<string, string> = { car: '🚗', lift: '🙋', meet: '📍' }
    const parts = [FORMAT_EMOJI[format] || '👥', TRANSPORT_EMOJI[transport] || '📍'].filter(Boolean)
    showToast(`${parts.join(' · ')}`)
  }

  // Match animation refs
  const matchFlash   = useRef(new Animated.Value(0)).current
  const matchLeftX   = useRef(new Animated.Value(-80)).current
  const matchRightX  = useRef(new Animated.Value(80)).current
  const matchScale   = useRef(new Animated.Value(0.7)).current

  // checkMatch: always match when user vibes (demo — every vibe is mutual)
  const checkMatch = (_seeker: any, _eventId?: number) => true

  const handleJoinEvent = (ev: any) => {
    const isFull = ev.participantsCount >= ev.maxParticipants
    if (isFull) return
    setJoinedEvents(prev => {
      if (!prev[ev.id]) return { ...prev, [ev.id]: 'pending' }
      if (prev[ev.id] === 'pending') return { ...prev, [ev.id]: 'joined' }
      // joined → unjoin
      const next = { ...prev }
      delete next[ev.id]
      return next
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const handleLike = (seeker: any) => {
    setVibeResults(prev => ({ ...prev, [seeker.id]: 'vibe' }))
    setVibes(prev => [...prev, seeker.id])
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const evId = eventDetail?.id
    if (checkMatch(seeker, evId)) {
      setTimeout(() => {
        setMatchedWith(seeker)
        // Flash + slide-in animation
        matchFlash.setValue(0); matchLeftX.setValue(-80); matchRightX.setValue(80); matchScale.setValue(0.7)
        Animated.parallel([
          Animated.sequence([
            Animated.timing(matchFlash,  { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(matchFlash,  { toValue: 0.92, duration: 200, useNativeDriver: true }),
          ]),
          Animated.spring(matchLeftX,  { toValue: 0, friction: 7, useNativeDriver: true }),
          Animated.spring(matchRightX, { toValue: 0, friction: 7, useNativeDriver: true }),
          Animated.spring(matchScale,  { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start()
      }, 350)
    }
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
          {activeTab === 'home' && <HomeTab city={city} setCityOpen={setCityOpen} feedFilter={feedFilter} setFeedFilter={setFeedFilter} onEventPress={setEventDetail} joinedEvents={joinedEvents} onJoin={handleJoinEvent} userInterests={userData?.interests || []} setUserEventFormat={setUserEventFormat} setUserEventTransport={setUserEventTransport} onJoinConfirmed={handleJoinConfirmed} pendingJoinEv={pendingJoinEv} onPendingJoinConsumed={() => setPendingJoinEv(null)} extraEvents={userCreatedEvents} />}
          {activeTab === 'vibecheck' && <VibeCheckTab
            joinedEvents={joinedEvents}
            allEvents={MOCK_EVENTS}
            userEventFormat={userEventFormat}
            userEventTransport={userEventTransport}
            onGoHome={() => setActiveTab('home')}
            onConfirm={(ev: any, partners: any[], format: string) => {
              const isGroup = format !== '1+1'
              const newChat = isGroup ? {
                id: Date.now(), type: 'group',
                event: ev.title, eventEmoji: CATEGORY_EMOJI[ev.category] || '🎉',
                members: partners.length + 1,
                avatars: [], colors: partners.map((p: any) => p.color),
                lastMsg: '🎉 Group chat created! Say hi',
                time: 'now', isNew: true, expiresIn: 24,
              } : {
                id: Date.now(), type: 'duo',
                name: partners[0]?.name || 'Your match',
                age: partners[0]?.age || '',
                transport: partners[0]?.transport || 'meet',
                color: partners[0]?.color || '#818CF8',
                photo: '', lastMsg: '👋 You matched! Say hello',
                time: 'now', isNew: true, expiresIn: 24,
                event: ev.title, eventEmoji: CATEGORY_EMOJI[ev.category] || '🎉',
                partnerProfile: partners[0] || null,
              }
              setChatList(prev => [newChat, ...prev])
              setJoinedEvents(prev => ({ ...prev, [ev.id]: 'confirmed' }))
              addNotif({ type: 'confirmed', emoji: '✅', color: '#10B981', title: 'You\'re in!', body: `Your crew for "${ev.title}" is ready` })
              showToast(`Chat created! 🎉`)
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              setMessagesInitialSubTab('messages')
              setActiveTab('messages')
            }}
            onLeave={(ev: any) => {
              setJoinedEvents(prev => { const n = { ...prev }; delete n[ev.id]; return n })
              showToast("We let them know your plans changed 📅")
            }}
            hostedEvents={userCreatedEvents}
            pendingJoinRequests={pendingJoinRequests}
            onApproveJoiner={(eventId: number, joiner: any) => {
              setPendingJoinRequests(prev => ({
                ...prev,
                [eventId]: (prev[eventId] || []).filter((r: any) => r.requestId !== joiner.requestId),
              }))
              const ev = userCreatedEvents.find(e => e.id === eventId)
              const isDuo = (ev?.maxParticipants || 5) <= 2

              if (isDuo) {
                // 1-on-1 event → direct chat
                const newChat = {
                  id: Date.now(), type: 'duo',
                  name: joiner.name, age: joiner.age,
                  transport: joiner.transport, color: joiner.color,
                  photo: joiner.photo, lastMsg: `✅ You approved ${joiner.name}!`,
                  time: 'now', isNew: true, expiresIn: 24,
                  event: ev?.title || 'Your Social', eventEmoji: '🎉',
                  partnerProfile: joiner,
                }
                setChatList(prev => [newChat, ...prev])
              } else {
                // Squad/Party → find or create one group chat for this event
                const newApproved = [...(approvedJoiners[eventId] || []), joiner]
                setApprovedJoiners(prev => ({ ...prev, [eventId]: newApproved }))

                setChatList(prev => {
                  const existingIdx = prev.findIndex(c => c.hostEventId === eventId)
                  if (existingIdx >= 0) {
                    const updated = [...prev]
                    updated[existingIdx] = {
                      ...updated[existingIdx],
                      members: newApproved.length + 1,
                      avatars: newApproved.map((p: any) => p.photo).filter(Boolean),
                      colors: newApproved.map((p: any) => p.color),
                      memberProfiles: newApproved,
                      lastMsg: `✅ ${joiner.name} joined the group`,
                      time: 'now', isNew: true,
                    }
                    return updated
                  } else {
                    return [{
                      id: Date.now(), type: 'group', hostEventId: eventId,
                      event: ev?.title || 'Your Social', eventEmoji: CATEGORY_EMOJI[ev?.category || ''] || '🎉',
                      members: newApproved.length + 1,
                      avatars: newApproved.map((p: any) => p.photo).filter(Boolean),
                      colors: newApproved.map((p: any) => p.color),
                      memberProfiles: newApproved,
                      lastMsg: `✅ ${joiner.name} was approved to join!`,
                      time: 'now', isNew: true, expiresIn: 24,
                    }, ...prev]
                  }
                })
              }
              showToast(`${joiner.name} approved! ✅`)
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }}
            onRejectJoiner={(eventId: number, joiner: any) => {
              setPendingJoinRequests(prev => ({
                ...prev,
                [eventId]: (prev[eventId] || []).filter((r: any) => r.requestId !== joiner.requestId),
              }))
              showToast(`Request declined`)
            }}
          />}
          {activeTab === 'messages' && <MessagesTab
            initialSubTab={messagesInitialSubTab}
            chatList={chatList}
            onOpenChat={setOpenChat}
            hostedEvents={userCreatedEvents}
            onLeaveChat={(id, addSystemMsg) => {
              if (addSystemMsg) {
                setChatMessages(prev => ({
                  ...prev,
                  [id]: [...(prev[id] || []), { from: 'system', text: 'You changed your plans 📅', time: 'now' }],
                }))
              }
              setChatList(prev => prev.filter(c => c.id !== id))
              showToast("We let them know your plans changed 📅")
            }}
            joinedEvents={joinedEvents}
            userEventFormat={userEventFormat}
            userEventTransport={userEventTransport}
            onVibeCheck={() => setActiveTab('vibecheck')}
            onLeaveEvent={ev => {
              setJoinedEvents(prev => { const n = { ...prev }; delete n[ev.id]; return n })
              // Remove any group chats linked to this event
              setChatList(prev => prev.map(c =>
                c.event === ev.title
                  ? { ...c, lastMsg: 'You left this event 📅' }
                  : c
              ))
              showToast("Spot freed. Others can join now 🎟️")
            }}
            onUpdatePlans={ev => {
              setActiveTab('home')
              setTimeout(() => setPendingJoinEv(ev), 150)
            }}
          />}
          {activeTab === 'profile' && <ProfileTab userData={userData} onLogOut={onLogOut} />}
        </View>

        {/* Bottom nav */}
        <View style={s.bottomNav}>
          <TouchableOpacity style={s.navItem} onPress={() => setActiveTab('home')}>
            <Feather name="home" size={22} color={activeTab === 'home' ? '#6366F1' : '#94A3B8'} />
            <Text style={[s.navLabel, activeTab === 'home' && { color: '#6366F1' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => setActiveTab('vibecheck')}>
            <View style={{ position: 'relative' }}>
              <Feather name="zap" size={22} color={activeTab === 'vibecheck' ? '#6366F1' : '#94A3B8'} />
              {(Object.keys(joinedEvents).length > 0 || Object.values(pendingJoinRequests).some(r => r.length > 0)) && (
                <View style={{ position: 'absolute', top: -3, right: -5, width: 8, height: 8, borderRadius: 4, backgroundColor: Object.values(pendingJoinRequests).some(r => r.length > 0) ? '#FFD700' : '#43E97B', borderWidth: 1.5, borderColor: '#F8F7FF' }} />
              )}
            </View>
            <Text style={[s.navLabel, activeTab === 'vibecheck' && { color: '#6366F1' }]}>Vibe</Text>
          </TouchableOpacity>

          {/* Center create button */}
          <TouchableOpacity style={s.navCreateBtn} onPress={() => { setCreateType(null); setCreateOpen(true) }} activeOpacity={0.85}>
            <LinearGradient colors={['#818CF8', '#6366F1']} style={s.navCreateGrad}>
              <Feather name="plus" size={26} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {([
            { id: 'messages', icon: 'message-circle', label: 'Chats' },
            { id: 'profile',  icon: 'user',           label: 'Profile' },
          ] as const).map(tab => (
            <TouchableOpacity key={tab.id} style={s.navItem} onPress={() => { if (tab.id === 'messages') setMessagesInitialSubTab('going'); setActiveTab(tab.id) }}>
              <Feather name={tab.icon} size={22} color={activeTab === tab.id ? '#6366F1' : '#94A3B8'} />
              <Text style={[s.navLabel, activeTab === tab.id && { color: '#6366F1' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create event modal */}
        <Modal visible={createOpen} animationType="slide" onRequestClose={() => {
          setCreateOpen(false); setCreateStep(1); setCreateSize(null); setCreateType(null);
          setCreateDay(''); setCreateHour(''); setCreateLocation(''); setCreateDriving(false);
          setCreateLangs([]); setCreateVibe(null); setCreateCustom('');
          setCalViewYear(new Date().getFullYear()); setCalViewMonth(new Date().getMonth());
        }}>
          <LinearGradient colors={['#F5F3FF', '#EEF2FF', '#F0F9FF']} style={s.fill}>
            <SafeAreaView style={s.fill}>
              <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                {/* Header row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (createStep > 1) {
                        setCreateStep(cs => cs - 1);
                      } else {
                        setCreateOpen(false); setCreateStep(1); setCreateSize(null); setCreateType(null);
                        setCreateDay(''); setCreateHour(''); setCreateLocation(''); setCreateDriving(false);
                        setCreateLangs([]); setCreateVibe(null); setCreateCustom('');
                        setCalViewYear(new Date().getFullYear()); setCalViewMonth(new Date().getMonth());
                      }
                    }}
                    style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="chevron-left" size={18} color="#64748B" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366F1', letterSpacing: 1.2, textTransform: 'uppercase', flex: 1, textAlign: 'center' }}>
                    {['Who\'s coming?','What activity?','When & where?','Last details'][createStep - 1]}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCreateOpen(false); setCreateStep(1); setCreateSize(null); setCreateType(null);
                      setCreateDay(''); setCreateHour(''); setCreateLocation(''); setCreateDriving(false);
                      setCreateLangs([]); setCreateVibe(null); setCreateCustom('');
                      setCalViewYear(new Date().getFullYear()); setCalViewMonth(new Date().getMonth());
                    }}
                    style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="x" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Progress dots */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20, paddingHorizontal: 20 }}>
                  {[1,2,3,4].map(i => (
                    <View key={i} style={{ height: 4, borderRadius: 99, flex: i === createStep ? 2 : 1,
                      backgroundColor: i <= createStep ? '#6366F1' : '#E2E8F0' }} />
                  ))}
                </View>

                {/* Step content in ScrollView */}
                <ScrollView
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={{ flex: 1 }}>

                  {/* ── Step 1: Pod Size ── */}
                  {createStep === 1 && (
                    <View style={{ gap: 10 }}>
                      {[
                        { id: 'duo',   emoji: '👥', label: 'Duo',   sub: '1-on-1 — most personal', color: '#EEF2FF', accent: '#6366F1' },
                        { id: 'squad', emoji: '🫂', label: 'Squad', sub: 'Small group vibe, up to 5', color: '#F0FDF4', accent: '#22c55e' },
                        { id: 'party', emoji: '🎉', label: 'Party', sub: 'Large gathering, up to 20', color: '#FFF7ED', accent: '#f97316' },
                      ].map(opt => (
                        <TouchableOpacity key={opt.id} onPress={() => setCreateSize(opt.id)} activeOpacity={0.8}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 20,
                            backgroundColor: createSize === opt.id ? opt.color : '#F8FAFC',
                            borderWidth: 2, borderColor: createSize === opt.id ? opt.accent : 'transparent' }}>
                          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: createSize === opt.id ? '#fff' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 26 }}>{opt.emoji}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>{opt.label}</Text>
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{opt.sub}</Text>
                          </View>
                          <View style={{ width: 22, height: 22, borderRadius: 11,
                            backgroundColor: createSize === opt.id ? opt.accent : '#E2E8F0',
                            alignItems: 'center', justifyContent: 'center' }}>
                            {createSize === opt.id && <Feather name="check" size={12} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* ── Step 2: Activity with category tabs ── */}
                  {createStep === 2 && (() => {
                    const CATS: Record<string, { emoji: string; items: { id: string; emoji: string; label: string }[] }> = {
                      'Sport':  { emoji: '🏃', items: [{ id:'padel', emoji:'🏓', label:'Padel' },{ id:'tennis', emoji:'🎾', label:'Tennis' },{ id:'yoga', emoji:'🧘', label:'Yoga' },{ id:'gym', emoji:'💪', label:'Gym' },{ id:'water', emoji:'🏄', label:'Water Sports' }] },
                      'Food':   { emoji: '🍽️', items: [{ id:'coffee', emoji:'☕', label:'Coffee' },{ id:'meze', emoji:'🥘', label:'Meze' },{ id:'wine', emoji:'🍷', label:'Wine' },{ id:'brunch', emoji:'🥂', label:'Brunch' },{ id:'sunset', emoji:'🌅', label:'Sunset' }] },
                      'Work':   { emoji: '💼', items: [{ id:'networking', emoji:'🤝', label:'Networking' },{ id:'crypto', emoji:'🪙', label:'Crypto' },{ id:'cowork', emoji:'💻', label:'Co-working' }] },
                      'Relax':  { emoji: '🌿', items: [{ id:'beach', emoji:'🏖️', label:'Beach' },{ id:'hiking', emoji:'🥾', label:'Hiking' },{ id:'boat', emoji:'⛵', label:'Boat' },{ id:'boardgames', emoji:'🎲', label:'Board Games' }] },
                    }
                    const catItems = [...(CATS[createCategory]?.items || []), { id: 'other', emoji: '✏️', label: 'Other' }]
                    const cardW = (W - 40 - 20) / 3
                    return (
                      <View>
                        {/* Category tabs */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                          {Object.entries(CATS).map(([cat, { emoji }]) => (
                            <TouchableOpacity key={cat} onPress={() => setCreateCategory(cat)} activeOpacity={0.8}
                              style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14,
                                backgroundColor: createCategory === cat ? '#6366F1' : '#F1F5F9' }}>
                              <Text style={{ fontSize: 16 }}>{emoji}</Text>
                              <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 2, color: createCategory === cat ? '#fff' : '#64748B' }}>{cat}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        {/* Activity grid */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' }}>
                          {catItems.map(t => (
                            <TouchableOpacity key={t.id} onPress={() => { setCreateType(t.id); if (t.id !== 'other') setCreateCustom('') }} activeOpacity={0.8}
                              style={{ width: cardW, aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
                                backgroundColor: createType === t.id ? '#EEF2FF' : '#F8FAFC',
                                borderWidth: 2, borderColor: createType === t.id ? '#6366F1' : 'transparent' }}>
                              <Text style={{ fontSize: 28, marginBottom: 4 }}>{t.emoji}</Text>
                              <Text style={{ fontSize: 11, fontWeight: createType === t.id ? '700' : '500',
                                color: createType === t.id ? '#6366F1' : '#64748B', textAlign: 'center' }}>{t.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        {/* Custom name input if Other selected */}
                        {createType === 'other' && (
                          <View style={{ marginTop: 14, backgroundColor: '#EEF2FF', borderRadius: 18, padding: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#6366F1', marginBottom: 10 }}>What are you planning?</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10,
                              backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
                              borderWidth: 1.5, borderColor: createCustom.length > 0 ? '#6366F1' : '#E2E8F0' }}>
                              <Feather name="edit-2" size={15} color="#6366F1" />
                              <TextInput value={createCustom} onChangeText={setCreateCustom}
                                placeholder="e.g. Paddle tennis, Pottery class..." placeholderTextColor="#94A3B8"
                                autoFocus returnKeyType="done"
                                style={{ flex: 1, fontSize: 14, color: '#1E1B4B', fontWeight: '600' }} />
                              {createCustom.length > 0 && (
                                <TouchableOpacity onPress={() => setCreateCustom('')}>
                                  <Feather name="x-circle" size={16} color="#94A3B8" />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}
                      </View>
                    )
                  })()}

                  {/* ── Step 3: Calendar + Time + Location ── */}
                  {createStep === 3 && (() => {
                    const today = new Date(); today.setHours(0,0,0,0)
                    const firstDay = new Date(calViewYear, calViewMonth, 1)
                    const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate()
                    const startDow = (firstDay.getDay() + 6) % 7
                    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
                    const DAY_LABELS = ['M','T','W','T','F','S','S']
                    const cells: (number | null)[] = []
                    for (let i = 0; i < startDow; i++) cells.push(null)
                    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
                    while (cells.length % 7 !== 0) cells.push(null)
                    const cellW = (W - 40) / 7
                    return (
                      <View>
                        {/* Calendar card */}
                        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, padding: 14, marginBottom: 14 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <TouchableOpacity onPress={() => { const d = new Date(calViewYear, calViewMonth - 1); setCalViewMonth(d.getMonth()); setCalViewYear(d.getFullYear()) }}
                              style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                              <Feather name="chevron-left" size={15} color="#334155" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E1B4B' }}>{MONTHS[calViewMonth]} {calViewYear}</Text>
                            <TouchableOpacity onPress={() => { const d = new Date(calViewYear, calViewMonth + 1); setCalViewMonth(d.getMonth()); setCalViewYear(d.getFullYear()) }}
                              style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                              <Feather name="chevron-right" size={15} color="#334155" />
                            </TouchableOpacity>
                          </View>
                          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                            {DAY_LABELS.map((l, i) => (
                              <View key={i} style={{ width: cellW, alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: i >= 5 ? '#818CF8' : '#94A3B8' }}>{l}</Text>
                              </View>
                            ))}
                          </View>
                          {Array.from({ length: cells.length / 7 }, (_, row) => (
                            <View key={row} style={{ flexDirection: 'row', marginBottom: 1 }}>
                              {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                                if (!day) return <View key={col} style={{ width: cellW, height: 32 }} />
                                const thisDate = new Date(calViewYear, calViewMonth, day)
                                const isPast = thisDate < today
                                const isToday = thisDate.getTime() === today.getTime()
                                const selStr = `${calViewYear}-${String(calViewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                                const isSelected = createDay === selStr
                                const isWeekend = col >= 5
                                return (
                                  <TouchableOpacity key={col} disabled={isPast} onPress={() => setCreateDay(selStr)} activeOpacity={0.7}
                                    style={{ width: cellW, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                                      backgroundColor: isSelected ? '#6366F1' : isToday ? '#fff' : 'transparent',
                                      borderWidth: isToday && !isSelected ? 1.5 : 0, borderColor: '#6366F1',
                                      shadowColor: isSelected ? '#6366F1' : 'transparent', shadowOpacity: 0.35, shadowRadius: 6, elevation: isSelected ? 4 : 0 }}>
                                      <Text style={{ fontSize: 13, fontWeight: isSelected || isToday ? '800' : '400',
                                        color: isSelected ? '#fff' : isPast ? '#CBD5E1' : isWeekend ? '#818CF8' : '#1E1B4B' }}>
                                        {day}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                )
                              })}
                            </View>
                          ))}
                        </View>

                        {/* Time chips */}
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Time</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                          {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(h => (
                            <TouchableOpacity key={h} onPress={() => setCreateHour(h)} activeOpacity={0.8}
                              style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99,
                                backgroundColor: createHour === h ? '#6366F1' : '#F1F5F9' }}>
                              <Text style={{ fontSize: 12, fontWeight: '700', color: createHour === h ? '#fff' : '#64748B' }}>{h}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Location */}
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Location</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 14,
                          paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5,
                          borderColor: createLocation.length > 0 ? '#6366F1' : 'transparent' }}>
                          <Feather name="map-pin" size={15} color="#6366F1" />
                          <TextInput value={createLocation} onChangeText={setCreateLocation}
                            placeholder="Café, beach, address..." placeholderTextColor="#94A3B8"
                            style={{ flex: 1, fontSize: 14, color: '#1E1B4B', fontWeight: '600' }} />
                        </View>
                      </View>
                    )
                  })()}

                  {/* ── Step 4: Vibe + Language + Driving ── */}
                  {createStep === 4 && (
                    <View style={{ gap: 16 }}>
                      {/* Vibe */}
                      <View>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Vibe</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {[{ id:'chill', emoji:'😌', label:'Chill' },{ id:'active', emoji:'⚡', label:'Active' },{ id:'professional', emoji:'🤝', label:'Professional' }].map(v => (
                            <TouchableOpacity key={v.id} onPress={() => setCreateVibe(v.id)} activeOpacity={0.8}
                              style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16,
                                backgroundColor: createVibe === v.id ? '#EEF2FF' : '#F8FAFC',
                                borderWidth: 2, borderColor: createVibe === v.id ? '#6366F1' : 'transparent' }}>
                              <Text style={{ fontSize: 22 }}>{v.emoji}</Text>
                              <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 4, color: createVibe === v.id ? '#6366F1' : '#64748B' }}>{v.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      {/* Languages */}
                      <View>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Languages</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {LANGUAGES_LIST.map((l: any) => (
                            <TouchableOpacity key={l.code} onPress={() => setCreateLangs(prev => prev.includes(l.code) ? prev.filter((x: string) => x !== l.code) : [...prev, l.code])} activeOpacity={0.8}
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 99,
                                backgroundColor: createLangs.includes(l.code) ? '#EEF2FF' : '#F8FAFC',
                                borderWidth: 1.5, borderColor: createLangs.includes(l.code) ? '#6366F1' : 'transparent' }}>
                              <Text style={{ fontSize: 15 }}>{l.flag || '🌐'}</Text>
                              <Text style={{ fontSize: 13, fontWeight: '700', color: createLangs.includes(l.code) ? '#6366F1' : '#64748B' }}>{l.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      {/* Driving */}
                      <TouchableOpacity onPress={() => setCreateDriving(v => !v)} activeOpacity={0.85}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                          backgroundColor: createDriving ? '#EEF2FF' : '#F8FAFC', borderRadius: 16, padding: 14,
                          borderWidth: 1.5, borderColor: createDriving ? '#6366F1' : 'transparent' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 22 }}>🚗</Text>
                          <View>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1B4B' }}>I can give a lift</Text>
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>Others can ride with you</Text>
                          </View>
                        </View>
                        <Switch value={createDriving} onValueChange={setCreateDriving} trackColor={{ false: '#E2E8F0', true: '#818CF8' }} thumbColor={createDriving ? '#6366F1' : '#f4f3f4'} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Bottom button — inside ScrollView so keyboard never covers it */}
                  <View style={{ paddingTop: 16, paddingBottom: 8 }}>
                  {createStep < 4 ? (
                    <TouchableOpacity
                      style={[s.btnPrimary,
                        (createStep === 1 && !createSize) || (createStep === 2 && !createType) || (createStep === 3 && (!createDay || !createHour))
                          ? { opacity: 0.35, backgroundColor: '#6366F1' }
                          : { shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }
                      ]}
                      disabled={(createStep === 1 && !createSize) || (createStep === 2 && !createType) || (createStep === 3 && (!createDay || !createHour))}
                      onPress={() => setCreateStep(cs => cs + 1)}>
                      <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Continue →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[s.btnPrimary, { shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }]}
                      onPress={() => {
                        // Build a proper event object
                        const TYPE_TO_CAT: Record<string, string> = {
                          padel:'sports',tennis:'sports',yoga:'sports',gym:'sports',water:'sports',
                          coffee:'coffee',meze:'food',wine:'wine',brunch:'food',sunset:'outdoors',
                          networking:'tech',crypto:'tech',coworking:'tech',
                          beach:'outdoors',hiking:'outdoors',boat:'outdoors',boardgames:'gaming',
                        }
                        const SIZE_MAX: Record<string, number> = { duo: 2, squad: 5, party: 20 }
                        const GRAD_POOL: [string,string][] = [
                          ['#6366F1','#8B5CF6'],['#EC4899','#F43F5E'],
                          ['#10B981','#059669'],['#F59E0B','#F97316'],
                        ]
                        const newId = Date.now()
                        const grad = GRAD_POOL[newId % GRAD_POOL.length]
                        const actLabel = createCustom.trim() || createType || 'Social'

                        // Build expiry timestamp from selected date + time
                        let expiresAt = 0
                        if (createDay && createHour) {
                          const [h, m] = createHour.split(':').map(Number)
                          const d = new Date(createDay)
                          d.setHours(h, m, 0, 0)
                          expiresAt = d.getTime()
                        }

                        const newEvent: any = {
                          id: newId,
                          city,
                          type: 'community',
                          title: actLabel,
                          time: createDay && createHour ? `${createDay}, ${createHour}` : 'TBD',
                          distance: '0km',
                          category: TYPE_TO_CAT[createType || ''] || 'outdoors',
                          gradient: grad,
                          seekerColors: ['#818CF8'],
                          seekingCount: 0,
                          participantsCount: 1,
                          maxParticipants: SIZE_MAX[createSize || 'squad'] || 5,
                          description: `A ${createSize || 'squad'} ${actLabel} gathering. ${createLocation ? '📍 ' + createLocation : ''} ${createDriving ? '🚗 Host can give a lift.' : ''}`.trim(),
                          location: createLocation,
                          isHosted: true,
                          hostDriving: createDriving,
                          hostLangs: createLangs,
                          hostVibe: createVibe,
                          expiresAt,
                        }
                        setUserCreatedEvents(prev => [...prev, newEvent])

                        // Simulate a join request arriving after 3 seconds (demo)
                        const requester = MOCK_SEEKERS[newId % MOCK_SEEKERS.length]
                        setTimeout(() => {
                          setPendingJoinRequests(prev => ({
                            ...prev,
                            [newId]: [...(prev[newId] || []), { ...requester, requestId: `${newId}-${requester.id}` }],
                          }))
                        }, 3000)

                        // Reset form
                        setCreateOpen(false); setCreateStep(1); setCreateSize(null); setCreateType(null);
                        setCreateDay(''); setCreateHour(''); setCreateLocation(''); setCreateDriving(false);
                        setCreateLangs([]); setCreateVibe(null); setCreateCustom('');
                        setCalViewYear(new Date().getFullYear()); setCalViewMonth(new Date().getMonth());
                        showToast('Your social is live! 🎉')
                      }}>
                      <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Create Social 🚀</Text>
                    </TouchableOpacity>
                  )}
                  </View>

                </ScrollView>

              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
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
          <Modal visible animationType="slide" onRequestClose={() => setEventDetail(null)}>
            <LinearGradient colors={['#F5F3FF', '#EEF2FF', '#F0F9FF']} style={s.fill}>
              <StatusBar style="dark" />
              <SafeAreaView style={s.fill}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Header */}
                  <LinearGradient colors={eventDetail.gradient as any} style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <TouchableOpacity onPress={() => setEventDetail(null)} style={[s.detailBackBtn, { alignSelf: 'flex-start', marginBottom: 16 }]}>
                      <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                      {CATEGORY_EMOJI[eventDetail.category] || '📍'} {eventDetail.category?.toUpperCase()} · {eventDetail.distance}
                    </Text>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4, lineHeight: 28 }}>{eventDetail.title}</Text>
                  </LinearGradient>

                  <View style={{ padding: 16, gap: 10 }}>
                    {/* Time + Location + Address link — one compact card */}
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="clock" size={16} color="#6366F1" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date & Time</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 1 }}>{eventDetail.time}</Text>
                        </View>
                      </View>
                      <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="map-pin" size={16} color="#6366F1" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 1 }}>{eventDetail.city} · {eventDetail.distance} from you</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(eventDetail.city)}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366F1' }}>Open</Text>
                          <Feather name="external-link" size={12} color="#6366F1" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Description */}
                    {eventDetail.description && (
                      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
                        <Text style={{ fontSize: 14, color: '#334155', lineHeight: 21 }}>{eventDetail.description}</Text>
                      </View>
                    )}

                    {/* Participants */}
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="users" size={18} color="#6366F1" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Participants</Text>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginTop: 2 }}>
                          {eventDetail.participantsCount} going{evSpotsLeft !== null ? `  ·  ${evSpotsLeft} spots left` : ''}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: evIsFull ? '#fef2f2' : '#f0fdf4', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: evIsFull ? '#EF4444' : '#22c55e' }}>{evIsFull ? 'Full' : 'Open'}</Text>
                      </View>
                    </View>

                    {/* Organizer (official) */}
                    {eventDetail.type === 'official' && eventDetail.organizer && (
                      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 22 }}>{eventDetail.organizer.emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Organizer</Text>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginTop: 2 }}>{eventDetail.organizer.name}</Text>
                          {eventDetail.source && <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>via {eventDetail.source}</Text>}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EEF2FF', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Ionicons name="checkmark-circle" size={12} color="#6366F1" />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#6366F1' }}>Verified</Text>
                        </View>
                      </View>
                    )}

                    {/* Get Tickets */}
                    {eventDetail.ticketLink && (
                      <TouchableOpacity style={s.ticketBtn} onPress={() => Linking.openURL(eventDetail.ticketLink)} activeOpacity={0.8}>
                        <Ionicons name="ticket-outline" size={16} color="#6366F1" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#6366F1' }}>Get Tickets 🎫</Text>
                      </TouchableOpacity>
                    )}

                    {/* Host card (community events) */}
                    {evHost && (
                      <>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B', marginTop: 4, letterSpacing: -0.3 }}>Event Host</Text>
                        <TouchableOpacity
                          onPress={() => setChatPartnerPreview(evHost)}
                          style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}
                          activeOpacity={0.85}>
                          <Image source={{ uri: evHost.photo }} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF' }} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>{evHost.name}, {evHost.age}</Text>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 3, lineHeight: 18 }} numberOfLines={2}>{evHost.bio}</Text>
                            <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                              {evHost.langs.map((l: string) => <Text key={l} style={{ fontSize: 15 }}>{FLAG_MAP[l]}</Text>)}
                              {evHost.transport && <Text style={{ fontSize: 12, color: '#94A3B8', marginLeft: 4 }}>{TRANSPORT_LABEL[evHost.transport]}</Text>}
                            </View>
                          </View>
                          <Feather name="chevron-right" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </ScrollView>

                {/* Sticky Join button */}
                {!eventDetail.isHosted && (() => {
                  const joined = joinedEvents[eventDetail.id]
                  const isFull = evIsFull
                  return (
                    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, backgroundColor: 'rgba(245,243,255,0.96)', borderTopWidth: 1, borderTopColor: 'rgba(99,102,241,0.08)' }}>
                      {joined ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            handleJoinEvent(eventDetail)
                            setEventDetail(null)
                          }}
                          style={{ borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#22c55e' }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#16a34a' }}>✓ Joined — tap to leave</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          disabled={isFull}
                          onPress={() => {
                            setEventDetail(null)
                            setPendingJoinEv(eventDetail)
                            setActiveTab('home')
                          }}
                          style={[s.btnPrimary, isFull
                            ? { backgroundColor: '#E2E8F0', shadowOpacity: 0 }
                            : { shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }
                          ]}>
                          <Text style={[s.btnPrimaryText, { color: isFull ? '#94A3B8' : '#fff' }]}>
                            {isFull ? 'Event is full' : 'Join this Social →'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                })()}
              </SafeAreaView>
            </LinearGradient>
          </Modal>
      )}

      {/* Match modal */}
      {matchedWith && (
        <Modal visible transparent animationType="none" onRequestClose={() => setMatchedWith(null)}>
          <Animated.View style={{ flex: 1, opacity: matchFlash }}>
            <LinearGradient colors={['#0f0c29', '#1a1040', '#6d28d9']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              {/* Stars */}
              {['✨','⭐','💫','✨','⭐','💫'].map((s2, i) => (
                <Text key={i} style={{ position: 'absolute', fontSize: 22, opacity: 0.5,
                  top: `${10 + i * 12}%` as any, left: i % 2 === 0 ? `${8 + i * 5}%` as any : undefined,
                  right: i % 2 !== 0 ? `${8 + i * 5}%` as any : undefined }}>{s2}</Text>
              ))}

              <Text style={{ fontSize: 13, fontWeight: '800', color: 'rgba(167,139,250,0.8)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                You Found Your Parea
              </Text>

              {/* Animated avatars */}
              <Animated.View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28, transform: [{ scale: matchScale }] }}>
                <Animated.Image
                  source={{ uri: 'https://i.pravatar.cc/120?img=1' }}
                  style={[s.matchAvatar, { transform: [{ translateX: matchLeftX }] }]} />
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#6d28d9', alignItems: 'center', justifyContent: 'center', zIndex: 5, marginHorizontal: -8 }}>
                  <Text style={{ fontSize: 18 }}>🤝</Text>
                </View>
                <Animated.Image
                  source={{ uri: matchedWith.photo }}
                  style={[s.matchAvatar, { transform: [{ translateX: matchRightX }] }]} />
              </Animated.View>

              <Text style={{ fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.8, marginBottom: 10, textAlign: 'center' }}>
                Found a Buddy! 🤝
              </Text>
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 36, textAlign: 'center', lineHeight: 22 }}>
                Say hi in your new{'\n'}Parea chat 🚀
              </Text>

              <TouchableOpacity
                style={{ backgroundColor: '#6d28d9', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 48, borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)', shadowColor: '#6d28d9', shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 }}
                onPress={() => { setMatchedWith(null); setEventDetail(null); setVibeResults({}); setActiveTab('messages') }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 }}>Open Chat 💬</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMatchedWith(null)} style={{ marginTop: 18 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Maybe later</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
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
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 4 }}
                    onPress={() => { if (openChat.partnerProfile) { setChatPartnerPreview(openChat.partnerProfile); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } }}
                    activeOpacity={openChat.partnerProfile ? 0.7 : 1}
                  >
                    <View style={[s.chatHeaderAvatar, { backgroundColor: openChat.color, alignItems: 'center', justifyContent: 'center' }]}>
                      {openChat.photo ? <Image source={{ uri: openChat.photo }} style={{ width: '100%', height: '100%', borderRadius: 20 }} /> : <Text style={{ fontSize: 22 }}>👤</Text>}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B' }}>
                        {`${openChat.name}, ${openChat.age}`}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>
                        {openChat.eventEmoji} {openChat.event}
                        {openChat.partnerProfile ? '  · View profile' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 4 }}
                    onPress={() => { setGroupMembersOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
                    activeOpacity={0.7}
                  >
                    {/* Overlapping avatars / fallback emoji */}
                    {(openChat.avatars || []).length === 0 ? (
                      <LinearGradient
                        colors={[
                          ((openChat.colors || [])[0] && typeof (openChat.colors || [])[0] === 'string') ? (openChat.colors || [])[0] : '#818CF8',
                          ((openChat.colors || [])[1] && typeof (openChat.colors || [])[1] === 'string') ? (openChat.colors || [])[1] : '#6366F1',
                        ]}
                        style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <Text style={{ fontSize: 20 }}>{openChat.eventEmoji || '🎉'}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={{ width: 54, height: 36, position: 'relative', marginRight: 10 }}>
                        {(openChat.avatars || []).slice(0, 3).map((av: string, ai: number) => (
                          <View key={ai} style={{ position: 'absolute', left: ai * 16, top: 0, width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#fff', overflow: 'hidden', backgroundColor: (openChat.colors || [])[ai] || '#818CF8', zIndex: 3 - ai }}>
                            <Image source={{ uri: av }} style={{ width: '100%', height: '100%' }} />
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B' }} numberOfLines={1}>{openChat.event}</Text>
                      <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '600' }}>
                        {openChat.eventEmoji} {openChat.members} members · tap to see all
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  const msg = openChat.type === 'duo'
                    ? `${openChat.name} will see that your plans changed 📅`
                    : `The group will see you've left. Your spot will be freed.`
                  Alert.alert(
                    openChat.type === 'duo' ? `Leave chat with ${openChat.name}?` : `Leave "${openChat.event}"?`,
                    msg,
                    [
                      { text: 'Leave', style: 'destructive', onPress: () => {
                        setChatMessages(prev => ({
                          ...prev,
                          [openChat.id]: [...(prev[openChat.id] || []), { from: 'system', text: 'You changed your plans 📅', time: 'now' }],
                        }))
                        setChatList(prev => prev.filter(c => c.id !== openChat.id))
                        setOpenChat(null)
                        showToast("We let them know your plans changed 📅")
                      }},
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  )
                }}>
                  <Feather name="more-horizontal" size={22} color="#334155" />
                </TouchableOpacity>
              </View>

              <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
                {(chatMessages[openChat.id] || []).map((msg: any, i: number) => (
                  <View key={i} style={{ marginBottom: 10, alignItems: msg.from === 'system' ? 'center' : msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                    {msg.from === 'system' && (
                      <View style={{ paddingHorizontal: 14, paddingVertical: 5, backgroundColor: 'rgba(100,116,139,0.1)', borderRadius: 99 }}>
                        <Text style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>{msg.text}</Text>
                      </View>
                    )}

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

      {chatPartnerPreview && <ProfilePreviewSheet profile={chatPartnerPreview} onClose={() => setChatPartnerPreview(null)} />}

      {/* ── Floating Bell ──────────────────────────────────────────────────── */}
      {activeTab === 'home' && !createOpen && !eventDetail && !openChat && (
        <Animated.View style={{
          position: 'absolute', top: 52, right: 20, zIndex: 500,
          transform: [{ rotate: bellShake.interpolate({ inputRange: [-12, 0, 12], outputRange: ['-18deg', '0deg', '18deg'] }) }],
        }}>
          <TouchableOpacity onPress={openNotifPanel} activeOpacity={0.85}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
              shadowColor: '#6366F1', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
            <Ionicons name="notifications-outline" size={22} color={unreadCount > 0 ? '#6366F1' : '#94A3B8'} />
          </TouchableOpacity>
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
              backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
              paddingHorizontal: 4, borderWidth: 2, borderColor: '#F5F3FF' }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* ── Notification Panel ─────────────────────────────────────────────── */}
      {notifOpen && (
        <Modal visible transparent animationType="none" onRequestClose={closeNotifPanel}>
          <View style={{ flex: 1 }}>
            {/* Backdrop */}
            <TouchableOpacity style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,8,18,0.55)' }}
              activeOpacity={1} onPress={closeNotifPanel} />
            {/* Panel */}
            <Animated.View style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              transform: [{ translateY: notifPanelY }],
              backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
              maxHeight: '78%',
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
            }}>
              {/* Top safe area fill */}
              <View style={{ height: 52, backgroundColor: '#fff', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />

              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 14 }}>
                <View>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5 }}>Notifications</Text>
                  {unreadCount > 0 && <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '700', marginTop: 1 }}>{unreadCount} new</Text>}
                </View>
                <TouchableOpacity onPress={closeNotifPanel} activeOpacity={0.7}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="x" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}>
                {notifications.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                    <Text style={{ fontSize: 42, marginBottom: 12 }}>🔔</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 6 }}>All caught up!</Text>
                    <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>Notifications will appear here{'\n'}when something happens</Text>
                  </View>
                ) : (
                  notifications.map(n => (
                    <View key={n.id} style={{
                      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                      backgroundColor: n.read ? '#FAFAFA' : '#F5F3FF',
                      borderRadius: 18, padding: 14,
                      borderLeftWidth: 3, borderLeftColor: n.read ? '#E2E8F0' : n.color,
                      shadowColor: n.read ? 'transparent' : n.color,
                      shadowOpacity: n.read ? 0 : 0.12, shadowRadius: 8, elevation: n.read ? 0 : 2,
                    }}>
                      {/* Emoji icon */}
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${n.color}18`,
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Text style={{ fontSize: 20 }}>{n.emoji}</Text>
                      </View>
                      {/* Text */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: n.read ? '600' : '800', color: '#1E1B4B', marginBottom: 2 }}>{n.title}</Text>
                        <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 17 }}>{n.body}</Text>
                        <Text style={{ fontSize: 11, color: n.color, fontWeight: '600', marginTop: 5 }}>{timeAgo(n.time)}</Text>
                      </View>
                      {/* Dismiss */}
                      <TouchableOpacity onPress={() => dismissNotif(n.id)} activeOpacity={0.7}
                        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                        <Feather name="x" size={13} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Group members sheet */}
      {groupMembersOpen && openChat && (
        <Modal transparent animationType="slide" onRequestClose={() => setGroupMembersOpen(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={() => setGroupMembersOpen(false)} />
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '80%', paddingBottom: 32 }}>
              {/* Handle */}
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
              </View>
              {/* Header */}
              <View style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(99,102,241,0.08)' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E1B4B' }}>{openChat.event}</Text>
                <Text style={{ fontSize: 13, color: '#6366F1', fontWeight: '600', marginTop: 2 }}>
                  {openChat.eventEmoji} {openChat.members} members
                </Text>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                {/* You — host */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: 'rgba(99,102,241,0.06)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.15)' }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>😊</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>You</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: '#6366F1' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>HOST 👑</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>That's you 👋</Text>
                  </View>
                </View>
                {/* Approved members */}
                {(openChat.memberProfiles || []).map((p: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 20, backgroundColor: `${p.color}0D`, borderWidth: 1.5, borderColor: `${p.color}25` }}>
                    {/* Photo + info — tappable to view profile */}
                    <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}
                      onPress={() => {
                        setChatPartnerPreview({
                          ...p,
                          colors: [p.color, '#1E1B4B'],
                          flag: FLAG_MAP[p.langs?.[0]] || '🌍',
                          langs: (p.langs || []).map((l: string) => FLAG_MAP[l] || l),
                          interests: [], goal: 'chill', emoji: '👤',
                        })
                        setGroupMembersOpen(false)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      }}>
                      <View style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', backgroundColor: p.color }}>
                        {p.photo
                          ? <Image source={{ uri: p.photo }} style={{ width: '100%', height: '100%' }} />
                          : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 24 }}>👤</Text></View>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>{p.name}, {p.age}</Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }} numberOfLines={1}>{p.bio}</Text>
                        <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                          {(p.langs || []).map((l: string) => (
                            <Text key={l} style={{ fontSize: 14 }}>{FLAG_MAP[l] || '🌐'}</Text>
                          ))}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Remove button — only for host */}
                    {openChat.hostEventId && (
                      <TouchableOpacity activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                          Alert.alert(
                            `Remove ${p.name}?`,
                            'They will be removed from the group chat.',
                            [
                              { text: 'Remove', style: 'destructive', onPress: () => {
                                // Remove from memberProfiles + avatars in chatList
                                setChatList(prev => prev.map(c => {
                                  if (c.id !== openChat.id) return c
                                  const newProfiles = (c.memberProfiles || []).filter((_: any, idx: number) => idx !== i)
                                  return {
                                    ...c,
                                    memberProfiles: newProfiles,
                                    avatars: newProfiles.map((m: any) => m.photo).filter(Boolean),
                                    colors: newProfiles.map((m: any) => m.color),
                                    members: newProfiles.length + 1,
                                    lastMsg: `🚫 ${p.name} was removed`,
                                    time: 'now',
                                  }
                                }))
                                // Update openChat in-place
                                setOpenChat((prev: any) => {
                                  if (!prev) return prev
                                  const newProfiles = (prev.memberProfiles || []).filter((_: any, idx: number) => idx !== i)
                                  return {
                                    ...prev,
                                    memberProfiles: newProfiles,
                                    avatars: newProfiles.map((m: any) => m.photo).filter(Boolean),
                                    colors: newProfiles.map((m: any) => m.color),
                                    members: newProfiles.length + 1,
                                  }
                                })
                                // Add system message
                                setChatMessages(prev => ({
                                  ...prev,
                                  [openChat.id]: [...(prev[openChat.id] || []), { from: 'system', text: `🚫 ${p.name} was removed from the group`, time: 'now' }],
                                }))
                                setGroupMembersOpen(false)
                                showToast(`${p.name} removed`)
                              }},
                              { text: 'Cancel', style: 'cancel' },
                            ]
                          )
                        }}
                        style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="user-x" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Toast notification */}
      {toast.visible && (
        <Animated.View pointerEvents="none" style={{
          position: 'absolute', top: 60, left: 24, right: 24, zIndex: 9999,
          opacity: toastAnim,
          transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
        }}>
          <View style={{ backgroundColor: '#1E1B4B', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 16 }}>
            <Text style={{ fontSize: 22 }}>🔍</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Finding your crew...</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{toast.text}</Text>
            </View>
          </View>
        </Animated.View>
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
  return <FeedScreen userData={userData} onLogOut={() => { setUserData({}); setScreen('register') }} />
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
  authTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  authBackBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  authLogo: { width: 180, height: 56 },
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

  // Country picker
  countryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 4 },
  countryCode: { fontSize: 14, fontWeight: '600', color: '#334155' },
  countryDivider: { width: 1, height: 22, backgroundColor: 'rgba(100,116,139,0.2)', marginHorizontal: 10 },
  countryModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '70%' },
  countryModalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  countryModalTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', textAlign: 'center', paddingVertical: 14 },
  countryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  countryRowName: { flex: 1, fontSize: 15, color: '#334155', fontWeight: '500' },
  countryRowCode: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  // OTP
  otpCell: { width: 64, height: 72, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2.5, borderBottomColor: 'rgba(99,102,241,0.25)' },
  otpCellFilled: { borderBottomColor: '#6366F1' },
  otpInput: { width: 64, height: 72, fontSize: 32, fontWeight: '700', color: '#1E1B4B', textAlign: 'center', backgroundColor: 'transparent' },

  // Onboarding
  onbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
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
  photoCropHint: { fontSize: 10, color: 'rgba(99,102,241,0.5)', textAlign: 'center', marginTop: 2 },
  photoMainTxt: { fontSize: 10, fontWeight: '700', color: '#6366F1', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 },
  photoRemoveBtn: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#22c55e', paddingVertical: 6, alignItems: 'center' },
  mainBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(99,102,241,0.88)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  bentoCard: { flex: 1, borderRadius: 22, borderWidth: 1.5, padding: 14 },
  bentoLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  bentoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6366F1', marginTop: 6 },
  bentoFinishBtn: { borderRadius: 20, overflow: 'hidden', shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  bentoFinishBlur: { borderRadius: 20, overflow: 'hidden' },
  bentoFinishGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 20 },
  bentoSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, maxHeight: '72%', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, elevation: 20 },

  // Join bottom sheet
  joinSheetWrap: { backgroundColor: '#0f0c1e', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 36, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 32, elevation: 24 },
  joinSheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 18 },
  joinSheetTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5, lineHeight: 30, marginBottom: 18 },
  joinSheetCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  joinSheetCardOn: { backgroundColor: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.5)' },
  joinSheetIconWrap: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  joinSheetCardLabel: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 2 },
  joinSheetCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  joinSheetNext: { marginTop: 20, borderRadius: 16, backgroundColor: '#6366F1', paddingVertical: 15, alignItems: 'center' },
  joinSheetNextTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  bentoSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  bentoSheetTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 16, letterSpacing: -0.3 },
  bentoSheetItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 6, backgroundColor: '#F8FAFC' },
  bentoSheetItemOn: { backgroundColor: 'rgba(99,102,241,0.08)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.25)' },
  bentoSheetItemTxt: { fontSize: 15, color: '#334155', fontWeight: '500', flex: 1 },
  photoEditBtn: { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  carRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 16, marginTop: 4 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(99,102,241,0.45)', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#818CF8', borderColor: '#818CF8' },
  carLabel: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 2 },
  carSub: { fontSize: 12, color: '#64748B' },
  bottomBar: { paddingHorizontal: 24, paddingTop: 8, gap: 10 },

  // Feed bottom nav
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 10, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  navCreateBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#fff', marginTop: -24, alignItems: 'center', justifyContent: 'center', shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  navCreateGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  createSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 },
  createTypeCard: { width: (W - 40 - 20) / 3, aspectRatio: 1, borderRadius: 20, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  createTypeCardOn: { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.35)' },
  createTypeLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', textAlign: 'center' },

  // Feed header
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, backgroundColor: '#F8F7FF' },
  cityBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(99,102,241,0.08)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(99,102,241,0.18)' },
  cityBtnTxt: { fontSize: 13, fontWeight: '700', color: '#4338CA' },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(99,102,241,0.08)', alignItems: 'center', justifyContent: 'center' },
  filterScroll: { backgroundColor: '#F8F7FF', height: 52 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'rgba(226,232,240,0.8)' },
  filterTabOn: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterTabTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTabTxtOn: { color: '#fff', fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  sectionHeader: { fontSize: 17, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3 },
  featuredCard: { height: 240, borderRadius: 24, padding: 16, overflow: 'hidden' },
  officialBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  categoryCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  featuredTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5, lineHeight: 30 },
  infoPill: { backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  infoPillTxt: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  avatarDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarDotSm: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#fff' },
  joinBtn: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  compactCardShadow: { width: 152, borderRadius: 18, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  compactCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#fff' },
  compactCardGrad: { height: 88, alignItems: 'center', justifyContent: 'center' },
  compactCardBody: { padding: 10 },
  compactCardTitle: { fontSize: 12, fontWeight: '700', color: '#1E1B4B', lineHeight: 17 },
  compactCardTime: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  listCardShadow: { borderRadius: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' },
  listCardLeft: { width: 72, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  listCardBody: { flex: 1, paddingVertical: 14, paddingLeft: 4 },
  listCardTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B', letterSpacing: -0.2 },
  listCardTime: { fontSize: 12, color: '#64748B', marginTop: 2 },

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
  organizerBlock: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, marginBottom: 4, backgroundColor: '#fff', borderRadius: 14, padding: 12, gap: 10, borderWidth: 1, borderColor: 'rgba(99,102,241,0.12)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  organizerLogoWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.08)', alignItems: 'center', justifyContent: 'center' },
  orgVerifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
  ticketBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#6366F1', borderRadius: 12, paddingVertical: 11, backgroundColor: 'rgba(99,102,241,0.05)' },

  // Seekers
  seekerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  seekerPhoto: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0' },
  formatBadge: { position: 'absolute', bottom: -2, right: -4, borderRadius: 99, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1.5, borderColor: '#fff' },
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
