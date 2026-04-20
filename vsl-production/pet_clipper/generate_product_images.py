# -*- coding: utf-8 -*-
"""
Cortador de Unhas LED — Assets Premium em Portugues
Gera fotos de produto (Seedream 4.5) + cards infograficos (Pillow)
Design: dark premium, acento laranja, tipografia moderna
"""
import replicate, requests, os, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io, textwrap

os.environ["REPLICATE_API_TOKEN"] = "r8_e91AziASL3aYSIB7GvolHWLmWRZcKnj05zwGi"

OUT = Path("C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/pet_clipper/product_images")
OUT.mkdir(parents=True, exist_ok=True)

# ── Design System ─────────────────────────────────────────────────────────────
BG       = (10, 10, 10)
BG_CARD  = (22, 22, 22)
BG_CARD2 = (28, 28, 28)
ORANGE   = (224, 120, 32)
ORANGE_L = (244, 160, 48)
WHITE    = (255, 255, 255)
GRAY     = (170, 170, 170)
GRAY_DIM = (90, 90, 90)
BORDER   = (42, 42, 42)
GREEN    = (80, 200, 120)

def font(size, bold=False):
    names = (
        ["segoeuib.ttf", "arialbd.ttf", "calibrib.ttf"] if bold
        else ["segoeui.ttf", "arial.ttf", "calibri.ttf"]
    )
    for n in names:
        p = f"C:/Windows/Fonts/{n}"
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def txt(draw, text, xy, fnt, color=WHITE, anchor="mm", max_w=None):
    if max_w:
        avg_char = fnt.size * 0.55
        chars = max(1, int(max_w / avg_char))
        lines = textwrap.wrap(text, width=chars)
        x, y = xy
        lh = fnt.size + 8
        for i, line in enumerate(lines):
            draw.text((x, y + i * lh), line, font=fnt, fill=color, anchor=anchor)
        return len(lines) * lh
    draw.text(xy, text, font=fnt, fill=color, anchor=anchor)
    return fnt.size + 8

def rrect(draw, box, r=16, fill=BG_CARD, outline=BORDER, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)

def accent_bar(img, top=True, h=6):
    draw = ImageDraw.Draw(img)
    W = img.width
    H = img.height
    if top:
        draw.rectangle([(0, 0), (W, h)], fill=ORANGE)
    else:
        draw.rectangle([(0, H - h), (W, H)], fill=ORANGE)

def download_img(url):
    r = requests.get(url, timeout=120)
    return Image.open(io.BytesIO(r.content)).convert("RGB")

# ── Replicate: Gera foto ───────────────────────────────────────────────────────
def gen_image(name, prompt, aspect="1:1"):
    print(f"\n  [AI] {name}...")
    output = replicate.run(
        "bytedance/seedream-4.5",
        input={"prompt": prompt, "aspect_ratio": aspect}
    )
    url = output[0] if isinstance(output, list) else str(output)
    img = download_img(url)
    p = OUT / f"{name}.png"
    img.save(p)
    print(f"       Salvo: {p.name} ({p.stat().st_size//1024}KB)")
    return p

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 1 — Hero produto (AI)
# ══════════════════════════════════════════════════════════════════════════════
def card_hero():
    gen_image("01_hero_produto",
        "Professional studio product photography, white background, dramatic side lighting. "
        "A modern pet nail clipper: gray ergonomic upper body, vibrant orange lower handle with grip, "
        "large transparent clear dome magnifying LED cover at the blade tip, "
        "stainless steel precision blade inside the dome, small orange LED switch on the side. "
        "45-degree angle view. Ultra sharp. Commercial product photography. Apple aesthetic. "
        "Soft shadow on pure white background. No text no props.",
        aspect="1:1"
    )

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 2 — LED Macro em uso (AI)
# ══════════════════════════════════════════════════════════════════════════════
def card_led_macro():
    gen_image("02_led_macro",
        "Ultra macro photography, dark background. "
        "A transparent LED dome of a pet nail clipper positioned over a small fluffy white dog paw, "
        "the bright LED shines through the translucent nail revealing the pink blood vessel (quick) glowing inside. "
        "Beautiful blue-white LED halo around the nail. Extreme close-up. "
        "Cinematic depth of field. Commercial photography quality. No text.",
        aspect="1:1"
    )

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 3 — Uso em gato relaxado (AI)
# ══════════════════════════════════════════════════════════════════════════════
def card_uso_gato():
    gen_image("03_uso_gato",
        "Professional lifestyle photography. Warm home lighting. "
        "A woman's hands gently hold a relaxed white cat's paw while using a gray and orange pet nail clipper with LED dome. "
        "The cat is calm, lying on a soft blue surface. Shot from above. "
        "Shallow depth of field. The clipper LED glows softly. Cozy premium home aesthetic. No text.",
        aspect="4:5"
    )

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 4 — Vários pets (AI)
# ══════════════════════════════════════════════════════════════════════════════
def card_pets():
    gen_image("07_varios_pets",
        "Premium product advertisement photo, clean light gray background. "
        "Center: a gray and orange pet nail clipper with transparent LED dome, product hero shot. "
        "Surrounding it in soft circular arrangement: golden retriever puppy, white fluffy cat, "
        "gray rabbit, small hamster, colorful parrot. Each animal looking happy and adorable. "
        "Clean studio lighting. Professional commercial photography. No text.",
        aspect="1:1"
    )

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 5 — Modos LED (Pillow)
# ══════════════════════════════════════════════════════════════════════════════
def card_modos_led():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    accent_bar(img, top=True)

    # Título
    draw.text((W//2, 70), "TESOURA DE UNHA COM LED", font=font(44, True), fill=WHITE, anchor="mm")
    draw.text((W//2, 125), "3 modos de iluminação ajustável", font=font(26), fill=GRAY, anchor="mm")
    draw.line([(80, 155), (W-80, 155)], fill=BORDER, width=1)

    modes = [
        {"n": "01", "titulo": "Posição Esquerda",  "sub": "LED SEMPRE ACESO",     "desc": "Iluminação contínua\npara máxima visibilidade", "cor": ORANGE},
        {"n": "02", "titulo": "Posição Central",   "sub": "LED APAGADO",          "desc": "Modo de repouso\nsem consumo de bateria",       "cor": GRAY_DIM},
        {"n": "03", "titulo": "Posição Direita",   "sub": "LED APÓS O CORTE",     "desc": "Acende ao pressionar\na lâmina automaticamente", "cor": ORANGE_L},
    ]

    cw, ch = 300, 380
    gap = 30
    sx = (W - 3*cw - 2*gap) // 2
    sy = 175

    for i, m in enumerate(modes):
        x, y = sx + i*(cw+gap), sy
        rrect(draw, [(x, y), (x+cw, y+ch)], r=20, fill=BG_CARD, outline=m["cor"], width=2)
        # Número grande
        draw.text((x+cw//2, y+80), m["n"], font=font(80, True), fill=m["cor"], anchor="mm")
        draw.line([(x+24, y+130), (x+cw-24, y+130)], fill=BORDER, width=1)
        draw.text((x+cw//2, y+160), m["titulo"], font=font(20), fill=GRAY, anchor="mm")
        draw.text((x+cw//2, y+200), m["sub"], font=font(22, True), fill=WHITE, anchor="mm")
        draw.line([(x+24, y+230), (x+cw-24, y+230)], fill=BORDER, width=1)
        for j, ln in enumerate(m["desc"].split("\n")):
            draw.text((x+cw//2, y+265+j*34), ln, font=font(20), fill=GRAY, anchor="mm")

    # Nota inferior
    nota_y = sy + ch + 40
    rrect(draw, [(80, nota_y), (W-80, nota_y+110)], r=14, fill=BG_CARD2, outline=BORDER)
    draw.text((W//2, nota_y+30), "POSTURA CORRETA DE CORTE", font=font(22, True), fill=ORANGE, anchor="mm")
    draw.text((W//2, nota_y+65), "Posicione a lâmina e corte com confiança — não hesite!", font=font(20), fill=GRAY, anchor="mm")
    draw.text((W//2, nota_y+92), "Para unhas muito escuras, o LED pode não penetrar completamente.", font=font(16), fill=GRAY_DIM, anchor="mm")

    accent_bar(img, top=False)
    img.save(OUT / "04_modos_led.png")
    print("  [Pillow] 04_modos_led.png")

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 6 — Por que escolher (Pillow)
# ══════════════════════════════════════════════════════════════════════════════
def card_por_que():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    accent_bar(img, top=True)

    draw.text((W//2, 70), "POR QUE ESCOLHER", font=font(40, True), fill=WHITE, anchor="mm")
    draw.text((W//2, 118), "NOSSO CORTADOR DE UNHAS ILUMINADO?", font=font(28, True), fill=ORANGE, anchor="mm")
    draw.line([(80, 152), (W-80, 152)], fill=BORDER, width=1)

    items = [
        {"icon": "✦", "titulo": "Design Ergonômico",        "desc": "Cabo confortável e grip antideslizante.\nPerfecto para uso prolongado."},
        {"icon": "◎", "titulo": "Lente de Ampliação 5x",    "desc": "Veja as unhas com clareza total.\nElimine a insegurança do corte."},
        {"icon": "◉", "titulo": "LED Evita Lesões",          "desc": "Ilumina a veia interna da unha.\nNunca mais corte o local errado."},
        {"icon": "◈", "titulo": "Lâmina de Longa Duração",  "desc": "Aço inoxidável de alta precisão.\nSubstituível e afiada por mais tempo."},
    ]

    cw, ch = 460, 310
    gap = 20
    positions = [(60, 168), (560, 168), (60, 498), (560, 498)]

    for (x, y), item in zip(positions, items):
        rrect(draw, [(x, y), (x+cw, y+ch)], r=18, fill=BG_CARD, outline=BORDER)
        # Ícone
        draw.text((x+50, y+ch//2-10), item["icon"], font=font(56, True), fill=ORANGE, anchor="mm")
        draw.line([(x+90, y+40), (x+90, y+ch-40)], fill=BORDER, width=1)
        # Título
        draw.text((x+110, y+70), item["titulo"], font=font(26, True), fill=WHITE, anchor="lm")
        draw.line([(x+110, y+105), (x+cw-30, y+105)], fill=BORDER, width=1)
        for j, ln in enumerate(item["desc"].split("\n")):
            draw.text((x+110, y+130+j*36), ln, font=font(21), fill=GRAY, anchor="lm")

    # Badge inferior
    by = 830
    rrect(draw, [(80, by), (W-80, by+100)], r=14, fill=ORANGE, outline=ORANGE)
    draw.text((W//2, by+30), "COMPATÍVEL COM CÃES, GATOS, COELHOS,", font=font(22, True), fill=(10,10,10), anchor="mm")
    draw.text((W//2, by+68), "HAMSTERS, PÁSSAROS E MAIS", font=font(22, True), fill=(10,10,10), anchor="mm")

    accent_bar(img, top=False)
    img.save(OUT / "05_por_que_escolher.png")
    print("  [Pillow] 05_por_que_escolher.png")

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 7 — Capa Duplo Uso (Pillow)
# ══════════════════════════════════════════════════════════════════════════════
def card_duplo_uso():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    accent_bar(img, top=True)

    draw.text((W//2, 60), "UMA CAPA,", font=font(52, True), fill=WHITE, anchor="mm")
    draw.text((W//2, 120), "DUPLA UTILIDADE", font=font(52, True), fill=ORANGE, anchor="mm")
    draw.line([(80, 155), (W-80, 155)], fill=BORDER, width=1)

    # Card esquerdo — Anti-respingo
    rrect(draw, [(50, 170), (510, 680)], r=20, fill=BG_CARD, outline=BORDER)
    draw.text((280, 230), "01", font=font(80, True), fill=ORANGE, anchor="mm")
    draw.line([(90, 280), (470, 280)], fill=BORDER, width=1)
    draw.text((280, 330), "CAPA ANTI-RESPINGO", font=font(26, True), fill=WHITE, anchor="mm")
    for j, ln in enumerate(["Captura os fragmentos de", "unha durante o corte.", "Mantenha o ambiente limpo."]):
        draw.text((280, 390+j*40), ln, font=font(22), fill=GRAY, anchor="mm")
    # Ícone visual
    draw.ellipse([(200, 545), (360, 655)], outline=ORANGE, width=3)
    draw.text((280, 600), "✂", font=font(48), fill=ORANGE, anchor="mm")

    # Card direito — Ampliação
    rrect(draw, [(570, 170), (1030, 680)], r=20, fill=BG_CARD, outline=BORDER)
    draw.text((800, 230), "02", font=font(80, True), fill=ORANGE_L, anchor="mm")
    draw.line([(610, 280), (990, 280)], fill=BORDER, width=1)
    draw.text((800, 330), "AMPLIAÇÃO DE 5X", font=font(26, True), fill=WHITE, anchor="mm")
    for j, ln in enumerate(["Lente integrada amplia 5 vezes", "a visão da unha do pet.", "Corte com precisão cirúrgica."]):
        draw.text((800, 390+j*40), ln, font=font(22), fill=GRAY, anchor="mm")
    # Ícone visual
    draw.ellipse([(720, 545), (880, 655)], outline=ORANGE_L, width=3)
    draw.text((800, 600), "◎", font=font(48, True), fill=ORANGE_L, anchor="mm")

    # Detalhe inferior
    rrect(draw, [(50, 710), (1030, 840)], r=18, fill=BG_CARD2, outline=BORDER)
    draw.text((W//2, 760), "DESIGN INTELIGENTE PARA O DIA A DIA", font=font(28, True), fill=WHITE, anchor="mm")
    draw.text((W//2, 806), "Funcionalidade premium sem complicação — feito para quem ama seu pet.", font=font(20), fill=GRAY, anchor="mm")

    # Especificação
    specs = ["LED ajustável", "Lâmina substituível", "Bateria incluída", "Multi-espécies"]
    sw = (W - 100) // len(specs)
    for i, s in enumerate(specs):
        sx = 50 + i * sw + sw//2
        draw.text((sx, 900), "●", font=font(14), fill=ORANGE, anchor="mm")
        draw.text((sx, 930), s, font=font(20, True), fill=WHITE, anchor="mm")

    accent_bar(img, top=False)
    img.save(OUT / "06_duplo_uso.png")
    print("  [Pillow] 06_duplo_uso.png")

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 8 — Estrutura do Produto (Pillow)
# ══════════════════════════════════════════════════════════════════════════════
def card_estrutura():
    W, H = 1080, 1350
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    accent_bar(img, top=True)

    draw.text((W//2, 65), "ESTRUTURA DO PRODUTO", font=font(46, True), fill=WHITE, anchor="mm")
    draw.text((W//2, 115), "Conheça cada componente", font=font(26), fill=GRAY, anchor="mm")
    draw.line([(80, 145), (W-80, 145)], fill=BORDER, width=1)

    components = [
        ("Cabo Superior",              "Material resistente e leve para total controle do movimento"),
        ("Lente de Ampliação 5x",      "Visão ampliada para localizar a veia com precisão"),
        ("Compartimento da Bateria",   "Fácil acesso para substituição rápida"),
        ("Alavanca de Troca da Lâmina","Troque a lâmina sem ferramentas em segundos"),
        ("Luz LED",                    "Iluminação potente que penetra na unha do pet"),
        ("Liga/Desliga LED",           "3 posições: sempre aceso, apagado e pós-corte"),
        ("Lâmina de Corte",            "Aço inoxidável de precisão — substituível"),
        ("Cabo Inferior",              "Ergonomia laranja com grip antideslizante"),
    ]

    row_h = 100
    pad = 60
    for i, (name, desc) in enumerate(components):
        y = 165 + i * row_h
        bg = BG_CARD if i % 2 == 0 else BG_CARD2
        draw.rectangle([(pad, y), (W-pad, y+row_h-8)], fill=bg)
        # Número
        draw.text((pad+36, y+row_h//2-8), f"{i+1:02d}", font=font(20, True), fill=ORANGE, anchor="mm")
        # Separador vertical
        draw.line([(pad+66, y+14), (pad+66, y+row_h-22)], fill=BORDER, width=1)
        # Nome
        draw.text((pad+90, y+24), name, font=font(24, True), fill=WHITE, anchor="lm")
        # Descrição
        draw.text((pad+90, y+58), desc, font=font(19), fill=GRAY, anchor="lm")

    # Nota final
    ny = 165 + len(components) * row_h + 20
    rrect(draw, [(pad, ny), (W-pad, ny+110)], r=16, fill=BG_CARD, outline=ORANGE, width=2)
    draw.text((W//2, ny+36), "LÂMINA SUBSTITUÍVEL INCLUSA", font=font(26, True), fill=ORANGE, anchor="mm")
    draw.text((W//2, ny+80), "Reponha a lâmina quando necessário — sem descartar o produto.", font=font(20), fill=GRAY, anchor="mm")

    accent_bar(img, top=False)
    img.save(OUT / "08_estrutura.png")
    print("  [Pillow] 08_estrutura.png")

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 9 — Instruções de uso (Pillow)
# ══════════════════════════════════════════════════════════════════════════════
def card_instrucoes():
    W, H = 1080, 1350
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    accent_bar(img, top=True)

    draw.text((W//2, 65), "COMO USAR", font=font(52, True), fill=WHITE, anchor="mm")
    draw.text((W//2, 120), "Iluminação ajustável para cada situação", font=font(26), fill=GRAY, anchor="mm")
    draw.line([(80, 152), (W-80, 152)], fill=BORDER, width=1)

    steps = [
        {"n": "1", "titulo": "PRESSIONE O BOTÃO",       "desc": "Ative o LED antes de começar.\nEscolha o modo ideal para o ambiente."},
        {"n": "2", "titulo": "POSICIONE A LÂMINA",       "desc": "Encaixe a unha dentro da capa transparente.\nO LED iluminará a veia automaticamente."},
        {"n": "3", "titulo": "IDENTIFIQUE A ZONA SEGURA","desc": "Veja a veia iluminada em vermelho.\nCorte apenas abaixo dela — jamais acima."},
        {"n": "4", "titulo": "CORTE COM CONFIANÇA",      "desc": "Não hesite — faça o corte em um movimento.\nUma pressão firme garante um corte limpo."},
    ]

    for i, s in enumerate(steps):
        y = 170 + i * 260
        # Linha conectora
        if i < len(steps) - 1:
            draw.line([(W//2, y+220), (W//2, y+260)], fill=ORANGE, width=2)

        rrect(draw, [(60, y), (W-60, y+220)], r=20, fill=BG_CARD, outline=BORDER)

        # Círculo do número
        cx, cy = 130, y+110
        draw.ellipse([(cx-42, cy-42), (cx+42, cy+42)], fill=ORANGE)
        draw.text((cx, cy), s["n"], font=font(36, True), fill=(10,10,10), anchor="mm")

        # Divisor
        draw.line([(185, y+35), (185, y+185)], fill=BORDER, width=1)

        # Título + desc
        draw.text((210, y+65), s["titulo"], font=font(26, True), fill=WHITE, anchor="lm")
        draw.line([(210, y+95), (W-90, y+95)], fill=BORDER, width=1)
        for j, ln in enumerate(s["desc"].split("\n")):
            draw.text((210, y+120+j*38), ln, font=font(21), fill=GRAY, anchor="lm")

    # Aviso final
    wy = 170 + len(steps) * 260 + 10
    rrect(draw, [(60, wy), (W-60, wy+100)], r=14, fill=(40, 20, 10), outline=ORANGE, width=1)
    draw.text((W//2, wy+32), "⚠  ATENÇÃO", font=font(24, True), fill=ORANGE, anchor="mm")
    draw.text((W//2, wy+72), "Unhas muito escuras podem bloquear a passagem da luz LED.", font=font(19), fill=GRAY, anchor="mm")

    accent_bar(img, top=False)
    img.save(OUT / "09_instrucoes.png")
    print("  [Pillow] 09_instrucoes.png")

# ══════════════════════════════════════════════════════════════════════════════
#  CARD 10 — Postura Correta (Pillow)
# ══════════════════════════════════════════════════════════════════════════════
def card_postura():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    accent_bar(img, top=True)

    draw.text((W//2, 65), "POSTURA CORRETA DE CORTE", font=font(42, True), fill=WHITE, anchor="mm")
    draw.line([(80, 100), (W-80, 100)], fill=BORDER, width=1)

    # Seção unhas claras vs escuras
    types = [
        {"titulo": "UNHAS CLARAS",  "cor": ORANGE,   "items": ["LED penetra totalmente", "Veia visível em vermelho", "Zona de corte clara e segura", "Corte com total confiança"]},
        {"titulo": "UNHAS ESCURAS", "cor": ORANGE_L, "items": ["LED pode não penetrar", "Use luz ambiente adicional", "Corte pequenas quantidades", "Prefira idas ao veterinário"]},
    ]

    for i, t in enumerate(types):
        x = 50 + i * 510
        y = 115
        rrect(draw, [(x, y), (x+470, y+380)], r=20, fill=BG_CARD, outline=t["cor"], width=2)
        draw.text((x+235, y+55), t["titulo"], font=font(28, True), fill=t["cor"], anchor="mm")
        draw.line([(x+30, y+90), (x+440, y+90)], fill=BORDER, width=1)
        for j, item in enumerate(t["items"]):
            draw.text((x+55, y+120+j*56), "►", font=font(18, True), fill=t["cor"], anchor="lm")
            draw.text((x+85, y+120+j*56), item, font=font(22), fill=GRAY, anchor="lm")

    # Zona de corte — infográfico
    rrect(draw, [(50, 515), (W-50, 750)], r=18, fill=BG_CARD, outline=BORDER)
    draw.text((W//2, 562), "ZONAS DE CORTE", font=font(30, True), fill=WHITE, anchor="mm")
    draw.line([(100, 592), (W-100, 592)], fill=BORDER, width=1)

    # Representação visual da unha
    nail_x, nail_y = W//2 - 160, 615
    # Arco da unha (representação)
    draw.arc([(nail_x, nail_y), (nail_x+320, nail_y+100)], start=0, end=180, fill=GRAY, width=3)
    draw.rectangle([(nail_x+20, nail_y+50), (nail_x+300, nail_y+100)], fill=(40, 40, 40))
    # Veia
    draw.ellipse([(nail_x+120, nail_y+40), (nail_x+200, nail_y+80)], fill=(180, 60, 60))
    draw.text((W//2, nail_y+50), "VEIA", font=font(16, True), fill=(200, 100, 100), anchor="mm")
    # Seta de corte
    draw.line([(nail_x+60, nail_y+130), (nail_x+60, nail_y+100)], fill=GREEN, width=3)
    draw.text((nail_x+60, nail_y+148), "CORTE AQUI", font=font(16, True), fill=GREEN, anchor="mm")
    # Seta proibida
    draw.line([(nail_x+260, nail_y+130), (nail_x+260, nail_y+100)], fill=(200, 60, 60), width=3)
    draw.text((nail_x+260, nail_y+148), "NÃO CORTE", font=font(16, True), fill=(200, 60, 60), anchor="mm")

    # Dica de mão dominante
    rrect(draw, [(50, 770), (W-50, 900)], r=14, fill=BG_CARD2, outline=BORDER)
    draw.text((W//2, 816), "MÃO DOMINANTE", font=font(26, True), fill=ORANGE, anchor="mm")
    draw.text((W//2, 858), "Segure o produto com firmeza e controle o ângulo de entrada na unha.", font=font(20), fill=GRAY, anchor="mm")

    # Rodapé
    rrect(draw, [(50, 920), (W-50, 1005)], r=14, fill=ORANGE)
    draw.text((W//2, 954), "DICA PROFISSIONAL", font=font(24, True), fill=(10,10,10), anchor="mm")
    draw.text((W//2, 988), "Nunca hesite — um corte limpo e firme é sempre mais seguro.", font=font(20, True), fill=(10,10,10), anchor="mm")

    accent_bar(img, top=False)
    img.save(OUT / "10_postura_correta.png")
    print("  [Pillow] 10_postura_correta.png")

# ══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("CORTADOR DE UNHAS LED — ASSETS PREMIUM EM PORTUGUES")
    print(f"Output: {OUT}")
    print("=" * 60)

    # Pillow cards (sem custo)
    print("\n[1/2] Gerando cards Pillow...")
    card_modos_led()
    card_por_que()
    card_duplo_uso()
    card_estrutura()
    card_instrucoes()
    card_postura()

    # AI photos (Replicate)
    print("\n[2/2] Gerando fotos com IA (Seedream 4.5)...")
    card_hero()
    time.sleep(3)
    card_led_macro()
    time.sleep(3)
    card_uso_gato()
    time.sleep(3)
    card_pets()

    print("\n" + "=" * 60)
    files = sorted(OUT.glob("*.png"))
    print(f"CONCLUIDO: {len(files)} assets gerados")
    for f in files:
        print(f"  {f.name}  ({f.stat().st_size//1024} KB)")

if __name__ == "__main__":
    main()
