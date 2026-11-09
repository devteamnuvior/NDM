/* ---------------------------------------------------------------- concern page (one concern: Wrinkles & Fine Lines).
   A blend of the article page (centred blurred title, wide photo, reading line, a narrow reading column with an
   "On this page" list, the key takeaway card, related articles) and the treatment pages (the at-a-glance strip,
   treatment cards, the five treatment tabs, compare the options, team, testimonials, the free skin analysis band, FAQ).
   Content: newdermamedlaserclinic.com/skin/aesthetic/wrinkle-treatments/, rewritten in qualified language.
   Prescription drugs are never named beside a benefit (C.01.044): the injection card says "neuromodulator injections". */
const scrollToId = (id) => { const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 100); };
const CONCERN = {
  slug: 'wrinkles-fine-lines',
  name: 'Wrinkles & Fine Lines',
  group: 'Face & ageing',
  title: ['Wrinkles &', 'fine lines'],
  sub: 'What causes them, the kinds of lines we see, and the non-surgical treatments that may help, planned around your skin.',
  hero: 'assets/home/v3/mirror-1440.webp',
  heroAlt: 'A woman in a NewDermaMed treatment chair looking at her skin in a hand mirror',
  /* the glance strip under the photo (TX_ICONS picks the icon from the label) */
  facts: [['Treatment type', 'Injectable, laser & skin'], ['Session', '30 to 60 minutes'], ['Recovery time', 'Minimal downtime']],
  toc: [['causes', 'What causes wrinkles'], ['kinds', 'The kinds of lines'], ['suit', 'Who it may suit'], ['benefits', 'What treatment may offer'],
    ['treatments', 'Treatments that may help'], ['overview', 'Your treatment'], ['compare', 'Compare the options'], ['faq', 'Questions']],
  intro: 'Wrinkles don’t have to define your look. At NewDermaMed our medical team combines modern, non-surgical treatments into one plan for your skin, your facial structure and your goals, for a smoother, naturally refreshed look.',
  body: [
    ['h2', 'What causes wrinkles', 'causes'],
    ['p', 'Wrinkles form as the skin’s collagen and elastin break down over time. Sun exposure, natural ageing, repeated facial expressions and everyday habits all play a part, which is why lines can appear in different places and at different depths.'],
    ['h2', 'The kinds of lines we see', 'kinds'],
    ['p', 'Not every line has the same cause, so not every line needs the same treatment. At your consultation our team looks at which of these you have:'],
    ['ul', ['Fine lines, often around the eyes and across the forehead', 'Dynamic lines that appear when you smile, frown or raise your brows', 'Deeper folds, such as smile lines and marionette lines', 'Lost volume, which can make lines look deeper', 'Loose, uneven or sun-damaged skin']],
    ['img', 'assets/home/v3/collagen-1000.webp', 'A provider assessing a patient’s skin before treatment'],
    ['h2', 'Who these treatments may suit', 'suit'],
    ['p', 'Wrinkle treatments may suit adults who would like smoother-looking skin without surgery. Plans can be tailored to most skin types, whether you want early care in your 30s or a refresh later on. Every plan starts with a free, in-person consultation.'],
    ['h2', 'What treatment may offer', 'benefits'],
    ['cards', [
      ['Softer lines', 'May soften crow’s feet, frown lines and forehead creases.'],
      ['Restored volume', 'Dermal fillers can restore volume in areas affected by ageing.'],
      ['Collagen support', 'Microneedling, lasers and biostimulators may encourage the skin’s own renewal.'],
      ['Lift and definition', 'Thread lifts and energy-based treatments can help redefine facial contours.'],
      ['A plan for you', 'Each plan is personalised for a natural-looking result. Individual results may vary.'],
    ]],
  ],
  takeaway: 'Lines have different causes, so results usually come from a plan that matches each one. A free consultation is the simplest way to find out which treatments may suit your skin.',
  /* treatment cards: [name, one line, starting price, link, photo, tag]; prices from the pricing page */
  treatments: [
    ['Neuromodulator injections', 'Relax the muscles behind expression lines for a time.', '$12 per unit', 'botox.html', 'assets/home/v3/sface-720.webp', 'Injectable'],
    ['Dermal fillers', 'Hyaluronic acid gel for folds and lost volume.', 'From $750', '#/dermal-fillers', 'assets/home/v3/jawline-720.webp', 'Injectable'],
    ['Laser skin resurfacing', 'Renews the outer layers and supports new collagen.', 'From $200', '#/laser-skin-resurfacing', 'assets/home/v3/resurf-720.webp', 'Laser'],
    ['Microneedling', 'Fine needles that encourage collagen and elastin.', 'From $245', '#/microneedling', 'assets/home/v3/mneedle-720.webp', 'Skin'],
    ['Biostimulators', 'Sculptra® and Radiesse®, for gradual collagen support.', 'From $599', '#/sculptra', 'assets/home/v3/sculptra-720.webp', 'Injectable'],
    ['Aptos thread lift', 'Absorbable threads that may lift and support tissue.', 'From $2,500', 'aptos-thread-lift.html', `${NDM}/wp-content/uploads/2025/09/Benefits-of-Aptos-Thread-Lift.jpg`, 'Thread lift'],
  ],
  /* the five tabs, as on the treatment pages */
  overview: {
    tag: 'Your treatment', lead: 'From first visit', strong: 'to maintenance',
    tabs: [
      { label: 'Overview', stat: ['6', 'treatment options'], text: [
        'Wrinkle treatments at NewDermaMed aim to smooth fine lines, restore volume and refresh the skin. Our team combines advanced medical aesthetic treatments into one plan built around your skin and your goals.',
        'There are modern, non-surgical options for most kinds of lines, whatever their cause. Individual results may vary.'] },
      { label: 'What to expect', stat: ['30–60', 'minutes per session'], text: [
        'Your plan starts with a personalised consultation. Our team looks at your skin, your facial structure and your goals, then explains the options that may suit you.',
        'Depending on your plan, sessions take about 30 to 60 minutes with little to no downtime, so most people return to their day straight away. Some changes may be visible soon after, and the skin can keep improving as it heals. Individual results may vary.'] },
      { label: 'How it works', stat: ['5', 'ways to treat lines'], text: [
        'Treatments work on both the visible signs of ageing and their causes. Neuromodulator injections relax overactive muscles behind expression lines for a time, and dermal fillers restore lost volume and support.',
        'Microneedling and laser treatments encourage collagen and elastin, which may leave the skin firmer and smoother. Biostimulators such as Sculptra® or Radiesse® and thread lifts add structural support over time. Combined, they can give a fuller, natural-looking result.'] },
      { label: 'Maintenance', stat: ['6–18', 'months, typical for fillers'], text: [
        'How long results last depends on the treatment: neuromodulator injections typically last 3 to 4 months, fillers 6 to 18 months, and collagen-stimulating treatments may improve the skin for up to 2 years.',
        'Regular follow-up visits and medical-grade skincare chosen for you can help you keep your result. Individual results may vary.'] },
      { label: 'Pricing', stat: ['Free', 'first consultation'], text: [
        'Every face is different, and so is every plan. Starting prices are shown on each treatment above, and your final price is confirmed at your free consultation.',
        'Our licensed professionals look at your skin, talk through your options and build a personalised plan with careful, medical-grade care.'], link: ['pricing.html', 'See all prices'] },
    ],
  },
  compare: {
    tag: 'Compare the options', lead: 'The main treatments', strong: 'for lines, side by side', mark: false,
    text: 'A general guide to the treatments most often discussed for wrinkles. Our team helps you choose at your free consultation.',
    cols: [['Neuromodulator injections', 'botox.html'], ['Dermal fillers', '#/dermal-fillers'], ['Laser skin resurfacing', '#/laser-skin-resurfacing'], ['Microneedling', '#/microneedling']],
    rows: [
      ['How it works', ['Relaxes the muscles behind expression lines for a time', 'Hyaluronic acid gel restores volume and support', 'Laser renews the outer layers and builds collagen', 'Fine needles encourage collagen and elastin']],
      ['Often chosen for', ['Lines that form when your face moves', 'Folds that stay at rest, and lost volume', 'Fine lines and texture', 'Fine lines and overall skin quality']],
      ['Typical course', ['One short visit, repeated every 3 to 4 months', 'Usually one session, with an optional review at 2 weeks', '1 to 3 sessions, depending on depth', 'A course of sessions, in packages of 3 or 6']],
      ['Downtime', ['Minimal; mild redness or swelling may occur', 'Possible swelling or bruising for a few days', 'From 1 to 2 days to 5 to 10 days, by depth', 'Little to no downtime for most people']],
      ['When results may appear', ['Within 3 to 7 days, full effect at about 2 weeks', 'Visible right away, settling over about 2 weeks', 'As the skin heals, with collagen changes over 3 to 6 months', 'Gradually, over weeks to months']],
      ['Starting price', ['$12 per unit', 'From $750', 'From $200', 'From $245']],
    ],
  },
  faqs: [
    ['What causes wrinkles?', 'Wrinkles come from the breakdown of collagen and elastin, along with sun exposure, natural ageing, facial expressions and lifestyle habits.'],
    ['What treatments are available for wrinkles?', 'Options include neuromodulator injections, dermal fillers, laser skin resurfacing, microneedling, thread lifts, biostimulators and medical-grade skincare. Your plan may combine more than one.'],
    ['How soon may I see results?', 'Injectable treatments can show a change within days, while lasers and microneedling bring gradual improvement over weeks to months. Individual results may vary.'],
    ['Are wrinkle treatments safe?', 'The treatments we offer are minimally invasive, use Health Canada approved products and devices, and are performed by trained medical professionals after an assessment. As with any treatment, side effects can occur, and they are explained at your consultation.'],
    ['Who is a good candidate for wrinkle treatments?', 'Wrinkle treatments may suit men and women who would like smoother-looking skin and refreshed facial contours without surgery.'],
  ],
  related: ['/aptos-excellence-visage', '/how-to-prepare-for-dermal-fillers/', '/things-to-keep-in-mind-when-considering-juvederm/'],
};

/* the article head: category chip, the blurred two-line title, a short line, the wide photo, and the treatment
   pages' at-a-glance strip sitting half over the photo's bottom edge */
function ConcernHead({ c }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    const h = img.parentElement.offsetHeight;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.15, h * 0.12).toFixed(1)}px,0)`;
  }, []);
  const go = (e) => { e.preventDefault(); scrollToId('article-body'); };
  return (
    <div ref={ref} className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(170px,15vw,220px)]">
      <div className="mx-auto max-w-[980px] text-center">
        <p className="rv flex flex-wrap items-center justify-center gap-2 font-inter text-[13px] text-ndm-muted">
          <span className="rounded-full bg-white px-3 py-1.5 font-medium text-ndm-deep ring-1 ring-ndm-ink/[.08]">Concern</span>
          <span>{c.group}</span><i aria-hidden="true" className="size-1 rounded-full bg-ndm-muted/60" /><span>6 treatment options</span>
        </p>
        <BlurTitle as="h1" id="concern-title" size="text-[clamp(42px,5.6vw,88px)]" className="mt-6" lead={c.title[0]} strong={c.title[1]} />
        <p className="rv mx-auto mt-6 max-w-[56ch] font-inter text-[16.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.3s' }}>{c.sub}</p>
        <div className="rv mt-7 flex flex-wrap justify-center gap-3" style={{ transitionDelay: '.36s' }}>
          <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
          <Btn href="#article-body" onClick={go} v="line">Read the guide</Btn>
        </div>
      </div>
      <div className="rv rv-clip relative mx-auto mt-[clamp(40px,5vw,64px)] aspect-[4/3] max-w-[1320px] overflow-hidden rounded-[20px] bg-ndm-line sm:aspect-[21/9]">
        <img ref={pic} src={c.hero} alt={c.heroAlt} fetchpriority="high" className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover object-[50%_28%] will-change-transform" />
      </div>
      <div role="region" aria-labelledby="glance-title" className="relative z-10 -mt-[clamp(44px,4vw,60px)] px-[clamp(0px,2vw,28px)]">
        <h2 id="glance-title" className="sr-only">Treatment at a glance</h2>
        <div className="rv mx-auto grid max-w-[1180px] gap-4 rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-36px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/[.06] sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-7" style={{ transitionDelay: '.1s' }}>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3">
            {c.facts.map(([k, v], i) => (
              <div key={k} className={`flex items-center gap-3 ${i ? 'md:border-l md:border-ndm-ink/10 md:pl-5' : ''} ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}>
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-ndm-sky to-ndm-deep text-white shadow-[0_10px_20px_-12px_rgba(15,128,195,.9)]">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{TX_ICONS[txIcon(k)]}</svg>
                </span>
                <div className="min-w-0">
                  <dt className="font-inter text-[12px] leading-[1.3] text-ndm-muted">{k}</dt>
                  <dd className="font-inter text-[15px] font-semibold leading-[1.3] text-ndm-ink sm:text-[16px]">{v}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-2 gap-2 lg:w-[230px] lg:grid-cols-1">
            {CALLS.map(([n, num]) => (
              <a key={n} href={tel(num)} aria-label={`Call the ${n} clinic at ${num}`} className="btn btn-buy h-11 gap-2 px-3 text-[13.5px]">
                <IconPhone className="shrink-0" /><span className="truncate"><span className="lg:hidden">{n}</span><span className="hidden lg:inline">{num} {n}</span></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* the article column with an "On this page" list beside it (a chip row on phones); the list marks the part being read */
function ConcernBody({ c }) {
  const ref = useRef(null);
  useReveal(ref);
  const [act, setAct] = useState(c.toc[0][0]);
  useOnScroll(() => {
    const y = window.innerHeight * 0.35;
    let on = c.toc[0][0];
    c.toc.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < y) on = id; });
    setAct(on);
  }, []);
  const go = (id) => (e) => { e.preventDefault(); scrollToId(id); };
  return (
    <section ref={ref} id="article-body" aria-label="About wrinkles and fine lines" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(56px,6vw,96px)] pt-[clamp(56px,6vw,96px)]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[220px_minmax(0,720px)] lg:justify-between">
        <nav aria-label="On this page" className="min-w-0 lg:sticky lg:top-[150px] lg:self-start">
          <p className="font-inter text-[11.5px] font-semibold uppercase tracking-[.16em] text-ndm-muted">On this page</p>
          <ol className="no-scrollbar -mx-[var(--gx)] mt-3 flex gap-1.5 overflow-x-auto px-[var(--gx)] lg:mx-0 lg:grid lg:gap-0 lg:overflow-visible lg:border-l lg:border-ndm-ink/10 lg:px-0" role="list">
            {c.toc.map(([id, t], i) => (
              <li key={id} className="shrink-0">
                <a href={`#${id}`} onClick={go(id)} aria-current={act === id ? 'true' : undefined}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-full px-3.5 py-2 font-inter text-[13.5px] transition-colors lg:-ml-px lg:rounded-none lg:border-l-2 lg:px-4 lg:py-2 ${act === id ? 'bg-ndm-deep text-white lg:border-ndm-deep lg:bg-transparent lg:font-semibold lg:text-ndm-deep' : 'bg-white text-ndm-ink ring-1 ring-ndm-ink/[.08] hover:text-ndm-deep lg:border-transparent lg:bg-transparent lg:text-ndm-muted lg:ring-0'}`}>
                  <span className="hidden tabular-nums text-[11.5px] opacity-60 lg:inline">{String(i + 1).padStart(2, '0')}</span>{t}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-6 hidden rounded-[18px] bg-white p-4 ring-1 ring-ndm-ink/[.06] lg:block">
            <p className="font-aeonik text-[18px] leading-[1.25] text-ndm-ink">Not sure where to start?</p>
            <p className="mt-1.5 font-inter text-[13px] leading-[1.5] text-ndm-muted">A free consultation and VISIA® skin analysis.</p>
            <Btn href="#/book" v="book" hot sm className="mt-3">Book free</Btn>
          </div>
        </nav>

        <div className="article-prose min-w-0">
          <p className="rv font-aeonik text-[clamp(21px,1.8vw,26px)] leading-[1.45] tracking-[-0.01em] text-ndm-ink">{c.intro}</p>
          <hr className="my-[clamp(32px,4vw,48px)] border-ndm-ink/10" />
          {c.body.map((b, i) => {
            const [t, x, extra] = b;
            if (t === 'h2') return <h2 key={i} id={extra} className="rv scroll-mt-[140px] font-aeonik">{x}</h2>;
            if (t === 'ul') return <ul key={i} className="rv font-inter" role="list">{x.map((li) => <li key={li}>{li}</li>)}</ul>;
            if (t === 'img') return (
              <figure key={i} className="rv rv-clip peach overflow-hidden rounded-[14px]">
                <img src={x} alt={extra} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover object-[50%_30%]" />
              </figure>
            );
            if (t === 'cards') return (
              <ul key={i} className="cn-cards !mt-6 !grid gap-3 sm:grid-cols-2" role="list">
                {x.map(([h, d], k) => (
                  <li key={h} className={`rv flex gap-3.5 rounded-[18px] bg-white p-4 ring-1 ring-ndm-ink/[.06] ${k === x.length - 1 ? 'sm:col-span-2' : ''}`} style={{ transitionDelay: `${0.05 * k}s` }}>
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconCheckBadge /></span>
                    <span><span className="block font-aeonik text-[19px] leading-[1.2] text-ndm-ink">{h}</span><span className="mt-1 block font-inter text-[14.5px] leading-[1.55] text-ndm-ink/75">{d}</span></span>
                  </li>
                ))}
              </ul>
            );
            return <p key={i} className="rv font-inter">{x}</p>;
          })}
          <aside aria-labelledby="takeaway" className="take-card mt-[clamp(40px,5vw,64px)] grid overflow-hidden rounded-[22px] md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
            <div className="rv rv-clip take-pic relative min-h-[240px] overflow-hidden bg-ndm-mist md:min-h-full">
              <img src="assets/home/v3/facial-720.webp" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
            </div>
            <div className="rv p-[clamp(22px,2.6vw,36px)]" style={{ transitionDelay: '.15s' }}>
              <Eyebrow>Key takeaway</Eyebrow>
              <p id="takeaway" className="mt-5 font-aeonik text-[clamp(20px,1.7vw,24px)] leading-[1.4] tracking-[-0.01em] text-ndm-ink">{c.takeaway}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
                <Btn href="#treatments" onClick={go('treatments')} v="line">See the treatments</Btn>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* treatments that may help: the home menu's card style, a sideways row with arrows on both sides */
function ConcernTreatments({ c }) {
  const ref = useRef(null), rail = useRef(null);
  useReveal(ref);
  const [edge, setEdge] = useState([true, false]);
  const sync = () => { const r = rail.current; if (!r) return; setEdge([r.scrollLeft < 8, r.scrollLeft > r.scrollWidth - r.clientWidth - 8]); };
  useEffect(() => { sync(); }, []);
  const step = (d) => { const r = rail.current, k = r.querySelector('article'); r.scrollBy({ left: d * (k ? k.offsetWidth + 16 : r.clientWidth * 0.8), behavior: REDUCED ? 'auto' : 'smooth' }); };
  return (
    <section ref={ref} id="treatments" aria-labelledby="treatments-title" className="relative z-10 scroll-mt-[90px] bg-ndm-paper py-[clamp(64px,7vw,104px)]">
      <div className="px-[var(--gx)]">
        <TxHead p={c} id="treatments" tag="Treatments that may help" hid="treatments-title" lead="Six ways to treat" strong="wrinkles and fine lines" text="Each one works on a different cause. Starting prices are shown; your final price is confirmed at your free consultation." />
      </div>
      <div className="side-rail relative mt-[clamp(32px,4vw,52px)]">
        <div ref={rail} onScroll={sync} className="no-scrollbar -mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gx)] pb-14 pt-2" style={{ scrollPaddingInline: 'var(--gx)' }}>
          {c.treatments.map(([name, d, price, href, img, tag], i) => (
            <article key={name} className="tm-card2 rv group flex shrink-0 snap-start flex-col rounded-[22px] bg-white p-3 ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${Math.min(i, 4) * 0.05}s` }}>
              <a href={href} className="peach relative block aspect-[4/3.2] overflow-hidden rounded-[16px] bg-ndm-mist">
                <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" style={{ transitionTimingFunction: 'var(--e-out)' }} />
                <span className="absolute left-3 top-3 z-[1] rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[8px]">{tag}</span>
              </a>
              <div className="flex flex-1 flex-col px-2 pb-1.5 pt-4">
                <h3 className="font-aeonik text-[clamp(21px,1.6vw,25px)] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink"><a href={href} className="hover:text-ndm-deep">{name}</a></h3>
                <p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-muted">{d}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="font-inter text-[14px] font-medium text-ndm-ink">{price}</span>
                  <Btn href={href} v="line" sm>Learn more<span className="sr-only"> about {name}</span></Btn>
                </div>
              </div>
            </article>
          ))}
          <span aria-hidden="true" className="w-px shrink-0" />
        </div>
        <button type="button" onClick={() => step(-1)} disabled={edge[0]} aria-label="Previous treatments" className="side-arrow is-l"><IconArrow className="rotate-180" /></button>
        <button type="button" onClick={() => step(1)} disabled={edge[1]} aria-label="Next treatments" className="side-arrow is-r"><IconArrow /></button>
      </div>
    </section>
  );
}
