/* ---------------------------------------------------------------- treatment pages built from the live site's own words.
   Every page uses the same sections, in the Botox / Aptos page look: header photo, the quick facts, the benefits, the five
   treatment tabs, "Why choose", prices (when the price list has a matching category), Why NewDermaMed, the team, reviews,
   the free skin analysis band and the FAQ. The text in `p` comes word for word from newdermamedlaserclinic.com (src/live). */
const LIVE_CSS = `
.live-prose{font-family:Manrope,"Helvetica Neue",Arial,sans-serif}
.live-prose>p{margin:0 0 14px;font-size:16px;line-height:1.72;color:rgba(27,36,43,.84)}
.live-prose>*:last-child{margin-bottom:0}
.live-prose h2,.live-prose h3,.live-prose h4{margin:24px 0 10px;font-family:Fraunces,Georgia,serif;font-weight:400;font-size:clamp(21px,1.8vw,24px);line-height:1.2;letter-spacing:-.015em;color:#1B242B}
.live-prose>h2:first-child,.live-prose>h3:first-child{margin-top:0}
.live-prose ul,.live-prose ol{margin:0 0 16px;padding:0;list-style:none;display:grid;gap:9px}
.live-prose li{position:relative;padding-left:28px;font-size:15.5px;line-height:1.6;color:rgba(27,36,43,.84)}
.live-prose li::before{content:"";position:absolute;left:0;top:3px;width:18px;height:18px;border-radius:999px;background:rgba(32,158,217,.12) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='m3 7.3 2.6 2.6L11 4.5' fill='none' stroke='%230F80C3' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/10px no-repeat}
.live-prose ol{counter-reset:li}
.live-prose ol li::before{counter-increment:li;content:counter(li);background:rgba(32,158,217,.12);color:#0F80C3;font:600 11px/18px Manrope,sans-serif;text-align:center}
.live-prose a{color:#0F80C3;font-weight:600;text-decoration:underline;text-underline-offset:4px}
.live-prose strong,.live-prose b{font-weight:600;color:#1B242B}
.live-prose table{width:100%;border-collapse:collapse;font-size:14.5px}
.live-prose th,.live-prose td{padding:10px 12px;border-bottom:1px solid rgba(27,36,43,.1);text-align:left;vertical-align:top}
.live-tabs .ov-in{animation:ovIn .6s var(--e-out) both}
`;
/* the live page's own HTML (paragraphs, lists, headings, links) in the site's type */
function Html({ html, className = '' }) {
  return <div className={`live-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
/* one plain sentence from the page's own facts and price list, for the "In short" line (search engines and AI answers quote it) */
function liveSummary(p) {
  const f = Object.fromEntries(p.facts);
  const bits = [f['Treatment Type'] ? `${f['Treatment Type'].toLowerCase()} treatment` : null, f['Duration'] ? `about ${f['Duration'].replace(/^(\d)/, '$1')} per session` : null, f['Recovery Time'] ? f['Recovery Time'].toLowerCase() : null].filter(Boolean);
  const f2 = p.prices ? fromPrice({ unit: p.prices.unit }, p.prices.items.flatMap((it) => it[2])) : null;
  const price = f2 ? ` From ${money(f2.value)}${p.prices.unit ? ' per unit' : ''} on our price list.` : '';
  return `${p.h1} at NewDermaMed Toronto: ${bits.join(', ')}.${price} Free consultation with a VISIA® skin analysis at our Uptown and Downtown clinics.`;
}

/* the page title on two lines: the last word (or the part in brackets) in blue, the words themselves unchanged */
function liveTitle(h1) {
  const s = h1.trim();
  const b = s.indexOf('(');
  if (b > 0) return [s.slice(0, b).trim(), s.slice(b).trim()];
  const w = s.split(' ');
  if (w.length < 2) return ['', s];
  return [w.slice(0, -1).join(' '), w[w.length - 1]];
}

/* the hero offer bar: pulls the current promotion, how big it is and the cheapest price straight
   from this treatment's matching price list category, so it stays in step with the price list. */
function liveOffer(p) {
  if (!p.prices) return null;
  /* prefer the row that is this treatment (the Botox / Dysport section lists three), else the whole category */
  const name = (p.short || p.h1 || '').replace(/[®™]/g, '').trim().toLowerCase();
  const mine = name && p.prices.items.find((it) => it[0].replace(/[®™]/g, '').toLowerCase().includes(name));
  const opts = mine ? mine[2] : p.prices.items.flatMap((it) => it[2]);
  if (!opts.length) return null;
  const promo = bestOffer(opts);
  const m = /up to (\d+)% off/i.exec(promo);
  return { title: `${p.short || p.h1} packages`, from: fromPrice({ unit: p.prices.unit }, opts), promo, big: m ? ['Up to', m[1] + '%', 'off'] : (promo || null) };
}

/* ---------------------------------------------------------------- header: photo, the live page's title and subtitle, the form on the right */
function LiveHero({ p }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  const small = useMedia('(max-width: 767px)');
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    const h = img.parentElement.offsetHeight;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.2, h * 0.1).toFixed(1)}px,0)`;
  }, []);
  const [lead, strong] = liveTitle(p.h1);
  const off = liveOffer(p);
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="proc-title" className="relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <img ref={pic} src={small && p.hero.m ? p.hero.m : p.hero.d} alt="" fetchpriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: p.hero.pos || '50% 30%' }} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.74) 0%,rgba(11,15,19,.42) 50%,rgba(11,15,19,.2) 100%),linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,0) 30%,rgba(11,15,19,.35) 100%)' }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,.25) 30%,rgba(11,15,19,.6) 62%,rgba(11,15,19,.88) 100%)' }} />
      <div className="grid items-end gap-10 px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)] pt-[184px] sm:pt-[170px] lg:min-h-[min(100svh,920px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[680px]">
          <h1 id="proc-title" className="rv font-aeonik text-[clamp(42px,5.4vw,84px)] font-normal leading-[1.06] tracking-[-0.035em] text-white">
            {lead ? <>{lead}<br /></> : null}<span className="tt-strong text-ndm-sky">{strong}</span>
          </h1>
          <p className="rv mt-5 max-w-[52ch] font-inter text-[clamp(16px,1.25vw,18px)] leading-[1.6] text-white/85" style={{ transitionDelay: '.08s' }}>{p.sub}</p>
          {/* current offer, pulled live from the price list: promotion, how much off and the cheapest price; a light sweeps across it */}
          {off && <a href="#prices" aria-label={`${off.promo ? 'Current offer' : 'Pricing'}: ${off.title}${off.promo ? ', ' + off.promo : ''}, from ${money(off.from.value)}${off.from.unit}. See the prices`} className="rv offer-glass offer-shine group mt-7 inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 overflow-hidden rounded-[18px] py-3 pl-4 pr-3" style={{ transitionDelay: '.16s' }}>
            <span className="min-w-0">
              <span className="offer-pill inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-inter text-[11px] font-medium"><i className="offer-dot size-1.5 rounded-full bg-ndm-amber" />{off.promo ? 'Current offer' : 'Pricing'}</span>
              <span className="mt-1.5 block font-aeonik text-[17px] leading-[1.2] tracking-[-0.01em] text-white">{off.title}</span>
              <span className="mt-0.5 block font-inter text-[12.5px] leading-[1.3] text-white/70">From {money(off.from.value)}{off.from.unit}</span>
            </span>
            {off.big && <span className="offer-big flex items-baseline gap-1.5 whitespace-nowrap">
              {Array.isArray(off.big)
                ? <><span className="font-inter text-[11px] uppercase tracking-[.14em] text-white/70">{off.big[0]}</span><span className="font-aeonik text-[34px] leading-none tracking-[-0.03em] text-white">{off.big[1]}</span><span className="font-inter text-[11px] uppercase tracking-[.14em] text-[#FFC266]">{off.big[2]}</span></>
                : <span className="font-aeonik text-[20px] leading-[1.1] tracking-[-0.02em] text-white">{off.big}</span>}
            </span>}
            <span aria-hidden="true" className="ml-auto grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-ndm-ink"><IconArrow /></span>
          </a>}
        </div>
        <ProcForm id="hero-form" className="rv hidden lg:block" />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- benefits: the live page's five benefits beside its photo */
function LiveBenefits({ p, b, idx = 0 }) {
  const ref = useRef(null);
  useReveal(ref);
  const [lead, strong] = liveTitle(b.title);
  const id = idx ? `benefits-${idx}` : 'benefits';
  const pill = p.facts[(idx + 1) % p.facts.length] || null; /* one of the live quick facts floats on the photo */
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-title`} className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,88px)]">
      <TxHead p={p} id={id} tag={idx ? 'Good to know' : 'Benefits'} hid={`${id}-title`} lead={lead || strong} strong={lead ? strong : ''} />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid items-center gap-8 lg:gap-[clamp(40px,5vw,72px)] ${idx % 2 ? 'lg:grid-cols-[minmax(0,1.18fr)_minmax(0,.82fr)]' : 'lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]'}`}>
        <div className={`rv relative mx-auto w-full max-w-[460px] lg:max-w-none ${idx % 2 ? 'lg:order-2' : ''}`} style={{ transitionDelay: '.1s' }}>
          <div className="peach group relative aspect-[5/4] overflow-hidden rounded-[24px] bg-ndm-mist lg:aspect-auto lg:h-[min(62vh,560px)]">
            <img src={b.img} alt={b.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]" style={{ objectPosition: b.pos || '50% 40%' }} />
            {pill && <span className="tx-pill absolute bottom-4 left-4 flex items-center gap-3 rounded-full py-2 pl-2 pr-4"><i aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-ndm-sky to-ndm-deep text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{TX_ICONS[txIcon(pill[0])]}</svg></i><span className="min-w-0"><span className="block font-inter text-[11.5px] leading-[1.2] text-ndm-muted">{pill[0]}</span><span className="block font-inter text-[14px] font-semibold leading-[1.2] text-ndm-ink">{pill[1]}</span></span></span>}
          </div>
        </div>
        <ul className="grid gap-2.5" role="list">
          {b.items.map(([h, d], i) => (
            <li key={h + i} className="rv flex items-start gap-4 rounded-[18px] bg-white px-5 py-4 ring-1 ring-ndm-ink/[.06] shadow-[0_18px_40px_-34px_rgba(27,36,43,.35)]" style={{ transitionDelay: `${0.12 + i * 0.05}s` }}>
              <span aria-hidden="true" className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconTick size={14} /></span>
              <span className="min-w-0">
                <span className="block font-aeonik text-[20px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</span>
                {d && <span className="mt-1 block font-inter text-[15px] leading-[1.55] text-ndm-ink/75">{d}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the five treatment tabs (treatment overview, what to expect, how it works,
   maintenance, pricing): a tab row, the live text on the left, the quick facts on the right */
function LiveTabs({ p }) {
  const ref = useRef(null), tabs = useRef([]);
  useReveal(ref);
  const [act, setAct] = useState(0);
  const t = p.tabs[act];
  const key = (e, i) => {
    const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + p.tabs.length) % p.tabs.length;
    setAct(n); if (tabs.current[n]) tabs.current[n].focus();
  };
  return (
    <section ref={ref} id="overview" aria-labelledby="overview-title" className="live-tabs relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="overview" tag="Your treatment" hid="overview-title" lead="Everything about" strong={p.short || p.h1} />
      <div className={`${TX_WRAP} rv mt-[clamp(32px,4vw,52px)] overflow-hidden rounded-[28px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(27,36,43,.45)]`} style={{ transitionDelay: '.08s' }}>
        <div role="tablist" aria-label="About the treatment" className="no-scrollbar mx-[clamp(14px,2.2vw,28px)] mt-[clamp(14px,2.2vw,28px)] flex gap-1 overflow-x-auto rounded-full bg-ndm-mist p-1">
          {p.tabs.map((x, i) => (
            <button key={x.label} ref={(el) => (tabs.current[i] = el)} type="button" role="tab" id={`ov-t-${i}`} aria-controls="ov-panel" aria-selected={i === act} tabIndex={i === act ? 0 : -1}
              onClick={() => setAct(i)} onKeyDown={(e) => key(e, i)}
              className={`shrink-0 rounded-full px-4 py-2.5 font-inter text-[14px] font-medium transition-colors sm:flex-1 sm:px-5 ${i === act ? 'bg-white text-ndm-deep shadow-[0_6px_16px_-10px_rgba(27,36,43,.45)]' : 'text-ndm-muted hover:text-ndm-ink'}`}>
              {x.label}
            </button>
          ))}
        </div>
        <div id="ov-panel" role="tabpanel" aria-labelledby={`ov-t-${act}`} key={act} className="ov-in grid gap-7 p-[clamp(20px,2.8vw,40px)] md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:items-start md:gap-[clamp(28px,4vw,56px)]">
          <div>
            <h3 className="font-aeonik text-[clamp(26px,2.4vw,34px)] font-normal leading-[1.1] tracking-[-0.025em] text-ndm-ink">{t.label}</h3>
            <Html html={t.html} className="mt-4 max-w-[64ch]" />
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
              {t.label === 'Pricing' && <a href={p.prices ? '#prices' : 'pricing.html#prices'} className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">See the price list<IconArrow className="transition-transform group-hover:translate-x-1" /></a>}
            </div>
          </div>
          <aside className="ov-side flex flex-col rounded-[20px] p-5 ring-1 ring-ndm-ink/[.06]">
            <span className="font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">In short</span>
            <p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-ink/85">{liveSummary(p)}</p>
            <span className="mt-5 font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">At a glance</span>
            <dl className="mt-4 grid gap-3">
              {p.facts.map(([k, v]) => <div key={k} className="grid gap-0.5 border-t border-ndm-line pt-3 font-inter"><dt className="text-[12.5px] text-ndm-muted">{k}</dt><dd className="text-[16px] font-medium text-ndm-ink">{v}</dd></div>)}
            </dl>
            <div className="mt-5 grid gap-2">
              {CALLS.map(([n, num]) => <a key={n} href={tel(num)} className="btn btn-buy h-11 gap-2 px-3 text-[13.5px]"><IconPhone className="shrink-0" /><span className="truncate">{num} {n}</span></a>)}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- why choose this treatment: the live page's text on a white card beside its photo */
function LiveWhy({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const w = p.choose;
  const [lead, strong] = liveTitle(w.title.replace(/\?$/, ''));
  const q = /\?$/.test(w.title) ? '?' : '';
  return (
    <section ref={ref} id="why-choose" aria-labelledby="why-choose-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead p={p} id="why-choose" tag="Why choose this treatment" hid="why-choose-title" lead={lead || (strong + q)} strong={lead ? strong + q : ''} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:gap-6`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8"><Html html={w.html} /></div>
        <div className="rv peach group relative min-h-[320px] overflow-hidden rounded-[24px] bg-ndm-line lg:min-h-0" style={{ transitionDelay: '.1s' }}>
          <img src={w.img} alt={w.alt || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]" style={{ objectPosition: w.pos || '50% 35%' }} />
          <span className="tx-pill absolute bottom-4 left-4 flex items-center gap-3 rounded-[16px] py-2 pl-2 pr-4">
            <img src="assets/awards/top-choice-2026.png" alt="" className="size-10 object-contain" />
            <span><span className="block font-inter text-[13px] font-semibold text-ndm-ink">Top Choice Award</span><span className="block font-inter text-[12px] text-ndm-muted">8 consecutive years</span></span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- before and after pairs from the live page (the home page's compare cards) */
function LiveBA({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const b = p.before_after;
  return (
    <section ref={ref} id="results" aria-labelledby="results-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={TX_WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <Eyebrow className="rv">Before &amp; after</Eyebrow>
            <TwoTone id="results-title" className="rv mt-4" size="text-[clamp(32px,3.4vw,50px)]" lead={<>{b.lead}<br /></>} strong={b.strong} style={{ transitionDelay: '.05s' }} />
            {b.sub && <p className="rv mt-4 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>{b.sub}</p>}
          </div>
          <div className="rv" style={{ transitionDelay: '.12s' }}><Btn href={BA_ALL} target="_blank" rel="noopener" v="line">See all before &amp; after</Btn></div>
        </div>
        <ul role="list" className="mt-[clamp(32px,4vw,52px)] grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-x-4">
          {b.cases.map((c, i) => (
            <li key={c.id} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
              <figure className="m-0">
                <BaCompare c={c} i={i} nudge={i < 2} />
                <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"><span className="font-aeonik text-[18px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">Case {c.id}</span><span className="font-inter text-[13px] text-ndm-muted">{c.view}</span></figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-ndm-muted"><BaIconInfo className="mt-0.5 shrink-0" />Photos show individual cases and are shared for illustration only. Individual results may vary.</p>
      </div>
    </section>
  );
}
