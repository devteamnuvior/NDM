"""Concern pages and the bio-stimulator group (Raymond, 7 November 2026). Applied to index.html and promotion.html (the shell);
rebuild every generated page afterwards. Safe to run twice (each change checks for its own marker).

- CONCERN_LINKS + cslug(): the Concerns mega menu, the phone drawer and the search open the 22 concern pages
  (concern-<slug>.html, built by src/build_concerns.py); the menu title and the drawer link to the hub (concerns.html).
- NAV_HERE marks "Concerns" on the hub and the concern pages; they keep their look under a campaign (CAMPAIGN_SKIP).
- Procedures menu: a "Bio-stimulators" group (Aptos Thread Lift, Sculptra®, Radiesse®); Sculptra® and Radiesse® leave Injectables.
- Home only: the Start chips' "Compare" links open the concern pages; the treatment menu gets a Bio-stimulators tab.
usage: python3 src/patches-applied/concerns_patch.py <NDM dir>"""
import json, re, sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
BUILT = json.load(open(ROOT / 'src/live/concerns-built.json', encoding='utf-8'))
LINKS = {c['name']: c['file'] for c in BUILT}
FILES = ['concerns.html'] + [c['file'] for c in BUILT]
MARK = 'const CONCERN_LINKS = '


def patch(path, home=False):
    s = path.read_text(encoding='utf-8')
    n = 0

    def rep(old, new, count=1, scope=None):
        nonlocal s, n
        if scope:
            a = s.index(scope[0]); b = s.index(scope[1], a)
            seg = s[a:b]
            assert seg.count(old) == count, (path.name, old[:60], seg.count(old))
            s = s[:a] + seg.replace(old, new) + s[b:]
        else:
            assert s.count(old) == count, (path.name, old[:60], s.count(old))
            s = s.replace(old, new)
        n += 1

    if MARK not in s:
        anchor = "const slug = (s) => { const k = s.toLowerCase().replace(/[®™]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); return PAGE_LINKS[k] || '#/' + k; };"
        rep(anchor, anchor + "\n/* concern pages (built by src/build_concerns.py): the Concerns menu, drawer and search open them by their menu label */\n" + MARK + json.dumps(LINKS, ensure_ascii=False) + ";\nconst cslug = (s) => CONCERN_LINKS[s] || slug(s);")
        # the Concerns mega menu: title links to the hub, items open the concern pages
        rep('<a href={slug(it)} {...here(slug(it))} onClick={onLink} className="menu-item group font-mont">', '<a href={cslug(it)} {...here(cslug(it))} onClick={onLink} className="menu-item group font-mont">', scope=('function ConcernsMenu(', 'function Header('))
        rep('<p className="font-aeonik text-[26px] leading-tight">Concerns</p>', '<a href="concerns.html" onClick={onLink} className="group inline-flex items-center gap-2 font-aeonik text-[26px] leading-tight hover:text-ndm-deep">Concerns<IconArrow size={14} className="text-ndm-deep transition-transform group-hover:translate-x-0.5" /></a>', scope=('function ConcernsMenu(', 'function Header('))
        # the phone drawer
        rep("<Row onClick={() => setSec(sec === 'c' ? null : 'c')} expanded={sec === 'c'}>Concerns</Row>", "<Row onClick={() => setSec(sec === 'c' ? null : 'c')} expanded={sec === 'c'} on={NAV_HERE === 'concerns'}>Concerns</Row>")
        rep('<div className="pb-4 space-y-3">\n                {CONCERNS.map((g) => (', '<div className="pb-4 space-y-3">\n                <a href="concerns.html" onClick={onClose} className="menu-item-m font-mont"><span className="min-w-0">All concerns</span><IconArrow size={11} className="shrink-0 text-ndm-blue" /></a>\n                {CONCERNS.map((g) => (')
        rep('{g.items.map((it) => <a key={it} href={slug(it)} {...here(slug(it))} onClick={onClose} className="menu-item-m font-mont">', '{g.items.map((it) => <a key={it} href={cslug(it)} {...here(cslug(it))} onClick={onClose} className="menu-item-m font-mont">', scope=("<Row onClick={() => setSec(sec === 'c' ? null : 'c')}", "<a href={slug('Pricing')}"))
        # search hits
        rep('<li key={h.name}><a href={slug(h.name)} onClick={onClose}', "<li key={h.name}><a href={h.cat === 'Concern' ? cslug(h.name) : slug(h.name)} onClick={onClose}")
        # the open page: "Concerns" highlighted in the header, and no campaign look on these pages
        rep("}[HERE];", "}[HERE] || (HERE === 'concerns.html' || HERE.startsWith('concern-') ? 'concerns' : undefined);")
        m = re.search(r"const CAMPAIGN_SKIP = \[(.*?)\];", s)
        assert m
        s = s[:m.start(1)] + m.group(1) + ', ' + ', '.join("'" + f + "'" for f in FILES) + s[m.end(1):]; n += 1

    # the footer's "Concerns" quick link (slug('Concerns')) opens the hub
    if "'concerns': 'concerns.html'" not in s:
        rep("const PAGE_LINKS = { 'aptos-thread-lift': 'aptos-thread-lift.html',", "const PAGE_LINKS = { 'concerns': 'concerns.html', 'aptos-thread-lift': 'aptos-thread-lift.html',")

    # the Procedures menu: Bio-stimulators as their own group
    if "id: 'bio', label: 'Bio-stimulators'" not in s:
        rep("groups: [{ items: ['Botox®', 'Juvederm®', 'Dermal Fillers', 'Belkyra® / Kybella® (Double Chin)', 'Lip Augmentation', 'Tear Trough Correction', 'Soft Lift™', 'Radiesse®', 'Sculptra®', 'Mesotherapy & Skin Boosters'] }] },",
            "groups: [{ items: ['Botox®', 'Juvederm®', 'Dermal Fillers', 'Belkyra® / Kybella® (Double Chin)', 'Lip Augmentation', 'Tear Trough Correction', 'Soft Lift™', 'Mesotherapy & Skin Boosters'] }] },\n"
            "  { id: 'bio', label: 'Bio-stimulators', blurb: 'Treatments that prompt your own collagen for gradual, long-lasting support: Aptos threads, Sculptra® and Radiesse®.',\n"
            "    groups: [{ items: ['Aptos Thread Lift', 'Sculptra®', 'Radiesse®'] }] },")
        rep("{ id: 'injectables', label: 'Injectables', blurb: 'Neuromodulators, fillers and biostimulators, dosed conservatively for a natural-looking finish.',",
            "{ id: 'injectables', label: 'Injectables', blurb: 'Neuromodulators, fillers and skin boosters, dosed conservatively for a natural-looking finish.',")

    if home:
        # the Start chips: "Compare" opens the concern page
        MORE = {'#/wrinkles': 'concern-wrinkles-fine-lines.html', '#/volume-loss': 'concern-volume-loss.html', '#/sagging-skin': 'concern-sagging-skin-jowls.html', '#/under-eye-hollows': 'concern-under-eye-hollows-dark-circles.html',
                '#/double-chin': 'concern-double-chin.html', '#/acne': 'concern-acne-breakouts.html', '#/acne-scars': 'concern-acne-scars.html', '#/pigmentation': 'concern-hyperpigmentation-sun-spots.html',
                '#/rosacea-redness': 'concern-rosacea-redness.html', '#/texture-pores': 'concern-uneven-texture-pores.html', '#/stubborn-fat': 'concern-stubborn-fat.html', '#/spider-veins': 'concern-spider-varicose-veins.html',
                '#/varicose-veins': 'concern-spider-varicose-veins.html', '#/hair-loss': 'concern-hair-loss.html'}
        for k, v in MORE.items():
            old = '"more": ["' + k + '", '
            if old in s: s = s.replace(old, '"more": ["' + v + '", '); n += 1
        old = '"more": ["melasma.html", "Compare these options"]'
        if old in s: s = s.replace(old, '"more": ["concern-melasma.html", "Compare these options"]'); n += 1
        old = '"more": ["lip-augmentation.html", "About lip fillers"]'
        if old in s: s = s.replace(old, '"more": ["concern-thin-lips.html", "Compare these options"]'); n += 1
        old = '"more": ["laser-hair-removal.html", "About laser hair removal"]'
        if old in s: s = s.replace(old, '"more": ["concern-unwanted-hair.html", "Compare these options"]'); n += 1
        # the treatment menu: a Bio-stimulators tab; Sculptra® and Radiesse® move there from Injectables
        if '"id": "bio"' not in s:
            a = s.index('const MENU = ['); b = s.index('\n', a)
            menu = json.loads(s[a + len('const MENU = '):b].rstrip(';'))
            inj = next(m for m in menu if m['id'] == 'injectables')
            moved = [c for c in inj['cards'] if c[0] in ('Sculptra®', 'Radiesse®')]
            inj['cards'] = [c for c in inj['cards'] if c[0] not in ('Sculptra®', 'Radiesse®')]
            for c in moved: c[6] = 'Bio-stimulators'
            aptos = ['Aptos Thread Lift', 'A non-surgical lift with absorbable Aptos threads that is also a long-lasting bio-stimulator.', 'From $2,500', 'aptos-thread-lift.html', 'assets/live/main/uploads/2025/09/1-1.jpg', 'assets/live/main/uploads/2025/09/1-1.jpg 1440w', 'Bio-stimulators']
            bio = {'id': 'bio', 'label': 'Bio-stimulators', 'all': ['pricing.html#pg-skin-booster-and-bio-stimulators-h', 'Bio-stimulator prices'], 'cards': [aptos] + moved}
            menu.insert(menu.index(inj) + 1, bio)
            s = s[:a] + 'const MENU = ' + json.dumps(menu, ensure_ascii=False) + ';' + s[b:]; n += 1

    path.write_text(s, encoding='utf-8')
    print('patched:', path.name, n)


patch(ROOT / 'promotion.html')
patch(ROOT / 'index.html', home=True)
