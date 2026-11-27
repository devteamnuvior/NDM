"""Build procedures.html (2026-11-18): the treatments hub, the prototype copy of the Next.js /procedures page. Built from promotion.html with
src/subnav-ui.jsx + src/procedures-ui.jsx and the data snapshot src/procedures-data.json (live WordPress procedures and concerns plus the
hub's words in web/src/config/procedures-hub.ts). usage: python3 src/build_procedures.py <NDM dir> <src dir>"""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from shellpage import make_page

root, src = Path(sys.argv[1]), Path(sys.argv[2])
data = json.loads((src / 'procedures-data.json').read_text(encoding='utf-8'))
css = (root / 'web/src/styles/procedures-hub.css').read_text(encoding='utf-8')
css = css.replace('main[data-page="procedures"]', '[data-page="procedures"]').replace('url("/assets/', 'url("assets/')
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
ui = (src / 'subnav-ui.jsx').read_text(encoding='utf-8') + '\nconst PH = ' + json.dumps(data, ensure_ascii=False) + ';\n' + (src / 'procedures-ui.jsx').read_text(encoding='utf-8')
make_page(root, 'procedures.html', 'Cosmetic & Laser Treatments in Toronto | NewDermaMed',
          'Explore around 50 non-surgical cosmetic and laser treatments at our North York and Downtown Toronto clinics, by treatment or concern. Free consultation.',
          ui, '\n  /* treatments hub */\n' + css, 'ProceduresPage', "['Procedures']", noindex=True)
