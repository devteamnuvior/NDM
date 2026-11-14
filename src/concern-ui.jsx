/* ---------------------------------------------------------------- concern page (wrinkles-fine-lines.html), round 20. Structure and
   copy from Ray's concern page (ray/V1/NDM/concern-wrinkles-fine-lines.html, components from his concern-ui.jsx), set in this
   site's treatment-page look: the Botox header and form, glance card, section bar, Before & after photo cases and spacing.
   His clinic film in the middle of the page is left out. Data: src/concern-data.json (const CN, added by build_concern.py) */
const CN_CSS = `
.cn-role{font:600 11px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:7px 10px;border-radius:999px;box-shadow:0 6px 16px -8px rgba(11,15,19,.5)}
.cn-role-primary{background:#0F80C3;color:#fff}
.cn-role-supporting{background:rgba(15,128,195,.1);color:#0A4F7A}
.cn-role-combination{background:#FFF1DB;color:#8A5A12}
/* round 24: home care cards */
.cn-hc{background:linear-gradient(180deg,#FAFAF8 0%,#F1F6F9 45%,#FAFAF8 100%)}
.cn-hc-field.cn-hc-blue{background:linear-gradient(160deg,#EAF4FA,#D5E9F5)}
.cn-hc-field.cn-hc-peach{background:linear-gradient(160deg,#FBF1E6,#F4DFC8)}
.cn-hc-field.cn-hc-mist{background:linear-gradient(160deg,#F4F3EF,#E7E4DC)}
.cn-hc-orb{position:absolute;left:50%;top:54%;width:62%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,0) 70%)}
.cn-hc-img{filter:drop-shadow(0 26px 30px rgba(27,36,43,.22));transition:transform 1s cubic-bezier(.2,.7,.2,1)}
.cn-hc-card:hover .cn-hc-img{transform:translateY(-8px) rotate(-2deg)}
.cn-hc-sun{background:rgba(255,255,255,.75);color:#C98A2B;box-shadow:0 20px 40px -24px rgba(201,138,43,.6)}
.cn-hc-card{transition:box-shadow .5s ease}
.cn-hc-card:hover{box-shadow:0 34px 60px -40px rgba(15,60,95,.45)}
@media (prefers-reduced-motion:reduce){.cn-hc-img,.cn-hc-card{transition:none}}
.cn-role-bio,.cn-role-bio-stimulator{background:#0A4F7A;color:#fff}
/* round 22: tags on photos are the site's white glass pill with a colour dot for the role */
.cn-ptag{display:inline-flex;align-items:center;gap:7px;border-radius:999px;background:rgba(255,255,255,.88);padding:6px 12px 6px 10px;font:500 12px/1.2 Inter,"Helvetica Neue",Arial,sans-serif;color:#1B242B;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.cn-ptag i{width:7px;height:7px;border-radius:99px;background:#0F80C3}
.cn-ptag-supporting i{background:#26B1E7}.cn-ptag-combination i{background:#FFA617}.cn-ptag-bio-stimulator i{background:#0A4F7A}
.cn-card{transition:transform .5s var(--e-out),box-shadow .5s var(--e-out)}
.cn-card:hover{transform:translateY(-3px);box-shadow:0 30px 50px -34px rgba(15,60,95,.4)}
.cn-bio{isolation:isolate;background:linear-gradient(135deg,#EAF5FB 0%,#F4F9FC 55%,#FBF3EC 100%);box-shadow:0 0 0 1px rgba(15,128,195,.14)} /* NDM blue to warm paper, no purple (round 21) */
.cn-bio::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(55% 70% at 100% 0%,rgba(38,177,231,.16),transparent 60%),radial-gradient(45% 60% at 0% 100%,rgba(255,190,160,.18),transparent 60%)}
.cn-table{width:100%;border-collapse:separate;border-spacing:0;min-width:720px}
.cn-table th,.cn-table td{padding:13px 16px;vertical-align:top;text-align:left;border-bottom:1px solid rgba(27,36,43,.07);font-size:13.5px;line-height:1.5;color:rgba(27,36,43,.82)}
.cn-table th{font:600 11px/1.3 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#5A646C;background:#F6F6F3;position:sticky;top:0;z-index:2;white-space:nowrap}
.cn-table th .cn-th{display:inline-flex;align-items:center;gap:6px}
.cn-table th .cn-th svg{color:#0F80C3}
.cn-table th:first-child,.cn-table td:first-child{position:sticky;left:0;background:#fff;z-index:1;min-width:214px}
.cn-table th:first-child{background:#F6F6F3;z-index:3}
.cn-table tr:last-child td{border-bottom:0}
.cn-table tbody tr{transition:background-color .15s ease}
.cn-table tbody tr:hover td{background:rgba(32,158,217,.05)}
.cn-table tbody tr:hover td:first-child{background:#fbfcfd}
.cn-name{display:flex;align-items:center;gap:11px;color:#1B242B}
.cn-name:hover{color:#0F80C3}
.cn-name .cn-nm{font-family:Fraunces,Georgia,serif;font-size:16.5px;line-height:1.18;letter-spacing:-.01em}
.cn-thumb{width:42px;height:42px;border-radius:11px;object-fit:cover;flex:none;box-shadow:inset 0 0 0 1px rgba(27,36,43,.06)}
.cn-sub{display:block;margin-top:3px;font:400 11.5px/1.35 Inter,sans-serif;letter-spacing:0;text-transform:none;color:#5A646C}
.cn-from{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap;border-radius:999px;background:rgba(32,158,217,.1);color:#0F80C3;font:600 13.5px/1 Inter,sans-serif;padding:7px 12px;transition:background-color .15s ease}
.cn-from:hover{background:rgba(32,158,217,.16)}
.cn-from .cn-fl{font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.72}
.cn-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
.cn-hint{align-items:center;gap:6px;justify-content:center;margin-top:10px;font:500 12px/1 Inter,sans-serif;color:#5A646C}
.cn-m summary{list-style:none}
.cn-m summary::-webkit-details-marker{display:none}
.cn-m[open] .cn-chev{transform:rotate(180deg)}
.cn-m[open]{box-shadow:0 22px 44px -36px rgba(27,36,43,.45)}
.cn-rx{background:#FFF6EA;border:1px solid rgba(255,166,23,.3)}
`;


/* ---------------------------------------------------------------- the opening: the concern in plain words, the pages on our site that cover it */
function CnIntro({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pt-[clamp(40px,5vw,72px)] pb-[clamp(24px,3vw,40px)]">
      <div className={`${TX_WRAP} grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] lg:gap-[clamp(40px,5vw,80px)]`}>
        <div>
          <Eyebrow className="rv mb-6">{txNum(p, 'about') && <span className="tabular-nums text-ndm-deep">{txNum(p, 'about')}</span>}Overview</Eyebrow>
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
            <a href="#/visia-skin-analysis" className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">About the VISIA® skin analysis<IconArrow className="transition-transform group-hover:translate-x-1" /></a>
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
            <span className={`cn-ptag cn-ptag-${o.role.toLowerCase()} absolute left-3 top-3`}><i aria-hidden="true" />{o.role}</span>
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
        <div className={`${TX_WRAP} cn-bio relative mt-6 overflow-hidden rounded-[26px] p-6 text-ndm-ink md:p-8`}>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-ndm-deep/20 bg-white px-3.5 py-1.5 font-inter text-[13px] font-medium text-ndm-deep">Bio-stimulators</p>
              <h3 className="mt-4 font-aeonik text-[clamp(26px,2.6vw,38px)] font-normal leading-[1.1] tracking-[-0.025em]">Collagen support<br /><span className="tt-strong text-ndm-deep">that builds over time</span></h3>
              <p className="mt-3 max-w-[58ch] font-inter text-[15.5px] leading-[1.65] text-ndm-ink/80">Aptos threads, Sculptra® and Radiesse® all prompt your own collagen, so the change develops over months and tends to last longer. The Aptos Thread Lift gives a lift right away and is also a long-lasting bio-stimulator.</p>
            </div>
            <a href="pricing.html#pg-skin-booster-and-bio-stimulators-h" className="group inline-flex items-center gap-2 font-inter text-[14px] font-semibold text-ndm-deep">Bio-stimulator prices<IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" /></a>
          </div>
          <ul role="list" className="mt-6 grid gap-4 md:grid-cols-3">
            {p.bio.map((o, i) => <CnOptionCard key={o.key} o={o} i={i} />)}
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

/* ---------------------------------------------------------------- side by side: one compact, scannable table so every option can be compared at a glance (icon headers, thumbnails, price pills) */
const CN_COLS = [['visit', 'Typical visit', 'clock'], ['course', 'Typical course', 'cal'], ['down', 'Downtime', 'leaf'], ['res', 'Changes may appear', 'star'], ['from', 'From', 'tag']];
function CnCompare({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const rows = p.compare;
  if (!rows.length) return null;
  const icon = { list: NAV_ICONS.list, clock: TX_ICONS.clock, cal: TX_ICONS.cal, leaf: TX_ICONS.leaf, star: NAV_ICONS.star, tag: NAV_ICONS.tag };
  return (
    <section ref={ref} id="compare" aria-labelledby="compare-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="compare" tag="Side by side" hid="compare-title" lead="Compare" strong="the options" text="Typical figures from each treatment page. Your plan, timing and final price are confirmed at your free consultation. Individual results may vary." />
      <div className={`${TX_WRAP} rv mt-[clamp(28px,3.4vw,44px)] hidden overflow-hidden rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-50px_rgba(27,36,43,.4)] md:block`}>
        <div className="cn-scroll">
          <table className="cn-table">
            <thead><tr>
              <th scope="col"><span className="cn-th">Treatment</span></th>
              {CN_COLS.map(([k, l, ic]) => <th key={k} scope="col"><span className="cn-th"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon[ic]}</svg>{l}</span></th>)}
            </tr></thead>
            <tbody>
              {rows.map((r) => {
                const isFrom = /^from/i.test(r.price[0]);
                return (
                <tr key={r.key}>
                  <td>
                    <a href={r.file} className="cn-name">
                      {r.img && <img src={r.img} alt="" loading="lazy" className="cn-thumb" />}
                      <span className="min-w-0"><span className="cn-nm">{r.n}</span>{r.role && <span className="cn-sub">{r.role}</span>}</span>
                    </a>
                  </td>
                  {CN_COLS.map(([k]) => (
                    <td key={k}>
                      {k === 'from'
                        ? <a href={r.price[1]} className="cn-from">{isFrom && <span className="cn-fl">From</span>}{isFrom ? r.price[0].replace(/^from\s*/i, '') : r.price[0]}</a>
                        : (r[k] || 'At your consultation')}
                    </td>
                  ))}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* mobile: an expandable list, so every option is visible at a glance and taps open the detail (no sideways scrolling) */}
      <ul role="list" className={`${TX_WRAP} rv mt-[clamp(28px,3.4vw,44px)] grid gap-2.5 md:hidden`}>
        {rows.map((r) => {
          const isFrom = /^from/i.test(r.price[0]);
          return (
          <li key={r.key}>
            <details className="cn-m overflow-hidden rounded-[18px] bg-white ring-1 ring-ndm-ink/[.06]">
              <summary className="flex cursor-pointer items-center gap-3 p-4">
                {r.img && <img src={r.img} alt="" loading="lazy" className="size-11 shrink-0 rounded-[12px] object-cover ring-1 ring-ndm-ink/[.06]" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-aeonik text-[16.5px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">{r.n}</span>
                  <a href={r.price[1]} onClick={(e) => e.stopPropagation()} className="cn-from mt-1.5">{isFrom && <span className="cn-fl">From</span>}{isFrom ? r.price[0].replace(/^from\s*/i, '') : r.price[0]}</a>
                </span>
                <svg aria-hidden="true" className="cn-chev shrink-0 text-ndm-muted transition-transform duration-200" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </summary>
              <div className="border-t border-ndm-line px-4 pb-4 pt-3">
                {r.role && <p className="font-inter text-[11px] font-semibold uppercase tracking-[.1em] text-ndm-deep">{r.role}</p>}
                <dl className="mt-2.5 grid grid-cols-2 gap-2.5">
                  {CN_COLS.filter(([k]) => k !== 'how' && k !== 'from').map(([k, l, ic]) => (
                    <div key={k} className="rounded-[13px] bg-ndm-paper p-3 ring-1 ring-ndm-ink/[.05]">
                      <dt className="flex items-center gap-1.5 font-inter text-[10px] font-semibold uppercase tracking-[.1em] text-ndm-muted"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ndm-deep">{icon[ic]}</svg><span className="min-w-0">{l}</span></dt>
                      <dd className="mt-1.5 font-inter text-[13px] leading-[1.45] text-ndm-ink/85">{r[k] || 'At your consultation'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          </li>
          );
        })}
      </ul>
      <p className="cn-hint hidden md:flex xl:hidden" aria-hidden="true"><IconArrow className="rotate-180 opacity-60" />Swipe to see every column<IconArrow className="opacity-60" /></p>
    </section>
  );
}

/* ---------------------------------------------------------------- skincare at home: the shop categories that match this concern */
/* round 24: home care, redesigned. Heading on the left, a short note and the shop on the right, then one card per need with the
   product photo from our shop on a soft colour field (sun protection stays advice at the visit, as we stock no SPF online) */
const CN_HOME_TINT = ['cn-hc-blue', 'cn-hc-peach', 'cn-hc-mist'];
function CnHome({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const n = txNum(p, 'home-care');
  return (
    <section ref={ref} id="home-care" aria-labelledby="home-title" className="cn-hc relative z-10 scroll-mt-[170px] overflow-hidden px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] lg:items-end`}>
        <div>
          <Eyebrow className="rv">{n && <span className="tabular-nums text-ndm-deep">{n}</span>}Home care</Eyebrow>
          <TwoTone id="home-title" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={<>Your skin,<br /></>} strong="between treatments" style={{ transitionDelay: '.06s' }} />
        </div>
        <div className="rv lg:pb-1" style={{ transitionDelay: '.1s' }}>
          <p className="max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted">Medical-grade skincare from our shop supports your treatment at home. Your provider suggests a routine for your skin at your consultation.</p>
          <div className="mt-5"><Btn href={SHOP_URL} target="_blank" rel="noopener" v="line" sm>Visit the skincare shop<span className="sr-only"> (opens in a new tab)</span></Btn></div>
        </div>
      </div>
      <ul role="list" className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 md:grid-cols-3`}>
        {p.home.map((h, i) => (
          <li key={h.t} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
            <article className="cn-hc-card group flex h-full flex-col overflow-hidden rounded-[26px] bg-white ring-1 ring-ndm-ink/[.06]">
              <div className={`cn-hc-field ${CN_HOME_TINT[i % 3]} relative grid aspect-[5/4] place-items-center overflow-hidden`}>
                <span aria-hidden="true" className="cn-hc-orb" />
                {h.product
                  ? <img src={SHOP_IMG + h.product.img} alt={`${h.product.n}, ${h.product.size}`} loading="lazy" decoding="async" className="cn-hc-img relative h-[78%] w-auto object-contain" />
                  : <span aria-hidden="true" className="cn-hc-sun relative grid size-[44%] place-items-center rounded-full"><svg viewBox="0 0 24 24" className="size-[46%]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg></span>}
                <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] font-medium text-ndm-ink backdrop-blur-[8px]">{String(i + 1).padStart(2, '0')} · {h.cat}</span>
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h3 className="font-aeonik text-[clamp(22px,1.9vw,26px)] font-normal leading-[1.15] tracking-[-0.015em] text-ndm-ink">{h.t}</h3>
                <p className="mt-2 flex-1 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/75">{h.text}</p>
                {h.product ? (
                  <a href={h.product.href} target="_blank" rel="noopener" className="mt-5 flex items-center justify-between gap-3 rounded-[14px] bg-ndm-paper px-4 py-3 transition-colors hover:bg-ndm-mist">
                    <span className="min-w-0"><span className="block font-inter text-[11.5px] uppercase tracking-[.14em] text-ndm-muted">In our shop</span><span className="mt-0.5 block truncate font-inter text-[14.5px] font-medium capitalize text-ndm-ink">{h.product.n} · {h.product.size}</span></span>
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ndm-deep text-white transition-transform duration-500 group-hover:-rotate-45"><IconArrow size={12} /></span>
                    <span className="sr-only"> (opens the shop in a new tab)</span>
                  </a>
                ) : <p className="mt-5 rounded-[14px] bg-ndm-paper px-4 py-3 font-inter text-[14px] font-medium text-ndm-muted">Ask us for a recommendation at your visit</p>}
              </div>
            </article>
          </li>
        ))}
      </ul>
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
/* round 24: related treatments as photo cards (the Botox page's Related row), each linking to the treatment's own page */
function CnRelated({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="related" aria-labelledby="related-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pb-[clamp(56px,6vw,96px)]">
      <nav aria-labelledby="related-title" className={TX_WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="related-title" className="rv font-aeonik text-[clamp(26px,2.4vw,36px)] font-normal leading-[1.1] tracking-[-0.02em] text-ndm-ink">Related <span className="tt-strong text-ndm-deep">treatments</span></h2>
          <a href={slug('Pricing')} className="rv group inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep">All treatments and prices<IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" /></a>
        </div>
        <ul className="no-scrollbar -mx-[var(--gx)] mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gx)] pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-6" role="list" style={{ scrollPaddingInline: 'var(--gx)' }}>
          {p.related_tx.map(([t, k, img, kind], i) => (
            <li key={t} className="rv w-[62%] shrink-0 snap-start sm:w-auto" style={{ transitionDelay: `${0.04 * i}s` }}>
              <a href={slug(k)} className="guide-rel group flex h-full flex-col rounded-[20px] bg-white p-2 ring-1 ring-ndm-ink/[.06] transition-shadow duration-500 hover:shadow-[0_24px_44px_-30px_rgba(11,15,19,.4)]">
                <span className="relative block aspect-square overflow-hidden rounded-[14px] bg-ndm-mist">
                  <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]" />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 font-inter text-[11.5px] font-medium text-ndm-ink backdrop-blur-[6px]">{kind}</span>
                </span>
                <span className="flex flex-1 items-center justify-between gap-2 px-1.5 pb-1 pt-3">
                  <span className="font-aeonik text-[17px] leading-[1.2] text-ndm-ink">{t}</span>
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep transition-transform duration-500 group-hover:-rotate-45"><IconArrow size={12} /></span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

