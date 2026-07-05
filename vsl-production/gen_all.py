import httpx, base64, io, os, time, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from env_loader import require_env

KEY = require_env("OPENROUTER_API_KEY")
MODEL_NAME = sys.argv[1]
MODEL_ID = {
    'seedream':   'bytedance-seed/seedream-4.5',
    'gpt5mini':   'openai/gpt-5-image-mini',
    'gemini_pro': 'google/gemini-3-pro-image-preview',
}[MODEL_NAME]

OUT = Path(f'C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/scenes/ad_images_v2/all/{MODEL_NAME}')
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350

CREATIVES = [
    {
        'id': '01_mechanism',
        'headline': "There's a line on your palm\nthat reveals how you love",
        'sub': 'Most people have never looked at it',
        'brand': 'MADAM AURORA  *  Free Palm Reading',
        'prompt': "Editorial macro photo. A beautiful woman's open right hand, palm facing camera, centered in frame, fingers pointing upward, hand fully upright. The heart line curves faintly glowing warm gold. Warm cinematic candlelight from the left. Deep dark background with rich shadows. Canon EOS R5 100mm macro lens f/2.8, skin texture and palm lines in sharp detail. Vertical composition.",
    },
    {
        'id': '02_pattern',
        'headline': 'Why does love always\nfeel like this?',
        'sub': 'The answer might be written in your hand',
        'brand': 'MADAM AURORA  *  Free Palm Reading',
        'prompt': "Editorial portrait photo. Beautiful American woman, 33 years old, natural blonde wavy hair, minimal makeup. Seated upright in a chair facing camera, head level, three-quarter view. Her right hand rests open on her lap palm facing up, palm lines visible. Wistful melancholic expression gazing toward a window. Warm amber afternoon light from the left. Dark moody interior. Canon EOS R5 85mm f/1.8, shallow depth of field. Subject fully upright, vertical portrait.",
    },
    {
        'id': '03_timing',
        'headline': 'Your love timing window\nmay be open right now',
        'sub': 'Most women miss it without knowing',
        'brand': 'MADAM AURORA  *  Free Reading',
        'prompt': "Editorial product photo. Antique ornate brass hourglass standing upright, golden sand flowing through the narrow neck. Warm amber candlelight glow from behind creates rim lighting. Deep dark background with soft bokeh candle flames. Canon EOS R5 85mm f/2.0, shallow depth of field, rich contrast. Hourglass centered vertically, vertical composition.",
    },
    {
        'id': '04_social_proof',
        'headline': '"She was 38 and thought\nher time had passed"',
        'sub': '6 weeks after her reading, she met him.',
        'brand': 'MADAM AURORA  *  Real Story',
        'prompt': "Editorial portrait photo. Happy radiant Caucasian woman in her late 30s, blonde hair, warm genuine smile, holding her smartphone at chest level with both hands. Cozy living room interior, warm natural light. She looks slightly off-camera with a joyful hopeful expression. Canon EOS R5 85mm f/1.8, shallow depth of field, bokeh background. Subject fully upright seated, vertical portrait.",
    },
    {
        'id': '05_spiritual',
        'headline': "Your palm lines don't lie.\nThey've been trying to tell you.",
        'sub': 'Discover what yours reveal about love',
        'brand': 'MADAM AURORA  *  Free Palm Reading',
        'prompt': "Editorial mystical photo. A woman's open palm raised upright, fingers pointing upward, centered in vertical frame. Golden luminous lines trace along the heart line and life line, glowing softly. Deep dark background with warm bokeh particles of light. Canon EOS R5 85mm f/1.4, skin texture visible, palm lines sharp. Mystical yet photorealistic, vertical composition.",
    },
    {
        'id': '06_timing_window',
        'headline': 'Are you in a love\ntiming window?',
        'sub': 'Take 3 minutes to find out - it is free',
        'brand': 'MADAM AURORA  *  Start Free',
        'prompt': "Editorial portrait photo. Beautiful Caucasian woman, 30 years old, loose blonde hair, seated upright facing camera directly. She holds her open right palm up at chest height in front of her face, studying her palm lines with curiosity and wonder. Her face is clearly visible above her raised palm. Both face and palm centered in frame. Single warm candle light illuminating face and palm from below. Dark moody background. Canon EOS R5 85mm f/1.8, shallow depth of field. Subject fully upright, head level, vertical portrait.",
    },
    {
        'id': '07_curiosity',
        'headline': 'I finally understood why\nevery relationship ended the same way',
        'sub': 'It was written in my palm the whole time',
        'brand': 'MADAM AURORA  *  Free Reading',
        'prompt': "Editorial portrait photo. Beautiful American brunette woman, early 30s, dark wavy hair, seated upright facing camera. She raises her open right palm toward camera at arm length, palm lines sharply visible and lit by golden light. Her face visible behind the palm, eyes glistening with sudden deep realization and emotion. Golden volumetric light rays from behind illuminate the palm lines. Dark warm bokeh background. Canon EOS R5 85mm f/1.8. Subject fully upright, head level, vertical portrait.",
    },
    {
        'id': '08_skeptic',
        'headline': '"I didn\'t believe in\npalm reading either"',
        'sub': 'Then I saw what my heart line actually meant',
        'brand': 'MADAM AURORA  *  See For Yourself',
        'prompt': "Editorial portrait photo. Beautiful Caucasian woman, early 30s, blonde straight hair, modern casual style. Seated upright, she holds her open left palm up and looks at it with a surprised intrigued expression, eyebrows slightly raised, mouth slightly open in amazement. Natural daylight from a window on the right. Clean modern interior, soft bokeh. Canon EOS R5 85mm f/1.8. Subject fully upright, vertical portrait.",
    },
    {
        'id': '09_retargeting',
        'headline': "You started. You didn't finish.\nYour reading is still waiting.",
        'sub': 'It only takes 3 minutes',
        'brand': 'MADAM AURORA  *  Come Back',
        'prompt': "Editorial tech photo. A woman's hands holding a glowing smartphone in portrait orientation. The screen displays a mystical palm reading interface with golden palm line illustrations glowing on a dark background. Warm candlelight illuminates the hands and phone screen from behind. Dark moody background with soft bokeh candle flames. Canon EOS R5 85mm f/1.8, shallow depth of field. Vertical composition.",
    },
    {
        'id': '10_awareness',
        'headline': 'What does your palm\nsay about love?',
        'sub': 'Upload a photo. Answer 7 questions. Get your reading.',
        'brand': 'MADAM AURORA  *  Free  *  Private  *  Instant',
        'prompt': "Editorial portrait photo. Two women's hands side by side, both palms facing upward toward camera, fingers pointing up. One hand light skin, one medium-tan skin. Warm golden light from above illuminates both palms, palm lines visible. Deep dark romantic background. Canon EOS R5 85mm f/2.0, sharp detail on palm lines. Vertical composition, both hands centered in frame.",
    },
]

def generate(prompt):
    with httpx.Client(timeout=180) as c:
        r = c.post('https://openrouter.ai/api/v1/chat/completions',
            headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'},
            json={'model': MODEL_ID, 'messages': [{'role':'user','content': prompt}]}
        )
    data = r.json()
    if 'error' in data:
        raise Exception(data['error'])
    msg = data['choices'][0]['message']
    imgs = msg.get('images', [])
    if imgs:
        url = imgs[0]['image_url']['url']
        if url.startswith('data:'):
            return base64.b64decode(url.split(',',1)[1])
        with httpx.Client(timeout=60) as c:
            return c.get(url).content
    import re
    content = str(msg.get('content',''))
    urls = re.findall(r'https?://\S+\.(?:png|jpg|jpeg|webp)', content)
    if urls:
        with httpx.Client(timeout=60) as c:
            return c.get(urls[0]).content
    raise Exception(f'No image. content={content[:200]}')

def load_font(bold, size):
    p = 'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf'
    return ImageFont.truetype(p, size) if os.path.exists(p) else ImageFont.load_default()

def fit_font(draw, text, max_w, start=72, min_s=28):
    size = start
    while size >= min_s:
        font = load_font(True, size)
        if all((draw.textbbox((0,0),l,font=font)[2]-draw.textbbox((0,0),l,font=font)[0])<=max_w for l in text.split('\n')):
            return font, size
        size -= 4
    return load_font(True, min_s), min_s

def add_copy(img_bytes, headline, sub, brand):
    img = Image.open(io.BytesIO(img_bytes)).convert('RGBA').resize((W,H), Image.LANCZOS)
    g = Image.new('RGBA',(W,400),(8,6,12,0))
    gd = ImageDraw.Draw(g)
    for i in range(400): gd.line([(0,i),(W,i)], fill=(8,6,12,int(215*(1-i/400)**0.55)))
    img.alpha_composite(g,(0,0))
    g2 = Image.new('RGBA',(W,280),(8,6,12,0))
    gd2 = ImageDraw.Draw(g2)
    for i in range(280): gd2.line([(0,279-i),(W,279-i)], fill=(8,6,12,int(225*(1-i/280)**0.5)))
    img.alpha_composite(g2,(0,H-280))
    canvas = img.convert('RGB'); draw = ImageDraw.Draw(canvas)
    GOLD = (212,175,55); MAX_W = W-60
    fhl, hl_sz = fit_font(draw, headline, MAX_W)
    for i, line in enumerate(headline.split('\n')):
        bbox = draw.textbbox((0,0),line,font=fhl); tw=bbox[2]-bbox[0]
        x=(W-tw)//2; y=28+i*(hl_sz+14)
        draw.text((x+3,y+3),line,font=fhl,fill=(0,0,0))
        draw.text((x,y),line,font=fhl,fill=(255,255,255))
    fsub = load_font(False,36)
    bbox = draw.textbbox((0,0),sub,font=fsub)
    if bbox[2]-bbox[0]>MAX_W: fsub=load_font(False,30); bbox=draw.textbbox((0,0),sub,font=fsub)
    sy=H-195; x=(W-(bbox[2]-bbox[0]))//2
    draw.text((x+2,sy+2),sub,font=fsub,fill=(0,0,0)); draw.text((x,sy),sub,font=fsub,fill=(220,220,220))
    sep=H-133; draw.line([(W//2-80,sep),(W//2+80,sep)],fill=GOLD,width=2)
    fbr=load_font(True,27); bbox=draw.textbbox((0,0),brand,font=fbr); x=(W-(bbox[2]-bbox[0]))//2
    draw.text((x+2,sep+15),brand,font=fbr,fill=(0,0,0)); draw.text((x,sep+13),brand,font=fbr,fill=GOLD)
    for t in range(3): draw.rectangle([t,t,W-1-t,H-1-t],outline=GOLD)
    out=io.BytesIO(); canvas.save(out,'PNG',optimize=True); return out.getvalue()

print(f'=== {MODEL_NAME} ({MODEL_ID}) ===', flush=True)
for c in CREATIVES:
    out_path = OUT / f'{c["id"]}.png'
    if out_path.exists():
        print(f'  skip: {c["id"]}', flush=True)
        continue
    print(f'  [{c["id"]}]... ', end='', flush=True)
    try:
        img = generate(c['prompt'])
        (OUT / f'{c["id"]}_base.jpg').write_bytes(img)
        final = add_copy(img, c['headline'], c['sub'], c['brand'])
        out_path.write_bytes(final)
        print('OK', flush=True)
    except Exception as e:
        print(f'ERR: {e}', flush=True)
    time.sleep(4)
print(f'=== {MODEL_NAME} DONE ===', flush=True)
