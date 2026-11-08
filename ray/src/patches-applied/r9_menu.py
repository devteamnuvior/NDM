# round 9: the desktop Procedures menu no longer lists a treatment twice (Aptos Thread Lift was both the panel
# title and the first link); when the title has its own page, the title itself is the link
import sys
R = [
 ("""            <p className="font-aeonik text-[26px] leading-tight">{cat.label}</p>""",
  """            {slug(cat.label).endsWith('.html')
              ? <a href={slug(cat.label)} onClick={onLink} className="group inline-flex items-center gap-2 font-aeonik text-[26px] leading-tight hover:text-ndm-deep">{cat.label}<IconArrow size={14} className="text-ndm-deep transition-transform group-hover:translate-x-0.5" /></a>
              : <p className="font-aeonik text-[26px] leading-tight">{cat.label}</p>}"""),
 ("""              <ul className={g.items.length > 7 ? 'columns-2 gap-6' : ''} role="list">
                {g.items.map((it) => (""",
  """              <ul className={g.items.length > 7 ? 'columns-2 gap-6' : ''} role="list">
                {g.items.filter((it) => it !== cat.label).map((it) => ("""),
]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b in R:
        c = s.count(a); assert c == 1, (p, a[:60], c)
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
