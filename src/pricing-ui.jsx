const PRICE_TOTAL = PRICE_CATS.reduce((n, c) => n + c.items.length, 0);
SALE_NAME_SHOWN = false;
ICON_HALF_SHOWN = true; /* a one-part offer gets a red half of the flame icon alone, in the list and the Monthly specials cards (user, 2026-11-26) */ /* the pricing page's pills give the offer only ("30% OFF"), as the site's list (user, 2026-11-25) */
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

/* the options of one treatment, each with Add to cart; the blue dot on the one the category's "from" price is read from */
function OptionList({ cat, it, mark, className = 'grid gap-2 pb-5' }) {
  const [name, , opts] = it;
  const catPf = priceFrom(cat.id, undefined, true);
  return (
    <ul className={className} role="list">
      {opts.map(([label, p, was, tag, code]) => {
        const line = { key: `${name}|${label}`, cat: cat.name, name, label, price: code && code < p ? code : p, was: was || 0, unit: perUnit(cat, label) };
        return (
          <OptionRow key={label} mark={mark && !!catPf && label === catPf.src.label} label={label} price={p} was={was || 0} code={code} tag={tag} unit={line.unit} action={<QtyControl line={line} label={`${name}, ${label}`} />} />
        );
      })}
    </ul>
  );
}

function TreatmentRow({ cat, it, uid, open, onToggle }) {
  const [name, note, opts] = it;
  const offer = bestOffer(opts);
  /* round 29: the lowest price after the discount, per unit / syringe / session (priceFrom, the site's one price source) */
  /* the lowest price with the running sale's checkout code, as the site's list (2026-11-25) */
  const pf = priceFrom(cat.id, name, true);
  const from = pf ? pf.value : Math.min(...opts.map((o) => o[1]));
  const fromUnit = pf ? pf.unit : perUnit(cat, opts.find((o) => o[1] === from)[0]);
  /* the treatment (and below, its option) the category's "from" price is read from: marked with the blue dot */
  const catPf = priceFrom(cat.id, undefined, true);
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
            <SaleTag offer={offer} badge={saleBadge(opts.map((o) => o[3]))} coded={badgeCoded(opts)} small />
            <FromPrice value={from} unit={fromUnit} src={pf && pf.src} noWords mark={isSource} />
          </span>
          <span aria-hidden="true" className="pr-plus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
        </button>
      </h4>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body">
        <div>
          <OptionList cat={cat} it={it} mark={isSource} />
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
    <section ref={ref} data-nav="dark" aria-labelledby="pricing-title" className="prh relative isolate flex min-h-[100svh] flex-col justify-end pt-[150px] md:h-[100svh] md:min-h-[640px] md:max-h-[1040px] md:pt-0 overflow-hidden bg-ndm-night text-white">
      <video ref={vid} src={PRICING_FILM.src} poster={PRICING_FILM.poster} autoPlay={!REDUCED} muted loop playsInline preload="auto" aria-hidden="true"
        className="prh-pic absolute inset-0 -z-20 h-full w-full object-cover" />
      {/* phones (site, 2026-11-20): the film's bottom edge fades into the night colour the words sit on */}
      <div aria-hidden="true" className="prh-fade" />
      <div aria-hidden="true" className="prh-shade absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.5) 0%,rgba(11,15,19,.18) 55%,rgba(11,15,19,.1) 100%),linear-gradient(180deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.2) 28%,rgba(11,15,19,.26) 50%,rgba(11,15,19,.86) 100%)' }} />
      {/* the page carries on below: a quiet "Scroll to prices" line at the right edge (clear of the bottom tab), which also scrolls there */}
      <a href="#prices" onClick={browse} className="pr-scroll absolute right-[var(--gx)] top-1/2 z-[1] hidden -translate-y-1/2 flex-col items-center gap-3 font-inter text-[11px] font-medium uppercase tracking-[.22em] text-white/75 transition-colors hover:text-white md:flex">
        <span style={{ writingMode: 'vertical-rl' }}>Scroll to prices</span><span aria-hidden="true" className="pr-scroll-line" />
      </a>
      <div className="prh-in px-[var(--gx)] pb-[clamp(84px,8vw,112px)]">
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
  const pf = priceFrom(c.id, undefined, true);
  const from = pf ? pf.value : Math.min(...opts.map((o) => o[1]));
  const fromUnit = pf ? pf.unit : '';
  const allOpen = shown.every(([, i]) => openItem(i));
  /* one treatment only (e.g. Aptos): no treatment row to open, its options straight under the category (user, 2026-11-25) */
  const single = c.items.length === 1;
  const uid = `pg-${c.id}`;
  return (
    <li className={`pr-group ${on ? 'is-open' : ''}`}>
      <h3 className="pr-ghead m-0">
        <button type="button" id={`${uid}-h`} aria-expanded={on} aria-controls={uid} onClick={onToggle}
          className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
          <span className="min-w-0">
            <span className="pr-gcount block font-inter text-[12.5px] tabular-nums text-ndm-muted">{shown.length} {hits ? (shown.length === 1 ? 'match' : 'matches') : (shown.length === 1 ? 'treatment' : 'treatments')}</span>
            <span className="pr-gname mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.name}</span>
          </span>
          <span className="pr-gmeta col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
            {/* the large category pill is plain: no flames, no flame icon, no added half (user, 2026-11-26: the small pills
                carry the flame, the large ones do not) */}
            <SaleTag offer={offer} badge={saleBadge(opts.map((o) => o[3]))} coded={badgeCoded(opts)} />
            <FromPrice value={from} unit={fromUnit} src={pf && pf.src} withItem={c.items.length > 1} big />
          </span>
          <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
        </button>
      </h3>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body" {...(on ? {} : { inert: '' })}>
        <div>
          <div className="pr-gintro flex items-center justify-between gap-x-4 pb-2 sm:gap-x-8">
            <p className="min-w-0 max-w-[60ch] font-inter text-[15px] leading-[1.55] text-ndm-muted">{c.blurb}</p>
            {!single && shown.length > 1 && (
              <button type="button" onClick={() => setItems(shown.map(([, i]) => i), !allOpen)} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-ndm-ink/15 px-4 py-2 font-inter text-[13.5px] text-ndm-ink transition-colors hover:border-ndm-ink hover:bg-ndm-ink hover:text-white">
                {allOpen ? <IconMinusSm /> : <IconPlusSm />}{allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            )}
          </div>
          {/* treatments sit on their own white panel, flush with the category title, so they read as part of the category */}
          {single
            ? <div className="pr-sub"><OptionList cat={c} it={c.items[0]} mark={c.items[0][2].length > 1} className="grid gap-2 py-[18px]" /></div>
            : <ul className="pr-sub" role="list">
                {shown.map(([it, i]) => <TreatmentRow key={i} cat={c} it={it} uid={`pr-${c.id}-${i}`} open={openItem(i)} onToggle={() => toggleItem(i)} />)}
              </ul>}
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
  const go = (e, id) => { if (jumpToGroup(id + '-h')) e.preventDefault(); };
  return (
    <section ref={ref} id="specials" aria-labelledby="specials-title" className="relative z-10 scroll-mt-[150px] px-[var(--gx)] py-[clamp(48px,5.5vw,80px)]">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow className="rv">Monthly specials</Eyebrow>
        <TwoTone id="specials-title" className="rv mx-auto mt-5" size="text-[clamp(30px,3.2vw,46px)]" lead={<>Exclusive<br /></>} strong="monthly specials" style={{ transitionDelay: '.06s' }} />
        <p className="rv mx-auto mt-4 font-inter text-[15px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>{sp.sub}</p>
      </div>
      {/* round 34: centred cards after the designer's reference: From chip, large price with its unit, name, Buy and the note; the red deal tag on top */}
      <ul role="list" className="mx-auto mt-[clamp(28px,3.4vw,44px)] grid w-full max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {sp.items.map(([n, id, item], i) => {
          /* the card's treatment (or its whole category) as the price list's own rows show it, with the sale's code (2026-11-25),
             in the list's theme: its pill (black and plain red, the flame icon beside a one-part offer), the sale price in red, the regular struck */
          const cid = id.replace(/^pg-/, ''); const cat = PRICE_BY_ID[cid];
          const info = priceFrom(cid, item, true);
          const its = cat ? (item ? cat.items.filter((it) => pNorm(it[0]) === pNorm(item)) : cat.items) : [];
          const opts = its.flatMap((it) => it[2]);
          const unit = info ? (info.unit || (info.per ? ' / ' + info.per.replace(/^per /, '') : '')) : '';
          const cut = !!SALE_LOOK && !!info && info.src.reg > 0;
          return (
          <li key={n} className="rv psx" style={{ transitionDelay: `${0.04 * i}s` }}>
            <span className="psx-tag"><SaleTag offer={info ? info.offer : ''} badge={saleBadge(opts.map((o) => o[3]))} coded={badgeCoded(opts)} small /></span>
            <span className="psx-from">From</span>
            <span className="psx-price">
              {cut && <s className="psx-was"><span className="sr-only">Regular price </span>{pfmt(info.src.reg)}</s>}
              <span data-look={SALE_LOOK || undefined} className={`psx-now ${cut ? 'is-sale' : ''}`}>{cut && <span className="sr-only">now </span>}{info ? pfmt(info.value) : ''}</span>
              {unit && <span className="psx-unit">{unit}</span>}
            </span>
            <span className="psx-name">{n}</span>
            <span className="psx-act"><a href={`#${id}`} onClick={(e) => go(e, id)} className="btn btn-buy h-10 px-6 text-[14px]">Buy</a><span className="psx-note">{sp.note}</span></span>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

/* the VIP Sale banner above the price list (user, 2026-11-18; the same banner the Next.js pricing page shows during the VIP phase):
   black, one thin gold light slowly circling the edge, a soft gold glow; shown until the VIP phase ends (Nov 19, 11:59 pm Toronto) */
const PR_VIP = { name: 'Black Friday', ends: 'DEC 7', until: Date.parse('2026-12-08T05:00:00Z'),
  text: 'up to 70% off selected packages. Eligible packages take an extra 30% off, applied at checkout.', href: 'black-friday-sale.html', cta: 'See the Black Friday deals' };
function PriceSaleBanner() {
  if (Date.now() > PR_VIP.until) return null;
  return (
    <aside aria-label={PR_VIP.name} className="pr-sale rv mb-[clamp(36px,4vw,56px)] flex flex-col gap-4 rounded-[22px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <span className="pr-sale-pill shrink-0 self-start sm:self-center"><span className="a">BLACK FRIDAY</span><span className="b">ENDS {PR_VIP.ends}</span></span>
        <p className="pr-sale-text font-inter text-[14.5px] leading-[1.55]"><strong className="font-semibold">{PR_VIP.name}:</strong> {PR_VIP.text}</p>
      </div>
      <span className="shrink-0"><a href={PR_VIP.href} className="btn pr-sale-btn"><span>{PR_VIP.cta}</span></a></span>
    </aside>
  );
}

/* ---------------------------------------------------------------- Black Friday countdown and category menu (user, 2026-11-18)
   The same pieces as the Next.js Pricing page (PriceCountdown, the .pcm menu); the countdown uses the live site's Black Friday window. */
const PCD_SALE = { start: '2026-11-20T00:00:00-05:00', end: '2026-12-07T23:59:00-05:00', when: 'Until Dec 7', href: 'black-friday-sale.html' };
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

/* "Jump to a treatment" (site, 2026-11-20): sticky sliding tab bar in the Black Friday filter tab look */
.pcm-label{margin-bottom:10px;font:600 11px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#5A646C}
.pcm{position:sticky;top:100px;z-index:30;display:flex;align-items:center;gap:12px;margin-bottom:clamp(28px,3vw,40px);padding:8px 0;transition:box-shadow .25s ease,background-color .25s ease}
@media (min-width:1280px){.pcm{top:120px}}
.pcm.is-stuck{background-color:#FAFAF8;box-shadow:0 0 0 100vmax #FAFAF8,0 1px 0 100vmax rgba(27,36,43,.08);clip-path:inset(0 -100vmax -1px)}
.pcm-arrows{display:flex;gap:8px;flex:none}
.pcm-arrow{display:grid;place-items:center;width:42px;height:42px;border-radius:999px;border:1px solid #D5D3D3;background:#fff;color:#131211;-webkit-tap-highlight-color:transparent;transition:background-color .25s ease,border-color .25s ease,color .25s ease,opacity .25s ease}
.pcm-arrow:not(:disabled):is(:hover,:focus-visible){background:#0F0E0D;border-color:#0F0E0D;color:#fff}
.pcm-arrow:focus-visible{outline:3px solid rgba(32,158,217,.35);outline-offset:2px}
.pcm-arrow:disabled{opacity:.35;cursor:default}
.pcm-list{flex:1 1 auto;min-width:0;display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x proximity;scroll-padding-inline:2px;padding:2px;scrollbar-width:none;-webkit-mask:linear-gradient(90deg,#000 calc(100% - 40px),transparent);mask:linear-gradient(90deg,#000 calc(100% - 40px),transparent)}
.pcm-list::-webkit-scrollbar{display:none}
.pcm-list>li{flex:none;scroll-snap-align:start}
.pcm-chip{display:inline-flex;align-items:baseline;gap:8px;padding:12px 17px;border-radius:999px;border:1px solid #D5D3D3;background-color:#fff;color:#131211;text-decoration:none;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:background-color .28s ease,border-color .28s ease,color .28s ease}
.pcm-chip:hover,.pcm-chip[aria-current]{background-color:#0F0E0D;border-color:#0F0E0D;color:#fff}
.pcm-chip:focus-visible{outline:3px solid rgba(32,158,217,.35);outline-offset:-3px}
.pcm-name{font:600 14px/1 Inter,"Helvetica Neue",Arial,sans-serif;color:inherit}
.pcm-from{font:500 12.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;color:inherit;opacity:.6}
@media (max-width:639px){
  .pcm-arrows{display:none}
  .pcm-list{margin-inline:calc(var(--gx) * -1);padding-inline:var(--gx);scroll-padding-inline:var(--gx);-webkit-mask:linear-gradient(90deg,transparent,#000 var(--gx),#000 calc(100% - var(--gx)),transparent);mask:linear-gradient(90deg,transparent,#000 var(--gx),#000 calc(100% - var(--gx)),transparent)}
  .pcm-chip{padding:11px 15px}
}
@media (prefers-reduced-motion:reduce){.pcm-chip,.pcm-arrow{transition:none}}
/* phones (user, 2026-11-25): a search button at the start of the bar, in place of the floating one, takes you to the list's search box */
.pcm-find{display:none}
@media (max-width:639px){
  .pcm-find{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:999px;border:0;background:#0F80C3;color:#fff;-webkit-tap-highlight-color:transparent;transition:background-color .25s ease}
  .pcm-find:is(:hover,:focus-visible){background:#0A4F7A}
  .pcm-find:focus-visible{outline:3px solid rgba(32,158,217,.35);outline-offset:2px}
  .pcm{gap:8px}
  .pcm-find+.pcm-list{margin-left:0;padding-left:2px;scroll-padding-left:2px;-webkit-mask:linear-gradient(90deg,#000 calc(100% - var(--gx)),transparent);mask:linear-gradient(90deg,#000 calc(100% - var(--gx)),transparent)}
}
/* phones (user, 2026-11-25, as the site): the list's two-part pills stay joined, and a category's title is compact: count
   and name small on the left with a smaller + on the right, under them the offer pill left and the "from" price right,
   without the "Lowest price, from" line */
@media (max-width:639px){
  #prices .sb-split{flex-wrap:nowrap;gap:0;overflow:hidden;border-radius:999px}
  #prices .sb-split .sb-a{border-radius:999px 0 0 999px;box-shadow:inset 1.5px 0 0 var(--a-ring),inset 0 1.5px 0 var(--a-ring),inset 0 -1.5px 0 var(--a-ring)}
  #prices .sb-split .sb-b{border-radius:0 999px 999px 0}
  .pr-ghead>button{padding-block:14px;column-gap:12px;row-gap:8px}
  .pr-ghead .pr-gcount{font-size:11.5px;line-height:1.2}
  .pr-ghead .pr-gname{margin-top:2px;font-size:20px;line-height:1.15}
  .pr-ghead .pr-gplus{grid-row:1;grid-column:2;align-self:center;width:34px;height:34px}
  .pr-ghead .pr-gmeta{grid-column:1 / -1;grid-row:2;flex-wrap:wrap;justify-content:space-between;column-gap:10px;row-gap:6px}
  .pr-ghead .pr-gmeta .sb{font-size:11px}
  .pr-ghead .pr-gmeta .sb>span{padding:6px 10px}
  .pr-ghead .pr-gmeta .pr-src{display:none}
  .pr-ghead .pr-gmeta .pr-from{font-size:17px}
  .pr-ghead .pr-gmeta>span:last-child{align-items:flex-end}
}
/* the Monthly specials in the price list's own theme (user, 2026-11-25): white cards like the list's panels, the list's pill
   (black and plain red, the flame icon beside a one-part offer), the price in the sale's red with the regular price struck through */
#specials .psx{display:flex;flex-direction:column;align-items:center;text-align:center;padding:18px 12px 20px;border-radius:22px;background:#fff;box-shadow:0 0 0 1px rgba(27,36,43,.08),0 18px 40px -32px rgba(15,60,95,.35);transition:transform .5s var(--e-out),box-shadow .5s ease}
@media (hover:hover){#specials .psx:hover{transform:translateY(-3px);box-shadow:0 0 0 1px rgba(27,36,43,.12),0 28px 50px -32px rgba(15,60,95,.45)}}
#specials .psx-tag{display:flex;justify-content:center;min-height:23px}
#specials .psx-tag .sb-split{flex-wrap:wrap;justify-content:center}
#specials .psx-from{margin-top:16px;font:600 11px/1 Manrope,"Helvetica Neue",Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#5A646C}
#specials .psx-price{margin-top:8px;display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;column-gap:6px;row-gap:2px}
#specials .psx-was{font:400 14px/1 Manrope,"Helvetica Neue",Arial,sans-serif;color:#A3A9B1;text-decoration-thickness:1px}
#specials .psx-now{font:400 clamp(26px,2.4vw,32px)/1 Fraunces,Georgia,serif;letter-spacing:-.03em;color:#1B242B}
#specials .psx-now.is-sale{color:var(--now,#C8101C)}
#specials .psx-now[data-look="bf"]{--now:#C8101C}
#specials .psx-unit{font:400 13px/1 Manrope,"Helvetica Neue",Arial,sans-serif;color:#6B7480;white-space:nowrap}
#specials .psx-name{margin-top:10px;font:500 15px/1.3 Manrope,"Helvetica Neue",Arial,sans-serif;color:#1B242B}
#specials .psx-act{margin-top:auto;padding-top:16px;display:flex;flex-direction:column;align-items:center}
#specials .psx-note{margin-top:8px;font:400 12.5px/1.3 Manrope,"Helvetica Neue",Arial,sans-serif;color:#5A646C}
@media (min-width:768px){#specials .psx{padding:22px 20px 24px}#specials .psx-name{font-size:16.5px}}
@media (prefers-reduced-motion:reduce){#specials .psx{transition:none}}
/* tablets (2026-11-25): the category title keeps its own row, the pill and the "from" price share the row under it, so a
   wide pill never runs over the title */
@media (min-width:640px) and (max-width:1023px){
  .pr-ghead>button{grid-template-columns:minmax(0,1fr) auto;column-gap:16px;row-gap:10px}
  .pr-ghead .pr-gplus{grid-row:1;grid-column:2;align-self:center}
  .pr-ghead .pr-gmeta{grid-column:1 / -1;grid-row:2;flex-wrap:nowrap;justify-content:space-between}
  .pr-ghead .pr-gmeta>span:last-child{align-items:flex-end}
}
/* an open category's title sticks under the bar, never behind it (user, 2026-11-25) */
.pr-group.is-open>.pr-ghead{top:calc(100px + var(--pcm-h, 0px))}
@media (min-width:1280px){.pr-group.is-open>.pr-ghead{top:calc(120px + var(--pcm-h, 0px))}}
/* the header on phones (site, 2026-11-20): the clinic film fills the top only and fades into night colour, the words below it */
.prh-fade{display:none}
@media (max-width:639px){
  main .prh{--pr-pic:clamp(380px,56svh,520px);min-height:0;padding-top:0}
  main .prh .prh-pic{bottom:auto;height:var(--pr-pic)}
  main .prh .prh-shade{display:none}
  main .prh .prh-fade{display:block;position:absolute;inset:0 0 auto;z-index:-10;height:var(--pr-pic);pointer-events:none;background:linear-gradient(180deg,rgba(11,15,19,.6) 0%,rgba(11,15,19,.15) 26%,rgba(11,15,19,0) 44%,rgba(11,15,19,.5) 68%,rgba(11,15,19,.9) 86%,#0b0f13 100%)}
  main .prh .prh-in{padding-top:calc(var(--pr-pic) - 56px)}
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
/* "Jump to a treatment" (site, 2026-11-20): the categories as the Black Friday page's filter tabs (white pills, the chosen one
   black) in one sliding row, arrows from 640px up, a swipe on phones; sticky under the header while the price list is on
   screen. A tap opens that category and scrolls to it with the bar's height kept clear above its title. The bar's height is
   handed to the list as --pcm-h, so an open category's title sticks under the bar, never behind it (user, 2026-11-25). */
const pcmBar = () => [...document.querySelectorAll('nav.pcm')].find((n) => n.offsetParent !== null) || null;
/* room kept above a category's title: the header (the bar's sticky top), the bar, a little air; 150 without the bar */
const pcmOffset = () => { const el = pcmBar(); if (!el) return 150; return (parseFloat(getComputedStyle(el).top) || 100) + el.offsetHeight + 18; };
function jumpToGroup(headId, offset) {
  const el = document.getElementById(headId); if (!el) return false;
  if (el.getAttribute('aria-expanded') !== 'true') el.click();
  scrollToY(el.getBoundingClientRect().top + window.scrollY - (offset == null ? pcmOffset() : offset));
  return true;
}
function PriceMenu() {
  const row = useRef(null), bar = useRef(null);
  const [stuck, setStuck] = useState(false);
  const [ends, setEnds] = useState({ start: true, end: false });
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    const el = row.current; if (!el) return;
    const measure = () => setEnds({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => { el.removeEventListener('scroll', measure); ro.disconnect(); };
  }, []);
  /* the bar's height, for the open category's sticky title */
  useEffect(() => {
    const el = bar.current, box = el && el.parentElement; if (!el || !box) return;
    const put = () => box.style.setProperty('--pcm-h', `${el.offsetHeight}px`);
    put();
    const ro = new ResizeObserver(put); ro.observe(el);
    return () => { ro.disconnect(); box.style.removeProperty('--pcm-h'); };
  }, []);
  /* the bar gets its background and line only while it is stuck under the header */
  useEffect(() => {
    const on = () => { const el = bar.current; if (!el) return; const top = parseFloat(getComputedStyle(el).top) || 0; setStuck(Math.abs(el.getBoundingClientRect().top - top) < 1.5); };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  /* phones (user, 2026-11-25): the floating search button is gone from this page, so the bar carries one; it brings the
     price list's own search box into view and puts the cursor in it */
  const find = () => { const input = document.getElementById('prices-search'); if (!input) return; scrollToY(input.getBoundingClientRect().top + window.scrollY - 140); setTimeout(() => input.focus({ preventScroll: true }), 650); };
  const slide = (dir) => { const el = row.current; if (!el) return; el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: REDUCED ? 'auto' : 'smooth' }); };
  return (
    <>
      <p className="pcm-label rv">Jump to a treatment</p>
      <nav ref={bar} aria-label="Price list categories" className={`pcm ${stuck ? 'is-stuck' : ''}`}>
        <button type="button" className="pcm-find" onClick={find} aria-label="Search treatments"><IconSearch size={18} /></button>
        <ul ref={row} className="pcm-list" role="list" data-lenis-prevent-horizontal="">
          {PRICE_CATS.map((c) => { const pf = priceFrom(c.id, undefined, true); return (
            <li key={c.id}>
              <a href={`#pg-${c.id}-h`} aria-current={picked === c.id || undefined} onClick={(e) => { setPicked(c.id); if (jumpToGroup(`pg-${c.id}-h`)) e.preventDefault(); }} className="pcm-chip">
                <span className="pcm-name">{c.name}</span>
                {pf && <span className="pcm-from">From {pfmt(pf.value)}{pf.unit}</span>}
              </a>
            </li>
          ); })}
        </ul>
        <div className="pcm-arrows">
          <button type="button" className="pcm-arrow" onClick={() => slide(-1)} disabled={ends.start} aria-label="Previous treatments"><IconArrow size={16} className="rotate-180" /></button>
          <button type="button" className="pcm-arrow" onClick={() => slide(1)} disabled={ends.end} aria-label="More treatments"><IconArrow size={16} /></button>
        </div>
      </nav>
    </>
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
    <section ref={ref} id="prices" data-sale={SALE_LOOK || undefined} aria-labelledby="prices-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,110px)] pb-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        <PriceSaleBanner />
        <div className="text-center">
          <Eyebrow className="rv">Price list</Eyebrow>
          <TwoTone id="prices-title" className="rv mt-5" lead="Prices and" strong="current offers" style={{ transitionDelay: '.06s' }} />
          <p className="rv mx-auto mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Open a category, then any treatment to see its sessions, packages and current offers.</p>
          <label className="rv relative mx-auto mt-6 block max-w-[560px]" style={{ transitionDelay: '.14s' }}>
            <span className="sr-only">Search treatments</span>
            <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ndm-muted" />
            <input id="prices-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${PRICE_TOTAL} treatments`}
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

