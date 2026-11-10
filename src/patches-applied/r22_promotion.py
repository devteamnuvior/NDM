"""Round 22, promotion.html (the shell; pricing uses the same Before & after):
- Before & after is the home page's section (heading row, row of compare cards, arrows on both sides) instead of the dark one.
- "Apply for financing now" is a plain pill button (offer wheel and All current offers).
usage: python3 src/patches-applied/r22_promotion.py <NDM dir>
"""
import sys
from pathlib import Path

root = Path(sys.argv[1])
f = root / 'promotion.html'
s = f.read_text(encoding='utf-8')
home = (root / 'index.html').read_text(encoding='utf-8')


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


# Before & after: the home page's function replaces the promotion one
start_p = s.index('/* before & after: a dark, pinned section; vertical scrolling slides the row of compare cards sideways */')
end_p = s.index('\n/* ---------------------------------------------------------------- meet the team', start_p)
start_h = home.index('/* before & after (website v3 "Real results"): heading row with the button to the full gallery')
end_h = home.index('\n/* ----', start_h)
s = s[:start_p] + home[start_h:end_h] + s[end_p:]

# its styles (arrows on both sides of the row, edge fades, card widths), copied from the home page
css = []
for line in home.splitlines():
    t = line.strip()
    if t.startswith(('.side-arrow', '@media (max-width:767px){.side-arrow', '.ba-slide', '@media (min-width:1024px){.ba-slide', '.side-rail')):
        css.append('  ' + t)
assert len(css) == 11, len(css)
anchor = '  /* campaign looks: tokens per look'
assert s.count(anchor) == 1
s = s.replace(anchor, '  /* before & after row (round 22, from the home page) */\n' + '\n'.join(css) + '\n' + anchor)

# Apply for financing now: a pill button
rep('''<a href={FEES} className={`font-semibold underline-offset-4 hover:underline ${dark ? 'text-ndm-sky' : 'text-ndm-deep'}`}>Apply for financing now</a>''',
    '''<span className="normal-case tracking-normal"><Btn href={FEES} v={dark ? 'glass' : 'line'} sm>Apply for financing now</Btn></span>''')
rep('''<p className="rv mt-10 text-center font-inter text-[13px] uppercase tracking-[.16em] text-ndm-muted">
        Save on cosmetic treatment <span aria-hidden="true" className="mx-2 inline-block h-px w-8 align-middle bg-ndm-amber" /> <a href={FEES} className="font-semibold text-ndm-deep underline-offset-4 hover:underline">Apply for financing now</a>
      </p>''',
    '''<p className="rv mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center font-inter text-[13px] uppercase tracking-[.16em] text-ndm-muted">
        Save on cosmetic treatment <span aria-hidden="true" className="inline-block h-px w-8 bg-ndm-amber" /> <span className="normal-case tracking-normal"><Btn href={FEES} v="line" sm>Apply for financing now</Btn></span>
      </p>''')
f.write_text(s, encoding='utf-8')
print('patched', f)
