"""2026-11-18: the site has its own shop page (shop.html, the prototype copy of the Next.js /shop). Every "Skincare shop" link of
both shells opens it in the same tab, without the external-link icon, and the header marks "Skincare shop" there. Applied once to
index.html and promotion.html; do not run again. usage: python3 src/patches-applied/shop_links.py <NDM dir>"""
import sys
from pathlib import Path

REPL = [
    ("const NAV_HERE = { 'index.html': 'home', ", "const NAV_HERE = { 'index.html': 'home', 'shop.html': 'shop', 'shop-product.html': 'shop', "),
    ("const PAGE_LINKS = { ", "const PAGE_LINKS = { shop: 'shop.html', 'skincare-shop': 'shop.html', "),
    ("{ id: 'shop', label: 'Skincare shop', href: '#/shop', ext: true },", "{ id: 'shop', label: 'Skincare shop', href: 'shop.html' },"),
    ("barCta: ['Shop skincare', '#/shop']", "barCta: ['Shop skincare', 'shop.html']"),
    ("cta: ['Shop skincare', '#/shop']", "cta: ['Shop skincare', 'shop.html']"),
    ('<a href="#/shop" target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:underline">Shop skincare online <IconExternal /></a>',
     '<a href="shop.html" className="inline-flex items-center gap-1 hover:underline">Shop skincare online</a>'),
    ('<a href="#/shop" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-medium hover:underline underline-offset-4">Shop skincare <IconExternal /></a>',
     '<a href="shop.html" className="inline-flex items-center gap-1.5 font-medium hover:underline underline-offset-4">Shop skincare</a>'),
    ('<a href="#/shop" target="_blank" rel="noopener" className="flex items-center gap-2 py-4 font-aeonik text-[22px]">Skincare shop <IconExternal size={16} /></a>',
     '<a href="shop.html" {...here(\'shop.html\')} className="flex items-center gap-2 py-4 font-aeonik text-[22px]">Skincare shop</a>'),
    ('<Btn href={SHOP_URL} target="_blank" rel="noopener" v="ink">Visit Skincare shop<span className="sr-only"> (opens in a new tab)</span></Btn>',
     '<Btn href="shop.html" v="ink">Visit Skincare shop</Btn>'),
    ('<Btn href={SHOP_URL} target="_blank" rel="noopener" v="line" className="bg-ndm-paper">View more</Btn>',
     '<Btn href="shop.html" v="line" className="bg-ndm-paper">View more</Btn>'),
]

root = Path(sys.argv[1])
for name in ('index.html', 'promotion.html'):
    p = root / name
    s = p.read_text(encoding='utf-8')
    n = 0
    for a, b in REPL:
        if a in s:
            s = s.replace(a, b)
            n += 1
    assert "'#/shop'" not in s and '"#/shop"' not in s, f'{name}: a #/shop link is left'
    p.write_text(s, encoding='utf-8')
    print(name, n, 'replacements')
