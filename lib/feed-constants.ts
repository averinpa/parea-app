// Pure data constants extracted from index.tsx (Stage 1 of refactor).
// Constants that depend on icon imports (CATEGORY_ICON, INTEREST_ICON_MAP, SOCIAL_ENERGY)
// and asset requires (LANDING_SLIDES) stay in index.tsx for now.

export const INTERESTS_LIST = [
  '☕ Coffee', '🍷 Wine', '🎾 Tennis', '🎬 Movies', '🥾 Hiking',
  '🍕 Foodie', '🧘 Yoga', '🎨 Art', '🎸 Music', '✈️ Travel',
  '💃 Dance', '📚 Books', '💻 IT', '🎮 Gaming', '📷 Photography',
  '🎭 Theatre', '🏖️ Beach', '🎲 Board Games', '🎤 Concerts', '🏊 Swimming',
  '🏓 Padel', '✂️ Crafts', '👗 Fashion', '🏄 Water Sports',
]

export const INTERESTS_BY_CATEGORY = [
  { id: 'social',  label: 'Social & Style',     emoji: '🌙', items: ['🍷 Wine', '🎤 Concerts', '💃 Dance', '☕ Coffee', '🍕 Foodie', '👗 Fashion'] },
  { id: 'active',  label: 'Sport & Outdoors',   emoji: '🌿', items: ['🏓 Padel', '🎾 Tennis', '🥾 Hiking', '🧘 Yoga', '🏊 Swimming', '🏄 Water Sports'] },
  { id: 'creative',label: 'Creative',           emoji: '🎨', items: ['🎨 Art', '✂️ Crafts', '📷 Photography', '🎸 Music', '📚 Books'] },
  { id: 'tech',    label: 'Tech & Culture',     emoji: '💡', items: ['💻 IT', '🎮 Gaming', '🎬 Movies', '🎭 Theatre', '🎲 Board Games'] },
]

export const INTEREST_CATEGORY_PALETTE = {
  social:   { bg: '#FFF0F6', selectedBg: '#FCE7F3', border: '#FBCFE8', selectedBorder: '#DB2777', iconColor: '#F472B6', text: '#BE185D' },
  active:   { bg: '#F0FDF4', selectedBg: '#DCFCE7', border: '#BBF7D0', selectedBorder: '#16A34A', iconColor: '#4ADE80', text: '#15803D' },
  creative: { bg: '#FFFBEB', selectedBg: '#FEF3C7', border: '#FDE68A', selectedBorder: '#D97706', iconColor: '#FBBF24', text: '#B45309' },
  tech:     { bg: '#EEF2FF', selectedBg: '#E0E7FF', border: '#C7D2FE', selectedBorder: '#4338CA', iconColor: '#818CF8', text: '#3730A3' },
} as const

export const LANGUAGES_LIST = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Russian' },
  { code: 'el', flag: '🇬🇷', label: 'Greek' },
  { code: 'uk', flag: '🇺🇦', label: 'Ukrainian' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'he', flag: '🇮🇱', label: 'Hebrew' },
]

export const CITIES = ['Limassol', 'Nicosia', 'Larnaca', 'Paphos']

export const MOCK_COMMUNITY_EVENTS: any[] = []

export const MOCK_EVENTS: any[] = []

export const INTEREST_TO_CATEGORY: Record<string, string> = {
  '☕ Coffee': 'coffee', '🍷 Wine': 'wine', '🎾 Tennis': 'sports', '🎬 Movies': 'culture',
  '🥾 Hiking': 'outdoors', '🍕 Foodie': 'food', '🧘 Yoga': 'sports', '🎨 Art': 'art',
  '🎸 Music': 'music', '✈️ Travel': 'outdoors', '🏓 Padel': 'sports', '✂️ Crafts': 'art',
  '👗 Fashion': 'culture', '💻 IT': 'tech', '🏄 Water Sports': 'outdoors',
  '🏊 Swimming': 'sports', '🏖️ Beach': 'outdoors', '🎤 Concerts': 'music',
  '💃 Dance': 'dance', '📷 Photography': 'art', '📚 Books': 'culture',
  '🎮 Gaming': 'gaming', '🎭 Theatre': 'theatre', '🎲 Board Games': 'gaming',
}

export const CATEGORY_EMOJI: Record<string, string> = { coffee: '☕', sports: '🎾', wine: '🍷', gaming: '🎮', tech: '💻', outdoors: '🌿', food: '🍕', culture: '🎨', music: '🎵', dance: '🎭', theatre: '🎭', art: '🎨' }
export const CATEGORY_COLOR: Record<string, string> = { coffee: '#92400E', sports: '#1D4ED8', wine: '#7C2D12', gaming: '#5B21B6', tech: '#0369A1', outdoors: '#166534', food: '#9A3412', culture: '#B45309', music: '#6D28D9', dance: '#BE185D', theatre: '#9D174D', art: '#B45309' }
export const CATEGORY_BG: Record<string, [string,string]> = { coffee: ['#FEF3C7','#FDE68A'], sports: ['#DBEAFE','#BFDBFE'], wine: ['#FEE2E2','#FECACA'], gaming: ['#EDE9FE','#DDD6FE'], tech: ['#E0F2FE','#BAE6FD'], outdoors: ['#DCFCE7','#BBF7D0'], food: ['#FFEDD5','#FED7AA'], culture: ['#FEF9C3','#FEF08A'], music: ['#F3E8FF','#E9D5FF'], dance: ['#FCE7F3','#FBCFE8'], theatre: ['#FBCFE8','#F9A8D4'], art: ['#FEF3C7','#FDE68A'] }

export const BENTO_SONGS = ['Pop 🎤', 'Hip-Hop 🎧', 'R&B / Soul 🎶', 'Electronic / House 🎛️', 'Indie / Alternative 🎸', 'Jazz / Blues 🎷', 'Classical 🎻', 'Rock / Metal 🤘', 'Reggaeton / Latin 💃', 'Afrobeats 🥁', 'K-Pop 🌸', 'Lo-fi / Chillhop 🌙', 'Country 🤠', 'Funk / Disco 🕺']
export const BENTO_FLAGS = ['Spontaneous plans 🟢', 'Great listener 🟢', 'Dog lover 🟢', 'Always on time 🟢', 'Foodie 🟢', 'Late replies 🚩', "Cancels last minute 🚩", 'No sense of humour 🚩', "Can't make plans 🚩"]
export const BENTO_MOODS = ['Rooftop bar 🍸', 'Beach sunset 🌊', 'Cozy café ☕', 'Hiking adventure 🥾', 'Art gallery 🎨', 'House party 🎉', 'Chill picnic 🧺', 'Live concert 🎶']
export const MAGIC_BIOS = [
  "Searching for my concert partner-in-crime 🎸",
  "Professional event-hopper, amateur chef 🍝",
  "Can't sit still — always planning the next adventure ✈️",
  "Here for the vibes and the people behind them 🌟",
  "Late night coffee, good music, and great company ☕🎶",
  "Living for unexpected Fridays and good conversations 💬",
]
export const FLAG_MAP: Record<string, string> = { en: '🇬🇧', ru: '🇷🇺', el: '🇬🇷', uk: '🇺🇦', de: '🇩🇪', he: '🇮🇱', fr: '🇫🇷' }
// Short, friendly 2-letter language codes for clean chips (premium UI, no flag emoji).
export const LANG_CODE: Record<string, string> = { en: 'EN', ru: 'RU', el: 'GR', uk: 'UA', de: 'DE', he: 'HE', fr: 'FR', es: 'ES', ar: 'AR', zh: 'ZH' }
export const TRANSPORT_LABEL: Record<string, string> = { car: '🚗 Can give a lift', lift: '🙋 Needs a lift', meet: '📍 Meeting there' }

export const MOCK_SEEKERS = [
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

export const FORMAT_BADGE: Record<string, { color: string; label: string }> = {
  '1+1':   { color: '#f472b6', label: '1+1' },
  'squad': { color: '#818CF8', label: 'Squad' },
  'party': { color: '#fb923c', label: 'Party' },
}

export const FORMAT_SIZES: Record<string, [number, number]> = { '1+1': [2, 2], squad: [3, 5], party: [6, 20] }

export const MOCK_CHATS: any[] = []
export const MOCK_MESSAGES: Record<number, Array<{ from: string; text: string; time: string; senderName?: string; senderPhoto?: string; senderColor?: string }>> = {}

export const COUNTRIES = [
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

export const MUSIC_GENRES = [
  { id: 'rock',       label: 'Rock',        emoji: '🎸', colors: ['#1a0505', '#c0392b'] as const },
  { id: 'pop',        label: 'Pop',         emoji: '🎵', colors: ['#1a0020', '#e91e8c'] as const },
  { id: 'electronic', label: 'Electronic',  emoji: '🎧', colors: ['#0d0221', '#6c3fc5'] as const },
  { id: 'hiphop',     label: 'Hip-hop',     emoji: '🎤', colors: ['#0a0a0a', '#e67e22'] as const },
  { id: 'jazz',       label: 'Jazz',        emoji: '🎷', colors: ['#1c0f00', '#c8890a'] as const },
  { id: 'indie',      label: 'Indie',       emoji: '🌿', colors: ['#0a1a0a', '#2e7d32'] as const },
  { id: 'house',      label: 'House',       emoji: '🎹', colors: ['#050520', '#0288d1'] as const },
  { id: 'latin',      label: 'Latin',       emoji: '💃', colors: ['#1a0a00', '#d84315'] as const },
  { id: 'classical',  label: 'Classical',   emoji: '🎻', colors: ['#0a1020', '#2471a3'] as const },
  { id: 'rnb',        label: 'R&B',         emoji: '🎶', colors: ['#12001f', '#9b59b6'] as const },
  { id: 'metal',      label: 'Metal',       emoji: '🤘', colors: ['#0a0a0a', '#555']    as const },
  { id: 'reggae',     label: 'Reggae',      emoji: '🌴', colors: ['#0a1500', '#558b2f'] as const },
  { id: 'techno',     label: 'Techno',      emoji: '⚙️', colors: ['#050505', '#424242'] as const },
  { id: 'country',    label: 'Country',     emoji: '🤠', colors: ['#1a1000', '#a0522d'] as const },
  { id: 'punk',       label: 'Punk',        emoji: '✊', colors: ['#0f0010', '#ad1457'] as const },
  { id: 'soul',       label: 'Soul',        emoji: '🕯️', colors: ['#1a0505', '#bf360c'] as const },
]

export const PRIMARY_GENRE_COUNT = 10

// Vibe → categories mapping. Mixes legacy broad categories (coffee/wine/food/
// outdoors/sports/etc.) AND the granular community createTypes (boardgames/
// cinema/bar/hiking/etc.) so the For You feed surfaces the right events for
// each mood regardless of whether they came from the scraper or from a
// community host. Balanced stays empty as a catch-all (no vibe filter).
export const VIBE_CATS: Record<string, string[]> = {
  homebody:  ['coffee', 'culture', 'gaming', 'boardgames', 'cinema', 'walk'],
  chill:     ['coffee', 'wine', 'food', 'walk', 'picnic', 'dinner'],
  balanced:  [],
  social:    ['food', 'wine', 'outdoors', 'sports', 'bar', 'beach', 'hiking', 'daytrip', 'boat', 'picnic', 'dinner'],
  party:     ['music', 'wine', 'dance', 'food', 'bar', 'beach'],
}

// Dealbreakers we can actually enforce against existing profile data.
// no_drugs / no_loud / no_kids removed for now — no DB column / event flag
// to check against. Reintroduce when those fields exist.
export const DEALBREAKERS = [
  { id: 'no_smoking',   emoji: '🚭', label: 'No smoking',        desc: "Can't be around smoke" },
  { id: 'sober_only',   emoji: '🥛', label: 'Prefer sober',      desc: 'No heavy drinking' },
  { id: 'pets_allergy', emoji: '🐾', label: 'Pet allergy',        desc: "Can't be near pets" },
]

export const QUEUE_PROFILES = [
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

export const VIBE_FORMAT_MAX: Record<string, number>       = { '1+1': 2, squad: 5, party: 20 }
export const VIBE_FORMAT_THRESHOLD: Record<string, number> = { '1+1': 2, squad: 5, party: 12 }
export const VIBE_FORMAT_LABEL: Record<string, string>     = { '1+1': 'Duo', squad: 'Squad', party: 'Party' }
export const GOAL_LABEL: Record<string, string>            = { chill: '😌 Chill', networking: '🤝 Networking', activity: '⚡ Activity' }

export const REPORT_REASONS = ['Inappropriate content', 'Spam or fake profile', 'Harassment', 'Underage user', 'Other']

export const CREATE_EVENT_TYPES = [
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

export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Limassol: { lat: 34.7071, lng: 33.0226 },
  Nicosia:  { lat: 35.1856, lng: 33.3823 },
  Larnaca:  { lat: 34.9229, lng: 33.6233 },
  Paphos:   { lat: 34.7720, lng: 32.4297 },
}
