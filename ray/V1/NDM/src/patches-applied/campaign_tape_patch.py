"""The Black Friday preview's tilted, slowly moving tape (src/build_blackfriday.py), reused for every
sale (Raymond, 2026-11-08): when a campaign is active, the same tape crosses the home and promotion
pages between sections, with that sale's own words and colour. Same tilt, type, diamonds and speed
as the Black Friday tape. Applied to both shells; idempotent."""
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')

CSS_ANCHOR = '  .promo-attn .cmp-badge{background:transparent;color:var(--cmp-gold);padding:3px 9px 3px 8px;font-size:9.5px;box-shadow:none}'
CSS_NEW = CSS_ANCHOR + '''
  /* sale tape (same as the Black Friday preview tape): crosses the page at a slight angle, words drift slowly */
  .cmp-band{position:relative;z-index:12;overflow:hidden;background:transparent;padding:clamp(12px,2vw,28px) 0;pointer-events:none}
  .cmp-tape{background:var(--cmp-tape,#C8101D);color:var(--cmp-tape-fg,#fff);transform:rotate(-1.4deg);margin:0 -3vw;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 18px 40px -20px rgba(0,0,0,.9)}
  .cmp-band.is-flip .cmp-tape{transform:rotate(1.2deg)}
  .cmp-tape-track{display:flex;width:max-content;animation:cmpTape 46s linear infinite}
  .cmp-band.is-flip .cmp-tape-track{animation-direction:reverse}
  .cmp-tape ul{display:flex;flex-shrink:0;align-items:center}
  .cmp-tape li{display:flex;align-items:center;gap:22px;padding:13px 0 13px 22px;font:800 clamp(13px,1.25vw,17px)/1 "Helvetica Neue",Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
  .cmp-tape li::after{content:'';width:8px;height:8px;transform:rotate(45deg);background:currentColor;opacity:.9}
  @keyframes cmpTape{to{transform:translateX(-50%)}}
  @media (prefers-reduced-motion:reduce){.cmp-tape-track{animation:none}}'''

# each sale: its tape words (from its own campaign copy) and tape colours [background, text]
TAPES = {
    "{ id: 'vip', name: 'VIP Early Access', look: 'black-friday', when: 'Nov 16 to 26', badge: 'VIP Access',":
        "tape: ['VIP Early Access', 'Black Friday offers open to the list Nov 23', 'Join the VIP list', 'Uptown and Downtown Toronto'], tapeColor: ['#0B0B0C', '#D2B57B'],",
    "{ id: 'black-friday', name: 'Black Friday', look: 'black-friday', when: 'Nov 27 to 30', badge: 'Black Friday',":
        "tape: ['Black Friday at NewDermaMed', 'Nov 27 to 30', 'Uptown and Downtown Toronto', 'Treatment offers Friday to Monday', 'Online finale Monday: skincare and gift cards'], tapeColor: ['#C8101D', '#FFFFFF'],",
    "{ id: 'holiday', name: 'Holiday Gifting', look: 'holiday', when: 'Dec 1 to 25', badge: 'Gift Idea',":
        "tape: ['Holiday Gifting', 'Dec 1 to 25', 'Gift cards with bonus value', 'Delivered instantly by email', 'Uptown and Downtown Toronto'], tapeColor: ['#1F5A41', '#F6F1E6'],",
    "{ id: 'boxing-week', name: 'Boxing Week', look: 'holiday', when: 'Dec 26 to 31', badge: 'Gift Idea',":
        "tape: ['Boxing Week', 'Dec 26 to 31', 'Online only: skincare and gift cards', 'Last call on gift card bonus value', 'January booking now open'], tapeColor: ['#7A1F2B', '#F6F1E6'],",
    "{ id: 'new-year', name: 'New Year Skin Plan', look: 'new-year', when: 'Jan 1 to 31', badge: 'New Year Plan',":
        "tape: ['New Year Skin Plan', 'Jan 1 to 31', 'Free skin analysis with your visit', 'A plan built around your skin', 'Uptown and Downtown Toronto'], tapeColor: ['#3E4852', '#FFFFFF'],",
}

COMP_ANCHOR = 'function CampaignHeroTag({ c }) {'
COMP_NEW = '''/* the sale tape: shows only while a campaign is on (and not on treatment / medical pages) */
function CampaignTape({ flip }) {
  if (!CAMPAIGN_LOOK || !CAMPAIGN.tape) return null;
  const items = [...CAMPAIGN.tape, ...CAMPAIGN.tape];
  const st = CAMPAIGN.tapeColor ? { '--cmp-tape': CAMPAIGN.tapeColor[0], '--cmp-tape-fg': CAMPAIGN.tapeColor[1] } : undefined;
  return (
    <div className={`cmp-band ${flip ? 'is-flip' : ''}`} aria-hidden="true">
      <div className="cmp-tape" style={st}><div className="cmp-tape-track">{[0, 1].map((k) => <ul key={k} role="list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>)}</div></div>
    </div>
  );
}
''' + COMP_ANCHOR

# where the tape crosses each page (home: the same three places as the Black Friday preview)
PLACES = {
    'index.html': [
        ('        <Hero sectionRef={heroRef} onIntroDone={() => setIntroDone(true)} />\n',
         '        <Hero sectionRef={heroRef} onIntroDone={() => setIntroDone(true)} />\n        <CampaignTape />\n'),
        ('        <TreatMenu />\n', '        <CampaignTape flip />\n        <TreatMenu />\n'),
        ('        <Promotions />\n', '        <CampaignTape />\n        <Promotions />\n'),
    ],
    'promotion.html': [
        ('        <Promotions />\n        <PromoGrid />\n', '        <Promotions />\n        <CampaignTape />\n        <PromoGrid />\n        <CampaignTape flip />\n'),
    ],
}

for name in ['index.html', 'promotion.html']:
    p = root / name
    s = p.read_text(encoding='utf-8')
    if 'function CampaignTape' in s:
        print('already patched', name)
        continue
    edits = [(CSS_ANCHOR, CSS_NEW), (COMP_ANCHOR, COMP_NEW)] + [(a, a + ' ' + b) for a, b in TAPES.items()] + PLACES[name]
    for old, new in edits:
        assert s.count(old) == 1, (name, 'want 1x', repr(old[:50]), 'got', s.count(old))
        s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')
    print('patched', name)
