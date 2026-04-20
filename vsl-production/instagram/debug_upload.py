# -*- coding: utf-8 -*-
"""
Debug: captura screenshots em cada etapa do fluxo de upload
"""
import sys
import asyncio
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
from playwright.async_api import async_playwright

USERNAME = 'madamauroraofficial'
PASSWORD = 'w89u.?kEWuGizhz'
BASE  = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram')
IMG   = BASE / 'images' / 'g09_final_cta.png'

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=200)
        ctx = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await ctx.new_page()

        # Login
        await page.goto('https://www.instagram.com/accounts/login/', wait_until='domcontentloaded')
        await asyncio.sleep(5)
        for txt in ['Allow all cookies', 'Accept All']:
            btn = page.locator(f'button:has-text("{txt}")')
            if await btn.count() > 0:
                await btn.first.click()
                await asyncio.sleep(2)
                break
        await page.fill('input[name="email"]', USERNAME)
        await asyncio.sleep(1)
        await page.fill('input[name="pass"]', PASSWORD)
        await asyncio.sleep(1)
        await page.keyboard.press('Enter')
        await asyncio.sleep(10)

        for txt in ['Not now', 'Not Now', 'Turn On']:
            try:
                b = page.locator(f'button:has-text("{txt}")')
                if await b.count() > 0:
                    await b.first.click(force=True)
                    await asyncio.sleep(1)
            except: pass

        if 'accounts' in page.url or 'onetap' in page.url:
            await page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
            await asyncio.sleep(4)

        await page.screenshot(path='debug_01_feed.png')
        print('STEP 1: feed salvo - debug_01_feed.png')

        # Clica New post
        await page.evaluate('''
            () => {
                const labels = ["New post", "Create", "Criar"];
                for (const lbl of labels) {
                    const svg = document.querySelector(`svg[aria-label="${lbl}"]`);
                    if (svg) {
                        const btn = svg.closest("a, button, [role='button']");
                        if (btn) { btn.click(); return lbl; }
                    }
                }
            }
        ''')
        await asyncio.sleep(2)
        await page.screenshot(path='debug_02_after_create_click.png')
        print('STEP 2: apos clicar Create - debug_02_after_create_click.png')

        # Lista todos links/buttons visiveis
        print('\nElementos visiveis apos clicar Create:')
        els = page.locator('a, [role="menuitem"], [role="button"], button')
        count = await els.count()
        for i in range(min(count, 30)):
            el = els.nth(i)
            try:
                txt = (await el.inner_text()).strip().replace('\n', '|')[:40]
                href = await el.get_attribute('href') or ''
                role = await el.get_attribute('role') or ''
                aria = await el.get_attribute('aria-label') or ''
                if txt or aria:
                    print(f'  [{i}] "{txt}" aria="{aria}" role={role} href={href}')
            except: pass

        # Espera e clica Post
        try:
            post_link = page.get_by_role('link', name='Post')
            await post_link.wait_for(timeout=6000)
            await post_link.click()
            print('\nPost link clicado via get_by_role')
        except:
            # fallback href=#
            candidates = page.locator('a').filter(has_text='Post')
            count = await candidates.count()
            clicked = False
            for i in range(count):
                href = await candidates.nth(i).get_attribute('href') or ''
                if href in ('#', ''):
                    await candidates.nth(i).click(force=True)
                    print(f'\nPost link [fallback #{i}] clicado')
                    clicked = True
                    break
            if not clicked:
                print('\nERR: Post link nao encontrado')

        await asyncio.sleep(4)
        await page.screenshot(path='debug_03_after_post_click.png')
        print('STEP 3: apos clicar Post - debug_03_after_post_click.png')

        # Lista botoes no modal
        print('\nElementos no modal:')
        els2 = page.locator('button, [role="button"], input')
        count2 = await els2.count()
        for i in range(min(count2, 20)):
            el = els2.nth(i)
            try:
                txt = (await el.inner_text()).strip().replace('\n', '|')[:40]
                t = await el.get_attribute('type') or ''
                aria = await el.get_attribute('aria-label') or ''
                print(f'  [{i}] "{txt}" type={t} aria="{aria}"')
            except: pass

        # Tenta clicar "Select from computer"
        sel = page.locator('button:has-text("Select from computer"), button:has-text("Selecionar")')
        print(f'\nBotoes "Select from computer": {await sel.count()}')
        if await sel.count() > 0:
            print('Clicando Select from computer...')
            try:
                async with page.expect_file_chooser(timeout=8000) as fc_info:
                    await sel.first.click()
                fc = await fc_info.value
                await fc.set_files(str(IMG))
                print('UPLOAD OK!')
                await asyncio.sleep(4)
                await page.screenshot(path='debug_04_after_upload.png')
                print('STEP 4: apos upload - debug_04_after_upload.png')
            except Exception as e:
                print(f'ERR filechooser: {e}')
                await page.screenshot(path='debug_04_err.png')
        else:
            print('Botao Select nao encontrado')
            await page.screenshot(path='debug_03b_no_select_btn.png')

        print('\nNavegador aberto. Pressione ENTER para fechar...')
        input()
        await browser.close()

asyncio.run(main())
