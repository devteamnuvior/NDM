"""Site-wide (2026-11-04), already applied to index.html and promotion.html:
1. booking forms (popup + Appointment section): the second screen after sending follows NDM's own thank-you screen
   (amber tick, "Thank you, we've received your request.", 24-hour call back, Schedule free consult now -> NDM online booking).
2. before & after compare cards: the top of each photo (down to just below the eyes) is blurred and darkened for privacy.
3. footer social icons take each network's brand colour on hover."""
import sys

THANKS = r'''/* second screen after a booking request (NDM's own thank-you screen) */
const BOOK_ONLINE = 'https://newdermamedlaserclinic.com/online-booking/';
function BookThanks({ id, onAnother }) {
  return (
    <div role="status" className="flex flex-col items-center py-2 text-center">
      <p className="font-inter text-[15px] font-semibold text-ndm-ink">Book your free consultation</p>
      <span aria-hidden="true" className="book-tick mt-6 grid size-[84px] place-items-center rounded-full bg-ndm-amber text-white shadow-[0_18px_36px_-16px_rgba(255,166,23,.8)]">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="m5.5 12.5 4.2 4.2 8.8-9.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <p id={id} className="mt-6 font-aeonik text-[clamp(26px,2.4vw,32px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink">Thank you, we’ve received<br /><span className="tt-strong text-ndm-deep">your request.</span></p>
      <p className="mt-3 max-w-[40ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">
        Our team will contact you within 24 hours. If you already know your schedule, you can <b className="font-semibold text-ndm-ink">book your consultation right now</b> (recommended).
      </p>
      <Btn href={BOOK_ONLINE} target="_blank" rel="noopener" v="book" hot className="mt-6">Schedule free consult now<span className="sr-only"> (opens the online booking calendar in a new tab)</span></Btn>
      <p className="mt-3.5 max-w-[36ch] font-inter text-[13px] leading-[1.5] text-ndm-muted">Choose your preferred date and time directly in our online booking calendar.</p>
      {onAnother && <button type="button" onClick={onAnother} className="mt-4 font-inter text-[13.5px] text-ndm-deep underline-offset-4 hover:underline">Send another request</button>}
    </div>
  );
}

'''

def patch(s):
    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a); assert c == n, (a[:70], c); s = s.replace(a, b)
    # 1. thank-you screens
    rep('function Appointment() {', THANKS + 'function Appointment() {')
    a = s.index('            <div role="status" className="flex min-h-[420px] flex-col items-start justify-center">')
    b = s.index('            </div>\n', s.index('Send another request</button>', a)) + len('            </div>\n')
    s = s[:a] + '            <div className="flex min-h-[420px] items-center justify-center"><BookThanks onAnother={() => setSent(false)} /></div>\n' + s[b:]
    a = s.index('            <div role="status" className="flex min-h-[360px] flex-col items-start justify-center pr-8">')
    b = s.index('              </div>\n            </div>\n', a) + len('              </div>\n            </div>\n')
    s = s[:a] + '            <div className="flex min-h-[420px] items-center justify-center"><BookThanks id="book-pop-title" onAnother={() => setSent(false)} /></div>\n' + s[b:]
    # 2. eye-area privacy blur on the compare cards (per case "eyes" = % from the top the blur reaches; default 44)
    rep('''        <img src={c.before} alt={alt('Before')} width={750} height={690} loading="lazy" decoding="async" draggable={false} className={img} style={crop} />''',
        '''        <img src={c.before} alt={alt('Before')} width={750} height={690} loading="lazy" decoding="async" draggable={false} className={img} style={crop} />
        <span aria-hidden="true" className="ba-eyes" style={{ height: `${c.eyes || 44}%` }} />''')
    rep('''        <img src={c.after} alt={alt('After')} width={750} height={690} loading="lazy" decoding="async" draggable={false} className={img} style={crop} />''',
        '''        <img src={c.after} alt={alt('After')} width={750} height={690} loading="lazy" decoding="async" draggable={false} className={img} style={crop} />
        <span aria-hidden="true" className="ba-eyes" style={{ height: `${c.eyes || 44}%` }} />''')
    # 3. footer social icons: brand colour on hover
    rep('''<li key={n}><a href={h} target="_blank" rel="noopener" aria-label={`NewDermaMed on ${n}`} className="grid place-items-center size-9 rounded-[10px] text-white transition-colors hover:bg-white hover:text-ndm-ink" style={{ background: 'rgba(255,255,255,.12)' }}><I /></a></li>''',
        '''<li key={n}><a href={h} target="_blank" rel="noopener" aria-label={`NewDermaMed on ${n}`} data-net={n.toLowerCase()} className="soc-ico grid place-items-center size-9 rounded-[10px] text-white"><I /></a></li>''')
    css = '''
  /* booking thank-you tick */
  .book-tick{animation:bookTick .6s var(--e-out) both}
  @keyframes bookTick{from{opacity:0;transform:scale(.6)}}
  /* before & after: blur and darken the top of each photo down past the eyes */
  .ba-eyes{position:absolute;inset:0 0 auto 0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(11,15,19,.38),rgba(11,15,19,.18) 70%,rgba(11,15,19,0));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);-webkit-mask-image:linear-gradient(180deg,#000 78%,transparent);mask-image:linear-gradient(180deg,#000 78%,transparent)}
  .ba-pill{z-index:2}
  /* social icons take each network's colour on hover */
  .soc-ico{background:rgba(255,255,255,.12);transition:background .3s ease,color .3s ease,transform .3s ease}
  .soc-ico:hover,.soc-ico:focus-visible{color:#fff;transform:translateY(-2px)}
  .soc-ico[data-net="instagram"]:hover,.soc-ico[data-net="instagram"]:focus-visible{background:radial-gradient(circle at 30% 107%,#FDF497 0%,#FD5949 45%,#D6249F 60%,#285AEB 90%)}
  .soc-ico[data-net="facebook"]:hover,.soc-ico[data-net="facebook"]:focus-visible{background:#1877F2}
  .soc-ico[data-net="youtube"]:hover,.soc-ico[data-net="youtube"]:focus-visible{background:#FF0000}
  .soc-ico[data-net="x"]:hover,.soc-ico[data-net="x"]:focus-visible{background:#000}
  .soc-ico[data-net="linkedin"]:hover,.soc-ico[data-net="linkedin"]:focus-visible{background:#0A66C2}
'''
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + css + s[i:]
    return s

for f in sys.argv[1:]:
    s = open(f).read()
    s = patch(s)
    open(f, 'w').write(s)
    print('patched', f)
