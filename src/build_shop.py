"""Build shop.html (2026-11-18): the skincare shop, the prototype copy of the Next.js /shop page (web/src/components/shop/).
Built from promotion.html with src/shop-ui.jsx, the page CSS web/src/styles/shop-page.css and the data snapshot src/shop-data.json.
The snapshot is the online store's own product list (shop.newdermamedlaserclinic.com, public Store API, read only), mapped the same
way as web/src/lib/shop-store.ts. Refresh it with --refresh (needs the network); without it the saved snapshot is used.
usage: python3 src/build_shop.py <NDM dir> <src dir> [--refresh]"""
import html, json, re, sys, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from shellpage import make_page

ORIGIN = 'https://shop.newdermamedlaserclinic.com'
API = ORIGIN + '/wp-json/wc/store/v1/products'
CART = ORIGIN + '/cart/'
HIDDEN_CATEGORIES = {'Uncategorized'}
FACETS = [('brand', 'Brand', lambda p: [p['brand']] if p['brand'] else []), ('category', 'Category', lambda p: p['categories']),
          ('concern', 'Concern', lambda p: p['concerns']), ('skin', 'Skin type', lambda p: p['skinTypes']),
          ('type', 'Product type', lambda p: p['productTypes']), ('area', 'Area', lambda p: p['areas']),
          ('ingredient', 'Ingredient', lambda p: p['ingredients'])]


def plain(s):
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))
    s = re.sub(r'\s*[—–]\s*', ', ', s)
    return re.sub(r'\s+', ' ', s).strip()


def get(query):
    out, page = [], 1
    while True:
        q = '&'.join(f'{k}={v}' for k, v in {**query, 'per_page': 100, 'orderby': 'date', 'order': 'desc', 'page': page}.items())
        req = urllib.request.Request(f'{API}?{q}', headers={'Accept': 'application/json', 'User-Agent': 'NewDermaMed website (shop page prototype)'})
        with urllib.request.urlopen(req, timeout=20) as r:
            out += json.loads(r.read().decode('utf-8'))
            pages = int(r.headers.get('X-WP-TotalPages') or 1)
        if page >= min(pages, 10):
            return out
        page += 1


def to_image(img):
    sizes = []
    for part in img['srcset'].split(','):
        bits = part.strip().split()
        if len(bits) == 2 and re.fullmatch(r'\d+w', bits[1]) and 300 <= int(bits[1][:-1]) <= 1024:
            sizes.append((int(bits[1][:-1]), bits[0]))
    sizes.sort()
    mid = next((u for w, u in sizes if w >= 600), None)
    return {'src': mid or img['thumbnail'] or img['src'], 'srcSet': ', '.join(f'{u} {w}w' for w, u in sizes), 'large': sizes[-1][1] if sizes else img['src']}


def paragraphs(h):
    return '\n\n'.join(x for x in (plain(part) for part in re.split(r'</p>|<br\s*/?>|\n{2,}', h or '', flags=re.I)) if x)


def product(p, newest, fresh):
    terms = lambda name: next(([plain(t['name']) for t in a['terms']] for a in p['attributes'] if a['name'] == name), [])
    unit = p['prices'].get('currency_minor_unit', 2)
    cents = lambda v: round(float(v or 0) * 10 ** (2 - unit))
    price = cents(p['prices']['price'])
    regular = max(cents(p['prices']['regular_price']), price)
    gallery = [to_image(i) for i in p['images']]
    return {'id': p['id'], 'slug': p['slug'], 'sku': p.get('sku') or '', 'name': plain(p['name']), 'link': p['permalink'], 'addToCart': f"{CART}?add-to-cart={p['id']}",
            'brand': plain((p.get('brands') or [{}])[0].get('name', '')),
            'categories': [plain(c['name']) for c in p['categories'] if plain(c['name']) not in HIDDEN_CATEGORIES],
            'size': ','.join(terms('Size')), 'text': plain(p['short_description']), 'price': price, 'regular': regular,
            'onSale': regular > price, 'inStock': p['is_in_stock'], 'isNew': p['id'] in fresh, 'newest': newest,
            'image': gallery[0] if gallery else None, 'image2': gallery[1] if len(gallery) > 1 else None, 'gallery': gallery,
            'description': paragraphs(p.get('description')), 'line': (terms('Product Line') or [''])[0],
            'concerns': terms('Concerns'), 'skinTypes': terms('Skin Type'), 'ingredients': terms('Ingredient'),
            'productTypes': terms('Product Type'), 'areas': terms('Application Area')}


def facets(products):
    out = []
    for fid, label, pick in FACETS:
        counts = {}
        for p in products:
            for v in set(pick(p)):
                counts[v] = counts.get(v, 0) + 1
        if counts:
            out.append({'id': fid, 'label': label, 'options': [{'value': v, 'count': n} for v, n in sorted(counts.items(), key=lambda x: x[0].lower())]})
    return out


def campaign():
    """The holiday sale's phases from the clinic site's WooCommerce (public price list), as the Next.js page reads them."""
    try:
        req = urllib.request.Request('https://newdermamedlaserclinic.com/react/wp-json/ndm/v1/pricing', headers={'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (NewDermaMed shop prototype)'})
        with urllib.request.urlopen(req, timeout=20) as r:
            c = json.loads(r.read().decode('utf-8')).get('campaign')
        return {k: c[k] for k in ('phase', 'over', 'phases')} if c else None
    except Exception as e:  # the slide is left out without it
        print('campaign not read:', e)
        return None


def refresh(path):
    since = (datetime.now(timezone.utc) - timedelta(days=30)).strftime('%Y-%m-%dT%H:%M:%S')
    fresh = {p['id'] for p in get({'after': since})}
    products = [product(p, i, fresh) for i, p in enumerate(get({}))]
    products = [p for p in products if p['name'] and p['price'] > 0]
    data = {'read': datetime.now(timezone.utc).strftime('%Y-%m-%d'), 'storeUrl': ORIGIN + '/shop/', 'products': products, 'facets': facets(products), 'campaign': campaign()}
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('read', len(products), 'products from the online store')


# src/shop-ui.jsx is made from the Next.js components (types stripped by TypeScript, imports swapped for the shell's own
# pieces), so both versions show the same page. Edit web/src/components/shop/*.tsx, never shop-ui.jsx.
TSX = ['web/src/lib/shop-related.ts'] + ['web/src/components/shop/' + f + '.tsx' for f in ('product-card', 'shop-hero', 'shop-routine', 'shop-catalog', 'shop-page', 'product-buy', 'product-page')]
STRIP = r"""
const ts = require(process.argv[1] + '/web/node_modules/typescript');
const fs = require('fs');
const out = process.argv.slice(2).map((f) => ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, removeComments: false } }).outputText);
process.stdout.write(out.join('\n'));
"""
PRELUDE = """/* ---------------------------------------------------------------- /shop and /shop/<slug>, the skincare shop (2026-11-18). GENERATED by
   src/build_shop.py from web/src/components/shop/*.tsx: edit those, then rebuild. Data: SHOP (src/shop-data.json, a snapshot of the online
   store's products and of the clinic site's sale campaign). The shell's own pieces stand in for the Next.js imports. */
const { useMemo, useDeferredValue } = React;
const byId = (id) => document.getElementById(id);
const Button = Btn;
const Link = ({ href, ...p }) => <a href={href} {...p} />;
const ACTIONS = { book: '#/book' };
const SHOP_PAGE = 'shop.html';
const SHOP_ORIGIN = 'https://shop.newdermamedlaserclinic.com';
const productPath = (slug) => `shop-product.html?p=${slug}`;
const storeAdd = (id, qty = 1, to = 'cart') => `${SHOP_ORIGIN}/${to}/?add-to-cart=${id}${qty > 1 ? `&quantity=${qty}` : ''}`;
const SHOP_PHOTOS = { '/assets/home/hero/visia.jpg': 'assets/home/visia-consult.jpg' };
const optimized = (src) => SHOP_PHOTOS[src] || src.replace(/^\\//, '');
const optimizedSrcSet = () => '';
function RevealSection({ children, ...p }) {
  const ref = useRef(null);
  useReveal(ref);
  return <section ref={ref} {...p}>{children}</section>;
}
const shopCard = ({ description, gallery, ...card }) => card;
const SHOP_CARDS = SHOP.products.map(shopCard);
/* the sale as lib/shop-sale.ts builds it, from the saved campaign (the Black Friday page stands in for both sale pages) */
const SHOP_SALE = (() => {
  const c = SHOP.campaign;
  if (!c || c.over) return null;
  const at = (p) => ({ ...p, from: Date.parse(p.from), to: Date.parse(p.to) });
  const bf = c.phases.map(at).find((p) => p.id === 'black-friday');
  if (!bf) return null;
  const now = c.phases.map(at).find((p) => p.id === c.phase) || null;
  const day = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', month: 'short', day: 'numeric' }).format(t).replaceAll('.', '');
  return { now: now ? { label: now.label, to: now.to } : null, blackFriday: { label: bf.label, from: bf.from, to: bf.to, days: `${day(bf.from)} to ${day(bf.to)}` },
    headline: SHOP.headline, link: 'black-friday-sale.html', cta: c.phase === 'vip' ? 'Shop the VIP Sale' : `See ${(now || bf).label} offers` };
})();
/* the product page: ?p=<slug>, else the first product */
const SHOP_CURRENT = (() => {
  const slug = new URLSearchParams(window.location.search).get('p');
  return SHOP.products.find((p) => p.slug === slug) || SHOP.products[0];
})();
const SHOP_CRUMBS = SHOP_CURRENT ? [...(SHOP_CURRENT.brand ? [[SHOP_CURRENT.brand, `shop.html?brand=${encodeURIComponent(SHOP_CURRENT.brand)}#products`]] : []), SHOP_CURRENT.name] : ['Product'];
"""


def make_ui(root, src):
    import subprocess
    try:
        js = subprocess.run(['node', '-e', STRIP, str(root.resolve())] + [str(root / f) for f in TSX], capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError) as e:
        print('shop-ui.jsx not regenerated (node or TypeScript missing), using the saved copy:', e)
        return
    js = re.sub(r'^\s*"use client";\s*$', '', js, flags=re.M)
    js = re.sub(r'^import [^;]*;\s*$', '', js, flags=re.M | re.S)
    js = re.sub(r'^export ', '', js, flags=re.M)
    js = js.replace('createPortal(', 'ReactDOM.createPortal(')
    # the shell already draws <main> and the breadcrumb: the page is a plain block inside it
    js = re.sub(r'<main id="main" data-shell="inner" data-page="shop" className="(sp(?: spp)?) [^"]*">', r'<div data-page="shop" className="\1">', js)
    js = js.replace('</main>', '</div>')
    js = re.sub(r'\s*<Breadcrumb items=\{[^}]*\}\s*/>', '', js)
    js = js.replace('href="/refunds"', 'href="refunds.html"')
    js = re.sub(r'\n{3,}', '\n\n', js).strip() + '\n'
    assert '<main' not in js and 'import ' not in js, 'shop-ui.jsx: a Next.js piece was not swapped'
    js = js.replace('function ShopPage({ catalog, sale })', 'function ShopPageView({ catalog, sale })', 1)
    assert 'function ShopPageView(' in js, 'shop-ui.jsx: ShopPage was not found'
    js += """
function ShopPage() {
  return <ShopPageView catalog={{ ok: SHOP_CARDS.length > 0, products: SHOP_CARDS, facets: SHOP.facets, storeUrl: SHOP.storeUrl, cartUrl: SHOP_ORIGIN + '/cart/' }} sale={SHOP_SALE} />;
}
function ShopProductPage() {
  useEffect(() => { if (SHOP_CURRENT) document.title = `${SHOP_CURRENT.name}${SHOP_CURRENT.brand ? ` by ${SHOP_CURRENT.brand}` : ''} | NewDermaMed Skincare Shop`; }, []);
  if (!SHOP_CURRENT) return null;
  const line = sameLine(SHOP_CURRENT, SHOP_CARDS);
  return <ProductPage p={SHOP_CURRENT} line={line} related={alsoLike(SHOP_CURRENT, SHOP_CARDS, line)} all={SHOP_CARDS} />;
}
"""
    (src / 'shop-ui.jsx').write_text(PRELUDE + js, encoding='utf-8')


root, src = Path(sys.argv[1]), Path(sys.argv[2])
make_ui(root, src)
snap = src / 'shop-data.json'
if '--refresh' in sys.argv or not snap.exists():
    refresh(snap)
data = json.loads(snap.read_text(encoding='utf-8'))
css = (root / 'web/src/styles/shop-page.css').read_text(encoding='utf-8')
css = css.replace('url("/assets/', 'url("assets/')
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
# the prototype loads each photo at 600px: no srcset, so the page's script stays small
for prod in data['products']:
    for im in [prod.get('image'), prod.get('image2'), *prod.get('gallery', [])]:
        if im:
            im['srcSet'] = ''
data['headline'] = 'Up to ' + re.search(r'SALE_HEADLINE = (\d+)', (root / 'web/src/config/sale.ts').read_text(encoding='utf-8')).group(1) + '% off selected treatments'
ui = '\nconst SHOP = ' + json.dumps(data, ensure_ascii=False) + ';\n' + (src / 'shop-ui.jsx').read_text(encoding='utf-8')
make_page(root, 'shop.html', 'Medical-Grade Skincare Shop | NewDermaMed Toronto',
          'Shop the medical-grade skincare we carry at our Toronto clinics, including Dermaceutic and Mesoestetic. Filter by concern, skin type, ingredient and price, and order online.',
          ui, '\n  /* skincare shop */\n' + css, 'ShopPage', "['Skincare shop']", noindex=True)
make_page(root, 'shop-product.html', 'Product | NewDermaMed Skincare Shop',
          'A product of the NewDermaMed skincare shop: photos, price, details and ordering.',
          ui, '\n  /* skincare shop */\n' + css, 'ShopProductPage', "[['Skincare shop', 'shop.html'], ...SHOP_CRUMBS]", noindex=True)
