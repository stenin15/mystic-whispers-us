"""
Gera 15 imagens DALL-E 3 de alta qualidade para o VSL Madam Aurora
Formato 9:16 (1024x1792) — otimizadas para Kling Image-to-Video
"""
import time, base64, requests
from pathlib import Path
from openai import OpenAI
from PIL import Image
import io

from env_loader import require_env

OPENAI_KEY = require_env("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_KEY)

BASE_DIR  = Path(__file__).parent
OUT_DIR   = BASE_DIR / "scenes" / "images_v2"
SMALL_DIR = BASE_DIR / "scenes" / "images_v2_small"
OUT_DIR.mkdir(parents=True, exist_ok=True)
SMALL_DIR.mkdir(parents=True, exist_ok=True)

SCENES = [
    {
        "id": "00_silence",
        "prompt": "Extreme close-up of a woman's open palm, center frame, soft out-of-focus background of deep navy blue. The palm lines are delicate and clearly visible. Warm candlelight illuminates the hand from the left side, casting a golden glow on the skin. The hand is slightly blurred, slowly coming into focus. Cinematic, intimate, vertical 9:16 composition. Ultra HD. No text.",
        "kling": "Palm slowly sharpens into focus from a soft blur, warm golden candlelight flickers gently, slow breathing motion, cinematic."
    },
    {
        "id": "01_hook_line1",
        "prompt": "Macro close-up of an open female palm, filling the entire vertical frame. The heart line — the curved line below the fingers — is illuminated with a subtle warm golden glow. A single delicate fingertip gently traces along the heart line. Deep burgundy and gold tones. Soft bokeh background. Ultra-cinematic lighting. 9:16 portrait. No text.",
        "kling": "Fingertip slowly traces the glowing heart line, golden light pulses gently along the line, warm intimate atmosphere."
    },
    {
        "id": "02_hook_line2",
        "prompt": "Two female hands placed gently side by side on dark velvet fabric, palms facing up. Both hands are beautifully lit with warm amber candlelight from above. The heart lines on both palms are subtly highlighted in gold. Deep shadow background creates depth. Cinematic vertical composition 9:16. Intimate and mysterious mood. No text.",
        "kling": "Golden light slowly illuminates and traces the heart lines on both palms simultaneously, gentle camera glide left to right."
    },
    {
        "id": "03_hook_punch",
        "prompt": "A single female hand extends toward the camera, palm fully open and facing up, centered in a vertical 9:16 frame. Shot from slightly below looking up. Divine warm golden light radiates from above, illuminating every palm line in stunning detail. Deep dark background with subtle purple and navy gradients. Cinematic, powerful, spiritual. No text.",
        "kling": "Palm slowly extends closer toward the camera, divine golden light intensifies from above, breathtaking slow reveal."
    },
    {
        "id": "04_problem1",
        "prompt": "A thoughtful young woman in her early 30s sits by a large window at golden hour. She looks out the window with a pensive, melancholic expression. Warm afternoon sunlight creates a rim light around her silhouette. Soft focus background of blurred city lights. Cinematic portrait, 9:16 vertical. Emotional, intimate. No text.",
        "kling": "Soft light slowly shifts across her face, her expression subtle and reflective, gentle handheld camera drift, emotional atmosphere."
    },
    {
        "id": "05_problem2",
        "prompt": "Abstract cinematic scene: thousands of tiny golden particles drift and float in deep purple and navy blue darkness. The particles move in slow swirling patterns, forming subtle heart-like shapes before dissolving. Ethereal, dreamlike, emotional. Deep contrast. 9:16 vertical composition. No text.",
        "kling": "Golden particles swirl and drift slowly through the darkness, forming and dissolving into subtle patterns, ethereal and hypnotic."
    },
    {
        "id": "06_pattern_reveal",
        "prompt": "Ultra close-up macro shot of a palm's heart line. The line begins as normal skin and gradually illuminates from one end with a flowing golden light, as if the line itself is alive. The glow is warm amber-gold against deep shadow. The surrounding skin has beautiful texture detail. 9:16 vertical. Mystical, cinematic. No text.",
        "kling": "The golden illumination slowly travels along the entire length of the heart line from one end to the other, warm glow pulses."
    },
    {
        "id": "07_heartline",
        "prompt": "Extreme macro close-up of a palm focusing on the heart line — the curved line running below the fingers. Shot from the side at a shallow angle, the heart line runs horizontally across the frame. Warm golden side-lighting highlights every detail of the line and skin texture. Deep shadow on one side. 9:16 portrait crop. Cinematic. No text.",
        "kling": "Camera slowly glides along the heart line from left to right, golden light follows the camera, revealing the line's full length."
    },
    {
        "id": "08_marriagelines",
        "prompt": "Extreme close-up of the outer edge of a palm below the pinky finger, showing the small horizontal marriage lines. The lines are lit with a precise warm golden spotlight from above, creating strong contrast against deep shadow. Skin texture is incredibly detailed. 9:16 vertical composition. Mystical and intimate. No text.",
        "kling": "Camera gently zooms into the marriage lines, golden spotlight intensifies, the lines become more prominent and defined."
    },
    {
        "id": "09_timing_window",
        "prompt": "A beautiful antique hourglass with golden sand flowing in the center of a dark dramatic scene. Warm amber light illuminates the hourglass from behind, creating a glowing silhouette effect. The falling sand sparkles like tiny stars. Deep black background. 9:16 vertical, centered composition. Cinematic, timeless, mystical. No text.",
        "kling": "Golden sand falls in slow motion, each grain sparkles in the backlight, hourglass glows warmly, time feels suspended."
    },
    {
        "id": "10_proof_story",
        "prompt": "Two hands resting gently on a dark polished wooden table. Between them, a single white candle burns with a warm, steady flame. The candlelight is the only light source, casting intimate golden shadows. Shot from slightly above at a 45-degree angle. Deep shadows around the edges. 9:16 vertical. Emotional and cinematic. No text.",
        "kling": "Candle flame flickers gently, warm light dances on the hands and table, slow intimate push in toward the candle."
    },
    {
        "id": "11_proof_result",
        "prompt": "A beautiful woman in her late 30s holds a smartphone and reads something meaningful. Her face shows a calm, knowing smile — the expression of recognition and relief. Warm golden hour light from a window illuminates her face softly. Shallow depth of field, blurred background. 9:16 portrait. Authentic, emotional. No text.",
        "kling": "Her expression shifts from neutral to a gentle meaningful smile as she reads, warm light glows softly, intimate camera drift."
    },
    {
        "id": "12_product",
        "prompt": "A sleek smartphone held in a woman's hand in a dark room. The screen glows with a mystical, elegant interface showing palm reading analysis — golden lines on a deep dark background with subtle purple gradients. The phone is the only light source, casting a soft glow on the hand. 9:16 vertical. Premium, mysterious. No text.",
        "kling": "The screen glows and mystical UI elements fade in one by one, golden light pulses gently from the screen, elegant reveal."
    },
    {
        "id": "13_cta",
        "prompt": "A female hand with palm fully open, extending upward toward the viewer against a pure black background. Dramatic divine golden light pours down from directly above, illuminating every palm line in extraordinary detail. The hand is perfectly centered in the 9:16 frame. Cinematic, spiritual, powerful. The most beautiful palm shot possible. No text.",
        "kling": "Divine golden light intensifies and floods the palm from above, the hand slowly opens wider toward the camera, breathtaking reveal."
    },
    {
        "id": "14_close",
        "prompt": "A silhouette of a female hand against a deep gradient background transitioning from warm amber-gold at the bottom to deep navy blue-black at the top. The hand is slightly transparent, ethereal. The background has subtle star-like golden particles. 9:16 vertical. Cinematic closing shot, peaceful and final. No text.",
        "kling": "The hand silhouette slowly fades and dissolves into the darkness, golden particles drift upward and disappear, cinematic fade to black."
    },
]

def generate_image(scene):
    print(f"  Gerando {scene['id']}...", end=" ", flush=True)
    try:
        resp = client.images.generate(
            model="dall-e-3",
            prompt=scene["prompt"],
            size="1024x1792",
            quality="hd",
            n=1,
        )
        url = resp.data[0].url
        img_data = requests.get(url).content

        # Salvar PNG original
        png_path = OUT_DIR / f"{scene['id']}.png"
        with open(png_path, "wb") as f:
            f.write(img_data)

        # Salvar JPEG redimensionado para Kling (720x1280, <200KB)
        img = Image.open(io.BytesIO(img_data)).convert("RGB")
        img = img.resize((720, 1280), Image.LANCZOS)
        jpg_path = SMALL_DIR / f"{scene['id']}.jpg"
        quality = 88
        while True:
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=quality)
            if buf.tell() < 200_000 or quality < 60:
                break
            quality -= 5
        with open(jpg_path, "wb") as f:
            f.write(buf.getvalue())

        sz_kb = jpg_path.stat().st_size // 1024
        print(f"OK ({sz_kb}KB)")
        return True

    except Exception as e:
        msg = str(e)[:100]
        print(f"ERR: {msg}")
        return False

def main():
    print("=" * 55)
    print("  Gerando 15 Imagens HD para VSL Madam Aurora")
    print("=" * 55)
    print(f"  Output PNG: {OUT_DIR}")
    print(f"  Output JPG: {SMALL_DIR}")
    print()

    success = 0
    for i, scene in enumerate(SCENES, 1):
        print(f"[{i:02d}/15] ", end="")
        ok = generate_image(scene)
        if ok:
            success += 1
        time.sleep(1)

    print(f"\n{'='*55}")
    print(f"  Imagens geradas: {success}/15")
    print(f"\n  PROXIMOS PASSOS — Kling Web:")
    print(f"  1. Acesse kling.ai → Generate → Image to Video")
    print(f"  2. Use as imagens em: {SMALL_DIR}")
    print(f"  3. Selecione modelo: kling-v1-5, modo Pro, 5s")
    print(f"  4. Cole o prompt de movimento abaixo:")
    print(f"\n  PROMPTS DE MOVIMENTO:")
    for s in SCENES:
        print(f"\n  [{s['id']}]")
        print(f"  {s['kling']}")
    print(f"\n{'='*55}")

if __name__ == "__main__":
    main()
