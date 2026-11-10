"""Round 22: the home page's Inside our clinics section shows the one clinic video (assets/clinic/ndm-clinic.mp4)
instead of the photo slider. The frame still opens to both sides as it scrolls into view. Applied to index.html.
usage: python3 src/patches-applied/r22_clinic_video.py <NDM dir>
"""
import sys
from pathlib import Path

f = Path(sys.argv[1]) / 'index.html'
s = f.read_text(encoding='utf-8')


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


a = s.index('/* ---------------------------------------------------------------- inside our clinics (website v3 clinic frame)')
b = s.index('/* ---------------------------------------------------------------- journal (Dermato "Helpful tips" layout)')
s = s[:a] + r'''/* ---------------------------------------------------------------- inside our clinics (round 22): the clinic video in a large frame
   that opens out to both sides as it scrolls into view. The one clinic video (CLINIC_FILM) is also the Botox page's clinic film.
   It is fetched only when the section is two screens away, plays muted while on screen, and the sound button turns the voice on. */
const CLINIC_FILM = { src: 'assets/clinic/ndm-clinic.mp4', poster: 'assets/clinic/ndm-clinic-poster.jpg' };
function IconSound({ on, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      {on ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <><path d="m16 9 5 6" /><path d="m21 9-5 6" /></>}
    </svg>
  );
}
function Space() {
  const ref = useRef(null), frame = useRef(null), vid = useRef(null);
  useReveal(ref);
  const [seen, setSeen] = useState(false);
  const [near, setNear] = useState(false);
  const [sound, setSound] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 });
    /* start fetching the video about two screens before the section arrives */
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); pre.disconnect(); } }, { rootMargin: '200% 0px' });
    io.observe(frame.current); pre.observe(frame.current);
    return () => { io.disconnect(); pre.disconnect(); };
  }, []);
  useEffect(() => {
    const v = vid.current; if (!v || !near) return;
    if (seen && !REDUCED) { const q = v.play(); if (q && q.catch) q.catch(() => {}); } else v.pause();
  }, [seen, near]);
  useEffect(() => { const v = vid.current; if (v) v.muted = !sound; }, [sound]);
  /* the frame starts inset on both sides and opens to the full width as it comes into view */
  useOnScroll(() => {
    const el = frame.current; if (!el || REDUCED) return;
    const h = window.innerHeight, r = el.getBoundingClientRect();
    el.style.setProperty('--p', clamp01((h - r.top) / (h * 0.85)).toFixed(3));
  }, []);
  return (
    <section ref={ref} aria-labelledby="space" className="relative z-10 bg-ndm-paper py-[clamp(24px,3vw,44px)]">
      <div ref={frame} data-nav="dark" className="cl-frame" role="region" aria-label="Inside our clinics, film">
        <video ref={vid} className="cl-vid" muted loop playsInline preload="none" poster={CLINIC_FILM.poster} src={near ? CLINIC_FILM.src : undefined} aria-label="A walk through the NewDermaMed clinic" />
        <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-wrap items-end justify-between gap-6 px-[var(--gx)] pb-[clamp(28px,4.5vw,60px)]">
          <div>
            <Eyebrow dark className="rv">Inside our clinics</Eyebrow>
            <TwoTone dark id="space" className="rv mt-4" size="text-[clamp(34px,4.2vw,62px)]" lead={<>Step inside<br /></>} strong="NewDermaMed" style={{ transitionDelay: '.05s' }} />
            <p className="rv mt-4 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-inter text-[14px] text-white backdrop-blur-[12px]" style={{ transitionDelay: '.1s' }}>
              <b className="font-semibold">Uptown, Yonge &amp; Sheppard</b><span aria-hidden="true" className="text-white/50">·</span><b className="font-semibold">Downtown, Bay &amp; College</b>
            </p>
          </div>
          <button type="button" onClick={() => setSound((x) => !x)} aria-pressed={sound} aria-label={sound ? 'Turn the sound off' : 'Turn the sound on'}
            className="cl-sound grid size-12 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-[12px] transition-colors hover:bg-white/20">
            <IconSound on={sound} />
          </button>
        </div>
      </div>
    </section>
  );
}

''' + s[b:]

rep('''  /* inside our clinics: the frame opens to both sides as it comes into view; photos cross-fade */''',
    '''  /* inside our clinics: the frame opens to both sides as it comes into view; the clinic video fills it */
  .cl-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(calc(1.1 - .1 * var(--p)))}''')
rep('''@media (prefers-reduced-motion:reduce){.cl-frame{--p:1!important}.cl-slide{transition:none}}''',
    '''@media (prefers-reduced-motion:reduce){.cl-frame{--p:1!important}.cl-slide{transition:none}.cl-vid{transform:none}}''')
f.write_text(s, encoding='utf-8')
print('patched', f)
