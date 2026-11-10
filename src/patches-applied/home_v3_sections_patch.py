# Home page sections from the NDM website v3 prototype (Nov 2026), restyled in the NDM design system.
#  - hero: the scroll slides are replaced by one clinic film (v3), with the brand band along its bottom edge (replaces the logo strip)
#  - "Where would you like to start?" right after the hero
#  - Aptos: v3 "A non-surgical facelift" band in NDM colours, with the four marking photos below (replaces the purple Aptos band)
#  - "Treatments, by what they do": pinned, cards move left as you scroll (like before & after)
#  - "Two Toronto clinics, one standard of care" replaces "Inside our clinics"
# Pieces live next to this file (home_v3_*.txt). Already applied to index.html, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()
p = 'index.html'
s = open(p, encoding='utf-8').read()
def cut(a, b, new=''):
    global s
    i = s.index(a); j = s.index(b, i)
    assert s.count(a) == 1, a
    s = s[:i] + new + s[j:]
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)

# styles
rep('  .marquee-mask{', part('home_v3_sections_css.txt') + '  .marquee-mask{')
# hero slides, their data and the logo strip go; the film hero takes their place
cut('const SLIDES_BASE = [', 'const REVIEWS = [')
cut('function HeroVisual(', '/* ---------------------------------------------------------------- statement */', part('home_v3_hero.jsx.txt'))
# Aptos band
cut('function AptosCare() {', '/* ---------------------------------------------------------------- before & after', part('home_v3_aptos.jsx.txt'))
# inside our clinics -> two Toronto clinics (keeps the name Space), plus the start panels and the treatment menu
cut('const VID = ', '/* ---------------------------------------------------------------- journal', part('home_v3_sections.jsx.txt'))
# data
rep('\nfunction App() {', '\n' + part('home_v3_data.js.txt') + '\nfunction App() {')
# page order
rep('''        <Statement />
        <Partners />
        <Space />
        <Team />
        <Treatments />
        <AptosCare />
        <BeforeAfter />''', '''        <Start onSearch={() => setSearch(true)} />
        <AptosCare />
        <TreatMenu />
        <Statement />
        <Space />
        <Team />
        <Treatments />
        <BeforeAfter />''')
# the header turns into its scrolled style once the page moves (the film hero is one screen tall, the slides were four)
rep('    setScrolled(y > end - 40);', '    setScrolled(y > Math.max(24, end - 40));')
open(p, 'w', encoding='utf-8').write(s)
print(p, 'ok')
