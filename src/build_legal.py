"""Build privacy.html (round 29): the Privacy Policy after the NUVIOR legal sample, in the NDM look. Built from promotion.html with
src/legal-ui.jsx. usage: python3 src/build_legal.py <NDM dir> <src dir>"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from shellpage import make_page

root, src = Path(sys.argv[1]), Path(sys.argv[2])
ui = (src / 'legal-ui.jsx').read_text(encoding='utf-8')
css = '''
  /* legal pages (round 29) */
  .lg-k{font:600 11.5px/1 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8A949B;margin-bottom:12px}
  .lg-doc{display:block;border-radius:12px;padding:10px 14px;font:500 14.5px/1.3 Inter,sans-serif;color:#5A646C;transition:background-color .2s ease,color .2s ease}
  .lg-doc:hover{background:#F2F2EF;color:#1B242B}
  .lg-doc[aria-current]{background:rgba(15,128,195,.08);color:#0F80C3;font-weight:600;box-shadow:inset 3px 0 0 #0F80C3}
  .lg-toc{border-left:1px solid #E3E5E7}
  .lg-toc a{display:block;margin-left:-1px;border-left:2px solid transparent;padding:6px 0 6px 15px;font:13.5px/1.4 Inter,sans-serif;color:#8A949B;transition:color .2s ease,border-color .2s ease}
  .lg-toc a:hover{color:#0F80C3}
  .lg-toc a.is-on{color:#0F80C3;border-left-color:#0F80C3;font-weight:600}
  .lg-print{border-radius:99px;border:1px solid #E3E5E7;padding:9px 16px;font:600 13px/1 Inter,sans-serif;color:#5A646C;transition:border-color .2s ease,color .2s ease}
  .lg-print:hover{border-color:#0F80C3;color:#0F80C3}
  .lg-doc-body{counter-reset:sec}
  .lg-meta{margin-top:14px;padding-bottom:22px;border-bottom:1px solid #E3E5E7;font:13px/1.5 Inter,sans-serif;color:#8A949B}
  .lg-doc-body p,.lg-doc-body li{font:15.5px/1.75 Inter,sans-serif;color:#4A545C}
  .lg-doc-body p{margin-top:15px}
  .lg-doc-body p.lg-lede{font-size:18px;color:#1B242B;margin-top:24px}
  .lg-doc-body h2{counter-increment:sec;margin-top:46px;scroll-margin-top:160px;font-family:Fraunces,serif;font-weight:400;font-size:26px;letter-spacing:-.02em;color:#1B242B}
  .lg-doc-body h2::before{content:counter(sec) ". ";color:#0F80C3}
  .lg-doc-body h2.no-num{counter-increment:none}.lg-doc-body h2.no-num::before{content:none}
  .lg-doc-body h3{margin-top:30px;font:600 17px/1.3 Inter,sans-serif;color:#1B242B}
  .lg-doc-body b{color:#1B242B;font-weight:600}
  .lg-doc-body a{color:#0F80C3;font-weight:500}
  .lg-doc-body ul{margin-top:14px;display:grid;gap:9px}
  .lg-doc-body ul>li{position:relative;padding-left:20px}
  .lg-doc-body ul>li::before{content:"";position:absolute;left:2px;top:12px;width:6px;height:6px;border-radius:50%;background:#0F80C3;opacity:.55}
  .lg-alpha,.lg-roman{margin-top:14px;display:grid;gap:9px}
  .lg-alpha{counter-reset:lg}.lg-alpha>li{counter-increment:lg;position:relative;padding-left:36px}
  .lg-alpha>li::before{content:"(" counter(lg,lower-alpha) ")";position:absolute;left:0;font-weight:600;color:#0A4F7A}
  .lg-roman{counter-reset:lr;margin-top:9px}.lg-roman>li{counter-increment:lr;position:relative;padding-left:36px}
  .lg-roman>li::before{content:"(" counter(lr,lower-roman) ")";position:absolute;left:0;font-weight:600;color:#0A4F7A}
  .lg-callout{margin-top:16px;border-radius:16px;background:rgba(15,128,195,.06);border:1px solid rgba(15,128,195,.18);padding:4px 22px 18px}
  .lg-callout p{color:#0A4F7A}
  .lg-card{margin-top:22px;border-radius:18px;background:#fff;padding:22px 24px;box-shadow:inset 0 0 0 1px rgba(27,36,43,.07)}
  .lg-card h4{font:600 16px/1.3 Inter,sans-serif;color:#1B242B}
  .lg-todo{display:inline-flex;border-radius:6px;background:#FFF6E8;border:1px solid rgba(201,138,43,.35);padding:2px 8px;font:600 12.5px/1.4 Inter,sans-serif;color:#8A5A12}
  @media print{header,footer,.lg-side,.crumbs,#bf-dock-root,.chat-btn{display:none!important}.lg-doc-body{max-width:none}}
'''
make_page(root, 'privacy.html', 'Privacy Policy, NewDermaMed Toronto', 'How NewDermaMed collects, uses and discloses personal information, including personal health information.', ui, css, 'LegalPage', "['Legal', 'Privacy Policy']", noindex=False)
