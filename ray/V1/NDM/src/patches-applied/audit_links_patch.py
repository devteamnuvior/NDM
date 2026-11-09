"""Site audit, 8 Nov 2026: dead links and breadcrumbs in both shells (index.html, promotion.html).
- Footer and menu labels with no page fell back to "#/<slug>" links that go nowhere:
  "Skincare Shop" now opens shop.html, "Book Online" opens the booking form (#/book), and "Procedures" /
  "Explore Procedures" open the home treatment menu (index.html#treatments).
- Home treatment menu: the "All injectables / All laser ..." button under each tab is hidden while its
  category page does not exist (its link is still a "#/..." placeholder).
- Breadcrumb: a middle crumb with no page (e.g. "Procedures", "Injectables") was an <a> with no href that
  underlined on hover like a link; it is now plain text. Keys use the position, so a repeated label is safe.
Idempotent: every edit checks whether it is already in place."""
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')

EDITS = {
    'both': [
        ("const PAGE_LINKS = { 'concerns': 'concerns.html',",
         "const PAGE_LINKS = { 'skincare-shop': 'shop.html', 'book-online': '#/book', procedures: 'index.html#treatments', 'concerns': 'concerns.html',"),
        ('<Btn href="#/procedures" v="glass">Explore Procedures</Btn>',
         '<Btn href="index.html#treatments" v="glass">Explore Procedures</Btn>'),
        # payment plans "learn more": the same place as "Apply for financing now" (the price list and payment plans)
        ('Flexible payment plans. Start today, pay later, <a href="#/financing" className="font-medium underline-offset-4 hover:underline"',
         'Flexible payment plans. Start today, pay later, <a href="pricing.html#prices" className="font-medium underline-offset-4 hover:underline"'),
        ("{ k: 'plans', node: <a href=\"#/financing\" className=\"hover:underline\">Payment plans: start today, pa",
         "{ k: 'plans', node: <a href=\"pricing.html#prices\" className=\"hover:underline\">Payment plans: start today, pa"),
        # the skincare shop is a page of this site now (shop.html), not the old shop subdomain: same tab, no "external" arrow
        ("  { id: 'shop', label: 'Skincare shop', href: 'shop.html', ext: true },", "  { id: 'shop', label: 'Skincare shop', href: 'shop.html' },"),
        ('<a href="shop.html" target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:underline">Shop skincare online <IconExternal /></a>',
         '<a href="shop.html" className="inline-flex items-center gap-1 hover:underline">Shop skincare online</a>'),
        ('<a href="shop.html" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-medium hover:underline underline-offset-4">Shop skincare <IconExternal /></a>',
         '<a href="shop.html" className="inline-flex items-center gap-1.5 font-medium hover:underline underline-offset-4">Shop skincare</a>'),
        ('<a href="shop.html" target="_blank" rel="noopener" className="flex items-center gap-2 py-4 font-aeonik text-[22px]">Skincare shop <IconExternal size={16} /></a>',
         '<a href="shop.html" onClick={onClose} className="flex items-center gap-2 py-4 font-aeonik text-[22px]">Skincare shop</a>'),
        # home journal cards: the articles' own photos (already in assets) instead of the old Framer prototype's CDN
        ("img: 'https://framerusercontent.com/images/ds9SwQ920y1cwOE01qALF129VI.jpg?scale-down-to=1024'", "img: 'assets/live/main/uploads/2025/11/1-What-Causes-Rosacea-Redness.webp'"),
        ("img: 'https://framerusercontent.com/images/yQ5s6EDabiPjifaCC5JSRGEy24.jpg?scale-down-to=512'", "img: 'assets/live/main/uploads/2025/11/2-Your-Complete-Guide-to-Laser-Hair-Removal.webp'"),
        ("img: 'https://framerusercontent.com/images/pmbu8ybv1LJ7ypjy7VNsCqO2ouQ.jpg?scale-down-to=512'", "img: 'assets/live/main/uploads/2025/11/6-What-is-Microdermabrasion.webp'"),
        ("img: 'https://framerusercontent.com/images/3BY9JF7AVX8rFYwrCs7NxJm584.jpg?scale-down-to=512'", "img: 'assets/live/main/uploads/2025/11/10-Chemical-Peel-Treatment-Toronto.webp'"),
    ],
    'index.html': [
        ('      <div className="px-[var(--gx)]"><Btn href={c.all[0]} v="line" sm>{c.all[1]}</Btn></div>\n',
         "      {!c.all[0].startsWith('#/') && <div className=\"px-[var(--gx)]\"><Btn href={c.all[0]} v=\"line\" sm>{c.all[1]}</Btn></div>}\n"),
    ],
    'promotion.html': [
        ("            <Fragment key={label}>\n"
         "              <li aria-hidden=\"true\" className={dark ? 'text-white/35' : 'text-ndm-ink/30'}>/</li>\n"
         "              <li>{last ? <span aria-current=\"page\" className={dark ? 'text-white' : 'text-ndm-ink'}>{label}</span> : <a href={href} className={link}>{label}</a>}</li>",
         "            <Fragment key={i}>\n"
         "              <li aria-hidden=\"true\" className={dark ? 'text-white/35' : 'text-ndm-ink/30'}>/</li>\n"
         "              <li>{last ? <span aria-current=\"page\" className={dark ? 'text-white' : 'text-ndm-ink'}>{label}</span> : href ? <a href={href} className={link}>{label}</a> : <span className={dark ? 'text-white/65' : 'text-ndm-muted'}>{label}</span>}</li>"),
    ],
}

for name in ('index.html', 'promotion.html'):
    p = root / name
    s = p.read_text(encoding='utf-8')
    done = 0
    for old, new in EDITS['both'] + EDITS[name]:
        if new in s:
            continue
        assert s.count(old) == 1, (name, 'want 1x', old[:70], 'got', s.count(old))
        s = s.replace(old, new)
        done += 1
    p.write_text(s, encoding='utf-8')
    print(f'{name}: {done} edits applied')
