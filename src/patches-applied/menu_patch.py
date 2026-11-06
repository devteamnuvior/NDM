"""Site-wide menu changes (2026-11-02): no "View all" links (every item is listed), Our Clinics in the About list,
About items point to sections of about.html. usage: python3 menu_patch.py index.html promotion.html"""
import re
import sys

for path in sys.argv[1:]:
    s = open(path).read()

    def rep(a, b, n=1):
        global s
        c = s.count(a)
        assert c == n, (path, a[:80], c)
        s = s.replace(a, b)

    s, k = re.subn(r'\n          <a href=\{slug\(cat\.label\)\} onClick=\{onLink\} className="shrink-0 font-mont text-\[12\.5px\] text-ndm-blue[^\n]*View all \{count[^\n]*</a>', '', s)
    assert k == 1, (path, 'mega view all')
    s, k = re.subn(r'\n          <a href="#/concerns" onClick=\{onLink\} className="shrink-0 font-mont[^\n]*View all concerns[^\n]*</a>', '', s)
    assert k == 1, (path, 'concerns view all')
    rep("  const count = cat.groups.reduce((a, g) => a + g.items.length, 0);\n", '')
    rep("  links: ['Our Doctors & Team', 'Awards & Recognition', 'Blog', 'Contact Us', 'Policies (Privacy, Terms, Refunds)'],",
        "  links: ['Our Doctors & Team', 'Our Clinics', 'Awards & Recognition', 'Contact Us', 'Blog', 'Policies (Privacy, Terms, Refunds)'],")
    rep("'our-clinics': 'about.html#clinics', blog: 'blog.html'",
        "'our-clinics': 'about.html#clinics', 'doctors-team': 'about.html#team', 'awards-recognition': 'about.html#awards', 'contact-us': 'about.html#contact', blog: 'blog.html'")
    open(path, 'w').write(s)
    print('patched', path)
