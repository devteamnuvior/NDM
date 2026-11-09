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
/* small icons for the on-this-page nav pills (24x24, stroked) */
const NAV_ICONS = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6h.01" /></>,
  doc: <><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></>,
  plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8.5v7M8.5 12h7" /></>,
  results: <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M12 5v14" /></>,
  tag: <><path d="M4 12.5v-7A1.5 1.5 0 0 1 5.5 4h7l7.5 7.5a1.5 1.5 0 0 1 0 2.1l-5.9 5.9a1.5 1.5 0 0 1-2.1 0L4 12.5Z" /><circle cx="8.5" cy="8.5" r="1.1" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.6a2.4 2.4 0 1 1 3.1 2.3c-.7.26-1.2.9-1.2 1.6v.3M12 16.5h.01" /></>,
  star: <><path d="M12 3.6l2.4 4.9 5.4.6-4 3.6 1.1 5.3L12 15.7 7.1 18l1.1-5.3-4-3.6 5.4-.6L12 3.6Z" /></>,
  building: <><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M9 8h0M12 8h0M15 8h0M9 12h0M12 12h0M15 12h0M10 20.5V16h4v4.5" /></>,
  play: <><circle cx="12" cy="12" r="9" /><path d="M10 8.4l5.2 3.6L10 15.6Z" /></>,
  pin: <><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" /><circle cx="12" cy="11" r="2.2" /></>,
  shield: <><path d="M12 3.5l7 3v5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9v-5l7-3Z" /><path d="M9 12l2 2 4-4" /></>,
  user: <><circle cx="12" cy="8.5" r="3.2" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></>,
  list: <><path d="M9 6.5h10M9 12h10M9 17.5h10M5 6.5h.01M5 12h.01M5 17.5h.01" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  home: <><path d="M3.5 11.5 12 4l8.5 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></>,
};
/* pick a nav icon from the section id and label */
const navIcon = (id, label) => {
  const s = ((id || '') + ' ' + (label || '')).toLowerCase();
  if (/faq/.test(s)) return 'help';
  if (/pric|fee|cost/.test(s)) return 'tag';
  if (/result|before|after|gallery/.test(s)) return 'results';
  if (/combin|elevate|pair|together/.test(s)) return 'plus';
  if (/benefit/.test(s)) return 'star';
  if (/visit|location|map/.test(s)) return 'pin';
  if (/clinic|film|inside|space/.test(s)) return 'building';
  if (/watch|video|reel/.test(s)) return 'play';
  if (/why|safe|trust/.test(s)) return 'shield';
  if (/duration|long|last|course|session/.test(s)) return 'clock';
  if (/candidate|who|suit/.test(s)) return 'user';
  if (/assess|analysis|consult/.test(s)) return 'search';
  if (/overview|about|your treatment|expect|what to|understand/.test(s)) return 'doc';
  if (/option|how|work|care|mainten/.test(s)) return 'list';
  return 'info';
};

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

/* treatment at a glance: a white strip that sits half over the bottom of the header photo (its own height is measured, so the
   overlap stays at half on every screen), an icon per fact and both phone numbers. The hero gets the same extra room at its
   bottom so the card never covers its text. A region rather than a section, so page-wide section backgrounds never cover the photo */
function TxGlance({ p }) {
  const card = useRef(null);
  const [half, setHalf] = useState(48);
  useLayoutEffect(() => {
    const el = card.current; if (!el) return;
    const fit = () => setHalf(Math.round(el.offsetHeight / 2));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    /* re-measure once styles and fonts have settled, in case the observer is throttled (background tabs) */
    window.addEventListener('load', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    const t = setTimeout(fit, 900);
    return () => { ro.disconnect(); window.removeEventListener('load', fit); clearTimeout(t); };
  }, []);
  return (
    <div role="region" aria-labelledby="glance-title" className="tx-glance relative z-20 px-[var(--gx)]" style={{ marginTop: -half }}>
      <style>{`section[aria-labelledby="proc-title"]>.grid{padding-bottom:calc(${half}px + clamp(28px,4.5vw,64px))}`}</style>
      <h2 id="glance-title" className="sr-only">Treatment at a glance</h2>
      <div ref={card} className={`${TX_WRAP} grid gap-4 rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-36px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/[.06] sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-7`}>
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
    </div>
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
    <nav ref={bar} aria-label="On this page" className="tx-nav sticky top-[100px] z-30 mt-8 bg-ndm-paper/85 backdrop-blur-[10px] xl:top-[120px]">
      <div className="tx-nav-scroll no-scrollbar relative overflow-x-auto px-[var(--gx)] py-2.5">
      <ul className="relative mx-auto flex w-max gap-1" role="list">
        <li className="shrink-0">
          <a href="#top" aria-label="Back to top" onClick={(e) => { e.preventDefault(); scrollToY(0); }}
            className="flex items-center whitespace-nowrap rounded-full px-2.5 py-2 text-ndm-deep transition-colors hover:bg-white hover:text-ndm-ink">
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{NAV_ICONS.home}</svg>
          </a>
        </li>
        {p.nav.map(([id, label]) => (
          <li key={id} data-k={id} className="shrink-0">
            <a href={`#${id}`} onClick={(e) => go(e, id)} aria-current={on === id ? 'true' : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 font-inter text-[14px] transition-colors ${on === id ? 'bg-ndm-deep font-medium text-white' : 'text-ndm-ink/80 hover:bg-white hover:text-ndm-ink'}`}>
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={on === id ? 'text-white' : 'text-ndm-deep'}>{NAV_ICONS[navIcon(id, label)]}</svg>{label}
            </a>
          </li>
        ))}
      </ul>
      </div>
    </nav>
  );
}

/* what it is: a smaller photo (with NUVIOR's NAMICA badge on the Aptos page, ring and sphere turning together) beside the copy and the main points */
function TxIntro({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.intro;
  return (
    <section ref={ref} id="what" aria-labelledby="intro-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,88px)]">
      <TxHead p={p} id="what" tag={t.tag} hid="intro-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid items-center gap-8 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="rv relative mx-auto w-full max-w-[460px] lg:max-w-none" style={{ transitionDelay: '.1s' }}>
          <div className={`relative aspect-[5/4] overflow-hidden rounded-[24px] bg-ndm-mist lg:aspect-auto ${t.para ? 'lg:h-[min(50vh,460px)]' : 'lg:h-[min(62vh,560px)]'}`}>
            <img src={t.img} alt={t.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.pos || '50% 40%' }} />
          </div>
          {t.ring && (
            <div aria-hidden="true" className="tx-ring absolute -right-3 -top-6 size-[clamp(112px,10vw,144px)] sm:-right-6">
              {/* one piece: the words and the sphere turn together */}
              <div className="tx-ring-spin absolute inset-0">
                <svg viewBox="0 0 160 160" className="absolute inset-0 size-full">
                  <defs><path id="tx-ring-path" d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" /></defs>
                  <circle cx="80" cy="80" r="78" fill="rgba(255,255,255,.94)" />
                  <text fontFamily="Inter, sans-serif" fontSize="10.5" fontWeight="600" letterSpacing="2.4" fill="#352862"><textPath href="#tx-ring-path">{t.ring}</textPath></text>
                </svg>
                <img src={NAMICA_SPHERE} alt="" className="absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}
        </div>
        {t.para ? (
          <p className="rv max-w-[54ch] font-inter text-[clamp(17px,1.35vw,20px)] leading-[1.75] text-ndm-ink/85" style={{ transitionDelay: '.1s' }}>{t.para}</p>
        ) : (
        <div>
          {t.text.map((x, i) => <p key={i} className="rv mt-0 max-w-[58ch] font-inter text-[17px] leading-[1.7] text-ndm-ink/90 [&+p]:mt-4" style={{ transitionDelay: `${0.1 + i * 0.04}s` }}>{x}</p>)}
          <ul className="mt-7 grid gap-2.5" role="list">
            {t.points.map(([h, d], i) => (
              <li key={h} className="rv flex items-start gap-4 rounded-[18px] bg-white px-5 py-4 ring-1 ring-ndm-ink/[.06] shadow-[0_18px_40px_-34px_rgba(27,36,43,.35)] sm:items-center" style={{ transitionDelay: `${0.14 + i * 0.05}s` }}>
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconTick size={15} /></span>
                <span className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-baseline sm:gap-4">
                  <span className="font-aeonik text-[21px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</span>
                  <span className="font-inter text-[15.5px] leading-[1.55] text-ndm-ink/80">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          {t.chips && <ul className="rv mt-5 flex flex-wrap gap-2" role="list">{t.chips.map((c) => <li key={c} className="rounded-full bg-white px-3.5 py-1.5 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/10">{c}</li>)}</ul>}
          {t.note && <p className="rv mt-5 flex items-center gap-2 font-inter text-[14.5px] text-ndm-ink/75"><IconCheckBadge className="shrink-0 text-ndm-deep" />{t.note}</p>}
        </div>
        )}
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
    <section ref={ref} id="how" aria-labelledby="steps-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="how" tag={t.tag} hid="steps-title" lead={t.lead} strong={t.strong} text={t.text} />
      <ol ref={list} className={`tx-steps ${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${on ? 'in' : ''}`} role="list">
        {t.items.map(([h, d], i) => (
          <li key={h} className="tx-step relative rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] md:p-6" style={{ '--d': `${(i * 0.12).toFixed(2)}s` }}>
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-ndm-deep font-inter text-[13px] font-semibold text-white">{i + 1}</span>
              <span aria-hidden="true" className="tx-line h-px flex-1 bg-ndm-ink/10"><i className="block h-px origin-left bg-ndm-deep" /></span>
            </span>
            <h3 className="mt-5 font-aeonik text-[21px] font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</h3>
            <p className="mt-2 font-inter text-[15px] leading-[1.6] text-ndm-ink/75">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const txList = (items, tone = 'blue') => (
  <ul className="mt-3 grid gap-2.5" role="list">
    {items.map((x) => <li key={x} className="flex items-start gap-2.5 font-inter text-[15px] leading-[1.55] text-ndm-ink/85"><span aria-hidden="true" className={`mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-full ${tone === 'blue' ? 'bg-ndm-blue/10 text-ndm-deep' : 'bg-ndm-ink/[.07] text-ndm-muted'}`}>{tone === 'blue' ? <IconTick size={10} /> : <IconX2 size={9} />}</span>{x}</li>)}
  </ul>
);
const IconInfoSm = (p) => <Svg size={14} vb="0 0 14 14" {...p}><circle cx="7" cy="7" r="5.6" stroke="currentColor" strokeWidth="1.4" /><path d="M7 6.2v3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="7" cy="4.2" r=".85" fill="currentColor" /></Svg>;

/* is it safe: the honest answer and safeguards, with the licensed product on a soft card (Aptos) */
function TxSafety({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.safety;
  return (
    <section ref={ref} id="safety" aria-labelledby="safety-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="safety" tag={t.tag || 'Is it safe'} hid="safety-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8">
          {t.text.map((x, i) => <p key={i} className="font-inter text-[16px] leading-[1.7] text-ndm-ink/85 [&+p]:mt-4">{x}</p>)}
          <p className="mt-6 font-inter text-[12.5px] font-semibold uppercase tracking-[.14em] text-ndm-deep">Our safeguards</p>
          {txList(t.safeguards)}
        </div>
        {t.product ? (
          <figure className="rv tx-product relative m-0 flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[24px] p-6 text-white md:p-8" style={{ transitionDelay: '.08s' }}>
            <img src={t.product.img} alt={t.product.alt} loading="lazy" className="tx-product-img absolute left-1/2 top-[12%] w-[82%] max-w-[420px] -translate-x-1/2" />
            <img src={NAMICA_SPHERE} alt="" aria-hidden="true" className="namica-sphere pointer-events-none absolute -bottom-8 -right-8 w-[150px] opacity-90" />
            <figcaption className="relative">
              <span className="block font-inter text-[12px] uppercase tracking-[.14em] text-[#C9C2F4]">{t.product.tag}</span>
              <span className="mt-1.5 block font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.15]">{t.product.name}</span>
              <span className="mt-1 block max-w-[36ch] font-inter text-[14px] leading-[1.5] text-white/80">{t.product.note}</span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

/* how long it lasts: one wide card (the Aptos one carries NUVIOR's HA release motion); how many sessions now sits with the price */
function TxLasting({ p }) {
  const ref = useRef(null), box = useRef(null);
  useReveal(ref);
  const run = useInView(box, { threshold: 0.35 });
  const d = p.duration;
  return (
    <section ref={ref} aria-labelledby="duration-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div ref={box} className={TX_WRAP}>
        <article id="duration" className="rv tx-lasts relative grid scroll-mt-[170px] gap-8 overflow-hidden rounded-[26px] p-6 text-white md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          {d.logo && <img src={d.logo} alt={d.logoAlt || ''} width="106" height="23" className="absolute right-6 top-7 h-[18px] w-auto opacity-95 md:right-10 md:top-11 md:h-[24px]" />}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-inter text-[13px] font-medium"><span className="tabular-nums text-[#C9C2F4]">{txNum(p, 'duration')}</span>How long it lasts</p>
            <h2 id="duration-title" className="mt-5 font-aeonik text-[clamp(30px,3vw,44px)] font-normal leading-[1.08] tracking-[-0.03em]">{d.lead}<br /><span className="tt-strong text-[#C9C2F4]">{d.strong}</span></h2>
            <p className="mt-4 max-w-[52ch] font-inter text-[16px] leading-[1.65] text-white/85">{d.text}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6">
              <p className="flex items-baseline gap-2"><span className="font-aeonik text-[clamp(28px,2.4vw,36px)] leading-none tracking-[-0.03em]">{d.stat}</span><span className="font-inter text-[15px] text-white/75">{d.unit}</span></p>
              <p className="max-w-[40ch] font-inter text-[13.5px] leading-[1.5] text-white/70"><span className="block text-white/90">{d.label}</span>{d.note}</p>
            </div>
          </div>
          {/* HA release along the thread (NUVIOR Aptos family motion): capsules drift and open over the months */}
          <div>
            <div aria-hidden="true" className={`tx-thread relative h-[150px] ${run ? 'in' : ''}`}>
              <span className="tx-thread-line absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" />
              {Array.from({ length: 18 }, (_, i) => (
                <i key={i} className="tx-bub absolute rounded-full" style={{ left: `${(i * 5.6 + 2).toFixed(1)}%`, top: `${[28, 62, 40, 70, 22, 55, 35, 66, 30, 48, 72, 26, 58, 38, 64, 44, 30, 56][i]}%`, width: `${[10, 6, 14, 8, 12, 5, 9, 13, 6, 11, 7, 10, 5, 12, 8, 6, 9, 7][i]}px`, '--d': `${(i * 0.14).toFixed(2)}s` }} />
              ))}
            </div>
            <div aria-hidden="true" className="mt-2 flex justify-between font-inter text-[12px] uppercase tracking-[.12em] text-white/65"><span>Day 0</span><span>Months 1 to 3</span><span>Up to 6 months</span></div>
          </div>
        </article>
      </div>
    </section>
  );
}

/* good candidates: the two answers stacked on the left (a blue "often a good fit" card, a warm "worth waiting" card), a photo on the right */
function TxFit({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.fit;
  const row = (x, good) => (
    <li key={x} className="flex items-start gap-3 font-inter text-[15.5px] leading-[1.55] text-ndm-ink">
      <span aria-hidden="true" className={`mt-[2px] grid size-6 shrink-0 place-items-center rounded-full ${good ? 'bg-ndm-deep text-white' : 'bg-[#FFE7C2] text-[#8A5A12]'}`}>{good ? <IconTick size={11} /> : <IconInfoSm size={13} />}</span>{x}
    </li>
  );
  return (
    <section ref={ref} id="candidate" aria-labelledby="fit-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="candidate" tag={t.tag || 'Good candidates'} hid="fit-title" lead={t.lead} strong={t.strong} text={t.text} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-6`}>
        <div className="grid gap-3">
          <div className="rv rounded-[24px] bg-[#EEF7FC] p-6 ring-1 ring-ndm-blue/20 md:p-7">
            <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink"><span aria-hidden="true" className="h-5 w-1 rounded-full bg-ndm-deep" />Often a good fit</p>
            <ul className="mt-4 grid gap-3" role="list">{t.yes.map((x) => row(x, true))}</ul>
          </div>
          <div className="rv rounded-[24px] bg-[#FFF6EA] p-6 ring-1 ring-[#FFA617]/25 md:p-7" style={{ transitionDelay: '.08s' }}>
            <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink"><span aria-hidden="true" className="h-5 w-1 rounded-full bg-[#FFA617]" />We may advise waiting or another option</p>
            <ul className="mt-4 grid gap-3" role="list">{t.no.map((x) => row(x, false))}</ul>
          </div>
        </div>
        {t.img && (
          <div className="rv peach relative min-h-[320px] overflow-hidden rounded-[24px] bg-ndm-mist" style={{ transitionDelay: '.12s' }}>
            <img src={t.img} alt={t.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.pos || '50% 40%' }} />
          </div>
        )}
      </div>
    </section>
  );
}

/* what to expect: a sticky heading on the left, a scroll-lit journey on the right (the line fills and each step lights up as it passes) */
function TxExpect({ p }) {
  const ref = useRef(null), list = useRef(null), fill = useRef(null);
  useReveal(ref);
  const t = p.expect;
  const [act, setAct] = useState(0);
  const n = txNum(p, 'expect');
  useOnScroll(() => {
    const el = list.current; if (!el) return;
    const r = el.getBoundingClientRect(), mid = window.innerHeight * 0.55;
    const prog = clamp01((mid - r.top) / Math.max(1, r.height));
    if (fill.current) fill.current.style.transform = `scaleY(${REDUCED ? 1 : prog.toFixed(3)})`;
    const items = [...el.querySelectorAll('[data-step]')];
    let k = 0; items.forEach((li, i) => { if (li.getBoundingClientRect().top < mid) k = i; });
    setAct(k);
  }, []);
  return (
    <section ref={ref} id="expect" aria-labelledby="expect-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(48px,6vw,96px)]`}>
        <div className="lg:sticky lg:top-[200px] lg:self-start">
          <Eyebrow className="rv">{n && <span className="tabular-nums text-ndm-deep">{n}</span>}{t.tag || 'What to expect'}</Eyebrow>
          <TwoTone id="expect-title" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={twoLine(t.lead)} strong={t.strong} style={{ transitionDelay: '.06s' }} />
          {t.text && <p className="rv mt-4 max-w-[44ch] font-inter text-[16px] leading-[1.65] text-ndm-muted">{t.text}</p>}
          <div className="rv mt-8 hidden items-center gap-4 lg:flex" aria-hidden="true">
            <span className="font-aeonik text-[44px] leading-none tracking-[-0.04em] text-ndm-deep tabular-nums">0{act + 1}</span>
            <span className="font-inter text-[14px] leading-[1.4] text-ndm-muted">of 0{t.items.length}<br /><span className="text-ndm-ink">{t.items[act][0]}</span></span>
          </div>
          <div className="rv mt-8"><Btn href="#/book" v="book" hot>Book Free Consultation</Btn></div>
        </div>
        <ol ref={list} className="relative grid gap-4" role="list">
          <span aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-[2px] rounded-full bg-ndm-ink/[.08]"><i ref={fill} className="block h-full w-full origin-top rounded-full bg-gradient-to-b from-ndm-sky to-ndm-deep" style={{ transform: 'scaleY(0)' }} /></span>
          {t.items.map(([w, h, d], i) => {
            const on = i <= act;
            return (
              <li key={w} data-step="" className="rv relative pl-14" style={{ transitionDelay: `${0.06 * i}s` }}>
                <span aria-hidden="true" className={`absolute left-0 top-5 grid size-10 place-items-center rounded-full font-inter text-[13px] font-semibold tabular-nums transition-colors duration-500 ${on ? 'bg-ndm-deep text-white shadow-[0_10px_22px_-10px_rgba(15,128,195,.9)]' : 'bg-white text-ndm-muted ring-1 ring-ndm-ink/10'}`}>{String(i + 1).padStart(2, '0')}</span>
                <div className={`rounded-[22px] bg-white p-5 transition-[box-shadow,transform] duration-500 md:p-6 ${i === act ? 'shadow-[0_24px_50px_-30px_rgba(15,128,195,.45)] ring-1 ring-ndm-blue/25' : 'ring-1 ring-ndm-ink/[.06]'}`}>
                  <span className="inline-flex rounded-full bg-ndm-blue/10 px-3 py-1 font-inter text-[12.5px] font-semibold text-ndm-deep">{w}</span>
                  <h3 className="mt-3 font-aeonik text-[clamp(21px,1.8vw,25px)] font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</h3>
                  <p className="mt-2 font-inter text-[15.5px] leading-[1.6] text-ndm-ink/75">{d}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* results: the home page's before & after (heading row with the button, four compare cards side by side, two per row on phones).
   A page with fewer than four real cases shows a "more results" tile in the last place rather than repeating a photo */
const TX_MORE_CSS = `
.tx-more{isolation:isolate;background:#0F80C3;box-shadow:0 24px 50px -32px rgba(15,128,195,.65);transition:box-shadow .5s var(--e-out),transform .5s var(--e-out)}
.tx-more:hover{transform:translateY(-4px);box-shadow:0 34px 60px -32px rgba(15,128,195,.75)}
.tx-more-mesh{z-index:-1;background:radial-gradient(60% 50% at 10% 6%,rgba(255,190,158,1),transparent 64%),radial-gradient(50% 40% at 100% 70%,rgba(255,206,182,.7),transparent 66%),radial-gradient(60% 55% at 92% 18%,rgba(127,211,245,.95),transparent 64%),radial-gradient(75% 60% at 30% 100%,rgba(10,79,122,.95),transparent 70%),linear-gradient(160deg,#26B1E7,#0F80C3 55%,#0A4F7A);background-size:160% 160%;animation:txMesh 14s ease-in-out infinite alternate}
@keyframes txMesh{0%{background-position:0% 0%}100%{background-position:100% 100%}}
.tx-more-pic{left:50%;top:50%;width:46%;aspect-ratio:3/4;object-fit:cover;border-radius:12px;border:3px solid rgba(255,255,255,.92);box-shadow:0 18px 30px -14px rgba(11,15,19,.55);transform:translate(-50%,-50%) translateX(var(--x)) rotate(var(--r));transition:transform .7s var(--e-out)}
.tx-more:hover .tx-more-pic{transform:translate(-50%,-50%) translateX(calc(var(--x) * 1.18)) rotate(calc(var(--r) * 1.5))}
.tx-more-glass{background:linear-gradient(135deg,rgba(255,255,255,.24),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.32);-webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%)}
@media (prefers-reduced-motion:reduce){.tx-more-mesh{animation:none}.tx-more,.tx-more-pic{transition:none}}
`;
function TxResults({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.results;
  const n = txNum(p, 'results');
  const more = t.more || BA_ALL;
  const cases = t.cases.slice(0, 4);
  return (
    <section ref={ref} id="results" aria-labelledby="results-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={TX_WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <Eyebrow className="rv">{n && <span className="tabular-nums text-ndm-deep">{n}</span>}Before &amp; after</Eyebrow>
            <TwoTone id="results-title" className="rv mt-4" size="text-[clamp(32px,3.4vw,50px)]" lead={twoLine(t.lead)} strong={t.strong} style={{ transitionDelay: '.05s' }} />
            <p className="rv mt-4 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>{t.text}</p>
          </div>
          <div className="rv" style={{ transitionDelay: '.12s' }}><Btn href={more} target="_blank" rel="noopener" v="line">See all before &amp; after</Btn></div>
        </div>
        <ul role="list" className="mt-[clamp(32px,4vw,52px)] grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-x-4">
          {cases.map((c, i) => (
            <li key={c.id} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
              <figure className="m-0">
                <BaCompare c={c} i={i} nudge={i < 2} />
                <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="font-aeonik text-[18px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">Case {c.id}</span>
                  <span className="font-inter text-[13px] text-ndm-muted">{c.view}</span>
                </figcaption>
              </figure>
            </li>
          ))}
          {cases.length < 4 && (
            <li className="rv" style={{ transitionDelay: `${0.06 * cases.length}s` }}>
              {/* the last tile: a soft blue and peach gradient that drifts slowly, a fanned stack of case photos and a frosted
                 panel with the text and a big arrow; same 4:5 box as the compare photos */}
              <a href={more} target="_blank" rel="noopener" className="tx-more group relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-[22px] p-2.5 text-white sm:p-3.5">
                <style>{TX_MORE_CSS}</style>
                <span aria-hidden="true" className="tx-more-mesh absolute inset-0" />
                <span aria-hidden="true" className="relative mx-auto mt-[6%] h-[50%] w-full">
                  {t.cases.slice(0, 3).map((c, k) => (
                    <img key={c.id} src={c.after} alt="" loading="lazy" decoding="async" className="tx-more-pic absolute"
                      style={{ '--r': `${[-12, 0, 12][k]}deg`, '--x': `${[-44, 0, 44][k]}%`, zIndex: [1, 3, 2][k], objectPosition: `${c.fx || 50}% 30%` }} />
                  ))}
                </span>
                <span className="tx-more-glass relative mt-auto flex items-end justify-between gap-2 rounded-[14px] p-2.5 sm:rounded-[16px] sm:p-4">
                  <span className="min-w-0">
                    <span className="hidden font-inter text-[11.5px] font-semibold uppercase tracking-[.16em] text-white/75 sm:block">Gallery</span>
                    <span className="block font-aeonik text-[clamp(18px,1.8vw,26px)] leading-[1.08] tracking-[-0.02em] sm:mt-1">More cases</span>
                    <span className="mt-1 hidden font-inter text-[13px] leading-[1.4] text-white/85 sm:block">See the full before &amp; after gallery</span><span className="mt-0.5 block font-inter text-[12px] text-white/85 sm:hidden">Full gallery</span><span className="sr-only"> (opens in a new tab)</span>
                  </span>
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ndm-deep transition-transform duration-500 group-hover:-rotate-45 sm:size-12"><IconArrow /></span>
                </span>
              </a>
            </li>
          )}
        </ul>
        <p className="mt-8 flex items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-ndm-muted">
          <BaIconInfo className="mt-0.5 shrink-0" />Photos show individual cases and are shared for illustration only. Individual results may vary.
        </p>
      </div>
    </section>
  );
}

/* pre and post care: two cards, a numbered checklist in each, read like a plan for the weeks around the visit */
function TxCare({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const c = p.care;
  const cards = [['Before your visit', 'Getting ready', c.before, TX_ICONS.cal], ['After your visit', 'While the area settles', c.after, TX_ICONS.leaf]];
  return (
    <section ref={ref} id="care" aria-labelledby="care-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="care" tag="Pre & post care" hid="care-title" lead={c.lead} strong={c.strong} text={c.text} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 md:grid-cols-2 md:gap-4`}>
        {cards.map(([h, sub, items, ico], i) => (
          <div key={h} className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] shadow-[0_24px_50px_-42px_rgba(27,36,43,.4)] md:p-8" style={{ transitionDelay: `${0.06 * i}s` }}>
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-ndm-sky to-ndm-deep text-white shadow-[0_10px_20px_-12px_rgba(15,128,195,.9)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ico}</svg>
              </span>
              <span><span className="block font-aeonik text-[23px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">{h}</span><span className="block font-inter text-[13.5px] text-ndm-muted">{sub}</span></span>
            </div>
            <ol className="mt-5" role="list">
              {items.map((x, k) => (
                <li key={x} className="flex items-start gap-3.5 border-t border-ndm-ink/[.07] py-3.5 font-inter text-[15.5px] leading-[1.55] text-ndm-ink/90 first:border-0 first:pt-1">
                  <span aria-hidden="true" className="mt-[1px] grid size-6 shrink-0 place-items-center rounded-full bg-ndm-blue/10 font-inter text-[12px] font-semibold tabular-nums text-ndm-deep">{k + 1}</span>{x}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* elevate your results: one calm card, what may pair at the same visit beside what is usually planned later, and plain links under it */
function TxPair({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const t = p.pair;
  return (
    <section ref={ref} id="combinations" aria-labelledby="pair-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="combinations" tag={t.tag || 'Elevate your results'} hid="pair-title" lead={t.lead} strong={t.strong} text={t.text} />
      {/* when each pairing usually happens: two stops joined by a line, the treatments as chips */}
      <ol role="list" className={`${TX_WRAP} rv tx-when relative mt-[clamp(28px,3.4vw,44px)] grid gap-3 rounded-[26px] p-3 md:grid-cols-2 md:gap-0 md:p-2`}>
        {t.groups.map(([g, items], i) => (
          <li key={g} className={`relative rounded-[20px] p-5 md:p-7 ${i ? 'bg-white/70' : 'bg-white shadow-[0_18px_40px_-30px_rgba(15,60,95,.45)]'}`}>
            <p className="flex items-center gap-3 font-aeonik text-[clamp(19px,1.6vw,22px)] leading-[1.2] tracking-[-0.01em] text-ndm-ink">
              <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full font-inter text-[13px] font-semibold ${i ? 'bg-ndm-sky/15 text-ndm-deep' : 'bg-ndm-deep text-white'}`}>{i + 1}</span>{g}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2" role="list">
              {items.map((x) => <li key={x} className="rounded-full bg-ndm-paper px-3.5 py-1.5 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/[.08]">{x}</li>)}
            </ul>
            {i === 0 && <span aria-hidden="true" className="tx-when-arrow absolute -right-5 top-1/2 z-[2] hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-ndm-deep text-white md:grid"><IconArrow /></span>}
          </li>
        ))}
      </ol>
      {/* treatments that pair well: photo cards with one short line, in the same card style as the home page menu */}
      {t.links && (
        <ul role="list" className={`${TX_WRAP} mt-5 grid gap-4 sm:grid-cols-3`}>
          {t.links.map(([n, h, tag, img, line], i) => (
            <li key={n} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
              <a href={h} className="tx-pair-card group flex h-full flex-col rounded-[22px] bg-white p-2.5 ring-1 ring-ndm-ink/[.06]">
                <span className="peach relative block aspect-[16/11] overflow-hidden rounded-[16px] bg-ndm-mist">
                  {img && <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" style={{ transitionTimingFunction: 'var(--e-out)' }} />}
                  {tag && <span className="absolute left-3 top-3 z-[1] rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[8px]">{tag}</span>}
                </span>
                <span className="flex flex-1 items-start justify-between gap-3 px-2 pb-2 pt-4">
                  <span className="min-w-0">
                    <span className="block font-aeonik text-[clamp(20px,1.7vw,23px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{n}</span>
                    {line && <span className="mt-1 block font-inter text-[13.5px] leading-[1.45] text-ndm-muted">{line}</span>}
                  </span>
                  <span aria-hidden="true" className="grid size-10 shrink-0 self-end place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep transition-colors group-hover:bg-ndm-deep group-hover:text-white"><IconArrow /></span>
                </span>
                <span className="sr-only">Explore {n}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
function TxPrices({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const [on, setOn] = useState(true);
  const pr = p.prices;
  const unit = (label) => (pr.unitLabel && label === pr.unitLabel ? ' / unit' : '');
  const pct = Math.max(0, ...pr.rows.map((r) => { const m = /^(\d+)% OFF$/.exec(r[3] || ''); return m ? +m[1] : 0; }));
  /* lowest price a client can reach: for unit pricing a package can beat the per-unit rate, so compare per unit */
  const from = Math.min(...pr.rows.map((r) => { const m = /(\d[\d,]*)\s*units?/i.exec(r[0]); const nu = pr.unitLabel && m ? +m[1].replace(/,/g, '') : 0; return nu > 0 ? r[1] / nu : r[1]; }));
  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 scroll-mt-[170px] px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
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
        {p.sessions && (
          <div id="sessions" className="rv mx-auto mt-6 grid max-w-[1040px] scroll-mt-[170px] gap-4 rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-7 sm:p-6" style={{ transitionDelay: '.16s' }}>
            <p className="flex items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0.5">
              <span className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">How many you need</span>
              <span className="flex items-baseline gap-1.5"><span className="font-aeonik text-[34px] leading-none tracking-[-0.03em] text-ndm-ink">{p.sessions.stat}</span><span className="font-inter text-[15px] text-ndm-muted">{p.sessions.unit}</span></span>
            </p>
            <div>
              <p className="font-inter text-[15px] leading-[1.6] text-ndm-ink/85">{p.sessions.text}</p>
              <ul className="mt-3 flex flex-wrap gap-2" role="list">{p.sessions.chips.map((c) => <li key={c} className="rounded-full bg-ndm-paper px-3 py-1 font-inter text-[13px] text-ndm-ink ring-1 ring-ndm-ink/10">{c}</li>)}</ul>
            </div>
          </div>
        )}
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
/* why NewDermaMed: a dark band, the team photo with the award badge, and the four figures counting up as they come into view */
const txFigure = (n) => { const m = /^(\d+)(\+?)$/.exec(String(n)); return m ? [Number(m[1]), m[2]] : null; };
function TxWhy({ p }) {
  const ref = useRef(null), list = useRef(null);
  useReveal(ref);
  const run = useInView(list, { threshold: 0.3 });
  const t = p.why;
  return (
    <section ref={ref} id="why" data-nav="dark" aria-labelledby="why-title" className="tx-why-dark relative z-10 scroll-mt-[170px] overflow-hidden px-[var(--gx)] py-[clamp(64px,7vw,104px)] text-white">
      <TxHead p={p} id="why" tag="Why NewDermaMed" hid="why-title" lead={t.lead} strong={t.strong} dark />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="rv relative aspect-[3/2] overflow-hidden rounded-[24px] bg-white/5 ring-1 ring-white/10">
          <img src={t.img} alt={t.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.pos || '50% 40%' }} />
          <span className="absolute bottom-3 left-3 flex items-center gap-3 rounded-[16px] bg-white/95 py-2 pl-2 pr-4 shadow-[0_18px_40px_-20px_rgba(27,36,43,.55)] backdrop-blur-[8px] sm:bottom-4 sm:left-4">
            <img src="assets/awards/top-choice-2026.png" alt="" className="size-11 object-contain" />
            <span><span className="block font-inter text-[13.5px] font-semibold text-ndm-ink">Top Choice Award</span><span className="block font-inter text-[12px] text-ndm-muted">8 consecutive years</span></span>
          </span>
        </div>
        <div>
          <ul ref={list} className="grid grid-cols-2 gap-x-5 gap-y-6" role="list">
            {t.items.map(([n, u, d], i) => {
              const fig = txFigure(n);
              return (
                <li key={u} className="rv border-t border-white/15 pt-4" style={{ transitionDelay: `${0.06 * i}s` }}>
                  <span className="block font-aeonik text-[clamp(30px,2.8vw,40px)] leading-none tracking-[-0.03em] text-white tabular-nums">{fig ? <CountUp to={fig[0]} run={run} suffix={fig[1]} /> : n}</span>
                  <span className="mt-1.5 block font-inter text-[13px] font-semibold uppercase tracking-[.12em] text-ndm-sky">{u}</span>
                  <span className="mt-2 block font-inter text-[14px] leading-[1.5] text-white/70">{d}</span>
                </li>
              );
            })}
          </ul>
          <div className="rv mt-8 flex flex-wrap gap-3"><Btn href="#/book" v="book" onDark>Book Free Consultation</Btn><Btn href="about.html" v="glass">About us</Btn></div>
        </div>
      </div>
    </section>
  );
}

/* concerns this treatment is listed for (src/live/concerns-map.json): chips to the concern pages, after the treatment's own sections */
function TxConcerns({ items }) {
  const ref = useRef(null);
  useReveal(ref);
  if (!items || !items.length) return null;
  return (
    <section ref={ref} id="concerns" aria-labelledby="concerns-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(40px,4.5vw,64px)]">
      <div className={`${TX_WRAP} rv grid gap-5 rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:items-center md:p-8`}>
        <div>
          <Eyebrow>Concerns</Eyebrow>
          <h2 id="concerns-title" className="mt-3 font-aeonik text-[clamp(24px,2.2vw,32px)] font-normal leading-[1.12] tracking-[-0.02em] text-ndm-ink">Concerns it may<br /><span className="tt-strong text-ndm-deep">help with</span></h2>
          <p className="mt-2 max-w-[44ch] font-inter text-[14.5px] leading-[1.6] text-ndm-muted">Each concern page compares every option we offer for it, with prices and what to expect.</p>
        </div>
        <ul className="flex flex-wrap gap-2 md:justify-end" role="list">
          {items.map(([n, h]) => <li key={h}><a href={h} className="inline-flex items-center gap-2 rounded-full bg-ndm-paper px-4 py-2 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/[.08] transition-colors hover:text-ndm-deep hover:ring-ndm-deep">{n}<IconArrow size={11} className="text-ndm-deep" /></a></li>)}
          <li><a href="concerns.html" className="inline-flex items-center gap-2 rounded-full bg-ndm-deep px-4 py-2 font-inter text-[14px] text-white transition-colors hover:bg-[#0A4F7A]">All concerns<IconArrow size={11} /></a></li>
        </ul>
      </div>
    </section>
  );
}
