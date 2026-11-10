# Home page, round 2 (2026-11-06), on top of home_v3_sections_patch.py:
#  - Treatments by what they do: an "All" tab (first, selected), section id "treatments"; long rails move faster than the scroll
#  - About NewDermaMed: the section is removed; its words and numbers now sit on the clinic film (numbers in the pricing-hero strip)
#  - Aptos: two photo cards and the turning NAMICA badge (nuvior.com/aptos hero); "Licensed by Health Canada" removed
#  - "Most popular treatments" removed
#  - Before & after: website v3 "Real results" layout, four cards side by side
#  - Patient reviews: replaced by the inner-page testimonials rows, with awards & recognition cards in between
# Pieces live next to this file (home_v3_r2_*.txt). Already applied to index.html, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()
p = 'index.html'
s = open(p, encoding='utf-8').read()
def cut(a, b, new=''):
    global s
    assert s.count(a) == 1, a
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + s[j:]
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)

rep('  .marquee-mask{', part('home_v3_r2_css.txt') + '  .marquee-mask{')

# before & after first (its pinned height line matches the treatment menu's)
cut('/* before & after: a dark, pinned', '/* ---------------------------------------------------------------- meet the team', part('home_v3_r2_ba.jsx.txt'))

# treatment menu: All tab, anchor, capped scroll length
i = s.index('const MENU = '); j = s.index('\n', i) + 1
s = s[:j] + "const MENU_TABS = [{ id: 'all', label: 'All', all: ['#/treatments', 'All treatments'], cards: MENU.flatMap((m) => m.cards) }, ...MENU];\n" + s[j:]
rep('  const c = MENU[cat];', '  const c = MENU_TABS[cat];')
rep('{MENU.map((m, i) => (', '{MENU_TABS.map((m, i) => (')
rep('const n = (i + k + MENU.length) % MENU.length;', 'const n = (i + k + MENU_TABS.length) % MENU_TABS.length;')
rep('<section ref={ref} data-nav="dark" data-pill-avoid="mobile" aria-labelledby="menu-title" className="tm-aurora relative z-10 text-white" style={{ height: REDUCED ? \'auto\' : `calc(100vh + ${dist}px)` }}>',
    '<section ref={ref} id="treatments" data-nav="dark" data-pill-avoid="mobile" aria-labelledby="menu-title" className="tm-aurora relative z-10 scroll-mt-0 text-white" style={{ height: REDUCED ? \'auto\' : `calc(100vh + ${Math.min(dist, 2400)}px)` }}>')

# about NewDermaMed: the section goes, the clinic film carries its words and numbers
cut('const APPROACH_STATS', 'function Statement() {')
i = s.index('function Statement() {'); j = s.index('\n}\n', i) + 3
s = s[:i] + s[j:]
cut('/* ---------------------------------------------------------------- two Toronto clinics (website v3 clinic film)', '/* ---------------------------------------------------------------- journal', part('home_v3_r2_space.jsx.txt'))

# Aptos visual and checklist
cut('        <div className="rv relative pb-10 lg:pb-0">', '\n\n        <div>\n          <Eyebrow className="rv">Our signature</Eyebrow>', part('home_v3_r2_aptos.jsx.txt').rstrip('\n'))
rep(", 'Placed by trained medical professionals', 'Licensed by Health Canada'];", ", 'Placed by trained medical professionals'];")
rep('''            <Btn href="aptos-thread-lift.html" v="line">Explore Aptos Thread Lift</Btn>
          </div>''', '''            <Btn href="aptos-thread-lift.html" v="line">Explore Aptos Thread Lift</Btn>
          </div>
          <p className="rv mt-6 max-w-[56ch] font-inter text-[12.5px] leading-[1.5] text-ndm-muted">*Clinical study: 96% of subjects improved at least 1 WSRS point by 6 months (N=140). Individual results may vary.</p>''')

# most popular treatments
cut('/* ---------------------------------------------------------------- treatments (Aurel caro', '/* ---------------------------------------------------------------- Aptos · NAMICA')

# patient reviews -> testimonials with award cards
cut('/* ---------------------------------------------------------------- what they are saying', '/* ---------------------------------------------------------------- appear-on-scroll', part('home_v3_r2_reviews.jsx.txt'))
cut('const REVIEWS = [', '/* ---------------------------------------------------------------- icons')

rep('        <Statement />\n', '')
rep('        <Treatments />\n', '')
open(p, 'w', encoding='utf-8').write(s)
print(p, 'ok')
