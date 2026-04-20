"""
Meta Ads — Upload completo da campanha Madam Aurora
Estrutura: Campanha → 2 Ad Sets → 5 Criativos → Anúncios
"""
import requests
import json
import time
from pathlib import Path

TOKEN = "EAASYamalEPMBRHYKVJUNxu3icaIGHYZB4y9Vu2rOxRoBdZCrLRQDL5G47apXwm91OJ46gWZAAwal8zZCBCIpekvdwPZBwwGuLBjtF88ShmRznljDoZAr8x1rJV6RRoHlWZCMxpVlGlKviZCkqAoSwQmYhnTR9AjML9veuMqz0TNJ9WVZBDikz2ARzOrqWjBylP198CB4d2eVpbTLxej5Y6uGsrTuFspnNQCILFxvdwGXkCvaZBOnPZAB8myzZC4FaiGSV5KMFvnGNLLv7iZBxfi4njt2o1X9rqIVg9bt3h87ZC9ZBZAsU47BLHSCWFfTJmgDUQEt4YHT6NzxmLznQhK2RxPs3jAubAZDZD"
AD_ACCOUNT = "act_669757726130901"
PAGE_ID = "1003865519465291"
BASE_URL = "https://graph.facebook.com/v21.0"

VSL_9x16 = Path(__file__).parent / "output" / "vsl_final_9x16.mp4"
VSL_4x5  = Path(__file__).parent / "output" / "vsl_final_4x5.mp4"
HOOK_25s = Path(__file__).parent / "output" / "vsl_hook_25s.mp4"

RESULTS = {}

def api(method, endpoint, **kwargs):
    url = f"{BASE_URL}/{endpoint}"
    params = kwargs.get("params", {})
    params["access_token"] = TOKEN
    kwargs["params"] = params
    r = getattr(requests, method)(url, **kwargs)
    return r.json()

def check(result, label):
    if "id" in result:
        print(f"  [OK] {label}: {result['id']}")
        return result["id"]
    else:
        print(f"  [ERR] {label}: {result.get('error', {}).get('message', result)}")
        return None

# ──────────────────────────────────────────────
# 1. CAMPANHA
# ──────────────────────────────────────────────
def create_campaign():
    print("\n[1] Criando campanha...")
    result = api("post", f"{AD_ACCOUNT}/campaigns", data={
        "name": "Madam Aurora — Leitura de Palma US",
        "objective": "OUTCOME_LEADS",
        "status": "PAUSED",
        "special_ad_categories": "[]",
        "is_adset_budget_sharing_enabled": "false",
    })
    cid = check(result, "Campanha")
    RESULTS["campaign_id"] = cid
    return cid

# ──────────────────────────────────────────────
# 2. AD SETS
# ──────────────────────────────────────────────
def create_adset_cold(campaign_id):
    print("\n[2a] Criando Ad Set A — Interesse (Fria)...")
    result = api("post", f"{AD_ACCOUNT}/adsets", data={
        "name": "Ad Set A — Interesse Espiritualidade US",
        "campaign_id": campaign_id,
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "LEAD_GENERATION",
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
        "daily_budget": "3500",  # R$35/dia
        "targeting": json.dumps({
            "geo_locations": {"countries": ["US"]},
            "age_min": 28,
            "age_max": 52,
            "genders": [2],
            "interests": [
                {"id": "6003139266461", "name": "Tarot"},
                {"id": "6003384798450", "name": "Astrology"},
                {"id": "6003432366085", "name": "Spirituality"},
                {"id": "6002925780132", "name": "Palm reading"},
                {"id": "6003256289611", "name": "Numerology"},
                {"id": "6003219148536", "name": "Law of attraction"},
            ],
        }),
        "status": "PAUSED",
    })
    asid = check(result, "Ad Set A")
    RESULTS["adset_cold"] = asid
    return asid

def create_adset_retargeting(campaign_id):
    print("\n[2b] Criando Ad Set C — Retargeting...")
    result = api("post", f"{AD_ACCOUNT}/adsets", data={
        "name": "Ad Set C — Retargeting 30d",
        "campaign_id": campaign_id,
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "LEAD_GENERATION",
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
        "daily_budget": "1500",  # R$15/dia
        "targeting": json.dumps({
            "geo_locations": {"countries": ["US"]},
            "age_min": 28,
            "age_max": 52,
            "genders": [2],
        }),
        "status": "PAUSED",
    })
    asid = check(result, "Ad Set C")
    RESULTS["adset_retargeting"] = asid
    return asid

# ──────────────────────────────────────────────
# 3. UPLOAD DE VÍDEO
# ──────────────────────────────────────────────
def upload_video(path, name):
    print(f"\n[3] Uploading vídeo: {name} ({path.stat().st_size//1024//1024}MB)...")
    with open(path, "rb") as f:
        result = api("post", f"{AD_ACCOUNT}/advideos",
            data={"name": name, "title": name},
            files={"source": (path.name, f, "video/mp4")},
        )
    vid = check(result, f"Vídeo {name}")
    if not vid:
        return None

    # Aguardar processamento
    print(f"  Aguardando processamento...", end="", flush=True)  # noqa
    for _ in range(30):
        time.sleep(10)
        st = api("get", vid, params={"fields": "status"})
        status = st.get("status", {}).get("video_status", "unknown")
        print(f" {status}", end="", flush=True)
        if status == "ready":
            print()
            return vid
    print("\n  (timeout — usando assim mesmo)")
    return vid

# ──────────────────────────────────────────────
# 4. CRIATIVOS
# ──────────────────────────────────────────────
CREATIVES = [
    {
        "name": "Creative 01 — Hook Emocional Timing",
        "video_key": "vsl_9x16",
        "headline": "Your palm has been trying to tell you something.",
        "body": """If love keeps feeling like it's always almost there — your palm may explain why.

There's a line on your palm called the heart line. And alongside it, small lines that show how you approach emotional commitment.

Together, they reveal a pattern that most people live with for years without ever naming it.

Madam Aurora reads these lines using AI — not vague predictions, but specific pattern recognition based on your actual hand.

You upload a photo. You answer 7 questions. You receive a personalized reading in minutes.

The preview is free to start.

↓ See what your palm shows""",
        "link": "https://madam-aurora.co?utm_source=meta&utm_medium=paid&utm_content=creative01&angle=A",
        "cta": "LEARN_MORE",
        "description": "AI palm reading focused on love timing and heart line patterns. Free to begin.",
    },
    {
        "name": "Creative 02 — Hook Padrão Repetição",
        "video_key": "vsl_9x16",
        "headline": "Why do you keep attracting the same person?",
        "body": """You keep attracting the same kind of person. Your palm explains why.

It's not about luck. It's not about "choosing wrong."

There's a specific pattern visible in your heart line — and in the small lines on the outer edge of your palm — that shows how you've been approaching emotional commitment since before your first serious relationship.

Madam Aurora reads these patterns using AI palmistry.

Upload a photo of your palm. Answer 7 questions. Receive a personalized reading in minutes.

Most women who try it say the same thing: "How did it know that?"

Free to begin. No account required.

↓ Read my palm""",
        "link": "https://madam-aurora.co?utm_source=meta&utm_medium=paid&utm_content=creative02&angle=B",
        "cta": "LEARN_MORE",
        "description": "Your palm lines show the emotional pattern. AI palmistry. Free to start.",
    },
    {
        "name": "Creative 03 — Hook Curiosidade POV",
        "video_key": "hook_25s",
        "headline": '"How did it know that?" — AI palm reading.',
        "body": """I didn't expect an AI palm reading to be this accurate.

I uploaded a photo of my hand. Answered 7 questions. And within minutes, Madam Aurora described something I'd never said out loud to anyone.

She talked about my heart line — the way it curves, what that says about how I give love. Then the marriage lines. Two of them. What each one tends to mean.

And then something about timing that I wasn't ready to hear. But needed to.

I'm not someone who "believes in this stuff." But this felt less like prediction and more like pattern recognition. Like someone had finally named the thing I'd been circling for years.

The preview is free. No account. No subscription. Just your palm, your questions, and a reading that might say something you needed to hear.

madam-aurora.co""",
        "link": "https://madam-aurora.co?utm_source=meta&utm_medium=paid&utm_content=creative03&angle=C",
        "cta": "LEARN_MORE",
        "description": "Upload your palm. Answer 7 questions. Receive your personalized reading. Free to begin.",
    },
    {
        "name": "Creative 04 — Prova Social Retargeting",
        "video_key": "vsl_4x5",
        "headline": '"38, two failed relationships. Her palm said she hadn\'t met him yet."',
        "body": """She came to us convinced her timing had passed.

38 years old. Two long relationships that didn't lead to commitment. She called herself "probably not the marrying type."

Her palm showed something different.

Deep heart line — the kind that appears in women who love completely. Marriage lines showing two significant connections. The second one unwritten.

We told her what we saw. Six weeks later she wrote back. She had met someone. She wasn't sure where it was going — but she'd stopped closing doors she'd already decided were shut.

That's what a reading does. It doesn't change what happens. It changes how you meet what comes.

If you've been protecting yourself from something that might actually be yours — your reading is waiting.

Free to begin. madam-aurora.co""",
        "link": "https://madam-aurora.co?utm_source=meta&utm_medium=paid&utm_content=creative04&retargeting=1",
        "cta": "LEARN_MORE",
        "description": "Madam Aurora — AI palm reading for love timing and emotional patterns. Free to start.",
    },
]

def create_creative(c, video_id):
    result = api("post", f"{AD_ACCOUNT}/adcreatives", data={
        "name": c["name"],
        "object_story_spec": json.dumps({
            "page_id": PAGE_ID,
            "video_data": {
                "video_id": video_id,
                "message": c["body"],
                "title": c["headline"],
                "call_to_action": {
                    "type": c["cta"],
                    "value": {"link": c["link"]},
                },
                "link_description": c["description"],
            },
        }),
    })
    return check(result, f"Creative: {c['name']}")

# ──────────────────────────────────────────────
# 5. ANÚNCIOS
# ──────────────────────────────────────────────
def create_ad(name, adset_id, creative_id):
    result = api("post", f"{AD_ACCOUNT}/ads", data={
        "name": name,
        "adset_id": adset_id,
        "creative": json.dumps({"creative_id": creative_id}),
        "status": "PAUSED",
    })
    return check(result, f"Ad: {name}")

# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  Meta Ads Upload — Madam Aurora")
    print("=" * 55)

    # 1. Campanha (já criada via curl)
    campaign_id = "6984971035389"
    RESULTS["campaign_id"] = campaign_id
    print(f"\n[1] Campanha existente: {campaign_id}")

    # 2. Ad Sets
    adset_cold = create_adset_cold(campaign_id)
    adset_retarg = create_adset_retargeting(campaign_id)

    # 3. Upload vídeos
    print("\n[3] Uploading vídeos...")
    vid_9x16 = upload_video(VSL_9x16, "Madam Aurora VSL 9x16")
    vid_4x5  = upload_video(VSL_4x5,  "Madam Aurora VSL 4x5")
    vid_hook = upload_video(HOOK_25s, "Madam Aurora Hook 25s")

    VIDEO_MAP = {
        "vsl_9x16": vid_9x16,
        "vsl_4x5":  vid_4x5,
        "hook_25s": vid_hook,
    }

    # 4. Criativos + Anúncios
    print("\n[4] Criando criativos e anúncios...")
    for c in CREATIVES:
        vid_id = VIDEO_MAP.get(c["video_key"])
        if not vid_id:
            print(f"  ! Pulando {c['name']} — vídeo não disponível")
            continue

        creative_id = create_creative(c, vid_id)
        if not creative_id:
            continue

        # Escolher ad set por criativo
        if "Retargeting" in c["name"]:
            target_adset = adset_retarg
        else:
            target_adset = adset_cold

        if target_adset:
            create_ad(c["name"].replace("Creative", "Ad"), target_adset, creative_id)

    # Salvar IDs
    output = Path(__file__).parent / "meta_campaign_ids.json"
    with open(output, "w") as f:
        json.dump(RESULTS, f, indent=2)

    print(f"\n{'='*55}")
    print(f"  CAMPANHA CRIADA (status: PAUSED)")
    print(f"  IDs salvos em: meta_campaign_ids.json")
    print(f"  Acesse: business.facebook.com → Ads Manager")
    print(f"  Revise e ative manualmente quando pronto.")
    print(f"{'='*55}")

if __name__ == "__main__":
    main()
