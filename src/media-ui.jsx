/* ---------------------------------------------------------------- media sections for treatment pages (round 12, from Ray's
   live-media-ui.jsx): the clinic on film (TxFilm, section id "film") and an Instagram reel in a phone frame (TxReel, id "watch").
   Each reads one key of the page object (film, reel). MEDIA_CSS is added to the page by the build. */
const MEDIA_CSS = `
.tx-film{isolation:isolate;background:#0B0F13}
/* the clips carry a caption in their bottom fifth: the frame is taller than the band and top-aligned, so only its upper part shows */
.tx-film video{position:absolute;left:0;top:-4%;height:142%;width:100%;object-fit:cover;object-position:50% 0;will-change:transform}
.tx-film-shade{background:linear-gradient(90deg,rgba(11,15,19,.82) 0%,rgba(11,15,19,.5) 48%,rgba(11,15,19,.25) 100%),linear-gradient(180deg,rgba(11,15,19,.35),rgba(11,15,19,0) 35%,rgba(11,15,19,.55) 100%)}
.tx-film-chip{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.tx-film-ring{position:absolute;right:clamp(16px,4vw,64px);bottom:clamp(16px,4vw,48px);width:clamp(96px,10vw,140px);aspect-ratio:1;animation:txSpin 22s linear infinite}
@keyframes txSpin{to{transform:rotate(360deg)}}
.tx-phone{width:min(280px,72vw);aspect-ratio:9/19;border-radius:44px;background:#0B0F13;padding:10px;box-shadow:0 50px 90px -40px rgba(11,15,19,.7),inset 0 0 0 2px rgba(255,255,255,.08)}
.tx-phone-screen{position:relative;height:100%;width:100%;overflow:hidden;border-radius:34px;background:#1B242B}
.tx-phone-screen video,.tx-phone-screen img{position:absolute;inset:0;height:100%;width:100%;object-fit:cover}
.tx-phone-notch{position:absolute;left:50%;top:10px;z-index:2;width:38%;height:22px;transform:translateX(-50%);border-radius:999px;background:#0B0F13}
.tx-phone-glow{position:absolute;inset:-14%;z-index:-1;background:radial-gradient(45% 45% at 50% 50%,rgba(38,177,231,.45),transparent 70%),radial-gradient(35% 35% at 30% 80%,rgba(255,166,23,.32),transparent 70%);filter:blur(10px)}
.tx-case{transition:transform .6s var(--e-out),box-shadow .6s var(--e-out)}
.tx-case:hover{transform:translateY(-6px);box-shadow:0 34px 60px -30px rgba(38,177,231,.45)}
.tx-case img{transition:transform 1.2s var(--e-out)}
.tx-case:hover img{transform:scale(1.04)}
.tx-why-dark{background:radial-gradient(70% 60% at 100% 0%,rgba(15,128,195,.35),transparent 60%),radial-gradient(50% 50% at 0% 100%,rgba(255,166,23,.14),transparent 60%),linear-gradient(160deg,#141B21,#0B0F13)}
.tx-visit-pic{transition:transform 1.1s var(--e-out)}
.tx-visit:hover .tx-visit-pic{transform:scale(1.05)}
.tx-pill{background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 18px 40px -20px rgba(27,36,43,.55)}
@media (prefers-reduced-motion:reduce){.tx-film-ring{animation:none}.tx-case,.tx-case img,.tx-visit-pic{transition:none}}
`;

/* plays a muted clip only while it is on screen; nothing is downloaded before that (preload none, a poster frame shows first) */
function useClipInView(ref, vid) {
  useEffect(() => {
    const el = ref.current, v = vid.current; if (!el || !v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !REDUCED) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
}

/* the clinic on film: the home page's own clinic footage, slowly drifting behind the page's name, with the two addresses */
function TxFilm({ p }) {
  const ref = useRef(null), vid = useRef(null), box = useRef(null);
  useReveal(ref);
  useClipInView(ref, vid);
  useOnScroll(() => {
    const el = ref.current, v = vid.current; if (!el || !v || REDUCED) return;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    const k = clamp01((vh - r.top) / (vh + r.height));
    v.style.transform = `translate3d(0,${((k - 0.5) * 60).toFixed(1)}px,0)`;
  }, []);
  const f = p.film;
  return (
    <section ref={ref} id="film" data-nav="dark" aria-labelledby="film-title" className="tx-film relative z-10 scroll-mt-[120px] overflow-hidden px-[var(--gx)] py-[clamp(72px,9vw,140px)] text-white">
      <video ref={vid} muted loop playsInline preload="none" poster={f.poster} aria-hidden="true" tabIndex={-1}>
        <source src={f.src_m} type="video/mp4" media="(max-width: 767px)" />
        <source src={f.src} type="video/mp4" />
      </video>
      <span aria-hidden="true" className="tx-film-shade absolute inset-0" />
      <svg aria-hidden="true" className="tx-film-ring hidden text-white/80 md:block" viewBox="0 0 100 100">
        <defs><path id="tx-film-ring-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
        <text fontSize="9.2" fontFamily="Inter, sans-serif" letterSpacing="2.2" fill="currentColor"><textPath href="#tx-film-ring-path">UPTOWN · DOWNTOWN · TORONTO · NEWDERMAMED · </textPath></text>
        <circle cx="50" cy="50" r="6" fill="#FFA617" />
      </svg>
      <div className={`${TX_WRAP} relative`}>
        <Eyebrow dark className="rv">{txNum(p, 'film') && <span className="tabular-nums text-ndm-sky">{txNum(p, 'film')}</span>}Inside the clinic</Eyebrow>
        <TwoTone id="film-title" dark className="rv mt-5 max-w-[14ch]" size="text-[clamp(34px,4.4vw,64px)]" lead={twoLine(f.lead)} strong={f.strong} style={{ transitionDelay: '.06s' }} />
        <p className="rv mt-5 max-w-[50ch] font-inter text-[clamp(15.5px,1.15vw,17px)] leading-[1.6] text-white/80" style={{ transitionDelay: '.1s' }}>{f.text}</p>
        <ul className="rv mt-8 flex flex-wrap gap-2" role="list" style={{ transitionDelay: '.14s' }}>
          {f.chips.map((c) => <li key={c} className="tx-film-chip rounded-full px-4 py-2 font-inter text-[13.5px] text-white/90">{c}</li>)}
        </ul>
        <div className="rv mt-8 flex flex-wrap items-center gap-3" style={{ transitionDelay: '.18s' }}>
          <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
          <Btn href="about.html#contact" v="glass">Find a clinic</Btn>
        </div>
      </div>
    </section>
  );
}

/* a short reel from the clinic's Instagram in a phone frame, beside the page's own facts */
function TxReel({ p }) {
  const ref = useRef(null), vid = useRef(null);
  useReveal(ref);
  useClipInView(ref, vid);
  const r = p.reel;
  const n = txNum(p, 'watch');
  return (
    <section ref={ref} id="watch" aria-labelledby="watch-title" className="relative z-10 scroll-mt-[170px] overflow-hidden bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(40px,6vw,96px)]`}>
        <div>
          <Eyebrow className="rv">{n && <span className="tabular-nums text-ndm-deep">{n}</span>}Watch</Eyebrow>
          <TwoTone id="watch-title" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={twoLine(r.lead)} strong={r.strong} style={{ transitionDelay: '.06s' }} />
          <p className="rv mt-4 max-w-[48ch] font-inter text-[16px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: '.1s' }}>{r.text}</p>
          <dl className="rv mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3" style={{ transitionDelay: '.14s' }}>
            {p.facts.slice(0, 3).map(([k, v]) => (
              <div key={k} className="rounded-[18px] bg-white p-4 ring-1 ring-ndm-ink/[.06]">
                <dt className="font-inter text-[12px] text-ndm-muted">{k}</dt>
                <dd className="mt-1 font-inter text-[15px] font-semibold leading-[1.3] text-ndm-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rv mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ transitionDelay: '.18s' }}>
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep"><IconInstagram size={18} />@newdermamed<IconArrow className="transition-transform group-hover:translate-x-1" /><span className="sr-only"> (opens in a new tab)</span></a>
          </div>
        </div>
        <div className="rv relative mx-auto lg:mx-0 lg:justify-self-center" style={{ transitionDelay: '.12s' }}>
          <span aria-hidden="true" className="tx-phone-glow" />
          <div className="tx-phone relative">
            <span aria-hidden="true" className="tx-phone-notch" />
            <div className="tx-phone-screen">
              <video ref={vid} muted loop playsInline preload="none" poster={r.poster} aria-label={`${r.tag} reel from the NewDermaMed Instagram`}>
                <source src={r.src} type="video/mp4" />
              </video>
            </div>
          </div>
          <span className="tx-pill absolute -left-3 top-[18%] hidden items-center gap-2 rounded-full py-2 pl-2 pr-4 font-inter text-[13px] font-semibold text-ndm-ink md:flex"><i aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-ndm-amber text-white"><IconArrow size={11} /></i>{r.tag}</span>
          <span className="tx-pill absolute -right-2 bottom-[14%] hidden rounded-full px-4 py-2 font-inter text-[13px] text-ndm-ink md:block">Uptown &amp; Downtown Toronto</span>
        </div>
      </div>
    </section>
  );
}

