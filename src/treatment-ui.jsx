/* ---------------------------------------------------------------- treatment page sections, shared by the Aptos and Botox pages.
   Every section uses the same centred width (TX_WRAP) and a centred heading (TxHead), like the Pricing page's price list.
   Each takes the page data object (p) and reads only its own key, so a page can leave a section out. */
const TX_WRAP = 'mx-auto w-full max-w-[1180px]';
const IconX2 = (p) => <Svg size={14} vb="0 0 14 14" {...p}><path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Svg>;
const TX_ICONS = {
  type: <><path d="m17.5 3.5 3 3M15.5 5.5l3 3M18 7l-9.5 9.5-3-3L15 4" /><path d="m5.5 13.5-2 2 2.5 2.5 2-2M3.5 20.5l2-2" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  leaf: <><path d="M5 19c0-8 5-13.5 14-14-.5 9-6 14-14 14Z" /><path d="M5 19 13 11" /></>,
  cal: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
};
const txIcon = (label) => (/type/i.test(label) ? 'type' : /duration|session/i.test(label) ? 'clock' : /recovery|downtime/i.test(label) ? 'leaf' : 'cal');
/* section number from the page's nav list ("01"), or nothing on pages without one */
const txNum = (p, id) => { const i = (p.nav || []).findIndex(([k]) => k === id); return i < 0 ? '' : String(i + 1).padStart(2, '0'); };

function TxHead({ p, id, tag, hid, lead, strong, text, dark }) {
  const n = txNum(p, id);
  return (
    <div className="mx-auto max-w-[760px] text-center">
      <Eyebrow dark={dark} className="rv">{n && <span className="tabular-nums text-ndm-deep">{n}</span>}{tag}</Eyebrow>
      <TwoTone id={hid} dark={dark} className="rv mx-auto mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={twoLine(lead)} strong={strong} style={{ transitionDelay: '.06s' }} />
      {text && <p className={`rv mx-auto mt-4 max-w-[58ch] font-inter text-[15.5px] leading-[1.65] ${dark ? 'text-white/75' : 'text-ndm-muted'}`} style={{ transitionDelay: '.1s' }}>{text}</p>}
    </div>
  );
}

/* treatment at a glance: a white strip pulled up over the bottom of the header photo, an icon per fact and both phone numbers */
function TxGlance({ p }) {
  return (
    <section aria-labelledby="glance-title" className="relative z-20 -mt-[clamp(20px,3vw,44px)] px-[var(--gx)]">
      <h2 id="glance-title" className="sr-only">Treatment at a glance</h2>
      <div className={`${TX_WRAP} grid gap-4 rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-36px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/[.06] sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-7`}>
        <dl className={`grid grid-cols-2 gap-x-3 gap-y-4 ${p.facts.length > 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {p.facts.map(([k, v], i) => (
            <div key={k} className={`flex items-center gap-3 ${i ? 'md:border-l md:border-ndm-ink/10 md:pl-5' : ''}`}>
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-ndm-sky to-ndm-deep text-white shadow-[0_10px_20px_-12px_rgba(15,128,195,.9)]">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{TX_ICONS[txIcon(k)]}</svg>
              </span>
              <div className="min-w-0">
                <dt className="font-inter text-[12px] leading-[1.3] text-ndm-muted">{k}</dt>
                <dd className="font-inter text-[15px] font-semibold leading-[1.3] text-ndm-ink sm:text-[16px]">{v}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-2 lg:w-[230px] lg:grid-cols-1">
          {CALLS.map(([n, num]) => (
            <a key={n} href={tel(num)} aria-label={`Call the ${n} clinic at ${num}`} className="btn btn-buy h-11 gap-2 px-3 text-[13.5px]">
              <IconPhone className="shrink-0" /><span className="truncate"><span className="lg:hidden">{n}</span><span className="hidden lg:inline">{num} {n}</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* sticky row of section links (the reference's numbered side list, as a modern pill bar); highlights the section in view */
function TxNav({ p }) {
  const [on, setOn] = useState(p.nav[0][0]);
  const bar = useRef(null);
  useEffect(() => {
    const els = p.nav.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setOn(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const b = bar.current && bar.current.querySelector(`[data-k="${on}"]`);
    const r = bar.current && bar.current.querySelector('.tx-nav-scroll');
    if (b && r) r.scrollTo({ left: b.offsetLeft - r.clientWidth / 2 + b.offsetWidth / 2, behavior: REDUCED ? 'auto' : 'smooth' });
  }, [on]);
  const go = (e, id) => { const el = document.getElementById(id); if (!el) return; e.preventDefault(); scrollToY(el.getBoundingClientRect().top + window.scrollY - 160); };
  return (
    <nav ref={bar} aria-label="On this page" className="tx-nav sticky top-[100px] z-30 mt-8 border-y border-ndm-ink/[.07] bg-ndm-paper/85 backdrop-blur-[10px] xl:top-[120px]">
      <div className="tx-nav-scroll no-scrollbar relative overflow-x-auto px-[var(--gx)] py-2.5">
      <ul className="relative mx-auto flex w-max gap-1" role="list">
        {p.nav.map(([id, label], i) => (
          <li key={id} data-k={id} className="shrink-0">
            <a href={`#${id}`} onClick={(e) => go(e, id)} aria-current={on === id ? 'true' : undefined}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 font-inter text-[13px] transition-colors ${on === id ? 'bg-ndm-ink text-white' : 'text-ndm-ink/75 hover:bg-white hover:text-ndm-ink'}`}>
              <span className={`tabular-nums text-[11.5px] ${on === id ? 'text-ndm-sky' : 'text-ndm-muted'}`}>{String(i + 1).padStart(2, '0')}</span>{label}
            </a>
          </li>
        ))}
      </ul>
      </div>
    </nav>
  );
}

/* what it is: photo (with NUVIOR's turning NAMICA ring on the Aptos page) beside the copy and the treatment's main points */
function TxIntro({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.intro;
  return (
    <section ref={ref} id="what" aria-labelledby="intro-title" className="relative z-10 scroll-mt-[170px] px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="what" tag={t.tag} hid="intro-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(36px,4vw,56px)] grid items-center gap-8 lg:grid-cols-2 lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="rv relative" style={{ transitionDelay: '.1s' }}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] bg-ndm-mist lg:aspect-[4/5]">
            <img src={t.img} alt={t.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.pos || '50% 40%' }} />
          </div>
          {t.ring && (
            <div aria-hidden="true" className="tx-ring absolute -right-3 -top-6 size-[clamp(120px,12vw,160px)] sm:-right-6">
              <svg viewBox="0 0 160 160" className="tx-ring-text absolute inset-0 size-full">
                <defs><path id="tx-ring-path" d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" /></defs>
                <circle cx="80" cy="80" r="78" fill="rgba(255,255,255,.92)" />
                <text fontFamily="Inter, sans-serif" fontSize="10.5" fontWeight="600" letterSpacing="2.4" fill="#352862"><textPath href="#tx-ring-path">{t.ring}</textPath></text>
              </svg>
              <img src={NAMICA_SPHERE} alt="" className="nm-spin absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>
        <div>
          {t.text.map((x, i) => <p key={i} className="rv mt-0 max-w-[56ch] font-inter text-[16px] leading-[1.7] text-ndm-ink/80 [&+p]:mt-4" style={{ transitionDelay: `${0.1 + i * 0.04}s` }}>{x}</p>)}
          <ul className="mt-6 grid gap-2" role="list">
            {t.points.map(([h, d], i) => (
              <li key={h} className="rv flex items-start gap-3 rounded-[16px] bg-white px-4 py-3.5 ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.14 + i * 0.05}s` }}>
                <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconTick size={13} /></span>
                <span><span className="block font-inter text-[15px] font-semibold text-ndm-ink">{h}</span><span className="mt-0.5 block font-inter text-[14px] leading-[1.5] text-ndm-muted">{d}</span></span>
              </li>
            ))}
          </ul>
          {t.chips && <ul className="rv mt-5 flex flex-wrap gap-2" role="list">{t.chips.map((c) => <li key={c} className="rounded-full bg-white px-3.5 py-1.5 font-inter text-[13.5px] text-ndm-ink ring-1 ring-ndm-ink/10">{c}</li>)}</ul>}
          {t.note && <p className="rv mt-5 flex items-center gap-2 font-inter text-[13.5px] text-ndm-muted"><IconCheckBadge className="shrink-0 text-ndm-deep" />{t.note}</p>}
        </div>
      </div>
    </section>
  );
}

/* how it works: four steps joined by a line */
function TxSteps({ p }) {
  const ref = useRef(null), list = useRef(null);
  useReveal(ref);
  const on = useInView(list, { threshold: 0.3 });
  const t = p.steps;
  return (
    <section ref={ref} id="how" aria-labelledby="steps-title" className="relative z-10 scroll-mt-[170px] bg-white px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="how" tag={t.tag} hid="steps-title" lead={t.lead} strong={t.strong} text={t.text} />
      <ol ref={list} className={`tx-steps ${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${on ? 'in' : ''}`} role="list">
        {t.items.map(([h, d], i) => (
          <li key={h} className="tx-step relative rounded-[22px] bg-ndm-paper p-5 ring-1 ring-ndm-ink/[.06] md:p-6" style={{ '--d': `${(i * 0.12).toFixed(2)}s` }}>
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-ndm-deep font-inter text-[13px] font-semibold text-white">{i + 1}</span>
              <span aria-hidden="true" className="tx-line h-px flex-1 bg-ndm-ink/10"><i className="block h-px origin-left bg-ndm-deep" /></span>
            </span>
            <h3 className="mt-5 font-aeonik text-[21px] font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</h3>
            <p className="mt-2 font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const txList = (items, tone = 'blue') => (
  <ul className="mt-3 grid gap-2.5" role="list">
    {items.map((x) => <li key={x} className="flex items-start gap-2.5 font-inter text-[14.5px] leading-[1.5] text-ndm-ink/85"><span aria-hidden="true" className={`mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-full ${tone === 'blue' ? 'bg-ndm-blue/10 text-ndm-deep' : 'bg-ndm-ink/[.07] text-ndm-muted'}`}>{tone === 'blue' ? <IconTick size={10} /> : <IconX2 size={9} />}</span>{x}</li>)}
  </ul>
);

/* is it safe: the honest answer and safeguards, with the licensed product on a soft card (Aptos) */
function TxSafety({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.safety;
  return (
    <section ref={ref} id="safety" aria-labelledby="safety-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="safety" tag={t.tag || 'Is it safe'} hid="safety-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8">
          {t.text.map((x, i) => <p key={i} className="font-inter text-[15.5px] leading-[1.7] text-ndm-ink/80 [&+p]:mt-4">{x}</p>)}
          <p className="mt-6 font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">Our safeguards</p>
          {txList(t.safeguards)}
        </div>
        {t.product ? (
          <figure className="rv tx-product relative m-0 flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[24px] p-6 text-white md:p-8" style={{ transitionDelay: '.08s' }}>
            <img src={t.product.img} alt={t.product.alt} loading="lazy" className="tx-product-img absolute left-1/2 top-[12%] w-[82%] max-w-[420px] -translate-x-1/2" />
            <img src={NAMICA_SPHERE} alt="" aria-hidden="true" className="namica-sphere pointer-events-none absolute -bottom-8 -right-8 w-[150px] opacity-90" />
            <figcaption className="relative">
              <span className="block font-inter text-[12px] uppercase tracking-[.14em] text-[#C9C2F4]">{t.product.tag}</span>
              <span className="mt-1.5 block font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.15]">{t.product.name}</span>
              <span className="mt-1 block max-w-[36ch] font-inter text-[13.5px] leading-[1.5] text-white/75">{t.product.note}</span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

/* how long it lasts and how many sessions: two cards side by side; the Aptos one carries NUVIOR's HA release motion */
function TxLasting({ p }) {
  const ref = useRef(null), box = useRef(null);
  useReveal(ref);
  const run = useInView(box, { threshold: 0.35 });
  const d = p.duration, s = p.sessions;
  return (
    <section ref={ref} aria-labelledby="duration-title" className="relative z-10 bg-white px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <div ref={box} className={`${TX_WRAP} grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]`}>
        <article id="duration" className="rv tx-lasts relative scroll-mt-[170px] overflow-hidden rounded-[26px] p-6 text-white md:p-9">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-inter text-[13px] font-medium"><span className="tabular-nums text-[#C9C2F4]">{txNum(p, 'duration')}</span>How long it lasts</p>
          <h2 id="duration-title" className="mt-5 font-aeonik text-[clamp(30px,3vw,44px)] font-normal leading-[1.08] tracking-[-0.03em]">{d.lead}<br /><span className="tt-strong text-[#C9C2F4]">{d.strong}</span></h2>
          <p className="mt-4 max-w-[52ch] font-inter text-[15px] leading-[1.6] text-white/80">{d.text}</p>
          {/* HA release along the thread (NUVIOR Aptos family motion): capsules drift and open over the months */}
          <div aria-hidden="true" className={`tx-thread relative mt-8 h-[120px] ${run ? 'in' : ''}`}>
            <span className="tx-thread-line absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" />
            {Array.from({ length: 18 }, (_, i) => (
              <i key={i} className="tx-bub absolute rounded-full" style={{ left: `${(i * 5.6 + 2).toFixed(1)}%`, top: `${[28, 62, 40, 70, 22, 55, 35, 66, 30, 48, 72, 26, 58, 38, 64, 44, 30, 56][i]}%`, width: `${[10, 6, 14, 8, 12, 5, 9, 13, 6, 11, 7, 10, 5, 12, 8, 6, 9, 7][i]}px`, '--d': `${(i * 0.14).toFixed(2)}s` }} />
            ))}
          </div>
          <div aria-hidden="true" className="mt-2 flex justify-between font-inter text-[11.5px] uppercase tracking-[.12em] text-white/60"><span>Day 0</span><span>Months 1 to 3</span><span>Up to 6 months</span></div>
          <div className="mt-7 flex flex-wrap items-end gap-x-8 gap-y-3 border-t border-white/15 pt-6">
            <p><span className="block font-aeonik text-[clamp(44px,4.4vw,64px)] leading-none tracking-[-0.04em]">{d.stat}<span className="ml-2 font-inter text-[15px] tracking-normal text-white/70">{d.unit}</span></span><span className="mt-2 block font-inter text-[13px] text-white/70">{d.label}</span></p>
            <p className="max-w-[34ch] font-inter text-[13px] leading-[1.5] text-white/60">{d.note}</p>
          </div>
        </article>
        <article id="sessions" className="rv flex scroll-mt-[170px] flex-col rounded-[26px] bg-ndm-paper p-6 ring-1 ring-ndm-ink/[.06] md:p-9" style={{ transitionDelay: '.08s' }}>
          <Eyebrow><span className="tabular-nums text-ndm-deep">{txNum(p, 'sessions')}</span>How many you need</Eyebrow>
          <p className="mt-6 font-aeonik text-[clamp(64px,6vw,96px)] leading-none tracking-[-0.05em] text-ndm-ink">{s.stat}<span className="ml-2 font-inter text-[16px] tracking-normal text-ndm-muted">{s.unit}</span></p>
          <p className="mt-4 font-inter text-[15px] leading-[1.65] text-ndm-ink/80">{s.text}</p>
          <ul className="mt-auto flex flex-wrap gap-2 pt-6" role="list">{s.chips.map((c) => <li key={c} className="rounded-full bg-white px-3.5 py-1.5 font-inter text-[13px] text-ndm-ink ring-1 ring-ndm-ink/10">{c}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}

/* good candidates: a white card of good fits beside a quieter card of reasons to wait */
function TxFit({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.fit;
  return (
    <section ref={ref} id="candidate" aria-labelledby="fit-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="candidate" tag={t.tag || 'Good candidates'} hid="fit-title" lead={t.lead} strong={t.strong} text={t.text} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 md:grid-cols-2 md:gap-4`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8">
          <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">Often a good fit</p>
          {txList(t.yes)}
        </div>
        <div className="rv rounded-[24px] border border-ndm-ink/10 p-6 md:p-8" style={{ transitionDelay: '.08s' }}>
          <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">We may advise waiting or another option</p>
          {txList(t.no, 'grey')}
        </div>
      </div>
    </section>
  );
}

/* what to expect: a timeline with dots on one line (across on wide screens, down on phones) */
function TxExpect({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.expect;
  return (
    <section ref={ref} id="expect" aria-labelledby="expect-title" className="relative z-10 scroll-mt-[170px] bg-white px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="expect" tag={t.tag || 'What to expect'} hid="expect-title" lead={t.lead} strong={t.strong} text={t.text} />
      <ol className={`${TX_WRAP} relative mt-[clamp(32px,4vw,56px)] grid gap-0 lg:grid-cols-4 lg:gap-6`} role="list">
        <span aria-hidden="true" className="absolute left-[8px] top-2 h-[calc(100%-16px)] w-px bg-ndm-ink/[.12] lg:left-0 lg:right-0 lg:top-[7px] lg:h-px lg:w-auto" />
        {t.items.map(([w, h, d], i) => (
          <li key={w} className="rv relative pb-7 pl-9 last:pb-0 lg:pb-0 lg:pl-0 lg:pt-9" style={{ transitionDelay: `${0.07 * i}s` }}>
            <i aria-hidden="true" className="absolute left-[2px] top-1 size-[13px] rounded-full bg-ndm-deep ring-4 ring-ndm-blue/15 lg:left-0 lg:top-0" />
            <span className="block font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">{w}</span>
            <span className="mt-1 block font-aeonik text-[21px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</span>
            <span className="mt-1.5 block font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{d}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* results: three compare cards at most, a calm size; more on the full gallery */
function TxResults({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.results;
  return (
    <section ref={ref} id="results" aria-labelledby="results-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="results" tag="Results" hid="results-title" lead={t.lead} strong={t.strong} text={`${t.text} Individual results may vary.`} />
      <div className={TX_WRAP}>
      <ul className="tx-ba no-scrollbar -mx-[var(--gx)] mt-[clamp(28px,3.4vw,44px)] flex snap-x snap-mandatory scroll-px-[var(--gx)] gap-3 overflow-x-auto px-[var(--gx)] pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0" role="list">
        {t.cases.map((c, i) => (
          <li key={c.id} className="rv" style={{ transitionDelay: `${i * 0.06}s` }}>
            <BaCompare c={c} i={i} nudge={i === 0} />
            <p className="mt-2.5 flex items-center justify-between font-inter text-[13px] text-ndm-muted"><span className="text-ndm-ink">Case {c.id}</span><span>{c.view}</span></p>
          </li>
        ))}
      </ul>
      </div>
      {t.more && <div className="rv mt-8 flex justify-center"><Btn href={t.more} target="_blank" rel="noopener" v="line">View more results</Btn></div>}
    </section>
  );
}

/* pre and post care: before your visit and after your visit, two tidy cards */
function TxCare({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const c = p.care;
  return (
    <section ref={ref} id="care" aria-labelledby="care-title" className="relative z-10 scroll-mt-[170px] bg-white px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="care" tag="Pre & post care" hid="care-title" lead={c.lead} strong={c.strong} text={c.text} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 md:grid-cols-2 md:gap-4`}>
        {[['Before your visit', c.before], ['After your visit', c.after]].map(([h, items], i) => (
          <div key={h} className="rv rounded-[24px] bg-ndm-paper p-6 ring-1 ring-ndm-ink/[.06] md:p-8" style={{ transitionDelay: `${0.06 * i}s` }}>
            <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">{h}</p>
            {txList(items)}
          </div>
        ))}
      </div>
    </section>
  );
}

/* elevate your results: treatments that can complement this one, two groups of chips and a row of links */
function TxPair({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.pair;
  return (
    <section ref={ref} id="combinations" aria-labelledby="pair-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="combinations" tag={t.tag || 'Elevate your results'} hid="pair-title" lead={t.lead} strong={t.strong} text={t.text} />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-3 md:grid-cols-2`}>
        {t.groups.map(([g, items], i) => (
          <div key={g} className="rv rounded-[22px] bg-white p-6 ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.06 * i}s` }}>
            <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">{g}</p>
            <ul className="mt-4 flex flex-wrap gap-2" role="list">
              {items.map((x) => <li key={x} className="rounded-full bg-ndm-paper px-3.5 py-2 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/10">{x}</li>)}
            </ul>
          </div>
        ))}
      </div>
      {t.links && (
        <ul className={`${TX_WRAP} mt-3 grid gap-3 sm:grid-cols-3`} role="list">
          {t.links.map(([n, h, tag]) => (
            <li key={n} className="rv">
              <a href={h} className="group flex items-center justify-between gap-4 rounded-[18px] border border-ndm-ink/10 bg-white px-5 py-4 transition-colors hover:border-ndm-ink hover:bg-ndm-ink hover:text-white">
                <span><span className="block font-inter text-[12px] text-ndm-muted transition-colors group-hover:text-white/70">{tag}</span><span className="mt-0.5 block font-aeonik text-[19px] leading-[1.2]">{n}</span></span>
                <IconArrow className="shrink-0 transition-transform group-hover:translate-x-1" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* prices, in the Pricing page's style: one open category with its options on the white panel */
function TxPrices({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const [on, setOn] = useState(true);
  const pr = p.prices;
  const unit = (label) => (pr.unitLabel && label === pr.unitLabel ? ' / unit' : '');
  const pct = Math.max(0, ...pr.rows.map((r) => { const m = /^(\d+)% OFF$/.exec(r[3] || ''); return m ? +m[1] : 0; }));
  const from = Math.min(...pr.rows.map((r) => r[1]));
  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <TxHead p={p} id="prices" tag="Price list" hid="prices-title" lead={pr.lead} strong={pr.strong} text={pr.intro} />
      <div className={TX_WRAP}>
        <ul className="pr-groups rv mx-auto mt-[clamp(40px,4.5vw,64px)] max-w-[1040px]" role="list" style={{ transitionDelay: '.14s' }}>
          <li className={`pr-group ${on ? 'is-open' : ''}`}>
            <h3 className="pr-ghead m-0">
              <button type="button" id="tx-pr-h" aria-expanded={on} aria-controls="tx-pr" onClick={() => setOn((v) => !v)}
                className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
                <span className="min-w-0">
                  <span className="block font-inter text-[12.5px] tabular-nums text-ndm-muted">{pr.rows.length} {pr.rows.length === 1 ? 'option' : 'options'}</span>
                  <span className="mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{pr.title}</span>
                </span>
                <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                  {pct > 0 && <span className="pr-badge">Up to {pct}% off</span>}
                  <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(from)}</span>{pr.unitLabel ? ' / unit' : ''}</span>
                </span>
                <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
              </button>
            </h3>
            <div id="tx-pr" role="region" aria-labelledby="tx-pr-h" className="pr-body" {...(on ? {} : { inert: '' })}>
              <div>
                <p className="max-w-[60ch] pb-2 font-inter text-[15px] leading-[1.55] text-ndm-muted">{pr.blurb}</p>
                <ul className="pr-sub grid gap-2 py-4" role="list">
                  {pr.rows.map(([label, price, was, tag]) => {
                    const line = { key: `${pr.name}|${label}`, cat: pr.cat, name: pr.name, label, price, was: was || 0, unit: unit(label) };
                    return (
                      <li key={label} className="pr-opt grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-[14px] py-3 pl-4 pr-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6 sm:pl-5">
                        <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          <span className="font-inter text-[15px] text-ndm-ink">{label === pr.unitLabel ? 'Per unit' : label}</span>
                          {tag && <span className="pr-tag">{tag}</span>}
                        </span>
                        <span className="col-start-1 row-start-2 flex items-baseline gap-2.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                          {was ? <s className="pr-was"><span className="sr-only">Regular price </span>{money(was)}</s> : null}
                          <span className={`font-aeonik text-[22px] leading-none tracking-[-0.02em] ${was ? 'text-ndm-deep' : 'text-ndm-ink'}`}>
                            {was ? <span className="sr-only">now </span> : null}{money(price)}{line.unit && <span className="font-inter text-[13px] tracking-normal text-ndm-muted">{line.unit}</span>}
                          </span>
                        </span>
                        <span className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><QtyControl line={line} label={`${pr.name}, ${label}`} /></span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
        </ul>
        <div className="rv mt-10 flex flex-wrap justify-center gap-3" style={{ transitionDelay: '.18s' }}>
          <Btn href="#/book" v="book">Book Free Consultation</Btn>
          <Btn href="pricing.html#prices" v="line">All treatment prices</Btn>
        </div>
        <div className="mt-6 flex justify-center"><PayPlans /></div>
        <p className="mt-6 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">{pr.note || 'Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation.'}</p>
      </div>
    </section>
  );
}

/* why NewDermaMed: centred heading, then the team photo (award badge inside its lower corner) beside four plain proof points */
function TxWhy({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.why;
  return (
    <section ref={ref} aria-labelledby="why-title" className="relative z-10 bg-white px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="why" tag="Why NewDermaMed" hid="why-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="rv relative aspect-[3/2] overflow-hidden rounded-[24px] bg-ndm-mist">
          <img src={t.img} alt={t.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.pos || '50% 40%' }} />
          <span className="absolute bottom-3 left-3 flex items-center gap-3 rounded-[16px] bg-white/95 py-2 pl-2 pr-4 shadow-[0_18px_40px_-20px_rgba(27,36,43,.55)] backdrop-blur-[8px] sm:bottom-4 sm:left-4">
            <img src="assets/awards/top-choice-2026.png" alt="" className="size-11 object-contain" />
            <span><span className="block font-inter text-[13.5px] font-semibold text-ndm-ink">Top Choice Award</span><span className="block font-inter text-[12px] text-ndm-muted">8 consecutive years</span></span>
          </span>
        </div>
        <div>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-6" role="list">
            {t.items.map(([n, u, d], i) => (
              <li key={u} className="rv border-t border-ndm-ink/10 pt-4" style={{ transitionDelay: `${0.06 * i}s` }}>
                <span className="block font-aeonik text-[clamp(30px,2.8vw,40px)] leading-none tracking-[-0.03em] text-ndm-ink">{n}</span>
                <span className="mt-1.5 block font-inter text-[13px] font-semibold uppercase tracking-[.12em] text-ndm-deep">{u}</span>
                <span className="mt-2 block font-inter text-[14px] leading-[1.5] text-ndm-muted">{d}</span>
              </li>
            ))}
          </ul>
          <div className="rv mt-8 flex flex-wrap gap-3"><Btn href="#/book" v="book">Book Free Consultation</Btn><Btn href="about.html" v="line">About us</Btn></div>
        </div>
      </div>
    </section>
  );
}
