"""Site audit, 8 Nov 2026: site search (both shells).
The search matched the whole query as one piece of text, so natural searches found nothing: "laser hair removal toronto",
"lip filler", "botox price", "clinic hours" all showed "No match yet". Now every word must match (plural or singular),
words like "toronto", "near me", "price" are ignored when other words are present, a few synonyms are known (filler ->
augmentation, ipl -> photo), and the main pages are found too (pricing, offers, clinics and hours, concerns, before and
after, shop, blog). Idempotent."""
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')

HELPER = r'''/* site search: every word has to match (plural or singular), filler words are skipped when there are others, a few
   synonyms are known, and the main pages answer what people type ("price", "hours", "parking") (site audit, 8 Nov 2026) */
const SITE_PAGES = [
  { name: 'Treatments & pricing', cat: 'Page', href: 'pricing.html', k: 'price prices pricing cost costs fee fees financing payment plans packages menu' },
  { name: 'Current offers', cat: 'Page', href: 'promotion.html', k: 'offer offers deal deals sale promo promotion promotions special specials discount' },
  { name: 'Our clinics, team and contact', cat: 'Page', href: 'about.html', k: 'clinic clinics location locations address directions hours open parking team doctor doctors nurse injector contact phone email uptown downtown yonge bay' },
  { name: 'All concerns', cat: 'Page', href: 'concerns.html', k: 'concern concerns problem problems' },
  { name: 'Before and after', cat: 'Page', href: 'before-after.html', k: 'before after results gallery photos' },
  { name: 'Skincare shop', cat: 'Page', href: 'shop.html', k: 'shop skincare products product buy cream serum sunscreen' },
  { name: 'Blog', cat: 'Page', href: 'blog.html', k: 'blog article articles news guide guides tips' },
];
const SEARCH_SKIP = new Set(['toronto', 'near', 'me', 'in', 'for', 'the', 'a', 'an', 'and', 'of', 'to', 'my', 'best', 'clinic', 'treatment', 'treatments', 'cost', 'costs', 'price', 'prices', 'how', 'much', 'what', 'is']);
const SEARCH_SYN = { filler: ['filler', 'augmentation', 'juvederm'], ipl: ['ipl', 'photo rejuv', 'photo-rejuv'], facelift: ['facelift', 'thread', 'lift'], wrinkle: ['wrinkl', 'botox', 'line'], fat: ['fat', 'sculpt', 'chin', 'bbl'], vein: ['vein', 'sclero', 'venaseal'], sweat: ['sweat', 'hyperhidrosis'], pigment: ['pigment', 'melasma', 'spot'] };
const searchStem = (w) => (w.length > 3 ? w.replace(/ies$/, 'y').replace(/(es|s)$/, '') : w);
function searchSite(q) {
  const words = q.toLowerCase().replace(/[®™]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
  const keep = words.filter((w) => !SEARCH_SKIP.has(w));
  const terms = (keep.length ? keep : words).map((w) => SEARCH_SYN[searchStem(w)] || [searchStem(w)]);
  if (!terms.length) return [];
  const all = [...ALL_TREATMENTS, ...SITE_PAGES];
  const hits = all.filter((t) => { const hay = (t.name + ' ' + t.cat + ' ' + (t.k || '')).toLowerCase().replace(/[®™]/g, ''); return terms.every((alts) => alts.some((a) => hay.includes(a))); });
  const first = searchStem(words[0] || '');
  return hits.sort((a, b) => (b.name.toLowerCase().startsWith(first) ? 1 : 0) - (a.name.toLowerCase().startsWith(first) ? 1 : 0))
    .filter((t, i, arr) => arr.findIndex((x) => x.name === t.name) === i).slice(0, 8);
}

function SearchOverlay({ open, onClose }) {'''

EDITS = [
    ('function SearchOverlay({ open, onClose }) {', HELPER),
    ("  const hits = v ? ALL_TREATMENTS.filter((t) => (t.name + ' ' + t.cat).toLowerCase().includes(v)).slice(0, 8) : [];",
     '  const hits = v ? searchSite(v) : [];'),
    ("<li key={h.name}><a href={h.cat === 'Concern' ? cslug(h.name) : slug(h.name)} onClick={onClose}",
     "<li key={h.name}><a href={h.href || (h.cat === 'Concern' ? cslug(h.name) : slug(h.name))} onClick={onClose}"),
]

for name in ('index.html', 'promotion.html'):
    p = root / name
    s = p.read_text(encoding='utf-8')
    n = 0
    for old, new in EDITS:
        if 'function searchSite(' in s and old.startswith('function SearchOverlay'):
            continue
        if new in s:
            continue
        assert s.count(old) == 1, (name, old[:60], s.count(old))
        s = s.replace(old, new); n += 1
    p.write_text(s, encoding='utf-8')
    print(f'{name}: {n} edits')
