/* ---------------------------------------------------------------- procedure page data. One object per procedure; the layout below stays the same.
   Botox® Cosmetic: facts, text and images from NDM's /injectables/botox/ page. The brand name only appears with factual details
   (name, price, units, quantity); anything about effects is written about "the treatment" in qualified language (Health Canada C.01.044). */
const NDM_VIDEO = 'assets/live/main/uploads/2025/10/Brand-Animation-Final.mp4';
const PROC = {
  crumbs: [['Procedures'], ['Injectables'], 'Botox® Cosmetic'],
  title: ['Botox® Cosmetic', 'in Toronto'],
  sub: 'A prescription treatment given by our medical team after an in-person assessment, at our Uptown and Downtown clinics.',
  hero: { d: 'assets/live/main/uploads/2025/09/2.jpg', m: 'assets/live/main/uploads/2025/09/2.1.jpg', pos: '30% 30%' },
  offer: { tag: 'Current offer', title: 'Botox® Cosmetic packages', big: ['Up to', '30%', 'off'], href: '#prices', cta: 'See the prices' },
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
    /* shown alone beside the photo: everything above and below in one paragraph */
    para: 'Small amounts of a prescription medicine are placed in specific facial muscles to relax them for a time, which may soften the lines that form when you frown, squint or raise your brows, such as forehead lines, frown lines and crow’s feet. It does not add volume. Your provider plans how much is used and where, around how your face moves, so your usual expressions can stay natural, and only after an in-person medical assessment. A visit takes about 15 to 20 minutes, usually with minimal downtime, and the treatment is given only by licensed medical professionals at our Uptown and Downtown clinics. Individual results may vary.',
    img: 'assets/pricing/price-4.jpg', alt: 'A provider giving an injectable treatment with a fine needle', pos: '50% 35%',
    points: [
      ['Softer lines', 'May soften forehead lines, frown lines and crow’s feet.'],
      ['A natural look', 'Planned to keep your usual expressions. Individual results may vary.'],
      ['A quick visit', 'About 15 to 20 minutes, usually with minimal downtime.'],
    ],
  },
  /* your treatment, in tabs (after the thread lift page's treatment overview: what to expect, how it works, maintenance, pricing).
     Effects are written about "the treatment" in qualified language; the brand name only appears with the price (C.01.044) */
  overview: {
    tag: 'Your treatment', lead: 'From first visit', strong: 'to maintenance',
    tabs: [
      { label: 'Overview', stat: ['20+', 'years of clinical research'], text: [
        'A non-surgical treatment used in more than 78 countries, with more than 20 years of clinical research behind it. It relaxes the muscles behind expression lines for a time, and it does not add volume.',
        'At NewDermaMed it is given only by our licensed medical team, after a free, in-person assessment at our Uptown or Downtown clinic. Individual results may vary.'] },
      { label: 'What to expect', stat: ['15–20', 'minutes per treatment'], text: [
        'Your visit starts with a free, in-person assessment at our Uptown or Downtown clinic. A member of our medical team reviews your health history, your goals and how your face moves, and explains whether the treatment suits you, its possible risks and the alternatives.',
        'If it is appropriate, the treatment itself takes about 15 to 20 minutes, with a very fine needle and a brief pinch. Most people return to their usual activities straight away. Mild redness, swelling or bruising at the injection sites may occur and usually settles within hours to days. Individual results may vary.'] },
      { label: 'How it works', stat: ['3–7', 'days to a visible change'], text: [
        'Small amounts of a prescription medicine are placed in specific facial muscles. It briefly blocks the nerve signals to those muscles, so they contract less for a time, which may soften the lines that form when you frown, squint or raise your brows.',
        'A change is usually noticed within 3 to 7 days, with the full effect at about two weeks. The treatment does not add volume, so your provider may discuss other options for lines that stay when your face is at rest.'] },
      { label: 'Maintenance', stat: ['3–4', 'months, typical duration'], text: [
        'The effect typically lasts three to four months, depending on the area treated, your metabolism and your lifestyle. Many people plan three to four visits a year.',
        'Your provider reviews your plan at each visit and adjusts the amount and placement as needed. Individual results may vary.'] },
      { label: 'Pricing', stat: ['$12', 'per unit'], text: [
        'Botox® Cosmetic is $12 per unit, with packages of 60 to 220 units currently 10% to 30% off.',
        'The number of units depends on the areas treated and your plan, so your final price is confirmed at your free consultation.'], link: ['#prices', 'See the price list'] },
    ],
  },
  /* compare the options (website v3 concern pages): this treatment beside the other options for lines. A general guide only */
  compare: {
    cols: [['This treatment', null], ['Dermal Fillers', '#/dermal-fillers'], ['Laser Skin Resurfacing', '#/laser-skin-resurfacing'], ['Skin Boosters', '#/skin-boosters']],
    rows: [
      ['How it works', ['Relaxes the muscles behind expression lines for a time', 'Hyaluronic acid gel restores volume and support', 'Laser renews the outer layers and builds collagen', 'Fine hyaluronic acid improves hydration and quality']],
      ['Often chosen for', ['Lines that form when your face moves', 'Folds that stay at rest, and lost volume', 'Fine lines and texture', 'Crepey skin and fine lines']],
      ['Typical course', ['One short visit, repeated every 3 to 4 months', 'Usually one session, with an optional review at 2 weeks', '1 to 3 sessions, depending on depth', 'Often 2 to 3 sessions, about a month apart']],
      ['Downtime', ['Minimal; mild redness or swelling may occur', 'Possible swelling or bruising for a few days', 'From 1 to 2 days (laser peel) to 5 to 10 days (deeper resurfacing)', 'Small bumps or redness for 1 to 2 days']],
      ['When results may appear', ['Within 3 to 7 days, full effect at about 2 weeks', 'Visible right away, settling over about 2 weeks', 'As the skin heals, with collagen changes over 3 to 6 months', 'Gradual over 2 to 4 weeks']],
      ['Starting price', ['$12 per unit', 'From $750', 'From $200', 'From $399']],
    ],
  },
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
          <p className="mt-3 font-inter text-[12px] leading-[1.5] text-ndm-muted">Free and no obligation.</p>
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
          {/* the offer, at a glance: frosted glass with a light that sweeps across it now and then; no photo */}
          {o && <a href={o.href} aria-label={`${o.tag}: ${o.title}, ${o.big.join(' ')}. ${o.cta}`} className="rv offer-glass offer-shine group mb-5 mt-7 inline-flex max-w-full items-center gap-4 overflow-hidden rounded-[18px] lg:mb-0 py-3 pl-4 pr-3" style={{ transitionDelay: '.16s' }}>
            <span className="min-w-0">
              <span className="offer-pill inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-inter text-[11px] font-medium"><i className="offer-dot size-1.5 rounded-full bg-ndm-amber" />{o.tag}</span>
              <span className="mt-1.5 block font-aeonik text-[17px] leading-[1.2] tracking-[-0.01em] text-white">{o.title}</span>
            </span>
            <span className="offer-big flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-inter text-[11px] uppercase tracking-[.14em] text-white/70">{o.big[0]}</span>
              <span className="font-aeonik text-[34px] leading-none tracking-[-0.03em] text-white">{o.big[1]}</span>
              <span className="font-inter text-[11px] uppercase tracking-[.14em] text-[#FFC266]">{o.big[2]}</span>
            </span>
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-ndm-ink"><IconArrow /></span>
          </a>}
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

/* ---------------------------------------------------------------- your treatment, in tabs (the thread lift page's treatment overview,
   in the site's own look): a tab row, then the words on the left and the key number on the right */
function ProcOverview({ p }) {
  const ref = useRef(null), tabs = useRef([]);
  useReveal(ref);
  const o = p.overview;
  const [act, setAct] = useState(0);
  const t = o.tabs[act];
  const key = (e, i) => {
    const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + o.tabs.length) % o.tabs.length;
    setAct(n); if (tabs.current[n]) tabs.current[n].focus();
  };
  return (
    <section ref={ref} id="overview" aria-labelledby="overview-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="overview" tag={o.tag} hid="overview-title" lead={o.lead} strong={o.strong} />
      <div className={`${TX_WRAP} rv mt-[clamp(32px,4vw,52px)] overflow-hidden rounded-[28px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(27,36,43,.45)]`} style={{ transitionDelay: '.08s' }}>
        <div role="tablist" aria-label="About the treatment" className="no-scrollbar mx-[clamp(14px,2.2vw,28px)] mt-[clamp(14px,2.2vw,28px)] flex gap-1 overflow-x-auto rounded-full bg-ndm-mist p-1">
          {o.tabs.map((x, i) => (
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
            {t.text.map((x, i) => <p key={i} className="mt-4 max-w-[62ch] font-inter text-[16px] leading-[1.75] text-ndm-ink/80">{x}</p>)}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
              {t.link && <a href={t.link[0]} className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">{t.link[1]}<IconArrow className="transition-transform group-hover:translate-x-1" /></a>}
            </div>
          </div>
          <aside className="ov-side flex flex-col rounded-[20px] p-5 ring-1 ring-ndm-ink/[.06]">
            <span className="font-inter text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">At a glance</span>
            <span className="mt-3 flex items-baseline gap-2.5">
              <span className="font-aeonik text-[34px] leading-none tracking-[-0.03em] text-ndm-deep tabular-nums">{t.stat[0]}</span>
              <span className="font-inter text-[14px] leading-[1.35] text-ndm-ink">{t.stat[1]}</span>
            </span>
            <dl className="mt-5 grid gap-2.5 border-t border-ndm-line pt-4">
              {p.facts.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-3 font-inter text-[13.5px]"><dt className="text-ndm-muted">{k}</dt><dd className="text-right font-medium text-ndm-ink">{v}</dd></div>)}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- compare the options (website v3 concern pages): a table in the
   site's look, this treatment first and lightly highlighted; it scrolls sideways on phones */
function ProcCompare({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const c = p.compare;
  return (
    <section ref={ref} id="compare" aria-labelledby="compare-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      <TxHead p={p} id="compare" tag="Compare the options" hid="compare-title" lead="This treatment, beside" strong="the other options" text="A general guide to the treatments often discussed for lines. Your provider helps you choose at your free consultation." />
      <div className={`${TX_WRAP} rv mt-[clamp(32px,4vw,52px)] overflow-x-auto rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(27,36,43,.45)]`} style={{ transitionDelay: '.08s' }}>
        <table className="cmp-t w-full min-w-[760px] border-collapse font-inter text-[14.5px]">
          <thead>
            <tr>
              <td className="w-[170px]" />
              {c.cols.map(([n, h], i) => (
                <th key={n} scope="col" className={`px-5 py-5 text-left align-bottom font-aeonik text-[19px] font-normal leading-[1.2] tracking-[-0.01em] ${i === 0 ? 'cmp-me text-ndm-deep' : 'text-ndm-ink'}`}>
                  {h ? <a href={h} className="group inline-flex items-center gap-1.5 hover:text-ndm-deep">{n}<IconArrow className="opacity-60 transition-transform group-hover:translate-x-0.5" /></a> : n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map(([k, vals]) => (
              <tr key={k}>
                <th scope="row" className="px-5 py-4 text-left align-top text-[13px] font-semibold text-ndm-muted">{k}</th>
                {vals.map((v, i) => <td key={i} className={`px-5 py-4 align-top leading-[1.5] text-ndm-ink ${i === 0 ? 'cmp-me' : ''}`}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`${TX_WRAP} mt-4 font-inter text-[12.5px] leading-[1.5] text-ndm-muted`}>A general guide for comparison. Your plan is individual, and individual results may vary.</p>
    </section>
  );
}

/* ---------------------------------------------------------------- start with a free skin analysis (afuriaesthetics.com "Start your journey"):
   a short warm band; when it comes into view it opens from the middle out to both sides, then the words sharpen
   from a blur. The portrait sits on the right and fades into the wall colour behind the words */
const JR_CSS = `
.jr-band{--jr:#E8D6C2;background:var(--jr);clip-path:inset(0 50% 0 50%);transition:clip-path 1.25s cubic-bezier(.7,0,.2,1)}
.jr-band.is-on{clip-path:inset(0 0 0 0)}
.jr-band .jr-pic{transform:scale(1.14);transition:transform 2.2s cubic-bezier(.2,.7,.2,1)}
.jr-band.is-on .jr-pic{transform:scale(1)}
.jr-band .jr-t{opacity:0;filter:blur(14px);transform:translateY(12px);transition:opacity .9s ease,filter 1.1s ease,transform 1.1s cubic-bezier(.2,.7,.2,1)}
.jr-band.is-on .jr-t{opacity:1;filter:blur(0);transform:none}
.jr-fade{background:linear-gradient(180deg,rgba(232,214,194,0) 45%,var(--jr) 98%)}
@media (min-width:768px){.jr-fade{background:linear-gradient(90deg,var(--jr) 0%,rgba(232,214,194,.85) 14%,rgba(232,214,194,0) 46%)}}
@media (prefers-reduced-motion:reduce){.jr-band,.jr-band .jr-pic,.jr-band .jr-t{clip-path:none;transform:none;filter:none;opacity:1;transition:none}}
`;
function ProcAnalysis() {
  const band = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = band.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const t = (k) => ({ transitionDelay: `${0.85 + k * 0.12}s` });
  return (
    <section aria-labelledby="analysis-title" className="relative z-10 py-[clamp(16px,2.4vw,36px)]">
      <style>{JR_CSS}</style>
      <div ref={band} className={`jr-band relative isolate flex flex-col overflow-hidden md:min-h-[clamp(360px,31vw,460px)] md:justify-center ${on ? 'is-on' : ''}`}>
        <div className="relative aspect-[4/3] overflow-hidden md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[64%]">
          <img src="assets/treatments/journey-skin.webp" alt="" loading="lazy" decoding="async" className="jr-pic absolute inset-0 h-full w-full object-cover object-[52%_30%]" />
          <span aria-hidden="true" className="jr-fade absolute inset-0" />
        </div>
        <div className="relative -mt-10 px-[var(--gx)] pb-10 md:mt-0 md:max-w-[min(48%,560px)] md:py-10">
          <p className="jr-t font-inter text-[12px] font-medium uppercase tracking-[.28em] text-ndm-deep" style={t(0)}>Start your journey</p>
          <TwoTone id="analysis-title" className="jr-t mt-3" size="text-[clamp(32px,3.6vw,54px)]" lead={<>Start with a free<br /></>} strong="skin analysis" style={t(1)} />
          <p className="jr-t mt-4 max-w-[44ch] font-inter text-[15.5px] leading-[1.6] text-ndm-ink/75" style={t(2)}>Your first consultation and VISIA® skin analysis are free, at Uptown or Downtown. No pressure, just a clear plan.</p>
          <div className="jr-t mt-6 flex flex-wrap items-center gap-x-6 gap-y-3" style={t(3)}>
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
            <a href="about.html" className="font-inter text-[13px] font-semibold uppercase tracking-[.14em] text-ndm-ink underline-offset-8 hover:underline">Find a clinic</a>
          </div>
        </div>
      </div>
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
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
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
