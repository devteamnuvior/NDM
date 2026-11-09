"""Build the concern page wrinkles-fine-lines.html: the article page's layout (blog-ui.jsx + article-ui.jsx) blended with the
treatment pages' sections (procedure-ui.jsx + treatment-ui.jsx), content in concern-ui.jsx. Built from promotion.html.
usage: python3 build_concern.py <ndm-homepage dir> <scratch dir>
"""
import json
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
parts = ['blog-ui.jsx', 'article-ui.jsx', 'procedure-ui.jsx', 'treatment-ui.jsx', 'concern-ui.jsx']
ui = '\n'.join((scratch / p).read_text() for p in parts)
OUT = 'wrinkles-fine-lines.html'


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


def css_of(build):
    """the page CSS block of another build script, so the two looks stay in step"""
    src = (scratch / build).read_text()
    return re.search(r"\ncss = '''(.*?)'''", src, re.S).group(1)


faqs = re.search(r"  faqs: \[\n(.*?)\n  \],\n  related", (scratch / 'concern-ui.jsx').read_text(), re.S).group(1)
faq_pairs = re.findall(r"\['(.+?)', '(.+?)'\],?", faqs)
assert len(faq_pairs) == 5, len(faq_pairs)
ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Concerns'},
        {'@type': 'ListItem', 'position': 3, 'name': 'Wrinkles & Fine Lines'}]},
    {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a.replace("\\'", "'")}} for q, a in faq_pairs]},
]}
rep('<title>Promotions, NewDermaMed Toronto</title>', '<title>Wrinkles &amp; Fine Lines, Treatments in Toronto, NewDermaMed</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    '<meta name="description" content="What causes wrinkles and fine lines, the kinds of lines we see, and the non-surgical treatments that may help, at NewDermaMed Uptown and Downtown Toronto.">\n'
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')

css = css_of('build_article.py') + css_of('build_procedure.py') + '''
  /* concern page: the treatment cards row (same as the home menu row) */
  .side-rail::before,.side-rail::after{content:"";position:absolute;top:0;bottom:0;z-index:2;width:var(--gx);pointer-events:none}
  .side-rail::before{left:0;background:linear-gradient(90deg,#FAFAF8 15%,rgba(250,250,248,0))}
  .side-rail::after{right:0;background:linear-gradient(270deg,#FAFAF8 15%,rgba(250,250,248,0))}
  .side-arrow{position:absolute;top:42%;z-index:3;display:grid;place-items:center;width:48px;height:48px;border-radius:999px;background:#fff;color:#1B242B;box-shadow:0 14px 30px -14px rgba(27,36,43,.45),0 0 0 1px rgba(27,36,43,.08);transform:translateY(-50%);transition:background-color .25s ease,color .25s ease,opacity .25s ease}
  .side-arrow:hover{background:#0F80C3;color:#fff}
  .side-arrow:disabled{opacity:0;pointer-events:none}
  .side-arrow.is-l{left:max(8px,calc(var(--gx) - 24px))}
  .side-arrow.is-r{right:max(8px,calc(var(--gx) - 24px))}
  @media (max-width:767px){.side-arrow{display:none}}
  .tm-card2{width:78%;max-width:340px;box-shadow:0 22px 44px -36px rgba(27,36,43,.45);transition:box-shadow .45s var(--e-out),transform .45s var(--e-out)}
  @media (min-width:640px){.tm-card2{width:44%}}
  @media (min-width:1024px){.tm-card2{width:calc((100% - 48px) / 4.25);max-width:none}}
  .tm-card2:hover{transform:translateY(-3px);box-shadow:0 30px 56px -36px rgba(27,36,43,.55)}
  /* the benefit cards sit inside the article column: no bullet dots */
  .article-prose .cn-cards li{padding-left:1rem}
  .article-prose .cn-cards li::before{content:none}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

a = s.index('\nfunction App() {')
b = s.index('ReactDOM.createRoot', a)
app = r'''
function App() {
  const cart = useCartState();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useOnScroll(() => {
    const probe = 70;
    setDark([...document.querySelectorAll('[data-nav="dark"]')].some((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
  }, []);
  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);
  const related = CONCERN.related.map((k) => BLOG_POSTS.find((p) => p.slug.startsWith(k))).filter(Boolean);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <ReadProgress />
      <main id="main">
        <Breadcrumb items={['Concerns', CONCERN.name]} />
        <article aria-labelledby="concern-title">
          <ConcernHead c={CONCERN} />
          <ConcernBody c={CONCERN} />
        </article>
        <ConcernTreatments c={CONCERN} />
        <ProcOverview p={CONCERN} />
        <ProcCompare p={CONCERN} />
        <Team />
        <PromoReviews />
        <ProcAnalysis />
        <Faq items={CONCERN.faqs} lead="Wrinkle treatments," strong="your questions answered" intro="What people ask us most about lines, wrinkles and the treatments that may help." />
        <RelatedStories items={related} />
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
s = s[:a] + '\n' + ui + '\n/* ---------------------------------------------------------------- app (concern page) */' + app + s[b:]
(root / OUT).write_text(s)
print('wrote', OUT, len(s))
