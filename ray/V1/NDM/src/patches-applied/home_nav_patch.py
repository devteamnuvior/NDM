"""Add a Home link to the main menu (Raymond, 2026-11-08): first item in the desktop nav and
the mobile drawer, in both shells. Idempotent. Rebuild all generated pages after."""
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SHELLS = ['index.html', 'promotion.html']

NAV_OLD = "const NAV = [\n  { id: 'procedures', label: 'Procedures', menu: 'mega' },"
NAV_NEW = "const NAV = [\n  { id: 'home', label: 'Home', href: 'index.html' },\n  { id: 'procedures', label: 'Procedures', menu: 'mega' },"

HERE_OLD = "const NAV_HERE = { 'pricing.html': 'pricing',"
HERE_NEW = "const NAV_HERE = { 'index.html': 'home', 'pricing.html': 'pricing',"

DRAWER_OLD = '<nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 divide-y divide-ndm-line">\n          <div>'
DRAWER_NEW = ('<nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 divide-y divide-ndm-line">\n'
              "          <a href=\"index.html\" onClick={onClose} {...(NAV_HERE === 'home' ? { 'aria-current': 'page' } : {})} className={`block py-4 font-aeonik text-[22px] ${NAV_HERE === 'home' ? 'nav-is-here' : ''}`}><span className=\"relative\">Home{NAV_HERE === 'home' && <i aria-hidden=\"true\" className=\"nav-here is-left\" />}</span></a>\n"
              '          <div>')

for name in SHELLS:
    p = root / name
    s = p.read_text(encoding='utf-8')
    if "{ id: 'home'" in s:
        print('already patched', name)
        continue
    for old, new in [(NAV_OLD, NAV_NEW), (HERE_OLD, HERE_NEW), (DRAWER_OLD, DRAWER_NEW)]:
        assert s.count(old) == 1, (name, 'want 1x', repr(old[:40]), 'got', s.count(old))
        s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')
    print('patched', name)
print('done')
