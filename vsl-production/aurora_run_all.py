"""
aurora_run_all.py — Roda o pipeline completo quando as 5 bases estiverem na pasta

1. Detecta as bases disponíveis
2. Gera 12 variações de texto em cada uma (= até 60 assets)
3. Renomeia com prefixo da base para não sobrescrever
4. Roda o organizer para distribuir nas pastas por dia/hora
5. Mostra resumo final
"""

import os
import shutil
from pathlib import Path
from aurora_overlay import add_overlay, HOOKS, OUTPUT_DIR

BASE_DIR = Path(__file__).parent

# Mapeamento: nome do arquivo da base → prefixo dos outputs
BASE_IMAGES = {
    "base1_palm_lateral.jpg":  "b1",
    "base2_eye_contact.jpg":   "b2",
    "base3_looking_down.jpg":  "b3",
    "base4_silhouette.jpg":    "b4",
    "base5_palm_face.jpg":     "b5",
}

# Qual base usar para qual hook (otimização por composição)
BASE_ASSIGNMENT = {
    "hook_feminine_energy":    "base2_eye_contact.jpg",    # olho direto → mais forte
    "hook_i_can_see":          "base2_eye_contact.jpg",
    "hook_wrong_person":       "base3_looking_down.jpg",   # introspecção → pain point
    "hook_stop_waiting":       "base3_looking_down.jpg",
    "hook_too_much":           "base3_looking_down.jpg",
    "hook_she_kept_choosing":  "base3_looking_down.jpg",
    "hook_heart_line":         "base1_palm_lateral.jpg",   # palma → educational
    "hook_love_deeply":        "base1_palm_lateral.jpg",
    "hook_before_text":        "base5_palm_face.jpg",      # palma+rosto → intrigante
    "hook_3_signs":            "base5_palm_face.jpg",
    "hook_bad_luck":           "base4_silhouette.jpg",     # silhueta → transformação
    "hook_stops_explaining":   "base4_silhouette.jpg",
}


def check_bases() -> list[str]:
    found = []
    missing = []
    for fname in BASE_IMAGES:
        p = BASE_DIR / fname
        if p.exists():
            found.append(fname)
        else:
            missing.append(fname)
    return found, missing


def run_optimized():
    """Gera cada hook com a base mais adequada para ela."""
    found, missing = check_bases()

    print("\n🔮 Aurora Run All — Pipeline Completo")
    print("=" * 50)

    if missing:
        print(f"\n⚠️  Bases faltando ({len(missing)}):")
        for m in missing:
            print(f"   • {m}")
        print("\nSalve as imagens com esses nomes na pasta vsl-production/")

    if not found:
        print("\n❌ Nenhuma base encontrada. Salve as imagens primeiro.")
        return

    print(f"\n✅ Bases encontradas ({len(found)}):")
    for f in found:
        print(f"   • {f}")

    # Limpar output anterior
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir()

    print(f"\n🎨 Gerando variações...")
    generated = []

    for hook in HOOKS:
        # Escolhe a base ideal para este hook
        ideal_base = BASE_ASSIGNMENT.get(hook["filename"])
        if ideal_base and (BASE_DIR / ideal_base).exists():
            base_path = str(BASE_DIR / ideal_base)
            prefix = BASE_IMAGES[ideal_base]
        elif found:
            # Fallback: primeira base disponível
            base_path = str(BASE_DIR / found[0])
            prefix = BASE_IMAGES[found[0]]
        else:
            continue

        # Gera com prefixo da base
        hook_copy = dict(hook)
        hook_copy["filename"] = f"{prefix}_{hook['filename']}"
        out = add_overlay(base_path, hook_copy)
        generated.append(out)

    print(f"\n✅ {len(generated)} imagens geradas em output_overlays/")

    # Rodar organizer para distribuir nas pastas
    print("\n📁 Organizando nas pastas de postagem...")
    os.system("python3 aurora_organizer.py")


def run_all_combinations():
    """Gera TODAS as combinações base × hook = até 60 assets."""
    found, missing = check_bases()

    if not found:
        print("Nenhuma base encontrada.")
        return

    OUTPUT_ALL = BASE_DIR / "output_all_combinations"
    OUTPUT_ALL.mkdir(exist_ok=True)

    total = 0
    for base_file in found:
        base_path = str(BASE_DIR / base_file)
        prefix = BASE_IMAGES[base_file]
        print(f"\n🖼  {base_file}")

        for hook in HOOKS:
            hook_copy = dict(hook)
            hook_copy["filename"] = f"{prefix}_{hook['filename']}"

            # Sobrescrever caminho de output
            from aurora_overlay import OUTPUT_DIR as OD
            import aurora_overlay
            orig = aurora_overlay.OUTPUT_DIR
            aurora_overlay.OUTPUT_DIR = OUTPUT_ALL
            add_overlay(base_path, hook_copy)
            aurora_overlay.OUTPUT_DIR = orig
            total += 1

    print(f"\n✅ {total} combinações geradas em output_all_combinations/")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "all":
        run_all_combinations()
    else:
        run_optimized()
