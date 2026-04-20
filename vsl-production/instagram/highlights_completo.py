# -*- coding: utf-8 -*-
"""
Posta stories e cria highlights em sequencia.
Flow por highlight:
  1. Posta cada imagem como story
  2. Imediatamente apos o ultimo story do grupo → Add to Highlight
"""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

USERNAME = 'madamauroraofficial'
PASSWORD = 'w89u.?kEWuGizhz'
BASE     = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram')
STORIES  = BASE / 'stories'

HIGHLIGHTS = [
    ("Free Read",    ["fr01_cta_link.png", "fr02_how_it_works.png", "fr03_what_you_get.png"]),
    ("Results",      ["re01_sarah.png", "re02_dana.png", "re03_rachel.png", "re04_500k.png"]),
    ("Palm Lines",   ["pl01_heart_line.png", "pl02_head_line.png", "pl03_life_line.png", "pl04_fate_line.png"]),
    ("About Aurora", ["ab01_who.png", "ab02_why_palm.png", "ab03_mission.png"]),
    ("FAQ",          ["fq01_is_it_real.png", "fq02_how_does_it_work.png", "fq03_really_free.png", "fq04_skeptic.png"]),
]


async def dismiss(page):
    for txt in ['Not Now', 'Not now', 'Turn On', 'Cancel']:
        try:
            b = page.locator(f'button:has-text("{txt}")')
            if await b.count() > 0:
                await b.first.click(force=True)
                await asyncio.sleep(0.8)
        except:
            pass


async def login(page):
    await page.goto('https://www.instagram.com/accounts/login/', wait_until='domcontentloaded')
    await asyncio.sleep(5)
    for txt in ['Allow all cookies', 'Accept All']:
        b = page.locator(f'button:has-text("{txt}")')
        if await b.count() > 0:
            await b.first.click()
            await asyncio.sleep(2)
            break
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
    print('Login OK')


async def enable_archive(page):
    """Garante que Story Archive está habilitado"""
    print('\nHabilitando arquivo de stories...')
    await page.goto('https://www.instagram.com/accounts/privacy-and-security/', wait_until='domcontentloaded')
    await asyncio.sleep(4)
    # Tenta tambem via configuracoes diretas
    await page.goto('https://www.instagram.com/accounts/archive-story/', wait_until='domcontentloaded')
    await asyncio.sleep(3)

    # Busca toggle de arquivo
    toggle = page.locator('input[type="checkbox"]').first
    if await toggle.count() > 0:
        checked = await toggle.is_checked()
        if not checked:
            await toggle.click(force=True)
            await asyncio.sleep(2)
            print('  Arquivo ativado')
        else:
            print('  Arquivo ja estava ativo')
    else:
        print('  Toggle nao encontrado — continuando mesmo assim')

    await page.screenshot(path='debug_archive.png')


async def post_story(page, img_path):
    """Posta uma imagem como story. Retorna True se ok."""
    print(f'  Postando story: {img_path.name}')

    # Vai para criacao de story
    await page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
    await asyncio.sleep(3)
    await dismiss(page)

    # Clica no icone de camera/story ou usa o + → Story
    # Tenta via botao Create na sidebar
    try:
        async with page.expect_file_chooser(timeout=8000) as fc_info:
            # Clica no + (Create) da sidebar
            create_btn = page.locator('svg[aria-label="New post"]').first
            if await create_btn.count() == 0:
                create_btn = page.locator('[aria-label*="Create"], [aria-label*="New"]').first
            await create_btn.click(force=True)
            await asyncio.sleep(2)

            # Seleciona Story no submenu
            story_opt = page.locator('span:has-text("Story"), button:has-text("Story")')
            if await story_opt.count() > 0:
                await story_opt.first.click(force=True)
                await asyncio.sleep(2)
        fc = await fc_info.value
        await fc.set_files(str(img_path))
        await asyncio.sleep(4)
        await page.screenshot(path=f'debug_story_{img_path.stem}.png')

        # Clica Share/Your story
        for txt in ['Share', 'Your Story', 'Share to story']:
            btn = page.locator(f'button:has-text("{txt}")').first
            if await btn.count() > 0:
                await btn.click(force=True)
                await asyncio.sleep(5)
                print(f'    Story postada!')
                return True

        print('    ERR: botao Share nao encontrado')
        await page.screenshot(path=f'err_story_{img_path.stem}.png')
        await page.keyboard.press('Escape')
        return False

    except Exception as e:
        print(f'    ERR story upload: {e}')
        await page.screenshot(path=f'err_story_{img_path.stem}.png')
        await page.keyboard.press('Escape')
        return False


async def post_story_v2(page, img_path):
    """Alternativa: vai direto para /stories/create/"""
    print(f'  Postando story (v2): {img_path.name}')

    try:
        # Usa a URL direta do criador de stories
        await page.goto('https://www.instagram.com/stories/create/', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        await page.screenshot(path=f'debug_story_create_{img_path.stem}.png')

        # Procura input de arquivo ou area de upload
        file_inputs = page.locator('input[type="file"]')
        fi_count = await file_inputs.count()
        print(f'    File inputs: {fi_count}')

        if fi_count > 0:
            await file_inputs.first.set_input_files(str(img_path))
            await asyncio.sleep(4)
            await page.screenshot(path=f'debug_story_after_upload_{img_path.stem}.png')

            # Share
            for txt in ['Share', 'Your Story', 'Done', 'Next']:
                btn = page.locator(f'button:has-text("{txt}")').first
                if await btn.count() > 0:
                    await btn.click(force=True)
                    await asyncio.sleep(5)
                    print(f'    Story postada!')
                    return True

        # Tenta via drag-and-drop area
        upload_area = page.locator('[role="button"]:has-text("Select from computer"), button:has-text("Select"), [aria-label*="photo"]').first
        if await upload_area.count() > 0:
            async with page.expect_file_chooser(timeout=5000) as fc_info:
                await upload_area.click(force=True)
            fc = await fc_info.value
            await fc.set_files(str(img_path))
            await asyncio.sleep(4)

            for txt in ['Share', 'Your Story', 'Done']:
                btn = page.locator(f'button:has-text("{txt}")').first
                if await btn.count() > 0:
                    await btn.click(force=True)
                    await asyncio.sleep(5)
                    print(f'    Story postada (v2)!')
                    return True

        print('    ERR: nao conseguiu postar story')
        return False

    except Exception as e:
        print(f'    ERR story v2: {e}')
        await page.screenshot(path=f'err_story_v2_{img_path.stem}.png')
        return False


async def create_highlight_from_archive(page, name):
    """
    Cria highlight a partir do arquivo de stories.
    Pressupoe que as stories ja foram postadas e estao no arquivo.
    """
    print(f'  Criando highlight: {name}')
    await page.goto('https://www.instagram.com/madamauroraofficial/', wait_until='domcontentloaded')
    await asyncio.sleep(5)
    await dismiss(page)

    # Clica no circulo New
    clicked = await page.evaluate('''
        () => {
            const all = document.querySelectorAll('[role="button"], button');
            for (const el of all) {
                const txt = el.textContent.trim();
                const rect = el.getBoundingClientRect();
                if (txt === 'New' && rect.y > 150 && rect.x > 70 && rect.width < 120) {
                    el.click();
                    return true;
                }
            }
            return false;
        }
    ''')
    await asyncio.sleep(3)
    await page.screenshot(path=f'debug_hl2_{name.replace(" ","_")}_open.png')

    # Verifica se abriu modal (Next button indica tela de stories, nao de nome)
    next_btns = await page.locator('button:has-text("Next")').count()
    name_inputs = await page.locator('input[name="highlightName"], input[placeholder*="ighlight"]').count()

    print(f'    Next btns: {next_btns}, Name inputs: {name_inputs}')

    if name_inputs > 0:
        # Modal de NOME abriu — fluxo: nome → Next → stories → Add
        inp = page.locator('input[name="highlightName"], input[placeholder*="ighlight"]').first
        await inp.fill(name)
        await asyncio.sleep(1)
        await page.locator('button:has-text("Next")').first.click(force=True)
        await asyncio.sleep(4)
        await page.screenshot(path=f'debug_hl2_{name.replace(" ","_")}_stories.png')

        # Seleciona stories
        await select_stories(page, name)

    elif next_btns > 0:
        # Modal de STORIES abriu direto — fluxo: stories → Next → nome → Add
        await select_stories(page, name)
        await asyncio.sleep(1)
        next_btn = page.locator('button:has-text("Next")').first
        if await next_btn.count() > 0:
            await next_btn.click(force=True)
            await asyncio.sleep(3)

        # Preenche nome
        inp = page.locator('input[name="highlightName"], input[placeholder*="ighlight"]').first
        if await inp.count() > 0:
            await inp.fill(name)
            await asyncio.sleep(1)

    else:
        print(f'    ERR: modal nao reconhecido')
        await page.keyboard.press('Escape')
        return False

    # Clica Add/Done/Create
    for txt in ['Add', 'Done', 'Create']:
        btn = page.locator(f'button:has-text("{txt}")').first
        if await btn.count() > 0:
            await btn.click(force=True)
            await asyncio.sleep(4)
            print(f'    Highlight "{name}" CRIADO!')
            return True

    print(f'    ERR: botao Add/Done nao encontrado')
    await page.screenshot(path=f'err_hl2_{name.replace(" ","_")}_noadd.png')
    await page.keyboard.press('Escape')
    return False


async def select_stories(page, name):
    """Seleciona os primeiros stories disponiveis no modal"""
    # Espera um momento para carregar
    await asyncio.sleep(2)

    # Diferentes seletores possiveis
    for sel in ['div[role="checkbox"]', 'input[type="checkbox"]',
                'span[role="checkbox"]', 'div[tabindex="0"]']:
        items = page.locator(sel)
        c = await items.count()
        if c > 0:
            print(f'    {c} stories encontradas ({sel})')
            for j in range(min(5, c)):
                try:
                    await items.nth(j).click(force=True)
                    await asyncio.sleep(0.5)
                except:
                    pass
            return

    # Fallback: clica em qualquer imagem no dialog
    imgs = page.locator('div[role="dialog"] img, [role="dialog"] [role="button"]')
    c = await imgs.count()
    print(f'    {c} items no dialog (fallback)')
    for j in range(min(5, c)):
        try:
            await imgs.nth(j).click(force=True)
            await asyncio.sleep(0.5)
        except:
            pass


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=80)
        ctx = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await ctx.new_page()

        await login(page)
        await enable_archive(page)

        print('\n=== POSTANDO STORIES + CRIANDO HIGHLIGHTS ===')
        ok = 0

        for hl_name, story_files in HIGHLIGHTS:
            print(f'\n--- {hl_name} ({len(story_files)} stories) ---')

            # Posta cada story do grupo
            posted = 0
            for fname in story_files:
                img_path = STORIES / fname
                if not img_path.exists():
                    print(f'  SKIP: {fname} nao encontrado')
                    continue

                # Tenta v1 primeiro, depois v2
                if await post_story(page, img_path):
                    posted += 1
                else:
                    if await post_story_v2(page, img_path):
                        posted += 1

                await asyncio.sleep(3)

            print(f'  {posted}/{len(story_files)} stories postadas')

            # Aguarda as stories aparecerem no arquivo
            if posted > 0:
                await asyncio.sleep(5)
                try:
                    if await create_highlight_from_archive(page, hl_name):
                        ok += 1
                except Exception as e:
                    print(f'  ERR highlight: {e}')
            else:
                print(f'  Nenhuma story postada — pulando highlight')

            await asyncio.sleep(5)

        print(f'\n=== {ok}/{len(HIGHLIGHTS)} highlights criados ===')

        if ok < len(HIGHLIGHTS):
            print('\nAcoes manuais necessarias no celular:')
            print('1. Abra o app Instagram')
            print('2. Perfil → historia ativa → Highlight → Novo Highlight → Nome → Add')

        await asyncio.sleep(10)
        await browser.close()


asyncio.run(main())
