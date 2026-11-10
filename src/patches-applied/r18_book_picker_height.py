"""round 18: the booking form's category picker keeps one height whichever category is open: every category's options sit
in the same grid cell and only the open one shows (the others are invisible and inert), so the form never grows or shrinks
when you switch tabs. The "Your choices" line keeps room for two lines. Both shells.
usage: python3 r18_book_picker_height.py index.html promotion.html"""
import sys
OLD = '''      <div role="tabpanel" className={`mt-2.5 grid gap-1.5 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((t) => (
          <label key={t} className="relative flex cursor-pointer">
            <input type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />
            <span className="book-opt flex min-h-[42px] w-full items-center gap-2.5 rounded-[12px] border border-ndm-ink/12 bg-white px-3.5 py-2 font-inter text-[13.5px] leading-[1.3] text-ndm-ink transition-colors peer-hover:border-ndm-ink/35 peer-checked:border-ndm-deep peer-checked:bg-ndm-deep peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25">
              <i aria-hidden="true" className={`size-2 shrink-0 rounded-full ${values.includes(t) ? 'bg-ndm-amber' : 'bg-ndm-ink/15'}`} />{t}
            </span>
          </label>
        ))}
      </div>'''
NEW = '''      <div className="mt-2.5 grid">
        {BOOK_INTEREST_GROUPS.map(([g, xs], gi) => (
          <div key={g} role="tabpanel" aria-label={g} aria-hidden={gi !== cat || undefined} inert={gi !== cat ? '' : undefined}
            className={`grid content-start gap-1.5 [grid-area:1/1] ${gi === cat ? '' : 'invisible'} ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {xs.map((t) => (
              <label key={t} className="relative flex cursor-pointer">
                <input type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)} tabIndex={gi === cat ? undefined : -1} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />
                <span className="book-opt flex min-h-[42px] w-full items-center gap-2.5 rounded-[12px] border border-ndm-ink/12 bg-white px-3.5 py-2 font-inter text-[13.5px] leading-[1.3] text-ndm-ink transition-colors peer-hover:border-ndm-ink/35 peer-checked:border-ndm-deep peer-checked:bg-ndm-deep peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25">
                  <i aria-hidden="true" className={`size-2 shrink-0 rounded-full ${values.includes(t) ? 'bg-ndm-amber' : 'bg-ndm-ink/15'}`} />{t}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>'''
R2 = ('<p className="mt-2.5 flex min-h-[20px] flex-wrap items-center gap-2 font-inter text-[13px] text-ndm-ink" aria-live="polite">',
      '<p className="mt-2.5 flex min-h-[40px] flex-wrap content-start items-center gap-2 font-inter text-[13px] text-ndm-ink" aria-live="polite">')
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b in [(OLD, NEW), R2]:
        c = s.count(a); assert c == 1, (p, a[:60], c)
        s = s.replace(a, b)
    s = s.replace("  const [, items] = BOOK_INTEREST_GROUPS[cat];\n", "", 1)
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)
