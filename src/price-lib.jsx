/* ---------------------------------------------------------------- prices, one source for the whole site (round 29)
   PRICE_CATS comes from src/pricing-data.jsx (the pricing page's list) and is copied into both shells by src/sync_prices.py,
   so every page reads the same numbers. Edit src/pricing-data.jsx, run the sync, then rebuild.
   priceFrom(id, item) gives the lowest price after the discount, counted per unit (unit categories), per syringe or per session
   (package price / count in its label): e.g. Botox / Dysport, Dysport 220 units $1694 -> $7.70 / unit.
   priceFor(name) finds a treatment by its name anywhere on the site and returns "From $X" (or null when it is not on the list). */
const PRICE_BY_ID = Object.fromEntries(PRICE_CATS.map((c) => [c.id, c]));
const pfmt = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-CA', { useGrouping: false, minimumFractionDigits: Math.round(n * 100) % 100 ? 2 : 0, maximumFractionDigits: 2 });
const pCount = (label) => { const m = /(\d+)\s*(units?|syringes?|sessions?|vials?|treatments?|zones?)\b/i.exec(label) || /package of (\d+)/i.exec(label); return m ? +m[1] : 1; };
/* a percentage offer, also with the sale's name in front ("BLACK FRIDAY 30% OFF"), as the site reads it (price-book.ts percentOff) */
const pPct = (tag) => { const m = /(?:^|\s)(\d+)%\s*OFF$/i.exec(String(tag || '').trim()); return m ? +m[1] : 0; };
/* a "from" price as shown: per unit to the cent, anything else up to the next whole dollar ($167.33 -> $168), as the site (fromValue) */
const fromValue = (n, perUnit) => { const c = Math.round(n * 100) / 100; return perUnit ? c : Math.ceil(c); };
const pNorm = (s) => String(s || '').toLowerCase().replace(/[®™]/g, '').replace(/[–-]/g, ' ').replace(/\s+/g, ' ').trim();
function priceOptions(id, item) {
  const c = PRICE_BY_ID[id]; if (!c) return [];
  const its = item ? c.items.filter((it) => pNorm(it[0]) === pNorm(item) || pNorm(it[0]).includes(pNorm(item))) : c.items;
  return (its.length ? its : c.items).flatMap((it) => it[2].map((o) => ({ item: it[0], label: o[0], price: o[1], reg: o[2], tag: o[3] || '', code: o[4] || 0 })));
}
/* withCode: the price with the running sale's checkout code where it applies. On by default since 2026-11-25 (user: every
   price on the site is the Pricing page's), so every page shows the same "from" price as the price list's own rows */
function priceFrom(id, item, withCode = true) {
  const c = PRICE_BY_ID[id]; const os = priceOptions(id, item); if (!c || !os.length) return null;
  let best = null;
  os.forEach((o) => { const n = /regular/i.test(o.label) ? 1 : pCount(o.label); const paid = withCode && o.code && o.code < o.price ? o.code : o.price; const v = paid / n; if (!best || v < best.v - 0.001 || (Math.abs(v - best.v) <= 0.001 && n > best.n)) best = { v, o, n, paid }; });
  const pct = Math.max(0, ...os.map((o) => pPct(o.tag)));
  const tags = os.map((o) => o.tag).filter(Boolean);
  const offer = pct ? `Up to ${pct}% off` : (tags[0] ? tags[0].replace(/\bOFF\b/g, 'off').replace(/^BUY 1 GET 1/i, 'Buy 1 get 1').replace(/\bFREE\b/, 'free').replace(/^Save \$(\d+)\sOff$/i, 'Save $$$1') : '');
  /* the struck price beside it: the regular price, else (a code-only line) the price before the code, on the same count */
  const full = best.o.reg && best.o.reg > best.paid ? best.o.reg : best.paid < best.o.price ? best.o.price : 0;
  const reg = full ? (c.unit ? Math.round((full / best.n) * 100) / 100 : Math.round(full / best.n)) : 0;
  return { src: { item: best.o.item, label: best.o.label, price: best.paid, count: best.n, reg }, value: fromValue(best.v, c.unit), unit: c.unit ? ' / unit' : '', per: c.unit ? 'per unit' : /syringe/i.test(best.o.label) ? 'per syringe' : /zone/i.test(best.o.label) ? 'per zone' : best.n > 1 || /session/i.test(best.o.label) ? 'per session' : '', pct, offer };
}
const priceLabel = (id, item) => { const f = priceFrom(id, item); return f ? `From ${pfmt(f.value)}${f.unit}` : null; };
/* names used on the site's cards and menus, mapped to the price list: [category id, treatment] */
const PRICE_NAMES = {
  'botox': ['botox-dysport', 'Botox Cosmetic'], 'dysport': ['botox-dysport', 'Dysport'], 'botox / dysport': ['botox-dysport'],
  'dermal fillers': ['dermal-fillers'], 'juvederm': ['dermal-fillers'], 'lip fillers': ['dermal-fillers', 'Lip Enhancement'], 'lip filler': ['dermal-fillers', 'Lip Enhancement'],
  'lip augmentation': ['dermal-fillers', 'Lip Enhancement'], 'under eye filler': ['dermal-fillers', 'Precision'], 'tear trough correction': ['dermal-fillers', 'Precision'],
  'skin boosters': ['skin-booster-and-bio-stimulators', 'Skin Booster'], 'skin booster': ['skin-booster-and-bio-stimulators', 'Skin Booster'], 'mesotherapy & skin boosters': ['skin-booster-and-bio-stimulators', 'Skin Booster'],
  'sculptra': ['skin-booster-and-bio-stimulators', 'Sculptra'], 'sculptra liquid facelift': ['skin-booster-and-bio-stimulators', 'Sculptra'], 'radiesse': ['skin-booster-and-bio-stimulators', 'Radiesse'],
  'hand rejuvenation with radiesse': ['skin-booster-and-bio-stimulators', 'Radiesse'], 'aptos thread lift': ['aptos-thread-method'], 'aptos': ['aptos-thread-method'],
  'microneedling': ['microneedling'], 'laser skin resurfacing': ['laser-skin-resurfacing'], 'micro laser peel': ['laser-skin-resurfacing', 'Laser Peel'],
  'photo rejuvenation': ['photo-rejuvenation'], 'photo rejuvenation (ipl)': ['photo-rejuvenation'], 'ipl': ['photo-rejuvenation'],
  '4d rejuvalift': ['4d-rejuvalift'], 'laser skin tightening': ['2d-3d-laser-skin-tightening'], 'skin tightening': ['2d-3d-laser-skin-tightening'],
  'chemical peels': ['chemical-peel'], 'chemical peel': ['chemical-peel'], 'medical facials': ['facial'], 'age element facial': ['facial', 'Age Element'], 'facial': ['facial'],
  'acnelan': ['chemical-peel', 'Acnelan'], 'cosmelan & dermamelan': ['depigmenting-treatment'], 'dermamelan': ['depigmenting-treatment', 'Dermamelan'], 'cosmelan': ['depigmenting-treatment', 'Cosmelan'],
  'laser acne treatment': ['laser-acne-treatment'], 'acne treatments': ['laser-acne-treatment'], 'laser hair removal': ['laser-hair-removal'],
  'laser vein removal': ['laser-vein'], 'spider vein removal': ['laser-vein'], 'coolsculpting': ['coolsculpting-tight-sculpting', 'Coolsculpting'], 'tightsculpting': ['coolsculpting-tight-sculpting', 'Tight Sculpting'],
  'non surgical butt lift': ['non-surgical-butt-lift'], 'non surgical bbl': ['non-surgical-butt-lift'], 'prp hair restoration': ['hair-loss', 'PRP Scalp'], 'prp face': ['microneedling', 'Microneedling with PRP'], 'hair loss treatments': ['hair-loss'],
  'laser hair rejuvenation': ['hair-loss'], 'vaginal tightening': ['laser-vaginal-tightening'], 'snoring treatment': ['snoring-treatment'], 'nail fungus treatment': ['toenail-fungus-removal'],
};
function priceFor(name) {
  const k = pNorm(name).replace(/\s*·\s*/g, ' ');
  const hit = PRICE_NAMES[k] || (PRICE_BY_ID[k.replace(/[^a-z0-9]+/g, '-')] ? [k.replace(/[^a-z0-9]+/g, '-')] : null) || (() => { const c = PRICE_CATS.find((x) => pNorm(x.name) === k); return c ? [c.id] : null; })();
  return hit ? priceLabel(hit[0], hit[1]) : null;
}
const priceInfo = (name) => { const k = pNorm(name); const hit = PRICE_NAMES[k] || (() => { const c = PRICE_CATS.find((x) => pNorm(x.name) === k); return c ? [c.id] : null; })(); return hit ? { id: hit[0], item: hit[1], ...priceFrom(hit[0], hit[1]) } : null; };
/* the price rows of one treatment, for the treatment pages' price tables: [option, price, regular, badge] */
const priceRows = (id, item) => { const c = PRICE_BY_ID[id]; const it = c && c.items.find((x) => pNorm(x[0]).includes(pNorm(item))); return it ? it[2] : []; };
/* the lowest price in one price table after its discounts; per unit when the table is priced per unit (e.g. 220 units $1848 -> $8.40) */
const rowsFrom = (rows, perUnit) => Math.round(Math.min(...rows.map((r) => (perUnit && !/regular/i.test(r[0]) ? r[1] / pCount(r[0]) : r[1]))) * 100) / 100;
/* ---------------------------------------------------------------- sale tags and where a "from" price comes from (2026-11-16)
   SALE_LOOK: the look of the offer tags while a promotion runs: 'vip' and 'bf' (black and gold, like VIP Early Access + Black Friday), 'holiday' (green and gold),
   'newyear' (slate), or '' for the plain red tags. Every price table (pricing, Botox, Aptos) reads it. */
const SALE_LOOK = PRICE_SALE ? 'bf' : '';
/* the checkout code's percentage ("+ EXTRA 30%") while the sale runs */
const SALE_PCT = PRICE_SALE ? PRICE_SALE.percent : 0;
/* whether the pills name the sale ("BLACK FRIDAY 30% OFF") or give the offer only ("30% OFF"): the pricing page's list gives
   the offer only (user, 2026-11-25, as the site); the treatment pages' tables keep the name. pricing-ui.jsx sets it to false. */
let SALE_NAME_SHOWN = true;
const saleWords = (t) => (SALE_NAME_SHOWN ? t : String(t).replace(/^\s*BLACK\s+FRIDAY\s+/i, ''));
/* a red half of the flame icon alone beside an offer of one part ("30% OFF" | flame, "SAVE $1,000" | flame): the pricing page's
   list and Monthly specials cards (user, 2026-11-26; it replaced the words "BEST DEAL"), pricing-ui.jsx sets it to true */
let ICON_HALF_SHOWN = false;
const withIconHalf = (parts) => (ICON_HALF_SHOWN && parts.length === 1 ? [parts[0], ''] : parts);
const FireIcon = () => <svg aria-hidden="true" className="sb-fire-ico" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>;
/* one half of a pill: the red half is plain red everywhere (user, 2026-11-26: no fire; site: PillPart), with the flame icon
   alone when it has no words */
const PillPart = ({ text, second }) => (!second
  ? <span className="sb-a">{saleWords(text)}</span>
  : <span className={`sb-b${text ? '' : ' sb-only'}`}>{text ? saleWords(text) : <FireIcon />}</span>);
/* the lowest row of one price table and how it is counted (per unit when the table is priced per unit) */
const rowsSource = (rows, perUnit) => {
  let best = null;
  rows.forEach((r) => { const n = perUnit && !/regular/i.test(r[0]) ? pCount(r[0]) : 1; const v = r[1] / n; if (!best || v < best.v - 0.001 || (Math.abs(v - best.v) <= 0.001 && n > best.n)) best = { v, r, n }; });
  return best ? { label: best.r[0], price: best.r[1], count: best.n, reg: best.r[2] ? Math.round((best.r[2] / best.n) * 100) / 100 : 0 } : null;
};
/* a clinic tag in the pill's words: "Save $1000 Off" -> "SAVE $1,000" */
const tagWords = (t) => String(t || '').trim().toUpperCase().replace(/\s+/g, ' ').replace(/^SALE\s+/, '').replace(/^SAVE \$(\d+)(?: OFF)?$/, (_, n) => 'SAVE $' + Number(n).toLocaleString('en-CA'));
/* the offer of a list of tags as the pill shows it: the biggest percentage, else the first tag, split after "BUY 1" */
const strictPct = (t) => { const m = /^(\d+)%\s*OFF$/i.exec(t || ''); return m ? +m[1] : 0; };
const saleBadge = (tags) => {
  const ts = tags.filter(Boolean).map(tagWords); if (!ts.length) return [];
  const t = ts.sort((a, b) => strictPct(b) - strictPct(a))[0]; const m = /^(BUY \d+)\s+(GET .+)$/.exec(t);
  return m ? [m[1], m[2]] : [t];
};
/* whether the checkout code belongs beside the badge: only when the option the badge is read from takes the code (site: badgeCoded) */
const badgeCoded = (opts) => {
  const tagged = opts.filter((o) => o[3] && tagWords(o[3]));
  if (!tagged.length) return opts.some((o) => !!o[4]);
  return !![...tagged].sort((a, b) => strictPct(tagWords(b[3])) - strictPct(tagWords(a[3])))[0][4];
};
/* the offer tag: the plain red tag, or in a sale's look the pill, in two halves when the offer has two parts
   ("30% OFF" | "+ EXTRA 30%", "BUY 1" | "GET 1 FREE"), as the site's OfferTag */
function SaleTag({ offer, badge, coded, small, plain = 'pr-badge' }) {
  if (!SALE_LOOK) return offer ? <span className={plain}>{offer}</span> : null;
  const b = badge || [];
  const found = b.length === 1 && coded && /%\s*OFF$/.test(b[0]) ? [b[0], `+ EXTRA ${SALE_PCT}%`] : b.length ? b : coded ? [`+ EXTRA ${SALE_PCT}%`] : [];
  if (!found.length) return null;
  const parts = withIconHalf(found);
  return <span data-look={SALE_LOOK} className={`sb ${small ? 'sb-sm' : ''} ${parts.length > 1 ? 'sb-split' : ''}`}>{parts.map((t, i) => <PillPart key={i} text={t} second={i > 0} />)}</span>;
}
/* the offer of a specials card (wheel, Promotion cards, Pricing specials) as a pill in the pricing tags' pattern, in the site's
   own navy and sky (round 37): "Up to 30% off" -> UP TO | 30% OFF, "Buy 1 get 1 free" -> BUY 1 | GET 1 FREE, "Save $1000" -> SAVE $1,000 */
const dealParts = (d) => { const t = tagWords(d); const m = /^(UP TO|BUY \d+)\s+(.+)$/.exec(t); return m ? [m[1], m[2]] : t ? [t] : []; };
function DealPill({ deal, className = '' }) {
  const p = dealParts(deal);
  if (!p.length) return null;
  /* during the Black Friday sale black and plain red, as the site (web/src/styles/sale-bf.css, user, 2026-11-26: no fire) */
  return <span data-look={SALE_LOOK || undefined} className={`dp ${p.length > 1 ? 'dp-split' : ''} ${className}`}>{p.map((t, i) => <span key={i} className={i ? 'dp-b' : 'dp-a'}>{t}</span>)}</span>;
}
/* where a lowest price is read from: "Skin Booster, 2 Syringes" (withItem puts the treatment first) */
const sourceWords = (s, withItem) => {
  if (!s) return '';
  const what = [withItem ? s.item : '', s.label === 'Regular' ? 'Per unit' : s.label].filter(Boolean).join(', ');
  return what;
};
/* "From $343 / session": in the sale's colour with the regular price struck through, and under it, marked with a blue dot, where it comes from */
function FromPrice({ value, unit, src, withItem, big, noWords, mark }) {
  const cut = SALE_LOOK && src && src.reg > 0;
  const words = noWords ? '' : sourceWords(src, withItem);
  return (
    <span className="flex flex-col items-start sm:items-end">
      <span className="whitespace-nowrap font-inter text-[13px] text-ndm-muted">{mark && <i className="pr-dot" aria-hidden="true" />}From {cut ? <s className="pr-was mr-1"><span className="sr-only">Regular price </span>{pfmt(src.reg)}</s> : null}<span data-look={SALE_LOOK || undefined} className={`pr-from font-aeonik tracking-[-0.02em] text-[20px] ${SALE_LOOK && cut ? 'is-sale' : 'text-ndm-ink'}`}>{pfmt(value)}</span>{unit}</span>
      {words && <span className="pr-src mt-1 font-inter text-[11.5px] leading-[1.35] text-ndm-muted"><i aria-hidden="true" /><span className="sr-only">Lowest price, from </span>{words}</span>}
    </span>
  );
}
const SrcMark = ({ children }) => <span className="pr-src-tag"><i aria-hidden="true" />{children}</span>;
/* one option of a treatment in the stacked-discount layout (designer's reference, 2026-11-16): name, count and price of one,
   the offer pill; the regular price struck through, the price to pay large, the saving; Add to cart on the right */
/* an option's tag in the pill's words, as the site's pillWords: "Save $1000 Off" -> SAVE $1,000, BUY 1 | GET 1 FREE */
const optPill = (tag) => {
  const t = String(tag).trim().toUpperCase().replace(/\s+/g, ' ').replace(/^SALE\s+/, '').replace(/^SAVE \$(\d+)(?: OFF)?$/, (_, n) => 'SAVE $' + Number(n).toLocaleString('en-CA'));
  const m = /^(BUY \d+)\s+(GET .+)$/.exec(t);
  return m ? [m[1], m[2]] : [t];
};
const optCount = (label) => {
  const m = /(\d+)\s*(unit|syringe|session|vial|treatment|zone)s?\b/i.exec(label);
  if (m) return { n: +m[1], one: m[2].toLowerCase(), many: m[2].toLowerCase() + 's' };
  const p = /package of (\d+)/i.exec(label);
  return p ? { n: +p[1], one: 'session', many: 'sessions' } : null;
};
/* code: the price with the running sale's checkout code (site: OptionRow): both earlier prices struck, the price to pay,
   "Extra 30% applied" and the saving */
function OptionRow({ label, price, was, code, tag, unit, action, mark }) {
  const cnt = optCount(label);
  const coded = !!(SALE_LOOK && code && code < price);
  const final = coded ? code : price;
  const struck = [was > final ? was : 0, coded ? price : 0].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  const cut = struck.length > 0;
  const save = Math.round(((was || price) - final) * 100) / 100;
  const found = tag && SALE_LOOK ? optPill(tag) : [];
  if (found.length === 1 && coded && SALE_PCT) found.push(`+ EXTRA ${SALE_PCT}%`);
  const pill = withIconHalf(found);
  return (
    <li className={`pr-opt pr-opt2 ${cut || tag ? 'is-featured' : ''}`}>
      <span className="pr-opt2-info">
        <span className="pr-opt2-name">{label}</span>
        {cnt && cnt.n > 1 && <span className="pr-opt2-meta">{cnt.n} {cnt.many} · {pfmt(Math.round((final / cnt.n) * 100) / 100)} per {cnt.one}</span>}
        {tag && (SALE_LOOK
          ? <span data-look={SALE_LOOK} className={`sb sb-sm pr-opt2-offer ${pill.length > 1 ? 'sb-split' : ''}`}>{pill.map((t, i) => <PillPart key={i} text={t} second={i > 0} />)}</span>
          : <span className="pr-tag pr-opt2-offer">{tag}</span>)}
      </span>
      <span className={`pr-opt2-price ${cut ? '' : 'is-single'}`}>
        {cut && <span className="pr-opt2-was">{struck.map((v, i) => <s key={i}><span className="sr-only">{i ? 'Sale price ' : 'Regular price '}</span>{pfmt(v)}</s>)}</span>}
        <span data-look={SALE_LOOK || undefined} className="pr-opt2-now">{mark && <i className="pr-dot" aria-hidden="true" />}{cut ? <span className="sr-only">now </span> : null}{pfmt(final)}{unit && <span className="pr-opt2-unit">{unit}</span>}</span>
        {cut && <span className="pr-opt2-with">{coded && <><span className="pr-opt2-tick" aria-hidden="true">&#10003;</span><span>Extra {SALE_PCT}% applied</span><span className="pr-opt2-sep"> · </span></>}{save > 0 && <span className="pr-opt2-save">You save {pfmt(save)}</span>}</span>}
      </span>
      <span className="pr-opt2-act">{action}</span>
    </li>
  );
}
/* a special line under a category's options (user, 2026-11-27: the Aptos model call assessment; site: ExtraRow): its tag,
   name and note, its price and Add to cart; never a sale pill or a struck price, it is a fee, not an offer */
function ExtraRow({ tag, name, note, price, action }) {
  return (
    <li className="pr-opt pr-opt2 pr-extra">
      <span className="pr-opt2-info">
        {tag && <span className="pr-extra-tag">{tag}</span>}
        <span className="pr-opt2-name">{name}</span>
        {note && <span className="pr-extra-note">{note}</span>}
      </span>
      <span className="pr-opt2-price is-single"><span className="pr-opt2-now">{pfmt(price)}</span></span>
      <span className="pr-opt2-act">{action}</span>
    </li>
  );
}
/* the styles of the pieces above, added once to any page that loads this list */
if (typeof document !== 'undefined' && !document.getElementById('sale-tags-css')) {
  const st = document.createElement('style'); st.id = 'sale-tags-css';
  st.textContent = `.pr-src{display:block;max-width:260px;text-align:right}.pr-src i{margin-right:6px;transform:translateY(-1px)}@media (max-width:639px){.pr-src{text-align:left;max-width:none}}
.pr-src i,.pr-src-tag i{display:inline-block;width:7px;height:7px;border-radius:999px;background:#209ED9;box-shadow:0 0 0 3px rgba(32,158,217,.18);flex:none}
.pr-src-tag{display:inline-flex;align-items:center;gap:6px;margin-left:10px;vertical-align:middle;font-family:Manrope,sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.02em;line-height:1;color:#0F80C3;white-space:nowrap}
.pr-opt.is-src{box-shadow:0 0 0 1.5px rgba(32,158,217,.45)!important}.pr-opt.is-src .pr-src-tag{margin-left:0}
.sb{--a-bg:#FFF5F6;--a-fg:#C0182C;--a-ring:rgba(192,24,44,.28);--b-bg:#0F80C3;--b-fg:#fff;display:inline-flex;align-items:stretch;border-radius:999px;overflow:hidden;white-space:nowrap;font-family:Manrope,sans-serif;font-weight:700;letter-spacing:.06em;line-height:1;font-size:13px}
.sb>span{display:inline-flex;align-items:center;padding:8px 13px}.sb-sm{font-size:11px}.sb-sm>span{padding:6px 10px}
.sb-a{background:var(--a-bg);color:var(--a-fg);box-shadow:inset 0 0 0 1.5px var(--a-ring);border-radius:999px}
.sb-split .sb-a{border-radius:999px 0 0 999px;box-shadow:inset 1.5px 0 0 var(--a-ring),inset 0 1.5px 0 var(--a-ring),inset 0 -1.5px 0 var(--a-ring)}
.sb-b{background:var(--b-bg);color:var(--b-fg);border-radius:0 999px 999px 0}
.dp{display:inline-flex;align-items:stretch;border-radius:999px;overflow:hidden;white-space:nowrap;font:700 11px/1 Manrope,sans-serif;letter-spacing:.06em}
.dp>span{display:inline-flex;align-items:center;padding:6px 10px}
.dp-a{background:#0B0F13;color:#E2C88A;border-radius:999px}
.dp-split .dp-a{border-radius:999px 0 0 999px}
.dp-b{background:#D4B574;color:#0B0F13;border-radius:0 999px 999px 0}
.dp[data-look="bf"] .dp-a{background:#0B0B0C;color:#fff}.dp[data-look="bf"] .dp-b{background:#D3121F;color:#fff}
.pr-from.is-sale{color:var(--now,#0F80C3)}.pr-from[data-look]{--now:#0F80C3}
.sb[data-look="vip"],.pr-from[data-look="vip"]{--a-bg:#0B0F13;--a-fg:#fff;--a-ring:#0B0F13;--b-bg:#D4B574;--b-fg:#0B0F13;--now:#9A7A3A}
.sb[data-look="bf"],.pr-from[data-look="bf"]{--a-bg:#0B0B0C;--a-fg:#fff;--a-ring:#0B0B0C;--b-bg:#D3121F;--b-fg:#fff;--now:#C8101C}
/* the small flame icon of a red half with no words (an offer of one part, user, 2026-11-26), which is a little narrower;
   the red halves are plain red everywhere (the moving fire of 2026-11-25 was removed the same day) */
.sb-fire-ico{position:relative;flex:none;width:.95em;height:.95em}
.sb>.sb-only{padding-left:.85em;padding-right:1em}
@media (max-width:639px){.sb-split{flex-wrap:wrap;gap:5px;max-width:100%;overflow:visible;border-radius:0}.sb-split .sb-a,.sb-split .sb-b{border-radius:999px}.sb-split .sb-a{box-shadow:inset 0 0 0 1.5px var(--a-ring)}}
.sb[data-look="holiday"],.pr-from[data-look="holiday"]{--a-bg:#173D2C;--a-fg:#fff;--a-ring:#173D2C;--b-bg:#D4B574;--b-fg:#173D2C;--now:#1E5A3E}
.sb[data-look="newyear"],.pr-from[data-look="newyear"]{--a-bg:#fff;--a-fg:#1B242B;--a-ring:rgba(27,36,43,.25);--b-bg:#4A5763;--b-fg:#fff;--now:#0F80C3}
.pr-opt.pr-opt2{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:28px;padding:15px 13px 15px 21px;border:1px solid transparent;border-radius:14px;background:#FAFAF8;box-shadow:none!important}
.pr-opt2.is-featured{background:#fff;border-color:#E3E3E0;box-shadow:none!important}
.pr-ghead>button,.pr-gintro{padding-inline:clamp(14px,2.4vw,28px)}
.pr-dot{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:999px;background:#209ED9;box-shadow:0 0 0 3px rgba(32,158,217,.18);vertical-align:middle;transform:translateY(-2px)}
.pr-dot,.pr-src i,.pr-src-tag i,.ndm-beat{animation:ndmBeat 1.6s ease-out infinite}
@keyframes ndmBeat{0%{scale:1;box-shadow:0 0 0 0 rgba(32,158,217,.5)}12%{scale:1.3}24%{scale:1}36%{scale:1.2}55%{scale:1;box-shadow:0 0 0 7px rgba(32,158,217,0)}100%{scale:1;box-shadow:0 0 0 0 rgba(32,158,217,0)}}
@media (prefers-reduced-motion: reduce){.pr-dot,.pr-src i,.pr-src-tag i,.ndm-beat{animation:none}}
.pr-opt2-info{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
.pr-opt2-name{font-family:Manrope,sans-serif;font-size:15.5px;font-weight:500;color:#1B242B}
.pr-opt2-meta{margin-top:3px;font-family:Manrope,sans-serif;font-size:12.5px;color:#6B7480}
.pr-opt2-offer{margin-top:9px}
.pr-opt2-price{display:flex;flex-direction:column;align-items:flex-end;text-align:right;min-width:170px}
.pr-opt2-was{font-family:Manrope,sans-serif;font-size:13px;color:#A3A9B1}
.pr-opt2-was s{text-decoration-thickness:1px}
.pr-opt2-was s+s{margin-left:8px}
.pr-opt2-now{margin:2px 0;font-family:Fraunces,Georgia,serif;font-size:22px;line-height:1.1;letter-spacing:-.01em;color:#0B5F93}
.pr-opt2-now[data-look="vip"]{color:#9A7A3A}
.pr-opt2-now[data-look="bf"]{color:#C8101C}
.pr-opt2-now[data-look="holiday"]{color:#1E5A3E}
.pr-opt2-price.is-single .pr-opt2-now{font-size:22px;color:#1B242B}
.pr-opt2-unit{margin-left:2px;font-family:Manrope,sans-serif;font-size:13px;letter-spacing:0;color:#6B7480}
.pr-opt2-with{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:6px;font-family:Manrope,sans-serif;font-size:12px;color:#6B7480}
.pr-opt2-tick{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#EEF6FC;color:#0F80C3;font-size:9px;font-weight:700}
.pr-opt2-save{font-weight:600;color:#0B5F93}
@media (max-width:639px){
.pr-opt.pr-opt2{grid-template-columns:1fr auto;gap:12px 10px;padding:15px}
.pr-opt2-info{grid-column:1 / -1}
.pr-opt2-price{align-items:flex-start;text-align:left;min-width:0}
.pr-opt2-with{justify-content:flex-start;row-gap:2px}
.pr-opt2-sep{display:none}
.pr-opt2-save{flex-basis:100%}
.pr-opt2-act{align-self:end}
.pr-opt2-now{font-size:22px}
.pr-opt2:not(.is-featured) .pr-opt2-info,.pr-opt2:not(.is-featured) .pr-opt2-price{grid-column:1}
.pr-opt2:not(.is-featured) .pr-opt2-act{grid-column:2;grid-row:1 / span 2;align-self:center}
}
/* round 40 (user, 2026-11-17): every offer card (the offers wheel, the promotion page's "All current offers", the pricing page's
   Monthly specials) is one light, premium glass card: frosted white over a soft sky and champagne glow, a hairline white edge,
   champagne accents and solid black buttons that turn gold on hover (no gradients); black and gold like the VIP tags (round 41). The Black Friday page keeps its gold tickets (html.bf) */
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-stage{background:radial-gradient(34% 42% at 30% 56%,rgba(38,177,231,.2),transparent 70%),radial-gradient(28% 40% at 70% 60%,rgba(212,181,116,.2),transparent 72%),radial-gradient(30% 36% at 50% 34%,rgba(15,128,195,.12),transparent 70%)}
section:has(article.promo-card),section:has(li.ps-card){background-image:radial-gradient(40% 32% at 16% 42%,rgba(38,177,231,.12),transparent 70%),radial-gradient(36% 32% at 84% 72%,rgba(212,181,116,.15),transparent 72%)}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card){background:linear-gradient(140deg,rgba(255,255,255,.88) 0%,rgba(255,255,255,.55) 42%,rgba(255,255,255,.4) 70%,rgba(255,255,255,.62) 100%);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(11,15,19,.05),0 1px 2px rgba(11,15,19,.05),0 24px 54px -30px rgba(11,15,19,.32)}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card)::before{display:none}
li.ps-card{transition:transform .6s var(--e-out),border-color .4s ease,box-shadow .6s ease}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card.is-on{background:linear-gradient(140deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.68) 45%,rgba(255,255,255,.52) 75%,rgba(255,255,255,.74) 100%);border-color:rgba(212,181,116,.6);box-shadow:inset 0 1px 0 #fff,0 0 0 4px rgba(212,181,116,.1),0 2px 4px rgba(11,15,19,.05),0 40px 80px -36px rgba(11,15,19,.45)}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card:not(.is-on):hover{border-color:rgba(212,181,116,.45)}
@media (hover:hover){article.promo-card:hover,li.ps-card:hover{transform:translateY(-4px);border-color:rgba(212,181,116,.6);box-shadow:inset 0 1px 0 #fff,0 0 0 4px rgba(212,181,116,.08),0 36px 70px -34px rgba(11,15,19,.42)}
  article.promo-card:hover .promo-badge{background:#0B0F13;color:#E2C88A}}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card) .sw-ring{border-color:rgba(212,181,116,.2)}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card :is(.sw-price,.sw-cur){background:none;color:#0B0F13}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card) .sw-cur{color:#B8964F}
article.promo-card .text-ndm-deep{color:#0B0F13}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card) :is(.sw-tag,.promo-tag){background:rgba(255,255,255,.6);border:1px solid rgba(11,15,19,.12);color:#0B0F13}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card .sw-tag.is-feature{background:#0B0F13;border-color:#0B0F13;color:#E2C88A}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card .sw-photo,html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card.is-on .sw-photo{box-shadow:0 0 0 2px #fff,0 0 0 3px rgba(212,181,116,.5),0 10px 22px -12px rgba(11,15,19,.45)}
article.promo-card .promo-badge{background:rgba(255,255,255,.75);color:#0B0F13;box-shadow:inset 0 0 0 1px rgba(212,181,116,.45)}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card) :is(.btn-ink,.btn-buy){background:#0B0F13;border-color:#0B0F13;color:#fff;box-shadow:0 10px 22px -14px rgba(11,15,19,.8)}
:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card) :is(.btn-ink,.btn-buy):is(:hover,:focus-visible){background:#D4B574;border-color:#D4B574;color:#0B0F13}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card .btn-line{background:rgba(255,255,255,.5);border-color:rgba(11,15,19,.16);color:#0B0F13}
html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card .btn-line:is(:hover,:focus-visible){background:#0B0F13;border-color:#0B0F13;color:#fff}
li.ps-card > span:nth-child(2){background:rgba(255,255,255,.6);color:#0B0F13;box-shadow:inset 0 0 0 1px rgba(212,181,116,.45)}
@media (prefers-reduced-transparency:reduce){:is(html:not(.bf) .specials-wheel:not(.sw-dark) .sw-card,article.promo-card,li.ps-card){background:#fff}}
/* a special line under a category's options (user, 2026-11-27: the Aptos model call assessment): tinted card, small blue tag, note */
.pr-opt.pr-opt2.pr-extra{background:#F2F8FC;border-color:#CFE3F1}
.pr-extra-tag{display:inline-flex;align-items:center;margin-bottom:8px;padding:5px 10px;border-radius:999px;background:#0F80C3;color:#fff;font-family:Manrope,sans-serif;font-size:10.5px;font-weight:700;line-height:1;letter-spacing:.08em;text-transform:uppercase}
.pr-extra-note{margin-top:5px;max-width:56ch;font-family:Manrope,sans-serif;font-size:13.5px;line-height:1.5;color:#5A646C}
@media (max-width:639px){.pr-opt.pr-opt2.pr-extra .pr-opt2-info{grid-column:1 / -1;grid-row:1}.pr-opt.pr-opt2.pr-extra .pr-opt2-price{grid-column:1;grid-row:2;align-self:center}.pr-opt.pr-opt2.pr-extra .pr-opt2-act{grid-column:2;grid-row:2}}`;
  document.head.appendChild(st);
}
