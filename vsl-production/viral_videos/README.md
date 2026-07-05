# Viral Videos — Template de Postagem em Massa

Gera Reels/TikTok verticais (1080x1920, 24fps) prontos para postar, usando as
imagens já produzidas em `vsl-production/scenes/` — **sem nenhuma API paga**.
Cada vídeo: 3–4 cenas com zoom lento (Ken Burns) + texto serif + end card com CTA.

## Uso

```bash
pip install pillow static-ffmpeg   # uma vez
cd vsl-production/viral_videos
python make_viral.py               # renderiza todos os vídeos do videos.json
python make_viral.py --list        # lista os IDs
python make_viral.py --only 01_heartline_meaning,05_pov_ai_reading
```

Saída em `output/`:
- `<id>.mp4` — vídeo final (silencioso de propósito: adicione **trending audio**
  no app na hora de postar, melhora o alcance)
- `captions.md` — legenda + hashtags prontas para cada post

## Como criar novos vídeos (o template)

Adicione um objeto em `videos.json`:

```json
{
  "id": "11_meu_video",
  "pillar": "Relate",
  "beats": [
    { "image": "scenes/images_v2/01_hook_line1.png", "text": "Hook forte aqui", "dur": 2.8, "position": "top", "size": 80 },
    { "image": "scenes/ad_images_v2/final/02_pattern.png", "text": "Desenvolvimento", "sub": "linha de apoio dourada", "dur": 3.0 }
  ],
  "cta": "Frase do end card.\nGet your free reading.",
  "caption": "Legenda do post com gancho de comentário 👇",
  "hashtags": "#palmreading #..."
}
```

Campos do beat:
| Campo | Default | Descrição |
|---|---|---|
| `image` | — | caminho relativo a `vsl-production/` |
| `text` | — | texto principal (use `\n` para quebrar linha) |
| `sub` | — | linha de apoio em dourado |
| `dur` | 3.0 | duração do beat em segundos |
| `position` | center | `top` / `center` / `bottom` |
| `size` | 72 | tamanho da fonte do texto principal |

## Estratégia (docs/organic-growth-strategy.md)

Os 10 vídeos cobrem os 4 pilares — mix semanal recomendado:
2x **Illuminate** (educativo) · 2x **Relate** (identificação) ·
2x **Reveal** (POV/storytelling) · 1x **Transform** (prova social + CTA).

| ID | Pilar |
|---|---|
| 01_heartline_meaning | Illuminate |
| 02_marriage_lines | Illuminate |
| 03_same_type | Relate |
| 04_almost_there | Relate |
| 05_pov_ai_reading | Reveal |
| 06_uploaded_photo | Reveal |
| 07_blocked_loveline | Illuminate |
| 08_women_30s | Relate |
| 09_confused_clarity | Transform |
| 10_timing_window_open | Transform |

> Os `.mp4` ficam fora do git (gitignore já cobre `vsl-production/**/*.mp4`).
> Rode o script localmente para regenerar quando quiser.
