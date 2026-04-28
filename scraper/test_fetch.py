import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto('https://www.soldoutticketbox.com', wait_until='networkidle')
        await page.wait_for_timeout(3000)
        content = await page.content()
        with open('page.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Saved to page.html')
        print('URL:', page.url)
        await browser.close()

asyncio.run(main())
