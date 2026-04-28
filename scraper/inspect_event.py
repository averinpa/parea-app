import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        page = await context.new_page()

        await page.goto('https://www.soldoutticketbox.com/easyconsole.cfm/page/event/event_id/4368/lang/en', wait_until='networkidle')
        await page.wait_for_timeout(2000)

        content = await page.content()
        with open('c:/Users/shina/event_test.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Saved')
        await browser.close()

asyncio.run(main())
