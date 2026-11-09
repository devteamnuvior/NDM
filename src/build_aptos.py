"""Build the Aptos Thread Lift page (aptos-thread-lift.html) from promotion.html + procedure-ui.jsx (hero, form, glance card)
+ treatment-ui.jsx (shared treatment sections) + aptos-ui.jsx (the page content).
usage: python3 build_procedure.py <ndm-homepage dir> <scratch dir>
"""
import json
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
ui = (scratch / 'procedure-ui.jsx').read_text() + '\n' + (scratch / 'treatment-ui.jsx').read_text() + '\n' + (scratch / 'aptos-ui.jsx').read_text()
data = (scratch / 'aptos-ui.jsx').read_text()
OUT = 'aptos-thread-lift.html'


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


faqs = re.search(r"  faqs: \[\n(.*?)\n  \],\n", data, re.S).group(1)
faq_pairs = re.findall(r"\['(.+?)', '(.+?)'\],?", faqs)
assert len(faq_pairs) == 6, len(faq_pairs)
ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Procedures'},
        {'@type': 'ListItem', 'position': 3, 'name': 'Aptos Thread Lift'}]},
    {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a.replace("\\'", "'")}} for q, a in faq_pairs]},
]}
rep('<title>Promotions, NewDermaMed Toronto</title>', '<title>Aptos Thread Lift in Toronto, a Lift Without Surgery, NewDermaMed</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    '<meta name="description" content="Aptos Thread Lift at NewDermaMed, Uptown and Downtown Toronto: bioabsorbable threads for the midface, about an hour in clinic, results that may last up to 24 months. Free consultation.">\n'
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')

css = '''
  /* procedure page */
  .offer-glass{background:linear-gradient(135deg,rgba(255,255,255,.2),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:0 24px 50px -30px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.25)}
  .offer-pill{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.25)}
  .offer-dot{animation:offerPing 1.8s ease-in-out infinite}
  @keyframes offerPing{0%,100%{box-shadow:0 0 0 0 rgba(255,166,23,.6)}50%{box-shadow:0 0 0 5px rgba(255,166,23,0)}}
  .proc-form{box-shadow:0 40px 80px -40px rgba(11,15,19,.65)}
  .band-card{background:rgba(11,15,19,.62);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 30px 60px -40px rgba(0,0,0,.8)}
  /* what is this treatment: the statement's words darken as it scrolls into place */
  .say-w{color:rgba(27,36,43,.2);transition:color .45s ease}
  .say-w.is-on{color:#1B242B}
  .say-w.say-accent.is-on{color:#0F80C3}
  .ov-card{box-shadow:0 0 0 1px rgba(27,36,43,.06),0 22px 44px -36px rgba(27,36,43,.28)}
  .ba-grid .ba-box{aspect-ratio:1/1}
  /* treatment sections */
  .tx-ba .ba-box{aspect-ratio:1/1}
  @media (max-width:639px){.tx-ba>li{flex:0 0 min(76vw,300px);scroll-snap-align:start}}
  .tx-step{opacity:0;transform:translateY(18px);transition:opacity .6s ease var(--d,0s),transform .8s var(--e-out) var(--d,0s)}
  .tx-steps.in .tx-step{opacity:1;transform:none}
  .tx-line i{transform:scaleX(0);transition:transform 1s var(--e-out) calc(var(--d,0s) + .2s)}
  .tx-steps.in .tx-line i{transform:scaleX(1)}
  .tx-step:last-child .tx-line{visibility:hidden}
  /* NAMICA badge on the intro photo: the ring of words and the sphere turn together, as one piece */
  .tx-ring{filter:drop-shadow(0 18px 30px rgba(53,40,98,.35))}
  .tx-ring-spin{animation:nmTurn 30s linear infinite}
  /* warm peach light on photos */
  .peach{position:relative}
  .peach::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 18% 8%,rgba(255,186,148,.55),rgba(255,186,148,0) 62%),linear-gradient(180deg,rgba(255,206,176,.14),rgba(255,170,130,.08));mix-blend-mode:soft-light}
  .peach img{filter:sepia(.1) saturate(1.06) brightness(1.02)}
  /* every light section on this page (as on the Botox page): one paper colour; soft glows on a layer that fades at the top and
     bottom, so no join shows */
  main>section:not([data-nav="dark"]){background-color:#FAFAF8!important;background-image:none!important;isolation:isolate}
  main>section:not([data-nav="dark"])::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;-webkit-mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);background:radial-gradient(40% 50% at 96% 45%,rgba(255,190,160,.18),transparent 70%)}
  main>section:not([data-nav="dark"]):nth-of-type(even)::before{background:radial-gradient(40% 50% at 4% 55%,rgba(255,206,182,.18),transparent 70%)}
  /* the price list keeps a light peach wash, on the same fading layer, and its open header stays in place (Botox look) */
  main>section.proc-peach.proc-peach:not([data-nav="dark"])::before{background:radial-gradient(55% 60% at 12% 35%,rgba(255,190,158,.3),transparent 70%),radial-gradient(50% 55% at 92% 70%,rgba(255,176,140,.22),transparent 70%)}
  .proc-peach .pr-group.is-open>.pr-ghead{position:static;background:transparent}
  .analysis-card{background:rgba(11,15,19,.42);border:1px solid rgba(255,255,255,.16);-webkit-backdrop-filter:blur(16px) saturate(130%);backdrop-filter:blur(16px) saturate(130%);box-shadow:0 40px 80px -40px rgba(0,0,0,.7)}
  /* elevate your results: the timing strip on a soft blue to peach wash, an arrow joining its two stops */
  .tx-when{background:linear-gradient(110deg,rgba(38,177,231,.14),rgba(255,206,182,.28))}
  .tx-when-arrow{box-shadow:0 0 0 6px #FAFAF8}
  .tx-pair-card{transition:transform .5s var(--e-out),box-shadow .5s var(--e-out)}
  .tx-pair-card:hover{transform:translateY(-4px);box-shadow:0 30px 50px -34px rgba(15,60,95,.45)}
  /* licensed product card and the how-long-it-lasts card, in NUVIOR's Aptos purple */
  .tx-product{background:radial-gradient(120% 90% at 50% 0%,#5B48B0 0%,#352862 55%,#221a45 100%)}
  .tx-product-img{filter:drop-shadow(0 30px 40px rgba(10,6,30,.55));animation:nmFloat 7s ease-in-out infinite}
  .tx-lasts{background:radial-gradient(90% 120% at 100% 0%,#5B48B0 0%,#352862 52%,#1d1640 100%)}
  .tx-thread-line{background:linear-gradient(90deg,rgba(201,194,244,.25),#C9C2F4 40%,rgba(201,194,244,.5));box-shadow:0 0 18px rgba(201,194,244,.55)}
  .tx-bub{aspect-ratio:1/1;background:radial-gradient(circle at 35% 30%,#fff,#C9C2F4 45%,rgba(91,72,176,.6));opacity:0;transform:translateY(0) scale(.4)}
  .tx-thread.in .tx-bub{animation:txBub 5.5s ease-in-out var(--d,0s) infinite}
  @keyframes txBub{0%{opacity:0;transform:translateY(10px) scale(.4)}20%{opacity:.95;transform:translateY(0) scale(1)}70%{opacity:.75;transform:translateY(-14px) scale(1)}100%{opacity:0;transform:translateY(-26px) scale(1.25)}}
  .tx-nav a{transition:background-color .3s ease,color .3s ease}
  @media (prefers-reduced-motion:reduce){.tx-step{opacity:1;transform:none;transition:none}.tx-line i{transform:none;transition:none}.tx-ring-spin,.tx-product-img,.tx-thread.in .tx-bub{animation:none}.tx-bub{opacity:.8;transform:none}}
  /* treatments inside an open category: blue circle, white plus */
  .pr-sub .pr-plus{background:#0F80C3;border-color:#0F80C3;color:#fff}
  @media (max-width:639px){.ba-grid>li{flex:0 0 min(78vw,300px);scroll-snap-align:start}}
  /* prices, same look as the Pricing page */
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
  .pr-group.is-open>.pr-ghead .pr-gplus{background:#0F80C3;border-color:#0F80C3;color:#fff}
  .pr-group.is-open>.pr-ghead .pr-gplus i+i{transform:rotate(0deg)}
  .pr-group.is-open>.pr-body{grid-template-rows:1fr}
  .pr-group.is-open>.pr-body>div{visibility:visible;transition-delay:0s}
  .pr-group .pr-item:last-child{border-bottom:0}
  .pr-item{border-bottom:1px solid rgba(27,36,43,.1)}
  .pr-plus{position:relative;display:block;width:36px;height:36px;border-radius:999px;border:1px solid rgba(27,36,43,.22);color:#1B242B;transition:background-color .35s ease,border-color .35s ease,color .35s ease}
  .pr-plus i{position:absolute;left:50%;top:50%;width:13px;height:1.5px;margin:-.75px 0 0 -6.5px;border-radius:2px;background:currentColor;transition:transform .45s var(--e-out)}
  .pr-plus i+i{transform:rotate(90deg)}
  .pr-head:hover .pr-plus,.pr-ghead button:hover .pr-gplus{border-color:#1B242B}
  .pr-item.is-open>h4 .pr-plus{background:#0F80C3;border-color:#0F80C3;color:#fff}
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
  @media (prefers-reduced-motion:reduce){.offer-dot{animation:none}.say-w,.pr-body,.pr-body>div,.pr-plus i{transition:none}}
'''
SPACING = '''
  /* round 12: Our team, Testimonials and Visit us use the same spacing as the treatment sections (e.g. Elevate your results);
     Visit us sits close to the band after it */
  main>section[aria-labelledby="team"],main>section[aria-labelledby="testimonials"],main>section#visit{padding-top:clamp(64px,7vw,104px)!important;padding-bottom:clamp(64px,7vw,104px)!important}
  main>section#visit{padding-bottom:clamp(16px,2vw,28px)!important}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + SPACING + s[i:]

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
        <Breadcrumb items={APT.crumbs} dark />
        <ProcHero p={APT} />
        <TxGlance p={APT} />
        <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden"><ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" /></section>
        <TxNav p={APT} />
        <TxIntro p={APT} />
        <TxSteps p={APT} />
        <TxSafety p={APT} />
        <TxLasting p={APT} />
        <TxFit p={APT} />
        <TxExpect p={APT} />
        <TxResults p={APT} />
        <TxCare p={APT} />
        <TxPair p={APT} />
        <TxPrices p={APT} />
        <TxWhy p={APT} />
        <Team />
        <PromoReviews />
        <TxVisit p={APT} />
        <ProcAnalysis />
        <Faq items={APT.faqs} lead="Your top questions," strong="answered" intro="What to know about the Aptos Thread Lift, from our medical team." />
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
s = s[:a] + '\n' + ui + '\n/* ---------------------------------------------------------------- app (procedure page) */' + app + s[b:]
(root / OUT).write_text(s)
print('wrote', OUT, len(s))
