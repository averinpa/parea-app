"""Quick diagnostic — dump calendar page nav structure to figure out
how soldoutticketbox.com lets us move between months."""
import asyncio
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 900},
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        page = await context.new_page()

        await page.goto('https://www.soldoutticketbox.com/en/calendar', wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_timeout(2500)

        title = await page.title()
        print(f'TITLE: {title}\n')

        # Dump ALL anchors (filter for nav-looking ones inline)
        anchors = await page.query_selector_all('a')
        print(f'ANCHORS total: {len(anchors)}')
        for i, a in enumerate(anchors):
            href = await a.get_attribute('href') or ''
            text = (await a.inner_text() or '').strip()[:60]
            cls = await a.get_attribute('class') or ''
            print(f'  [{i}] href={href!r}  text={text!r}  class={cls!r}')

        # Also dump page text length / a snippet to confirm content loaded
        body = await page.inner_text('body')
        print(f'\nBODY length: {len(body)} chars')
        print(f'BODY first 500: {body[:500]!r}')

        # All buttons
        buttons = await page.query_selector_all('button')
        print(f'\nBUTTONS ({len(buttons)}):')
        for b in buttons:
            text = (await b.inner_text() or '').strip()[:40]
            cls = await b.get_attribute('class') or ''
            on_click = await b.get_attribute('onclick') or ''
            if text or cls or on_click:
                print(f'  text="{text}"  class="{cls}"  onclick="{on_click[:80]}"')

        # URL after a possible click
        print(f'\nCURRENT URL: {page.url}')

        await page.wait_for_timeout(2000)
        await browser.close()


asyncio.run(main())
