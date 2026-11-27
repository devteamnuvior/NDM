"""Round 36 (2026-11-17, user): the announcement bar takes the Black Friday look (black, signal red) while the sale is not over,
the same on every page, and the home page's "Two ways in" search bar ends in the menu's magnifier instead of an arrow.
usage: python3 src/patches-applied/r36_bf_promobar.py index.html promotion.html   (already applied, do not run again)"""
import sys

CSS_A = '  @keyframes promoFlow{to{background-position:-200% 0}}'
CSS_B = CSS_A + '''
  /* Black Friday look of the bar (round 36): the sale page's black with its red glow, a red NEW pill; on every page until the sale is over */
  .promo-attn.is-bf{background:radial-gradient(55% 300% at 100% 0%,rgba(211,18,29,.42),transparent 62%),radial-gradient(45% 300% at 0% 100%,rgba(211,18,29,.22),transparent 70%),#0B0B0C;animation:none;box-shadow:inset 0 -1px 0 rgba(255,255,255,.1)}
  .promo-attn.is-bf .promo-shine{display:none}
  .promo-attn.is-bf .promo-new{background:#D3121F;color:#fff}
  .promo-attn.is-bf .promo-ping{background:#fff}
  .promo-attn.is-bf svg{color:#EE3A45}'''
BAR_A = "  const cd = useCountdown(CAMPAIGN && CAMPAIGN.until);\n"
BAR_B = BAR_A + "  const bfLook = !useBfClock(60000).over; /* round 36: the Black Friday look until the sale is over */\n"
CLS_A = "className={`promo-attn fixed inset-x-0 top-0 z-[60]"
CLS_B = "className={`promo-attn ${bfLook ? 'is-bf' : ''} fixed inset-x-0 top-0 z-[60]"
ARR_A = 'group-hover:bg-[#0A4F7A]" aria-hidden="true"><IconArrow /></span>'
ARR_B = 'group-hover:bg-[#0A4F7A]" aria-hidden="true"><IconSearch size={20} /></span>'

for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    for a, b, need in [(CSS_A, CSS_B, 1), (BAR_A, BAR_B, 1), (CLS_A, CLS_B, 1), (ARR_A, ARR_B, 0)]:
        c = s.count(a)
        assert c == 1 or (need == 0 and c == 0), (f, a[:60], c)
        s = s.replace(a, b)
    open(f, 'w', encoding='utf-8').write(s)
    print('patched', f)
