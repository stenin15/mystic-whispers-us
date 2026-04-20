import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await ctx.new_page()

        # Login
        await page.goto('https://www.instagram.com/accounts/login/', wait_until='domcontentloaded')
        await asyncio.sleep(5)
        await page.fill('input[name="email"]', 'madamauroraofficial')
        await asyncio.sleep(1)
        await page.fill('input[name="pass"]', 'w89u.?kEWuGizhz')
        await asyncio.sleep(1)
        btn = page.locator('div[role="button"]').filter(has_text='Log In').first
        await btn.click(force=True)
        await asyncio.sleep(8)

        # Dismiss dialogs
        for txt in ['Not now', 'Not Now']:
            b = page.locator(f'button:has-text("{txt}"), a:has-text("{txt}")')
            if await b.count() > 0:
                await b.first.click(force=True)
                await asyncio.sleep(1)

        await page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
        await asyncio.sleep(4)

        # Clica no New post
        await page.evaluate('''
            const svgs = document.querySelectorAll('svg[aria-label="New post"]');
            for (const svg of svgs) {
                const btn = svg.closest("a, button, [role=button]");
                if (btn) { btn.click(); break; }
            }
        ''')
        await asyncio.sleep(2)

        await page.screenshot(path='debug_menu1.png')
        print('Screenshot 1 salvo (apos clicar New post)')

        # Lista todos elementos visiveis no submenu
        print('\nElementos no submenu:')
        els = page.locator('a, [role="menuitem"], [role="button"]')
        count = await els.count()
        for i in range(min(count, 40)):
            el = els.nth(i)
            txt = (await el.inner_text()).strip().replace('\n','|')[:50]
            href = await el.get_attribute('href') or ''
            role = await el.get_attribute('role') or ''
            if txt:
                print(f'  [{i}] "{txt}" role={role} href={href}')

        # Aguarda input do usuario para inspecionar
        print('\nNavegador aberto. Inspecione o menu manualmente.')
        print('Pressione ENTER para fechar...')
        input()
        await browser.close()

asyncio.run(main())
