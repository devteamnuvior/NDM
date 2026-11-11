"""Round 24, both shells (index.html, promotion.html):
- the Black Friday card leaves the About menu (desktop and phone) and becomes a quiet tab at the bottom centre of every page
  (after rowe-agent.framer.website's "Rowe for $24.50" tab: flared corners, mark, label, badge, arrow). Clicking it raises a
  full-width Black Friday panel with a live timer and links to black-friday-sale.html. Not shown on that page or after the sale.
- BfTimer / useBfClock: the shared timer (tiles, rolling digits, blinking red colons, sale progress), also used by the landing page.
usage: python3 src/patches-applied/r24_bf_dock.py <NDM dir>
"""
import re
import sys
from pathlib import Path

JS = r'''
/* ---------------------------------------------------------------- Black Friday (round 24): shared clock and timer, and the bottom tab
   that opens a full-width Black Friday panel. Dates match the black-friday campaign; the badge is the best offer on the landing page. */
const BF_SALE = { href: 'black-friday-sale.html', start: '2026-11-27T00:00:00-05:00', end: '2026-11-30T23:59:00-05:00', when: 'Nov 27 to 30', badge: 'Up to 60% off' };
function useBfClock(step = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), step); return () => clearInterval(t); }, [step]);
  const s = new Date(BF_SALE.start).getTime(), e = new Date(BF_SALE.end).getTime();
  const live = now >= s, over = now > e;
  const ms = Math.max(0, (live ? e : s) - now);
  return { live, over, pct: live ? Math.min(1, (now - s) / (e - s)) : 0, d: Math.floor(ms / 864e5), h: Math.floor((ms % 864e5) / 36e5), m: Math.floor((ms % 36e5) / 6e4), s: Math.floor((ms % 6e4) / 1e3) };
}
function BfDigits({ v }) {
  return <span className="bft-num font-aeonik">{String(v).padStart(2, '0').split('').map((c, i) => <span key={`${i}-${c}`} className="bft-dig">{c}</span>)}</span>;
}
function BfTimer({ t, size = 'md' }) {
  const cells = [[t.d, 'Days'], [t.h, 'Hours'], [t.m, 'Mins'], [t.s, 'Secs']];
  return (
    <div className={`bft bft-${size}`} role="timer" aria-label={`${t.live ? 'Offers end in' : 'Black Friday starts in'} ${t.d} days, ${t.h} hours and ${t.m} minutes`}>
      {cells.map(([n, l], k) => (
        <Fragment key={l}>
          {k > 0 && <span className="bft-sep font-aeonik" aria-hidden="true">:</span>}
          <span className="bft-cell" aria-hidden="true"><span className="bft-tile"><BfDigits v={n} /></span><span className="bft-lab">{l}</span></span>
        </Fragment>
      ))}
    </div>
  );
}
function BfDock() {
  const t = useBfClock(1000);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const tab = useRef(null);
  useEffect(() => { const id = setTimeout(() => setShown(true), 900); return () => clearTimeout(id); }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  const close = () => { setOpen(false); requestAnimationFrame(() => tab.current && tab.current.focus({ preventScroll: true })); };
  if (HERE === BF_SALE.href || t.over) return null;
  return (
    <>
      <div className={`bfd-scrim ${open ? 'is-on' : ''}`} onClick={close} aria-hidden="true" />
      <button ref={tab} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="bfd-panel"
        className={`bfd-tab ${shown && !open ? 'is-on' : ''}`}>
        <span aria-hidden="true" className="bfd-mark font-aeonik">%</span>
        <span className="bfd-label">Black Friday<span className="hidden sm:inline"> Sale</span></span>
        <span className="bfd-badge">{BF_SALE.badge}</span>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
      </button>
      <section id="bfd-panel" role="dialog" aria-modal="false" aria-label="Black Friday sale" className={`bfd-panel ${open ? 'is-open' : ''}`} {...(open ? {} : { inert: '' })}>
        <span aria-hidden="true" className="bfd-tape" />
        <button type="button" onClick={close} aria-label="Close the Black Friday panel" className="bfd-close">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div className="mx-auto grid max-w-[1180px] gap-8 px-[var(--gx)] pb-[calc(28px+env(safe-area-inset-bottom))] pt-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-center lg:gap-14 lg:pb-12 lg:pt-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3.5 py-1.5 font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/85"><i aria-hidden="true" className="bfd-dot" />Black Friday · {BF_SALE.when}</p>
            <h2 className="mt-4 font-aeonik text-[clamp(44px,6vw,84px)] font-normal leading-[.92] tracking-[-0.04em] text-white">Black Friday<span className="text-[#EE3A45]">.</span></h2>
            <p className="mt-4 max-w-[46ch] font-inter text-[15.5px] leading-[1.6] text-white/75"><b className="font-semibold text-white">{BF_SALE.badge} selected treatments</b> at both Toronto clinics. Build your plan, then book a free consultation to claim it.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href={BF_SALE.href} className="btn bfd-cta">See the Black Friday deals</a>
              <Btn href="#/book" v="glass" onClick={() => setOpen(false)}>Book Free Consultation</Btn>
            </div>
          </div>
          <div>
            <p className="mb-3 flex items-center justify-between gap-3 font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/65"><span>{t.live ? 'Offers end in' : 'Black Friday starts in'}</span><span className="hidden text-white/45 sm:inline">{t.live ? 'Nov 30, 11:59 pm' : 'Nov 27, 12:00 am'}</span></p>
            <BfTimer t={t} size="lg" />
            {t.live
              ? <div className="mt-5"><div className="bft-bar"><i style={{ width: `${(t.pct * 100).toFixed(1)}%` }} /></div><p className="mt-2 font-inter text-[12.5px] text-white/55">{Math.round(t.pct * 100)}% of Black Friday has passed</p></div>
              : <p className="mt-5 font-inter text-[13px] text-white/55">Doors open Friday, November 27. Plan ahead now, the deals are live on the page.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
'''
CSS = '''
  /* Black Friday timer (round 24): dark tiles with a red glow, rolling digits, blinking red colons */
  .bft{display:flex;align-items:flex-start;gap:clamp(4px,.8vw,10px)}
  .bft-cell{display:flex;flex:1;min-width:0;flex-direction:column;align-items:center;gap:9px}
  .bft-tile{position:relative;display:grid;width:100%;place-items:center;overflow:hidden;border-radius:16px;padding:.32em 0;background:linear-gradient(180deg,#1E1E21 0%,#161618 49.5%,#0F0F11 50.5%,#141416 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px rgba(255,255,255,.07),0 22px 36px -20px rgba(211,18,29,.75)}
  .bft-tile::before{content:"";position:absolute;inset:0;background:radial-gradient(90% 70% at 50% 0%,rgba(211,18,29,.32),transparent 70%)}
  .bft-tile::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.65);box-shadow:0 1px 0 rgba(255,255,255,.05)}
  .bft-num{position:relative;display:flex;line-height:1;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .bft-dig{display:inline-block;animation:bftRoll .55s cubic-bezier(.2,.7,.2,1) both}
  .bft-sm .bft-num{font-size:26px}.bft-md .bft-num{font-size:clamp(34px,4vw,50px)}.bft-lg .bft-num{font-size:clamp(40px,5.4vw,72px)}
  .bft-sep{padding-top:.2em;line-height:1;color:#EE3A45;animation:bftBlink 1s steps(1) infinite}
  .bft-sm .bft-sep{font-size:22px}.bft-md .bft-sep{font-size:clamp(28px,3vw,40px)}.bft-lg .bft-sep{font-size:clamp(32px,4vw,56px)}
  .bft-lab{font:600 10.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.55)}
  .bft-bar{height:4px;overflow:hidden;border-radius:9px;background:rgba(255,255,255,.1)}
  .bft-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#A50E18,#EE3A45)}
  @keyframes bftRoll{from{transform:translateY(-55%);opacity:0;filter:blur(3px)}to{transform:none;opacity:1;filter:none}}
  @keyframes bftBlink{50%{opacity:.25}}
  /* Black Friday bottom tab and full-width panel (round 24) */
  .bfd-tab{position:fixed;left:50%;bottom:0;z-index:54;display:flex;align-items:center;gap:10px;padding:9px 14px 9px 9px;border-radius:18px 18px 0 0;background:#0B0B0C;color:#fff;transform:translate(-50%,110%);transition:transform .6s cubic-bezier(.2,.7,.2,1);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 -10px 30px -18px rgba(11,11,12,.6)}
  .bfd-tab.is-on{transform:translate(-50%,0)}
  .bfd-tab::before,.bfd-tab::after{content:"";position:absolute;bottom:0;width:18px;height:18px;pointer-events:none}
  .bfd-tab::before{left:-18px;background:radial-gradient(circle at 0 0,transparent 17.5px,#0B0B0C 18px)}
  .bfd-tab::after{right:-18px;background:radial-gradient(circle at 100% 0,transparent 17.5px,#0B0B0C 18px)}
  .bfd-mark{display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:10px;background:linear-gradient(150deg,#EE3A45,#A50E18);font-size:19px;line-height:1;color:#fff}
  .bfd-label{font:500 15.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;white-space:nowrap}
  .bfd-badge{border-radius:999px;background:#fff;padding:6px 11px;font:600 13px/1 Inter,"Helvetica Neue",Arial,sans-serif;color:#C8101D;white-space:nowrap}
  @media (max-width:420px){.bfd-badge{display:none}}
  .bfd-scrim{position:fixed;inset:0;z-index:84;background:rgba(11,11,12,.45);opacity:0;pointer-events:none;transition:opacity .4s ease}
  .bfd-scrim.is-on{opacity:1;pointer-events:auto}
  .bfd-panel{position:fixed;left:0;right:0;bottom:0;z-index:85;max-height:92svh;overflow:auto;border-radius:28px 28px 0 0;color:#fff;transform:translateY(105%);transition:transform .7s cubic-bezier(.2,.8,.2,1);background:radial-gradient(60% 90% at 90% 0%,rgba(211,18,29,.38),transparent 60%),radial-gradient(40% 60% at 0% 100%,rgba(211,18,29,.18),transparent 70%),#0B0B0C;box-shadow:0 -40px 80px -40px rgba(0,0,0,.7)}
  .bfd-panel.is-open{transform:none}
  .bfd-tape{position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,transparent,#EE3A45 30%,#D3121F 70%,transparent)}
  .bfd-close{position:absolute;right:max(16px,calc((100% - 1180px) / 2));top:16px;z-index:1;display:grid;width:40px;height:40px;place-items:center;border-radius:99px;border:1px solid rgba(255,255,255,.18);color:#fff;transition:background-color .25s ease}
  .bfd-close:hover{background:rgba(255,255,255,.12)}
  .bfd-dot{width:7px;height:7px;border-radius:9px;background:#EE3A45;box-shadow:0 0 0 0 rgba(238,58,69,.7);animation:bfdPulse 1.8s ease-out infinite}
  .bfd-cta{background:#D3121F;border-color:#D3121F;color:#fff;box-shadow:0 14px 30px -14px rgba(211,18,29,.9)}
  .bfd-cta:hover,.bfd-cta:focus-visible{background:#A50E18;border-color:#A50E18}
  @keyframes bfdPulse{70%{box-shadow:0 0 0 8px rgba(238,58,69,0)}100%{box-shadow:0 0 0 0 rgba(238,58,69,0)}}
  @media (prefers-reduced-motion:reduce){.bfd-tab,.bfd-panel,.bfd-scrim{transition:none}.bft-dig,.bft-sep,.bfd-dot{animation:none}}
'''

for name in ['index.html', 'promotion.html']:
    f = Path(sys.argv[1]) / name
    s = f.read_text(encoding='utf-8')

    def rep(a, b):
        global s
        c = s.count(a)
        assert c == 1, (name, a[:80], c)
        s = s.replace(a, b)

    # the menu card goes (desktop panel and phone menu)
    rep('''        <div className="flex min-w-0 flex-col gap-2">
        <BfMenuCard onLink={onLink} />
        <ul className="px-3 py-1" role="list">''', '''        <ul className="px-3 py-1" role="list">''')
    rep('''        </ul>
        </div>
      </div>
    </div>
  );
}
''', '''        </ul>
      </div>
    </div>
  );
}
''')
    rep('''                <li><BfMenuCard onLink={onClose} m /></li>
''', '')
    a = s.index('\n/* ---------------------------------------------------------------- Black Friday sale link (round 23)')
    b = s.index('\n}\n', s.index('function BfMenuCard', a)) + 3
    s = s[:a] + '\n' + JS + s[b:]
    s, n = re.subn(r'  /\* Black Friday sale card in the About menu \(round 23\).*?@media \(prefers-reduced-motion:reduce\)\{\.bf-mc::before,\.bf-mc-t,\.bf-mc-tag i\{animation:none\}\}\n', CSS.lstrip('\n'), s, count=1, flags=re.S)
    assert n == 1, (name, 'css')
    rep("ReactDOM.createRoot(document.getElementById('book-root')).render(<BookPopup />);",
        "ReactDOM.createRoot(document.getElementById('book-root')).render(<BookPopup />);\n(() => { const d = document.createElement('div'); d.id = 'bf-dock-root'; document.body.appendChild(d); ReactDOM.createRoot(d).render(<BfDock />); })();")
    f.write_text(s, encoding='utf-8')
    print('patched', name)
