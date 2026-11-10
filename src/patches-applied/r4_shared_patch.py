# Site-wide round 4 (2026-11-06), both shells (index.html, promotion.html):
#  - no lines between the top menu items; instead the dropdown (sub)menu items get thin lines, two columns, a "View all" link,
#    always-visible rail arrows and a footer row of links (after the supplied screenshot, no prices)
#  - every black button turns the theme blue (#0F80C3), hover deep navy blue (#0A4F7A); floating search and cart bar too
#  - booking section: website v3 three-step form on the left, ways to reach us on the right, same height
#  - testimonials rows move a little faster
# Already applied, do not run again.
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
BOOKING = open(os.path.join(HERE, 'r4_booking.jsx.txt'), encoding='utf-8').read()
CSS = '''
  /* submenu items: a thin line under each item (dropdown panels and the phone menu) */
  .panel .menu-item{justify-content:space-between;padding:12px 2px;border-bottom:1px solid rgba(27,36,43,.1);font-size:15px}
  .menu-item-m{border-bottom:1px solid rgba(27,36,43,.08)}
'''
FOOT = '''      <div className="flex flex-wrap items-center gap-x-9 gap-y-2 border-t border-ndm-line px-6 py-4 2xl:px-7">
        {[['All treatments', '#/treatments'], ['Prefer to start from a concern?', '#/concerns'], ['Not sure? Free VISIA® skin analysis', '#/visia-skin-analysis']].map(([t, h]) => (
          <a key={t} href={h} onClick={onLink} className="group inline-flex items-center gap-2 font-inter text-[14.5px] font-semibold text-ndm-deep">{t}<IconArrow className="transition-transform group-hover:translate-x-1" /></a>
        ))}
      </div>
'''
R = [
    ('  .marquee-mask{', CSS + '  .marquee-mask{'),
    # top menu: back to no lines between the items
    ('''              {NAV.map((n, k) => (
                <Fragment key={n.id}>
                {k > 0 && <li role="presentation" aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-current opacity-[.22] 2xl:mx-1" />}
                <li className="relative" onMouseEnter={() => (n.menu ? enter(n.id) : leave())}>''',
     '''              {NAV.map((n) => (
                <li key={n.id} className="relative" onMouseEnter={() => (n.menu ? enter(n.id) : leave())}>'''),
    ("                </li>\n                </Fragment>\n              ))}\n            </ul>", "                </li>\n              ))}\n            </ul>"),
    # procedures menu: rail arrows always shown, two columns with lines, view all, footer row
    ("<IconArrow className={`transition-transform ${on ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'}`} />",
     "<IconArrow className={`transition-[opacity,transform] ${on ? 'translate-x-0.5 opacity-100' : 'opacity-40'}`} />"),
    ("<ul className={g.items.length > 7 ? 'columns-2 gap-6' : ''} role=\"list\">",
     "<ul className={g.items.length > 4 && (cat.groups.length === 1 || g.items.length > 7) ? 'grid grid-cols-2 gap-x-10' : ''} role=\"list\">"),
    ('''          ))}
        </div>
        )}
      </div>
      )}''', '''          ))}
        </div>
        )}
        <a href={slug(cat.label)} onClick={onLink} className="group mt-5 inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">View all {cat.label.toLowerCase()}<IconArrow className="transition-transform group-hover:translate-x-1" /></a>
      </div>
      )}'''),
    # black buttons -> theme blue
    ('.btn-ink{background:#1B242B;color:#fff}', '.btn-ink{background:#0F80C3;color:#fff}'),
    ('.btn-ink:hover,.btn-ink:focus-visible,.group:hover .btn-g.btn-ink{background:#0F80C3}', '.btn-ink:hover,.btn-ink:focus-visible,.group:hover .btn-g.btn-ink{background:#0A4F7A}'),
    ('padding:0 6px 0 22px;background:#1B242B;color:#fff;', 'padding:0 6px 0 22px;background:#0F80C3;color:#fff;'),
    ('border-color:#1B242B;box-shadow:0 12px 28px -16px rgba(27,36,43,.6)', 'border-color:#0F80C3;box-shadow:0 12px 28px -16px rgba(15,128,195,.65)'),
    ('width:36px;height:36px;border-radius:999px;background:#0F80C3;transform:translateY(-50%) scale(0)', 'width:36px;height:36px;border-radius:999px;background:#0A4F7A;transform:translateY(-50%) scale(0)'),
    ('.btn-on-dark .btn-dot{background:#1B242B;color:#fff}', '.btn-on-dark .btn-dot{background:#0F80C3;color:#fff}'),
    ('float-search fixed right-4 z-[55] grid size-[52px] place-items-center rounded-full bg-ndm-ink', 'float-search fixed right-4 z-[55] grid size-[52px] place-items-center rounded-full bg-ndm-deep'),
    ('cart-pill fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-full bg-ndm-ink', 'cart-pill fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-full bg-ndm-deep'),
    # testimonials a little faster
    ('dur={k ? 70 : 62}', 'dur={k ? 50 : 44}'),
]
for p in ['index.html', 'promotion.html']:
    s = open(p, encoding='utf-8').read()
    for a, b in R:
        assert s.count(a) == 1, (p, a[:80], s.count(a)); s = s.replace(a, b)
    # footer row under the procedures panel (after its three-column grid)
    i = s.index('function MegaMenu('); j = s.index('\nfunction ', i + 10)
    m = s[i:j]
    k = m.rindex('      </div>\n    </div>\n  );\n}')
    m = m[:k] + '      </div>\n' + FOOT + '    </div>\n  );\n}' + m[k + len('      </div>\n    </div>\n  );\n}'):]
    s = s[:i] + m + s[j:]
    # booking section
    i = s.index('function Appointment() {'); j = s.index('\n}\n', i) + 3
    s = s[:i] + BOOKING[BOOKING.index('const BOOK_INTERESTS'):] + s[j:]
    open(p, 'w', encoding='utf-8').write(s); print(p, 'ok')
