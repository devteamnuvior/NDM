"""round 21 (promotion.html only): Ray's ten offers with the deal from the price list (deal stickers), shown as a red deal badge
on the offer wheel and the All current offers grid; How it works exactly as on the home page (photos and tag); the home page's
@newdermamed section at the bottom of the page.
usage: python3 r21_promotion.py <ray V1/NDM/promotion.html> <index.html> <promotion.html>"""
import sys
ray = open(sys.argv[1], encoding='utf-8').read()
home = open(sys.argv[2], encoding='utf-8').read()
p = sys.argv[3]
s = open(p, encoding='utf-8').read()
def block(src, key, end):
    i = src.index(key); return i, src.index(end, i) + len(end)
# 1. offers: Ray's list (prices and deals from the price list)
a, b = block(ray, 'const SPECIALS = [', '\n];\n'); new_specials = ray[a:b]
a, b = block(s, 'const SPECIALS = [', '\n];\n'); s = s[:a] + new_specials + s[b:]
# 2. the deal badge on the wheel card (above "From") and on the grid card photo
x = '''                        <span className="sw-muted font-inter text-[11px] uppercase tracking-[.18em]">From</span>'''
assert s.count(x) == 1
s = s.replace(x, '''                        {s.deal && <span className="deal-badge mb-3"><i aria-hidden="true">%</i>{s.deal}</span>}\n''' + x)
x = '''                {CAMPAIGN_LOOK && <span className="cmp-badge absolute left-3 top-3">{CAMPAIGN.badge}</span>}'''
assert s.count(x) == 1
s = s.replace(x, x + '''\n                {s.deal && !CAMPAIGN_LOOK && <span className="deal-badge absolute left-3 top-3"><i aria-hidden="true">%</i>{s.deal}</span>}''')
# 3. How it works: the home page's photos and tag
a, b = block(home, 'const PROCESS_MEDIA = [', '\n];\n'); hm = home[a:b]
a, b = block(s, 'const PROCESS_MEDIA = [', '\n];\n'); s = s[:a] + hm + s[b:]
a = s.index('function Process() {'); b = s.index('\n}\n', a)
body = s[a:b]
assert body.count('<Eyebrow className="rv">Process</Eyebrow>') == 1
body = body.replace('<Eyebrow className="rv">Process</Eyebrow>', '<Eyebrow className="rv">How it works</Eyebrow>')
s = s[:a] + body + s[b:]
# 4. the @newdermamed section, as on the home page, closes the page
a, b = block(home, '\nfunction Social() {', '\n}\n'); hs = home[a:b]
a, b = block(s, '\nfunction Social() {', '\n}\n'); s = s[:a] + hs + s[b:]
x = '        <Appointment />\n      </main>'
assert s.count(x) == 1
s = s.replace(x, '        <Appointment />\n        <Social />\n      </main>')
CSS = '''  /* round 21: the deal from the price list as a red badge (offer wheel and grid) */
  .deal-badge{position:relative;display:inline-flex;align-items:center;gap:7px;overflow:hidden;border-radius:999px;padding:6px 13px 6px 6px;white-space:nowrap;font:700 11.5px/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#EC3A50 0%,#C8182E 55%,#A0102A 100%);box-shadow:0 12px 24px -12px rgba(200,24,46,.85),inset 0 1px 0 rgba(255,255,255,.28)}
  .deal-badge i{display:grid;place-items:center;width:20px;height:20px;border-radius:999px;background:#fff;color:#C8182E;font:800 11px/1 "Helvetica Neue",Inter,Arial,sans-serif;font-style:normal}
  .deal-badge::after{content:"";position:absolute;inset:-40% -60%;pointer-events:none;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.38) 50%,transparent 60%);transform:translateX(-70%);animation:dealShine 4.5s ease-in-out infinite}
  @keyframes dealShine{0%,55%{transform:translateX(-70%)}85%,100%{transform:translateX(70%)}}
  @media (prefers-reduced-motion:reduce){.deal-badge::after{animation:none;display:none}}
  .soc-ico.soc-ico-line:not(:hover):not(:focus-visible){background:transparent}
  .soc-ico-line:hover,.soc-ico-line:focus-visible{border-color:transparent}
'''
x = '  /* campaign looks: tokens per look'
assert s.count(x) == 1
s = s.replace(x, CSS + x)
open(p, 'w', encoding='utf-8').write(s); print('ok', p)
