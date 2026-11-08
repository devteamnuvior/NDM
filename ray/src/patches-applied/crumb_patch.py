"""Site-wide breadcrumb (2026-11-01): top left, just under the header, on every page except home.
Applied to promotion.html (the shell for pricing, about and blog). usage: python3 crumb_patch.py promotion.html"""
import json
import sys

path = sys.argv[1]
s = open(path).read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:80], c)
    s = s.replace(a, b)


css = '''
  /* breadcrumb on inner pages */
  .crumbs{animation:crumbIn .8s var(--e-out) .15s both}
  @keyframes crumbIn{from{opacity:0;transform:translate3d(0,-6px,0)}}
  @media (prefers-reduced-motion:reduce){.crumbs{animation:none}}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

comp = r'''
/* ---------------------------------------------------------------- breadcrumb: every page except home, top left, just under the header bar */
function Breadcrumb({ items, dark }) {
  const link = `underline-offset-4 transition-colors hover:underline ${dark ? 'text-white/65 hover:text-white' : 'text-ndm-muted hover:text-ndm-ink'}`;
  return (
    <nav aria-label="Breadcrumb" className="crumbs absolute inset-x-0 top-[116px] z-20 px-[var(--gx)] xl:top-[136px]">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-inter text-[13px]" role="list">
        <li><a href="index.html" className={link}>Home</a></li>
        {items.map((x, i) => {
          const [label, href] = Array.isArray(x) ? x : [x];
          const last = i === items.length - 1;
          return (
            <Fragment key={label}>
              <li aria-hidden="true" className={dark ? 'text-white/35' : 'text-ndm-ink/30'}>/</li>
              <li>{last ? <span aria-current="page" className={dark ? 'text-white' : 'text-ndm-ink'}>{label}</span> : <a href={href} className={link}>{label}</a>}</li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
'''
rep('\nfunction App() {', comp + '\nfunction App() {')
rep('      <main id="main">\n        <Promotions />', "      <main id=\"main\">\n        <Breadcrumb items={['Promotions']} />\n        <Promotions />")

ld = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
    {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'},
    {'@type': 'ListItem', 'position': 2, 'name': 'Promotions'}]}
desc = '<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">'
rep(desc, desc + '\n<script type="application/ld+json" id="ld-crumbs">' + json.dumps(ld) + '</script>')
open(path, 'w').write(s)
print('patched', path)
