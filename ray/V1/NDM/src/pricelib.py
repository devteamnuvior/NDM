"""Single source of truth for prices: src/live/pricing.json.
Generates the pricing page's PRICE_CATS array, and computes the lowest price for a
category or treatment the same way the site's fromPrice() helper does (per-unit,
package and buy-one-get-one discounts). Imported by build_pricing.py and the
promotion offer patch so every price on the site comes from one file."""
import json
import re
from pathlib import Path

UNIT_CATS = {'Botox / Dysport'}


def load_cats(src):
    return json.load(open(Path(src) / 'live' / 'pricing.json', encoding='utf-8'))['pricing']['cats']


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def _num(x):
    if x in (None, ''):
        return 0
    f = float(x)
    return int(f) if f == int(f) else f


def _js(s):
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'") + "'"


def _row(r):
    cells = [_js(r['label']), repr(_num(r['price'])), repr(_num(r.get('was') or 0))]
    if r.get('badge'):
        cells.append(_js(r['badge']))
    return '[' + ', '.join(cells) + ']'


def gen_price_cats_js(src):
    """The `const PRICE_CATS = [...]` array for the pricing page, built from pricing.json."""
    cats = load_cats(src)
    out = []
    for c in cats:
        items = []
        for it in c['items']:
            rows = ', '.join(_row(r) for r in it['rows'] if r.get('price') not in (None, ''))
            items.append(f"[{_js(it['name'])}, {_js(it.get('note', ''))}, [{rows}]]")
        u = ', unit: true' if c['name'] in UNIT_CATS else ''
        body = ',\n    '.join(items)
        out.append(f"  {{ id: {_js(slug(c['name']))}, name: {_js(c['name'])}{u}, blurb: '', items: [\n    {body}\n  ] }}")
    return 'const PRICE_CATS = [\n' + ',\n'.join(out) + '\n];\n'


# ---- lowest price, mirroring optUnits()/fromPrice() in pricing-ui.jsx ----
def _opt_units(label):
    m = re.search(r'(\d[\d,]*)\s*(syringe|vial|zone|unit|session)s?\b', label, re.I)
    if m:
        return int(m.group(1).replace(',', '')), m.group(2).lower()
    m = re.search(r'package of\s*(\d+)', label, re.I)
    if m:
        return int(m.group(1)), 'session'
    if re.match(r'^\s*single\s+zone', label, re.I):
        return 1, 'zone'
    if re.match(r'^\s*single\s+session', label, re.I):
        return 1, 'session'
    if re.match(r'^\s*regular\s*$', label, re.I) or re.search(r'per\s+unit', label, re.I):
        return 1, 'unit'
    if re.search(r'per\s+syringe', label, re.I):
        return 1, 'syringe'
    return 1, None


def best_deal(src, cat_name, item_name=None):
    """The headline deal for a category or one treatment, from the price list's own badges
    (same rule as bestOffer() on the pricing page): the largest 'N% OFF' becomes 'Up to N% off',
    otherwise the first badge in sentence case ('Buy 1 get 1 50% off'). '' when there is no deal."""
    cat = next((c for c in load_cats(src) if c['name'] == cat_name), None)
    if not cat:
        return ''
    items = [i for i in cat['items'] if item_name is None or i['name'] == item_name]
    tags = [r['badge'] for it in items for r in it['rows'] if r.get('badge')]
    pcts = [int(m.group(1)) for t in tags for m in [re.match(r'^(\d+)% OFF$', t, re.I)] if m]
    if pcts:
        return f'Up to {max(pcts)}% off'
    return tags[0].lower().capitalize() if tags else ''


def lowest(src, cat_name_or_slug, item_name=None):
    """Return (value, noun) for a category (optionally a single treatment in it).
    noun is a unit word ('syringe', 'session', ...) when the cheapest comes from a multi-buy, else None."""
    cats = load_cats(src)
    cat = next((c for c in cats if c['name'] == cat_name_or_slug or slug(c['name']) == slug(cat_name_or_slug)), None)
    if not cat:
        return None
    items = cat['items']
    if item_name:
        it = next((i for i in items if i['name'] == item_name), None)
        items = [it] if it else []
    is_unit = cat['name'] in UNIT_CATS
    best, noun, bn = None, None, 1
    for it in items:
        for r in it['rows']:
            if r.get('price') in (None, ''):
                continue
            p = float(r['price'])
            n, nn = _opt_units(r['label'])
            if n > 0 and re.search(r'buy\s*1\s*get\s*1\s*free', r.get('badge') or '', re.I):
                n *= 2
            eff = p / n if n > 0 else p
            if best is None or eff < best - 0.001:
                best, noun, bn = eff, nn, n
    if best is None:
        return None
    val = int(best) if best == int(best) else round(best, 2)
    unit = noun if (bn > 1 and noun) else ('unit' if is_unit else None)
    return (val, unit)


def money(v):
    return f'{v:,.2f}' if v % 1 else f'{int(v):,}'


def from_label(src, spec):
    """The 'From $X' / 'From $X per syringe' label for anything that shows a starting price
    (home treatment cards, concern pages). spec is (category, items) or a list of them;
    items is None (the whole category), one treatment name, or a list of names. The
    cheapest of everything named wins. None when nothing in the price list matches."""
    found = []
    for cat, items in (spec if isinstance(spec, list) else [spec]):
        names = [None] if items is None else ([items] if isinstance(items, str) else list(items))
        found += [r for n in names for r in [lowest(src, cat, n)] if r]
    if not found:
        return None
    val, noun = min(found, key=lambda r: r[0])
    return f'From ${money(val)}' + (f' per {noun}' if noun else '')


# Where each treatment's starting price lives in the price list. Used by the home page cards
# (src/patches-applied/home_prices_patch.py) and the concern pages (src/build_concerns.py),
# so a price changed in pricing.json reaches every page on the next build.
_FILLERS = 'Dermal Fillers'
_BIO = 'Skin Booster and Bio-stimulators'
_COOL = 'Coolsculpting & Tight Sculpting'
TREATMENT_PRICES = {
    'dermal-fillers.html': (_FILLERS, None),
    'juvederm.html': (_FILLERS, None),
    'lip-augmentation.html': (_FILLERS, 'Lip Enhancement'),
    'tear-trough-correction.html': (_FILLERS, 'Precision / Advanced Areas'),   # under-eye filler is a precision area
    'sculptra.html': (_BIO, 'Bio-Stimulator – Sculptra'),
    'radiesse.html': (_BIO, 'Bio-Stimulator – Radiesse'),
    'mesotherapy-skin-boosters.html': (_BIO, 'Skin Booster – HA (Hyaluronic Acid)'),
    'aptos-thread-lift.html': ('Aptos Thread Method', None),
    'exosome-skin-therapy.html': ('Microneedling', 'Microneedling with Exosomes - Face'),
    'non-surgical-bbl.html': ('Non-Surgical Butt Lift', None),
    'botox.html': ('Botox / Dysport', 'Botox Cosmetic'),
    'hyperhidrosis.html': ('Botox / Dysport', 'Hyperhidrosis'),
    'laser-skin-resurfacing.html': ('Laser Skin Resurfacing', None),
    'micro-laser-peel.html': ('Laser Skin Resurfacing', ['Micro Laser Peel Face', 'Micro Laser Peel Face + Neck', 'Micro Laser Peel Extra Small',
                                                         'Micro Laser Peel Small', 'Micro Laser Peel Medium', 'Micro Laser Peel Large']),
    'laser-skin-tightening.html': ('2D & 3D Laser Skin Tightening', None),
    'skin-tightening.html': ('2D & 3D Laser Skin Tightening', None),
    'photo-rejuvenation.html': ('Photo-Rejuvenation', None),
    'laser-hair-removal.html': ('Laser Hair Removal', None),
    'acne-treatments.html': ('Laser Acne Treatment', None),
    'laser-vein-removal.html': ('Laser Vein', None),
    'spider-vein-removal.html': ('Laser Vein', None),
    'microneedling.html': ('Microneedling', None),
    'chemical-peels.html': ('Chemical Peel', None),
    'acnelan.html': ('Chemical Peel', 'Acnelan'),
    'age-element-facial.html': ('Facial', None),
    'dermamelan.html': ('Depigmenting Treatment', None),
    'coolsculpting.html': (_COOL, ['Regular Treatment Zone', 'Coolsculpting Mini', 'Coolsculpting Smooth', 'Coolsculpting Double']),
    'tightsculpting.html': (_COOL, ['Tight Sculpting - Small Area', 'Tight Sculpting - Medium Area']),
    'hair-loss-treatments.html': ('Hair Loss', ['PRP Scalp - Small', 'PRP Scalp - Medium', 'PRP Scalp - Full']),   # the PRP page
    'laser-hair-rejuvenation.html': ('Hair Loss', 'Laser Hair Rejuvenation'),
    'vaginal-tightening.html': ('Laser Vaginal Tightening', None),
    'snoring-treatment.html': ('Snoring Treatment', None),
    'nail-fungus-treatment.html': ('Toenail Fungus Removal', None),
}
# cards whose name points at more than the page they link to
NAMED_PRICES = {
    'Fotona 4D® & Laser Rejuvenation': [('4D Rejuvalift', None), ('2D & 3D Laser Rejuvenation', None)],
}
