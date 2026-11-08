"""Extract every service page of the live site (page-service-template) into structured JSON, text kept verbatim.
usage: python3 -I extract_services.py <live/main dir> <out json>
"""
import json, re, sys, html
from bs4 import BeautifulSoup, NavigableString, Tag

SRC, OUT = (sys.argv[1], sys.argv[2]) if len(sys.argv) > 2 else ('', '')
idx = json.load(open(f'{SRC}/_index.json')) if SRC and __name__ == '__main__' else {'pages': []}
BASE = 'https://newdermamedlaserclinic.com/'

KEEP = {'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td'}


def img_src(img):
    if not img: return ''
    for k in ('data-lazy-src', 'data-src', 'src'):
        v = img.get(k)
        if v and not v.startswith('data:'): return v
    ss = img.get('data-lazy-srcset') or img.get('srcset') or ''
    if ss: return ss.split(',')[0].strip().split(' ')[0]
    return ''


def norm_ws(t):
    return re.sub(r'[ \t\r\n\xa0]+', ' ', t)


def simplify(el):
    """inner HTML of el with only the KEEP tags, no attributes except href; whitespace collapsed; text verbatim"""
    out = []
    def walk(node):
        for c in node.children:
            if isinstance(c, NavigableString):
                if c.parent.name in ('script', 'style'): continue
                out.append(html.escape(norm_ws(str(c)), quote=False))
            elif isinstance(c, Tag):
                if c.name in ('script', 'style', 'noscript', 'svg', 'button', 'input', 'form'): continue
                if c.name == 'img':
                    out.append(f'<img src="{html.escape(img_src(c), quote=True)}" alt="{html.escape(c.get("alt") or "", quote=True)}">'); continue
                if c.name in KEEP:
                    if c.name == 'br': out.append('<br>'); continue
                    attrs = ''
                    if c.name == 'a' and c.get('href'): attrs = f' href="{html.escape(c["href"], quote=True)}"'
                    out.append(f'<{c.name}{attrs}>'); walk(c); out.append(f'</{c.name}>')
                else:
                    walk(c)  # unwrap div/span/section etc.
    walk(el)
    s = ''.join(out)
    s = re.sub(r'\s*(</?(?:p|h2|h3|h4|ul|ol|li|table|thead|tbody|tr|th|td)>)\s*', r'\1', s)
    s = re.sub(r'<p>\s*</p>', '', s)
    return s.strip()


def text(el):
    return norm_ws(el.get_text(' ')).strip() if el else ''


def plain(el):
    """visible text with paragraph breaks, for diffing"""
    return norm_ws(el.get_text('\n')).strip() if el else ''



def main():
    pages = []
    for p in idx['pages']:
        if p['file'].startswith('product/'): continue
        h = open(f"{SRC}/{p['file']}", encoding='utf-8').read()
        s = BeautifulSoup(h, 'lxml')
        bc = ' '.join(s.body.get('class', []))
        if 'page-template-page-service-template' not in bc: continue
        for t in s(['script', 'style', 'noscript']): t.decompose()
        mc = s.find(class_='main-content')
        d = {'file': p['file'], 'url': p['url'], 'path': re.sub(r'^https?://[^/]+/', '', p['url']).strip('/')}
        d['seo'] = {
            'title': text(s.title), 'description': (s.find('meta', attrs={'name': 'description'}) or {}).get('content', ''),
            'og_image': (s.find('meta', attrs={'property': 'og:image'}) or {}).get('content', ''),
            'canonical': (s.find('link', rel='canonical') or {}).get('href', ''),
        }
        hero = mc.find(class_='hero-service-section')
        d['hero'] = {'h1': text(hero.find('h1')), 'sub': text(hero.find(class_='hero-subtitle')), 'form_title': text(hero.find(class_='hero-form-blackfriday-title'))}
        for key, cls in (('bg_d', 'hero-bg-desktop'), ('bg_m', 'hero-bg-mobile')):   # the hero photo is a CSS background (desktop and phone files)
            el = hero.find(class_=cls)
            m = re.search(r"url\(['\"]?([^'\")]+)", el.get('style', '')) if el else None
            d['hero'][key] = m.group(1) if m else ''
        d['facts'] = [[text(it.find('h4')), text(it.find('p'))] for it in mc.find(class_='treatment-info-section').find_all(class_='treatment-item')]
        bens = mc.find_all(class_='benefits-section', recursive=False)
        d['benefits'] = []
        for b in bens:
            img = b.find('img')
            d['benefits'].append({'title': text(b.find(class_='benefits-section__title')), 'img': img_src(img), 'alt': (img.get('alt') if img else '') or '',
                                  'items': [[text(i.find(class_='benefits-section__item-title')), text(i.find(class_='benefits-section__item-description'))] for i in b.find_all(class_='benefits-section__item')]})
        acc = mc.find(class_='horizontal-accordion__desktop')
        d['tabs'] = []
        for it in acc.find_all(class_='horizontal-accordion__item'):
            head = text(it.find(class_='horizontal-accordion__item-header'))
            body = it.find(class_='horizontal-accordion__item-content')
            # the content repeats the label as its first heading; keep everything after it
            first = body.find(['h2', 'h3'])
            if first and text(first) == head: first.decompose()
            d['tabs'].append({'label': head, 'html': simplify(body), 'text': plain(body)})
        why = mc.find(class_='benefits-right-section')
        img = why.find('img')
        d['why'] = {'title': text(why.find(class_='benefits-section__title')), 'img': img_src(img), 'alt': (img.get('alt') if img else '') or '',
                    'html': simplify(why.find(class_='benefits-section__description')), 'text': plain(why.find(class_='benefits-section__description'))}
        ba = mc.find(class_='before-after-section')
        if ba:
            d['before_after'] = {'title': text(ba.find(['h2', 'h3'])), 'html': simplify(ba), 'imgs': [[img_src(i), i.get('alt') or ''] for i in ba.find_all('img')]}
        faq = mc.find(class_='faq-section')
        d['faq'] = {'title': text(faq.find(class_='faq-section-title')), 'sub': text(faq.find(class_='faq-section-subtitle')), 'des': text(faq.find(class_='faq-section-des')),
                    'items': [[text(i.find(class_='faq-header')), simplify(i.find(class_='faq-panel')), plain(i.find(class_='faq-panel'))] for i in faq.find_all(class_='faq-item')]}
        d['banner'] = text(mc.find(class_='ndm-back-image-text'))
        # the full visible text of the page's own sections (not the shared clinics / award / team / brands / testimonials), for the word-for-word check
        own = []
        for sec in mc.find_all(recursive=False):
            cls = ' '.join(sec.get('class', []))
            if any(k in cls for k in ('ndm-clinics', 'ndm-award', 'ndm-team', 'brands-showcase', 'testimonials', 'pricing-section-banner')): continue
            own.append(plain(sec))
        d['own_text'] = '\n'.join(own)
        pages.append(d)

    json.dump(pages, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(pages), 'service pages ->', OUT)


if __name__ == '__main__':
    main()
