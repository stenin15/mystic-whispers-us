# -*- coding: utf-8 -*-
"""Cria os 5 highlights no @madamauroraofficial"""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

USERNAME = 'madamauroraofficial'
PASSWORD = 'w89u.?kEWuGizhz'
PROFILE  = "https://www.instagram.com/madamauroraofficial/"

HIGHLIGHTS = [
    ("Free Read",    3),
    ("Results",      4),
    ("Palm Lines",   4),
    ("About Aurora", 3),
    ("FAQ",          4),
]


async def dismiss(page):
    for txt in ['Not Now','Not now','Turn On','Cancel']:
        try:
            b = page.locator(f'button:has-text("{txt}")')
            if await b.count() > 0:
                await b.first.click(force=True)
                await asyncio.sleep(0.6)
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
    print('  Login OK')


async def open_new_highlight(page):
    """Clica no circulo + New do perfil e retorna True se o modal abriu"""
    await page.goto(PROFILE, wait_until='domcontentloaded')
    await asyncio.sleep(5)
    await dismiss(page)

    # Clica no circulo New (SVG no perfil, nao o + da sidebar)
    await page.evaluate('''
        () => {
            const all = document.querySelectorAll('[role="button"], button');
            for (const el of all) {
                const rect = el.getBoundingClientRect();
                if (rect.x > 70 && rect.y > 150 && rect.width < 120) {
                    const txt = el.textContent.trim();
                    if (txt === 'New' || el.querySelector('svg')) {
                        if (txt === 'New') { el.click(); return; }
                    }
                }
            }
            // Fallback: busca pelo texto New em span dentro de main
            const spans = document.querySelectorAll('main span, article span');
            for (const s of spans) {
                if (s.textContent.trim() === 'New') {
                    const btn = s.closest('[role="button"]') || s.parentElement;
                    if (btn) { btn.click(); return; }
                }
            }
        }
    ''')
    await asyncio.sleep(3)

    # Verifica se modal "New Highlight" abriu
    modal = page.locator('text="New Highlight"')
    if await modal.count() > 0:
        return True

    # Se abriu o submenu Create, fecha e tenta por coordenada
    await page.keyboard.press('Escape')
    await asyncio.sleep(1)

    # Coordenada do circulo New (baseado no debug: x=349, y=356)
    await page.mouse.click(183, 217)
    await asyncio.sleep(3)
    return await page.locator('text="New Highlight"').count() > 0


async def create_highlight(page, name, n_stories):
    print(f'\n  [{name}] ({n_stories} stories)')

    if not await open_new_highlight(page):
        print(f'    ERR: modal nao abriu')
        await page.screenshot(path=f'err_hl_{name.replace(" ","_")}.png')
        return False

    print(f'    Modal abriu')

    # Preenche o nome
    name_inp = page.locator('input[placeholder*="ighlight"], input[placeholder*="ame"]').first
    await name_inp.wait_for(timeout=5000)
    await name_inp.fill(name)
    await asyncio.sleep(1)
    print(f'    Nome: {name}')

    # Clica Next
    nxt = page.locator('button:has-text("Next")').first
    await nxt.click(force=True)
    await asyncio.sleep(4)
    await page.screenshot(path=f'debug_hl_{name.replace(" ","_")}_step2.png')

    # Agora deve mostrar os stories para selecionar
    # Tenta diferentes seletores de story thumbnail
    selectors = [
        'div[role="checkbox"]',
        'input[type="checkbox"]',
        'span[role="checkbox"]',
        'button[aria-label*="story"]',
        'div[aria-label*="story"]',
        'img[alt*="story"]',
    ]

    cb_count = 0
    for sel in selectors:
        items = page.locator(sel)
        c = await items.count()
        if c > 0:
            cb_count = c
            print(f'    Stories ({sel}): {c}')
            to_sel = min(n_stories, c)
            for j in range(to_sel):
                try:
                    await items.nth(j).click(force=True)
                    await asyncio.sleep(0.4)
                except: pass
            break

    if cb_count == 0:
        # Tenta selecionar todos os items visiveis na grid de stories
        all_items = await page.locator('div[role="dialog"] img, div[role="dialog"] [role="button"]').all()
        print(f'    Items no dialog: {len(all_items)}')
        for j, item in enumerate(all_items[:n_stories]):
            try:
                await item.click(force=True)
                await asyncio.sleep(0.4)
            except: pass
        cb_count = len(all_items)

    await page.screenshot(path=f'debug_hl_{name.replace(" ","_")}_selected.png')

    # Adiciona
    add = page.locator('button:has-text("Add"), button:has-text("Done"), button:has-text("Create")').first
    if await add.count() > 0:
        await add.click(force=True)
        await asyncio.sleep(4)
        print(f'    Highlight "{name}" CRIADO!')
        return True
    else:
        # Tenta avançar mais um step
        nxt2 = page.locator('button:has-text("Next")').first
        if await nxt2.count() > 0:
            await nxt2.click(force=True)
            await asyncio.sleep(3)
            add2 = page.locator('button:has-text("Add"), button:has-text("Done"), button:has-text("Create")').first
            if await add2.count() > 0:
                await add2.click(force=True)
                await asyncio.sleep(4)
                print(f'    Highlight "{name}" CRIADO!')
                return True

        print(f'    ERR: botao Add nao encontrado')
        await page.screenshot(path=f'err_hl_{name.replace(" ","_")}_noadd.png')
        await page.keyboard.press('Escape')
        return False


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

        ok = 0
        for name, n in HIGHLIGHTS:
            try:
                if await create_highlight(page, name, n):
                    ok += 1
            except Exception as e:
                print(f'    ERR geral {name}: {e}')
                await page.keyboard.press('Escape')
            await asyncio.sleep(4)

        print(f'\n=== {ok}/{len(HIGHLIGHTS)} highlights criados ===')

        if ok < len(HIGHLIGHTS):
            print('\nVeja os screenshots err_hl_*.png para diagnostico')
            print('Ou crie manualmente no celular em 3 min:')
            print('-> Perfil -> circulo + -> seleciona stories -> nomeia -> Add')

        await asyncio.sleep(5)
        await browser.close()

asyncio.run(main())
