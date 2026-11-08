"""Images and videos the pages still loaded from the live WordPress site (wp-content/...) now come from assets/live/ (Nov 2026).
The live site goes away when this site replaces it, so nothing here may depend on it: every live media URL that has a
local copy in src/live/images.json (made by tools/make_images_map.py) is rewritten to that copy, in every page, and the
base urls the pages build media paths from at run time (REEL_BASE: home reels, VID: the space walk-through clips, NDM_UP:
review photos, SHOP_IMG: the home skincare strip) are pointed at assets/live/ once every file used with them is local.
It also patches the page parts in src/ (jsx and build scripts). Run from the project folder; safe to run twice."""
import glob, json, os, re, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
MAP = json.load(open(os.path.join(ROOT, 'src/live/images.json'), encoding='utf-8'))
pairs = sorted(MAP.items(), key=lambda kv: -len(kv[0]))   # longest urls first, so a -300x300 variant is never cut by its base


def used_with(name, s):
    """the file names a page joins to the base url `name` at run time"""
    if name == 'REEL_BASE': return re.findall(r"REEL_BASE \+ '([^']+)'", s)
    if name == 'VID':
        slides = re.findall(r"v: '(slide-\d+)'", s)
        return [x + '-Mobile.mp4' for x in slides] + [x + '-1.mp4' for x in slides]
    if name == 'NDM_UP':
        block = re.search(r"const PROMO_REVIEWS = \[.*?\n\];", s, re.S)
        return re.findall(r"\['[^']*', '[^']*', '([^']+\.(?:png|jpe?g|webp))'", block.group(0)) if block else []
    if name == 'SHOP_IMG':
        block = re.search(r"const PRODUCTS = \[.*?\n\]", s, re.S)
        return [re.sub(r'\.png$', '-300x300.png', x) for x in re.findall(r"\['[^']*', '[^']*', '([^']+\.png)'", block.group(0))] if block else []
    return []


total = 0
for p in sorted(glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, 'src/*.jsx')) + glob.glob(os.path.join(ROOT, 'src/build_*.py'))):   # the page parts too, so the team's own rebuilds keep local media
    s = open(p, encoding='utf-8').read()
    if 'newdermamedlaserclinic.com/wp-content/' not in s and '${NDM}/wp-content/' not in s: continue
    n = 0
    for url, local in pairs:
        if url in s:
            n += s.count(url); s = s.replace(url, local)
    for name, base in re.findall(r"const (REEL_BASE|VID|NDM_UP|SHOP_IMG) = '(https://(?:shop\.)?newdermamedlaserclinic\.com/wp-content/uploads/[^']*)';", s):
        used = used_with(name, s)
        local_base = re.sub(r'^https://(shop\.)?newdermamedlaserclinic\.com/wp-content/', lambda m: 'assets/live/' + ('shop' if m.group(1) else 'main') + '/', base)
        if name == 'SHOP_IMG':
            # the shop's 300x300 thumbnails are kept here as 600px webp card images (tools/make_images_map.py)
            ok = used and all(MAP.get(base + x, '').endswith('.webp') and os.path.exists(os.path.join(ROOT, MAP[base + x])) for x in used)
            if ok:
                s = s.replace(f"const SHOP_IMG = '{base}';", f"const SHOP_IMG = '{local_base}';")
                s = s.replace("img: SHOP_IMG + f.replace(/\\.png$/, '-300x300.png')", "img: SHOP_IMG + f.replace(/\\.png$/, '-300x300.webp')"); n += 1
            continue
        if used and all(MAP.get(base + x) == local_base + x and os.path.exists(os.path.join(ROOT, local_base + x)) for x in used):
            s = s.replace(f"const {name} = '{base}';", f"const {name} = '{local_base}';"); n += 1
    # paths written as template literals on the NDM constant: `${NDM}/wp-content/uploads/2025/09/x.jpg`
    def lit(m):
        url = 'https://newdermamedlaserclinic.com/wp-content/' + m.group(1)
        return "'" + MAP[url] + "'" if url in MAP and os.path.exists(os.path.join(ROOT, MAP[url])) else m.group(0)
    s2 = re.sub(r"`\$\{NDM\}/wp-content/([^`${}]+\.(?:png|jpe?g|webp|svg|gif|mp4|webm))`", lit, s)
    if s2 != s: n += 1; s = s2
    # three more base urls built on NDM: the blog card photos, the About page photos, the pricing hero film
    for name, base, used in [('POST_IMG', 'https://newdermamedlaserclinic.com/wp-content/uploads/', re.findall(r"\['[^']*', '/[^']*/', '[^']*', \d+, '[^']*', '([^']+\.(?:png|jpe?g|webp))'", s)),
                             ('ABOUT_UP', 'https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/', ['About-us-gallery-%02d.png' % i for i in range(1, 11)] + ['upClinic.png', 'downClinic.png']),
                             ('FEES_VIDEO', 'https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/Fees-Financin.-', ['desktop-version.mp4', 'mobile-version.mp4'])]:
        decl = f"const {name} = `${{NDM}}/{base.replace('https://newdermamedlaserclinic.com/', '')}`;"
        if decl not in s: continue
        local_base = base.replace('https://newdermamedlaserclinic.com/wp-content/', 'assets/live/main/')
        if used and all(MAP.get(base + x) == local_base + x and os.path.exists(os.path.join(ROOT, local_base + x)) for x in used):
            s = s.replace(decl, f"const {name} = '{local_base}';"); n += 1
    if n:
        open(p, 'w', encoding='utf-8').write(s); total += n
        print('patched:', os.path.basename(p), n)
print('done,', total, 'media references now local')
