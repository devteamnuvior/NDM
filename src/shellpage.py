"""Shared helper for simple pages built from promotion.html (round 29): swaps the title and description, adds CSS, and replaces
the App with the page's own body inside the site header and footer. Used by build_account.py and build_legal.py."""
import re
from pathlib import Path

APP = r'''
function App() {
  const cart = useCartState();
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={false} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main" className="pt-[176px] xl:pt-[204px]">
        <Breadcrumb items={%(crumbs)s} />
        <%(page)s />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'pricing.html#prices'; }} />
      <CartPill onOpen={() => setCartOpen(true)} hidden={cartOpen || drawer || search} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />
      <ChatBot ready hidden={cartOpen || drawer || search} />
    </CartCtx.Provider>
  );
}

'''
H = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def make_page(root, out, title, desc, ui, css, page, crumbs, noindex=True):
    root = Path(root)
    s = (root / 'promotion.html').read_text(encoding='utf-8')
    s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
    s = s.replace('<title>Promotions, NewDermaMed Toronto</title>', f'<title>{H(title)}</title>', 1)
    m = re.search(r'<meta name="description" content="[^"]*">', s)
    s = s.replace(m.group(0), f'<meta name="description" content="{H(desc)}">' + ('\n<meta name="robots" content="noindex, nofollow">' if noindex else ''), 1)
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + css + s[i:]
    a = s.index('\nfunction App() {')
    b = s.index('ReactDOM.createRoot', a)
    s = s[:a] + '\n' + ui + '\n' + (APP % {'page': page, 'crumbs': crumbs}) + s[b:]
    (root / out).write_text(s, encoding='utf-8')
    print('wrote', out, len(s))
