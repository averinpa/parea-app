"""One-off seed script: create ~20 mock bot profiles, distribute them across
upcoming official events as event_attendees (status='looking'), and pre-populate
a few group crew chats so a fresh tester (the friend testing the APK) lands on
a feed with visible activity instead of empty cards.

Static bots only — they don't accept invites or chat back. Friend can:
- See real numbers on event cards (N going / M crews forming).
- Open Vibe Check and find real-looking people to look at.
- Press Join on an existing crew → land in a chat with 2-3 bots.

NOT simulated:
- Bots accepting an Invite (would leave the friend stuck on 'Waiting').
- Bots posting messages (chat looks quiet but that's fine for beta).

Run once from project root:
    python scripts/seed_bots.py

Safe to re-run — script checks for existing 'bot:' prefixed profiles and
skips if found.
"""
import json
import os
import random
import sys
import uuid
from pathlib import Path

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

# Find .env (project root) the same way the scraper does.
ENV_PATH = Path(__file__).parent.parent / '.env'
if not ENV_PATH.exists():
    print(f"No .env at {ENV_PATH}")
    sys.exit(1)

# Tiny .env parser (no python-dotenv dependency).
env = {}
for line in ENV_PATH.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    k, v = line.split('=', 1)
    env[k.strip()] = v.strip().strip('"').strip("'")

SUPABASE_URL = env.get('EXPO_PUBLIC_SUPABASE_URL')
SERVICE_KEY  = env.get('SUPABASE_SERVICE_KEY')
if not SUPABASE_URL or not SERVICE_KEY:
    print("Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    sys.exit(1)

H = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
}


def rest(path, method='GET', body=None, params=None):
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    r = requests.request(method, url, headers=H, params=params, json=body, timeout=30)
    if r.status_code >= 400:
        print(f'{method} {path} → {r.status_code}: {r.text[:400]}')
        return None
    if r.text:
        try:
            return r.json()
        except Exception:
            return r.text
    return None


# ── 1. Idempotency check ─────────────────────────────────────────────────────
existing = rest('profiles', params={'select': 'id', 'bio': 'like.bot:*', 'limit': '1'})
if existing:
    print(f'Bots already seeded (found {len(existing)} with bot: bio). Aborting.')
    sys.exit(0)

# ── 2. Bot data templates ────────────────────────────────────────────────────
NAMES_F = ['Sofia', 'Maria', 'Anna', 'Elena', 'Katerina', 'Daria', 'Olya', 'Nina', 'Lia', 'Niki']
NAMES_M = ['Andreas', 'Marios', 'Nikos', 'Alex', 'Dima', 'Yuri', 'Costas', 'Tim', 'Sasha', 'Petros']
LANGS_POOLS = [['en', 'ru'], ['en', 'el'], ['ru'], ['en'], ['en', 'ru', 'el'], ['en', 'ru', 'uk']]
INTERESTS_ALL = [
    '🍷 Wine', '🎤 Concerts', '💃 Dance', '☕ Coffee', '🍕 Foodie', '👗 Fashion',
    '🏓 Padel', '🎾 Tennis', '🥾 Hiking', '🧘 Yoga', '🏊 Swimming',
    '🎨 Art', '✂️ Crafts', '📷 Photography', '🎸 Music', '📚 Books',
    '💻 IT', '🎮 Gaming', '🎬 Movies', '🎭 Theatre', '🎲 Board Games',
]
ENERGIES = ['homebody', 'chill', 'balanced', 'social', 'party']
DRINKS = ['Social drinker', 'Rarely', "Don't drink"]
SMOKING = ['Non-smoker', 'Social', 'Smoker']
CITIES = ['Limassol', 'Limassol', 'Limassol', 'Nicosia', 'Larnaca', 'Paphos']  # weighted toward Limassol
COLORS = ['#818CF8', '#F472B6', '#34D399', '#FBBF24', '#F87171', '#A78BFA',
          '#60A5FA', '#FB923C', '#22D3EE', '#A3E635']

random.seed(42)  # deterministic — re-running idempotency check protects against dupes

bots = []
for i in range(20):
    is_female = random.random() < 0.55
    name = random.choice(NAMES_F if is_female else NAMES_M)
    bots.append({
        'id': str(uuid.uuid4()),
        'name': name,
        'age': random.randint(22, 42),
        'gender': 'Female' if is_female else 'Male',
        'bio': f'bot: {random.choice(["Concert hopper", "Beach person", "Coffee snob", "Board game nerd", "Sunset chaser", "Foodie", "Bookworm", "Theater nerd"])} on Cyprus.',
        'langs': random.choice(LANGS_POOLS),
        'interests': random.sample(INTERESTS_ALL, k=random.randint(3, 5)),
        'social_energy': random.choice(ENERGIES),
        'drinks_pref': random.choice(DRINKS),
        'smoking_pref': random.choice(SMOKING),
        'has_pets': random.random() < 0.4,
        'city': random.choice(CITIES),
        'color': random.choice(COLORS),
        'photos': [f'https://i.pravatar.cc/600?img={(i * 3 + 4) % 70 + 1}'],
    })

# ── 3. Insert profiles ───────────────────────────────────────────────────────
print(f'Inserting {len(bots)} bot profiles...')
result = rest('profiles', method='POST', body=bots)
if not result:
    print('Profile insert failed — aborting.')
    sys.exit(1)
print(f'  OK — {len(result)} profiles created.')

# ── 4. Pick upcoming events (Limassol-heavy, must have future date) ─────────
from datetime import datetime, timedelta
today = datetime.now()
events = rest('official_events', params={'select': 'id,title,date_label,city', 'order': 'id', 'limit': '100'})


def parse_date(label):
    """Return datetime if label looks like a date in the future, else None."""
    if not label:
        return None
    for fmt in ('%d/%m/%Y', '%A, %d %B %Y', '%d %B %Y'):
        try:
            return datetime.strptime(label.strip(), fmt)
        except Exception:
            pass
    return None


future_events = []
for ev in events or []:
    d = parse_date(ev.get('date_label'))
    if d and d > today:
        future_events.append(ev)

print(f'Found {len(future_events)} future events. Picking 10.')
random.shuffle(future_events)
chosen = future_events[:10]

# ── 5. Distribute bots as event_attendees ──────────────────────────────────
# Each bot subscribes to 1-3 events, each event gets 3-8 bots.
print('Creating event_attendees rows...')
attendees = []
SIZE_RANGES = {'1+1': (2, 2), 'squad': (3, 5), 'party': (6, 20)}
for bot in bots:
    n_events = random.randint(1, 3)
    for ev in random.sample(chosen, k=min(n_events, len(chosen))):
        # event_ref_id = official_events.id + 100000
        ev_ref = ev['id'] + 100000
        fmt = random.choices(['1+1', 'squad', 'party'], weights=[1, 3, 2])[0]
        lo, hi = SIZE_RANGES[fmt]
        attendees.append({
            'event_ref_id': ev_ref,
            'event_title': ev['title'],
            'profile_id': bot['id'],
            'status': 'looking',
            'group_size_min': lo,
            'group_size_max': hi,
            'crew_pref': random.choice(['any', 'any', 'any', 'women', 'men']),
        })
result = rest('event_attendees', method='POST', body=attendees)
print(f'  OK — {len(result) if result else 0} attendee rows created.')

# ── 6. Pre-build a handful of crews so 'Join directly' has options ──────────
# Pick 4 events that ended up with 3+ bots subscribed, build one party/squad
# crew per event with 2-3 of those bots inside.
print('Creating pre-built crews...')
by_event = {}
for a in attendees:
    by_event.setdefault(a['event_ref_id'], []).append(a)
candidates = [(ev, lst) for ev, lst in by_event.items() if len(lst) >= 3]
random.shuffle(candidates)
crews_made = 0
for ev_ref, lst in candidates[:4]:
    # Pick a format weighted toward party (more room → friendlier 'Join').
    fmt = random.choices(['squad', 'party'], weights=[1, 2])[0]
    # Create the chat row.
    title = lst[0]['event_title']
    chat = rest('chats', method='POST', body={
        'event_id': ev_ref,
        'type': 'group',
        'format': fmt,
        'last_msg': '👋 Crew chat created',
    })
    if not chat:
        continue
    chat_id = chat[0]['id'] if isinstance(chat, list) else chat['id']
    # Pick 2-3 bots from this event's pool.
    members = random.sample(lst, k=min(3, len(lst)))
    member_rows = [{'chat_id': chat_id, 'profile_id': m['profile_id']} for m in members]
    rest('chat_members', method='POST', body=member_rows)
    # Flip their attendance to 'confirmed' so they're shown as in-crew, not lone.
    for m in members:
        rest('event_attendees', method='PATCH', body={'status': 'confirmed'},
             params={'event_ref_id': f'eq.{ev_ref}', 'profile_id': f'eq.{m["profile_id"]}'})
    crews_made += 1
    print(f'  crew {crews_made}: event {ev_ref} ({fmt}) with {len(members)} bots')

print(f'\nDone. {len(bots)} bots, {len(attendees)} attendances, {crews_made} crews.')
