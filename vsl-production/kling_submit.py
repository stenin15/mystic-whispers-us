"""
Kling submit + poll + TTS + ffmpeg assembly
Usa imagens JPEG redimensionadas (100-200KB cada)
"""
import os, sys, json, time, base64, requests, subprocess
from pathlib import Path
import jwt as pyjwt
import urllib3
urllib3.disable_warnings()

from env_loader import require_env

OPENAI_KEY  = require_env("OPENAI_API_KEY")
KLING_AK    = require_env("KLING_ACCESS_KEY")
KLING_SK    = require_env("KLING_SECRET_KEY")
FFMPEG      = "C:/Users/Stenio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"

BASE_DIR   = Path(__file__).parent
IMGS_SMALL = BASE_DIR / "scenes" / "images_small"
IMGS_DIR   = BASE_DIR / "scenes" / "images"
CLIPS_DIR  = BASE_DIR / "scenes" / "clips"
AUDIO_DIR  = BASE_DIR / "audio"
OUT_DIR    = BASE_DIR / "output"
for d in [CLIPS_DIR, AUDIO_DIR, OUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

ALL_SCENES = [
    {"id":"00_silence",      "duration":3,  "text":"",                                                                     "kling":"Palm slowly coming into focus, gentle golden light, cinematic slow zoom in"},
    {"id":"01_hook_line1",   "duration":7,  "text":"There's a line on your palm...",                                       "kling":"Delicate finger gently points to heart line, warm golden glow, slow motion"},
    {"id":"02_hook_line2",   "duration":8,  "text":"...that shows exactly\nhow you approach love.",                        "kling":"Camera slowly pans between two palms comparing lines, warm candlelight"},
    {"id":"03_hook_punch",   "duration":9,  "text":"Most people have never looked at it.\nIt's been shaping every\nrelationship they've had.", "kling":"Hand slowly opens toward camera, golden light reveals palm lines, meditative"},
    {"id":"04_problem1",     "duration":11, "text":"You've done the work.\nYou know what you want.",                       "kling":"Woman gazes pensively out window, soft light shifts slowly, gentle camera drift"},
    {"id":"05_problem2",     "duration":11, "text":"The wrong timing.\nThe person almost right.\nThe connection that disappears.", "kling":"Golden particles drift through dark purple space, floating ambient motion"},
    {"id":"06_pattern_reveal","duration":10,"text":"It's not bad luck.\nIt's a pattern.",                                  "kling":"Golden lines slowly illuminate along the heart line, glowing gently mystical"},
    {"id":"07_heartline",    "duration":10, "text":"Heart Line\nHow you give — and protect — love",                        "kling":"Camera slides along heart line, warm golden light traces the line"},
    {"id":"08_marriagelines","duration":10, "text":"Marriage Lines\nYour commitment patterns",                             "kling":"Camera zooms into marriage lines, golden spotlight on the outer palm edge"},
    {"id":"09_timing_window","duration":11, "text":"Love Timing Window\nYou might be in one right now.",                  "kling":"Hourglass sand falls in slow motion, warm golden light glows through glass"},
    {"id":"10_proof_story",  "duration":15, "text":"38 years old.\nTwo relationships that went nowhere.\nHer palm said she hadn't met him yet.", "kling":"Hands rest on dark table, candle flickers gently, intimate slow push in"},
    {"id":"11_proof_result", "duration":10, "text":'"I stopped deciding it was\ngoing nowhere before it started."',       "kling":"Woman looks at phone with calm smile, warm golden light, gentle camera drift"},
    {"id":"12_product",      "duration":14, "text":"Upload your photo.\nAnswer 7 questions.\nYour reading in minutes.",    "kling":"Phone screen glows in darkness, UI elements fade in, mystical golden interface"},
    {"id":"13_cta",          "duration":13, "text":"Free to begin.\nRead My Palm Now",                                     "kling":"Palm slowly opens upward toward camera, divine golden light, breathtaking reveal"},
    {"id":"14_close",        "duration":7,  "text":"madam-aurora.co",                                                      "kling":"Palm silhouette fades into darkness, golden light dims to black, cinematic end"},
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

def kling_token():
    now = int(time.time())
    return pyjwt.encode({"iss":KLING_AK,"exp":now+1800,"nbf":now-5}, KLING_SK, algorithm="HS256")

def kh():
    return {"Authorization":f"Bearer {kling_token()}","Content-Type":"application/json"}

def oai_headers():
    return {"Authorization":f"Bearer {OPENAI_KEY}","Content-Type":"application/json"}

# ── Generate missing image 03 with safer prompt ───────────────
def gen_missing():
    out = IMGS_DIR / "03_hook_punch.png"
    small = IMGS_SMALL / "03_hook_punch.jpg"
    if small.exists():
        print("[1] 03_hook_punch ja existe (small)")
        return
    if not out.exists():
        print("[1] Gerando 03_hook_punch com DALL-E 3...", end=" ", flush=True)
        prompt = (
            "Cinematic close-up photograph of an open female hand palm facing upward, "
            "warm amber candlelight illumination, dark wooden table background, "
            "palm lines clearly visible, no people faces, "
            "photorealistic, 9:16 vertical, film grain, no text"
        )
        r = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=oai_headers(), verify=False,
            json={"model":"dall-e-3","prompt":prompt,"n":1,
                  "size":"1024x1792","quality":"hd","response_format":"b64_json"},
            timeout=90,
        )
        if r.status_code == 200:
            img = base64.b64decode(r.json()["data"][0]["b64_json"])
            out.write_bytes(img)
            print(f"OK ({len(img)//1024}KB)")
        else:
            print(f"ERR {r.status_code} — usando imagem fallback da 01_hook_line1")
            # Use existing image as fallback
            import shutil
            shutil.copy(IMGS_DIR/"01_hook_line1.png", out)

    # Resize
    from PIL import Image as PILImage
    img = PILImage.open(out).convert('RGB').resize((720,1280))
    img.save(small, 'JPEG', quality=88)
    print(f"  [OK] {small.name} ({small.stat().st_size//1024}KB)")

# ── Submit to Kling ───────────────────────────────────────────
def submit_kling():
    print("\n[2] Submetendo clips ao Kling...")
    task_ids = {}
    for s in ALL_SCENES:
        clip = CLIPS_DIR / f"{s['id']}.mp4"
        if clip.exists():
            print(f"  [SKIP] {s['id']}")
            continue

        # Find image (prefer small JPEG)
        img_path = IMGS_SMALL / f"{s['id']}.jpg"
        if not img_path.exists():
            img_path = IMGS_DIR / f"{s['id']}.png"
        if not img_path.exists():
            print(f"  [SKIP] {s['id']} — sem imagem")
            continue

        dur = min(s["duration"], 10)
        mime = "image/jpeg" if img_path.suffix == ".jpg" else "image/png"
        b64 = base64.b64encode(img_path.read_bytes()).decode()
        print(f"  [SUBMIT] {s['id']} ({dur}s, {img_path.stat().st_size//1024}KB)...", end=" ", flush=True)

        try:
            r = requests.post(
                "https://api.klingai.com/v1/videos/image2video",
                headers=kh(), verify=False,
                json={
                    "model": "kling-v2-pro",
                    "image": f"data:{mime};base64,{b64}",
                    "prompt": s["kling"],
                    "duration": str(dur),
                    "aspect_ratio": "9:16",
                    "cfg_scale": 0.5,
                    "mode": "pro",
                },
                timeout=30,
            )
            d = r.json()
            tid = (d.get("data") or {}).get("task_id")
            if tid:
                task_ids[s["id"]] = tid
                print(f"OK ({tid[:14]}...)")
            else:
                print(f"ERR: {d.get('message','?')} (code {d.get('code')})")
        except Exception as e:
            print(f"ERR: {e}")
        time.sleep(0.8)

    return task_ids

# ── Poll ──────────────────────────────────────────────────────
def poll(task_ids):
    if not task_ids:
        print("[3] Sem tasks para aguardar.")
        return
    print(f"\n[3] Aguardando {len(task_ids)} clips (max 20min)...")
    pending = dict(task_ids)
    start = time.time()
    while pending and (time.time()-start) < 1200:
        time.sleep(15)
        for sid, tid in list(pending.items()):
            try:
                r = requests.get(
                    f"https://api.klingai.com/v1/videos/image2video/{tid}",
                    headers=kh(), verify=False, timeout=15,
                )
                d = r.json().get("data", {})
                st = d.get("task_status","")
                if st == "succeed":
                    url = d.get("task_result",{}).get("videos",[{}])[0].get("url","")
                    if url:
                        vid = requests.get(url, timeout=120, verify=False)
                        dest = CLIPS_DIR / f"{sid}.mp4"
                        dest.write_bytes(vid.content)
                        print(f"  [DONE] {sid} ({dest.stat().st_size//1024}KB)")
                        del pending[sid]
                elif st == "failed":
                    print(f"  [FAIL] {sid}: {d.get('task_status_msg','')}")
                    del pending[sid]
            except Exception as e:
                print(f"  [ERR poll] {sid}: {e}")
        if pending:
            done = len(task_ids) - len(pending)
            elapsed = int(time.time()-start)
            print(f"  {done}/{len(task_ids)} prontos | {elapsed}s decorridos | aguardando: {list(pending.keys())[:3]}...")
    if pending:
        print(f"  [TIMEOUT] {list(pending.keys())} — Ken Burns vai cobrir")

# ── Ken Burns fallback ────────────────────────────────────────
def ken_burns():
    print("\n[4] Ken Burns fallback para clips faltando...")
    for s in ALL_SCENES:
        clip = CLIPS_DIR / f"{s['id']}.mp4"
        if clip.exists():
            continue
        # Find any image available
        img = IMGS_SMALL / f"{s['id']}.jpg"
        if not img.exists():
            img = IMGS_DIR / f"{s['id']}.png"
        if not img.exists():
            print(f"  [SKIP] {s['id']} — sem imagem")
            continue
        dur = s["duration"]
        fps = 25
        print(f"  [KB] {s['id']} ({dur}s)...", end=" ", flush=True)
        cmd = [
            FFMPEG, "-y", "-loop","1", "-i", str(img),
            "-vf",(
                f"scale=1080:1920:force_original_aspect_ratio=increase,"
                f"crop=1080:1920,"
                f"zoompan=z='min(zoom+0.0006,1.04)':x='iw/2-(iw/zoom/2)'"
                f":y='ih/2-(ih/zoom/2)':d={dur*fps}:s=1080x1920:fps={fps}"
            ),
            "-t",str(dur),"-c:v","libx264","-pix_fmt","yuv420p","-preset","fast",
            str(clip),
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        print("OK" if r.returncode==0 else f"ERR {r.stderr[-100:]}")

# ── TTS ───────────────────────────────────────────────────────
def gen_audio():
    out = AUDIO_DIR / "narration.mp3"
    if out.exists():
        print(f"\n[5] [SKIP] narration.mp3 ja existe")
        return
    print("\n[5] Gerando narracao TTS shimmer...", end=" ", flush=True)
    r = requests.post(
        "https://api.openai.com/v1/audio/speech",
        headers=oai_headers(), verify=False,
        json={"model":"tts-1-hd","input":NARRATION,"voice":"shimmer","speed":0.93,"response_format":"mp3"},
        timeout=180,
    )
    r.raise_for_status()
    out.write_bytes(r.content)
    print(f"OK ({len(r.content)//1024}KB)")

# ── Text filters ──────────────────────────────────────────────
def build_filters():
    filters = []
    t = 0.0
    for s in ALL_SCENES:
        txt = s.get("text","")
        if txt and (CLIPS_DIR/f"{s['id']}.mp4").exists():
            lines = txt.split("\n")
            end = t + s["duration"] - 0.4
            y0 = 1550
            for li, line in enumerate(lines):
                safe = (line.replace("\\","\\\\").replace("'","\\'")
                        .replace(":","\\:").replace(",","\\,")
                        .replace("[","\\[").replace("]","\\]"))
                y = y0 + li * 72
                fi = t+0.4; fo = end-0.4
                filters.append(
                    f"drawtext=fontfile='C\\:/Windows/Fonts/georgia.ttf'"
                    f":text='{safe}':fontsize=46:fontcolor=white"
                    f":x=(w-text_w)/2:y={y}"
                    f":shadowcolor=black@0.9:shadowx=2:shadowy=3"
                    f":enable='between(t,{t:.2f},{end:.2f})'"
                    f":alpha='if(lt(t,{fi:.2f}),(t-{t:.2f})/0.4,"
                    f"if(gt(t,{fo:.2f}),({end:.2f}-t)/0.4,1))'"
                )
        t += s["duration"]
    return filters

# ── Assemble ──────────────────────────────────────────────────
def assemble():
    print("\n[6] Montando video final com ffmpeg...")
    clips = [CLIPS_DIR/f"{s['id']}.mp4" for s in ALL_SCENES
             if (CLIPS_DIR/f"{s['id']}.mp4").exists()]
    if not clips:
        print("  ERR: sem clips"); return
    print(f"  {len(clips)}/{len(ALL_SCENES)} clips disponíveis")

    concat = BASE_DIR/"concat.txt"
    with open(concat,"w") as f:
        for c in clips:
            f.write(f"file '{str(c).replace(chr(92),chr(47))}'\n")

    raw = OUT_DIR/"raw.mp4"
    r = subprocess.run([
        FFMPEG,"-y","-f","concat","-safe","0","-i",str(concat),
        "-vf","scale=1080:1920:force_original_aspect_ratio=decrease,"
              "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v","libx264","-preset","fast","-pix_fmt","yuv420p",str(raw),
    ], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ERR concat: {r.stderr[-300:]}"); return
    print("  [OK] clips concatenados")

    filters = build_filters()
    vf = ",".join(filters) if filters else "null"
    audio = AUDIO_DIR/"narration.mp3"
    final = OUT_DIR/"vsl_final_9x16.mp4"

    cmd = [FFMPEG,"-y","-i",str(raw)]
    if audio.exists(): cmd += ["-i",str(audio)]
    cmd += ["-vf",vf,"-c:v","libx264","-preset","medium","-crf","17",
            "-c:a","aac","-b:a","192k","-pix_fmt","yuv420p"]
    if audio.exists(): cmd += ["-map","0:v","-map","1:a","-shortest"]
    cmd.append(str(final))

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ERR final: {r.stderr[-400:]}"); return
    sz = final.stat().st_size // 1024 // 1024
    print(f"  [OK] vsl_final_9x16.mp4 ({sz}MB)")

    # 4:5 export
    f45 = OUT_DIR/"vsl_final_4x5.mp4"
    subprocess.run([FFMPEG,"-y","-i",str(final),"-vf","crop=1080:1350:0:285",
                    "-c:v","libx264","-preset","fast","-crf","17","-c:a","copy",str(f45)],
                   capture_output=True)
    print(f"  [OK] vsl_final_4x5.mp4")

    # Hook 25s
    hook = OUT_DIR/"vsl_hook_25s.mp4"
    subprocess.run([FFMPEG,"-y","-i",str(final),"-t","25","-c","copy",str(hook)],
                   capture_output=True)
    print(f"  [OK] vsl_hook_25s.mp4")

    raw.unlink(missing_ok=True)
    concat.unlink(missing_ok=True)

    print(f"\n{'='*50}")
    print(f"  VSL COMPLETA!")
    print(f"  9:16 -> {final} ({sz}MB)")
    print(f"  4:5  -> {f45}")
    print(f"  Hook -> {hook}")
    print(f"{'='*50}")

# ── MAIN ──────────────────────────────────────────────────────
if __name__ == "__main__":
    print("="*50)
    print("  Kling Submit + Poll + TTS + Assemble")
    print("="*50)
    gen_missing()
    task_ids = submit_kling()
    gen_audio()       # roda em paralelo enquanto Kling processa
    poll(task_ids)    # aguarda Kling
    ken_burns()       # cobre o que Kling nao entregou
    assemble()
