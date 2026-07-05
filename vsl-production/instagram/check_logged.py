import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from env_loader import require_env

USERNAME = require_env("IG_USERNAME")
PASSWORD = require_env("IG_PASSWORD")

async def login(page):
    await page.goto('https://www.instagram.com/accounts/login/')
    await asyncio.sleep(5)
    await page.fill('input[name="email"]', USERNAME)
    await asyncio.sleep(1)
    await page.fill('input[name="pass"]', PASSWORD)
    await asyncio.sleep(1)
    login_btn = page.locator('div[role="button"]:has-text("Log In"), div[aria-label="Log In"]')
    if await login_btn.count() > 0:
        await login_btn.first.click()
    else:
        await page.keyboard.press('Enter')
    await asyncio.sleep(8)
    for txt in ['Not Now', 'Agora não']:
        btn = page.locator(f'button:has-text("{txt}")')
        if await btn.count() > 0:
            await btn.first.click()
            await asyncio.sleep(2)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await context.new_page()
        await login(page)

        await page.screenshot(path='screenshot_feed.png')
        print('URL:', page.url)

        print('\nTodos aria-labels:')
        els = page.locator('[aria-label]')
        count = await els.count()
        for i in range(min(count, 50)):
            el = els.nth(i)
            label = await el.get_attribute('aria-label')
            tag = await el.evaluate('el => el.tagName')
            href = await el.get_attribute('href') or ''
            print(f'  {tag}: "{label}" href={href}')

        # Tenta ir na pagina de criar post
        await page.goto('https://www.instagram.com/create/style/')
        await asyncio.sleep(4)
        await page.screenshot(path='screenshot_create.png')
        print('\nCreate page URL:', page.url)
        print('Inputs na create page:')
        for i in range(await page.locator('input').count()):
            el = page.locator('input').nth(i)
            t = await el.get_attribute('type')
            print(f'  input type={t}')

        await browser.close()

asyncio.run(main())
