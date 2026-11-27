"""Build before-after.html (round 12, after Ray's build_live_pages.py): the live site's before & after gallery, every case
with a filter by treatment, a full-size view, and the required "Individual results may vary" line.
Data: src/before-after-data.json (taken from the live home page's gallery); photos: assets/before-after/.
usage: python3 src/build_before_after.py <NDM dir> <src dir>
"""
import json, re, sys, html as H
from pathlib import Path

root, src = Path(sys.argv[1]), Path(sys.argv[2])
G = json.load(open(src / 'before-after-data.json', encoding='utf-8'))
s = (root / 'promotion.html').read_text(encoding='utf-8')
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)

UI = r'''
/* ---------------------------------------------------------------- before & after (redesign, user 2026-11-18, round 2): the procedure and
   concern pages' photo header (dark, full width, words on the left, the numbers on a glass card on the right), a sticky treatment
   bar, the cases in the treatment pages' 1180px column and spacing, a full-size viewer with previous / next and the treatment's
   own page, "Good to know" as numbered cards, the testimonials and Start your journey.
   Cases come from src/before-after-data.json; category cover photos (no before and after in them) are not cases. */
const BA_LIVE = 'https://newdermamedlaserclinic.com';
/* the treatment page each gallery category belongs to (prototype pages where they exist, else the live site) */
const BA_PAGES = {
  'botox': 'botox.html', 'belkyra': `${BA_LIVE}/injectables/double-chin/belkyra-kybella`, 'chemical peel': `${BA_LIVE}/skin/aesthetic/chemical-peels`,
  'dermamelan': `${BA_LIVE}/skin/aesthetic/dermamelan`, 'fractional skin resurfacing': `${BA_LIVE}/skin/laser-skin-resurfacing`,
  'laser acne chemical peels': `${BA_LIVE}/skin/acne-treatments`, 'laser acne': `${BA_LIVE}/skin/acne-treatments`, 'lip fillers': `${BA_LIVE}/injectables/lip-augmentation`,
  'microneedling': `${BA_LIVE}/skin/aesthetic/microneedling`, 'mole removal': `${BA_LIVE}/skin/mole-removal`, 'tear troughs': `${BA_LIVE}/injectables/tear-trough-correction`,
  'prp hair': `${BA_LIVE}/hair/hair-loss-treatments`, 'stretch marks': `${BA_LIVE}/body/stretch-marks`,
};
const baPage = (label) => BA_PAGES[(label || '').toLowerCase()] || '';
const baExt = (href) => /^https?:/.test(href) ? { target: '_blank', rel: 'noopener' } : {};
const baAlt = (c) => (c.label ? `${c.label}, before and after` : 'Before and after');
const BA_NOTES = [
  ['Individual results may vary', 'Every photo is one person’s result. Yours depends on your skin, health, the plan and aftercare.'],
  ['Shown as taken', 'Photos are shared as they were taken at the clinic, with part of the face covered for privacy.'],
  ['Start with a consultation', 'A free consultation and VISIA® skin analysis tell you which results are realistic for you.'],
];

function BaViewer({ list, at, onClose, onGo }) {
  const c = list[at];
  const box = useRef(null);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onGo(1); if (e.key === 'ArrowLeft') onGo(-1); };
    window.addEventListener('keydown', k);
    lockScroll(true);
    box.current && box.current.focus();
    return () => { window.removeEventListener('keydown', k); lockScroll(false); };
  }, [onClose, onGo]);
  const href = baPage(c.label);
  const side = 'ba-v-side grid size-14 shrink-0 place-items-center rounded-full text-white transition-colors max-md:hidden';
  const step = 'ba-v-step inline-flex h-12 items-center gap-2 rounded-full px-5 font-inter text-[15px] font-medium text-white transition-colors';
  return (
    <div role="dialog" aria-modal="true" aria-label={baAlt(c)} className="ba-viewer fixed inset-0 z-[95] flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-[var(--gx)] py-4" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-inter text-[13.5px] font-medium tabular-nums text-white">{at + 1} of {list.length}</span>
        <button ref={box} type="button" onClick={onClose} aria-label="Close" className="ba-v-side grid size-12 place-items-center rounded-full text-white"><IconClose /></button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-5 px-[var(--gx)]">
        <button type="button" aria-label="Previous case" onClick={(e) => { e.stopPropagation(); onGo(-1); }} className={side}><IconArrow size={18} className="rotate-180" /></button>
        <figure key={c.src} className="ba-fig m-0 flex max-h-full min-h-0 w-full max-w-[780px] flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="min-h-0 flex-1 overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_40px_90px_-40px_rgba(0,0,0,.9)]">
            <img src={c.src} alt={baAlt(c)} className="h-full max-h-[62vh] w-full rounded-[14px] object-contain" />
          </div>
          <figcaption className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <span>
              <span className="block font-aeonik text-[clamp(26px,2.6vw,34px)] leading-[1.1] tracking-[-0.02em] text-white">{c.label || 'Before & after'}</span>
              <span className="mt-1.5 block font-inter text-[15px] text-white/80">Individual results may vary</span>
            </span>
            {href && <a href={href} {...baExt(href)} className="ba-v-about group inline-flex h-12 items-center gap-2 rounded-full px-5 font-inter text-[15px] font-medium transition-colors">About {c.label}<IconArrow size={14} className="transition-transform group-hover:translate-x-1" /></a>}
          </figcaption>
        </figure>
        <button type="button" aria-label="Next case" onClick={(e) => { e.stopPropagation(); onGo(1); }} className={side}><IconArrow size={18} /></button>
      </div>
      <div className="flex items-center justify-center gap-3 px-[var(--gx)] pb-6 pt-5" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => onGo(-1)} className={step}><IconArrow size={14} className="rotate-180" />Previous</button>
        <button type="button" onClick={() => onGo(1)} className={step}>Next<IconArrow size={14} /></button>
      </div>
    </div>
  );
}

const BA_HERO = { d: 'assets/hero/treatment-room.jpg', alt: 'A treatment room at NewDermaMed, with VISIA skin analysis images on the screen', pos: '50% 50%' };
const BA_WRAP = 'mx-auto w-full max-w-[1180px]';

function BaHero({ cases, labels, onBrowse }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    const h = img.parentElement.offsetHeight;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.2, h * 0.1).toFixed(1)}px,0)`;
  }, []);
  const stats = [[cases, 'Cases'], [labels, 'Treatments'], ['2', 'Toronto clinics']];
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="gallery-title" className="ba-hero relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <img ref={pic} src={BA_HERO.d} alt="" fetchpriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: BA_HERO.pos }} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.8) 0%,rgba(11,15,19,.5) 50%,rgba(11,15,19,.3) 100%),linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,0) 30%,rgba(11,15,19,0) 70%,rgba(11,15,19,.45) 100%)' }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.6) 0%,rgba(11,15,19,.4) 30%,rgba(11,15,19,.7) 62%,rgba(11,15,19,.9) 100%)' }} />
      <div className="grid items-end gap-10 px-[var(--gx)] pb-[clamp(36px,5vw,72px)] pt-[184px] sm:pt-[170px] lg:min-h-[min(88svh,820px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-center xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[640px]">
          <Eyebrow dark className="rv">Before &amp; after</Eyebrow>
          <TwoTone as="h1" id="gallery-title" dark className="rv mt-5" size="text-[clamp(44px,5.6vw,88px)]" lead={<>Real patients,<br /></>} strong="real results" style={{ transitionDelay: '.04s' }} />
          <p className="rv mt-5 max-w-[48ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.08s' }}>Cases from our Uptown and Downtown clinics, by treatment. Each photo shows one person’s result, as it was taken at the clinic.</p>
          <p className="rv mt-3 flex items-start gap-2 font-inter text-[14px] leading-[1.5] text-white/75" style={{ transitionDelay: '.1s' }}><IconPin size={15} className="mt-0.5 shrink-0 text-ndm-sky" />Uptown on Yonge Street and Downtown on Bay Street, Toronto</p>
          <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: '.14s' }}>
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
            <Btn href="#ba-cases" v="glass" onClick={(e) => { e.preventDefault(); onBrowse(); }}>Browse the cases</Btn>
          </div>
        </div>
        <div className="ba-glass rv rounded-[26px] p-[clamp(20px,2.2vw,30px)]" style={{ transitionDelay: '.18s' }}>
          <p className="font-mont text-[11.5px] uppercase tracking-[.16em] text-white/70">The gallery</p>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {stats.map(([n, t]) => (
              <div key={t} className="border-l border-white/15 pl-3 first:border-l-0 first:pl-0">
                <dt className="sr-only">{t}</dt>
                <dd className="font-aeonik text-[clamp(30px,2.6vw,40px)] leading-none tracking-[-0.03em] tabular-nums">{n}<span className="mt-1.5 block font-inter text-[12.5px] tracking-normal text-white/65">{t}</span></dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 font-inter text-[13px] leading-[1.5] text-white/75"><BaIconInfo className="mt-0.5 shrink-0" />Individual results may vary. Your provider explains what is realistic for you.</p>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const grid = useRef(null), sec = useRef(null), notes = useRef(null);
  useReveal(sec); useReveal(notes);
  const cases = G.cases;
  const labels = G.labels.filter((l) => cases.some((c) => c.label === l));
  const count = (l) => cases.filter((c) => c.label === l).length;
  const [on, setOn] = useState('All');
  const [open, setOpen] = useState(-1);
  const list = cases.filter((c) => on === 'All' || c.label === on);
  const toCases = () => { const el = document.getElementById('ba-cases'); el && scrollToY(el.getBoundingClientRect().top + window.scrollY - 160); };
  const go = useCallback((d) => setOpen((i) => (i + d + list.length) % list.length), [list.length]);
  const close = useCallback(() => setOpen(-1), []);
  useEffect(() => { const el = grid.current; if (el) el.querySelectorAll('.rv').forEach((x) => x.classList.add('in')); }, [on]);
  const about = on !== 'All' && baPage(on);
  return (
    <>
      <BaHero cases={cases.length} labels={labels.length} onBrowse={toCases} />


      <section ref={sec} id="ba-cases" aria-labelledby="ba-cases-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
        <div className={BA_WRAP}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow className="rv">Gallery</Eyebrow>
              <TwoTone id="ba-cases-title" className="rv mt-5" size="text-[clamp(32px,3.4vw,52px)]" lead={<>{on === 'All' ? 'Every case,' : `${on},`}<br /></>} strong={`${list.length} ${list.length === 1 ? 'case' : 'cases'}`} style={{ transitionDelay: '.06s' }} />
            </div>
            <p className="rv max-w-[380px] font-inter text-[15px] leading-[1.6] text-ndm-muted md:mb-2" style={{ transitionDelay: '.1s' }}>
              {about ? <>Open a case to see it full size. <a href={about} {...baExt(about)} className="font-medium text-ndm-deep underline-offset-4 hover:underline">Read about {on}</a>.</> : 'Open a case to see it full size, then go on to the case before or after it.'}
            </p>
          </div>
          <div role="group" aria-label="Filter by treatment" className="rv mt-[clamp(24px,2.6vw,36px)] flex flex-wrap gap-2" style={{ transitionDelay: '.12s' }}>
            {['All', ...labels].map((l) => (
              <button key={l} type="button" onClick={() => setOn(l)} aria-pressed={on === l}
                className={`ba-chip inline-flex items-center gap-2 rounded-full py-2 pl-4 pr-2.5 font-inter text-[14px] transition-colors ${on === l ? 'is-on' : ''}`}>
                {l}<span className="ba-chip-n rounded-full px-2 py-0.5 text-[12px] tabular-nums">{l === 'All' ? cases.length : count(l)}</span>
              </button>
            ))}
          </div>
          <ul ref={grid} className="mt-[clamp(20px,2.2vw,32px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {list.map((c, i) => (
              <li key={c.src} className="rv in">
                <button type="button" onClick={() => setOpen(i)} className="ba-card group relative block w-full overflow-hidden rounded-[24px] bg-white text-left">
                  <span className="relative block aspect-[431/310] overflow-hidden bg-ndm-mist">
                    <img src={c.src} alt={baAlt(c)} loading={i < 6 ? 'eager' : 'lazy'} decoding="async" className="ba-card-img absolute inset-0 h-full w-full object-cover" />
                    <span className="ba-card-shade absolute inset-0" aria-hidden="true" />
                    <span className="ba-zoom absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12.5px] font-medium text-ndm-ink backdrop-blur-[8px]" aria-hidden="true">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>View
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3 px-5 pb-5 pt-4">
                    <span>
                      <span className="block font-aeonik text-[20px] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.label || 'Before & after'}</span>
                      <span className="mt-1 block font-inter text-[12.5px] text-ndm-muted">Case {String(i + 1).padStart(2, '0')} · Individual results may vary</span>
                    </span>
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-ndm-paper text-ndm-deep ring-1 ring-ndm-ink/[.08] transition-colors group-hover:bg-ndm-deep group-hover:text-white"><IconArrow size={13} /></span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section ref={notes} aria-labelledby="ba-notes-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
        <div className={BA_WRAP}>
          <Eyebrow className="rv">Good to know</Eyebrow>
          <TwoTone id="ba-notes-title" className="rv mt-5" size="text-[clamp(32px,3.4vw,52px)]" lead={<>Reading before<br /></>} strong="and after photos" style={{ transitionDelay: '.06s' }} />
          <ol className="rv mt-[clamp(28px,3vw,44px)] grid gap-4 md:grid-cols-3" style={{ transitionDelay: '.1s' }}>
            {BA_NOTES.map(([t, d], i) => (
              <li key={t} className="ba-note relative overflow-hidden rounded-[24px] bg-white p-[clamp(22px,2.2vw,30px)] ring-1 ring-ndm-ink/[.06]">
                <span aria-hidden="true" className="ba-note-n font-aeonik tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="relative block font-aeonik text-[22px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{t}</span>
                <span className="relative mt-2 block font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {open >= 0 && list[open] && <BaViewer list={list} at={open} onClose={close} onGo={go} />}
    </>
  );
}

'''

APP = r'''
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
        <Breadcrumb items={['Before & after']} dark />
        <Gallery />
        <PromoReviews />
        <ProcAnalysis />
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

i = s.rindex('</style>', 0, s.index('<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'))
BA_CSS = r'''
  /* before & after redesign (2026-11-18, round 2) */
  .ba-glass{background:rgba(255,255,255,.08);-webkit-backdrop-filter:blur(18px) saturate(140%);backdrop-filter:blur(18px) saturate(140%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 30px 60px -36px rgba(0,0,0,.6)}
  .ba-filter{background:rgba(250,250,248,.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
  .ba-card{box-shadow:inset 0 0 0 1px rgba(27,36,43,.06);transition:transform .55s var(--e-out),box-shadow .55s var(--e-out)}
  .ba-card-img{transition:transform 1.2s var(--e-out)}
  .ba-card-shade{background:linear-gradient(180deg,rgba(11,15,19,0) 55%,rgba(11,15,19,.28));opacity:0;transition:opacity .45s ease}
  .ba-zoom{opacity:0;transform:translateY(6px);transition:opacity .35s ease,transform .35s var(--e-out)}
  @media (hover:hover){.ba-card:hover{transform:translateY(-4px);box-shadow:inset 0 0 0 1px rgba(15,128,195,.25),0 34px 64px -38px rgba(15,60,95,.5)}.ba-card:hover .ba-card-img{transform:scale(1.04)}.ba-card:hover .ba-card-shade,.ba-card:hover .ba-zoom{opacity:1;transform:none}}
  @media (hover:none){.ba-zoom{opacity:1;transform:none}}
  .ba-note-n{position:absolute;right:18px;top:6px;font-size:84px;line-height:1;letter-spacing:-.04em;color:rgba(15,128,195,.08)}
  .ba-fig{animation:baIn .45s var(--e-out) both}
  @keyframes baIn{from{opacity:0;transform:translateY(10px) scale(.985)}}
  @media (prefers-reduced-motion:reduce){.ba-card,.ba-card-img,.ba-zoom,.ba-card-shade{transition:none}.ba-fig{animation:none}}
  .ba-chip{background:#fff;color:rgba(27,36,43,.82);box-shadow:inset 0 0 0 1px rgba(27,36,43,.09)}
  .ba-chip:hover{color:#1B242B;box-shadow:inset 0 0 0 1px rgba(15,128,195,.35)}
  .ba-chip-n{background:rgba(27,36,43,.06);color:#5A646C}
  .ba-chip.is-on{background:#0F80C3;color:#fff;box-shadow:none}
  .ba-chip.is-on .ba-chip-n{background:rgba(255,255,255,.22);color:#fff}
  .ba-viewer{background:rgba(6,9,12,.96);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
  .ba-v-side,.ba-v-step{background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
  .ba-v-side:hover,.ba-v-step:hover{background:#fff;color:#0B0F13}
  .ba-v-about{background:#fff;color:#0B0F13}
  .ba-v-about:hover{background:#26B1E7;color:#0B0F13}
  /* testimonials as on the Botox page: the words on the 1180px column, the card row edge to edge */
  main{--tx:max(var(--gx),calc((100% - 1180px) / 2))}
  main>section[aria-labelledby="testimonials"]{padding:clamp(64px,7vw,104px) 0!important}
  main>section[aria-labelledby="testimonials"]>div:not(.promo-rev-rows),main>section[aria-labelledby="testimonials"]>p{padding-left:var(--tx)!important;padding-right:var(--tx)!important}
'''
s = s[:i] + '\n' + BA_CSS + '\n  .peach{position:relative}\n  .peach::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 18% 8%,rgba(255,186,148,.35),rgba(255,186,148,0) 62%);mix-blend-mode:soft-light}\n' + s[i:]
assert s.count('<title>Promotions, NewDermaMed Toronto</title>') == 1
s = s.replace('<title>Promotions, NewDermaMed Toronto</title>', '<title>Before &amp; After Gallery, NewDermaMed Toronto</title>')
old_desc = '<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">'
assert s.count(old_desc) == 1
s = s.replace(old_desc, '<meta name="description" content="' + H.escape(G['subs'][0] if G['subs'] else G['title'], quote=True) + ' Individual results may vary.">')
a = s.index('\nfunction App() {')
b = s.index('ReactDOM.createRoot', a)
data = '/* ---------------------------------------------------------------- the gallery (src/before-after-data.json) */\nconst G = ' + json.dumps({k: G[k] for k in ('title', 'title2', 'subs', 'cases', 'labels')}, ensure_ascii=False) + ';\n'
s = s[:a] + '\n' + data + UI + '\n' + (src / 'journey-ui.jsx').read_text(encoding='utf-8') + '\n/* ---------------------------------------------------------------- app (before & after) */' + APP + s[b:]
(root / 'before-after.html').write_text(s, encoding='utf-8')
print('before-after.html written:', len(G['cases']), 'cases,', len(G['labels']), 'treatments')
