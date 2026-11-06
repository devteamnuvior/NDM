# round 9: less space above How it works; shorter clinic photos in Our Toronto clinics
import sys
R = [
 ('aria-labelledby="process" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(72px,9vw,120px)]"',
  'aria-labelledby="process" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(72px,9vw,120px)] pt-[clamp(16px,2vw,32px)]"', 1),
 ('relative isolate aspect-[16/10] overflow-hidden rounded-[20px] bg-ndm-mist md:aspect-[2/1] lg:aspect-[16/10]',
  'relative isolate aspect-[16/9] overflow-hidden rounded-[20px] bg-ndm-mist md:aspect-[5/2] lg:aspect-[12/5]', 1),
 ('aria-labelledby="visit" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]"',
  'aria-labelledby="visit" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]"', 1),
 ('aria-labelledby="results" className="relative z-10 bg-ndm-paper py-[clamp(80px,9vw,140px)]"',
  'aria-labelledby="results" className="relative z-10 bg-ndm-paper pb-[clamp(40px,4vw,64px)] pt-[clamp(80px,9vw,140px)]"', 1),
]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b, n in R:
        c = s.count(a)
        if c == 0: print('skip', p, a[:50]); continue
        assert c == n, (p, a[:50], c)
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
