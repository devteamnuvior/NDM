"""Site-wide (2026-11-04), already applied to index.html and promotion.html:
AwardsMotion (the eight Top Choice badges appear one by one with their years, then "8 Years of Excellence", then everything
fades and the loop starts again) replaces NDM's Trust-Animation GIF; promotion carousel cards get the same photo circle as home."""
import sys
AW = r'''
/* ---------------------------------------------------------------- Top Choice Award motion (after NDM's Trust-Animation GIF, rebuilt with the badge images):
   badges appear left to right with their year, then "8", then the words; a short hold, a soft fade, and it loops */
const AWARD_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
function AwardsMotion({ className = '' }) {
  const ref = useRef(null);
  const N = AWARD_YEARS.length;
  const [step, setStep] = useState(REDUCED ? N + 3 : 0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (REDUCED) return;
    let t = 0, running = false;
    const play = () => {
      setOut(false); setStep(0);
      let i = 0;
      const tick = () => {
        i += 1; setStep(i);
        if (i < N + 3) t = setTimeout(tick, i < N ? 240 : 480);
        else t = setTimeout(() => { setOut(true); t = setTimeout(play, 650); }, 3400);
      };
      t = setTimeout(tick, 250);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; clearTimeout(t); }
    }, { threshold: 0.2 });
    io.observe(ref.current);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <div ref={ref} className={`aw-motion ${out ? 'is-out' : ''} ${className}`}>
      <ul className="aw-row" role="list" aria-label="Top Choice Award, every year from 2019 to 2026">
        {AWARD_YEARS.map((y, i) => (
          <li key={y} className={`aw-b ${step > i ? 'on' : ''}`}>
            <img src={`assets/awards/top-choice-${y}.png`} alt={`Top Choice Award ${y}`} loading="lazy" draggable="false" />
            <span>{y}</span>
          </li>
        ))}
      </ul>
      <p className="aw-txt">
        <span className={`aw-n font-aeonik ${step > N ? 'on' : ''}`}>8</span>
        <span className="aw-words">
          <span className={`aw-t1 font-aeonik ${step > N + 1 ? 'on' : ''}`}>Years of Excellence</span>
          <span className={`aw-t2 font-inter ${step > N + 2 ? 'on' : ''}`}>Toronto’s Top Choice Cosmetic Clinic</span>
        </span>
      </p>
    </div>
  );
}
'''
CSS = '''
  /* Top Choice Award motion */
  .aw-motion{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:clamp(14px,2.2vw,34px)}
  .aw-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,1vw,14px)}
  @media (min-width:640px){.aw-row{grid-template-columns:repeat(8,minmax(0,1fr))}}
  .aw-b{display:flex;flex-direction:column;align-items:center;opacity:0;transform:translateY(10px) scale(.6);transition:opacity .45s ease,transform .65s cubic-bezier(.3,1.45,.5,1)}
  .aw-b.on{opacity:1;transform:none}
  .aw-b img{width:clamp(56px,5.4vw,80px);height:auto;filter:drop-shadow(0 8px 12px rgba(120,90,30,.18))}
  .aw-b span{margin-top:6px;font:500 12px/1 Inter,system-ui,sans-serif;color:#5A646C;letter-spacing:.02em}
  .aw-txt{display:flex;align-items:center;gap:12px;margin:0;color:#1B242B;text-align:left}
  .aw-n{font-size:clamp(48px,4.6vw,64px);line-height:1;opacity:0;transform:scale(.6);transition:opacity .4s ease,transform .6s cubic-bezier(.3,1.45,.5,1)}
  .aw-n.on{opacity:1;transform:none}
  .aw-words{display:flex;flex-direction:column;gap:4px}
  .aw-t1{font-size:clamp(20px,1.8vw,26px);line-height:1.1;letter-spacing:-.01em;clip-path:inset(0 100% 0 0);transition:clip-path .9s steps(19,end)}
  .aw-t1.on{clip-path:inset(0 0 0 0)}
  .aw-t2{font-size:clamp(13px,1.05vw,15px);color:#5A646C;opacity:0;transform:translateY(6px);transition:opacity .5s ease,transform .6s ease}
  .aw-t2.on{opacity:1;transform:none}
  .aw-motion.is-out .aw-b.on,.aw-motion.is-out .aw-n.on,.aw-motion.is-out .aw-t2.on{opacity:0;transition:opacity .55s ease}
  .aw-motion.is-out .aw-t1.on{opacity:0;transition:opacity .55s ease}
  @media (prefers-reduced-motion:reduce){.aw-b,.aw-n,.aw-t1,.aw-t2{transition:none;opacity:1;transform:none;clip-path:none}}
  .sw-photo{box-shadow:0 0 0 3px #fff,0 0 0 4px rgba(27,36,43,.08),0 10px 22px -12px rgba(27,36,43,.5);transition:box-shadow .5s ease}
  .sw-card.is-on .sw-photo{box-shadow:0 0 0 3px #fff,0 0 0 5px #209ED9,0 10px 22px -12px rgba(27,36,43,.5)}
'''
for f in sys.argv[1:]:
    s = open(f).read()
    def rep(a, b, n=1):
        global s
        c = s.count(a); assert c == n, (f, a[:60], c); s = s.replace(a, b)
    rep('''            <img src={TRUST_GIF} alt="Awards and trusted brand partners of NewDermaMed" loading="lazy" className="block h-auto w-full" />''', '''            <AwardsMotion />''')
    rep('''        <div className="mt-8 overflow-x-auto px-[var(--gx)] no-scrollbar">
          <img src={TRUST_GIF} alt="Awards and trusted brand partners of NewDermaMed" loading="lazy" className="block h-auto w-[640px] max-w-none mix-blend-multiply sm:w-full sm:max-w-full" />
        </div>''', '''        <div className="mt-8 px-[var(--gx)]"><AwardsMotion /></div>''')
    rep('\nfunction SayingStacked() {', AW + '\nfunction SayingStacked() {')
    if 'promotion' in f:
        rep('''<span className="sw-badge grid shrink-0 place-items-center rounded-full" style={{ width: 46 * k, height: 46 * k }}><SpecialIcon k={s.icon} /></span>''',
            '''<span className="sw-photo block shrink-0 overflow-hidden rounded-full" style={{ width: 52 * k, height: 52 * k }}><img src={s.img} alt="" loading="lazy" draggable="false" className="h-full w-full object-cover" /></span>''')
        add = CSS
    else:
        add = CSS.split('  .sw-photo{')[0]
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + add + s[i:]
    open(f, 'w').write(s); print('patched', f)
