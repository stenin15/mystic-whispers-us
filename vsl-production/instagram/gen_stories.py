"""
Madam Aurora — Stories Generator para Highlights
Gera 18 stories 9:16 (1080x1920) para os 5 highlights
Modelo: Seedream 4.5 via OpenRouter
"""
import httpx, base64, io, os, sys, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from env_loader import require_env

KEY   = require_env("OPENROUTER_API_KEY")
MODEL = 'bytedance-seed/seedream-4.5'
OUT   = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram/stories')
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
GOLD   = (201, 168, 76)
WHITE  = (255, 255, 255)
PURPLE = (8, 4, 20)

STORIES = [

    # ══════════════════════════════════════════════════════
    # HIGHLIGHT: FREE READ (3 stories)
    # ══════════════════════════════════════════════════════
    {
        'id': 'fr01_cta_link',
        'highlight': 'Free Read',
        'label': 'Free Read 1 — CTA principal',
        'prompt': (
            "Vertical portrait 9:16 mystical editorial photo. "
            "A woman's open palm raised upward, centered, golden light radiating from below. "
            "All palm lines glow softly in warm gold. Deep dark purple background with soft bokeh candles. "
            "Dramatic, beautiful, magical realism. Canon EOS R5 85mm f/1.4. "
            "Vertical 9:16 composition. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'Your free\nreading is\nwaiting.',
            'body_lines': [
                'Upload your palm photo.',
                'Answer 7 questions.',
                'Receive your reading.',
                '',
                'Free. Private. 3 minutes.',
            ],
            'cta': '→ madam-aurora.co',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'fr02_how_it_works',
        'highlight': 'Free Read',
        'label': 'Free Read 2 — Como funciona',
        'prompt': (
            "Vertical 9:16 editorial flat lay. Woman's open palm on dark purple velvet, "
            "palm facing up, warm golden candlelight from the side. "
            "Beside the hand: elegant antique brass compass, white candle burning, dried flowers. "
            "Dark moody atmosphere, deep purple and gold palette. "
            "Overhead shot. Canon EOS R5 50mm f/2.0. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'How it works',
            'body_lines': [
                '① Take a photo of your palm',
                '② Answer 7 short questions',
                '③ Get your personalized reading',
                '',
                'No sign-up required.',
                'No credit card.',
                'Just your palm and your truth.',
            ],
            'cta': '→ madam-aurora.co',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'fr03_what_you_get',
        'highlight': 'Free Read',
        'label': 'Free Read 3 — O que você recebe',
        'prompt': (
            "Vertical 9:16 editorial mystical photo. "
            "Close-up of a woman's hand holding an elegant sealed envelope with a gold wax seal. "
            "Warm candlelight from below. Deep dark purple background. "
            "Sense of mystery and anticipation. Canon EOS R5 85mm f/1.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'What you\nreceive',
            'body_lines': [
                '✦ Your dominant line reading',
                '✦ The pattern behind your love life',
                '✦ Why timing keeps shifting',
                '✦ Your next aligned action',
                '',
                'Personalized. Not a horoscope.',
                'Written for your palm only.',
            ],
            'cta': 'Link in bio — it\'s free',
            'brand': 'MADAM AURORA',
        }
    },

    # ══════════════════════════════════════════════════════
    # HIGHLIGHT: RESULTS (4 stories)
    # ══════════════════════════════════════════════════════
    {
        'id': 're01_sarah',
        'highlight': 'Results',
        'label': 'Results 1 — Sarah M.',
        'prompt': (
            "Vertical 9:16 editorial portrait. Beautiful Caucasian woman, late 30s, blonde hair, "
            "warm genuine smile, holding glowing smartphone at chest level. "
            "Cozy warm living room, golden afternoon light. "
            "She looks slightly off-camera with joyful hopeful expression. "
            "Canon EOS R5 85mm f/1.8, shallow depth of field. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"This was the\nmost accurate\nthing I\'ve ever\nread about myself."',
            'body_lines': [
                '— Sarah M., 41',
                '   Tennessee',
                '',
                '"I\'ve never felt so seen.',
                'The reading described my exact',
                'situation in ways I couldn\'t',
                'even articulate to my therapist."',
            ],
            'cta': 'Get yours free → link in bio',
            'brand': 'MADAM AURORA  ✦  500k+ Readings',
        }
    },
    {
        'id': 're02_dana',
        'highlight': 'Results',
        'label': 'Results 2 — Dana',
        'prompt': (
            "Vertical 9:16 editorial portrait. Beautiful American woman, late 30s, dark wavy hair, "
            "sitting by a window with warm natural light, looking thoughtfully at her open palm. "
            "Surprised and moved expression. Cozy modern interior. "
            "Canon EOS R5 85mm f/1.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"Three sentences\nchanged\neverything."',
            'body_lines': [
                '— Dana, 38',
                '   Oregon',
                '',
                '"I spent years in therapy trying',
                'to understand why I always chose',
                'emotionally unavailable men.',
                '',
                'The palm reading named the',
                'pattern in three sentences."',
            ],
            'cta': 'Free reading → link in bio',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 're03_rachel',
        'highlight': 'Results',
        'label': 'Results 3 — Rachel',
        'prompt': (
            "Vertical 9:16 editorial portrait. Caucasian woman in her early 40s, brunette, "
            "sitting at a kitchen table with a cup of tea, looking at her palm with a calm, "
            "knowing smile. Warm morning light. Cozy home interior. "
            "Canon EOS R5 85mm f/1.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"I had to put\nmy phone down."',
            'body_lines': [
                '— Rachel, 41',
                '   Tennessee',
                '',
                '"I have done birth charts,',
                'tarot, everything.',
                'Nothing clicked like this.',
                '',
                'The reading described my',
                'relationship pattern so accurately',
                'I had to put my phone down."',
            ],
            'cta': 'Try yours free → link in bio',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 're04_500k',
        'highlight': 'Results',
        'label': 'Results 4 — 500k milestone',
        'prompt': (
            "Vertical 9:16 aerial view. Multiple female hands, different skin tones, "
            "all palms facing up, arranged in a beautiful circular pattern. "
            "Warm golden candlelight illuminates all palms. Dark purple surface. "
            "Artistic, editorial, symbolic of community and diversity. "
            "Canon EOS R5 35mm f/4.0. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '500,000+',
            'body_lines': [
                'free readings delivered.',
                '',
                'Different ages.',
                'Different cities.',
                'Different questions.',
                '',
                'Same result:',
                'clarity.',
            ],
            'cta': 'Join them → link in bio',
            'brand': 'MADAM AURORA',
        }
    },

    # ══════════════════════════════════════════════════════
    # HIGHLIGHT: PALM LINES (4 stories)
    # ══════════════════════════════════════════════════════
    {
        'id': 'pl01_heart_line',
        'highlight': 'Palm Lines',
        'label': 'Palm Lines 1 — Heart Line',
        'prompt': (
            "Vertical 9:16 editorial macro photo. Beautiful woman's open right hand, palm facing camera, "
            "fingers pointing upward. The heart line — topmost curved line — highlighted with "
            "soft golden luminous glow. Other lines visible but subtle. "
            "Warm candlelight from left. Deep dark purple background. "
            "Canon EOS R5 100mm macro f/2.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'The Heart Line',
            'body_lines': [
                'The topmost curved line',
                'across your palm.',
                '',
                'Curves up toward index finger:',
                '→ Natural giver. Partners who take.',
                '',
                'Runs straight across:',
                '→ Logic over emotion.',
                '   Self-protective in love.',
                '',
                'Deeply curved, long:',
                '→ Intense emotional capacity.',
                '   You feel everything deeply.',
            ],
            'cta': 'Get your full reading free',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'pl02_head_line',
        'highlight': 'Palm Lines',
        'label': 'Palm Lines 2 — Head Line',
        'prompt': (
            "Vertical 9:16 editorial macro photo. Woman's open palm, centered, "
            "the head line — middle horizontal line — highlighted with a thin golden luminous glow. "
            "Warm side lighting. Deep dark purple background with soft bokeh. "
            "Canon EOS R5 100mm macro f/2.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'The Head Line',
            'body_lines': [
                'The line running across',
                'the middle of your palm.',
                '',
                'Straight and long:',
                '→ Analytical. You overthink love.',
                '',
                'Curves downward:',
                '→ Creative, intuitive choices.',
                '   Follows feeling over logic.',
                '',
                'Short and faint:',
                '→ Quick decisions. Impulsive',
                '   in relationships.',
            ],
            'cta': 'Get your full reading free',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'pl03_life_line',
        'highlight': 'Palm Lines',
        'label': 'Palm Lines 3 — Life Line (mito)',
        'prompt': (
            "Vertical 9:16 editorial macro photo. Two open female palms side by side, "
            "both facing camera, fingers pointing upward. One light skin, one medium-tan. "
            "The life line on each hand highlighted with subtle golden glow. "
            "Warm golden light from above. Deep dark purple background. "
            "Canon EOS R5 85mm f/2.0. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'The Life Line\n(the myth, busted)',
            'body_lines': [
                'It does NOT predict death.',
                '',
                'It actually reveals:',
                '',
                'Runs close to the thumb:',
                '→ Cautious. Slow to open up.',
                '   Protective in love.',
                '',
                'Sweeps wide across palm:',
                '→ You fall hard. Give everything.',
                '   Need a partner who matches.',
                '',
                'Long and deep:',
                '→ Strong energy. Resilient heart.',
            ],
            'cta': 'Get your full reading free',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'pl04_fate_line',
        'highlight': 'Palm Lines',
        'label': 'Palm Lines 4 — Fate Line',
        'prompt': (
            "Vertical 9:16 editorial macro photo. Woman's open palm viewed from slightly above, "
            "the fate line — vertical line running up the center — highlighted with golden luminous glow. "
            "The line appears to rise from the wrist toward the middle finger. "
            "Dramatic golden side light. Deep dark purple background. "
            "Canon EOS R5 100mm macro f/2.0. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'The Fate Line',
            'body_lines': [
                'The vertical line rising',
                'through the center of your palm.',
                '',
                'Strong and deep:',
                '→ Purpose-driven. Your path',
                '   in love is not accidental.',
                '',
                'Broken or absent:',
                '→ Freedom seeker. Your love',
                '   story is still being written.',
                '',
                'Starts from life line:',
                '→ Self-made. Chooses love',
                '   deliberately, not by chance.',
            ],
            'cta': 'Get your full reading free',
            'brand': 'MADAM AURORA',
        }
    },

    # ══════════════════════════════════════════════════════
    # HIGHLIGHT: ABOUT AURORA (3 stories)
    # ══════════════════════════════════════════════════════
    {
        'id': 'ab01_who',
        'highlight': 'About Aurora',
        'label': 'About 1 — Quem é',
        'prompt': (
            "Vertical 9:16 elegant mystical photo. A woman's elegant silhouette in profile, "
            "long flowing hair, holding a lit candle. Deep purple background with soft golden mist. "
            "The candlelight illuminates her from below creating warm golden aura. "
            "No face visible — just elegant silhouette and candle flame. "
            "Mystical, wise, welcoming. Photorealistic, cinematic."
        ),
        'overlay': {
            'top_text': 'Who is\nMadam Aurora?',
            'body_lines': [
                'A palmistry reader dedicated',
                'to one thing:',
                '',
                'Giving women the clarity',
                'they\'ve been searching for',
                'in relationships.',
                '',
                '12 years of readings.',
                '500,000+ women helped.',
                '',
                'Not predictions.',
                'Not magic.',
                'Pattern recognition — the kind',
                'your palm has always held.',
            ],
            'cta': '',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'ab02_why_palm',
        'highlight': 'About Aurora',
        'label': 'About 2 — Por que palm reading',
        'prompt': (
            "Vertical 9:16 editorial macro photo. Extreme close-up of a woman's open palm, "
            "dramatic golden side lighting revealing palm lines in high contrast. "
            "Deep purple background. The three main lines subtly overlaid with thin golden glowing lines. "
            "Canon EOS R5 100mm macro f/2.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'Why palm\nreading works',
            'body_lines': [
                'Your palm lines were formed',
                'before you were born.',
                '',
                'They don\'t change based on',
                'mood, therapy, or New Year',
                'resolutions.',
                '',
                'They reflect your nervous',
                'system — how you attach,',
                'how you love, and what',
                'patterns keep repeating.',
                '',
                'That\'s not mysticism.',
                'That\'s you, on the page.',
            ],
            'cta': '',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'ab03_mission',
        'highlight': 'About Aurora',
        'label': 'About 3 — Missão',
        'prompt': (
            "Vertical 9:16 editorial mystical photo. Golden candlelight casting warm glow "
            "across a dark purple velvet surface. A woman's hands cupping a glowing candle flame, "
            "the light filtering through her fingers. Intimate, warm, purposeful. "
            "Canon EOS R5 85mm f/1.4. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': 'The mission',
            'body_lines': [
                'Most women spend years',
                'in the wrong relationship,',
                'or alone — not knowing why.',
                '',
                'I built Madam Aurora',
                'for the moment before',
                'you give up.',
                '',
                'Your palm has been holding',
                'the answer the whole time.',
                '',
                'You just needed someone',
                'to help you read it.',
            ],
            'cta': 'Free reading → link in bio',
            'brand': 'MADAM AURORA',
        }
    },

    # ══════════════════════════════════════════════════════
    # HIGHLIGHT: FAQ (4 stories)
    # ══════════════════════════════════════════════════════
    {
        'id': 'fq01_is_it_real',
        'highlight': 'FAQ',
        'label': 'FAQ 1 — É real?',
        'prompt': (
            "Vertical 9:16 abstract elegant design. Deep purple background with subtle golden constellation "
            "pattern across the entire frame. "
            "Center: ornamental question mark in gold with decorative flourishes. "
            "Question mark glows softly with warm light. "
            "Sophisticated, luxury mystical brand aesthetic. Photorealistic render."
        ),
        'overlay': {
            'top_text': '"Is this\nactually real?"',
            'body_lines': [
                'Fair question.',
                '',
                'Palm reading is not magic.',
                'It\'s pattern recognition.',
                '',
                'Your lines reflect how your',
                'nervous system developed —',
                'how you attach, protect,',
                'and open up in relationships.',
                '',
                'We use that to give you',
                'a mirror — not a prediction.',
                '',
                'What you do with it is yours.',
            ],
            'cta': 'Try it free → link in bio',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'fq02_how_does_it_work',
        'highlight': 'FAQ',
        'label': 'FAQ 2 — Como funciona?',
        'prompt': (
            "Vertical 9:16 editorial photo. Woman's hands holding a smartphone in portrait orientation, "
            "screen showing mystical palm reading interface with golden palm line illustrations "
            "on dark purple background. Warm candlelight from behind. "
            "Dark moody background with soft bokeh. "
            "Canon EOS R5 85mm f/1.8, shallow depth of field. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"How does\nit work?"',
            'body_lines': [
                '① Upload a photo of your palm',
                '   (your smartphone camera works)',
                '',
                '② Answer 7 questions about',
                '   your love life and patterns',
                '',
                '③ Receive your reading',
                '   — personalized to your hand',
                '',
                'Private. No account needed.',
                'Takes about 3 minutes.',
                'Completely free.',
            ],
            'cta': 'Start → madam-aurora.co',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'fq03_really_free',
        'highlight': 'FAQ',
        'label': 'FAQ 3 — É realmente grátis?',
        'prompt': (
            "Vertical 9:16 editorial mystical photo. A woman's hand holding a small glowing golden orb, "
            "the light illuminating her palm lines from below. Deep dark purple background. "
            "Sense of gift, offering, generosity. Warm magical light. "
            "Canon EOS R5 85mm f/1.4. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"Is it\nreally free?"',
            'body_lines': [
                'Yes. Completely.',
                '',
                'No credit card.',
                'No sign-up.',
                'No catch.',
                '',
                'The reading is free because',
                'we believe clarity should be',
                'accessible — not a luxury.',
                '',
                'After your reading, you\'ll have',
                'the option to go deeper.',
                'That part is your choice.',
                'The reading itself: always free.',
            ],
            'cta': 'Go → madam-aurora.co',
            'brand': 'MADAM AURORA',
        }
    },
    {
        'id': 'fq04_skeptic',
        'highlight': 'FAQ',
        'label': 'FAQ 4 — E se eu for cética?',
        'prompt': (
            "Vertical 9:16 editorial portrait. Beautiful American woman in her late 30s, "
            "skeptical but curious expression, arms slightly crossed but leaning forward. "
            "She holds her open palm up at chest level, looking at it with raised eyebrow. "
            "Cozy warm interior lighting. Canon EOS R5 85mm f/1.8. Ultra photorealistic."
        ),
        'overlay': {
            'top_text': '"I\'m skeptical."',
            'body_lines': [
                'Good.',
                '',
                'Skepticism means you won\'t',
                'accept vague flattery.',
                '',
                'Our readings are specific.',
                'They name patterns, not vibes.',
                'They describe situations,',
                'not personality types.',
                '',
                '"I am not the type to believe',
                'in this. But I tried it. I had to',
                'stop reading halfway through',
                'because it described something',
                'I had never told anyone."',
                '',
                '— Real reader, 36, Chicago',
            ],
            'cta': 'Your skepticism is welcome',
            'brand': 'MADAM AURORA  →  madam-aurora.co',
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
    raise Exception('No image returned')


def load_font(bold, size):
    paths_bold = ['C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/verdanab.ttf']
    paths_reg  = ['C:/Windows/Fonts/arial.ttf',   'C:/Windows/Fonts/verdana.ttf']
    paths = paths_bold if bold else paths_reg
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def add_story_overlay(img_bytes, overlay):
    img = Image.open(io.BytesIO(img_bytes)).convert('RGBA').resize((W, H), Image.LANCZOS)

    # Gradiente topo (mais alto para stories)
    gh = int(H * 0.55)
    g_top = Image.new('RGBA', (W, gh), (8, 4, 20, 0))
    gd = ImageDraw.Draw(g_top)
    for i in range(gh):
        a = int(225 * (1 - i/gh)**0.6)
        gd.line([(0, i), (W, i)], fill=(8, 4, 20, a))
    img.alpha_composite(g_top, (0, 0))

    # Gradiente base
    gb = int(H * 0.30)
    g_bot = Image.new('RGBA', (W, gb), (8, 4, 20, 0))
    gd2 = ImageDraw.Draw(g_bot)
    for i in range(gb):
        a = int(230 * (1 - i/gb)**0.5)
        gd2.line([(0, gb-1-i), (W, gb-1-i)], fill=(8, 4, 20, a))
    img.alpha_composite(g_bot, (0, H - gb))

    canvas = img.convert('RGB')
    draw = ImageDraw.Draw(canvas)
    GOLD_C = (201, 168, 76)
    PAD = 60
    MAX_W = W - PAD * 2

    y = 80

    # Texto topo (headline grande)
    top = overlay.get('top_text', '')
    if top:
        lines = top.split('\n')
        size = 88
        while size >= 44:
            f = load_font(True, size)
            if all((draw.textbbox((0,0), l, font=f)[2] - draw.textbbox((0,0), l, font=f)[0]) <= MAX_W for l in lines):
                break
            size -= 4
        f = load_font(True, size)
        for line in lines:
            bb = draw.textbbox((0, 0), line, font=f)
            tw = bb[2] - bb[0]
            x = (W - tw) // 2
            draw.text((x+2, y+2), line, font=f, fill=(0, 0, 0))
            draw.text((x, y), line, font=f, fill=(255, 255, 255))
            y += size + 14
        y += 30

    # Linha divisória
    draw.line([(W//2 - 60, y), (W//2 + 60, y)], fill=GOLD_C, width=2)
    y += 24

    # Corpo (linhas de texto menores)
    body_lines = overlay.get('body_lines', [])
    if body_lines:
        f_body = load_font(False, 36)
        f_bold = load_font(True, 36)
        for line in body_lines:
            if not line:
                y += 18
                continue
            # Linhas com → usam bold
            f = f_bold if line.startswith('→') or line.startswith('①') or line.startswith('②') or line.startswith('③') else f_body
            bb = draw.textbbox((0, 0), line, font=f)
            tw = bb[2] - bb[0]
            x = (W - tw) // 2
            draw.text((x+1, y+1), line, font=f, fill=(0, 0, 0, 180))
            draw.text((x, y), line, font=f, fill=(220, 215, 205))
            y += 44

    # CTA
    cta = overlay.get('cta', '')
    if cta:
        y_cta = H - 220
        f = load_font(True, 40)
        bb = draw.textbbox((0, 0), cta, font=f)
        tw = bb[2] - bb[0]
        x = (W - tw) // 2
        draw.text((x+2, y_cta+2), cta, font=f, fill=(0, 0, 0))
        draw.text((x, y_cta), cta, font=f, fill=GOLD_C)

    # Linha + Brand
    sep = H - 130
    draw.line([(W//2 - 80, sep), (W//2 + 80, sep)], fill=GOLD_C, width=2)
    brand = overlay.get('brand', '')
    if brand:
        f = load_font(True, 26)
        bb = draw.textbbox((0, 0), brand, font=f)
        x = (W - (bb[2]-bb[0])) // 2
        draw.text((x+2, sep+16+2), brand, font=f, fill=(0, 0, 0))
        draw.text((x, sep+16), brand, font=f, fill=GOLD_C)

    # Borda dourada
    for t in range(3):
        draw.rectangle([t, t, W-1-t, H-1-t], outline=GOLD_C)

    buf = io.BytesIO()
    canvas.save(buf, 'PNG', optimize=True)
    return buf.getvalue()


print('=== MADAM AURORA — STORIES GENERATOR ===\n')

for story in STORIES:
    out_path = OUT / f'{story["id"]}.png'
    if out_path.exists():
        print(f'  skip: {story["id"]}')
        continue

    print(f'  [{story["highlight"]}] {story["label"]}... ', end='', flush=True)
    try:
        img_bytes = generate_image(story['prompt'])
        (OUT / f'{story["id"]}_base.jpg').write_bytes(img_bytes)

        final = add_story_overlay(img_bytes, story.get('overlay', {}))
        out_path.write_bytes(final)
        print('OK')
    except Exception as e:
        print(f'ERR: {e}')
    time.sleep(3)

print('\n=== DONE — 18 stories geradas ===')
