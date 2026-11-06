# Home page, round 4 (2026-11-06):
#  - Aptos: the "Training centre" chip goes; the stat chip moves to the left and speaks about the 24 months of support
#  - How it works: buttons share one height and hug their label (no fixed widths)
#  - light sections share the paper colour, and the peach glow runs on across the joins (team -> before & after, visit -> FAQ -> booking)
#  - start search: the arrow button turns theme blue
# Already applied, do not run again.
p = 'index.html'
s = open(p, encoding='utf-8').read()
FOOTNOTE = s[s.index('          <p className="rv mt-6 max-w-[56ch] font-inter text-[12.5px] leading-[1.5] text-ndm-muted">*Clinical study: 96%'):]
FOOTNOTE = FOOTNOTE[:FOOTNOTE.index('</p>\n') + 5]
CSS = '''
  /* light sections run into each other: one paper colour, and the peach glow carries over the joins */
  section[aria-labelledby="results"]{background-image:radial-gradient(36% 26% at 4% 0%,rgba(255,206,182,.16),transparent 70%)}
  section[aria-labelledby="visit"]{background-image:radial-gradient(40% 26% at 90% 100%,rgba(255,190,160,.16),transparent 70%)}
  section[aria-labelledby="book"]{background-image:radial-gradient(36% 22% at 4% 0%,rgba(255,206,182,.16),transparent 70%)}
'''
R = [
    ('  .marquee-mask{', CSS + '  .marquee-mask{'),
    ('  .apx-c1{bottom:18%;right:-3%;animation-delay:1.4s}\n  .apx-c2{bottom:-3%;left:24%;animation-delay:2.3s}', '  .apx-c1{bottom:12%;left:-4%;animation-delay:1.4s}'),
    ('.apx-chip{padding:8px 13px;font-size:11px}.apx-c1{right:0}}', '.apx-chip{padding:8px 13px;font-size:11px}.apx-c1{left:0}}'),
    ('          <span className="apx-chip apx-c1"><b className="tabular-nums"><CountUp to={96} run={run} suffix="%" /></b>WSRS improvement at 6 months*</span>\n          <span className="apx-chip apx-c2">Training centre for Aptos techniques</span>',
     '          <span className="apx-chip apx-c1"><b className="tabular-nums">Up to <CountUp to={24} run={run} /></b>months of lift and support</span>'),
    (FOOTNOTE, ''),
    ('<Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v} className="w-full max-w-[300px]">{PROCESS_MEDIA[i].cta}</Btn>', '<Btn href={PROCESS_MEDIA[i].h} v={PROCESS_MEDIA[i].v}>{PROCESS_MEDIA[i].cta}</Btn>'),
    ('<Btn href={m.h} v={m.v} className="w-[280px]">{m.cta}</Btn>', '<Btn href={m.h} v={m.v}>{m.cta}</Btn>'),
    ('<section ref={ref} aria-labelledby="aptos" className="relative z-10 bg-white px-[var(--gx)]', '<section ref={ref} aria-labelledby="aptos" className="relative z-10 bg-ndm-paper px-[var(--gx)]'),
    ('<section ref={ref} aria-labelledby="results" className="relative z-10 bg-white px-[var(--gx)]', '<section ref={ref} aria-labelledby="results" className="relative z-10 bg-ndm-paper px-[var(--gx)]'),
    ('<section ref={ref} aria-labelledby="visit" className="relative z-10 bg-ndm-mist px-[var(--gx)]', '<section ref={ref} aria-labelledby="visit" className="relative z-10 bg-ndm-paper px-[var(--gx)]'),
    ('rounded-full bg-ndm-ink text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true"><IconArrow /></span>',
     'rounded-full bg-ndm-deep text-white transition-[transform,background-color] group-hover:translate-x-0.5 group-hover:bg-[#0A4F7A]" aria-hidden="true"><IconArrow /></span>'),
]
for a, b in R:
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')
