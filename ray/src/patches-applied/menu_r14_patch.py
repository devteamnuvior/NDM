"""Site-wide (2026-11-04), already applied to index.html and promotion.html:
menu items look like buttons (soft pill + arrow) in every menu panel and in the mobile menu;
the Aptos panel shows two cards side by side (purple NAMICA card and an Aptos photo card), no counters."""
import sys

ITEM_LINK = '''<a href={slug(it)} onClick={onLink} className="menu-item group">
                      <span className="min-w-0">{it}</span><IconArrow size={11} className="menu-arrow" />
                    </a>'''
APTOS = r'''function AptosMenu({ items, onLink }) {
  return (
    <div className="mt-4 grid h-[calc(100%-96px)] grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3">
      <div className="flex min-w-0 flex-col">
        <p className="mb-2 font-mont text-[11px] uppercase tracking-[.14em] text-ndm-muted">Treatment</p>
        <ul role="list" className="grid gap-1.5">
          {items.map((it) => (
            <li key={it}><a href={slug(it)} onClick={onLink} className="menu-item group"><span className="min-w-0">{it}</span><IconArrow size={11} className="menu-arrow" /></a></li>
          ))}
          <li><a href="aptos-thread-lift.html" onClick={onLink} className="menu-item group"><span className="min-w-0">Aptos Thread Lift</span><IconArrow size={11} className="menu-arrow" /></a></li>
        </ul>
      </div>
      {/* NAMICA: the purple card, in the same shape as the photo cards in the other menus */}
      <a href="aptos-thread-lift.html" onClick={onLink} className="namica group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[16px] p-5 text-white">
        <img src={NAMICA_SPHERE} alt="" aria-hidden="true" className="namica-sphere pointer-events-none absolute -right-6 -top-8 w-[150px] opacity-90 transition-transform duration-700 group-hover:scale-105" />
        <img src={NAMICA_SPHERE} alt="" aria-hidden="true" className="namica-sphere namica-sphere-2 pointer-events-none absolute left-[18%] top-[16%] w-[28px] opacity-70 blur-[1px]" />
        <span className="relative block font-inter text-[11px] uppercase tracking-[.16em] text-[#C9C2F4]">NAMICA technology</span>
        <span className="relative mt-2 block font-aeonik text-[24px] leading-[1.15] tracking-[-0.01em]">Biostimulation threads</span>
        <span className="relative mt-1.5 block font-inter text-[12.5px] font-medium tracking-[.04em] text-[#C9C2F4]">P(LA/CL) + HA</span>
        <span className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-[12px] text-white/90"><IconCheckBadge size={14} />Licensed by Health Canada</span>
      </a>
      <a href="aptos-thread-lift.html" onClick={onLink} className="group relative min-h-[300px] overflow-hidden rounded-[16px] text-white">
        <img src="assets/aptos/midface-vectors.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#0B0F13]/85 via-[#0B0F13]/25 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-5">
          <span className="block font-mont text-[11px] uppercase tracking-[.14em] text-white/75">Aptos Thread Lift</span>
          <span className="mt-2 block font-aeonik text-[22px] leading-[1.2]">A lift, without the surgery</span>
          <span className="mt-3 inline-flex items-center gap-2 font-mont text-[13px] font-medium">Explore <IconArrow size={12} className="transition-transform group-hover:translate-x-1" /></span>
        </span>
      </a>
    </div>
  );
}
'''
CSS = '''
  /* menu items read as buttons: a soft pill with an arrow, blue on hover */
  .menu-item{display:flex;align-items:center;justify-content:space-between;gap:10px;border-radius:10px;background:rgba(242,242,239,.75);padding:7px 12px;font:400 13.5px/1.35 Montserrat,Inter,system-ui,sans-serif;color:#1B242B;transition:background-color .25s ease,color .25s ease,box-shadow .25s ease}
  .menu-item:hover,.menu-item:focus-visible{background:#0F80C3;color:#fff;box-shadow:0 10px 20px -14px rgba(15,128,195,.9)}
  .menu-arrow{flex-shrink:0;opacity:.45;transition:transform .25s ease,opacity .25s ease}
  .menu-item:hover .menu-arrow,.menu-item:focus-visible .menu-arrow{opacity:1;transform:translateX(2px)}
  .menu-item-m{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;border-radius:12px;background:#F2F2EF;padding:10px 12px;font:400 14px/1.35 Montserrat,Inter,system-ui,sans-serif;color:#1B242B}
  .menu-item-m:active{background:#0F80C3;color:#fff}
'''
for f in sys.argv[1:]:
    s = open(f).read()
    def rep(a, b, n=1):
        global s
        c = s.count(a); assert c == n, (f, a[:70], c); s = s.replace(a, b)
    a = s.index('function AptosMenu({ items, onLink }) {'); b = s.index('\nfunction MegaMenu', a)
    s = s[:a] + APTOS + s[b:]
    # procedure groups and concerns: pills (columns keep their spacing)
    rep('''              <ul className={g.items.length > 7 ? 'columns-2 gap-6' : ''} role="list">
                {g.items.map((it) => (
                  <li key={it} className="break-inside-avoid">
                    <a href={slug(it)} onClick={onLink} className="group flex items-center gap-2 py-[7px] font-mont text-[14px] text-ndm-ink/90 hover:text-ndm-blue">
                      <span className="h-px w-0 bg-ndm-blue transition-all duration-300 group-hover:w-3" />{it}
                    </a>
                  </li>''', '''              <ul className={g.items.length > 7 ? 'columns-2 gap-2' : 'grid gap-1.5'} role="list">
                {g.items.map((it) => (
                  <li key={it} className={`break-inside-avoid ${g.items.length > 7 ? 'mb-1.5' : ''}`}>
                    ''' + ITEM_LINK + '''
                  </li>''')
    rep('''              <ul role="list">
                {g.items.map((it) => (
                  <li key={it}>
                    <a href={slug(it)} onClick={onLink} className="group flex items-center gap-2 py-[7px] font-mont text-[14px] text-ndm-ink/90 hover:text-ndm-blue">
                      <span className="h-px w-0 bg-ndm-blue transition-all duration-300 group-hover:w-3" />{it}
                    </a>
                  </li>''', '''              <ul role="list" className="grid gap-1.5">
                {g.items.map((it) => (
                  <li key={it}>
                    ''' + ITEM_LINK + '''
                  </li>''')
    # about links: arrow always shown, pill on hover
    rep('''            <a href={slug(l)} onClick={onLink} className="group flex items-center justify-between py-3 border-b border-ndm-line last:border-0 font-mont text-[14px] hover:text-ndm-blue">
              {l}<IconArrow className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </a>''', '''            <a href={slug(l)} onClick={onLink} className="menu-item group mb-1.5 py-3 text-[14px]">
              <span className="min-w-0">{l}</span><IconArrow size={12} className="menu-arrow" />
            </a>''')
    # mobile menu items: pills
    rep('''{g.items.map((it) => <a key={it} href={slug(it)} onClick={onClose} className="block py-1.5 font-mont text-[14px] text-ndm-ink/80 hover:text-ndm-blue">{it}</a>)}''',
        '''{g.items.map((it) => <a key={it} href={slug(it)} onClick={onClose} className="menu-item-m"><span className="min-w-0">{it}</span><IconArrow size={11} className="shrink-0 opacity-50" /></a>)}''', 2)
    rep('''{ABOUT.links.map((l) => <li key={l}><a href={slug(l)} onClick={onClose} className="block py-1.5 font-mont text-[15px]">{l}</a></li>)}''',
        '''{ABOUT.links.map((l) => <li key={l}><a href={slug(l)} onClick={onClose} className="menu-item-m"><span className="min-w-0">{l}</span><IconArrow size={11} className="shrink-0 opacity-50" /></a></li>)}''')
    anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
    i = s.rindex('</style>', 0, s.index(anchor))
    s = s[:i] + CSS + s[i:]
    open(f, 'w').write(s); print('patched', f)
