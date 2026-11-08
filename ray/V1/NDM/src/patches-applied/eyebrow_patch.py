"""Site-wide (2026-11-03): section tags (Eyebrow and its inline copies) more visible: solid white, 14px medium text,
a firmer border and a soft shadow; on dark bands a brighter frosted pill. Already applied to index.html and promotion.html."""
import sys
PAIRS = [
    ("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-inter text-[13px] ${dark ? 'border-white/15 bg-white/[.07] text-white' : 'border-ndm-ink/10 bg-white/70 text-ndm-ink'}",
     "inline-flex items-center gap-2 rounded-full border px-4 py-[7px] font-inter text-[14px] font-medium ${dark ? 'border-white/30 bg-white/[.14] text-white backdrop-blur-[6px]' : 'border-ndm-ink/15 bg-white text-ndm-ink shadow-[0_8px_20px_-12px_rgba(27,36,43,.35)]'}", 1),
    ("rounded-full border border-ndm-ink/10 bg-white/70 px-3.5 py-1.5 font-inter text-[13px] text-ndm-ink",
     "rounded-full border border-ndm-ink/15 bg-white px-4 py-[7px] font-inter text-[14px] font-medium text-ndm-ink shadow-[0_8px_20px_-12px_rgba(27,36,43,.35)]", 4),
]
for f in sys.argv[1:]:
    s = open(f).read()
    for a, b, n in PAIRS:
        assert s.count(a) == n, (f, a[:40], s.count(a))
        s = s.replace(a, b)
    open(f, 'w').write(s)
    print('patched', f)
