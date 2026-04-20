"""
Gera 10 criativos de imagem para Meta Ads
- DALL-E 3 (1024x1024) para base
- Pillow para resize 1080x1350 (4:5) + gradient + copy sobreposto
- Cada criativo tem hook headline + subtext + brand
"""
import httpx, base64, os, json, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io, textwrap, urllib3

urllib3.disable_warnings()

import re
OPENAI_KEY = "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"

OUT  = Path("C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/scenes/ad_images_v2")
BASE = Path("C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/scenes/ad_images_v2/base")
OUT.mkdir(parents=True, exist_ok=True)
BASE.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1350  # 4:5 Meta Feed

CREATIVES = [
    {
        "id": "01_mechanism",
        "headline": "There's a line on your palm\nthat reveals how you love",
        "sub": "Most people have never looked at it",
        "brand": "MADAM AURORA  •  Free Palm Reading",
        "prompt": "Close-up of a woman's open palm, warm golden light illuminating the heart line, dark moody background, cinematic lighting, photorealistic, 35mm film look, no text, no watermark",
    },
    {
        "id": "02_pattern",
        "headline": "Why does love always\nfeel like this?",
        "sub": "The answer might be written in your hand",
        "brand": "MADAM AURORA  •  Free Palm Reading",
        "prompt": "Beautiful woman sitting alone by a window at golden hour, pensive expression, soft dramatic lighting, photorealistic portrait, cinematic, no text, no watermark",
    },
    {
        "id": "03_timing",
        "headline": "Your love timing window\nmay be open right now",
        "sub": "Most women miss it without knowing",
        "brand": "MADAM AURORA  •  Free Reading",
        "prompt": "Elegant antique hourglass with golden sand, dark background, warm candlelight glow, cinematic product photography, shallow depth of field, no text, no watermark",
    },
    {
        "id": "04_social_proof",
        "headline": '"She was 38 and thought\nher time had passed"',
        "sub": "6 weeks after her reading, she met him.",
        "brand": "MADAM AURORA  •  Real Story",
        "prompt": "Happy woman in her late 30s smiling warmly, holding her phone, soft natural indoor light, cozy atmosphere, photorealistic portrait, no text, no watermark",
    },
    {
        "id": "05_spiritual",
        "headline": "Your palm lines don't lie.\nThey've been trying to tell you.",
        "sub": "Discover what yours reveal about love",
        "brand": "MADAM AURORA  •  Free Palm Reading",
        "prompt": "Woman's hand with palm facing up, golden glowing lines tracing the heart line, mystical dark background with soft bokeh, photorealistic, elegant, no text, no watermark",
    },
    {
        "id": "06_timing_window",
        "headline": "Are you in a love\ntiming window?",
        "sub": "Take 3 minutes to find out — it's free",
        "brand": "MADAM AURORA  •  Start Free",
        "prompt": "Elegant woman looking at her own palm with curiosity, soft candlelight, moody intimate atmosphere, close-up shot, photorealistic, cinematic, no text, no watermark",
    },
    {
        "id": "07_curiosity",
        "headline": "I finally understood why\nevery relationship ended the same way",
        "sub": "It was written in my palm the whole time",
        "brand": "MADAM AURORA  •  Free Reading",
        "prompt": "Woman holding her hand up gently, golden light on palm, introspective moment, warm dark background, photorealistic portrait, cinematic depth, no text, no watermark",
    },
    {
        "id": "08_skeptic",
        "headline": '"I didn\'t believe in\npalm reading either"',
        "sub": "Then I saw what my heart line actually meant",
        "brand": "MADAM AURORA  •  See For Yourself",
        "prompt": "Woman looking at her own palm with a surprised and thoughtful expression, natural daylight, realistic photography style, modern setting, no text, no watermark",
    },
    {
        "id": "09_retargeting",
        "headline": "You started. You didn't finish.\nYour reading is still waiting.",
        "sub": "It only takes 3 minutes",
        "brand": "MADAM AURORA  •  Come Back",
        "prompt": "Glowing smartphone screen showing a palm reading interface, woman's hand holding phone in soft candlelight, dark moody background, photorealistic, no text, no watermark",
    },
    {
        "id": "10_awareness",
        "headline": "What does your palm say\nabout love?",
        "sub": "Upload a photo. Answer 7 questions. Get your reading.",
        "brand": "MADAM AURORA  •  Free  •  Private  •  Instant",
        "prompt": "Two women's hands side by side, palms up, golden light, romantic warm atmosphere, close-up, high detail photorealistic photography, dark background, no text, no watermark",
    },
]


def generate_image(prompt):
    with httpx.Client(verify=False, timeout=60) as client:
        r = client.post(
            "https://api.openai.com/v1/images/generations",
            headers={"Authorization": f"Bearer {OPENAI_KEY}"},
            json={"model": "dall-e-3", "prompt": prompt, "size": "1024x1024",
                  "quality": "hd", "response_format": "b64_json"},
        )
    data = r.json()
    if "data" not in data:
        raise Exception(data)
    return base64.b64decode(data["data"][0]["b64_json"])


def load_font(bold, size):
    paths = ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/verdanab.ttf"] if bold \
       else ["C:/Windows/Fonts/arial.ttf",   "C:/Windows/Fonts/verdana.ttf"]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def fit_font(draw, text, max_w, bold=True, start=72, min_s=28):
    size = start
    while size >= min_s:
        font = load_font(bold, size)
        if all((draw.textbbox((0,0), l, font=font)[2] - draw.textbbox((0,0), l, font=font)[0]) <= max_w
               for l in text.split("\n")):
            return font, size
        size -= 4
    return load_font(bold, min_s), min_s

def add_copy(img_bytes, headline, sub, brand):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    # Preencher canvas inteiro 4:5 com a imagem
    img = img.resize((W, H), Image.LANCZOS)

    # Gradiente superior escuro
    g_top = Image.new("RGBA", (W, 400), (8, 6, 12, 0))
    gd = ImageDraw.Draw(g_top)
    for i in range(400):
        a = int(215 * (1 - i/400)**0.55)
        gd.line([(0, i), (W, i)], fill=(8, 6, 12, a))
    img.alpha_composite(g_top, (0, 0))

    # Gradiente inferior escuro
    g_bot = Image.new("RGBA", (W, 280), (8, 6, 12, 0))
    gd2 = ImageDraw.Draw(g_bot)
    for i in range(280):
        a = int(225 * (1 - i/280)**0.5)
        gd2.line([(0, 279-i), (W, 279-i)], fill=(8, 6, 12, a))
    img.alpha_composite(g_bot, (0, H-280))

    canvas = img.convert("RGB")
    draw = ImageDraw.Draw(canvas)
    GOLD  = (212, 175, 55)
    MAX_W = W - 60

    # Headline no topo (sobre gradiente escuro)
    font_hl, hl_sz = fit_font(draw, headline, MAX_W, bold=True, start=72)
    lines = headline.split("\n")
    lh = hl_sz + 14
    y0 = 28
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0,0), line, font=font_hl)
        tw = bbox[2] - bbox[0]
        x  = (W - tw) // 2
        y  = y0 + i * lh
        draw.text((x+3, y+3), line, font=font_hl, fill=(0,0,0))
        draw.text((x,   y),   line, font=font_hl, fill=(255,255,255))

    # Sub no rodapé
    font_sub = load_font(False, 36)
    bbox = draw.textbbox((0,0), sub, font=font_sub)
    if (bbox[2]-bbox[0]) > MAX_W:
        font_sub = load_font(False, 30)
        bbox = draw.textbbox((0,0), sub, font=font_sub)
    sub_y = H - 195
    x = (W - (bbox[2]-bbox[0])) // 2
    draw.text((x+2, sub_y+2), sub, font=font_sub, fill=(0,0,0))
    draw.text((x,   sub_y),   sub, font=font_sub, fill=(220,220,220))

    # Separador + brand
    sep_y = H - 133
    draw.line([(W//2-80, sep_y), (W//2+80, sep_y)], fill=GOLD, width=2)
    font_br = load_font(True, 27)
    bbox = draw.textbbox((0,0), brand, font=font_br)
    x = (W - (bbox[2]-bbox[0])) // 2
    draw.text((x+2, sep_y+13+2), brand, font=font_br, fill=(0,0,0))
    draw.text((x,   sep_y+13),   brand, font=font_br, fill=GOLD)

    # Borda dourada
    for t in range(3):
        draw.rectangle([t, t, W-1-t, H-1-t], outline=GOLD)

    out = io.BytesIO()
    canvas.save(out, "PNG", optimize=True)
    return out.getvalue()


def main():
    print("=" * 55)
    print("  Meta Ads Creatives v2 — 10 imagens 1080x1350")
    print("=" * 55)

    for i, c in enumerate(CREATIVES):
        fname = OUT / f"ad{c['id']}.png"
        print(f"\n  [{i+1:02d}/10] {c['id']}")

        # Gerar imagem base
        print(f"    DALL-E 3 ...", end=" ", flush=True)
        try:
            img_bytes = generate_image(c["prompt"])
            # Salvar base limpa
            (BASE / fname.name).write_bytes(img_bytes)
            print("OK")
        except Exception as e:
            print(f"ERR: {e}")
            continue

        # Adicionar copy
        print(f"    Copy overlay ...", end=" ", flush=True)
        try:
            final = add_copy(img_bytes, c["headline"], c["sub"], c["brand"])
            fname.write_bytes(final)
            sz = len(final) // 1024
            print(f"OK ({sz}KB) -> {fname.name}")
        except Exception as e:
            print(f"ERR: {e}")
            continue

        time.sleep(2)  # rate limit

    print(f"\n{'='*55}")
    print(f"  Criativos em: {OUT}")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()
