"""Extract the live skincare shop (shop.newdermamedlaserclinic.com): the 68 products (Store API data plus the product page's
tabs and summary text, verbatim), the categories, brands and filter attributes, and the shop home page section by section.
usage: python3 -I extract_shop.py <live/shop dir> <out json>"""
import json, re, sys, html as H
from bs4 import BeautifulSoup
sys.path.insert(0, __import__('os').path.dirname(__file__))
from extract_services import simplify, text, plain, img_src

SRC, OUT = sys.argv[1], sys.argv[2]
rest = json.load(open(f'{SRC}/_rest.json'))
idx = json.load(open(f'{SRC}/_index.json'))
files = {p['url']: p['file'] for p in idx['pages']}
un = lambda s: H.unescape(s or '')


def soup(file):
    s = BeautifulSoup(open(f'{SRC}/{file}', encoding='utf-8').read(), 'lxml')
    for t in s(['script', 'style', 'noscript']): t.decompose()
    return s


products = []
for p in rest['products']:
    if 'name' not in p: continue
    d = {'id': p['id'], 'name': un(p['name']), 'slug': p['slug'], 'url': p['permalink'], 'sku': p['sku'], 'on_sale': p['on_sale'],
         'price': int(p['prices']['price']) / 100, 'regular': int(p['prices']['regular_price']) / 100, 'sale': int(p['prices']['sale_price']) / 100,
         'short_html': p['short_description'], 'short': plain(BeautifulSoup(p['short_description'], 'lxml')),
         'desc_html': p['description'], 'desc': plain(BeautifulSoup(p['description'], 'lxml')),
         'images': [[i['src'], i['alt'], i.get('thumbnail', '')] for i in p['images']],
         'categories': [un(c['name']) for c in p['categories']], 'tags': [un(t['name']) for t in p['tags']], 'brands': [un(b['name']) for b in p.get('brands', [])],
         'attributes': {a['name']: [un(t['name']) for t in a['terms']] for a in p['attributes']},
         'in_stock': p['is_in_stock'], 'rating': p['average_rating'], 'reviews': p['review_count']}
    f = files.get(p['permalink'])
    if f:
        s = soup(f)
        d['seo'] = {'title': text(s.title), 'description': (s.find('meta', attrs={'name': 'description'}) or {}).get('content', '')}
        tabs = s.find(class_='woocommerce-tabs')
        d['tabs'] = []
        if tabs:
            for li in tabs.find_all('li', class_=lambda c: c and 'tab' in c):
                d['tabs'].append(text(li))
            d['panels'] = {}
            for panel in tabs.find_all(class_='woocommerce-Tabs-panel'):
                h2 = panel.find('h2')
                if h2: h2.decompose()
                d['panels'][panel.get('id', '')] = {'html': simplify(panel), 'text': plain(panel)}
        summ = s.find(class_='entry-summary')
        d['summary_text'] = plain(summ) if summ else ''
        badge = s.find(class_=lambda c: c and 'onsale' in c)
        d['sale_badge'] = text(badge) if badge else ''
        rel = s.find('section', class_='related')
        d['related'] = [text(a) for a in rel.select('h2.woocommerce-loop-product__title')] if rel else []
        d['related_title'] = text(rel.find('h2')) if rel else ''
    products.append(d)

cats = [{'id': c['id'], 'name': un(c['name']), 'slug': c['slug'], 'count': c['count'], 'parent': c.get('parent'), 'description': un(c.get('description', ''))} for c in rest['categories'] if 'name' in c]
attrs = [{'name': un(a['name']), 'slug': a.get('taxonomy'), 'count': a.get('count')} for a in rest['brands'] if 'name' in a]

# the shop home page, section by section (text verbatim, simplified HTML, images, links)
s = soup('home.html')
main = s.find('main') or s.body
home = {'seo': {'title': text(s.title), 'description': (s.find('meta', attrs={'name': 'description'}) or {}).get('content', '')}, 'sections': []}
for sec in main.find_all(['section', 'div'], recursive=False):
    if not sec.get_text(strip=True) and not sec.find('img'): continue
    home['sections'].append({'tag': sec.name, 'id': sec.get('id', ''), 'class': ' '.join(sec.get('class', [])), 'heading': text(sec.find(['h1', 'h2'])), 'text': plain(sec), 'html': simplify(sec),
                             'imgs': [[img_src(i), i.get('alt') or ''] for i in sec.find_all('img')], 'links': [[text(a), a.get('href')] for a in sec.find_all('a') if a.get('href')]})
hdr = s.find('header'); ftr = s.find('footer')
home['header_text'] = plain(hdr) if hdr else ''
home['footer_text'] = plain(ftr) if ftr else ''
home['footer_links'] = [[text(a), a.get('href')] for a in ftr.find_all('a') if a.get('href')] if ftr else []

# the shop listing page (filters and sort options)
s = soup('shop.html')
main = s.find('main') or s.body
listing = {'seo': {'title': text(s.title)}, 'heading': text(main.find('h1')), 'text': plain(main)[:3000],
           'filters': [text(x) for x in main.find_all(['h3', 'h4', 'legend', 'summary'])][:40],
           'sort': [text(o) for o in main.select('select option')][:20]}

json.dump({'products': products, 'categories': cats, 'attributes': attrs, 'home': home, 'listing': listing}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(products), 'products,', len(cats), 'categories,', len(home['sections']), 'home sections ->', OUT)
