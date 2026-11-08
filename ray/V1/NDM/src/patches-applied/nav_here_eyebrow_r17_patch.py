import re
CSS = r"""
  /* you are here: the menu marks the open page (bar + amber dot under the top item, blue dot on the dropdown link) */
  .nav-is-here{color:#0F80C3}
  .nav-is-here.is-dark{color:#fff}
  .nav-here{position:absolute;left:50%;bottom:3px;width:22px;height:3px;margin-left:-14.5px;border-radius:3px;background:linear-gradient(90deg,#0F80C3,#26B1E7);box-shadow:0 3px 10px -1px rgba(32,158,217,.75);transform-origin:left center;animation:navHere .9s var(--e-out) .35s both;pointer-events:none}
  .nav-here::after{content:'';position:absolute;left:calc(100% + 4px);top:0;width:3px;height:3px;border-radius:50%;background:#FFA617;box-shadow:0 0 8px rgba(255,166,23,.9)}
  .nav-here.is-dark{background:linear-gradient(90deg,#fff,#7FD3F5);box-shadow:0 3px 12px -1px rgba(38,177,231,.9)}
  .nav-here.is-left{left:0;margin-left:0;bottom:-9px}
  @keyframes navHere{from{transform:scaleX(0);opacity:0}to{transform:none;opacity:1}}
  .menu-item[aria-current="page"],.menu-item-m[aria-current="page"]{color:#0F80C3;font-weight:600}
  .menu-item[aria-current="page"]::before,.menu-item-m[aria-current="page"]::before{content:'';flex-shrink:0;width:6px;height:6px;border-radius:50%;background:#209ED9;box-shadow:0 0 0 3px rgba(32,158,217,.18)}
  /* section tag: brand-mark chip + label in a pill with a fine blue-to-amber edge and a slow light sweep */
  .eyebrow{position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;gap:10px;padding:4px 18px 4px 4px;border:1px solid transparent;border-radius:999px;font-size:15px;font-weight:500;line-height:1.2;letter-spacing:-.005em;color:#1B242B;
    background:linear-gradient(180deg,#fff,#F3F9FD) padding-box,linear-gradient(115deg,rgba(38,177,231,.6),rgba(27,36,43,.10) 42%,rgba(27,36,43,.10) 62%,rgba(255,166,23,.55)) border-box;
    box-shadow:inset 0 1px 0 #fff,0 12px 26px -16px rgba(15,128,195,.55)}
  .eyebrow-mark{display:grid;place-items:center;flex-shrink:0;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,#DDF1FB 75%);box-shadow:inset 0 0 0 1px rgba(32,158,217,.22),0 4px 10px -6px rgba(15,128,195,.6)}
  .eyebrow-mark img{width:19px;height:19px}
  .eyebrow::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(105deg,transparent 35%,rgba(38,177,231,.16) 50%,transparent 65%);transform:translateX(-110%);animation:eyebrowSheen 7s ease-in-out 1.5s infinite;pointer-events:none}
  .eyebrow.is-dark{color:#fff;background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.28);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 12px 26px -16px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
  .eyebrow.is-dark .eyebrow-mark{background:#fff;box-shadow:0 4px 12px -6px rgba(38,177,231,.9)}
  .eyebrow.is-dark::after{background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%)}
  @keyframes eyebrowSheen{0%,72%{transform:translateX(-110%)}100%{transform:translateX(110%)}}
  @media (min-width:768px){.eyebrow{font-size:16px;padding:5px 20px 5px 5px;gap:11px}.eyebrow-mark{width:32px;height:32px}.eyebrow-mark img{width:20px;height:20px}}
  @media (prefers-reduced-motion:reduce){.eyebrow::after,.nav-here{animation:none}}
"""
HELPERS = """
/* which page is open: the top menu marks its section, and dropdown links to this page are highlighted */
const HERE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
const NAV_HERE = { 'pricing.html': 'pricing', 'promotion.html': 'promotion', 'about.html': 'about', 'blog.html': 'about', 'what-causes-rosacea-redness.html': 'about', 'botox.html': 'procedures', 'aptos-thread-lift.html': 'procedures' }[HERE];
const isHere = (href) => !!href && !href.includes('#') && href.toLowerCase() === HERE;
const here = (href) => (isHere(href) ? { 'aria-current': 'page' } : {});
const HERE_CAT = (PROCEDURES.find((c) => c.groups.some((g) => g.items.some((it) => isHere(slug(it))))) || {}).id;
"""
EYEBROW_OLD = re.compile(r"function Eyebrow\(\{ children, dark, className = '', style \}\) \{\n  return \(\n    <p className=\{`inline-flex.*?\n  \);\n\}\n", re.S)
EYEBROW_NEW = """function Eyebrow({ children, dark, className = '', style }) {
  return (
    <p className={`eyebrow font-mont ${dark ? 'is-dark' : ''} ${className}`} style={style}>
      <span className="eyebrow-mark" aria-hidden="true"><img src="assets/icons/logo-mark.svg" alt="" /></span>{children}
    </p>
  );
}
"""
def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, (a[:80], c); return s.replace(a, b)

for p in ['index.html', 'promotion.html']:
    s = open(p).read()
    s = rep(s, "  .menu-item-m:active{color:#0F80C3}\n", "  .menu-item-m:active{color:#0F80C3}\n" + CSS)
    s = rep(s, "const ALL_TREATMENTS = [", HELPERS.lstrip('\n') + "const ALL_TREATMENTS = [")
    s, k = EYEBROW_OLD.subn(EYEBROW_NEW, s); assert k == 1, 'eyebrow'
    # desktop top items
    s = rep(s, "className={`flex items-center gap-1.5 rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 ${hover} ${open === n.id ? active : ''}`}\n                    >\n                      {n.label}",
        "className={`relative flex items-center gap-1.5 rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 ${hover} ${open === n.id ? active : ''} ${NAV_HERE === n.id ? `nav-is-here ${tone ? 'is-dark' : ''}` : ''}`}\n                    >\n                      {n.label}{NAV_HERE === n.id && <><span className=\"sr-only\"> (current section)</span><i aria-hidden=\"true\" className={`nav-here ${tone ? 'is-dark' : ''}`} /></>}")
    s = rep(s, "{...(n.ext ? { target: '_blank', rel: 'noopener' } : {})} className={`flex items-center gap-1.5 rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 ${hover}`}>\n                      {n.label}{n.ext && <IconExternal className=\"opacity-60\" />}",
        "{...(n.ext ? { target: '_blank', rel: 'noopener' } : {})} {...(NAV_HERE === n.id ? { 'aria-current': 'page' } : {})} className={`relative flex items-center gap-1.5 rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 ${hover} ${NAV_HERE === n.id ? `nav-is-here ${tone ? 'is-dark' : ''}` : ''}`}>\n                      {n.label}{n.ext && <IconExternal className=\"opacity-60\" />}{NAV_HERE === n.id && <i aria-hidden=\"true\" className={`nav-here ${tone ? 'is-dark' : ''}`} />}")
    # dropdown links
    s, k = re.subn(r'href=\{slug\((\w+)\)\} onClick=\{(onLink|onClose)\} className="menu-item', r'href={slug(\1)} {...here(slug(\1))} onClick={\2} className="menu-item', s); assert k == 7, k
    s = rep(s, '<li><a href="aptos-thread-lift.html" onClick={onLink} className="menu-item', '<li><a href="aptos-thread-lift.html" {...here(\'aptos-thread-lift.html\')} onClick={onLink} className="menu-item')
    # mega menu opens on the category of the open page, with a dot on it
    s = rep(s, "const [act, setAct] = useState('aptos');", "const [act, setAct] = useState(HERE_CAT || 'aptos');")
    s = rep(s, "                {c.label}\n                <IconArrow className={`transition-transform ${on ?",
        "                <span className=\"flex items-center gap-2\">{c.label}{c.id === HERE_CAT && <i aria-hidden=\"true\" className=\"size-1.5 rounded-full bg-ndm-blue shadow-[0_0_0_3px_rgba(32,158,217,.18)]\" />}</span>\n                <IconArrow className={`transition-transform ${on ?")
    # phone drawer
    s = rep(s, "  const Row = ({ children, onClick, expanded }) => (\n    <button onClick={onClick} aria-expanded={expanded} className=\"w-full flex items-center justify-between py-4 font-aeonik text-[22px] text-left\">\n      {children}<IconChevron",
        "  const Row = ({ children, onClick, expanded, on }) => (\n    <button onClick={onClick} aria-expanded={expanded} className={`w-full flex items-center justify-between py-4 font-aeonik text-[22px] text-left ${on ? 'nav-is-here' : ''}`}>\n      <span className=\"relative\">{children}{on && <i aria-hidden=\"true\" className=\"nav-here is-left\" />}</span><IconChevron")
    s = rep(s, "expanded={sec === 'p'}>Procedures</Row>", "expanded={sec === 'p'} on={NAV_HERE === 'procedures'}>Procedures</Row>")
    s = rep(s, "expanded={sec === 'a'}>About</Row>", "expanded={sec === 'a'} on={NAV_HERE === 'about'}>About</Row>")
    s = rep(s, "  const [cat, setCat] = useState(null);\n  useEffect(() => {\n    if (!open) return;", "  const [cat, setCat] = useState(HERE_CAT || null);\n  useEffect(() => {\n    if (!open) return;")
    for lbl, hrefx in [('Pricing', "{slug('Pricing')}"), ('Promotion', '"promotion.html"')]:
        s = rep(s, f'<a href={hrefx} onClick={{onClose}} className="block py-4 font-aeonik text-[22px]">{lbl}</a>',
            f'<a href={hrefx} onClick={{onClose}} {{...(NAV_HERE === \'{lbl.lower()}\' ? {{ \'aria-current\': \'page\' }} : {{}})}} className={{`block py-4 font-aeonik text-[22px] ${{NAV_HERE === \'{lbl.lower()}\' ? \'nav-is-here\' : \'\'}}`}}><span className="relative">{lbl}{{NAV_HERE === \'{lbl.lower()}\' && <i aria-hidden="true" className="nav-here is-left" />}}</span></a>')
    open(p, 'w').write(s); print(p, 'ok')
