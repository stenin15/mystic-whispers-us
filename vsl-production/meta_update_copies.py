"""
Atualiza os criativos dos ads com as copies geradas pelo agente paid-traffic
"""
import httpx, json

from env_loader import require_env

TOKEN   = require_env("META_ACCESS_TOKEN")
ACCOUNT = 'act_669757726130901'
PAGE_ID = '1003865519465291'
PIXEL   = '2164555847647961'
API     = 'https://graph.facebook.com/v20.0'
LINK_A  = 'https://madam-aurora.co/?focus=marriage'
LINK_B  = 'https://madam-aurora.co/?focus=love'

# Hashes e IDs do upload anterior
IMG = {
    '01_mechanism.png':    'cf146682',
    '03_timing.png':       '9a2dd0f1',
    '05_spiritual.png':    '3589298f',
    '06_timing_window.png':'484dd8ab',
    '10_awareness.png':    'ffb10f73',
    '04_social_proof.png': 'bb364f80',
    '02_pattern.png':      '34a82c59',
    '07_curiosity.png':    'e0d4dbcd',
    '08_skeptic.png':      '66b2767c',
}
VID = {
    'vsl_hook_25s.mp4':         '767418729641906',
    'vsl_kling_clean_9x16.mp4': '1789925241978281',
}
THUMB = {
    'thumb_hook.jpg': 'b4602d16',
    'thumb_4x5.jpg':  'e1443d2f',
}
ADSET_A = '120242749483460345'
ADSET_B = '120242749483750345'

def api(method, endpoint, **kwargs):
    url = f'{API}/{endpoint}'
    params = kwargs.pop('params', {})
    params['access_token'] = TOKEN
    r = getattr(httpx, method)(url, params=params, timeout=60, **kwargs)
    d = r.json()
    if 'error' in d:
        raise Exception(d['error'])
    return d

def img_creative(name, img_hash, message, headline, description, link):
    r = api('post', f'{ACCOUNT}/adcreatives', data={
        'name': name,
        'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'link_data': {
                'image_hash': img_hash,
                'link': link,
                'message': message,
                'name': headline,
                'description': description,
                'call_to_action': {'type': 'LEARN_MORE'}
            }
        })
    })
    return r['id']

def vid_creative(name, video_id, thumb_hash, message, headline, description, link):
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

def make_ad(name, adset_id, creative_id):
    r = api('post', f'{ACCOUNT}/ads', data={
        'name': name,
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': 'PAUSED'
    })
    return r['id']

ADS = [
    # AD SET A
    {'adset': ADSET_A, 'file': '01_mechanism.png', 'link': LINK_A,
     'msg': "Your palm has always held the answer. The marriage line doesn't just show who — it shows when, and why timing keeps shifting. A free palm reading reveals what's been quietly waiting to surface.",
     'hl': 'Your Marriage Line Knows', 'desc': "Read yours — it's free"},

    {'adset': ADSET_A, 'file': '03_timing.png', 'link': LINK_A,
     'msg': "There's a reason some connections feel \"almost ready\" for years. Timing in love isn't random — it follows a pattern your palm has mapped from the start. Find out where you are in that cycle.",
     'hl': 'Why Love Feels Delayed', 'desc': 'See your timing now'},

    {'adset': ADSET_A, 'file': '05_spiritual.png', 'link': LINK_A,
     'msg': "The lines in your palm were formed before you ever experienced heartbreak. They carry a pattern — and that pattern explains the waiting, the almost-relationships, the moments that felt so close. Your free reading starts here.",
     'hl': 'What Your Lines Carry', 'desc': 'Free personalized reading'},

    {'adset': ADSET_A, 'file': '06_timing_window.png', 'link': LINK_A,
     'msg': "She almost dismissed it as curiosity. Then her reading described the exact emotional pattern she'd been living for 6 years. Sometimes the clearest mirror is the one you were born with.",
     'hl': 'Your Palm Sees It Too', 'desc': 'Upload yours — free'},

    {'adset': ADSET_A, 'file': '10_awareness.png', 'link': LINK_A,
     'msg': "No two palms tell the same story. The marriage line, heart line, and fate line together form a picture that's entirely yours — not a horoscope written for millions. A reading built around your hand.",
     'hl': 'Yours Is Different', 'desc': 'Get your free reading'},

    {'adset': ADSET_A, 'file': '04_social_proof.png', 'link': LINK_A,
     'msg': '"I\'ve done birth charts, tarot, everything. Nothing clicked like this. The reading described my relationship pattern so accurately I had to put my phone down for a minute." — Rachel, 41, Tennessee.',
     'hl': "She Didn't Expect This", 'desc': 'Start yours free today'},

    {'adset': ADSET_A, 'file': 'vsl_hook_25s.mp4', 'link': LINK_A,
     'msg': "Most women in their 30s and 40s have never had their marriage line actually explained — specific to their hand, their pattern, their moment. This reading does that. It's free.",
     'hl': 'The Answer Is In Your Hand', 'desc': 'Free • Private • 2 min', 'thumb': 'thumb_hook.jpg'},

    {'adset': ADSET_A, 'file': 'vsl_kling_clean_9x16.mp4', 'link': LINK_A,
     'msg': "If love has felt like a cycle you can't break — or timing that never quite lines up — your palm may hold the pattern behind it. This free reading was built for exactly that moment.",
     'hl': 'Why Love Keeps Stalling', 'desc': 'Free reading — starts now', 'thumb': 'thumb_4x5.jpg'},

    # AD SET B
    {'adset': ADSET_B, 'file': '02_pattern.png', 'link': LINK_B,
     'msg': "If you keep ending up in the same kind of relationship — different person, same feeling — that's not a coincidence. It's a pattern. And patterns like that leave traces. Your palm is one of them.",
     'hl': 'Same Pattern, New Person?', 'desc': 'Find out why — free'},

    {'adset': ADSET_B, 'file': '07_curiosity.png', 'link': LINK_B,
     'msg': "She wasn't looking for magic. She was exhausted from repeating the same emotional loop. The reading didn't give her a prediction — it gave her a word for something she'd never been able to explain.",
     'hl': 'She Just Needed Clarity', 'desc': "Your turn — it's free"},

    {'adset': ADSET_B, 'file': '08_skeptic.png', 'link': LINK_B,
     'msg': '"I\'m not the type to believe in this stuff. But my friend kept pushing, so I tried it. I genuinely had to stop reading halfway through because it described something I\'d never told anyone." Your skepticism is welcome here.',
     'hl': "I Didn't Believe It Either", 'desc': 'See what yours says'},

    {'adset': ADSET_B, 'file': '04_social_proof.png', 'link': LINK_B,
     'msg': '"I spent years in therapy trying to understand why I always chose emotionally unavailable men. The palm reading named the pattern in three sentences." — Dana, 38, Oregon. Free reading. No card required.',
     'hl': 'Three Sentences Changed It', 'desc': 'Read yours free today'},

    {'adset': ADSET_B, 'file': 'vsl_hook_25s.mp4', 'link': LINK_B,
     'msg': "The same relationship pattern showing up in different people isn't a coincidence. It's a cycle — and your palm often holds the map to understanding why it keeps repeating. Free reading, no card, 2 minutes.",
     'hl': 'Why It Keeps Repeating', 'desc': 'Free • 2 min • Private', 'thumb': 'thumb_hook.jpg'},

    {'adset': ADSET_B, 'file': 'vsl_kling_clean_9x16.mp4', 'link': LINK_B,
     'msg': "If the pattern in your relationships feels bigger than any one person, it probably is. Your palm often reflects the emotional cycle you keep returning to — and understanding it is the first step out of it.",
     'hl': 'The Pattern Isn\'t Random', 'desc': 'Explore yours — free', 'thumb': 'thumb_4x5.jpg'},
]

print('=== ATUALIZANDO COPIES — MADAM AURORA ===\n')
for ad in ADS:
    f = ad['file']
    name = f"[COPY] {f}"
    print(f'  {f}... ', end='', flush=True)
    try:
        if f.endswith('.mp4'):
            cid = vid_creative(name, VID[f], THUMB[ad['thumb']], ad['msg'], ad['hl'], ad['desc'], ad['link'])
        else:
            cid = img_creative(name, IMG[f], ad['msg'], ad['hl'], ad['desc'], ad['link'])
        aid = make_ad(name, ad['adset'], cid)
        print(f'OK ad={aid}')
    except Exception as e:
        print(f'ERR: {e}')

print('\n=== DONE — revise e delete os ads antigos sem copy ===')
