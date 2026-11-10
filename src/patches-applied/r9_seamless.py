# round 9: promotion and pricing get the Botox page's seamless sections (one paper colour, soft glows that fade out
# at each section's edges, no visible seams); the promotion page's top panel fades into the page instead of ending
# on a line. Main look only: campaign looks are left as they are.
import sys
CSS = '''  /* seamless pages (main.seamless: promotion, pricing): one paper colour, edge-faded glows, no seams */
  html:not([data-campaign]) main.seamless>section:not([data-nav="dark"]){background-color:#FAFAF8!important;background-image:none!important;isolation:isolate}
  html:not([data-campaign]) main.seamless>section:not([data-nav="dark"])::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;-webkit-mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);mask:linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%);background:radial-gradient(40% 50% at 96% 45%,rgba(255,190,160,.16),transparent 70%)}
  html:not([data-campaign]) main.seamless>section:not([data-nav="dark"]):nth-of-type(even)::before{background:radial-gradient(40% 50% at 4% 55%,rgba(38,177,231,.10),transparent 70%)}
  html:not([data-campaign]) main.seamless>.specials-wheel .sw-panel{background:linear-gradient(180deg,var(--sw-panel) 0%,var(--sw-panel) 72%,#FAFAF8 100%)}
'''
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    if p.endswith('.html'):
        anchor = '  /* campaign looks: tokens per look'
        assert s.count(anchor) == 1, p
        s = s.replace(anchor, CSS + anchor)
    if p.endswith('promotion.html') or p.endswith('build_pricing.py'):
        assert s.count('<main id="main">') == 1, p
        s = s.replace('<main id="main">', '<main id="main" className="seamless">')
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
