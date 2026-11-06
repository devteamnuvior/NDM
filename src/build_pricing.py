"""Build pricing.html from promotion.html (the latest page shell) plus the pricing data and UI.
usage: python3 build_pricing.py <ndm-homepage dir> <scratch dir>
"""
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()

# the shell's own breadcrumb data belongs to the promotion page
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


# 1. page title + description
rep('<title>Promotions, NewDermaMed Toronto</title>', '<title>Treatments &amp; Pricing, NewDermaMed Toronto</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    '<meta name="description" content="Treatment prices and current offers at NewDermaMed, Toronto. Every treatment begins with a free consultation at our Uptown or Downtown clinic.">\n'
    '<script type="application/ld+json">{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "index.html"}, {"@type": "ListItem", "position": 2, "name": "Pricing"}]}</script>')

# 2. pricing CSS at the end of the main stylesheet
css = r'''
  /* pricing page: folding categories, folding treatment rows, sale prices, quantity stepper and cart */
  .pr-group{border-bottom:1px solid rgba(27,36,43,.24)}
  .pr-groups>.pr-group:first-child{border-top:1px solid rgba(27,36,43,.24)}
  .pr-sub{margin:14px 0 30px;padding:4px clamp(14px,2.4vw,28px);border-radius:22px;background:#fff;box-shadow:0 0 0 1px rgba(27,36,43,.08),0 18px 40px -32px rgba(15,60,95,.35)}
  .pr-sub .pr-opt{background:#FAFAF8}
  /* more air between treatments inside a category; option rows keep their spacing */
  .pr-sub>.pr-item{padding-block:10px}
  /* room either side of the clipping fold so the panel's outline and shadow are not cut off */
  .pr-group>.pr-body>div{margin:0 -16px;padding:0 16px}
  .pr-group.is-open>.pr-ghead{position:sticky;top:100px;z-index:5;background:#FAFAF8}
  @media (min-width:1280px){.pr-group.is-open>.pr-ghead{top:120px}}
  .pr-gplus{width:44px;height:44px}
  .pr-ghead button:hover .pr-gplus{border-color:#1B242B}
  .pr-group.is-open>.pr-ghead .pr-gplus{background:#1B242B;border-color:#1B242B;color:#fff}
  .pr-group.is-open>.pr-ghead .pr-gplus i+i{transform:rotate(0deg)}
  .pr-group.is-open>.pr-body{grid-template-rows:1fr}
  .pr-group.is-open>.pr-body>div{visibility:visible;transition-delay:0s}
  .pr-group .pr-item:last-child{border-bottom:0}
  .pr-item{border-bottom:1px solid rgba(27,36,43,.1)}
  .pr-plus{position:relative;display:block;width:36px;height:36px;border-radius:999px;border:1px solid rgba(27,36,43,.22);color:#1B242B;transition:background-color .35s ease,border-color .35s ease,color .35s ease}
  .pr-plus i{position:absolute;left:50%;top:50%;width:13px;height:1.5px;margin:-.75px 0 0 -6.5px;border-radius:2px;background:currentColor;transition:transform .45s var(--e-out)}
  .pr-plus i+i{transform:rotate(90deg)}
  .pr-head:hover .pr-plus,.pr-ghead button:hover .pr-gplus{border-color:#1B242B}
  /* hero scroll hint */
  .pr-scroll svg{animation:prScroll 1.8s ease-in-out infinite}
  @keyframes prScroll{0%,100%{transform:translateY(-2px)}50%{transform:translateY(4px)}}
  @media (prefers-reduced-motion:reduce){.pr-scroll svg{animation:none}}
  /* treatments inside an open category: a blue circle with a white plus, easier to see */
  .pr-sub .pr-plus{background:#0F80C3;border-color:#0F80C3;color:#fff}
  .pr-sub .pr-head:hover .pr-plus{background:#209ED9;border-color:#209ED9}
  .pr-item.is-open>h4 .pr-plus{background:#1B242B;border-color:#1B242B;color:#fff}
  .pr-item.is-open>h4 .pr-plus i+i{transform:rotate(0deg)}
  .pr-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s var(--e-out)}
  .pr-body>div{min-height:0;overflow:hidden;visibility:hidden;transition:visibility 0s linear .5s}
  .pr-item.is-open>.pr-body{grid-template-rows:1fr}
  .pr-item.is-open>.pr-body>div{visibility:visible;transition-delay:0s}
  .pr-opt{box-shadow:0 0 0 1px rgba(27,36,43,.07)}
  /* every offer badge, percentage or package deal, is red */
  .pr-badge,.pr-tag{display:inline-flex;align-items:center;border-radius:999px;white-space:nowrap;font-weight:700;line-height:1;background:#fff;color:#C0182C;box-shadow:inset 0 0 0 1.5px rgba(192,24,44,.55)}
  .pr-badge{padding:7px 12px;font-size:14px}
  .pr-tag{padding:6px 10px;font-size:12.5px;letter-spacing:.04em;text-transform:uppercase}
  @media (prefers-reduced-motion:reduce){.pr-body,.pr-body>div,.pr-plus i,.cart-pill{transition:none}.cart-bump,.pr-qty{animation:none}}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

# 4. pricing data + UI before the app, then the pricing app
data = (scratch / 'pricing-data.jsx').read_text()
ui = (scratch / 'pricing-ui.jsx').read_text()
helper = "/* laser hair removal: every package carries the site's BUY 1 GET 1 FREE badge */\nconst lhrB = (a, b, c, d) => [['Single session', a, 0], ['Package of 3', b, 0, 'BUY 1 GET 1 FREE'], ['Package of 5', c, 0, 'BUY 1 GET 1 FREE'], ...(d ? [['Package of 8', d, 0, 'BUY 1 GET 1 FREE']] : [])];\n"
data = data.replace('const PRICE_CATS = [', helper + 'const PRICE_CATS = [', 1)

a = s.index('function App() {')
b = s.index('ReactDOM.createRoot', a)
app = r'''function App() {
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
  const toPrices = (now) => { const el = document.getElementById('prices'); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 40, now === true); };
  /* other pages' empty cart links to pricing.html#prices; the list only exists once React has rendered */
  useEffect(() => {
    if (window.location.hash !== '#prices') return;
    /* after load, so the browser's own scroll restoration cannot undo it */
    let t = 0;
    const go = () => { t = setTimeout(() => toPrices(true), 120); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    return () => { clearTimeout(t); window.removeEventListener('load', go); };
  }, []);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main">
        <Breadcrumb items={['Pricing']} dark />
        <PricingHero />
        <PriceList />
        <Team />
        <Process />
        <BeforeAfter />
        <PromoReviews />
        <Faq items={PRICE_FAQS} lead="Your top questions," strong="answered" intro="Everything you need to know before starting your journey with us." />
        <Appointment />
      </main>
      <Footer />
      <CartPill onOpen={() => setCartOpen(true)} hidden={cartOpen || drawer || search} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={toPrices} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />
      <OfferPopup ready />
      <ChatBot ready hidden={cartOpen || drawer || search} />
    </CartCtx.Provider>
  );
}

'''
s = s[:a] + data + '\n' + ui + '\n/* ---------------------------------------------------------------- app (pricing page) */\n' + app + s[b:]

(root / 'pricing.html').write_text(s)
print('wrote pricing.html', len(s))
