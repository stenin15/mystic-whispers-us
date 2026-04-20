"""
Reaplica overlay de copy nas imagens já geradas, com auto-sizing de fonte.
Não re-gera o DALL-E — usa as imagens base que já existem.
"""
import os, io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SRC = Path("C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/scenes/ad_images_v2")
W, H = 1080, 1350

CREATIVES = [
    ("ad01_mechanism.png",
     "There's a line on your palm\nthat reveals how you love",
     "Most people have never looked at it",
     "MADAM AURORA  •  Free Palm Reading"),
    ("ad02_pattern.png",
     "Why does love always\nfeel like this?",
     "The answer might be written in your hand",
     "MADAM AURORA  •  Free Palm Reading"),
    ("ad03_timing.png",
     "Your love timing window\nmay be open right now",
     "Most women miss it without knowing",
     "MADAM AURORA  •  Free Reading"),
    ("ad04_social_proof.png",
     '"She was 38 and thought\nher time had passed"',
     "6 weeks after her reading, she met him.",
     "MADAM AURORA  •  Real Story"),
    ("ad05_spiritual.png",
     "Your palm lines don't lie.\nThey've been trying to tell you.",
     "Discover what yours reveal about love",
     "MADAM AURORA  •  Free Palm Reading"),
    ("ad06_timing_window.png",
     "Are you in a love\ntiming window?",
     "Take 3 minutes to find out — it's free",
     "MADAM AURORA  •  Start Free"),
    ("ad07_curiosity.png",
     "I finally understood why\nlove always ended the same way",
     "It was written in my palm the whole time",
     "MADAM AURORA  •  Free Reading"),
    ("ad08_skeptic.png",
     '"I didn\'t believe in\npalm reading either"',
     "Then I saw what my heart line actually meant",
     "MADAM AURORA  •  See For Yourself"),
    ("ad09_retargeting.png",
     "You visited. You didn't finish.\nYour reading is still waiting.",
     "It only takes 3 minutes",
     "MADAM AURORA  •  Come Back"),
    ("ad10_awareness.png",
     "What does your palm say\nabout love?",
     "Upload a photo. Answer 7 questions. Get your reading.",
     "MADAM AURORA  •  Free  •  Private  •  Instant"),
]

def load_font(bold, size):
    paths_bold = ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/verdanab.ttf"]
    paths_reg  = ["C:/Windows/Fonts/arial.ttf",   "C:/Windows/Fonts/verdana.ttf"]
    paths = paths_bold if bold else paths_reg
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def fit_font_size(draw, text, max_width, bold=True, start=72, min_size=28):
    """Reduz o tamanho da fonte até o texto caber na largura."""
    size = start
    while size >= min_size:
        font = load_font(bold, size)
        lines = text.split("\n")
        fits = all(
            (draw.textbbox((0,0), line, font=font)[2] - draw.textbbox((0,0), line, font=font)[0]) <= max_width
            for line in lines
        )
        if fits:
            return font, size
        size -= 4
    return load_font(bold, min_size), min_size

def apply_overlay(img_path, headline, sub, brand):
    # Carregar imagem base — cortar fora da zona de texto anterior (y=220+)
    full = Image.open(img_path).convert("RGB")
    if full.size == (W, H):
        # Pega da metade pra baixo para evitar ghost de texto anterior no topo
        base = full.crop((0, 250, W, H - 200))
    else:
        base = full

    # Redimensionar para cobrir todo o canvas 1080x1350
    base = base.resize((W, H), Image.LANCZOS)
    canvas = base.copy().convert("RGBA")

    # Gradiente superior escuro (para texto ficar legível)
    overlay_top = Image.new("RGBA", (W, 420), (8, 6, 12, 0))
    od = ImageDraw.Draw(overlay_top)
    for i in range(420):
        a = int(210 * (1 - i/420)**0.6)
        od.line([(0, i), (W, i)], fill=(8, 6, 12, a))
    canvas.alpha_composite(overlay_top, (0, 0))

    # Gradiente inferior escuro (para sub + brand)
    overlay_bot = Image.new("RGBA", (W, 280), (8, 6, 12, 0))
    od2 = ImageDraw.Draw(overlay_bot)
    for i in range(280):
        a = int(220 * (1 - i/280)**0.5)
        od2.line([(0, 279-i), (W, 279-i)], fill=(8, 6, 12, a))
    canvas.alpha_composite(overlay_bot, (0, H-280))

    canvas = canvas.convert("RGB")
    draw = ImageDraw.Draw(canvas)

    MAX_TW = W - 60  # margem 30px cada lado

    GOLD = (212, 175, 55)

    # Headline no TOPO da imagem (sobre gradiente escuro)
    font_hl, hl_size = fit_font_size(draw, headline, MAX_TW, bold=True, start=72)
    lines = headline.split("\n")
    line_h = hl_size + 14
    total_h = len(lines) * line_h
    y0 = 30  # 30px do topo

    for i, line in enumerate(lines):
        bbox = draw.textbbox((0,0), line, font=font_hl)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        y = y0 + i * line_h
        # sombra
        draw.text((x+3, y+3), line, font=font_hl, fill=(0,0,0))
        draw.text((x, y), line, font=font_hl, fill=(255,255,255))

    # Sub no RODAPÉ da imagem (sobre gradiente escuro inferior)
    font_sub = load_font(False, 36)
    bbox = draw.textbbox((0,0), sub, font=font_sub)
    tw = bbox[2] - bbox[0]
    if tw > MAX_TW:
        font_sub = load_font(False, 30)
        bbox = draw.textbbox((0,0), sub, font=font_sub)
        tw = bbox[2] - bbox[0]
    sub_y = H - 200
    x = (W - tw) // 2
    draw.text((x+2, sub_y+2), sub, font=font_sub, fill=(0,0,0))
    draw.text((x, sub_y), sub, font=font_sub, fill=(220,220,220))

    # Separador dourado
    sep_y = H - 138
    draw.line([(W//2-80, sep_y), (W//2+80, sep_y)], fill=GOLD, width=2)

    # Brand
    font_brand = load_font(True, 28)
    bbox = draw.textbbox((0,0), brand, font=font_brand)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x+2, sep_y+14+2), brand, font=font_brand, fill=(0,0,0))
    draw.text((x, sep_y+14), brand, font=font_brand, fill=GOLD)

    # Borda dourada fina
    for t in range(3):
        draw.rectangle([t, t, W-1-t, H-1-t], outline=(212,175,55))

    return canvas

def main():
    print("Reaplicando overlays com auto-sizing...\n")
    for fname, headline, sub, brand in CREATIVES:
        path = SRC / fname
        if not path.exists():
            print(f"  [SKIP] {fname} nao encontrado")
            continue
        print(f"  {fname} ...", end=" ", flush=True)
        try:
            img = apply_overlay(path, headline, sub, brand)
            img.save(path, "PNG")
            print("OK")
        except Exception as e:
            print(f"ERR: {e}")
    print("\nConcluido. Abra a pasta para conferir.")

if __name__ == "__main__":
    main()
