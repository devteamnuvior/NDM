"""Build account.html (round 29): My account after the NUVIOR account sample, fitted to NDM patients (Premium membership instead
of Nuvicoin, health and consent forms instead of B2B verification). Built from promotion.html with src/account-ui.jsx.
usage: python3 src/build_account.py <NDM dir> <src dir>
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from shellpage import make_page

root, src = Path(sys.argv[1]), Path(sys.argv[2])
ui = (src / 'account-ui.jsx').read_text(encoding='utf-8')
css = '''
  /* my account (round 29) */
  .acc-link{display:flex;align-items:center;gap:8px;border-radius:14px;padding:11px 14px;text-align:left;font:500 14.5px/1.3 Inter,"Helvetica Neue",Arial,sans-serif;color:#5A646C;background:#fff;box-shadow:inset 0 0 0 1px rgba(27,36,43,.06);transition:background-color .25s ease,color .25s ease}
  @media (min-width:1024px){.acc-link{background:transparent;box-shadow:none}}
  .acc-link:hover{color:#1B242B;background:#F2F2EF}
  .acc-link.is-on{color:#0F80C3;background:rgba(15,128,195,.08);box-shadow:inset 3px 0 0 #0F80C3}
  .acc-count{margin-left:auto;min-width:22px;height:22px;display:grid;place-items:center;border-radius:99px;background:#0F80C3;color:#fff;font-size:11.5px;font-weight:600}
  .acc-soon{margin-left:auto;border-radius:99px;background:#F2F2EF;padding:3px 8px;font-size:11px;font-weight:600;color:#5A646C}
  .acc-tile{border-radius:22px;background:#fff;padding:18px;box-shadow:inset 0 0 0 1px rgba(27,36,43,.06),0 24px 50px -42px rgba(27,36,43,.45);transition:transform .4s cubic-bezier(.2,.7,.2,1)}
  .acc-tile:hover{transform:translateY(-3px)}
  .acc-status{display:inline-flex;align-items:center;gap:6px;border-radius:99px;padding:5px 11px;font:600 12px/1 Inter,"Helvetica Neue",Arial,sans-serif;white-space:nowrap}
  .acc-status::before{content:"";width:6px;height:6px;border-radius:99px;background:currentColor}
  .acc-status.is-ok{background:rgba(22,163,74,.1);color:#15803D}.acc-status.is-on{background:rgba(15,128,195,.1);color:#0F80C3}.acc-status.is-wait{background:#F2F2EF;color:#5A646C}
  .acc-todo{display:inline-flex;border-radius:6px;background:#FFF6E8;border:1px solid rgba(201,138,43,.35);padding:2px 8px;font:600 12px/1.4 Inter,sans-serif;color:#8A5A12}
  .acc-meter{height:6px;border-radius:99px;background:#F2F2EF;overflow:hidden}.acc-meter i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#26B1E7,#0F80C3)}
  .acc-member,.acc-member-mini{background:radial-gradient(90% 120% at 100% 0%,#26B1E7 0%,rgba(38,177,231,0) 55%),linear-gradient(150deg,#0F80C3,#0A4F7A 60%,#0B2234)!important;color:#fff}
  .acc-member-glow{position:absolute;right:-60px;bottom:-90px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(255,166,23,.4),transparent 65%)}
  .acc-member .acc-status.is-on{background:rgba(255,255,255,.16);color:#fff}
  .acc-switch{position:relative;width:44px;height:26px;flex:none;border-radius:99px;background:#D9DDE0;transition:background-color .25s ease}
  .acc-switch i{position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2);transition:transform .25s ease}
  .acc-switch.is-on{background:#0F80C3}.acc-switch.is-on i{transform:translateX(18px)}
  .acc-switch:disabled{opacity:.6}
  .co-fld{height:46px}
'''
make_page(root, 'account.html', 'My account, NewDermaMed Toronto', 'Your NewDermaMed account: appointments, plans, orders, membership and preferences.', ui, css, 'AccountPage', "['My account']")
