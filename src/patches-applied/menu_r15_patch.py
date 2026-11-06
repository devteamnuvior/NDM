"""Site-wide (2026-11-04), already applied to index.html and promotion.html:
menu items back to plain text links, each with a blue arrow right after the text (moves on hover);
Aptos panel: treatment list, then the purple NAMICA card at the same size as the consultation photo card, side by side."""
import sys, re
APTOS = r'''function AptosMenu({ items, onLink }) {
  return (
    <div className="mt-4">
      <p className="mb-1 font-mont text-[11px] uppercase tracking-[.14em] text-ndm-muted">Treatment</p>
      <ul role="list">
        {items.map((it) => (
          <li key={it}><a href={slug(it)} onClick={onLink} className="menu-item group font-mont"><span className="min-w-0">{it}</span><IconArrow size={12} className="menu-arrow" /></a></li>
        ))}
        <li><a href="aptos-thread-lift.html" onClick={onLink} className="menu-item group font-mont"><span className="min-w-0">Aptos Thread Lift</span><IconArrow size={12} className="menu-arrow" /></a></li>
      </ul>
    </div>
  );
}
/* NAMICA: the purple frame, the same size as the consultation photo card beside it */
function AptosCard({ onLink }) {
  return (
    <a href="aptos-thread-lift.html" onClick={onLink} className="namica group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[16px] p-5 text-white">
      <img src={NAMICA_SPHERE} alt="" aria-hidden="true" className="namica-sphere pointer-events-none absolute -right-8 -top-10 w-[190px] opacity-90 transition-transform duration-700 group-hover:scale-105" />
      <img src={NAMICA_SPHERE} alt="" aria-hidden="true" className="namica-sphere namica-sphere-2 pointer-events-none absolute left-[16%] top-[18%] w-[30px] opacity-70 blur-[1px]" />
      <span className="relative block font-mont text-[11px] uppercase tracking-[.14em] text-[#C9C2F4]">NAMICA technology</span>
      <span className="relative mt-2 block font-aeonik text-[22px] leading-[1.2]">Biostimulation threads</span>
      <span className="relative mt-1.5 block font-inter text-[12.5px] font-medium tracking-[.04em] text-[#C9C2F4]">P(LA/CL) + HA</span>
      <span className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-[12px] text-white/90"><IconCheckBadge size={14} />Licensed by Health Canada</span>
    </a>
  );
}
'''
CSS_OLD = re.compile(r"\n  /\* menu items read as buttons: a soft pill with an arrow, blue on hover \*/\n(  \.menu[^\n]*\n)+")
CSS_NEW = '''
  /* menu items: plain links, a blue arrow right after the text that nudges on hover */
  .menu-item{display:flex;align-items:center;gap:8px;padding:7px 0;font-size:14px;line-height:1.35;color:rgba(27,36,43,.9);transition:color .25s ease}
  .menu-item:hover,.menu-item:focus-visible{color:#0F80C3}
  .menu-arrow{flex-shrink:0;color:#209ED9;transition:transform .25s ease}
  .menu-item:hover .menu-arrow,.menu-item:focus-visible .menu-arrow{transform:translateX(3px)}
  .menu-item-m{display:flex;align-items:center;gap:8px;padding:7px 0;font-size:14px;line-height:1.35;color:rgba(27,36,43,.85)}
  .menu-item-m:active{color:#0F80C3}
'''
for f in sys.argv[1:]:
    s = open(f).read()
    def rep(a, b, n=1):
        global s
        c = s.count(a); assert c == n, (f, a[:70], c); s = s.replace(a, b)
    a = s.index('function AptosMenu({ items, onLink }) {'); b = s.index('\nfunction MegaMenu', a)
    s = s[:a] + APTOS + s[b:]
    # the middle column: for Aptos, the list on the left and the purple card at full height on the right
    a = s.index('      <div className="h-[516px] px-5 py-4 2xl:h-[456px]">')
    b = s.index('''        )}
      </div>
      <a href="#/book" onClick={onLink} className="group relative overflow-hidden rounded-[16px] min-h-[380px] text-white">''', a) + len('''        )}
      </div>
''')
    mid = s[a:b]
    head_a = mid.index('        <div className="flex items-baseline justify-between gap-4 border-b border-ndm-line pb-4">')
    head_b = mid.index("        {cat.id === 'aptos' ?")
    head = mid[head_a:head_b]
    rest = mid[head_b:]
    rest = rest.replace("{cat.id === 'aptos' ? <AptosMenu items={cat.groups[0].items} onLink={onLink} /> : (", "{(")
    new_mid = '''      {cat.id === 'aptos' ? (
        <div className="grid h-[516px] grid-cols-[minmax(0,1fr)_340px] gap-4 2xl:h-[456px]">
          <div className="px-5 py-4">
''' + head.replace('\n        ', '\n            ').replace('        <div className="flex items-baseline', '            <div className="flex items-baseline', 1) + '''            <AptosMenu items={cat.groups[0].items} onLink={onLink} />
          </div>
          <AptosCard onLink={onLink} />
        </div>
      ) : (
      <div className="h-[516px] px-5 py-4 2xl:h-[456px]">
''' + head + rest.rstrip('\n') + '\n      )}\n'
    s = s[:a] + new_mid + s[b:]
    s, k = CSS_OLD.subn(CSS_NEW, s); assert k == 1, (f, 'css', k)
    # the mobile menu arrows take the blue too
    s = s.replace('<IconArrow size={11} className="shrink-0 opacity-50" />', '<IconArrow size={11} className="shrink-0 text-ndm-blue" />')
    # desktop pills used mb/py tweaks on About links; plain rows there keep a hairline between them
    rep('''className="menu-item group font-mont mb-1.5 py-3 text-[14px]">''', '''className="menu-item group font-mont border-b border-ndm-line py-3 last:border-0">''')
    open(f, 'w').write(s); print('patched', f)
