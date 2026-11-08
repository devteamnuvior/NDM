/* ---------------------------------------------------------------- concern pages (concern-<slug>.html) and the concerns hub (concerns.html).
   Built by src/build_concerns.py from src/concerns_data.py in the treatment page look: header photo, the quick facts card,
   what you may notice and why, how we assess it, the options (with the bio-stimulator group and the prescription note),
   a comparison, what to expect, skincare at home, Why NewDermaMed, the team, reviews, articles, related concerns, the
   free skin analysis band and the FAQ. Shared pieces come from the shell, procedure-ui.jsx and treatment-ui.jsx. */
const CN_CSS = `
.cn-role{font:600 11px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:7px 10px;border-radius:999px;box-shadow:0 6px 16px -8px rgba(11,15,19,.5)}
.cn-role-primary{background:#0F80C3;color:#fff}
.cn-role-supporting{background:rgba(15,128,195,.1);color:#0A4F7A}
.cn-role-combination{background:#FFF1DB;color:#8A5A12}
.cn-role-bio{background:#352862;color:#fff}
.cn-card{transition:transform .5s var(--e-out),box-shadow .5s var(--e-out)}
.cn-card:hover{transform:translateY(-3px);box-shadow:0 30px 50px -34px rgba(15,60,95,.4)}
.cn-bio{isolation:isolate;background:linear-gradient(135deg,#1B1740 0%,#352862 55%,#4A3A8C 100%)}
.cn-bio::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(60% 70% at 100% 0%,rgba(201,194,244,.28),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(38,177,231,.18),transparent 60%)}
.cn-table{width:100%;border-collapse:separate;border-spacing:0}
.cn-table th,.cn-table td{padding:14px 14px;vertical-align:top;text-align:left;border-bottom:1px solid rgba(27,36,43,.08);font-size:14px;line-height:1.5}
.cn-table th{font:600 11.5px/1.3 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#5A646C;background:#F2F2EF;position:sticky;top:0}
.cn-table th:first-child,.cn-table td:first-child{position:sticky;left:0;background:#fff;z-index:1;min-width:180px}
.cn-table th:first-child{background:#F2F2EF}
.cn-table tr:last-child td{border-bottom:0}
.cn-table td:first-child{font-family:Fraunces,Georgia,serif;font-size:17px;line-height:1.2;letter-spacing:-.01em;color:#1B242B}
.cn-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
.cn-rx{background:#FFF6EA;border:1px solid rgba(255,166,23,.3)}
`;

/* ---------------------------------------------------------------- header: the live photo of the lead treatment, the concern's name and the form */
function ConcernHero({ p }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  const small = useMedia('(max-width: 767px)');
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    const h = img.parentElement.offsetHeight;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.2, h * 0.1).toFixed(1)}px,0)`;
  }, []);
  const [lead, strong] = p.h1;
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="proc-title" className="relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <img ref={pic} src={small && p.hero.m ? p.hero.m : p.hero.d} alt="" fetchpriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: p.hero.pos || '50% 30%' }} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.74) 0%,rgba(11,15,19,.42) 50%,rgba(11,15,19,.2) 100%),linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,0) 30%,rgba(11,15,19,.35) 100%)' }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,.25) 30%,rgba(11,15,19,.6) 62%,rgba(11,15,19,.88) 100%)' }} />
      <div className="grid items-end gap-10 px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)] pt-[184px] sm:pt-[170px] lg:min-h-[min(100svh,920px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[680px]">
          <p className="rv font-inter text-[12px] font-medium uppercase tracking-[.28em] text-white/70">Concern · {p.group}</p>
          <h1 id="proc-title" className="rv mt-4 font-aeonik text-[clamp(42px,5.4vw,84px)] font-normal leading-[1.06] tracking-[-0.035em] text-white">
            {lead ? <>{lead}<br /></> : null}<span className="tt-strong text-ndm-sky">{strong}</span>
          </h1>
          <p className="rv mt-5 max-w-[52ch] font-inter text-[clamp(16px,1.25vw,18px)] leading-[1.6] text-white/85" style={{ transitionDelay: '.08s' }}>{p.sub}</p>
        </div>
        <ProcForm id="hero-form" className="rv hidden lg:block" />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the opening: the concern in plain words, the pages on our site that cover it */
function CnIntro({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pt-[clamp(40px,5vw,72px)] pb-[clamp(24px,3vw,40px)]">
      <div className={`${TX_WRAP} grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] lg:gap-[clamp(40px,5vw,80px)]`}>
        <div>
          <h2 id="about-title" className="sr-only">About this concern</h2>
          {p.lede.map((x, i) => <p key={i} className="rv max-w-[62ch] font-inter text-[clamp(17px,1.35vw,20px)] leading-[1.7] text-ndm-ink/90 [&+p]:mt-5" style={{ transitionDelay: `${0.04 * i}s` }}>{x}</p>)}
        </div>
        <aside className="rv self-start rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] shadow-[0_18px_40px_-34px_rgba(27,36,43,.35)] md:p-6" style={{ transitionDelay: '.1s' }}>
          <p className="font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">In short</p>
          <p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-ink/85">{p.short} at NewDermaMed Toronto: {p.facts[0][1].replace(' to compare', '')} treatment options{/^From/.test(p.facts[3][1]) ? `, ${p.facts[3][1].replace('From', 'from')}` : ''}, chosen at a free consultation with a VISIA® skin analysis. Uptown and Downtown clinics.</p>
          <p className="mt-5 font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">On our site</p>
          <ul className="mt-3 grid gap-1.5" role="list">
            {p.pages.map((x) => (
              <li key={x.file}><a href={x.file} className="group flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 font-inter text-[15px] text-ndm-ink transition-colors hover:bg-ndm-mist"><span>{x.n}</span><IconArrow size={12} className="shrink-0 text-ndm-deep transition-transform group-hover:translate-x-0.5" /></a></li>
            ))}
            {p.ba && <li><a href="before-after.html" className="group flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 font-inter text-[15px] text-ndm-ink transition-colors hover:bg-ndm-mist"><span>Before &amp; after gallery</span><IconArrow size={12} className="shrink-0 text-ndm-deep transition-transform group-hover:translate-x-0.5" /></a></li>}
          </ul>
          <div className="mt-4 border-t border-ndm-line pt-4"><Btn href="#/book" v="book" hot block>Book Free Consultation</Btn></div>
        </aside>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- what you may notice, and why it happens */
function CnUnderstand({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="understand" aria-labelledby="understand-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(48px,5.5vw,88px)]">
      <TxHead p={p} id="understand" tag="The concern" hid="understand-title" lead="What you may notice," strong="and why it happens" />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid gap-4 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-6`}>
        <div className="rv rounded-[24px] bg-[#EEF7FC] p-6 ring-1 ring-ndm-blue/20 md:p-7">
          <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink"><span aria-hidden="true" className="h-5 w-1 rounded-full bg-ndm-deep" />You may notice</p>
          <ul className="mt-4 grid gap-3" role="list">
            {p.notice.map((x) => (
              <li key={x} className="flex items-start gap-3 font-inter text-[15.5px] leading-[1.55] text-ndm-ink">
                <span aria-hidden="true" className="mt-[2px] grid size-6 shrink-0 place-items-center rounded-full bg-ndm-deep text-white"><IconTick size={11} /></span>{x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8" style={{ transitionDelay: '.08s' }}>
          <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink"><span aria-hidden="true" className="h-5 w-1 rounded-full bg-[#FFA617]" />Why it happens</p>
          {p.cause.map((x, i) => <p key={i} className="mt-4 font-inter text-[16px] leading-[1.7] text-ndm-ink/85">{x}</p>)}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- how we assess it: the free consultation and skin analysis */
function CnAssess({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const a = p.assess;
  return (
    <section ref={ref} id="assess" aria-labelledby="assess-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <TxHead p={p} id="assess" tag="Your consultation" hid="assess-title" lead="How we assess" strong={p.short} />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(32px,4vw,64px)]`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8">
          <p className="font-inter text-[16px] leading-[1.7] text-ndm-ink/85">{a.text}</p>
          <p className="mt-6 font-inter text-[12.5px] font-semibold uppercase tracking-[.14em] text-ndm-deep">What we look at</p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2" role="list">
            {a.points.map((x) => <li key={x} className="flex items-start gap-2.5 font-inter text-[15px] leading-[1.55] text-ndm-ink/85"><span aria-hidden="true" className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconTick size={10} /></span>{x}</li>)}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
            <a href="visia-skin-analysis.html" className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">About the VISIA® skin analysis<IconArrow className="transition-transform group-hover:translate-x-1" /></a>
          </div>
        </div>
        <div className="rv peach relative min-h-[300px] overflow-hidden rounded-[24px] bg-ndm-line lg:min-h-[420px]" style={{ transitionDelay: '.1s' }}>
          <img src="assets/home/v3/visia-1440.webp" srcSet="assets/home/v3/visia-720.webp 720w, assets/home/v3/visia-1440.webp 1440w" sizes="(min-width: 1024px) 40vw, 100vw" alt="A NewDermaMed provider reviewing VISIA skin analysis results with a patient" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '28% 60%' }} />
          <span className="absolute bottom-3 left-3 rounded-[14px] bg-white/95 px-4 py-2.5 font-inter text-[13.5px] text-ndm-ink shadow-[0_18px_40px_-20px_rgba(27,36,43,.55)] backdrop-blur-[8px] sm:bottom-4 sm:left-4">Free VISIA® skin analysis with every consultation</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the options: one card per treatment, the bio-stimulator group, the prescription note */
const cnRole = (r) => `cn-role cn-role-${r.toLowerCase()}`;
function CnOptionCard({ o, i, dark }) {
  return (
    <li className="rv" style={{ transitionDelay: `${0.05 * (i % 6)}s` }}>
      <article className={`cn-card group flex h-full flex-col overflow-hidden rounded-[22px] ${dark ? 'bg-white/[.08] text-white ring-1 ring-white/15 backdrop-blur-[6px]' : 'bg-white ring-1 ring-ndm-ink/[.06]'}`}>
        {o.img && (
          <a href={o.file} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/9] overflow-hidden bg-ndm-mist">
            <img src={o.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]" style={{ objectPosition: '50% 30%' }} />
            <span className={`absolute left-3 top-3 ${cnRole(o.role)}`}>{o.role}</span>
          </a>
        )}
        <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          {!o.img && <span className={cnRole(o.role)}>{o.role}</span>}
          <span className={`font-inter text-[13px] ${dark ? 'text-white/70' : 'text-ndm-muted'}`}>{o.price[0]}</span>
        </div>
        <h3 className={`mt-4 font-aeonik text-[clamp(21px,1.8vw,25px)] font-normal leading-[1.15] tracking-[-0.02em] ${dark ? 'text-white' : 'text-ndm-ink'}`}>{o.n}</h3>
        <p className={`mt-2 font-inter text-[15px] font-medium leading-[1.5] ${dark ? 'text-[#C9C2F4]' : 'text-ndm-deep'}`}>{o.fit}</p>
        <p className={`mt-2 flex-1 font-inter text-[14.5px] leading-[1.6] ${dark ? 'text-white/80' : 'text-ndm-ink/75'}`}>{o.line}</p>
        <div className={`mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 ${dark ? 'border-white/15' : 'border-ndm-line'}`}>
          <a href={o.file} className={`group inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold ${dark ? 'text-white' : 'text-ndm-deep'}`}>About this treatment<IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" /></a>
          {o.price[1] && o.price[1] !== o.file && <a href={o.price[1]} className={`font-inter text-[14px] underline-offset-4 hover:underline ${dark ? 'text-white/75' : 'text-ndm-muted'}`}>See prices</a>}
        </div>
        </div>
      </article>
    </li>
  );
}
function CnOptions({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const n = p.opts.length + (p.bio ? p.bio.length : 0);
  return (
    <section ref={ref} id="options" aria-labelledby="options-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="options" tag="Treatment options" hid="options-title" lead="Treatments that" strong="may help" text={`${n} options we offer for ${p.short.toLowerCase()}, with the role each one usually plays. Your provider recommends one or a combination at your free consultation.`} />
      <ul role="list" className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {p.opts.map((o, i) => <CnOptionCard key={o.key} o={o} i={i} />)}
      </ul>
      {p.bio && (
        <div className={`${TX_WRAP} cn-bio relative mt-6 overflow-hidden rounded-[26px] p-6 text-white md:p-8`}>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-inter text-[13px] font-medium">Bio-stimulators</p>
              <h3 className="mt-4 font-aeonik text-[clamp(26px,2.6vw,38px)] font-normal leading-[1.1] tracking-[-0.025em]">Collagen support<br /><span className="tt-strong text-[#C9C2F4]">that builds over time</span></h3>
              <p className="mt-3 max-w-[58ch] font-inter text-[15.5px] leading-[1.65] text-white/85">Aptos threads, Sculptra® and Radiesse® all prompt your own collagen, so the change develops over months and tends to last longer. The Aptos Thread Lift gives a lift right away and is also a long-lasting bio-stimulator.</p>
            </div>
            <a href="pricing.html#pg-skin-booster-and-bio-stimulators-h" className="group inline-flex items-center gap-2 font-inter text-[14px] font-semibold text-white">Bio-stimulator prices<IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" /></a>
          </div>
          <ul role="list" className="mt-6 grid gap-4 md:grid-cols-3">
            {p.bio.map((o, i) => <CnOptionCard key={o.key} o={o} i={i} dark />)}
          </ul>
        </div>
      )}
      {p.rx && (
        <div className={`${TX_WRAP} cn-rx rv mt-6 flex flex-col gap-4 rounded-[22px] p-5 md:flex-row md:items-center md:justify-between md:p-6`}>
          <p className="flex items-start gap-3 font-inter text-[15px] leading-[1.6] text-ndm-ink/85"><span aria-hidden="true" className="mt-[2px] grid size-6 shrink-0 place-items-center rounded-full bg-[#FFE7C2] text-[#8A5A12]"><IconInfoSm size={13} /></span><span>{p.rx.text}</span></p>
          <ul className="flex shrink-0 flex-wrap gap-2" role="list">
            {p.rx.links.map((l) => <li key={l.file}><a href={l.file} className="inline-flex rounded-full bg-white px-3.5 py-2 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep">{l.n}</a></li>)}
          </ul>
        </div>
      )}
      <div className={`${TX_WRAP} mt-8 flex flex-wrap justify-center gap-3`}>
        <Btn href="#/book" v="book">Book Free Consultation</Btn>
        <Btn href="pricing.html#prices" v="line">All treatment prices</Btn>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- side by side: how each option works, the visit, the course, downtime, when changes may appear, the starting price */
const CN_COLS = [['how', 'How it works'], ['visit', 'Typical visit'], ['course', 'Typical course'], ['down', 'Downtime'], ['res', 'Changes may appear'], ['from', 'From']];
function CnCompare({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const rows = p.compare;
  if (!rows.length) return null;
  return (
    <section ref={ref} id="compare" aria-labelledby="compare-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="compare" tag="Side by side" hid="compare-title" lead="Compare" strong="the options" text="Typical figures from each treatment page. Your plan, timing and final price are confirmed at your free consultation. Individual results may vary." />
      <div className={`${TX_WRAP} rv mt-[clamp(28px,3.4vw,44px)] hidden overflow-hidden rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] md:block`}>
        <div className="cn-scroll">
          <table className="cn-table">
            <thead><tr><th scope="col">Treatment</th>{CN_COLS.map(([k, l]) => <th key={k} scope="col">{l}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td><a href={r.file} className="hover:text-ndm-deep">{r.n}</a></td>
                  {CN_COLS.map(([k]) => <td key={k} className="font-inter text-ndm-ink/80">{k === 'from' ? <a href={r.price[1]} className="whitespace-nowrap font-semibold text-ndm-ink underline-offset-4 hover:underline">{r.price[0]}</a> : (r[k] || 'Discussed at your consultation')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ul role="list" className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-3 md:hidden`}>
        {rows.map((r, i) => (
          <li key={r.key} className="rv rounded-[20px] bg-white p-5 ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.04 * i}s` }}>
            <div className="flex items-baseline justify-between gap-3"><a href={r.file} className="font-aeonik text-[20px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">{r.n}</a><a href={r.price[1]} className="shrink-0 font-inter text-[13.5px] font-semibold text-ndm-ink">{r.price[0]}</a></div>
            <dl className="mt-3 grid gap-2">
              {CN_COLS.filter(([k]) => k !== 'from').map(([k, l]) => <div key={k} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 border-t border-ndm-line pt-2 font-inter"><dt className="text-[12px] leading-[1.4] text-ndm-muted">{l}</dt><dd className="text-[13.5px] leading-[1.5] text-ndm-ink/85">{r[k] || 'Discussed at your consultation'}</dd></div>)}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- skincare at home: the shop categories that match this concern */
function CnHome({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="home-care" aria-labelledby="home-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <TxHead p={p} id="home-care" tag="Between visits" hid="home-title" lead="Skincare" strong="at home" text="Medical-grade skincare from our shop supports your treatment between visits. Your provider suggests a routine at your consultation." />
      <ul role="list" className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {p.home.map((h, i) => (
          <li key={h.t} className="rv" style={{ transitionDelay: `${0.05 * i}s` }}>
            {h.href ? (
              <a href={h.href} className="cn-card group flex h-full flex-col rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] md:p-6">
                <span className="font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-deep">{h.cat}</span>
                <span className="mt-3 block font-aeonik text-[22px] leading-[1.15] tracking-[-0.01em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{h.t}</span>
                <span className="mt-2 block flex-1 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/75">{h.text}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep">Shop {h.cat.toLowerCase()}<IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
              </a>
            ) : (
              <div className="flex h-full flex-col rounded-[22px] bg-white/70 p-5 ring-1 ring-ndm-ink/[.06] md:p-6">
                <span className="font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">{h.cat}</span>
                <span className="mt-3 block font-aeonik text-[22px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">{h.t}</span>
                <span className="mt-2 block flex-1 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/75">{h.text}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-muted">Advice at your visit</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className={`${TX_WRAP} mt-8 flex justify-center`}><Btn href="shop.html" v="line">Visit the skincare shop</Btn></div>
    </section>
  );
}

/* ---------------------------------------------------------------- articles from our journal about this concern */
function CnArticles({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  if (!p.articles.length) return null;
  return (
    <section ref={ref} id="read" aria-labelledby="read-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <div className={`${TX_WRAP} flex flex-wrap items-end justify-between gap-x-10 gap-y-6`}>
        <div>
          <Eyebrow className="rv">From the journal</Eyebrow>
          <TwoTone id="read-title" className="rv mt-4" size="text-[clamp(32px,3.4vw,50px)]" lead={<>Read more about<br /></>} strong={p.short.toLowerCase()} style={{ transitionDelay: '.05s' }} />
        </div>
        <div className="rv" style={{ transitionDelay: '.12s' }}><Btn href="blog.html" v="line">All articles</Btn></div>
      </div>
      <ul role="list" className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {p.articles.map((a, i) => (
          <li key={a.file} className="rv" style={{ transitionDelay: `${0.05 * i}s` }}>
            <a href={a.file} className="cn-card group flex h-full flex-col rounded-[22px] bg-white p-2.5 ring-1 ring-ndm-ink/[.06]">
              <span className="peach relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist"><img src={a.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" /></span>
              <span className="flex flex-1 flex-col px-2.5 pb-2.5 pt-4">
                <span className="font-inter text-[12.5px] text-ndm-muted">{a.topic} · {a.d}</span>
                <span className="mt-1.5 block font-aeonik text-[clamp(19px,1.6vw,22px)] leading-[1.2] tracking-[-0.015em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{a.t}</span>
                <span className="mt-2 block flex-1 font-inter text-[14px] leading-[1.55] text-ndm-ink/75">{a.ex}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- related concerns and the way back to the hub */
function CnRelated({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="related" aria-labelledby="related-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pb-[clamp(48px,5vw,80px)]">
      <div className={`${TX_WRAP} rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="related-title" className="font-aeonik text-[clamp(22px,2vw,28px)] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink">Related concerns</h2>
          <a href="concerns.html" className="group inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep">All concerns<IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" /></a>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" role="list">
          {p.rel.map((r) => <li key={r.file}><a href={r.file} className="inline-flex items-center gap-2 rounded-full bg-ndm-paper px-4 py-2 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/[.08] transition-colors hover:border-ndm-blue hover:text-ndm-deep hover:ring-ndm-deep">{r.n}<IconArrow size={11} className="text-ndm-deep" /></a></li>)}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the hub (concerns.html): every concern by group */
function HubHero({ h }) {
  const ref = useRef(null), vid = useRef(null);
  useReveal(ref);
  useClipInView(ref, vid);
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="hub-title" className="tx-film relative isolate overflow-hidden px-[var(--gx)] pb-[clamp(48px,6vw,88px)] pt-[clamp(160px,15vw,220px)] text-white">
      <video ref={vid} muted loop playsInline preload="none" poster={h.film.poster} aria-hidden="true" tabIndex={-1}>
        <source src={h.film.src_m} type="video/mp4" media="(max-width: 767px)" />
        <source src={h.film.src} type="video/mp4" />
      </video>
      <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.6) 0%,rgba(11,15,19,.35) 40%,rgba(11,15,19,.78) 100%)' }} />
      <div className="relative mx-auto max-w-[900px] text-center">
        <Eyebrow dark className="rv">Concerns</Eyebrow>
        <TwoTone as="h1" id="hub-title" dark className="rv mx-auto mt-5" size="text-[clamp(40px,5.2vw,78px)]" lead={<>Start from what<br /></>} strong="you notice" style={{ transitionDelay: '.06s' }} />
        <p className="rv mx-auto mt-5 max-w-[58ch] font-inter text-[clamp(16px,1.25vw,18px)] leading-[1.65] text-white/85" style={{ transitionDelay: '.1s' }}>{h.sub}</p>
        <ul className="rv mt-8 flex flex-wrap justify-center gap-2" role="list" aria-label="Jump to an area" style={{ transitionDelay: '.14s' }}>
          {h.groups.map((g) => <li key={g.id}><a href={`#${g.id}`} className="tx-film-chip inline-flex items-center gap-2 rounded-full px-4 py-2 font-inter text-[14px] text-white transition-colors hover:bg-white hover:text-ndm-ink">{g.title}<span className="font-inter text-[12px] text-white/60">{g.items.length}</span></a></li>)}
        </ul>
        <div className="rv mt-7 flex flex-wrap justify-center gap-3" style={{ transitionDelay: '.18s' }}><Btn href="#/book" v="book" hot>Book Free Consultation</Btn><Btn href="visia-skin-analysis.html" v="glass">Free VISIA® skin analysis</Btn></div>
      </div>
    </section>
  );
}
function HubGroups({ h }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} aria-label="Concerns by area" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
      {h.groups.map((g, gi) => (
        <div key={g.title} id={g.id} className={`${TX_WRAP} scroll-mt-[150px] ${gi ? 'mt-[clamp(40px,5vw,72px)]' : 'mt-[clamp(24px,3vw,40px)]'}`}>
          <div className="flex items-baseline justify-between gap-4 border-b border-ndm-ink/10 pb-4">
            <h2 className="rv font-aeonik text-[clamp(26px,2.6vw,36px)] font-normal leading-[1.1] tracking-[-0.025em] text-ndm-ink">{g.title}</h2>
            <span className="rv font-inter text-[13px] text-ndm-muted">{g.items.length} concerns</span>
          </div>
          <ul role="list" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((c, i) => (
              <li key={c.file} className="rv" style={{ transitionDelay: `${0.05 * (i % 3)}s` }}>
                <a href={c.file} className="cn-card group flex h-full flex-col rounded-[22px] bg-white p-2.5 ring-1 ring-ndm-ink/[.06]">
                  <span className="peach relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist"><img src={c.img} alt="" loading={gi ? 'lazy' : 'eager'} decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" style={{ objectPosition: c.pos || '50% 30%' }} /></span>
                  <span className="flex flex-1 items-start justify-between gap-3 px-2.5 pb-2.5 pt-4">
                    <span className="min-w-0">
                      <span className="block font-aeonik text-[clamp(20px,1.7vw,23px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.n}</span>
                      <span className="mt-1.5 block font-inter text-[14px] leading-[1.5] text-ndm-ink/70">{c.sub}</span>
                      <span className="mt-2.5 block font-inter text-[12.5px] text-ndm-muted">{c.count} treatment options</span>
                    </span>
                    <span aria-hidden="true" className="grid size-10 shrink-0 self-end place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep transition-colors group-hover:bg-ndm-deep group-hover:text-white"><IconArrow /></span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
