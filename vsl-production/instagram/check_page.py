import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await context.new_page()
        await page.goto('https://www.instagram.com/accounts/login/')
        await asyncio.sleep(8)
        await page.screenshot(path='screenshot_login.png', full_page=True)
        print('URL:', page.url)
        print('Screenshot salvo: screenshot_login.png')
        print('Inputs encontrados:', await page.locator('input').count())
        print('Buttons encontrados:', await page.locator('button').count())
        # Mostra todos os inputs
        for i in range(await page.locator('input').count()):
            el = page.locator('input').nth(i)
            name = await el.get_attribute('name')
            type_ = await el.get_attribute('type')
            print(f'  input[{i}]: name={name} type={type_}')
        await browser.close()

asyncio.run(main())
