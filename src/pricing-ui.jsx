const PRICE_TOTAL = PRICE_CATS.reduce((n, c) => n + c.items.length, 0);
const PRICE_FAQS = [
  ['How do I check the price of a treatment?', 'Open a category in the price list, then any treatment with the + button. Each one shows its sessions, packages and current offers.'],
  ['Are the prices the same at all locations?', 'Yes. The listed prices and promotions apply across all our clinic locations unless otherwise noted.'],
  ['Do promotions apply to pricing?', 'Yes. Current offers are already reflected in the prices shown, with the regular price struck through next to any reduced price.'],
  ['Are consultations included in the pricing?', 'Yes, consultations are free. This lets your provider assess your needs and tailor the treatment plan before confirming your final price.'],
  ['Is financing available for treatments?', 'Yes. We offer flexible payment plans through Affirm for Canadian citizens and residents aged 19 and over, with a minimum $500 purchase.'],
];

/* a closed treatment row shows one offer line, built only from the site's own badges */
function bestOffer(opts) {
  const tags = opts.map((o) => o[3]).filter(Boolean);
  if (!tags.length) return '';
  const pct = Math.max(0, ...tags.map((t) => { const m = /^(\d+)% OFF$/i.exec(t); return m ? +m[1] : 0; }));
  return pct ? `Up to ${pct}% off` : tags[0];
}
const perUnit = (cat, label) => (cat.unit && label === 'Regular' ? ' / unit' : '');

function TreatmentRow({ cat, it, uid, open, onToggle }) {
  const [name, note, opts] = it;
  const offer = bestOffer(opts);
  /* round 29: the lowest price after the discount, per unit / syringe / session (priceFrom, the site's one price source) */
  const pf = priceFrom(cat.id, name);
  const from = pf ? pf.value : Math.min(...opts.map((o) => o[1]));
  const fromUnit = pf ? pf.unit : perUnit(cat, opts.find((o) => o[1] === from)[0]);
  /* the treatment (and below, its option) the category's "from" price is read from: marked with the blue dot */
  const catPf = priceFrom(cat.id);
  const isSource = !!catPf && (cat.items.length > 1 ? catPf.src.item === name : opts.length > 1);
  return (
    <li className={`pr-item ${open ? 'is-open' : ''}`}>
      <h4 className="m-0">
        <button type="button" id={`${uid}-h`} aria-expanded={open} aria-controls={uid} onClick={onToggle}
          className="pr-head group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[18px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
          <span className="min-w-0">
            <span className="block font-aeonik text-[clamp(18px,1.45vw,22px)] leading-[1.22] tracking-[-0.015em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{name}</span>
            {note && <span className="mt-1 block font-inter text-[13.5px] leading-[1.45] text-ndm-muted">{note}</span>}
          </span>
          <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
            <SaleTag offer={offer} badge={saleBadge(opts.map((o) => o[3]))} small />
            <FromPrice value={from} unit={fromUnit} src={pf && pf.src} noWords mark={isSource} />
          </span>
          <span aria-hidden="true" className="pr-plus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
        </button>
      </h4>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body">
        <div>
          <ul className="grid gap-2 pb-5" role="list">
            {opts.map(([label, p, was, tag]) => {
              const line = { key: `${name}|${label}`, cat: cat.name, name, label, price: p, was: was || 0, unit: perUnit(cat, label) };
              return (
                <OptionRow key={label} mark={isSource && label === catPf.src.label} label={label} price={p} was={was || 0} tag={tag} unit={line.unit} action={<QtyControl line={line} label={`${name}, ${label}`} />} />
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- hero: the one clinic video (round 25, assets/clinic/ndm-clinic.mp4,
   also the home page's Inside our clinics and the Botox clinic film; never copied) */
const PRICING_FILM = { src: 'assets/clinic/ndm-clinic.mp4', poster: 'assets/clinic/ndm-clinic-poster.jpg' };
const IconPause = () => <Svg size={14} vb="0 0 14 14"><path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></Svg>;
const IconPlay = () => <Svg size={14} vb="0 0 14 14"><path d="M4 2.6v8.8a.5.5 0 0 0 .76.43l7.1-4.4a.5.5 0 0 0 0-.86l-7.1-4.4A.5.5 0 0 0 4 2.6Z" fill="currentColor" /></Svg>;

function PricingHero() {
  const ref = useRef(null), vid = useRef(null);
  useReveal(ref);
  /* the film plays straight through, on a loop (no pause button) */
  useEffect(() => {
    const v = vid.current; if (!v || REDUCED) return;
    v.muted = true;
    const p = v.play(); if (p) p.catch(() => {});
  }, []);
  const browse = (e) => {
    e.preventDefault();
    const el = document.getElementById('prices');
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 40);
  };
  const stats = [[`${PRICE_TOTAL} treatments`, 'Current prices and offers'], ['Free consultation', 'Before every treatment'], ['2 Toronto clinics', 'Uptown and Downtown']];
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="pricing-title" className="relative isolate flex min-h-[100svh] flex-col justify-end pt-[150px] md:h-[100svh] md:min-h-[640px] md:max-h-[1040px] md:pt-0 overflow-hidden bg-ndm-night text-white">
      <video ref={vid} src={PRICING_FILM.src} poster={PRICING_FILM.poster} autoPlay={!REDUCED} muted loop playsInline preload="auto" aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.5) 0%,rgba(11,15,19,.18) 55%,rgba(11,15,19,.1) 100%),linear-gradient(180deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.2) 28%,rgba(11,15,19,.26) 50%,rgba(11,15,19,.86) 100%)' }} />
      {/* the page carries on below: a quiet "Scroll to prices" line at the right edge (clear of the bottom tab), which also scrolls there */}
      <a href="#prices" onClick={browse} className="pr-scroll absolute right-[var(--gx)] top-1/2 z-[1] hidden -translate-y-1/2 flex-col items-center gap-3 font-inter text-[11px] font-medium uppercase tracking-[.22em] text-white/75 transition-colors hover:text-white md:flex">
        <span style={{ writingMode: 'vertical-rl' }}>Scroll to prices</span><span aria-hidden="true" className="pr-scroll-line" />
      </a>
      <div className="px-[var(--gx)] pb-[clamp(84px,8vw,112px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-[760px]">
            <Eyebrow dark className="rv">Pricing</Eyebrow>
            <TwoTone as="h1" id="pricing-title" dark className="rv mt-5" size="text-[clamp(46px,6.4vw,100px)]" lead="Treatments &" strong="pricing" style={{ transitionDelay: '.06s' }} />
            <p className="rv mt-5 max-w-[50ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.12s' }}>
              Browse treatment costs and current offers below. Every treatment begins with a free consultation, so your provider can assess your needs before confirming your final price.
            </p>
            <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: '.18s' }}>
              <Btn href="#prices" onClick={browse} v="glass">Browse all prices</Btn>
              <Btn href="#/book" v="book" onDark>Book Free Consultation</Btn>
            </div>
          </div>
          {/* the same three-column strip as the index hero scene tabs */}
          <ul className="rv flex items-center border-t border-white/15 pt-6 lg:border-0 lg:pt-0" role="list" style={{ transitionDelay: '.24s' }}>
            {stats.map(([t, l], k) => (
              <Fragment key={t}>
                <li className="min-w-0 flex-1 px-1 py-1 text-center lg:w-[clamp(170px,11.5vw,220px)] lg:flex-none">
                  <span className="block font-inter text-[13px] font-medium capitalize leading-[1.3] text-white sm:text-[15px]">{t}</span>
                  <span className="mt-1.5 block font-inter text-[11.5px] leading-[1.35] text-ndm-soft sm:mt-2.5 sm:text-[13px]">{l}</span>
                </li>
                {k < stats.length - 1 && <li role="presentation" aria-hidden="true" className="h-[50px] w-px shrink-0 bg-[#B9B9B9]/60" />}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- price list: every category folds, and every treatment inside it folds */
function PriceGroup({ c, on, onToggle, hits, openItem, toggleItem, setItems }) {
  const shown = hits || c.items.map((it, i) => [it, i]);
  const opts = c.items.flatMap((it) => it[2]);
  const offer = bestOffer(opts);
  /* round 29: the category's lowest price after the discount (e.g. Botox / Dysport, 220 units of Dysport: $7.70 / unit) */
  const pf = priceFrom(c.id);
  const from = pf ? pf.value : Math.min(...opts.map((o) => o[1]));
  const fromUnit = pf ? pf.unit : '';
  const allOpen = shown.every(([, i]) => openItem(i));
  const uid = `pg-${c.id}`;
  return (
    <li className={`pr-group ${on ? 'is-open' : ''}`}>
      <h3 className="pr-ghead m-0">
        <button type="button" id={`${uid}-h`} aria-expanded={on} aria-controls={uid} onClick={onToggle}
          className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
          <span className="min-w-0">
            <span className="block font-inter text-[12.5px] tabular-nums text-ndm-muted">{shown.length} {hits ? (shown.length === 1 ? 'match' : 'matches') : (shown.length === 1 ? 'treatment' : 'treatments')}</span>
            <span className="mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.name}</span>
          </span>
          <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
            <SaleTag offer={offer} badge={saleBadge(opts.map((o) => o[3]))} />
            <FromPrice value={from} unit={fromUnit} src={pf && pf.src} withItem={c.items.length > 1} big />
          </span>
          <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
        </button>
      </h3>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body" {...(on ? {} : { inert: '' })}>
        <div>
          <div className="pr-gintro flex items-center justify-between gap-x-4 pb-2 sm:gap-x-8">
            <p className="min-w-0 max-w-[60ch] font-inter text-[15px] leading-[1.55] text-ndm-muted">{c.blurb}</p>
            {shown.length > 1 && (
              <button type="button" onClick={() => setItems(shown.map(([, i]) => i), !allOpen)} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-ndm-ink/15 px-4 py-2 font-inter text-[13.5px] text-ndm-ink transition-colors hover:border-ndm-ink hover:bg-ndm-ink hover:text-white">
                {allOpen ? <IconMinusSm /> : <IconPlusSm />}{allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            )}
          </div>
          {/* treatments sit on their own white panel, flush with the category title, so they read as part of the category */}
          <ul className="pr-sub" role="list">
            {shown.map(([it, i]) => <TreatmentRow key={i} cat={c} it={it} uid={`pr-${c.id}-${i}`} open={openItem(i)} onToggle={() => toggleItem(i)} />)}
          </ul>
        </div>
      </div>
    </li>
  );
}

/* monthly specials (round 22, Ray's cards; centred in round 34): deal tag, From, price, name, Buy opens that category in the price list below */
function PriceSpecials() {
  const ref = useRef(null);
  useReveal(ref);
  const sp = PRICE_SPECIALS;
  const go = (e, id) => { const el = document.getElementById(id + '-h'); if (!el) return; e.preventDefault(); if (el.getAttribute('aria-expanded') !== 'true') el.click(); scrollToY(el.getBoundingClientRect().top + window.scrollY - 150); };
  return (
    <section ref={ref} id="specials" aria-labelledby="specials-title" className="relative z-10 scroll-mt-[150px] px-[var(--gx)] py-[clamp(48px,5.5vw,80px)]">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow className="rv">Monthly specials</Eyebrow>
        <TwoTone id="specials-title" className="rv mx-auto mt-5" size="text-[clamp(30px,3.2vw,46px)]" lead={<>Exclusive<br /></>} strong="monthly specials" style={{ transitionDelay: '.06s' }} />
        <p className="rv mx-auto mt-4 font-inter text-[15px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>{sp.sub}</p>
      </div>
      {/* round 34: centred cards after the designer's reference: From chip, large price with its unit, name, Buy and the note; the red deal tag on top */}
      <ul role="list" className="mx-auto mt-[clamp(28px,3.4vw,44px)] grid w-full max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {sp.items.map(([n, id], i) => {
          const info = priceInfo(n) || priceFrom(id.replace(/^pg-/, ''));
          const unit = info ? (info.unit || (info.per ? ' / ' + info.per.replace(/^per /, '') : '')) : '';
          return (
          <li key={n} className="rv ps-card flex flex-col items-center rounded-[22px] bg-white px-3 pb-5 pt-4 text-center ring-1 ring-ndm-ink/[.06] md:px-5 md:pb-6 md:pt-5" style={{ transitionDelay: `${0.04 * i}s` }}>
            {info && info.offer ? <DealPill deal={info.offer} /> : <span className="dp invisible" aria-hidden="true"><span className="dp-a">OFFER</span></span>}
            <span className="mt-4 rounded-full bg-ndm-blue/10 px-3 py-1 font-inter text-[11px] font-semibold uppercase tracking-[.16em] text-ndm-deep">From</span>
            <span className="mt-3 flex flex-wrap items-baseline justify-center gap-x-1"><span className="font-aeonik text-[clamp(24px,2.2vw,30px)] leading-none tracking-[-0.03em] text-ndm-ink">{info ? pfmt(info.value) : ''}</span>{unit && <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted md:text-[14px]">{unit}</span>}</span>
            <span className="mt-2.5 block font-inter text-[15px] font-medium leading-[1.3] text-ndm-ink md:text-[16.5px]">{n}</span>
            <span className="mt-auto flex flex-col items-center pt-4"><a href={`#${id}`} onClick={(e) => go(e, id)} className="btn btn-buy h-10 px-6 text-[14px]">Buy</a><span className="mt-2 font-inter text-[12.5px] text-ndm-muted">{sp.note}</span></span>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

/* the VIP Sale banner above the price list (user, 2026-11-18; the same banner the Next.js pricing page shows during the VIP phase):
   black, one thin gold light slowly circling the edge, a soft gold glow; shown until the VIP phase ends (Nov 19, 11:59 pm Toronto) */
const PR_VIP = { name: 'VIP Sale', ends: 'NOV 19', until: Date.parse('2026-11-20T05:00:00Z'),
  text: 'up to 70% off selected packages. Eligible packages take an extra 30% off, applied at checkout.', href: 'vip-sale.html', cta: 'See the VIP Sale' };
function PriceSaleBanner() {
  if (Date.now() > PR_VIP.until) return null;
  return (
    <aside aria-label={PR_VIP.name} className="pr-sale rv mb-[clamp(36px,4vw,56px)] flex flex-col gap-4 rounded-[22px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <span className="pr-sale-pill shrink-0 self-start sm:self-center"><span className="a">VIP SALE</span><span className="b">ENDS {PR_VIP.ends}</span></span>
        <p className="pr-sale-text font-inter text-[14.5px] leading-[1.55]"><strong className="font-semibold">{PR_VIP.name}:</strong> {PR_VIP.text}</p>
      </div>
      <span className="shrink-0"><a href={PR_VIP.href} className="btn pr-sale-btn"><span>{PR_VIP.cta}</span></a></span>
    </aside>
  );
}

/* ---------------------------------------------------------------- Black Friday countdown and category menu (user, 2026-11-18)
   The same pieces as the Next.js Pricing page (PriceCountdown, the .pcm menu); the countdown uses the live site's Black Friday window. */
const PCD_SALE = { start: '2026-11-20T00:00:00-05:00', end: '2026-12-07T23:59:00-05:00', when: 'Nov 20 to Dec 7', href: 'black-friday-sale.html' };
if (typeof document !== 'undefined' && !document.getElementById('pcd-css')) {
  const st = document.createElement('style'); st.id = 'pcd-css';
  st.textContent = `/* Black Friday countdown under the Pricing header (user, 2026-11-18): black, gold edge circling like the VIP Sale banner */
.pcd-wrap{padding-top:clamp(28px,3.4vw,48px)}
@property --pcd-a{syntax:"<angle>";initial-value:0deg;inherits:false}
.pcd{position:relative;isolation:isolate;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:clamp(18px,3vw,40px);padding:clamp(20px,2.4vw,30px) clamp(20px,2.8vw,34px);border-radius:22px;color:#fff;background:radial-gradient(120% 160% at 0% 0%,rgba(212,181,116,.16),transparent 55%),#0B0B0C;box-shadow:0 22px 50px -34px rgba(11,11,12,.75)}
.pcd::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;padding:1px;pointer-events:none;background:conic-gradient(from var(--pcd-a),transparent 0deg,rgba(242,214,150,.95) 28deg,transparent 70deg,transparent 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:pcdEdge 6s linear infinite}
.pcd::after{content:"";position:absolute;inset:0;z-index:-2;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(212,181,116,.22);pointer-events:none}
@keyframes pcdEdge{to{--pcd-a:360deg}}
.pcd-tag{display:inline-flex;align-items:center;gap:8px;font:600 11px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#E8D3A0}
.pcd-tag i{width:7px;height:7px;border-radius:999px;background:#EE3A45;box-shadow:0 0 0 0 rgba(238,58,69,.7);animation:pcdPulse 1.8s ease-out infinite}
@keyframes pcdPulse{70%{box-shadow:0 0 0 8px rgba(238,58,69,0)}100%{box-shadow:0 0 0 0 rgba(238,58,69,0)}}
.pcd-title{margin-top:10px;font-size:clamp(26px,2.6vw,36px);line-height:1.05;letter-spacing:-.03em;font-weight:400}
.pcd-title .tt-strong{color:#E8D3A0}
.pcd-text{margin-top:8px;font:400 14px/1.5 Manrope,"Helvetica Neue",Arial,sans-serif;color:rgba(255,255,255,.72)}
.pcd-time{display:flex;align-items:flex-start;gap:clamp(4px,.7vw,8px)}
.pcd-cell{display:flex;flex-direction:column;align-items:center;gap:7px;min-width:clamp(56px,5.6vw,70px);padding:10px 6px 9px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));box-shadow:inset 0 0 0 1px rgba(212,181,116,.22)}
.pcd-num{font-size:clamp(28px,2.8vw,38px);line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:#fff}
.pcd-lab{font:600 9.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,211,160,.75)}
.pcd-sep{padding-top:14px;font-size:clamp(22px,2vw,28px);line-height:1;color:#D4B574;animation:pcdBlink 1s steps(1) infinite}
@keyframes pcdBlink{50%{opacity:.3}}
.pcd .pcd-btn{height:46px;padding:0 22px;border-radius:999px;background:#fff;color:#0B0B0C;font:600 14.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;transition:background .2s,color .2s}
.pcd .pcd-btn:is(:hover,:focus-visible){background:#D4B574;color:#0B0B0C}
@media (max-width:1023px){.pcd{grid-template-columns:minmax(0,1fr) auto}.pcd .pcd-btn{grid-column:1 / -1;justify-self:start}}
@media (max-width:639px){.pcd{grid-template-columns:minmax(0,1fr);gap:16px}.pcd-time{justify-content:space-between}.pcd-cell{flex:1;min-width:0}.pcd .pcd-btn{width:100%}}
@media (prefers-reduced-motion:reduce){.pcd::before,.pcd-tag i,.pcd-sep{animation:none}}

/* the categories as a menu above the price list (user, 2026-11-18): a tap opens that category and scrolls to it */
.pcm{margin-bottom:clamp(28px,3vw,40px)}
.pcm-label{margin-bottom:12px;text-align:center;font:600 11px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#5A646C}
.pcm-list{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.pcm-chip{display:inline-flex;align-items:baseline;gap:8px;padding:9px 14px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px rgba(27,36,43,.1);text-decoration:none;white-space:nowrap;transition:box-shadow .2s,background .2s}
.pcm-chip:hover{box-shadow:inset 0 0 0 1px rgba(15,128,195,.55)}
.pcm-chip:focus-visible{outline:3px solid rgba(32,158,217,.35);outline-offset:2px}
.pcm-name{font:500 14px/1.2 Manrope,"Helvetica Neue",Arial,sans-serif;color:#1B242B}
.pcm-from{font:500 12px/1.2 Manrope,"Helvetica Neue",Arial,sans-serif;color:#5A646C}
/* phones: one row that scrolls sideways, edge to edge */
@media (max-width:639px){
  .pcm-label{text-align:left}
  .pcm-list{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;margin-inline:calc(var(--gx) * -1);padding:2px var(--gx) 6px;scrollbar-width:none;-webkit-mask:linear-gradient(90deg,transparent,#000 var(--gx),#000 calc(100% - var(--gx)),transparent);mask:linear-gradient(90deg,transparent,#000 var(--gx),#000 calc(100% - var(--gx)),transparent)}
  .pcm-list::-webkit-scrollbar{display:none}
  .pcm-list>li{flex:none}
}
`;
  document.head.appendChild(st);
}
function PriceCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const start = new Date(PCD_SALE.start).getTime(), end = new Date(PCD_SALE.end).getTime();
  if (now > end) return null;
  const live = now >= start, ms = Math.max(0, (live ? end : start) - now);
  const cells = [[Math.floor(ms / 864e5), 'Days'], [Math.floor((ms % 864e5) / 36e5), 'Hours'], [Math.floor((ms % 36e5) / 6e4), 'Mins'], [Math.floor((ms % 6e4) / 1e3), 'Secs']];
  return (
    <section aria-label="Black Friday countdown" className="pcd-wrap relative z-10 bg-ndm-paper px-[var(--gx)]">
      <div className="pcd mx-auto max-w-[1040px]">
        <div className="pcd-copy">
          <p className="pcd-tag"><i aria-hidden="true" />Black Friday {PCD_SALE.when}</p>
          <p className="pcd-title font-aeonik">Black Friday <span className="tt-strong">{live ? 'ends in' : 'starts in'}</span></p>
          <p className="pcd-text">{live ? 'Offers end Dec 7 at 11:59 pm, Toronto time.' : 'Plan your treatments now and be ready when it starts.'}</p>
        </div>
        <div className="pcd-time" role="timer" aria-label={`${cells[0][0]} days, ${cells[1][0]} hours and ${cells[2][0]} minutes`}>
          {cells.map(([n, label], k) => (
            <React.Fragment key={label}>
              {k > 0 && <span className="pcd-sep font-aeonik" aria-hidden="true">:</span>}
              <span className="pcd-cell" aria-hidden="true"><span className="pcd-num font-aeonik">{String(n).padStart(2, '0')}</span><span className="pcd-lab">{label}</span></span>
            </React.Fragment>
          ))}
        </div>
        <a href={PCD_SALE.href} className="btn pcd-btn">See Black Friday offers</a>
      </div>
    </section>
  );
}
function PriceMenu() {
  const go = (e, id) => { const el = document.getElementById(id); if (!el) return; e.preventDefault(); if (el.getAttribute('aria-expanded') !== 'true') el.click(); scrollToY(el.getBoundingClientRect().top + window.scrollY - 150); };
  return (
    <nav aria-label="Price list categories" className="pcm rv">
      <p className="pcm-label">Jump to a treatment</p>
      <ul className="pcm-list" role="list">
        {PRICE_CATS.map((c) => { const pf = priceFrom(c.id); return (
          <li key={c.id}>
            <a href={`#pg-${c.id}-h`} onClick={(e) => go(e, `pg-${c.id}-h`)} className="pcm-chip">
              <span className="pcm-name">{c.name}</span>
              {pf && <span className="pcm-from">From {pfmt(pf.value)}{pf.unit}</span>}
            </a>
          </li>
        ); })}
      </ul>
    </nav>
  );
}

function PriceList() {
  const ref = useRef(null);
  useReveal(ref);
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState(() => new Set());
  const [shut, setShut] = useState(() => new Set());
  const [open, setOpen] = useState(() => new Set());
  const q = query.trim().toLowerCase();
  const results = q
    ? PRICE_CATS.map((c) => ({ c, hits: c.items.map((it, i) => [it, i]).filter(([it]) => `${c.name} ${it[0]} ${it[1]}`.toLowerCase().includes(q)) })).filter((r) => r.hits.length)
    : null;
  const hitCount = results ? results.reduce((n, r) => n + r.hits.length, 0) : 0;
  useEffect(() => { setShut(new Set()); }, [q]);
  const flip = (set, k) => set((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const key = (c, i) => `${c.id}:${i}`;
  /* a category opens with every treatment folded */
  const toggleCat = (c) => {
    if (q) return flip(setShut, c.id);
    flip(setCats, c.id);
  };
  const groups = results || PRICE_CATS.map((c) => ({ c, hits: null }));

  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,110px)] pb-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        <PriceSaleBanner />
        <div className="text-center">
          <Eyebrow className="rv">Price list</Eyebrow>
          <TwoTone id="prices-title" className="rv mt-5" lead="Prices and" strong="current offers" style={{ transitionDelay: '.06s' }} />
          <p className="rv mx-auto mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Open a category, then any treatment to see its sessions, packages and current offers.</p>
          <label className="rv relative mx-auto mt-6 block max-w-[560px]" style={{ transitionDelay: '.14s' }}>
            <span className="sr-only">Search treatments</span>
            <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ndm-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${PRICE_TOTAL} treatments`}
              className="h-14 w-full rounded-full border border-ndm-ink/10 bg-white pl-12 pr-5 font-inter text-[15px] text-ndm-ink outline-none transition placeholder:text-[#8A949B] focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15" />
          </label>
        </div>

        <div className="mt-[clamp(40px,4.5vw,64px)]">
          {results && (
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
              <p className="font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink" aria-live="polite">
                {hitCount ? `${hitCount} ${hitCount === 1 ? 'treatment matches' : 'treatments match'} “${query.trim()}”` : `No treatments match “${query.trim()}”`}
              </p>
              <button type="button" onClick={() => setQuery('')} className="font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline">Clear search</button>
            </div>
          )}
          {results && !hitCount && <p className="font-inter text-[15px] text-ndm-muted">Try another name, or ask our team at your free consultation.</p>}
          {!results && <PriceMenu />}
          <ul className="pr-groups" role="list">
            {groups.map(({ c, hits }) => (
              <PriceGroup key={c.id} c={c} hits={hits}
                on={q ? !shut.has(c.id) : cats.has(c.id)} onToggle={() => toggleCat(c)}
                openItem={(i) => open.has(key(c, i))} toggleItem={(i) => flip(setOpen, key(c, i))}
                setItems={(is, on) => setOpen((s) => { const n = new Set(s); is.forEach((i) => (on ? n.add(key(c, i)) : n.delete(key(c, i)))); return n; })} />
            ))}
          </ul>
          <p className="mt-10 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">
            Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation. Individual results may vary.
          </p>
        </div>
      </div>
    </section>
  );
}

