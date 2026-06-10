"""
Aurora Content Generator — adiciona texto em estilo Madam Aurora em imagens base
Uso: python aurora_overlay.py

Requisitos: pip install Pillow requests
Fontes: baixar Playfair_Display e Inter do Google Fonts e colocar em ./fonts/
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import json
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuração de hooks — edite aqui para gerar novas variações
# ---------------------------------------------------------------------------
HOOKS = [
    {
        "top": "stop waiting\nfor him to\nchoose you",
        "bottom": "your palm explains why you keep waiting",
        "filename": "hook_stop_waiting",
    },
    {
        "top": "I can see\nyour pattern",
        "bottom": "can you?",
        "filename": "hook_i_can_see",
    },
    {
        "top": "the reason you\nkeep attracting\nthe wrong person",
        "bottom": "has nothing to do with luck.",
        "filename": "hook_wrong_person",
    },
    {
        "top": "which feminine\nenergy are you\nblocking?",
        "bottom": "your palm already knows.",
        "filename": "hook_feminine_energy",
    },
    {
        "top": "your heart line\nreveals everything\nabout you in love",
        "bottom": "and most people never find out.",
        "filename": "hook_heart_line",
    },
    {
        "top": "she kept choosing\nmen who weren't\nready for her",
        "bottom": "her palm showed exactly why.",
        "filename": "hook_she_kept_choosing",
    },
    {
        "top": "this line on\nyour palm means\nyou love deeply",
        "bottom": "and protect yourself even deeper.",
        "filename": "hook_love_deeply",
    },
    {
        "top": "why do you\nalways feel like\nyou're too much?",
        "bottom": "your pattern has a name.",
        "filename": "hook_too_much",
    },
    {
        "top": "before you text\nhim back —\nread this first",
        "bottom": "your palm knows what your heart hides.",
        "filename": "hook_before_text",
    },
    {
        "top": "3 signs your\nlove pattern is\nkeeping you stuck",
        "bottom": "number 2 will hit different.",
        "filename": "hook_3_signs",
    },
    {
        "top": "you don't have\nbad luck in love",
        "bottom": "you have an unread pattern.",
        "filename": "hook_bad_luck",
    },
    {
        "top": "the woman who\nstops explaining\nherself starts receiving",
        "bottom": "your palm shows where you are right now.",
        "filename": "hook_stops_explaining",
    },
]

# ---------------------------------------------------------------------------
# Configuração visual
# ---------------------------------------------------------------------------
GOLD = (255, 196, 60)        # #FFC43C
WHITE = (255, 255, 255)
BLACK_OVERLAY = (4, 2, 14)   # #04020E
ORNAMENT = "— ✦ —"

FONT_DIR = Path("./fonts")
OUTPUT_DIR = Path("./output_overlays")
OUTPUT_DIR.mkdir(exist_ok=True)


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    """Tenta carregar fonte custom, cai para default se não encontrar."""
    paths = [
        FONT_DIR / f"{name}.ttf",
        FONT_DIR / f"{name}-Regular.ttf",
        FONT_DIR / f"{name}-Bold.ttf",
    ]
    for p in paths:
        if p.exists():
            return ImageFont.truetype(str(p), size)
    # Fallback: fonte do sistema
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", size)
    except Exception:
        return ImageFont.load_default()


def draw_text_with_shadow(
    draw: ImageDraw.ImageDraw,
    xy: tuple,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple,
    shadow_offset: int = 3,
    anchor: str = "mm",
):
    x, y = xy
    # Sombra
    draw.text((x + shadow_offset, y + shadow_offset), text, font=font,
              fill=(0, 0, 0, 160), anchor=anchor)
    # Texto principal
    draw.text((x, y), text, font=font, fill=fill, anchor=anchor)


def add_overlay(image_path: str, hook: dict, output_suffix: str = "") -> str:
    """Adiciona overlay de texto em uma imagem base e salva."""
    img = Image.open(image_path).convert("RGBA")
    W, H = img.size

    # Overlay escuro no topo (para legibilidade do texto)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)

    # Gradiente topo
    for i in range(int(H * 0.42)):
        alpha = int(200 * (1 - i / (H * 0.42)))
        draw_overlay.line([(0, i), (W, i)], fill=(4, 2, 14, alpha))

    # Gradiente rodapé
    footer_start = int(H * 0.72)
    for i in range(H - footer_start):
        alpha = int(190 * (i / (H - footer_start)))
        draw_overlay.line([(0, footer_start + i), (W, footer_start + i)],
                          fill=(4, 2, 14, alpha))

    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Fontes
    font_top = load_font("PlayfairDisplay-Bold", max(48, W // 10))
    font_bottom = load_font("PlayfairDisplay-Regular", max(28, W // 20))
    font_ornament = load_font("PlayfairDisplay-Regular", max(24, W // 26))

    # --- Texto TOPO ---
    top_text = hook["top"]
    top_lines = top_text.split("\n")

    line_h = font_top.size + 8
    top_block_h = len(top_lines) * line_h
    top_start_y = int(H * 0.10)

    for i, line in enumerate(top_lines):
        y = top_start_y + i * line_h
        draw_text_with_shadow(draw, (W // 2, y), line, font_top, GOLD, anchor="mt")

    # Ornamento divisor (abaixo do texto top)
    ornament_y = top_start_y + top_block_h + 20
    draw_text_with_shadow(draw, (W // 2, ornament_y), ORNAMENT, font_ornament, GOLD, anchor="mt")

    # Linha dourada horizontal
    line_y = ornament_y + font_ornament.size + 10
    draw.line([(W * 0.15, line_y), (W * 0.85, line_y)], fill=GOLD, width=1)

    # --- Texto RODAPÉ ---
    bottom_text = hook["bottom"]
    bottom_y = int(H * 0.82)

    # Linha dourada acima do rodapé
    draw.line([(W * 0.15, bottom_y - 20), (W * 0.85, bottom_y - 20)], fill=GOLD, width=1)
    draw_text_with_shadow(draw, (W // 2, bottom_y - 5), ORNAMENT, font_ornament, GOLD, anchor="mt")

    draw_text_with_shadow(draw, (W // 2, bottom_y + font_ornament.size + 20),
                          bottom_text, font_bottom, WHITE, anchor="mt")

    # Ornamento final
    draw.line([(W * 0.3, H * 0.93), (W * 0.7, H * 0.93)], fill=(*GOLD, 120), width=1)

    # Salvar
    fname = hook["filename"]
    if output_suffix:
        fname += f"_{output_suffix}"
    out_path = OUTPUT_DIR / f"{fname}.png"
    img = img.convert("RGB")
    img.save(str(out_path), "PNG", quality=95)
    print(f"  ✓ Salvo: {out_path}")
    return str(out_path)


def batch_generate(base_image: str):
    """Gera todas as variações de hook para uma imagem base."""
    print(f"\n🔮 Gerando {len(HOOKS)} variações para: {base_image}")
    print("-" * 50)

    results = []
    for hook in HOOKS:
        try:
            out = add_overlay(base_image, hook)
            results.append(out)
        except Exception as e:
            print(f"  ✗ Erro em {hook['filename']}: {e}")

    print(f"\n✅ {len(results)} imagens geradas em: {OUTPUT_DIR}/")
    return results


def generate_single(base_image: str, hook_filename: str):
    """Gera uma variação específica pelo filename."""
    hook = next((h for h in HOOKS if h["filename"] == hook_filename), None)
    if not hook:
        print(f"Hook '{hook_filename}' não encontrado.")
        return
    add_overlay(base_image, hook)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys

    print("=" * 50)
    print("🔮 Aurora Content Generator")
    print("=" * 50)

    # Verifica se tem imagens base na pasta
    base_images = list(Path(".").glob("*.jpg")) + list(Path(".").glob("*.png"))
    base_images = [str(p) for p in base_images if "output" not in str(p)]

    if not base_images:
        print("\n⚠️  Nenhuma imagem base encontrada na pasta atual.")
        print("Coloque as imagens .jpg/.png na mesma pasta e rode novamente.")
        print("\nExemplo de uso direto:")
        print('  python aurora_overlay.py imagem_base.jpg')
        sys.exit(0)

    if len(sys.argv) > 1:
        # Imagem específica passada como argumento
        batch_generate(sys.argv[1])
    else:
        # Processa todas as imagens encontradas
        print(f"\nImagens encontradas: {len(base_images)}")
        for img_path in base_images:
            print(f"  • {img_path}")

        print("\nRodando em todas...")
        for img_path in base_images:
            batch_generate(img_path)

    print("\n🎯 Próximos passos:")
    print("  1. Abra a pasta output_overlays/")
    print("  2. Escolha as melhores variações")
    print("  3. Poste com os hooks do HOOKS_50.md como legenda")
    print("  4. Monitore saves e comments (>5% save = escalar como ad)")
