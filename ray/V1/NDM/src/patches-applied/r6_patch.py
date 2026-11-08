# Round 6 (2026-11-06):
#  home: About NewDermaMed (the original statement with photos and the four numbers, "Top Choice Awards" on one line) returns right
#        after the hero, without the logo strip; "Inside our clinics" returns in its original style with one film; the treatment menu
#        becomes a card carousel on the paper background (the old "Most popular treatments" look, smaller, on white cards, arrows,
#        no scroll-jacking); order: hero, about, start, treatment menu, Aptos, clinics, team ...
#  both shells: the Procedures mega menu goes back to its original look (Aptos shares the layout); no lines between submenu items
# (then, by hand: the about and treatment-menu sections join the edge-fading glow layer, see the CSS after the book glow)
# Pieces next to this file (r6_*.jsx.txt). Already applied, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()

def patch_shell(p, home):
    s = open(p, encoding='utf-8').read()
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (p, a[:80], s.count(a)); s = s.replace(a, b)
    i = s.index('function MegaMenu('); j = s.index('\n}\n', i) + 3
    s = s[:i] + part('r6_megamenu.jsx.txt').rstrip('\n') + '\n\n' + s[j:]
    rep('  .panel .menu-item{justify-content:space-between;padding:8px 2px;border-bottom:1px solid rgba(27,36,43,.1);font-size:14.5px;line-height:1.3}\n  .panel .menu-arrow{display:none}\n', '')
    rep('<div className="grid gap-4 p-4 2xl:p-5 grid-cols-[1fr_280px] 2xl:grid-cols-[1fr_340px]">', '<div className="grid gap-4 p-4 2xl:p-5 grid-cols-[1fr_340px]">')
    rep('<a href={aboutHref(l)} onClick={onLink} className="menu-item group font-mont">', '<a href={aboutHref(l)} onClick={onLink} className="menu-item group font-mont border-b border-ndm-line py-3 last:border-0">')
    if home:
        rep('  .marquee-mask{', '''  /* treatment menu cards (the old "Most popular treatments" size, a little smaller) */
  .tm-card2{width:78%;max-width:340px}
  @media (min-width:640px){.tm-card2{width:44%}}
  @media (min-width:1024px){.tm-card2{width:calc((100% - 48px) / 4.25);max-width:none}}
  .tm-card2{box-shadow:0 22px 44px -36px rgba(27,36,43,.45);transition:box-shadow .45s var(--e-out),transform .45s var(--e-out)}
  .tm-card2:hover{transform:translateY(-3px);box-shadow:0 30px 56px -36px rgba(27,36,43,.55)}
  .marquee-mask{''')
        i = s.index('const STATEMENT = '); j = s.index('\n', i) + 1
        s = s[:i] + s[i:j] + part('r6_statement.jsx.txt') + s[j:]
        i = s.index('/* ---------------------------------------------------------------- about NewDermaMed, over the clinic film')
        j = s.index('/* ---------------------------------------------------------------- journal', i)
        s = s[:i] + part('r6_space.jsx.txt') + s[j:]
        i = s.index('/* ---------------------------------------------------------------- treatments, by what they do'); j = s.index('\n}\n', s.index('function TreatMenu() {', i)) + 3
        s = s[:i] + part('r6_treatmenu.jsx.txt') + s[j:]
        rep('''        <Start onSearch={() => setSearch(true)} />
        <AptosCare />
        <TreatMenu />
        <Space />''', '''        <Statement />
        <Start onSearch={() => setSearch(true)} />
        <TreatMenu />
        <AptosCare />
        <Space />''')
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')

patch_shell('index.html', True)
patch_shell('promotion.html', False)
b = open('src/build_blackfriday.py', encoding='utf-8').read()
assert b.count('grid-cols-[210px_1fr_280px]') == 2
open('src/build_blackfriday.py', 'w', encoding='utf-8').write(b.replace('grid-cols-[210px_1fr_280px]', 'grid-cols-[210px_1fr_340px]'))
print('bf ok')
