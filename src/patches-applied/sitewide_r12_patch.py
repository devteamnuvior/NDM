"""Site-wide (2026-11-04), already applied to index.html and promotion.html:
chat assistant on every page (persona Olivia), PayPlans strip (Affirm + placeholder providers), mouse grab-to-scroll for sideways rows,
compact Book button in the phone header, amber Book button in the mobile menu, before & after blur removed, Aptos links -> aptos-thread-lift.html."""
import sys, re

def chat_block(index_src):
    a = index_src.index('\n/* ---------------------------------------------------------------- chat assistant')
    b = index_src.index('\nfunction App() {', a)
    return index_src[a:b]

SHARED_TOP = r'''
/* ---------------------------------------------------------------- mouse users can grab and drag any sideways-scrolling row */
(function dragScroll() {
  if (window.__ndmDrag) return; window.__ndmDrag = true;
  let el = null, x0 = 0, s0 = 0, moved = false;
  const scroller = (t) => {
    for (let n = t; n && n !== document.body; n = n.parentElement) {
      if (n.matches && n.matches('.ba-box,input,textarea,select,button.sw-ctrl,[data-no-drag]')) return null;
      const cs = getComputedStyle(n);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && n.scrollWidth > n.clientWidth + 4) return n;
    }
    return null;
  };
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    el = scroller(e.target); if (!el) return;
    x0 = e.clientX; s0 = el.scrollLeft; moved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!el) return;
    const dx = e.clientX - x0;
    if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('is-grab'); }
    if (moved) el.scrollLeft = s0 - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!el) return;
    const t = el; el = null; t.classList.remove('is-grab');
    if (moved) { const stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; t.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => t.removeEventListener('click', stop, true), 60); }
  });
  document.addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('.overflow-x-auto')) e.preventDefault(); });
})();

/* ---------------------------------------------------------------- flexible payment plans (NDM home "Flexible Payment Plans").
   Affirm is NDM's current partner; Klarna and Afterpay are placeholders until the clinic confirms its other providers. */
const AFFIRM_PREQUAL = 'https://www.affirm.ca/apps/prequal/?public_api_key=BHATVTE1I4OXSB6K&page_type=landing&use_promo=true&locale=en-CA&utm_source=mp_isw_view_prequal&unit_price=500';
const PAY_LOGOS = [
  ['Affirm', 'https://cdn-assets.affirm.com/images/blue_logo-transparent_bg.png', 'h-[17px]'],
  ['Klarna', 'https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg', 'h-[24px]'],
  ['Afterpay', 'https://static.afterpay.com/integration/logo-afterpay-colour.svg', 'h-[15px]'],
];
const IconCard = (p) => (<Svg size={20} {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9.5h18M7 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Svg>);
function PayPlans({ className = '' }) {
  return (
    <div className={`w-full max-w-[760px] rounded-[22px] border border-ndm-ink/[.08] bg-white p-4 text-left shadow-[0_24px_50px_-40px_rgba(27,36,43,.5)] sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconCard /></span>
          <div className="min-w-0">
            <p className="font-aeonik text-[19px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">Flexible payment plans</p>
            <p className="mt-0.5 font-inter text-[13.5px] text-ndm-muted">Start today, pay later.</p>
          </div>
        </div>
        <a href={AFFIRM_PREQUAL} target="_blank" rel="noopener" className="btn btn-ink btn-sm hidden shrink-0 sm:inline-flex">Start my plan<span className="sr-only"> (opens Affirm in a new tab)</span></a>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-ndm-ink/[.07] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <ul className="flex flex-wrap items-center gap-2" role="list" aria-label="Payment plan providers">
          {PAY_LOGOS.map(([n, src, h]) => (
            <li key={n} className="grid h-10 min-w-[84px] place-items-center rounded-[12px] bg-ndm-paper px-3.5 ring-1 ring-ndm-ink/[.06]"><img src={src} alt={n} loading="lazy" className={`${h} w-auto`} /></li>
          ))}
        </ul>
        <p className="font-inter text-[11.5px] leading-[1.45] text-ndm-muted sm:max-w-[32ch] sm:text-right">Subject to approval. Affirm: Canadian residents 19+, minimum $500 purchase.</p>
      </div>
      <a href={AFFIRM_PREQUAL} target="_blank" rel="noopener" className="btn btn-ink btn-sm btn-block mt-4 sm:hidden">Start my plan<span className="sr-only"> (opens Affirm in a new tab)</span></a>
    </div>
  );
}
'''

CSS = '''
  /* grab-to-scroll rows (mouse) */
  @media (hover:hover) and (pointer:fine){.overflow-x-auto{cursor:grab}}
  .is-grab{cursor:grabbing !important;scroll-snap-type:none !important;scroll-behavior:auto !important;user-select:none}
  .is-grab *{pointer-events:none}
'''

def patch(s, chat, is_index):
    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a); assert c == n, (a[:70], c); s = s.replace(a, b)
    # before & after: no blur
    s = re.sub(r'\n        <span aria-hidden="true" className="ba-eyes" style=\{\{ height: `\$\{c\.eyes \|\| 44\}%` \}\} />', '', s)
    s = re.sub(r'\n  /\* before & after: blur and darken the top of each photo down past the eyes \*/\n  \.ba-eyes\{[^\n]*\}\n  \.ba-pill\{z-index:2\}', '', s)
    assert 'ba-eyes' not in s
    # phone header: a compact Book button (the full one shows from 640px)
    rep('''            <Btn href="#/book" v="book" hot className="ml-1.5 !hidden sm:!flex">Book Free Consultation</Btn>''',
        '''            <Btn href="#/book" v="book" hot className="ml-1.5 !hidden sm:!flex">Book Free Consultation</Btn>
            <a href="#/book" className="ml-1 inline-flex h-9 items-center rounded-full bg-ndm-amber px-4 font-inter text-[14px] font-medium text-white shadow-[0_10px_22px_-12px_rgba(255,166,23,.9)] transition-colors hover:bg-[#F29A0A] sm:hidden">Book<span className="sr-only"> a free consultation</span></a>''')
    # mobile menu: the booking button in amber, like the header
    rep('''          <Btn href="#/book" onClick={onClose} v="book" block>Book Free Consultation</Btn>''',
        '''          <Btn href="#/book" onClick={onClose} v="book" hot block>Book Free Consultation</Btn>''')
    if is_index:
        assert chat in s
        s = s.replace(chat, '')
    rep("const PAGE_LINKS = { pricing: 'pricing.html',", "const PAGE_LINKS = { 'aptos-thread-lift': 'aptos-thread-lift.html', 'non-surgical-facelift-neck-jawline-eyebrow-nose-lift': 'aptos-thread-lift.html', pricing: 'pricing.html',")
    # shared code before App: drag rows, payment plans, chat
    if is_index:
        rep("const AFFIRM_PREQUAL = 'https://www.affirm.ca/apps/prequal/?public_api_key=BHATVTE1I4OXSB6K&page_type=landing&use_promo=true&locale=en-CA&utm_source=mp_isw_view_prequal&unit_price=500';\n", '')
    rep('\nfunction App() {', SHARED_TOP + chat + '\nfunction App() {')
    if not is_index:
        # promotion: chat on the page, payment plans under the specials carousel
        rep('''      <OfferPopup ready />
    </CartCtx.Provider>''', '''      <OfferPopup ready />
      <ChatBot ready hidden={cartOpen || drawer || search} />
    </CartCtx.Provider>''')
        rep('''          <div className="flex items-center gap-1.5" aria-hidden="true">
            {SPECIALS.map((_, i) => <i key={i} className={`sw-dot h-1.5 rounded-full transition-all duration-500 ${i === act ? 'is-on w-6' : 'w-1.5'}`} />)}
          </div>
        </div>''', '''          <div className="flex items-center gap-1.5" aria-hidden="true">
            {SPECIALS.map((_, i) => <i key={i} className={`sw-dot h-1.5 rounded-full transition-all duration-500 ${i === act ? 'is-on w-6' : 'w-1.5'}`} />)}
          </div>
          <PayPlans className="mt-3" />
        </div>''')
        # chat styles live in index's stylesheet; copy them
    # Aptos pages (after the chat is in, so its links change too)
    s = s.replace("'#/aptos-thread-lift'", "'aptos-thread-lift.html'").replace('"#/aptos-thread-lift"', '"aptos-thread-lift.html"')
    assert '#/aptos-thread-lift' not in s
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + CSS + s[i:]
    return s

idx = open('index.html').read()
chat = chat_block(idx)
chat_css = idx[idx.index('  /* chat assistant */'):idx.index('  @media (prefers-reduced-motion:reduce){.chat-note,.chat-msg,.chat-dot{animation:none}.chat-panel{transition:none}}')] + '  @media (prefers-reduced-motion:reduce){.chat-note,.chat-msg,.chat-dot{animation:none}.chat-panel{transition:none}}\n'
open('index.html', 'w').write(patch(idx, chat, True)); print('patched index.html')
pr = open('promotion.html').read()
pr = patch(pr, chat, False)
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = pr.rindex('</style>', 0, pr.index(anchor))
pr = pr[:i] + chat_css + pr[i:]
open('promotion.html', 'w').write(pr); print('patched promotion.html')
