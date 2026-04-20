"""
Madam Aurora — Meta Ads Campaign Creator
Cria campanha, 2 ad sets, faz upload de 10 imagens + 2 videos e sobe todos os ads.
"""
import httpx, base64, time, json, sys
from pathlib import Path

TOKEN   = 'EAASYamalEPMBRPqvcHKNbR78iWEYAOtBIfW9a8VIjjf4g48S9LpTSueUJtAyxcSwRuTbEE3OnTdo6KFHRTgaMV5JClIt6C8G1uUVbAXXExrsi0LclR7pght2QYUY0LLSrwF6eRQBCZCCPX0h7iDZCyZB4po0XP3PfZCkh7EfslfuPa6IPE5kvXUiOC2vtK2tDregmg7BPUa6S6UE1ZCZAgTCv2L7mARQsVOVayz6ZBdxpCZCvELeBicEZA3sbNMCynKcaqOYbxQznpwbM25nbQivjssB73R0GdZCMXTSCGOzp5XT4a5vDCbgR7Nx8zNvdL9axk4TQaigZAkdsYii6tpTz4udAZDZD'
ACCOUNT = 'act_1597807197993217'
PAGE_ID = '1003865519465291'
PIXEL   = '2758366157828192'
API     = 'https://graph.facebook.com/v20.0'
BASE    = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production')
IMGS    = BASE / 'scenes/ad_images_v2/final'
VIDS    = BASE / 'output'

def api(method, endpoint, **kwargs):
    url = f'{API}/{endpoint}'
    params = kwargs.pop('params', {})
    params['access_token'] = TOKEN
    r = getattr(httpx, method)(url, params=params, timeout=120, **kwargs)
    d = r.json()
    if 'error' in d:
        raise Exception(d['error'])
    return d

def upload_image(path):
    print(f'  img: {path.name}... ', end='', flush=True)
    with open(path, 'rb') as f:
        data = base64.b64encode(f.read()).decode()
    r = api('post', f'{ACCOUNT}/adimages', data={'bytes': data, 'name': path.name})
    h = list(r['images'].values())[0]['hash']
    print(f'OK hash={h[:8]}')
    return h

def upload_video(path):
    print(f'  video: {path.name}... ', end='', flush=True)
    with open(path, 'rb') as f:
        files = {'source': (path.name, f, 'video/mp4')}
        r = httpx.post(
            f'https://graph-video.facebook.com/v20.0/{ACCOUNT}/advideos',
            params={'access_token': TOKEN, 'title': path.stem},
            files=files, timeout=300
        )
    d = r.json()
    if 'error' in d: raise Exception(d['error'])
    vid_id = d['id']
    # aguarda processamento
    for _ in range(30):
        time.sleep(6)
        s = api('get', vid_id, params={'fields': 'status'})
        st = s.get('status', {}).get('video_status', '')
        print(f'{st} ', end='', flush=True)
        if st == 'ready': break
    print(f'OK id={vid_id}')
    return vid_id

def create_image_creative(name, img_hash, headline, message, link):
    r = api('post', f'{ACCOUNT}/adcreatives', data={
        'name': name,
        'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'link_data': {
                'image_hash': img_hash,
                'link': link,
                'message': message,
                'name': headline,
                'call_to_action': {'type': 'LEARN_MORE'}
            }
        })
    })
    return r['id']

def create_video_creative(name, video_id, headline, message, link, thumb_hash):
    r = api('post', f'{ACCOUNT}/adcreatives', data={
        'name': name,
        'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'video_data': {
                'video_id': video_id,
                'image_hash': thumb_hash,
                'message': message,
                'title': headline,
                'call_to_action': {'type': 'LEARN_MORE', 'value': {'link': link}}
            }
        })
    })
    return r['id']

def create_ad(name, adset_id, creative_id, status='PAUSED'):
    r = api('post', f'{ACCOUNT}/ads', data={
        'name': name,
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': status
    })
    return r['id']

# ── DEFINICOES ────────────────────────────────────────────────────────────────

LINK_A = 'https://madam-aurora.co/?focus=marriage'
LINK_B = 'https://madam-aurora.co/?focus=love'
MSG_A  = 'Discover what your palm reveals about your love life. Free palm reading — takes 3 minutes.'
MSG_B  = 'Your love patterns are written in your palm. Find out what they mean. Free reading.'

ADSET_A_IMGS = [
    {'file': '01_mechanism.png',   'headline': "There's a line on your palm that reveals how you love"},
    {'file': '03_timing.png',      'headline': 'Your love timing window may be open right now'},
    {'file': '05_spiritual.png',   'headline': "Your palm lines don't lie. They've been trying to tell you."},
    {'file': '06_timing_window.png','headline': 'Are you in a love timing window?'},
    {'file': '10_awareness.png',   'headline': 'What does your palm say about love?'},
    {'file': '04_social_proof.png','headline': '"She was 38 and thought her time had passed"'},
]
ADSET_B_IMGS = [
    {'file': '02_pattern.png',   'headline': 'Why does love always feel like this?'},
    {'file': '07_curiosity.png', 'headline': 'I finally understood why every relationship ended the same way'},
    {'file': '08_skeptic.png',   'headline': '"I didn\'t believe in palm reading either"'},
    {'file': '04_social_proof.png','headline': '"She was 38 and thought her time had passed"'},
]
VIDEOS = [
    {'file': 'vsl_hook_25s.mp4',         'thumb': 'thumb_hook.jpg',  'headline': 'Your palm reveals your love path — free reading'},
    {'file': 'vsl_kling_clean_9x16.mp4', 'thumb': 'thumb_4x5.jpg',  'headline': 'What your palm lines say about love'},
]

# ── MAIN ──────────────────────────────────────────────────────────────────────
print('\n=== MADAM AURORA — META CAMPAIGN BUILDER ===\n')

# 1. Campanha
print('[1] Criando campanha...')
camp = api('post', f'{ACCOUNT}/campaigns', data={
    'name': 'Madam Aurora — Launch Apr2026',
    'objective': 'OUTCOME_LEADS',
    'status': 'PAUSED',
    'special_ad_categories': '[]',
    'is_adset_budget_sharing_enabled': 'false',
})
CAMP_ID = camp['id']
print(f'    Campaign ID: {CAMP_ID}')

# 2. Ad Sets
print('\n[2] Criando ad sets...')
adset_cfg = {
    'campaign_id': CAMP_ID,
    'billing_event': 'IMPRESSIONS',
    'optimization_goal': 'OFFSITE_CONVERSIONS',
    'promoted_object': json.dumps({'pixel_id': PIXEL, 'custom_event_type': 'COMPLETE_REGISTRATION'}),
    'targeting': json.dumps({
        'geo_locations': {'countries': ['US']},
        'age_min': 28, 'age_max': 55,
        'genders': [2],
        'targeting_automation': {'advantage_audience': 0},
        'publisher_platforms': ['facebook', 'instagram'],
        'facebook_positions': ['feed', 'story'],
        'instagram_positions': ['stream', 'story', 'reels'],
    }),
    'daily_budget': 2700,  # R$50/dia ~= USD 9 / 2 adsets = ~$4.50 cada ~ 2700 centavos?
    # Ajuste: 50 BRL / 5.5 = ~9 USD total / 2 = 4.5 USD = 450 centavos cada
    'status': 'PAUSED',
    'start_time': '2026-04-15T00:00:00-0300',
}
# Corrigir budget: 50 BRL / 2 = 25 BRL ~ 4.5 USD = 450 centavos USD
adset_cfg['daily_budget'] = 2500  # R$25/dia por ad set (centavos BRL)
adset_cfg['bid_strategy'] = 'LOWEST_COST_WITHOUT_CAP'

adset_a = api('post', f'{ACCOUNT}/adsets', data={**adset_cfg, 'name': 'Ad Set A — Marriage & Timing'})
ADSET_A = adset_a['id']
print(f'    Ad Set A: {ADSET_A}')

adset_b = api('post', f'{ACCOUNT}/adsets', data={**adset_cfg, 'name': 'Ad Set B — Love Patterns'})
ADSET_B = adset_b['id']
print(f'    Ad Set B: {ADSET_B}')

# 3. Upload imagens
print('\n[3] Upload imagens...')
img_hashes = {}
all_files = set(i['file'] for i in ADSET_A_IMGS + ADSET_B_IMGS)
for fname in all_files:
    img_hashes[fname] = upload_image(IMGS / fname)

# 4. Upload thumbnails
print('\n[4] Upload thumbnails...')
thumb_hashes = {}
for v in VIDEOS:
    thumb_hashes[v['thumb']] = upload_image(VIDS / v['thumb'])

# 5. Upload videos
print('\n[5] Upload videos...')
video_ids = {}
for v in VIDEOS:
    video_ids[v['file']] = upload_video(VIDS / v['file'])

# 6. Criar criativos e ads — Ad Set A
print('\n[6] Criando ads — Ad Set A...')
for item in ADSET_A_IMGS:
    h = img_hashes[item['file']]
    cid = create_image_creative(f"A · {item['file']}", h, item['headline'], MSG_A, LINK_A)
    aid = create_ad(f"A · {item['file']}", ADSET_A, cid)
    print(f'    ad={aid} ({item["file"]})')

for v in VIDEOS:
    cid = create_video_creative(
        f"A · {v['file']}", video_ids[v['file']], v['headline'], MSG_A, LINK_A,
        thumb_hashes[v['thumb']]
    )
    aid = create_ad(f"A · {v['file']}", ADSET_A, cid)
    print(f'    ad={aid} ({v["file"]})')

# 7. Criar criativos e ads — Ad Set B
print('\n[7] Criando ads — Ad Set B...')
for item in ADSET_B_IMGS:
    h = img_hashes[item['file']]
    cid = create_image_creative(f"B · {item['file']}", h, item['headline'], MSG_B, LINK_B)
    aid = create_ad(f"B · {item['file']}", ADSET_B, cid)
    print(f'    ad={aid} ({item["file"]})')

for v in VIDEOS:
    cid = create_video_creative(
        f"B · {v['file']}", video_ids[v['file']], v['headline'], MSG_B, LINK_B,
        thumb_hashes[v['thumb']]
    )
    aid = create_ad(f"B · {v['file']}", ADSET_B, cid)
    print(f'    ad={aid} ({v["file"]})')

print(f'\n=== DONE ===')
print(f'Campaign: {CAMP_ID}')
print(f'Ad Set A: {ADSET_A}')
print(f'Ad Set B: {ADSET_B}')
print(f'Todos os ads em PAUSED — revise no Gerenciador e ative.')
