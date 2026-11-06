/* ---------------------------------------------------------------- procedure page data. One object per procedure; the layout below stays the same.
   Botox® Cosmetic: facts, text and images from NDM's /injectables/botox/ page. The brand name only appears with factual details
   (name, price, units, quantity); anything about effects is written about "the treatment" in qualified language (Health Canada C.01.044). */
const NDM_VIDEO = `${NDM}/wp-content/uploads/2025/10/Brand-Animation-Final.mp4`;
const PROC = {
  crumbs: [['Procedures'], ['Injectables'], 'Botox® Cosmetic'],
  title: ['Botox® Cosmetic', 'in Toronto'],
  sub: 'A prescription treatment given by our medical team after an in-person assessment, at our Uptown and Downtown clinics.',
  hero: { d: `${NDM}/wp-content/uploads/2025/09/2.jpg`, m: `${NDM}/wp-content/uploads/2025/09/2.1.jpg`, pos: '30% 30%' },
  offer: { tag: 'Current offer', title: 'Botox® Cosmetic packages', line: 'Up to 30% off packages of 60 to 220 units.', img: 'assets/pricing/price-1.jpg', href: '#prices', cta: 'View offer' },
  /* floating "at a glance" card (NDM's quick facts and both phone numbers) */
  facts: [['Treatment type', 'Injectable'], ['Duration', '30 minutes'], ['Recovery time', 'Minimal downtime']],
  glance: 'A short treatment, planned after a free, in-person assessment by our medical team.',
  /* what is this treatment (shared TxIntro: copy beside a photo with the treatment's main points) */
  intro: {
    tag: 'What is this treatment?', lead: 'A prescription treatment', strong: 'for expression lines',
    text: [
      'Small amounts of a prescription medicine are placed in specific facial muscles to relax them for a time, which may soften the lines that form when you frown, squint or raise your brows. It does not add volume.',
      'Your provider plans how much is used and where, around how your face moves, and only after an in-person medical assessment.',
    ],
    chips: ['Forehead lines', 'Frown lines', 'Crow’s feet'],
    note: 'Given only by licensed medical professionals at our Uptown and Downtown clinics.',
    img: 'assets/pricing/price-4.jpg', alt: 'A provider giving an injectable treatment with a fine needle', pos: '50% 35%',
    points: [
      ['Softer lines', 'May soften forehead lines, frown lines and crow’s feet.'],
      ['A natural look', 'Planned to keep your usual expressions. Individual results may vary.'],
      ['A quick visit', 'About 15 to 20 minutes, usually with minimal downtime.'],
    ],
  },
  /* treatment overview: four short summaries of NDM's tabs, pricing left out (after Elevra "About") */
  overview: [
    { label: 'Treatment overview', pre: '', to: 20, suf: '+', title: 'years of clinical research', text: 'A non-surgical treatment used in more than 78 countries. It relaxes the muscles behind expression lines for a time.' },
    { label: 'What to expect', pre: '15–', to: 20, suf: '', title: 'minutes per session', text: 'A very fine needle and a brief pinch. Most people return to their usual activities straight away.' },
    { label: 'How it works', pre: '3–', to: 7, suf: '', title: 'days to a visible change', text: 'It briefly blocks the nerve signals to treated muscles, so they contract less. It does not add volume.' },
    { label: 'Maintenance', pre: '3–', to: 4, suf: '', title: 'months, typical duration', text: 'Varies with the area, metabolism and lifestyle. Many people plan three to four visits a year.' },
  ],
  /* why choose this treatment: who it may suit and safety (after Latos "Advantages") */
  choose: {
    img: 'assets/pricing/price-3.jpg',
    cards: [
      ['Moderate to severe lines', 'For adults with moderate to severe expression lines on the forehead, between the brows or around the eyes.'],
      ['A subtle, natural look', 'For people who would like an understated change rather than a dramatic one.'],
      ['Planning ahead', 'For people who want to talk with a medical provider about early care for expression lines.'],
      ['Safety first', 'Given only by a qualified, licensed professional after a medical assessment. Mild redness, swelling or bruising may occur and usually settles within hours to days.'],
    ],
  },
  /* why NewDermaMed (shared TxWhy) */
  why: {
    img: 'assets/home/team-award.jpg', alt: 'The NewDermaMed team celebrating their Top Choice Award at the clinic', pos: '50% 35%',
    lead: 'Expert care at', strong: 'two Toronto clinics',
    items: [['16+', 'Years', 'Caring for patients in Toronto'], ['8', 'Awards', 'Top Choice Award, 2019 to 2026'], ['Licensed', 'Medical team', 'Injectables are given only by our licensed medical team'], ['Free', 'Consultation', 'Every plan starts with an in-person assessment']],
  },
  /* before & after (shared TxResults): three compact cards. Samples only, see HANDOFF */
  results: { lead: 'Before', strong: 'and after', text: 'Drag the handle on any photo to compare.', cases: BA_CASES.map((c) => ({ ...c, treat: 'Sample' })) },
  prices: {
    name: 'Botox Cosmetic', cat: 'Botox / Dysport', unitLabel: 'Regular',
    blurb: 'A prescription product priced per unit, given only after an in-person medical assessment.',
    rows: [['Regular', 12, 0], ['60 units', 648, 720, '10% OFF'], ['120 units', 1152, 1440, '20% OFF'], ['180 units', 1512, 2160, '30% OFF'], ['220 units', 1848, 2640, '30% OFF']],
  },
  faqs: [
    ['What is Botox® Cosmetic?', 'Botox® Cosmetic is a prescription medicine given by injection. At NewDermaMed it is only given after an in-person assessment by our medical team, who explain whether it suits you, the possible risks and the alternatives.'],
    ['Which areas are commonly treated?', 'Common treatment areas include forehead lines, frown lines between the brows and crow’s feet around the eyes. Your provider will discuss which areas are appropriate for you.'],
    ['When might I notice a change?', 'Changes are usually noticed within 3 to 7 days, with the full effect at about two weeks after treatment. Individual results may vary.'],
    ['How long does the effect last?', 'The effect typically lasts three to four months, depending on the area treated, your metabolism and lifestyle. Many people book maintenance visits three to four times a year.'],
    ['What side effects can occur?', 'Mild redness, swelling or bruising at the injection sites may occur and usually settles within hours to days. Your provider reviews all possible side effects with you before any treatment.'],
    ['How much does it cost?', 'Botox® Cosmetic is $12 per unit, with packages of 60 to 220 units currently 10% to 30% off. See the price list for details; your final price is confirmed at your free consultation.'],
  ],
};

const CALLS = [['Downtown', PHONES[1].num], ['Uptown', PHONES[0].num]];
const twoLine = (lead) => <>{lead}<br /></>;
const IconClock = (props) => <Svg size={30} vb="0 0 32 32" {...props}><circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.8" /><path d="M16 9v7.5l4.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
const IconTick = (p) => <Svg size={14} vb="0 0 14 14" {...p}><path d="m3 7.3 2.6 2.6L11 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></Svg>;

/* ---------------------------------------------------------------- booking form (hero card on desktop, its own block on phones) */
function ProcForm({ id, className = '' }) {
  const [sent, setSent] = useState(false);
  const [treat, setTreat] = useState('Injectables');
  const [clinic, setClinic] = useState('');
  const hid = `${id}-title`;
  return (
    <div className={`proc-form rounded-[22px] bg-white p-[clamp(20px,2.2vw,30px)] text-ndm-ink ${className}`}>
      {sent ? (
        <div className="flex min-h-[380px] items-center justify-center"><BookThanks onAnother={() => setSent(false)} /></div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} aria-labelledby={hid}>
          <h2 id={hid} className="font-aeonik text-[clamp(24px,2vw,30px)] font-normal leading-[1.1] tracking-[-0.025em]">
            Book your <br /><span className="tt-strong text-ndm-deep">free consultation</span>
          </h2>
          <div className="mt-5 grid gap-2.5">
            <input required name="name" autoComplete="name" placeholder="Your name" aria-label="Your name" className={fieldCls} />
            <input required type="email" name="email" autoComplete="email" placeholder="Your email" aria-label="Your email" className={fieldCls} />
            <input required type="tel" name="phone" autoComplete="tel" placeholder="Your phone number" aria-label="Your phone number" className={fieldCls} />
            <BookSelect name="treatment" value={treat} onChange={(e) => setTreat(e.target.value)} placeholder="Select your treatment">
              {BOOK_TREATMENTS.map((t) => <option key={t} className="text-ndm-ink">{t}</option>)}
            </BookSelect>
            <BookSelect name="clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Select clinic location">
              {BOOK_CLINICS.map(([c, a]) => <option key={c} value={c} className="text-ndm-ink">{c}, {a}</option>)}
            </BookSelect>
            <textarea name="notes" rows={2} placeholder="Any concerns or questions?" aria-label="Any concerns or questions?" className={`${fieldCls} h-auto resize-none py-3`} />
          </div>
          <Btn v="book" hot block className="mt-4" type="submit">Book Free Consultation</Btn>
          <p className="mt-3 font-inter text-[12px] leading-[1.5] text-ndm-muted">Free and no obligation. A provider confirms whether the treatment suits you.</p>
        </form>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- hero: photo, title, glass offer card, form on the right */
function ProcHero({ p }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  const small = useMedia('(max-width: 767px)');
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    const h = img.parentElement.offsetHeight;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.2, h * 0.1).toFixed(1)}px,0)`;
  }, []);
  const o = p.offer;
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="proc-title" className="relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <img ref={pic} src={small ? p.hero.m : p.hero.d} alt="" fetchpriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: p.hero.pos }} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.72) 0%,rgba(11,15,19,.38) 50%,rgba(11,15,19,.18) 100%),linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,0) 30%,rgba(11,15,19,.35) 100%)' }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,.25) 30%,rgba(11,15,19,.6) 62%,rgba(11,15,19,.88) 100%)' }} />
      <div className="grid items-end gap-10 px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)] pt-[184px] sm:pt-[170px] lg:min-h-[min(100svh,920px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[640px]">
          <TwoTone as="h1" id="proc-title" dark className="rv" size="text-[clamp(44px,5.6vw,88px)]" lead={<>{p.title[0]}<br /></>} strong={p.title[1]} />
          <p className="rv mt-5 max-w-[48ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.08s' }}>{p.sub}</p>
          {/* the offer, at a glance (Medsecom hero card idea, frosted glass); only when the page has one */}
          {o && <div className="rv offer-glass mt-8 flex max-w-[520px] items-center gap-4 rounded-[20px] p-3 pr-4 sm:gap-5" style={{ transitionDelay: '.16s' }}>
            <span className="relative block size-[88px] shrink-0 overflow-hidden rounded-[14px] sm:size-[104px]">
              <img src={o.img} alt="" className="h-full w-full object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="offer-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-[11.5px] font-medium">
                <i className="offer-dot size-1.5 rounded-full bg-ndm-amber" />{o.tag}
              </span>
              <p className="mt-2 font-aeonik text-[clamp(18px,1.5vw,21px)] leading-[1.2] tracking-[-0.01em] text-white">{o.title}</p>
              <p className="mt-1 font-inter text-[13.5px] leading-[1.45] text-white/75">{o.line}</p>
              <a href={o.href} className="group mt-2.5 inline-flex items-center gap-1.5 font-inter text-[13.5px] font-medium text-white underline-offset-4 hover:underline">
                {o.cta}<IconArrow className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>}
        </div>
        <ProcForm id="hero-form" className="rv hidden lg:block" />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- treatment at a glance: quick facts and both phone numbers.
   Floats in the right rail on wide screens (until "Why choose"), sits under the hero on phones and tablets */
function ProcGlance({ p, wide }) {
  return (
    <div className={`glance-card rounded-[24px] bg-ndm-mist p-[clamp(22px,2.4vw,32px)] ${wide ? 'md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:items-end md:gap-10' : ''}`}>
      <div>
        <TwoTone id={wide ? 'glance-title-m' : 'glance-title'} size="text-[clamp(26px,2.2vw,32px)]" lead={twoLine('Treatment')} strong="at a glance" />
        <p className="mt-3 max-w-[40ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{p.glance}</p>
        <dl className={`mt-6 grid gap-3.5 ${wide ? (p.facts.length > 3 ? 'sm:grid-cols-2' : 'sm:grid-cols-3') : ''}`}>
          {p.facts.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3.5">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-ndm-deep text-white"><IconTick /></span>
              <div className="min-w-0">
                <dt className="font-inter text-[12.5px] leading-[1.3] text-ndm-muted">{k}</dt>
                <dd className="font-inter text-[16px] font-medium leading-[1.3] text-ndm-ink">{v}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className={`mt-7 grid gap-2.5 ${wide ? 'md:mt-0' : ''}`}>
        {CALLS.map(([n, num]) => (
          <a key={n} href={tel(num)} aria-label={`Call the ${n} clinic at ${num}`} className="btn btn-buy btn-block h-[54px] gap-2.5 px-4 text-[15px]">
            <IconPhone className="shrink-0" /><span className="truncate">{num} {n}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- treatment overview: centred heading, four counting cards in a row (Elevra "About" cards) */
function ProcOverview({ p }) {
  const ref = useRef(null), grid = useRef(null);
  useReveal(ref);
  const run = useInView(grid, { threshold: 0.3 });
  return (
    <section ref={ref} id="overview" aria-labelledby="overview-title" className="relative z-10 bg-white px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="overview" tag="Treatment overview" hid="overview-title" lead="From first visit" strong="to maintenance" text="What the treatment is, what to expect, how it works and how long it typically lasts. Individual results may vary." />
      <ul ref={grid} className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-4`} role="list">
        {p.overview.map((c, i) => (
          <li key={c.label} className="rv ov-card relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[22px] bg-ndm-paper p-[clamp(18px,1.8vw,24px)] text-ndm-ink sm:min-h-[230px]" style={{ transitionDelay: `${0.06 * i}s` }}>
            <div>
              <p className="font-inter text-[12px] font-[550] uppercase tracking-[.14em] text-ndm-deep">{c.label}</p>
              <p className="mt-3 font-aeonik text-[clamp(40px,3.6vw,56px)] leading-none tracking-[-0.04em] tabular-nums">{c.pre}<CountUp to={c.to} run={run} suffix={c.suf} /></p>
            </div>
            <div className="mt-5 sm:mt-8">
              <h3 className="font-aeonik text-[19px] font-normal leading-[1.2] tracking-[-0.01em]">{c.title}</h3>
              <p className="mt-1.5 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="rv mt-8 flex justify-center"><Btn href="#/book" v="book">Book Free Consultation</Btn></div>
    </section>
  );
}

/* ---------------------------------------------------------------- why choose this treatment (Latos "Advantages"):
   two cards each side of a tall photo, no numbering */
function ProcChoose({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const c = p.choose.cards;
  const card = ([t, d], i) => (
    <li key={t} className="rv flex flex-col rounded-[22px] bg-white sm:min-h-[220px] p-[clamp(20px,2vw,28px)] ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.06 * i}s` }}>
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconCheckBadge /></span>
      <h3 className="mt-auto pt-5 font-aeonik text-[22px] sm:pt-8 font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink">{t}</h3>
      <p className="mt-2 font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{d}</p>
    </li>
  );
  return (
    <section ref={ref} id="why-choose" aria-labelledby="choose-title" className="relative z-10 bg-ndm-mist px-[var(--gx)] py-[clamp(72px,8vw,120px)]">
      <div className="text-center">
        <Eyebrow className="rv">Why choose this treatment</Eyebrow>
        <TwoTone id="choose-title" className="rv mx-auto mt-5" lead={twoLine('Who it may suit,')} strong="and safety first" style={{ transitionDelay: '.06s' }} />
        <p className="rv mx-auto mt-4 max-w-[48ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Your provider confirms whether the treatment suits you at your free consultation.</p>
      </div>
      <div className="mx-auto mt-[clamp(36px,4vw,56px)] grid max-w-[1180px] gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4">
        <div className="rv rv-clip relative min-h-[360px] overflow-hidden rounded-[22px] bg-ndm-line md:col-span-2 lg:order-2 lg:col-span-1 lg:min-h-0" style={{ transitionDelay: '.08s' }}>
          <img src={p.choose.img} alt="Close-up of a woman’s face in soft natural light" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" />
        </div>
        <ul className="grid gap-3 lg:order-1 lg:gap-4" role="list">{c.slice(0, 2).map(card)}</ul>
        <ul className="grid gap-3 lg:order-3 lg:gap-4" role="list">{c.slice(2).map((x, i) => card(x, i + 2))}</ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- prices, in the Pricing page's style: one open category
   with its options on the white panel; every option can go straight into the cart */
function ProcPrices({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const [on, setOn] = useState(true);
  const pr = p.prices;
  const unit = (label) => (label === pr.unitLabel ? ' / unit' : '');
  const pct = Math.max(...pr.rows.map((r) => { const m = /^(\d+)% OFF$/.exec(r[3] || ''); return m ? +m[1] : 0; }));
  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        <div className="text-center">
          <Eyebrow className="rv">Price list</Eyebrow>
          <TwoTone id="prices-title" className="rv mx-auto mt-5" lead={twoLine('Botox® Cosmetic')} strong="prices and packages" style={{ transitionDelay: '.06s' }} />
          <p className="rv mx-auto mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Prices per unit and per package, with current offers. Your plan and final price are confirmed at your free consultation.</p>
        </div>
        <ul className="pr-groups rv mt-[clamp(40px,4.5vw,64px)]" role="list" style={{ transitionDelay: '.14s' }}>
          <li className={`pr-group ${on ? 'is-open' : ''}`}>
            <h3 className="pr-ghead m-0">
              <button type="button" id="proc-pr-h" aria-expanded={on} aria-controls="proc-pr" onClick={() => setOn((v) => !v)}
                className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
                <span className="min-w-0">
                  <span className="block font-inter text-[12.5px] tabular-nums text-ndm-muted">{pr.rows.length} options</span>
                  <span className="mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">Botox® Cosmetic</span>
                </span>
                <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                  {pct > 0 && <span className="pr-badge">Up to {pct}% off</span>}
                  <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(Math.min(...pr.rows.map((r) => r[1])))}</span> / unit</span>
                </span>
                <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
              </button>
            </h3>
            <div id="proc-pr" role="region" aria-labelledby="proc-pr-h" className="pr-body" {...(on ? {} : { inert: '' })}>
              <div>
                <p className="max-w-[60ch] pb-2 font-inter text-[15px] leading-[1.55] text-ndm-muted">{pr.blurb}</p>
                <ul className="pr-sub grid gap-2 py-4" role="list">
                  {pr.rows.map(([label, price, was, tag]) => {
                    const line = { key: `${pr.name}|${label}`, cat: pr.cat, name: pr.name, label, price, was: was || 0, unit: unit(label) };
                    return (
                      <li key={label} className="pr-opt grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-[14px] py-3 pl-4 pr-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6 sm:pl-5">
                        <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          <span className="font-inter text-[15px] text-ndm-ink">{label === 'Regular' ? 'Per unit' : label}</span>
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
        <p className="mt-8 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">
          Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation.
        </p>
      </div>
    </section>
  );
}
