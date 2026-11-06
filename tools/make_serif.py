"""Build index-fraunces.html from index.html: the same page set in DermaHub's type
(Fraunces for display headings, Manrope for text). Re-run after every index.html change.

usage: python3 make_serif.py <ndm-homepage dir>
"""
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
s = (root / 'index.html').read_text()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:80], c)
    s = s.replace(a, b)


# 1. fonts: DermaHub's exact Google Fonts request, plus the Montserrat weights this page uses
rep('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..700&family=Montserrat:wght@300..700&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Manrope:wght@300..800&family=Montserrat:wght@300..700&display=swap">')

# 2. drop the embedded Aeonik file (about 136 KB), nothing uses it in this version
s, k = re.subn(r"<!--FONT-EMBED-->\n<style>@font-face\{font-family:'Aeonik';[^\n]*</style>\n", '<!--FONT-EMBED: none, Fraunces + Manrope from Google Fonts-->\n', s)
assert k == 1, k

# 3. tailwind roles: font-aeonik (display) -> Fraunces, font-inter (text/UI) -> Manrope
rep("aeonik: ['Aeonik', 'Inter', 'system-ui', 'sans-serif'],", "aeonik: ['Fraunces', 'Georgia', '\"Times New Roman\"', 'serif'],")
rep("inter: ['Inter', 'system-ui', 'sans-serif'],", "inter: ['Manrope', '\"Helvetica Neue\"', 'Arial', 'sans-serif'],")

# 4. plain CSS that names Inter directly
rep('font-family:Inter,system-ui,sans-serif;', 'font-family:Manrope,"Helvetica Neue",Arial,sans-serif;')
rep('font:500 15px/1 Inter,system-ui,sans-serif;', 'font:500 15px/1 Manrope,"Helvetica Neue",Arial,sans-serif;')

# 5. DermaHub-style details: optical sizing, a slightly looser tracking for the serif,
#    and the emphasised half of each two-tone heading set in light italic
extra = r'''
  /* DermaHub type: Fraunces display + Manrope text */
  .font-aeonik{font-optical-sizing:auto}
  .font-aeonik.tracking-\[-0\.04em\],.font-aeonik.tracking-\[-0\.035em\],.font-aeonik.tracking-\[-0\.03em\]{letter-spacing:-0.025em}
  .tt-strong{font-style:italic;font-weight:350}
'''
i = s.index('</style>', s.index('<!--FONT-EMBED'))
s = s[:i] + extra + s[i:]

# 6. the logo links back to this version
rep('href="index.html"', 'href="index-fraunces.html"')

(root / 'index-fraunces.html').write_text(s)
print('wrote', root / 'index-fraunces.html', len(s), 'bytes')
