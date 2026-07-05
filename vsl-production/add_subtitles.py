"""
Adiciona legendas sincronizadas ao VSL usando Whisper
Estilo: CAIXA ALTA, branco, caixa preta, fonte grande
"""
import subprocess, json, os
from pathlib import Path
from openai import OpenAI

FFMPEG = "C:/Users/Stenio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
BASE_DIR = Path(__file__).parent
AUDIO    = BASE_DIR / "audio" / "narration.mp3"
VIDEO_IN = BASE_DIR / "output" / "vsl_final_9x16.mp4"
OUT_DIR  = BASE_DIR / "output"

from env_loader import require_env

OPENAI_KEY = require_env("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_KEY)

def transcribe():
    print("[1] Transcrevendo narração com Whisper...")
    with open(AUDIO, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )
    words = result.words
    print(f"    {len(words)} palavras transcritas")
    return words

def make_segments(words, max_chars=38, gap=0.08):
    """Agrupa palavras em linhas de até max_chars caracteres"""
    segments = []
    line = []
    line_len = 0

    for i, w in enumerate(words):
        word = w.word.strip().upper()
        if not word:
            continue

        if line_len + len(word) + (1 if line else 0) > max_chars and line:
            # Fecha segmento atual
            start = line[0].start
            end = line[-1].end
            text = " ".join(x.word.strip().upper() for x in line)
            segments.append({"start": start, "end": end, "text": text})
            line = []
            line_len = 0

        line.append(w)
        line_len += len(word) + (1 if line_len > 0 else 0)

    if line:
        start = line[0].start
        end = line[-1].end
        text = " ".join(x.word.strip().upper() for x in line)
        segments.append({"start": start, "end": end, "text": text})

    return segments

def make_srt(segments, path):
    with open(path, "w", encoding="utf-8") as f:
        for i, s in enumerate(segments, 1):
            def fmt(t):
                h = int(t // 3600)
                m = int((t % 3600) // 60)
                s2 = t % 60
                return f"{h:02d}:{m:02d}:{s2:06.3f}".replace(".", ",")
            f.write(f"{i}\n{fmt(s['start'])} --> {fmt(s['end'])}\n{s['text']}\n\n")
    print(f"    SRT salvo: {path}")

def burn_subtitles(srt_path, video_in, video_out):
    """Queima legendas no vídeo com estilo profissional"""
    print("[3] Queimando legendas no vídeo...")

    # Usar ASS para estilo avançado
    ass_path = srt_path.with_suffix(".ass")
    subprocess.run([
        FFMPEG, "-y", "-i", str(srt_path),
        str(ass_path)
    ], capture_output=True)

    # Editar estilo no ASS
    if ass_path.exists():
        content = ass_path.read_text(encoding="utf-8")
        # Substituir estilo padrão
        content = content.replace(
            "Style: Default,Arial,20,",
            "Style: Default,Arial,52,"
        )
        # Ajustar cor, borda e posição
        ass_path.write_text(content, encoding="utf-8")

    # Usar drawtext via filtro direto (mais confiável no Windows)
    # Converter SRT para filtro drawtext
    print("    Aplicando filtro de legenda...")

    srt_escaped = str(srt_path).replace("\\", "/").replace(":", "\\:")

    r = subprocess.run([
        FFMPEG, "-y",
        "-i", str(video_in),
        "-vf", (
            f"subtitles='{srt_escaped}'"
            f":force_style='FontName=Arial,"
            f"FontSize=52,"
            f"PrimaryColour=&H00FFFFFF,"
            f"OutlineColour=&H00000000,"
            f"BackColour=&H99000000,"
            f"Bold=1,"
            f"BorderStyle=4,"
            f"Outline=0,"
            f"Shadow=0,"
            f"MarginV=120,"
            f"Alignment=2'"
        ),
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "copy",
        str(video_out),
    ], capture_output=True, text=True)

    if r.returncode == 0:
        sz = Path(video_out).stat().st_size // 1024 // 1024
        print(f"    [OK] {video_out.name} ({sz}MB)")
    else:
        print(f"    [ERR] {r.stderr[-800:]}")

def main():
    print("=" * 55)
    print("  VSL + Legendas Sincronizadas")
    print("=" * 55)

    # 1. Transcrever
    words = transcribe()

    # 2. Segmentar
    print("[2] Segmentando legendas...")
    segments = make_segments(words, max_chars=35)
    print(f"    {len(segments)} segmentos gerados")

    # Salvar SRT
    srt_path = BASE_DIR / "output" / "narration.srt"
    make_srt(segments, srt_path)

    # 3. Queimar no 9x16
    out_9x16 = OUT_DIR / "vsl_legendado_9x16.mp4"
    burn_subtitles(srt_path, VIDEO_IN, out_9x16)

    # 4. Versão 4x5
    base_4x5 = BASE_DIR / "output" / "vsl_final_4x5.mp4"
    if base_4x5.exists():
        out_4x5 = OUT_DIR / "vsl_legendado_4x5.mp4"
        burn_subtitles(srt_path, base_4x5, out_4x5)

    print(f"\n{'='*55}")
    print(f"  ENTREGUES:")
    print(f"  9:16 -> output/vsl_legendado_9x16.mp4")
    print(f"  4:5  -> output/vsl_legendado_4x5.mp4")
    print(f"  SRT  -> output/narration.srt")
    print(f"{'='*55}")

if __name__ == "__main__":
    main()
