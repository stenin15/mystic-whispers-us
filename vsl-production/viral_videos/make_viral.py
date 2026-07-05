# -*- coding: utf-8 -*-
"""
Template de vídeos virais — Madam Aurora
Gera Reels/TikTok verticais (1080x1920, 24fps, h264) a partir de videos.json:
cenas com Ken Burns (zoom lento) + texto serif com sombra + end card com CTA.

Sem dependências de API — usa as imagens já geradas em scenes/ e ffmpeg local.
Áudio: vídeos saem mudos de propósito — adicione trending audio no app
(Reels/TikTok) na hora de postar, o que também ajuda no alcance.

Uso:
  python make_viral.py                    # gera todos os vídeos do videos.json
  python make_viral.py --only hook_heartline,pov_ai
  python make_viral.py --list             # lista os IDs disponíveis

Saída: output/<id>.mp4 (+ output/captions.md com legenda e hashtags por post)
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent  # vsl-production/
OUT = HERE / "output"

W, H = 1080, 1920
FPS = 24

FONT_SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
FONT_SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

GOLD = (251, 191, 36)
LILAC = (192, 132, 252)
WHITE = (255, 255, 255)


def find_ffmpeg() -> str:
    ff = shutil.which("ffmpeg")
    if ff:
        return ff
    try:
        import static_ffmpeg  # type: ignore

        static_ffmpeg.add_paths()
        ff = shutil.which("ffmpeg")
        if ff:
            return ff
    except ImportError:
        pass
    raise SystemExit("ffmpeg não encontrado. Instale com: pip install static-ffmpeg")


FFMPEG = find_ffmpeg()


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for raw_line in text.split("\n"):
        words = raw_line.split()
        if not words:
            lines.append("")
            continue
        cur = words[0]
        for word in words[1:]:
            test = f"{cur} {word}"
            if draw.textlength(test, font=font) <= max_width:
                cur = test
            else:
                lines.append(cur)
                cur = word
        lines.append(cur)
    return lines


def draw_text_block(
    img: Image.Image,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple,
    center_y: int,
    max_width: int = 920,
    line_gap: int = 14,
    align: str = "center",
    glow: bool = True,
) -> int:
    """Desenha texto com sombra suave; retorna o y final do bloco."""
    draw = ImageDraw.Draw(img)
    lines = wrap_text(draw, text, font, max_width)
    ascent, descent = font.getmetrics()
    line_h = ascent + descent + line_gap
    total_h = line_h * len(lines) - line_gap
    y = center_y - total_h // 2

    if glow:
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sy = y
        for line in lines:
            tw = sdraw.textlength(line, font=font)
            sx = (W - tw) // 2 if align == "center" else 80
            sdraw.text((sx, sy), line, font=font, fill=(0, 0, 0, 230))
            sy += line_h
        shadow = shadow.filter(ImageFilter.GaussianBlur(8))
        img.alpha_composite(shadow)

    draw = ImageDraw.Draw(img)
    for line in lines:
        tw = draw.textlength(line, font=font)
        x = (W - tw) // 2 if align == "center" else 80
        draw.text((x, y), line, font=font, fill=fill)
        y += line_h
    return y


def vertical_gradient(top_alpha: int, bottom_alpha: int, solid_until: float = 0.0) -> Image.Image:
    """Overlay RGBA preto com alpha em gradiente vertical."""
    grad = Image.new("RGBA", (W, H))
    px = grad.load()
    for y in range(H):
        t = y / (H - 1)
        if t < solid_until:
            a = top_alpha
        else:
            tt = (t - solid_until) / max(1e-6, 1 - solid_until)
            a = int(top_alpha + (bottom_alpha - top_alpha) * tt)
        for x in range(W):
            px[x, y] = (0, 0, 0, a)
    return grad


def brand_footer(img: Image.Image, handle: str) -> None:
    draw = ImageDraw.Draw(img)
    label = "MADAM AURORA  ·  Free Palm Reading"
    f_small = load_font(FONT_SANS, 30)
    tw = draw.textlength(label, font=f_small)
    draw.text(((W - tw) // 2, 1790), label, font=f_small, fill=GOLD)
    f_handle = load_font(FONT_SANS, 26)
    tw2 = draw.textlength(handle, font=f_handle)
    draw.text(((W - tw2) // 2, 1838), handle, font=f_handle, fill=(255, 255, 255, 150))


def make_beat_overlay(beat: dict, handle: str) -> Image.Image:
    """Overlay (gradiente + textos + brand) para compor sobre a cena."""
    img = vertical_gradient(top_alpha=90, bottom_alpha=210, solid_until=0.04)

    position = beat.get("position", "center")  # center | top | bottom
    center_y = {"top": 430, "center": 880, "bottom": 1380}[position]

    text = beat.get("text", "")
    if text:
        size = beat.get("size", 72)
        f_main = load_font(FONT_SERIF_BOLD, size)
        end_y = draw_text_block(img, text, f_main, WHITE, center_y)
    else:
        end_y = center_y

    sub = beat.get("sub", "")
    if sub:
        f_sub = load_font(FONT_SERIF, 44)
        draw_text_block(img, sub, f_sub, (255, 224, 130), end_y + 70)

    brand_footer(img, handle)
    return img


def make_endcard(video: dict, handle: str) -> Image.Image:
    """End card: fundo escuro místico + CTA grande + link in bio."""
    img = Image.new("RGBA", (W, H), (8, 5, 20, 255))
    # vinheta radial simples
    vign = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vign)
    vd.ellipse([-W * 0.35, H * 0.10, W * 1.35, H * 0.95], fill=70)
    vign = vign.filter(ImageFilter.GaussianBlur(180))
    purple = Image.new("RGBA", (W, H), (88, 28, 135, 255))
    img = Image.composite(purple, img, vign).convert("RGBA")

    draw = ImageDraw.Draw(img)
    star = "·  ·  ·"
    f_star = load_font(FONT_SERIF, 60)
    tw = draw.textlength(star, font=f_star)
    draw.text(((W - tw) // 2, 560), star, font=f_star, fill=GOLD)

    cta = video.get("cta", "Your palm already knows.\nGet your free reading.")
    f_cta = load_font(FONT_SERIF_BOLD, 78)
    end_y = draw_text_block(img, cta, f_cta, WHITE, 880)

    f_link = load_font(FONT_SANS, 46)
    draw_text_block(img, "Link in bio", f_link, GOLD, end_y + 110, glow=False)
    f_site = load_font(FONT_SANS, 34)
    draw_text_block(img, "madam-aurora.co", f_site, (255, 255, 255, 150), end_y + 190, glow=False)

    brand_footer(img, handle)
    return img


def cover_resize(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGB")
    scale = max(W / im.width, H / im.height)
    nw, nh = round(im.width * scale), round(im.height * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    left, top = (nw - W) // 2, (nh - H) // 2
    return im.crop((left, top, left + W, top + H))


def render_segment(bg_png: Path, overlay_png: Path, dur: float, zoom_in: bool, seg_path: Path) -> None:
    frames = max(int(round(dur * FPS)), FPS)
    if zoom_in:
        zexpr = f"min(1+0.0011*on,1.16)"
    else:
        zexpr = f"max(1.16-0.0011*on,1.0)"
    fade_out_start = max(dur - 0.22, 0.1)
    vf = (
        f"[0]zoompan=z='{zexpr}':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":s={W}x{H}:fps={FPS}[bg];"
        f"[bg][1]overlay=0:0,"
        f"fade=t=in:st=0:d=0.25,fade=t=out:st={fade_out_start:.2f}:d=0.22"
    )
    cmd = [
        FFMPEG, "-y", "-loglevel", "error",
        "-i", str(bg_png), "-i", str(overlay_png),
        "-filter_complex", vf,
        "-frames:v", str(frames), "-r", str(FPS),
        "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-pix_fmt", "yuv420p", str(seg_path),
    ]
    subprocess.run(cmd, check=True)


def render_video(video: dict, handle: str) -> Path:
    vid = video["id"]
    out_path = OUT / f"{vid}.mp4"
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        segs: list[Path] = []

        for i, beat in enumerate(video["beats"]):
            scene = ROOT / beat["image"]
            if not scene.exists():
                raise SystemExit(f"[{vid}] imagem não encontrada: {scene}")
            bg = cover_resize(scene)
            bg_png = tmp / f"bg_{i}.png"
            bg.save(bg_png)

            overlay = make_beat_overlay(beat, handle)
            ov_png = tmp / f"ov_{i}.png"
            overlay.save(ov_png)

            seg = tmp / f"seg_{i}.mp4"
            render_segment(bg_png, ov_png, float(beat.get("dur", 3.0)), zoom_in=(i % 2 == 0), seg_path=seg)
            segs.append(seg)

        # End card (estático, sem zoom)
        end = make_endcard(video, handle)
        end_bg = tmp / "end_bg.png"
        end.convert("RGB").save(end_bg)
        end_ov = tmp / "end_ov.png"
        Image.new("RGBA", (W, H), (0, 0, 0, 0)).save(end_ov)
        end_seg = tmp / "seg_end.mp4"
        render_segment(end_bg, end_ov, float(video.get("end_dur", 2.8)), zoom_in=True, seg_path=end_seg)
        segs.append(end_seg)

        concat_file = tmp / "concat.txt"
        concat_file.write_text("".join(f"file '{s}'\n" for s in segs))
        subprocess.run(
            [FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
             "-i", str(concat_file), "-c", "copy", str(out_path)],
            check=True,
        )
    return out_path


def write_captions(config: dict, rendered: list[str]) -> None:
    lines = ["# Captions para postagem em massa\n"]
    for video in config["videos"]:
        if video["id"] not in rendered:
            continue
        lines.append(f"## {video['id']}.mp4 — pilar {video.get('pillar', '?')}")
        lines.append("")
        lines.append("```")
        lines.append(video.get("caption", "").strip())
        lines.append("")
        lines.append(video.get("hashtags", config.get("default_hashtags", "")).strip())
        lines.append("```")
        lines.append("")
    (OUT / "captions.md").write_text("\n".join(lines))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="IDs separados por vírgula")
    parser.add_argument("--list", action="store_true")
    args = parser.parse_args()

    config = json.loads((HERE / "videos.json").read_text())
    handle = config.get("handle", "@madamauroraofficial")

    if args.list:
        for v in config["videos"]:
            print(f"{v['id']:28s} [{v.get('pillar', '?')}] {v['beats'][0].get('text', '')[:50]}")
        return

    only = set(args.only.split(",")) if args.only else None
    OUT.mkdir(exist_ok=True)

    rendered: list[str] = []
    for video in config["videos"]:
        if only and video["id"] not in only:
            continue
        print(f"→ {video['id']} ...", flush=True)
        path = render_video(video, handle)
        size_mb = path.stat().st_size / 1e6
        print(f"  ok: {path.name} ({size_mb:.1f} MB)")
        rendered.append(video["id"])

    write_captions(config, rendered)
    print(f"\n{len(rendered)} vídeo(s) em {OUT}/ + captions.md")


if __name__ == "__main__":
    main()
