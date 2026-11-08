"""Extract the live pricing page (fees-financing) verbatim: intro, monthly specials, every category / treatment / option / price,
payment plans, FAQ.  usage: python3 -I extract_pricing.py <live/main dir> <out json>"""
import json, re, sys
from bs4 import BeautifulSoup
sys.path.insert(0, __import__('os').path.dirname(__file__))
from extract_services import simplify, text, plain, img_src

SRC, OUT = sys.argv[1], sys.argv[2]
h = open(f'{SRC}/fees-financing.html', encoding='utf-8').read()
s = BeautifulSoup(h, 'lxml')
for t in s(['script', 'style', 'noscript']): t.decompose()
mc = s.find(class_='main-content') or s.find('main')
d = {'seo': {'title': text(s.title), 'description': (s.find('meta', attrs={'name': 'description'}) or {}).get('content', '')}}

intro = mc.find(class_='section-plain-text')
d['intro'] = {'h2': text(intro.find('h2')), 'html': simplify(intro.find(class_='ndm-desc')), 'text': plain(intro.find(class_='ndm-desc'))}

sp = mc.find(class_='monthly_exclusive')
d['specials'] = {'title': text(sp.find(class_='title')), 'sub': text(sp.find(class_='subtitle')), 'items': []}
for card in sp.find_all(class_=lambda c: c and 'carousel' in c and 'item' in c):
    d['specials']['items'].append({'text': plain(card), 'html': simplify(card), 'imgs': [img_src(i) for i in card.find_all('img')], 'links': [a.get('href') for a in card.find_all('a') if a.get('href')]})
if not d['specials']['items']:
    car = sp.find(class_='a-carousel-section')
    d['specials']['raw_text'] = plain(car)
    d['specials']['html'] = simplify(car)
    d['specials']['imgs'] = [[img_src(i), i.get('alt') or ''] for i in car.find_all('img')]
    d['specials']['links'] = [[text(a), a.get('href')] for a in car.find_all('a') if a.get('href')]

ps = mc.find(class_='products-section')
d['pricing'] = {'title': text(ps.find(class_='ndm-pricing-title')), 'sub': text(ps.find(class_='ndm-pricing-subtitle')), 'search_placeholder': (ps.find('input') or {}).get('placeholder', ''), 'cats': []}


def money(el):
    return text(el).replace('$', '').replace(',', '').strip()


for item in ps.find_all(class_='accordion-item'):
    cat = {'name': text(item.find(class_='accordion-header')), 'items': []}
    for var in item.find_all(class_='variable'):
        tt = var.find(class_='title-text'); ps_ = tt.find_all('p')
        it = {'name': text(ps_[0]) if ps_ else text(tt), 'note': text(tt.find(class_='product_des')) if tt.find(class_='product_des') else '', 'rows': []}
        for row in var.find_all(class_='variable-content'):
            vt = row.find(class_='variable-title')
            label = ''.join(str(x) for x in vt.contents if isinstance(x, str)).strip()
            label = re.sub(r'\s*-\s*$', '', label).strip()
            dele, ins = vt.find('del'), vt.find('ins')
            if dele and ins:
                was, price = money(dele), money(ins)
            else:
                amt = vt.find(class_='amount'); was, price = '', (money(amt) if amt else '')
            badge = ' / '.join(text(b) for b in row.find_all(class_=['discount-badge', 'variable-label']))
            btn = row.find('button')
            if not label and not vt.find(class_='amount'): continue  # empty placeholder rows on the live page
            it['rows'].append({'label': label, 'price': price, 'was': was, 'badge': badge, 'product_id': btn.get('data-product-id') if btn else '', 'text': plain(row.find(class_='titles'))})
        cat['items'].append(it)
    d['pricing']['cats'].append(cat)
d['pricing']['empty'] = plain(ps.find(class_='ndm-search-empty'))

pay = mc.find(class_='section-payment')
d['payment'] = {'text': plain(pay), 'html': simplify(pay), 'imgs': [[img_src(i), i.get('alt') or ''] for i in pay.find_all('img')], 'links': [[text(a), a.get('href')] for a in pay.find_all('a') if a.get('href')]}

faq = mc.find(class_='faq-section')
d['faq'] = {'title': text(faq.find(class_='faq-section-title')), 'sub': text(faq.find(class_='faq-section-subtitle')), 'des': text(faq.find(class_='faq-section-des')),
            'items': [[text(i.find(class_='faq-header')), simplify(i.find(class_='faq-panel')), plain(i.find(class_='faq-panel'))] for i in faq.find_all(class_='faq-item')]}
d['own_text'] = '\n'.join(plain(sec) for sec in mc.find_all(recursive=False))
json.dump(d, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
n = sum(len(i['rows']) for c in d['pricing']['cats'] for i in c['items'])
print(len(d['pricing']['cats']), 'categories,', sum(len(c['items']) for c in d['pricing']['cats']), 'treatments,', n, 'priced options ->', OUT)
