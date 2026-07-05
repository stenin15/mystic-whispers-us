"""
Re-submete TODAS as cenas ao Kling AI e aguarda completar.
Salva task IDs em kling_tasks.json para retomar se interrompido.
"""
import os, json, time, base64, requests
from pathlib import Path
import jwt as pyjwt
import urllib3
urllib3.disable_warnings()

from env_loader import require_env

KLING_AK = require_env("KLING_ACCESS_KEY")
KLING_SK = require_env("KLING_SECRET_KEY")

BASE_DIR   = Path(__file__).parent
IMGS_SMALL = BASE_DIR / "scenes" / "images_small"
CLIPS_DIR  = BASE_DIR / "scenes" / "clips_kling"
TASKS_FILE = BASE_DIR / "kling_tasks.json"
CLIPS_DIR.mkdir(parents=True, exist_ok=True)

ALL_SCENES = [
    {"id":"00_silence",       "duration":3,  "kling":"Palm slowly coming into focus from blur, warm golden candlelight, cinematic slow zoom in, mystical atmosphere"},
    {"id":"01_hook_line1",    "duration":7,  "kling":"Close up of a female hand with delicate lines, finger gently traces the heart line, warm golden glow emanating from the line, slow intimate motion"},
    {"id":"02_hook_line2",    "duration":8,  "kling":"Two hands side by side on dark velvet, golden light slowly illuminates the heart lines on both palms, gentle camera glide"},
    {"id":"03_hook_punch",    "duration":9,  "kling":"Open palm slowly extends toward camera, divine golden light reveals intricate lines, slow dramatic zoom out, cinematic"},
    {"id":"04_problem1",      "duration":11, "kling":"A woman in soft focus gazes at a window, warm afternoon light shifts slowly across her face, gentle melancholy, handheld subtle drift"},
    {"id":"05_problem2",      "duration":11, "kling":"Abstract golden particles float and drift in deep purple darkness, slow swirling motion, ethereal and emotional"},
    {"id":"06_pattern_reveal","duration":10, "kling":"Heart line on palm slowly glows gold, the illumination travels along the line, mystical energy reveal, dark background"},
    {"id":"07_heartline",     "duration":10, "kling":"Macro camera slowly slides along the heart line of a palm, warm golden backlight, soft focus bokeh, intimate and mysterious"},
    {"id":"08_marriagelines", "duration":10, "kling":"Camera gently zooms into the marriage lines on the outer edge of a palm, golden spotlight, dark mystical background, slow push"},
    {"id":"09_timing_window", "duration":11, "kling":"An hourglass with golden sand falling in slow motion, warm light glows through the glass, ethereal and timeless"},
    {"id":"10_proof_story",   "duration":15, "kling":"Two hands rest on a dark wooden table near a flickering candle, warm intimate light, slow gentle push in, cinematic"},
    {"id":"11_proof_result",  "duration":10, "kling":"A woman holds a phone and reads with a calm meaningful smile, warm golden light, soft focus background, gentle camera drift"},
    {"id":"12_product",       "duration":14, "kling":"A glowing phone screen in darkness shows a mystical UI, golden elements fade in softly, slow reveal, elegant interface"},
    {"id":"13_cta",           "duration":13, "kling":"A palm slowly opens upward toward camera, divine golden light floods in from above, breathtaking slow motion reveal"},
    {"id":"14_close",         "duration":7,  "kling":"Palm silhouette fades gracefully into warm darkness, golden light dims to black, cinematic fade out, peaceful ending"},
]

def kling_token():
    now = int(time.time())
    payload = {"iss": KLING_AK, "exp": now + 1800, "nbf": now - 5}
    return pyjwt.encode(payload, KLING_SK, algorithm="HS256")

def submit_scene(scene):
    img_path = IMGS_SMALL / f"{scene['id']}.jpg"
    if not img_path.exists():
        print(f"  [SKIP] Imagem nao encontrada: {img_path.name}")
        return None

    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    payload = {
        "model_name": "kling-v2-pro",
        "image": b64,
        "prompt": scene["kling"],
        "duration": min(scene["duration"], 10),
        "aspect_ratio": "9:16",
        "mode": "pro",
        "cfg_scale": 0.5,
    }

    r = requests.post(
        "https://api.klingai.com/v1/videos/image2video",
        headers={"Authorization": f"Bearer {kling_token()}", "Content-Type": "application/json"},
        json=payload,
        verify=False,
        timeout=30,
    )
    data = r.json()
    if data.get("code") == 0:
        task_id = data["data"]["task_id"]
        print(f"  [OK] {scene['id']} → task {task_id}")
        return task_id
    else:
        print(f"  [ERR] {scene['id']}: {data.get('message', data)}")
        return None

def check_task(task_id):
    r = requests.get(
        f"https://api.klingai.com/v1/videos/image2video/{task_id}",
        headers={"Authorization": f"Bearer {kling_token()}"},
        verify=False,
        timeout=15,
    )
    data = r.json()
    if data.get("code") == 0:
        task = data["data"]
        status = task.get("task_status", "unknown")
        videos = task.get("task_result", {}).get("videos", [])
        url = videos[0].get("url", "") if videos else ""
        return status, url
    return "error", ""

def download_clip(url, scene_id):
    out = CLIPS_DIR / f"{scene_id}.mp4"
    r = requests.get(url, stream=True, verify=False, timeout=60)
    with open(out, "wb") as f:
        for chunk in r.iter_content(8192):
            f.write(chunk)
    sz = out.stat().st_size // 1024
    print(f"  [DL] {scene_id}.mp4 ({sz}KB)")
    return out

def load_tasks():
    if TASKS_FILE.exists():
        return json.loads(TASKS_FILE.read_text())
    return {}

def save_tasks(tasks):
    TASKS_FILE.write_text(json.dumps(tasks, indent=2))

def main():
    print("=" * 55)
    print("  Kling AI — Re-run Completo")
    print("=" * 55)

    tasks = load_tasks()

    # FASE 1: Submeter cenas que ainda nao tem task
    print("\n[FASE 1] Submetendo cenas...")
    for scene in ALL_SCENES:
        sid = scene["id"]
        clip_done = (CLIPS_DIR / f"{sid}.mp4").exists()
        if clip_done:
            print(f"  [SKIP] {sid} — clip já existe")
            continue
        if sid in tasks:
            print(f"  [SKIP] {sid} — task {tasks[sid]} já enviado")
            continue
        task_id = submit_scene(scene)
        if task_id:
            tasks[sid] = task_id
            save_tasks(tasks)
        time.sleep(1.5)  # Rate limit

    # FASE 2: Polling até todos completarem
    print(f"\n[FASE 2] Aguardando {len(tasks)} tasks...")
    pending = {sid: tid for sid, tid in tasks.items()
               if not (CLIPS_DIR / f"{sid}.mp4").exists()}

    max_wait = 40 * 60  # 40 minutos
    start = time.time()
    poll_interval = 20

    while pending and (time.time() - start) < max_wait:
        done_this_round = []
        for sid, tid in list(pending.items()):
            status, url = check_task(tid)
            elapsed = int(time.time() - start)
            print(f"  [{elapsed:4d}s] {sid}: {status}")

            if status == "succeed" and url:
                download_clip(url, sid)
                done_this_round.append(sid)
            elif status in ("failed", "error"):
                print(f"  [FAIL] {sid} — submetendo novamente...")
                scene = next(s for s in ALL_SCENES if s["id"] == sid)
                new_id = submit_scene(scene)
                if new_id:
                    tasks[sid] = new_id
                    pending[sid] = new_id
                    save_tasks(tasks)
                done_this_round.append(sid)  # remove do pending mesmo assim

        for sid in done_this_round:
            pending.pop(sid, None)

        if pending:
            print(f"  Aguardando {len(pending)} restantes... ({poll_interval}s)")
            time.sleep(poll_interval)

    # Resultado
    completed = list(CLIPS_DIR.glob("*.mp4"))
    print(f"\n{'='*55}")
    print(f"  Clips Kling baixados: {len(completed)}/{len(ALL_SCENES)}")
    for c in sorted(completed):
        print(f"  - {c.name} ({c.stat().st_size//1024}KB)")
    print(f"\n  Clips em: {CLIPS_DIR}")
    print(f"{'='*55}")

    if len(completed) == len(ALL_SCENES):
        print("\n  Todos prontos! Rode assemble_final.py apontando para clips_kling/")

if __name__ == "__main__":
    main()
