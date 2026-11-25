"""Build 404.html (user, 2026-11-25): the page shown for an address the site does not have, calm and premium, the prototype
copy of the Next.js not-found page. Built from promotion.html with src/notfound-ui.jsx; its styles are the Next.js ones
(web/src/styles/inner.css, from "The 404 page"), read here so both stay the same.
usage: python3 src/build_404.py <NDM dir> <src dir>
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from shellpage import make_page

root, src = Path(sys.argv[1]), Path(sys.argv[2])
ui = (src / 'notfound-ui.jsx').read_text(encoding='utf-8')
inner = (root / 'web/src/styles/inner.css').read_text(encoding='utf-8')
css = inner[inner.index('/* The 404 page (user, 2026-11-25'):]
css += '\n  /* the prototype\'s shell page already clears the header and shows the breadcrumb above */\n  .nf-hero{padding-top:clamp(8px,2vw,28px)}\n  @media (max-width:639px){.nf-hero{padding-top:8px}}\n'
make_page(root, '404.html', 'Page not found | NewDermaMed', 'The page you are looking for may have moved or no longer exists.', ui, css, 'NotFoundPage', "['Page not found']")
