import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        page = await context.new_page()

        # Test one of the NULL category events - HEARTBREAK HOTEL (id 9, need its ticket_link)
        await page.goto('https://www.soldoutticketbox.com/en/calendar', wait_until='networkidle')
        await page.wait_for_timeout(2000)
        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')

        # Find HEARTBREAK HOTEL link
        link = ''
        for a in soup.find_all('a', href=True):
            text = a.get_text(strip=True).lower()
            href = a['href'].lower()
            if 'heartbreak' in text or 'heartbreak' in href:
                link = a['href']
                print('Found link:', link)
                break

        if link:
            if link.startswith('/'):
                link = 'https://www.soldoutticketbox.com' + link
            await page.goto(link + '/lang/en', wait_until='networkidle')
            await page.wait_for_timeout(2000)
            content2 = await page.content()
            soup2 = BeautifulSoup(content2, 'html.parser')
            print('=== h3Style ===')
            for el in soup2.find_all('a', {'class': 'h3Style'}):
                print(el.get_text(strip=True))
            print('=== cat links ===')
            for el in soup2.find_all('a', href=True):
                if 'cat_id' in el['href']:
                    print(el['href'], '-', el.get_text(strip=True))

        await browser.close()

asyncio.run(main())
