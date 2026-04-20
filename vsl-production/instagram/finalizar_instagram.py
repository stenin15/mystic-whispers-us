# -*- coding: utf-8 -*-
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

USERNAME = 'madamauroraofficial'
PASSWORD = 'w89u.?kEWuGizhz'
BASE     = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram')
IMAGES   = BASE / 'images'
STORIES_DIR = BASE / 'stories'

PROFILE = "https://www.instagram.com/madamauroraofficial/"

HIGHLIGHTS = [
    ("Free Read",    ["fr01_cta_link.png","fr02_how_it_works.png","fr03_what_you_get.png"]),
    ("Results",      ["re01_sarah.png","re02_dana.png","re03_rachel.png","re04_500k.png"]),
    ("Palm Lines",   ["pl01_heart_line.png","pl02_head_line.png","pl03_life_line.png","pl04_fate_line.png"]),
    ("About Aurora", ["ab01_who.png","ab02_why_palm.png","ab03_mission.png"]),
    ("FAQ",          ["fq01_is_it_real.png","fq02_how_does_it_work.png","fq03_really_free.png","fq04_skeptic.png"]),
]


async def dismiss(page):
    for txt in ['Not Now','Not now','Turn On','Cancel']:
        try:
            b = page.locator(f'button:has-text("{txt}")')
            if await b.count() > 0:
                await b.first.click(force=True)
                await asyncio.sleep(0.8)
        except: pass


async def login(page):
    await page.goto('https://www.instagram.com/accounts/login/', wait_until='domcontentloaded')
    await asyncio.sleep(5)
    for txt in ['Allow all cookies','Accept All']:
        b = page.locator(f'button:has-text("{txt}")')
        if await b.count() > 0:
            await b.first.click(); await asyncio.sleep(2); break
    await page.fill('input[name="email"]', USERNAME)
    await asyncio.sleep(1)
    await page.fill('input[name="pass"]', PASSWORD)
    await asyncio.sleep(1)
    await page.keyboard.press('Enter')
    await asyncio.sleep(10)
    await dismiss(page)
    if 'onetap' in page.url or 'accounts' in page.url:
        await page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
        await asyncio.sleep(4)
    print(f'  Login OK')


# ─── FOTO DE PERFIL ────────────────────────────────────────────
async def set_profile_photo(page):
    print('\n=== FOTO DE PERFIL ===')
    img = IMAGES / '00_profile.png'

    await page.goto('https://www.instagram.com/accounts/edit/', wait_until='domcontentloaded')
    await asyncio.sleep(5)
    await dismiss(page)

    try:
        async with page.expect_file_chooser(timeout=10000) as fc_info:
            # Clica no botao "Change photo" visivel na pagina de edit
            btn = page.get_by_role('button', name='Change photo')
            await btn.wait_for(timeout=8000)
            await btn.click()
        fc = await fc_info.value
        await fc.set_files(str(img))
        await asyncio.sleep(5)
        # Confirma
        for txt in ['Apply','Done','Save','Next']:
            b = page.locator(f'button:has-text("{txt}")')
            if await b.count() > 0:
                await b.first.click(force=True)
                await asyncio.sleep(3)
                break
        print('  Foto OK')
    except Exception as e:
        print(f'  ERR foto: {e}')
        await page.screenshot(path='err_foto.png')


# ─── PIN (tenta via web, instrui via mobile se falhar) ─────────
async def pin_posts(page):
    print('\n=== FIXANDO POSTS ===')

    # Apos converter para Professional, o pin deve aparecer
    # Tenta em cada um dos 3 primeiros posts
    await page.goto(PROFILE, wait_until='domcontentloaded')
    await asyncio.sleep(4)
    await dismiss(page)

    # Pega links dos posts do grid
    links = await page.locator('a[href*="/p/"]').all()
    hrefs = []
    seen = set()
    for l in links:
        h = await l.get_attribute('href') or ''
        if '/p/' in h and h not in seen:
            seen.add(h)
            hrefs.append(h)

    pinned = 0
    for i, href in enumerate(hrefs[:3]):
        print(f'  Post {i+1}: {href}')
        url = f'https://www.instagram.com{href}'
        await page.goto(url, wait_until='domcontentloaded')
        await asyncio.sleep(4)

        try:
            # Clica ... (More options)
            more = page.locator('svg[aria-label="More options"]').first
            await more.click(force=True)
            await asyncio.sleep(2)

            # Procura Pin
            pin = page.locator('button:has-text("Pin to your profile")')
            if await pin.count() > 0:
                await pin.first.click(force=True)
                await asyncio.sleep(3)
                pinned += 1
                print(f'    FIXADO!')
            else:
                opts = [await b.inner_text() for b in await page.locator('[role="dialog"] button').all()]
                print(f'    Menu: {opts}')
                await page.keyboard.press('Escape')
        except Exception as e:
            print(f'    ERR: {e}')

    if pinned == 0:
        print('\n  Pin nao disponivel no web para essa conta.')
        print('  ACAO MANUAL NO CELULAR (2 min):')
        print('  -> Abra o app Instagram')
        print('  -> Va em cada um dos 3 posts de PIN')
        print('  -> Toque nos 3 pontinhos (...)')
        print('  -> Selecione "Fixar no seu perfil"')


# ─── HIGHLIGHTS ────────────────────────────────────────────────
async def create_highlights(page):
    print('\n=== CRIANDO HIGHLIGHTS ===')

    for hl_name, story_files in HIGHLIGHTS:
        print(f'\n  [{hl_name}]')

        await page.goto(PROFILE, wait_until='domcontentloaded')
        await asyncio.sleep(5)
        await dismiss(page)

        # Encontra o circulo "New" no perfil (nao o + da sidebar)
        # O botao de novo highlight fica na secao de stories/highlights do perfil
        # Usa JS para encontrar o elemento correto
        clicked = await page.evaluate('''
            () => {
                // Busca botoes com texto "New" que estejam dentro do main/article (nao nav)
                const all = document.querySelectorAll('[role="button"], button');
                for (const el of all) {
                    const txt = el.textContent.trim();
                    const rect = el.getBoundingClientRect();
                    // O botao New de highlight fica abaixo do header do perfil (y > 200)
                    // e nao e o botao da sidebar (x > 70)
                    if (txt === 'New' && rect.y > 150 && rect.x > 70 && rect.width < 120) {
                        el.click();
                        return {x: rect.x, y: rect.y, txt: txt};
                    }
                }
                // Tenta pelo SVG de + dentro da secao de highlights
                const svgs = document.querySelectorAll('svg');
                for (const svg of svgs) {
                    const rect = svg.getBoundingClientRect();
                    if (rect.y > 150 && rect.x > 70 && rect.width < 80) {
                        const btn = svg.closest('[role="button"], button');
                        if (btn) { btn.click(); return {x: rect.x, y: rect.y, txt: 'svg'}; }
                    }
                }
                return null;
            }
        ''')
        print(f'    Botao New: {clicked}')
        await asyncio.sleep(3)
        await page.screenshot(path=f'debug_hl_{hl_name.replace(" ","_")}.png')

        # Verifica se abriu o modal de highlight (nao o Create menu)
        if await page.locator('button:has-text("Next")').count() == 0:
            # Pode ter aberto o submenu Create — fecha e tenta clique por coordenada
            await page.keyboard.press('Escape')
            await asyncio.sleep(1)

            # Tenta clicar pela posicao (o circulo New fica logo apos a foto de perfil)
            await page.mouse.click(80, 320)  # posicao aproximada do circulo New
            await asyncio.sleep(3)
            await page.screenshot(path=f'debug_hl_{hl_name.replace(" ","_")}_b.png')

        # Seleciona stories no modal
        checkboxes = page.locator('div[role="checkbox"], input[type="checkbox"], span[role="checkbox"]')
        cb_count = await checkboxes.count()
        print(f'    Stories no modal: {cb_count}')

        if cb_count > 0:
            to_sel = min(len(story_files), cb_count)
            for j in range(to_sel):
                try:
                    await checkboxes.nth(j).click(force=True)
                    await asyncio.sleep(0.4)
                except: pass

            # Next
            nxt = page.locator('button:has-text("Next")').first
            if await nxt.count() > 0:
                await nxt.click(force=True)
                await asyncio.sleep(2)

            # Nome
            name_inp = page.locator('input[maxlength="15"], input[placeholder*="itle"]').first
            if await name_inp.count() > 0:
                await name_inp.triple_click()
                await name_inp.fill(hl_name)
                await asyncio.sleep(1)

            # Add
            add = page.locator('button:has-text("Add"), button:has-text("Done")').first
            if await add.count() > 0:
                await add.click(force=True)
                await asyncio.sleep(4)
                print(f'    Highlight "{hl_name}" CRIADO!')
            else:
                print(f'    ERR: botao Add nao encontrado')
                await page.screenshot(path=f'err_hl_{hl_name.replace(" ","_")}.png')
                await page.keyboard.press('Escape')
        else:
            print(f'    Nenhum story encontrado no modal')
            await page.screenshot(path=f'err_hl_{hl_name.replace(" ","_")}_nostories.png')
            await page.keyboard.press('Escape')

        await asyncio.sleep(3)

    print('\n  Highlights concluido')


# ─── MAIN ──────────────────────────────────────────────────────
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        ctx = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await ctx.new_page()

        await login(page)
        await set_profile_photo(page)
        await pin_posts(page)
        await create_highlights(page)

        print('\n=== CONCLUIDO ===')
        await asyncio.sleep(5)
        await browser.close()

asyncio.run(main())
