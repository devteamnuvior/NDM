# Header (site-wide, 2026-11-06): between 1280 and 1535px the bar ran out of room and squeezed the logo (made worse for a
# moment by lines between the menu items, since removed). In that range only: menu items 15px with 8px side padding, no gap between items, logo 34px high,
# grid gap 12px. 1536px and up keep the original sizes. Already applied, do not run again.
R = [
    ('className="relative block h-[30px] sm:h-[34px] xl:h-[42px] justify-self-start"', 'className="relative block h-[30px] sm:h-[34px] xl:h-[34px] 2xl:h-[42px] justify-self-start"'),
    ('grid-cols-[auto_1fr_auto] xl:grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--gx)]', 'grid-cols-[auto_1fr_auto] xl:grid-cols-[1fr_auto_1fr] items-center gap-4 xl:gap-3 2xl:gap-4 px-[var(--gx)]'),
    # the logo keeps its proportions if the bar is still a little short of room
    ('<img src="assets/icons/logo-color.svg" alt="" className="h-full w-auto transition-opacity duration-500"', '<img src="assets/icons/logo-color.svg" alt="" className="h-full w-auto object-contain object-left transition-opacity duration-500"'),
    ('<img src="assets/icons/logo-white.svg" alt="" className="absolute left-0 top-0 h-full w-auto transition-opacity duration-500"', '<img src="assets/icons/logo-white.svg" alt="" className="absolute left-0 top-0 h-full w-auto object-contain object-left transition-opacity duration-500"'),
    ('<ul className="flex items-center gap-1 2xl:gap-3" role="list">', '<ul className="flex items-center gap-0 2xl:gap-2" role="list">'),
]
R2 = ('rounded-full px-3 py-2.5 font-inter text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4',
      'rounded-full px-2 py-2.5 font-inter text-[15px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 2xl:text-[16px]')
for p in ['index.html', 'promotion.html']:
    s = open(p, encoding='utf-8').read()
    for a, b in R:
        assert s.count(a) == 1, (p, a[:60]); s = s.replace(a, b)
    assert s.count(R2[0]) == 2, p; s = s.replace(*R2)
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')
