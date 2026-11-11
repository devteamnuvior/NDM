"""Round 29, monthly specials (both shells):
- "alpha" entrance: as the wheel comes into view its cards travel along the wheel's own circle from the left into place
  (a rAF value `spin` from 5 slots to 0 feeds arcAt, so the motion follows the arc). Revert = restore the old ox/oy/or sweep.
- SPECIALS take their price, unit and deal label from the price list (priceInfo / priceFrom), so they match the pricing page.
- Promotions takes a heading level (h1 on the promotion page, h2 elsewhere, with the Monthly specials tag); View all offers
  opens promotion.html#offers when the page has no offers grid.
- home: the promotion page's wheel (red deal badges, Ray's ten offers) replaces the home page's older copy.
usage: python3 src/patches-applied/r29_specials.py <NDM dir>
"""
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
P = root / 'promotion.html'; I = root / 'index.html'
p = P.read_text(encoding='utf-8'); ix = I.read_text(encoding='utf-8')


def rep(s, a, b, n=1, tag=''):
    c = s.count(a)
    assert c == n, (tag, a[:80], c)
    return s.replace(a, b)


# ---- promotion's Promotions: heading level, alpha entrance, offers link
p = rep(p, "function Promotions() {\n  const ref = useRef(null), stage = useRef(null);", "function Promotions({ level = 'h1' }) {\n  const ref = useRef(null), stage = useRef(null);\n  const H = level;", tag='sig')
p = rep(p, """  useEffect(() => { if (!entered || settled) return; const t = setTimeout(() => setSettled(true), 2300); return () => clearTimeout(t); }, [entered]);""",
        """  useEffect(() => { if (!entered || settled) return; const t = setTimeout(() => setSettled(true), 2300); return () => clearTimeout(t); }, [entered]);
  /* alpha (round 29): the cards travel along the wheel's circle from the left into place as the stage comes into view */
  const [spin, setSpin] = useState(REDUCED ? 0 : 5);
  useEffect(() => {
    if (!entered || REDUCED) return;
    let raf, t0;
    const step = (t) => { if (!t0) t0 = t; const q = Math.min(1, (t - t0) / 1900); setSpin(5 * Math.pow(1 - q, 3)); if (q < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [entered]);""", tag='spin')
p = rep(p, """            const [x, y, r] = arcAt(d);
            const on = d === 0, far = Math.abs(d) > 3;""", """            const [x, y, r] = arcAt(d - spin);
            const on = d === 0, far = Math.abs(d - spin) > 3.6;""", tag='arc')
p = rep(p, """            const ox = entered ? 0 : side * (window.innerWidth * 0.75 + 200), oy = entered ? 0 : 260, or = entered ? 0 : side * 32;""",
        """            const ox = 0, oy = 0, or = 0; /* the old sweep from both sides is replaced by the alpha spin */""", tag='ox')
p = rep(p, """                  ...(!settled ? { transition: `transform 1.5s var(--e-out) ${(0.1 + (3 - Math.min(3, Math.abs(d))) * 0.14).toFixed(2)}s` } : {}),""",
        """                  ...(spin > 0.001 ? { transition: 'opacity .35s ease' } : {}),""", tag='trans')
p = rep(p, """        <h1 id="specials" className="rv sw-title mx-auto whitespace-nowrap px-4 text-center font-aeonik font-normal text-[clamp(23px,4.2vw,60px)] leading-[1.06] tracking-[-0.035em]">
          <span className={dark ? 'text-white' : 'text-ndm-ink'}>Exclusive monthly</span> <span className={`tt-strong ${dark ? 'text-ndm-sky' : 'text-ndm-deep'}`}>specials</span>
        </h1>""", """        {H !== 'h1' && <div className="rv mb-4 text-center"><Eyebrow>Monthly specials</Eyebrow></div>}
        <H id="specials" className="rv sw-title mx-auto whitespace-nowrap px-4 text-center font-aeonik font-normal text-[clamp(23px,4.2vw,60px)] leading-[1.06] tracking-[-0.035em]">
          <span className={dark ? 'text-white' : 'text-ndm-ink'}>Exclusive monthly</span> <span className={`tt-strong ${dark ? 'text-ndm-sky' : 'text-ndm-deep'}`}>specials</span>
        </H>""", tag='h1')
p = rep(p, """<Btn href="#offers" v={dark ? 'light' : 'ink'} onClick={(e) => { const el = document.getElementById('offers'); if (!el) return;""",
        """<Btn href={document.getElementById('offers') ? '#offers' : 'promotion.html#offers'} v={dark ? 'light' : 'ink'} onClick={(e) => { const el = document.getElementById('offers'); if (!el) return;""", tag='offers')

# ---- SPECIALS read the price list
POST = """
/* round 29: each special shows the price list's lowest price after the discount, its unit and its offer (priceInfo / priceFrom) */
SPECIALS.forEach((s) => {
  const m = /#pg-([a-z0-9-]+)-h/.exec(s.h || '');
  const info = priceInfo(s.n) || (m && priceFrom(m[1]) ? { id: m[1], ...priceFrom(m[1]) } : null);
  if (!info || !info.value) return;
  s.p = info.value % 1 ? info.value.toFixed(2) : String(info.value);
  if (info.per) s.u = info.per;
  if (info.offer) s.deal = info.offer;
  if (!m) s.h = `pricing.html#pg-${info.id}-h`;
});
"""
i = p.index('const SPECIALS = ['); j = p.index('\n];\n', i) + 4
specials = p[i:j]
p = p[:j] + POST + p[j:]

# ---- home: the promotion wheel and its offers
i = ix.index('const SPECIALS = ['); j = ix.index('\n];\n', i) + 4
ix = ix[:i] + specials + POST + ix[j:]
a = ix.index('\nfunction Promotions() {'); b = ix.index('\n}\n', a) + 3
pa = p.index('\nfunction Promotions({'); pb = p.index('\n}\n', pa) + 3
ix = ix[:a] + p[pa:pb].replace("function Promotions({ level = 'h1' })", "function Promotions({ level = 'h2' })") + ix[b:]
if '.deal-badge{' not in ix:
    m = re.search(r"  \.deal-badge\{.*?\n(  \.soc-ico\.soc-ico-line)", p, re.S)
    css = p[m.start():m.start(1)]
    anchor = '  /* campaign looks: tokens per look'
    ix = rep(ix, anchor, css + anchor, tag='css')

P.write_text(p, encoding='utf-8'); I.write_text(ix, encoding='utf-8')
print('patched promotion.html, index.html')
