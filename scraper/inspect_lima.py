"""Dump lima.events event page HTML + structured data.
Usage: python scraper/inspect_lima.py "<url>"  (default: BEONIX 228)
"""
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import requests
from bs4 import BeautifulSoup

url = sys.argv[1] if len(sys.argv) > 1 else 'https://lima.events/ru/events/228'
out_dir = Path(__file__).parent / '_debug'
out_dir.mkdir(exist_ok=True)

print(f'Fetching {url} ...')
r = requests.get(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}, timeout=30)
print(f'Status: {r.status_code}, Size: {len(r.text)} chars')

(out_dir / 'lima_event.html').write_text(r.text, encoding='utf-8')
soup = BeautifulSoup(r.text, 'html.parser')

# JSON-LD
ld_scripts = soup.find_all('script', {'type': 'application/ld+json'})
print(f'\n{len(ld_scripts)} JSON-LD blocks')
for i, s in enumerate(ld_scripts):
    body = s.string or ''
    try:
        data = json.loads(body)
        pretty = json.dumps(data, indent=2, ensure_ascii=False)
        (out_dir / f'lima_ld_{i}.json').write_text(pretty, encoding='utf-8')
        print(f'--- LD #{i} (saved) ---')
        print(pretty[:800])
    except Exception as e:
        print(f'LD #{i} parse error: {e}')

# OpenGraph / meta
print('\n--- Meta tags ---')
for tag in soup.find_all('meta'):
    prop = tag.get('property') or tag.get('name') or ''
    if any(k in prop.lower() for k in ['og:', 'twitter:', 'description', 'title', 'event']):
        content = (tag.get('content') or '')[:200]
        print(f'{prop}: {content}')

# h1 / title
print(f'\n<title>: {soup.find("title").get_text() if soup.find("title") else "N/A"}')
h1 = soup.find('h1')
print(f'<h1>: {h1.get_text(strip=True) if h1 else "N/A"}')

# Any element with 'event' or 'date' or 'time' in class
print('\n--- Elements with date/time/venue-like classes ---')
for el in soup.find_all(class_=True)[:80]:
    cls = ' '.join(el.get('class', []))
    if any(k in cls.lower() for k in ['date', 'time', 'venue', 'location', 'price', 'ticket']):
        txt = el.get_text(strip=True)[:100]
        if txt:
            print(f'  .{cls}: {txt}')

print(f'\nDone. Files in {out_dir}/')
