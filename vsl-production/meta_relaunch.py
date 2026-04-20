import httpx, base64, json, time
from pathlib import Path

TOKEN = 'EAASYamalEPMBRA9QDOCfdXVf48orV20qSMsYcHWqXVOBpfie9ZAY6hJRfgXp1yk9ZCwhOoAx3o6dqBKHfH92s329j1XNeLSz14hUNgEVfD8qR0cg9yVZAVKIzdmGtXQS3fhsBCHZBUGG9vfkBR3uhAMDZAqcJLiOXDgljMnd4fvejcujimLPMGVlwyaM35FQQVCuhhcICbaE87EqZCnLR9FDQbKNxyGT5UiyPF8nRSSpBdfa2o7rxZCtO1DY0GdQ0GOjSHBoGUDkKNXxiUIUeQZBzDjmDwovUoI9UWZAYZBeZC7tFtqXYBO8ZAZAxJ62jyj5XGPOra2SV2J6dEbA2RGgoPqLFlgZDZD'
API     = 'https://graph.facebook.com/v20.0'
ACCOUNT = 'act_1597807197993217'
PAGE_ID = '1003865519465291'
FINAL   = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/scenes/ad_images_v2/final')
VIDS    = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/output')
ADSET_A = '120242749483460345'
ADSET_B = '120242749483750345'
LINK_A  = 'https://madam-aurora.co/?focus=marriage'
LINK_B  = 'https://madam-aurora.co/?focus=love'

def upload_img(path):
    with open(path, 'rb') as f:
        data = base64.b64encode(f.read()).decode()
    r = httpx.post(f'{API}/{ACCOUNT}/adimages',
        params={'access_token': TOKEN},
        data={'bytes': data, 'name': path.name}, timeout=60)
    return list(r.json()['images'].values())[0]['hash']

def upload_vid(path):
    print(f'  uploading {path.name}... ', end='', flush=True)
    with open(path, 'rb') as f:
        r = httpx.post(f'https://graph-video.facebook.com/v20.0/{ACCOUNT}/advideos',
            params={'access_token': TOKEN, 'title': path.stem},
            files={'source': (path.name, f, 'video/mp4')}, timeout=300)
    vid_id = r.json()['id']
    for _ in range(30):
        time.sleep(6)
        s = httpx.get(f'{API}/{vid_id}', params={'access_token': TOKEN, 'fields': 'status'}, timeout=30).json()
        st = s.get('status', {}).get('video_status', '')
        print(f'{st} ', end='', flush=True)
        if st == 'ready':
            break
    print(f'-> {vid_id}')
    return vid_id

def img_creative(name, img_hash, msg, hl, desc, link):
    r = httpx.post(f'{API}/{ACCOUNT}/adcreatives',
        params={'access_token': TOKEN},
        data={'name': name, 'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'link_data': {'image_hash': img_hash, 'link': link, 'message': msg,
                'name': hl, 'description': desc,
                'call_to_action': {'type': 'LEARN_MORE'}}})}, timeout=30)
    d = r.json()
    if 'error' in d:
        raise Exception(d['error'])
    return d['id']

def vid_creative(name, vid_id, thumb, msg, hl, link):
    r = httpx.post(f'{API}/{ACCOUNT}/adcreatives',
        params={'access_token': TOKEN},
        data={'name': name, 'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'video_data': {'video_id': vid_id, 'image_hash': thumb, 'message': msg, 'title': hl,
                'call_to_action': {'type': 'LEARN_MORE', 'value': {'link': link}}}})}, timeout=30)
    d = r.json()
    if 'error' in d:
        raise Exception(d['error'])
    return d['id']

def make_ad(name, adset_id, creative_id):
    r = httpx.post(f'{API}/{ACCOUNT}/ads',
        params={'access_token': TOKEN},
        data={'name': name, 'adset_id': adset_id,
            'creative': json.dumps({'creative_id': creative_id}), 'status': 'ACTIVE'}, timeout=30)
    d = r.json()
    if 'error' in d:
        raise Exception(d['error'])
    return d['id']

print('=== MADAM AURORA — RELAUNCH ===\n')

print('[1] Uploading images...')
imgs = {}
for f in sorted(FINAL.glob('*.png')):
    imgs[f.name] = upload_img(f)
    print(f'  {f.name} -> {imgs[f.name][:8]}')

print('\n[2] Uploading thumbnails...')
th1 = upload_img(VIDS / 'thumb_hook.jpg')
th2 = upload_img(VIDS / 'thumb_4x5.jpg')
print(f'  hook thumb: {th1[:8]}')
print(f'  vsl thumb:  {th2[:8]}')

print('\n[3] Uploading videos...')
vid_hook = upload_vid(VIDS / 'vsl_hook_25s.mp4')
vid_vsl  = upload_vid(VIDS / 'vsl_kling_clean_9x16.mp4')

ADS = [
    (ADSET_A, '01_mechanism.png', LINK_A,
     "Your palm has always held the answer. The marriage line doesn't just show who — it shows when, and why timing keeps shifting. A free palm reading reveals what's been waiting to surface.",
     'Your Marriage Line Knows', "Read yours — it's free"),
    (ADSET_A, '03_timing.png', LINK_A,
     "There's a reason some connections feel almost ready for years. Timing in love follows a pattern your palm has mapped from the start. Find out where you are in that cycle.",
     'Why Love Feels Delayed', 'See your timing now'),
    (ADSET_A, '05_spiritual.png', LINK_A,
     "The lines in your palm were formed before you ever experienced heartbreak. They carry a pattern that explains the waiting, the almost-relationships. Your free reading starts here.",
     'What Your Lines Carry', 'Free personalized reading'),
    (ADSET_A, '06_timing_window.png', LINK_A,
     "She almost dismissed it as curiosity. Then her reading described the exact emotional pattern she had been living for 6 years. Sometimes the clearest mirror is the one you were born with.",
     'Your Palm Sees It Too', 'Upload yours — free'),
    (ADSET_A, '10_awareness.png', LINK_A,
     "No two palms tell the same story. The marriage line, heart line, and fate line form a picture that is entirely yours — not a horoscope written for millions.",
     'Yours Is Different', 'Get your free reading'),
    (ADSET_A, '04_social_proof.png', LINK_A,
     "I have done birth charts, tarot, everything. Nothing clicked like this. The reading described my relationship pattern so accurately I had to put my phone down. — Rachel, 41, Tennessee.",
     "She Didn't Expect This", 'Start yours free today'),
    (ADSET_B, '02_pattern.png', LINK_B,
     "If you keep ending up in the same kind of relationship — different person, same feeling — that is not a coincidence. It is a pattern. And patterns leave traces. Your palm is one of them.",
     'Same Pattern, New Person?', 'Find out why — free'),
    (ADSET_B, '07_curiosity.png', LINK_B,
     "She was not looking for magic. She was exhausted from repeating the same emotional loop. The reading gave her a word for something she had never been able to explain. That was enough.",
     'She Just Needed Clarity', "Your turn — it's free"),
    (ADSET_B, '08_skeptic.png', LINK_B,
     "I am not the type to believe in this. But I tried it. I had to stop reading halfway through because it described something I had never told anyone. Your skepticism is welcome here.",
     "I Didn't Believe It Either", 'See what yours says'),
    (ADSET_B, '04_social_proof.png', LINK_B,
     "I spent years in therapy trying to understand why I always chose emotionally unavailable men. The palm reading named the pattern in three sentences. — Dana, 38, Oregon.",
     'Three Sentences Changed It', 'Read yours free today'),
]

print('\n[4] Creating image ads...')
for adset, fname, link, msg, hl, desc in ADS:
    try:
        cid = img_creative(f'[v2] {fname}', imgs[fname], msg, hl, desc, link)
        aid = make_ad(f'[v2] {fname}', adset, cid)
        print(f'  OK {fname} -> ad={aid}')
    except Exception as e:
        print(f'  ERR {fname}: {e}')

print('\n[5] Creating video ads...')
VIDEO_ADS = [
    (ADSET_A, LINK_A, vid_hook, th1, 'A-hook',
     "Most women in their 30s and 40s have never had their marriage line explained — specific to their hand, their pattern, their moment. This reading does that. It is free.",
     'The Answer Is In Your Hand'),
    (ADSET_A, LINK_A, vid_vsl, th2, 'A-vsl',
     "If love has felt like a cycle you cannot break — or timing that never lines up — your palm may hold the pattern behind it. This free reading was built for exactly that moment.",
     'Why Love Keeps Stalling'),
    (ADSET_B, LINK_B, vid_hook, th1, 'B-hook',
     "The same relationship pattern showing up in different people is not a coincidence. It is a cycle — and your palm holds the map to understanding why it keeps repeating. Free, 2 minutes.",
     'Why It Keeps Repeating'),
    (ADSET_B, LINK_B, vid_vsl, th2, 'B-vsl',
     "If the pattern in your relationships feels bigger than any one person, it probably is. Your palm reflects the emotional cycle you keep returning to. Understanding it is the first step out.",
     "The Pattern Isn't Random"),
]

for adset, link, vid_id, thumb, label, msg, hl in VIDEO_ADS:
    try:
        cid = vid_creative(f'[v2] {label}', vid_id, thumb, msg, hl, link)
        aid = make_ad(f'[v2] {label}', adset, cid)
        print(f'  OK {label} -> ad={aid}')
    except Exception as e:
        print(f'  ERR {label}: {e}')

print('\n=== DONE — campanha ativa com todos os ads v2 ===')
