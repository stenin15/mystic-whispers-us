"""
Regenera criativos 02, 06, 07 com imagens melhoradas
- DALL-E 3 (variante A)
- Kling Kolors image generation (variante B)
Aplica copy overlay igual ao original
"""
import httpx, base64, os, json, time, io, jwt
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

import urllib3
urllib3.disable_warnings()

OPENAI_KEY = "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"
KLING_AK   = "Aemf4d4QrGmf4GETeYaYeBT38QgbBHkb"
KLING_SK   = "rYERrBHgEhpQgCk8pHQprNGNharbRLLa"

OUT   = Path("C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/scenes/ad_images_v2")
BASE  = OUT / "base"
REGEN = OUT / "regen"
REGEN.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1350

# ── Criativos a regenerar com prompts melhorados ────────────────────────────
CREATIVES = [
    {
        "id": "02_pattern",
        "headline": "Why does love always\nfeel like this?",
        "sub": "The answer might be written in your hand",
        "brand": "MADAM AURORA  •  Free Palm Reading",
        "dalle_prompt": (
            "A beautiful Caucasian American woman in her mid-30s sitting alone by a window at golden hour. "
            "She has a thoughtful, slightly melancholic expression, looking away from the camera. "
            "Warm amber sunlight creates soft rim lighting. Cozy modern interior. "
            "Her hand rests on the windowsill, palm slightly visible. "
            "Photorealistic portrait, cinematic, no text, no watermark, vertical composition."
        ),
        "kling_prompt": (
            "Photorealistic portrait of a beautiful American woman in her 30s, brown or blonde hair, "
            "sitting by a large window with golden hour light. Pensive expression, looking into the distance. "
            "Soft warm tones, cozy indoor atmosphere. Her open palm rests gently on her lap. "
            "No text, no watermark, cinematic, high quality."
        ),
    },
    {
        "id": "06_timing_window",
        "headline": "Are you in a love\ntiming window?",
        "sub": "Take 3 minutes to find out — it's free",
        "brand": "MADAM AURORA  •  Start Free",
        "dalle_prompt": (
            "Close-up of a beautiful Caucasian woman in her 30s, holding her open palm up near her face, "
            "studying it with curiosity and wonder. Warm golden candlelight illuminates her face and hand. "
            "Dark, intimate background. Her palm lines are clearly visible. "
            "Photorealistic, cinematic, elegant, no text, no watermark."
        ),
        "kling_prompt": (
            "Photorealistic close-up of a beautiful American woman, 30s, blonde or brunette, "
            "looking at her own open palm with curiosity and surprise. "
            "Soft candlelight, dark moody background, warm golden tones. "
            "Palm lines clearly visible, intimate and mysterious atmosphere. "
            "No text, no watermark, high quality, portrait orientation."
        ),
    },
    {
        "id": "07_curiosity",
        "headline": "I finally understood why\nevery relationship ended the same way",
        "sub": "It was written in my palm the whole time",
        "brand": "MADAM AURORA  •  Free Reading",
        "dalle_prompt": (
            "A beautiful Caucasian American woman in her early 30s with an introspective, emotional expression. "
            "She holds her open palm up and gazes at it with a look of sudden realization and wonder. "
            "Warm golden light falls across her face and hand. Dark background with soft bokeh. "
            "Her palm lines are clearly visible. Photorealistic portrait, cinematic depth, no text, no watermark."
        ),
        "kling_prompt": (
            "Photorealistic portrait of an American woman, early 30s, holding her open palm up to the light. "
            "Expression of deep realization and emotion — like she just understood something important. "
            "Golden warm lighting, dark background, palm lines visible. "
            "Cinematic, intimate, no text, no watermark, high quality."
        ),
    },
]


# ── Kling JWT Auth ────────────────────────────────────────────────────────────
def kling_token():
    now = int(time.time())
    payload = {"iss": KLING_AK, "exp": now + 1800, "nbf": now - 5}
    return jwt.encode(payload, KLING_SK, algorithm="HS256")


# ── DALL-E 3 generation ───────────────────────────────────────────────────────
def dalle_generate(prompt):
    with httpx.Client(verify=False, timeout=90) as c:
        r = c.post(
            "https://api.openai.com/v1/images/generations",
            headers={"Authorization": f"Bearer {OPENAI_KEY}"},
            json={
                "model": "dall-e-3",
                "prompt": prompt,
                "size": "1024x1792",
                "quality": "hd",
                "response_format": "b64_json",
            },
        )
    data = r.json()
    if "data" not in data:
        raise Exception(data)
    return base64.b64decode(data["data"][0]["b64_json"])


# ── Kling image generation ───────────────────────────────────────────────────
def kling_generate(prompt):
    token = kling_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    # Submit
    with httpx.Client(verify=False, timeout=60) as c:
        r = c.post(
            "https://api.klingai.com/v1/images/generations",
            headers=headers,
            json={
                "model_name": "kling-v1",
                "prompt": prompt,
                "negative_prompt": "text, watermark, logo, signature, cartoon, anime, distorted, ugly, low quality, blurry, nsfw",
                "image_count": 1,
                "aspect_ratio": "3:4",
            },
        )
    data = r.json()
    print(f"    Kling submit: {data.get('code')} {data.get('message','')}")
    if data.get("code") != 0:
        raise Exception(data)

    task_id = data["data"]["task_id"]
    print(f"    task_id: {task_id} — polling...")

    # Poll
    for attempt in range(40):
        time.sleep(8)
        with httpx.Client(verify=False, timeout=30) as c:
            r2 = c.get(
                f"https://api.klingai.com/v1/images/generations/{task_id}",
                headers=headers,
            )
        d2 = r2.json()
        status = d2.get("data", {}).get("task_status", "")
        print(f"    [{attempt+1}] status: {status}")
        if status == "succeed":
            url = d2["data"]["task_result"]["images"][0]["url"]
            with httpx.Client(verify=False, timeout=60) as c:
                img_r = c.get(url)
            return img_r.content
        if status == "failed":
            raise Exception(f"Kling failed: {d2}")

    raise Exception("Kling timeout")


# ── Copy overlay (igual ao v2) ────────────────────────────────────────────────
def load_font(bold, size):
    paths = ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/verdanab.ttf"] if bold \
       else ["C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/verdana.ttf"]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def fit_font(draw, text, max_w, bold=True, start=72, min_s=28):
    size = start
    while size >= min_s:
        font = load_font(bold, size)
        if all((draw.textbbox((0, 0), l, font=font)[2] - draw.textbbox((0, 0), l, font=font)[0]) <= max_w
               for l in text.split("\n")):
            return font, size
        size -= 4
    return load_font(bold, min_s), min_s


def add_copy(img_bytes, headline, sub, brand):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    img = img.resize((W, H), Image.LANCZOS)

    g_top = Image.new("RGBA", (W, 400), (8, 6, 12, 0))
    gd = ImageDraw.Draw(g_top)
    for i in range(400):
        a = int(215 * (1 - i / 400) ** 0.55)
        gd.line([(0, i), (W, i)], fill=(8, 6, 12, a))
    img.alpha_composite(g_top, (0, 0))

    g_bot = Image.new("RGBA", (W, 280), (8, 6, 12, 0))
    gd2 = ImageDraw.Draw(g_bot)
    for i in range(280):
        a = int(225 * (1 - i / 280) ** 0.5)
        gd2.line([(0, 279 - i), (W, 279 - i)], fill=(8, 6, 12, a))
    img.alpha_composite(g_bot, (0, H - 280))

    canvas = img.convert("RGB")
    draw = ImageDraw.Draw(canvas)
    GOLD = (212, 175, 55)
    MAX_W = W - 60

    font_hl, hl_sz = fit_font(draw, headline, MAX_W, bold=True, start=72)
    lines = headline.split("\n")
    lh = hl_sz + 14
    y0 = 28
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_hl)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        y = y0 + i * lh
        draw.text((x + 3, y + 3), line, font=font_hl, fill=(0, 0, 0))
        draw.text((x, y), line, font=font_hl, fill=(255, 255, 255))

    font_sub = load_font(False, 36)
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    if (bbox[2] - bbox[0]) > MAX_W:
        font_sub = load_font(False, 30)
        bbox = draw.textbbox((0, 0), sub, font=font_sub)
    sub_y = H - 195
    x = (W - (bbox[2] - bbox[0])) // 2
    draw.text((x + 2, sub_y + 2), sub, font=font_sub, fill=(0, 0, 0))
    draw.text((x, sub_y), sub, font=font_sub, fill=(220, 220, 220))

    sep_y = H - 133
    draw.line([(W // 2 - 80, sep_y), (W // 2 + 80, sep_y)], fill=GOLD, width=2)
    font_br = load_font(True, 27)
    bbox = draw.textbbox((0, 0), brand, font=font_br)
    x = (W - (bbox[2] - bbox[0])) // 2
    draw.text((x + 2, sep_y + 13 + 2), brand, font=font_br, fill=(0, 0, 0))
    draw.text((x, sep_y + 13), brand, font=font_br, fill=GOLD)

    for t in range(3):
        draw.rectangle([t, t, W - 1 - t, H - 1 - t], outline=GOLD)

    out = io.BytesIO()
    canvas.save(out, "PNG", optimize=True)
    return out.getvalue()


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  Regen criativos 02, 06, 07 — DALL-E 3 + Kling")
    print("=" * 55)

    for c in CREATIVES:
        print(f"\n-- {c['id']} --")

        # DALL-E 3
        print("  [A] DALL-E 3 ...", end=" ", flush=True)
        try:
            img = dalle_generate(c["dalle_prompt"])
            raw_path = REGEN / f"{c['id']}_dalle_base.png"
            raw_path.write_bytes(img)
            final = add_copy(img, c["headline"], c["sub"], c["brand"])
            out_path = REGEN / f"{c['id']}_A_dalle.png"
            out_path.write_bytes(final)
            print(f"OK -> {out_path.name}")
        except Exception as e:
            print(f"ERR: {e}")

        time.sleep(3)

        # Kling
        print("  [B] Kling ...", end=" ", flush=True)
        try:
            img = kling_generate(c["kling_prompt"])
            raw_path = REGEN / f"{c['id']}_kling_base.png"
            raw_path.write_bytes(img)
            final = add_copy(img, c["headline"], c["sub"], c["brand"])
            out_path = REGEN / f"{c['id']}_B_kling.png"
            out_path.write_bytes(final)
            print(f"OK -> {out_path.name}")
        except Exception as e:
            print(f"ERR: {e}")

        time.sleep(3)

    print(f"\n{'=' * 55}")
    print(f"  Imagens em: {REGEN}")
    print(f"  Arquivos: *_A_dalle.png (DALL-E 3) e *_B_kling.png (Kling)")
    print(f"{'=' * 55}")


if __name__ == "__main__":
    main()
