"""SEO and GEO head data on every page (Raymond, 8 November 2026). Run after every rebuild, from the project folder:
    python3 -I src/patches-applied/seo_patch.py .
Safe to run twice: everything it adds sits between <!-- seo --> and <!-- /seo --> and is replaced on the next run.

Per page: lang en-CA, canonical, Open Graph and Twitter cards (title, description, the page's own photo), geo meta,
and a JSON-LD graph (id ld-site): the clinic organisation with both locations (addresses, phones, hours, map links,
social profiles) on every page, plus MedicalProcedure (treatment pages, with the lowest list price where the page shows
prices), MedicalWebPage + MedicalCondition with its possible treatments (concern pages), CollectionPage (the concerns
hub, the blog, the shop), BlogPosting pages keep their own data. Titles and descriptions are the pages' own.
Also writes sitemap.xml, robots.txt and llms.txt (a plain-text index of the site for AI search engines).
SITE is the address the pages will live at; change it here if the site moves."""
import glob, html as H, json, os, re, sys, datetime
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SITE = 'https://newdermamedlaserclinic.com/'
TODAY = datetime.date.today().isoformat()
NOINDEX = {'cart.html', 'checkout.html', 'order-confirmed.html', 'black-friday.html', 'index-fraunces.html'}   # the cart pages, the (on hold) campaign page and the obsolete serif test page stay out of search
SKIP_SITEMAP = NOINDEX | set()
DEFAULT_IMG = 'assets/icons/logo-1200x630.png'

ORG_ID = SITE + '#organization'
UPTOWN = {'@type': 'MedicalClinic', '@id': SITE + '#uptown', 'name': 'NewDermaMed Uptown Clinic', 'parentOrganization': {'@id': ORG_ID}, 'url': SITE + 'about.html#uptown', 'telephone': '+1-416-224-8800', 'email': 'info@newdermamed.com',
          'image': SITE + 'assets/clinic/clinic-4.jpg', 'hasMap': 'https://maps.app.goo.gl/Gm8Wg4B1Q3yHGnkE7',
          'address': {'@type': 'PostalAddress', 'streetAddress': '4763 Yonge Street', 'addressLocality': 'Toronto', 'addressRegion': 'ON', 'postalCode': 'M2N 5M5', 'addressCountry': 'CA'},
          'geo': {'@type': 'GeoCoordinates', 'latitude': 43.7614, 'longitude': -79.4111},
          'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '09:00', 'closes': '19:00'}]}
DOWNTOWN = {'@type': 'MedicalClinic', '@id': SITE + '#downtown', 'name': 'NewDermaMed Downtown Clinic', 'parentOrganization': {'@id': ORG_ID}, 'url': SITE + 'about.html#downtown', 'telephone': '+1-416-671-9766', 'email': 'info@newdermamed.com',
            'image': SITE + 'assets/clinic/clinic-1.jpg', 'hasMap': 'https://maps.app.goo.gl/McaiszUJaKqPem5R7',
            'address': {'@type': 'PostalAddress', 'streetAddress': '790 Bay Street, Suite 900', 'addressLocality': 'Toronto', 'addressRegion': 'ON', 'postalCode': 'M5G 1N8', 'addressCountry': 'CA'},
            'geo': {'@type': 'GeoCoordinates', 'latitude': 43.6605, 'longitude': -79.3857},
            'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '09:00', 'closes': '19:00'},
                                          {'@type': 'OpeningHoursSpecification', 'dayOfWeek': 'Saturday', 'opens': '10:00', 'closes': '17:00'}]}
ORG = {'@type': ['MedicalBusiness', 'MedicalOrganization'], '@id': ORG_ID, 'name': 'NewDermaMed', 'alternateName': 'NewDermaMed Cosmetic Surgery and Laser Clinic', 'url': SITE,
       'logo': {'@type': 'ImageObject', 'url': SITE + 'assets/icons/logo-600.png', 'width': 600, 'height': 600}, 'image': SITE + DEFAULT_IMG,
       'description': 'NewDermaMed is a medical aesthetics and laser clinic in Toronto with two locations, Uptown on Yonge Street and Downtown on Bay Street. Injectables, bio-stimulators, laser, skin, body, vein and hair treatments, and medical-grade skincare, with a free consultation and VISIA® skin analysis.',
       'email': 'info@newdermamed.com', 'telephone': '+1-416-224-8800', 'areaServed': {'@type': 'City', 'name': 'Toronto'},
       'sameAs': ['https://www.instagram.com/newdermamed/', 'https://www.facebook.com/NewDermaMed-171490486329211/', 'https://twitter.com/NewDermaMed', 'https://www.youtube.com/channel/UCEu0ghSIa-ZPqNh087WAY3w', 'https://www.linkedin.com/company/3636680'],
       'location': [{'@id': SITE + '#uptown'}, {'@id': SITE + '#downtown'}], 'department': [{'@id': SITE + '#uptown'}, {'@id': SITE + '#downtown'}]}
WEBSITE = {'@type': 'WebSite', '@id': SITE + '#website', 'url': SITE, 'name': 'NewDermaMed', 'publisher': {'@id': ORG_ID}, 'inLanguage': 'en-CA'}


def head_text(s, name):
    m = re.search(r'<meta name="' + name + r'" content="([^"]*)"', s)
    return H.unescape(m.group(1)) if m else ''


def title_of(s):
    m = re.search(r'<title>(.*?)</title>', s, re.S)
    return H.unescape(m.group(1)).strip() if m else 'NewDermaMed'


def page_json(s, name):
    """the page's own data object (const PROC = {...}; / const CN = {...};), or None"""
    m = re.search(r'\nconst ' + name + r' = (\{.*?\n\});\n', s, re.S)
    if not m: return None
    try:
        return json.loads(m.group(1))
    except Exception:
        return None


def first_ld(s):
    out = []
    for m in re.finditer(r'<script type="application/ld\+json"(?![^>]*id="ld-site")[^>]*>(.*?)</script>', s, re.S):
        try: out.append(json.loads(m.group(1)))
        except Exception: pass
    return out


def abs_url(path):
    if not path: return SITE + DEFAULT_IMG
    if path.startswith('http'): return path
    return SITE + path.lstrip('./')


def price_floor(prices):
    lo = None
    for it in prices['items']:
        for r in it[2]:
            if r[1] and (lo is None or r[1] < lo): lo = r[1]
    return lo


def build(file, s):
    title, desc = title_of(s), head_text(s, 'description')
    url = SITE + ('' if file == 'index.html' else file)
    proc, cn, hub = page_json(s, 'PROC'), page_json(s, 'CN'), page_json(s, 'HUB')
    lds = first_ld(s)
    kinds = {x.get('@type') for ld in lds for x in (ld.get('@graph', [ld]) if isinstance(ld, dict) else [])}
    og_type, image, graph = 'website', None, [ORG, UPTOWN, DOWNTOWN, WEBSITE]
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc, 'isPartOf': {'@id': SITE + '#website'}, 'about': {'@id': ORG_ID}, 'inLanguage': 'en-CA', 'dateModified': TODAY}
    if proc:   # a treatment page (live content)
        image = proc['hero']['d']
        page['@type'] = 'MedicalWebPage'
        mp = {'@type': 'MedicalProcedure', '@id': url + '#procedure', 'name': proc['h1'], 'alternateName': proc.get('short'), 'description': desc, 'url': url, 'image': abs_url(image),
              'provider': {'@id': ORG_ID}}
        facts = dict((k, v) for k, v in proc.get('facts', []))
        if facts: mp['additionalProperty'] = [{'@type': 'PropertyValue', 'name': k, 'value': v} for k, v in facts.items()]
        if proc.get('prices'):
            lo = price_floor(proc['prices'])
            if lo: mp['offers'] = {'@type': 'AggregateOffer', 'priceCurrency': 'CAD', 'lowPrice': lo, 'url': url + '#prices', 'offeredBy': {'@id': ORG_ID}}
        page['mainEntity'] = {'@id': url + '#procedure'}
        graph.append(mp)
    elif cn:   # a concern page
        image = cn['hero']['d']
        page['@type'] = 'MedicalWebPage'
        opts = cn.get('opts', []) + (cn.get('bio') or [])
        cond = {'@type': 'MedicalCondition', '@id': url + '#condition', 'name': cn['short'], 'description': cn.get('sub', desc),
                'possibleTreatment': [{'@type': 'MedicalProcedure', 'name': o['n'], 'url': SITE + o['file']} for o in opts]}
        page['mainEntity'] = {'@id': url + '#condition'}
        graph.append(cond)
    elif hub:   # the concerns hub
        page['@type'] = 'CollectionPage'
        items = [c for g in hub['groups'] for c in g['items']]
        page['mainEntity'] = {'@type': 'ItemList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': c['n'], 'url': SITE + c['file']} for i, c in enumerate(items)]}
        image = 'assets/home/v3/film/slide-1.webp'
    elif 'BlogPosting' in kinds and file != 'blog.html':
        og_type = 'article'
        for ld in lds:
            for x in (ld.get('@graph', [ld]) if isinstance(ld, dict) else []):
                if x.get('@type') == 'BlogPosting' and x.get('image'):
                    image = x['image'] if isinstance(x['image'], str) else x['image'].get('url')
        page['@type'] = 'WebPage'
    elif 'Product' in kinds:
        og_type = 'product'
        for ld in lds:
            for x in (ld.get('@graph', [ld]) if isinstance(ld, dict) else []):
                if x.get('@type') == 'Product' and x.get('image'):
                    image = x['image'] if isinstance(x['image'], str) else x['image'][0] if isinstance(x['image'], list) else x['image'].get('url')
    elif file in ('blog.html', 'shop.html', 'pricing.html', 'promotion.html'):
        page['@type'] = 'CollectionPage'
    if not image:
        m = re.search(r'(assets/(?:home|clinic|hero|live/main)/[^"\']+\.(?:webp|jpg|jpeg|png))', s)
        image = m.group(1) if m else DEFAULT_IMG
    page['primaryImageOfPage'] = {'@type': 'ImageObject', 'url': abs_url(image)}
    graph.append(page)
    ld = {'@context': 'https://schema.org', '@graph': graph}
    tags = [
        '<!-- seo -->',
        f'<link rel="canonical" href="{H.escape(url, quote=True)}">',
        '' if '<meta name="robots"' in s else '<meta name="robots" content="noindex,follow">' if file in NOINDEX else '<meta name="robots" content="index,follow,max-image-preview:large">',   # a page that sets its own robots tag (cart pages, campaign preview) keeps it
        '<meta name="geo.region" content="CA-ON">', '<meta name="geo.placename" content="Toronto">',
        f'<meta property="og:site_name" content="NewDermaMed">', f'<meta property="og:locale" content="en_CA">', f'<meta property="og:type" content="{og_type}">',
        f'<meta property="og:url" content="{H.escape(url, quote=True)}">', f'<meta property="og:title" content="{H.escape(title, quote=True)}">',
        f'<meta property="og:description" content="{H.escape(desc, quote=True)}">', f'<meta property="og:image" content="{H.escape(abs_url(image), quote=True)}">',
        '<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:site" content="@NewDermaMed">',
        f'<meta name="twitter:title" content="{H.escape(title, quote=True)}">', f'<meta name="twitter:description" content="{H.escape(desc, quote=True)}">',
        f'<meta name="twitter:image" content="{H.escape(abs_url(image), quote=True)}">',
        '<script type="application/ld+json" id="ld-site">' + json.dumps(ld, ensure_ascii=False).replace('</', '<\\/') + '</script>',
        '<!-- /seo -->',
    ]
    return '\n'.join(t for t in tags if t), title, desc, image


def patch(path):
    s = path.read_text(encoding='utf-8')
    s = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', s, count=1, flags=re.S)
    s = s.replace('<html lang="en">', '<html lang="en-CA">', 1)
    block, title, desc, image = build(path.name, s)
    anchor = '<meta name="theme-color"'
    i = s.index(anchor)
    s = s[:i] + block + '\n' + s[i:]
    path.write_text(s, encoding='utf-8')
    return title, desc


pages = sorted(p for p in ROOT.glob('*.html'))
index = []
for p in pages:
    title, desc = patch(p)
    index.append((p.name, title, desc))
print('seo:', len(pages), 'pages')

# sitemap, robots, llms.txt
urls = [SITE + ('' if f == 'index.html' else f) for f, _, _ in index if f not in SKIP_SITEMAP]
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for f, _, _ in index:
    if f in SKIP_SITEMAP: continue
    u = SITE + ('' if f == 'index.html' else f)
    pri = '1.0' if f == 'index.html' else '0.9' if f in ('concerns.html', 'pricing.html', 'aptos-thread-lift.html') else '0.6' if f.startswith('shop-') else '0.8'
    sm.append(f'  <url><loc>{H.escape(u)}</loc><lastmod>{TODAY}</lastmod><priority>{pri}</priority></url>')
sm.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(sm) + '\n', encoding='utf-8')
(ROOT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nDisallow: /cart.html\nDisallow: /checkout.html\nDisallow: /order-confirmed.html\nDisallow: /index-fraunces.html\n\nSitemap: {SITE}sitemap.xml\n', encoding='utf-8')


def group(f):
    if f == 'index.html': return 'Home'
    if f.startswith('concern'): return 'Concerns'
    if f.startswith('shop'): return 'Skincare shop'
    if f in ('about.html', 'pricing.html', 'promotion.html', 'before-after.html', 'cart.html', 'black-friday.html'): return 'Clinic'
    if f == 'blog.html' or f in POSTS: return 'Journal'
    return 'Treatments'


POSTS = set(json.load(open(ROOT / 'src/live/posts-built.json', encoding='utf-8')).values()) if (ROOT / 'src/live/posts-built.json').exists() else set()
lines = ['# NewDermaMed', '', '> Medical aesthetics and laser clinic in Toronto, Canada, with two locations: Uptown (4763 Yonge Street, North York, M2N 5M5, 416-224-8800, Monday to Friday 9am to 7pm) and Downtown (790 Bay Street, Suite 900, Toronto, M5G 1N8, 416-671-9766, Monday to Friday 9am to 7pm, Saturday 10am to 5pm). Email info@newdermamed.com. Every treatment plan starts with a free consultation and a VISIA® skin analysis with the licensed medical team. Results vary from person to person.', '',
         'Treatments: injectables (Botox®, Juvéderm®, dermal fillers, lip augmentation, tear trough correction, Belkyra®, Soft Lift™, mesotherapy and skin boosters), bio-stimulators (Aptos Thread Lift, Sculptra®, Radiesse®), skin treatments (microneedling, chemical peels, Dermamelan®, Acnelan®, exosome therapy, photo-rejuvenation, VISIA® skin analysis), laser (hair removal, skin resurfacing, micro laser peel, skin tightening, vein removal), body (CoolSculpting®, TightSculpting®, cellulite, stretch marks, hyperhidrosis), veins (sclerotherapy, EVLT, RFA, VenaSeal™) and hair (PRP, exosomes, laser hair rejuvenation). Medical-grade skincare from the clinic shop.', '']
for g in ('Home', 'Clinic', 'Concerns', 'Treatments', 'Skincare shop', 'Journal'):
    rows = [(f, t, d) for f, t, d in index if group(f) == g and f not in SKIP_SITEMAP]
    if not rows: continue
    lines.append(f'## {g}'); lines.append('')
    for f, t, d in rows:
        u = SITE + ('' if f == 'index.html' else f)
        lines.append(f'- [{t}]({u}): {d}' if d else f'- [{t}]({u})')
    lines.append('')
(ROOT / 'llms.txt').write_text('\n'.join(lines), encoding='utf-8')
print('sitemap', len(urls), 'urls; llms.txt', len(index), 'pages')
