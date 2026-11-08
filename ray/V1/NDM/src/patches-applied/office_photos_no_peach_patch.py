"""Office photos: no peach light on top (Nov 2026, for Raymond).

The site photos are now graded warm in the image files themselves. Clinic interiors get a warm white balance only,
because the soft-light peach glow on top turned white rooms pink / orange. This removes the peach glow from the two
frames that hold office photos: the About NewDermaMed photo pairs (.about-bob) and the clinic cards (.visit-card).
People and treatment photos keep the peach light.

Applied to index.html, promotion.html (the shell) and every page built from them, so a rebuild keeps it.
Run from the project folder: python3 src/patches-applied/office_photos_no_peach_patch.py  (safe to run twice)
"""
import os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PAGES = ['index.html', 'promotion.html', 'about.html', 'aptos-thread-lift.html', 'black-friday.html', 'blog.html', 'botox.html',
         'cart.html', 'checkout.html', 'order-confirmed.html', 'pricing.html', 'what-causes-rosacea-redness.html']
ADD = ("  /* office photos are graded warm in the image files; no peach light on top, it turned white rooms pink */\n"
       "  .about-bob::after,.visit-card .rv-clip::after{content:none}\n")
PEACH = re.compile(r"\n[ \t]*:is\(\.plate,\.treat-card figure,\.team-port-pic,\.rv-clip,[^\n]*\n")

for name in PAGES:
    p = os.path.join(ROOT, name)
    s = open(p, encoding='utf-8').read()
    if ADD in s:
        print('already applied:', name); continue
    m = PEACH.search(s)
    if not m:
        print('peach rule not found, skipped:', name); continue
    s = s[:m.end()] + ADD + s[m.end():]
    open(p, 'w', encoding='utf-8').write(s)
    print('patched:', name)
