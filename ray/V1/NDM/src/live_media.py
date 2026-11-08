"""Media for the treatment and concern pages (Raymond, 8 Nov 2026: real pictures and motion on every page).
Everything is the clinic's own: the home page's clinic footage (the film band), the Instagram reels (the phone),
the before/after composites of the live home gallery (src/live/pages.json, downloaded by images.json) and the clinic photos.
Used by src/build_live_treatments.py and src/build_concerns.py."""
import json, re
from pathlib import Path

CLIP = 'assets/live/main/uploads/2025/09/'
FILM_TEXT = 'Two clinics, Uptown on Yonge Street and Downtown on Bay Street. Every visit starts with a free consultation and a VISIA® skin analysis with our licensed medical team.'
FILM_CHIPS = ['4763 Yonge St, Uptown', '790 Bay St, Downtown', 'Free consultation', 'VISIA® skin analysis']
REELS = {'botox': ('assets/live/main/uploads/2025/09/botox-.mp4', 'assets/home/v3/film/reel-botox.webp', 'Botox®'),
         'filler': ('assets/live/main/uploads/2025/09/Filler-.mp4', 'assets/home/v3/film/reel-filler.webp', 'Dermal fillers'),
         'exosome': ('assets/live/main/uploads/2025/11/exosome-.mp4', 'assets/home/v3/film/reel-exosome.webp', 'Exosome therapy'),
         'dermamelan-1': ('assets/live/main/uploads/2025/10/dermamelan-1-.mp4', 'assets/home/v3/film/reel-dermamelan-1.webp', 'Dermamelan®'),
         'dermamelan-2': ('assets/live/main/uploads/2025/10/dermamelan-2-.mp4', 'assets/home/v3/film/reel-dermamelan-2.webp', 'Dermamelan®'),
         'laser': ('assets/live/main/uploads/2025/10/laser-.mp4', 'assets/home/v3/film/reel-laser.webp', 'Laser resurfacing')}
# the gallery's labels, as they read on the cards
CASE_LABEL = {'Botox': 'Botox®', 'Belkyra': 'Belkyra®', 'Chemical peel': 'Chemical peel', 'Laser acne Chemical peels': 'Laser acne and chemical peels', 'Dermamelan': 'Dermamelan®', 'Fractional skin resurfacing': 'Fractional skin resurfacing',
              'Tear Troughs': 'Tear trough filler', 'Stretch Marks': 'Stretch marks', 'PRP Hair': 'PRP for hair', 'Mole removal': 'Mole removal', 'Microneedling': 'Microneedling', 'Lip fillers': 'Lip fillers', 'Laser acne': 'Laser acne treatment'}


def gallery(root, src):
    """the live home page's before/after gallery: label -> [local composite files] (the 86px thumbnails are skipped)"""
    pages = json.load(open(src / 'live/pages.json', encoding='utf-8'))
    img_map = json.load(open(src / 'live/images.json', encoding='utf-8')) if (src / 'live/images.json').exists() else {}
    sec = next(x for x in pages['pages']['home']['sections'] if x.get('class') == 'before-after')
    out = {}
    for url, alt in re.findall(r'<img src="([^"]+)" alt="([^"]*)"', sec['html']):
        loc = img_map.get(url)
        if not loc or not (root / loc).exists(): continue
        from PIL import Image   # Pillow is required: without it the gallery's 86px filter icons would be taken for cases
        if Image.open(root / loc).size[0] < 200: continue
        out.setdefault(alt.strip(), []).append(loc)
    return out


def film(clip, lead, strong='at NewDermaMed Toronto'):
    return {'src': f'{CLIP}{clip}-1.mp4', 'src_m': f'{CLIP}{clip}-Mobile.mp4', 'poster': f'assets/home/v3/film/{clip}.webp', 'lead': lead, 'strong': strong, 'text': FILM_TEXT, 'chips': FILM_CHIPS}


def reel(key):
    srcv, poster, tag = REELS[key]
    return {'src': srcv, 'poster': poster, 'tag': tag, 'lead': 'See it', 'strong': 'at NewDermaMed', 'text': 'A short clip from our Instagram, filmed at the clinic. Follow @newdermamed for more.'}


def cases(gal, labels, text='Cases from our before and after gallery, photographed at NewDermaMed.'):
    items = []
    for lb in labels:
        for f in gal.get(lb, []):
            items.append({'src': f, 'label': CASE_LABEL.get(lb, lb)})
    items = items[:12]   # a sideways row of cards (the dark before/after design), so any count works
    return {'items': items, 'text': text} if items else None
