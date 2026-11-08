"""Booking form, round 2 (Raymond, 8 November 2026, morning). Applied to index.html and promotion.html after
book_form_patch.py; rebuild every generated page afterwards. Safe to run twice.

- Picker categories: Aptos Thread Lift is listed under Injectables and Bio-stimulators and gets its own "Thread lift"
  category (with the areas the live menu names: neck, jawline, eyebrow, nose); Injectables also lists the bio-stimulators.
- "Reach me by": Call and Text are both pre-selected.
- "How would you like to continue?" (book a time now, or have us call you) is its own step after the details, with
  bigger tiles; the step bar shows it (Book or call).
- The category tabs are bigger.
usage: python3 src/patches-applied/book_form_r2_patch.py <NDM dir>"""
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
MARK = "['Thread lift', ["

GROUPS_OLD = """const BOOK_INTEREST_GROUPS = [ /* the picker's categories; labels match the concern and treatment pages */
  ['Face', ['Wrinkles & fine lines', 'Volume loss', 'Sagging skin & jowls', 'Double chin', 'Thin lips', 'Dark circles & under-eye hollows']],
  ['Skin', ['Acne', 'Acne scars', 'Rosacea & redness', 'Melasma', 'Pigmentation & sun spots', 'Texture & pores', 'Moles & skin lesions']],
  ['Body', ['Stubborn fat', 'Cellulite', 'Stretch marks', 'Loose skin', 'Excessive sweating', 'Spider & varicose veins', 'Unwanted hair']],
  ['Hair', ['Thinning hair', 'Hair loss']],
  ['Injectables', ['Botox®', 'Dermal Fillers', 'Lip fillers', 'Under-eye filler', 'Skin boosters']],
  ['Bio-stimulators', ['Bio-stimulator · Aptos Thread Lift', 'Bio-stimulator · Sculptra®', 'Bio-stimulator · Radiesse®']],
  ['Treatments', ['Laser Hair Removal', 'Microneedling', 'Laser skin resurfacing', 'Laser skin tightening', 'Photo-rejuvenation (IPL)', 'Chemical peels', 'CoolSculpting®', 'VISIA® skin analysis']],
];"""
GROUPS_NEW = """const BOOK_INTEREST_GROUPS = [ /* the picker's categories; labels match the concern and treatment pages. An option may sit in more than one category */
  ['Face', ['Wrinkles & fine lines', 'Volume loss', 'Sagging skin & jowls', 'Double chin', 'Thin lips', 'Dark circles & under-eye hollows']],
  ['Skin', ['Acne', 'Acne scars', 'Rosacea & redness', 'Melasma', 'Pigmentation & sun spots', 'Texture & pores', 'Moles & skin lesions']],
  ['Body', ['Stubborn fat', 'Cellulite', 'Stretch marks', 'Loose skin', 'Excessive sweating', 'Spider & varicose veins', 'Unwanted hair']],
  ['Hair', ['Thinning hair', 'Hair loss']],
  ['Injectables', ['Botox®', 'Dermal Fillers', 'Lip fillers', 'Under-eye filler', 'Skin boosters', 'Aptos Thread Lift', 'Bio-stimulator · Sculptra®', 'Bio-stimulator · Radiesse®']],
  ['Bio-stimulators', ['Bio-stimulator · Aptos Thread Lift', 'Bio-stimulator · Sculptra®', 'Bio-stimulator · Radiesse®']],
  ['Thread lift', ['Aptos Thread Lift', 'Non-surgical facelift', 'Neck lift', 'Jawline lift', 'Eyebrow lift', 'Nose lift']],
  ['Treatments', ['Laser Hair Removal', 'Microneedling', 'Laser skin resurfacing', 'Laser skin tightening', 'Photo-rejuvenation (IPL)', 'Chemical peels', 'CoolSculpting®', 'VISIA® skin analysis']],
];"""

CHOICE_STEP = """        <fieldset data-step="2" className={stepCls('2')} {...stepAttr('2')}>
          <legend tabIndex={-1} className={legend}>How would you like to continue?</legend>
          <p className="mt-2 font-inter text-[14px] leading-[1.5] text-ndm-muted">Book a time yourself, or let us call you to find one.</p>
          <div className={`mt-5 grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
            <button type="button" onClick={() => choose('book')} className={`${tile} min-h-[96px] items-start border-ndm-deep bg-ndm-deep text-white hover:border-[#0A4F7A] hover:bg-[#0A4F7A]`}>
              <span aria-hidden="true" className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg></span>
              <span className="min-w-0 flex-1"><span className="block font-aeonik text-[clamp(20px,1.6vw,23px)] leading-[1.15] tracking-[-0.01em]">Book a time now</span><span className="mt-1.5 block text-[14px] leading-[1.45] text-white/85">Choose a clinic, day and time. A ${BOOK_DEPOSIT} refundable deposit holds it.</span></span>
              <IconArrow size={15} className="mt-2 shrink-0" />
            </button>
            <button type="button" onClick={() => choose('call')} className={`${tile} min-h-[96px] items-start border-ndm-ink/15 bg-white text-ndm-ink hover:border-ndm-ink/40`}>
              <span aria-hidden="true" className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep"><IconPhone size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block font-aeonik text-[clamp(20px,1.6vw,23px)] leading-[1.15] tracking-[-0.01em]">Have us call you</span><span className="mt-1.5 block text-[14px] leading-[1.45] text-ndm-muted">No payment. We call within one business day.</span></span>
              <IconArrow size={15} className="mt-2 shrink-0 text-ndm-deep" />
            </button>
          </div>
        </fieldset>
"""


def patch(path):
    s = path.read_text(encoding='utf-8')
    if MARK in s:
        print('already patched:', path.name); return
    n = 0

    def rep(old, new, count=1):
        nonlocal s, n
        assert s.count(old) == count, (path.name, old[:70], s.count(old))
        s = s.replace(old, new); n += 1

    rep(GROUPS_OLD, GROUPS_NEW)
    rep("via: ['Call'], first: ''", "via: ['Call', 'Text'], first: ''")
    rep("const BOOK_FLOW = { book: ['Your concern', 'Your details', 'Clinic, day and time', 'Deposit'], call: ['Your concern', 'Your details', 'Best time to call'] };",
        "const BOOK_FLOW = { book: ['Your concern', 'Your details', 'Book or call', 'Clinic, day and time', 'Deposit'], call: ['Your concern', 'Your details', 'Book or call', 'Best time to call'] };")
    rep("const keyOf = (n, p) => (n < 2 ? String(n) : `${n}${p === 'call' ? 'c' : 'b'}`);", "const keyOf = (n, p) => (n < 3 ? String(n) : `${n}${p === 'call' ? 'c' : 'b'}`);")
    rep("const choose = (p) => { if (!detailsOk()) return; setPath(p); go(2, p); };", "const choose = (p) => { setPath(p); go(3, p); };")
    rep("""    if (step === 2 && path === 'book' && (!f.day || !f.time)) { setErr('Please pick a day and a time.'); return; }
    go(step + 1);""", """    if (step === 1 && !detailsOk()) return;
    if (step === 3 && path === 'book' && (!f.day || !f.time)) { setErr('Please pick a day and a time.'); return; }
    go(step + 1);""")
    rep("    if (step === 1) { setErr('Choose how to continue: book a time now, or have us call you.'); return; }", "    if (step === 2) { setErr('Choose how to continue: book a time now, or have us call you.'); return; }")
    # the choice leaves the details step and becomes its own step
    a = s.index('          <p className="mt-5 font-inter text-[13px] font-semibold text-ndm-ink">How would you like to continue?</p>')
    b = s.index('        <fieldset data-step="2b"', a)
    block = s[a:b]
    assert block.count('</fieldset>') == 1
    s = s[:a] + '        </fieldset>\n' + CHOICE_STEP + s[b:]; n += 1
    rep('<fieldset data-step="2b" className={stepCls(\'2b\')} {...stepAttr(\'2b\')}>', '<fieldset data-step="3b" className={stepCls(\'3b\')} {...stepAttr(\'3b\')}>')
    rep('<fieldset data-step="3b" className={stepCls(\'3b\')} {...stepAttr(\'3b\')}>\n          <legend tabIndex={-1} className={legend}>Hold your time', '<fieldset data-step="4b" className={stepCls(\'4b\')} {...stepAttr(\'4b\')}>\n          <legend tabIndex={-1} className={legend}>Hold your time')
    rep('<fieldset data-step="2c" className={stepCls(\'2c\')} {...stepAttr(\'2c\')}>', '<fieldset data-step="3c" className={stepCls(\'3c\')} {...stepAttr(\'3c\')}>')
    rep("{step === 1 ? null : step < flow.length - 1 ? <Btn key=\"next\"", "{step === 2 ? null : step < flow.length - 1 ? <Btn key=\"next\"")
    # bigger category tabs
    rep("className={`book-tab shrink-0 rounded-full px-3.5 py-2 font-inter text-[13px] font-medium transition-colors ${i === cat ? 'bg-ndm-ink text-white' : 'bg-ndm-mist text-ndm-ink/75 hover:text-ndm-ink'}",
        "className={`book-tab shrink-0 rounded-full px-4 py-2.5 font-inter text-[15px] font-semibold transition-colors ${i === cat ? 'bg-ndm-ink text-white' : 'bg-ndm-mist text-ndm-ink/80 hover:text-ndm-ink'}")
    path.write_text(s, encoding='utf-8')
    print('patched:', path.name, n)


patch(ROOT / 'promotion.html')
patch(ROOT / 'index.html')
