# Imagens BASE — Sem Texto
> Gere essas no GPT Image 2. Depois rode aurora_overlay.py para adicionar
> 12 variações de hook em cada uma automaticamente.

---

## BASE 1 — Mulher olhando diretamente (a mais forte)
```
Mysterious elegant woman looking directly into the camera, intense dark eyes, dark feminine energy, extending her glowing palm toward the viewer, dark moody candlelight atmosphere, deep purple and black background, gold jewelry, cinematic portrait, photorealistic, vertical 9:16, NO TEXT, clean image
```

## BASE 2 — Mulher olhando para baixo (introspecção)
```
Mystical woman with dark curly hair looking downward with serene expression, candlelight glow from below illuminating her face, gold earrings and necklaces, dark purple velvet background, soft bokeh candles, cinematic portrait, photorealistic, vertical 9:16, NO TEXT, clean image
```

## BASE 3 — Closeup rosto + palma (split)
```
Close up portrait of mysterious woman, one hand raised palm open facing camera with glowing lines, her face visible above the palm looking through her fingers toward camera, candlelight atmosphere, dark purple and black, gold tones, photorealistic, vertical 9:16, NO TEXT, clean image
```

## BASE 4 — Silhueta dramática
```
Silhouette of a woman with arms slightly raised, surrounded by golden particle light and candle glow, deep purple and black atmospheric background, mystical and cinematic, dramatic lighting, vertical 9:16, photorealistic, NO TEXT, clean image
```

## BASE 5 — Mão em closeup lateral
```
Side angle extreme close up of a woman's palm with glowing gold lines on the skin, dark background, warm candlelight from the side, macro photography style, detailed skin texture, mystical energy lines, cinematic, vertical 9:16, NO TEXT, clean image
```

---

## Como usar com o script:

```bash
# Instalar dependências (uma vez)
pip install Pillow

# Baixar fontes (opcional, melhora qualidade)
# Playfair Display: fonts.google.com/specimen/Playfair+Display
# Salvar como fonts/PlayfairDisplay-Bold.ttf e fonts/PlayfairDisplay-Regular.ttf

# Colocar imagens base na pasta vsl-production/
cd vsl-production/

# Gerar todas as variações de uma imagem
python aurora_overlay.py base1_mulher_olhando.jpg

# Gerar variações de TODAS as imagens da pasta
python aurora_overlay.py
```

**Output:** pasta `output_overlays/` com 12 variações por imagem = 60 assets de uma vez.

---

## Fluxo completo de produção

```
GPT Image 2 (5 bases)
        ↓
aurora_overlay.py
        ↓
60 assets prontos
        ↓
Selecionar top 10 para postar hoje
        ↓
Monitorar: save rate > 5% = virou ad
```
