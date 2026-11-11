"""Keep "off" on the same line as the number or percent before it ("30% off", "$100 off"): the space between them becomes a
no-break space (U+00A0). Safe to run again. usage: python3 src/nbsp_off.py <file> [<file> ...]"""
import re
import sys
from pathlib import Path

PAT = re.compile(r'(\d%?|%) (off\b)', re.I)
for f in sys.argv[1:]:
    p = Path(f)
    s = p.read_text(encoding='utf-8')
    t = PAT.sub('\\1\u00a0\\2', s)
    if t != s:
        p.write_text(t, encoding='utf-8')
