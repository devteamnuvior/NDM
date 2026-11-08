"""Extract the live site's other pages verbatim, section by section: home, about-us, contact-us, promotion, before-after,
book-free-consultation, online-booking, blog and every post; plus the shared sections (team, testimonials, awards, clinics,
footer) from a service page.  usage: python3 -I extract_pages.py <live/main dir> <out json>"""
import json, re, sys, html as H
from bs4 import BeautifulSoup
sys.path.insert(0, __import__('os').path.dirname(__file__))
from extract_services import simplify, text, plain, img_src

SRC, OUT = sys.argv[1], sys.argv[2]
idx = json.load(open(f'{SRC}/_index.json'))
rest = json.load(open(f'{SRC}/_rest.json'))
files = {p['url']: p['file'] for p in idx['pages']}
un = lambda s: H.unescape(s or '')


def soup(file):
    s = BeautifulSoup(open(f'{SRC}/{file}', encoding='utf-8').read(), 'lxml')
    for t in s(['script', 'style', 'noscript']): t.decompose()
    return s


def seo(s):
    return {'title': text(s.title), 'description': (s.find('meta', attrs={'name': 'description'}) or {}).get('content', ''),
            'og_image': (s.find('meta', attrs={'property': 'og:image'}) or {}).get('content', '')}


def sections(root):
    out = []
    for sec in root.find_all(recursive=False):
        if not sec.get_text(strip=True) and not sec.find('img'): continue
        out.append({'tag': sec.name, 'id': sec.get('id', ''), 'class': ' '.join(c for c in sec.get('class', []) if not c.startswith('order-') and c != 'js-lazy-section'),
                    'heading': text(sec.find(['h1', 'h2'])), 'text': plain(sec), 'html': simplify(sec),
                    'imgs': [[img_src(i), i.get('alt') or ''] for i in sec.find_all('img') if img_src(i)], 'links': [[text(a), a.get('href')] for a in sec.find_all('a') if a.get('href')]})
    return out


out = {'pages': {}, 'posts': [], 'shared': {}}
for name in ['home', 'about-us', 'contact-us', 'promotion', 'before-after', 'book-free-consultation', 'online-booking', 'blog', 'shop', 'fees-financing']:
    f = name + '.html'
    s = soup(f)
    main = s.find(class_='main-content') or s.find('main') or s.body
    out['pages'][name] = {'file': f, 'seo': seo(s), 'h1': text(main.find('h1')), 'sections': sections(main), 'own_text': plain(main)}

# blog posts: content from the page itself (what visitors see) and the REST copy
for p in rest['posts']:
    if 'slug' not in p: continue
    f = files.get(p['link'])
    d = {'id': p['id'], 'slug': p['slug'], 'url': p['link'], 'title': un(p['title']['rendered']), 'date': p['date'], 'modified': p['modified'],
         'excerpt': plain(BeautifulSoup(p['excerpt']['rendered'], 'lxml')), 'content_html_rest': p['content']['rendered']}
    y = p.get('yoast_head_json') or {}
    d['seo'] = {'title': y.get('title', ''), 'description': y.get('description', ''), 'og_image': (y.get('og_image') or [{}])[0].get('url', '')}
    if f:
        s = soup(f)
        main = s.find(class_='main-content') or s.find('main') or s.body
        body = main.find(class_='single--body--content') or main
        d['h1'] = text(main.find('h1'))
        d['html'] = simplify(body)
        d['text'] = plain(body)
        d['imgs'] = [[img_src(i), i.get('alt') or ''] for i in body.find_all('img') if img_src(i)]
        thumb = main.find(class_='single--heading--thumbnail')
        d['hero'] = [[img_src(i), i.get('alt') or ''] for i in thumb.find_all('img') if img_src(i)] if thumb else []
        d['date_text'] = text(main.find(class_='single--body--postmeta'))
        d['categories_live'] = [text(a) for a in (main.find(class_='single--categories') or main).find_all('a')] if main.find(class_='single--categories') else []
        d['similar'] = [text(a) for a in (main.find(class_='single--related') or main).find_all('a')] if main.find(class_='single--related') else []
        d['views'] = text(main.find(class_='single--heading--views'))
    out['posts'].append(d)

# shared sections from the Botox page: team, testimonials, awards, clinics, brands, footer, header promo bar
s = soup('injectables/botox.html')
mc = s.find(class_='main-content')
for key, cls in [('clinics', 'ndm-clinics'), ('awards', 'ndm-award-section'), ('team', 'ndm-team-section'), ('brands', 'section-brands-showcase'), ('testimonials', 'testimonials-section')]:
    sec = mc.find(class_=cls)
    out['shared'][key] = {'heading': text(sec.find(['h2'])), 'text': plain(sec), 'html': simplify(sec), 'imgs': [[img_src(i), i.get('alt') or ''] for i in sec.find_all('img') if img_src(i)], 'links': [[text(a), a.get('href')] for a in sec.find_all('a') if a.get('href')]}
hdr, ftr = s.find('header'), s.find('footer')
out['shared']['header_text'] = plain(hdr)
out['shared']['footer'] = {'text': plain(ftr), 'html': simplify(ftr), 'links': [[text(a), a.get('href')] for a in ftr.find_all('a') if a.get('href')]}
for mid in ['ndmFormPopup', 'contactModal', 'textsmsModal', 'nf-success-modal']:
    el = s.find(id=mid)
    if el: out['shared'][mid] = plain(el)
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out['pages']), 'pages,', len(out['posts']), 'posts ->', OUT)
