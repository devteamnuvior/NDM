import re
PAT = re.compile(r'className="(rv )?inline-flex items-center gap-2 rounded-full border border-ndm-ink/1[05] bg-white (?:px-4 py-\[7px\] font-inter text-\[14px\] font-medium text-ndm-ink shadow-\[0_8px_20px_-12px_rgba\(27,36,43,\.35\)\]|px-3 py-1\.5 font-inter text-\[12\.5px\] text-ndm-ink)">\n(\s*)<img src="assets/icons/logo-mark.svg" alt="" className="size-4" />')
NEW = r'className="\1eyebrow font-mont">\n\2<span className="eyebrow-mark" aria-hidden="true"><img src="assets/icons/logo-mark.svg" alt="" /></span>'
for p, n in [('index.html', 6), ('promotion.html', 6)]:
    s = open(p).read(); s, k = PAT.subn(NEW, s); print(p, k); assert k == n, k; open(p, 'w').write(s)
