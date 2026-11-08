"""Map every live-site image the new site uses to a local copy under assets/live/.
Copies the files captured from the live site (verbatim bytes) into <NDM>/assets/live/<main|shop>/..., makes the shop
catalogue thumbnails the live shop serves as -300x300 (here 600x600 webp, from the full product image), and writes
<NDM>/src/live/images.json mapping each live URL (www and non-www) to its local path. Prints what could not be mapped.
usage: python3 -I make_images_map.py <live-img dir> <NDM dir> [extra url list json]
"""
import json, re, os, sys, glob, shutil, unicodedata, urllib.parse
from PIL import Image

LIVE, NDM = sys.argv[1], sys.argv[2]
PAT = re.compile(r'https?://(?:www\.)?(?:shop\.)?newdermamedlaserclinic\.com/[^\s"\'<>\\]+?\.(?:png|jpe?g|webp|svg|gif|mp4|webm)', re.I)

urls = set()
for f in glob.glob(os.path.join(NDM, '*.html')) + [x for x in glob.glob(os.path.join(NDM, 'src/live/*.json')) if not x.endswith('images.json')]:
    urls |= set(m.group(0) for m in PAT.finditer(open(f, encoding='utf-8').read()))
if len(sys.argv) > 3:
    urls |= set(json.load(open(sys.argv[3])))
# media the pages assemble at run time from a base url (REEL_BASE + 'yyyy/mm/x.mp4', `${VID}slide-1-1.mp4`, NDM_UP + 'x.png',
# SHOP_IMG + 'x-300x300.png')
for f in glob.glob(os.path.join(NDM, '*.html')):
    t = open(f, encoding='utf-8').read()
    for name, base in re.findall(r"const (REEL_BASE|VID|NDM_UP|SHOP_IMG) = '(https://(?:shop\.)?newdermamedlaserclinic\.com/wp-content/uploads/[^']*)';", t):
        if name == 'REEL_BASE': used = re.findall(r"REEL_BASE \+ '([^']+)'", t)
        elif name == 'VID':
            slides = re.findall(r"v: '(slide-\d+)'", t); used = [x + '-Mobile.mp4' for x in slides] + [x + '-1.mp4' for x in slides]
        elif name == 'NDM_UP':
            block = re.search(r"const PROMO_REVIEWS = \[.*?\n\];", t, re.S)
            used = re.findall(r"\['[^']*', '[^']*', '([^']+\.(?:png|jpe?g|webp))'", block.group(0)) if block else []
        else:
            block = re.search(r"const PRODUCTS = \[.*?\n\]", t, re.S)
            used = [re.sub(r'\.png$', '-300x300.png', x) for x in re.findall(r"\['[^']*', '[^']*', '([^']+\.png)'", block.group(0))] if block else []
        urls |= set(base + x for x in used)
    # template literals on the NDM constant, and the three bases built on it (blog card photos, About photos, pricing film)
    urls |= set('https://newdermamedlaserclinic.com/wp-content/' + x for x in re.findall(r"`\$\{NDM\}/wp-content/([^`${}]+\.(?:png|jpe?g|webp|svg|gif|mp4|webm))`", t))
    if "const POST_IMG = `${NDM}/wp-content/uploads/`;" in t:
        urls |= set('https://newdermamedlaserclinic.com/wp-content/uploads/' + x for x in re.findall(r"\['[^']*', '/[^']*/', '[^']*', \d+, '[^']*', '([^']+\.(?:png|jpe?g|webp))'", t))
    if "const ABOUT_UP = `${NDM}/wp-content/uploads/2025/09/`;" in t:
        urls |= set('https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/' + x for x in ['About-us-gallery-%02d.png' % i for i in range(1, 11)] + ['upClinic.png', 'downClinic.png'])
    if "const FEES_VIDEO = `${NDM}/wp-content/uploads/2025/09/Fees-Financin.-`;" in t:
        urls |= {'https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/Fees-Financin.-desktop-version.mp4', 'https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/Fees-Financin.-mobile-version.mp4'}


def ascii_name(name):
    name = urllib.parse.unquote(name)
    name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode()
    return re.sub(r'[^A-Za-z0-9._-]+', '-', name)


def dest_for(path):
    """live path (host/wp-content/...) -> assets/live/<site>/<short path>"""
    host, rest = path.split('/', 1)
    site = 'shop' if host.startswith('shop.') else 'main'
    rest = re.sub(r'^wp-content/', '', rest)
    rest = re.sub(r'^themes/[^/]+/assets/(images|img)/', 'theme/', rest)
    parts = rest.split('/')
    parts = [ascii_name(p) for p in parts]
    return 'assets/live/' + site + '/' + '/'.join(parts)


def copy(src, dest):
    out = os.path.join(NDM, dest)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if not os.path.exists(out) or os.path.getsize(out) != os.path.getsize(src):
        shutil.copyfile(src, out)


def thumb(src, dest, size=600):
    out = os.path.join(NDM, dest)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out): return False
    im = Image.open(src).convert('RGBA')
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(out, 'WEBP', quality=85, method=4)
    return True


mapping, missing, derived = {}, [], 0
for u in sorted(urls):
    path = re.sub(r'^https?://(www\.)?', '', u)
    src = os.path.join(LIVE, path)
    if os.path.exists(src):
        d = dest_for(path); copy(src, d)
    else:
        m = re.match(r'^(.*)-300x300\.(png|jpe?g|webp)$', path, re.I)
        base = m and os.path.join(LIVE, m.group(1) + '.' + m.group(2))
        if m and os.path.exists(base):
            d = re.sub(r'\.(png|jpe?g|webp)$', '', dest_for(path), flags=re.I) + '.webp'   # …-300x300.webp, a 600px card image
            derived += thumb(base, d)
        else:
            m2 = re.match(r'^(.*)-m\.webp$', path)
            base2 = m2 and os.path.join(LIVE, m2.group(1) + '.webp')
            if m2 and os.path.exists(base2):
                d = dest_for(re.sub(r'-m\.webp$', '.webp', path)); copy(base2, d)
            else:
                missing.append(u); continue
    mapping[u] = d
    bare = re.sub(r'^https?://(www\.)?', '', u)
    for pre in ('https://', 'https://www.', 'http://', 'http://www.'):
        if not bare.startswith('shop.') or pre.endswith('://'):
            mapping[pre + bare] = d

os.makedirs(os.path.join(NDM, 'src/live'), exist_ok=True)
json.dump(mapping, open(os.path.join(NDM, 'src/live/images.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
n = len(set(mapping.values()))
print(f'{len(urls)} live image urls -> {n} local files ({derived} card thumbnails made); {len(missing)} not available:')
for u in missing: print('  MISSING', u)
