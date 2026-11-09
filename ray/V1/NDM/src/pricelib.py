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
