"""
VSL Generator — Madam Aurora
Pipeline: DALL-E 3 -> Kling image-to-video -> OpenAI TTS -> ffmpeg assembly
"""

import os, sys, json, time, base64, argparse, requests, subprocess, math
from pathlib import Path
import jwt as pyjwt

from env_loader import require_env

OPENAI_KEY  = require_env("OPENAI_API_KEY")
KLING_AK    = require_env("KLING_ACCESS_KEY")
KLING_SK    = require_env("KLING_SECRET_KEY")
FFMPEG_PATH = "C:/Users/Stenio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
FFPROBE_PATH = FFMPEG_PATH.replace("ffmpeg.exe", "ffprobe.exe")

BASE_DIR  = Path(__file__).parent
IMGS_DIR  = BASE_DIR / "scenes" / "images"
CLIPS_DIR = BASE_DIR / "scenes" / "clips"
AUDIO_DIR = BASE_DIR / "audio"
OUT_DIR   = BASE_DIR / "output"
for d in [IMGS_DIR, CLIPS_DIR, AUDIO_DIR, OUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────
# SCENES
# ─────────────────────────────────────────────
SCENES = [
    {
        "id": "00_silence",
        "duration": 3,
        "text": "",
        "voice": "",
        "dalle_prompt": "Extreme close-up of an open female palm, warm golden side lighting, dark black background, palm lines clearly visible, cinematic photography, photorealistic, shallow depth of field, film grain, 9:16 vertical composition, no text, no watermark",
        "kling_prompt": "Palm slowly coming into focus, gentle golden light, cinematic slow zoom in, meditative",
    },
    {
        "id": "01_hook_line1",
        "duration": 7,
        "text": "There's a line on your palm...",
        "voice": "There's a line on your palm...",
        "dalle_prompt": "Close-up of an open female palm with warm golden side lighting, a delicate female finger gently pointing to the heart line, dark moody background, cinematic photography, photorealistic, film grain, 9:16 vertical, no text",
        "kling_prompt": "A delicate finger slowly moves to point at the heart line, gentle motion, warm golden glow intensifies",
    },
    {
        "id": "02_hook_line2",
        "duration": 8,
        "text": "...that shows exactly\nhow you approach love.",
        "voice": "...that shows exactly how you approach love.",
        "dalle_prompt": "Two different female palms side by side, each with unique palm lines, warm amber candlelight, dark background, cinematic close-up, photorealistic, film grain, 9:16, no text",
        "kling_prompt": "Camera slowly pans between two different palms, comparing unique lines, warm golden light, cinematic slow motion",
    },
    {
        "id": "03_hook_punch",
        "duration": 9,
        "text": "Most people have never looked at it.\nIt's been shaping every\nrelationship they've had.",
        "voice": "Most people have never looked at it. And it's been shaping every relationship they've had.",
        "dalle_prompt": "A woman from the chin down, holding her open palm up and looking at it with quiet curiosity, warm natural light from a window, intimate close-up, cinematic 9:16, photorealistic, no face visible, soft focus background, no text",
        "kling_prompt": "Woman slowly raises her palm to look at it, light shifts to reveal the lines more clearly, contemplative moment",
    },
    {
        "id": "04_problem1",
        "duration": 11,
        "text": "You've done the work.\nYou know what you want.",
        "voice": "You're not someone who doesn't try. You've reflected. You've grown. Maybe you've even been in therapy.",
        "dalle_prompt": "A woman sitting alone near a large window, warm afternoon golden light, thoughtful and reflective posture, looking outside, cinematic 9:16, soft bokeh background, photorealistic, intimate atmosphere, no face visible, no text",
        "kling_prompt": "Woman gazes pensively out window, soft light shifts slowly, gentle camera drift to the left, cinematic",
    },
    {
        "id": "05_problem2",
        "duration": 11,
        "text": "The wrong timing.\nThe person almost right.\nThe connection that disappears.",
        "voice": "And still, there's a pattern that keeps showing up. The wrong timing. The person who's almost right. The connection that disappears before it becomes something real.",
        "dalle_prompt": "Abstract dark cinematic composition, deep purple and black tones, golden dust particles floating gently, minimalist moody atmosphere, 9:16, no people, no text, film grain",
        "kling_prompt": "Golden particles drift slowly through dark purple space, gentle floating motion, mesmerizing ambient loop",
    },
    {
        "id": "06_pattern_reveal",
        "duration": 10,
        "text": "It's not bad luck.\nIt's a pattern.",
        "voice": "It's not bad luck. Most of the time it's a pattern that started long before your last relationship, and it's written in your palm lines in a way most people never learn to read.",
        "dalle_prompt": "Extreme close-up of a female palm, golden luminous lines traced over the heart line like glowing circuits, dark dramatic background, cinematic 9:16, photorealistic with ethereal overlay, mystical but subtle, no text",
        "kling_prompt": "Golden lines slowly illuminate along the palm's heart line, glowing gently from left to right, mystical but subtle and elegant",
    },
    {
        "id": "07_heartline",
        "duration": 10,
        "text": "Heart Line\nHow you give — and protect — love",
        "voice": "Your heart line shows how you give and receive love, whether you lead with your heart or protect it first.",
        "dalle_prompt": "Ultra close-up macro of a female palm, the heart line illuminated with a subtle warm golden glow, dark vignette around the edges, cinematic 9:16, photorealistic, warm amber light from the left, no text",
        "kling_prompt": "Camera slowly slides along the heart line from left to right, warm golden light traces the line, macro cinematic movement",
    },
    {
        "id": "08_marriagelines",
        "duration": 10,
        "text": "Marriage Lines\nYour commitment patterns",
        "voice": "Your marriage lines show how you approach emotional commitment, tendencies that have repeated themselves.",
        "dalle_prompt": "Extreme close-up of the outer edge of a female palm just below the pinky finger, showing small horizontal marriage lines highlighted with a soft golden circle, warm amber lighting, cinematic macro photography, 9:16, no text",
        "kling_prompt": "Camera slowly zooms into the marriage lines on the palm edge, golden spotlight appears on those lines, intimate macro reveal",
    },
    {
        "id": "09_timing_window",
        "duration": 11,
        "text": "Love Timing Window\nYou might be in one right now.",
        "voice": "And together they reveal something called a love timing window. A period when your emotional energy is more open. Most people are in one right now and have no idea.",
        "dalle_prompt": "Golden sand hourglass in cinematic slow motion close-up, warm dramatic lighting, deep purple and gold color palette, dark moody background, cinematic 9:16, photorealistic, film grain, no text",
        "kling_prompt": "Hourglass sand falls in beautiful slow motion, warm golden light glows through the glass, elegant and cinematic",
    },
    {
        "id": "10_proof_story",
        "duration": 15,
        "text": "38 years old.\nTwo relationships that went nowhere.\nHer palm said she hadn't met him yet.",
        "voice": "A woman came to me convinced her timing had passed. She was 38. Two long relationships that didn't lead where she expected. Her heart line told a different story. Her marriage lines showed two significant connections. The second one hadn't happened yet.",
        "dalle_prompt": "A woman from the shoulders down, hands resting open on a dark wooden table, warm candlelight illuminating the scene, intimate and quiet atmosphere, cinematic 9:16, photorealistic, shallow depth of field, no face visible, no text",
        "kling_prompt": "Hands rest on table, single candle flame flickers gently beside them, intimate slow camera push in, warm light",
    },
    {
        "id": "11_proof_result",
        "duration": 10,
        "text": '"I stopped deciding it was\ngoing nowhere before it started."',
        "voice": "She stopped closing a door she'd already decided was shut. Six weeks later she wrote to me. She had met someone. That's what clarity does. It doesn't change the future. It changes how you meet it.",
        "dalle_prompt": "A woman from the chin down, gently smiling while looking at her phone with warm soft interior light, cozy warm background, cinematic 9:16, photorealistic, intimate atmosphere, no face visible, no text",
        "kling_prompt": "Woman looks at phone with quiet calm smile, warm golden light glows softly around her, gentle camera drift",
    },
    {
        "id": "12_product",
        "duration": 14,
        "text": "Upload your photo.\nAnswer 7 questions.\nYour reading in minutes.",
        "voice": "Madam Aurora reads your palm using AI. You upload a photo of your hand. You answer seven questions about where you are emotionally right now. And within minutes you receive a personalized reading. Your heart line, your marriage lines, your love timing window, all interpreted together. Not a generic chart. Your specific lines. Read in my voice. Privately.",
        "dalle_prompt": "Elegant dark smartphone mockup floating in darkness, mystical golden and purple glowing UI on screen, palm upload interface visible, cinematic product shot, 9:16, dark luxurious background, no real text visible",
        "kling_prompt": "Phone screen glows in darkness, UI elements appear with gentle fade, mystical golden interface pulses softly",
    },
    {
        "id": "13_cta",
        "duration": 13,
        "text": "Free to begin.\nRead My Palm Now",
        "voice": "If you've been wondering why love keeps feeling just out of reach, this is worth three minutes of your time. Click below to start your reading. It's free to begin. I'll show you what's in your hand. And what it's been trying to tell you.",
        "dalle_prompt": "Female palm slowly opening upward toward the camera, warm golden backlight creating an ethereal glow, dark dramatic background, cinematic offering gesture, 9:16, photorealistic, breathtaking lighting, no text",
        "kling_prompt": "Palm slowly opens upward toward camera, golden divine light emanates from behind, cinematic reveal, breathtaking",
    },
    {
        "id": "14_close",
        "duration": 7,
        "text": "madam-aurora.co",
        "voice": "",
        "dalle_prompt": "Female palm silhouette fading into darkness, golden light dimming slowly to black, cinematic fade, dark moody atmosphere, 9:16, photorealistic, final frame nearly black with subtle warm glow remaining, no text",
        "kling_prompt": "Palm slowly fades into darkness, golden light dims elegantly to black, cinematic end card fade",
    },
]

NARRATION = """There's a line on your palm...

...that shows exactly how you approach love.

Most people have never looked at it. And it's been shaping every relationship they've had.

You're not someone who doesn't try. You've reflected. You've grown. Maybe you've even been in therapy.

And still — there's a pattern that keeps showing up. The wrong timing. The person who's almost right. The connection that disappears before it becomes something real.

It's not bad luck. Most of the time it's a pattern that started long before your last relationship — and it's written in your palm lines in a way most people never learn to read.

Your heart line shows how you give and receive love — whether you lead with your heart or protect it first.

Your marriage lines show how you approach emotional commitment — tendencies that have repeated themselves.

And together, they reveal something called a love timing window. A period when your emotional energy is more open. Most people are in one right now and have no idea.

A woman came to me convinced her timing had passed. She was 38. Two long relationships that didn't lead where she expected. Her heart line told a different story. Her marriage lines showed two significant connections. The second one hadn't happened yet.

She stopped closing a door she'd already decided was shut. Six weeks later she wrote to me. She had met someone. That's what clarity does. It doesn't change the future. It changes how you meet it.

Madam Aurora reads your palm using AI. You upload a photo of your hand. You answer seven questions about where you are emotionally right now. And within minutes you receive a personalized reading — your heart line, your marriage lines, your love timing window — all interpreted together. Not a generic chart. Your specific lines. Read in my voice. Privately.

If you've been wondering why love keeps feeling just out of reach — this is worth three minutes of your time. Click below to start your reading. It's free to begin.

I'll show you what's in your hand. And what it's been trying to tell you."""

# ─────────────────────────────────────────────
# KLING JWT AUTH
# ─────────────────────────────────────────────
def kling_token():
    now = int(time.time())
    payload = {"iss": KLING_AK, "exp": now + 1800, "nbf": now - 5}
    return pyjwt.encode(payload, KLING_SK, algorithm="HS256")

def kling_headers():
    return {"Authorization": f"Bearer {kling_token()}", "Content-Type": "application/json"}

# ─────────────────────────────────────────────
# STEP 1 — DALL-E 3 IMAGES
# ─────────────────────────────────────────────
def generate_images():
    print("\n[1/4] Gerando imagens com DALL-E 3...")
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    for i, s in enumerate(SCENES):
        out = IMGS_DIR / f"{s['id']}.png"
        if out.exists():
            print(f"  [SKIP] {s['id']}")
            continue
        print(f"  [{i+1}/{len(SCENES)}] {s['id']}...", end=" ", flush=True)
        try:
            r = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers=headers,
                json={"model":"dall-e-3","prompt":s["dalle_prompt"],"n":1,
                      "size":"1024x1792","quality":"hd","response_format":"b64_json"},
                timeout=90,
            )
            r.raise_for_status()
            img = base64.b64decode(r.json()["data"][0]["b64_json"])
            out.write_bytes(img)
            print(f"OK ({len(img)//1024}KB)")
        except Exception as e:
            print(f"ERR: {e}")
        time.sleep(1)

# ─────────────────────────────────────────────
# STEP 2 — KLING IMAGE-TO-VIDEO
# ─────────────────────────────────────────────
def generate_clips():
    print("\n[2/4] Gerando clips com Kling image-to-video...")
    task_ids = {}

    for s in SCENES:
        clip = CLIPS_DIR / f"{s['id']}.mp4"
        if clip.exists():
            print(f"  [SKIP] {s['id']}")
            continue
        img = IMGS_DIR / f"{s['id']}.png"
        if not img.exists():
            print(f"  [WARN] sem imagem: {s['id']}")
            continue

        dur = min(s["duration"], 10)
        img_b64 = base64.b64encode(img.read_bytes()).decode()
        print(f"  [SUBMIT] {s['id']} ({dur}s)...", end=" ", flush=True)

        try:
            r = requests.post(
                "https://api.klingai.com/v1/videos/image2video",
                headers=kling_headers(),
                json={
                    "model": "kling-v2-pro",
                    "image": f"data:image/png;base64,{img_b64}",
                    "prompt": s["kling_prompt"],
                    "duration": str(dur),
                    "aspect_ratio": "9:16",
                    "cfg_scale": 0.5,
                    "mode": "pro",
                },
                timeout=30,
            )
            data = r.json()
            tid = (data.get("data") or {}).get("task_id") or data.get("task_id")
            if tid:
                task_ids[s["id"]] = tid
                print(f"queued ({tid[:12]}...)")
            else:
                print(f"ERR no task_id: {data}")
        except Exception as e:
            print(f"ERR: {e}")
        time.sleep(0.8)

    if not task_ids:
        print("  Nenhuma task submetida.")
        return

    print(f"\n  Aguardando {len(task_ids)} clips (pode levar ate 10min)...")
    pending = dict(task_ids)
    start = time.time()
    dots = 0

    while pending and (time.time() - start) < 900:
        time.sleep(12)
        dots += 1
        for sid, tid in list(pending.items()):
            try:
                r = requests.get(
                    f"https://api.klingai.com/v1/videos/image2video/{tid}",
                    headers=kling_headers(),
                    timeout=15,
                )
                d = r.json().get("data", {})
                status = d.get("task_status", "")
                if status == "succeed":
                    url = d.get("task_result", {}).get("videos", [{}])[0].get("url", "")
                    if url:
                        vid = requests.get(url, timeout=120)
                        (CLIPS_DIR / f"{sid}.mp4").write_bytes(vid.content)
                        print(f"  [DONE] {sid}")
                        del pending[sid]
                elif status == "failed":
                    print(f"  [FAIL] {sid}: {d.get('task_status_msg','')}")
                    del pending[sid]
                else:
                    if dots % 5 == 0:
                        print(f"  [WAIT] {sid}: {status}")
            except Exception as e:
                print(f"  [ERR poll] {sid}: {e}")

    if pending:
        print(f"  [TIMEOUT] Nao completados: {list(pending.keys())}")

# ─────────────────────────────────────────────
# STEP 2B — KEN BURNS FALLBACK
# ─────────────────────────────────────────────
def ken_burns_fallback():
    print("\n  [FALLBACK] Ken Burns para cenas sem clip...")
    for s in SCENES:
        clip = CLIPS_DIR / f"{s['id']}.mp4"
        img  = IMGS_DIR  / f"{s['id']}.png"
        if clip.exists() or not img.exists():
            continue
        dur = s["duration"]
        fps = 25
        frames = dur * fps
        print(f"  [KB] {s['id']} ({dur}s)...", end=" ", flush=True)
        cmd = [
            FFMPEG_PATH, "-y",
            "-loop", "1", "-i", str(img),
            "-vf", (
                f"scale=1080:1920:force_original_aspect_ratio=increase,"
                f"crop=1080:1920,"
                f"zoompan=z='min(zoom+0.0006,1.04)':x='iw/2-(iw/zoom/2)'"
                f":y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps={fps}"
            ),
            "-t", str(dur),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
            str(clip),
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        print("OK" if r.returncode == 0 else f"ERR {r.stderr[-200:]}")

# ─────────────────────────────────────────────
# STEP 3 — TTS NARRATION
# ─────────────────────────────────────────────
def generate_narration():
    print("\n[3/4] Gerando narracao TTS (shimmer)...")
    out = AUDIO_DIR / "narration.mp3"
    if out.exists():
        print(f"  [SKIP] narration.mp3 ja existe")
        return
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    r = requests.post(
        "https://api.openai.com/v1/audio/speech",
        headers=headers,
        json={"model":"tts-1-hd","input":NARRATION,"voice":"shimmer","speed":0.93,"response_format":"mp3"},
        timeout=180,
    )
    r.raise_for_status()
    out.write_bytes(r.content)
    print(f"  [OK] narration.mp3 ({len(r.content)//1024}KB)")

# ─────────────────────────────────────────────
# STEP 4 — ASSEMBLE
# ─────────────────────────────────────────────
def assemble():
    print("\n[4/4] Montando video final...")

    # Ken Burns for any missing clips
    ken_burns_fallback()

    clips = [CLIPS_DIR / f"{s['id']}.mp4" for s in SCENES
             if (CLIPS_DIR / f"{s['id']}.mp4").exists()]

    if not clips:
        print("  [ERR] Sem clips. Abortando.")
        return

    # Write concat
    concat = BASE_DIR / "concat.txt"
    with open(concat, "w") as f:
        for c in clips:
            f.write(f"file '{str(c).replace(chr(92), '/')}'\n")

    # Concat clips
    raw = OUT_DIR / "raw.mp4"
    print(f"  Concatenando {len(clips)} clips...")
    r = subprocess.run([
        FFMPEG_PATH, "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,"
               "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
        str(raw),
    ], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  [ERR concat] {r.stderr[-400:]}")
        return
    print("  [OK] clips concatenados")

    # Build drawtext
    filters = build_text_filters()

    # Final merge
    audio = AUDIO_DIR / "narration.mp3"
    final = OUT_DIR / "vsl_final_9x16.mp4"
    print("  Adicionando audio e legendas...")

    vf = ",".join(filters) if filters else "null"
    cmd = [FFMPEG_PATH, "-y", "-i", str(raw)]
    if audio.exists():
        cmd += ["-i", str(audio)]
    cmd += [
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
    ]
    if audio.exists():
        cmd += ["-map", "0:v", "-map", "1:a", "-shortest"]
    cmd.append(str(final))

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  [ERR final] {r.stderr[-600:]}")
        return
    print(f"  [OK] {final}")

    # 4:5 crop
    f45 = OUT_DIR / "vsl_final_4x5.mp4"
    subprocess.run([
        FFMPEG_PATH, "-y", "-i", str(final),
        "-vf", "crop=1080:1350:0:285",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-c:a", "copy", str(f45),
    ], capture_output=True)
    print(f"  [OK] {f45}")

    # Hook-only version (0-25s) for awareness ads
    hook = OUT_DIR / "vsl_hook_25s.mp4"
    subprocess.run([
        FFMPEG_PATH, "-y", "-i", str(final),
        "-t", "25", "-c", "copy", str(hook),
    ], capture_output=True)
    print(f"  [OK] {hook}")

    raw.unlink(missing_ok=True)
    concat.unlink(missing_ok=True)

    sz = final.stat().st_size // (1024*1024)
    print(f"\n{'='*50}")
    print(f"  VSL PRONTA!")
    print(f"  9:16  -> {final} ({sz}MB)")
    print(f"  4:5   -> {f45}")
    print(f"  Hook  -> {hook}")
    print(f"{'='*50}")

def build_text_filters():
    filters = []
    t = 0.0
    for s in SCENES:
        if not s["text"] or not (CLIPS_DIR / f"{s['id']}.mp4").exists():
            t += s["duration"]
            continue
        lines = s["text"].split("\n")
        y0 = 1580
        end = t + s["duration"] - 0.4
        for li, line in enumerate(lines):
            safe = (line.replace("\\","\\\\").replace("'","\\'")
                    .replace(":","\\:").replace(",","\\,")
                    .replace("[","\\[").replace("]","\\]"))
            y = y0 + li * 68
            fi = t + 0.4
            fo = end - 0.4
            filters.append(
                f"drawtext=fontfile='C\\:/Windows/Fonts/georgia.ttf'"
                f":text='{safe}':fontsize=44:fontcolor=white"
                f":x=(w-text_w)/2:y={y}"
                f":shadowcolor=black@0.85:shadowx=2:shadowy=3"
                f":enable='between(t,{t:.2f},{end:.2f})'"
                f":alpha='if(lt(t,{fi:.2f}),(t-{t:.2f})/0.4,"
                f"if(gt(t,{fo:.2f}),({end:.2f}-t)/0.4,1))'"
            )
        t += s["duration"]
    return filters

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("  VSL Generator — Madam Aurora")
    print("=" * 50)
    generate_images()
    generate_clips()
    generate_narration()
    assemble()
