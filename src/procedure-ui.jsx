/* ---------------------------------------------------------------- procedure page data. One object per procedure; the layout below stays the same.
   Botox® Cosmetic: facts, text and images from NDM's /injectables/botox/ page. The brand name only appears with factual details
   (name, price, units, quantity); anything about effects is written about "the treatment" in qualified language (Health Canada C.01.044). */
const NDM_VIDEO = `${NDM}/wp-content/uploads/2025/10/Brand-Animation-Final.mp4`;
const PROC = {
  /* round 12: the content of Ray's Botox page (his live-site build, ray/V1/NDM/botox.html), kept word for word, in this page's
     own sections. It is the live site's wording; it names Botox® beside its effects, so it needs Raymond's approval before publishing */
  crumbs: [['Procedures'], ['Injectables'], 'Botox®'],
  /* the sticky section bar (TxNav): the same items as Ray's Botox page */
  nav: [['benefits', 'Benefits'], ['film', 'The clinic'], ['overview', 'About'], ['why-choose', 'Why choose'], ['watch', 'Watch'], ['results', 'Results'], ['prices', 'Prices'], ['guide', 'Good to know'], ['why', 'Why NewDermaMed'], ['visit', 'Visit us'], ['faq', 'FAQ']],
  title: ['Botox®', 'in Toronto'],
  sub: 'Smooth wrinkles with trusted Botox® safe, expert care for natural, youthful results.',
  hero: { d: 'assets/botox/hero.jpg', m: 'assets/botox/hero-m.jpg', pos: '50% 30%', alt: 'A woman with her fingertips at her temples, Botox® Cosmetic at NewDermaMed, Toronto' },
  /* SEO round 16: both clinics named under the heading */
  where: 'At our Uptown clinic, Yonge & Sheppard, and our Downtown clinic, Bay & College, Toronto.',
  offer: { tag: 'Current offer', title: 'Botox® Cosmetic packages', big: ['Up to', '30%', 'off'], href: '#prices', cta: 'See the prices' },
  facts: [['Treatment Type', 'Injectable'], ['Duration', '30 minutes'], ['Recovery Time', 'Minimal downtime']],
  glance: 'A short treatment, planned after a free, in-person assessment by our medical team.',
  /* Benefits (TxIntro, id "benefits"): an overview written for this page (round 15, after the structure of barbeauty.ca/botox:
     what it is, how it works, the areas treated, who it may not suit), in qualified language; the live safety paragraph closes it */
  intro: {
    id: 'benefits', tag: 'Benefits', lead: 'What is Botox® Cosmetic', strong: 'and how does it work?',
    img: 'assets/botox/why-choose.jpg', fit: 'contain', bg: '#EFEDE7', /* the treatment-area diagram, shown whole */
    alt: 'Treatment areas: forehead lines, frown lines, crow’s feet, jawline slimming, neck bands and hyperhidrosis',
    text: [
      'Botox® Cosmetic is a Health Canada approved prescription neuromodulator. At NewDermaMed it is given only by our licensed medical team, after a free in-person assessment at our Uptown clinic near Yonge and Sheppard or our Downtown clinic near Bay and College.',
      'The treatment briefly quiets the nerve signal that tells a small facial muscle to contract. As the muscle relaxes, the lines that form when you frown, squint or raise your brows may soften, and over about three to four months movement gradually returns. Your provider plans the dose around how your face moves, often starting conservatively. Individual results may vary.',
      'Pregnancy, breastfeeding, some neuromuscular conditions and certain medications can mean it is not the right choice, so your health history is reviewed first.',
    ],
    chips: ['Forehead lines', 'Frown lines', 'Crow’s feet', 'Brow lift', 'Gummy smile', 'Jawline slimming'],
    note: 'When administered by a qualified, licensed professional, Botox® has a demonstrated safety profile. The injection site may experience mild redness, swelling, or bruising, but these side effects are rare and usually go away in a few hours to days.',
    points: [],
  },
  /* The clinic (TxFilm): the clinic footage, Ray's words */
  film: { src: 'assets/clinic/ndm-clinic.mp4', poster: 'assets/clinic/ndm-clinic-poster.jpg', /* the one clinic video, shared with the home page */ lead: 'Botox®', strong: 'at NewDermaMed Toronto',
    text: 'Two clinics, Uptown on Yonge Street and Downtown on Bay Street. Every visit starts with a free consultation and a VISIA® skin analysis with our licensed medical team.',
    chips: ['4763 Yonge St, Uptown', '790 Bay St, Downtown', 'Free consultation', 'VISIA® skin analysis'] },
  /* About (ProcOverview tabs): Ray's five tabs; the key numbers beside them are this page's */
  overview: {
    tag: 'About', lead: 'What can I expect', strong: 'from Botox® treatment?',
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
  /* Why choose (ProcChoose): the live page's five benefits, plus who it may suit (round 15) */
  choose: {
    img: 'assets/botox/benefits.webp', alt: 'A provider giving Botox® Cosmetic at NewDermaMed, Toronto', tag: 'Why choose', lead: 'Why choose', strong: 'Botox®?',
    cards: [
      ['Smooths Fine Lines & Wrinkles', 'Softens crow’s feet, frown lines, and forehead creases.'],
      ['Prevents New Wrinkle Formation', 'Relaxes facial muscles to reduce future expression lines.'],
      ['Quick & Convenient', 'Treatment takes only minutes with no downtime required.'],
      ['Natural-Looking Results', 'Refreshes appearance without affecting facial expressions.'],
      ['Clinically Proven & Safe', 'Backed by 20+ years of research and global trust.'],
      ['A Good Candidate', 'People seeking a non-invasive anti-aging treatment who have moderate to severe fine lines or wrinkles, anyone seeking understated, organic improvements, and those looking for preventative wrinkle care.'],
    ],
  },
  /* Watch (TxReel): the clinic's Instagram reel */
  reel: { src: `${NDM}/wp-content/uploads/2025/09/botox-.mp4`, /* played from the NDM site, not kept in this project */ poster: 'assets/botox/reel.webp', tag: 'Botox®', lead: 'See it', strong: 'at NewDermaMed', text: 'A short clip from our Instagram, filmed at the clinic. Follow @newdermamed for more.' },
  /* Why NewDermaMed (TxWhy) */
  why: {
    img: 'assets/home/team-award.jpg', alt: 'The NewDermaMed medical team with their Top Choice Award at the Toronto clinic', pos: '50% 35%',
    lead: 'Expert care at', strong: 'two Toronto clinics',
    items: [['16+', 'Years', 'Caring for patients in Toronto'], ['8', 'Awards', 'Top Choice Award, 2019 to 2026'], ['Licensed', 'Medical team', 'Treatments are given only by our licensed medical team'], ['Free', 'Consultation', 'Every plan starts with an in-person assessment']],
  },
  /* Results (TxResults): the live gallery's Botox® cases (each photo shows before and after side by side) */
  results: { lead: 'Botox® before', strong: 'and after photos', text: 'Cases from our before and after gallery, photographed at NewDermaMed.', more: 'before-after.html',
    pics: [{ src: 'assets/botox/case-1.webp', label: 'Botox®' }, { src: 'assets/botox/case-2.webp', label: 'Botox®' }, { src: 'assets/botox/case-3.webp', label: 'Botox®' }] },
  /* Prices (ProcPrices): Ray's two groups, Botox Cosmetic and Dysport */
  prices: {
    lead: 'How much does Botox®', strong: 'cost in Toronto?', cat: 'Botox / Dysport', unitLabel: 'Regular',
    groups: [
      { name: 'Botox Cosmetic', title: 'Botox® Cosmetic', blurb: 'A prescription product priced per unit, given only after an in-person medical assessment.',
        rows: priceRows('botox-dysport', 'Botox Cosmetic') }, /* round 29: from the price list */
      { name: 'Dysport', title: 'Dysport®', blurb: 'A prescription product priced per unit, given only after an in-person medical assessment.',
        rows: priceRows('botox-dysport', 'Dysport') },
    ],
  },
  /* Good to know (ProcGuide, SEO round 16): the questions people search for, after the structure of barbeauty.ca/botox. New copy in
     qualified language, waiting for Raymond's review. Units are the product's approved doses; prices come from the price list */
  guide: {
    tag: 'Good to know', lead: 'Botox® in Toronto:', strong: 'cost, care and choices',
    items: [
      { q: 'How many units of Botox® will I need?', a: ['Your dose depends on the areas treated and how strong those muscles are. As a guide, the approved doses are about 20 units for the frown lines between the brows and about 24 units for crow’s feet across both eyes. Your provider confirms your units at your free consultation.'] },
      { q: 'How much does Botox® cost per area?', a: ['Botox® Cosmetic is $12 per unit at NewDermaMed, and packages of 60 to 220 units are currently 10% to 30% off. At the regular price, 20 units are $240 and 24 units are $288. Your final price is confirmed after your assessment.'] },
      { q: 'Who performs Botox® at NewDermaMed?', a: ['Botox® is given only by our licensed medical team, under the medical direction of Dr. Negin Mastouri, and only after an in-person assessment of your health history, your goals and how your face moves.'] },
      { q: 'What should I do before and after my appointment?', a: ['Your provider gives you written aftercare for your treatment. Common advice includes:'],
        list: ['Tell your provider about any medicines or supplements you take, especially blood thinners', 'Avoid alcohol the day before, as it can make bruising more likely', 'Stay upright and avoid rubbing or massaging the treated area for the rest of the day', 'Skip strenuous exercise, saunas and hot yoga until the next day'] },
      { q: 'Botox® or Dysport®: which is right for me?', a: ['Both are Health Canada approved prescription neuromodulators that work in a similar way. Their formulations differ and their units are not interchangeable, so each is dosed on its own. At NewDermaMed, Botox® Cosmetic is $12 per unit and Dysport® is $11 per unit. Your provider recommends the one that suits your goals.'] },
    ],
    trust: 'Treatments are given by our licensed medical team under the medical direction of Dr. Negin Mastouri, Medical Director.',
    updated: ['2026-11-10', 'November 10, 2026'],
    intro: 'Short answers to what people ask most before their first Botox® visit. Your provider confirms everything at your free consultation.',
    doctor: { name: 'Dr. Negin Mastouri', role: 'Medical Director', img: 'assets/team/negin.jpg' },
    /* related treatments as photo cards: [title, link to the treatment's own page, photo, group]; slug() opens the page once it
       exists (PAGE_LINKS) and a #/slug placeholder until then */
    related: [['Dermal Fillers', slug('Dermal Fillers'), 'assets/home/v3/jawline-720.webp', 'Injectable'], ['Lip Augmentation', slug('Lip Augmentation'), 'assets/home/v3/lips-720.webp', 'Injectable'],
      ['Skin Boosters', slug('Skin Boosters'), 'assets/home/v3/booster-720.webp', 'Injectable'], ['Aptos Thread Lift', slug('Aptos Thread Lift'), 'assets/aptos/midface-vectors.jpg', 'Bio-stimulator'],
      ['Sculptra®', slug('Sculptra®'), 'assets/home/v3/sculptra-720.webp', 'Bio-stimulator'], ['Microneedling', slug('Microneedling'), 'assets/home/v3/mneedle-720.webp', 'Skin']],
  },
  faq: { lead: 'FAQ For', strong: 'Botox®', sub: 'Everything you need to know before starting your journey with us.' },
  faqs: [
    ['What is Botox®?', 'Botox® is an FDA- and Health Canada-approved injectable treatment that relaxes facial muscles to smooth fine lines and wrinkles.'],
    ['What areas can Botox® treat?', 'Common areas include forehead lines, frown lines, crow’s feet, brow lift, gummy smile, and jawline slimming.'],
    ['How soon will I see results from Botox®?', 'Results typically appear within 3–7 days, with full effects visible in about 2 weeks after treatment.'],
    ['How long do Botox® results last?', 'Results generally last 3–4 months, with maintenance treatments recommended to preserve a youthful, refreshed look.'],
    ['Is Botox® safe?', 'Yes. Botox® has been extensively studied with over 20 years of clinical use worldwide, and is safe when performed by licensed professionals.'],
    ['Does Botox® hurt?', 'Most patients describe the slight discomfort as a momentary pinch. A very fine needle is used, and each injection takes only a few seconds.'],
    ['Will I bruise after Botox®?', 'Mild redness, swelling or bruising at the injection sites may occur. These effects are uncommon and usually settle within a few hours to days.'],
    ['How soon can I go back to work?', 'Most people return to their regular activities, including work, straight after treatment.'],
    ['When can I exercise after Botox®?', 'Many providers suggest waiting until the next day before strenuous exercise. Your provider gives you aftercare for your treatment.'],
    ['How many units of Botox® will I need?', 'It depends on the areas treated. As a guide, frown lines often need about 20 units and crow’s feet about 24 units across both eyes. Your provider confirms your units at your free consultation.'],
    ['Is Botox® covered by OHIP or insurance?', 'Cosmetic treatments are not covered by OHIP, and most private insurance plans do not cover them. We offer flexible payment plans instead.'],
    ['Do you offer payment plans?', 'Yes. We offer flexible payment plans through Affirm for Canadian residents aged 19+, with a minimum $500 purchase.'],
    ['Can I reschedule or cancel my appointment?', 'Yes. Please call your clinic at least 24 hours before your appointment to change or cancel it.'],
    ['Botox® or Dysport®, which is better?', 'Neither is better for everyone. Both are Health Canada approved neuromodulators, dosed separately because their units differ. Your provider recommends the one that suits your goals.'],
    ['Where are your Toronto clinics?', 'Uptown: 4763 Yonge Street, near Sheppard-Yonge Station, with parking at Hallmark Centre, 4800 Yonge or 25 Sheppard Ave W. Downtown: 790 Bay Street, Suite 900, near College Station, with parking at 88 or 100 College Street.'],
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
        <img ref={pic} src={small ? p.hero.m : p.hero.d} alt={p.hero.alt || ""} fetchpriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: p.hero.pos }} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.72) 0%,rgba(11,15,19,.38) 50%,rgba(11,15,19,.18) 100%),linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,0) 30%,rgba(11,15,19,.35) 100%)' }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden" style={{ background: 'linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,.25) 30%,rgba(11,15,19,.6) 62%,rgba(11,15,19,.88) 100%)' }} />
      <div className="grid items-end gap-10 px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)] pt-[184px] sm:pt-[170px] lg:min-h-[min(100svh,920px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[640px]">
          <TwoTone as="h1" id="proc-title" dark className="rv" size="text-[clamp(44px,5.6vw,88px)]" lead={<>{p.title[0]}<br /></>} strong={p.title[1]} />
          <p className="rv mt-5 max-w-[48ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.08s' }}>{p.sub}</p>
          {p.where && <p className="rv mt-3 flex items-start gap-2 font-inter text-[14px] leading-[1.5] text-white/75" style={{ transitionDelay: '.1s' }}><IconPin size={15} className="mt-0.5 shrink-0 text-ndm-sky" />{p.where}</p>}
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
/* round 29: About, redesigned with its own theme: a deep navy band with slowly drifting light orbs and a turning dotted ring,
   numbered tabs down the left (a scrolling row on phones) and a glass panel with the tab's text and its key number.
   All five panels stay in the page for crawlers (hidden ones carry data-pre-keep). */
function ProcOverview({ p }) {
  const ref = useRef(null), tabs = useRef([]);
  useReveal(ref);
  const o = p.overview;
  const n = txNum(p, 'overview');
  const [act, setAct] = useState(0);
  const key = (e, i) => {
    const k = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const m = (i + k + o.tabs.length) % o.tabs.length;
    setAct(m); if (tabs.current[m]) tabs.current[m].focus();
  };
  return (
    <section ref={ref} id="overview" aria-labelledby="overview-title" data-nav="dark" className="ov2 relative z-10 overflow-hidden px-[var(--gx)] py-[clamp(44px,5vw,68px)] text-white">
      <span aria-hidden="true" className="ov2-orb ov2-orb-a" /><span aria-hidden="true" className="ov2-orb ov2-orb-b" /><span aria-hidden="true" className="ov2-orb ov2-orb-c" />
      <svg aria-hidden="true" viewBox="0 0 400 400" className="ov2-ring"><circle cx="200" cy="200" r="190" /><circle cx="200" cy="200" r="150" /></svg>
      <div className={`${TX_WRAP} relative`}>
        <div className="text-center">
          <Eyebrow dark className="rv">{n && <span className="tabular-nums text-ndm-sky">{n}</span>}{o.tag}</Eyebrow>
          <TwoTone id="overview-title" dark className="rv mx-auto mt-3" size="text-[clamp(26px,min(2.8vw,4.6vh),40px)]" lead={twoLine(o.lead)} strong={o.strong} style={{ transitionDelay: '.06s' }} />
        </div>
        {/* round 31: the tab names sit in one row on top again; the panel below is compact so the section fits one view */}
        <div className="rv ov2-panel relative mt-[clamp(16px,2.6vh,28px)] overflow-hidden rounded-[26px]" style={{ transitionDelay: '.1s' }}>
          <div role="tablist" aria-label="About the treatment" className="ov2-tabs no-scrollbar flex gap-1 overflow-x-auto p-2">
            {o.tabs.map((x, i) => (
              <button key={x.label} ref={(el) => (tabs.current[i] = el)} type="button" role="tab" id={`ov-t-${i}`} aria-controls={`ov-panel-${i}`} aria-selected={i === act} tabIndex={i === act ? 0 : -1}
                onClick={() => setAct(i)} onKeyDown={(e) => key(e, i)} className={`ov2-tab shrink-0 sm:flex-1 ${i === act ? 'is-on' : ''}`}>
                <span className="ov2-num font-aeonik tabular-nums">{String(i + 1).padStart(2, '0')}</span>{x.label}
              </button>
            ))}
          </div>
          {o.tabs.map((t, i) => (
            <div key={t.label} id={`ov-panel-${i}`} role="tabpanel" aria-labelledby={`ov-t-${i}`} hidden={i !== act} data-pre-keep="" className={`${i === act ? 'ov-in grid' : 'hidden'} gap-6 px-[clamp(20px,2.8vw,40px)] pb-[clamp(18px,2.8vh,30px)] pt-[clamp(14px,2.4vh,24px)] md:grid-cols-[minmax(0,1fr)_230px] md:items-center md:gap-[clamp(28px,4vw,56px)]`}>
              <div>
                <h3 className="font-aeonik text-[clamp(22px,2vw,28px)] font-normal leading-[1.1] tracking-[-0.025em] text-white">{t.label}</h3>
                {t.text.map((x, k) => <p key={k} className="mt-2.5 max-w-[72ch] font-inter text-[14.5px] leading-[1.6] text-white/80">{x}</p>)}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
                  {t.link && <a href={t.link[0]} className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-sky">{t.link[1]}<IconArrow className="transition-transform group-hover:translate-x-1" /></a>}
                </div>
              </div>
              <aside className="hidden md:block">
                <div className="ov2-stat relative mx-auto grid aspect-square w-[128px] place-items-center">
                  <svg aria-hidden="true" viewBox="0 0 100 100" className="ov2-stat-ring absolute inset-0"><circle cx="50" cy="50" r="46" /></svg>
                  <span className="relative px-4 text-center">
                    <span className="block font-aeonik text-[32px] leading-none tracking-[-0.03em] text-white tabular-nums">{t.stat[0]}</span>
                    <span className="mt-1 block font-inter text-[11px] leading-[1.3] text-white/70">{t.stat[1]}</span>
                  </span>
                </div>
                <dl className="mt-3 grid gap-1 border-t border-white/10 pt-2.5">
                  {p.facts.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-3 font-inter text-[12.5px]"><dt className="text-white/55">{k}</dt><dd className="text-right font-medium text-white">{v}</dd></div>)}
                </dl>
              </aside>
            </div>
          ))}
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

/* ---------------------------------------------------------------- start with a free skin analysis (round 19, after the
   futuron.framer.website "Join a Community" card): a rounded photo card at the content width; a deep NDM-navy gradient
   over the left and the bottom carries the words, which sit left: tag, heading, line and the two actions. When it comes into
   view the card opens from the middle out to both sides and the words sharpen from a blur */
const JR_CSS = `
.jr-card{clip-path:inset(0 50% 0 50% round 32px);transition:clip-path 1.2s cubic-bezier(.7,0,.2,1);box-shadow:0 40px 80px -50px rgba(11,15,19,.6)}
.jr-card.is-on{clip-path:inset(0 0 0 0 round 32px)}
.jr-card .jr-pic{transform:scale(1.12);transition:transform 2.2s cubic-bezier(.2,.7,.2,1)}
.jr-card.is-on .jr-pic{transform:scale(1)}
/* desktop: the photo fills the right two thirds and fades into the navy card, so the face sits right of the words; phones: face centred */
.jr-card{background:#0B1B29}
@media (min-width:768px){.jr-card .jr-pic{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 34%);mask-image:linear-gradient(90deg,transparent 0,#000 34%)}}
.jr-shade{background:linear-gradient(90deg,rgba(9,22,34,.9) 0%,rgba(9,22,34,.72) 34%,rgba(9,22,34,.18) 66%,rgba(9,22,34,0) 100%),linear-gradient(0deg,rgba(10,52,84,.72) 0%,rgba(10,52,84,0) 55%)}
@media (max-width:767px){.jr-card{clip-path:inset(0 50% 0 50% round 24px)}.jr-card.is-on{clip-path:inset(0 0 0 0 round 24px)}
  .jr-shade{background:linear-gradient(0deg,rgba(9,22,34,.94) 0%,rgba(9,22,34,.8) 42%,rgba(9,22,34,.1) 78%,rgba(9,22,34,0) 100%)}}
.jr-card .jr-t{opacity:0;filter:blur(14px);transform:translateY(12px);transition:opacity .9s ease,filter 1.1s ease,transform 1.1s cubic-bezier(.2,.7,.2,1)}
.jr-card.is-on .jr-t{opacity:1;filter:blur(0);transform:none}
@media (prefers-reduced-motion:reduce){.jr-card,.jr-card .jr-pic,.jr-card .jr-t{clip-path:none;transform:none;filter:none;opacity:1;transition:none}}
`;
function ProcAnalysis() {
  const card = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = card.current; if (!el) return;
    /* the card is clipped to nothing until it opens, so watch its section */
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.2 });
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) setOn(true);
    io.observe(el.parentElement);
    return () => io.disconnect();
  }, []);
  /* a second trigger from the scroll position, in case the browser delays the visibility check */
  useOnScroll(() => {
    const el = card.current; if (!el || el.classList.contains('is-on')) return;
    if (el.parentElement.getBoundingClientRect().top < window.innerHeight * 0.85) setOn(true);
  }, []);
  const t = (k) => ({ transitionDelay: `${0.75 + k * 0.12}s` });
  return (
    <section aria-labelledby="analysis-title" className="relative z-10 px-[var(--gx)] py-[clamp(40px,5vw,72px)]">
      <style>{JR_CSS}</style>
      <div ref={card} className={`jr-card ${TX_WRAP} relative isolate flex min-h-[600px] flex-col justify-end md:min-h-[clamp(460px,40vw,520px)] overflow-hidden rounded-[24px] p-6 text-white md:justify-center md:rounded-[32px] md:p-[56px] ${on ? 'is-on' : ''}`}>
        <img src="assets/treatments/journey-skin.webp" alt="" loading="lazy" decoding="async" className="jr-pic absolute inset-0 -z-20 h-full w-full object-cover object-[47%_28%] md:left-auto md:w-[66%] md:object-[50%_30%]" />
        <span aria-hidden="true" className="jr-shade absolute inset-0 -z-10" />
        <div className="max-w-[620px]">
          <div className="jr-t" style={t(0)}><Eyebrow dark>Start your journey</Eyebrow></div>
          <TwoTone id="analysis-title" dark className="jr-t mt-5" size="text-[clamp(32px,3.4vw,48px)]" lead={<>Start with a free<br /></>} strong="skin analysis" style={t(1)} />
          <p className="jr-t mt-4 max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-white/80" style={t(2)}>Your first consultation and VISIA® skin analysis are free, at Uptown or Downtown. No pressure, just a clear plan.</p>
          <div className="jr-t mt-7 flex flex-wrap items-center gap-x-5 gap-y-3" style={t(3)}>
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
            <Btn href="about.html#contact" v="light">Find a clinic</Btn>
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
          <img src={p.choose.img} alt={p.choose.alt || 'Close-up of a woman’s face in soft natural light'} loading="lazy" className={`absolute inset-0 h-full w-full ${p.choose.fit === 'contain' ? 'object-contain' : 'object-cover object-[50%_40%]'}`} style={p.choose.bg ? { background: p.choose.bg } : undefined} />
        </div>
        <ul className="grid gap-3 lg:order-1 lg:gap-4" role="list">{c.slice(0, Math.ceil(c.length / 2)).map(card)}</ul>
        <ul className="grid gap-3 lg:order-3 lg:gap-4" role="list">{c.slice(Math.ceil(c.length / 2)).map((x, i) => card(x, i + Math.ceil(c.length / 2)))}</ul>
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
  const pctOf = (rows) => Math.max(...rows.map((r) => { const m = /^(\d+)% OFF$/.exec(r[3] || ''); return m ? +m[1] : 0; }));
  return (
    <section ref={ref} id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 scroll-mt-[150px] px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        <div className="text-center">
          <Eyebrow className="rv">{txNum(p, 'prices') && <span className="tabular-nums text-ndm-deep">{txNum(p, 'prices')}</span>}Price list</Eyebrow>
          <TwoTone id="prices-title" className="rv mx-auto mt-5" lead={twoLine(pr.lead || 'Botox® Cosmetic')} strong={pr.strong || 'prices and packages'} style={{ transitionDelay: '.06s' }} />
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
                      {pct > 0 && <span className="pr-badge">Up to {pct}% off</span>}
                      <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{pfmt(rowsFrom(g.rows, true))}</span> / unit</span>
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

/* ---------------------------------------------------------------- good to know (SEO round 16, redesigned round 18): a sticky
   column with the heading, a short intro and who directs the care; beside it the questions as numbered cards; then the related
   pages as photo cards. Question headings and full answers stay in the page for search engines */
function ProcGuide({ p }) {
  const ref = useRef(null);
  useReveal(ref);
  const g = p.guide;
  const n = txNum(p, 'guide');
  return (
    <section ref={ref} id="guide" aria-labelledby="guide-title" className="relative z-10 scroll-mt-[150px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid gap-8 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="lg:sticky lg:top-[200px] lg:self-start">
          <Eyebrow className="rv">{n && <span className="tabular-nums text-ndm-deep">{n}</span>}{g.tag}</Eyebrow>
          <TwoTone id="guide-title" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={twoLine(g.lead)} strong={g.strong} style={{ transitionDelay: '.06s' }} />
          <p className="rv mt-4 max-w-[44ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: '.1s' }}>{g.intro}</p>
          {/* round 24: a book card instead of the medical-direction card */}
          <div className="rv guide-book relative mt-7 overflow-hidden rounded-[26px] p-6 text-white" style={{ transitionDelay: '.14s' }}>
            <span aria-hidden="true" className="guide-book-glow" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-inter text-[12px] font-medium text-white/90 ring-1 ring-white/20"><i aria-hidden="true" className="size-1.5 rounded-full bg-ndm-amber" />Free consultation</span>
            <p className="relative mt-4 font-aeonik text-[clamp(26px,2.2vw,32px)] font-normal leading-[1.08] tracking-[-0.02em]">Talk it through<br /><span className="tt-strong text-ndm-sky">with our team</span></p>
            <ul className="relative mt-4 grid gap-2" role="list">
              {['Free consultation and VISIA® skin analysis', 'Uptown or Downtown Toronto', 'No pressure, just a clear plan'].map((x) => (
                <li key={x} className="flex items-start gap-2.5 font-inter text-[14.5px] leading-[1.45] text-white/85"><IconCheckBadge className="mt-[2px] shrink-0 text-ndm-sky" />{x}</li>
              ))}
            </ul>
            <div className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
              <a href={tel(PHONES[0].num)} className="font-inter text-[14px] text-white/80 underline-offset-4 hover:text-white hover:underline">or call {PHONES[0].num}</a>
            </div>
          </div>
          <p className="rv mt-4 flex items-center gap-2 font-inter text-[12.5px] text-ndm-muted" style={{ transitionDelay: '.16s' }}><IconCheckBadge size={14} className="shrink-0 text-ndm-deep" />Page updated <time dateTime={g.updated[0]}>{g.updated[1]}</time></p>
        </div>
        <ol className="grid gap-3" role="list">
          {g.items.map((it, i) => (
            <li key={it.q} className="rv guide-q relative overflow-hidden rounded-[22px] bg-white p-[clamp(20px,2.2vw,28px)] pl-[clamp(64px,5.2vw,80px)] ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.04 * i}s` }}>
              <span aria-hidden="true" className="guide-num absolute left-[clamp(18px,1.8vw,26px)] top-[clamp(20px,2.2vw,28px)] grid size-9 place-items-center rounded-full font-inter text-[13px] font-semibold tabular-nums text-white">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-aeonik text-[clamp(20px,1.6vw,24px)] font-normal leading-[1.2] tracking-[-0.015em] text-ndm-ink">{it.q}</h3>
              {it.a.map((x, k) => <p key={k} className="mt-2.5 font-inter text-[15px] leading-[1.7] text-ndm-ink/80">{x}</p>)}
              {it.list && (
                <ul className="mt-3 grid gap-2 rounded-[16px] bg-ndm-mist/70 p-4 sm:grid-cols-2" role="list">
                  {it.list.map((x) => <li key={x} className="flex items-start gap-2.5 font-inter text-[14px] leading-[1.55] text-ndm-ink/85"><IconCheckBadge className="mt-[2px] shrink-0 text-ndm-deep" />{x}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
      <nav aria-labelledby="related-title" className={`${TX_WRAP} mt-[clamp(48px,5vw,72px)]`}>
        <div className="flex items-end justify-between gap-4">
          <h3 id="related-title" className="rv font-aeonik text-[clamp(24px,2.2vw,32px)] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink">Related <span className="tt-strong text-ndm-deep">treatments</span></h3>
        </div>
        <ul className="no-scrollbar -mx-[var(--gx)] mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gx)] pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-6" role="list" style={{ scrollPaddingInline: 'var(--gx)' }}>
          {g.related.map(([t, h, img, kind], i) => (
            <li key={t} className="rv w-[62%] shrink-0 snap-start sm:w-auto" style={{ transitionDelay: `${0.04 * i}s` }}>
              <a href={h} className="guide-rel group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-ndm-mist text-white">
                <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0B0F13]/85 via-[#0B0F13]/20 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 font-inter text-[11.5px] font-medium text-ndm-ink backdrop-blur-[6px]">{kind}</span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                  <span className="font-aeonik text-[18px] leading-[1.15]">{t}</span>
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ndm-deep transition-transform duration-500 group-hover:-rotate-45"><IconArrow size={12} /></span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
