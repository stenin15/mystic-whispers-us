"""
Assemble final VSL — clips + audio + text overlays
"""
import subprocess, time
from pathlib import Path
import urllib3
urllib3.disable_warnings()

FFMPEG  = "C:/Users/Stenio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"

BASE_DIR  = Path(__file__).parent
CLIPS_DIR = BASE_DIR / "scenes" / "clips"
AUDIO_DIR = BASE_DIR / "audio"
OUT_DIR   = BASE_DIR / "output"
OUT_DIR.mkdir(exist_ok=True)

ALL_SCENES = [
    {"id":"00_silence",       "duration":3},
    {"id":"01_hook_line1",    "duration":7,  "text":"There's a line on your palm..."},
    {"id":"02_hook_line2",    "duration":8,  "text":"...that shows exactly how you approach love."},
    {"id":"03_hook_punch",    "duration":9,  "text":"Most people have never looked at it."},
    {"id":"04_problem1",      "duration":11, "text":"You've done the work. You know what you want."},
    {"id":"05_problem2",      "duration":11, "text":"The wrong timing. The person almost right."},
    {"id":"06_pattern_reveal","duration":10, "text":"It's not bad luck. It's a pattern."},
    {"id":"07_heartline",     "duration":10, "text":"Heart Line — How you give and protect love"},
    {"id":"08_marriagelines", "duration":10, "text":"Marriage Lines — Your commitment patterns"},
    {"id":"09_timing_window", "duration":11, "text":"Love Timing Window — You might be in one now."},
    {"id":"10_proof_story",   "duration":15, "text":"38 years old. Her palm said she hadn't met him yet."},
    {"id":"11_proof_result",  "duration":10, "text":"She stopped deciding it was going nowhere."},
    {"id":"12_product",       "duration":14, "text":"Upload. Answer 7 questions. Your reading in minutes."},
    {"id":"13_cta",           "duration":13, "text":"Free to begin. Read My Palm Now."},
    {"id":"14_close",         "duration":7,  "text":"madam-aurora.co"},
]

def run(cmd, desc=""):
    print(f"  {desc}..." if desc else "", end=" ", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        print("OK")
    else:
        print(f"ERR\n{r.stderr[-500:]}")
    return r.returncode == 0

def assemble():
    print("="*50)
    print("  VSL Final Assembly — Madam Aurora")
    print("="*50)

    # Check clips
    clips = []
    missing = []
    for s in ALL_SCENES:
        p = CLIPS_DIR / f"{s['id']}.mp4"
        if p.exists():
            clips.append((s, p))
        else:
            missing.append(s["id"])

    print(f"\n  Clips: {len(clips)}/{len(ALL_SCENES)}")
    if missing:
        print(f"  Faltando: {missing}")

    # Step 1: concat all clips
    concat_file = BASE_DIR / "concat.txt"
    with open(concat_file, "w") as f:
        for s, p in clips:
            f.write(f"file '{str(p).replace(chr(92), chr(47))}'\n")

    raw = OUT_DIR / "raw_noaudio.mp4"
    print("\n[1] Concatenando clips...")
    ok = run([
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat_file),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
        "-r", "25",
        str(raw),
    ], "Concat")
    if not ok:
        return

    # Step 2: Add text overlays using individual drawtext per scene
    # Build a single -vf chain safely
    print("\n[2] Adicionando legendas...")

    # Calculate cumulative timestamps
    t = 0.0
    dt_parts = []
    for s, _ in clips:
        txt = s.get("text", "")
        if txt:
            # Single line, no newlines, safe chars only
            safe = (txt
                    .replace("'", "")
                    .replace('"', "")
                    .replace("\\", "")
                    .replace(":", " -")
                    .replace(",", " ")
                    .replace("[", "(")
                    .replace("]", ")"))
            end_t = t + s["duration"]
            # Simple drawtext: white text bottom center, no fancy alpha
            part = (
                f"drawtext="
                f"fontfile='C\\:/Windows/Fonts/arial.ttf'"
                f":text='{safe}'"
                f":fontsize=44"
                f":fontcolor=white"
                f":box=1:boxcolor=black@0.55:boxborderw=12"
                f":x=(w-text_w)/2"
                f":y=h-200"
                f":enable='between(t\\,{t:.1f}\\,{end_t:.1f})'"
            )
            dt_parts.append(part)
        t += s["duration"]

    vf_chain = ",".join(dt_parts) if dt_parts else "null"

    audio = AUDIO_DIR / "narration.mp3"
    with_text = OUT_DIR / "with_text.mp4"

    run([
        FFMPEG, "-y", "-i", str(raw),
        "-vf", vf_chain,
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
        str(with_text),
    ], "Text overlay")

    # Step 3: Merge audio
    print("\n[3] Adicionando audio...")
    final = OUT_DIR / "vsl_final_9x16.mp4"
    src = with_text if with_text.exists() else raw

    if audio.exists():
        run([
            FFMPEG, "-y",
            "-i", str(src),
            "-i", str(audio),
            "-map", "0:v", "-map", "1:a",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            str(final),
        ], "Merge audio")
    else:
        import shutil
        shutil.copy(src, final)
        print("  (sem audio — copiado diretamente)")

    if not final.exists():
        print("  ERR: final nao gerado")
        return

    sz = final.stat().st_size // 1024 // 1024
    print(f"\n  [OK] vsl_final_9x16.mp4 ({sz}MB)")

    # Step 4: 4:5 crop
    f45 = OUT_DIR / "vsl_final_4x5.mp4"
    run([
        FFMPEG, "-y", "-i", str(final),
        "-vf", "crop=1080:1350:0:285",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-c:a", "copy", str(f45),
    ], "Export 4:5")

    # Step 5: Hook 25s
    hook = OUT_DIR / "vsl_hook_25s.mp4"
    run([FFMPEG, "-y", "-i", str(final), "-t", "25", "-c", "copy", str(hook)], "Hook 25s")

    # Cleanup temps
    for f in [raw, with_text, concat_file]:
        try: f.unlink()
        except: pass

    print(f"\n{'='*50}")
    print(f"  VSL ENTREGUE!")
    print(f"  9:16  ->  {final} ({sz}MB)")
    print(f"  4:5   ->  {f45}")
    print(f"  Hook  ->  {hook}")
    print(f"{'='*50}")

if __name__ == "__main__":
    assemble()
