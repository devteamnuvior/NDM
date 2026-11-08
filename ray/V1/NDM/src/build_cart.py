"""Build cart.html, checkout.html and order-confirmed.html from promotion.html (the latest page shell) plus src/cart-ui.jsx.
After the Bellair Laser Clinic cart > checkout > confirmation flow, in the NDM look. Prototype: nothing is charged or sent.
usage: python3 build_cart.py <ndm-homepage dir> <scratch dir>
"""
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
base = (root / 'promotion.html').read_text()
base = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', base, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build
base = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', base, count=1)
ui = (scratch / 'cart-ui.jsx').read_text()

CSS = r'''
  /* cart, checkout and confirmation */
  .co-band{background:radial-gradient(40% 30% at 92% 4%,rgba(255,190,160,.16),transparent 70%),radial-gradient(36% 30% at 4% 96%,rgba(255,206,182,.12),transparent 70%),#FAFAF8}
  .co-save{border-radius:999px;padding:4px 9px;font:600 12px/1 Inter,system-ui,sans-serif;color:#0F80C3;background:rgba(32,158,217,.1)}
  .co-opt{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:16px;border:1px solid rgba(27,36,43,.14);background:#fff;cursor:pointer;transition:border-color .25s ease,box-shadow .25s ease,background-color .25s ease}
  .co-opt:hover{border-color:rgba(27,36,43,.35)}
  .co-opt.is-on{border-color:#0F80C3;box-shadow:0 0 0 3px rgba(32,158,217,.14);background:#F7FBFE}
  .co-opt.is-off{cursor:not-allowed;background:#FAFAF8;border-style:dashed}
  /* checkout blocks: a thin rule above each one; the floated legend keeps it off the rule */
  .co-fs{margin:0;min-width:0;border:0;border-top:1px solid rgba(27,36,43,.1);padding:20px 0 0}
  /* compact checkout fields */
  .co-form .co-fld{height:44px;border-radius:10px;font-size:14.5px}
  .co-form textarea.co-fld{height:auto}
  .co-form .co-opt{padding:11px 14px;border-radius:14px}
  .co-form select{height:44px;font-size:14.5px}
  /* the side column (summary + "before you finish") sticks on wide screens and scrolls on its own if it is taller than the window */
  @media (min-width:1024px){.co-side{position:sticky;top:104px;max-height:calc(100vh - 116px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:2px;margin:-2px}}
  /* the order list on the checkout page scrolls inside its card when it is long */
  @media (min-width:1024px){.co-list{max-height:min(34vh,300px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding-right:6px}}
  .co-fs:first-child{border-top:0;padding-top:0}
  .co-fs>legend{float:left;width:100%;padding:0}
  .co-fs>legend+*{clear:both}
  .co-sum>summary{list-style:none}
  .co-sum>summary::-webkit-details-marker{display:none}
  .co-code>summary{list-style:none}
  .co-code>summary::-webkit-details-marker{display:none}
  .co-code>summary::after{content:"+";float:right;color:#0F80C3;font-weight:600}
  .co-code[open]>summary::after{content:"\2212"}
  .co-tick{animation:coTick .9s var(--e-out) both;box-shadow:0 18px 36px -16px rgba(15,128,195,.75)}
  @keyframes coTick{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
  @media (max-width:1023px){.co-band{padding-bottom:110px}}
  @media (prefers-reduced-motion:reduce){.co-tick{animation:none}}
'''

PAGES = [
    ('cart.html', 'Your cart, NewDermaMed Toronto', 'Cart', 'CartPage', 'Review the treatments in your cart before checkout.'),
    ('checkout.html', 'Checkout, NewDermaMed Toronto', 'Checkout', 'CheckoutPage', 'Place your order request. You pay at the clinic.'),
    ('order-confirmed.html', 'Order request received, NewDermaMed Toronto', 'Order received', 'ConfirmPage', 'Your order request has been received.'),
]

for out, title, crumb, page, desc in PAGES:
    s = base

    def rep(a, b, n=1):
        global s
        c = s.count(a)
        assert c == n, (a[:90], c)
        s = s.replace(a, b)

    rep('<title>Promotions, NewDermaMed Toronto</title>', f'<title>{title}</title>\n<meta name="robots" content="noindex, nofollow">')
    rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
        f'<meta name="description" content="{desc}">')
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + CSS + s[i:]
    crumbs = "['Pricing', 'pricing.html'], ['Cart', 'cart.html'], 'Checkout'" if page == 'CheckoutPage' else ("['Pricing', 'pricing.html'], 'Cart'" if page == 'CartPage' else "['Pricing', 'pricing.html'], 'Order received'")
    app = f'''function App() {{
  const cart = useCartState();
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {{ lockScroll(search || drawer || cartOpen); }}, [search, drawer, cartOpen]);
  return (
    <CartCtx.Provider value={{cart}}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={{false}} />
      <Header dark={{false}} top={{36}} visible onSearch={{() => setSearch(true)}} onDrawer={{() => setDrawer(true)}} onCart={{() => setCartOpen(true)}} cartCount={{cart.count}} />
      <main id="main">
        <Breadcrumb items={{[{crumbs}]}} />
        <{page} />
      </main>
      <Footer />
      <CartDrawer open={{cartOpen}} onClose={{() => setCartOpen(false)}} onBrowse={{() => {{ window.location.href = 'pricing.html#prices'; }}}} />
      <SearchOverlay open={{search}} onClose={{() => setSearch(false)}} />
      <Drawer open={{drawer}} onClose={{() => setDrawer(false)}} />
      <FloatSearch onOpen={{() => setSearch(true)}} hidden={{search || drawer || cartOpen}} />
      <ChatBot ready hidden={{cartOpen || drawer || search}} />
    </CartCtx.Provider>
  );
}}

'''
    a = s.index('\nfunction App() {')
    b = s.index('ReactDOM.createRoot', a)
    s = s[:a] + '\n' + ui + '\n/* ---------------------------------------------------------------- app (cart flow) */\n' + app + s[b:]
    (root / out).write_text(s)
    print('wrote', out, len(s))
