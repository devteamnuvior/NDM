"""Home page "Exclusive monthly specials" wheel, matched to the promotion page (Raymond, 2026-11-08):
the deal sticker above the price (deal text comes from the price list via promo_offers_patch.py),
the sale's name as the card tag while a sale is on, and an "On now: <sale> · ends in ..." line
under the title. One-time patch to index.html; idempotent."""
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
p = root / 'index.html'
s = p.read_text(encoding='utf-8')

EDITS = [
    ('  @keyframes cmpTape{to{transform:translateX(-50%)}}',
     '  @keyframes cmpTape{to{transform:translateX(-50%)}}\n'
     '  /* offer cards: the deal from the price list as a solid sticker, and the sale that is on */\n'
     '  .promo-sticker{display:inline-flex;align-items:center;border-radius:999px;white-space:nowrap;font:700 12px/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:8px 12px;background:#C0182C;color:#fff;box-shadow:0 10px 22px -12px rgba(0,0,0,.55)}\n'
     '  .promo-now{display:flex;align-items:center;gap:9px;font:500 14px/1.4 Inter,"Helvetica Neue",Arial,sans-serif;color:#1B242B}\n'
     '  .promo-now i{width:9px;height:9px;flex-shrink:0;transform:rotate(45deg)}'),
    ('function Promotions() {',
     '/* "On now: Black Friday · ends in 3d 4h" under the offer headings, only while a sale is on */\n'
     'function CampaignNow({ className = \'\' }) {\n'
     '  const cd = useCountdown(CAMPAIGN && CAMPAIGN.until);\n'
     '  if (!CAMPAIGN_LOOK) return null;\n'
     "  const c = CAMPAIGN.tapeColor || ['#C8101D', '#FFFFFF'];\n"
     "  return <p className={`promo-now ${className}`}><i aria-hidden=\"true\" style={{ background: c[0] }} /><span>On now: <b className=\"font-semibold\">{CAMPAIGN.name}</b> · {cd ? `ends in ${cd.text}` : CAMPAIGN.when}</span></p>;\n"
     '}\n'
     'function Promotions() {'),
    ('          <span className="text-ndm-ink">Exclusive monthly</span> <span className="tt-strong text-ndm-deep">specials</span>\n        </h2>\n',
     '          <span className="text-ndm-ink">Exclusive monthly</span> <span className="tt-strong text-ndm-deep">specials</span>\n        </h2>\n'
     '        <CampaignNow className="rv mx-auto mt-3 justify-center px-4" />\n'),
    ("                    <span className={`sw-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] uppercase tracking-[.12em] ${i === 0 ? 'is-feature' : ''}`}>{i === 0 ? 'Featured' : s.tag}</span>",
     "                    {CAMPAIGN_LOOK\n"
     "                      ? <span className=\"truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] font-semibold uppercase tracking-[.12em]\" style={{ background: (CAMPAIGN.tapeColor || ['#C8101D'])[0], color: (CAMPAIGN.tapeColor || ['', '#FFFFFF'])[1] }}>{CAMPAIGN.badge}</span>\n"
     "                      : <span className={`sw-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] uppercase tracking-[.12em] ${i === 0 ? 'is-feature' : ''}`}>{i === 0 ? 'Featured' : s.tag}</span>}"),
    ('                        <span className="sw-muted font-inter text-[11px] uppercase tracking-[.18em]">From</span>',
     '                        {s.deal && <span className="promo-sticker mb-3">{s.deal}</span>}\n'
     '                        <span className="sw-muted font-inter text-[11px] uppercase tracking-[.18em]">From</span>'),
]

if 'function CampaignNow' in s:
    print('already patched index.html')
else:
    for old, new in EDITS:
        assert s.count(old) == 1, ('want 1x', repr(old[:60]), 'got', s.count(old))
        s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')
    print('patched index.html')
