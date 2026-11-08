"""Site-wide cart (2026-10-31): header bag with count + cart drawer on every page, scroll lock without a jump.
usage: python3 cart_patch.py <scratch dir> index.html promotion.html"""
import sys
from pathlib import Path

scratch = Path(sys.argv[1])
shared = (scratch / 'cart-shared.jsx').read_text()
CART_CSS = r'''
  .pr-was{font-size:14px;color:#8A949B;text-decoration:line-through;text-decoration-color:rgba(234,54,75,.85);text-decoration-thickness:1.5px;font-variant-numeric:tabular-nums}
  .btn-buy{color:#fff}
  .pr-add{width:132px}
  .pr-qty{display:inline-grid;grid-template-columns:40px 1fr 40px;align-items:center;width:132px;height:40px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px rgba(27,36,43,.18);animation:prQty .35s var(--e-out)}
  .pr-qty button{display:grid;place-items:center;width:40px;height:40px;border-radius:999px;color:#1B242B;transition:background-color .25s ease,color .25s ease}
  .pr-qty button:hover{background:#F2F2EF}
  .pr-qty button:disabled{opacity:.35}
  .pr-qty output{text-align:center;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
  @keyframes prQty{from{opacity:0;transform:scale(.94)}}
  @media (max-width:639px){.pr-add,.pr-qty{width:116px}.pr-qty{grid-template-columns:36px 1fr 36px}.pr-qty button{width:36px;height:36px}.pr-add{padding:0 12px}}
'''
css = '\n  /* cart: price strike, Add to cart, quantity stepper (shared by every page) */\n' + CART_CSS.strip('\n') + '\n  @media (prefers-reduced-motion:reduce){.pr-qty{animation:none}}\n'

for path in sys.argv[2:]:
    s = open(path).read()

    def rep(a, b, n=1):
        global s
        c = s.count(a)
        assert c == n, (path, a[:80], c)
        s = s.replace(a, b)

    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + css + s[i:]

    rep("""function lockScroll(on) {
  if (lenis) { on ? lenis.stop() : lenis.start(); }
  document.documentElement.style.overflow = on ? 'hidden' : '';
}""", """function lockScroll(on) {
  const d = document.documentElement;
  /* keep the page width when the scrollbar goes away, so nothing shifts under the panel */
  const gap = on ? window.innerWidth - d.clientWidth : 0;
  if (lenis) { on ? lenis.stop() : lenis.start(); }
  d.style.overflow = on ? 'hidden' : '';
  d.style.paddingRight = gap > 0 ? gap + 'px' : '';
}""")

    rep('function Header({ dark, top, visible, onSearch, onDrawer }) {', 'function Header({ dark, top, visible, onSearch, onDrawer, onCart, cartCount = 0 }) {')
    rep('''            <Btn href="#/book" v="book" hot className="ml-1.5 !hidden sm:!flex">Book Free Consultation</Btn>''',
        '''            {onCart && (
              <button onClick={onCart} aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`} className={`relative ${icon}`}>
                <IconBag size={21} />
                {cartCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-ndm-blue px-1 font-inter text-[10.5px] font-semibold leading-none text-white">{cartCount}</span>}
              </button>
            )}
            <Btn href="#/book" v="book" hot className="ml-1.5 !hidden sm:!flex">Book Free Consultation</Btn>''')

    rep('\nfunction App() {', '\n/* ---------------------------------------------------------------- cart (shared by every page) */\n' + shared + '\nfunction App() {')
    rep('  const [drawer, setDrawer] = useState(false);\n', '  const [drawer, setDrawer] = useState(false);\n  const cart = useCartState();\n  const [cartOpen, setCartOpen] = useState(false);\n')
    rep('onDrawer={() => setDrawer(true)} />\n      <main', 'onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />\n      <main')
    rep('      <Drawer open={drawer} onClose={() => setDrawer(false)} />\n',
        "      <Drawer open={drawer} onClose={() => setDrawer(false)} />\n      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'pricing.html#prices'; }} />\n")
    if 'introDone' in s.split('\nfunction App() {')[1]:
        rep("""    const on = search || drawer;
    if (introDone) lockScroll(on);
  }, [search, drawer, introDone]);""", """    const on = search || drawer || cartOpen;
    if (introDone) lockScroll(on);
  }, [search, drawer, cartOpen, introDone]);""")
        rep('hidden={!introDone || search || drawer} />', 'hidden={!introDone || search || drawer || cartOpen} />')
        rep('      <OfferPopup ready={introDone} />\n    </>', '      <OfferPopup ready={introDone} />\n    </CartCtx.Provider>')
    else:
        rep('  useEffect(() => { lockScroll(search || drawer); }, [search, drawer]);', '  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);')
        rep('<FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer} />', '<FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />')
        rep('      <OfferPopup ready />\n    </>', '      <OfferPopup ready />\n    </CartCtx.Provider>')
    app = s.index('\nfunction App() {')
    j = s.index('  return (\n    <>\n', app)
    s = s[:j] + '  return (\n    <CartCtx.Provider value={cart}>\n' + s[j + len('  return (\n    <>\n'):]
    open(path, 'w').write(s)
    print('patched', path)
