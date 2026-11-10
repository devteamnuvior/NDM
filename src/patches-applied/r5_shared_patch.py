# Site-wide round 5 (2026-11-06), both shells:
#  - Procedures menu: one layout for every category (Aptos too), tighter uniform rows so Skin fits above the footer row
#  - About menu: the two clinics as photo cards with hours; every About link opens about.html from the top
#  - booking: one three-step form (BookForm) for the booking section and the pop-up; contact by Call/Text/Email, any combination;
#    the side cards are compact
#  - the offer pop-up shows once on every page until it is closed; the chat note shows on every page until the chat is opened or the note dismissed
#  - testimonials move faster; the cart drawer's Checkout goes to checkout.html
# Pieces next to this file (r5_*.jsx.txt). Already applied, do not run again.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
def part(n): return open(os.path.join(HERE, n), encoding='utf-8').read()
MENUS, BOOK = part('r5_menus.jsx.txt'), part('r5_booking.jsx.txt')

def cut_fn(s, name, new):
    i = s.index(f'function {name}('); j = s.index('\n}\n', i) + 3
    return s[:i] + new + s[j:]

for p in ['index.html', 'promotion.html']:
    s = open(p, encoding='utf-8').read()
    def rep(a, b):
        global s
        assert s.count(a) == 1, (p, a[:80], s.count(a)); s = s.replace(a, b)
    rep('  .panel .menu-item{justify-content:space-between;padding:12px 2px;border-bottom:1px solid rgba(27,36,43,.1);font-size:15px}',
        '  .panel .menu-item{justify-content:space-between;padding:8px 2px;border-bottom:1px solid rgba(27,36,43,.1);font-size:14.5px;line-height:1.3}')
    rep("    groups: [{ items: ['Non-Surgical Facelift (Neck, Jawline, Eyebrow & Nose Lift)'] }] },", "    groups: [{ items: ['Aptos Thread Lift', 'Non-Surgical Facelift (Neck, Jawline, Eyebrow & Nose Lift)'] }] },")
    # menus
    i = s.index('function MegaMenu('); j = s.index('\nfunction ', i + 10) + 1
    s = s[:i] + MENUS.split('/* about: the two clinics')[0] + s[j:]
    i = s.index('function AboutMenu('); j = s.index('\n}\n', i) + 3
    s = s[:i] + '/* about: the two clinics' + MENUS.split('/* about: the two clinics')[1].rstrip('\n') + '\n' + s[j:]
    # about links open the About page from the top
    for k in ["'our-doctors-team': 'about.html#team'", "'our-clinics': 'about.html#clinics'", "'doctors-team': 'about.html#team'", "'awards-recognition': 'about.html#awards'", "'contact-us': 'about.html#contact'", "'uptown-clinic': 'about.html#uptown'", "'downtown-clinic': 'about.html#downtown'"]:
        rep(k, k.split(':')[0] + ": 'about.html'")
    # booking form, section and pop-up
    i = s.index('const BOOK_INTERESTS'); j = s.index('function Appointment() {', i); j = s.index('\n}\n', j) + 3
    s = s[:i] + BOOK + s[j:]
    b0 = s.index('function BookPopup('); b1 = s.index('\n}\n', b0)
    pop = s[b0:b1]
    pop = pop.replace("  const [sent, setSent] = useState(false);\n  const [treat, setTreat] = useState('');\n  const [clinic, setClinic] = useState('');\n", "  const [run, setRun] = useState(0); /* a fresh form every time the pop-up opens */\n", 1)
    pop = pop.replace('opener.current = a; setSent(false); setOpen(true);', 'opener.current = a; setRun((x) => x + 1); setOpen(true);', 1)
    pop = pop.replace('sm:max-w-[560px] sm:rounded-[20px]', 'sm:max-w-[680px] sm:rounded-[20px]', 1)
    k0 = pop.index('          {sent ? ('); k1 = pop.index('          )}\n        </div>\n      </div>\n    </div>\n  );', k0) + len('          )}\n')
    pop = pop[:k0] + '''          <p className="eyebrow font-mont">
            <span className="eyebrow-mark" aria-hidden="true"><img src="assets/icons/logo-mark.svg" alt="" /></span>Book now at our two Toronto locations
          </p>
          <TwoTone id="book-pop-title" className="mt-4 pr-8" size="text-[clamp(26px,2.6vw,36px)]" lead={<>Book a free consultation<br /></>} strong="in three short steps" />
          <div className="mt-6 flex"><BookForm key={run} thanksId="book-pop-title" /></div>
''' + pop[k1:]
    assert 'setSent' not in pop and 'BookForm' in pop, p
    s = s[:b0] + pop + s[b1:]
    # offer pop-up: once on every page until it is closed
    rep("const OFFER_KEY = 'ndm-offer-seen';", "const OFFER_KEY = 'ndm-offer-closed'; /* set when the pop-up is closed; until then it shows once on every page */")
    rep("  try { return !localStorage.getItem(OFFER_KEY); } catch (e) { return true; }", "  try { return !localStorage.getItem(OFFER_KEY) && sessionStorage.getItem('ndm-offer-' + HERE) !== '1'; } catch (e) { return true; }")
    rep("    try { localStorage.setItem(OFFER_KEY, String(Date.now())); } catch (e) {}\n    lastFocus.current", "    try { sessionStorage.setItem('ndm-offer-' + HERE, '1'); } catch (e) {}\n    lastFocus.current")
    rep("    const t = setTimeout(show, force ? 1500 : 15000);", "    const t = setTimeout(show, force ? 1500 : 9000);")
    rep("  const close = () => {\n    setOpen(false);\n    setTimeout(() => { setMounted(false);", "  const close = () => {\n    try { localStorage.setItem(OFFER_KEY, String(Date.now())); } catch (e) {}\n    setOpen(false);\n    setTimeout(() => { setMounted(false);")
    # chat note: every page until the chat is opened or the note is dismissed
    rep("    try { seen = sessionStorage.getItem('ndm-chat-note') === '1'; } catch (e) {}", "    try { seen = sessionStorage.getItem('ndm-chat-note') === 'closed'; } catch (e) {}")
    rep("    const t = setTimeout(() => { setNote(true); try { sessionStorage.setItem('ndm-chat-note', '1'); } catch (e) {} }, 4500);", "    const t = setTimeout(() => setNote(true), 4500);")
    rep("  useEffect(() => {\n    if (!open) return;\n    setNote(false);", "  const noteOff = () => { setNote(false); try { sessionStorage.setItem('ndm-chat-note', 'closed'); } catch (e) {} };\n  useEffect(() => {\n    if (!open) return;\n    noteOff();")
    rep('<button type="button" onClick={() => setNote(false)} aria-label="Dismiss message"', '<button type="button" onClick={noteOff} aria-label="Dismiss message"')
    rep('<a href="#/book" onClick={() => setNote(false)} className=', '<a href="#/book" onClick={noteOff} className=')
    # testimonials faster; checkout page
    rep('dur={k ? 50 : 44}', 'dur={k ? 32 : 28}')
    rep('href="#/checkout"', 'href="checkout.html"')
    # (then, by hand on both shells: a "View cart" link to cart.html beside Checkout in the cart drawer)
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')
