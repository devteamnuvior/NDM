/* ---------------------------------------------------------------- prices, one source for the whole site (round 29)
   PRICE_CATS comes from src/pricing-data.jsx (the pricing page's list) and is copied into both shells by src/sync_prices.py,
   so every page reads the same numbers. Edit src/pricing-data.jsx, run the sync, then rebuild.
   priceFrom(id, item) gives the lowest price after the discount, counted per unit (unit categories), per syringe or per session
   (package price / count in its label): e.g. Botox / Dysport, Dysport 220 units $1694 -> $7.70 / unit.
   priceFor(name) finds a treatment by its name anywhere on the site and returns "From $X" (or null when it is not on the list). */
const PRICE_BY_ID = Object.fromEntries(PRICE_CATS.map((c) => [c.id, c]));
const pfmt = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-CA', { useGrouping: false, minimumFractionDigits: Math.round(n * 100) % 100 ? 2 : 0, maximumFractionDigits: 2 });
const pCount = (label) => { const m = /(\d+)\s*(units?|syringes?|sessions?|vials?|treatments?)\b/i.exec(label) || /package of (\d+)/i.exec(label); return m ? +m[1] : 1; };
const pPct = (tag) => { const m = /^(\d+)% OFF$/i.exec(tag || ''); return m ? +m[1] : 0; };
const pNorm = (s) => String(s || '').toLowerCase().replace(/[®™]/g, '').replace(/[–-]/g, ' ').replace(/\s+/g, ' ').trim();
function priceOptions(id, item) {
  const c = PRICE_BY_ID[id]; if (!c) return [];
  const its = item ? c.items.filter((it) => pNorm(it[0]) === pNorm(item) || pNorm(it[0]).includes(pNorm(item))) : c.items;
  return (its.length ? its : c.items).flatMap((it) => it[2].map((o) => ({ item: it[0], label: o[0], price: o[1], reg: o[2], tag: o[3] || '' })));
}
function priceFrom(id, item) {
  const c = PRICE_BY_ID[id]; const os = priceOptions(id, item); if (!c || !os.length) return null;
  let best = null;
  os.forEach((o) => { const n = /regular/i.test(o.label) ? 1 : pCount(o.label); const v = o.price / n; if (!best || v < best.v - 0.001) best = { v, o, n }; });
  const pct = Math.max(0, ...os.map((o) => pPct(o.tag)));
  const tags = os.map((o) => o.tag).filter(Boolean);
  const offer = pct ? `Up to ${pct}% off` : (tags[0] ? tags[0].replace(/\bOFF\b/g, 'off').replace(/^BUY 1 GET 1/i, 'Buy 1 get 1').replace(/\bFREE\b/, 'free').replace(/^Save \$(\d+) Off$/i, 'Save $$$1') : '');
  return { value: Math.round(best.v * 100) / 100, unit: c.unit ? ' / unit' : '', per: c.unit ? 'per unit' : /syringe/i.test(best.o.label) ? 'per syringe' : best.n > 1 || /session/i.test(best.o.label) ? 'per session' : '', pct, offer };
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
  'non surgical butt lift': ['non-surgical-butt-lift'], 'non surgical bbl': ['non-surgical-butt-lift'], 'prp hair restoration': ['hair-loss', 'PRP Scalp'], 'hair loss treatments': ['hair-loss'],
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
