# round 9: testimonials row moves faster, loops without a jump (three copies, gap included in the period),
# and follows a trackpad's sideways swipe (wheel deltaX) as well as mouse and touch drags
import sys
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    a = s.index('/* one testimonials row: drifts on its own')
    b = s.index('\nfunction Saying()', a) if p.endswith('index.html') else s.index('\n}\n', s.index('function ReviewRow', a)) + 3
    if not p.endswith('index.html'):
        b = s.index('\n}\n', s.index('function ReviewRow', a)) + 3
    else:
        b = s.index('\n}\n', s.index('function ReviewRow', a)) + 3
    new = r'''/* one testimonials row: drifts on its own (rAF) and loops for ever; it can be dragged with a mouse or finger
   and pushed sideways with a trackpad swipe, then carries on drifting */
const REV_COPIES = 3;
function ReviewRow({ items, dir = 1, dur = 22, hidden }) {
  const wrap = useRef(null), track = useRef(null);
  useEffect(() => {
    const w = wrap.current, el = track.current; if (!w || !el) return;
    let x = 0, last = 0, raf = 0, period = 0, drag = null, on = true, idle = 0;
    const measure = () => { period = el.scrollWidth / REV_COPIES; };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(w);
    const tick = (t) => {
      const dt = last ? Math.min(64, t - last) : 0; last = t;
      if (on && !drag && !REDUCED && period && t > idle) x += dir * (period / (dur * 1000)) * dt;
      if (period) x = ((x % period) + period) % period;
      el.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    /* trackpad: a mostly sideways swipe moves the row; vertical scrolling still scrolls the page */
    const wheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); e.stopPropagation(); /* keep the smooth-scroll library from also acting on it */
      x += e.deltaX; idle = performance.now() + 900;
    };
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
      drag = null; idle = performance.now() + 600; w.classList.remove('is-dragging');
    };
    w.addEventListener('wheel', wheel, { passive: false });
    w.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); w.removeEventListener('wheel', wheel); w.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);
  const all = Array.from({ length: REV_COPIES }, () => items).flat();
  return (
    <div ref={wrap} className="promo-rev-row overflow-hidden" onDragStart={(e) => e.preventDefault()}>
      {/* the right padding equals the gap, so one copy plus its gap is exactly a third of the track and the loop has no jump */}
      <ul ref={track} role="list" aria-hidden={hidden} className="flex w-max items-stretch gap-4 pr-4 will-change-transform">
        {all.map((r, i) => <PromoReviewCard key={i} r={r} />)}
      </ul>
    </div>
  );
}
'''
    s = s[:a] + new + s[b:]
    n = s.count('dur={34} hidden={k === 1}')
    assert n == 1, (p, n)
    s = s.replace('dur={34} hidden={k === 1}', 'dur={22} hidden={k === 1}')
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
