# -*- coding: utf-8 -*-
"""
Pipeline de criacao de criativos — Pet Nail Clipper LED
3 angulos: Medo / Mecanismo / Alivio
Modelo: Veo 3.1 (Google) via Replicate — maximo realismo + audio
"""
import replicate
import requests
import os
import time
from pathlib import Path

os.environ["REPLICATE_API_TOKEN"] = "r8_e91AziASL3aYSIB7GvolHWLmWRZcKnj05zwGi"

OUT = Path("C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/pet_clipper/videos")
OUT.mkdir(parents=True, exist_ok=True)

VIDEOS = [
    {
        "name": "v1_medo",
        "prompt": (
            "Vertical 9:16 cinematic ad video. Ultra realistic. "
            "SCENE 1 (0-3s): Extreme close-up of a trembling human hand holding nail clippers near a small dog paw. "
            "The dog pulls the paw back nervously. The owner hesitates. Tension music. "
            "SCENE 2 (3-6s): Cut to the owner's worried face looking down. "
            "Then a sleek modern pet nail clipper with a bright green LED light appears in frame. "
            "The LED shines through the dog nail, illuminating the blood vessel (the quick) in vivid red — "
            "showing exactly the safe cut line. "
            "SCENE 3 (6-8s): The owner's face transforms — relief and confidence. "
            "She makes a smooth, precise cut. The dog doesn't flinch. "
            "Both owner and dog relax. Warm golden light fills the frame. "
            "STYLE: Cinematic shallow depth of field, natural home lighting, photorealistic, "
            "premium product ad quality, not cheap or staged. "
            "AUDIO: soft ambient home sounds, quiet satisfying click of the clipper, gentle dog breathing."
        ),
        "negative_prompt": (
            "text, subtitles, watermark, cartoon, CGI, animation, low quality, blurry, "
            "cheap plastic, dropshipping aesthetic, fake, overexposed, cluttered background"
        ),
    },
    {
        "name": "v2_mecanismo",
        "prompt": (
            "Vertical 9:16 cinematic product demo video. Ultra realistic technical focus. "
            "SCENE 1 (0-2s): Extreme macro close-up. A dog nail fills the frame. "
            "A green LED light from a sleek clipper shines through the nail — "
            "the pink quick vein glows visibly inside the translucent nail. "
            "Text would say 'See exactly where to cut' but no text in video — show it visually. "
            "SCENE 2 (2-5s): The clipper is positioned precisely below the quick. "
            "Camera slowly orbits the nail. Clinical, precise, confident framing. "
            "The LED projects a faint safe-cut line. "
            "SCENE 3 (5-8s): Clean, confident snip. The nail segment falls away. "
            "Quick is untouched — no blood, no pain. "
            "Dog lifts paw calmly. Owner gives a satisfied exhale. "
            "Warm light. Dog wags tail. "
            "STYLE: Ultra macro photography, clinical to warm lighting transition, "
            "premium tech product feel, Apple-level product ad aesthetic. "
            "AUDIO: soft ambient, satisfying clean click of cut, happy tail wag sound."
        ),
        "negative_prompt": (
            "text, subtitles, watermark, cartoon, CGI, low quality, blurry, "
            "blood, injury, pain, cheap, plastic toy, cluttered"
        ),
    },
    {
        "name": "v3_alivio",
        "prompt": (
            "Vertical 9:16 cinematic emotional storytelling ad. Ultra realistic. "
            "BEFORE (0-3s): A woman sits on the floor with her medium-sized dog. "
            "She tries to cut the dog's nail with regular clippers. "
            "The dog squirms and pulls away. The owner looks frustrated, worried, defeated. "
            "Slightly cool, tense lighting. "
            "TRANSITION (3-4s): A sleek LED pet nail clipper enters frame, glowing softly. "
            "Warm light begins spreading. "
            "AFTER (4-8s): Same woman, same dog — completely different energy. "
            "The LED illuminates the nail, owner smiles confidently, dog is completely calm. "
            "She makes the cut smoothly. Dog doesn't flinch. "
            "She hugs the dog. Dog licks her face. "
            "Warm golden light. Slow cinematic push-in on both their happy faces. "
            "STYLE: Emotional storytelling, magazine-quality cinematography, "
            "real home environment, authentic emotional performances, not staged. "
            "AUDIO: ambient tension fades into warm music, soft dog breathing, happy moment sounds."
        ),
        "negative_prompt": (
            "text, subtitles, watermark, cartoon, CGI, animation, low quality, blurry, "
            "fake, overly staged, cheap, stock footage look, cluttered background"
        ),
    },
]


def download(url, path):
    r = requests.get(url, stream=True, timeout=120)
    with open(path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    size_mb = os.path.getsize(path) / 1024 / 1024
    print(f"  Salvo: {path} ({size_mb:.1f} MB)")


def generate_video(v, idx, total):
    print(f"\n{'='*55}")
    print(f"[{idx}/{total}] Gerando: {v['name'].upper()}")
    print(f"{'='*55}")

    start = time.time()

    output = replicate.run(
        "google/veo-3.1",
        input={
            "prompt": v["prompt"],
            "negative_prompt": v["negative_prompt"],
            "aspect_ratio": "9:16",
            "duration": 8,
            "resolution": "1080p",
            "generate_audio": True,
        }
    )

    elapsed = time.time() - start
    print(f"  Gerado em {elapsed:.0f}s")

    out_path = OUT / f"{v['name']}.mp4"

    if hasattr(output, 'url'):
        url = output.url
    elif isinstance(output, str):
        url = output
    else:
        url = str(output)

    print(f"  Baixando...")
    download(url, out_path)
    return out_path


def main():
    print("\nPIPELINE PET NAIL CLIPPER LED — VEO 3.1 1080p")
    print(f"Output: {OUT}\n")

    results = []
    for i, v in enumerate(VIDEOS, 1):
        try:
            path = generate_video(v, i, len(VIDEOS))
            results.append((v["name"], str(path), "OK"))
            if i < len(VIDEOS):
                print("  Aguardando 8s antes do proximo...")
                time.sleep(8)
        except Exception as e:
            print(f"  ERRO: {e}")
            results.append((v["name"], "", str(e)[:120]))

    print("\n" + "="*55)
    print("CONCLUIDO:")
    for name, path, status in results:
        icon = "OK" if status == "OK" else "ERRO"
        print(f"  [{icon}] {name}")
        if path:
            print(f"       {path}")


if __name__ == "__main__":
    main()
