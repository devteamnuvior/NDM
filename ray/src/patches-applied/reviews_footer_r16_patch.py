"""Site-wide (2026-11-04), already applied: testimonials rows run a little faster, never pause on hover, and can be grabbed
and dragged either way (promotion.html shell, used by the inner pages); the footer video card is shorter (index + promotion)."""
import sys
ROW = r'''
/* one testimonials row: drifts on its own (rAF), never pauses on hover, and can be grabbed and dragged either way */
function ReviewRow({ items, dir = 1, dur = 62, hidden }) {
  const wrap = useRef(null), track = useRef(null);
  useEffect(() => {
    const w = wrap.current, el = track.current; if (!w || !el) return;
    let x = dir > 0 ? 0 : el.scrollWidth / 4, last = 0, raf = 0, half = 0, drag = null, on = true;
    const measure = () => { half = el.scrollWidth / 2; };
    measure();
    window.addEventListener('resize', measure);
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(w);
    const tick = (t) => {
      const dt = last ? Math.min(64, t - last) : 0; last = t;
      if (on && !drag && !REDUCED && half) x += dir * (half / (dur * 1000)) * dt;
      if (half) x = ((x % half) + half) % half;
      el.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const down = (e) => { if (e.button !== 0) return; drag = { x0: e.clientX, s: x, moved: false }; };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; w.classList.add('is-dragging'); }
      if (drag.moved) x = drag.s - dx;
    };
    const up = () => {
      if (!drag) return;
      if (drag.moved) { const stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; w.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => w.removeEventListener('click', stop, true), 60); }
      drag = null; w.classList.remove('is-dragging');
    };
    w.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', measure); w.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);
  return (
    <div ref={wrap} className="promo-rev-row overflow-hidden" onDragStart={(e) => e.preventDefault()}>
      <ul ref={track} role="list" aria-hidden={hidden} className="flex w-max gap-4 will-change-transform">
        {[...items, ...items].map((r, i) => <PromoReviewCard key={i} r={r} />)}
      </ul>
    </div>
  );
}
'''
def patch(s, f):
    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a); assert c == n, (f, a[:70], c); s = s.replace(a, b)
    if 'function PromoReviews()' in s:
        rep('''        {rows.map((row, k) => (
          <div key={k} className="overflow-hidden">
            <ul role="list" aria-hidden={k === 1} className={`promo-rev-track flex w-max gap-4 ${k ? 'is-rev' : ''}`}>
              {[...row, ...row].map((r, i) => <PromoReviewCard key={i} r={r} />)}
            </ul>
          </div>
        ))}''', '''        {rows.map((row, k) => <ReviewRow key={k} items={row} dir={k ? -1 : 1} dur={k ? 70 : 62} hidden={k === 1} />)}''')
        rep('\nfunction PromoReviews() {', ROW + '\nfunction PromoReviews() {')
        rep('''  .promo-rev-track{animation:promoLeft 75s linear infinite}
  .promo-rev-track.is-rev{animation:promoRight 85s linear infinite}
  .promo-rev-rows:hover .promo-rev-track{animation-play-state:paused}
  @media (prefers-reduced-motion: reduce){.promo-rev-track{animation:none}}''', '''  .promo-rev-row{cursor:grab;touch-action:pan-y;user-select:none}
  .promo-rev-row.is-dragging{cursor:grabbing}
  .promo-rev-row.is-dragging *{pointer-events:none}''')
    # footer video card: shorter (less room above the heading and before the link panel)
    rep('''        <div className="relative px-4 md:px-10 pt-[clamp(110px,11vw,160px)] pb-4 md:pb-10">''', '''        <div className="relative px-4 md:px-10 pt-[clamp(56px,6vw,96px)] pb-4 md:pb-8">''')
    rep('''          <div className="rv mt-[clamp(140px,15vw,240px)] rounded-[22px] p-6 md:p-10 text-white" style={{ ...glass, transitionDelay: '.05s' }}>''', '''          <div className="rv mt-[clamp(48px,6vw,96px)] rounded-[22px] p-6 md:p-10 text-white" style={{ ...glass, transitionDelay: '.05s' }}>''')
    return s
for f in sys.argv[1:]:
    s = open(f).read(); s = patch(s, f); open(f, 'w').write(s); print('patched', f)
