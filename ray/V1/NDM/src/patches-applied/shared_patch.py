"""Shared site changes (2026-10-31): off-white background, Skincare shop in the main menu,
floating search on phones, new team portraits. usage: python3 shared_patch.py index.html promotion.html"""
import sys

for path in sys.argv[1:]:
    s = open(path).read()

    def rep(a, b, n=1):
        global s
        c = s.count(a)
        assert c == n, (path, a[:80], c)
        s = s.replace(a, b)

    # 1. neutral off-white instead of the warm paper
    for a, b in (('#FBF9F6', '#FAFAF8'), ('251,249,246', '250,250,248'), ('#F3F0EA', '#F2F2EF')):
        s = s.replace(a, b)

    # 2. Skincare shop joins the main menu after About; the separate Shop button on the right goes
    rep("  { id: 'about', label: 'About', menu: 'about' },\n];",
        "  { id: 'about', label: 'About', menu: 'about' },\n  { id: 'shop', label: 'Skincare shop', href: '#/shop', ext: true },\n];")
    rep('''                    <a href={slug(n.label)} className={`block rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 ${hover}`}>{n.label}</a>''',
        '''                    <a href={n.href || slug(n.label)} {...(n.ext ? { target: '_blank', rel: 'noopener' } : {})} className={`flex items-center gap-1.5 rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 ${hover}`}>
                      {n.label}{n.ext && <IconExternal className="opacity-60" />}
                    </a>''')
    rep('''            <a href="#/shop" target="_blank" rel="noopener" className={`hidden 2xl:inline-flex items-center gap-1.5 rounded-[8px] px-3 py-2 font-inter text-[16px] tracking-[-0.02em] transition-colors ${hover}`}>
              <IconBag />Shop
            </a>
''', '')
    rep('className="flex items-center gap-2 py-4 font-aeonik text-[22px]">Skincare Shop <IconExternal size={16} /></a>',
        'className="flex items-center gap-2 py-4 font-aeonik text-[22px]">Skincare shop <IconExternal size={16} /></a>')

    # 3. phones: the header search icon moves to a floating button, bottom right
    rep('<button onClick={onSearch} aria-label="Search treatments" className={icon}><IconSearch size={21} /></button>',
        '<button onClick={onSearch} aria-label="Search treatments" className={`max-md:!hidden ${icon}`}><IconSearch size={21} /></button>')
    rep('function SearchOverlay({ open, onClose }) {', '''/* phones: search floats bottom right and steps up above any button already sitting there ([data-float-avoid], or `lift` from the page) */
function FloatSearch({ onOpen, hidden, lift = 0 }) {
  const [avoid, setAvoid] = useState(0);
  useOnScroll(() => {
    const vh = window.innerHeight, vw = window.innerWidth;
    let top = vh;
    document.querySelectorAll('[data-float-avoid]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.top < vh && r.bottom > vh - 120 && r.right > vw - 90) top = Math.min(top, r.top);
    });
    setAvoid(top < vh ? vh - top + 12 : 0);
  }, []);
  const bottom = Math.max(16, avoid, lift);
  return (
    <button type="button" onClick={onOpen} tabIndex={hidden ? -1 : 0} aria-hidden={hidden} aria-label="Search treatments"
      className={`float-search fixed right-4 z-[55] grid size-[52px] place-items-center rounded-full bg-ndm-ink text-white shadow-[0_18px_40px_-16px_rgba(11,15,19,.6)] ring-1 ring-white/10 md:hidden ${hidden ? 'is-off' : ''}`}
      style={{ bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}>
      <IconSearch size={22} />
    </button>
  );
}

function SearchOverlay({ open, onClose }) {''')
    css = '''
  /* floating search on phones */
  .float-search{transition:bottom .5s var(--e-out),transform .45s var(--e-out),opacity .3s ease}
  .float-search.is-off{transform:scale(.6);opacity:0;pointer-events:none}
'''
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + css + s[i:]

    # 4. new team portraits (4:5, 800x1000)
    for n in ('negin', 'luis', 'alin'):
        rep(f"img: 'assets/team/{n}.webp'", f"img: 'assets/team/{n}.jpg'")
    rep('width="272" height="444"', 'width="800" height="1000"', 3)

    # page-specific wiring
    if 'introDone' in s and '<div ref={uiRef} className="ui-fade' in s:
        rep('<div ref={uiRef} className="ui-fade', '<div ref={uiRef} data-float-avoid="" className="ui-fade')
        rep('      <Drawer open={drawer} onClose={() => setDrawer(false)} />\n',
            '      <Drawer open={drawer} onClose={() => setDrawer(false)} />\n      <FloatSearch onOpen={() => setSearch(true)} hidden={!introDone || search || drawer} />\n')
    else:
        rep('      <Drawer open={drawer} onClose={() => setDrawer(false)} />\n',
            '      <Drawer open={drawer} onClose={() => setDrawer(false)} />\n      <FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer} />\n')
    open(path, 'w').write(s)
    print('patched', path)
