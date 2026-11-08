"""Site-wide (2026-11-02): every "#/book" link opens the home page booking form as a popup; the floating cart bar on every page
(hidden on the first screen and over [data-pill-avoid] areas); "See all before & after" moves out of the bottom-right corner.
usage: python3 popup_patch.py index.html promotion.html"""
import sys

PILL = r'''
/* ---------------------------------------------------------------- floating cart bar (every page). Hidden on the first screen and over
   [data-pill-avoid] areas (the home header slides; data-pill-avoid="mobile" only under 768px); the floating search steps above it. */
function CartPill({ onOpen, hidden }) {
  const cart = React.useContext(CartCtx);
  const [bump, setBump] = useState(0);
  const [away, setAway] = useState(true);
  const last = useRef(cart.count);
  useEffect(() => { if (cart.count > last.current) setBump((b) => b + 1); last.current = cart.count; }, [cart.count]);
  useOnScroll(() => {
    const vh = window.innerHeight;
    let a = window.scrollY < vh * 0.5;
    document.querySelectorAll('[data-pill-avoid]').forEach((el) => {
      if (el.dataset.pillAvoid === 'mobile' && window.innerWidth >= 768) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh - 20 && r.bottom > vh - 90) a = true;
    });
    setAway(a);
  }, []);
  const show = cart.count > 0 && !hidden && !away;
  return (
    <button type="button" onClick={onOpen} tabIndex={show ? 0 : -1} aria-hidden={!show} data-float-avoid=""
      onTransitionEnd={(e) => { if (e.propertyName === 'transform') window.dispatchEvent(new Event('scroll')); }}
      aria-label={`View cart, ${cart.count} ${cart.count === 1 ? 'item' : 'items'}, ${money(cart.total)}`}
      className={`cart-pill fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-full bg-ndm-ink py-2 pl-2 pr-2 text-left text-white shadow-[0_24px_50px_-20px_rgba(11,15,19,.6)] sm:inset-x-auto sm:right-6 sm:bottom-6 ${show ? '' : 'is-off'}`}>
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
        <IconBag size={20} />
        <span key={bump} className="cart-bump absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ndm-sky px-1 font-inter text-[11px] font-semibold leading-none text-white">{cart.count}</span>
      </span>
      <span className="min-w-0 flex-1 sm:flex-none">
        <span className="block font-inter text-[12px] leading-none text-white/60">{cart.count} {cart.count === 1 ? 'item' : 'items'}</span>
        <span className="mt-1 block font-inter text-[16px] font-semibold leading-none tabular-nums">{money(cart.total)}</span>
      </span>
      <span className="ml-1 rounded-full bg-white px-4 py-2.5 font-inter text-[14px] font-medium text-ndm-ink">View cart</span>
    </button>
  );
}

/* ---------------------------------------------------------------- booking popup: any "#/book" link on any page opens the home page booking form.
   Centred card on desktop, bottom sheet on phones; Esc, the backdrop or the close button shut it. */
function BookPopup() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [treat, setTreat] = useState('');
  const [clinic, setClinic] = useState('');
  const box = useRef(null), opener = useRef(null);
  const close = useCallback(() => {
    setOpen(false);
    const b = opener.current;
    requestAnimationFrame(() => { if (b && b.isConnected) b.focus({ preventScroll: true }); });
  }, []);
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href="#/book"]');
      if (!a) return;
      e.preventDefault();
      opener.current = a; setSent(false); setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const t = setTimeout(() => { const f = box.current && box.current.querySelector('input'); if (f) f.focus({ preventScroll: true }); }, 140);
    const k = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => { clearTimeout(t); window.removeEventListener('keydown', k); lockScroll(false); };
  }, [open]);
  return (
    <div className={`book-pop fixed inset-0 z-[95] ${open ? 'is-on' : ''}`} aria-hidden={!open} {...(open ? {} : { inert: '' })}>
      <div className="book-scrim absolute inset-0 bg-[#0B0F13]/55 backdrop-blur-[6px]" onClick={close} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center sm:inset-0 sm:items-center sm:p-6">
        <div ref={box} role="dialog" aria-modal="true" aria-labelledby="book-pop-title" data-lenis-prevent=""
          className="book-card pointer-events-auto relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[24px] bg-white px-[clamp(20px,2.4vw,32px)] pb-[max(22px,env(safe-area-inset-bottom))] pt-6 shadow-[0_40px_80px_-30px_rgba(11,15,19,.6)] sm:max-w-[560px] sm:rounded-[20px] sm:pt-[clamp(20px,2.4vw,32px)]">
          <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-ndm-ink/15 sm:hidden" />
          <button type="button" onClick={close} aria-label="Close booking form" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-ndm-ink transition-colors hover:bg-ndm-mist sm:right-4 sm:top-4"><IconClose /></button>
          {sent ? (
            <div role="status" className="flex min-h-[360px] flex-col items-start justify-center pr-8">
              <span className="grid size-11 place-items-center rounded-full bg-ndm-blue/10 text-ndm-blue"><IconCheckBadge /></span>
              <p id="book-pop-title" className="mt-4 font-aeonik text-[28px] tracking-[-0.02em] text-ndm-ink">Thank you, your request is in.</p>
              <p className="mt-2 max-w-[44ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">Our team will call you with available days and times at the {(clinic || 'Uptown Clinic').replace(' Clinic', '')} clinic.</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Btn as="button" type="button" v="ink" onClick={close}>Done</Btn>
                <button type="button" onClick={() => setSent(false)} className="px-2 font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline">Send another request</button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <p className="inline-flex items-center gap-2 rounded-full border border-ndm-ink/10 bg-white px-3 py-1.5 font-inter text-[12.5px] text-ndm-ink">
                <img src="assets/icons/logo-mark.svg" alt="" className="size-4" />Book now at our two Toronto locations
              </p>
              <TwoTone id="book-pop-title" className="mt-4 pr-8" size="text-[clamp(26px,2.6vw,36px)]" lead={<>Book your consultation<br /></>} strong="in 2 simple steps" />
              <ol className="mt-4 grid gap-2.5" role="list">
                {['Enter your details and areas of concern.', 'We will call you with a possible day and time for your appointment.'].map((t, i) => (
                  <li key={t} className="flex items-start gap-3 font-inter text-[14.5px] leading-[1.5] text-ndm-ink">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ndm-amber font-inter text-[12.5px] font-medium text-white">{i + 1}</span>
                    <span className="pt-[3px]">{t}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-3">
                <input required name="name" autoComplete="name" placeholder="Your name" aria-label="Your name" className={fieldCls} />
                <input required type="email" name="email" autoComplete="email" placeholder="Your email" aria-label="Your email" className={fieldCls} />
                <input required type="tel" name="phone" autoComplete="tel" placeholder="Your phone number" aria-label="Your phone number" className={fieldCls} />
                <BookSelect name="treatment" value={treat} onChange={(e) => setTreat(e.target.value)} placeholder="Select your treatment">
                  {BOOK_TREATMENTS.map((t) => <option key={t} className="text-ndm-ink">{t}</option>)}
                </BookSelect>
                <BookSelect name="clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Select clinic location">
                  {BOOK_CLINICS.map(([c, a]) => <option key={c} value={c} className="text-ndm-ink">{c}, {a}</option>)}
                </BookSelect>
                <textarea name="message" rows={2} placeholder="Any concerns or questions?" aria-label="Any concerns or questions?" className={`${fieldCls} h-auto resize-none py-3`} />
                <div className="mt-2 flex flex-col items-center gap-2.5 text-center"><Btn as="button" type="submit" v="book" hot>Book Free Consultation</Btn><span className="font-inter text-[13px] text-ndm-muted">We call you to confirm a time.</span></div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
'''

CSS = '''
  /* floating cart bar */
  .cart-pill{transition:transform .6s var(--e-out),opacity .4s ease}
  .cart-pill.is-off{transform:translateY(140%);opacity:0;pointer-events:none}
  .cart-bump{animation:cartBump .5s var(--e-out)}
  @keyframes cartBump{40%{transform:scale(1.4)}}
  /* booking popup: bottom sheet on phones, centred card from 640px */
  .book-pop{visibility:hidden;transition:visibility 0s linear .5s}
  .book-pop.is-on{visibility:visible;transition-delay:0s}
  .book-scrim{opacity:0;transition:opacity .35s ease}
  .book-pop.is-on .book-scrim{opacity:1}
  .book-card{transform:translate3d(0,100%,0);transition:transform .55s var(--e-out)}
  .book-pop.is-on .book-card{transform:none}
  @media (min-width:640px){.book-card{opacity:0;transform:translate3d(0,18px,0) scale(.97);transition:transform .55s var(--e-out),opacity .3s ease}.book-pop.is-on .book-card{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.cart-pill,.book-scrim,.book-card{transition:none}.cart-bump{animation:none}}
'''

for path in sys.argv[1:]:
    s = open(path).read()

    def rep(a, b, n=1):
        global s
        c = s.count(a)
        assert c == n, (path, a[:90], c)
        s = s.replace(a, b)

    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + CSS + s[i:]
    rep('\nfunction App() {', PILL + '\nfunction App() {')
    rep('<div id="root"></div>', '<div id="root"></div>\n<div id="book-root"></div>')
    rep("ReactDOM.createRoot(document.getElementById('root')).render(<App />);",
        "ReactDOM.createRoot(document.getElementById('root')).render(<App />);\nReactDOM.createRoot(document.getElementById('book-root')).render(<BookPopup />);")
    drawer = "      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'pricing.html#prices'; }} />\n"
    if 'introDone' in s.split('\nfunction App() {')[1]:
        rep(drawer, drawer + "      <CartPill onOpen={() => setCartOpen(true)} hidden={!introDone || cartOpen || drawer || search} />\n")
        # home: the cart bar waits until the header slides have scrolled away
        rep('<section ref={sectionRef} id="top" data-nav="dark"', '<section ref={sectionRef} id="top" data-nav="dark" data-pill-avoid=""')
        # the pinned before & after on phones: its photo note sits at the very bottom
        rep('<section ref={ref} data-nav="dark" aria-labelledby="results" className="ba-dark relative z-10 text-white" style={{ height: REDUCED',
            '<section ref={ref} data-nav="dark" data-pill-avoid="mobile" aria-labelledby="results" className="ba-dark relative z-10 text-white" style={{ height: REDUCED')
    else:
        rep(drawer, drawer + "      <CartPill onOpen={() => setCartOpen(true)} hidden={cartOpen || drawer || search} />\n")

    # "See all before & after" leaves the bottom-right corner (where the cart bar sits) for the header, under the title
    rep('''            <Btn href={BA_ALL} v="light">See all before &amp; after</Btn>\n''', '')
    rep('''strong="by treatment" style={{ transitionDelay: '.06s' }} />
          </div>''', '''strong="by treatment" style={{ transitionDelay: '.06s' }} />
            <div className="rv mt-5" style={{ transitionDelay: '.12s' }}><Btn href={BA_ALL} v="light" sm>See all before &amp; after</Btn></div>
          </div>''')
    open(path, 'w').write(s)
    print('patched', path)
