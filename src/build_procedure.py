"""Build a procedure page (default botox.html) from promotion.html + procedure-ui.jsx.
usage: python3 build_procedure.py <ndm-homepage dir> <scratch dir>
"""
import json
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
ui = (scratch / 'procedure-ui.jsx').read_text() + '\n' + (scratch / 'treatment-ui.jsx').read_text() + '\n' + (scratch / 'media-ui.jsx').read_text()
MEDIA_CSS = re.search(r'const MEDIA_CSS = `(.*?)`;', ui, re.S).group(1)  # the film and reel styles (round 12)
OUT = 'botox.html'


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


faqs = re.search(r"  faqs: \[\n(.*?)\n  \],\n", ui, re.S).group(1)
faq_pairs = re.findall(r"\['(.+?)', '(.+?)'\],?", faqs)
assert len(faq_pairs) >= 10, len(faq_pairs)

# SEO round 16 (after barbeauty.ca/botox): title with the price, a description with both neighbourhoods, canonical and social
# tags, and structured data for the page, the procedure, the price, both clinics, the booking steps and the FAQ
SITE = 'https://newdermamedlaserclinic.com/'
URL = SITE + OUT
TITLE = 'Botox Toronto from $12/Unit, Free Consultation | NewDermaMed'
DESC = ('Botox® Cosmetic in Toronto from $12 per unit, packages up to 30% off. Free consultation and VISIA® skin analysis at our '
        'Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.')
IMG = SITE + 'assets/botox/hero.jpg'
UPDATED = '2026-11-10'
HOURS = [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '09:00', 'closes': '19:00'},
         {'@type': 'OpeningHoursSpecification', 'dayOfWeek': 'Saturday', 'opens': '10:00', 'closes': '17:00'}]
def clinic(key, name, street, code, phone, area):
    return {'@type': 'MedicalClinic', '@id': SITE + '#clinic-' + key, 'name': 'NewDermaMed ' + name, 'url': SITE + 'about.html#contact', 'telephone': '+1-' + phone,
            'image': SITE + 'assets/clinic/clinic-4.jpg', 'priceRange': '$$',
            'address': {'@type': 'PostalAddress', 'streetAddress': street, 'addressLocality': 'Toronto', 'addressRegion': 'ON', 'postalCode': code, 'addressCountry': 'CA'},
            'areaServed': area, 'openingHoursSpecification': HOURS, 'medicalSpecialty': 'Dermatology'}
UPTOWN = clinic('uptown', 'Uptown', '4763 Yonge Street', 'M2N 5M5', '416-224-8800', 'North York, Toronto')
DOWNTOWN = clinic('downtown', 'Downtown', '790 Bay Street, Suite 900', 'M5G 1N8', '416-671-9766', 'Downtown Toronto')
PROCEDURE = {'@type': 'MedicalProcedure', '@id': URL + '#procedure', 'name': 'Botox® Cosmetic injections', 'alternateName': ['Botox', 'Botox Cosmetic', 'neuromodulator injections'],
             'procedureType': 'https://schema.org/NoninvasiveProcedure', 'bodyLocation': 'Face',
             'howPerformed': 'Small amounts of a prescription neuromodulator are injected with a very fine needle into specific facial muscles, after an in-person medical assessment.',
             'preparation': 'A free in-person consultation and VISIA® skin analysis with our licensed medical team.',
             'followup': 'Results are reviewed at about two weeks; treatments are usually repeated every three to four months.'}
ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'MedicalWebPage', '@id': URL + '#webpage', 'url': URL, 'name': TITLE, 'description': DESC, 'inLanguage': 'en-CA', 'dateModified': UPDATED,
     'primaryImageOfPage': {'@type': 'ImageObject', 'url': IMG}, 'about': {'@id': URL + '#procedure'}, 'breadcrumb': {'@id': URL + '#breadcrumb'},
     'medicalAudience': {'@type': 'MedicalAudience', 'audienceType': 'Patient'}},
    {'@type': 'BreadcrumbList', '@id': URL + '#breadcrumb', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE},
        {'@type': 'ListItem', 'position': 2, 'name': 'Procedures', 'item': SITE + 'pricing.html'},
        {'@type': 'ListItem', 'position': 3, 'name': 'Injectables', 'item': SITE + 'pricing.html#prices'},
        {'@type': 'ListItem', 'position': 4, 'name': 'Botox®', 'item': URL}]},
    PROCEDURE,
    {'@type': 'Service', '@id': URL + '#service', 'name': 'Botox® Cosmetic in Toronto', 'serviceType': 'Cosmetic injectable treatment', 'url': URL,
     'provider': [{'@id': UPTOWN['@id']}, {'@id': DOWNTOWN['@id']}], 'areaServed': {'@type': 'City', 'name': 'Toronto'},
     'offers': [{'@type': 'Offer', 'name': 'Botox® Cosmetic, per unit', 'price': '12.00', 'priceCurrency': 'CAD', 'url': URL + '#prices',
                 'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': '12.00', 'priceCurrency': 'CAD', 'unitText': 'unit'}},
                {'@type': 'Offer', 'name': 'Dysport®, per unit', 'price': '11.00', 'priceCurrency': 'CAD', 'url': URL + '#prices',
                 'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': '11.00', 'priceCurrency': 'CAD', 'unitText': 'unit'}}]},
    UPTOWN, DOWNTOWN,
    {'@type': 'HowTo', '@id': URL + '#booking', 'name': 'How a Botox® appointment works at NewDermaMed', 'totalTime': 'PT30M', 'step': [
        {'@type': 'HowToStep', 'position': 1, 'name': 'Book a free consultation', 'text': 'Choose the Uptown or Downtown clinic and a time that suits you, online or by phone.'},
        {'@type': 'HowToStep', 'position': 2, 'name': 'Assessment and VISIA® skin analysis', 'text': 'Our licensed medical team reviews your health history, your goals and how your face moves.'},
        {'@type': 'HowToStep', 'position': 3, 'name': 'Treatment', 'text': 'If the treatment suits you, it takes about 15 to 20 minutes with a very fine needle.'},
        {'@type': 'HowToStep', 'position': 4, 'name': 'Review and maintenance', 'text': 'Your provider reviews the result at about two weeks; many people return every three to four months.'}]},
    {'@type': 'FAQPage', '@id': URL + '#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a.replace("\\'", "'")}} for q, a in faq_pairs]},
]}
H = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
HEAD = '\n'.join([
    f'<link rel="canonical" href="{URL}">',
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    '<meta property="og:locale" content="en_CA">', '<meta property="og:type" content="website">', '<meta property="og:site_name" content="NewDermaMed">',
    f'<meta property="og:url" content="{URL}">', f'<meta property="og:title" content="{H(TITLE)}">', f'<meta property="og:description" content="{H(DESC)}">',
    f'<meta property="og:image" content="{IMG}">', f'<meta property="og:image:alt" content="Botox® Cosmetic at NewDermaMed, Toronto">',
    '<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:site" content="@NewDermaMed">',
    f'<meta name="twitter:title" content="{H(TITLE)}">', f'<meta name="twitter:description" content="{H(DESC)}">', f'<meta name="twitter:image" content="{IMG}">',
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>'])
rep('<title>Promotions, NewDermaMed Toronto</title>', f'<title>{H(TITLE)}</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    f'<meta name="description" content="{H(DESC)}">\n' + HEAD)

css = '''
  /* procedure page */
  .offer-glass{background:linear-gradient(135deg,rgba(255,255,255,.2),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:0 24px 50px -30px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.25)}
  .offer-pill{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.25)}
  .offer-dot{animation:offerPing 1.8s ease-in-out infinite}
  @keyframes offerPing{0%,100%{box-shadow:0 0 0 0 rgba(255,166,23,.6)}50%{box-shadow:0 0 0 5px rgba(255,166,23,0)}}
  /* the offer card: a soft light sweeps across it every few seconds */
  .offer-shine{position:relative;isolation:isolate;box-shadow:0 30px 60px -34px rgba(0,0,0,.7);transition:transform .5s var(--e-out),box-shadow .5s var(--e-out)}
  .offer-shine:hover{transform:translateY(-3px);box-shadow:0 36px 70px -34px rgba(0,0,0,.75)}
  .offer-shine::after{content:"";position:absolute;inset:-20% -40%;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.08) 44%,rgba(255,255,255,.34) 50%,rgba(255,255,255,.08) 56%,transparent 62%);transform:translateX(-75%);animation:offerSweep 5.5s ease-in-out infinite}
  .offer-shine::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;background:radial-gradient(70% 90% at 100% 50%,rgba(255,166,23,.22),transparent 70%)}
  @keyframes offerSweep{0%,52%{transform:translateX(-75%)}82%,100%{transform:translateX(75%)}}
  .offer-big{padding-left:clamp(16px,2vw,28px);border-left:1px solid rgba(255,255,255,.22)}
  /* your treatment tabs: the panel fades in; the key number sits on a deep blue card */
  .ov-in{animation:ovIn .6s var(--e-out) both}
  @keyframes ovIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .ov-side{background:linear-gradient(180deg,#FAFAF8,#F4F7F9)}
  .analysis-card{background:rgba(11,15,19,.42);border:1px solid rgba(255,255,255,.16);-webkit-backdrop-filter:blur(16px) saturate(130%);backdrop-filter:blur(16px) saturate(130%);box-shadow:0 40px 80px -40px rgba(0,0,0,.7)}
  /* compare the options */
  .cmp-t th,.cmp-t td{border-bottom:1px solid rgba(27,36,43,.08)}
  .cmp-t tbody tr:last-child>*{border-bottom:0}
  .cmp-t .cmp-me{background:rgba(32,158,217,.06)}
  .cmp-t thead .cmp-me{box-shadow:inset 0 3px 0 #0F80C3}
  /* warm peach light (photos and the price list band) */
  .peach{position:relative}
  .peach::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 18% 8%,rgba(255,186,148,.55),rgba(255,186,148,0) 62%),linear-gradient(180deg,rgba(255,206,176,.14),rgba(255,170,130,.08));mix-blend-mode:soft-light}
  .peach img{filter:sepia(.1) saturate(1.06) brightness(1.02)}
  /* every light section on this page: one paper colour; soft glows on a layer that fades at the top and bottom, so no join shows */
  main>section:not([data-nav="dark"]){background-color:#FAFAF8!important;background-image:none!important;isolation:isolate}
  main>section:not([data-nav="dark"])::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;-webkit-mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);background:radial-gradient(40% 50% at 96% 45%,rgba(255,190,160,.18),transparent 70%)}
  main>section:not([data-nav="dark"]):nth-of-type(even)::before{background:radial-gradient(40% 50% at 4% 55%,rgba(255,206,182,.18),transparent 70%)}
  /* the price list keeps a light peach wash, on the same fading layer */
  main>section.proc-peach:not([data-nav="dark"]):nth-of-type(n)::before{background:radial-gradient(55% 60% at 12% 35%,rgba(255,190,158,.3),transparent 70%),radial-gradient(50% 55% at 92% 70%,rgba(255,176,140,.22),transparent 70%)}
  .proc-peach .pr-group.is-open>.pr-ghead{position:static;background:transparent}
  @media (prefers-reduced-motion:reduce){.offer-shine::after,.ov-in{animation:none}}
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
  /* NAMICA ring on the intro photo: the words turn slowly around the sphere */
  .tx-ring{filter:drop-shadow(0 18px 30px rgba(53,40,98,.35))}
  .tx-ring-text{animation:nmTurn 24s linear infinite}
  /* licensed product card and the how-long-it-lasts card, in NUVIOR's Aptos purple */
  .tx-product{background:radial-gradient(120% 90% at 50% 0%,#5B48B0 0%,#352862 55%,#221a45 100%)}
  .tx-product-img{filter:drop-shadow(0 30px 40px rgba(10,6,30,.55));animation:nmFloat 7s ease-in-out infinite}
  .tx-lasts{background:radial-gradient(90% 120% at 100% 0%,#5B48B0 0%,#352862 52%,#1d1640 100%)}
  .tx-thread-line{background:linear-gradient(90deg,rgba(201,194,244,.25),#C9C2F4 40%,rgba(201,194,244,.5));box-shadow:0 0 18px rgba(201,194,244,.55)}
  .tx-bub{aspect-ratio:1/1;background:radial-gradient(circle at 35% 30%,#fff,#C9C2F4 45%,rgba(91,72,176,.6));opacity:0;transform:translateY(0) scale(.4)}
  .tx-thread.in .tx-bub{animation:txBub 5.5s ease-in-out var(--d,0s) infinite}
  @keyframes txBub{0%{opacity:0;transform:translateY(10px) scale(.4)}20%{opacity:.95;transform:translateY(0) scale(1)}70%{opacity:.75;transform:translateY(-14px) scale(1)}100%{opacity:0;transform:translateY(-26px) scale(1.25)}}
  .tx-nav a{transition:background-color .3s ease,color .3s ease}
  @media (prefers-reduced-motion:reduce){.tx-step{opacity:1;transform:none;transition:none}.tx-line i{transform:none;transition:none}.tx-ring-text,.tx-product-img,.tx-thread.in .tx-bub{animation:none}.tx-bub{opacity:.8;transform:none}}
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
  /* Botox (round 14): the price list and the FAQ take the same spacing as Before & after too */
  main>section#prices,main>section[aria-labelledby="faq"]{padding-top:clamp(64px,7vw,104px)!important;padding-bottom:clamp(64px,7vw,104px)!important}
  /* round 15: Our team, Testimonials, the price list and the FAQ line up with the 1180px content of the other sections */
  main{--tx:max(var(--gx),calc((100% - 1180px) / 2))}
  main>section[aria-labelledby="team"],main>section[aria-labelledby="faq"]{padding-left:var(--tx)!important;padding-right:var(--tx)!important}
  /* testimonials (round 22): the words line up with the content, the card row runs edge to edge */
  main>section[aria-labelledby="testimonials"]{padding-left:0!important;padding-right:0!important}
  main>section[aria-labelledby="testimonials"]>div:not(.promo-rev-rows),main>section[aria-labelledby="testimonials"]>p{padding-left:var(--tx)!important;padding-right:var(--tx)!important}
  main>section#prices>div{max-width:1180px!important}
  /* the free skin analysis band sits tight between Visit us and the FAQ */
  main>section[aria-labelledby="analysis-title"]{padding-top:clamp(40px,4.5vw,64px)!important;padding-bottom:0!important}
  main>section[aria-labelledby="faq"]{padding-top:clamp(48px,5vw,72px)!important}
  /* round 18: the FAQ's sticky heading stops below the section bar; Good to know: number badges, doctor card */
  main>section[aria-labelledby="faq"] .lg\:sticky{top:200px}
  .guide-num{background:linear-gradient(135deg,#26B1E7,#0F80C3);box-shadow:0 10px 20px -12px rgba(15,128,195,.9)}
  .guide-q{box-shadow:0 22px 44px -38px rgba(27,36,43,.35);transition:box-shadow .5s var(--e-out),transform .5s var(--e-out)}
  .guide-q:hover{transform:translateY(-2px);box-shadow:0 30px 56px -38px rgba(15,128,195,.4)}
  /* round 24: the book card in Good to know */
  .guide-book{background:radial-gradient(120% 90% at 100% 0%,#1C7FC0 0%,rgba(28,127,192,0) 55%),linear-gradient(155deg,#0F5E92 0%,#0A3D60 55%,#0B2234 100%);box-shadow:0 40px 70px -40px rgba(10,61,96,.75)}
  .guide-book-glow{position:absolute;right:-60px;bottom:-80px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(255,166,23,.35),transparent 65%);pointer-events:none}
  .guide-doc{background:radial-gradient(90% 80% at 100% 0%,rgba(38,177,231,.14),transparent 60%),linear-gradient(160deg,#fff,#F6F4EF);box-shadow:0 0 0 1px rgba(27,36,43,.06),0 26px 50px -40px rgba(27,36,43,.4)}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + MEDIA_CSS + SPACING + s[i:]

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
        <Breadcrumb items={PROC.crumbs} dark />
        <ProcHero p={PROC} />
        <TxGlance p={PROC} />
        <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden"><ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" /></section>
        <TxNav p={PROC} />
        <TxIntro p={PROC} />
        <TxFilm p={PROC} />
        <ProcOverview p={PROC} />
        <ProcChoose p={PROC} />
        <TxReel p={PROC} />
        <TxResults p={PROC} />
        <ProcPrices p={PROC} />
        <ProcGuide p={PROC} />
        <TxWhy p={PROC} />
        <Team />
        <PromoReviews />
        <TxVisit p={PROC} />
        <ProcAnalysis />
        <Faq items={PROC.faqs} lead={<>{PROC.faq.lead}<br /></>} strong={PROC.faq.strong} intro={PROC.faq.sub} />
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
