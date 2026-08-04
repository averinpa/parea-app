"""
Scraper for lima.events Cyprus events.

Usage:
  python scraper/scrape_lima.py                  # scrape all events from /ru
  python scraper/scrape_lima.py "<event URL>"    # test mode, one URL

Writes to official_events with source='lima'.
Dedup: by ticket_link (existing rows are updated, not duplicated).
"""
import json
import os
import re
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')

SUPABASE_URL = 'https://olvwwfgzkafdgqcvskzs.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
if not SUPABASE_KEY:
    raise SystemExit('SUPABASE_SERVICE_KEY missing in .env')

BASE_URL = 'https://lima.events'
LIST_URL = f'{BASE_URL}/en'

UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

# Venue → city map. Built up over the first full scrape when many lima
# venues came back with an empty city because addressLocality was blank
# and the venue name alone didn't say "Limassol". Anything added here
# survives the next `python scraper/scrape_lima.py` refresh.
CITY_KEYWORDS = {
    # Direct city names
    'NICOSIA': 'Nicosia', 'ЛЕВКОСИЯ': 'Nicosia', 'НИКОСИЯ': 'Nicosia',
    'LEFKOSIA': 'Nicosia', 'ΛΕΥΚΩΣΙΑ': 'Nicosia',
    'LIMASSOL': 'Limassol', 'ЛИМАССОЛ': 'Limassol',
    'LEMESOS': 'Limassol', 'ΛΕΜΕΣΟΣ': 'Limassol', 'ΛΕΜΕΣΟΥ': 'Limassol',
    'PAPHOS': 'Paphos', 'ПАФОС': 'Paphos', 'PAFOS': 'Paphos',
    'ΠΑΦΟΣ': 'Paphos', 'ΠΑΦΟΥ': 'Paphos',
    'LARNACA': 'Larnaca', 'ЛАРНАКА': 'Larnaca', 'ΛΑΡΝΑΚΑ': 'Larnaca',
    'FAMAGUSTA': 'Famagusta', 'ФАМАГУСТА': 'Famagusta', 'ΑΜΜΟΧΩΣΤΟΣ': 'Famagusta',
    'AYIA NAPA': 'Famagusta', 'АЙЯ НАПА': 'Famagusta', 'АЙЯ-НАПА': 'Famagusta',
    'PROTARAS': 'Famagusta', 'ПРОТАРАС': 'Famagusta',
    # Limassol venues + suburbs
    'ETKO': 'Limassol', 'CASTLE CLUB': 'Limassol', 'GUABA': 'Limassol',
    'PLATRES': 'Limassol', 'TSIRION': 'Limassol', 'CURIUM': 'Limassol',
    'EPISKOPI': 'Limassol', 'GOVERNOR': 'Limassol', 'PISSOURI': 'Limassol',
    'KOLOSSI': 'Limassol', 'MOUTTAGIAKA': 'Limassol', 'MAZE VENUE': 'Limassol',
    'VASILEOS KONSTANTINOU': 'Limassol', 'KTIMA CAMELOT': 'Limassol',
    'PANO AMIANTOS': 'Limassol', 'AMIANTOS': 'Limassol',
    'WAREHOUSE BY IT': 'Limassol', 'IT QUARTER': 'Limassol',
    'LYSITHEA': 'Limassol', 'OLD MARKET ST': 'Limassol', 'MASON BAR': 'Limassol',
    'SELINE': 'Limassol', 'BAD ZEBRA': 'Limassol',
    'ENAERIOS': 'Limassol', 'DASOUDI': 'Limassol', 'AKROTIRI': 'Limassol',
    'COLUMBIA SUN': 'Limassol', 'MUNICIPAL GARDEN THEATRE': 'Limassol',
    # Paphos venues + suburbs
    'CHLORAKA': 'Paphos', 'KISSONERGA': 'Paphos', 'CORAL BAY': 'Paphos',
    'PEYIA': 'Paphos', 'EMBA': 'Paphos', 'GEROSKIPOU': 'Paphos',
    'TECHNOPOLIS 20': 'Paphos', 'AKAMAS': 'Paphos',
    'ΛΙΜΑΝΑΚΙ': 'Paphos', 'ΛΙΜΑΝΆΚΙ': 'Paphos',
    'MINTHIS': 'Paphos', 'LATCHI': 'Paphos', 'POLIS': 'Paphos',
    'PORTO LATSI': 'Paphos', 'ΛΑΤΣΙ': 'Paphos',
    'ARODES': 'Paphos', 'ΑΡΟΔΕΣ': 'Paphos',
    'SAILAWAY': 'Paphos', 'CATAMARAN': 'Paphos',
    'AGIA MARINA CHRYSOCHOUS': 'Paphos', 'CHRYSOCHOUS': 'Paphos',
    # Larnaca venues + suburbs
    'MACKENZIE': 'Larnaca', 'OCEANIA BEACH': 'Larnaca', 'HAVANA BEACH': 'Larnaca',
    'FINIKOUDES': 'Larnaca', 'DHEKELIA': 'Larnaca',
    'OROKLINI': 'Larnaca', 'PYLA': 'Larnaca', 'ZYGI': 'Larnaca',
    'PLAGE DU SOLEIL': 'Larnaca', 'PLAGEDUSOLEIL': 'Larnaca', 'AKAKIA': 'Larnaca',
    # Nicosia venues + suburbs
    'LAKATAMIA': 'Nicosia', 'ΛΑΚΑΤΑΜ': 'Nicosia',
    'PALLAS THEAT': 'Nicosia', 'ΘΕΑΤΡΟ ΠΑΛΛΑΣ': 'Nicosia', 'ΠΑΛΛΆΣ': 'Nicosia',
    'LEA WOMEN': 'Nicosia', 'SUNMOON': 'Nicosia',
    'SATIRIKO': 'Nicosia', 'ATHALASSA': 'Nicosia', 'STROVOLOS': 'Nicosia',
    'DEFTERA': 'Nicosia', 'LATSIA': 'Nicosia', 'AGLANTZIA': 'Nicosia',
    'ENGOMI': 'Nicosia', 'EGKOMI': 'Nicosia', 'MAKEDONITISSA': 'Nicosia',
    'DASOUPOLIS': 'Nicosia', 'KAIMAKLI': 'Nicosia',
    'FOREST MARKET CYPRUS': 'Nicosia',
    'ΠΥΛΗ ΑΜΜΟΧΩΣΤ': 'Nicosia', 'FAMAGUSTA GATE': 'Nicosia',
    'UCY': 'Nicosia', 'UNIVERSITY OF CYPRUS': 'Nicosia',
    # Ayia Napa / Protaras venues
    'NISSI BEACH': 'Famagusta', 'MAKRONISOS': 'Famagusta', 'GRECIAN': 'Famagusta',
    'CAPE GRECO': 'Famagusta', 'KONNOS': 'Famagusta',
    'CHALKIES': 'Famagusta', 'SANDY-BEACH': 'Famagusta', 'SANDY BEACH': 'Famagusta',
    'AGIA TRIADA': 'Famagusta', 'ΑΓΊΑ ΤΡΙΆΔΑ': 'Famagusta', 'KAPPARIS': 'Famagusta',
}


def _strip_greek_accents(text: str) -> str:
    """Greek text in the wild appears with and without tonos (ά vs α, ό vs ο, …).
    ILIKE-style matching that hard-codes accented chars misses the un-accented
    form and vice-versa, so we compare both sides in an accent-flattened form."""
    subs = str.maketrans({
        'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω',
        'Ϊ': 'Ι', 'Ϋ': 'Υ', 'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι',
        'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω', 'ϊ': 'ι', 'ϋ': 'υ', 'ΐ': 'ι', 'ΰ': 'υ',
    })
    return text.translate(subs)


def extract_city(text: str) -> str:
    upper = _strip_greek_accents((text or '').upper())
    for key, city in CITY_KEYWORDS.items():
        if _strip_greek_accents(key.upper()) in upper:
            return city
    return ''


# Lima aggregates non-Cyprus events too (student fairs in Nuremberg, etc.).
# If venue or title clearly names another country's city, skip the event —
# the app is Cyprus-scoped and non-Cyprus rows just clutter the feed.
NON_CYPRUS_KEYWORDS = (
    'ERLANGEN', 'NUREMBERG', 'NÜRNBERG', 'NURNBERG', 'LUITPOLDHAIN',
    'BERLIN', 'MUNICH', 'MÜNCHEN', 'HAMBURG', 'FRANKFURT', 'GERMANY',
    'ATHENS', 'ΑΘΗΝΑ', 'THESSALONIKI', 'ΘΕΣΣΑΛΟΝΙΚΗ',
    'LONDON', 'PARIS', 'ROME', 'MADRID',
)


def is_non_cyprus(*texts) -> bool:
    joined = ' '.join((t or '') for t in texts).upper()
    return any(k in joined for k in NON_CYPRUS_KEYWORDS)


def parse_iso(iso_str: str):
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})', iso_str or '')
    if not m:
        return '', ''
    y, mo, d, hh, mm = m.groups()
    return f'{d}/{mo}/{y}', f'{hh}:{mm}'


def normalize_url(url: str) -> str:
    u = url.split('?')[0].split('#')[0]
    return u.rstrip('/')


def infer_category(name: str, description: str) -> str:
    text = f'{name} {description}'.lower()
    if any(k in text for k in ['festival', 'фестиваль']):
        return 'festival'
    if any(k in text for k in ['rave', 'club', 'dj ', 'party', 'вечеринка', 'клуб']):
        return 'party'
    if any(k in text for k in ['concert', 'концерт', 'live music', 'tour', 'тур']):
        return 'music'
    if any(k in text for k in ['театр', 'theatre', 'theater', 'спектакль']):
        return 'theatre'
    if any(k in text for k in ['comedy', 'standup', 'стенд-ап', 'стендап']):
        return 'comedy'
    if any(k in text for k in ['exhibition', 'выставка']):
        return 'exhibition'
    if any(k in text for k in ['sport', 'спорт', 'football', 'футбол']):
        return 'sports'
    if any(k in text for k in ['kids', 'children', 'для детей', 'детск']):
        return 'kids'
    if any(k in text for k in ['food', 'wine', 'еда', 'вино', 'ужин']):
        return 'food'
    return 'other'


def get_event_links() -> list:
    print(f'Fetching {LIST_URL} ...')
    r = requests.get(LIST_URL, headers=UA, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    ids = set()
    for a in soup.find_all('a', href=True):
        m = re.match(r'^/(?:en|ru)/events/(\d+)$', a['href'])
        if m:
            ids.add(m.group(1))
    return [f'{BASE_URL}/en/events/{i}' for i in sorted(ids, key=int)]


def scrape_event(url: str):
    try:
        r = requests.get(url, headers=UA, timeout=30)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        event_obj = None
        for script in soup.find_all('script', {'type': 'application/ld+json'}):
            try:
                data = json.loads(script.string or '{}')
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if isinstance(item, dict) and item.get('@type') in ('Event', 'MusicEvent', 'Festival'):
                        event_obj = item
                        break
                if event_obj:
                    break
            except Exception:
                continue

        if not event_obj:
            return None

        title = event_obj.get('name', '')
        start = event_obj.get('startDate', '')
        date_label, time_str = parse_iso(start)

        # Bail early on non-Cyprus events (student fairs in Nuremberg, etc.).
        # Uses venue name from JSON-LD and title — description is checked later.
        _loc_probe = event_obj.get('location') or {}
        if isinstance(_loc_probe, list):
            _loc_probe = _loc_probe[0] if _loc_probe else {}
        _venue_probe = _loc_probe.get('name', '') if isinstance(_loc_probe, dict) else ''
        if is_non_cyprus(title, _venue_probe):
            return {'_non_cyprus': True, 'title': title}

        loc = event_obj.get('location') or {}
        if isinstance(loc, list):
            loc = loc[0] if loc else {}
        venue = loc.get('name', '') if isinstance(loc, dict) else ''

        description = (event_obj.get('description') or '').strip()
        if len(description) > 600:
            description = description[:597] + '...'

        city = ''
        if isinstance(loc, dict):
            addr = loc.get('address') or {}
            if isinstance(addr, dict):
                city = addr.get('addressLocality') or ''
        # addressLocality is often blank or a country code (e.g. "CY") — treat
        # both as "no city" and fall through to venue/title/description keyword
        # lookup (description sometimes says "Come to our event in Larnaca!").
        if city.strip().upper() in ('', 'CY', 'CYPRUS'):
            city = extract_city(venue) or extract_city(title) or extract_city(description)

        image = event_obj.get('image', '')
        if isinstance(image, list):
            image = image[0] if image else ''

        offers = event_obj.get('offers') or {}
        if isinstance(offers, list):
            offers = offers[0] if offers else {}
        price = ''
        if isinstance(offers, dict) and offers.get('price'):
            p = offers['price']
            cur = offers.get('priceCurrency', '')
            sym = '€' if cur == 'EUR' else (cur + ' ' if cur else '')
            price = f'{sym}{p}'

        language = 'English'  # /en locale — scrape English content by default
        category = infer_category(title, description)

        return {
            'title': title,
            'date_label': date_label,
            'time_label': time_str,
            'time': time_str,
            'location': venue,
            'city': city,
            'language': language,
            'price': price,
            'image_url': image,
            'description': description,
            'category': category,
            'ticket_link': normalize_url(url),
            'source': 'lima',
        }
    except Exception as e:
        print(f'  Error: {e}')
        return None


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    if len(sys.argv) > 1:
        links = [sys.argv[1]]
        print(f'Test mode — {links[0]}')
    else:
        links = get_event_links()
        print(f'Found {len(links)} events on lima.events\n')

    inserted = updated = skipped = 0
    for url in links:
        canon = normalize_url(url)
        print(f'Scraping: {canon}')
        event = scrape_event(canon)
        if event and event.get('_non_cyprus'):
            print(f'  Skipped (non-Cyprus): {event.get("title", "")}')
            skipped += 1
            time.sleep(0.3)
            continue
        if not event or not event['title'] or not event['date_label']:
            print(f'  Skipped (no JSON-LD or missing fields)')
            skipped += 1
            time.sleep(0.3)
            continue

        # Dedup logic — 2 levels:
        # 1) Same lima URL (/en/ or /ru/ variant) → update
        # 2) Cross-source: same title (normalized) + same date_label from ANY source
        #    → skip (do not overwrite soldout/manual event with lima data)
        alt = canon.replace('/en/events/', '/ru/events/')
        existing = supabase.table('official_events').select('id, ticket_link, source').or_(
            f'ticket_link.eq.{canon},ticket_link.eq.{alt}'
        ).execute()
        if existing.data:
            event_id = existing.data[0]['id']
            supabase.table('official_events').update(event).eq('id', event_id).execute()
            print(f'  Updated: {event["title"]}')
            updated += 1
        else:
            # Cross-source dedup:
            #   Same date_label + at least one shared "significant" word (len >= 5,
            #   not a stopword and not a city name). Catches "STING 3.0 WORLD TOUR..."
            #   vs "STING in CYPRUS - 04.08.2026" as same event.
            STOPWORDS = {
                'WORLD', 'TOUR', 'LIVE', 'PARTY', 'NIGHT', 'CONCERT', 'FESTIVAL',
                'SHOW', 'PRESENTS', 'EVENT', 'INTERNATIONAL', 'CYPRUS',
                'LIMASSOL', 'NICOSIA', 'PAPHOS', 'LARNACA', 'FAMAGUSTA',
                'AYIA', 'PROTARAS', 'LEFKOSIA', 'LEMESOS',
                'GLOBAL', 'PLAYERS', 'BEACH', 'CLUB', 'HOUSE',
            }
            def sig_words(t):
                words = re.findall(r'[A-Za-zА-Яа-я0-9]{5,}', (t or '').upper())
                return {w for w in words if w not in STOPWORDS}

            new_words = sig_words(event['title'])
            same_date = supabase.table('official_events').select('id, title, source, date_label').eq(
                'date_label', event['date_label']
            ).execute()
            cross_match = None
            for row in (same_date.data or []):
                existing_words = sig_words(row.get('title') or '')
                if new_words & existing_words:  # any shared significant word
                    cross_match = row
                    break
            if cross_match:
                print(f'  Skipped (matches {cross_match["source"]} #{cross_match["id"]} "{cross_match["title"]}")')
                skipped += 1
                time.sleep(0.3)
                continue
            result = supabase.table('official_events').insert(event).execute()
            if result.data:
                print(f'  Inserted: {event["title"]} [{event["category"]}, {event["city"]}]')
                inserted += 1
            else:
                print(f'  Failed: {result}')
                skipped += 1
        time.sleep(0.3)  # be gentle

    print(f'\nDone. Inserted: {inserted}, Updated: {updated}, Skipped: {skipped}')


if __name__ == '__main__':
    main()
