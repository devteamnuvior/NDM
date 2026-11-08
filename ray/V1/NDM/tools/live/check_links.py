"""Every link, image and clip on every rendered page must resolve: files exist, same-page anchors exist, anchors on other
pages exist, and nothing points back at the live WordPress site. "#/slug" placeholders (pages still to build) are listed.
usage: python3 -I check_links.py <NDM dir> <links dir with *.links.json>"""
import json, os, sys, glob, collections, re
from urllib.parse import unquote
NDM, LD = sys.argv[1], sys.argv[2]
pages = {}
for f in glob.glob(os.path.join(LD, '*.links.json')):
    pages[os.path.basename(f).replace('.links.json', '.html')] = json.load(open(f))
ids = {pg: set(d['ids']) for pg, d in pages.items()}
bad = collections.defaultdict(list)
placeholders = collections.Counter()
external = collections.Counter()
old_site = collections.defaultdict(set)
for pg, d in sorted(pages.items()):
    for h in d['hrefs']:
        if re.match(r'^(mailto|tel|sms|javascript):', h): continue
        if re.match(r'^https?://', h):
            host = re.match(r'^https?://([^/]+)', h).group(1)
            external[host] += 1
            if 'newdermamedlaserclinic.com' in host: old_site[h].add(pg)
            continue
        if h == '#' or h == '': continue
        if h.startswith('#/'):
            placeholders[h] += 1; continue
        if h.startswith('#'):
            if h[1:] not in ids[pg]: bad[pg].append('anchor ' + h)
            continue
        path, _, frag = h.partition('#')
        path = unquote(path.split('?')[0])
        if not os.path.exists(os.path.join(NDM, path)): bad[pg].append('missing ' + h); continue
        if frag and path.endswith('.html'):
            tgt = ids.get(path)
            if tgt is not None and frag not in tgt and not frag.startswith('/'): bad[pg].append('anchor on other page ' + h)
    for src in d['imgsrc'] + d['media']:
        if re.match(r'^(https?:|data:)', src):
            if 'newdermamedlaserclinic.com' in src: old_site[src].add(pg)
            continue
        if not os.path.exists(os.path.join(NDM, unquote(src.split('?')[0]))): bad[pg].append('missing file ' + src)
print(len(pages), 'pages checked')
print('pages with broken links or files:', len(bad))
for pg, b in sorted(bad.items())[:60]:
    print('  ', pg, b[:8])
print('placeholders (#/slug) still to build:', dict(placeholders))
print('external hosts:', dict(external))
print('still pointing at the old site:', len(old_site))
for u, ps in sorted(old_site.items())[:40]: print('  ', u, sorted(ps)[:3], len(ps))
