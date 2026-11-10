/* ---------------------------------------------------------------- Black Friday sale landing page (black-friday-sale.html, round 23).
   Layout after bellairlaserclinic.ca/black-friday-sale: a red ticker, a simple black header, the Black Friday hero with a live countdown,
   step 1 (pick a concern), step 2 (one deal card per treatment: area, package, add to my plan), the specials, how it works,
   step 3 (my plan with the running total and savings), the two clinics and a simple footer. Look: the site's Black Friday style,
   true black and signal red on warm paper. Every price and offer comes from the NDM price list (PRICE_CATS, pricing-data.jsx);
   prescription drugs are left out of the promotion (C.01.044). */
const BFS = { start: '2026-11-27T00:00:00-05:00', end: '2026-11-30T23:59:00-05:00', when: 'Friday, Nov 27 to Monday, Nov 30', whenShort: 'Nov 27 to 30' };
const BFS_SKIP = ['botox-dysport', 'latisse']; /* prescription drugs stay out of the promotion */
const BFS_GROUP = {
  'laser-hair-removal': 'Laser', 'laser-vein': 'Laser', 'laser-acne-treatment': 'Laser', 'laser-skin-resurfacing': 'Laser', 'photo-rejuvenation': 'Laser',
  '4d-rejuvalift': 'Laser', '2d-3d-laser-skin-tightening': 'Laser', '2d-3d-laser-rejuvenation': 'Laser',
  microneedling: 'Skin', facial: 'Skin', 'chemical-peel': 'Skin', 'depigmenting-treatment': 'Skin',
  'dermal-fillers': 'Injectables', 'skin-booster-and-bio-stimulators': 'Injectables', 'aptos-thread-method': 'Injectables',
  'coolsculpting-tight-sculpting': 'Body', 'non-surgical-butt-lift': 'Body', 'hair-loss': 'Hair',
  'laser-vaginal-tightening': 'Wellness', 'snoring-treatment': 'Wellness', 'toenail-fungus-removal': 'Wellness',
};
const BFS_TABS = ['All deals', 'Laser', 'Skin', 'Injectables', 'Body', 'Hair', 'Wellness'];
const BFS_CONCERNS = [
  ['Unwanted hair', 'Choose your area and laser hair removal package.', ['laser-hair-removal']],
  ['Lines and wrinkles', 'Treatments that may soften lines and refresh the skin.', ['dermal-fillers', 'skin-booster-and-bio-stimulators', 'microneedling', 'laser-skin-resurfacing', '4d-rejuvalift']],
  ['Loose or sagging skin', 'Lifting and tightening for the face, neck and body.', ['aptos-thread-method', '2d-3d-laser-skin-tightening', '4d-rejuvalift', 'skin-booster-and-bio-stimulators']],
  ['Volume and contour', 'Lips, cheeks, jawline and more.', ['dermal-fillers', 'skin-booster-and-bio-stimulators', 'aptos-thread-method']],
  ['Stubborn fat', 'Non-invasive body contouring.', ['coolsculpting-tight-sculpting']],
  ['Acne and scars', 'Laser, peels, facials and microneedling.', ['laser-acne-treatment', 'microneedling', 'chemical-peel', 'laser-skin-resurfacing', 'facial']],
  ['Spots and pigment', 'Options for an uneven skin tone.', ['photo-rejuvenation', 'depigmenting-treatment', 'chemical-peel', '2d-3d-laser-rejuvenation']],
  ['Veins and redness', 'Laser and light for visible veins and redness.', ['laser-vein', 'photo-rejuvenation']],
  ['Hair thinning', 'PRP scalp treatments.', ['hair-loss']],
];
const bfsPct = (t) => { const m = /(\d+)% OFF$/i.exec(t || ''); return m && !/GET 1/i.test(t) ? +m[1] : 0; };
const bfsTag = (t) => (t ? t.replace(/\bOFF\b/g, 'off').replace(/^BUY 1 GET 1/i, 'Buy 1 get 1').replace(/\bFREE\b/, 'free').replace(/^Save \$(\d+) Off$/i, 'Save $$$1') : '');
/* the deals: one card per price-list category, with the treatments (areas) that carry an offer */
const BFS_DEALS = PRICE_CATS.filter((c) => !BFS_SKIP.includes(c.id) && BFS_GROUP[c.id]).map((c) => {
  const items = c.items.filter((it) => it[2].some((o) => o[2] > 0 || o[3]));
  const tags = items.flatMap((it) => it[2].map((o) => o[3]).filter(Boolean));
  const pct = Math.max(0, ...tags.map(bfsPct));
  const offer = pct ? `Up to ${pct}% off` : bfsTag(tags[0]);
  const prices = items.flatMap((it) => it[2].filter((o) => o[2] > 0 || o[3]).map((o) => o[1]));
  return { c, id: c.id, group: BFS_GROUP[c.id], items, pct, offer, from: Math.min(...prices) };
}).filter((d) => d.items.length);
const BFS_MAX = Math.max(...BFS_DEALS.map((d) => d.pct));
const BFS_COUNT = BFS_DEALS.reduce((n, d) => n + d.items.length, 0);
const bfsGo = (id) => (e) => { const el = document.getElementById(id); if (!el) return; if (e) e.preventDefault(); scrollToY(el.getBoundingClientRect().top + window.scrollY - 84); };
const bfsShort = (name, cat) => name.replace(new RegExp('^' + cat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[-–]?\\s*', 'i'), '').replace(/^LHR - /, '') || name;

/* the clock and timer tiles are shared with the site (useBfClock, BfTimer in the shells, round 24) */

const BFS_CSS = `
html.bfs{--r:#D3121F;--r-d:#A50E18;--r-l:#EE3A45;--k:#0B0B0C;--pp:#FAF8F7}
html.bfs body{background:var(--pp)}
/* the page's one signature button is signal red */
html.bfs .btn-book,html.bfs .btn-hot{background:var(--r);border-color:var(--r);box-shadow:0 12px 28px -12px rgba(211,18,29,.85)}
html.bfs .btn-book:hover,html.bfs .btn-book:focus-visible{border-color:var(--r-l);box-shadow:0 16px 34px -12px rgba(211,18,29,.9)}
html.bfs .btn-hot .btn-dot,html.bfs .btn-book .btn-dot{color:var(--r)}
html.bfs .btn-book::before{background:var(--r-d)}
html.bfs .btn-ink,html.bfs .btn-buy{background:var(--k);border-color:var(--k);color:#fff}
html.bfs .btn-ink:hover,html.bfs .btn-buy:hover{background:var(--r);border-color:var(--r)}
/* red ticker */
.bfs-tick{background:var(--r);color:#fff;overflow:hidden;white-space:nowrap}
.bfs-tick-in{display:inline-flex;animation:bfsTick 38s linear infinite}
.bfs-tick-in span{display:inline-flex;align-items:center;gap:22px;padding-right:22px}
.bfs-tick-in i{width:5px;height:5px;border-radius:9px;background:#fff;opacity:.7}
@keyframes bfsTick{to{transform:translateX(-50%)}}
/* hero */
.bfs-hero{background:radial-gradient(60% 70% at 85% 30%,rgba(211,18,29,.28),transparent 60%),radial-gradient(40% 50% at 10% 100%,rgba(211,18,29,.16),transparent 70%),var(--k)}
.bfs-hero-pic{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 45%);mask-image:linear-gradient(90deg,transparent 0,#000 45%)}
@media (max-width:1023px){.bfs-hero-pic{-webkit-mask-image:linear-gradient(0deg,transparent 0,#000 70%);mask-image:linear-gradient(0deg,transparent 0,#000 70%)}}
.bfs-dot{color:var(--r)}
.bfs-cd{background:rgba(11,11,12,.55);border:1px solid rgba(255,255,255,.12);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.bfs-live{width:8px;height:8px;border-radius:9px;background:var(--r-l);box-shadow:0 0 0 0 rgba(238,58,69,.7);animation:bfsPulse 1.8s ease-out infinite}
@keyframes bfsPulse{70%{box-shadow:0 0 0 10px rgba(238,58,69,0)}100%{box-shadow:0 0 0 0 rgba(238,58,69,0)}}
/* steps and cards */
.bfs-step{display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:var(--k);color:#fff;padding:6px 14px 6px 6px;font:600 12px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}
.bfs-step b{display:grid;place-items:center;width:22px;height:22px;border-radius:99px;background:var(--r);font-size:11px;letter-spacing:0}
.bfs-chip{transition:background-color .25s ease,color .25s ease,box-shadow .25s ease,transform .25s ease}
.bfs-chip[aria-pressed="true"]{background:var(--k);color:#fff;box-shadow:0 18px 40px -24px rgba(11,11,12,.8)}
.bfs-chip:hover{transform:translateY(-2px)}
.bfs-card{transition:box-shadow .4s ease,transform .4s ease}
.bfs-card:hover{box-shadow:0 34px 60px -40px rgba(60,10,14,.55);transform:translateY(-3px)}
.bfs-card.is-in{box-shadow:0 0 0 2px var(--r),0 34px 60px -40px rgba(60,10,14,.55)}
.bfs-off{background:var(--r);color:#fff}
.bfs-opt[aria-pressed="true"]{border-color:var(--k);background:var(--k);color:#fff}
.bfs-opt[aria-pressed="true"] s{color:rgba(255,255,255,.55)}
.bfs-sel{appearance:none;-webkit-appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230B0B0C' stroke-width='2.4'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center}
.bfs-ticket{position:relative;background:#fff}
.bfs-ticket::before,.bfs-ticket::after{content:"";position:absolute;top:58%;width:22px;height:22px;border-radius:99px;background:var(--pp)}
.bfs-ticket::before{left:-11px}.bfs-ticket::after{right:-11px}
.bfs-tear{border-top:2px dashed rgba(11,11,12,.14)}
.bfs-dark{background:radial-gradient(50% 60% at 100% 0%,rgba(211,18,29,.22),transparent 60%),var(--k)}
.bfs-bar{background:rgba(11,11,12,.94);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
@media (prefers-reduced-motion:reduce){.bfs-tick-in,.bfs-live{animation:none}.bfs-card,.bfs-chip{transition:none}}
`;

function BfsTicker() {
  const words = [`Black Friday · ${BFS.whenShort}`, `Up to ${BFS_MAX}% off selected treatments`, 'Buy 1 get 1 offers on fillers and laser hair removal', 'Free consultation and VISIA® skin analysis', 'Uptown and Downtown Toronto'];
  const row = <span>{words.map((w) => <Fragment key={w}>{w}<i aria-hidden="true" /></Fragment>)}</span>;
  return (
    <div className="bfs-tick relative z-[60] py-2.5 font-inter text-[12px] font-semibold uppercase tracking-[.16em]">
      <p className="sr-only">{words.join('. ')}</p>
      <div aria-hidden="true" className="bfs-tick-in">{row}{row}{row}{row}</div>
    </div>
  );
}

function BfsHeader({ count }) {
  const links = [['deals', 'Deals'], ['specials', 'Specials'], ['how', 'How it works'], ['clinics', 'Clinics']];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0C]/95 text-white backdrop-blur-[14px]">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-4 px-[var(--gx)]">
        <a href="index.html" className="shrink-0" aria-label="NewDermaMed home"><img src="assets/icons/logo-white.svg" alt="NewDermaMed" className="h-7 w-auto min-[400px]:h-8 sm:h-10" /></a>
        <nav aria-label="Black Friday page" className="hidden items-center gap-7 lg:flex">
          {links.map(([id, l]) => <a key={id} href={`#${id}`} onClick={bfsGo(id)} className="font-inter text-[14.5px] text-white/80 transition-colors hover:text-white">{l}</a>)}
          <a href="#plan" onClick={bfsGo('plan')} className="inline-flex items-center gap-2 font-inter text-[14.5px] text-white/80 transition-colors hover:text-white">My plan<span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#D3121F] px-1.5 text-[11px] font-semibold text-white tabular-nums">{count}</span></a>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href={tel(PHONES[0].num)} className="hidden items-center gap-2 font-inter text-[14px] text-white/85 hover:text-white md:inline-flex"><IconPhone />{PHONES[0].num}</a>
          <a href={tel(PHONES[0].num)} aria-label={`Call Uptown, ${PHONES[0].num}`} className="grid size-10 place-items-center rounded-full border border-white/20 md:hidden"><IconPhone /></a>
          <Btn href="#/book" v="book" hot sm className="hidden sm:inline-flex">Book Free Consultation</Btn>
          <Btn href="#/book" v="book" hot sm className="sm:hidden">Book</Btn>
        </div>
      </div>
    </header>
  );
}

/* round 25: a calmer timer. Four plain numbers with thin dividers on a quiet glass card, one red dot for "live" */
function BfsCountdown() {
  const t = useBfClock(1000);
  if (t.over) return <p className="font-inter text-[15px] text-white/80">Black Friday has ended. Our current offers are on the <a href="promotion.html" className="underline underline-offset-4">promotions page</a>.</p>;
  const cells = [[t.d, 'Days'], [t.h, 'Hours'], [t.m, 'Minutes'], [t.s, 'Seconds']];
  return (
    <div className="bfs-cd rounded-[26px] p-5 sm:p-6" role="timer" aria-label={`${t.live ? 'Offers end in' : 'Black Friday starts in'} ${t.d} days, ${t.h} hours and ${t.m} minutes`}>
      <p className="flex items-center justify-between gap-3 font-inter text-[12px] font-medium uppercase tracking-[.16em] text-white/70">
        <span className="inline-flex items-center gap-2"><i aria-hidden="true" className="size-1.5 rounded-full bg-[#EE3A45]" />{t.live ? 'Offers end in' : 'Starts in'}</span>
        <span className="text-white/45">{t.live ? 'Mon, Nov 30' : 'Fri, Nov 27'}</span>
      </p>
      <div className="mt-5 grid grid-cols-4" aria-hidden="true">
        {cells.map(([n, l], k) => (
          <span key={l} className={`flex flex-col items-center ${k ? 'border-l border-white/10' : ''}`}>
            <b className="font-aeonik text-[clamp(38px,4.4vw,58px)] font-normal leading-none tracking-[-0.03em] text-white tabular-nums">{String(n).padStart(2, '0')}</b>
            <span className="mt-2 font-inter text-[11px] uppercase tracking-[.14em] text-white/50">{l}</span>
          </span>
        ))}
      </div>
      {t.live && <div className="bft-bar mt-6"><i style={{ width: `${(t.pct * 100).toFixed(1)}%` }} /></div>}
    </div>
  );
}

function BfsHero() {
  return (
    <section aria-labelledby="bfs-title" className="bfs-hero relative isolate overflow-hidden text-white">
      <img src="assets/hero/clinic-exterior.jpg" alt="" className="bfs-hero-pic absolute right-0 top-0 -z-10 h-[52%] w-full object-cover opacity-40 lg:h-full lg:w-[58%] lg:opacity-60" style={{ objectPosition: '58% 50%' }} />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-[var(--gx)] pb-[clamp(48px,6vw,88px)] pt-[clamp(150px,22vw,200px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-end lg:pt-[clamp(72px,8vw,120px)]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-3.5 py-1.5 font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/85"><i className="bfs-live" />Black Friday 2026</p>
          <h1 id="bfs-title" className="mt-5 font-aeonik text-[clamp(64px,10vw,150px)] font-normal leading-[.9] tracking-[-0.045em]">Black<br />Friday<span className="bfs-dot">.</span></h1>
          <p className="mt-6 max-w-[54ch] font-inter text-[clamp(16px,1.3vw,18px)] leading-[1.6] text-white/80">
            <b className="font-semibold text-white">Up to {BFS_MAX}% off selected treatments</b> at NewDermaMed, {BFS.when}. Choose your treatment, pick your package and build one plan with all your savings, then book a free consultation to claim it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Btn href="#deals" v="book" hot onClick={bfsGo('deals')}>Build my plan</Btn>
            <Btn href="#/book" v="glass">Book Free Consultation</Btn>
          </div>
          <p className="mt-6 font-inter text-[13.5px] text-white/60">Uptown, Yonge &amp; Sheppard · Downtown, Bay &amp; College</p>
        </div>
        <div className="lg:justify-self-end lg:w-full lg:max-w-[500px]">
          <BfsCountdown />
          <p className="mt-3 font-inter text-[12.5px] leading-[1.5] text-white/55">Package prices change with the area and sessions you choose. Your plan keeps a running total of your savings.</p>
        </div>
      </div>
    </section>
  );
}

function BfsConcerns({ pick, setPick }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="concerns" aria-labelledby="bfs-c-title" className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <p className="bfs-step rv"><b>1</b>Step 1</p>
        <h2 id="bfs-c-title" className="rv mt-5 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] text-[#0B0B0C]" style={{ transitionDelay: '.05s' }}>What brings you<br /><span className="tt-strong text-[#D3121F]">in today?</span></h2>
        <p className="rv mt-4 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.08s' }}>Tap a concern and we shortlist the Black Friday deals for it. Tap it again to see everything.</p>
        <ul role="list" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {BFS_CONCERNS.map(([n, d, ids], i) => {
            const on = pick === n, k = ids.filter((id) => BFS_DEALS.some((x) => x.id === id)).length;
            return (
              <li key={n} className="rv" style={{ transitionDelay: `${0.03 * i}s` }}>
                <button type="button" aria-pressed={on} onClick={() => { setPick(on ? null : n); if (!on) setTimeout(() => bfsGo('deals')(), 60); }}
                  className="bfs-chip flex h-full w-full flex-col rounded-[20px] bg-white p-4 text-left ring-1 ring-black/[.06] sm:p-5">
                  <span className={`font-inter text-[11px] font-semibold uppercase tracking-[.14em] ${on ? 'text-white/60' : 'text-[#D3121F]'}`}>{k} {k === 1 ? 'treatment' : 'treatments'}</span>
                  <span className="mt-2 font-aeonik text-[clamp(19px,1.6vw,23px)] leading-[1.15]">{n}</span>
                  <span className={`mt-1.5 hidden font-inter text-[13px] leading-[1.45] sm:block ${on ? 'text-white/70' : 'text-ndm-muted'}`}>{d}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function BfsDealCard({ d, plan, toggle }) {
  const [ii, setIi] = useState(0);
  const it = d.items[ii];
  const opts = it[2].map((o, k) => [o, k]).filter(([o]) => o[2] > 0 || o[3]);
  const [pickOi, setOi] = useState(opts[0][1]);
  const oi = opts.some(([, k]) => k === pickOi) ? pickOi : opts[0][1]; /* a new area starts on its first offer */
  const o = it[2][oi];
  const key = `${d.id}|${it[0]}|${o[0]}`;
  const inPlan = plan.some((p) => p.key === key);
  const cat = d.c.name;
  const save = o[2] > 0 ? o[2] - o[1] : 0;
  return (
    <li id={`bf-${d.id}`} className="scroll-mt-[96px]">
      <article className={`bfs-card flex h-full flex-col rounded-[24px] bg-white p-5 ring-1 ring-black/[.06] sm:p-6 ${inPlan ? 'is-in' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="font-inter text-[11.5px] font-semibold uppercase tracking-[.16em] text-ndm-muted">{d.group}</span>
          <span className="bfs-off rounded-full px-3 py-1 font-inter text-[12px] font-semibold">{d.offer}</span>
        </div>
        <h3 className="mt-4 font-aeonik text-[clamp(23px,2vw,28px)] font-normal leading-[1.1] tracking-[-0.02em] text-[#0B0B0C]">{cat}</h3>
        <p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-muted">{d.c.blurb}</p>
        {d.items.length > 1 && (
          <label className="mt-5 block">
            <span className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Treatment or area</span>
            <select value={ii} onChange={(e) => setIi(+e.target.value)} className="bfs-sel mt-2 h-12 w-full rounded-[14px] border border-black/10 pl-4 pr-10 font-inter text-[15px] text-[#0B0B0C] outline-none focus:border-[#0B0B0C]">
              {d.items.map((x, k) => <option key={x[0]} value={k}>{bfsShort(x[0], cat)}</option>)}
            </select>
          </label>
        )}
        <div className="mb-6 mt-5">
          <span className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Package</span>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`${cat} packages`}>
            {opts.map(([x, k]) => (
              <button key={k} type="button" aria-pressed={k === oi} onClick={() => setOi(k)}
                className="bfs-opt rounded-[12px] border border-black/10 px-3 py-2 text-left font-inter text-[13px] leading-[1.25] text-[#0B0B0C] transition-colors hover:border-black/40">
                <span className="block font-medium">{x[0]}</span>
                <span className="block tabular-nums">{money(x[1])}{x[2] > 0 && <s className="ml-1.5 text-ndm-muted">{money(x[2])}</s>}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bfs-tear mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <p>
              <span className="block font-inter text-[12px] text-ndm-muted">{bfsShort(it[0], cat)} · {o[0]}</span>
              <span className="mt-1 flex items-baseline gap-2">
                <b className="font-aeonik text-[34px] font-normal leading-none tracking-[-0.03em] text-[#0B0B0C]">{money(o[1])}</b>
                {o[2] > 0 && <s className="font-inter text-[15px] text-ndm-muted">{money(o[2])}</s>}
              </span>
            </p>
            {(save > 0 || o[3]) && <span className="pb-1 text-right font-inter text-[12.5px] font-semibold text-[#D3121F]">{save > 0 ? `You save ${money(save)}` : bfsTag(o[3])}</span>}
          </div>
          <button type="button" onClick={() => toggle({ key, cat, item: bfsShort(it[0], cat), opt: o[0], price: o[1], reg: o[2] || 0, tag: bfsTag(o[3]) })}
            className={`btn mt-5 w-full ${inPlan ? 'btn-line' : 'btn-ink'}`} aria-pressed={inPlan}>
            {inPlan ? 'In my plan, tap to remove' : 'Add to my plan'}
          </button>
        </div>
      </article>
    </li>
  );
}

function BfsDeals({ pick, setPick, plan, toggle }) {
  const ref = useRef(null);
  useReveal(ref);
  const [tab, setTab] = useState('All deals');
  const ids = pick ? BFS_CONCERNS.find((c) => c[0] === pick)[2] : null;
  const list = BFS_DEALS.filter((d) => (!ids || ids.includes(d.id)) && (tab === 'All deals' || d.group === tab));
  return (
    <section ref={ref} id="deals" aria-labelledby="bfs-d-title" className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="bfs-step rv"><b>2</b>Step 2</p>
            <h2 id="bfs-d-title" className="rv mt-5 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] text-[#0B0B0C]" style={{ transitionDelay: '.05s' }}>Build<br /><span className="tt-strong text-[#D3121F]">your plan.</span></h2>
            <p className="rv mt-4 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.08s' }}>Add any treatment to your plan and your savings add up below. Mix and match, then book a free consultation to claim them.</p>
          </div>
          <p className="rv font-inter text-[14px] text-ndm-muted" style={{ transitionDelay: '.1s' }}><b className="font-semibold text-[#0B0B0C]">{list.length}</b> {list.length === 1 ? 'treatment' : 'treatments'}{pick && <> for <b className="font-semibold text-[#0B0B0C]">{pick.toLowerCase()}</b> · <button type="button" onClick={() => setPick(null)} className="text-[#D3121F] underline underline-offset-4">show all</button></>}</p>
        </div>
        <div className="no-scrollbar -mx-[var(--gx)] mt-8 overflow-x-auto px-[var(--gx)]">
          <div className="inline-flex gap-1 rounded-full bg-black/[.05] p-1" role="tablist" aria-label="Deal categories">
            {BFS_TABS.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`shrink-0 rounded-full px-4 py-2.5 font-inter text-[14px] transition-colors ${tab === t ? 'bg-[#0B0B0C] font-medium text-white' : 'text-ndm-muted hover:text-[#0B0B0C]'}`}>{t}</button>
            ))}
          </div>
        </div>
        {list.length ? (
          <ul role="list" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((d) => <BfsDealCard key={d.id} d={d} plan={plan} toggle={toggle} />)}
          </ul>
        ) : <p className="mt-8 font-inter text-[15px] text-ndm-muted">No deals in this group for that concern. <button type="button" onClick={() => setTab('All deals')} className="text-[#D3121F] underline underline-offset-4">See all deals</button></p>}
        <p className="mt-6 font-inter text-[12.5px] leading-[1.55] text-ndm-muted">Prices in CAD from the current NewDermaMed price list, before tax. Your provider confirms which treatment suits you at your free consultation. Individual results may vary.</p>
      </div>
    </section>
  );
}

function BfsSpecials() {
  const ref = useRef(null);
  useReveal(ref);
  const list = SPECIALS.filter((s) => !/botox|dysport/i.test(s.n)).slice(0, 6);
  const catOf = (s) => { const m = /#pg-([a-z0-9-]+)-h/.exec(s.h || ''); return m && BFS_DEALS.some((d) => d.id === m[1]) ? m[1] : null; };
  return (
    <section ref={ref} id="specials" aria-labelledby="bfs-s-title" className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className="rv font-inter text-[12px] font-semibold uppercase tracking-[.18em] text-[#D3121F]">Six Black Friday specials</p>
          <h2 id="bfs-s-title" className="rv mt-4 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] text-[#0B0B0C]" style={{ transitionDelay: '.05s' }}>Our most wanted,<br /><span className="tt-strong text-[#D3121F]">at their best price</span></h2>
        </div>
        <ul role="list" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => {
            const id = catOf(s);
            return (
              <li key={s.n} className="rv" style={{ transitionDelay: `${0.04 * i}s` }}>
                <article className="bfs-ticket flex h-full flex-col overflow-hidden rounded-[24px] ring-1 ring-black/[.06]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F1EF]">
                    <img src={s.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: s.pos }} />
                    {s.deal && <span className="bfs-off absolute left-3 top-3 rounded-full px-3 py-1.5 font-inter text-[12px] font-semibold">{s.deal}</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-aeonik text-[24px] font-normal leading-[1.1] tracking-[-0.02em] text-[#0B0B0C]">{s.n}</h3>
                    <p className="mt-1.5 font-inter text-[14px] leading-[1.5] text-ndm-muted">{s.d}</p>
                    <div className="bfs-tear mt-auto flex items-end justify-between gap-3 pt-5">
                      <p><span className="block font-inter text-[11px] uppercase tracking-[.16em] text-ndm-muted">From</span><b className="font-aeonik text-[30px] font-normal leading-none tracking-[-0.03em] text-[#0B0B0C]">${s.p}</b>{s.u && <span className="ml-1.5 font-inter text-[12.5px] text-ndm-muted">{s.u}</span>}</p>
                      {id ? <Btn href={`#bf-${id}`} v="ink" sm onClick={bfsGo(`bf-${id}`)}>See packages</Btn> : <Btn href="#/book" v="ink" sm>Book</Btn>}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function BfsHow() {
  const ref = useRef(null);
  useReveal(ref);
  const steps = [
    ['Choose your treatment', 'Pick a concern or browse the deals, then choose the treatment or area that fits you.'],
    ['Pick your package', 'Choose the sessions or units you want. Every package shows its price and what you save.'],
    ['Book to claim it', 'Book a free consultation. Your provider confirms your plan, and you pay at your appointment.'],
  ];
  return (
    <section ref={ref} id="how" aria-labelledby="bfs-h-title" className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <p className="rv font-inter text-[12px] font-semibold uppercase tracking-[.18em] text-[#D3121F]">How it works</p>
        <h2 id="bfs-h-title" className="rv mt-4 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] text-[#0B0B0C]" style={{ transitionDelay: '.05s' }}>Your plan, in<br /><span className="tt-strong text-[#D3121F]">three simple steps</span></h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="rv rounded-[24px] bg-white p-6 ring-1 ring-black/[.06]" style={{ transitionDelay: `${0.05 * i}s` }}>
              <span className="grid size-11 place-items-center rounded-full bg-[#0B0B0C] font-aeonik text-[20px] text-white">{i + 1}</span>
              <h3 className="mt-5 font-aeonik text-[24px] font-normal leading-[1.1] text-[#0B0B0C]">{t}</h3>
              <p className="mt-2 font-inter text-[15px] leading-[1.6] text-ndm-muted">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BfsPlan({ plan, toggle, clear }) {
  const total = plan.reduce((n, p) => n + p.price, 0);
  const saved = plan.reduce((n, p) => n + (p.reg ? p.reg - p.price : 0), 0);
  return (
    <section id="plan" aria-labelledby="bfs-p-title" data-nav="dark" className="bfs-dark mt-[clamp(64px,7vw,104px)] scroll-mt-[68px] px-[var(--gx)] py-[clamp(64px,7vw,104px)] text-white">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <p className="bfs-step bg-white/10"><b>3</b>Step 3</p>
          <h2 id="bfs-p-title" className="mt-5 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em]">All your favourites,<br /><span className="tt-strong text-[#EE3A45]">together.</span></h2>
          {plan.length ? (
            <ul role="list" className="mt-8 divide-y divide-white/10 rounded-[22px] bg-white/[.05] px-5 ring-1 ring-white/10">
              {plan.map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-4 py-4">
                  <span className="min-w-0">
                    <span className="block font-inter text-[12px] uppercase tracking-[.14em] text-white/55">{p.cat}</span>
                    <span className="mt-1 block font-inter text-[15px] text-white">{p.item}{p.item !== p.opt && <span className="text-white/60"> · {p.opt}</span>}</span>
                    {p.tag && <span className="mt-1 block font-inter text-[12.5px] font-semibold text-[#EE3A45]">{p.tag}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-right font-inter text-[15px] tabular-nums">{money(p.price)}{p.reg > 0 && <s className="block text-[12.5px] text-white/45">{money(p.reg)}</s>}</span>
                    <button type="button" onClick={() => toggle(p)} aria-label={`Remove ${p.cat}, ${p.item} from my plan`} className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white hover:text-white"><IconClose size={14} /></button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-8 max-w-[46ch] font-inter text-[15.5px] leading-[1.6] text-white/70">Your plan is empty. Choose a treatment and package above to begin. <a href="#deals" onClick={bfsGo('deals')} className="text-white underline underline-offset-4">See the deals</a></p>}
        </div>
        <aside className="self-start rounded-[26px] bg-white p-6 text-[#0B0B0C] lg:sticky lg:top-[96px]">
          <p className="font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-ndm-muted">Plan total</p>
          <p className="mt-2 font-aeonik text-[52px] font-normal leading-none tracking-[-0.04em] tabular-nums">{money(total)}</p>
          <p className="mt-2 font-inter text-[15px] font-semibold text-[#D3121F]">You save {money(saved)}</p>
          <p className="mt-1 font-inter text-[13px] text-ndm-muted">{plan.length} {plan.length === 1 ? 'treatment' : 'treatments'} in your plan</p>
          <div className="mt-6 grid gap-2.5">
            <Btn href="#/book" v="book" hot block>Book Free Consultation</Btn>
            <Btn href={tel(PHONES[0].num)} v="line" block>Call Uptown {PHONES[0].num}</Btn>
            <Btn href={tel(PHONES[1].num)} v="line" block>Call Downtown {PHONES[1].num}</Btn>
          </div>
          <p className="mt-4 font-inter text-[12px] leading-[1.5] text-ndm-muted">Mention your plan when you book. Prices in CAD, before tax; your plan and final price are confirmed at your free consultation, and you pay at your appointment.</p>
          {plan.length > 0 && <button type="button" onClick={clear} className="mt-3 font-inter text-[13px] text-ndm-muted underline underline-offset-4 hover:text-[#0B0B0C]">Clear my plan</button>}
        </aside>
      </div>
    </section>
  );
}

function BfsClinics() {
  return (
    <section id="clinics" aria-labelledby="bfs-k-title" className="scroll-mt-[84px] px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <p className="font-inter text-[12px] font-semibold uppercase tracking-[.18em] text-[#D3121F]">Two Toronto clinics</p>
        <h2 id="bfs-k-title" className="mt-4 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] text-[#0B0B0C]">Find your<br /><span className="tt-strong text-[#D3121F]">NewDermaMed.</span></h2>
        <ul role="list" className="mt-10 grid gap-5 md:grid-cols-2">
          {CLINICS.map((c) => (
            <li key={c.name} className="overflow-hidden rounded-[24px] bg-white ring-1 ring-black/[.06]">
              <div className="relative aspect-[16/8] overflow-hidden"><img src={c.img} alt={`The NewDermaMed ${c.name} clinic`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>
              <div className="p-6">
                <h3 className="font-aeonik text-[26px] font-normal leading-none text-[#0B0B0C]">{c.name}</h3>
                <p className="mt-3 font-inter text-[15px] leading-[1.5] text-[#0B0B0C]">{c.addr}</p>
                <p className="mt-1 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">{c.note}</p>
                <p className="mt-3 font-inter text-[13.5px] text-ndm-muted">{HOURS.map(([d, h]) => `${d.replace(' – ', ' to ')} ${h.replace(' – ', ' to ')}`).join(' · ')}</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Btn href="#/book" v="book" hot sm>Book Free Consultation</Btn>
                  <Btn href={tel(c.phone)} v="line" sm>{c.phone}</Btn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BfsFooter() {
  return (
    <footer className="bg-[#0B0B0C] px-[var(--gx)] pb-[calc(32px+env(safe-area-inset-bottom))] pt-14 text-white lg:pb-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-aeonik text-[clamp(30px,3.4vw,46px)] leading-[1.05] tracking-[-0.03em]">Black Friday ends<br /><span className="tt-strong text-[#EE3A45]">{BFS.whenShort.replace('Nov 27 to ', 'November ')}.</span></p>
            <p className="mt-3 font-inter text-[15px] text-white/70">Book your free consultation and VISIA® skin analysis to claim your plan.</p>
          </div>
          <div className="flex flex-wrap gap-2.5"><Btn href="#/book" v="book" hot>Book Free Consultation</Btn><Btn href="#deals" v="glass" onClick={bfsGo('deals')}>See the deals</Btn></div>
        </div>
        <div className="flex flex-col gap-6 pt-8 md:flex-row md:items-center md:justify-between">
          <a href="index.html"><img src="assets/icons/logo-white.svg" alt="NewDermaMed" className="h-10 w-auto" /></a>
          <p className="font-inter text-[13.5px] text-white/60">{CLINICS.map((c) => `${c.name} ${c.phone}`).join(' · ')}</p>
          <p className="flex flex-wrap gap-x-5 gap-y-2 font-inter text-[13.5px] text-white/60">
            <a href="index.html" className="hover:text-white">Main site</a><a href="pricing.html" className="hover:text-white">Full price list</a><a href={SHOP_URL} target="_blank" rel="noopener" className="hover:text-white">Skincare shop ↗</a>
          </p>
        </div>
        <p className="mt-8 font-inter text-[12px] leading-[1.6] text-white/45">© 2026 NewDermaMed. Offers apply {BFS.when}, at both clinics, to the packages shown, and may not be combined with other promotions. Treatments are given after a medical assessment. Individual results may vary.</p>
      </div>
    </footer>
  );
}

function BfsPlanBar({ plan }) {
  const total = plan.reduce((n, p) => n + p.price, 0);
  if (!plan.length) return null;
  return (
    <div className="bfs-bar fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,.7)] lg:hidden">
      <span className="font-inter text-[14px]"><b className="font-semibold">My plan</b> · {plan.length} · <span className="tabular-nums">{money(total)}</span></span>
      <a href="#plan" onClick={bfsGo('plan')} className="btn btn-sm h-10 rounded-full bg-[#D3121F] px-5 text-white">Review</a>
    </div>
  );
}
