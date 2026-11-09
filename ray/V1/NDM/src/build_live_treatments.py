"""Build every treatment page from the live site's own words (src/live/services.json, crawled from newdermamedlaserclinic.com)
in the Botox / Aptos page layout: promotion.html shell + procedure-ui.jsx (components only) + treatment-ui.jsx + live-treatment-ui.jsx.
usage: python3 src/build_live_treatments.py <NDM dir> <src dir> [slug ...]
Writes one <slug>.html per live treatment page (the menu's 50 pages plus 4 pages that exist on the live site outside the menu).
The Aptos thread lift page keeps the team's own aptos-thread-lift.html (the one page whose copy may change).
"""
import json, re, sys, html as H
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
sys.path.insert(0, str(src))
ONLY = set(sys.argv[3:])
LIVE = json.load(open(src / 'live/services.json', encoding='utf-8'))
PRICING = json.load(open(src / 'live/pricing.json', encoding='utf-8'))['pricing']['cats']
MENU = json.load(open(src / 'live/menu.json', encoding='utf-8'))
IMG_MAP = json.load(open(src / 'live/images.json', encoding='utf-8')) if (src / 'live/images.json').exists() else {}
CMAP = json.load(open(src / 'live/concerns-map.json', encoding='utf-8')) if (src / 'live/concerns-map.json').exists() else {}   # file -> [[concern, concern page]] (src/build_concerns.py)
BIO = {'injectables/sculptra', 'injectables/radiesse'}   # Raymond (7 Nov 2026): Sculptra and Radiesse are bio-stimulators (menu group, breadcrumb, treatment type)
EM_DASH = 'comma'   # approved by Raymond 7 Nov 2026 (approval item A1): em dashes and spaced en dashes in the live copy become commas (src/live_text.py)
FACT_TYPE = 'section'   # approved by Raymond 7 Nov 2026 (item B8): the live site says "Treatment Type: Injectable" on all 56 pages (a template default); the type now follows the page's section, medical dermatology pages say "Skin conditions" (his note)
TYPE_BY_SECTION = [('injectables/', 'Injectable'), ('body/hyperhidrosis', 'Injectable'), ('thread-lift/', 'Thread lift'), ('laser/', 'Laser'), ('veins/endovenous-laser-evlt', 'Laser'), ('hair/laser-hair-rejuvenation', 'Laser'),
                   ('skin/aesthetic/visia-skin-analysis', 'Skin analysis'), ('skin/aesthetic/', 'Skin treatment'), ('skin/medical-dermatology/', 'Skin conditions'), ('body/', 'Body treatment'), ('veins/', 'Vein treatment'), ('hair/', 'Hair treatment')]


def facts_of(p):
    if p['path'] in BIO: return [[k, 'Bio-stimulator' if k == 'Treatment Type' else v] for k, v in p['facts']]
    if FACT_TYPE != 'section': return p['facts']
    kind = next((t for prefix, t in TYPE_BY_SECTION if p['path'].startswith(prefix)), None)
    return [[k, kind if k == 'Treatment Type' and kind else v] for k, v in p['facts']]

shell = (root / 'promotion.html').read_text(encoding='utf-8')
shell = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', shell, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build
shell = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', shell, count=1)
proc_ui = (src / 'procedure-ui.jsx').read_text(encoding='utf-8')
proc_ui = proc_ui[proc_ui.index('const CALLS = '):]          # the components only; the Botox PROC data stays with build_procedure.py
treat_ui = (src / 'treatment-ui.jsx').read_text(encoding='utf-8')
live_ui = (src / 'live-treatment-ui.jsx').read_text(encoding='utf-8')
media_ui = (src / 'live-media-ui.jsx').read_text(encoding='utf-8')   # film, reel, before/after cases, visit us (8 Nov 2026)
MEDIA_CSS = re.search(r'const MEDIA_CSS = `(.*?)`;', media_ui, re.S).group(1)
pricing_ui = (src / 'pricing-ui.jsx').read_text(encoding='utf-8')
price_rows = pricing_ui[pricing_ui.index('/* a closed treatment row'):pricing_ui.index('/* ---------------------------------------------------------------- hero: NDM')]
LIVE_CSS = re.search(r'const LIVE_CSS = `(.*?)`;', live_ui, re.S).group(1)

# ---- media per page (Raymond, 8 Nov 2026: real pictures and motion on every treatment page), see src/live_media.py
import live_media as M   # noqa: E402
FILM_BY_SECTION = [('laser/', 'slide-3'), ('skin/aesthetic/', 'slide-2'), ('skin/medical-dermatology/', 'slide-2')]   # laser pages: the treatment clip; skin pages: the boutique; everything else: the clinic front (slide-1)
REEL_BY_PATH = {'injectables/botox': 'botox', 'injectables/juvederm': 'filler', 'injectables/dermal-fillers': 'filler', 'injectables/lip-augmentation': 'filler', 'injectables/tear-trough-correction': 'filler', 'injectables/soft-lift': 'filler',
                'skin/aesthetic/exosome-therapy': 'exosome', 'hair/exosome-therapy-for-hair': 'exosome', 'skin/aesthetic/dermamelan': 'dermamelan-1', 'skin/medical-dermatology/melasma': 'dermamelan-2', 'skin/medical-dermatology/hyperpigmentation': 'dermamelan-2',
                'laser/laser-skin-resurfacing': 'laser', 'laser/micro-laser-peel': 'laser', 'laser/acne-scar': 'laser', 'skin/aesthetic/scar-removal': 'laser'}
CASES_BY_PATH = {'injectables/botox': ['Botox'], 'skin/aesthetic/wrinkle-treatments': ['Botox'], 'injectables/double-chin/belkyra-kybella': ['Belkyra'],
                 'skin/aesthetic/chemical-peels': ['Chemical peel', 'Laser acne Chemical peels'], 'skin/aesthetic/acnelan': ['Laser acne Chemical peels', 'Chemical peel'],
                 'skin/aesthetic/dermamelan': ['Dermamelan'], 'skin/medical-dermatology/melasma': ['Dermamelan'], 'skin/medical-dermatology/hyperpigmentation': ['Dermamelan'],
                 'laser/laser-skin-resurfacing': ['Fractional skin resurfacing'], 'laser/micro-laser-peel': ['Fractional skin resurfacing'],
                 'injectables/tear-trough-correction': ['Tear Troughs'], 'skin/aesthetic/dark-circles': ['Tear Troughs'], 'body/stretch-marks': ['Stretch Marks'],
                 'hair/hair-loss-treatments': ['PRP Hair'], 'hair/hair-rejuvenation': ['PRP Hair'], 'skin/medical-dermatology/mole-removal': ['Mole removal'],
                 'skin/aesthetic/microneedling': ['Microneedling'], 'skin/aesthetic/scar-removal': ['Microneedling', 'Fractional skin resurfacing'], 'laser/acne-scar': ['Microneedling', 'Fractional skin resurfacing'],
                 'injectables/lip-augmentation': ['Lip fillers'], 'injectables/dermal-fillers': ['Lip fillers', 'Tear Troughs'], 'injectables/juvederm': ['Lip fillers', 'Tear Troughs'],
                 'skin/medical-dermatology/acne-treatments': ['Laser acne', 'Laser acne Chemical peels']}
GALLERY = M.gallery(root, src)


def media_of(p, short):
    clip = next((v for k, v in FILM_BY_SECTION if p['path'].startswith(k)), 'slide-1')
    rk = REEL_BY_PATH.get(p['path'])
    labels = CASES_BY_PATH.get(p['path'])
    return M.film(clip, short), (M.reel(rk) if rk else None), (M.cases(GALLERY, labels) if labels else None)

BASE = 'https://newdermamedlaserclinic.com/'


def slugify(s):
    """the shell's slug(): lower case, ® and ™ dropped, anything else non alphanumeric becomes a dash"""
    k = re.sub(r'[®™]', '', s.lower())
    k = re.sub(r'[^a-z0-9]+', '-', k).strip('-')
    return k


# menu label and group for every live path (the breadcrumb and the file name come from the menu label)
NAV = {}
for m in MENU:
    for g in m['groups']:
        for label, path in g['items']:
            NAV[path] = {'label': label, 'group': m['label'], 'sub': g['title']}

# which price list category (and which of its treatments) belongs on a page. Only direct matches; every other page links to the price list.
PRICE_MAP = {
    'injectables/botox': ('Botox / Dysport', ['Botox Cosmetic', 'Dysport']),
    'body/hyperhidrosis': ('Botox / Dysport', ['Hyperhidrosis']),
    'laser/laser-vein-removal': ('Laser Vein', None), 'laser/vein-removal-treatment': ('Laser Vein', None), 'veins/spider-vein-removal': ('Laser Vein', None),
    'injectables/dermal-fillers': ('Dermal Fillers', None), 'injectables/juvederm': ('Dermal Fillers', None),
    'injectables/lip-augmentation': ('Dermal Fillers', ['Lip Enhancement']),
    'injectables/radiesse': ('Skin Booster and Bio-stimulators', 'Radiesse'), 'injectables/sculptra': ('Skin Booster and Bio-stimulators', 'Sculptra'),
    'injectables/mesotherapy-and-skin-boosters': ('Skin Booster and Bio-stimulators', 'Skin Booster'),
    'body/non-surgical-bbl': ('Non-Surgical Butt Lift', None),
    'skin/aesthetic/microneedling': ('Microneedling', None),
    'skin/medical-dermatology/acne-treatments': ('Laser Acne Treatment', None),
    'laser/laser-skin-resurfacing': ('Laser Skin Resurfacing', 'Laser Skin Resurfacing'),
    'laser/micro-laser-peel': ('Laser Skin Resurfacing', 'Laser Peel'),
    'skin/aesthetic/photo-rejuvenation': ('Photo-Rejuvenation', None),
    'body/skin-tightening': ('2D & 3D Laser Skin Tightening', None), 'laser/laser-skin-tightening': ('2D & 3D Laser Skin Tightening', None),
    'skin/aesthetic/age-element-facial': ('Facial', ['Age Element Facial']),
    'skin/aesthetic/chemical-peels': ('Chemical Peel', None), 'skin/aesthetic/acnelan': ('Chemical Peel', ['Acnelan']),
    'skin/aesthetic/dermamelan': ('Depigmenting Treatment', None),
    'hair/hair-loss-treatments': ('Hair Loss', 'PRP'), 'hair/laser-hair-rejuvenation': ('Hair Loss', ['Laser Hair Rejuvenation']), 'hair/hair-rejuvenation': ('Hair Loss', None),
    'laser/laser-hair-removal': ('Laser Hair Removal', None),
    'body/vaginal-tightening': ('Laser Vaginal Tightening', None),
    'body/coolsculpting': ('Coolsculpting & Tight Sculpting', 'Coolsculpting'), 'body/tightsculpting': ('Coolsculpting & Tight Sculpting', 'Tight Sculpting'),
    'body/snoring-treatment': ('Snoring Treatment', None), 'body/nail-fungus-treatment': ('Toenail Fungus Removal', None),
}
UNIT_CATS = {'Botox / Dysport'}


def prices_for(path):
    m = PRICE_MAP.get(path)
    if not m: return None
    cat_name, pick = m
    cat = next(c for c in PRICING if c['name'] == cat_name)
    items = cat['items']
    if isinstance(pick, list): items = [i for i in items if i['name'] in pick]
    elif isinstance(pick, str):
        if cat_name == 'Coolsculpting & Tight Sculpting' and pick == 'Coolsculpting': items = [i for i in items if 'Tight' not in i['name']]
        elif cat_name == 'Laser Skin Resurfacing' and pick == 'Laser Skin Resurfacing': items = [i for i in items if 'Laser Peel' not in i['name']]
        else: items = [i for i in items if pick.lower() in i['name'].lower()]
    rows = [[i['name'], i['note'], [[r['label'], float(r['price']), float(r['was']) if r['was'] else 0, r['badge']] for r in i['rows'] if r['price']]] for i in items]
    assert rows and all(r[2] for r in rows), (path, cat_name)
    return {'cat': cat_name, 'unit': cat_name in UNIT_CATS, 'items': rows}


# file names of every built page, so links between treatment pages can point at the new pages
FILES = {}
for p in LIVE:
    if p['path'] in ('service-page', 'thread-lift/non-surgical-facelift'): continue
    label = NAV.get(p['path'], {}).get('label') or p['hero']['h1']
    FILES[p['path']] = slugify(label) + '.html'
FILES['thread-lift/non-surgical-facelift'] = 'aptos-thread-lift.html'
LINK_MAP = {BASE + k + '/': v for k, v in FILES.items()}
LINK_MAP.update({BASE + 'contact-us/': 'about.html#contact', BASE + 'fees-financing/': 'pricing.html#prices', BASE + 'about-us/': 'about.html', BASE + 'promotion/': 'promotion.html', BASE + 'blog/': 'blog.html'})


def fix_links(html):
    def rep(m):
        href = H.unescape(m.group(1))
        return 'href="' + H.escape(LINK_MAP.get(href, href), quote=True) + '"'
    return re.sub(r'href="([^"]+)"', rep, html)


from live_text import dashes as _dashes   # noqa: E402


def dashes(s):
    return _dashes(s) if EM_DASH == 'comma' else s


def img(url):
    return IMG_MAP.get(url, url)


def page_data(p):
    nav = NAV.get(p['path'])
    h1 = p['hero']['h1']
    crumbs = [['Procedures']]
    if p['path'] in BIO:
        crumbs.append(['Bio-stimulators'])
    elif nav:
        crumbs.append([nav['group']])
        if nav['sub']: crumbs.append([nav['sub']])
    else:
        crumbs.append([{'laser': 'Laser', 'hair': 'Hair Loss', 'veins': 'Veins'}.get(p['path'].split('/')[0], 'Treatments')])
    crumbs.append(h1)
    faqs = [[re.sub(r'^\d+\.\s*', '', q), dashes(t)] for q, a, t in p['faq']['items']]
    ft = p['faq']['title']
    m = re.match(r'^(FAQs?\s+(?:For|for|About|about)?)\s*(.*)$', ft)
    faq_lead, faq_strong = (m.group(1).strip(), m.group(2).strip()) if m and m.group(2) else (ft, '')
    d = {
        'crumbs': crumbs, 'h1': h1, 'short': nav['label'] if nav else h1, 'sub': dashes(p['hero']['sub']),
        'hero': {'d': img(p['hero'].get('bg_d') or p['why']['img']), 'm': img(p['hero'].get('bg_m') or p['hero'].get('bg_d') or p['why']['img']), 'pos': '50% 30%'},   # the live page's own hero photo (desktop and phone files)
        'facts': facts_of(p),
        'benefits': [{'title': b['title'], 'img': img(b['img']), 'alt': b['alt'] or f"{h1} at NewDermaMed, Toronto", 'items': [[t, dashes(x)] for t, x in b['items']]} for b in p['benefits']],   # the live alt texts are empty: a plain descriptive alt (8 Nov 2026)
        'tabs': [{'label': t['label'], 'html': fix_links(dashes(t['html']))} for t in p['tabs']],
        'choose': {'title': p['why']['title'], 'img': img(p['why']['img']), 'alt': p['why']['alt'] or f"{h1} at NewDermaMed, Toronto", 'html': fix_links(dashes(p['why']['html']))},
        'faq': {'lead': faq_lead, 'strong': faq_strong, 'sub': dashes(p['faq']['sub'])},
        'faqs': faqs,
        'prices': prices_for(p['path']),
        'concerns': CMAP.get(FILES[p['path']], []),
        # why NewDermaMed: the shared block from the team's Botox page (team copy, not from the live page)
        'why': {'img': 'assets/home/team-award.jpg', 'alt': 'The NewDermaMed team celebrating their Top Choice Award at the clinic', 'pos': '50% 35%', 'lead': 'Expert care at', 'strong': 'two Toronto clinics',
                'items': [['16+', 'Years', 'Caring for patients in Toronto'], ['8', 'Awards', 'Top Choice Award, 2019 to 2026'], ['Licensed', 'Medical team', 'Treatments are given only by our licensed medical team'], ['Free', 'Consultation', 'Every plan starts with an in-person assessment']]},
    }
    film, reel, cases = media_of(p, d['short'])
    d['film'], d['reel'], d['cases'] = film, reel, cases
    nav = [['benefits', 'Benefits'], ['film', 'The clinic'], ['overview', 'About'], ['why-choose', 'Why choose']]
    if reel: nav.append(['watch', 'Watch'])
    if cases: nav.append(['results', 'Results'])
    if d['prices']: nav.append(['prices', 'Prices'])
    nav += [['why', 'Why NewDermaMed'], ['visit', 'Visit us'], ['faq', 'FAQ']]
    d['nav'] = nav
    return d


CSS_PROC = (src / 'build_procedure.py').read_text(encoding='utf-8')
CSS_PROC = CSS_PROC[CSS_PROC.index("css = '''") + 9:CSS_PROC.index("'''\nanchor")]   # the Botox page's CSS block, unchanged

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
        <Breadcrumb items={PROC.crumbs} dark />
        <LiveHero p={PROC} />
        <TxGlance p={PROC} />
        <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden"><ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" /></section>
        <TxNav p={PROC} />
        <LiveBenefits key={PROC.benefits[0].title} p={PROC} b={PROC.benefits[0]} idx={0} />
        <TxFilm p={PROC} />
        {PROC.benefits.slice(1).map((b, i) => <LiveBenefits key={b.title} p={PROC} b={b} idx={i + 1} />)}
        <LiveTabs p={PROC} />
        <LiveWhy p={PROC} />
        {PROC.reel && <TxReel p={PROC} />}
        {PROC.cases && <TxCases p={PROC} />}
        <TxConcerns items={PROC.concerns} />
        {PROC.prices && <LivePrices p={PROC} />}
        <TxWhy p={PROC} />
        <Partners />
        <Team />
        <PromoReviews />
        <TxVisit p={PROC} />
        <ProcAnalysis />
        <Faq items={PROC.faqs} lead={PROC.faq.strong ? <>{PROC.faq.lead}<br /></> : PROC.faq.lead} strong={PROC.faq.strong} intro={PROC.faq.sub} />
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

PRICES_UI = r'''
/* ---------------------------------------------------------------- prices for this treatment: the matching rows of the live price list, in the Pricing page's look */
function LivePrices({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const pr = p.prices;
  const cat = { name: pr.cat, unit: pr.unit };
  const [open, setOpen] = useState(pr.items.length === 1 ? 0 : -1);
  const n = pr.items.reduce((a, it) => a + it[2].length, 0);
  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 scroll-mt-[170px] px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <TxHead p={p} id="prices" tag="Price list" hid="prices-title" lead={p.short} strong="prices and packages" text={`${n} options from the ${pr.cat} section of our price list. Your plan and final price are confirmed at your free consultation.`} />
      <div className={TX_WRAP}>
        <ul className="pr-groups rv mx-auto mt-[clamp(40px,4.5vw,64px)] max-w-[1040px]" role="list" style={{ transitionDelay: '.14s' }}>
          <li className="pr-group is-open">
            <div className="pr-body"><div><ul className="pr-sub" role="list">
              {pr.items.map((it, i) => <TreatmentRow key={it[0]} cat={cat} it={it} uid={`lp-${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)}
            </ul></div></div>
          </li>
        </ul>
        <div className="rv mt-10 flex flex-wrap justify-center gap-3" style={{ transitionDelay: '.18s' }}>
          <Btn href="#/book" v="book">Book Free Consultation</Btn>
          <Btn href="pricing.html#prices" v="line">All treatment prices</Btn>
        </div>
        <div className="mt-6 flex justify-center"><PayPlans /></div>
        <p className="mt-6 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation.</p>
      </div>
    </section>
  );
}
'''


def build(p):
    d = page_data(p)
    out = FILES[p['path']]
    s = shell
    i = s.rindex('</style>', 0, s.index('<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'))
    s = s[:i] + CSS_PROC + LIVE_CSS + MEDIA_CSS + s[i:]
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'}] +
         [{'@type': 'ListItem', 'position': k + 2, 'name': (c[0] if isinstance(c, list) else c)} for k, c in enumerate(d['crumbs'])]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in d['faqs']]},
    ]}
    title = p['seo']['title'] or f"{d['h1']}, NewDermaMed Toronto"
    desc = dashes(p['seo']['description'] or p['hero']['sub'])   # the live meta description, dashes to commas like the rest of the copy (A1)
    assert s.count('<title>Promotions, NewDermaMed Toronto</title>') == 1
    s = s.replace('<title>Promotions, NewDermaMed Toronto</title>', '<title>' + H.escape(title) + '</title>')
    old_desc = '<meta name="description" content="Current offers on lip filler, microneedling, peels, laser and skin boosters at NewDermaMed, Toronto. Every treatment starts with a free consultation.">'
    assert s.count(old_desc) == 1
    s = s.replace(old_desc, '<meta name="description" content="' + H.escape(desc, quote=True) + '">\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')
    a = s.index('\nfunction App() {')
    b = s.index('ReactDOM.createRoot', a)
    data = '/* ---------------------------------------------------------------- this page: every word from ' + p['url'] + ' (src/live/services.json) */\nconst PROC = ' + json.dumps(d, ensure_ascii=False, indent=1).replace('</script', '<\\/script') + ';\n'
    ui = data + proc_ui + '\n' + treat_ui + '\n' + price_rows + '\n' + live_ui + media_ui + PRICES_UI
    s = s[:a] + '\n' + ui + '\n/* ---------------------------------------------------------------- app (treatment page, live content) */' + APP + s[b:]
    (root / out).write_text(s, encoding='utf-8')
    return out


built = []
for p in LIVE:
    if p['path'] not in FILES or FILES[p['path']] == 'aptos-thread-lift.html': continue
    if ONLY and FILES[p['path']].replace('.html', '') not in ONLY: continue
    built.append((p['path'], build(p)))
json.dump({k: v for k, v in FILES.items()}, open(src / 'live/pages-built.json', 'w'), indent=1)
print(len(built), 'treatment pages written:', ', '.join(f for _, f in built))
