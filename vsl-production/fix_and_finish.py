"""
Fix & Finish — recupera tasks Kling, gera imagens faltando, TTS, monta video
"""
import os, sys, json, time, base64, requests, subprocess, ssl
from pathlib import Path
import jwt as pyjwt

# Disable SSL verification for Windows cert issues
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
os.environ["PYTHONHTTPSVERIFY"] = "0"

OPENAI_KEY  = "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"
KLING_AK    = "Aemf4d4QrGmf4GETeYaYeBT38QgbBHkb"
KLING_SK    = "rYERrBHgEhpQgCk8pHQprNGNharbRLLa"
FFMPEG      = "C:/Users/Stenio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
FFPROBE     = FFMPEG.replace("ffmpeg.exe", "ffprobe.exe")

BASE_DIR  = Path(__file__).parent
IMGS_DIR  = BASE_DIR / "scenes" / "images"
CLIPS_DIR = BASE_DIR / "scenes" / "clips"
AUDIO_DIR = BASE_DIR / "audio"
OUT_DIR   = BASE_DIR / "output"
for d in [IMGS_DIR, CLIPS_DIR, AUDIO_DIR, OUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── MISSING IMAGES (safer prompts) ────────────────────────────
MISSING_SCENES = [
    {
        "id": "03_hook_punch",
        "dalle_prompt": (
            "Cinematic close-up of a female hand held open, palm facing up, "
            "warm golden candlelight, dark elegant background, "
            "focus on the palm lines, intimate and thoughtful mood, "
            "9:16 vertical, photorealistic, film grain, no text, no watermark"
        ),
        "kling_prompt": "Hand slowly opens toward camera, warm golden light reveals palm lines, meditative cinematic reveal",
        "duration": 9,
        "text": "Most people have never looked at it.\nIt's been shaping every\nrelationship they've had.",
    },
    {
        "id": "14_close",
        "dalle_prompt": (
            "Dark cinematic scene, a single open palm silhouette backlit by a soft warm golden glow, "
            "fading into deep black, atmospheric and moody, 9:16 vertical, "
            "photorealistic, dramatic lighting, no text, no watermark"
        ),
        "kling_prompt": "Warm golden backlight slowly dims to black around palm silhouette, elegant cinematic fade out",
        "duration": 7,
        "text": "madam-aurora.co",
    },
]

ALL_SCENES = [
    {"id":"00_silence","duration":3,"text":""},
    {"id":"01_hook_line1","duration":7,"text":"There's a line on your palm..."},
    {"id":"02_hook_line2","duration":8,"text":"...that shows exactly\nhow you approach love."},
    {"id":"03_hook_punch","duration":9,"text":"Most people have never looked at it.\nIt's been shaping every\nrelationship they've had."},
    {"id":"04_problem1","duration":11,"text":"You've done the work.\nYou know what you want."},
    {"id":"05_problem2","duration":11,"text":"The wrong timing.\nThe person almost right.\nThe connection that disappears."},
    {"id":"06_pattern_reveal","duration":10,"text":"It's not bad luck.\nIt's a pattern."},
    {"id":"07_heartline","duration":10,"text":"Heart Line\nHow you give — and protect — love"},
    {"id":"08_marriagelines","duration":10,"text":"Marriage Lines\nYour commitment patterns"},
    {"id":"09_timing_window","duration":11,"text":"Love Timing Window\nYou might be in one right now."},
    {"id":"10_proof_story","duration":15,"text":"38 years old.\nTwo relationships that went nowhere.\nHer palm said she hadn't met him yet."},
    {"id":"11_proof_result","duration":10,"text":'"I stopped deciding it was\ngoing nowhere before it started."'},
    {"id":"12_product","duration":14,"text":"Upload your photo.\nAnswer 7 questions.\nYour reading in minutes."},
    {"id":"13_cta","duration":13,"text":"Free to begin.\nRead My Palm Now"},
    {"id":"14_close","duration":7,"text":"madam-aurora.co"},
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

# ── STEP 1: Generate missing images ───────────────────────────
def gen_missing_images():
    print("\n[1] Gerando imagens faltando...")
    for s in MISSING_SCENES:
        out = IMGS_DIR / f"{s['id']}.png"
        if out.exists():
            print(f"  [SKIP] {s['id']}")
            continue
        print(f"  {s['id']}...", end=" ", flush=True)
        try:
            r = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers=oai_headers(), verify=False,
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

# ── STEP 2: Submit Kling for images without clips ─────────────
def submit_kling_missing():
    print("\n[2] Submetendo clips Kling para imagens sem clip...")
    task_ids = {}

    kling_map = {s["id"]: s for s in MISSING_SCENES}
    # Also include all scenes from ALL_SCENES that have images but no clips
    all_kling = {}
    # Load kling prompts from original script
    original_prompts = {
        "00_silence": ("Palm slowly coming into focus, gentle golden light, cinematic slow zoom in, meditative", 3),
        "01_hook_line1": ("A delicate finger slowly moves to point at the heart line, gentle motion, warm golden glow intensifies", 7),
        "02_hook_line2": ("Camera slowly pans between two different palms, comparing unique lines, warm golden light, cinematic slow motion", 8),
        "03_hook_punch": ("Hand slowly opens toward camera, warm golden light reveals palm lines, meditative cinematic reveal", 9),
        "04_problem1": ("Woman gazes pensively out window, soft light shifts slowly, gentle camera drift to the left, cinematic", 11),
        "05_problem2": ("Golden particles drift slowly through dark purple space, gentle floating motion, mesmerizing ambient loop", 11),
        "06_pattern_reveal": ("Golden lines slowly illuminate along the palm's heart line, glowing gently from left to right, mystical but subtle and elegant", 10),
        "07_heartline": ("Camera slowly slides along the heart line from left to right, warm golden light traces the line, macro cinematic movement", 10),
        "08_marriagelines": ("Camera slowly zooms into the marriage lines on the palm edge, golden spotlight appears on those lines, intimate macro reveal", 10),
        "09_timing_window": ("Hourglass sand falls in beautiful slow motion, warm golden light glows through the glass, elegant and cinematic", 11),
        "10_proof_story": ("Hands rest on table, single candle flame flickers gently beside them, intimate slow camera push in, warm light", 15),
        "11_proof_result": ("Woman looks at phone with quiet calm smile, warm golden light glows softly around her, gentle camera drift", 10),
        "12_product": ("Phone screen glows in darkness, UI elements appear with gentle fade, mystical golden interface pulses softly", 14),
        "13_cta": ("Palm slowly opens upward toward camera, golden divine light emanates from behind, cinematic reveal, breathtaking", 13),
        "14_close": ("Warm golden backlight slowly dims to black around palm silhouette, elegant cinematic fade out", 7),
    }

    for scene_id, (prompt, dur) in original_prompts.items():
        clip = CLIPS_DIR / f"{scene_id}.mp4"
        img  = IMGS_DIR  / f"{scene_id}.png"
        if clip.exists():
            print(f"  [SKIP] {scene_id} (clip existe)")
            continue
        if not img.exists():
            print(f"  [SKIP] {scene_id} (sem imagem)")
            continue

        dur_str = str(min(dur, 10))
        img_b64 = base64.b64encode(img.read_bytes()).decode()
        print(f"  [SUBMIT] {scene_id} ({dur_str}s)...", end=" ", flush=True)
        try:
            r = requests.post(
                "https://api.klingai.com/v1/videos/image2video",
                headers=kh(), verify=False,
                json={
                    "model": "kling-v2-pro",
                    "image": f"data:image/png;base64,{img_b64}",
                    "prompt": prompt,
                    "duration": dur_str,
                    "aspect_ratio": "9:16",
                    "cfg_scale": 0.5,
                    "mode": "pro",
                },
                timeout=30,
            )
            d = r.json()
            tid = (d.get("data") or {}).get("task_id") or d.get("task_id")
            if tid:
                task_ids[scene_id] = tid
                print(f"OK ({tid[:12]}...)")
            else:
                print(f"ERR: {d}")
        except Exception as e:
            print(f"ERR: {e}")
        time.sleep(0.8)

    return task_ids

# ── STEP 3: Poll Kling tasks ───────────────────────────────────
def poll_kling(task_ids: dict):
    if not task_ids:
        return
    print(f"\n[3] Aguardando {len(task_ids)} clips Kling...")
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
                status = d.get("task_status","")
                if status == "succeed":
                    url = d.get("task_result",{}).get("videos",[{}])[0].get("url","")
                    if url:
                        vid = requests.get(url, timeout=120, verify=False)
                        (CLIPS_DIR/f"{sid}.mp4").write_bytes(vid.content)
                        sz = len(vid.content)//1024
                        print(f"  [DONE] {sid} ({sz}KB)")
                        del pending[sid]
                elif status == "failed":
                    print(f"  [FAIL] {sid}: {d.get('task_status_msg','')}")
                    del pending[sid]
                else:
                    print(f"  [WAIT] {sid}: {status}", end="\r")
            except Exception as e:
                print(f"  [ERR] {sid}: {e}")
    if pending:
        print(f"\n  [TIMEOUT] {list(pending.keys())} — usando Ken Burns")

# ── STEP 4: Ken Burns fallback ────────────────────────────────
def ken_burns():
    for s in ALL_SCENES:
        clip = CLIPS_DIR / f"{s['id']}.mp4"
        img  = IMGS_DIR  / f"{s['id']}.png"
        if clip.exists() or not img.exists():
            continue
        dur = s["duration"]
        fps = 25
        print(f"  [KB] {s['id']}...", end=" ", flush=True)
        cmd = [
            FFMPEG, "-y", "-loop","1","-i",str(img),
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
        print("OK" if r.returncode==0 else f"ERR {r.stderr[-150:]}")

# ── STEP 5: TTS Narration ──────────────────────────────────────
def gen_audio():
    out = AUDIO_DIR / "narration.mp3"
    if out.exists():
        print(f"\n[5] [SKIP] narration.mp3 ja existe")
        return
    print("\n[5] Gerando narracao TTS...", end=" ", flush=True)
    r = requests.post(
        "https://api.openai.com/v1/audio/speech",
        headers=oai_headers(), verify=False,
        json={"model":"tts-1-hd","input":NARRATION,"voice":"shimmer","speed":0.93,"response_format":"mp3"},
        timeout=180,
    )
    r.raise_for_status()
    out.write_bytes(r.content)
    print(f"OK ({len(r.content)//1024}KB)")

# ── STEP 6: Assemble ──────────────────────────────────────────
def build_text_filters():
    filters = []
    t = 0.0
    for s in ALL_SCENES:
        txt = s.get("text","")
        if txt and (CLIPS_DIR/f"{s['id']}.mp4").exists():
            lines = txt.split("\n")
            end = t + s["duration"] - 0.4
            y0 = 1560
            for li, line in enumerate(lines):
                safe = (line.replace("\\","\\\\").replace("'","\\'")
                        .replace(":","\\:").replace(",","\\,")
                        .replace("[","\\[").replace("]","\\]"))
                y = y0 + li*70
                fi = t+0.4; fo = end-0.4
                filters.append(
                    f"drawtext=fontfile='C\\:/Windows/Fonts/georgia.ttf'"
                    f":text='{safe}':fontsize=46:fontcolor=white"
                    f":x=(w-text_w)/2:y={y}"
                    f":shadowcolor=black@0.85:shadowx=2:shadowy=3"
                    f":enable='between(t,{t:.2f},{end:.2f})'"
                    f":alpha='if(lt(t,{fi:.2f}),(t-{t:.2f})/0.4,"
                    f"if(gt(t,{fo:.2f}),({end:.2f}-t)/0.4,1))'"
                )
        t += s["duration"]
    return filters

def assemble():
    print("\n[6] Montando video final...")
    ken_burns()  # fallback for any missing clips

    clips = [CLIPS_DIR/f"{s['id']}.mp4" for s in ALL_SCENES
             if (CLIPS_DIR/f"{s['id']}.mp4").exists()]
    if not clips:
        print("  ERR: sem clips"); return

    concat = BASE_DIR/"concat.txt"
    with open(concat,"w") as f:
        for c in clips:
            f.write(f"file '{str(c).replace(chr(92),chr(47))}'\n")

    raw = OUT_DIR/"raw.mp4"
    print(f"  Concatenando {len(clips)} clips...")
    r = subprocess.run([
        FFMPEG,"-y","-f","concat","-safe","0","-i",str(concat),
        "-vf","scale=1080:1920:force_original_aspect_ratio=decrease,"
              "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v","libx264","-preset","fast","-pix_fmt","yuv420p",str(raw),
    ], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ERR concat: {r.stderr[-300:]}"); return
    print("  [OK] clips concatenados")

    filters = build_text_filters()
    vf = ",".join(filters) if filters else "null"
    audio = AUDIO_DIR/"narration.mp3"
    final = OUT_DIR/"vsl_final_9x16.mp4"

    print("  Adicionando audio + legendas...")
    cmd = [FFMPEG,"-y","-i",str(raw)]
    if audio.exists(): cmd += ["-i",str(audio)]
    cmd += ["-vf",vf,"-c:v","libx264","-preset","medium","-crf","17",
            "-c:a","aac","-b:a","192k","-pix_fmt","yuv420p"]
    if audio.exists(): cmd += ["-map","0:v","-map","1:a","-shortest"]
    cmd.append(str(final))

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ERR final: {r.stderr[-400:]}"); return
    print(f"  [OK] {final} ({final.stat().st_size//1024//1024}MB)")

    # 4:5
    f45 = OUT_DIR/"vsl_final_4x5.mp4"
    subprocess.run([FFMPEG,"-y","-i",str(final),"-vf","crop=1080:1350:0:285",
                    "-c:v","libx264","-preset","fast","-crf","17","-c:a","copy",str(f45)],
                   capture_output=True)
    print(f"  [OK] {f45}")

    # Hook 25s
    hook = OUT_DIR/"vsl_hook_25s.mp4"
    subprocess.run([FFMPEG,"-y","-i",str(final),"-t","25","-c","copy",str(hook)],
                   capture_output=True)
    print(f"  [OK] {hook}")

    raw.unlink(missing_ok=True)
    concat.unlink(missing_ok=True)

    print(f"\n{'='*50}")
    print(f"  VSL PRONTA!")
    print(f"  9:16  -> {final}")
    print(f"  4:5   -> {f45}")
    print(f"  Hook  -> {hook}")
    print(f"{'='*50}")

# ── MAIN ──────────────────────────────────────────────────────
if __name__ == "__main__":
    print("="*50)
    print("  Fix & Finish — VSL Madam Aurora")
    print("="*50)

    gen_missing_images()
    task_ids = submit_kling_missing()
    poll_kling(task_ids)
    gen_audio()
    assemble()
