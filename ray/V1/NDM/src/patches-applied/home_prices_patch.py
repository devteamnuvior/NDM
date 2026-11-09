"""Home page starting prices from the price list (Raymond, 8 Nov 2026: every price on the site comes from the
pricing page, always the lowest). Rewrites the "From $X" labels in index.html:
  - START: the "Where would you like to start?" concern cards,
  - MENU: the treatment menu cards,
  - AptosCare: the Aptos card's "From" fact,
using pricelib.TREATMENT_PRICES (by the page a card links to) and pricelib.NAMED_PRICES (by card name).
Labels that are not prices ("At consultation", "Free") are left alone.
Rerun on every build, after promo_offers_patch.py and before build_blackfriday.py. Idempotent."""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import pricelib  # noqa: E402

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
src = root / 'src'
page = root / 'index.html'
s = page.read_text(encoding='utf-8')
changed = []

# the unit ("per syringe") sits on its own small line under the price, so a long label never wraps mid-phrase on a phone
MARKUP = [
    ("const priceParts = (p) => (/^From /.test(p) ? ['From', p.slice(5)] : [null, p]);",
     "const priceParts = (p) => { const m = /^From (\\S+)(?: (per \\w+))?$/.exec(p); return m ? ['From', m[1], m[2] || ''] : [null, p, '']; };   /* \"From $45 per session\": From / $45 / per session */"),
    ('                      const [k, v] = priceParts(price);',
     '                      const [k, v, u] = priceParts(price);'),
    ("text-[13px] font-medium text-ndm-muted'}`}>{v}</b></span>",
     "text-[13px] font-medium text-ndm-muted'}`}>{v}</b>{u && <span>{u}</span>}</span>"),
    ('                <span className="font-inter text-[14px] font-medium text-ndm-ink">{price}</span>\n                <Btn href="#/book" v="ink" sm>Book</Btn>',
     '                {(() => { const [k, v, u] = priceParts(price); return <span className="grid gap-[2px] font-inter text-[14px] font-medium leading-[1.25] text-ndm-ink">{k ? `${k} ${v}` : v}{u && <span className="text-[12px] font-normal text-ndm-muted">{u}</span>}</span>; })()}\n                <Btn href="#/book" v="ink" sm>Book</Btn>'),
]
for old, new in MARKUP:
    if new in s:
        continue
    assert s.count(old) == 1, ('price markup not found', old[:60])
    s = s.replace(old, new)


def label_for(name, href):
    spec = pricelib.NAMED_PRICES.get(name) or pricelib.TREATMENT_PRICES.get(href)
    return pricelib.from_label(src, spec) if spec else None


def fix(card):
    """card = [name, line, price label, href, ...]"""
    name, old, href = card[0], card[2], card[3]
    if not str(old).startswith('From'):
        return
    new = label_for(name, href)
    if new and new != old:
        changed.append(f'{name}: {old} -> {new}')
        card[2] = new


def rewrite(const, walk):
    global s
    m = re.search(r'const ' + const + r' = (\[.*?\]);', s)
    assert m, const + ' not found in index.html'
    data = json.loads(m.group(1))
    assert json.dumps(data, ensure_ascii=False) == m.group(1), const + ' is no longer one-line JSON; update this patch'
    walk(data)
    s = s[:m.start(1)] + json.dumps(data, ensure_ascii=False) + s[m.end(1):]


rewrite('START', lambda d: [fix(it) for g in d for c in g.get('chips', []) for it in c['items']])
rewrite('MENU', lambda d: [fix(card) for t in d for card in t['cards']])

aptos = label_for('Aptos Thread Lift', 'aptos-thread-lift.html')   # "From $2,500"
s, n = re.subn(r"\['From', '\$[\d,.]+(?: per \w+)?'\]", "['From', '" + aptos.replace('From ', '') + "']", s, count=1)
assert n == 1, 'AptosCare From fact not found'

page.write_text(s, encoding='utf-8')
print('home prices from pricing.json:', len(changed), 'labels changed' + (':' if changed else ''))
for c in dict.fromkeys(changed):
    print('  ', c)
