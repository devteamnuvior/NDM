"""Build the concern page wrinkles-fine-lines.html (round 20): Ray's concern page structure and copy (src/concern-data.json,
src/concern-ui.jsx) in this site's treatment-page look, with the Botox page's header, form, glance card, section bar, Before &
after photo cases and spacing. No clinic film. Built from promotion.html; run tools/prerender.py after it.
usage: python3 src/build_concern.py <NDM dir> <src dir>
"""
import json
import re
import sys
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text(encoding='utf-8')
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
ui = '\n'.join((src / f).read_text(encoding='utf-8') for f in ['procedure-ui.jsx', 'treatment-ui.jsx', 'concern-ui.jsx'])
CN = json.load(open(src / 'concern-data.json', encoding='utf-8'))
OUT = 'wrinkles-fine-lines.html'
proc_build = (src / 'build_procedure.py').read_text(encoding='utf-8')
CSS_PROC = re.search(r"\ncss = '''(.*?)'''", proc_build, re.S).group(1)       # the Botox page's look (seamless sections, peach, tabs)
SPACING = re.search(r"\nSPACING = '''(.*?)'''", proc_build, re.S).group(1)    # and its spacing and alignment
CN_CSS = re.search(r'const CN_CSS = `(.*?)`;', ui, re.S).group(1)


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


SITE = 'https://newdermamedlaserclinic.com/'
URL = SITE + OUT
TITLE = 'Wrinkles & Fine Lines Treatment Toronto | NewDermaMed'
DESC = ('Treatments for wrinkles and fine lines in Toronto: 11 options compared, with a free consultation and VISIA® skin analysis '
        'at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.')
H = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'MedicalWebPage', '@id': URL + '#webpage', 'url': URL, 'name': TITLE, 'description': DESC, 'inLanguage': 'en-CA',
     'about': {'@type': 'MedicalCondition', 'name': 'Wrinkles and fine lines'}, 'breadcrumb': {'@id': URL + '#breadcrumb'}},
    {'@type': 'BreadcrumbList', '@id': URL + '#breadcrumb', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE},
        {'@type': 'ListItem', 'position': 2, 'name': 'Concerns'},
        {'@type': 'ListItem', 'position': 3, 'name': 'Wrinkles & Fine Lines', 'item': URL}]},
    {'@type': 'FAQPage', '@id': URL + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in CN['faqs']]},
]}
HEAD = '\n'.join([
    f'<link rel="canonical" href="{URL}">', '<meta property="og:type" content="website">', '<meta property="og:site_name" content="NewDermaMed">',
    f'<meta property="og:url" content="{URL}">', f'<meta property="og:title" content="{H(TITLE)}">', f'<meta property="og:description" content="{H(DESC)}">',
    f'<meta property="og:image" content="{SITE}{CN["hero"]["d"]}">', '<meta name="twitter:card" content="summary_large_image">',
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>'])
rep('<title>Promotions, NewDermaMed Toronto</title>', f'<title>{H(TITLE)}</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    f'<meta name="description" content="{H(DESC)}">\n' + HEAD)

css = CSS_PROC + SPACING + CN_CSS + '''
  /* concern page (round 20): sections that came with their own grey band share the paper colour of the Botox page */
  main>section#assess{background-color:#FAFAF8!important}
  /* round 24: home care keeps its soft blue wash between paper edges */
  html main>section#home-care.cn-hc{background-image:linear-gradient(180deg,#FAFAF8 0%,#EEF5FA 40%,#F4F1EA 75%,#FAFAF8 100%)!important}
  /* the same section spacing as the Botox page */
  main>section#understand,main>section#assess,main>section#home-care,main>section#read{padding-top:clamp(64px,7vw,104px)!important;padding-bottom:clamp(64px,7vw,104px)!important}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

a = s.index('\nfunction App() {')
b = s.index('ReactDOM.createRoot', a)
app = r'''
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
        <ProcHero p={CN} />
        <TxGlance p={CN} />
        <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden"><ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" /></section>
        <TxNav p={CN} />
        <CnIntro p={CN} />
        <CnUnderstand p={CN} />
        <CnAssess p={CN} />
        <CnOptions p={CN} />
        <CnCompare p={CN} />
        <TxExpect p={CN} />
        <TxResults p={CN} />
        <CnHome p={CN} />
        <TxWhy p={CN} />
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
data = '/* ---------------------------------------------------------------- the concern (src/concern-data.json) */\nconst CN = ' + json.dumps(CN, ensure_ascii=False) + ';\n' + \
  '/* round 29: option prices come from the price list (priceFor) */\n[...CN.opts, ...(CN.bio || [])].forEach((o) => { const v = priceFor(o.n); if (v && o.price) o.price[0] = v; });\n'
s = s[:a] + '\n' + ui + '\n' + data + '\n/* ---------------------------------------------------------------- app (concern page) */' + app + s[b:]
(root / OUT).write_text(s, encoding='utf-8')
print('wrote', OUT, len(s))
