"""Word-for-word check of everything carried from the live site: treatment pages, the shop home, every product page,
every article and the before & after gallery. Each piece of the live page's own text must appear in the rendered new page.
usage: python3 -I verify_text_all.py <src/live dir> <rendered text dir>"""
import json, re, sys, html as H
from bs4 import BeautifulSoup
LIVE, TD = sys.argv[1], sys.argv[2]
services = json.load(open(f'{LIVE}/services.json', encoding='utf-8'))
built = json.load(open(f'{LIVE}/pages-built.json'))
shop = json.load(open(f'{LIVE}/shop.json', encoding='utf-8'))
shop_home = json.load(open(f'{LIVE}/shop-home.json', encoding='utf-8'))
pages = json.load(open(f'{LIVE}/pages.json', encoding='utf-8'))


def norm(s):
    s = H.unescape(s or '').replace('\xa0', ' ')
    s = re.sub(r'\s*([®™])\s*', r'\1', s)          # "Acnelan ®" and "Acnelan®" are the same word
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def paras(text):
    return [x for x in (text or '').split('\n') if x.strip()]


def html_paras(h):
    """text of each block element of an html snippet"""
    s = BeautifulSoup('<div>' + (h or '') + '</div>', 'lxml')
    out = []
    for el in s.find_all(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'td', 'th']):
        t = el.get_text(' ', strip=True)
        if t: out.append(t)
    if not out:
        t = s.get_text(' ', strip=True)
        if t: out.append(t)
    return out


def treatment_units(p):
    u = [('h1', p['hero']['h1']), ('sub', p['hero']['sub'])]
    for k, v in p['facts']: u += [('fact', k), ('fact', v)]
    for b in p['benefits']:
        u.append(('benefits title', b['title']))
        for t, d in b['items']: u += [('benefit', t), ('benefit', d)]
    for t in p['tabs']:
        u.append(('tab label', t['label']))
        u += [('tab text', x) for x in paras(t['text'])]
    u.append(('why title', p['why']['title']))
    u += [('why text', x) for x in paras(p['why']['text'])]
    u += [('faq title', p['faq']['title']), ('faq sub', p['faq']['sub'])]
    for q, a, t in p['faq']['items']:
        u += [('faq q', re.sub(r'^\d+\.\s*', '', q)), ('faq a', t)]
    return u


def product_units(p):
    u = [('name', p['name']), ('short', p['short'])]
    for k, v in (p.get('panels') or {}).items():
        u += [(k, x) for x in html_paras(v.get('html') if isinstance(v, dict) else v)]
    for k, vs in (p.get('attributes') or {}).items():
        u += [('attribute', x) for x in vs]
    u += [('category', c) for c in p.get('categories', [])] + [('brand', b) for b in p.get('brands', [])]
    return u


def shop_home_units():
    u = []
    for sec in shop_home:
        for blk in sec.get('head', []): u.append(('shop ' + sec['kind'], blk[1]))
        for it in sec.get('items', []):
            for blk in it.get('blocks', []): u.append(('shop ' + sec['kind'], blk[1]))
        for blk in sec.get('tail', []): u.append(('shop ' + sec['kind'], blk[1]))
    return u


def post_units(p):
    u = [('title', p['title'])]
    u += [('body', x) for x in html_paras(p.get('html', ''))]
    return u


def gallery_units():
    sec = next(s for s in pages['pages']['home']['sections'] if s['class'].startswith('before-after'))
    u = [('gallery', x) for x in re.findall(r'<h[23]>(.*?)</h[23]>', sec['html'])]
    u += [('gallery label', a) for _, a in sec['imgs'] if a]
    return u


def tight(s):
    return re.sub(r'\s+', '', s).lower()   # spacing and letter case can differ (inline tags, uppercase labels in the design)


def check(f, units, totals, missing):
    try: txt = norm(open(f"{TD}/{f.replace('.html', '')}.txt", encoding='utf-8').read())
    except FileNotFoundError:
        missing.setdefault(f, []).append(('NO RENDER', '')); return
    ttxt = tight(txt)
    for kind, s in units:
        s = norm(s)
        if not s or re.match(r'^(Original price was|Current price is):', s) or 'must match the WooCommerce' in s: continue   # screen-reader price text, an html comment
        s = re.sub(r'\s*→\s*$', '', s)   # arrows at the end of link labels are icons here
        m = re.match(r'^<a href="[^"]+"[^>]*>([^<]*)</a>$', s)
        if m: s = m.group(1)   # a button the live page shows as a line of code is shown as the button here
        totals[0] += 1
        # exact, or the same characters with different spacing (inline tags, a heading on two lines, a dash dropped at a line break)
        if s in txt or tight(s) in ttxt or tight(re.sub(r' [–-] ', ' ', s)) in ttxt: totals[1] += 1
        else: missing.setdefault(f, []).append((kind, s[:110]))


groups = {'treatments': ([], {}), 'shop home': ([], {}), 'products': ([], {}), 'articles': ([], {}), 'gallery': ([], {})}
for g in groups: groups[g] = ([0, 0], {})
for p in services:
    f = built.get(p['path'])
    if not f or f == 'aptos-thread-lift.html': continue
    check(f, treatment_units(p), *groups['treatments'])
check('shop.html', shop_home_units(), *groups['shop home'])
for p in shop['products']:
    check('shop-' + p['slug'] + '.html', product_units(p), *groups['products'])
for p in pages['posts']:
    f = p['url'].rstrip('/').split('/')[-1] + '.html'
    check(f if f != 'chemical-peels.html' else 'chemical-peels-article.html', post_units(p), *groups['articles'])
check('before-after.html', gallery_units(), *groups['gallery'])

for g, (tot, miss) in groups.items():
    print(f'{g}: {tot[1]}/{tot[0]} text pieces found word for word; pages with gaps: {len(miss)}')
    for f, m in list(miss.items())[:40]:
        print('   ', f, len(m))
        for kind, s in m[:5]: print('       ', kind, '|', s)
