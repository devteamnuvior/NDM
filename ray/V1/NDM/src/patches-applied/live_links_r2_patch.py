"""Links that still opened the live WordPress site or a "#/slug" placeholder now open the pages built here (Nov 2026).

- "#/slug" placeholders whose page exists (slug.html) open it: #/aptos-thread-lift, #/dermal-fillers, #/laser-hair-removal,
  #/promotion, #/shop, ... ("#/book" stays the booking popup).
- The home skincare strip: "View more" opens shop.html and each product its shop-<slug>.html page (was the live shop, new tab).
- The thank-you screen's "Schedule free consult now" opens the booking flow (#/book) instead of the live online-booking page.
- "Apply for financing" links open pricing.html#prices; the popup's "Claim my 10% off" opens promotion.html; every other
  link into the old fees-financing page (specials cards, black-friday) opens pricing.html#prices; the process cards'
  "Explore treatments" and "Find a clinic" open the home page sections from every inner page; the specials cards' "Buy now"
  buttons open the matching category of the price list here (pricing.html#pg-<category>-h) instead of the live price list.
Site-wide, every page. Run from the project folder; safe to run twice."""
import glob, os, re, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
pages = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(ROOT, '*.html'))}
LITERAL = [
    ("const SHOP_URL = 'https://shop.newdermamedlaserclinic.com/shop/';", "const SHOP_URL = 'shop.html';"),
    ("h: `https://shop.newdermamedlaserclinic.com/product/${s}/`", "h: `shop-${s}.html`"),
    ('<Btn href={SHOP_URL} target="_blank" rel="noopener" v="line"', '<Btn href={SHOP_URL} v="line"'),
    ("const BOOK_ONLINE = 'https://newdermamedlaserclinic.com/online-booking/';", "const BOOK_ONLINE = '#/book';"),
    ('<Btn href={BOOK_ONLINE} target="_blank" rel="noopener" v="book" hot className="mt-6">Schedule free consult now<span className="sr-only"> (opens the online booking calendar in a new tab)</span></Btn>',
     '<Btn href={BOOK_ONLINE} v="book" hot className="mt-6">Schedule free consult now</Btn>'),
    ("const FEES = `${NDM}/fees-financing/`;", "const FEES = 'pricing.html#prices';"),
    ("href={`${NDM}/promotion/`}", "href=\"promotion.html\""),
]
total = 0
for p in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    s = open(p, encoding='utf-8').read()
    n = 0
    for a, b in LITERAL:
        if a in s: n += s.count(a); s = s.replace(a, b)

    s2 = re.sub(r"https://newdermamedlaserclinic\.com/fees-financing/?(#[\w-]*)?", 'pricing.html#prices', s)
    s2 = s2.replace("'https://newdermamedlaserclinic.com/promotion/'", "'promotion.html'")
    # the specials cards' "Buy now" (NDM + s.h): the live price list sections become the price list here (category headers)
    ANCH = {'_hair_loss': 'hair-loss', 'dermal_fillers': 'dermal-fillers', 'microneedling': 'microneedling', 'non_surgical_butt_lift': 'non-surgical-butt-lift', 'skin_booster_and_bio_stimulators': 'skin-booster-and-bio-stimulators'}
    s2 = re.sub(r"h: '/fees-financing/#([a-z_]+)'", lambda m: "h: 'pricing.html#pg-" + ANCH[m.group(1)] + "-h'" if m.group(1) in ANCH else "h: 'pricing.html#prices'", s2)
    s2 = s2.replace("h: '/fees-financing/'", "h: 'pricing.html#prices'").replace("h: '/promotion/'", "h: 'promotion.html'")
    s2 = s2.replace("href={NDM + s.h}", "href={s.h}")
    if os.path.basename(p) not in ('index.html', 'index-fraunces.html', 'index-v2.html', 'black-friday.html'):   # the process cards point at two home page sections (every version of the home page has them)
        s2 = s2.replace("h: '#treatments'", "h: 'index.html#treatments'").replace("h: '#visit'", "h: 'index.html#visit'")
    if s2 != s: n += 1; s = s2

    def rep(m):
        slug = m.group(2)
        return m.group(1) + slug + '.html' + m.group(1) if slug in pages and slug != 'book' else m.group(0)
    s2 = re.sub(r'(["\'])#/([a-z0-9-]+)\1', rep, s)
    if s2 != s: n += 1; s = s2
    if n:
        open(p, 'w', encoding='utf-8').write(s); total += n
        print('patched:', os.path.basename(p), n)
print('done,', total)
