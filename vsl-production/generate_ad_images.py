"""
Gera 10 imagens para criativos estáticos Meta Ads — Madam Aurora
Formato 1:1 (1024x1024) para Feed + algumas 9:16 para Stories
"""
import time, requests, io, ssl, os
from pathlib import Path
from openai import OpenAI
from PIL import Image
import urllib3
urllib3.disable_warnings()
import httpx

OPENAI_KEY = "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"
client = OpenAI(api_key=OPENAI_KEY, http_client=httpx.Client(verify=False))

OUT_DIR = Path("scenes/ad_images")
OUT_DIR.mkdir(parents=True, exist_ok=True)

CREATIVES = [
    {
        "id": "ad01_mechanism",
        "size": "1024x1024",
        "prompt": "Extreme close-up of an open female palm filling the entire square frame. The heart line — the curved line below the fingers — glows with a subtle warm golden light. Dark navy background. Warm candlelight from the left. Skin texture beautifully detailed. Ultra cinematic photography. Square 1:1 format. No text, no watermarks.",
    },
    {
        "id": "ad02_pattern",
        "size": "1024x1024",
        "prompt": "Split image: left half shows a woman sitting alone by a window, soft melancholic blue light, looking thoughtful. Right half shows the same woman's open palm with warm golden light illuminating the lines. A thin golden dividing line separates both halves. Cinematic, emotional, square format 1:1. No text.",
    },
    {
        "id": "ad03_timing",
        "size": "1024x1024",
        "prompt": "An elegant antique hourglass with golden glowing sand on the left side of a square frame. On the right, an open palm with the marriage lines on the outer edge gently highlighted in gold. Deep black background. Both elements bathed in warm amber light. Cinematic fine art photography. Square 1:1. No text.",
    },
    {
        "id": "ad04_social_proof",
        "size": "1024x1024",
        "prompt": "A clean minimal design: white rounded rectangle card on a dark warm background, styled like a genuine text message screenshot. Inside the card, handwritten-style italic text. Below the text, a small name and location in gray. Bottom right corner: a small elegant logo area. Square format 1:1. No actual readable text — just the visual layout of a testimonial card.",
    },
    {
        "id": "ad05_spiritual",
        "size": "1024x1024",
        "prompt": "Open female palm centered in the frame. The palm lines glow with ethereal blue-violet mystical energy, like subtle aurora borealis light flowing along the lines. Deep black background with tiny out-of-focus star-like bokeh. Premium, elegant, spiritual but not kitschy. Ultra-cinematic. Square 1:1. No text.",
    },
    {
        "id": "ad06_timing_window",
        "size": "1024x1024",
        "prompt": "A stylized calendar page with one date circled in gold, on the left side of the frame. On the right, a close-up palm with one specific line highlighted in golden light. Deep dark background, warm dramatic lighting. Editorial design aesthetic. Square 1:1 format. Minimal, elegant. No text.",
    },
    {
        "id": "ad07_curiosity_story",
        "size": "1024x1792",
        "prompt": "Elegant vertical 9:16 design. Deep purple-to-black gradient background. Center: a beautifully lit open female palm with delicate golden line highlights. Top area has space for large serif text overlay. Bottom: small palm silhouette graphic element. Premium editorial aesthetic. Mystical yet modern. Portrait format. No text.",
    },
    {
        "id": "ad08_skeptic",
        "size": "1024x1024",
        "prompt": "Split square image. Left half: cold gray-blue background with a skeptical minimalist X symbol or question mark in white. Right half: warm golden background with a beautifully illuminated palm close-up, lines glowing softly. The contrast between cold skepticism and warm discovery. Cinematic. Square 1:1. No text.",
    },
    {
        "id": "ad09_retargeting",
        "size": "1024x1024",
        "prompt": "Intimate cozy nighttime scene: a single white candle burning warmly on a dark wooden table. Beside it, an open female hand with palm facing up, softly lit by the candlelight. Warm amber shadows. Shot from slightly above. Feels safe, inviting, personal. Ultra cinematic. Square 1:1. No text.",
    },
    {
        "id": "ad10_social_grid",
        "size": "1024x1024",
        "prompt": "Four elegant testimonial cards arranged in a 2x2 grid on a deep dark background. Each card has a thin golden border and contains a small abstract palm line icon. The cards are styled like premium app reviews. Bottom of the image: a small elegant logo placeholder. Warm gold and dark navy color scheme. Square 1:1. No readable text.",
    },
]

def gen(creative):
    print(f"  [{creative['id']}]...", end=" ", flush=True)
    try:
        resp = client.images.generate(
            model="dall-e-3",
            prompt=creative["prompt"],
            size=creative["size"],
            quality="hd",
            n=1,
        )
        url = resp.data[0].url
        data = requests.get(url, verify=False).content
        path = OUT_DIR / f"{creative['id']}.png"
        path.write_bytes(data)
        sz = path.stat().st_size // 1024
        print(f"OK ({sz}KB)")
        return True
    except Exception as e:
        print(f"ERR: {str(e)[:80]}")
        return False

def main():
    print("=" * 55)
    print("  Gerando 10 Imagens — Criativos Meta Ads")
    print("=" * 55)
    ok = 0
    for c in CREATIVES:
        if gen(c):
            ok += 1
        time.sleep(1.5)
    print(f"\n  {ok}/10 imagens geradas em: {OUT_DIR}")

if __name__ == "__main__":
    main()
