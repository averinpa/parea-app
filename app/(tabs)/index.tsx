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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'

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
  '💃 Dance', '📚 Books', '💻 IT', '🎮 Gaming', '📷 Photography',
  '🎭 Theatre', '🏖️ Beach', '🎲 Board Games', '🎤 Concerts', '🏊 Swimming',
  '🏓 Padel', '✂️ Crafts', '👗 Fashion', '🏄 Water Sports',
]

const INTERESTS_BY_CATEGORY = [
  { id: 'social',  label: 'Social & Style',     emoji: '🌙', items: ['🍷 Wine', '🎤 Concerts', '💃 Dance', '☕ Coffee', '🍕 Foodie', '👗 Fashion'] },
  { id: 'active',  label: 'Sport & Outdoors',   emoji: '🌿', items: ['🏓 Padel', '🎾 Tennis', '🥾 Hiking', '🧘 Yoga', '🏊 Swimming', '🏄 Water Sports'] },
  { id: 'creative',label: 'Creative',           emoji: '🎨', items: ['🎨 Art', '✂️ Crafts', '📷 Photography', '🎸 Music', '📚 Books'] },
  { id: 'tech',    label: 'Tech & Culture',     emoji: '💡', items: ['💻 IT', '🎮 Gaming', '🎬 Movies', '🎭 Theatre', '🎲 Board Games'] },
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
  '🎸 Music': 'music', '✈️ Travel': 'outdoors', '🏓 Padel': 'sports', '✂️ Crafts': 'culture',
  '👗 Fashion': 'culture', '💻 IT': 'tech', '🏄 Water Sports': 'outdoors',
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
  { id: 1,  name: 'Elena',   age: 27, langs: ['en', 'el'], transport: 'car',  format: '1+1',   color: '#818CF8', photo: 'https://i.pravatar.cc/300?img=47', bio: 'Love exploring local spots 🌿 Cyprus local, always up for something new',          interests: ['outdoors', 'food', 'culture'], drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 2,  name: 'Dmitri',  age: 31, langs: ['ru', 'en'], transport: 'lift', format: 'squad', color: '#4CAF50', photo: 'https://i.pravatar.cc/300?img=12', bio: 'IT engineer, moved here from Moscow 🇷🇺 Looking for people to explore the island', interests: ['tech', 'gaming', 'food'],     drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 3,  name: 'Sarah',   age: 24, langs: ['en', 'de'], transport: 'meet', format: '1+1',   color: '#2196F3', photo: 'https://i.pravatar.cc/300?img=32', bio: 'Expat from Berlin 🌊 Obsessed with sunsets and good coffee',                       interests: ['coffee', 'culture', 'music'], drinksPref: 'Non-drinker',    smokingPref: 'Non-smoker' },
  { id: 4,  name: 'Yael',    age: 29, langs: ['he', 'en'], transport: 'car',  format: 'party', color: '#9C27B0', photo: 'https://i.pravatar.cc/300?img=25', bio: 'Tel Aviv → Limassol 🌞 Digital nomad, loves big groups and good vibes',           interests: ['music', 'food', 'outdoors'], drinksPref: 'Social drinker', smokingPref: 'Social' },
  { id: 5,  name: 'Marcus',  age: 34, langs: ['de', 'en'], transport: 'lift', format: 'squad', color: '#FF9800', photo: 'https://i.pravatar.cc/300?img=8',  bio: 'Freelance designer from Hamburg 🎨 Here for the winter, looking for adventure',  interests: ['culture', 'outdoors', 'wine'], drinksPref: 'Wine lover',   smokingPref: 'Non-smoker' },
  { id: 6,  name: 'Anya',    age: 26, langs: ['ru', 'uk'], transport: 'car',  format: 'squad', color: '#EC4899', photo: 'https://i.pravatar.cc/300?img=5',  bio: 'Ukrainian in Limassol 🌻 Love cozy places and spontaneous adventures',           interests: ['food', 'coffee', 'culture'],  drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 7,  name: 'Tom',     age: 28, langs: ['en'],       transport: 'meet', format: '1+1',   color: '#0EA5E9', photo: 'https://i.pravatar.cc/300?img=15', bio: 'British expat, been here 2 years 🇬🇧 Gym, beaches, and brunch',                  interests: ['sports', 'food', 'outdoors'], drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 8,  name: 'Naomi',   age: 32, langs: ['en', 'he'], transport: 'car',  format: 'squad', color: '#10B981', photo: 'https://i.pravatar.cc/300?img=56', bio: 'Product manager, yoga enthusiast 🧘 Looking for mindful connections',            interests: ['sports', 'culture', 'coffee'], drinksPref: 'Non-drinker', smokingPref: 'Non-smoker' },
  { id: 9,  name: 'Luca',    age: 23, langs: ['en', 'de'], transport: 'meet', format: 'party', color: '#F59E0B', photo: 'https://i.pravatar.cc/300?img=3',  bio: 'Student exchange in Nicosia 🎓 Party animal, always up for fun',               interests: ['music', 'gaming', 'food'],    drinksPref: 'Party drinker',  smokingPref: 'Social' },
  { id: 10, name: 'Marina',  age: 30, langs: ['ru', 'el'], transport: 'lift', format: 'squad', color: '#8B5CF6', photo: 'https://i.pravatar.cc/300?img=44', bio: 'Half Greek half Russian, born in Paphos 🌊 Love my island life',                 interests: ['outdoors', 'food', 'wine'],   drinksPref: 'Wine lover',    smokingPref: 'Non-smoker' },
  { id: 11, name: 'Alex',    age: 25, langs: ['en', 'ru'], transport: 'car',  format: 'squad', color: '#EF4444', photo: 'https://i.pravatar.cc/300?img=11', bio: 'Software dev by day, beach bum by night 🏄 Love tech meetups and sunsets',      interests: ['tech', 'outdoors', 'coffee'], drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 12, name: 'Sofia',   age: 28, langs: ['el', 'en'], transport: 'meet', format: 'squad', color: '#F97316', photo: 'https://i.pravatar.cc/300?img=48', bio: 'Greek Cypriot, proud local 🇨🇾 Showing expats the real Cyprus',                  interests: ['food', 'culture', 'outdoors'],drinksPref: 'Wine lover',    smokingPref: 'Non-smoker' },
  { id: 13, name: 'Pavel',   age: 33, langs: ['ru', 'en'], transport: 'car',  format: 'party', color: '#06B6D4', photo: 'https://i.pravatar.cc/300?img=13', bio: 'Entrepreneur from St. Petersburg 🚀 Always looking for interesting people',      interests: ['tech', 'food', 'wine'],       drinksPref: 'Social drinker', smokingPref: 'Social' },
  { id: 14, name: 'Mia',     age: 22, langs: ['en', 'fr'], transport: 'lift', format: '1+1',   color: '#A855F7', photo: 'https://i.pravatar.cc/300?img=49', bio: 'French student doing Erasmus in Cyprus ☀️ Here for good times and beaches',    interests: ['coffee', 'music', 'culture'], drinksPref: 'Social drinker', smokingPref: 'Social' },
  { id: 15, name: 'Artem',   age: 29, langs: ['uk', 'en'], transport: 'meet', format: 'squad', color: '#84CC16', photo: 'https://i.pravatar.cc/300?img=6',  bio: 'Ukrainian architect in Limassol 🏗️ Exploring the island one beach at a time',  interests: ['culture', 'outdoors', 'sports'],drinksPref: 'Rarely',       smokingPref: 'Non-smoker' },
  { id: 16, name: 'Hana',    age: 26, langs: ['he', 'en'], transport: 'car',  format: 'squad', color: '#F43F5E', photo: 'https://i.pravatar.cc/300?img=50', bio: 'Israeli photographer living her best life in Cyprus 📷',                         interests: ['culture', 'food', 'outdoors'],drinksPref: 'Non-drinker',   smokingPref: 'Non-smoker' },
  { id: 17, name: 'Ben',     age: 31, langs: ['en'],       transport: 'car',  format: 'party', color: '#0891B2', photo: 'https://i.pravatar.cc/300?img=14', bio: 'Australian expat, crypto guy 🦘 Big fan of outdoor activities and good food',    interests: ['sports', 'tech', 'food'],     drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 18, name: 'Olga',    age: 35, langs: ['ru', 'de'], transport: 'meet', format: 'squad', color: '#7C3AED', photo: 'https://i.pravatar.cc/300?img=38', bio: 'Marketing director, relocated from Berlin 🌺 Wine lover and hiking addict',      interests: ['wine', 'outdoors', 'culture'],drinksPref: 'Wine lover',    smokingPref: 'Non-smoker' },
  { id: 19, name: 'Nikos',   age: 27, langs: ['el', 'en'], transport: 'lift', format: 'squad', color: '#059669', photo: 'https://i.pravatar.cc/300?img=7',  bio: 'Local Cypriot, love showing visitors hidden gems 💎',                           interests: ['outdoors', 'food', 'sports'], drinksPref: 'Social drinker', smokingPref: 'Social' },
  { id: 20, name: 'Kate',    age: 24, langs: ['en', 'uk'], transport: 'car',  format: '1+1',   color: '#DB2777', photo: 'https://i.pravatar.cc/300?img=51', bio: 'Graphic designer from Kyiv 🎨 Coffee addict and museum lover',                   interests: ['culture', 'coffee', 'music'], drinksPref: 'Rarely',        smokingPref: 'Non-smoker' },
  { id: 21, name: 'Viktor',  age: 38, langs: ['ru', 'en'], transport: 'car',  format: 'party', color: '#B45309', photo: 'https://i.pravatar.cc/300?img=17', bio: 'Finance guy, moved from Moscow 💼 Looking for active lifestyle and good company',interests: ['sports', 'wine', 'food'],     drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 22, name: 'Lea',     age: 23, langs: ['de', 'en'], transport: 'meet', format: 'squad', color: '#0D9488', photo: 'https://i.pravatar.cc/300?img=52', bio: 'German student, loves yoga and vegan food 🧘',                                    interests: ['sports', 'coffee', 'culture'],drinksPref: 'Non-drinker',   smokingPref: 'Non-smoker' },
  { id: 23, name: 'Sasha',   age: 30, langs: ['ru', 'uk'], transport: 'lift', format: 'squad', color: '#7C3AED', photo: 'https://i.pravatar.cc/300?img=18', bio: 'IT project manager from Kharkiv 💻 Board games and craft beer enthusiast',        interests: ['gaming', 'tech', 'food'],     drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 24, name: 'Anna',    age: 27, langs: ['en', 'fr'], transport: 'car',  format: 'squad', color: '#E11D48', photo: 'https://i.pravatar.cc/300?img=53', bio: 'French-British expat 🥐 Foodie, runner, always up for brunch',                   interests: ['food', 'sports', 'coffee'],   drinksPref: 'Social drinker', smokingPref: 'Non-smoker' },
  { id: 25, name: 'Chris',   age: 32, langs: ['en', 'el'], transport: 'meet', format: 'party', color: '#EA580C', photo: 'https://i.pravatar.cc/300?img=19', bio: 'Half Cypriot, half British 🌊 DJ on weekends, dev during the week',              interests: ['music', 'tech', 'outdoors'],  drinksPref: 'Social drinker', smokingPref: 'Social' },
]

// Score a join requester's compatibility with the host (0–100)
function scoreRequesterForHost(
  req: { langs?: string[]; age?: number; drinksPref?: string; smokingPref?: string; interests?: string[] },
  host: { langs?: string[]; age?: string | number; drinksPref?: string; smokingPref?: string; interests?: string[] },
  eventCategory?: string
): number {
  let score = 0
  // Language overlap (30 pts)
  const reqLangs = req.langs || []
  const hostLangs = host.langs || []
  const langOverlap = reqLangs.filter(l => hostLangs.includes(l)).length
  score += Math.min(30, langOverlap * 18)
  // Age proximity (25 pts)
  const hAge = typeof host.age === 'string' ? parseInt(host.age || '25') : (host.age || 25)
  const ageDiff = Math.abs((req.age || 25) - hAge)
  score += ageDiff <= 3 ? 25 : ageDiff <= 7 ? 18 : ageDiff <= 12 ? 10 : 3
  // Lifestyle match (25 pts)
  if (!host.drinksPref || req.drinksPref === host.drinksPref) score += 13
  if (!host.smokingPref || req.smokingPref === host.smokingPref) score += 12
  // Interests overlap (20 pts)
  const reqI = req.interests || []
  const hostI = host.interests || []
  const overlap = reqI.filter(i => hostI.includes(i)).length
  if (overlap >= 2) score += 20
  else if (overlap === 1) score += 12
  else if (eventCategory && reqI.includes(eventCategory)) score += 8
  return Math.min(100, score)
}

const FORMAT_BADGE: Record<string, { color: string; label: string }> = {
  '1+1':   { color: '#f472b6', label: '1+1' },
  'squad': { color: '#818CF8', label: 'Squad' },
  'party': { color: '#fb923c', label: 'Party' },
}

const MOCK_CHATS: any[] = []

const MOCK_MESSAGES: Record<number, Array<{ from: string; text: string; time: string; senderName?: string; senderPhoto?: string; senderColor?: string }>> = {}

// ─── AI COMPANION MATCHING ────────────────────────────────────────────────────

type MatchResult = { id: number; score: number; reason: string }

async function aiMatchCompanions(
  user: {
    interests: string[]; bio: string; age: string | number; langs: string[]
    musicGenres?: string[]; drinksPref?: string; smokingPref?: string
    socialEnergy?: string; dealbreakers?: string[]; eventContext?: string
  },
  candidates: Array<{
    id: number; name: string; age: number; bio: string
    interests: string[]; langs: string[]
    smokingPref?: string; drinksPref?: string
    musicGenres?: string[]; hasPets?: boolean
  }>
): Promise<MatchResult[]> {
  if (candidates.length === 0) return []

  // ── Hard pre-filters based on dealbreakers ──────────────────────────────
  const db = user.dealbreakers || []
  const disqualifiedIds = new Set<number>()
  candidates.forEach(c => {
    if (db.includes('no_smoking') && (c.smokingPref === 'Smoker' || c.smokingPref === 'Social')) disqualifiedIds.add(c.id)
    if (db.includes('sober_only') && c.drinksPref === 'Social drinker') disqualifiedIds.add(c.id)
    if (db.includes('pets_allergy') && c.hasPets) disqualifiedIds.add(c.id)
  })
  const eligible = candidates.filter(c => !disqualifiedIds.has(c.id))
  const blocked = candidates.filter(c => disqualifiedIds.has(c.id)).map(c => ({ id: c.id, score: 0, reason: 'Not compatible' }))

  if (!ANTHROPIC_KEY || eligible.length === 0) {
    return [...eligible.map(c => ({ id: c.id, score: 50, reason: 'Ready to connect' })), ...blocked]
  }

  try {
    const energyLabel = { homebody: 'Homebody', chill: 'Chill vibes', balanced: 'Balanced', social: 'Social butterfly', party: 'Party animal' }
    const candidatesList = eligible.map((c, i) =>
      `${i + 1}. ${c.name} (${c.age}yo): interests=[${c.interests.join(', ')}], music=[${(c.musicGenres || []).join(', ') || 'any'}], drinks=${c.drinksPref || '?'}, smoking=${c.smokingPref || '?'}, bio="${c.bio}", langs=[${c.langs.join(', ')}]`
    ).join('\n')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are an AI companion matching system for Parea, a social app in Cyprus.
${user.eventContext ? `\nEvent context: ${user.eventContext}\nMatch specifically for this event — prioritize candidates who would enjoy this type of activity.\n` : ''}
User profile (tonight's vibe):
- Age: ${user.age}
- Interests: ${user.interests.join(', ') || 'not set'}
- Music taste: ${(user.musicGenres || []).join(', ') || 'any'}
- Drinks: ${user.drinksPref || 'not specified'}
- Smoking: ${user.smokingPref || 'not specified'}
- Social energy right now: ${(energyLabel as any)[user.socialEnergy || ''] || 'balanced'}
- Languages: ${user.langs.join(', ') || 'en'}
- Bio: "${user.bio || 'no bio'}"

Eligible candidates (hard limits already filtered out):
${candidatesList}

Score each candidate 0-100 for companion compatibility.${user.eventContext ? ' Boost score for candidates whose interests align with the event context.' : ''} Weigh: shared interests & music taste (40%), lifestyle compatibility (25%), language overlap (20%), age proximity (15%). Lifestyle = compatible habits, not identical. Return ONLY valid JSON, no other text:
[{"id": <number>, "score": <0-100>, "reason": "<max 5 words, event-specific if possible>"}]`,
        }],
      }),
    })
    const data = await res.json()
    const text = data?.content?.[0]?.text?.trim() || '[]'
    const parsed: MatchResult[] = JSON.parse(text)
    return [...parsed.sort((a, b) => b.score - a.score), ...blocked]
  } catch {
    return [...eligible.map(c => ({ id: c.id, score: 50, reason: 'Ready to connect' })), ...blocked]
  }
}

// ─── IMAGE SAFETY ─────────────────────────────────────────────────────────────

async function isImageSafe(base64: string): Promise<boolean> {
  if (!ANTHROPIC_KEY) return true
  // Can't check without image data — skip moderation
  if (!base64 || base64.length < 100) return true
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 16,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          { type: 'text', text: 'Carefully examine this image. Does it contain any of the following: nudity, partial nudity, exposed genitals, exposed breasts, sexually explicit content, or any person who appears to be under 18 years old? Answer YES or NO only. When in doubt, answer YES.' },
        ]}],
      }),
    })
    const data = await res.json()
    // If API returned an error (no content/credits), allow the photo
    if (!data?.content?.[0]?.text) return true
    const answer = data.content[0].text.trim().toUpperCase()
    return !answer.startsWith('YES')
  } catch { return true }  // Allow on network error — don't block users if API is unreachable
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

function RegistrationScreen({ onBack, onSendOtp }: { onBack: () => void; onSendOtp: (method: 'email' | 'phone', credential: string) => void }) {
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

  const handleContinue = async () => {
    if (!isValid || isChecking) return
    setIsChecking(true)
    try {
      if (tab === 'email') {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
        if (error) { Alert.alert('Error', error.message); setIsChecking(false); return }
        onSendOtp('email', email.trim())
      } else {
        const fullPhone = `${country.code}${localPhone.replace(/\D/g, '')}`
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone })
        if (error) { Alert.alert('Error', error.message + '\n\nPhone OTP requires Twilio setup in Supabase dashboard.'); setIsChecking(false); return }
        onSendOtp('phone', fullPhone)
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong')
      setIsChecking(false)
    }
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

function OTPScreen({ onBack, onVerify, method, credential }: { onBack: () => void; onVerify: (userId: string) => void; method: 'email' | 'phone'; credential: string }) {
  const [code, setCode] = useState('')
  const [seconds, setSeconds] = useState(59)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const shakeAnim = useRef(new Animated.Value(0)).current

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

  const handleVerify = async () => {
    const token = code.trim()
    if (!token || isVerifying) return
    setIsVerifying(true)
    try {
      const { data, error: err } = method === 'email'
        ? await supabase.auth.verifyOtp({ email: credential, token, type: 'email' })
        : await supabase.auth.verifyOtp({ phone: credential, token, type: 'sms' })
      if (err) {
        setError('Wrong code. Please try again.')
        shake()
        setCode('')
      } else {
        onVerify(data.user!.id)
      }
    } catch (e: any) {
      setError('Verification failed. Try again.')
    }
    setIsVerifying(false)
  }

  const handleResend = async () => {
    setSeconds(59); setCanResend(false); setCode(''); setError('')
    if (method === 'email') await supabase.auth.signInWithOtp({ email: credential })
    else await supabase.auth.signInWithOtp({ phone: credential })
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
          <Text style={[s.authTitle, { marginBottom: 12 }]}>Check your {method === 'email' ? 'email' : 'phone'}</Text>
          <Text style={[s.authSub, { marginBottom: 40 }]}>Enter the code sent to{'\n'}{credential}</Text>

          <Animated.View style={{ width: '100%', transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              style={[s.glassInput, { fontSize: 28, fontWeight: '800', letterSpacing: 6, textAlign: 'center', color: '#1E1B4B', borderWidth: error ? 1.5 : 0, borderColor: error ? '#EF4444' : 'transparent' }]}
              value={code}
              onChangeText={v => { setCode(v.replace(/\D/g, '')); setError('') }}
              keyboardType="number-pad"
              autoFocus
              placeholder="——————"
              placeholderTextColor="#CBD5E1"
              maxLength={10}
            />
          </Animated.View>

          {error ? (
            <Text style={{ fontSize: 13, color: '#EF4444', marginTop: 10, fontWeight: '500' }}>{error}</Text>
          ) : <View style={{ height: 23 }} />}

          <View style={{ marginTop: 16 }}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={{ fontSize: 14, color: '#818CF8', fontWeight: '600' }}>Resend code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 14, color: '#94A3B8' }}>Resend code in 00:{String(seconds).padStart(2, '0')}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[s.btnPrimary, { width: '100%', marginTop: 40, backgroundColor: code.length >= 4 && !isVerifying ? '#6366F1' : 'rgba(99,102,241,0.35)', shadowColor: '#6366F1', shadowOpacity: code.length >= 4 ? 0.45 : 0, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: code.length >= 4 ? 8 : 0 }]}
            onPress={handleVerify} disabled={code.length < 4 || isVerifying}>
            {isVerifying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Verify</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── ONBOARDING SCREEN ────────────────────────────────────────────────────────

const MUSIC_GENRES = [
  { id: 'rock',       label: 'Rock',        emoji: '🎸', colors: ['#1a0505', '#c0392b'] as const },
  { id: 'electronic', label: 'Electronic',  emoji: '🎧', colors: ['#0d0221', '#6c3fc5'] as const },
  { id: 'hiphop',     label: 'Hip-hop',     emoji: '🎤', colors: ['#0a0a0a', '#e67e22'] as const },
  { id: 'pop',        label: 'Pop',         emoji: '🎵', colors: ['#1a0020', '#e91e8c'] as const },
  { id: 'jazz',       label: 'Jazz',        emoji: '🎷', colors: ['#1c0f00', '#c8890a'] as const },
  { id: 'rnb',        label: 'R&B',         emoji: '🎶', colors: ['#12001f', '#9b59b6'] as const },
  { id: 'classical',  label: 'Classical',   emoji: '🎻', colors: ['#0a1020', '#2471a3'] as const },
  { id: 'metal',      label: 'Metal',       emoji: '🤘', colors: ['#0a0a0a', '#555']    as const },
  { id: 'indie',      label: 'Indie',       emoji: '🌿', colors: ['#0a1a0a', '#2e7d32'] as const },
  { id: 'reggae',     label: 'Reggae',      emoji: '🌴', colors: ['#0a1500', '#558b2f'] as const },
  { id: 'latin',      label: 'Latin',       emoji: '💃', colors: ['#1a0a00', '#d84315'] as const },
  { id: 'house',      label: 'House',       emoji: '🎹', colors: ['#050520', '#0288d1'] as const },
  { id: 'techno',     label: 'Techno',      emoji: '⚙️', colors: ['#050505', '#424242'] as const },
  { id: 'country',    label: 'Country',     emoji: '🤠', colors: ['#1a1000', '#a0522d'] as const },
  { id: 'punk',       label: 'Punk',        emoji: '✊', colors: ['#0f0010', '#ad1457'] as const },
  { id: 'soul',       label: 'Soul',        emoji: '🕯️', colors: ['#1a0505', '#bf360c'] as const },
]

const SOCIAL_ENERGY = [
  { id: 'homebody',   label: 'Homebody',         emoji: '🌙' },
  { id: 'chill',      label: 'Chill vibes',       emoji: '🛋️' },
  { id: 'balanced',   label: 'Balanced',          emoji: '😊' },
  { id: 'social',     label: 'Social butterfly',  emoji: '🎉' },
  { id: 'party',      label: 'Party animal',      emoji: '🔥' },
]

const DEALBREAKERS = [
  { id: 'no_smoking',   emoji: '🚭', label: 'No smoking',        desc: "Can't be around smoke" },
  { id: 'sober_only',   emoji: '🥛', label: 'Prefer sober',      desc: 'No heavy drinking' },
  { id: 'no_drugs',     emoji: '🌿', label: 'No drug use',        desc: 'Hard limit for me' },
  { id: 'pets_allergy', emoji: '🐾', label: 'Pet allergy',        desc: "Can't be near pets" },
  { id: 'no_loud',      emoji: '🔇', label: 'No loud events',     desc: 'Prefer calm venues' },
  { id: 'no_kids',      emoji: '👶', label: 'Adults only',        desc: 'No kids around' },
]

function OnboardingScreen({ onBack, onFinish }: { onBack: () => void; onFinish: (data: any) => void }) {
  const insets = useSafeAreaInsets()
  const TOTAL = 5
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [dobDay, setDobDay] = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobYear, setDobYear] = useState('')
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
  const [musicGenres, setMusicGenres] = useState<string[]>([])
  const [drinksPref, setDrinksPref] = useState('')
  const [smokingPref, setSmokingPref] = useState('')
  const [petsPref, setPetsPref] = useState('')
  const [socialEnergy, setSocialEnergy] = useState('')
  const [dealbreakers, setDealbreakers] = useState<string[]>([])
  const [vibeTab, setVibeTab] = useState<'music' | 'vibe' | 'limits'>('music')
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
  const dobMonthRef = useRef<TextInput>(null)
  const dobYearRef = useRef<TextInput>(null)

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

  const dobFilled = dobDay.length === 2 && dobMonth.length === 2 && dobYear.length === 4
  const dobAgeNum = (() => {
    if (!dobFilled) return 0
    const birth = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay))
    const today = new Date()
    let a = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) a--
    return a
  })()
  const dobValid = dobFilled && dobAgeNum >= 18 && dobAgeNum <= 99

  const handleGender = (g: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setGender(g)
  }

  const animSlide = (dir = 1) => {
    slideAnim.setValue(dir * 40)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }).start()
  }

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2 && dobValid && !!gender
    if (step === 2) return photoStatus[0] === 'verified'
    if (step === 3) return interests.length > 0
    if (step === 4) return langs.length > 0
    if (step === 5) return musicGenres.length >= 1 && !!socialEnergy
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
        onFinish({ name, age: String(dobAgeNum || ageNum), gender, photos, bio, interests, langs, musicGenres, drinksPref, smokingPref, petsPref, socialEnergy, dealbreakers })
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
  // Expected: return 'verified' | 'blocked' | 'error'
  const verifyPhoto = (imageUri: string, base64: string): Promise<'verified' | 'blocked' | 'error'> =>
    new Promise(resolve =>
      setTimeout(async () => {
        const isTestFail = imageUri.toLowerCase().includes('test_fail')
        if (isTestFail) { resolve('error'); return }
        const safe = await isImageSafe(base64)
        resolve(!safe ? 'blocked' : 'verified')
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

    if (result2 === 'blocked') {
      setPhotoStatus(s => { const n = [...s]; n[idx] = 'error'; return n })
      setPhotoError(e => { const n = [...e]; n[idx] = 'Photo not allowed. Please use an appropriate photo.'; return n })
      return
    }
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
                  {/* Header */}
                  <View style={{ marginBottom: 32 }}>
                    <Text style={{ fontSize: 32, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.8, lineHeight: 38 }}>
                      Hey! 👋{'\n'}Who are you?
                    </Text>
                    <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 8, lineHeight: 20 }}>
                      Your profile info · visible to others
                    </Text>
                  </View>

                  {/* Name */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={s.label}>Name</Text>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 18, paddingVertical: 4, boxShadow: '0 2px 12px rgba(129,140,248,0.08)' } as any}>
                      <TextInput
                        style={{ fontSize: 17, color: '#1E1B4B', fontWeight: '600', paddingVertical: 14 }}
                        value={name}
                        onChangeText={t => setName(t.replace(/[^a-zA-ZА-Яа-яЁёÀ-ÿ\s\-']/g, ''))}
                        placeholder="Your name"
                        placeholderTextColor="#CBD5E1"
                        maxLength={30}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Date of birth */}
                  <View style={{ marginBottom: 28 }}>
                    <Text style={s.label}>Date of birth</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                      {/* DD */}
                      <View style={{ alignItems: 'center', gap: 6 }}>
                        <TextInput
                          ref={ageRef}
                          style={{ fontSize: 22, fontWeight: '700', color: '#1E1B4B', textAlign: 'center', width: 48, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: dobDay.length === 2 ? '#818CF8' : '#E2E8F0' }}
                          value={dobDay}
                          onChangeText={v => {
                            const d = v.replace(/\D/g, '').slice(0, 2)
                            setDobDay(d)
                            if (d.length === 2) dobMonthRef.current?.focus()
                          }}
                          placeholder="DD"
                          placeholderTextColor="#CBD5E1"
                          keyboardType="number-pad"
                          maxLength={2}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                      <Text style={{ fontSize: 22, color: '#CBD5E1', fontWeight: '300', paddingBottom: 8 }}>/</Text>
                      {/* MM */}
                      <View style={{ alignItems: 'center' }}>
                        <TextInput
                          ref={dobMonthRef}
                          style={{ fontSize: 22, fontWeight: '700', color: '#1E1B4B', textAlign: 'center', width: 48, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: dobMonth.length === 2 ? '#818CF8' : '#E2E8F0' }}
                          value={dobMonth}
                          onChangeText={v => {
                            const d = v.replace(/\D/g, '').slice(0, 2)
                            setDobMonth(d)
                            if (d.length === 2) dobYearRef.current?.focus()
                          }}
                          placeholder="MM"
                          placeholderTextColor="#CBD5E1"
                          keyboardType="number-pad"
                          maxLength={2}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                      <Text style={{ fontSize: 22, color: '#CBD5E1', fontWeight: '300', paddingBottom: 8 }}>/</Text>
                      {/* YYYY */}
                      <View style={{ alignItems: 'center' }}>
                        <TextInput
                          ref={dobYearRef}
                          style={{ fontSize: 22, fontWeight: '700', color: '#1E1B4B', textAlign: 'center', width: 72, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: dobYear.length === 4 ? '#818CF8' : '#E2E8F0' }}
                          value={dobYear}
                          onChangeText={v => {
                            const d = v.replace(/\D/g, '').slice(0, 4)
                            setDobYear(d)
                            if (d.length === 4) dobYearRef.current?.blur()
                          }}
                          placeholder="YYYY"
                          placeholderTextColor="#CBD5E1"
                          keyboardType="number-pad"
                          maxLength={4}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>
                    {dobFilled && (dobAgeNum < 18 || dobAgeNum > 99) && (
                      <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>
                        {dobAgeNum < 18 ? 'You must be 18 or older' : 'Please enter a valid age'}
                      </Text>
                    )}
                  </View>

                  {/* Gender */}
                  <View>
                    <Text style={s.label}>Gender</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[
                        { label: 'Male', emoji: '♂' },
                        { label: 'Female', emoji: '♀' },
                        { label: 'Non-binary', emoji: '⚧' },
                      ].map(({ label, emoji }) => (
                        <TouchableOpacity
                          key={label}
                          onPress={() => handleGender(label)}
                          style={[
                            { flex: 1, paddingVertical: 14, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)' },
                            gender === label && { backgroundColor: '#818CF8', borderColor: '#818CF8', boxShadow: '0 4px 16px rgba(129,140,248,0.65)' } as any,
                          ]}
                          activeOpacity={0.75}>
                          <Text style={{ fontSize: 16, marginBottom: 2 }}>{emoji}</Text>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: gender === label ? '#fff' : '#64748B' }}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {step === 2 && (() => {
                const mainW = (W - 48 - 10) * 0.58
                const mainH = mainW * (4 / 3)
                const smallH = (mainH - 8) / 2

                const renderSlot = (idx: number, width: number | `${number}%`, height: number) => {
                  const uri = photos[idx]
                  const isMain = idx === 0
                  const borderR = isMain ? 22 : 16
                  const statusBorder = photoStatus[idx] === 'verified' ? '#22c55e' : photoStatus[idx] === 'error' ? '#EF4444' : undefined

                  return (
                    <View key={idx}>
                      <TouchableOpacity
                        onPress={() => onPhotoPress(idx)}
                        activeOpacity={0.85}
                        style={{
                          width, height, borderRadius: borderR, overflow: 'hidden',
                          backgroundColor: 'rgba(185,208,235,0.35)',
                          borderWidth: statusBorder ? 2 : 1.5,
                          borderColor: statusBorder ?? (isMain ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.8)'),
                          borderStyle: uri ? 'solid' : 'dashed',
                        }}>
                        {photoLoading[idx] ? (
                          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <ActivityIndicator color="#6366F1" size="small" />
                            <Text style={{ fontSize: 10, color: '#818CF8', fontWeight: '600' }}>Checking...</Text>
                          </View>
                        ) : uri ? (
                          <>
                            <Animated.Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            <TouchableOpacity
                              style={{ position: 'absolute', top: 7, right: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
                              onPress={() => removePhoto(idx)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Ionicons name="close" size={13} color="#fff" />
                            </TouchableOpacity>
                            {isMain && photoStatus[0] === 'verified' && (
                              <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(34,197,94,0.88)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.5 }}>✓ MAIN</Text>
                              </View>
                            )}
                            {photoBadge[idx] && !isMain && (
                              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(34,197,94,0.85)', paddingVertical: 4, alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>✓ Verified</Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <View style={{ width: isMain ? 44 : 32, height: isMain ? 44 : 32, borderRadius: isMain ? 22 : 16, backgroundColor: 'rgba(129,140,248,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name={isMain ? 'camera-outline' : 'add'} size={isMain ? 22 : 18} color="rgba(99,102,241,0.55)" />
                            </View>
                            {isMain && <Text style={{ fontSize: 11, color: 'rgba(99,102,241,0.5)', fontWeight: '600', marginTop: 2 }}>Main photo</Text>}
                          </View>
                        )}
                      </TouchableOpacity>
                      {photoError[idx] && (
                        <Text style={{ fontSize: 10, color: '#EF4444', marginTop: 4, textAlign: 'center' }}>{photoError[idx]}</Text>
                      )}
                    </View>
                  )
                }

                return (
                  <View>
                    {/* Header */}
                    <View style={{ marginBottom: 28 }}>
                      <Text style={{ fontSize: 32, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.8, lineHeight: 38 }}>
                        Your photos ✦
                      </Text>
                      <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 8 }}>First photo is required · auto-verified</Text>
                    </View>

                    {/* Grid */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                      {renderSlot(0, mainW, mainH)}
                      <View style={{ flex: 1, gap: 8 }}>
                        {renderSlot(1, '100%', smallH)}
                        {renderSlot(2, '100%', smallH)}
                      </View>
                    </View>

                    {/* Checklist */}
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Clear face', ci: 0 },
                        { label: 'Good lighting', ci: 1 },
                        { label: 'No sunglasses', ci: 2 },
                      ].map(({ label, ci }) => {
                        const st = checklist[ci]
                        const ok = st === 'ok', bad = st === 'warn'
                        return (
                          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ok ? 'rgba(34,197,94,0.12)' : bad ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.6)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: ok ? 'rgba(34,197,94,0.35)' : bad ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.85)' }}>
                            <Text style={{ fontSize: 11 }}>{ok ? '✅' : bad ? '❌' : '·'}</Text>
                            <Text style={{ fontSize: 12, color: ok ? '#16a34a' : bad ? '#DC2626' : '#94A3B8', fontWeight: '500' }}>{label}</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                )
              })()}

              {step === 3 && (() => {
                const count = interests.length
                const aiLevel = count === 0 ? 0 : count === 1 ? 20 : count === 2 ? 40 : count === 3 ? 60 : count <= 5 ? 80 : 100
                const aiMsg = count === 0
                  ? 'Pick at least 3 for smart matching'
                  : count < 3
                  ? `${3 - count} more for better matches`
                  : count < 6
                  ? 'Good! Adding more improves accuracy'
                  : 'Your AI is ready to find your people ✦'
                const aiColor = count >= 6 ? '#22c55e' : count >= 3 ? '#818CF8' : '#CBD5E1'

                return (
                  <View>
                    {/* Header */}
                    <View style={{ marginBottom: 28 }}>
                      <Text style={{ fontSize: 32, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.8, lineHeight: 38 }}>
                        Your{'\n'}interests ✦
                      </Text>
                      <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 8 }}>
                        AI uses this to find your perfect companion
                      </Text>
                    </View>

                    {/* Categories */}
                    {INTERESTS_BY_CATEGORY.map(cat => (
                      <View key={cat.id} style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <Text style={{ fontSize: 15 }}>{cat.emoji}</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>{cat.label}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {cat.items.map(item => {
                            const on = interests.includes(item)
                            return (
                              <TouchableOpacity
                                key={item}
                                onPress={() => setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                                style={[s.chip, on && s.chipOn]}
                                activeOpacity={0.75}>
                                <Text style={[s.chipTxt, on && s.chipTxtOn]}>{item}</Text>
                              </TouchableOpacity>
                            )
                          })}
                        </View>
                      </View>
                    ))}

                    {/* AI confidence bar */}
                    <View style={{ marginTop: 8, padding: 16, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>🤖 AI Match Accuracy</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: aiColor }}>{aiLevel}%</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: 'rgba(203,213,225,0.5)', borderRadius: 99, overflow: 'hidden' }}>
                        <View style={{ height: 6, width: `${aiLevel}%` as any, backgroundColor: aiColor, borderRadius: 99 }} />
                      </View>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>{aiMsg}</Text>
                    </View>
                  </View>
                )
              })()}

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
                  {/* Header */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.8, lineHeight: 34 }}>
                      Your vibe ✦
                    </Text>
                    <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>
                      Helps AI find your perfect companion
                    </Text>
                  </View>

                  {/* Mini tab bar */}
                  {(() => {
                    const VIBE_TABS = [
                      { id: 'music', emoji: '🎵', label: 'Music',     done: musicGenres.length > 0 },
                      { id: 'vibe',  emoji: '✨', label: 'Vibe',      done: !!socialEnergy },
                      { id: 'limits',emoji: '🚫', label: 'Limits',    done: true, optional: true },
                    ]
                    return (
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                        {VIBE_TABS.map(tab => {
                          const active = vibeTab === tab.id
                          return (
                            <TouchableOpacity
                              key={tab.id}
                              onPress={() => setVibeTab(tab.id as any)}
                              activeOpacity={0.8}
                              style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14,
                                backgroundColor: active ? '#818CF8' : 'rgba(255,255,255,0.65)',
                                borderWidth: 1.5,
                                borderColor: active ? '#818CF8' : 'rgba(203,213,225,0.5)',
                                boxShadow: active ? '0 4px 12px rgba(129,140,248,0.4)' : 'none',
                              } as any}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 13 }}>{tab.emoji}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : '#64748B' }}>{tab.label}</Text>
                                {tab.done && !tab.optional && (
                                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? 'rgba(255,255,255,0.6)' : '#10B981' }} />
                                )}
                                {tab.optional && (
                                  <Text style={{ fontSize: 9, color: active ? 'rgba(255,255,255,0.6)' : '#CBD5E1', fontWeight: '600' }}>opt</Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    )
                  })()}

                  {/* ── TAB: Music ── */}
                  {vibeTab === 'music' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {MUSIC_GENRES.map(g => {
                        const on = musicGenres.includes(g.id)
                        return (
                          <TouchableOpacity
                            key={g.id}
                            onPress={() => setMusicGenres(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                            activeOpacity={0.8}
                            style={{ width: (W - 48 - 16) / 3, borderRadius: 12, overflow: 'hidden' }}>
                            <LinearGradient
                              colors={on ? g.colors : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.35)']}
                              style={{ paddingVertical: 9, alignItems: 'center', gap: 3, borderWidth: 1.5, borderRadius: 12, borderColor: on ? 'transparent' : 'rgba(255,255,255,0.85)', boxShadow: on ? `0 3px 10px ${g.colors[1]}55` : 'none' } as any}>
                              <Text style={{ fontSize: 18 }}>{g.emoji}</Text>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: on ? '#fff' : '#334155', textAlign: 'center' }}>{g.label}</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        )
                      })}
                      {musicGenres.length > 0 && (
                        <TouchableOpacity onPress={() => setVibeTab('vibe')} activeOpacity={0.85} style={{ width: '100%', marginTop: 8 }}>
                          <LinearGradient colors={['#818CF8', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 14, paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Next · Vibe</Text>
                            <Text style={{ fontSize: 14 }}>→</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* ── TAB: Vibe ── */}
                  {vibeTab === 'vibe' && (
                    <View>
                      {/* Social energy */}
                      <Text style={s.label}>Social energy</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
                        {SOCIAL_ENERGY.map(e => {
                          const on = socialEnergy === e.id
                          return (
                            <TouchableOpacity key={e.id} onPress={() => setSocialEnergy(e.id)} activeOpacity={0.8}
                              style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 14,
                                backgroundColor: on ? '#818CF8' : 'rgba(255,255,255,0.65)',
                                borderWidth: 1.5, borderColor: on ? '#818CF8' : 'rgba(255,255,255,0.85)',
                                boxShadow: on ? '0 4px 14px rgba(129,140,248,0.55)' : 'none',
                              } as any}>
                              <Text style={{ fontSize: 18, marginBottom: 3 }}>{e.emoji}</Text>
                              <Text style={{ fontSize: 9, fontWeight: '700', color: on ? '#fff' : '#94A3B8', textAlign: 'center' }}>{e.label}</Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>

                      {/* Lifestyle */}
                      <Text style={[s.label, { marginBottom: 10 }]}>Lifestyle</Text>
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden', marginBottom: 20 }}>
                        {[
                          { key: 'drinks',  label: '🍷 Alcohol',  val: drinksPref,  set: setDrinksPref,  opts: ['Social drinker', 'Rarely', "Don't drink"] },
                          { key: 'smoking', label: '🚬 Smoking',  val: smokingPref, set: setSmokingPref, opts: ['Non-smoker', 'Social', 'Smoker'] },
                          { key: 'pets',    label: '🐾 Pets',     val: petsPref,    set: setPetsPref,    opts: ['🐕 Dogs', '🐱 Cats', '❤️ Both', '🙅 None'] },
                        ].map((row, ri, arr) => (
                          <View key={row.key} style={{ paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: ri < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(203,213,225,0.4)' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 7 }}>{row.label}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                              {row.opts.map(opt => {
                                const on = row.val === opt
                                return (
                                  <TouchableOpacity key={opt} onPress={() => row.set(on ? '' : opt)}
                                    style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99,
                                      backgroundColor: on ? '#818CF8' : 'rgba(241,245,249,0.8)',
                                      borderWidth: 1.5, borderColor: on ? '#818CF8' : 'rgba(203,213,225,0.6)',
                                    } as any} activeOpacity={0.75}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: on ? '#fff' : '#64748B' }}>{opt}</Text>
                                  </TouchableOpacity>
                                )
                              })}
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Bio */}
                      <Text style={[s.label, { marginBottom: 10 }]}>One line about you · optional</Text>
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 14, paddingVertical: 4, marginBottom: 10 }}>
                        <TextInput
                          style={{ fontSize: 15, color: '#1E1B4B', paddingVertical: 11 }}
                          value={bio}
                          onChangeText={handleBioChange}
                          placeholder="e.g. Rock concerts & good coffee ☕"
                          placeholderTextColor="#CBD5E1"
                          maxLength={60}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                      <TouchableOpacity onPress={magicRewrite} disabled={magicLoading} activeOpacity={0.85}>
                        <LinearGradient colors={['#7c3aed', '#4f46e5', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={{ borderRadius: 14, paddingVertical: 12, alignItems: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' } as any}>
                          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
                            {magicLoading ? 'Writing... ✨' : '✨ Write with AI'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* ── TAB: Limits ── */}
                  {vibeTab === 'limits' && (
                    <View>
                      <Text style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16, lineHeight: 18 }}>
                        These people will never appear in your matches — no exceptions. Skip if no hard limits.
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {DEALBREAKERS.map(db => {
                          const on = dealbreakers.includes(db.id)
                          return (
                            <TouchableOpacity
                              key={db.id}
                              onPress={() => setDealbreakers(prev => prev.includes(db.id) ? prev.filter(x => x !== db.id) : [...prev, db.id])}
                              activeOpacity={0.75}
                              style={{
                                width: (W - 48 - 10) / 2,
                                flexDirection: 'row', alignItems: 'center', gap: 8,
                                paddingHorizontal: 12, paddingVertical: 12,
                                borderRadius: 16,
                                backgroundColor: on ? '#FFF1F2' : 'rgba(255,255,255,0.65)',
                                borderWidth: 1.5,
                                borderColor: on ? '#F43F5E' : 'rgba(203,213,225,0.6)',
                              } as any}
                            >
                              <Text style={{ fontSize: 22 }}>{db.emoji}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: on ? '#BE123C' : '#334155' }}>{db.label}</Text>
                                <Text style={{ fontSize: 10, color: on ? '#FDA4AF' : '#94A3B8', marginTop: 1 }}>{db.desc}</Text>
                              </View>
                              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#F43F5E', alignItems: 'center', justifyContent: 'center', opacity: on ? 1 : 0 }}>
                                <Text style={{ fontSize: 9, color: '#fff', fontWeight: '800' }}>✕</Text>
                              </View>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </View>
                  )}
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

        <View style={[s.bottomBar, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 24) + 24 : insets.bottom > 0 ? insets.bottom + 16 : 16 }]}>
          {step === TOTAL ? (
            <TouchableOpacity style={[s.bentoFinishBtn, !canNext() && { opacity: 0.5 }, canNext() && { shadowOpacity: 0.55, shadowRadius: 28, elevation: 14 }]} onPress={next} disabled={!canNext() || showConfetti} activeOpacity={0.88}>
              <BlurView intensity={40} tint="light" style={s.bentoFinishBlur}>
                <LinearGradient colors={['#a78bfa', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.bentoFinishGrad}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.3 }}>Let's slay! 🚀</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btnPrimary, !canNext() && { opacity: 0.4 }, canNext() && { shadowColor: '#818CF8', shadowOpacity: 0.6, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: 14, boxShadow: '0 8px 32px rgba(129, 140, 248, 0.7)' } as any]} onPress={next} disabled={!canNext()}>
              <Text style={[s.btnPrimaryText, { color: '#fff' }]}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────

function HomeTab({ city, setCityOpen, feedFilter, setFeedFilter, onEventPress, joinedEvents, onJoin, userInterests, setUserEventFormat, setUserEventTransport, onJoinConfirmed, pendingJoinEv, onPendingJoinConsumed, extraEvents, approvedJoiners = {}, tonightVibe, setTonightVibe, onBellPress, unreadCount, bellShake, userData }: any) {
  const insets = useSafeAreaInsets()
  const [vibeEditOpen, setVibeEditOpen] = useState(false)
  const [draftVibe, setDraftVibe] = useState(tonightVibe)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [searchQuery, setSearchQuery] = useState('')
  const [officialDbEvents, setOfficialDbEvents] = useState<any[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const now = Date.now()

  useEffect(() => {
    supabase.from('official_events').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data && data.length > 0) setOfficialDbEvents(data) })
  }, [])

  // Parse event time string → Date (for calendar matching)
  const parseEventDate = (timeStr: string): Date | null => {
    if (!timeStr) return null
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const lower = timeStr.toLowerCase()
    if (lower.startsWith('today')) return today
    if (lower.startsWith('tomorrow')) { const d = new Date(today); d.setDate(d.getDate() + 1); return d }
    // Format: "26/03/2026" or "26.03.2026" — check before day-of-week
    const dmyMatch = timeStr.match(/(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})/)
    if (dmyMatch) {
      const d = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]))
      d.setHours(0, 0, 0, 0)
      return d
    }
    // Format: "Thursday, 26 March 2026" or "26 March 2026" — check before day-of-week
    const monthMap: Record<string, number> = { january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11 }
    const longMatch = timeStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)
    if (longMatch) {
      const month = monthMap[longMatch[2].toLowerCase()]
      if (month !== undefined) {
        const d = new Date(parseInt(longMatch[3]), month, parseInt(longMatch[1]))
        d.setHours(0, 0, 0, 0)
        return d
      }
    }
    // Format: "Sat, 20:30" or "Mon" — day of week (relative)
    const dayMap: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 }
    const prefix = lower.slice(0, 3)
    if (prefix in dayMap) {
      const d = new Date(today)
      const diff = ((dayMap[prefix] - d.getDay()) + 7) % 7 || 7
      d.setDate(d.getDate() + diff)
      return d
    }
    return null
  }

  const parseEventDateTime = (timeStr: string): Date | null => {
    const date = parseEventDate(timeStr)
    if (!date) return null
    const match = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (match) {
      date.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0)
    }
    return date
  }

  const isEventPast = (timeStr: string): boolean => {
    const dt = parseEventDateTime(timeStr)
    if (!dt) return false
    return dt < new Date()
  }
  const allCityEvents = [...MOCK_EVENTS, ...(extraEvents || [])].filter(e => {
    if (e.city !== city) return false
    if (e.isHosted) return false  // host doesn't join their own event
    if (isEventPast(e.time)) return false  // hide past events
    return true
  })

  // ── Data ─────────────────────────────────────────────────────────────────
  const userCategories = (userInterests as string[]).map((i: string) => INTEREST_TO_CATEGORY[i]).filter(Boolean)

  const CAT_FILTERS = [
    { id: 'outdoors', label: '🌿 Outdoors' },
    { id: 'coffee',   label: '☕ Coffee' },
    { id: 'food',     label: '🍕 Food' },
    { id: 'culture',  label: '🎨 Culture' },
    { id: 'sports',   label: '🎾 Sports' },
    { id: 'wine',     label: '🍷 Wine' },
    { id: 'tech',     label: '💻 Tech' },
    { id: 'gaming',   label: '🎲 Gaming' },
  ]

  // Official: DB events + MOCK official fallback (if DB empty)
  const officialMock = MOCK_EVENTS.filter(e => e.city === city && e.type === 'official' && !isEventPast(e.time))
  const officialAll: any[] = officialDbEvents.length > 0
    ? officialDbEvents.map(e => ({ ...e, id: e.id + 100000, _dbId: e.id, _fromDb: true, type: 'official', time: e.time || e.date_label || '', gradient: e.gradient || ['#667eea', '#764ba2'], maxParticipants: e.capacity ?? e.max_participants ?? 100, seekerColors: e.seeker_colors || ['#818CF8', '#6366F1'], seekingCount: e.seeking_count ?? 0, participantsCount: e.participants_count ?? 0 }))
    : officialMock

  // Community: MOCK community + user-created extra events
  const communityAll = [...MOCK_EVENTS, ...(extraEvents || [])].filter(e => {
    if (e.city !== city) return false
    if (e.isHosted) return false
    if (isEventPast(e.time)) return false
    if (e.type === 'official') return false
    return true
  })

  // Apply search + category filter to community
  const communityFiltered = communityAll.filter(ev => {
    if (categoryFilter && ev.category !== categoryFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!ev.title.toLowerCase().includes(q) && !(ev.description || '').toLowerCase().includes(q)) return false
    }
    if (selectedDate) {
      const evDate = parseEventDate(ev.time)
      if (!evDate || evDate.toDateString() !== selectedDate.toDateString()) return false
    }
    return true
  })

  // Sort community: interest-matched first
  const communityEvents = userCategories.length > 0
    ? [...communityFiltered].sort((a, b) => (userCategories.includes(b.category) ? 1 : 0) - (userCategories.includes(a.category) ? 1 : 0))
    : communityFiltered

  // Apply search + date filter to official
  const officialEvents = officialAll.filter(ev => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!(ev.title || '').toLowerCase().includes(q) && !(ev.category || '').toLowerCase().includes(q)) return false
    }
    if (selectedDate) {
      const evDate = parseEventDate(ev.date_label || ev.time || '')
      if (!evDate || evDate.toDateString() !== selectedDate.toDateString()) return false
    }
    return true
  })

  // ── Join Bottom Sheet state ──────────────────────────────────────────────
  const [joinSheet, setJoinSheet] = useState<{ visible: boolean; ev: any | null; step: 1 | 2; format: string; transport: string }>(
    { visible: false, ev: null, step: 1, format: '', transport: '' }
  )

  const openJoinSheet = (ev: any) => {
    const startStep = ev?.type === 'official' ? 1 : 2
    setJoinSheet({ visible: true, ev, step: startStep, format: '', transport: '' })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  useEffect(() => {
    if (pendingJoinEv) { openJoinSheet(pendingJoinEv); onPendingJoinConsumed?.() }
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
    const approvedCount = (approvedJoiners[ev.id] || []).length
    const actualCount = ev.isHosted ? approvedCount + 1 : ev.participantsCount
    if (actualCount >= ev.maxParticipants) return 'full'
    return joinedEvents?.[ev.id] || 'none'
  }

  const JoinButton = ({ ev }: { ev: any }) => {
    const state = getJoinState(ev)
    const isFull = state === 'full'
    const label = isFull ? 'Full' : state === 'joined' ? 'Joined ✓' : state === 'pending' ? 'Requested…' : (ev.isHosted || ev.type === 'community') ? 'Request' : 'Join'
    let bg: string, textColor: string
    if (isFull)                   { bg = '#F1F5F9'; textColor = '#94A3B8' }
    else if (state === 'joined')  { bg = 'rgba(34,197,94,0.12)'; textColor = '#16a34a' }
    else if (state === 'pending') { bg = 'rgba(251,191,36,0.15)'; textColor = '#d97706' }
    else                          { bg = '#6366F1'; textColor = '#fff' }
    return (
      <TouchableOpacity
        onPress={() => { if (isFull) return; if (state === 'none' && ev.type !== 'community') openJoinSheet(ev); else if (state !== 'joined') onJoin(ev) }}
        activeOpacity={isFull ? 1 : 0.75}
        style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, backgroundColor: bg, opacity: isFull ? 0.55 : 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>{label}</Text>
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

  const userName = userData?.name?.split(' ')[0] || 'there'

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickyHeaderIndices={[0]}>

        {/* ── STICKY HEADER ── */}
        <View style={{ backgroundColor: '#F8F7FF', zIndex: 600, paddingBottom: 4 }}>
          {/* Header */}
          <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 10, gap: 10 }}>
            {/* Row 1: greeting + bell */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3 }}>Hi, {userName} 👋</Text>
              <Animated.View style={{ transform: [{ rotate: bellShake?.interpolate({ inputRange: [-12, 0, 12], outputRange: ['-18deg', '0deg', '18deg'] }) ?? '0deg' }] }}>
                <TouchableOpacity onPress={onBellPress} activeOpacity={0.85}
                  style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#6366F1', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
                  <Ionicons name="notifications-outline" size={19} color={unreadCount > 0 ? '#6366F1' : '#94A3B8'} />
                </TouchableOpacity>
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8,
                    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 2, borderColor: '#F8F7FF' }}>
                    <Text style={{ fontSize: 8, fontWeight: '900', color: '#fff' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </Animated.View>
            </View>

            {/* Row 2: city · vibe · calendar — all in one line */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* City */}
              <TouchableOpacity onPress={() => setCityOpen(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: '#EEF2FF' }}>
                <Text style={{ fontSize: 11 }}>📍</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#4338CA' }}>{city}</Text>
              </TouchableOpacity>

              {/* Separator */}
              <View style={{ width: 1, height: 14, backgroundColor: '#E2E8F0' }} />

              {/* Vibe */}
              <TouchableOpacity onPress={() => { setDraftVibe(tonightVibe); setVibeEditOpen(true) }}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99,
                  backgroundColor: tonightVibe ? '#EEF2FF' : '#F1F5F9' }}>
                {tonightVibe ? (() => {
                  const energyInfo = SOCIAL_ENERGY.find(e => e.id === tonightVibe.energy) || SOCIAL_ENERGY[2]
                  return <>
                    <Text style={{ fontSize: 12 }}>{energyInfo.emoji}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#4338CA' }}>{energyInfo.label}</Text>
                    <Feather name="chevron-down" size={11} color="#94A3B8" />
                  </>
                })() : <>
                  <Text style={{ fontSize: 12 }}>✨</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#94A3B8' }}>My Vibe</Text>
                  <Feather name="chevron-down" size={11} color="#94A3B8" />
                </>}
              </TouchableOpacity>

              {/* Separator */}
              <View style={{ width: 1, height: 14, backgroundColor: '#E2E8F0' }} />

              {/* Calendar */}
              <TouchableOpacity onPress={() => { setCalendarOpen(v => !v); if (calendarOpen) setSelectedDate(null) }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99,
                  backgroundColor: calendarOpen || selectedDate ? '#6366F1' : '#F1F5F9' }}>
                <Feather name="calendar" size={13} color={calendarOpen || selectedDate ? '#fff' : '#64748B'} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: calendarOpen || selectedDate ? '#fff' : '#64748B' }}>
                  {selectedDate ? selectedDate.toLocaleDateString('en', { day: 'numeric', month: 'short' }) : 'Calendar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search bar */}
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, height: 44, gap: 10,
              shadowColor: '#6366F1', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <Feather name="search" size={16} color="#94A3B8" />
              <TextInput
                placeholder="Find an event..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, fontSize: 14, color: '#1E1B4B' }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={15} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Inline Calendar */}
          {calendarOpen && (() => {
            const today = new Date(); today.setHours(0,0,0,0)
            const firstDay = new Date(calYear, calMonth, 1).getDay()
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
            const monthName = new Date(calYear, calMonth).toLocaleDateString('en', { month: 'long', year: 'numeric' })
            const officialDates = new Set([...officialAll, ...communityAll.filter(ev => ev.type === 'official')].map(ev => parseEventDate(ev.time || ev.date_label || '')?.toDateString()).filter(Boolean))
            const socialDates = new Set(communityAll.filter(ev => ev.type !== 'official').map(ev => parseEventDate(ev.time || '')?.toDateString()).filter(Boolean))
            const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
            while (cells.length % 7 !== 0) cells.push(null)
            return (
              <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 20, padding: 14, shadowColor: '#6366F1', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="chevron-left" size={16} color="#475569" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E1B4B' }}>{monthName}</Text>
                  <TouchableOpacity onPress={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="chevron-right" size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#94A3B8' }}>{d}</Text>
                  ))}
                </View>
                {Array.from({ length: cells.length / 7 }, (_, row) => (
                  <View key={row} style={{ flexDirection: 'row', marginBottom: 2 }}>
                    {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                      if (!day) return <View key={col} style={{ flex: 1, height: 36 }} />
                      const d = new Date(calYear, calMonth, day); d.setHours(0,0,0,0)
                      const ds = d.toDateString()
                      const isSelected = selectedDate?.toDateString() === ds
                      const isToday = today.toDateString() === ds
                      const isPast = d < today
                      const hasOfficial = officialDates.has(ds)
                      const hasSocial = socialDates.has(ds)
                      return (
                        <TouchableOpacity key={col} onPress={() => { if (!isPast) { setSelectedDate(isSelected ? null : d); setCalendarOpen(false) } }}
                          style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10,
                            backgroundColor: isSelected ? '#6366F1' : isToday ? '#EEF2FF' : 'transparent' }}>
                          <Text style={{ fontSize: 13, fontWeight: isSelected || isToday ? '800' : '500', color: isSelected ? '#fff' : isPast ? '#CBD5E1' : isToday ? '#6366F1' : '#334155' }}>{day}</Text>
                          {(hasOfficial || hasSocial) && !isPast && (
                            <View style={{ flexDirection: 'row', gap: 2, position: 'absolute', bottom: 3 }}>
                              {hasOfficial && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : '#F59E0B' }} />}
                              {hasSocial && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : '#6366F1' }} />}
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                ))}
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 10, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' }} />
                    <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Official</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1' }} />
                    <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Community</Text>
                  </View>
                </View>
              </View>
            )
          })()}
        </View>

        {/* ── OFFICIAL EVENTS ── */}
        {officialEvents.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.3 }}>✦ Official Events</Text>
              <Text style={{ fontSize: 13, color: '#6366F1', fontWeight: '700' }}>{officialEvents.length} events</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 4 }}>
              {officialEvents.map((ev: any) => (
                <TouchableOpacity key={ev.id} onPress={() => onEventPress(ev)} activeOpacity={0.88}
                  style={{ width: 210, borderRadius: 22, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#6366F1', shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
                  {/* Image or gradient */}
                  {ev.image_url ? (
                    <Image source={{ uri: ev.image_url }} style={{ width: '100%', height: 100 }} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={ev.gradient as any || ['#667eea','#764ba2']} style={{ width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 40 }}>{CATEGORY_EMOJI[ev.category] || '🎉'}</Text>
                    </LinearGradient>
                  )}
                  {/* Category badge overlay */}
                  <View style={{ position: 'absolute', top: 10, left: 10, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(30,27,75,0.65)' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.4, textTransform: 'capitalize' }}>{ev.category || 'Event'}</Text>
                  </View>
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E1B4B', marginBottom: 6, minHeight: 36 }} numberOfLines={2}>{ev.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Feather name="calendar" size={11} color="#94A3B8" />
                      <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>{ev.date_label || ev.time_label || ev.time || ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3, height: 16 }}>
                      <Feather name="map-pin" size={11} color={ev.location || ev.distance ? '#94A3B8' : 'transparent'} />
                      <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }} numberOfLines={1}>{ev.location || ev.distance || ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={() => { const st = getJoinState(ev); if (st === 'none') openJoinSheet(ev); else if (st !== 'full') onJoin(ev) }}
                        style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: '#6366F1' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>I'm Going</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── COMMUNITY ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.3 }}>👥 Community</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>{communityEvents.length} events</Text>
        </View>

        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14 }}>
          <TouchableOpacity onPress={() => setCategoryFilter(null)}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: !categoryFilter ? '#6366F1' : '#fff' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: !categoryFilter ? '#fff' : '#64748B' }}>All</Text>
          </TouchableOpacity>
          {CAT_FILTERS.map(f => {
            const isOn = categoryFilter === f.id
            return (
              <TouchableOpacity key={f.id} onPress={() => setCategoryFilter(isOn ? null : f.id)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: isOn ? '#6366F1' : '#fff' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isOn ? '#fff' : '#64748B' }}>{f.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Community event list */}
        {communityEvents.length > 0 ? (
          <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 8 }}>
            {communityEvents.map((ev: any) => {
              const filled = ev.participantsCount || 0
              const total = ev.maxParticipants || 10
              const pct = Math.min(1, filled / total)
              const free = Math.max(0, total - filled)
              return (
                <TouchableOpacity key={ev.id} onPress={() => onEventPress(ev)} activeOpacity={0.88}
                  style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#6366F1', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}>
                  {/* Top row: avatar + title + badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <LinearGradient colors={ev.gradient as any || ['#6366F1','#818CF8']}
                      style={{ width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ fontSize: 22 }}>{CATEGORY_EMOJI[ev.category] || '📍'}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E1B4B', flex: 1 }} numberOfLines={1}>{ev.title}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: '#EEF2FF' }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#4338CA', textTransform: 'capitalize' }}>{ev.category}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>{ev.organizer?.name || 'Community'}</Text>
                    </View>
                  </View>
                  {/* Date + location row */}
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Feather name="calendar" size={12} color="#94A3B8" />
                      <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>{ev.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Feather name="map-pin" size={12} color="#94A3B8" />
                      <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>{ev.distance || ev.location || 'See details'}</Text>
                    </View>
                  </View>
                  {/* Progress + join */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>{filled} of {total} spots</Text>
                        <Text style={{ fontSize: 11, color: '#6366F1', fontWeight: '700' }}>{free} free</Text>
                      </View>
                      <View style={{ height: 4, backgroundColor: '#EEF2FF', borderRadius: 99 }}>
                        <View style={{ height: 4, width: `${Math.round(pct * 100)}%` as any, backgroundColor: pct >= 0.8 ? '#EF4444' : '#6366F1', borderRadius: 99 }} />
                      </View>
                    </View>
                    <JoinButton ev={ev} />
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🌴</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>Nothing here yet</Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Try a different category or date</Text>
          </View>
        )}

      </ScrollView>

      {/* ── Vibe Edit Modal ── */}
      <Modal visible={vibeEditOpen} transparent animationType="slide" onRequestClose={() => setVibeEditOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setVibeEditOpen(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 16 }}>Tonight's vibe</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Social energy</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {SOCIAL_ENERGY.map(e => {
              const on = draftVibe?.energy === e.id
              return (
                <TouchableOpacity key={e.id} onPress={() => setDraftVibe((v: any) => ({ ...v, energy: e.id }))}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: on ? '#3730A3' : '#F1F5F9', borderWidth: on ? 0 : 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 16 }}>{e.emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: on ? '#fff' : '#475569' }}>{e.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Alcohol</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {["Don't drink", 'Rarely', 'Social drinker'].map(opt => {
              const on = draftVibe?.drinks === opt
              return (
                <TouchableOpacity key={opt} onPress={() => setDraftVibe((v: any) => ({ ...v, drinks: opt }))}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: on ? '#3730A3' : '#F1F5F9', borderWidth: on ? 0 : 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: on ? '#fff' : '#475569' }}>{opt === "Don't drink" ? '🚫' : opt === 'Rarely' ? '🥤' : '🥂'}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: on ? 'rgba(255,255,255,0.85)' : '#94A3B8', marginTop: 3 }}>{opt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Smoking</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
            {['Non-smoker', 'Social', 'Smoker'].map(opt => {
              const on = draftVibe?.smoking === opt
              return (
                <TouchableOpacity key={opt} onPress={() => setDraftVibe((v: any) => ({ ...v, smoking: opt }))}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: on ? '#3730A3' : '#F1F5F9', borderWidth: on ? 0 : 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: on ? '#fff' : '#475569' }}>{opt === 'Non-smoker' ? '🚭' : opt === 'Social' ? '🌬️' : '🚬'}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: on ? 'rgba(255,255,255,0.85)' : '#94A3B8', marginTop: 3 }}>{opt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity onPress={() => { setTonightVibe(draftVibe); setVibeEditOpen(false) }}
            style={{ backgroundColor: '#3730A3', borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save vibe</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Join Bottom Sheet ── */}
      <Modal visible={joinSheet.visible} transparent animationType="slide" onRequestClose={closeJoinSheet}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,8,30,0.75)' }} activeOpacity={1} onPress={closeJoinSheet} />
        <View style={s.joinSheetWrap}>
          <View style={s.joinSheetHandle} />

          {joinSheet.ev?.type === 'official' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2].map(n => (
                  <View key={n} style={{ width: joinSheet.step === n ? 20 : 6, height: 6, borderRadius: 3,
                    backgroundColor: joinSheet.step >= n ? '#6366F1' : 'rgba(99,102,241,0.2)' }} />
                ))}
              </View>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Step {joinSheet.step} of 2</Text>
            </View>
          )}

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
              {joinSheet.ev?.type === 'official' && (
                <TouchableOpacity onPress={() => setJoinSheet(prev => ({ ...prev, step: 1 }))}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Ionicons name="chevron-back" size={14} color="#6366F1" />
                  <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '600' }}>Back</Text>
                </TouchableOpacity>
              )}
              <Text style={s.joinSheetTitle}>{joinSheet.ev?.type === 'official' ? 'How are you getting\nthere? 🗺️' : 'How are you getting\nto the event? 🚗'}</Text>
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
              {joinSheet.ev?.isHosted && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 12, padding: 12, marginTop: 16, marginBottom: -4, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' }}>
                  <Text style={{ fontSize: 15 }}>👤</Text>
                  <Text style={{ flex: 1, fontSize: 12, color: '#92400E', lineHeight: 17 }}>Community social — the host reviews and approves requests.</Text>
                </View>
              )}
              <TouchableOpacity
                style={[s.joinSheetNext, !joinSheet.transport && { opacity: 0.4 }, joinSheet.transport && { shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }]}
                disabled={!joinSheet.transport}
                onPress={confirmJoin}>
                <Text style={s.joinSheetNextTxt}>
                  {joinSheet.ev?.isHosted ? 'Send Request →' : joinSheet.ev?.type === 'official' ? "I'm Going 🎉" : "Join Event →"}
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

function MessagesTab({ chatList, onOpenChat, onLeaveChat, joinedEvents = {}, userEventFormat = {}, userEventTransport = {}, onVibeCheck, onLeaveEvent, onUpdatePlans, initialSubTab, hostedEvents = [], approvedJoiners = {}, onCancelHostedEvent, onPlansOpen, allEvents = [], onEventDetail }: {
  chatList: any[]; onOpenChat: (c: any) => void; onLeaveChat?: (id: number, addSystemMsg?: boolean) => void;
  joinedEvents?: Record<number, string>; userEventFormat?: Record<number, string>; userEventTransport?: Record<number, string>; allEvents?: any[]; onEventDetail?: (ev: any) => void;
  onVibeCheck?: (ev: any) => void; onLeaveEvent?: (ev: any) => void; onUpdatePlans?: (ev: any) => void;
  initialSubTab?: 'going' | 'messages'; hostedEvents?: any[]; approvedJoiners?: Record<number, any[]>; onCancelHostedEvent?: (ev: any) => void; onPlansOpen?: () => void;
}) {
  const [subTab, setSubTab] = useState<'going' | 'messages'>(initialSubTab || 'going')
  const [crewSheet, setCrewSheet] = useState<{ ev: any; profiles: any[]; found: number; cap: number } | null>(null)
  const crewSheetAnim = useRef(new Animated.Value(0)).current
  const hasNew = chatList.some(c => c.isNew)
  const [memberPreview, setMemberPreview] = useState<any>(null)

  const openCrewSheet = (ev: any, profiles: any[], found: number, cap: number) => {
    setCrewSheet({ ev, profiles, found, cap })
    Animated.spring(crewSheetAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }).start()
  }
  const closeCrewSheet = () => {
    Animated.timing(crewSheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setCrewSheet(null))
  }

  const now = Date.now()
  const myEvents = [...MOCK_EVENTS, ...allEvents.filter((e: any) => e._fromDb)].filter(ev => ['joined', 'pending', 'confirmed'].includes(joinedEvents[ev.id]))
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

  const isToday = (t: string) => !!t?.startsWith('Today')
  const isTomorrow = (t: string) => !!t?.startsWith('Tomorrow')

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 52, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>{subTab === 'going' ? '🗓' : '💬'}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5 }}>
                {subTab === 'going' ? 'My Plans' : 'Chats'}
              </Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500', marginTop: 1 }}>
                {subTab === 'going'
                  ? `${myEvents.length + activeHostedEvents.length} upcoming`
                  : `${chatList.length} conversation${chatList.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
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
              onPress={() => { setSubTab(t.id); Haptics.selectionAsync(); if (t.id === 'going') onPlansOpen?.() }}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(99,102,241,0.1)' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366F1' }}>Host 👑</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            Alert.alert(`Cancel "${ev.title}"?`, 'This will delete the event and its chat.', [
                              { text: 'Cancel Event 🗑️', style: 'destructive', onPress: () => onCancelHostedEvent?.(ev) },
                              { text: 'Keep', style: 'cancel' },
                            ])
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Feather name="trash-2" size={16} color="#ef4444" />
                        </TouchableOpacity>
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
                        <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>👥 {(approvedJoiners[ev.id] || []).length + 1}/{ev.maxParticipants}</Text>
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

              // Use actual data for crew count
              const format        = userEventFormat[ev.id] || (ev.type === 'official' ? '1+1' : 'squad')
              const cap           = VIBE_FORMAT_MAX[format] || 5
              const threshold     = VIBE_FORMAT_THRESHOLD[format] || cap
              // Crew is always fully assembled (mirrors VibeCheck simulation)
              const found         = cap
              const partnersFound = cap - 1
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
                <TouchableOpacity key={ev.id} activeOpacity={0.85} onPress={() => onEventDetail?.(ev)} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 0, borderWidth: 1, borderColor: isActive ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.08)' }}>
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
                          <Text style={{ fontSize: 12, color: '#64748B' }}>⏰ {ev.time}</Text>
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
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      )}

      {/* Chats tab */}
      {subTab === 'messages' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 10, paddingBottom: 32 }}>
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
              onPress={() => onOpenChat(chat)}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                Alert.alert(
                  chat.type === 'duo' ? `Leave chat with ${chat.name}?` : `Leave "${chat.event}"?`,
                  chat.type === 'duo' ? `${chat.name} will see that your plans changed 📅` : `The group will see you've left.`,
                  [
                    { text: 'Leave', style: 'destructive', onPress: () => onLeaveChat?.(chat.id, true) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                )
              }}
              activeOpacity={0.88}
              style={{ borderRadius: 24, overflow: 'hidden' }}>
              {/* Card background — gradient tint for unread, plain for read */}
              <LinearGradient
                colors={chat.isNew
                  ? ['#EEF2FF', '#F5F0FF']
                  : ['#fff', '#FAFAFA']}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
                  borderWidth: chat.isNew ? 1.5 : 1,
                  borderColor: chat.isNew ? 'rgba(99,102,241,0.25)' : 'rgba(0,0,0,0.05)',
                  borderRadius: 24 }}>

                {/* Avatar */}
                {chat.type === 'duo' ? (
                  <View style={{ width: 54, height: 54, borderRadius: 27, overflow: 'hidden', backgroundColor: chat.color,
                    shadowColor: chat.color, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }}>
                    {chat.photo
                      ? <Image source={{ uri: chat.photo }} style={{ width: '100%', height: '100%' }} />
                      : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 24 }}>👤</Text></View>}
                  </View>
                ) : (() => {
                  const photos = (chat.avatars || []).filter(Boolean).slice(0, 2)
                  const cols = (chat.colors || ['#818CF8', '#6366F1'])
                  const gc0 = (cols[0] && typeof cols[0] === 'string') ? cols[0] : '#818CF8'
                  const gc1 = (cols[1] && typeof cols[1] === 'string') ? cols[1] : '#6366F1'
                  const totalOthers = Math.max(0, (chat.members || 1) - 1)
                  const extra = Math.max(0, totalOthers - photos.length)
                  const SZ = 42
                  const SHIFT = 22

                  if (photos.length === 0) {
                    return (
                      <LinearGradient colors={[gc0, gc1]}
                        style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', elevation: 3 }}>
                        <Text style={{ fontSize: 26 }}>{chat.eventEmoji || '🎉'}</Text>
                      </LinearGradient>
                    )
                  }

                  const containerW = SZ + (photos.length > 1 ? SHIFT : 0) + (extra > 0 ? SHIFT : 0)
                  return (
                    <View style={{ width: containerW, height: SZ, position: 'relative' }}>
                      {/* Render photos back-to-front so first is on top */}
                      {[...photos].reverse().map((photo: string, ri: number) => {
                        const ai = photos.length - 1 - ri
                        return (
                          <View key={ai} style={{
                            position: 'absolute', left: ai * SHIFT,
                            width: SZ, height: SZ, borderRadius: SZ / 2,
                            borderWidth: 2.5, borderColor: '#fff',
                            overflow: 'hidden',
                            backgroundColor: (cols[ai] && typeof cols[ai] === 'string') ? cols[ai] : '#818CF8',
                            zIndex: photos.length - ai, elevation: photos.length - ai,
                          }}>
                            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
                          </View>
                        )
                      })}
                      {extra > 0 && (
                        <View style={{
                          position: 'absolute', left: photos.length * SHIFT,
                          top: (SZ - 28) / 2,
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: '#6366F1',
                          alignItems: 'center', justifyContent: 'center',
                          borderWidth: 2.5, borderColor: '#fff',
                          zIndex: photos.length + 1, elevation: photos.length + 1,
                        }}>
                          <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff' }}>+{extra}</Text>
                        </View>
                      )}
                    </View>
                  )
                })()}

                {/* Text content */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: chat.isNew ? '#4338CA' : '#1E1B4B', letterSpacing: -0.2, flex: 1 }} numberOfLines={1}>
                      {chat.type === 'duo' ? `${chat.name}, ${chat.age}` : chat.event}
                    </Text>
                    <Text style={{ fontSize: 11, color: chat.isNew ? '#818CF8' : '#CBD5E1', fontWeight: chat.isNew ? '700' : '400', marginLeft: 8, flexShrink: 0 }}>{chat.time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Text style={{ fontSize: 13 }}>{chat.eventEmoji || '📍'}</Text>
                    <Text style={{ fontSize: 11, color: '#818CF8', fontWeight: '600' }} numberOfLines={1}>
                      {chat.type === 'duo' ? chat.event : `${chat.members} members`}
                    </Text>
                    {chat.expiresIn <= 6 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 }}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#EF4444' }} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#EF4444' }}>Expiring</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: chat.isNew ? '#475569' : '#94A3B8', fontWeight: chat.isNew ? '500' : '400' }} numberOfLines={1}>{chat.lastMsg}</Text>
                </View>

                {/* Unread dot */}
                {chat.isNew && (
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1',
                    shadowColor: '#6366F1', shadowOpacity: 0.6, shadowRadius: 4, elevation: 3 }} />
                )}
              </LinearGradient>
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

                {/* Each partner — tap to view full profile */}
                {crewSheet.profiles.map((p: any, i: number) => (
                  <TouchableOpacity key={i} activeOpacity={0.8}
                    onPress={() => {
                      setMemberPreview({
                        ...p,
                        colors: p.colors || [p.color, '#1E1B4B'],
                        langs: (p.langs || []).map((l: string) => FLAG_MAP[l] || l),
                        flag: p.flag || FLAG_MAP[p.langs?.[0]] || '🌍',
                        goal: p.goal || 'chill',
                        emoji: p.emoji || '👤',
                      })
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, backgroundColor: `${p.color}08`, borderWidth: 1, borderColor: `${p.color}20` }}>
                    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {p.photo
                        ? <Image source={{ uri: p.photo }} style={{ width: '100%', height: '100%' }} />
                        : <Text style={{ fontSize: 22 }}>{p.emoji}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>{p.name}</Text>
                        <Text style={{ fontSize: 13, color: '#64748B' }}>{p.age}</Text>
                        <Text style={{ fontSize: 14 }}>{p.flag}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18 }} numberOfLines={2}>{p.bio}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={p.color} style={{ opacity: 0.6 }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}
      {memberPreview && <ProfilePreviewSheet profile={memberPreview} onClose={() => setMemberPreview(null)} />}
    </View>
  )
}

// ─── VIBE CHECK TAB ───────────────────────────────────────────────────────────

const QUEUE_PROFILES = [
  { id: 1,  name: 'Alex',    age: 29, flag: '🇬🇧', color: '#818CF8', colors: ['#818CF8','#6366F1'], emoji: '🎾',
    photo: 'https://i.pravatar.cc/400?img=11',
    bio: 'Tennis addict & coffee snob. Love meeting new people over a good game.',
    interests: ['🎾 Tennis','☕ Coffee','💻 IT','✈️ Travel'], langs: ['en','ru'], transport: 'car',  goal: 'networking',
    smokingPref: 'Non-smoker', drinksPref: 'Social drinker', musicGenres: ['rock','indie'], hasPets: false },
  { id: 2,  name: 'Maya',    age: 26, flag: '🇷🇺', color: '#4CAF50', colors: ['#43E97B','#38f9d7'], emoji: '📚',
    bio: 'Book lover, yoga fan. Looking for chill hangouts with good vibes.',
    interests: ['🧘 Yoga','📚 Books','🎨 Art','🍷 Wine'], langs: ['ru','en','de'], transport: 'meet', goal: 'chill',
    smokingPref: 'Non-smoker', drinksPref: 'Rarely', musicGenres: ['jazz','classical','rnb'], hasPets: true },
  { id: 3,  name: 'Luca',    age: 32, flag: '🇮🇹', color: '#FF9800', colors: ['#f97316','#fbbf24'], emoji: '🍕',
    bio: 'Italian who takes food seriously. Can talk for hours about pasta.',
    interests: ['🍕 Foodie','🎸 Music','🍷 Wine','🎬 Movies'], langs: ['it','en'], transport: 'car',  goal: 'chill',
    smokingPref: 'Smoker', drinksPref: 'Social drinker', musicGenres: ['rock','metal','indie'], hasPets: false },
  { id: 4,  name: 'Sara',    age: 27, flag: '🇩🇪', color: '#2196F3', colors: ['#667eea','#764ba2'], emoji: '💻',
    bio: 'Product designer at a startup. Into hiking and padel.',
    interests: ['✂️ Crafts','🥾 Hiking','🏓 Padel','💻 IT'], langs: ['de','en','fr'], transport: 'meet', goal: 'networking',
    smokingPref: 'Non-smoker', drinksPref: "Don't drink", musicGenres: ['electronic','pop','house'], hasPets: true },
  { id: 5,  name: 'Noa',     age: 24, flag: '🇮🇱', color: '#E91E63', colors: ['#f093fb','#f5576c'], emoji: '🎵',
    bio: 'Music producer by night, beach person by day. Always down for adventures.',
    interests: ['🎸 Music','🏖️ Beach','📷 Photography','👗 Fashion'], langs: ['he','en'], transport: 'lift', goal: 'activity',
    smokingPref: 'Social', drinksPref: 'Social drinker', musicGenres: ['electronic','hiphop','rnb','pop'], hasPets: false },
  { id: 6,  name: 'Chris',   age: 31, flag: '🇨🇾', color: '#22c55e', colors: ['#134e5e','#71b280'], emoji: '🏄',
    bio: 'Local Cypriot. I know every hidden beach spot on the island.',
    interests: ['🏄 Water Sports','🏓 Padel','🥾 Hiking','☕ Coffee'], langs: ['el','en'], transport: 'car',  goal: 'activity',
    smokingPref: 'Non-smoker', drinksPref: 'Social drinker', musicGenres: ['reggae','latin','rock'], hasPets: false },
]

const VIBE_FORMAT_MAX: Record<string, number>       = { '1+1': 2, squad: 5, party: 20 }
const VIBE_FORMAT_THRESHOLD: Record<string, number> = { '1+1': 2, squad: 5, party: 12 } // party goes active at 12, cap stays 20
const VIBE_FORMAT_LABEL: Record<string, string>     = { '1+1': 'Duo · me +1', squad: 'Squad · me +4', party: 'Party · me +19' }
const GOAL_LABEL: Record<string, string>            = { chill: '😌 Chill', networking: '🤝 Networking', activity: '⚡ Activity' }

function ProfilePreviewSheet({ profile, onClose }: { profile: any; onClose: () => void }) {
  const insets = useSafeAreaInsets()
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

        <View style={{ paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom + 16, 40) }}>
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

          {/* AI Match badge */}
          {profile.aiScore != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, padding: 12, borderRadius: 16, backgroundColor: 'rgba(129,140,248,0.12)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)' }}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: profile.aiScore >= 75 ? '#43E97B' : '#818CF8' }}>
                  {profile.aiScore}% AI Match
                </Text>
                {profile.aiReason && (
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{profile.aiReason}</Text>
                )}
              </View>
            </View>
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

function SeekersListWithProfile({ vibeResults, onPass, onLike, seekers }: { vibeResults: Record<number, string>; onPass: (id: number) => void; onLike: (sk: any) => void; seekers: any[] }) {
  const [preview, setPreview] = useState<any>(null)
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {seekers.map(sk => {
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

function VibeCheckTab({ joinedEvents, allEvents, userEventFormat, userEventTransport, onGoHome, onConfirm, onLeave, hostedEvents = [], pendingJoinRequests = {}, approvedJoiners = {}, onApproveJoiner, onRejectJoiner, onPassJoiner, passedRequests = {}, userData, tonightVibe, onGoToMessages }: any) {
  // Official/concert events — shown as AI crew-finding cards
  const myEvents = (allEvents || []).filter((e: any) => joinedEvents?.[e.id] && joinedEvents[e.id] !== 'confirmed' && !e.isHosted && e.type !== 'community')
  // Community events (host-gated) — shown as request/approval cards
  const myCommunityEvents = (allEvents || []).filter((e: any) => joinedEvents?.[e.id] && joinedEvents[e.id] !== 'confirmed' && !e.isHosted && e.type === 'community')
  // User-created socials the user requested to join — shown as "awaiting approval"
  const pendingHostedEvents = (allEvents || []).filter((e: any) => joinedEvents?.[e.id] === 'pending' && e.isHosted)
  const activeHosted = (hostedEvents || []).filter((e: any) => !e.expiresAt || e.expiresAt > Date.now())
  const hasHostActivity = activeHosted.some((e: any) => (pendingJoinRequests[e.id] || []).length > 0)
  const [previewProfile, setPreviewProfile] = useState<any>(null)
  const [aiMatches, setAiMatches] = useState<MatchResult[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const aiRankedProfiles = aiMatches.length > 0
    ? [...QUEUE_PROFILES].sort((a, b) => {
        const sa = aiMatches.find(m => m.id === a.id)?.score ?? 0
        const sb = aiMatches.find(m => m.id === b.id)?.score ?? 0
        return sb - sa
      })
    : QUEUE_PROFILES

  const eventContext = myEvents.length > 0
    ? myEvents.map((e: any) => `${e.title} (${e.category})`).join(', ')
    : undefined

  useEffect(() => {
    if (!userData?.interests?.length) return
    setAiLoading(true)
    aiMatchCompanions(
      {
        interests: userData.interests,
        bio: userData.bio || '',
        age: userData.age || '',
        langs: userData.langs || ['en'],
        musicGenres: userData.musicGenres || [],
        drinksPref: userData.drinksPref || '',
        smokingPref: userData.smokingPref || '',
        socialEnergy: tonightVibe?.energy || userData.socialEnergy || '',
        dealbreakers: userData.dealbreakers || [],
        eventContext,
      },
      QUEUE_PROFILES
    ).then(results => {
      setAiMatches(results)
      setAiLoading(false)
    })
  }, [tonightVibe?.energy, eventContext])

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

  if (myEvents.length === 0 && !hasHostActivity && pendingHostedEvents.length === 0) {
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
            {hasHostActivity ? '👑 You have join requests' : myEvents.length > 0 ? `${myEvents.length} event${myEvents.length > 1 ? 's' : ''} · tap avatars to vet your crew` : myCommunityEvents.length > 0 ? `${myCommunityEvents.length} request${myCommunityEvents.length > 1 ? 's' : ''} · waiting for host approval` : `${pendingHostedEvents.length} social${pendingHostedEvents.length > 1 ? 's' : ''} · waiting for host approval`}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
          {/* Host approval section — AI-ranked */}
          {activeHosted.map((ev: any) => {
            const allRequests: any[] = pendingJoinRequests[ev.id] || []
            const approvedCount = (approvedJoiners?.[ev.id] || []).length
            const slotsTotal = (ev.maxParticipants || 5) - 1 // spots for guests (host takes 1)
            const slotsLeft = slotsTotal - approvedCount
            if (allRequests.length === 0 && approvedCount === 0) return null
            // Hide when full and no pending requests — nothing to do here
            if (slotsLeft <= 0 && allRequests.length === 0) return null
            // Score + sort, show top 12
            const scored = allRequests
              .map(req => ({ ...req, _score: scoreRequesterForHost(req, userData || {}, ev.category) }))
              .sort((a, b) => b._score - a._score)
              .slice(0, 12)
            const autoFillCount = Math.min(slotsLeft, scored.length)
            return (
              <View key={`host-${ev.id}`} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' }}>
                <LinearGradient colors={ev.gradient as any} style={{ height: 5 }} />
                <View style={{ padding: 16, gap: 12 }}>
                  {/* Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff', flex: 1 }} numberOfLines={1}>{ev.title}</Text>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFD700' }}>HOST 👑</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                      {allRequests.length} request{allRequests.length > 1 ? 's' : ''} · {slotsLeft} spot{slotsLeft !== 1 ? 's' : ''} left · AI-ranked ✨
                    </Text>
                  </View>
                  {/* Auto-fill button */}
                  {slotsLeft > 0 && scored.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        scored.slice(0, autoFillCount).forEach(req => onApproveJoiner?.(ev.id, req))
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                      }}
                      activeOpacity={0.8}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(99,102,241,0.25)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.5)' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#A5B4FC' }}>⚡ Auto-fill {autoFillCount} best match{autoFillCount !== 1 ? 'es' : ''}</Text>
                    </TouchableOpacity>
                  )}
                  {/* Ranked request cards */}
                  {scored.map((req: any, idx: number) => {
                    const score = req._score as number
                    const scoreColor = score >= 75 ? '#43E97B' : score >= 50 ? '#FBBF24' : '#F87171'
                    return (
                      <View key={req.requestId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12 }}>
                        {/* Rank indicator */}
                        {idx === 0 && <Text style={{ position: 'absolute', top: 8, left: 10, fontSize: 11 }}>🏆</Text>}
                        <TouchableOpacity onPress={() => {
                          setPreviewProfile({
                            ...req,
                            colors: [req.color, '#1E1B4B'],
                            flag: FLAG_MAP[req.langs?.[0]] || '🌍',
                            langs: (req.langs || []).map((l: string) => FLAG_MAP[l] || l),
                            interests: req.interests || [],
                            goal: 'chill',
                            emoji: '👤',
                            aiScore: score,
                            aiReason: score >= 75 ? 'Great match for your vibe' : score >= 50 ? 'Could be a good fit' : 'Some differences in style',
                          })
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          <View>
                            <Image source={{ uri: req.photo }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#333' }} />
                            {/* Score ring */}
                            <View style={{ position: 'absolute', bottom: -4, right: -6, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8, backgroundColor: '#1A1730', borderWidth: 1, borderColor: scoreColor }}>
                              <Text style={{ fontSize: 9, fontWeight: '900', color: scoreColor }}>{score}%</Text>
                            </View>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{req.name}, {req.age}</Text>
                              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>tap →</Text>
                            </View>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }} numberOfLines={1}>{req.bio}</Text>
                            <View style={{ flexDirection: 'row', gap: 4, marginTop: 5 }}>
                              {(req.langs || []).map((l: string) => (
                                <Text key={l} style={{ fontSize: 13 }}>{FLAG_MAP[l] || '🌐'}</Text>
                              ))}
                            </View>
                          </View>
                        </TouchableOpacity>
                        {/* Action buttons */}
                        <View style={{ gap: 6 }}>
                          <TouchableOpacity onPress={() => onApproveJoiner?.(ev.id, req)} activeOpacity={0.8}
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(67,233,123,0.2)', borderWidth: 1.5, borderColor: '#43E97B', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18 }}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => onPassJoiner?.(ev.id, req)} activeOpacity={0.8}
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(148,163,184,0.12)', borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>–</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )
                  })}
                  {allRequests.length > 12 && (
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 4 }}>
                      +{allRequests.length - 12} more hidden · approve or pass to see them
                    </Text>
                  )}
                  {/* Searching for replacement */}
                  {slotsLeft > 0 && approvedCount > 0 && allRequests.length === 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(99,102,241,0.12)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' }}>
                      <Text style={{ fontSize: 20 }}>🔍</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#A5B4FC' }}>Looking for {slotsLeft} replacement{slotsLeft !== 1 ? 's' : ''}...</Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>New requests will appear here shortly</Text>
                      </View>
                    </View>
                  )}
                  {/* Group full state */}
                  {slotsLeft <= 0 && approvedCount > 0 && (
                    <View style={{ gap: 10, paddingTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(67,233,123,0.12)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(67,233,123,0.35)' }}>
                        <Text style={{ fontSize: 22 }}>🎉</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '800', color: '#43E97B' }}>All {slotsTotal} spots filled!</Text>
                          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Your social is complete. Time to chat!</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => onGoToMessages?.()}
                        activeOpacity={0.85}
                        style={{ borderRadius: 99, paddingVertical: 13, alignItems: 'center', backgroundColor: '#43E97B', shadowColor: '#43E97B', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: '#052e16' }}>Go to group chat 💬</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* Approved members count (while still collecting) */}
                  {approvedCount > 0 && slotsLeft > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: 'rgba(67,233,123,0.12)', borderWidth: 1, borderColor: 'rgba(67,233,123,0.25)' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#43E97B' }}>✓ {approvedCount} approved</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{slotsLeft} spot{slotsLeft !== 1 ? 's' : ''} left</Text>
                      <TouchableOpacity onPress={() => onGoToMessages?.()} style={{ marginLeft: 'auto' as any }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#818CF8' }}>Open chat →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
          {myEvents.map((ev: any) => {
            const format     = userEventFormat?.[ev.id]    || (ev.type === 'official' ? '1+1' : 'squad')
            const transport  = userEventTransport?.[ev.id] || 'meet'
            const cap        = VIBE_FORMAT_MAX[format] || 5
            const threshold  = VIBE_FORMAT_THRESHOLD[format] || cap
            const isParty    = format === 'party'
            const isScanning = joinedEvents?.[ev.id] === 'pending'
            const partnersFound = isScanning ? 0 : cap - 1
            const found      = isScanning ? 1 : cap   // pending = just me; joined = full crew
            const isActive   = !isScanning && found >= threshold
            const partners   = aiRankedProfiles.slice(0, partnersFound) // AI-ranked partners

            // Status label
            const statusLabel = isScanning
              ? 'SCANNING…'
              : isActive
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
                      {partners.map((p, i) => {
                        const match = aiMatches.find(m => m.id === p.id)
                        return (
                          <TouchableOpacity key={i} onPress={() => { setPreviewProfile({ ...p, flag: FLAG_MAP[p.langs?.[0]] || '🌍', langs: (p.langs || []).map((l: string) => FLAG_MAP[l] || l), aiScore: match?.score ?? 50, aiReason: match?.reason ?? 'Ready to connect' }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} activeOpacity={0.75}>
                            <View style={{ alignItems: 'center' }}>
                              <LinearGradient colors={p.colors as any} style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }}>
                                <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                              </LinearGradient>
                              {match && (
                                <View style={{ marginTop: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: match.score >= 75 ? 'rgba(67,233,123,0.2)' : 'rgba(129,140,248,0.2)' }}>
                                  <Text style={{ fontSize: 9, fontWeight: '800', color: match.score >= 75 ? '#43E97B' : '#818CF8' }}>{match.score}%</Text>
                                </View>
                              )}
                              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 2, fontWeight: '600' }}>{p.name}</Text>
                            </View>
                          </TouchableOpacity>
                        )
                      })}
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

          {/* Community events — host-approval flow */}
          {myCommunityEvents.map((ev: any) => {
            const isPending = joinedEvents?.[ev.id] === 'pending'
            const total = ev.maxParticipants || ev.capacity || 20
            const filled = (ev.participantsCount || 0) + (isPending ? 0 : 1)
            const free = Math.max(0, total - filled)
            // Compatibility score: interest match + language overlap
            const userLangs: string[] = userData?.langs || []
            const hostLangs: string[] = ev.hostLangs || []
            const langMatch = userLangs.some((l: string) => hostLangs.includes(l))
            const interestMatch = (userData?.interests || []).includes(ev.category)
            const compatScore = (langMatch ? 35 : 10) + (interestMatch ? 40 : 5) + 20
            const compatColor = compatScore >= 70 ? '#43E97B' : compatScore >= 50 ? '#FBBF24' : '#F87171'
            const compatLabel = compatScore >= 70 ? 'Great match' : compatScore >= 50 ? 'Good fit' : 'Low match'
            return (
              <View key={`community-${ev.id}`} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: isPending ? 'rgba(245,158,11,0.35)' : 'rgba(67,233,123,0.35)' }}>
                <LinearGradient colors={ev.gradient as any} style={{ height: 4 }} />
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }} numberOfLines={2}>{ev.title}</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{ev.time} · {ev.distance}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: isPending ? 'rgba(245,158,11,0.15)' : 'rgba(67,233,123,0.15)', borderWidth: 1, borderColor: isPending ? 'rgba(245,158,11,0.4)' : 'rgba(67,233,123,0.4)' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: isPending ? '#FBBF24' : '#43E97B' }}>{isPending ? 'PENDING ⏳' : 'APPROVED ✓'}</Text>
                    </View>
                  </View>

                  {/* Compatibility with this event */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${compatColor}22`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: compatColor }}>{compatScore}%</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: compatColor }}>{compatLabel} ✦</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {interestMatch ? `Matches your interest in ${ev.category}` : 'AI matched based on your profile'}
                      </Text>
                    </View>
                  </View>

                  {/* Real capacity bar */}
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 0.5 }}>SPOTS FILLED</Text>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)' }}>{filled} / {total} · {free} free</Text>
                    </View>
                    <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
                      <LinearGradient
                        colors={['#6366F1', '#818CF8']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ height: 3, borderRadius: 99, width: `${Math.min(100, (filled / total) * 100)}%` as any }}
                      />
                    </View>
                  </View>

                  {isPending ? (
                    <View style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 14, padding: 14 }}>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 19 }}>
                        ⏳ Request sent. The host reviews compatibility scores — {compatScore >= 60 ? 'your chances look great! 🔥' : 'keep your profile complete for better chances.'}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => onConfirm?.(ev, [], 'community')}
                      style={{ borderRadius: 99, paddingVertical: 14, alignItems: 'center', backgroundColor: '#43E97B', shadowColor: '#43E97B', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: '#052e16' }}>Open Chat 💬</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onLeave?.(ev)}
                    style={{ borderRadius: 99, paddingVertical: 12, alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.3)' }}>Cancel request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}

          {/* Pending approval cards for user-created socials */}
          {pendingHostedEvents.map((ev: any) => {
            // Rough compatibility hint: lang overlap + category interest
            const userLangs: string[] = userData?.langs || []
            const hostLangs: string[] = ev.hostLangs || []
            const langMatch = userLangs.some(l => hostLangs.includes(l))
            const interestMatch = (userData?.interests || []).includes(ev.category)
            const compatScore = (langMatch ? 40 : 10) + (interestMatch ? 35 : 5) + 20
            const compatColor = compatScore >= 70 ? '#43E97B' : compatScore >= 50 ? '#FBBF24' : '#94A3B8'
            const compatLabel = compatScore >= 70 ? 'Strong match' : compatScore >= 50 ? 'Good fit' : 'Different vibes'
            return (
              <View key={`hosted-pending-${ev.id}`} style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' }}>
                <LinearGradient colors={ev.gradient as any} style={{ height: 4 }} />
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }} numberOfLines={2}>{ev.title}</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{ev.time}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 5 }}>
                      <View style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>👤 SOCIAL</Text>
                      </View>
                      <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: `${compatColor}18`, borderWidth: 1, borderColor: `${compatColor}40` }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: compatColor }}>{compatScore}% · {compatLabel}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
                    <Text style={{ fontSize: 22 }}>⏳</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#FCD34D' }}>Waiting for host approval</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        {langMatch ? `Host speaks your language 🌍` : 'The organizer reviews all requests'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => onLeave?.(ev)}
                    style={{ marginTop: 14, borderRadius: 99, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.35)' }}>Cancel request</Text>
                  </TouchableOpacity>
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

function ProfileTab({ userData, onUpdateUserData, onLogOut }: { userData: any; onUpdateUserData?: (patch: any) => void; onLogOut?: () => void }) {
  const insets = useSafeAreaInsets()
  const nm = userData?.name || 'Your Profile'
  const ag = userData?.age || ''
  const userPhotos: string[] = (userData?.photos || []).filter(Boolean)
  const [previewIdx, setPreviewIdx] = useState<number | null>(null)
  const [vibeEditOpen, setVibeEditOpen] = useState(false)
  const [langEditOpen, setLangEditOpen] = useState(false)
  const [interestsEditOpen, setInterestsEditOpen] = useState(false)
  const [draftLangs, setDraftLangs] = useState<string[]>([])
  const [draftInterests, setDraftInterests] = useState<string[]>([])
  const [draft, setDraft] = useState<any>({})

  // Per-slot status: null = idle, 'checking' = moderation running, 'rejected' = failed
  const [slotStatus, setSlotStatus] = useState<Record<number, 'checking' | 'rejected'>>({})

  const setSlot = (idx: number, status: 'checking' | 'rejected' | null) =>
    setSlotStatus(prev => { const n = { ...prev }; if (status === null) delete n[idx]; else n[idx] = status; return n })

  const pickProfilePhoto = async (replaceIdx?: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photos.'); return }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6,
        base64: !!ANTHROPIC_KEY,
        allowsEditing: true,
        aspect: [3, 4],
      })
      if (result.canceled || !result.assets?.[0]) return
      const { uri, base64 } = result.assets[0]

      const targetIdx = replaceIdx !== undefined ? replaceIdx : userPhotos.length

      // Save immediately so photo appears right away
      const photosBeforePick = [...userPhotos]
      const newPhotos = [...userPhotos]
      if (replaceIdx !== undefined) { newPhotos[replaceIdx] = uri } else { newPhotos.push(uri) }
      onUpdateUserData?.({ photos: newPhotos })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Background moderation
      if (ANTHROPIC_KEY && base64) {
        setSlot(targetIdx, 'checking')
        try {
          const safe = await isImageSafe(base64)
          if (!safe) {
            setSlot(targetIdx, 'rejected')
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            setTimeout(() => {
              onUpdateUserData?.({ photos: photosBeforePick })
              setSlot(targetIdx, null)
              Alert.alert('Photo removed 🚫', 'This photo doesn\'t meet our content guidelines. Please choose a different one.')
            }, 1200) // show 'rejected' state for 1.2s before removing
            return
          }
        } catch { /* keep photo on moderation error */ }
        setSlot(targetIdx, null)
      }
    } catch { /* picker cancelled or error */ }
  }

  const deleteProfilePhoto = (idx: number) => {
    if (idx === 0 && userPhotos.length === 1) {
      Alert.alert('Main photo required', 'You need at least one photo. Replace it instead.')
      return
    }
    Alert.alert('Delete photo?', undefined, [
      { text: 'Delete', style: 'destructive', onPress: () => {
        onUpdateUserData?.({ photos: userPhotos.filter((_, i) => i !== idx) })
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }},
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  return (
    <View style={{ flex: 1 }}>

      {/* ── Profile Card Preview Modal ─────────────────────────────────────── */}
      <Modal visible={profilePreviewOpen} animationType="slide" onRequestClose={() => setProfilePreviewOpen(false)}>
        <View style={{ flex: 1 }}>
          {/* Full-screen photo */}
          {userPhotos[0] ? (
            <Image source={{ uri: userPhotos[0] }} style={{ ...StyleSheet.absoluteFillObject }} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#6366F1', '#818CF8']} style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 80 }}>👤</Text>
            </LinearGradient>
          )}
          {/* Dark gradient at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' }}
          />
          {/* Top label + close */}
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, backgroundColor: 'rgba(0,0,0,0.35)' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>👁  Profile preview</Text>
              </View>
              <TouchableOpacity onPress={() => setProfilePreviewOpen(false)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {/* Info overlaid at bottom */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 48 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 6 }}>{nm}{ag ? `, ${ag}` : ''}</Text>
            {userData?.bio ? (
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 12 }} numberOfLines={2}>{userData.bio}</Text>
            ) : null}
            {(userData?.interests || []).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {(userData.interests as string[]).slice(0, 4).map((item: string) => (
                  <View key={item} style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {(userData?.langs || []).length > 0 && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(userData.langs as string[]).map((code: string) => {
                  const l = LANGUAGES_LIST.find(x => x.code === code)
                  return l ? <Text key={code} style={{ fontSize: 22 }}>{l.flag}</Text> : null
                })}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Single photo full-screen preview ──────────────────────────────── */}
      <Modal visible={previewIdx !== null} transparent animationType="fade" onRequestClose={() => setPreviewIdx(null)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {previewIdx !== null && userPhotos[previewIdx] && (
            <Image source={{ uri: userPhotos[previewIdx] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          )}
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
          {previewIdx !== null && previewIdx > 0 && (
            <TouchableOpacity onPress={() => setPreviewIdx(i => (i !== null ? i - 1 : i))}
              style={{ position: 'absolute', left: 16, top: '45%', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="chevron-left" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          {previewIdx !== null && previewIdx < userPhotos.length - 1 && (
            <TouchableOpacity onPress={() => setPreviewIdx(i => (i !== null ? i + 1 : i))}
              style={{ position: 'absolute', right: 16, top: '45%', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="chevron-right" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          {userPhotos.length > 1 && (
            <View style={{ flexDirection: 'row', gap: 6, position: 'absolute', top: 52, alignSelf: 'center', left: 0, right: 0, justifyContent: 'center' }}>
              {userPhotos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPreviewIdx(i)}>
                  <View style={{ width: previewIdx === i ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: previewIdx === i ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity onPress={() => setPreviewIdx(null)}
            style={{ position: 'absolute', top: 44, right: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Vibe Edit Modal */}
      <Modal visible={vibeEditOpen} transparent animationType="slide" onRequestClose={() => setVibeEditOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setVibeEditOpen(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B' }}>Edit vibe</Text>
            <TouchableOpacity onPress={() => setVibeEditOpen(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Music taste</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {MUSIC_GENRES.map(g => {
                const on = (draft.musicGenres || []).includes(g.id)
                return (
                  <TouchableOpacity key={g.id} onPress={() => setDraft((v: any) => ({ ...v, musicGenres: on ? v.musicGenres.filter((x: string) => x !== g.id) : [...(v.musicGenres || []), g.id] }))}
                    style={{ width: (W - 40 - 20) / 3, borderRadius: 12, overflow: 'hidden' }}>
                    <LinearGradient colors={on ? g.colors : ['#F8FAFC', '#F1F5F9']}
                      style={{ paddingVertical: 10, alignItems: 'center', gap: 3, borderWidth: 1.5, borderRadius: 12, borderColor: on ? 'transparent' : '#E2E8F0' }}>
                      <Text style={{ fontSize: 18 }}>{g.emoji}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: on ? '#fff' : '#475569', textAlign: 'center' }}>{g.label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )
              })}
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Social energy</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 24 }}>
              {SOCIAL_ENERGY.map(e => {
                const on = draft.socialEnergy === e.id
                return (
                  <TouchableOpacity key={e.id} onPress={() => setDraft((v: any) => ({ ...v, socialEnergy: e.id }))}
                    style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: on ? '#3730A3' : '#F8FAFC', borderWidth: 1.5, borderColor: on ? '#3730A3' : '#E2E8F0' }}>
                    <Text style={{ fontSize: 18, marginBottom: 3 }}>{e.emoji}</Text>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: on ? '#fff' : '#94A3B8', textAlign: 'center' }}>{e.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            {[
              { key: 'drinksPref', label: '🍷 Alcohol', opts: ['Social drinker', 'Rarely', "Don't drink"] },
              { key: 'smokingPref', label: '🚬 Smoking', opts: ['Non-smoker', 'Social', 'Smoker'] },
            ].map(row => (
              <View key={row.key} style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{row.label}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {row.opts.map(opt => {
                    const on = draft[row.key] === opt
                    return (
                      <TouchableOpacity key={opt} onPress={() => setDraft((v: any) => ({ ...v, [row.key]: opt }))}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: on ? '#3730A3' : '#F8FAFC', borderWidth: 1.5, borderColor: on ? '#3730A3' : '#E2E8F0' }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: on ? '#fff' : '#475569' }}>{opt}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => { onUpdateUserData?.(draft); setVibeEditOpen(false) }}
              style={{ backgroundColor: '#3730A3', borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Lang Edit Modal */}
      <Modal visible={langEditOpen} transparent animationType="slide" onRequestClose={() => setLangEditOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setLangEditOpen(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B' }}>Languages</Text>
            <TouchableOpacity onPress={() => setLangEditOpen(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {LANGUAGES_LIST.map(l => {
                const on = draftLangs.includes(l.code)
                return (
                  <TouchableOpacity key={l.code} onPress={() => { setDraftLangs(prev => on ? prev.filter(x => x !== l.code) : [...prev, l.code]); Haptics.selectionAsync() }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: on ? '#EEF2FF' : '#F8FAFC', borderWidth: 1.5, borderColor: on ? '#6366F1' : '#E2E8F0' }}>
                    <Text style={{ fontSize: 22 }}>{l.flag}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: on ? '#4338CA' : '#64748B' }}>{l.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <TouchableOpacity onPress={() => { onUpdateUserData?.({ langs: draftLangs }); setLangEditOpen(false) }}
              style={{ backgroundColor: '#3730A3', borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save{draftLangs.length > 0 ? ` (${draftLangs.length})` : ''}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Interests Edit Modal */}
      <Modal visible={interestsEditOpen} transparent animationType="slide" onRequestClose={() => setInterestsEditOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setInterestsEditOpen(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B' }}>Your interests</Text>
            <TouchableOpacity onPress={() => setInterestsEditOpen(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            {INTERESTS_BY_CATEGORY.map(cat => (
              <View key={cat.id} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{cat.emoji} {cat.label}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {cat.items.map(item => {
                    const on = draftInterests.includes(item)
                    return (
                      <TouchableOpacity key={item} onPress={() => { setDraftInterests(prev => on ? prev.filter(x => x !== item) : [...prev, item]); Haptics.selectionAsync() }}
                        style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: on ? '#EEF2FF' : '#F8FAFC', borderWidth: 1.5, borderColor: on ? '#6366F1' : '#E2E8F0' }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: on ? '#4338CA' : '#64748B' }}>{item}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => { onUpdateUserData?.({ interests: draftInterests }); setInterestsEditOpen(false) }}
              style={{ backgroundColor: '#3730A3', borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save{draftInterests.length > 0 ? ` (${draftInterests.length})` : ''}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ── Edit Profile sheet ────────────────────────────────────────────── */}
      <Modal visible={editProfileOpen} transparent animationType="slide" onRequestClose={() => setEditProfileOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setEditProfileOpen(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B' }}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditProfileOpen(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Interests */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' }}>Interests</Text>
              <TouchableOpacity onPress={() => { setDraftInterests(userData?.interests || []); setEditProfileOpen(false); setTimeout(() => setInterestsEditOpen(true), 300) }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#6366F1' }}>Edit →</Text>
              </TouchableOpacity>
            </View>
            {(userData?.interests || []).length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {(userData.interests as string[]).map((item: string) => (
                  <View key={item} style={{ backgroundColor: '#EEF2FF', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13, color: '#4338CA', fontWeight: '600' }}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setDraftInterests([]); setEditProfileOpen(false); setTimeout(() => setInterestsEditOpen(true), 300) }}
                style={{ alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: '#94A3B8' }}>✨ Add interests</Text>
              </TouchableOpacity>
            )}

            {/* Languages */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' }}>Languages</Text>
              <TouchableOpacity onPress={() => { setDraftLangs(userData?.langs || []); setEditProfileOpen(false); setTimeout(() => setLangEditOpen(true), 300) }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#6366F1' }}>Edit →</Text>
              </TouchableOpacity>
            </View>
            {(userData?.langs || []).length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {(userData.langs as string[]).map((code: string) => {
                  const l = LANGUAGES_LIST.find(x => x.code === code)
                  return l ? (
                    <View key={code} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 }}>
                      <Text style={{ fontSize: 18 }}>{l.flag}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>{l.label}</Text>
                    </View>
                  ) : null
                })}
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setDraftLangs([]); setEditProfileOpen(false); setTimeout(() => setLangEditOpen(true), 300) }}
                style={{ alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: '#94A3B8' }}>🌍 Add languages</Text>
              </TouchableOpacity>
            )}

            {/* Vibe */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Vibe</Text>
              <TouchableOpacity onPress={() => { setDraft({ musicGenres: userData?.musicGenres || [], socialEnergy: userData?.socialEnergy, drinksPref: userData?.drinksPref, smokingPref: userData?.smokingPref }); setEditProfileOpen(false); setTimeout(() => setVibeEditOpen(true), 300) }}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, gap: 10 }}>
                <Text style={{ fontSize: 20 }}>✨</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', flex: 1 }}>Music, energy, drinks & smoking</Text>
                <Feather name="chevron-right" size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ── Main Profile (no scroll) ───────────────────────────────────────── */}
      <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, 16) }}>

        {/* Header */}
        <View style={{ paddingTop: Math.max(insets.top, 20) + 4, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5 }}>My Profile</Text>
          <TouchableOpacity
            onPress={() => { setProfilePreviewOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: '#EEF2FF' }}>
            <Feather name="eye" size={14} color="#6366F1" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#6366F1' }}>Preview</Text>
          </TouchableOpacity>
        </View>

        {/* Photos: 3 equal squares */}
        {(() => {
          const SZ = (W - 40 - 16) / 3
          return (
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 18 }}>
              {[0, 1, 2].map(i => {
                const uri = userPhotos[i]
                const isMain = i === 0
                const status = slotStatus[i] ?? null
                const isChecking = status === 'checking'
                const isRejected = status === 'rejected'
                if (uri) return (
                  <TouchableOpacity key={i} activeOpacity={0.85}
                    onPress={() => {
                      if (isChecking || isRejected) return
                      const acts: any[] = [{ text: '📷  Replace', onPress: () => pickProfilePhoto(i) }]
                      if (!(isMain && userPhotos.length === 1)) acts.push({ text: '🗑️  Delete', style: 'destructive', onPress: () => deleteProfilePhoto(i) })
                      acts.push({ text: 'Cancel', style: 'cancel' })
                      Alert.alert(isMain ? 'Main photo' : `Photo ${i + 1}`, undefined, acts)
                    }}
                    style={{ width: SZ, height: SZ * 1.3, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    {isChecking && <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(99,102,241,0.7)', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#fff" size="small" /></View>}
                    {isRejected && <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(239,68,68,0.75)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>🚫</Text></View>}
                    {isMain && !isChecking && !isRejected && <View style={{ position: 'absolute', top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: 'rgba(0,0,0,0.5)' }}><Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>Main ★</Text></View>}
                    {!isChecking && !isRejected && <View style={{ position: 'absolute', bottom: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}><Feather name="edit-2" size={10} color="#fff" /></View>}
                  </TouchableOpacity>
                )
                if (i <= userPhotos.length) return (
                  <TouchableOpacity key={i} onPress={() => pickProfilePhoto()}
                    style={{ width: SZ, height: SZ * 1.3, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Feather name="plus" size={20} color="#94A3B8" />
                    <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700' }}>Add</Text>
                  </TouchableOpacity>
                )
                return <View key={i} style={{ width: SZ, height: SZ * 1.3, borderRadius: 16, backgroundColor: '#F1F5F9', opacity: 0.3 }} />
              })}
            </View>
          )
        })()}

        {/* Name + bio — centered */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.3, textAlign: 'center' }}>{nm}{ag ? `, ${ag}` : ''}</Text>
          {userData?.bio ? (
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 19, textAlign: 'center' }} numberOfLines={2}>{userData.bio}</Text>
          ) : null}
        </View>

        {/* Edit Profile button */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => { setEditProfileOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6366F1', borderRadius: 16, paddingVertical: 14 }}>
            <Feather name="edit-2" size={16} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
          {[
            { icon: 'settings',   label: 'Settings',        iconColor: '#6366F1', bg: '#EEF2FF' },
            { icon: 'shield',     label: 'Privacy Policy',  iconColor: '#3B82F6', bg: '#EFF6FF' },
            { icon: 'file-text',  label: 'Terms of Service',iconColor: '#F59E0B', bg: '#FFFBEB' },
            { icon: 'log-out',    label: 'Log Out',         iconColor: '#EF4444', bg: '#FEF2F2' },
            { icon: 'trash-2',    label: 'Delete Account',  iconColor: '#EF4444', bg: '#FEF2F2' },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}
                onPress={() => {
                  if (item.label === 'Log Out') { onLogOut?.(); return }
                  if (item.label === 'Delete Account') {
                    Alert.alert('Delete Account', 'This will permanently delete your profile and all your data.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        if (userData?.dbId) await supabase.from('profiles').delete().eq('id', userData.dbId)
                        await supabase.auth.signOut(); onLogOut?.()
                      }},
                    ])
                  }
                }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Feather name={item.icon as any} size={17} color={item.iconColor} />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: item.label === 'Log Out' || item.label === 'Delete Account' ? '#EF4444' : '#1E1B4B' }}>{item.label}</Text>
                <Feather name="chevron-right" size={15} color="#CBD5E1" />
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={{ height: 1, backgroundColor: '#F8FAFC', marginLeft: 66 }} />}
            </React.Fragment>
          ))}
        </View>

      </View>
    </View>
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

function FeedScreen({ userData = {}, onUpdateUserData, onLogOut }: { userData?: any; onUpdateUserData?: (patch: any) => void; onLogOut?: () => void }) {
  const insets = useSafeAreaInsets()
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
  const [dbSeekers, setDbSeekers] = useState<any[]>([])
  const [feedOfficialDbEvents, setFeedOfficialDbEvents] = useState<any[]>([])

  useEffect(() => {
    supabase.from('official_events').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data && data.length > 0) setFeedOfficialDbEvents(data.map(e => ({ ...e, id: e.id + 100000, _dbId: e.id, _fromDb: true, type: 'official', time: e.time || e.date_label || '', gradient: e.gradient || ['#667eea', '#764ba2'], maxParticipants: e.capacity ?? e.max_participants ?? 100, seekerColors: e.seeker_colors || ['#818CF8', '#6366F1'], seekingCount: e.seeking_count ?? 0, participantsCount: e.participants_count ?? 0 }))) })
  }, [])
  const persistLoaded = useRef(false)

  // Load profiles from DB, fall back to MOCK_SEEKERS if empty
  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDbSeekers(data.map((p, i) => ({
            id: p.id,
            name: p.name || 'User',
            age: p.age || 25,
            langs: p.langs || [],
            transport: p.transport || 'meet',
            format: p.format || 'group',
            color: p.color || '#6366F1',
            photo: p.photos?.[0] || `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
            bio: p.bio || '',
            interests: p.interests || [],
            drinksPref: p.drinks_pref || '',
            smokingPref: p.smoking_pref || '',
          })))
        }
      })
  }, [])

  const allSeekers = dbSeekers.length > 0 ? dbSeekers : MOCK_SEEKERS
  const evHost = eventDetail?.type === 'community' ? allSeekers[(eventDetail.id - 1) % allSeekers.length] : null
  const evSpotsLeft = eventDetail?.maxParticipants ? eventDetail.maxParticipants - eventDetail.participantsCount : null
  const evIsFull = evSpotsLeft !== null && evSpotsLeft <= 0
  const [userEventFormat, setUserEventFormat] = useState<Record<number, string>>({})
  const [userEventTransport, setUserEventTransport] = useState<Record<number, string>>({})
  const [pendingJoinEv, setPendingJoinEv] = useState<any>(null)
  const [userCreatedEvents, setUserCreatedEvents] = useState<any[]>([])
  const [pendingJoinRequests, setPendingJoinRequests] = useState<Record<number, any[]>>({})
  const [approvedJoiners, setApprovedJoiners] = useState<Record<number, any[]>>({})
  const [passedRequests, setPassedRequests] = useState<Record<number, string[]>>({})

  // ── Persist & restore state ───────────────────────────────────────────────
  const PERSIST_KEY = `parea_feed_${userData?.authId || 'local'}`

  useEffect(() => {
    AsyncStorage.getItem(PERSIST_KEY).then(raw => {
      if (!raw) { persistLoaded.current = true; return }
      try {
        const saved = JSON.parse(raw)
        if (saved.joinedEvents) setJoinedEvents(saved.joinedEvents)
        if (saved.userCreatedEvents) setUserCreatedEvents(saved.userCreatedEvents)
        if (saved.pendingJoinRequests) setPendingJoinRequests(saved.pendingJoinRequests)
        if (saved.approvedJoiners) {
          setApprovedJoiners(saved.approvedJoiners)
          // Pre-fill ref so already-full events don't re-trigger auto-nav to messages on app open
          if (saved.userCreatedEvents) {
            saved.userCreatedEvents.forEach((ev: any) => {
              const approved = saved.approvedJoiners[ev.id] || []
              const slotsTotal = (ev.maxParticipants || 5) - 1
              if (approved.length >= slotsTotal && slotsTotal > 0) {
                prevFullHostEventsRef.current.add(ev.id)
              }
            })
          }
        }
        if (saved.passedRequests) setPassedRequests(saved.passedRequests)
        if (saved.chatList) setChatList(saved.chatList)
        if (saved.chatMessages) setChatMessages(saved.chatMessages)
      } catch {}
      persistLoaded.current = true
    })
  }, [])

  useEffect(() => {
    if (!persistLoaded.current) return
    AsyncStorage.setItem(PERSIST_KEY, JSON.stringify({
      joinedEvents, userCreatedEvents, pendingJoinRequests,
      approvedJoiners, passedRequests, chatList, chatMessages,
    }))
  }, [joinedEvents, userCreatedEvents, pendingJoinRequests, approvedJoiners, passedRequests, chatList, chatMessages])

  // ── Tonight's Vibe ────────────────────────────────────────────────────────
  const [tonightVibe, setTonightVibe] = useState({
    energy: userData?.socialEnergy || 'balanced',
    drinks: userData?.drinksPref || 'Social drinker',
    smoking: userData?.smokingPref || 'Non-smoker',
  })

  // ── Notifications ─────────────────────────────────────────────────────────
  type Notif = { id: string; type: string; title: string; body: string; emoji: string; color: string; time: number; read: boolean; chatId?: number; eventId?: number }

  // Which types are read only via the bell panel (general info)
  const BELL_TYPES = ['welcome', 'host_full', 'event_cancelled', 'reminder_24h', 'reminder_2h']
  // Which types are read when a specific chat is opened
  const CHAT_TYPES = ['match', 'confirmed', 'group_chat', 'new_message', 'member_joined', 'crew_ready']
  // Which types are read when Plans / VibeCheck tab is opened
  const PLANS_TYPES = ['join_request', 'member_left', 'reminder_24h', 'reminder_2h']
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
    // Remove bell-type notifications when panel is closed (they've been seen)
    setNotifications(prev => prev.filter(n => !BELL_TYPES.includes(n.type)))
  }

  const markNotifsReadForChat = (chatId: number) => {
    // Remove chat-linked notifications when that chat is opened
    setNotifications(prev => prev.filter(n =>
      !(CHAT_TYPES.includes(n.type) && (!n.chatId || n.chatId === chatId))
    ))
  }

  const markNotifsReadForPlans = () => {
    // Remove plans-linked notifications when Plans/VibeCheck is opened
    setNotifications(prev => prev.filter(n => !PLANS_TYPES.includes(n.type)))
  }

  const dismissNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  // Welcome notification — only once after registration
  useEffect(() => {
    const key = `parea_welcomed_${userData?.authId || 'local'}`
    AsyncStorage.getItem(key).then(val => {
      if (val) return
      const t = setTimeout(() => {
        addNotif({ type: 'welcome', emoji: '👋', color: '#6366F1', title: `Welcome to Parea, ${userData?.name || 'there'}!`, body: 'Find your tonight\'s crew in Cyprus 🌊' })
        AsyncStorage.setItem(key, '1')
      }, 1500)
      return () => clearTimeout(t)
    })
  }, [])

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

  // Watch for host's group becoming full → auto-navigate to chat
  const prevFullHostEventsRef = useRef<Set<number>>(new Set())
  useEffect(() => {
    userCreatedEvents.forEach(ev => {
      const approved = approvedJoiners[ev.id] || []
      const slotsTotal = (ev.maxParticipants || 5) - 1
      const isFull = approved.length >= slotsTotal && slotsTotal > 0
      if (isFull && !prevFullHostEventsRef.current.has(ev.id)) {
        prevFullHostEventsRef.current.add(ev.id)
        addNotif({ type: 'host_full', emoji: '🎉', color: '#10B981', title: 'Your social is complete!', body: `All spots filled for "${ev.title}"` })
        setTimeout(() => {
          setMessagesInitialSubTab('messages')
          setActiveTab('messages')
        }, 1200)
      }
    })
  }, [approvedJoiners, userCreatedEvents])

  // Refill pending join requests when pool runs low but slots still open
  // refillInFlightRef tracks currently scheduled (in-flight) timeouts to avoid double-scheduling
  const refillInFlightRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    userCreatedEvents.forEach(ev => {
      const approved = approvedJoiners[ev.id] || []
      const slotsTotal = (ev.maxParticipants || 5) - 1
      const slotsLeft = slotsTotal - approved.length
      if (slotsLeft <= 0) return
      const pending = pendingJoinRequests[ev.id] || []
      if (pending.length >= 3) return
      // Exclude: currently pending, already approved, currently in-flight
      const pendingIds = new Set(pending.map((r: any) => r.id))
      const approvedIds = new Set(approved.map((r: any) => r.id))
      const available = allSeekers.filter((s: any) => {
        if (s.id === userData?.dbId || s.id === userData?.id) return false
        if (pendingIds.has(s.id) || approvedIds.has(s.id)) return false
        if (refillInFlightRef.current.has(`${ev.id}-${s.id}`)) return false
        return true
      })
      const toAdd = available.slice(0, 3 - pending.length)
      toAdd.forEach((requester: any, i: number) => {
        const key = `${ev.id}-${requester.id}`
        refillInFlightRef.current.add(key)
        const evId = ev.id
        setTimeout(() => {
          refillInFlightRef.current.delete(key)
          setUserCreatedEvents(existing => {
            if (!existing.some(e => e.id === evId)) return existing
            setPendingJoinRequests(prev => {
              const current = prev[evId] || []
              if (current.some((r: any) => r.id === requester.id)) return prev
              return { ...prev, [evId]: [...current, { ...requester, requestId: `${evId}-${requester.id}` }] }
            })
            return existing
          })
        }, 1500 + i * 1200)
      })
    })
  }, [pendingJoinRequests, approvedJoiners, userCreatedEvents])

  // Auto-expire hosted events and their chats 24h after event ends
  useEffect(() => {
    const check = () => {
      const now = Date.now()
      const EXPIRE_AFTER = 24 * 60 * 60 * 1000 // 24 hours
      setUserCreatedEvents(prev => {
        const expired = prev.filter(ev => ev.expiresAt > 0 && now > ev.expiresAt + EXPIRE_AFTER)
        if (expired.length === 0) return prev
        const expiredIds = new Set(expired.map((ev: any) => ev.id))
        // Remove chats linked to expired events
        setChatList(cl => cl.filter(c => !expiredIds.has(c.hostEventId)))
        setPendingJoinRequests(pjr => {
          const n = { ...pjr }
          expiredIds.forEach(id => delete n[id])
          return n
        })
        setApprovedJoiners(aj => {
          const n = { ...aj }
          expiredIds.forEach(id => delete n[id])
          return n
        })
        return prev.filter(ev => !expiredIds.has(ev.id))
      })
    }
    check()
    const interval = setInterval(check, 60 * 60 * 1000) // check every hour
    return () => clearInterval(interval)
  }, [])

  // Watch for crew/partner found on joined events
  const prevActiveEventsRef = useRef<Set<number>>(new Set())
  useEffect(() => {
    const myEvents = MOCK_EVENTS.filter(e => joinedEvents?.[e.id] && joinedEvents[e.id] !== 'confirmed')
    myEvents.forEach(ev => {
      const format    = userEventFormat?.[ev.id] || 'squad'
      const cap       = VIBE_FORMAT_MAX[format] || 5
      const threshold = VIBE_FORMAT_THRESHOLD[format] || cap
      const partnersFound = Math.min(cap - 1, (ev.id % Math.max(1, threshold - 1)) + 1)
      const found     = 1 + partnersFound
      const isActive  = found >= threshold
      if (isActive && !prevActiveEventsRef.current.has(ev.id)) {
        const isDuo = format === '1+1'
        addNotif({
          type: 'crew_ready',
          emoji: isDuo ? '🎯' : '🔥',
          color: isDuo ? '#EC4899' : '#43E97B',
          title: isDuo ? 'Partner found!' : 'Your crew is ready!',
          body: ev.title,
        })
      }
      if (isActive) prevActiveEventsRef.current.add(ev.id)
      else prevActiveEventsRef.current.delete(ev.id)
    })
  }, [joinedEvents, userEventFormat])

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
    const currentState = joinedEvents[ev.id]
    // Pure state update — no side effects inside
    setJoinedEvents(prev => {
      if (!prev[ev.id]) return { ...prev, [ev.id]: 'pending' }
      if (prev[ev.id] === 'pending') {
        if (ev.type === 'community' && !ev.isHosted) return prev // wait for host
        return { ...prev, [ev.id]: 'joined' }
      }
      const next = { ...prev }
      delete next[ev.id]
      return next
    })
    // Side effects OUTSIDE the state updater
    if (!currentState && ev.type === 'community' && !ev.isHosted) {
      // Compute compatibility
      const userLangsNow: string[] = userData?.langs || []
      const hostLangsNow: string[] = ev.hostLangs || []
      const langMatchNow = userLangsNow.some((l: string) => hostLangsNow.includes(l))
      const interestMatchNow = (userData?.interests || []).includes(ev.category)
      const compatScoreNow = (langMatchNow ? 35 : 10) + (interestMatchNow ? 40 : 5) + 20
      const isGoodMatch = compatScoreNow >= 60
      setTimeout(() => {
        setJoinedEvents(cur => {
          if (cur[ev.id] !== 'pending') return cur
          if (!isGoodMatch) { const next = { ...cur }; delete next[ev.id]; return next }
          return { ...cur, [ev.id]: 'joined' }
        })
        if (isGoodMatch) {
          addNotif({ type: 'crew_ready', emoji: '✅', color: '#43E97B', title: 'Host approved your request!', body: ev.title })
          // Create group chat with correct structure
          const chatId = Date.now()
          const members = QUEUE_PROFILES.slice(0, Math.min(3, ev.participantsCount || 3))
          setChatList(prev => [{
            id: chatId,
            type: 'group',
            event: ev.title,
            eventEmoji: CATEGORY_EMOJI[ev.category] || '🎉',
            members: members.length + 1,
            avatars: members.map((m: any) => m.photo).filter(Boolean),
            colors: members.map((m: any) => m.color),
            memberProfiles: members,
            lastMsg: '🎉 You\'ve been approved! Welcome',
            time: 'now',
            isNew: true,
            expiresIn: 48,
          }, ...prev])
          setChatMessages((prev: any) => ({
            ...prev,
            [chatId]: [{ id: 1, from: 'system', text: `You've been approved to join "${ev.title}" 🎉 Welcome!`, time: 'now' }],
          }))
        } else {
          addNotif({ type: 'crew_ready', emoji: '😔', color: '#F87171', title: 'Request not approved', body: `"${ev.title}" — complete your profile to improve your match score` })
        }
      }, 5000)
    }
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

  const DUO_REPLIES = [
    "Sounds great! 😊", "Yeah, totally! See you there 🙌", "Perfect, can't wait!",
    "Nice, looking forward to it ✨", "Sure thing! 👍", "Awesome! Should be a good one 🎉",
    "Cool, see you soon!", "Great, I'll be there 🙂", "Sounds like a plan!",
    "That works for me 💯",
  ]
  const GROUP_REPLIES = [
    "Looking forward to it! 🎉", "Anyone need a lift? 🚗", "What time should we meet?",
    "I'll be there! 🙌", "Can't wait! ✨", "This is going to be great 🔥",
    "See you all there!", "So excited for this 🌊", "Who else is coming early?",
  ]

  const handleSend = () => {
    if (!chatInput.trim() || !openChat) return
    const text = chatInput.trim()
    const newMsg = { from: 'me', text, time: 'now' }
    setChatMessages(prev => ({ ...prev, [openChat.id]: [...(prev[openChat.id] || []), newMsg] }))
    setChatList(prev => prev.map(c => c.id === openChat.id ? { ...c, lastMsg: `You: ${text}`, time: 'now' } : c))
    setChatInput('')
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60)

    // Mock auto-reply
    const chatId = openChat.id
    const delay = 1500 + Math.random() * 1500
    if (openChat.type === 'duo') {
      const replyText = DUO_REPLIES[Math.floor(Math.random() * DUO_REPLIES.length)]
      setTimeout(() => {
        const replyMsg = { from: 'them', text: replyText, time: 'now' }
        setChatMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), replyMsg] }))
        setChatList(prev => prev.map(c => c.id === chatId ? { ...c, lastMsg: replyText, time: 'now', isNew: true } : c))
        // Notify only if chat is not currently open
        setOpenChat((cur: any) => {
          if (!cur || cur.id !== chatId) {
            addNotif({ type: 'new_message', emoji: '💬', color: '#6366F1', title: openChat.name || 'New message', body: replyText, chatId })
          }
          return cur
        })
      }, delay)
    } else if (openChat.type === 'group') {
      const profiles: any[] = openChat.memberProfiles || []
      if (profiles.length > 0) {
        const sender = profiles[Math.floor(Math.random() * profiles.length)]
        const replyText = GROUP_REPLIES[Math.floor(Math.random() * GROUP_REPLIES.length)]
        setTimeout(() => {
          const replyMsg = { from: 'them', text: replyText, time: 'now', senderName: sender.name, senderPhoto: sender.photo, senderColor: sender.color }
          setChatMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), replyMsg] }))
          setChatList(prev => prev.map(c => c.id === chatId ? { ...c, lastMsg: `${sender.name}: ${replyText}`, time: 'now', isNew: true } : c))
          setOpenChat((cur: any) => {
            if (!cur || cur.id !== chatId) {
              addNotif({ type: 'new_message', emoji: '💬', color: '#6366F1', title: `${sender.name} in ${openChat.event}`, body: replyText, chatId })
            }
            return cur
          })
        }, delay)
      }
    }
  }

  return (
    <LinearGradient colors={['#F5F3FF', '#EEF2FF', '#F0F9FF']} style={s.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.fill}>
        <View style={{ flex: 1 }}>
          {activeTab === 'home' && <HomeTab city={city} setCityOpen={setCityOpen} feedFilter={feedFilter} setFeedFilter={setFeedFilter} onEventPress={setEventDetail} joinedEvents={joinedEvents} onJoin={handleJoinEvent} userInterests={userData?.interests || []} setUserEventFormat={setUserEventFormat} setUserEventTransport={setUserEventTransport} onJoinConfirmed={handleJoinConfirmed} pendingJoinEv={pendingJoinEv} onPendingJoinConsumed={() => setPendingJoinEv(null)} extraEvents={userCreatedEvents} approvedJoiners={approvedJoiners} tonightVibe={tonightVibe} setTonightVibe={setTonightVibe} onBellPress={openNotifPanel} unreadCount={unreadCount} bellShake={bellShake} userData={userData} />}
          {activeTab === 'vibecheck' && <VibeCheckTab
            joinedEvents={joinedEvents}
            allEvents={[...MOCK_EVENTS, ...feedOfficialDbEvents]}
            userEventFormat={userEventFormat}
            userEventTransport={userEventTransport}
            userData={userData}
            tonightVibe={tonightVibe}
            onGoHome={() => setActiveTab('home')}
            onConfirm={(ev: any, partners: any[], format: string) => {
              const isGroup = format !== '1+1'
              const newChat = isGroup ? {
                id: Date.now(), type: 'group',
                event: ev.title, eventEmoji: CATEGORY_EMOJI[ev.category] || '🎉',
                members: partners.length + 1,
                avatars: partners.map((p: any) => p.photo).filter(Boolean),
                colors: partners.map((p: any) => p.color),
                memberProfiles: partners,
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
              const createdChatId = newChat.id
              setChatList(prev => [newChat, ...prev])
              setJoinedEvents(prev => ({ ...prev, [ev.id]: 'confirmed' }))
              addNotif({ type: 'confirmed', emoji: '✅', color: '#10B981', title: 'You\'re in!', body: `Your crew for "${ev.title}" is ready`, chatId: createdChatId })
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
            approvedJoiners={approvedJoiners}
            onApproveJoiner={(eventId: number, joiner: any) => {
              const ev = userCreatedEvents.find(e => e.id === eventId)
              const maxParticipants = ev?.maxParticipants || 5
              const slotsTotal = maxParticipants - 1 // host takes 1 slot
              const alreadyApproved = (approvedJoiners[eventId] || []).length
              if (alreadyApproved >= slotsTotal) {
                showToast("Event is already full!")
                return
              }
              setPendingJoinRequests(prev => ({
                ...prev,
                [eventId]: (prev[eventId] || []).filter((r: any) => r.requestId !== joiner.requestId),
              }))
              const isDuo = maxParticipants <= 2

              if (isDuo) {
                // 1-on-1 event → direct chat + auto-navigate
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
                addNotif({ type: 'match', emoji: '✨', color: '#EC4899', title: `${joiner.name} is joining you!`, body: ev?.title || 'Check your chats', chatId: Date.now() })
                setTimeout(() => {
                  setMessagesInitialSubTab('messages')
                  setActiveTab('messages')
                }, 900)
              } else {
                // Squad/Party → find or create one group chat for this event
                const newApproved = [...(approvedJoiners[eventId] || []), joiner]
                setApprovedJoiners(prev => ({ ...prev, [eventId]: newApproved }))
                // If now full — clear remaining pending requests
                if (newApproved.length >= slotsTotal) {
                  setPendingJoinRequests(prev => ({ ...prev, [eventId]: [] }))
                }

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
              // member_joined notif for group chats — find the chat we just updated
              if (!isDuo) {
                setChatList(latest => {
                  const chat = latest.find(c => c.hostEventId === eventId)
                  if (chat) addNotif({ type: 'member_joined', emoji: '✅', color: '#10B981', title: `${joiner.name} joined the group`, body: ev?.title || '', chatId: chat.id })
                  return latest
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
            passedRequests={passedRequests}
            onPassJoiner={(eventId: number, joiner: any) => {
              setPendingJoinRequests(prev => ({
                ...prev,
                [eventId]: (prev[eventId] || []).filter((r: any) => r.requestId !== joiner.requestId),
              }))
              setPassedRequests(prev => ({
                ...prev,
                [eventId]: [...(prev[eventId] || []), joiner.requestId],
              }))
            }}
            onGoToMessages={() => {
              setMessagesInitialSubTab('messages')
              setActiveTab('messages')
            }}
          />}
          {activeTab === 'messages' && <MessagesTab
            initialSubTab={messagesInitialSubTab}
            chatList={chatList}
            onOpenChat={(chat) => {
              setOpenChat(chat)
              setChatList(prev => prev.map(c => c.id === chat.id ? { ...c, isNew: false } : c))
              markNotifsReadForChat(chat.id)
            }}
            hostedEvents={userCreatedEvents}
            onLeaveChat={(id, addSystemMsg) => {
              if (addSystemMsg) {
                setChatMessages(prev => ({
                  ...prev,
                  [id]: [...(prev[id] || []), { from: 'system', text: 'You changed your plans 📅', time: 'now' }],
                }))
              }
              // If host leaves their own group chat → also remove the hosted event from Plans
              const leavingChat = chatList.find(c => c.id === id)
              if (leavingChat?.hostEventId) {
                setUserCreatedEvents(prev => prev.filter(e => e.id !== leavingChat.hostEventId))
                setPendingJoinRequests(prev => { const n = { ...prev }; delete n[leavingChat.hostEventId]; return n })
                setApprovedJoiners(prev => { const n = { ...prev }; delete n[leavingChat.hostEventId]; return n })
              }
              setChatList(prev => prev.filter(c => c.id !== id))
              showToast("Event cancelled and chat removed 🗑️")
            }}
            allEvents={feedOfficialDbEvents}
            onEventDetail={setEventDetail}
            joinedEvents={joinedEvents}
            userEventFormat={userEventFormat}
            userEventTransport={userEventTransport}
            approvedJoiners={approvedJoiners}
            onCancelHostedEvent={(ev) => {
              setUserCreatedEvents(prev => prev.filter(e => e.id !== ev.id))
              setPendingJoinRequests(prev => { const n = { ...prev }; delete n[ev.id]; return n })
              setApprovedJoiners(prev => { const n = { ...prev }; delete n[ev.id]; return n })
              setChatList(prev => prev.filter(c => c.hostEventId !== ev.id))
              addNotif({ type: 'event_cancelled', emoji: '🗑️', color: '#EF4444', title: 'Event cancelled', body: `"${ev.title}" has been removed` })
              showToast("Event cancelled 🗑️")
            }}
            onVibeCheck={() => { setActiveTab('vibecheck'); markNotifsReadForPlans() }}
            onPlansOpen={markNotifsReadForPlans}
            onLeaveEvent={ev => {
              setJoinedEvents(prev => { const n = { ...prev }; delete n[ev.id]; return n })
              setChatList(prev => prev.filter(c => c.event !== ev.title))
              showToast("Spot freed. Others can join now 🎟️")
            }}
            onUpdatePlans={ev => {
              setActiveTab('home')
              setTimeout(() => setPendingJoinEv(ev), 150)
            }}
          />}
          {activeTab === 'profile' && <ProfileTab userData={userData} onUpdateUserData={onUpdateUserData} onLogOut={onLogOut} />}
        </View>

        {/* Bottom nav */}
        <View style={s.bottomNav}>
          <TouchableOpacity style={s.navItem} onPress={() => setActiveTab('home')}>
            <Feather name="home" size={22} color={activeTab === 'home' ? '#6366F1' : '#94A3B8'} />
            <Text style={[s.navLabel, activeTab === 'home' && { color: '#6366F1' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => { setActiveTab('vibecheck'); markNotifsReadForPlans() }}>
            <View style={{ position: 'relative' }}>
              <Feather name="zap" size={22} color={activeTab === 'vibecheck' ? '#6366F1' : '#94A3B8'} />
              {(Object.entries(joinedEvents).some(([, v]) => v !== 'confirmed') || Object.values(pendingJoinRequests).some(r => r.length > 0)) && (
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
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
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

                </ScrollView>

                {/* Bottom button — pinned to bottom */}
                <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 24) + 16 : insets.bottom > 0 ? insets.bottom + 12 : 20, backgroundColor: 'transparent' }}>
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

                        // Simulate staggered join requests (demo) — exclude self, no duplicates
                        const candidatePool = allSeekers.filter((s: any) =>
                          s.id !== userData?.dbId && s.id !== userData?.id
                        )
                        const uniqueCandidates = candidatePool.slice(0, 8)
                        // Mark initial batch as in-flight so refill effect doesn't double-add
                        uniqueCandidates.forEach((requester: any) => {
                          refillInFlightRef.current.add(`${newId}-${requester.id}`)
                        })
                        uniqueCandidates.forEach((requester: any, i: number) => {
                          const delay = 2500 + i * 1800
                          setTimeout(() => {
                            refillInFlightRef.current.delete(`${newId}-${requester.id}`)
                            setUserCreatedEvents(existing => {
                              if (!existing.some(e => e.id === newId)) return existing
                              setPendingJoinRequests(prev => ({
                                ...prev,
                                [newId]: [...(prev[newId] || []), { ...requester, requestId: `${newId}-${requester.id}` }],
                              }))
                              return existing
                            })
                          }, delay)
                        })

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
                  <View style={{ position: 'relative' }}>
                    {eventDetail.image_url ? (
                      <Image source={{ uri: eventDetail.image_url }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
                    ) : (
                      <LinearGradient colors={eventDetail.gradient as any} style={{ height: 220 }} />
                    )}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 20 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                        {CATEGORY_EMOJI[eventDetail.category] || '📍'} {eventDetail.category?.toUpperCase()} · {eventDetail.distance}
                      </Text>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4, lineHeight: 28 }}>{eventDetail.title}</Text>
                    </LinearGradient>
                    <TouchableOpacity onPress={() => setEventDetail(null)} style={[s.detailBackBtn, { position: 'absolute', top: 52, left: 20 }]}>
                      <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ padding: 16, gap: 10 }}>
                    {/* Time + Location + Address link — one compact card */}
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="clock" size={16} color="#6366F1" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date & Time</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 1 }}>{eventDetail.date_label ? `${eventDetail.date_label}${eventDetail.time_label ? '\n' + eventDetail.time_label : ''}` : eventDetail.time_label || eventDetail.time || '—'}</Text>
                        </View>
                      </View>
                      <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="map-pin" size={16} color="#6366F1" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 1 }}>{eventDetail.location || eventDetail.city}{eventDetail.distance && eventDetail.distance !== '0km' ? ` · ${eventDetail.distance} from you` : ''}</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(eventDetail.location || eventDetail.city)}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
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

                    {/* Participants — only for community events */}
                    {eventDetail.type !== 'official' && <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
                    </View>}

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
                    {(eventDetail.ticketLink || eventDetail.ticket_link) && (
                      <TouchableOpacity style={s.ticketBtn} onPress={() => Linking.openURL(eventDetail.ticketLink || eventDetail.ticket_link)} activeOpacity={0.8}>
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
                            {isFull ? 'Event is full' : eventDetail.type === 'official' ? "I'm Going →" : 'Join this Social →'}
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
                <TouchableOpacity onPress={() => setOpenChat(null)} style={{ padding: 4 }}>
                  <Ionicons name="chevron-back" size={26} color="#1E1B4B" />
                </TouchableOpacity>
                {openChat.type === 'duo' ? (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 6 }}
                    onPress={() => { if (openChat.partnerProfile) { setChatPartnerPreview(openChat.partnerProfile); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } }}
                    activeOpacity={openChat.partnerProfile ? 0.7 : 1}
                  >
                    <View style={[s.chatHeaderAvatar, { backgroundColor: openChat.color, alignItems: 'center', justifyContent: 'center' }]}>
                      {openChat.photo ? <Image source={{ uri: openChat.photo }} style={{ width: '100%', height: '100%', borderRadius: 20 }} /> : <Text style={{ fontSize: 20 }}>👤</Text>}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B', letterSpacing: -0.2 }} numberOfLines={1}>
                        {`${openChat.name}, ${openChat.age}`}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }} numberOfLines={1}>
                        {openChat.eventEmoji} {openChat.event}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 6 }}
                    onPress={() => { setGroupMembersOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[
                        ((openChat.colors || [])[0] && typeof (openChat.colors || [])[0] === 'string') ? (openChat.colors || [])[0] : '#818CF8',
                        ((openChat.colors || [])[1] && typeof (openChat.colors || [])[1] === 'string') ? (openChat.colors || [])[1] : '#6366F1',
                      ]}
                      style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 20 }}>{openChat.eventEmoji || '🎉'}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B', letterSpacing: -0.2 }} numberOfLines={1}>{openChat.event}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }} numberOfLines={1}>
                        {openChat.members} members
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{ padding: 6 }}
                  onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  if (openChat.hostEventId) {
                    Alert.alert(
                      openChat.event,
                      'What do you want to do?',
                      [
                        { text: 'Cancel Event 🗑️', style: 'destructive', onPress: () => {
                          setUserCreatedEvents(prev => prev.filter(e => e.id !== openChat.hostEventId))
                          setPendingJoinRequests(prev => { const n = { ...prev }; delete n[openChat.hostEventId]; return n })
                          setApprovedJoiners(prev => { const n = { ...prev }; delete n[openChat.hostEventId]; return n })
                          setChatList(prev => prev.filter(c => c.id !== openChat.id))
                          setOpenChat(null)
                          showToast("Event cancelled 🗑️")
                        }},
                        { text: 'Close', style: 'cancel' },
                      ]
                    )
                  } else {
                    Alert.alert(
                      openChat.type === 'duo' ? `Chat with ${openChat.name}` : openChat.event,
                      'What do you want to do?',
                      [
                        { text: 'Leave chat', style: 'destructive', onPress: () => {
                          setChatMessages(prev => ({
                            ...prev,
                            [openChat.id]: [...(prev[openChat.id] || []), { from: 'system', text: 'You changed your plans 📅', time: 'now' }],
                          }))
                          setChatList(prev => prev.filter(c => c.id !== openChat.id))
                          setOpenChat(null)
                          showToast("We let them know your plans changed 📅")
                        }},
                        { text: 'Close', style: 'cancel' },
                      ]
                    )
                  }
                }}>
                  <Feather name="more-vertical" size={22} color="#64748B" />
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
                  notifications.map(n => {
                    const handleNotifTap = () => {
                      dismissNotif(n.id)
                      closeNotifPanel()
                      if (n.type === 'join_request' || n.type === 'member_left') {
                        setActiveTab('vibecheck')
                      } else if (n.type === 'match' || n.type === 'group_chat' || n.type === 'new_message' || n.type === 'member_joined') {
                        setMessagesInitialSubTab('messages')
                        setActiveTab('messages')
                      } else if (n.type === 'confirmed' || n.type === 'host_full' || n.type === 'reminder_24h' || n.type === 'reminder_2h' || n.type === 'event_cancelled') {
                        setMessagesInitialSubTab('going')
                        setActiveTab('messages')
                      } else if (n.type === 'crew_ready') {
                        setMessagesInitialSubTab('going')
                        setActiveTab('messages')
                      }
                    }
                    return (
                      <TouchableOpacity key={n.id} activeOpacity={0.8} onPress={handleNotifTap}
                        style={{
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                            <Text style={{ fontSize: 11, color: n.color, fontWeight: '600' }}>{timeAgo(n.time)}</Text>
                            {!n.read && n.type !== 'welcome' && (
                              <Text style={{ fontSize: 11, color: '#94A3B8' }}>· {
                                n.type === 'join_request' ? 'tap to review →' :
                                n.type === 'match' || n.type === 'group_chat' || n.type === 'new_message' || n.type === 'member_joined' ? 'tap to open chat →' :
                                n.type === 'reminder_24h' || n.type === 'reminder_2h' ? 'tap to see plans →' :
                                n.type === 'event_cancelled' || n.type === 'member_left' ? 'tap to view →' : 'tap to open →'
                              }</Text>
                            )}
                          </View>
                        </View>
                        {/* Dismiss */}
                        <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); dismissNotif(n.id) }} activeOpacity={0.7}
                          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                          <Feather name="x" size={13} color="#94A3B8" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )
                  })
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
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '80%' }}>
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
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: Math.max(insets.bottom + 16, 40) }}>
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
                          colors: p.colors || [p.color, '#1E1B4B'],
                          flag: p.flag || FLAG_MAP[p.langs?.[0]] || '🌍',
                          langs: (p.langs || []).map((l: string) => FLAG_MAP[l] || l),
                          interests: p.interests || [],
                          goal: p.goal || 'chill',
                          emoji: p.emoji || '👤',
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
                                // Remove from approvedJoiners so slot opens up for refill
                                setApprovedJoiners(prev => ({
                                  ...prev,
                                  [openChat.hostEventId]: (prev[openChat.hostEventId] || []).filter((_: any, idx: number) => idx !== i),
                                }))
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
                                addNotif({ type: 'member_left', emoji: '👋', color: '#F59E0B', title: `${p.name} left the group`, body: openChat.event || '' })
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
  const [screen, setScreen] = useState<'loading' | 'landing' | 'register' | 'otp' | 'onboarding' | 'feed'>('loading')
  const [userData, setUserData] = useState<any>({})
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [authCredential, setAuthCredential] = useState('')
  const [authUserId, setAuthUserId] = useState<string | null>(null)

  const PROFILE_COLORS = ['#6366F1','#EC4899','#10B981','#F59E0B','#3B82F6','#8B5CF6','#EF4444','#14B8A6']

  const loadProfileForUser = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', userId)
      .single()
    if (profile) {
      setAuthUserId(userId)
      setUserData({
        name: profile.name,
        age: profile.age?.toString() || '',
        bio: profile.bio,
        photos: profile.photos || [],
        langs: profile.langs || [],
        interests: profile.interests || [],
        socialEnergy: profile.social_energy,
        drinksPref: profile.drinks_pref,
        smokingPref: profile.smoking_pref,
        musicGenres: profile.music_genres || [],
        transport: profile.transport,
        format: profile.format,
        city: profile.city,
        color: profile.color,
        dbId: profile.id,
        authId: userId,
      })
      setScreen('feed')
    } else {
      setAuthUserId(userId)
      setScreen('onboarding')
    }
  }

  // Check existing session on mount
  useEffect(() => {
    // onAuthStateChange catches both initial restore from AsyncStorage and new logins
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await loadProfileForUser(session.user.id)
        } else {
          setScreen('landing')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const saveProfileToDB = async (data: any, userId: string) => {
    try {
      const color = PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)]
      const { data: row, error } = await supabase.from('profiles').insert({
        auth_id: userId,
        name: data.name,
        age: parseInt(data.age) || null,
        bio: data.bio,
        photos: data.photos?.filter(Boolean) || [],
        langs: data.langs || [],
        interests: data.interests || [],
        social_energy: data.socialEnergy,
        drinks_pref: data.drinksPref,
        smoking_pref: data.smokingPref,
        music_genres: data.musicGenres || [],
        transport: data.transport,
        format: data.format,
        color,
      }).select().single()
      if (error) console.warn('Supabase save error:', error.message)
      return row
    } catch (e) {
      console.warn('Supabase error:', e)
      return null
    }
  }

  const handleFinishOnboarding = async (data: any) => {
    const row = await saveProfileToDB(data, authUserId || '')
    setUserData({ ...data, dbId: row?.id, authId: authUserId })
    setScreen('feed')
  }

  const handleLogOut = async () => {
    await supabase.auth.signOut()
    setUserData({})
    setAuthUserId(null)
    setScreen('landing')
  }

  if (screen === 'loading') return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FF' }}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  )
  const handleOtpVerify = async (userId: string) => {
    setAuthUserId(userId)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', userId)
      .single()
    if (profile) {
      setUserData({
        name: profile.name,
        age: profile.age?.toString() || '',
        bio: profile.bio,
        photos: profile.photos || [],
        langs: profile.langs || [],
        interests: profile.interests || [],
        socialEnergy: profile.social_energy,
        drinksPref: profile.drinks_pref,
        smokingPref: profile.smoking_pref,
        musicGenres: profile.music_genres || [],
        transport: profile.transport,
        format: profile.format,
        city: profile.city,
        color: profile.color,
        dbId: profile.id,
        authId: userId,
      })
      setScreen('feed')
    } else {
      setScreen('onboarding')
    }
  }

  if (screen === 'landing') return <LandingScreen onCreateAccount={() => setScreen('register')} onLogin={() => setScreen('register')} />
  if (screen === 'register') return <RegistrationScreen onBack={() => setScreen('landing')} onSendOtp={(method, cred) => { setAuthMethod(method); setAuthCredential(cred); setScreen('otp') }} />
  if (screen === 'otp') return <OTPScreen onBack={() => setScreen('register')} method={authMethod} credential={authCredential} onVerify={handleOtpVerify} />
  if (screen === 'onboarding') return <OnboardingScreen onBack={() => setScreen('otp')} onFinish={handleFinishOnboarding} />
  return <FeedScreen userData={userData} onUpdateUserData={(patch: any) => setUserData((prev: any) => ({ ...prev, ...patch }))} onLogOut={handleLogOut} />
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
  chipOn: { backgroundColor: '#818CF8', borderColor: '#818CF8', shadowColor: '#818CF8', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, boxShadow: '0 4px 16px rgba(129, 140, 248, 0.75)' } as any,
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
  compactCardGrad: { height: 100, alignItems: 'center', justifyContent: 'center' },
  compactCardBody: { padding: 12 },
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
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)', gap: 4 },
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
