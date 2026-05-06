import asyncio
import os
import sys
from pathlib import Path
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re
from supabase import create_client
from dotenv import load_dotenv

# Load .env from project root (parent of scraper/)
load_dotenv(Path(__file__).parent.parent / '.env')

SUPABASE_URL = 'https://olvwwfgzkafdgqcvskzs.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
if not SUPABASE_KEY:
    raise SystemExit('SUPABASE_SERVICE_KEY missing in .env')
BASE_URL = 'https://www.soldoutticketbox.com'

CITY_KEYWORDS = ['NICOSIA', 'LIMASSOL', 'PAPHOS', 'LARNACA', 'FAMAGUSTA', 'LEFKOSIA', 'LEMESOS']

def extract_city(venue_text):
    upper = venue_text.upper()
    for city in CITY_KEYWORDS:
        if city in upper:
            return city.capitalize()
    return ''

def clean_date(date_str):
    # Remove tabs and extra spaces
    return re.sub(r'[\t\n\r]+', ' ', date_str).strip()

async def get_event_links(page):
    await page.goto(f'{BASE_URL}/en/calendar', wait_until='domcontentloaded', timeout=60000)
    await page.wait_for_timeout(2000)
    content = await page.content()
    soup = BeautifulSoup(content, 'html.parser')
    links = set()
    for a in soup.find_all('a', href=True):
        href = a['href']
        if '/event/' in href or 'event_id' in href:
            if href.startswith('/'):
                href = BASE_URL + href
            href = href.split('?')[0].split('&')[0]
            links.add(href)
    return list(links)

async def scrape_event(page, url):
    try:
        en_url = url if ('lang/en' in url or 'lang=en' in url) else url + '/lang/en'
        await page.goto(en_url, wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_timeout(1500)
        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')

        # Skip events where every listed date is cancelled (CANCELLED label per row)
        date_rows = soup.find_all('tr', class_=lambda c: c and c.startswith('row'))
        if date_rows:
            def is_cancelled(row):
                span = row.find('span', class_='red')
                return span is not None and 'CANCELLED' in span.get_text(strip=True).upper()
            if all(is_cancelled(r) for r in date_rows):
                return {'_cancelled': True, 'ticket_link': url}

        # Title
        title = ''
        og_title = soup.find('meta', {'property': 'og:title'})
        if og_title:
            title = og_title.get('content', '').strip()
        if not title:
            h1 = soup.find('h1')
            if h1: title = h1.get_text(strip=True)

        # Image
        image = ''
        og_img = soup.find('meta', {'property': 'og:image'})
        if og_img:
            image = og_img.get('content', '').strip()

        # Structured fields
        date = venue = language = price = time_str = ''
        for el in soup.find_all(['span', 'div', 'p', 'li', 'td']):
            direct = ''.join(el.find_all(string=True, recursive=False)).strip()
            if not direct:
                direct = el.get_text(strip=True)
            if direct.startswith('When:') and not date and len(direct) < 150:
                raw = direct.replace('When:', '').strip()
                cleaned = clean_date(raw)
                # Split date and time if together
                parts = cleaned.split(' ')
                date = parts[0] if parts else cleaned
                time_str = parts[1] if len(parts) > 1 else ''
            elif direct.startswith('Where:') and not venue and len(direct) < 120:
                venue = direct.replace('Where:', '').strip()
            elif direct.startswith('Language:') and not language and len(direct) < 80:
                language = direct.replace('Language:', '').strip()
            elif direct.startswith('Tickets:') and not price and len(direct) < 200:
                price = direct.replace('Tickets:', '').strip()

        # Description — only text after "About the event:" marker
        desc = ''
        full_text = soup.get_text(separator=' ', strip=True)
        if 'About the event' in full_text:
            after = full_text[full_text.find('About the event') + len('About the event'):].lstrip(':').strip()
            # Remove everything after next known section markers
            for stop in ['Event Dates', 'EventDay', 'More about', 'Ticket', 'Producer', 'Organizer', 'Phone:', 'Email:', 'Website:']:
                if stop in after:
                    after = after[:after.find(stop)]
            desc = after.strip()[:800]

        city = extract_city(venue)

        # Category
        category = ''
        cat_map = {
            'MUSIC': 'music', 'THEATRE': 'theatre', 'THEATER': 'theatre',
            'DANCE': 'dance', 'CHILDREN': 'children', 'COMEDY': 'comedy',
            'STAND UP': 'comedy', 'ART': 'art', 'FESTIVAL': 'festival',
            'CONCERT': 'music', 'OPERA': 'theatre', 'BALLET': 'dance',
        }
        cat_el = soup.find('a', {'class': 'h3Style'})
        if cat_el:
            cat_text = cat_el.get_text(strip=True).upper()
            for key, val in cat_map.items():
                if key in cat_text:
                    category = val
                    break
            if not category:
                category = cat_text.lower()

        return {
            'title': title,
            'date_label': date,
            'time_label': time_str,
            'time': time_str,
            'location': venue,
            'city': city,
            'language': language,
            'price': price,
            'image_url': image,
            'description': desc,
            'category': category,
            'ticket_link': url,
            'source': 'soldout',
        }
    except Exception as e:
        print(f'Error: {e}')
        return None

async def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        page = await context.new_page()

        if len(sys.argv) > 1:
            links = [sys.argv[1]]
            print(f'Test mode — scraping only: {links[0]}')
        else:
            print('Getting event links...')
            links = await get_event_links(page)
            print(f'Found {len(links)} events')

        inserted = 0
        skipped = 0
        cancelled_removed = 0
        for url in links:
            print(f'Scraping: {url}')
            event = await scrape_event(page, url)
            if event and event.get('_cancelled'):
                # Remove from DB if previously inserted
                deleted = supabase.table('official_events').delete().eq('ticket_link', url).execute()
                if deleted.data:
                    cancelled_removed += 1
                    print(f'  Removed cancelled')
                else:
                    print(f'  Skipped cancelled')
                skipped += 1
                continue
            if not event or not event['title']:
                skipped += 1
                continue

            # Update if exists, insert if not
            existing = supabase.table('official_events').select('id').eq('ticket_link', url).execute()
            if existing.data:
                event_id = existing.data[0]['id']
                supabase.table('official_events').update(event).eq('id', event_id).execute()
                print(f'  Updated: {event["title"]}')
                inserted += 1
            else:
                result = supabase.table('official_events').insert(event).execute()
                if result.data:
                    print(f'  Inserted: {event["title"]}')
                    inserted += 1
                else:
                    print(f'  Failed: {result}')

        await browser.close()
        print(f'\nDone! Inserted: {inserted}, Skipped: {skipped}, Cancelled removed: {cancelled_removed}')

asyncio.run(main())
