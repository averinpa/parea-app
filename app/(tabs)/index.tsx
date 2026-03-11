// app/(tabs)/index.tsx — Parea Mobile
import { Feather, Ionicons } from '@expo/vector-icons'
import Svg, { Circle, Path } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Alert, Animated, Dimensions, Image, Linking,
  KeyboardAvoidingView, LayoutAnimation, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
  { id: 1,  city: 'Limassol', type: 'official',   title: 'Tennis Tournament at Aphrodite Hills', time: 'Today, 18:00',    distance: '2km',   category: 'sports',  gradient: ['#667eea', '#764ba2'], seekerColors: ['#818CF8', '#4CAF50', '#2196F3'],          seekingCount: 12, participantsCount: 22, maxParticipants: 24,  organizer: { name: 'Cyprus Sports Federation', emoji: '🎾' }, ticketLink: 'https://tickets.cy/tennis2025',        source: 'Official Website' },
  { id: 2,  city: 'Limassol', type: 'official',   title: 'Limassol Wine Festival 2025',          time: 'Tomorrow, 20:00', distance: '1.2km', category: 'wine',    gradient: ['#f093fb', '#f5576c'], seekerColors: ['#9C27B0', '#E91E63'],                     seekingCount: 28, participantsCount: 40, maxParticipants: 200, organizer: { name: 'SoldOut Tickets',              emoji: '🍷' }, ticketLink: 'https://soldout.com.cy/wine-festival', source: 'SoldOut Tickets' },
  { id: 9,  city: 'Limassol', type: 'official',   title: 'CyprusTech Conference 2025',           time: 'Sat, 10:00',     distance: '3km',   category: 'tech',    gradient: ['#0f2027', '#2c5364'], seekerColors: ['#2196F3', '#FF9800', '#9C27B0', '#22c55e'], seekingCount: 7,  participantsCount: 80, maxParticipants: 150, organizer: { name: 'CyprusTech Events',             emoji: '💻' }, ticketLink: 'https://cyprustech.io/2025',           source: 'Official Website' },
  { id: 5,  city: 'Paphos',   type: 'official',   title: 'Sunset Hike to Troodos',               time: 'Sat, 07:00',     distance: '8km',   category: 'sports',  gradient: ['#fa8231', '#f7b731'], seekerColors: ['#334155', '#818CF8', '#22c55e'],          seekingCount: 9,  participantsCount: 14, maxParticipants: 20,  organizer: { name: 'Paphos Outdoor Club',          emoji: '🥾' }, ticketLink: null,                                  source: 'Official Website' },
  { id: 3,  city: 'Limassol', type: 'community',  title: 'Morning Coffee & Chat',               time: 'Today, 09:30',   distance: '0.5km', category: 'coffee',  gradient: ['#4facfe', '#00c6fb'], seekerColors: ['#FF9800', '#03A9F4', '#8BC34A', '#FF5722'], seekingCount: 4,  participantsCount: 8,  maxParticipants: 8 },
  { id: 4,  city: 'Nicosia',  type: 'community',  title: 'Board Games Night',                   time: 'Fri, 19:00',     distance: '3km',   category: 'gaming',  gradient: ['#43e97b', '#38f9d7'], seekerColors: ['#FF5722', '#9C27B0'],                     seekingCount: 2,  participantsCount: 3,  maxParticipants: 10 },
  { id: 6,  city: 'Nicosia',  type: 'community',  title: 'Specialty Coffee Tour',               time: 'Sun, 11:00',     distance: '1km',   category: 'coffee',  gradient: ['#a18cd1', '#fbc2eb'], seekerColors: ['#818CF8', '#22c55e'],                     seekingCount: 2,  participantsCount: 6,  maxParticipants: 6 },
  { id: 7,  city: 'Larnaca',  type: 'community',  title: 'Beach Volleyball',                    time: 'Today, 17:00',   distance: '4km',   category: 'sports',  gradient: ['#ffecd2', '#fcb69f'], seekerColors: ['#2196F3', '#FF9800', '#9C27B0'],          seekingCount: 3,  participantsCount: 12, maxParticipants: 12 },
  { id: 8,  city: 'Larnaca',  type: 'community',  title: 'Wine & Jazz Evening',                 time: 'Sat, 20:00',     distance: '2km',   category: 'wine',    gradient: ['#c471f5', '#fa71cd'], seekerColors: ['#818CF8', '#4CAF50'],                     seekingCount: 5,  participantsCount: 8,  maxParticipants: 20 },
  { id: 10, city: 'Limassol', type: 'community',  title: 'Sunset Picnic at Dasoudi Beach',      time: 'Today, 17:30',   distance: '1.5km', category: 'outdoors',gradient: ['#134e5e', '#71b280'], seekerColors: ['#818CF8', '#22c55e', '#f59e0b'],          seekingCount: 6,  participantsCount: 9,  maxParticipants: 15 },
  { id: 11, city: 'Limassol', type: 'official',   title: 'Mediterranean Food Festival',         time: 'Tomorrow, 12:00',distance: '0.8km', category: 'food',    gradient: ['#f7971e', '#ffd200'], seekerColors: ['#ef4444', '#f97316', '#818CF8'],          seekingCount: 19, participantsCount: 55, maxParticipants: 500, organizer: { name: 'Limassol Municipality',      emoji: '🍕' }, ticketLink: 'https://limassol.gov.cy/food-fest',   source: 'Official Website' },
  { id: 12, city: 'Limassol', type: 'community',  title: 'Photography Walk — Old Port',         time: 'Sun, 09:00',     distance: '1km',   category: 'culture', gradient: ['#232526', '#414345'], seekerColors: ['#818CF8', '#22c55e'],                     seekingCount: 3,  participantsCount: 7,  maxParticipants: 10 },
  { id: 13, city: 'Nicosia',  type: 'official',   title: 'Open Air Cinema Night',               time: 'Sat, 21:00',     distance: '2km',   category: 'culture', gradient: ['#0f0c29', '#302b63'], seekerColors: ['#a78bfa', '#f472b6', '#34d399'],          seekingCount: 11, participantsCount: 30, maxParticipants: 50,  organizer: { name: 'Coca-Cola Arena Nicosia',      emoji: '🎬' }, ticketLink: 'https://tickets.cy/cinema-night',     source: 'Coca-Cola Arena' },
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

        <View style={s.bottomBar}>
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

function HomeTab({ city, setCityOpen, feedFilter, setFeedFilter, onEventPress, joinedEvents, onJoin, userInterests }: any) {
  const allCityEvents = MOCK_EVENTS.filter(e => e.city === city)

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
  const closeJoinSheet = () => setJoinSheet(prev => ({ ...prev, visible: false }))

  const confirmJoin = () => {
    onJoin(joinSheet.ev)
    closeJoinSheet()
  }

  const getJoinState = (ev: any) => {
    if (ev.participantsCount >= ev.maxParticipants) return 'full'
    return joinedEvents?.[ev.id] || 'none'
  }

  const JoinButton = ({ ev, large }: { ev: any; large?: boolean }) => {
    const state = getJoinState(ev)
    const isFull = state === 'full'
    const joinLabel = ev.type === 'official' ? "I'm Going" : 'Join →'
    const label = isFull ? 'Full' : state === 'joined' ? 'Joined ✓' : state === 'pending' ? 'Pending…' : joinLabel
    const bg = isFull ? 'rgba(255,255,255,0.10)' : state !== 'none' ? 'rgba(99,255,180,0.22)' : 'rgba(255,255,255,0.22)'
    return (
      <TouchableOpacity
        onPress={() => { if (!isFull && state === 'none') openJoinSheet(ev); else if (!isFull) onJoin(ev) }}
        activeOpacity={isFull ? 1 : 0.75}
        style={[s.joinBtn, { backgroundColor: bg, opacity: isFull ? 0.55 : 1 }, large && { paddingHorizontal: 22, paddingVertical: 12 }]}>
        <Text style={{ fontSize: large ? 14 : 13, fontWeight: '800', color: '#fff' }}>{label}</Text>
      </TouchableOpacity>
    )
  }

  // ── Format & Transport options ────────────────────────────────────────────
  const FORMAT_OPTIONS = [
    { id: '1+1',   emoji: '💑', label: 'Duo',   sub: 'Just the two of us' },
    { id: 'squad', emoji: '🫂', label: 'Squad',  sub: 'Up to 5 people' },
    { id: 'party', emoji: '🎉', label: 'Party',  sub: 'The more the merrier' },
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
            <TouchableOpacity style={s.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color="#1E1B4B" />
              <View style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#F8F7FF' }} />
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
                    {featured.seekerColors.slice(0, 4).map((c, i) => (
                      <View key={i} style={[s.avatarDot, { backgroundColor: c, marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }]}>
                        <Ionicons name="person" size={11} color="rgba(255,255,255,0.9)" />
                      </View>
                    ))}
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginLeft: 10, fontWeight: '600' }}>
                      {featured.seekingCount} looking for company
                    </Text>
                  </View>
                  <JoinButton ev={featured} />
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
                <TouchableOpacity key={ev.id} onPress={() => onEventPress(ev)} activeOpacity={0.85} style={s.compactCard}>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                      {ev.seekerColors.slice(0, 3).map((c, i) => (
                        <View key={i} style={[s.avatarDotSm, { backgroundColor: c, marginLeft: i > 0 ? -5 : 0 }]} />
                      ))}
                      <Text style={{ fontSize: 10, color: '#6366F1', marginLeft: 6, fontWeight: '700' }}>{ev.seekingCount} in</Text>
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
                <TouchableOpacity key={ev.id} onPress={() => onEventPress(ev)} activeOpacity={0.88} style={s.listCard}>
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
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(10,8,30,0.55)' }} activeOpacity={1} onPress={closeJoinSheet} />
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
                        <Text style={[s.joinSheetCardLabel, active && { color: '#6366F1' }]}>{opt.label}
                          <Text style={{ color: '#94A3B8', fontWeight: '400', fontSize: 12 }}>  {opt.id === '1+1' ? '1+1' : opt.id === 'squad' ? '≤5' : '≤20'}</Text>
                        </Text>
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
      </Modal>

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

function FeedScreen({ userData = {} }: { userData?: any }) {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'messages' | 'profile'>('home')
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<string | null>(null)
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

  const [joinedEvents, setJoinedEvents] = useState<Record<number, 'pending' | 'joined'>>({})

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
          {activeTab === 'home' && <HomeTab city={city} setCityOpen={setCityOpen} feedFilter={feedFilter} setFeedFilter={setFeedFilter} onEventPress={setEventDetail} joinedEvents={joinedEvents} onJoin={handleJoinEvent} userInterests={userData?.interests || []} />}
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
            { id: 'home',     icon: 'home',           label: 'Home' },
            { id: 'search',   icon: 'search',          label: 'Explore' },
          ] as const).map(tab => (
            <TouchableOpacity key={tab.id} style={s.navItem} onPress={() => setActiveTab(tab.id)}>
              <Feather name={tab.icon} size={22} color={activeTab === tab.id ? '#6366F1' : '#94A3B8'} />
              <Text style={[s.navLabel, activeTab === tab.id && { color: '#6366F1' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}

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
            <TouchableOpacity key={tab.id} style={s.navItem} onPress={() => setActiveTab(tab.id)}>
              <Feather name={tab.icon} size={22} color={activeTab === tab.id ? '#6366F1' : '#94A3B8'} />
              <Text style={[s.navLabel, activeTab === tab.id && { color: '#6366F1' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create event modal */}
        <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(15,12,41,0.55)' }} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.createSheet}>
            <View style={s.bentoSheetHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366F1', letterSpacing: 1, textTransform: 'uppercase' }}>Step 1 of 3</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(100,116,139,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={15} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5, marginBottom: 18 }}>What's the vibe? 👀</Text>

            {/* Progress bar */}
            <View style={{ height: 3, backgroundColor: '#E2E8F0', borderRadius: 99, marginBottom: 20 }}>
              <View style={{ width: '33%', height: '100%', backgroundColor: '#6366F1', borderRadius: 99 }} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {CREATE_EVENT_TYPES.map(t => (
                <TouchableOpacity key={t.id} onPress={() => setCreateType(t.id)} activeOpacity={0.8}
                  style={[s.createTypeCard, createType === t.id && s.createTypeCardOn]}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{t.emoji}</Text>
                  <Text style={[s.createTypeLabel, createType === t.id && { color: '#6366F1', fontWeight: '700' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[s.btnPrimary, !createType && { opacity: 0.4 }, createType && { shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }]}
              disabled={!createType}
              onPress={() => Alert.alert('Coming soon', 'Step 2 — date, time & location is coming next!')}>
              <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Continue →</Text>
            </TouchableOpacity>
          </View>
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

              {/* Organizer Block (Official only) */}
              {eventDetail.type === 'official' && eventDetail.organizer && (
                <View style={s.organizerBlock}>
                  <View style={s.organizerLogoWrap}>
                    <Text style={{ fontSize: 22 }}>{eventDetail.organizer.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E1B4B' }}>{eventDetail.organizer.name}</Text>
                    {eventDetail.source && (
                      <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Source: {eventDetail.source}</Text>
                    )}
                  </View>
                  <View style={s.orgVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#6366F1" />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#6366F1', marginLeft: 3 }}>Verified</Text>
                  </View>
                </View>
              )}

              {/* Get Tickets button */}
              {eventDetail.ticketLink && (
                <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}>
                  <TouchableOpacity
                    style={s.ticketBtn}
                    onPress={() => Linking.openURL(eventDetail.ticketLink)}
                    activeOpacity={0.8}>
                    <Ionicons name="ticket-outline" size={16} color="#6366F1" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#6366F1' }}>Get Tickets 🎫</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3 }}>
                  {eventDetail.type === 'official' ? 'Find your buddy for this event' : 'People going to this event'}
                </Text>
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
  bottomBar: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 8, gap: 10 },

  // Feed bottom nav
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 10, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  navCreateBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#fff', marginTop: -24, alignItems: 'center', justifyContent: 'center', shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  navCreateGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  createSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, maxHeight: '80%' },
  createTypeCard: { width: (W - 40 - 30) / 3, aspectRatio: 1, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
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
  joinBtn: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 99, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  compactCard: { width: 152, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  compactCardGrad: { height: 88, alignItems: 'center', justifyContent: 'center' },
  compactCardBody: { padding: 10 },
  compactCardTitle: { fontSize: 12, fontWeight: '700', color: '#1E1B4B', lineHeight: 17 },
  compactCardTime: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
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
