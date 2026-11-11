"""Round 29 quick fixes, both shells (index.html, promotion.html):
- prices never use a thousands comma ($1000, not $1,000): money() turns grouping off
- the NDM favicon (the live site's blue mark, from Ray's assets) on every page
- home: the header and the top bar show, blurred, from the first frame (no longer only after the intro)
- promotion: the Dark / Light test switch is gone; "Save on cosmetic treatment" sits above the financing button, centred
- the Black Friday bottom panel keeps one button (See the Black Friday deals)
usage: python3 src/patches-applied/r29_quick.py <NDM dir>
"""
import re
import sys
from pathlib import Path

ICONS = ('<link rel="icon" href="assets/icons/logo-mark.svg" type="image/svg+xml">\n'
         '<link rel="icon" href="assets/icons/favicon-48.png" sizes="48x48" type="image/png">\n'
         '<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">\n')
for name in ['index.html', 'promotion.html']:
    f = Path(sys.argv[1]) / name
    s = f.read_text(encoding='utf-8')

    def rep(a, b, n=1):
        global s
        c = s.count(a)
        assert c == n, (name, a[:80], c)
        s = s.replace(a, b)

    rep("const money = (n) => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });",
        "const money = (n) => '$' + n.toLocaleString('en-CA', { useGrouping: false, minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); /* no thousands comma */")
    if 'rel="icon"' not in s:
        s = s.replace('</title>\n', '</title>\n' + ICONS, 1)
    rep("""              <Btn href="#/book" v="glass" onClick={() => setOpen(false)}>Book Free Consultation</Btn>
""", "")
    if name == 'index.html':
        rep("      <PromoBar hidden={!introDone} />\n      <Header dark={dark} top={introDone ? 36 : 0} visible={introDone}",
            "      <PromoBar hidden={false} />\n      <Header dark={dark} top={36} visible")
    if name == 'promotion.html':
        i = s.index('        <div className="absolute right-[var(--gx)] top-[clamp(132px,15vh,160px)] z-20 flex items-center gap-1 rounded-full p-1 font-inter text-[12.5px] sw-theme"')
        j = s.index('        </div>\n', i) + len('        </div>\n')
        s = s[:i] + s[j:]
    # the financing line: text above, button below, centred (wheel and offers grid)
    a = '''<p className="sw-title flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center font-mont text-[12px] uppercase tracking-[.16em] md:text-[13px]">
            <span>Save on cosmetic treatment</span>
            <i aria-hidden="true" className="hidden h-px w-7 bg-ndm-amber sm:block" />'''
    if s.count(a) == 1:
        s = s.replace(a, '''<p className="sw-title flex flex-col items-center justify-center gap-3 text-center font-mont text-[12px] uppercase tracking-[.16em] md:text-[13px]">
            <span>Save on cosmetic treatment</span>''')
    a = '''<p className="rv mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center font-inter text-[13px] uppercase tracking-[.16em] text-ndm-muted">
        Save on cosmetic treatment <span aria-hidden="true" className="inline-block h-px w-8 bg-ndm-amber" /> '''
    if s.count(a) == 1:
        s = s.replace(a, '''<p className="rv mt-10 flex flex-col items-center justify-center gap-3 text-center font-inter text-[13px] uppercase tracking-[.16em] text-ndm-muted">
        Save on cosmetic treatment ''')
    f.write_text(s, encoding='utf-8')
    print('patched', name)
