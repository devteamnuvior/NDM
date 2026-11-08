"""The shop home page (shop.newdermamedlaserclinic.com) section by section as ordered text blocks, verbatim.
Each section: kind, head blocks, item cards (images + blocks), tail blocks. A block is [tag, text, href].
usage: python3 -I extract_shop_home.py <live/shop dir> <out json>"""
import json, re, sys
from bs4 import BeautifulSoup, NavigableString, Tag
sys.path.insert(0, __import__('os').path.dirname(__file__))
from extract_services import img_src, norm_ws

SRC, OUT = sys.argv[1], sys.argv[2]
s = BeautifulSoup(open(f'{SRC}/home.html', encoding='utf-8').read(), 'lxml')
for t in s(['script', 'style', 'noscript', 'svg']): t.decompose()
main = s.find('main') or s.body
secs = [c for c in main.find_all(['section', 'div'], recursive=False) if c.get_text(strip=True) or c.find('img')]
KINDS = ['hero', 'perks', 'glimpse', 'flagship', 'line', 'founder', 'routine', 'brands', 'match', 'bestsellers', 'patients', 'editorial', 'catalog', 'draw', 'services', 'ingredients', 'social', 'follow', 'articles', 'cta']
CARD = {'zo-feature', 'zo-product', 'zo-patient', 'zo-step', 'zo-service', 'zo-table', 'zo-social', 'zo-article', 'zo-brand', 'zo-company', 'zo-price'}
FULL = {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'li', 'a', 'button', 'blockquote', 'label', 'option'}


def blocks(root, skip_cards=False):
    out, done = [], set()
    BLOCKY = {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'li', 'ul', 'div', 'blockquote'}
    def href_of(el):
        a = el if el.name == 'a' else el.find_parent('a')
        return a.get('href') if a is not None and a.get('href') else None
    for el in root.find_all(True):
        if any(id(a) in done for a in el.parents): continue
        if skip_cards and el is not root and any(c in CARD for c in el.get('class', [])): done.add(id(el)); continue
        if el.name == 'img':
            continue
        if el.name == 'a' and el.find(lambda t: t.name in BLOCKY and t.get_text(strip=True)):
            continue   # a link wrapping a whole card: its parts are listed one by one, each carrying the link
        if el.name in FULL:
            txt = norm_ws(el.get_text(' ')).strip()
            if txt:
                h = href_of(el) or (el.find('a').get('href') if el.find('a') and el.find('a').get('href') else None)
                out.append([el.name, txt] + ([h] if h else []))
            done.add(id(el)); continue
        own = norm_ws(' '.join(x for x in el.children if isinstance(x, NavigableString))).strip()
        if own:
            tag = el.name if el.name in ('strong', 'em', 'small', 'span', 'b', 'i') else 'span'
            if el.name in ('div',) and len(own) > 70: tag = 'p'
            h = href_of(el)
            out.append([tag, own] + ([h] if h else []))
    return out


def card_of(el):
    return {'cls': ' '.join(el.get('class', [])), 'imgs': [[img_src(i), i.get('alt') or ''] for i in el.find_all('img') if img_src(i)], 'blocks': blocks(el)}


sections = []
for i, sec in enumerate(secs):
    kind = KINDS[i]
    head = sec.find(class_=lambda c: c and ('title-section' in c or 'heading-section' in c))
    cards = []
    for el in sec.find_all(True):
        cls = set(el.get('class', []))
        if cls & CARD and not any(set(a.get('class', [])) & CARD for a in el.parents if a is not sec):
            cards.append(card_of(el))
    d = {'kind': kind, 'cls': ' '.join(sec.find(True).get('class', [])) if sec.find(True) else '',
         'head': blocks(head) if head else [], 'items': cards,
         'imgs': [[img_src(im), im.get('alt') or ''] for im in sec.find_all('img') if img_src(im)]}
    # everything else in the section (text outside the head and the cards), in order
    rest = []
    consumed = set()
    if head: consumed.add(id(head))
    for el in sec.find_all(True):
        if set(el.get('class', [])) & CARD: consumed.add(id(el))
    tmp = BeautifulSoup(str(sec), 'lxml')
    for el in list(tmp.find_all(True)):
        if not el.attrs and el.name in ('html', 'body'): continue
        cls = set(el.get('class', []) if el.attrs is not None else [])
        if (cls & CARD) or ('title-section' in ' '.join(cls)) or ('heading-section' in ' '.join(cls)): el.decompose()
    d['tail'] = blocks(tmp.body)
    d['text'] = norm_ws(sec.get_text(' ')).strip()
    sections.append(d)

json.dump(sections, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for d in sections: print(d['kind'].ljust(12), 'head', len(d['head']), 'items', len(d['items']), 'tail', len(d['tail']), 'imgs', len(d['imgs']))
