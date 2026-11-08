import re
def rep(s, a, b, n=1, tag=''):
    c = s.count(a); assert c == n, (tag or a[:90], c); return s.replace(a, b)
PEACH = r'''
  /* peach warmth: a faint peach light over photos that lifts the cool blue palette (never on before & after photos) */
  .sw-photo,.aspect-\[590\/385\]{position:relative}
  :is(.plate,.treat-card figure,.team-port-pic,.rv-clip,.sw-photo,.promo-card .aspect-\[16\/10\],.aspect-\[590\/385\])::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;border-radius:inherit;background:radial-gradient(85% 70% at 12% 0%,rgba(255,183,148,.34),transparent 62%),linear-gradient(210deg,rgba(255,212,186,.14),rgba(255,158,120,.12));mix-blend-mode:soft-light}
  section[aria-labelledby="approach"],section[aria-labelledby="team"],section[aria-labelledby="treatments"],section[aria-labelledby="faq"]{background-image:radial-gradient(40% 36% at 90% 14%,rgba(255,190,160,.20),transparent 70%),radial-gradient(36% 32% at 4% 94%,rgba(255,206,182,.16),transparent 70%)}
'''
for p in ['index.html', 'promotion.html']:
    s = open(p).read(); home = p == 'index.html'
    # photo-button hover: brand blue instead of dark ink (dark on a dark photo could not be seen)
    s = rep(s, "  .btn-light:hover,.btn-light:focus-visible,.group:hover .btn-g.btn-light{background:#1B242B;color:#fff}",
               "  .btn-light:hover,.btn-light:focus-visible,.group:hover .btn-g.btn-light{background:#0F80C3;border-color:#0F80C3;color:#fff;box-shadow:0 16px 34px -12px rgba(15,128,195,.75)}", tag='light')
    # before & after band back to its original slate
    s, k = re.subn(r"  \.ba-dark\{[^\n]*\n", "  .ba-dark{background:radial-gradient(70% 55% at 78% 0%,rgba(38,177,231,.16),transparent 70%),radial-gradient(60% 50% at 0% 100%,rgba(255,166,23,.07),transparent 70%),linear-gradient(180deg,#22303A 0%,#18222A 100%)}\n", s); assert k == 1
    s = s.replace('focus-within:ring-offset-[#171513]', 'focus-within:ring-offset-[#18222A]')
    s = rep(s, "  .menu-item-m:active{color:#0F80C3}\n", "  .menu-item-m:active{color:#0F80C3}\n" + PEACH, tag='peach')
    if home:
        s = rep(s, "lines: ['#1 Aptos training', 'centre in Canada'],", "lines: ['#1 Aptos training centre', 'in Canada'],", tag='s2')
        s = rep(s, "  { tab: ['Injectables', '16+ years of experience'],\n    lines: ['Botox®, Dermal fillers, Biostimulator', 'with 16+ years of experience'],",
                   "  { tab: ['Injectables', '16+ years of experience'], accent: true,\n    lines: ['Botox®, Dermal fillers', '& Biostimulators', 'with 16+ years of experience'],", tag='s3')
        s = rep(s, "<span className={`line-in block ${s.cmp && i === s.lines.length - 1 ? 'cmp-hl' : ''}`}>{l}</span>",
                   "<span className={`line-in block ${i === s.lines.length - 1 ? (s.cmp ? 'cmp-hl' : s.accent ? 'tt-strong text-ndm-sky' : '') : ''}`}>{l}</span>", tag='accent')
    open(p, 'w').write(s); print(p, 'ok')
# (also applied: a "Full Black Friday theme" link to black-friday.html in the CampaignSwitch panel, both shells)
