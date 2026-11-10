"""Round 23, both shells (index.html, promotion.html):
- the About menu (desktop panel and phone menu) opens with a Black Friday Sale card linking to black-friday-sale.html: black card,
  a spinning red border, a pulsing dot, a shine across the title and a live "starts in / ends in" countdown.
- the Campaign looks switcher is no longer shown (Black Friday keeps its own page).
usage: python3 src/patches-applied/r23_bf_menu.py <NDM dir>
"""
import sys
from pathlib import Path

CARD = r'''
/* ---------------------------------------------------------------- Black Friday sale link (round 23): the eye-catching card at the top
   of the About menu (desktop panel and phone menu), linking to the landing page black-friday-sale.html */
function BfMenuCard({ onLink, m = false }) {
  const end = CAMPAIGNS.find((c) => c.id === 'black-friday'), start = CAMPAIGNS.find((c) => c.id === 'vip');
  const toStart = useCountdown(start && start.until), toEnd = useCountdown(end && end.until);
  const cd = toStart || toEnd;
  return (
    <a href="black-friday-sale.html" onClick={onLink} className={`bf-mc group ${m ? 'is-m' : ''}`}>
      <span className="bf-mc-in">
        <span className="bf-mc-tag"><i aria-hidden="true" />Black Friday · {end ? end.when : 'Nov 27 to 30'}</span>
        <span className="bf-mc-t font-aeonik">Black Friday Sale</span>
        <span className="bf-mc-row">
          <span>{cd ? <>{toStart ? 'Starts in' : 'Ends in'} <b className="tabular-nums">{cd.d}d {cd.h}h {cd.m}m</b></> : 'Build your plan and save'}</span>
          <span className="bf-mc-go" aria-hidden="true"><IconArrow size={12} /></span>
        </span>
      </span>
    </a>
  );
}
'''
CSS = '''
  /* Black Friday sale card in the About menu (round 23): spinning red border, pulsing dot, shine across the title */
  .bf-mc{position:relative;display:block;isolation:isolate;overflow:hidden;border-radius:20px;padding:2px;box-shadow:0 22px 44px -24px rgba(211,18,29,.7);transition:transform .4s cubic-bezier(.2,.7,.2,1),box-shadow .4s ease}
  .bf-mc::before{content:"";position:absolute;inset:-80%;z-index:-1;background:conic-gradient(from 0deg,#D3121F,#0B0B0C 28%,#FF4B55 52%,#0B0B0C 78%,#D3121F);animation:bfMcSpin 3.6s linear infinite}
  .bf-mc:hover{transform:translateY(-2px);box-shadow:0 28px 54px -24px rgba(211,18,29,.85)}
  .bf-mc-in{display:block;border-radius:18px;padding:16px 18px;color:#fff;background:radial-gradient(80% 90% at 100% 0%,rgba(211,18,29,.45),transparent 60%),#0B0B0C}
  .bf-mc-tag{display:inline-flex;align-items:center;gap:7px;font:600 11px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#FF9AA0}
  .bf-mc-tag i{width:7px;height:7px;border-radius:9px;background:#FF4B55;box-shadow:0 0 0 0 rgba(255,75,85,.7);animation:bfMcPulse 1.8s ease-out infinite}
  .bf-mc-t{display:block;margin-top:10px;font-size:27px;line-height:1.05;letter-spacing:-.02em;color:transparent;background:linear-gradient(100deg,#fff 0%,#fff 38%,#FF6B73 50%,#fff 62%,#fff 100%);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;animation:bfMcShine 3.4s linear infinite}
  .bf-mc-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;font:13px/1.3 Inter,"Helvetica Neue",Arial,sans-serif;color:rgba(255,255,255,.72)}
  .bf-mc-row b{color:#fff;font-weight:600}
  .bf-mc-go{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:99px;background:#D3121F;color:#fff;transition:transform .4s cubic-bezier(.2,.7,.2,1)}
  .bf-mc:hover .bf-mc-go{transform:rotate(-45deg)}
  .bf-mc.is-m{margin:4px 0 10px}
  @keyframes bfMcSpin{to{transform:rotate(360deg)}}
  @keyframes bfMcShine{from{background-position:130% 0}to{background-position:-130% 0}}
  @keyframes bfMcPulse{70%{box-shadow:0 0 0 8px rgba(255,75,85,0)}100%{box-shadow:0 0 0 0 rgba(255,75,85,0)}}
  @media (prefers-reduced-motion:reduce){.bf-mc::before,.bf-mc-t,.bf-mc-tag i{animation:none}}
'''

for name in ['index.html', 'promotion.html']:
    f = Path(sys.argv[1]) / name
    s = f.read_text(encoding='utf-8')

    def rep(a, b):
        global s
        c = s.count(a)
        assert c == 1, (name, a[:80], c)
        s = s.replace(a, b)

    rep('''        <ul className="px-3 py-1" role="list">
          {ABOUT.links.map((l) => (''', '''        <div className="flex min-w-0 flex-col gap-2">
        <BfMenuCard onLink={onLink} />
        <ul className="px-3 py-1" role="list">
          {ABOUT.links.map((l) => (''')
    rep('''          ))}
        </ul>
      </div>
    </div>
  );
}
''', '''          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}
''' + CARD)
    rep('''              <ul className="pb-4 space-y-1" role="list">
                {ABOUT.clinics.map((c) =>''', '''              <ul className="pb-4 space-y-1" role="list">
                <li><BfMenuCard onLink={onClose} m /></li>
                {ABOUT.clinics.map((c) =>''')
    rep("(() => { const d = document.createElement('div'); d.id = 'campaign-root'; document.body.appendChild(d); ReactDOM.createRoot(d).render(<CampaignSwitch />); })();",
        "/* the Campaign looks switcher is hidden (round 23); Black Friday has its own page, black-friday-sale.html */")
    anchor = '  /* submenu items: a thin line under each item'
    if s.count(anchor) != 1:
        anchor = '  .mark-16{'
    assert s.count(anchor) == 1, (name, 'css anchor')
    s = s.replace(anchor, CSS.lstrip('\n') + anchor)
    f.write_text(s, encoding='utf-8')
    print('patched', name)
