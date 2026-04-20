"""
Madam Aurora — Instagram Auto-Poster (solucao definitiva v3)
Usa expect_file_chooser para capturar o dialog de upload antes de virar nativo.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

USERNAME = 'madamauroraofficial'
PASSWORD = 'w89u.?kEWuGizhz'
BASE     = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram')
IMAGES   = BASE / 'images'

POSTS = [
    ('g09_final_cta.png',          "You've seen enough.\n\nYou know what this is.\n\nAnd you're still here — which means part of you already knows your palm has something to say.\n\nThe reading is free.\nIt takes 3 minutes.\nAnd it might be the most accurate thing you've read about yourself in years.\n\n→ madam-aurora.co (link in bio)\n\nNo credit card. No catch. Just your palm and your truth.\n\n#palmreading #freereading #spiritualwomen #lovereading #palmistry #now"),
    ('g08_pattern_quiz.png',        "Look at your palm right now.\n\nWhich line is MOST visible?\n\n❤️ Heart line (curves across top) → you lead with emotion\n🧠 Head line (runs across middle) → you lead with logic\n✨ Life line (curves around thumb) → you lead with instinct\n⭐ Fate line (runs vertically center) → you're driven by purpose\n\nComment below: Heart / Head / Life / Fate\n\nThen get your full free reading → link in bio\n\n#palmreading #quiz #palmlines #spiritualwomen #palmistry #whichone"),
    ('g07_social_proof_volume.png', "Half a million women.\n\nDifferent ages. Different cities. Different questions.\n\nSame result: clarity.\n\n\"I finally understood why every relationship ended the same way.\" — 34, New York\n\"She was 38 and thought her time had passed. 6 weeks later, she met him.\" — Real story\n\"I didn't believe in this. Then I saw what my heart line actually meant.\" — 29, LA\n\nWhen was the last time something gave you actual clarity?\n\n→ Link in bio. Your reading is free and waiting.\n\n#palmreading #500k #spiritualwomen #lovereading #results"),
    ('g06_life_line_myth.png',      "The #1 myth in palmistry — busted.\n\nYour life line does NOT predict when you'll die.\n\nIt actually reveals:\n→ Your vitality and energy in relationships\n→ Periods of major change ahead\n→ Whether you're emotionally guarded or expansive in love\n\nA life line that runs close to the thumb?\nYou're cautious. Self-protective. Slow to fully open up.\n\nA life line that sweeps wide?\nYou fall hard. You give everything. You need a partner who matches that.\n\nGet your full reading free → link in bio\n\n#lifeline #palmistry #palmreading #myth #spiritualwomen"),
    ('g05_how_it_works.png',        "No crystal balls. No vague predictions.\n\nHere's exactly what happens:\n\n📸 You take a photo of your palm\n❓ You answer 7 questions\n✨ You receive your personalized reading\n\nWhat you get back:\n→ What your dominant line reveals\n→ The pattern blocking you in love\n→ Your next aligned action\n\nFree. Private. 3 minutes.\n→ madam-aurora.co (link in bio)\n\n#palmreading #howto #free #spiritualwomen #palmistry"),
    ('g04_pain_mirror.png',         "You've read every self-help book.\nJournaled. Meditated. Talked to friends.\n\nAnd something still feels... unclear.\n\nYour palm reads differently than all of that.\n\nIt doesn't tell you what to do.\nIt shows you what you already know.\n\nSave this if you needed to hear it.\nFree reading → link in bio\n\n#spiritualawakening #selfdiscovery #palmreading #women #clarity"),
    ('g03_testimonial_card.png',    "Sarah almost didn't do her reading.\n\n\"It feels too mystical for me,\" she said.\n\nThree minutes later:\n\n\"How is this so accurate?\"\n\nThat's what happens when your palm does the talking.\n\nYour turn → link in bio\n\n#palmreading #testimonial #spiritualwomen #accurate #freereading"),
    ('g02_heart_line.png',          "Your heart line doesn't just predict love.\n\nIt reveals HOW you love — and what's been blocking you from receiving it.\n\nIf your heart line curves up toward your index finger:\n→ You're a natural giver. You've probably been with partners who take.\n\nIf your heart line runs straight across:\n→ You lead with logic. You protect yourself — sometimes too much.\n\nWhich one are you? Comment below.\n\nGet your full free reading → link in bio\n\n#heartline #palmreading #palmistry #lovereading #spiritualwomen"),
    ('g01_anchor_text.png',         "Most women feel it before they understand it.\n\nSomething is off.\nSomething is about to change.\nSomething has been waiting.\n\nYour palm knows which one it is.\n\nFree reading → link in bio\n\nComment PALM if you feel this.\n\n#palmreading #spiritualwomen #intuition #lovereading #mystical #palmistry"),
    ('01_pin_anchor.png',           "Your palm has always held the answer.\n\nThe marriage line doesn't just show who — it shows when, and why timing keeps shifting.\n\nA free palm reading reveals what's been quietly waiting to surface.\n\nDrop PALM in the comments and I'll send you the link. Or go directly:\n→ madam-aurora.co (link in bio)\n\n#palmreading #palmistry #lovereading #spiritualwomen #freereading #mystical"),
    ('02_pin_social_proof.png',     "I don't ask you to believe in palmistry.\n\nI ask you to believe these women.\n\n\"I've never felt so seen. The reading described my exact situation in ways I couldn't even articulate to my therapist.\" — Sarah M., Texas\n\n\"She was 38 and thought her time had passed. 6 weeks after her reading, she met him.\" — Real story\n\n\"I didn't believe in palm reading either. Then I saw what my heart line actually meant.\" — Dana, Oregon\n\nYour free reading is waiting → link in bio\n\n#palmreading #testimonial #spiritualwomen #lovereading #realresults"),
    ('03_pin_how_it_works.png',     "No crystal balls. No vague predictions.\n\nHere's exactly how your free palm reading works:\n\nStep 1 → Take a photo of your palm (any smartphone works)\nStep 2 → Answer 7 questions about your love life\nStep 3 → Receive your personalized reading\n\nWhat you get:\n✦ Your dominant palm line meaning\n✦ What your patterns reveal right now\n✦ Your next aligned action\n\nFree. Private. Takes 3 minutes.\n→ madam-aurora.co (link in bio)\n\n#palmreading #howto #freereading #spiritualwomen #palmistry"),
]


async def dismiss_all(page):
    """Fecha todos os dialogs conhecidos"""
    for txt in ['Not now', 'Not Now', 'Agora não', 'Agora nao', 'Turn On', 'Cancel', 'Cancelar']:
        try:
            btn = page.locator(f'button:has-text("{txt}"), a:has-text("{txt}")')
            if await btn.count() > 0:
                await btn.first.click(force=True)
                await asyncio.sleep(0.8)
        except:
            pass
    if 'onetap' in page.url or 'accounts' in page.url:
        await page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
        await asyncio.sleep(4)


async def login(page):
    await page.goto('https://www.instagram.com/accounts/login/', wait_until='domcontentloaded')
    await asyncio.sleep(5)

    # Cookie dialog
    for txt in ['Allow all cookies', 'Accept All', 'Aceitar tudo']:
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
    await dismiss_all(page)

    # Garante que estamos no feed
    if 'instagram.com' not in page.url or 'accounts' in page.url or 'onetap' in page.url:
        await page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
        await asyncio.sleep(4)
    await dismiss_all(page)
    print(f'  Logado! URL: {page.url}')


async def open_create_modal(page, idx):
    """Abre o modal de criacao de post. Retorna True se abriu o upload."""

    # Abordagem 1: Clicar o botao Create/New post via JS
    label_found = await page.evaluate('''
        () => {
            const labels = ["New post", "Create", "Criar"];
            for (const lbl of labels) {
                const svg = document.querySelector(`svg[aria-label="${lbl}"]`);
                if (svg) {
                    const btn = svg.closest("a, button, [role='button']");
                    if (btn) { btn.click(); return lbl; }
                }
            }
            // Tenta clicar qualquer link/button com texto Create
            for (const el of document.querySelectorAll('a, [role="button"], button')) {
                if (el.textContent.trim() === 'Create') { el.click(); return "Create-text"; }
            }
            return null;
        }
    ''')
    print(f'  Create button: {label_found}')
    await asyncio.sleep(2)

    # Espera submenu com link "Post"
    try:
        post_link = page.get_by_role('link', name='Post')
        await post_link.wait_for(timeout=8000)
        await post_link.click()
        print('  Post link clicado')
        await asyncio.sleep(3)
        return True
    except:
        pass

    # Fallback: qualquer <a> com texto exato "Post" no submenu
    try:
        candidates = page.locator('a').filter(has_text='Post')
        count = await candidates.count()
        for i in range(count):
            href = await candidates.nth(i).get_attribute('href') or ''
            # link do submenu tem href="#" ou vazio
            if href in ('#', '', None):
                await candidates.nth(i).click(force=True)
                print('  Post link clicado (fallback href=#)')
                await asyncio.sleep(3)
                return True
    except:
        pass

    await page.screenshot(path=f'err_submenu_{idx}.png')
    print('  ERR: submenu Post nao encontrado')
    return False


async def upload_file(page, img_path, idx):
    """Faz upload usando expect_file_chooser (intercepta antes de virar dialogo nativo)."""

    # Tenta botao "Select from computer"
    sel_btn = page.locator(
        'button:has-text("Select from computer"), '
        'button:has-text("Selecionar do computador"), '
        'button:has-text("Select From Computer")'
    )

    try:
        async with page.expect_file_chooser(timeout=12000) as fc_info:
            if await sel_btn.count() > 0:
                await sel_btn.first.click()
                print('  Select from computer clicado')
            else:
                # Clica na area de drag-and-drop
                drop_area = page.locator('div:has-text("Drag photos and videos here"), div[role="button"]').first
                await drop_area.click(force=True)
                print('  Drop area clicada')
        fc = await fc_info.value
        await fc.set_files(str(img_path))
        print(f'  Upload OK via file chooser')
        return True
    except Exception as e:
        print(f'  ERR file chooser: {e}')

    # Fallback: set_input_files no input hidden
    try:
        file_input = page.locator('input[type="file"]').first
        await file_input.set_input_files(str(img_path), timeout=10000)
        print(f'  Upload OK via set_input_files')
        return True
    except Exception as e2:
        print(f'  ERR set_input_files: {e2}')
        await page.screenshot(path=f'err_upload_{idx}.png')
        return False


async def post_one(page, fname, caption, idx, total):
    img_path = IMAGES / fname
    print(f'\n[{idx}/{total}] {fname}')

    if not img_path.exists():
        print(f'  SKIP: arquivo nao encontrado: {img_path}')
        return False

    await dismiss_all(page)
    await asyncio.sleep(1)

    # Abre modal de criacao
    if not await open_create_modal(page, idx):
        return False

    # Upload da imagem
    if not await upload_file(page, img_path, idx):
        return False
    await asyncio.sleep(4)

    # Aspect ratio: seleciona original se aparecer
    try:
        orig = page.locator('button:has-text("Original"), span:has-text("Original")')
        if await orig.count() > 0:
            await orig.first.click(force=True)
            await asyncio.sleep(1)
    except:
        pass

    # Next x2 (crop → filters → caption)
    for step in range(2):
        try:
            next_btn = page.locator(
                'div[role="button"]:has-text("Next"), button:has-text("Next")'
            ).first
            await next_btn.wait_for(timeout=8000)
            await next_btn.click(force=True)
            print(f'  Next {step + 1}')
            await asyncio.sleep(3)
        except Exception as e:
            print(f'  ERR Next {step + 1}: {e}')
            await page.screenshot(path=f'err_next_{idx}_{step}.png')

    # Caption
    try:
        cap_box = page.locator('div[role="textbox"][aria-label], div[role="textbox"]').first
        await cap_box.wait_for(timeout=10000)
        await cap_box.click()
        await asyncio.sleep(0.5)
        await cap_box.type(caption, delay=6)
        print(f'  Caption OK ({len(caption)} chars)')
        await asyncio.sleep(2)
    except Exception as e:
        print(f'  ERR caption: {e}')

    # Share
    try:
        share = page.locator(
            'div[role="button"]:has-text("Share"), button:has-text("Share")'
        ).first
        await share.wait_for(timeout=10000)
        await share.click(force=True)
        print(f'  Publicado!')
        # Aguarda confirmacao (tela de sucesso ou feed)
        await asyncio.sleep(12)
        return True
    except Exception as e:
        print(f'  ERR share: {e}')
        await page.screenshot(path=f'err_share_{idx}.png')
        return False


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=150)
        ctx = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await ctx.new_page()

        print('=== LOGIN ===')
        await login(page)

        print(f'\n=== POSTANDO {len(POSTS)} POSTS ===')
        ok = 0
        for i, (fname, cap) in enumerate(POSTS, 1):
            try:
                result = await post_one(page, fname, cap, i, len(POSTS))
                if result:
                    ok += 1
                # Pausa entre posts (Instagram rate limit)
                wait = 20 if result else 10
                print(f'  Aguardando {wait}s...')
                await asyncio.sleep(wait)
            except Exception as e:
                print(f'  ERR geral [{i}]: {e}')
                await page.screenshot(path=f'err_geral_{i}.png')
                await asyncio.sleep(10)

        print(f'\n=== CONCLUIDO: {ok}/{len(POSTS)} posts publicados ===')
        await asyncio.sleep(5)
        await browser.close()


asyncio.run(main())
