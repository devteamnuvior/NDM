"""Links to the treatment pages built from the live site (Nov 2026, for Raymond).

Every menu label now opens its own page (PAGE_LINKS), the home page's treatment cards and concern buttons that pointed at
"#/slug" placeholders open the matching page, the Procedures menu marks those pages as the open section (NAV_HERE), and the
new pages keep the main look (CAMPAIGN_SKIP). Site-wide: index.html, promotion.html (the shell) and every page built from them.
Run from the project folder: python3 src/patches-applied/live_pages_links_patch.py  (safe to run twice; rebuild the live
treatment pages afterwards: python3 src/build_live_treatments.py . src)
"""
import json, os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PAGES = ['index.html', 'promotion.html', 'about.html', 'aptos-thread-lift.html', 'black-friday.html', 'blog.html', 'cart.html', 'checkout.html', 'order-confirmed.html', 'pricing.html', 'what-causes-rosacea-redness.html']
BUILT = json.load(open(os.path.join(ROOT, 'src/live/pages-built.json')))   # live path -> file


def slugify(s):
    k = re.sub(r'[®™]', '', s.lower())
    return re.sub(r'[^a-z0-9]+', '-', k).strip('-')


MENU = json.load(open(os.path.join(ROOT, 'src/live/menu.json')))
links = {}
for m in MENU:
    for g in m['groups']:
        for label, path in g['items']:
            links[slugify(label)] = BUILT[path]
for path, f in BUILT.items():   # pages outside the menu, by their own name
    links.setdefault(f.replace('.html', ''), f)
# the home page's own wording for some treatments (the v3 cards and concern buttons) -> the live page that covers it
ALIASES = {'skin-boosters': 'mesotherapy-skin-boosters.html', 'lip-fillers': 'lip-augmentation.html', 'under-eye-filler': 'tear-trough-correction.html',
           'prp-hair-restoration': 'hair-loss-treatments.html', 'cosmelan-dermamelan': 'dermamelan.html', 'laser-acne-treatment': 'acne-treatments.html',
           'medical-facials': 'age-element-facial.html', 'rf-microneedling': 'microneedling.html', 'laser-rejuvenation': 'laser-skin-tightening.html',
           'skin-tightening': 'skin-tightening.html', 'shop': 'shop.html'}
links.update(ALIASES)
links.pop('botox', None)   # botox.html is already mapped in the shell
LITERAL = dict(links, promotion='promotion.html', pricing='pricing.html', blog='blog.html')   # "#/promotion" placeholders too
MARK = "/* live treatment pages */"
add = ', '.join(f"'{k}': '{v}'" for k, v in sorted(links.items()))

for name in PAGES:
    p = os.path.join(ROOT, name)
    s = open(p, encoding='utf-8').read()
    if MARK in s:
        print('already applied:', name); continue
    m = re.search(r"const PAGE_LINKS = \{(.*?)\};\n", s)
    assert m, name
    s = s[:m.start()] + "const PAGE_LINKS = {" + m.group(1) + ", " + MARK + " " + add + " };\n" + s[m.end():]
    # literal "#/slug" placeholders in page data and markup
    for k, v in sorted(LITERAL.items(), key=lambda kv: -len(kv[0])):
        s = re.sub(r'(["\'])#/' + re.escape(k) + r'\1', lambda mm, v=v: mm.group(1) + v + mm.group(1), s)
    m = re.search(r"const NAV_HERE = \{(.*?)\}\[HERE\];", s)
    assert m, name
    here = ', '.join(f"'{f}': 'procedures'" for f in sorted(set(BUILT.values())) if f not in ('botox.html', 'aptos-thread-lift.html'))
    s = s[:m.start()] + "const NAV_HERE = {" + m.group(1) + ", " + here + " }[HERE];" + s[m.end():]
    m = re.search(r"const CAMPAIGN_SKIP = \[(.*?)\];", s)
    assert m, name
    skip = ', '.join(f"'{f}'" for f in sorted(set(BUILT.values())) if f"'{f}'" not in m.group(1))
    s = s[:m.start()] + "const CAMPAIGN_SKIP = [" + m.group(1) + ", " + skip + "];" + s[m.end():]
    open(p, 'w', encoding='utf-8').write(s)
    print('patched:', name)
