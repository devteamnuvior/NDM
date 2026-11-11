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
/* treatment photos for the deal cards (only where the site has one) */
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
const bfsPct = (t) => { const m = /(\d+)% OFF$/i.exec(t || ''); return m && !/GET 1/i.test(t) ? +m[1] : 0; };
const bfsTag = (t) => (t ? t.replace(/\bOFF\b/g, 'off').replace(/^BUY 1 GET 1/i, 'Buy 1 get 1').replace(/\bFREE\b/, 'free').replace(/^Save \$(\d+)\sOff$/i, 'Save $$$1') : '');
/* the deals: one card per price-list category, with the treatments (areas) that carry an offer */
const BFS_DEALS = PRICE_CATS.filter((c) => !BFS_SKIP.includes(c.id) && BFS_GROUP[c.id]).map((c) => {
  const items = c.items.filter((it) => it[2].some((o) => o[2] > 0 || o[3]));
  const tags = items.flatMap((it) => it[2].map((o) => o[3]).filter(Boolean));
  const pct = Math.max(0, ...tags.map(bfsPct));
  const offer = pct ? `Up to ${pct}% off` : bfsTag(tags[0]);
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
.bfs-tick-in{display:inline-flex;animation:bfsTick 38s linear infinite}
.bfs-tick-in span{display:inline-flex;align-items:center;gap:22px;padding-right:22px}
.bfs-tick-in i{width:5px;height:5px;border-radius:9px;background:#fff;opacity:.7}
@keyframes bfsTick{to{transform:translateX(-50%)}}
/* hero */
.bfs-hero{background:radial-gradient(55% 60% at 88% 18%,rgba(211,18,29,.42),transparent 62%),radial-gradient(45% 55% at 0% 100%,rgba(211,18,29,.22),transparent 70%),var(--k)}
/* round 26 */
.bfs-hero-pic{opacity:.5;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 55%),linear-gradient(180deg,#000 55%,transparent 96%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0,#000 55%),linear-gradient(180deg,#000 55%,transparent 96%);mask-composite:intersect}
@media (max-width:1023px){.bfs-hero-pic{opacity:.26;-webkit-mask-image:linear-gradient(180deg,#000 30%,transparent 100%);mask-image:linear-gradient(180deg,#000 30%,transparent 100%)}}
.bfs-big{position:absolute;right:38vw;top:-4vw;z-index:-1;font-size:34vw;line-height:1;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.09);pointer-events:none;user-select:none;animation:bfsDrift 14s ease-in-out infinite alternate}
.bfs-big.bfs-big-l{right:auto;left:-6vw;top:-10vw;font-size:52vw;z-index:0;-webkit-text-stroke:1.5px rgba(255,255,255,.06)}
.bfs-grid{position:absolute;inset:0;z-index:-1;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(70% 70% at 50% 40%,#000,transparent);mask-image:radial-gradient(70% 70% at 50% 40%,#000,transparent)}
.bfs-fri{color:transparent;background:linear-gradient(100deg,#fff 0%,#fff 35%,#FF6B73 50%,#fff 65%,#fff 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;animation:bfsShine 5s linear infinite;padding-right:.08em}
.bfs-rise>*{animation:bfsRise .9s cubic-bezier(.2,.7,.2,1) both}
.bfs-rise>*:nth-child(2){animation-delay:.08s}.bfs-rise>*:nth-child(3){animation-delay:.16s}.bfs-rise>*:nth-child(4){animation-delay:.24s}.bfs-rise>*:nth-child(5){animation-delay:.32s}
.bfs-fan-card{position:absolute;left:29%;top:6%;width:42%;height:88%;transition:transform .9s cubic-bezier(.3,.7,.2,1),opacity .6s ease,filter .9s ease}
.bfs-pos-0{transform:translateX(-66%) translateY(12px) rotate(-10deg) scale(.9);z-index:2;filter:brightness(.72)}
.bfs-pos-1{transform:translateY(-8px) scale(1.05);z-index:4}
.bfs-pos-2{transform:translateX(66%) translateY(12px) rotate(10deg) scale(.9);z-index:3;filter:brightness(.72)}
.bfs-pos-3{transform:translateY(22px) scale(.74);z-index:1;opacity:0;pointer-events:none}
.bfs-fan-ring{position:absolute;left:50%;top:50%;z-index:0;width:112%;aspect-ratio:1;border-radius:50%;border:1px dashed rgba(255,255,255,.16);transform:translate(-50%,-50%);animation:bfsSpin 40s linear infinite;pointer-events:none}
.bfs-fan-ring::after{content:"";position:absolute;left:50%;top:-5px;width:10px;height:10px;border-radius:50%;background:var(--r-l);box-shadow:0 0 18px 4px rgba(238,58,69,.7)}
@keyframes bfsSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.bfs-tapes{position:relative;height:118px;margin-top:8px}
.bfs-tape{overflow:hidden;white-space:nowrap;padding:11px 0;font:600 12.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase}
.bfs-tapes .bfs-tape{position:absolute;left:-5%;width:110%}
.bfs-tapes .bfs-tape:first-child{top:22px;transform:rotate(-2.2deg);z-index:1}
.bfs-tapes .bfs-tape:last-child{top:52px;transform:rotate(1.6deg)}
.bfs-tape-red{background:var(--r);color:#fff}
.bfs-tape-white{background:#fff;color:#0B0B0C}
.bfs-tape-white i{background:var(--r)!important;opacity:1!important}
.bfs-tick-in.is-rev{animation-direction:reverse}
.bfs-chip-n{color:var(--r)}.bfs-chip-k{color:#5A646C}.bfs-chip-d{color:#5A646C}
.bfs-chip-go{background:rgba(11,11,12,.06);color:#0B0B0C;transition:background-color .25s ease,color .25s ease,transform .4s cubic-bezier(.2,.7,.2,1)}
.bfs-chip:hover .bfs-chip-go{background:var(--r);color:#fff;transform:rotate(-45deg)}
.bfs-chip[aria-pressed="true"] .bfs-chip-n{color:#FF4B55}.bfs-chip[aria-pressed="true"] .bfs-chip-k,.bfs-chip[aria-pressed="true"] .bfs-chip-d{color:rgba(255,255,255,.65)}
.bfs-chip[aria-pressed="true"] .bfs-chip-go{background:var(--r);color:#fff;transform:rotate(90deg)}
.bfs-head{background:radial-gradient(90% 120% at 0% 100%,rgba(211,18,29,.5),transparent 60%),#0B0B0C}
.bfs-head-mark{position:absolute;right:-.04em;bottom:-.3em;font-size:210px;line-height:1;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.14);pointer-events:none;user-select:none;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
.bfs-card:hover .bfs-head-mark{transform:translateX(-8px) rotate(-4deg)}
.bfs-ticket.on-k::before,.bfs-ticket.on-k::after{background:#0B0B0C}
.bfs-ticket{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.bfs-ticket:hover{transform:translateY(-6px) rotate(-.6deg)}
.bfs-how-n{flex:none;font-size:clamp(48px,4.4vw,60px);line-height:.8;letter-spacing:-.05em;color:var(--r)}
.bfs-how-n i{font-style:normal;color:rgba(11,11,12,.12)}
.bfs-how-card{transition:transform .5s cubic-bezier(.2,.7,.2,1),box-shadow .5s ease}
.bfs-how-card:hover{transform:translateY(-5px);box-shadow:0 34px 60px -40px rgba(60,10,14,.5)}
.bfs-how-go{position:absolute;z-index:1;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--r);color:#fff;box-shadow:0 0 0 5px var(--pp);left:50%;bottom:-23px;transform:translateX(-50%) rotate(90deg)}
@media (min-width:768px){.bfs-how-go{left:auto;right:-25px;bottom:auto;top:50%;transform:translateY(-50%)}}
@keyframes bfsDrift{to{transform:translate3d(-2vw,1.5vw,0)}}
@keyframes bfsShine{from{background-position:125% 0}to{background-position:-125% 0}}
@keyframes bfsRise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@media (max-width:1023px){.bfs-big{font-size:70vw;top:8vw;right:-10vw}}
@media (max-width:767px){.bfs-tapes{height:104px}}
@media (prefers-reduced-motion:reduce){.bfs-big,.bfs-fri,.bfs-rise>*,.bfs-fan-ring{animation:none}.bfs-ticket,.bfs-fan-card{transition:none}}
.bfs-dot{color:var(--r)}
.bfs-cd{background:rgba(11,11,12,.68);border:1px solid rgba(255,255,255,.12);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
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
.bfs-ticket::before,.bfs-ticket::after{content:none}
.bfs-ticket .bfs-tear{position:relative}
.bfs-ticket .bfs-tear::before,.bfs-ticket .bfs-tear::after{content:"";position:absolute;z-index:5;top:-12px;width:22px;height:22px;border-radius:99px;background:#0B0B0C}
.bfs-ticket .bfs-tear::before{left:-31px}.bfs-ticket .bfs-tear::after{right:-31px}
.bfs-marq{overflow:hidden;padding:12px 0 16px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
.bfs-marq-track{display:flex;width:max-content;animation:bfsMarq 46s linear infinite}
.bfs-marq:hover .bfs-marq-track,.bfs-marq:focus-within .bfs-marq-track{animation-play-state:paused}
.bfs-marq-set{display:flex;gap:20px;padding-right:20px}
.bfs-marq-set>li{flex:none;width:clamp(286px,29vw,372px)}
@keyframes bfsMarq{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.bfs-marq{overflow-x:auto}.bfs-marq-track{animation:none}.bfs-marq-set[aria-hidden]{display:none}}
.bfs-tear{border-top:2px dashed rgba(11,11,12,.14)}
.bfs-dark{background:radial-gradient(50% 60% at 100% 0%,rgba(211,18,29,.22),transparent 60%),var(--k)}
.bfs-bar{background:rgba(11,11,12,.94);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
/* round 30: menu underline, like the home menu */
.bfs-nav{position:relative;color:rgba(255,255,255,.8);padding:6px 0;transition:color .2s ease}
.bfs-nav::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px;background:linear-gradient(90deg,#EE3A45,#D3121F);transform:scaleX(0);transform-origin:left;transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.bfs-nav:hover{color:#fff}.bfs-nav:hover::after,.bfs-nav.is-on::after{transform:scaleX(1)}
.bfs-nav.is-on{color:#fff}
.bfs-empty{background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);border:1px dashed rgba(255,255,255,.18)}
.bfs-empty-icon{background:rgba(211,18,29,.16);color:#FF5A63;animation:bfsBob 2.4s ease-in-out infinite}
@keyframes bfsBob{50%{transform:translateY(-5px)}}
/* round 30: the booking pop-up, light, in the Black Friday style: white card, black type, signal red accents, a red tape on top;
   the card keeps the home page's size */
html.bfs .book-card{background:#fff!important;box-shadow:0 0 0 1px rgba(11,11,12,.06),0 60px 120px -40px rgba(0,0,0,.65)}
html.bfs .book-card::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;border-radius:24px 24px 0 0;background:linear-gradient(90deg,#0B0B0C,#D3121F 45%,#EE3A45 70%,#0B0B0C)}
html.bfs .book-card .text-ndm-deep,html.bfs .book-card .text-ndm-blue,html.bfs .book-card .tt-strong{color:#D3121F!important}
html.bfs .book-card [aria-selected="true"],html.bfs .book-card [aria-pressed="true"],html.bfs .book-card [aria-checked="true"],html.bfs .book-card .bg-ndm-deep,html.bfs .book-card .bg-ndm-blue{background-color:#0B0B0C!important;border-color:#0B0B0C!important;color:#fff!important}
html.bfs .book-card .eyebrow{background:#0B0B0C!important;color:#fff!important;border-color:#0B0B0C!important}
html.bfs .book-card .eyebrow-mark{display:none}
html.bfs .book-card .bg-ndm-amber{background-color:#D3121F!important}
html.bfs .book-card [class*="bg-ndm-amber\/"]{background-color:rgba(211,18,29,.08)!important}
html.bfs .book-card [class*="text-ndm-amber"],html.bfs .book-card [class*="text-[#8A5A12]"]{color:#A50E18!important}
html.bfs .book-card .btn-ink,html.bfs .book-card .btn-buy{background:#0B0B0C;border-color:#0B0B0C;color:#fff}
html.bfs .book-card .btn-ink:hover,html.bfs .book-card .btn-buy:hover{background:#D3121F;border-color:#D3121F}
html.bfs .book-card input[role="switch"]:checked+span{background-color:#D3121F!important}
html.bfs .book-card input:focus,html.bfs .book-card select:focus{border-color:#D3121F!important;--tw-ring-color:rgba(211,18,29,.15)!important}
html.bfs .book-card [class*="bg-ndm-night"],html.bfs .book-card [class*="bg-[#0B0F13]"]{background:radial-gradient(80% 60% at 100% 0%,rgba(211,18,29,.45),transparent 60%),#0B0B0C!important}
@media (prefers-reduced-motion:reduce){.bfs-tick-in,.bfs-live{animation:none}.bfs-card,.bfs-chip{transition:none}}
`;

/* round 26: moving tapes. Two crossed strips close the hero; one strip divides sections */
const BFS_WORDS = [`Black Friday · ${BFS.whenShort}`, `Up to ${BFS_MAX}% off selected treatments`, 'Buy 1 get 1 offers', 'Free consultation and VISIA® skin analysis', 'Uptown and Downtown Toronto'];
function BfsTape({ tone = 'red', rev = false }) {
  const row = <span>{BFS_WORDS.map((w) => <Fragment key={w}>{w}<i /></Fragment>)}</span>;
  return <div aria-hidden="true" className={`bfs-tape bfs-tape-${tone}`}><div className={`bfs-tick-in ${rev ? 'is-rev' : ''}`}>{row}{row}{row}{row}</div></div>;
}

function BfsHeader({ count }) {
  /* round 30: the links follow the page's own order, the section in view is underlined, and the plan count shows only when
     something is in the plan */
  const links = [['how', 'How it works'], ['concerns', 'Concerns'], ['deals', 'Deals'], ['specials', 'Specials'], ['plan', 'My plan'], ['clinics', 'Clinics']];
  const [here, setHere] = useState('');
  useOnScroll(() => { let cur = ''; links.forEach(([id]) => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top < 140) cur = id; }); setHere(cur); }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0C]/95 text-white backdrop-blur-[14px]">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-4 px-[var(--gx)]">
        <a href="index.html" className="shrink-0" aria-label="NewDermaMed home"><img src="assets/icons/logo-white.svg" alt="NewDermaMed" className="h-7 w-auto min-[400px]:h-8 sm:h-10" /></a>
        <nav aria-label="Black Friday page" className="hidden items-center gap-5 whitespace-nowrap lg:flex xl:gap-7">
          <a href="index.html" className="bfs-nav font-inter text-[14.5px]">Home</a>
          {links.map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={bfsGo(id)} aria-current={here === id ? 'location' : undefined} className={`bfs-nav inline-flex items-center gap-2 font-inter text-[14.5px] ${here === id ? 'is-on' : ''}`}>
              {l}{id === 'plan' && count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#D3121F] px-1.5 text-[11px] font-semibold text-white tabular-nums">{count}</span>}
            </a>
          ))}
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

/* round 27: the offer tickets turn like a carousel. Every few seconds the front ticket moves left, the right one comes forward
   and the next one enters from behind; hovering pauses it, and clicking a side ticket brings it to the front */
function BfsFan() {
  const cards = SPECIALS.filter((x) => !/botox|dysport/i.test(x.n) && x.deal).slice(0, 5);
  const n = cards.length;
  const [k, setK] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (REDUCED || hold) return;
    const t = setInterval(() => setK((x) => x + 1), 2600);
    return () => clearInterval(t);
  }, [hold]);
  return (
    <ul role="list" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} className="bfs-fan relative mx-auto mb-8 hidden h-[clamp(250px,24vw,330px)] w-full max-w-[520px] md:block">
      {cards.map((x, i) => {
        const pos = (((i - k) % n) + n + 1) % n; /* 0 left, 1 front, 2 right, others wait behind */
        return (
          <li key={x.n} className={`bfs-fan-card bfs-pos-${Math.min(pos, 3)}`} aria-hidden={pos > 2}>
            <a href="#specials" tabIndex={pos > 2 ? -1 : 0} onClick={(e) => { if (pos !== 1 && pos < 3) { e.preventDefault(); setK((v) => v + (pos === 2 ? 1 : -1)); } else bfsGo('specials')(e); }}
              className="block h-full w-full overflow-hidden rounded-[22px] bg-white text-[#0B0B0C] shadow-[0_40px_70px_-30px_rgba(0,0,0,.85)]">
              <span className="relative block h-[62%] overflow-hidden"><img src={x.img} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: x.pos }} /><span className="bfs-off absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold">{x.deal}</span></span>
              <span className="block border-t-2 border-dashed border-black/10 px-3.5 pt-2.5">
                <span className="block truncate font-aeonik text-[18px] leading-[1.15]">{x.n}</span>
                <span className="mt-0.5 block font-inter text-[12.5px] text-ndm-muted">From <b className="font-semibold text-[#D3121F]">${x.p}</b></span>
              </span>
            </a>
          </li>
        );
      })}
      <li aria-hidden="true" className="bfs-fan-ring" />
    </ul>
  );
}

/* round 26: the hero. A giant outlined percentage behind the words, a fan of three offer tickets with the countdown, crossed tapes */
function BfsHero() {
  return (
    <section aria-labelledby="bfs-title" className="bfs-hero relative isolate overflow-hidden text-white">
      {/* round 28: the clinic at night sits behind the tickets and the countdown, fading into the black on the left and at the bottom */}
      <img src="assets/hero/clinic-exterior.jpg" alt="" className="bfs-hero-pic absolute right-0 top-0 -z-10 h-[46%] w-full object-cover lg:h-full lg:w-[60%]" style={{ objectPosition: '58% 50%' }} />
      <span aria-hidden="true" className="bfs-big font-aeonik">{BFS_MAX}%</span>
      <div className="mx-auto grid max-w-[1280px] gap-12 px-[var(--gx)] pb-[clamp(36px,4vw,56px)] pt-[clamp(48px,6vw,96px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-center">
        <div className="bfs-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-3.5 py-1.5 font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/85"><i className="bfs-live" />{BFS.when}</p>
          <h1 id="bfs-title" className="mt-6 font-aeonik text-[clamp(68px,10.5vw,164px)] font-normal leading-[.86] tracking-[-0.05em]">Black<br /><span className="tt-strong bfs-fri">Friday</span><span className="bfs-dot">.</span></h1>
          <p className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-inter text-[13px] font-semibold uppercase tracking-[.18em] text-white/60">Up to</span><b className="font-aeonik text-[clamp(52px,6vw,84px)] font-normal leading-none tracking-[-0.04em] text-[#EE3A45]">{BFS_MAX}%</b><span className="tt-strong font-aeonik text-[clamp(30px,3.4vw,46px)] leading-none text-white">off</span><span className="basis-full font-inter text-[15px] text-white/65 sm:basis-auto">selected treatments at NewDermaMed</span></p>
          <p className="mt-5 max-w-[50ch] font-inter text-[clamp(15.5px,1.2vw,17px)] leading-[1.6] text-white/75">Choose your treatment, pick your package and build one plan with all your savings. Then book a free consultation to claim it.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Btn href="#deals" v="book" hot onClick={bfsGo('deals')}>Build my plan</Btn>
            <Btn href="#/book" v="glass">Book Free Consultation</Btn>
          </div>
        </div>
        <div className="relative">
          <BfsFan />
          <div className="mx-auto max-w-[520px]"><BfsCountdown /></div>
        </div>
      </div>
      <div className="bfs-tapes"><BfsTape tone="red" /><BfsTape tone="white" rev /></div>
    </section>
  );
}

/* round 26: the sale in four numbers */
function BfsStats() {
  const ref = useRef(null);
  useReveal(ref);
  const items = [[`${BFS_MAX}%`, 'Up to, on selected packages'], [String(BFS_DEALS.length), 'Treatment groups on offer'], ['4', 'Days only, Friday to Monday'], ['$0', 'Consultation and VISIA® analysis']];
  return (
    <section ref={ref} aria-label="Black Friday at a glance" className="px-[var(--gx)] pt-[clamp(40px,5vw,72px)]">
      <ul role="list" className="mx-auto grid max-w-[1180px] grid-cols-2 gap-y-8 lg:grid-cols-4">
        {items.map(([n, l], i) => (
          <li key={l} className={`rv px-4 text-center ${i ? 'lg:border-l lg:border-black/10' : ''} ${i % 2 ? 'border-l border-black/10' : ''}`} style={{ transitionDelay: `${0.05 * i}s` }}>
            <b className="block font-aeonik text-[clamp(44px,5vw,72px)] font-normal leading-none tracking-[-0.04em] text-[#0B0B0C]">{n.replace('%', '')}{n.includes('%') && <span className="text-[#D3121F]">%</span>}</b>
            <span className="mt-2 block font-inter text-[13.5px] leading-[1.4] text-ndm-muted">{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BfsConcerns({ pick, setPick }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="concerns" aria-labelledby="bfs-c-title" className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] lg:items-end">
          <div>
            <p className="bfs-step rv"><b>1</b>Step 1</p>
            <h2 id="bfs-c-title" className="rv mt-5 font-aeonik text-[clamp(36px,4.4vw,64px)] font-normal leading-[1] tracking-[-0.035em] text-[#0B0B0C]" style={{ transitionDelay: '.05s' }}>What brings you<br /><span className="tt-strong text-[#D3121F]">in today?</span></h2>
          </div>
          <p className="rv max-w-[46ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted lg:pb-2" style={{ transitionDelay: '.08s' }}>Tap a concern and we shortlist the Black Friday deals for it. Tap it again to see everything.</p>
        </div>
        <ul role="list" className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3">
          {BFS_CONCERNS.map(([n, d, ids], i) => {
            const on = pick === n, k = ids.filter((id) => BFS_DEALS.some((x) => x.id === id)).length;
            return (
              <li key={n} className="rv" style={{ transitionDelay: `${0.03 * i}s` }}>
                <button type="button" aria-pressed={on} onClick={() => { setPick(on ? null : n); if (!on) setTimeout(() => bfsGo('deals')(), 60); }}
                  className="bfs-chip group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white p-4 text-left ring-1 ring-black/[.06] sm:p-6">
                  <span className="flex items-start justify-between gap-3">
                    <span className="bfs-chip-n font-aeonik text-[clamp(38px,3.6vw,54px)] leading-none tracking-[-0.04em]">{k}</span>
                    <span aria-hidden="true" className="bfs-chip-go grid size-9 shrink-0 place-items-center rounded-full"><IconArrow size={12} /></span>
                  </span>
                  <span className="bfs-chip-k mt-1 font-inter text-[11px] font-semibold uppercase tracking-[.14em]">{k === 1 ? 'treatment' : 'treatments'}</span>
                  <span className="mt-4 font-aeonik text-[clamp(20px,1.8vw,26px)] leading-[1.12] tracking-[-0.015em]">{n}</span>
                  <span className="bfs-chip-d mt-1.5 hidden font-inter text-[13.5px] leading-[1.45] sm:block">{d}</span>
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
      <article className={`bfs-card flex h-full flex-col overflow-hidden rounded-[24px] bg-white p-5 ring-1 ring-black/[.06] sm:p-6 ${inPlan ? 'is-in' : ''}`}>
        <div className="bfs-head relative -mx-5 -mt-5 mb-5 flex min-h-[150px] flex-col justify-between overflow-hidden p-5 text-white sm:-mx-6 sm:-mt-6 sm:p-6">
          <span aria-hidden="true" className="bfs-head-mark font-aeonik">%</span>
          <span className="relative font-inter text-[11.5px] font-semibold uppercase tracking-[.16em] text-white/65">{d.group}</span>
          {d.pct
            ? <span className="relative flex items-baseline gap-2"><span className="font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/70">Up to</span><b className="font-aeonik text-[60px] font-normal leading-[.9] tracking-[-0.04em] text-[#EE3A45]">{d.pct}%</b><span className="tt-strong font-aeonik text-[26px] leading-none">off</span></span>
            : <span className="relative max-w-[11ch] font-aeonik text-[32px] leading-[1.02] tracking-[-0.02em]">{d.offer.replace(/ (free|50% off)$/, '')} <span className="tt-strong whitespace-nowrap text-[#EE3A45]">{(/(free|50% off)$/.exec(d.offer) || [''])[0]}</span></span>}
        </div>
        <h3 className="font-aeonik text-[clamp(23px,2vw,28px)] font-normal leading-[1.1] tracking-[-0.02em] text-[#0B0B0C]">{cat}</h3>
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
            {(save > 0 || o[3]) && <span className="shrink-0 whitespace-nowrap pb-1 text-right font-inter text-[12.5px] font-semibold text-[#D3121F]">{save > 0 ? `You save ${money(save)}` : bfsTag(o[3])}</span>}
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
    <section ref={ref} id="specials" aria-labelledby="bfs-s-title" data-nav="dark" className="bfs-dark bfs-band relative mt-[clamp(64px,7vw,104px)] scroll-mt-[68px] overflow-hidden px-[var(--gx)] py-[clamp(72px,8vw,120px)] text-white">
      <span aria-hidden="true" className="bfs-big bfs-big-l font-aeonik">%</span>
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className="rv font-inter text-[12px] font-semibold uppercase tracking-[.18em] text-[#EE3A45]">Six Black Friday specials</p>
          <h2 id="bfs-s-title" className="rv mt-4 font-aeonik text-[clamp(36px,4.4vw,64px)] font-normal leading-[1.04] tracking-[-0.03em] text-white" style={{ transitionDelay: '.05s' }}>Our most wanted,<br /><span className="tt-strong text-[#EE3A45]">at their best price</span></h2>
        </div>
      </div>
      <div className="bfs-marq rv relative -mx-[var(--gx)] mt-10" style={{ transitionDelay: '.1s' }}>
        <div className="bfs-marq-track">
          {[0, 1].map((copy) => (
            <ul key={copy} role="list" className="bfs-marq-set" {...(copy ? { 'aria-hidden': 'true', inert: '' } : {})}>
              {list.map((s) => {
                const id = catOf(s);
                return (
                  <li key={s.n}>
                    <article className="bfs-ticket on-k flex h-full flex-col overflow-hidden rounded-[24px] text-[#0B0B0C]">
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
          ))}
        </div>
      </div>
    </section>
  );
}

function BfsHow() {
  const ref = useRef(null);
  useReveal(ref);
  const steps = [['Choose', 'a concern or a treatment'], ['Pick', 'a package and see your savings'], ['Book', 'a free consultation to claim it']];
  return (
    <section ref={ref} id="how" aria-labelledby="bfs-h-title" className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(40px,5vw,64px)]">
      <div className="mx-auto max-w-[1180px]">
        <h2 id="bfs-h-title" className="rv font-inter text-[12px] font-semibold uppercase tracking-[.18em] text-[#D3121F]">How it works</h2>
        <ol className="bfs-how mt-4 grid gap-3 md:grid-cols-3 md:gap-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="rv bfs-how-card relative flex items-center gap-4 rounded-[22px] bg-white px-5 py-4 ring-1 ring-black/[.06]" style={{ transitionDelay: `${0.06 * i}s`, zIndex: 3 - i }}>
              <span aria-hidden="true" className="bfs-how-n font-aeonik"><i>0</i>{i + 1}</span>
              <p className="font-inter text-[15px] leading-[1.4] text-ndm-muted"><b className="font-aeonik text-[22px] font-normal tracking-[-0.02em] text-[#0B0B0C]">{t}</b><br />{d}</p>
              {i < 2 && <span aria-hidden="true" className="bfs-how-go"><IconArrow size={13} /></span>}
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
          ) : (
            <div className="bfs-empty mt-8 rounded-[26px] p-6 sm:p-8">
              <span aria-hidden="true" className="bfs-empty-icon grid size-14 place-items-center rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 7Z" /><path d="M9 7V5.5a3 3 0 0 1 6 0V7" /><path d="M12 11v5M9.5 13.5h5" /></svg></span>
              <p className="mt-5 font-aeonik text-[clamp(26px,2.4vw,34px)] leading-[1.1] tracking-[-0.02em] text-white">Nothing in your plan yet</p>
              <p className="mt-2 max-w-[46ch] font-inter text-[15px] leading-[1.6] text-white/70">Pick a concern or browse the deals, choose a package and tap Add to my plan. Your total and savings add up here.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#deals" onClick={bfsGo('deals')} className="btn bfd-cta">Browse the deals</a>
                <Btn href="#concerns" v="glass" onClick={bfsGo('concerns')}>Start from a concern</Btn>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2" role="list">{BFS_DEALS.filter((d) => d.pct >= 50).slice(0, 4).map((d) => <li key={d.id}><a href={`#bf-${d.id}`} onClick={bfsGo(`bf-${d.id}`)} className="inline-flex items-center gap-2 rounded-full bg-white/[.07] px-3.5 py-2 font-inter text-[13px] text-white/85 ring-1 ring-white/10 transition-colors hover:bg-white/15"><b className="font-semibold text-[#FF5A63]">{d.offer}</b>{d.c.name}</a></li>)}</ul>
            </div>
          )}
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
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <p className="max-w-[90ch] font-inter text-[12px] leading-[1.6] text-white/45">© 2026 NewDermaMed. Offers apply {BFS.when}, at both clinics, to the packages shown, and may not be combined with other promotions. Treatments are given after a medical assessment. Individual results may vary.</p>
          <a href="https://nexthealthmarketing.com" target="_blank" rel="noopener" className="bfs-credit group flex shrink-0 items-center gap-2.5 font-inter text-[11px] uppercase tracking-[.16em] text-white/35 transition-colors hover:text-white/70">
            Site by<img src="assets/partners/next-health-white.svg" alt="Next Health" width="88" height="16" className="h-4 w-auto opacity-40 transition-opacity group-hover:opacity-80" />
          </a>
        </div>
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
