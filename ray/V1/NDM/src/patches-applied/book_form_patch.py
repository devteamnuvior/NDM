"""One consultation form everywhere (Raymond, 8 November 2026). Applied to index.html and promotion.html; rebuild every
generated page afterwards. Safe to run twice.

- The first step's flat row of chips ("looks like buttons, too busy") becomes an organised picker: a row of category tabs
  (Face, Skin, Body, Hair, Injectables, Bio-stimulators, Treatments) and the options of the chosen category below, plus the
  two standing options ("Not sure, I'd like a skin analysis", "Something else"). New options as Raymond asked: Botox®,
  Bio-stimulator · Sculptra®, Bio-stimulator · Radiesse®, Bio-stimulator · Aptos Thread Lift.
- Orange elements on the main form, so it reads as the same form as the orange hero form: an amber "Free consultation"
  badge, amber step progress and an amber dot on the chosen option.
- `compact` mode for BookForm (single column calendar, stacked choices), used by the hero form (ProcForm in
  src/procedure-ui.jsx), so the hero form and the main form are the same form.
usage: python3 src/patches-applied/book_form_patch.py <NDM dir>"""
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
MARK = 'const BOOK_INTEREST_GROUPS = '

GROUPS = """const BOOK_INTEREST_GROUPS = [ /* the picker's categories; labels match the concern and treatment pages */
  ['Face', ['Wrinkles & fine lines', 'Volume loss', 'Sagging skin & jowls', 'Double chin', 'Thin lips', 'Dark circles & under-eye hollows']],
  ['Skin', ['Acne', 'Acne scars', 'Rosacea & redness', 'Melasma', 'Pigmentation & sun spots', 'Texture & pores', 'Moles & skin lesions']],
  ['Body', ['Stubborn fat', 'Cellulite', 'Stretch marks', 'Loose skin', 'Excessive sweating', 'Spider & varicose veins', 'Unwanted hair']],
  ['Hair', ['Thinning hair', 'Hair loss']],
  ['Injectables', ['Botox®', 'Dermal Fillers', 'Lip fillers', 'Under-eye filler', 'Skin boosters']],
  ['Bio-stimulators', ['Bio-stimulator · Aptos Thread Lift', 'Bio-stimulator · Sculptra®', 'Bio-stimulator · Radiesse®']],
  ['Treatments', ['Laser Hair Removal', 'Microneedling', 'Laser skin resurfacing', 'Laser skin tightening', 'Photo-rejuvenation (IPL)', 'Chemical peels', 'CoolSculpting®', 'VISIA® skin analysis']],
];
const BOOK_INTERESTS = BOOK_INTEREST_GROUPS.flatMap(([, xs]) => xs);
const BOOK_NOT_SURE = 'Not sure, I’d like a skin analysis';
/* the organised picker: category tabs, the options of the open category, the two standing options */
function BookPicker({ value, onPick, compact }) {
  const found = BOOK_INTEREST_GROUPS.findIndex(([, xs]) => xs.includes(value));
  const [cat, setCat] = useState(found >= 0 ? found : 0);
  const tabs = useRef([]);
  const key = (e, i) => {
    const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + BOOK_INTEREST_GROUPS.length) % BOOK_INTEREST_GROUPS.length;
    setCat(n); if (tabs.current[n]) tabs.current[n].focus();
  };
  const [, items] = BOOK_INTEREST_GROUPS[cat];
  const standing = [BOOK_NOT_SURE, BOOK_OTHER];
  return (
    <div className="book-pick">
      <div role="tablist" aria-label="Type of concern" className="flex flex-wrap gap-1">
        {BOOK_INTEREST_GROUPS.map(([g, xs], i) => (
          <button key={g} ref={(el) => (tabs.current[i] = el)} type="button" role="tab" aria-selected={i === cat} tabIndex={i === cat ? 0 : -1} onClick={() => setCat(i)} onKeyDown={(e) => key(e, i)}
            className={`book-tab shrink-0 rounded-full px-3.5 py-2 font-inter text-[13px] font-medium transition-colors ${i === cat ? 'bg-ndm-ink text-white' : 'bg-ndm-mist text-ndm-ink/75 hover:text-ndm-ink'} ${xs.includes(value) && i !== cat ? 'book-tab-has' : ''}`}>{g}</button>
        ))}
      </div>
      <div role="tabpanel" className={`mt-2.5 grid gap-1.5 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((t) => (
          <label key={t} className="relative flex cursor-pointer">
            <input type="radio" name="interest" value={t} checked={value === t} onChange={() => onPick(t)} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />
            <span className="book-opt flex min-h-[42px] w-full items-center gap-2.5 rounded-[12px] border border-ndm-ink/12 bg-white px-3.5 py-2 font-inter text-[13.5px] leading-[1.3] text-ndm-ink transition-colors peer-hover:border-ndm-ink/35 peer-checked:border-ndm-deep peer-checked:bg-ndm-deep peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25">
              <i aria-hidden="true" className={`size-2 shrink-0 rounded-full ${value === t ? 'bg-ndm-amber' : 'bg-ndm-ink/15'}`} />{t}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {standing.map((t) => <BookChip key={t} name="interest" value={t} checked={value === t} onChange={() => onPick(t)}>{t}</BookChip>)}
      </div>
      <p className="mt-2.5 flex min-h-[20px] items-center gap-2 font-inter text-[13px] text-ndm-ink" aria-live="polite">
        {value ? <><i aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ndm-amber" /><span className="text-ndm-muted">Your choice:</span><b className="font-semibold">{value}</b></> : <span className="text-ndm-muted">Pick a category, then what you would like to address.</span>}
      </p>
    </div>
  );
}
"""


def patch(path):
    s = path.read_text(encoding='utf-8')
    n = 0

    def rep(old, new, count=1):
        nonlocal s, n
        assert s.count(old) == count, (path.name, old[:70], s.count(old))
        s = s.replace(old, new); n += 1

    if MARK in s:
        # second step (same day): the hero card shows one step at a time, so it is only as tall as the open step
        if '.book-compact .book-step.is-off' not in s:
            rep("\n.book-sum{", "\n  .book-compact .book-step.is-off{display:none}\n.book-sum{")
            path.write_text(s, encoding='utf-8')
        print('already patched:', path.name, n); return

    rep("const BOOK_INTERESTS = ['Wrinkles & fine lines', 'Volume loss', 'Sagging skin & jowls', 'Dark circles & under-eye hollows', 'Double chin', 'Acne', 'Acne scars', 'Pigmentation & sun spots', 'Aptos Thread Lift', 'Dermal Fillers', 'Laser Hair Removal', 'Microneedling', 'Not sure, I’d like a skin analysis'];",
        GROUPS.rstrip('\n'))
    # compact mode and the amber elements
    rep("function BookForm({ thanksId, summary = false }) {", "function BookForm({ thanksId, summary = false, compact = false }) {")
    rep("""      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${flow.length},minmax(0,1fr))` }} aria-hidden="true">
        {flow.map((s, i) => <span key={s} className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-ndm-deep' : 'bg-ndm-ink/10'}`} />)}
      </div>
      <p className="mt-2 font-inter text-[12.5px] text-ndm-muted">Step {step + 1} of {flow.length} · <span className="text-ndm-ink">{flow[step]}</span></p>""",
        """      {!compact && <span className="book-badge mb-3 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 font-inter text-[12px] font-semibold text-[#8A5A12]"><i aria-hidden="true" className="book-badge-dot grid size-4 place-items-center rounded-full bg-ndm-amber text-white"><IconArrow size={8} /></i>Free consultation · VISIA® skin analysis included</span>}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${flow.length},minmax(0,1fr))` }} aria-hidden="true">
        {flow.map((s, i) => <span key={s} className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-ndm-amber' : 'bg-ndm-ink/10'}`} />)}
      </div>
      <p className="mt-2 font-inter text-[12.5px] text-ndm-muted">Step {step + 1} of {flow.length} · <span className="text-ndm-ink">{flow[step]}</span></p>""")
    rep("""          <div className="mt-4 flex flex-wrap gap-1.5">
            {[...BOOK_INTERESTS, BOOK_OTHER].map((t) => <BookChip key={t} name="interest" value={t} checked={f.interest === t} onChange={() => pick(t)}>{t}</BookChip>)}
          </div>""",
        """          <div className="mt-4"><BookPicker value={f.interest} onPick={pick} compact={compact} /></div>""")
    # compact: the two "how to continue" tiles stack, the calendar stacks
    rep("""          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={() => choose('book')}""", """          <div className={`mt-2 grid gap-2.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
            <button type="button" onClick={() => choose('book')}""")
    rep("""          <div className="mt-4"><BookCalendar day={f.day} time={f.time} onDay={(d) => setF((o) => ({ ...o, day: d, time: null }))} onTime={(h) => set('time', h)} /></div>""",
        """          <div className="mt-4"><BookCalendar day={f.day} time={f.time} stack={compact} onDay={(d) => setF((o) => ({ ...o, day: d, time: null }))} onTime={(h) => set('time', h)} /></div>""")
    rep("function BookCalendar({ day, time, onDay, onTime }) {", "function BookCalendar({ day, time, onDay, onTime, stack = false }) {")
    rep("""    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,200px)]">
      <div>
        <div className="flex items-center justify-between">
          <p className="font-aeonik text-[19px] text-ndm-ink">{view.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</p>""",
        """    <div className={`grid gap-4 ${stack ? '' : 'md:grid-cols-[minmax(0,1fr)_minmax(0,200px)]'}`}>
      <div>
        <div className="flex items-center justify-between">
          <p className="font-aeonik text-[19px] text-ndm-ink">{view.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</p>""")
    rep("""          <div className="mt-2 grid grid-cols-3 gap-1.5 md:grid-cols-2" role="group" aria-label="Choose a time">""",
        """          <div className={`mt-2 grid grid-cols-3 gap-1.5 ${stack ? 'sm:grid-cols-4' : 'md:grid-cols-2'}`} role="group" aria-label="Choose a time">""")
    # the legend is smaller in the hero card
    rep("""  const legend = 'scroll-mt-24 font-aeonik text-[clamp(21px,1.9vw,26px)] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink outline-none';""",
        """  const legend = `scroll-mt-24 font-aeonik ${compact ? 'text-[20px]' : 'text-[clamp(21px,1.9vw,26px)]'} font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink outline-none`;""")
    # styles: the amber badge, the picker tabs
    css = """  .book-badge{background:linear-gradient(90deg,rgba(255,166,23,.18),rgba(255,166,23,.08));border:1px solid rgba(255,166,23,.35)}
  .book-badge-dot{box-shadow:0 6px 14px -6px rgba(255,166,23,.9)}
  .book-tab{position:relative}
  .book-tab-has::after{content:"";position:absolute;right:6px;top:6px;width:6px;height:6px;border-radius:999px;background:#FFA617}
  .book-opt{box-shadow:0 1px 0 rgba(27,36,43,.03)}
"""
    anchor = "  .book-step{grid-area:1/1;min-width:0;transition:opacity .35s ease}.book-step.is-off{visibility:hidden;opacity:0}"
    rep(anchor, css + anchor)
    path.write_text(s, encoding='utf-8')
    print('patched:', path.name, n)


patch(ROOT / 'promotion.html')
patch(ROOT / 'index.html')
