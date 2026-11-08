const PRICE_TOTAL = PRICE_CATS.reduce((n, c) => n + c.items.length, 0);
const PRICE_FAQS = [ /* the live pricing page's answers (approval items C3-1 to C3-5, 7 Nov 2026) */
  ['How do I check the price of a treatment?', 'You can view pricing by expanding the treatment categories listed on the pricing page (e.g., Botox, Dermal Fillers, Coolsculpting, Microneedling, etc.). Each category shows detailed costs and current offers.'],
  ['Are the prices the same at all locations?', 'Yes, the listed prices and promotions apply across all participating clinic locations unless otherwise noted.'],
  ['Do promotions apply to pricing?', 'Yes. Current promotions (such as up to 60% off Hyperpigmentation, 60% off Laser Hair Removal, and 40% off Dermal Fillers) are reflected in the pricing section.'],
  ['Are consultations included in the pricing?', 'Yes, consultations are free. This ensures your provider can assess your needs and customize the treatment plan before confirming final pricing.'],
  ['Is financing available for treatments?', 'Yes. We offer flexible payment plans through Affirm.'],
];

/* a closed treatment row shows one offer line, built only from the site's own badges */
function bestOffer(opts) {
  const tags = opts.map((o) => o[3]).filter(Boolean);
  if (!tags.length) return '';
  const pct = Math.max(0, ...tags.map((t) => { const m = /^(\d+)% OFF$/i.exec(t); return m ? +m[1] : 0; }));
  return pct ? `Up to ${pct}% off` : tags[0];
}
const perUnit = (cat, label) => (cat.unit && label === 'Regular' ? ' / unit' : '');

function TreatmentRow({ cat, it, uid, open, onToggle }) {
  const [name, note, opts] = it;
  const offer = bestOffer(opts);
  const from = Math.min(...opts.map((o) => o[1]));
  const fromUnit = perUnit(cat, opts.find((o) => o[1] === from)[0]);
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
            {offer && <span className="pr-badge">{offer}</span>}
            <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(from)}</span>{fromUnit}</span>
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
                <li key={label} className="pr-opt grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-[14px] bg-white py-3 pl-4 pr-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6 sm:pl-5">
                  <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="font-inter text-[15px] text-ndm-ink">{label}</span>
                    {tag && <span className="pr-tag">{tag}</span>}
                  </span>
                  <span className="col-start-1 row-start-2 flex items-baseline gap-2.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                    {was ? <s className="pr-was"><span className="sr-only">Regular price </span>{money(was)}</s> : null}
                    <span className={`font-aeonik text-[22px] leading-none tracking-[-0.02em] ${was ? 'text-ndm-deep' : 'text-ndm-ink'}`}>
                      {was ? <span className="sr-only">now </span> : null}{money(p)}{line.unit && <span className="font-inter text-[13px] tracking-normal text-ndm-muted">{line.unit}</span>}
                    </span>
                  </span>
                  <span className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><QtyControl line={line} label={`${name}, ${label}`} /></span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- hero: NDM's fees page video */
const FEES_VIDEO = 'assets/live/main/uploads/2025/09/Fees-Financin.-';
const IconPause = () => <Svg size={14} vb="0 0 14 14"><path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></Svg>;
const IconPlay = () => <Svg size={14} vb="0 0 14 14"><path d="M4 2.6v8.8a.5.5 0 0 0 .76.43l7.1-4.4a.5.5 0 0 0 0-.86l-7.1-4.4A.5.5 0 0 0 4 2.6Z" fill="currentColor" /></Svg>;

function PricingHero() {
  const ref = useRef(null), vid = useRef(null);
  useReveal(ref);
  const small = useMedia('(max-width: 767px)');
  const [paused, setPaused] = useState(REDUCED);
  useEffect(() => {
    const v = vid.current; if (!v) return;
    if (paused) v.pause(); else { const p = v.play(); if (p) p.catch(() => {}); }
  }, [paused, small]);
  const browse = (e) => {
    e.preventDefault();
    const el = document.getElementById('prices');
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 40);
  };
  const stats = [[`${PRICE_TOTAL} treatments`, 'Current prices and offers'], ['Free consultation', 'Before every treatment'], ['2 Toronto clinics', 'Uptown and Downtown']];
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="pricing-title" className="relative isolate flex min-h-[100svh] flex-col justify-end pt-[150px] md:h-[100svh] md:min-h-[640px] md:max-h-[1040px] md:pt-0 overflow-hidden bg-ndm-night text-white">
      <video ref={vid} key={small ? 'm' : 'd'} src={`${FEES_VIDEO}${small ? 'mobile' : 'desktop'}-version.mp4`} autoPlay={!REDUCED} muted loop playsInline preload="auto" aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.08) 28%,rgba(11,15,19,.12) 50%,rgba(11,15,19,.84) 100%)' }} />
      <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play background video' : 'Pause background video'}
        className="absolute right-[var(--gx)] top-[116px] grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-[10px] transition-colors hover:bg-white hover:text-ndm-ink xl:top-[140px]">
        {paused ? <IconPlay /> : <IconPause />}
      </button>
      {/* the page carries on below: a soft bouncing arrow at the bottom centre, which also scrolls to the prices */}
      <a href="#prices" onClick={browse} aria-label="Scroll to the price list" className="pr-scroll absolute bottom-4 left-1/2 z-[1] grid size-11 -translate-x-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-[10px] transition-colors hover:bg-white hover:text-ndm-ink md:bottom-6">
        <IconCaret />
      </a>
      <div className="px-[var(--gx)] pb-[clamp(84px,8vw,112px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-[760px]">
            <Eyebrow dark className="rv">Pricing</Eyebrow>
            <TwoTone as="h1" id="pricing-title" dark className="rv mt-5" size="text-[clamp(46px,6.4vw,100px)]" lead="Treatments &" strong="pricing" style={{ transitionDelay: '.06s' }} />
            {/* the live pricing page's introduction (approval item C1, 7 Nov 2026) */}
            <p className="rv mt-5 font-aeonik text-[clamp(20px,1.7vw,24px)] leading-[1.25] tracking-[-0.01em] text-white/95" style={{ transitionDelay: '.1s' }}>Your Trusted Destination for Cosmetic &amp; Aesthetic Treatments in Toronto</p>
            <p className="rv mt-3 max-w-[64ch] font-inter text-[15.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.12s' }}>
              Transform your look with confidence at NewdermaMed, the trusted destination for advanced cosmetic treatments in Toronto. Whether you’re considering CoolSculpting®, Botox, dermal fillers, or laser skin rejuvenation, our expert team delivers safe, proven, and personalized solutions to help you achieve your beauty goals. With state-of-the-art technology, exclusive promotions, and a commitment to natural-looking results, we make it easier than ever to look and feel your best. Book your free consultation today and discover why countless clients choose us for their face, body, and skin care transformations.
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
  const from = Math.min(...opts.map((o) => o[1]));
  const fromUnit = c.unit && opts.some((o) => o[1] === from && o[0] === 'Regular') ? ' / unit' : '';
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
            {offer && <span className="pr-badge">{offer}</span>}
            <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(from)}</span>{fromUnit}</span>
          </span>
          <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
        </button>
      </h3>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body" {...(on ? {} : { inert: '' })}>
        <div>
          <div className="flex items-center justify-between gap-x-4 pb-2 sm:gap-x-8">
            {c.blurb && <p className="min-w-0 max-w-[60ch] font-inter text-[15px] leading-[1.55] text-ndm-muted">{c.blurb}</p>}
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


/* ---------------------------------------------------------------- the live pricing page's monthly specials (approval item C2): eight cards, each "Buy" opens its price list section */
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
      <ul role="list" className="mx-auto mt-[clamp(28px,3.4vw,44px)] grid w-full max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-4">
        {sp.items.map(([n, price, id], i) => (
          <li key={n} className="rv rounded-[20px] bg-white p-4 ring-1 ring-ndm-ink/[.06] md:p-5" style={{ transitionDelay: `${0.04 * i}s` }}>
            <span className="inline-flex rounded-full bg-ndm-blue/10 px-2.5 py-1 font-inter text-[11px] font-semibold uppercase tracking-[.12em] text-ndm-deep">Up to</span>
            <span className="mt-3 block font-aeonik text-[clamp(26px,2.4vw,34px)] leading-none tracking-[-0.03em] text-ndm-ink">{price}</span>
            <span className="mt-2 block font-inter text-[15px] font-medium leading-[1.3] text-ndm-ink">{n}</span>
            <span className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1"><a href={`#${id}`} onClick={(e) => go(e, id)} className="btn btn-buy h-9 px-4 text-[13px]">Buy</a><span className="font-inter text-[12.5px] text-ndm-muted">{sp.note}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
