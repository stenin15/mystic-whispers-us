"""
Madam Aurora — Instagram Asset Generator
Gera 18 imagens: foto de perfil, 3 fixados, 5 highlights, 9 grid posts
Modelo: Seedream 4.5 via OpenRouter
"""
import httpx, base64, io, os, time, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

KEY   = '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'
MODEL = 'bytedance-seed/seedream-4.5'
OUT   = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram/images')
OUT.mkdir(parents=True, exist_ok=True)

# Cores da marca
PURPLE_DEEP  = (26, 10, 46)
PURPLE_MID   = (45, 27, 78)
GOLD         = (201, 168, 76)
GOLD_LIGHT   = (212, 185, 110)
WHITE        = (255, 255, 255)
WHITE_SOFT   = (240, 235, 228)
BLACK        = (0, 0, 0)

ASSETS = [
    # ── FOTO DE PERFIL ─────────────────────────────────────────────────────────
    {
        'id': '00_profile',
        'size': (1080, 1080),
        'caption': '',
        'label': 'Foto de Perfil',
        'prompt': (
            "Elegant feminine logo mark for a palm reading brand called Madam Aurora. "
            "Deep purple background (#1A0A2E). Centered: a single open female palm, fingers pointing upward, "
            "illuminated by warm golden light from below, glowing golden palm lines visible. "
            "Around the palm, delicate constellation-style dots and lines in gold. "
            "The overall composition is circular, fitting inside a circle crop. "
            "Mystical yet sophisticated, luxury brand aesthetic. No text. "
            "Rich dark purple tones with gold accents. Photo-realistic, editorial quality. "
            "Vertical symmetric composition."
        ),
    },

    # ── POSTS FIXADOS ──────────────────────────────────────────────────────────
    {
        'id': '01_pin_anchor',
        'size': (1080, 1350),
        'label': 'Fixado 1 — Ancora do perfil',
        'caption': (
            "Your palm has always held the answer.\n\n"
            "The marriage line doesn't just show who — it shows when, and why timing keeps shifting.\n\n"
            "A free palm reading reveals what's been quietly waiting to surface.\n\n"
            "Drop PALM in the comments and I'll send you the link. Or go directly:\n"
            "→ madam-aurora.co (link in bio)\n\n"
            "#palmreading #palmistry #lovereading #spiritualwomen #freereading #mystical"
        ),
        'prompt': (
            "Editorial mystical photo. A beautiful woman's open right hand, palm facing camera, "
            "centered in vertical frame, fingers pointing upward. The heart line glows faintly in warm gold. "
            "Deep dark purple background (#1A0A2E) with rich shadows and bokeh candle lights. "
            "Warm golden candlelight from left side. Skin texture and palm lines in sharp detail. "
            "Canon EOS R5 85mm f/1.4 macro, shallow depth of field. "
            "Vertical 4:5 portrait composition. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'YOUR PALM\nALREADY KNOWS.',
            'bottom_text': 'Free palm reading → madam-aurora.co',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': '02_pin_social_proof',
        'size': (1080, 1350),
        'label': 'Fixado 2 — Prova Social',
        'caption': (
            "I don't ask you to believe in palmistry.\n\n"
            "I ask you to believe these women.\n\n"
            '"I\'ve never felt so seen. The reading described my exact situation in ways '
            'I couldn\'t even articulate to my therapist." — Sarah M., Texas\n\n'
            '"She was 38 and thought her time had passed. '
            '6 weeks after her reading, she met him." — Real story\n\n'
            '"I didn\'t believe in palm reading either. Then I saw what my heart line actually meant." — Dana, Oregon\n\n'
            "Your free reading is waiting → link in bio\n\n"
            "#palmreading #testimonial #spiritualwomen #lovereading #realresults"
        ),
        'prompt': (
            "Editorial portrait photo. Happy radiant Caucasian woman in her late 30s, blonde hair, "
            "warm genuine smile, holding a glowing smartphone at chest level. "
            "Cozy warm living room interior, golden afternoon light. "
            "She looks slightly off-camera with a joyful hopeful expression. "
            "Canon EOS R5 85mm f/1.8, shallow depth of field, beautiful bokeh background. "
            "Subject fully upright seated, vertical 4:5 portrait. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"This was the most\naccurate thing\nI\'ve ever read\nabout myself."',
            'bottom_text': '— Sarah M., 41 — Tennessee',
            'brand': 'MADAM AURORA  *  500,000+ Readings',
        }
    },
    {
        'id': '03_pin_how_it_works',
        'size': (1080, 1350),
        'label': 'Fixado 3 — Como Funciona',
        'caption': (
            "No crystal balls. No vague predictions.\n\n"
            "Here's exactly how your free palm reading works:\n\n"
            "Step 1 → Take a photo of your palm (any smartphone works)\n"
            "Step 2 → Answer 7 questions about your love life\n"
            "Step 3 → Receive your personalized reading\n\n"
            "What you get:\n"
            "✦ Your dominant palm line meaning\n"
            "✦ What your patterns reveal right now\n"
            "✦ Your next aligned action\n\n"
            "Free. Private. Takes 3 minutes.\n"
            "→ madam-aurora.co (link in bio)\n\n"
            "#palmreading #howto #freereading #spiritualwomen #palmistry"
        ),
        'prompt': (
            "Editorial flat lay photo. A woman's open palm resting on a dark purple velvet surface, "
            "palm facing up, illuminated by warm golden candlelight from the side. "
            "Beside the hand: an elegant antique brass compass, a white candle burning softly, "
            "and delicate dried flowers. Dark moody atmosphere. "
            "Canon EOS R5 50mm f/2.0, overhead shot, all elements arranged artfully. "
            "Deep purple and gold color palette. Luxurious, editorial, mystical. "
            "Vertical 4:5 composition. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'HOW YOUR FREE\nREADING WORKS',
            'bottom_text': '3 steps · 3 minutes · completely free',
            'brand': 'MADAM AURORA',
        }
    },

    # ── CAPAS DE HIGHLIGHTS ────────────────────────────────────────────────────
    {
        'id': 'hl_free_read',
        'size': (1080, 1080),
        'label': 'Highlight — Free Reading',
        'caption': '',
        'prompt': (
            "Elegant square cover image for Instagram highlight. Deep purple background (#1A0A2E). "
            "Center: a single open female palm, fingers pointing upward, illuminated by warm golden glow from below. "
            "Palm lines softly glowing in gold. Minimal, iconic composition. "
            "Small delicate gold sparkles around the palm. No text. "
            "Luxury mystical brand aesthetic. Photorealistic, moody, intimate. Square composition."
        ),
    },
    {
        'id': 'hl_results',
        'size': (1080, 1080),
        'label': 'Highlight — Results',
        'caption': '',
        'prompt': (
            "Elegant square cover image for Instagram highlight. Deep purple to indigo gradient background. "
            "Center: five gold stars arranged in a gentle arc, glowing softly. "
            "Below the stars, very subtle text in gold: '500k+ readings'. "
            "Around the stars, delicate golden constellation lines and dots. "
            "No faces, no hands. Pure abstract luxury mystical design. "
            "Sophisticated, celebratory, trustworthy. Square composition. Photorealistic render."
        ),
    },
    {
        'id': 'hl_palm_lines',
        'size': (1080, 1080),
        'label': 'Highlight — Palm Lines',
        'caption': '',
        'prompt': (
            "Extreme close-up macro photo of a woman's open palm, viewed from above, "
            "dramatic golden side lighting that reveals the palm lines in high contrast. "
            "Deep purple background. The three main palm lines subtly overlaid with thin golden glowing lines. "
            "Canon EOS R5 100mm macro lens f/2.8. Square composition. "
            "Mysterious, intimate, ultra-detailed skin texture. No text. Photorealistic."
        ),
    },
    {
        'id': 'hl_about',
        'size': (1080, 1080),
        'label': 'Highlight — About Aurora',
        'caption': '',
        'prompt': (
            "Elegant feminine silhouette standing in profile, long flowing hair, holding a lit candle. "
            "Deep purple background with soft golden mist and bokeh around the figure. "
            "The candlelight illuminates her from below, creating a warm golden aura. "
            "No face visible — just the elegant silhouette and the candle flame. "
            "Mystical, wise, welcoming — not dark or scary. Luxury spiritual aesthetic. "
            "Square composition. Photorealistic, cinematic."
        ),
    },
    {
        'id': 'hl_faq',
        'size': (1080, 1080),
        'label': 'Highlight — FAQ',
        'caption': '',
        'prompt': (
            "Abstract elegant square design. Deep purple background with subtle golden constellation pattern "
            "(small dots and thin connecting lines across the background). "
            "Center: an ornamental question mark in gold with decorative flourishes and delicate floral details "
            "at top and bottom of the symbol. The question mark glows softly. "
            "Sophisticated, luxury mystical brand. No text. Square composition. "
            "High-end editorial render, rich purple and gold palette."
        ),
    },

    # ── GRID DE 9 POSTS ────────────────────────────────────────────────────────
    {
        'id': 'g01_anchor_text',
        'size': (1080, 1080),
        'label': 'Grid 1 — Ancora tipografica',
        'caption': (
            "Most women feel it before they understand it.\n\n"
            "Something is off.\nSomething is about to change.\nSomething has been waiting.\n\n"
            "Your palm knows which one it is.\n\n"
            "Free reading → link in bio\n\n"
            "Comment PALM if you feel this.\n\n"
            "#palmreading #spiritualwomen #intuition #lovereading #mystical #palmistry"
        ),
        'prompt': (
            "Elegant dark editorial photo. Deep dark purple velvet texture background. "
            "A single lit white candle centered, its flame casting warm golden light that creates "
            "a beautiful glow in the surrounding darkness. "
            "Small golden bokeh particles floating around the flame. "
            "Extreme mood and atmosphere. No text, no people, no hands. "
            "Square composition. Ultra photorealistic. Luxury mystical aesthetic."
        ),
        'overlay': {
            'top_text': 'Your palm has been\ntrying to tell you\nsomething.',
            'bottom_text': 'Are you ready to listen?',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'g02_heart_line',
        'size': (1080, 1080),
        'label': 'Grid 2 — Linha do coração',
        'caption': (
            "Your heart line doesn't just predict love.\n\n"
            "It reveals HOW you love — and what's been blocking you from receiving it.\n\n"
            "If your heart line curves up toward your index finger:\n"
            "→ You're a natural giver. You've probably been with partners who take.\n\n"
            "If your heart line runs straight across:\n"
            "→ You lead with logic. You protect yourself — sometimes too much.\n\n"
            "Which one are you? Comment below.\n\n"
            "Get your full free reading → link in bio\n\n"
            "#heartline #palmreading #palmistry #lovereading #spiritualwomen"
        ),
        'prompt': (
            "Editorial macro photo. A beautiful woman's open right hand, palm facing camera, "
            "fingers pointing upward. The heart line — the topmost curved line — highlighted with "
            "a soft golden luminous glow. Other lines visible but not highlighted. "
            "Warm candlelight from the left. Deep dark purple background. "
            "Canon EOS R5 100mm macro f/2.8. Square composition. Ultra photorealistic."
        ),
    },
    {
        'id': 'g03_testimonial_card',
        'size': (1080, 1080),
        'label': 'Grid 3 — Depoimento',
        'caption': (
            "Sarah almost didn't do her reading.\n\n"
            '"It feels too mystical for me," she said.\n\n'
            "Three minutes later:\n\n"
            '"How is this so accurate?"\n\n'
            "That's what happens when your palm does the talking.\n\n"
            "Your turn → link in bio\n\n"
            "#palmreading #testimonial #spiritualwomen #accurate #freereading"
        ),
        'prompt': (
            "Beautiful Caucasian woman in her late 30s sitting by a window, warm natural afternoon light, "
            "looking at her open palm with a surprised and moved expression, mouth slightly open. "
            "Cozy modern interior, soft bokeh background. "
            "She holds her palm up at chest level, studying it with wonder. "
            "Canon EOS R5 85mm f/1.8. Subject fully upright, head level. "
            "Square composition. Ultra photorealistic. Warm tones."
        ),
        'overlay': {
            'top_text': '"How is this\nso accurate?"',
            'bottom_text': '— Sarah M., 41 · Texas',
            'brand': 'MADAM AURORA  *  Free Reading',
        }
    },
    {
        'id': 'g04_pain_mirror',
        'size': (1080, 1080),
        'label': 'Grid 4 — Espelho de dor',
        'caption': (
            "You've read every self-help book.\n"
            "Journaled. Meditated. Talked to friends.\n\n"
            "And something still feels... unclear.\n\n"
            "Your palm reads differently than all of that.\n\n"
            "It doesn't tell you what to do.\nIt shows you what you already know.\n\n"
            "Save this if you needed to hear it.\n"
            "Free reading → link in bio\n\n"
            "#spiritualawakening #selfdiscovery #palmreading #women #clarity"
        ),
        'prompt': (
            "Beautiful American woman in her early 30s, brunette wavy hair, sitting by a rainy window, "
            "holding a warm cup of tea, looking outside with a pensive and introspective expression. "
            "Soft gray natural light from window contrasted with warm candlelight from inside. "
            "Her open palm rests on her knee, visible. Cozy moody interior. "
            "Canon EOS R5 85mm f/1.8. Subject upright, contemplative. "
            "Square composition. Cinematic, emotional. Ultra photorealistic."
        ),
    },
    {
        'id': 'g05_how_it_works',
        'size': (1080, 1080),
        'label': 'Grid 5 — Como funciona',
        'caption': (
            "No crystal balls. No vague predictions.\n\n"
            "Here's exactly what happens:\n\n"
            "📸 You take a photo of your palm\n"
            "❓ You answer 7 questions\n"
            "✨ You receive your personalized reading\n\n"
            "What you get back:\n"
            "→ What your dominant line reveals\n"
            "→ The pattern blocking you in love\n"
            "→ Your next aligned action\n\n"
            "Free. Private. 3 minutes.\n"
            "→ madam-aurora.co (link in bio)\n\n"
            "#palmreading #howto #free #spiritualwomen #palmistry"
        ),
        'prompt': (
            "Woman's hands holding a smartphone in portrait orientation, the screen showing "
            "a mystical palm reading interface with elegant golden palm line illustrations on dark purple background. "
            "Warm candlelight illuminates the hands and phone screen from behind. "
            "Dark moody background with soft bokeh candle flames. Beautiful ring on one finger. "
            "Canon EOS R5 85mm f/1.8, shallow depth of field. "
            "Square composition. Ultra photorealistic."
        ),
    },
    {
        'id': 'g06_life_line_myth',
        'size': (1080, 1080),
        'label': 'Grid 6 — Mito da linha da vida',
        'caption': (
            "The #1 myth in palmistry — busted.\n\n"
            "Your life line does NOT predict when you'll die.\n\n"
            "It actually reveals:\n"
            "→ Your vitality and energy in relationships\n"
            "→ Periods of major change ahead\n"
            "→ Whether you're emotionally guarded or expansive in love\n\n"
            "A life line that runs close to the thumb?\n"
            "You're cautious. Self-protective. Slow to fully open up.\n\n"
            "A life line that sweeps wide?\n"
            "You fall hard. You give everything. You need a partner who matches that.\n\n"
            "Get your full reading free → link in bio\n\n"
            "#lifeline #palmistry #palmreading #myth #spiritualwomen"
        ),
        'prompt': (
            "Editorial macro photo. Two open female palms side by side, both facing camera, "
            "fingers pointing upward. One hand light skin, one medium-tan skin. "
            "The life line on each hand highlighted with a subtle golden glow. "
            "Warm golden light from above illuminates both palms. "
            "Deep dark purple background. Canon EOS R5 85mm f/2.0. "
            "Square composition. Ultra photorealistic."
        ),
    },
    {
        'id': 'g07_social_proof_volume',
        'size': (1080, 1080),
        'label': 'Grid 7 — Prova social em volume',
        'caption': (
            "Half a million women.\n\n"
            "Different ages. Different cities. Different questions.\n\n"
            "Same result: clarity.\n\n"
            '"I finally understood why every relationship ended the same way." — 34, New York\n'
            '"She was 38 and thought her time had passed. 6 weeks later, she met him." — Real story\n'
            '"I didn\'t believe in this. Then I saw what my heart line actually meant." — 29, LA\n\n'
            "When was the last time something gave you actual clarity?\n\n"
            "→ Link in bio. Your reading is free and waiting.\n\n"
            "#palmreading #500k #spiritualwomen #lovereading #results"
        ),
        'prompt': (
            "Overhead aerial view of multiple female hands, different skin tones, all palms facing up, "
            "arranged in a beautiful circular pattern. Warm golden candlelight illuminates all palms. "
            "Dark purple surface underneath. Each palm shows visible lines. "
            "Artistic, editorial, symbolic of community and diversity. "
            "Canon EOS R5 35mm f/4.0. Square composition. Ultra photorealistic. "
            "Warm golden and purple tones."
        ),
        'overlay': {
            'top_text': '500,000+',
            'bottom_text': 'free readings delivered',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'g08_pattern_quiz',
        'size': (1080, 1080),
        'label': 'Grid 8 — Quiz de linhas',
        'caption': (
            "Look at your palm right now.\n\n"
            "Which line is MOST visible?\n\n"
            "❤️ Heart line (curves across top) → you lead with emotion\n"
            "🧠 Head line (runs across middle) → you lead with logic\n"
            "✨ Life line (curves around thumb) → you lead with instinct\n"
            "⭐ Fate line (runs vertically center) → you're driven by purpose\n\n"
            "Comment below: Heart / Head / Life / Fate\n\n"
            "Then get your full free reading → link in bio\n\n"
            "#palmreading #quiz #palmlines #spiritualwomen #palmistry #whichone"
        ),
        'prompt': (
            "Beautiful woman's open palm, viewed from slightly above at an angle, "
            "illuminated by soft warm candlelight from the right side. "
            "The four main palm lines are each subtly highlighted with thin golden luminous lines. "
            "Deep purple background with soft bokeh. "
            "Very detailed skin texture, natural and authentic. "
            "Canon EOS R5 100mm macro f/2.0. Square composition. Ultra photorealistic."
        ),
    },
    {
        'id': 'g09_final_cta',
        'size': (1080, 1080),
        'label': 'Grid 9 — CTA final',
        'caption': (
            "You've seen enough.\n\n"
            "You know what this is.\n\n"
            "And you're still here — which means part of you already knows your palm has something to say.\n\n"
            "The reading is free.\nIt takes 3 minutes.\n"
            "And it might be the most accurate thing you've read about yourself in years.\n\n"
            "→ madam-aurora.co (link in bio)\n\n"
            "No credit card. No catch. Just your palm and your truth.\n\n"
            "#palmreading #freereading #spiritualwomen #lovereading #palmistry #now"
        ),
        'prompt': (
            "Editorial mystical photo. A woman's open palm raised upright toward camera, "
            "fingers pointing upward, centered in square frame. "
            "Golden luminous light emanates from below the palm, as if the palm itself emits light. "
            "All palm lines glow softly in warm gold. Deep dark purple background with soft bokeh. "
            "Dramatic and beautiful. Canon EOS R5 85mm f/1.4. "
            "Square composition. Ultra photorealistic. Magical realism."
        ),
        'overlay': {
            'top_text': 'Your reading\nhas been waiting.',
            'bottom_text': 'madam-aurora.co — it\'s free',
            'brand': 'MADAM AURORA',
        }
    },
]


def generate_image(prompt):
    with httpx.Client(timeout=180) as c:
        r = c.post('https://openrouter.ai/api/v1/chat/completions',
            headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'},
            json={'model': MODEL, 'messages': [{'role': 'user', 'content': prompt}]})
    data = r.json()
    if 'error' in data:
        raise Exception(data['error'])
    msg = data['choices'][0]['message']
    imgs = msg.get('images', [])
    if imgs:
        url = imgs[0]['image_url']['url']
        if url.startswith('data:'):
            return base64.b64decode(url.split(',', 1)[1])
        with httpx.Client(timeout=60) as c:
            return c.get(url).content
    raise Exception(f'No image returned')


def load_font(bold, size):
    paths_bold = ['C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/verdanab.ttf']
    paths_reg  = ['C:/Windows/Fonts/arial.ttf',   'C:/Windows/Fonts/verdana.ttf']
    paths = paths_bold if bold else paths_reg
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def add_overlay(img_bytes, w, h, overlay):
    img = Image.open(io.BytesIO(img_bytes)).convert('RGBA').resize((w, h), Image.LANCZOS)

    # Gradiente topo
    g_top = Image.new('RGBA', (w, int(h*0.45)), (8, 4, 20, 0))
    gd = ImageDraw.Draw(g_top)
    for i in range(int(h*0.45)):
        a = int(210 * (1 - i/int(h*0.45))**0.5)
        gd.line([(0, i), (w, i)], fill=(8, 4, 20, a))
    img.alpha_composite(g_top, (0, 0))

    # Gradiente base
    g_bot = Image.new('RGBA', (w, int(h*0.35)), (8, 4, 20, 0))
    gd2 = ImageDraw.Draw(g_bot)
    for i in range(int(h*0.35)):
        a = int(220 * (1 - i/int(h*0.35))**0.5)
        gd2.line([(0, int(h*0.35)-1-i), (w, int(h*0.35)-1-i)], fill=(8, 4, 20, a))
    img.alpha_composite(g_bot, (0, h - int(h*0.35)))

    canvas = img.convert('RGB')
    draw = ImageDraw.Draw(canvas)
    GOLD_C = (201, 168, 76)
    MAX_W = w - 60

    # Texto topo
    top = overlay.get('top_text', '')
    if top:
        lines = top.split('\n')
        size = 72
        while size >= 32:
            f = load_font(True, size)
            if all((draw.textbbox((0,0),l,font=f)[2]-draw.textbbox((0,0),l,font=f)[0]) <= MAX_W for l in lines):
                break
            size -= 4
        f = load_font(True, size)
        for i, line in enumerate(lines):
            bb = draw.textbbox((0,0), line, font=f)
            tw = bb[2]-bb[0]
            x = (w-tw)//2
            y = 28 + i*(size+12)
            draw.text((x+2, y+2), line, font=f, fill=(0,0,0))
            draw.text((x, y), line, font=f, fill=(255,255,255))

    # Texto bottom
    bot = overlay.get('bottom_text', '')
    if bot:
        f = load_font(False, 34)
        bb = draw.textbbox((0,0), bot, font=f)
        if bb[2]-bb[0] > MAX_W:
            f = load_font(False, 26)
            bb = draw.textbbox((0,0), bot, font=f)
        x = (w-(bb[2]-bb[0]))//2
        y = h - 180
        draw.text((x+2, y+2), bot, font=f, fill=(0,0,0))
        draw.text((x, y), bot, font=f, fill=(220,220,220))

    # Linha separadora
    sep = h - 120
    draw.line([(w//2-70, sep), (w//2+70, sep)], fill=GOLD_C, width=2)

    # Brand
    brand = overlay.get('brand', '')
    if brand:
        f = load_font(True, 24)
        bb = draw.textbbox((0,0), brand, font=f)
        x = (w-(bb[2]-bb[0]))//2
        draw.text((x+2, sep+14+2), brand, font=f, fill=(0,0,0))
        draw.text((x, sep+14), brand, font=f, fill=GOLD_C)

    # Borda dourada
    for t in range(3):
        draw.rectangle([t, t, w-1-t, h-1-t], outline=GOLD_C)

    out = io.BytesIO()
    canvas.save(out, 'PNG', optimize=True)
    return out.getvalue()


print('=== MADAM AURORA — INSTAGRAM GENERATOR ===\n')

for asset in ASSETS:
    out_path = OUT / f'{asset["id"]}.png'
    if out_path.exists():
        print(f'  skip: {asset["id"]}')
        continue

    print(f'  [{asset["id"]}] {asset["label"]}... ', end='', flush=True)
    try:
        img_bytes = generate_image(asset['prompt'])
        # Salva base
        (OUT / f'{asset["id"]}_base.jpg').write_bytes(img_bytes)

        w, h = asset['size']
        if 'overlay' in asset:
            final = add_overlay(img_bytes, w, h, asset['overlay'])
        else:
            img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((w, h), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, 'PNG', optimize=True)
            final = buf.getvalue()

        out_path.write_bytes(final)
        print('OK')
    except Exception as e:
        print(f'ERR: {e}')
    time.sleep(3)

print('\n=== DONE ===')
