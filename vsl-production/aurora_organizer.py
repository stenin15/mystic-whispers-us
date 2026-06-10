"""
Aurora Post Organizer — lê schedule.json e organiza as imagens em pastas por dia/hora
Uso: python aurora_organizer.py

Coloca as imagens na pasta vsl-production/ e rode este script.
Ele copia cada imagem para posts/YYYY-MM-DD/HHhMM/ e cria um post.md
com a legenda, hashtags e instruções de postagem prontas.
"""

import json
import shutil
import os
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).parent
POSTS_DIR = BASE / "posts"
SCHEDULE = BASE / "posts" / "schedule.json"
OUTPUT_DIR = BASE / "output_overlays"
IMAGES_DIR = BASE  # imagens geradas ficam na raiz de vsl-production


def find_image(filename: str) -> Path | None:
    """Procura a imagem em várias pastas possíveis."""
    search_dirs = [OUTPUT_DIR, IMAGES_DIR, BASE / "images"]
    for d in search_dirs:
        p = d / filename
        if p.exists():
            return p
    return None


def create_post_md(post: dict, date: str) -> str:
    """Gera o arquivo post.md com tudo que precisa para postar."""
    platform_emoji = {
        "TikTok": "🎵",
        "Instagram Reels": "📱",
        "Instagram Feed": "📸",
    }
    emoji = platform_emoji.get(post["platform"], "📲")

    lines = [
        f"# {emoji} {post['platform']} — {post['time']} ({date})",
        "",
        f"**Tipo:** {post['type'].upper()}",
        f"**Imagem:** `{post['image']}`",
        f"**Hook:** {post['hook']}",
        "",
        "---",
        "",
        "## LEGENDA (copiar e colar)",
        "",
        "```",
        post["caption"],
        "```",
        "",
        "---",
        "",
    ]

    if post.get("cta"):
        lines += [f"**CTA:** {post['cta']}", ""]

    if post.get("notes"):
        lines += ["## NOTAS", "", f"> {post['notes']}", ""]

    lines += [
        "## CHECKLIST ANTES DE POSTAR",
        "",
        "- [ ] Imagem na pasta ✓",
        "- [ ] Legenda copiada",
        "- [ ] Link in bio atualizado (madam-aurora.co)",
        "- [ ] Closed captions/legendas adicionados no vídeo",
        "- [ ] Postado no horário certo (EST)",
        "- [ ] Monitorar primeiras 2h e responder comentários",
        "",
        "---",
        f"*Gerado automaticamente — Aurora Organizer*",
    ]

    return "\n".join(lines)


def organize():
    """Lê o schedule e organiza tudo nas pastas corretas."""
    with open(SCHEDULE) as f:
        schedule = json.load(f)

    print(f"\n🔮 Aurora Post Organizer")
    print(f"📅 Organizando {len(schedule['week'])} dias de posts\n")

    total = 0

    for day in schedule["week"]:
        date = day["date"]
        print(f"📆 {date} — Tema: {day['theme']}")

        for post in day["posts"]:
            time_slot = post["time"].replace("h", "h")
            post_dir = POSTS_DIR / date / time_slot
            post_dir.mkdir(parents=True, exist_ok=True)

            # Criar post.md com a legenda e instruções
            md_content = create_post_md(post, date)
            md_path = post_dir / "post.md"
            md_path.write_text(md_content)

            # Tentar copiar a imagem se existir
            img_path = find_image(post["image"])
            if img_path:
                dest = post_dir / post["image"]
                if not dest.exists():
                    shutil.copy2(img_path, dest)
                print(f"   ✓ {time_slot} | {post['platform']:<20} | {post['image']} ✓")
            else:
                # Criar placeholder
                placeholder = post_dir / f"FALTA_{post['image']}.txt"
                placeholder.write_text(
                    f"Falta a imagem: {post['image']}\n"
                    f"Gere com aurora_overlay.py ou GPT Image 2\n"
                    f"Hook: {post['hook']}"
                )
                print(f"   ⚠ {time_slot} | {post['platform']:<20} | {post['image']} (FALTA)")

            total += 1

    print(f"\n✅ {total} posts organizados em posts/")
    print(f"📁 Estrutura: posts/YYYY-MM-DD/HHhMM/post.md + imagem")


def show_today():
    """Mostra o plano de hoje."""
    today = datetime.now().strftime("%Y-%m-%d")

    with open(SCHEDULE) as f:
        schedule = json.load(f)

    day = next((d for d in schedule["week"] if d["date"] == today), None)

    if not day:
        print(f"Nenhum post agendado para hoje ({today})")
        return

    print(f"\n📅 POSTS DE HOJE — {today}")
    print(f"Tema: {day['theme']}")
    print("=" * 60)

    for post in day["posts"]:
        post_dir = POSTS_DIR / today / post["time"]
        has_image = find_image(post["image"]) is not None
        status = "✓ PRONTO" if has_image else "⚠ FALTA IMAGEM"

        print(f"\n{post['time']} | {post['platform']}")
        print(f"  Hook: {post['hook']}")
        print(f"  Imagem: {post['image']} — {status}")
        print(f"  Pasta: posts/{today}/{post['time']}/")


def generate_week_summary():
    """Gera um resumo da semana em markdown."""
    with open(SCHEDULE) as f:
        schedule = json.load(f)

    lines = ["# Resumo da Semana — Madam Aurora\n"]

    for day in schedule["week"]:
        lines.append(f"## {day['date']} — {day['theme']}\n")
        lines.append("| Hora | Plataforma | Hook | CTA |")
        lines.append("|------|-----------|------|-----|")

        for post in day["posts"]:
            cta = post.get("cta") or "—"
            hook_short = post["hook"][:40] + "..." if len(post["hook"]) > 40 else post["hook"]
            lines.append(f"| {post['time']} | {post['platform']} | {hook_short} | {cta} |")

        lines.append("")

    summary_path = POSTS_DIR / "SEMANA_RESUMO.md"
    summary_path.write_text("\n".join(lines))
    print(f"\n📋 Resumo salvo em: {summary_path}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "hoje":
            show_today()
        elif cmd == "resumo":
            generate_week_summary()
        else:
            print(f"Comando desconhecido: {cmd}")
            print("Uso: python aurora_organizer.py [hoje|resumo]")
    else:
        organize()
        generate_week_summary()
        print("\n🎯 Comandos úteis:")
        print("  python aurora_organizer.py hoje    → ver posts de hoje")
        print("  python aurora_organizer.py resumo  → gerar resumo da semana")
