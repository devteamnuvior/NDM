/* ---------------------------------------------------------------- procedure page data. One object per procedure; the layout below stays the same.
   Botox® Cosmetic: facts, text and images from NDM's /injectables/botox/ page. The brand name only appears with factual details
   (name, price, units, quantity); anything about effects is written about "the treatment" in qualified language (Health Canada C.01.044). */
const NDM_VIDEO = `${NDM}/wp-content/uploads/2025/10/Brand-Animation-Final.mp4`;
const PROC = {
  /* round 12: the content of Ray's Botox page (his live-site build, ray/V1/NDM/botox.html), kept word for word, in this page's
     own sections. It is the live site's wording; it names Botox® beside its effects, so it needs Raymond's approval before publishing */
  crumbs: [['Procedures'], ['Injectables'], 'Botox®'],
  /* the sticky section bar (TxNav): the same items as Ray's Botox page */
  nav: [['benefits', 'Benefits'], ['film', 'The clinic'], ['overview', 'About'], ['why-choose', 'Why choose'], ['watch', 'Watch'], ['results', 'Results'], ['prices', 'Prices'], ['why', 'Why NewDermaMed'], ['visit', 'Visit us'], ['faq', 'FAQ']],
  title: ['Botox®', 'in Toronto'],
  sub: 'Smooth wrinkles with trusted Botox® safe, expert care for natural, youthful results.',
  hero: { d: 'assets/botox/hero.jpg', m: 'assets/botox/hero-m.jpg', pos: '50% 30%' },
  offer: { tag: 'Current offer', title: 'Botox® Cosmetic packages', big: ['Up to', '30%', 'off'], href: '#prices', cta: 'See the prices' },
  facts: [['Treatment Type', 'Injectable'], ['Duration', '30 minutes'], ['Recovery Time', 'Minimal downtime']],
  glance: 'A short treatment, planned after a free, in-person assessment by our medical team.',
  /* Benefits (TxIntro, id "benefits"): Ray's five benefit points beside his photo */
  intro: {
    id: 'benefits', tag: 'Benefits', lead: 'Benefits', strong: 'of Botox®',
    img: 'assets/botox/benefits.webp', alt: 'Botox® at NewDermaMed, Toronto', pos: '50% 40%',
    text: [],
    points: [
      ['Smooths Fine Lines & Wrinkles', 'Softens crow’s feet, frown lines, and forehead creases.'],
      ['Prevents New Wrinkle Formation', 'Relaxes facial muscles to reduce future expression lines.'],
      ['Quick & Convenient', 'Treatment takes only minutes with no downtime required.'],
      ['Natural-Looking Results', 'Refreshes appearance without affecting facial expressions.'],
      ['Clinically Proven & Safe', 'Backed by 20+ years of research and global trust.'],
    ],
  },
  /* The clinic (TxFilm): the clinic footage, Ray's words */
  film: { src: 'assets/botox/clinic-film.mp4', src_m: 'assets/botox/clinic-film-m.mp4', poster: 'assets/botox/clinic-film.webp', lead: 'Botox®', strong: 'at NewDermaMed Toronto',
    text: 'Two clinics, Uptown on Yonge Street and Downtown on Bay Street. Every visit starts with a free consultation and a VISIA® skin analysis with our licensed medical team.',
    chips: ['4763 Yonge St, Uptown', '790 Bay St, Downtown', 'Free consultation', 'VISIA® skin analysis'] },
  /* About (ProcOverview tabs): Ray's five tabs; the key numbers beside them are this page's */
  overview: {
    tag: 'About', lead: 'From first visit', strong: 'to maintenance',
    tabs: [
      { label: 'Treatment Overview', stat: ['20+', 'years of clinical research'], text: [
        'By momentarily relaxing the underlying muscles that cause expression lines, Botox® Cosmetic is a reliable, non-surgical procedure that reduces wrinkles and fine lines. Botox® is one of the most researched and secure cosmetic procedures in the world, having been used in more than 78 countries and undergoing more than 20 years of clinical research. Our experts at NewDermaMed use precise injections to produce refreshed, natural-looking results without changing your distinctive facial expressions.'] },
      { label: 'What to Expect', stat: ['15–20', 'minutes per treatment'], text: [
        'A typical Botox® session lasts 15 to 20 minutes, making it quick and convenient. Our skilled injector will assess your facial structure during your visit and use a tiny needle to carefully apply the treatment. The majority of patients describe the slight discomfort as a momentary pinch. It’s the ideal “lunchtime procedure” because you can get back to your regular activities right away. Within three to seven days, noticeable progress is made, and in roughly two weeks, the full effects are achieved.'] },
      { label: 'How it Works', stat: ['3–7', 'days to a visible change'], text: [
        'Purified botulinum toxin type A, which temporarily stops nerve signals to the targeted muscles, is an ingredient in Botox®. The skin above these muscles smoothes out and wrinkles like frown lines, forehead lines, and crow’s feet are lessened by lowering repetitive contractions. Instead of adding volume, the treatment prevents and corrects dynamic wrinkles brought on by facial movement.'] },
      { label: 'Maintenance', stat: ['3–4', 'months, typical duration'], text: [
        'Although longevity can vary depending on lifestyle, metabolism, and treatment area, Botox® results typically last three to four months. Patients are advised to arrange maintenance procedures three to four times a year in order to preserve a young, refreshed appearance. Over time, results might last longer with regular treatments.'] },
      { label: 'Pricing', stat: ['$12', 'per unit'], text: [
        'Treatment plans are completely customized because each face is different. We invite you to schedule a free consultation with one of our experts so that you can go over your options, talk about your objectives, and create a plan that is specifically for you.'], link: ['#prices', 'See the price list'] },
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
  /* Why choose (ProcChoose): Ray's candidate list and safety paragraph; the short card titles are this page's */
  choose: {
    img: 'assets/botox/why-choose.jpg', alt: 'Botox® at NewDermaMed, Toronto', tag: 'Why choose', lead: 'Why choose', strong: 'Botox®?',
    cards: [
      ['A good candidate', 'People seeking a non-invasive anti-aging treatment who have moderate to severe fine lines or wrinkles'],
      ['Understated results', 'Anyone seeking understated, organic improvements'],
      ['Preventative care', 'Those looking for preventative wrinkle care'],
      ['Is Botox® safe?', 'When administered by a qualified, licensed professional, Botox® has a demonstrated safety profile. The injection site may experience mild redness, swelling, or bruising, but these side effects are rare and usually go away in a few hours to days. Choosing an experienced provider ensures natural-looking results and minimized risk of complications.'],
    ],
  },
  /* Watch (TxReel): the clinic's Instagram reel */
  reel: { src: 'assets/botox/reel.mp4', poster: 'assets/botox/reel.webp', tag: 'Botox®', lead: 'See it', strong: 'at NewDermaMed', text: 'A short clip from our Instagram, filmed at the clinic. Follow @newdermamed for more.' },
  /* Why NewDermaMed (TxWhy) */
  why: {
    img: 'assets/home/team-award.jpg', alt: 'The NewDermaMed team celebrating their Top Choice Award at the clinic', pos: '50% 35%',
    lead: 'Expert care at', strong: 'two Toronto clinics',
    items: [['16+', 'Years', 'Caring for patients in Toronto'], ['8', 'Awards', 'Top Choice Award, 2019 to 2026'], ['Licensed', 'Medical team', 'Treatments are given only by our licensed medical team'], ['Free', 'Consultation', 'Every plan starts with an in-person assessment']],
  },
  /* Results (TxResults): the live gallery's Botox® cases (each photo shows before and after side by side) */
  results: { lead: 'Before', strong: 'and after', text: 'Cases from our before and after gallery, photographed at NewDermaMed.', more: 'before-after.html',
    pics: [{ src: 'assets/botox/case-1.webp', label: 'Botox®' }, { src: 'assets/botox/case-2.webp', label: 'Botox®' }, { src: 'assets/botox/case-3.webp', label: 'Botox®' }] },
  /* Prices (ProcPrices): Ray's two groups, Botox Cosmetic and Dysport */
  prices: {
    lead: 'Botox® and Dysport®', cat: 'Botox / Dysport', unitLabel: 'Regular',
    groups: [
      { name: 'Botox Cosmetic', title: 'Botox® Cosmetic', blurb: 'A prescription product priced per unit, given only after an in-person medical assessment.',
        rows: [['Regular', 12, 0], ['60 units', 648, 720, '10% OFF'], ['120 units', 1152, 1440, '20% OFF'], ['180 units', 1512, 2160, '30% OFF'], ['220 units', 1848, 2640, '30% OFF']] },
      { name: 'Dysport', title: 'Dysport®', blurb: 'A prescription product priced per unit, given only after an in-person medical assessment.',
        rows: [['Regular', 11, 0], ['60 units', 594, 660, '10% OFF'], ['120 units', 1056, 1320, '20% OFF'], ['180 units', 1386, 1980, '30% OFF'], ['220 units', 1694, 2420, '30% OFF']] },
    ],
  },
  faq: { lead: 'FAQ For', strong: 'Botox®', sub: 'Everything you need to know before starting your journey with us.' },
  faqs: [
    ['What is Botox®?', 'Botox® is an FDA- and Health Canada-approved injectable treatment that relaxes facial muscles to smooth fine lines and wrinkles.'],
    ['What areas can Botox® treat?', 'Common areas include forehead lines, frown lines, crow’s feet, brow lift, gummy smile, and jawline slimming.'],
    ['How soon will I see results from Botox®?', 'Results typically appear within 3–7 days, with full effects visible in about 2 weeks after treatment.'],
    ['How long do Botox® results last?', 'Results generally last 3–4 months, with maintenance treatments recommended to preserve a youthful, refreshed look.'],
    ['Is Botox® safe?', 'Yes. Botox® has been extensively studied with over 20 years of clinical use worldwide, and is safe when performed by licensed professionals.'],
  ],
};

const CALLS = [['Downtown', PHONES[1].num], ['Uptown', PHONES[0].num]];
const twoLine = (lead) => <>{lead}<br /></>;
const IconClock = (props) => <Svg size={30} vb="0 0 32 32" {...props}><circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.8" /><path d="M16 9v7.5l4.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
const IconTick = (p) => <Svg size={14} vb="0 0 14 14" {...p}><path d="m3 7.3 2.6 2.6L11 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></Svg>;

/* ---------------------------------------------------------------- booking form (hero card on desktop, its own block on phones) */
/* the hero and phone form: the shared booking form (BookForm) in its compact layout, after Ray's version (round 12) */
function ProcForm({ id, className = '' }) {
  const hid = `${id}-title`;
  return (
    <div className={`proc-form book-compact rounded-[22px] bg-white p-[clamp(20px,2.2vw,28px)] text-ndm-ink ${className}`} role="region" aria-labelledby={hid}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id={hid} className="font-aeonik text-[clamp(24px,2vw,28px)] font-normal leading-[1.1] tracking-[-0.025em]">
          Book your <br /><span className="tt-strong text-ndm-deep">free consultation</span>
        </h2>
        <span aria-hidden="true" className="book-badge-dot mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-ndm-amber text-white"><IconArrow size={13} /></span>
      </div>
      <div className="flex flex-col"><BookForm compact thanksId={`${id}-thanks`} /></div>
      <p className="mt-3 font-inter text-[12px] leading-[1.5] text-ndm-muted">Free and no obligation. VISIA® skin analysis included.</p>
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
    <section ref={ref} id="compare" aria-labelledby="compare-title" className="relative z-10 scroll-mt-[90px] bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,112px)]">
      {/* a concern page passes its own heading and turns off the highlighted first column (c.mark === false) */}
      <TxHead p={p} id="compare" tag={c.tag || 'Compare the options'} hid="compare-title" lead={c.lead || 'This treatment, beside'} strong={c.strong || 'the other options'} text={c.text || 'A general guide to the treatments often discussed for lines. Your provider helps you choose at your free consultation.'} />
      <div className={`${TX_WRAP} rv mt-[clamp(32px,4vw,52px)] overflow-x-auto rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(27,36,43,.45)]`} style={{ transitionDelay: '.08s' }}>
        <table className="cmp-t w-full min-w-[760px] border-collapse font-inter text-[14.5px]">
          <thead>
            <tr>
              <td className="w-[170px]" />
              {c.cols.map(([n, h], i) => (
                <th key={n} scope="col" className={`px-5 py-5 text-left align-bottom font-aeonik text-[19px] font-normal leading-[1.2] tracking-[-0.01em] ${i === 0 && c.mark !== false ? 'cmp-me text-ndm-deep' : 'text-ndm-ink'}`}>
                  {h ? <a href={h} className="group inline-flex items-center gap-1.5 hover:text-ndm-deep">{n}<IconArrow className="opacity-60 transition-transform group-hover:translate-x-0.5" /></a> : n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map(([k, vals]) => (
              <tr key={k}>
                <th scope="row" className="px-5 py-4 text-left align-top text-[13px] font-semibold text-ndm-muted">{k}</th>
                {vals.map((v, i) => <td key={i} className={`px-5 py-4 align-top leading-[1.5] text-ndm-ink ${i === 0 && c.mark !== false ? 'cmp-me' : ''}`}>{v}</td>)}
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
    <section ref={ref} id="why-choose" aria-labelledby="choose-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(72px,8vw,120px)]">
      <div className="text-center">
        <Eyebrow className="rv">{txNum(p, 'why-choose') && <span className="tabular-nums text-ndm-deep">{txNum(p, 'why-choose')}</span>}{p.choose.tag || 'Why choose this treatment'}</Eyebrow>
        <TwoTone id="choose-title" className="rv mx-auto mt-5" lead={twoLine(p.choose.lead || 'Who it may suit,')} strong={p.choose.strong || 'and safety first'} style={{ transitionDelay: '.06s' }} />
      </div>
      <div className="mx-auto mt-[clamp(36px,4vw,56px)] grid max-w-[1180px] gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4">
        <div className="rv rv-clip relative min-h-[360px] overflow-hidden rounded-[22px] bg-ndm-line md:col-span-2 lg:order-2 lg:col-span-1 lg:min-h-0" style={{ transitionDelay: '.08s' }}>
          <img src={p.choose.img} alt={p.choose.alt || 'Close-up of a woman’s face in soft natural light'} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" />
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
  const pr = p.prices;
  const groups = pr.groups || [{ name: pr.name, title: 'Botox® Cosmetic', blurb: pr.blurb, rows: pr.rows }];
  const [open, setOpen] = useState(() => groups.map((g, i) => i === 0));
  const unit = (label) => (label === pr.unitLabel ? ' / unit' : '');
  const pctOf = (rows) => Math.max(...rows.map((r) => { const m = /^(\d+)% OFF$/.exec(r[3] || ''); return m ? +m[1] : 0; }));
  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 scroll-mt-[150px] px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        <div className="text-center">
          <Eyebrow className="rv">{txNum(p, 'prices') && <span className="tabular-nums text-ndm-deep">{txNum(p, 'prices')}</span>}Price list</Eyebrow>
          <TwoTone id="prices-title" className="rv mx-auto mt-5" lead={twoLine(pr.lead || 'Botox® Cosmetic')} strong="prices and packages" style={{ transitionDelay: '.06s' }} />
          <p className="rv mx-auto mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Prices per unit and per package, with current offers. Your plan and final price are confirmed at your free consultation.</p>
        </div>
        <ul className="pr-groups rv mt-[clamp(40px,4.5vw,64px)]" role="list" style={{ transitionDelay: '.14s' }}>
          {groups.map((g, gi) => {
            const on = open[gi], pct = pctOf(g.rows), hid = `proc-pr-h${gi}`, bid = `proc-pr${gi}`;
            return (
              <li key={g.name} className={`pr-group ${on ? 'is-open' : ''}`}>
                <h3 className="pr-ghead m-0">
                  <button type="button" id={hid} aria-expanded={on} aria-controls={bid} onClick={() => setOpen((o) => o.map((v, k) => (k === gi ? !v : v)))}
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6">
                    <span className="min-w-0">
                      <span className="block font-inter text-[12.5px] tabular-nums text-ndm-muted">{g.rows.length} options</span>
                      <span className="mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{g.title}</span>
                    </span>
                    <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                      {pct > 0 && <span className="pr-badge">Up to {pct}% off</span>}
                      <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(Math.min(...g.rows.map((r) => r[1])))}</span> / unit</span>
                    </span>
                    <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><i /><i /></span>
                  </button>
                </h3>
                <div id={bid} role="region" aria-labelledby={hid} className="pr-body" {...(on ? {} : { inert: '' })}>
                  <div>
                    <p className="max-w-[60ch] pb-2 font-inter text-[15px] leading-[1.55] text-ndm-muted">{g.blurb}</p>
                    <ul className="pr-sub grid gap-2 py-4" role="list">
                      {g.rows.map(([label, price, was, tag]) => {
                        const line = { key: `${g.name}|${label}`, cat: pr.cat, name: g.name, label, price, was: was || 0, unit: unit(label) };
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
                            <span className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1"><QtyControl line={line} label={`${g.name}, ${label}`} /></span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
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
