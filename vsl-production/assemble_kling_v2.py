"""
Monta VSL final com clips Kling (1080x1920, 5s cada)
Loopa cada clip para cobrir a duração de cada cena
Narração: 136.7s total — distribuída proporcionalmente
"""
import subprocess, os
from pathlib import Path

FFMPEG  = "C:/Users/Stenio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
DL      = Path("C:/Users/Stenio/Downloads")
BASE    = Path(__file__).parent
AUDIO   = BASE / "audio" / "narration.mp3"
OUT_DIR = BASE / "output"
WORK    = BASE / "scenes" / "kling_trimmed"
WORK.mkdir(parents=True, exist_ok=True)

NARRATION_DUR = 136.7  # segundos

# Cenas: id → (arquivo_kling_id, duração_proporcional_original)
# As durações originais somam 149s → escalonadas para 136.7s (fator 0.917)
SCENES = [
    ("00_silence",        "2570", 3),
    ("01_hook_line1",     "2594", 7),
    ("02_hook_line2",     "2606", 8),   # Golden_ill = iluminação dourada nas mãos
    ("03_hook_punch",     "2592", 9),   # Palm_slowl = palma se abrindo
    ("04_problem1",       "2595", 11),  # Soft_light = mulher à janela
    ("05_problem2",       "2601", 11),  # Golden_par = partículas douradas
    ("06_pattern_reveal", "2603", 10),  # Golden_lig = linha se iluminando
    ("07_heartline",      "2596", 10),  # Camera_gli = câmera desliza
    ("08_marriagelines",  "2600", 10),  # Camera_zoo = zoom nas linhas
    ("09_timing_window",  "2604", 11),  # Golden_san = ampulheta
    ("10_proof_story",    "2610", 15),  # Candle_fla = vela
    ("11_proof_result",   "2616", 10),  # Expression = mulher sorrindo
    ("12_product",        "2621", 14),  # Screen_glo = tela brilhando
    ("13_cta",            "2609", 13),  # Divine_gol = luz divina na palma
    ("14_close",          "2613", 7),   # Hand_silho = silhueta
]

ORIGINAL_TOTAL = sum(d for _, _, d in SCENES)  # 149s
SCALE = NARRATION_DUR / ORIGINAL_TOTAL          # ~0.917

def find_clip(kling_id):
    # Prefere "(1)" = versão sem marca d'água
    for f in DL.glob(f"*_{kling_id}_0 (1).mp4"):
        return f
    # fallback: qualquer arquivo com o id
    for f in DL.glob(f"*_{kling_id}_0*.mp4"):
        return f
    return None

def trim_loop(src, dst, duration):
    """Loopa o clip e corta na duração exata"""
    cmd = [
        FFMPEG, "-y",
        "-stream_loop", "-1",
        "-i", str(src),
        "-t", str(duration),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-an",
        str(dst)
    ]
    r = subprocess.run(cmd, capture_output=True)
    return r.returncode == 0

def main():
    print("=" * 55)
    print("  VSL Kling v2 — Montagem Final")
    print(f"  Narração: {NARRATION_DUR}s | Escala: {SCALE:.3f}")
    print("=" * 55)

    trimmed = []
    concat_list = WORK / "concat.txt"

    for scene_id, kling_id, orig_dur in SCENES:
        dur = round(orig_dur * SCALE, 2)
        src = find_clip(kling_id)
        if not src:
            print(f"  [SKIP] {scene_id} — clip {kling_id} não encontrado")
            continue

        dst = WORK / f"{scene_id}.mp4"
        print(f"  [{scene_id}] {kling_id} -> {dur}s ...", end=" ", flush=True)

        if trim_loop(src, dst, dur):
            sz = dst.stat().st_size // 1024
            print(f"OK ({sz}KB)")
            trimmed.append(dst)
        else:
            print("ERR")

    if len(trimmed) < 15:
        print(f"\n  Apenas {len(trimmed)}/15 clips prontos — verifique os erros acima.")
        return

    # Escrever lista de concatenação
    with open(concat_list, "w") as f:
        for t in trimmed:
            f.write(f"file '{t.as_posix()}'\n")

    # Concatenar
    print("\n  Concatenando...", end=" ", flush=True)
    raw = OUT_DIR / "kling_v2_raw.mp4"
    r = subprocess.run([
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        str(raw)
    ], capture_output=True)
    if r.returncode != 0:
        print("ERR\n", r.stderr[-300:].decode(errors="ignore"))
        return
    print("OK")

    # Adicionar áudio
    print("  Adicionando áudio...", end=" ", flush=True)
    final = OUT_DIR / "vsl_kling_v2_9x16.mp4"
    r = subprocess.run([
        FFMPEG, "-y",
        "-i", str(raw),
        "-i", str(AUDIO),
        "-map", "0:v", "-map", "1:a",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(final)
    ], capture_output=True)
    if r.returncode == 0:
        sz = final.stat().st_size // 1024 // 1024
        print(f"OK ({sz}MB)")
    else:
        print("ERR\n", r.stderr[-300:].decode(errors="ignore"))
        return

    print(f"\n{'='*55}")
    print(f"  ENTREGUE: {final}")
    print(f"  Importe no CapCut + use narration.srt para legendas")
    print(f"{'='*55}")

if __name__ == "__main__":
    main()
