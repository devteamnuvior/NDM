"""Build before-after.html from the live home page's before & after gallery (src/live/pages.json): the gallery's own headings,
every case image, a filter by treatment, and the required "Individual results may vary" line.
usage: python3 src/build_live_pages.py <NDM dir> <src dir>
"""
import json, re, sys, html as H
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
PAGES = json.load(open(src / 'live/pages.json', encoding='utf-8'))['pages']
IMG_MAP = json.load(open(src / 'live/images.json', encoding='utf-8')) if (src / 'live/images.json').exists() else {}
shell = (root / 'promotion.html').read_text(encoding='utf-8')
shell = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', shell, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build
shell = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', shell, count=1)

sec = next(s for s in PAGES['home']['sections'] if s['class'].startswith('before-after'))
heads = re.findall(r'<h2>(.*?)</h2>', sec['html'])
subs = re.findall(r'<h3>(.*?)</h3>', sec['html'])
cases = [{'src': IMG_MAP.get(u, u), 'label': (a or '').strip()} for u, a in sec['imgs']]
labels = []
for c in cases:
    if c['label'] and c['label'] not in labels: labels.append(c['label'])
cta = re.search(r'BOOK MY FREE CONSULTATION', sec['text']) is not None
GALLERY = {'title': H.unescape(heads[0]) if heads else 'Before & After Gallery', 'title2': H.unescape(heads[1]) if len(heads) > 1 else '', 'subs': [H.unescape(x) for x in subs], 'cases': cases, 'labels': labels}

UI = r'''
/* ---------------------------------------------------------------- before & after gallery: the live home page's cases, filtered by treatment */
function Gallery() {
  const ref = useRef(null), grid = useRef(null);
  useReveal(ref);
  const [on, setOn] = useState('All');
  const [open, setOpen] = useState(null);
  const list = G.cases.filter((c) => on === 'All' || c.label === on);
  useEffect(() => { const el = grid.current; if (!el) return; el.querySelectorAll('.rv').forEach((x) => x.classList.add('in')); }, [on]);
  useEffect(() => { if (open === null) return; const k = (e) => { if (e.key === 'Escape') setOpen(null); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open]);
  const t = G.title.split(/\s[–-]\s/);
  return (
    <section ref={ref} aria-labelledby="gallery-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(72px,8vw,120px)] pt-[clamp(160px,14vw,210px)]">
      <div className="mx-auto max-w-[860px] text-center">
        <Eyebrow className="rv">{G.title2 || 'Before & after'}</Eyebrow>
        <TwoTone as="h1" id="gallery-title" className="rv mx-auto mt-5" size="text-[clamp(34px,4.2vw,62px)]" lead={<>{t[0]}<br /></>} strong={t[1] || ''} style={{ transitionDelay: '.06s' }} />
        {G.subs.map((s, i) => <p key={i} className={`rv mx-auto mt-4 max-w-[56ch] font-inter leading-[1.6] ${i ? 'text-[15px] text-ndm-muted' : 'text-[17px] text-ndm-ink/85'}`} style={{ transitionDelay: '.1s' }}>{s}</p>)}
      </div>
      <div className="rv mx-auto mt-[clamp(28px,3.4vw,44px)] flex max-w-[1180px] flex-wrap justify-center gap-1.5" role="group" aria-label="Filter by treatment">
        {['All', ...G.labels].map((l) => <button key={l} type="button" onClick={() => setOn(l)} aria-pressed={on === l} className={`rounded-full px-3.5 py-2 font-inter text-[13.5px] transition-colors ${on === l ? 'bg-ndm-deep text-white' : 'bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep'}`}>{l}</button>)}
      </div>
      <ul ref={grid} className="mx-auto mt-7 grid max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" role="list">
        {list.map((c, i) => (
          <li key={c.src} className="rv in">
            <button type="button" onClick={() => setOpen(c)} className="group block w-full overflow-hidden rounded-[18px] bg-white p-2 text-left ring-1 ring-ndm-ink/[.06] shadow-[0_22px_44px_-36px_rgba(27,36,43,.35)]">
              <span className="peach relative block aspect-[4/3] overflow-hidden rounded-[12px] bg-ndm-mist"><img src={c.src} alt={c.label ? `${c.label}, before and after` : 'Before and after'} loading={i < 8 ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" /></span>
              <span className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-2.5"><span className="font-inter text-[13.5px] font-medium text-ndm-ink">{c.label || 'Before & after'}</span><span className="font-inter text-[12px] text-ndm-muted">View</span></span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 flex max-w-[1180px] items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-ndm-muted"><BaIconInfo className="mt-0.5 shrink-0" />Photos show individual cases and are shared for illustration only. Individual results may vary.</p>
      <div className="mt-10 flex justify-center"><Btn href="#/book" v="book" hot>Book Free Consultation</Btn></div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={open.label || 'Before and after'} className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0B0F13]/85 p-4" onClick={() => setOpen(null)}>
          <figure className="m-0 max-h-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            <img src={open.src} alt={open.label ? `${open.label}, before and after` : 'Before and after'} className="max-h-[80vh] w-auto max-w-full rounded-[14px] object-contain" />
            <figcaption className="mt-3 flex items-center justify-between font-inter text-[14px] text-white/85"><span>{open.label}</span><span className="text-white/60">Individual results may vary</span></figcaption>
          </figure>
          <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><IconClose /></button>
        </div>
      )}
    </section>
  );
}
'''
APP = r'''
function App() {
  const cart = useCartState();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main">
        <Breadcrumb items={['Before & after']} />
        <Gallery />
        <PromoReviews />
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
s = shell
i = s.rindex('</style>', 0, s.index('<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'))
s = s[:i] + '\n  .peach{position:relative}\n  .peach::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 18% 8%,rgba(255,186,148,.35),rgba(255,186,148,0) 62%);mix-blend-mode:soft-light}\n' + s[i:]
title = PAGES['before-after']['seo']['title'].replace(' - NDM', '') + ', NewDermaMed Toronto'
assert s.count('<title>Promotions, NewDermaMed Toronto</title>') == 1
s = s.replace('<title>Promotions, NewDermaMed Toronto</title>', '<title>' + H.escape(title) + '</title>')
old_desc = '<meta name="description" content="Current offers on lip filler, microneedling, peels, laser and skin boosters at NewDermaMed, Toronto. Every treatment starts with a free consultation.">'
assert s.count(old_desc) == 1
s = s.replace(old_desc, '<meta name="description" content="' + H.escape(GALLERY['subs'][0] if GALLERY['subs'] else GALLERY['title'], quote=True) + '">')
a = s.index('\nfunction App() {')
b = s.index('ReactDOM.createRoot', a)
data = '/* ---------------------------------------------------------------- the gallery: from the live home page (src/live/pages.json) */\nconst G = ' + json.dumps(GALLERY, ensure_ascii=False) + ';\n'
s = s[:a] + '\n' + data + UI + '\n/* ---------------------------------------------------------------- app (before & after) */' + APP + s[b:]
(root / 'before-after.html').write_text(s, encoding='utf-8')
print('before-after.html written:', len(cases), 'cases,', len(labels), 'treatments')
