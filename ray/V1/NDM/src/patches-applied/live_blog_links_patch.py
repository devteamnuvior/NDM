"""The home page's journal cards (POSTS) and the 'see all' links open the articles built here instead of the live site (Nov 2026).
Site-wide: index.html, promotion.html and every page built from them. Run from the project folder; safe to run twice."""
import json, os, re, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PAGES = ['index.html', 'promotion.html', 'about.html', 'aptos-thread-lift.html', 'black-friday.html', 'blog.html', 'cart.html', 'checkout.html', 'order-confirmed.html', 'pricing.html', 'what-causes-rosacea-redness.html']
local = json.load(open(os.path.join(ROOT, 'src/live/posts-built.json'), encoding='utf-8'))   # '/address/' -> article file (written by build_live_blog.py)
for name in PAGES:
    p = os.path.join(ROOT, name)
    if not os.path.exists(p): continue
    s = open(p, encoding='utf-8').read()
    n = 0
    for path, f in local.items():
        a = "href: 'https://newdermamedlaserclinic.com" + path + "'"
        if a in s: s = s.replace(a, "href: '" + f + "'"); n += 1
    a = "'https://newdermamedlaserclinic.com/before-after/'"
    if a in s: s = s.replace(a, "'before-after.html'"); n += 1
    open(p, 'w', encoding='utf-8').write(s)
    print(('patched: ' if n else 'nothing to do: ') + name, n)
