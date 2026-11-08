"""Build about.html from promotion.html (the latest page shell, with the site-wide cart and menu) plus the about UI.
usage: python3 build_about.py <ndm-homepage dir> <scratch dir>
"""
import json
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()
s = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', s, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build

# the shell's own breadcrumb data belongs to the promotion page
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


# FAQ: one list feeds both the page and the FAQPage structured data
FAQS = [
    ['What treatments are available at NewDermaMed?', 'NewDermaMed focuses on advanced non-surgical medical aesthetics, including laser hair removal, injectables and dermal fillers, acne and scar treatments, skin tightening, medical facials, body contouring, chemical peels, and skin rejuvenation with microneedling and PRP.'],
    ['What devices and technologies does the clinic use?', 'We use Health Canada approved medical devices, including Candela GentleMax Pro for laser hair removal, Cutera Excel V+ for vascular and pigmentation concerns, Morpheus8 for skin tightening and collagen stimulation, and CoolSculpting® for non-surgical fat reduction.'],
    ['Are the treatments safe and effective?', 'Treatments are performed by trained medical professionals using FDA and Health Canada approved devices and products, and each plan is tailored to your skin type and goals. As with any medical treatment, results and side effects can vary, and your provider reviews them with you at your consultation.'],
    ['Where are your clinics?', 'Uptown: 4763 Yonge Street, Toronto, ON M2N 5M5, near Sheppard-Yonge Station. Downtown: 790 Bay Street, Suite 900, Toronto, ON M5G 1N8, near College Station.'],
    ['Where can I park?', 'Uptown: Lot #56 at the Hullmark Centre, uPark at 9 Bogert Ave, or Parking Indigo at 25 Sheppard Ave W. Downtown: parking at 790 Bay Street, SP+ Parking at 201 Elizabeth St, or the lot at 76 College St.'],
    ['What are your clinic hours?', 'Both clinics are open Monday to Friday, 9am to 7pm, and Saturday, 10am to 5pm.'],
    ['How do I book a consultation?', 'You can book a free consultation by calling either clinic, filling out the online booking form, or visiting us in person. At your consultation, a specialist assesses your needs and recommends the treatment options that suit you.'],
]

CLINICS = [
    ('Uptown', '4763 Yonge Street', 'M2N 5M5', '+1-416-224-8800', 'https://maps.app.goo.gl/Gm8Wg4B1Q3yHGnkE7'),
    ('Downtown', '790 Bay Street, Suite 900', 'M5G 1N8', '+1-416-671-9766', 'https://maps.app.goo.gl/McaiszUJaKqPem5R7'),
]
ld = {
    '@context': 'https://schema.org',
    '@graph': [
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'},
            {'@type': 'ListItem', 'position': 2, 'name': 'About us'},
        ]},
        *[{
            '@type': 'MedicalClinic', 'name': f'NewDermaMed {n} Clinic', 'telephone': tel, 'email': 'info@newdermamed.com', 'hasMap': m,
            'address': {'@type': 'PostalAddress', 'streetAddress': st, 'addressLocality': 'Toronto', 'addressRegion': 'ON', 'postalCode': pc, 'addressCountry': 'CA'},
            'openingHoursSpecification': [
                {'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '09:00', 'closes': '19:00'},
                {'@type': 'OpeningHoursSpecification', 'dayOfWeek': 'Saturday', 'opens': '10:00', 'closes': '17:00'},
            ],
        } for n, st, pc, tel, m in CLINICS],
        *[{'@type': 'Person', 'name': n, 'jobTitle': t, 'worksFor': {'@type': 'MedicalOrganization', 'name': 'NewDermaMed'}} for n, t in (
            ('Dr. Negin Mastouri', 'Medical Director / Aesthetic Doctor'),
            ('Dr. Luis Figueroa', 'Vascular Surgeon'),
            ('Alin Gharibian', 'Clinic Director / Cosmetic Consultant'),
        )],
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQS]},
    ],
}

# 1. title, description, structured data
rep('<title>Promotions, NewDermaMed Toronto</title>', '<title>About Us, NewDermaMed Cosmetic &amp; Laser Clinic in Toronto</title>\n'
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" crossorigin="anonymous">\n'
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" crossorigin="anonymous"></script>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    '<meta name="description" content="Meet the NewDermaMed medical team and visit our Uptown and Downtown Toronto clinics: addresses, hours, parking, a clinic gallery and answers to common questions.">\n'
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')

# 2. about page CSS
css = '''
  /* about NewDermaMed: the clinic film opens to full width as it comes into view (as on the home page) */
  .cf-frame{--p:0;position:relative;height:min(88svh,880px);margin:0 calc((1 - var(--p)) * var(--gx));border-radius:0;overflow:hidden;background:#0B0F13;color:#fff;transform:translateZ(0)}
  .cf-frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(calc(1.12 - .12 * var(--p)))}
  .cf-frame::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(11,15,19,.22),rgba(11,15,19,.06) 30%,rgba(11,15,19,.86)),linear-gradient(90deg,rgba(11,15,19,.55),rgba(11,15,19,0) 60%)}
  @media (prefers-reduced-motion:reduce){.cf-frame{--p:1!important}}
  .cf-frame.is-hero{height:max(620px,min(100svh,960px))}
  .cf-frame.is-hero video{transform:none}
  .team-card{box-shadow:0 26px 50px -40px rgba(27,36,43,.45)}
  /* clinic maps: photo pin pops up when the map comes into view, numbered parking pins */
  .clinic-map .leaflet-container{font:inherit;background:#F2F2EF}
  .map-clinic{display:flex;flex-direction:column;align-items:center}
  .map-card{position:relative;width:160px;padding:5px;border-radius:16px;background:#fff;box-shadow:0 22px 44px -20px rgba(11,15,19,.5),0 0 0 1px rgba(27,36,43,.06);transform-origin:50% 100%;transform:translateY(10px) scale(.6);opacity:0;transition:transform .8s var(--e-out),opacity .4s ease}
  .clinic-map.is-on .map-card{transform:none;opacity:1}
  .map-photo{display:block;height:88px;overflow:hidden;border-radius:11px;background:#E8EBEE}
  .map-photo img{display:block;width:100%;height:100%;object-fit:cover}
  .map-name{display:block;padding:7px 4px 3px;font:600 12px/1.2 Inter,system-ui,sans-serif;color:#1B242B;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .map-card::after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#fff;filter:drop-shadow(0 2px 1px rgba(27,36,43,.08))}
  .map-stem{display:block;width:2px;height:34px;margin-top:7px;background:linear-gradient(#fff,#0F80C3);border-radius:2px;box-shadow:0 0 0 1px rgba(27,36,43,.06)}
  .map-dot{display:block;width:16px;height:16px;margin-top:-2px;border-radius:99px;background:#0F80C3;border:3px solid #fff;box-shadow:0 0 0 6px rgba(32,158,217,.25)}
  .clinic-map.is-on .map-dot{animation:mapPulse 2.2s ease-out infinite}
  @keyframes mapPulse{0%{box-shadow:0 0 0 0 rgba(32,158,217,.45)}100%{box-shadow:0 0 0 18px rgba(32,158,217,0)}}
  .map-park span{display:grid;place-items:center;width:30px;height:30px;border-radius:99px;background:#209ED9;color:#fff;font:700 13px/1 Inter,system-ui,sans-serif;border:2px solid #fff;box-shadow:0 8px 18px -8px rgba(15,128,195,.7);cursor:pointer;transition:transform .25s var(--e-out),background-color .25s ease}
  .map-park:hover span{transform:scale(1.12);background:#0F80C3}
  .map-tip{padding:8px 12px;border:0;border-radius:12px;box-shadow:0 14px 30px -14px rgba(11,15,19,.45);font:13px/1.4 Inter,system-ui,sans-serif;color:#1B242B}
  .map-tip strong{font-weight:600}
  .map-legend{display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border-radius:99px;background:rgba(255,255,255,.92);box-shadow:0 8px 20px -14px rgba(11,15,19,.5);font:500 12.5px/1 Inter,system-ui,sans-serif;color:#1B242B}
  .map-hint-tap{display:none}
  @media (hover:none){.map-hint-hover{display:none}.map-hint-tap{display:inline}}
  .clinic-map .leaflet-control-attribution{font-size:10.5px;background:rgba(255,255,255,.8)}
  .map-legend-dot{width:12px;height:12px;border-radius:99px;background:#0F80C3;border:2px solid #fff;box-shadow:0 0 0 3px rgba(32,158,217,.25)}
  .map-legend-p{display:grid;place-items:center;width:20px;height:20px;border-radius:99px;background:#209ED9;color:#fff;font-style:normal;font-size:10.5px;font-weight:700}
  .leaflet-popup-content{font:14px/1.45 Inter,system-ui,sans-serif;color:#1B242B}
  .leaflet-popup-content a{color:#0F80C3}
  .leaflet-popup-content-wrapper{border-radius:14px}
  /* gallery mosaic: columns drift slightly apart on scroll, tiles zoom on hover */
  .gal-col{will-change:transform}
  .gal-tile .gal-photo{transform:scale(1.06);transition:transform 1.4s var(--e-out)}
  .gal-tile.in .gal-photo{transform:scale(1)}
  .gal-tile:hover .gal-photo{transform:scale(1.07)}
  .gal-tile{box-shadow:0 18px 36px -28px rgba(27,36,43,.45)}
  /* gallery stage and filmstrip */
  .gal-stage{animation:galStage .7s var(--e-out) both}
  @keyframes galStage{from{opacity:0;transform:scale(1.04)}}
  .gal-film{opacity:.55;outline:2px solid transparent;outline-offset:2px;transition:opacity .3s ease,outline-color .3s ease}
  .gal-film:hover{opacity:.85}
  .gal-film.is-on{opacity:1;outline-color:#0F80C3}
  /* team bios fold open */
  .team-more{grid-template-rows:0fr;transition:grid-template-rows .5s var(--e-out)}
  .team-more.is-open{grid-template-rows:1fr}
  @media (prefers-reduced-motion:reduce){.map-card{transition:none}.clinic-map.is-on .map-dot,.gal-stage{animation:none}.team-more{transition:none}}
  .gal-img{animation:galImg .55s var(--e-out) both}
  .gal-grid .gal-tile{opacity:0;transform:translate3d(0,26px,0) scale(.985)}
  .gal-grid.in .gal-tile{animation:galTile .9s var(--e-out) var(--d,0s) both}
  @keyframes galTile{from{opacity:0;transform:translate3d(0,26px,0) scale(.985);clip-path:inset(12% 0 0 0 round 18px)}to{opacity:1;transform:none;clip-path:inset(0 0 0 0 round 18px)}}
  .gal-photo{transform:scale(1.04);transition:transform 1.2s var(--e-out)}
  .gal-tile button:hover .gal-photo{transform:scale(1.09)}
  @keyframes galImg{from{opacity:0;transform:scale(.97)}}
  .gal-view{opacity:0;transform:scale(.96);transition:opacity .35s ease,transform .55s var(--e-out)}
  .book-pop.is-on .gal-view{opacity:1;transform:none}
  .gal-thumb{opacity:.5;outline:2px solid transparent;outline-offset:2px;transition:opacity .3s ease,outline-color .3s ease}
  .gal-thumb:hover{opacity:.85}
  .gal-thumb.is-on{opacity:1;outline-color:#fff}
  @media (prefers-reduced-motion:reduce){.gal-view,.gal-thumb{transition:none}.gal-img,.gal-grid.in .gal-tile{animation:none}.gal-grid .gal-tile{opacity:1;transform:none}.gal-photo{transition:none}}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

# 3. menu links that belong on this page
# every About link opens this page from the top (about.html); only "About" itself becomes the top of this page
for k, v in (("about: 'about.html'", "about: '#top'"), ("'about-us': 'about.html'", "'about-us': '#top'")):
    rep(k, v)

# 5. about UI before the app, then the about app
ui = (scratch / 'about-ui.jsx').read_text()
faqs_js = 'const ABOUT_FAQS = ' + json.dumps(FAQS, ensure_ascii=False, indent=2) + ';\n'
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
  /* links from the menu land on a section of this page (#team, #uptown, ...) once React has rendered it */
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || id.startsWith('/')) return;
    let t = 0;
    const go = () => { t = setTimeout(() => { const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 100, true); }, 120); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    return () => { clearTimeout(t); window.removeEventListener('load', go); };
  }, []);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main">
        <Breadcrumb items={['About us']} dark />
        <AboutFilm hero />
        <AboutTeam />
        <AboutClinics />
        <AboutGallery />
        <Process />
        <Faq items={ABOUT_FAQS} lead="Your top questions," strong="answered" intro="Everything you need to know about our team, our clinics and your first visit." />
        <AboutContact />
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
s = s[:a] + '\n' + faqs_js + '\n' + ui + '\n/* ---------------------------------------------------------------- app (about page) */' + app + s[b:]

(root / 'about.html').write_text(s)
print('wrote about.html', len(s))
