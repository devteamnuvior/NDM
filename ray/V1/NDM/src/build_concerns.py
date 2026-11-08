"""Build the 22 concern pages (concern-<slug>.html) and the concerns hub (concerns.html) from src/concerns_data.py,
in the treatment page layout: promotion.html shell + procedure-ui.jsx (components only) + treatment-ui.jsx + concern-ui.jsx.
usage: python3 -I src/build_concerns.py <NDM dir> <src dir> [slug ...]
Also writes src/live/concerns-built.json (slug, name, file, group) and src/live/concerns-map.json (treatment page -> the
concerns that list it), which build_live_treatments.py uses for the "Concerns it may help with" strip.
Hero photos are the live photos of the lead treatment page (src/live/services.json via images.json); articles come from
src/blog-ui.jsx (BLOG_POSTS) so titles, dates and images stay the blog's own."""
import json, re, sys, html as H
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
ONLY = set(sys.argv[3:])
sys.path.insert(0, str(src))
import concerns_data as D   # noqa: E402

LIVE = json.load(open(src / 'live/services.json', encoding='utf-8'))
BUILT = json.load(open(src / 'live/pages-built.json', encoding='utf-8'))      # live path -> file
IMG_MAP = json.load(open(src / 'live/images.json', encoding='utf-8')) if (src / 'live/images.json').exists() else {}
BY_FILE = {v: next(p for p in LIVE if p['path'] == k) for k, v in BUILT.items()}

shell = (root / 'promotion.html').read_text(encoding='utf-8')
shell = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', shell, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build
shell = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', shell, count=1)
proc_ui = (src / 'procedure-ui.jsx').read_text(encoding='utf-8')
proc_ui = proc_ui[proc_ui.index('const CALLS = '):]
treat_ui = (src / 'treatment-ui.jsx').read_text(encoding='utf-8')
live_ui = (src / 'live-treatment-ui.jsx').read_text(encoding='utf-8')
LIVE_CSS = re.search(r'const LIVE_CSS = `(.*?)`;', live_ui, re.S).group(1)
cn_ui = (src / 'concern-ui.jsx').read_text(encoding='utf-8')
media_ui = (src / 'live-media-ui.jsx').read_text(encoding='utf-8')   # film, before/after cases, visit us (8 Nov 2026)
MEDIA_CSS = re.search(r'const MEDIA_CSS = `(.*?)`;', media_ui, re.S).group(1)
import live_media as M   # noqa: E402
GALLERY = M.gallery(root, src)
FILM_BY_GROUP = {'Skin': 'slide-2', 'Hair': 'slide-3'}   # the boutique for skin concerns, the treatment clip for hair, the clinic front for the rest
CASES_BY_SLUG = {'wrinkles-fine-lines': ['Botox'], 'double-chin': ['Belkyra'], 'thin-lips': ['Lip fillers'], 'under-eye-hollows-dark-circles': ['Tear Troughs'], 'volume-loss': ['Tear Troughs', 'Lip fillers'],
                 'acne-breakouts': ['Laser acne', 'Laser acne Chemical peels'], 'acne-scars': ['Microneedling', 'Fractional skin resurfacing'], 'melasma': ['Dermamelan'], 'hyperpigmentation-sun-spots': ['Dermamelan', 'Chemical peel'],
                 'uneven-texture-pores': ['Fractional skin resurfacing', 'Microneedling'], 'moles-skin-lesions': ['Mole removal'], 'stretch-marks': ['Stretch Marks'], 'thinning-hair': ['PRP Hair'], 'hair-loss': ['PRP Hair']}
CN_CSS = re.search(r'const CN_CSS = `(.*?)`;', cn_ui, re.S).group(1)
CSS_PROC = (src / 'build_procedure.py').read_text(encoding='utf-8')
CSS_PROC = CSS_PROC[CSS_PROC.index("css = '''") + 9:CSS_PROC.index("'''\nanchor")]

# the blog's own post list: title, address, date, words, topic, image, summary
blog_ui = (src / 'blog-ui.jsx').read_text(encoding='utf-8')
BLOG_LOCAL = json.loads(re.search(r'const BLOG_LOCAL = (\{.*?\});', blog_ui).group(1))
POST_IMG = re.search(r"const POST_IMG = '([^']+)';", blog_ui).group(1)
POSTS = {}
for m in re.finditer(r"\['((?:[^'\\]|\\.)*)', '([^']*)', '([^']*)', (\d+), '([^']*)', '([^']*)', '((?:[^'\\]|\\.)*)'\]", blog_ui):
    t, u, d, w, topic, img, ex = m.groups()
    if u in BLOG_LOCAL:
        POSTS[BLOG_LOCAL[u]] = {'t': t.replace("\\'", "'"), 'file': BLOG_LOCAL[u], 'd': d, 'topic': topic, 'img': POST_IMG + img, 'ex': ex.replace("\\'", "'")}
assert len(POSTS) >= 30, len(POSTS)


def img(url):
    return IMG_MAP.get(url, url)


def hero_of(key):
    p = BY_FILE[D.T[key]['file']]
    d = img(p['hero'].get('bg_d') or p['why']['img'])
    m = img(p['hero'].get('bg_m') or p['hero'].get('bg_d') or p['why']['img'])
    for f in (d, m):
        assert not f.startswith('http') and (root / f).exists(), (key, f)
    return {'d': d, 'm': m, 'pos': '50% 30%'}


def thumb_of(key):
    """a 720px webp of the treatment's hero photo (assets/live/thumbs, made on 8 Nov 2026) for cards; the full photo if none"""
    d = hero_of(key)['d']
    t = 'assets/live/thumbs/' + Path(d).stem + '.webp'
    return t if (root / t).exists() else d


SHOP_CATS = {c['name'] for c in json.load(open(src / 'live/shop.json', encoding='utf-8'))['categories']}


def cat_href(cat):
    """a shop catalogue filtered to the category; advice cards (no matching category) carry no link"""
    return 'shop.html?cat=' + cat.replace(' ', '+') + '#catalog' if cat in SHOP_CATS else None


def price_num(label):
    m = re.search(r'\$([\d,]+(?:\.\d+)?)', label)
    return float(m.group(1).replace(',', '')) if m and label.startswith('From') else None


def opt(key, role, fit):
    t = D.T[key]
    o = {'key': key, 'n': t['n'], 'role': role, 'fit': fit, 'line': t['line'], 'price': list(t['price']), 'file': t['file'], 'img': thumb_of(key)}
    for k in ('how', 'visit', 'course', 'down', 'res', 'last'):
        if t.get(k): o[k] = t[k]
    return o


CFILE = {c['s']: 'concern-' + c['s'] + '.html' for c in D.CONCERNS}
WHY = {'img': 'assets/home/team-award.jpg', 'alt': 'The NewDermaMed team celebrating their Top Choice Award at the clinic', 'pos': '50% 35%', 'lead': 'Expert care at', 'strong': 'two Toronto clinics',
       'items': [['16+', 'Years', 'Caring for patients in Toronto'], ['8', 'Awards', 'Top Choice Award, 2019 to 2026'], ['Licensed', 'Medical team', 'Treatments are given only by our licensed medical team'], ['Free', 'Consultation', 'Every plan starts with an in-person assessment']]}


def page_data(c):
    opts = [opt(k, r, f) for k, r, f in c['opts']]
    bio = [opt(k, 'Bio-stimulator', f) for k, f in c['bio']] if c.get('bio') else None
    everything = opts + (bio or [])
    nums = [price_num(o['price'][0]) for o in everything]
    nums = [n for n in nums if n]
    low = min(nums) if nums else None
    compare = [o for o in everything if o.get('how')]
    seen, rows = set(), []
    for o in compare:
        if o['key'] in seen: continue
        seen.add(o['key']); rows.append(o)
    return {
        'slug': c['s'], 'file': CFILE[c['s']], 'short': c['n'], 'group': c['g'], 'h1': c['h1'], 'sub': c['sub'], 'hero': hero_of(c['img']),
        'crumbs': [['Concerns', 'concerns.html'], c['n']],
        'facts': [['Treatment options', f"{len(everything)} to compare"], ['Consultation', 'Free, in person'], ['Skin analysis', 'VISIA®, included'], ['Starting price', ('From $' + (f'{low:,.2f}'.rstrip('0').rstrip('.') if low % 1 else f'{int(low):,}')) if low else 'Quoted at consultation']],
        'lede': c['lede'], 'pages': [{'n': D.T[k]['n'], 'file': D.T[k]['file']} for k in c['pages']], 'ba': bool(c.get('ba')),
        'notice': c['notice'], 'cause': c['why'], 'assess': {'text': c['assess'][0], 'points': c['assess'][1]},
        'opts': opts, 'bio': bio,
        'rx': {'text': c['rx'][0], 'links': [{'n': D.T[k]['n'], 'file': D.T[k]['file']} for k in c['rx'][1]]} if c.get('rx') else None,
        'compare': rows,
        'expect': {'tag': 'What to expect', 'lead': 'Your plan,', 'strong': 'step by step', 'text': 'How a typical plan unfolds. Yours is built at your free consultation.', 'items': [list(x) for x in c['expect']]},
        'home': [{'t': t, 'cat': cat, 'text': text, 'href': cat_href(cat)} for t, cat, text in c['home']],
        'faqs': [list(x) for x in c['faq']],
        'articles': [POSTS[f] for f in c['articles'] if f in POSTS],
        'rel': [{'n': next(x['n'] for x in D.CONCERNS if x['s'] == s), 'file': CFILE[s]} for s in c['rel']],
        'why': WHY,
        'film': M.film(FILM_BY_GROUP.get(c['g'], 'slide-1'), c['n']),
        'cases': M.cases(GALLERY, CASES_BY_SLUG[c['s']], 'Cases from our before and after gallery for this concern, photographed at NewDermaMed.') if c['s'] in CASES_BY_SLUG else None,
        'nav': [['about', 'Overview'], ['understand', 'The concern'], ['assess', 'Assessment'], ['options', 'Options'], ['expect', 'What to expect']] + ([['results', 'Results']] if c['s'] in CASES_BY_SLUG and M.cases(GALLERY, CASES_BY_SLUG[c['s']]) else []) + [['why', 'Why NewDermaMed'], ['visit', 'Visit us'], ['faq', 'FAQ']],
    }


APP = r'''
function App() {
  const cart = useCartState();
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useOnScroll(() => {
    const probe = 70;
    setDark([...document.querySelectorAll('[data-nav="dark"]')].some((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
  }, []);
  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main">
        <Breadcrumb items={CN.crumbs} dark />
        <ConcernHero p={CN} />
        <TxGlance p={CN} />
        <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden"><ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" /></section>
        <TxNav p={CN} />
        <CnIntro p={CN} />
        <CnUnderstand p={CN} />
        <TxFilm p={CN} />
        <CnAssess p={CN} />
        <CnOptions p={CN} />
        <CnCompare p={CN} />
        <TxExpect p={CN} />
        {CN.cases && <TxCases p={CN} />}
        <CnHome p={CN} />
        <TxWhy p={CN} />
        <Partners />
        <Team />
        <PromoReviews />
        <CnArticles p={CN} />
        <CnRelated p={CN} />
        <TxVisit p={CN} />
        <ProcAnalysis />
        <Faq items={CN.faqs} lead={<>Questions about<br /></>} strong={CN.short.toLowerCase()} intro="The things people ask us most about this concern." />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'pricing.html#prices'; }} />
      <CartPill onOpen={() => setCartOpen(true)} hidden={cartOpen || drawer || search} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />
      <OfferPopup ready />
      <ChatBot ready hidden={cartOpen || drawer || search} />
    </CartCtx.Provider>
  );
}
'''
HUB_APP = r'''
function App() {
  const cart = useCartState();
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dark, setDark] = useState(true);
  useOnScroll(() => {
    const probe = 70;
    setDark([...document.querySelectorAll('[data-nav="dark"]')].some((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
  }, []);
  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main">
        <Breadcrumb items={['Concerns']} dark />
        <HubHero h={HUB} />
        <HubGroups h={HUB} />
        <Partners />
        <PromoReviews />
        <TxVisit p={{}} />
        <ProcAnalysis />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'pricing.html#prices'; }} />
      <CartPill onOpen={() => setCartOpen(true)} hidden={cartOpen || drawer || search} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />
      <OfferPopup ready />
      <ChatBot ready hidden={cartOpen || drawer || search} />
    </CartCtx.Provider>
  );
}
'''
OLD_TITLE = '<title>Promotions, NewDermaMed Toronto</title>'
OLD_DESC = '<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">'


def assemble(title, desc, ld, data_js, app, extra_ui=''):
    s = shell
    i = s.rindex('</style>', 0, s.index('<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'))
    s = s[:i] + CSS_PROC + LIVE_CSS + CN_CSS + MEDIA_CSS + s[i:]
    assert s.count(OLD_TITLE) == 1 and s.count(OLD_DESC) == 1
    s = s.replace(OLD_TITLE, '<title>' + H.escape(title) + '</title>')
    s = s.replace(OLD_DESC, '<meta name="description" content="' + H.escape(desc, quote=True) + '">\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')
    a = s.index('\nfunction App() {')
    b = s.index('ReactDOM.createRoot', a)
    ui = data_js + proc_ui + '\n' + treat_ui + '\n' + cn_ui + '\n' + media_ui + extra_ui
    return s[:a] + '\n' + ui + '\n/* ---------------------------------------------------------------- app (concern page) */' + app + s[b:]


def build(c):
    d = page_data(c)
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'}, {'@type': 'ListItem', 'position': 2, 'name': 'Concerns', 'item': 'concerns.html'}, {'@type': 'ListItem', 'position': 3, 'name': c['n']}]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in d['faqs']]},
    ]}
    title = f"{c['n']}: treatments in Toronto, NewDermaMed"
    data = '/* ---------------------------------------------------------------- this page: src/concerns_data.py (new copy, for Raymond\'s review) */\nconst CN = ' + json.dumps(d, ensure_ascii=False, indent=1).replace('</script', '<\\/script') + ';\n'
    (root / d['file']).write_text(assemble(title, c['sub'], ld, data, APP), encoding='utf-8')
    return d


def build_hub(pages):
    groups = []
    for g in D.GROUPS:
        items = [{'n': p['short'], 'file': p['file'], 'img': ('assets/live/thumbs/' + Path(p['hero']['d']).stem + '.webp') if (root / ('assets/live/thumbs/' + Path(p['hero']['d']).stem + '.webp')).exists() else p['hero']['d'], 'pos': p['hero']['pos'], 'sub': p['sub'], 'count': len(p['opts']) + (len(p['bio']) if p['bio'] else 0)} for p in pages if p['group'] == g]
        groups.append({'id': re.sub(r'[^a-z]+', '-', g.lower()).strip('-'), 'title': g, 'items': items})
    hub = {'film': M.film('slide-1', ''), 'sub': 'Tell us what bothers you and we match it with the treatments that suit your skin. Every concern below has its own page: what you may notice, why it happens, the options we offer, prices and what to expect.', 'groups': groups}
    ld = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'}, {'@type': 'ListItem', 'position': 2, 'name': 'Concerns'}]}
    data = '/* ---------------------------------------------------------------- the concerns hub: src/concerns_data.py */\nconst HUB = ' + json.dumps(hub, ensure_ascii=False, indent=1) + ';\n'
    (root / 'concerns.html').write_text(assemble('Concerns: start from what you notice, NewDermaMed Toronto', hub['sub'], ld, data, HUB_APP), encoding='utf-8')


pages = [page_data(c) for c in D.CONCERNS]
built = []
for c in D.CONCERNS:
    if ONLY and c['s'] not in ONLY: continue
    built.append(build(c)['file'])
if not ONLY or 'concerns' in ONLY:
    build_hub(pages); built.append('concerns.html')

# for the menus, the patches and the treatment pages
json.dump([{'slug': c['s'], 'name': c['n'], 'file': CFILE[c['s']], 'group': c['g']} for c in D.CONCERNS], open(src / 'live/concerns-built.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
cmap = {}
for c in D.CONCERNS:
    keys = [k for k, *_ in c['opts']] + [k for k, _ in (c.get('bio') or [])] + list(c['pages'])
    for k in dict.fromkeys(keys):
        cmap.setdefault(D.T[k]['file'], []).append([c['n'], CFILE[c['s']]])
json.dump(cmap, open(src / 'live/concerns-map.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(len(built), 'pages written:', ', '.join(built))
