"""Build the skincare shop from the live shop (src/live/shop.json and shop-home.json, crawled from shop.newdermamedlaserclinic.com):
shop.html (every section of the live shop home, text verbatim, plus the full catalogue with filters) and one shop-<slug>.html per product.
usage: python3 src/build_live_shop.py <NDM dir> <src dir>
"""
import json, re, sys, html as H
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
SHOP = json.load(open(src / 'live/shop.json', encoding='utf-8'))
HOME = json.load(open(src / 'live/shop-home.json', encoding='utf-8'))
IMG_MAP = json.load(open(src / 'live/images.json', encoding='utf-8')) if (src / 'live/images.json').exists() else {}

shell = (root / 'promotion.html').read_text(encoding='utf-8')
shell = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', shell, count=1)
proc_ui = (src / 'procedure-ui.jsx').read_text(encoding='utf-8')
proc_ui = proc_ui[proc_ui.index('const CALLS = '):proc_ui.index('/* ---------------------------------------------------------------- booking form')]   # CALLS, twoLine, icons
treat_ui = (src / 'treatment-ui.jsx').read_text(encoding='utf-8')
treat_ui = treat_ui[:treat_ui.index('/* treatment at a glance')]   # TX_WRAP, TxHead
live_ui = (src / 'live-treatment-ui.jsx').read_text(encoding='utf-8')
LIVE_CSS = re.search(r'const LIVE_CSS = `(.*?)`;', live_ui, re.S).group(1)
shop_ui = (src / 'shop-ui.jsx').read_text(encoding='utf-8')
SHOP_CSS = re.search(r'const SHOP_CSS = `(.*?)`;', shop_ui, re.S).group(1)
CSS_PRICING = (src / 'build_pricing.py').read_text(encoding='utf-8')
CSS_PRICING = CSS_PRICING[CSS_PRICING.index("css = r'''") + 10:CSS_PRICING.index("'''", CSS_PRICING.index("css = r'''") + 10)]   # the price list look (badges, offers)


def img(url):
    return IMG_MAP.get(url, url)


def with_imgs(o):
    if isinstance(o, list): return [with_imgs(x) for x in o]
    if isinstance(o, dict): return {k: with_imgs(v) for k, v in o.items()}
    if isinstance(o, str) and o.startswith('http') and re.search(r'\.(png|jpe?g|webp|svg|gif)$', o, re.I): return img(o)
    return o


BUILT = json.load(open(src / 'live/pages-built.json'))
LIVE_LINKS = dict(BUILT, **{'about-us': 'about.html', 'contact-us': 'about.html#contact', 'promotion': 'promotion.html', 'blog': 'blog.html', 'fees-financing': 'pricing.html#prices', 'before-after': 'before-after.html'})
products = with_imgs([{k: v for k, v in p.items() if k not in ('summary_text', 'desc')} for p in SHOP['products']])
home = with_imgs(HOME)
# the live shop's social row plays six clips from its theme folder; they are byte-identical to the home page reels, kept here once
SOCIAL_CLIPS = ['assets/live/main/uploads/2025/09/Filler-.mp4', 'assets/live/main/uploads/2025/09/botox-.mp4', 'assets/live/main/uploads/2025/11/exosome-.mp4',
                'assets/live/main/uploads/2025/10/dermamelan-1-.mp4', 'assets/live/main/uploads/2025/10/laser-.mp4', 'assets/live/main/uploads/2025/10/dermamelan-2-.mp4']
for sec in home:
    if sec['kind'] == 'social':
        sec['clips'] = [c for c in SOCIAL_CLIPS if (root / c).exists()]
        if not any(b[0] == 'a' for b in sec['tail']): sec['tail'] = sec['tail'] + [['a', '@newdermamed', 'https://www.instagram.com/newdermamed']]
# links inside blocks: the live shop's own product links become the new product pages (shopLink in the UI handles the rest)

APP_HEAD = r'''
function App() {
  const cart = useCartState();
  const [dark, setDark] = useState(DARK0);
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
        <Breadcrumb items={CRUMBS} dark={DARK0} />
        PAGE_BODY
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'shop.html#catalog'; }} />
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


def page(out, title, desc, crumbs, body, dark0, data_js, ld=None):
    s = shell
    i = s.rindex('</style>', 0, s.index('<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'))
    s = s[:i] + CSS_PRICING + LIVE_CSS + SHOP_CSS + s[i:]
    assert s.count('<title>Promotions, NewDermaMed Toronto</title>') == 1
    s = s.replace('<title>Promotions, NewDermaMed Toronto</title>', '<title>' + H.escape(title) + '</title>')
    old_desc = '<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">'
    assert s.count(old_desc) == 1
    s = s.replace(old_desc, '<meta name="description" content="' + H.escape(desc, quote=True) + '">' + ('\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>' if ld else ''))
    a = s.index('\nfunction App() {')
    b = s.index('ReactDOM.createRoot', a)
    app = APP_HEAD.replace('PAGE_BODY', body).replace('DARK0', 'true' if dark0 else 'false')
    ui = data_js + proc_ui + '\n' + treat_ui + '\n' + shop_ui
    s = s[:a] + '\n' + ui + '\nconst CRUMBS = ' + json.dumps(crumbs, ensure_ascii=False) + ';\n/* ---------------------------------------------------------------- app (shop) */' + app + s[b:]
    (root / out).write_text(s, encoding='utf-8')


def js(name, obj):
    return f'const {name} = ' + json.dumps(obj, ensure_ascii=False).replace('</script', '<\\/script') + ';\n'


# the shop page
seo = SHOP['home']['seo']
data = ('/* ---------------------------------------------------------------- the skincare shop: every word from shop.newdermamedlaserclinic.com (src/live/shop.json, shop-home.json) */\n'
        + js('SHOP', {'products': products, 'categories': SHOP['categories'], 'attributes': SHOP['attributes']}) + js('SHOP_HOME', home) + js('LIVE_LINKS', LIVE_LINKS))
page('shop.html', seo['title'] or 'Skincare shop, NewDermaMed Toronto', seo['description'] or '', ['Skincare shop'], '<ShopPage />', True, data)

# one page per product (the product list is shared, so related products and the cart work everywhere)
for p in products:
    seo = p.get('seo', {})
    ld = {'@context': 'https://schema.org', '@type': 'Product', 'name': p['name'], 'sku': p['sku'], 'description': p['short'] or '', 'brand': {'@type': 'Brand', 'name': (p['brands'] or [''])[0]},
          'image': [i[0] for i in p['images']], 'offers': {'@type': 'Offer', 'priceCurrency': 'CAD', 'price': p['price'], 'availability': 'https://schema.org/InStock' if p['in_stock'] else 'https://schema.org/OutOfStock'}}
    slim = [{k: v for k, v in x.items() if k in ('id', 'name', 'slug', 'price', 'regular', 'on_sale', 'short', 'images', 'categories', 'brands', 'attributes', 'in_stock', 'tags')} if x['slug'] != p['slug'] else x for x in products]
    data = js('SHOP', {'products': slim, 'categories': SHOP['categories'], 'attributes': SHOP['attributes']}) + js('SHOP_HOME', []) + js('LIVE_LINKS', LIVE_LINKS) + js('PRODUCT_SLUG', p['slug'])
    crumbs = [['Skincare shop', 'shop.html']] + ([[p['categories'][0], 'shop.html#catalog']] if p['categories'] else []) + [p['name']]
    page('shop-' + p['slug'] + '.html', seo.get('title') or f"{p['name']}, NewDermaMed skincare shop", seo.get('description') or p['short'], crumbs,
         "<ProductPage p={SHOP.products.find((x) => x.slug === PRODUCT_SLUG)} />", False, data, ld)
print('shop.html and', len(products), 'product pages written')
