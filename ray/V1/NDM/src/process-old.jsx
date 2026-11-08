/* Process-old: the home page's original Process section (pinned on wide screens: step text on the left, photo stack on the right).
   Saved 2026-11-03 when the home page switched to the inner pages' three-column Process. The user will say where to use it later.
   To use: paste into a page (rename to ProcessOld if the page also has Process). Needs PROCESS / PROCESS_MEDIA data below. */
const PROCESS = [
  ['Free consultation', 'Meet our team at either Toronto clinic for a free consultation and VISIA® skin analysis.'],
  ['Your personal plan', 'Your provider recommends treatments for your goals and explains pricing before anything begins.'],
  ['Treatment and follow-up', 'Licensed medical professionals perform your treatment and check in on your progress afterwards.'],
];
/* process (Essentia "Your new skincare routine is beautifully simple"): the three steps on the left, a stack of
   three photos on the right. Pinned on wide screens; each scroll step sends the top photo up and away while the
   step text fades out and the next one fades in. Photo and text are both links; a CTA sits under the text. */
const PROCESS_MEDIA = [
  { img: 'assets/hero/clinic-reception.jpg', alt: 'Reception at NewDermaMed Toronto', h: '#/book', cta: 'Book Free Consultation', v: 'book' },
  { img: 'assets/hero/treatment-room.jpg', alt: 'A NewDermaMed consultation room with VISIA® skin analysis', h: '#treatments', cta: 'Explore treatments', v: 'ink' },
  { img: 'assets/clinic/clinic-2.jpg', alt: 'A treatment suite at NewDermaMed Toronto', h: '#visit', cta: 'Find a clinic', v: 'ink' },
];

function ProcessText({ i, on }) {
  const [t, d] = PROCESS[i], m = PROCESS_MEDIA[i];
  return (
    <a href={m.h} tabIndex={on ? 0 : -1} aria-hidden={!on} className="group block">
      <span className="block font-inter text-[13px] uppercase tracking-[.14em] text-ndm-deep">Step 0{i + 1} <span className="text-ndm-muted">/ 0{PROCESS.length}</span></span>
      <h3 className="mt-3 font-aeonik text-[clamp(30px,3vw,44px)] font-normal leading-[1.08] tracking-[-0.03em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{t}</h3>
      <p className="mt-3 max-w-[42ch] font-inter text-[16.5px] leading-[1.6] text-ndm-muted">{d}</p>
    </a>
  );
}

function ProcessPhoto({ i, on }) {
  const m = PROCESS_MEDIA[i];
  return (
    <a href={m.h} tabIndex={on ? 0 : -1} aria-label={PROCESS[i][0]} className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-ndm-mist shadow-[0_40px_80px_-40px_rgba(11,15,19,.55)]">
      <img src={m.img} alt={m.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" style={{ transitionTimingFunction: 'var(--e-out)' }} />
    </a>
  );
}

function Process() {
  const ref = useRef(null), track = useRef(null);
  useReveal(ref);
  const wide = useMedia('(min-width: 1024px) and (min-height: 680px)') && !REDUCED;
  const [act, setAct] = useState(0);
  useOnScroll(() => {
    if (!wide) return;
    const el = track.current; if (!el) return;
    const r = el.getBoundingClientRect(), vh = window.innerHeight, n = PROCESS.length;
    setAct(Math.min(n - 1, Math.floor(clamp01(-r.top / Math.max(1, r.height - vh)) * n)));
  }, [wide]);
  const head = (
    <>
      <Eyebrow className="rv">Process</Eyebrow>
      <TwoTone id="process" className="rv mt-5 max-w-[14ch]" lead="How your treatment" strong="journey works" style={{ transitionDelay: '.06s' }} />
    </>
  );

  if (!wide) {
    return (
      <section ref={ref} aria-labelledby="process" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(72px,9vw,120px)]">
        {head}
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-5" role="list">
          {PROCESS.map((_, i) => (
            <li key={i} className="rv" style={{ transitionDelay: `${0.08 * i}s` }}>
              <div className="aspect-[4/3]"><ProcessPhoto i={i} on /></div>
              <div className="mt-5"><ProcessText i={i} on /></div>
              <div className="mt-5"><Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v} sm>{PROCESS_MEDIA[i].cta}</Btn></div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const m = PROCESS_MEDIA[act];
  return (
    <section ref={ref} aria-labelledby="process" className="relative z-10 bg-ndm-paper">
      <div ref={track} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 grid h-screen grid-cols-2 items-center gap-12 overflow-hidden px-[var(--gx)] pt-[clamp(96px,12vh,120px)]">
          <div className="max-w-[560px]">
            {head}
            <div className="relative mt-10 min-h-[clamp(150px,19vh,190px)]">
              {PROCESS.map((_, i) => (
                <div key={i} className="absolute inset-x-0 top-0 transition-[opacity,transform] duration-700"
                  style={{ opacity: i === act ? 1 : 0, transform: `translate3d(0,${i === act ? 0 : i < act ? -18 : 18}px,0)`, transitionTimingFunction: 'var(--e-out)', pointerEvents: i === act ? 'auto' : 'none', transitionDelay: i === act ? '.18s' : '0s' }}>
                  <ProcessText i={i} on={i === act} />
                </div>
              ))}
            </div>
            <div key={act} className="space-in mt-6">
              <Btn href={m.h} v={m.v}>{m.cta}</Btn>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative" style={{ width: 'min(30vw, 460px, 52vh)', aspectRatio: '3 / 4' }}>
              {PROCESS.map((_, i) => {
                const d = i - act;
                const t = d < 0 ? 'translate3d(0,-125vh,0) rotate(-6deg)' : `translate3d(${d * 7}%, ${-d * 6}%, 0) scale(${(1 - d * 0.09).toFixed(2)})`;
                return (
                  <div key={i} aria-hidden={d !== 0} className="absolute inset-0"
                    style={{ transform: t, transformOrigin: '50% 0%', zIndex: 10 - d, filter: d > 0 ? `brightness(${1 - d * 0.14})` : 'none', transition: 'transform 1.1s var(--e-inout), filter .9s ease' }}>
                    <ProcessPhoto i={i} on={d === 0} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- what they are saying + trust */
