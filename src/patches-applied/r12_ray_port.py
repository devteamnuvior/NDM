"""round 12 (branch pouria): bring pieces of Ray's newest version (NDM-Ray-Dev/ray/V1/NDM) into both shells:
- the booking form "Book a free consultation in a few short steps": category picker, VISIA switch, details, book or call,
  then a calendar or a call time (BookForm, BookPicker, Appointment; also used, compact, as the treatment pages' hero form)
- the pop-up's title and amber tag
- Home as the first menu item (desktop and drawer), from Ray's home_nav_patch.py
- the full Before & after gallery is now before-after.html
- CSS: the form's badge, tabs and options, compact steps, and no peach light on the (warm-graded) clinic photos
usage: python3 r12_ray_port.py <ray V1/NDM/index.html> <shell.html> [...]"""
import sys
ray = open(sys.argv[1], encoding='utf-8').read()
a = ray.index('const BOOK_INTEREST_GROUPS = [')
b = ray.index('\n}\n', ray.index('function Appointment() {', a)) + 3
RAY_BOOK = ray[a:b]
CSS = '''  /* booking form (Ray, round 12): badge, category tabs and options; compact form and phones show only the open step */
  .book-badge{background:linear-gradient(90deg,rgba(255,166,23,.18),rgba(255,166,23,.08));border:1px solid rgba(255,166,23,.35)}
  .book-badge-dot{box-shadow:0 6px 14px -6px rgba(255,166,23,.9)}
  .book-tab{position:relative}
  .book-tab-has::after{content:"";position:absolute;right:6px;top:6px;width:6px;height:6px;border-radius:999px;background:#FFA617}
  .book-opt{box-shadow:0 1px 0 rgba(27,36,43,.03)}
  @media (max-width:639px){.book-step.is-off{display:none}}
  .book-compact .book-step.is-off{display:none}
  /* office photos are graded warm in the image files; no peach light on top, it turned white rooms pink */
  .about-bob::after,.visit-card .rv-clip::after{content:none}
  .eyebrow.is-amber{color:#6E4410;background:linear-gradient(180deg,#FFB942,#FFA617) padding-box,linear-gradient(115deg,rgba(255,166,23,.95),rgba(224,138,0,.55)) border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 12px 26px -16px rgba(255,166,23,.8)}
  .eyebrow.is-amber .eyebrow-mark{background:radial-gradient(circle at 32% 28%,#fff,#FFE3AC 75%);box-shadow:inset 0 0 0 1px rgba(255,166,23,.35),0 4px 10px -6px rgba(224,138,0,.8)}
  .eyebrow.is-amber::after{background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.3) 50%,transparent 65%)}
'''
R = [
 ("const NAV = [\n  { id: 'procedures', label: 'Procedures', menu: 'mega' },",
  "const NAV = [\n  { id: 'home', label: 'Home', href: 'index.html' },\n  { id: 'procedures', label: 'Procedures', menu: 'mega' },"),
 ("const NAV_HERE = { 'pricing.html': 'pricing',", "const NAV_HERE = { 'index.html': 'home', 'pricing.html': 'pricing',"),
 ('<nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 divide-y divide-ndm-line">\n          <div>',
  '<nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 divide-y divide-ndm-line">\n'
  "          <a href=\"index.html\" onClick={onClose} {...(NAV_HERE === 'home' ? { 'aria-current': 'page' } : {})} className={`block py-4 font-aeonik text-[22px] ${NAV_HERE === 'home' ? 'nav-is-here' : ''}`}><span className=\"relative\">Home{NAV_HERE === 'home' && <i aria-hidden=\"true\" className=\"nav-here is-left\" />}</span></a>\n"
  '          <div>'),
 ("const BA_ALL = 'https://newdermamedlaserclinic.com/before-after/';", "const BA_ALL = 'before-after.html';"),
 ('lead={<>Book a free consultation<br /></>} strong="in three short steps" />', 'lead={<>Book a free consultation<br /></>} strong="in a few short steps" />'),
 ('  /* campaign looks: tokens per look', CSS + '  /* campaign looks: tokens per look'),
]
for p in sys.argv[2:]:
    s = open(p, encoding='utf-8').read()
    a = s.index('const BOOK_INTERESTS = [')
    b = s.index('\n}\n', s.index('function Appointment() {', a)) + 3
    s = s[:a] + RAY_BOOK + s[b:]
    a = s.index('function BookPopup()'); b = s.index('\n}\n', a)
    assert s[a:b].count('<p className="eyebrow font-mont">') == 1, p
    s = s[:a] + s[a:b].replace('<p className="eyebrow font-mont">', '<p className="eyebrow is-amber font-mont">') + s[b:]
    for x, y in R:
        c = s.count(x)
        assert c == 1, (p, x[:60], c)
        s = s.replace(x, y)
    open(p, 'w', encoding='utf-8').write(s)
    print('ok', p)
