"""Round 22: the 16 years mark on the testimonials' Patient care card is a plain gold image (assets/icons/16-years-gold.svg)
instead of a CSS mask, which some browsers block (for example pages opened straight from the folder). Both shells.
usage: python3 src/patches-applied/r22_mark16.py <NDM dir>
"""
import re
import sys
from pathlib import Path

for name in ['index.html', 'promotion.html']:
    f = Path(sys.argv[1]) / name
    s = f.read_text(encoding='utf-8')
    a = '<span role="img" aria-label="NewDermaMed, 16 years" className="mark-16 mb-5 text-[#8A5A12]" />'
    assert s.count(a) == 1, name
    s = s.replace(a, '<img src="assets/icons/16-years-gold.svg" alt="NewDermaMed, 16 years" width="84" height="84" draggable="false" className="mark-16 mb-5" />')
    s, n = re.subn(r'\.mark-16\{display:block;width:84px;height:84px;background:currentColor;[^}]*\}', '.mark-16{display:block;width:84px;height:84px;object-fit:contain}', s)
    assert n == 1, name
    f.write_text(s, encoding='utf-8')
    print('patched', name)
