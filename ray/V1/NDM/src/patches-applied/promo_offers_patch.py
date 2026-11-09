"""Promotion offers / monthly specials (both read SPECIALS in promotion.html).
Ten most-wanted treatments, tagged with their pricing-page category, short service line,
and the LOWEST price pulled live from the single source (src/live/pricing.json) via pricelib.
Rerun on every rebuild so the offer prices stay in step with the price list.
Idempotent: it replaces the whole SPECIALS array each time."""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import pricelib  # noqa: E402

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
src = root / 'src'

# n=name, img, pos, cat=pricing category name, item=exact treatment (or None for the whole category),
# area=Face/Body filter, icon=SpecialIcon key, d=short service line
OFFERS = [
    {'n': 'Lip Filler', 'img': 'assets/treatments/lip-filler.jpg', 'pos': '50% 35%', 'cat': 'Dermal Fillers', 'item': 'Lip Enhancement', 'area': 'Face', 'icon': 'lips', 'd': 'Add volume, shape and definition to the lips.'},
    {'n': 'Microneedling', 'img': 'assets/treatments/microneedling.jpg', 'pos': '50% 40%', 'cat': 'Microneedling', 'item': None, 'area': 'Face', 'icon': 'pen', 'd': 'Boost collagen for smoother, firmer skin.'},
    {'n': 'Chemical Peel', 'img': 'assets/treatments/chemical-peel.jpg', 'pos': '50% 40%', 'cat': 'Chemical Peel', 'item': None, 'area': 'Face', 'icon': 'drop', 'd': 'Renew tone and texture with a tailored peel.'},
    {'n': 'Laser Skin Resurfacing', 'img': 'assets/treatments/laser-resurfacing.jpg', 'pos': '50% 40%', 'cat': 'Laser Skin Resurfacing', 'item': None, 'area': 'Face', 'icon': 'face', 'd': 'Resurface for clearer, smoother skin.'},
    {'n': 'Photo Rejuvenation', 'img': 'assets/treatments/photo-rejuvenation.jpg', 'pos': '50% 40%', 'cat': 'Photo-Rejuvenation', 'item': None, 'area': 'Face', 'icon': 'drop', 'd': 'Even out redness and sun spots.'},
    {'n': 'Skin Booster', 'img': 'assets/treatments/skin-booster.jpg', 'pos': '50% 40%', 'cat': 'Skin Booster and Bio-stimulators', 'item': 'Skin Booster – HA (Hyaluronic Acid)', 'area': 'Face', 'icon': 'drop', 'd': 'Deep hydration for a fresh, dewy glow.'},
    {'n': 'Sculptra® Liquid Facelift', 'img': 'assets/promotion/sculptra-face.webp', 'pos': '50% 45%', 'cat': 'Skin Booster and Bio-stimulators', 'item': 'Bio-Stimulator – Sculptra Liquid Facelift', 'area': 'Face', 'icon': 'syringe', 'd': 'Gradual, collagen-building facial lift.'},
    {'n': 'Hand Rejuvenation with Radiesse®', 'img': 'assets/promotion/hands.webp', 'pos': '50% 58%', 'cat': 'Skin Booster and Bio-stimulators', 'item': 'Bio-Stimulator – Hand Rejuvenation with Radiesse', 'area': 'Body', 'icon': 'hand', 'd': 'Restore youthful volume to aging hands.'},
    {'n': 'Crepey Arm Rejuvenation', 'img': 'assets/promotion/crepey-arms.webp', 'pos': '50% 55%', 'cat': 'Skin Booster and Bio-stimulators', 'item': 'Bio-Stimulator – Crepey Arm Rejuvenation with Radiesse', 'area': 'Body', 'icon': 'syringe', 'd': 'Smooth and firm crepey skin on the arms.'},
    {'n': 'Above the Knee Tightening', 'img': 'assets/promotion/above-knee.webp', 'pos': '50% 55%', 'cat': 'Skin Booster and Bio-stimulators', 'item': 'Bio-Stimulator – Above the Knee Tightening', 'area': 'Body', 'icon': 'drop', 'd': 'Firm loose, sagging skin above the knees.'},
]


def money(v):
    return (f"{v:,.2f}" if v % 1 else f"{int(v):,}")


def jss(s):
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'") + "'"


def build_specials():
    rows = []
    for o in OFFERS:
        res = pricelib.lowest(src, o['cat'], o['item'])
        assert res, ('no price for', o['n'], o['cat'], o['item'])
        val, noun = res
        u = f'per {noun}' if noun else ''
        href = 'pricing.html#pg-' + pricelib.slug(o['cat']) + '-h'
        deal = pricelib.best_deal(src, o['cat'], o['item'])  # the deal shown on the card, from the price list badges
        rows.append(
            '  { n: %s, img: %s, pos: %s, p: %s, u: %s, deal: %s, tag: %s, area: %s, icon: %s, h: %s, d: %s }'
            % (jss(o['n']), jss(o['img']), jss(o['pos']), jss(money(val)), jss(u), jss(deal),
               jss(o['cat']), jss(o['area']), jss(o['icon']), jss(href), jss(o['d']))
        )
    return ("const SPECIALS = [ /* ten most-wanted treatments; prices pulled from the pricing page "
            "(src/live/pricing.json) by src/patches-applied/promo_offers_patch.py, rerun on every build */\n"
            + ',\n'.join(rows) + '\n];')


new = build_specials()
# the promotion page and the home page both show these offers (wheel + grid on promotion, wheel on home)
for page in ('promotion.html', 'index.html'):
    p = root / page
    s = p.read_text(encoding='utf-8')
    s2, n = re.subn(r'const SPECIALS = \[.*?\n\];', lambda m: new, s, count=1, flags=re.S)
    assert n == 1, 'SPECIALS array not found in ' + page
    p.write_text(s2, encoding='utf-8')
print('promo offers: %d cards on promotion + home, prices from pricing.json' % len(OFFERS))
