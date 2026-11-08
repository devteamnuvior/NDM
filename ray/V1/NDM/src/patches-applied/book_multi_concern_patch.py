#!/usr/bin/env python3
"""Make the consultation form's concern step multi-select.

BookForm's first step (BookPicker) let the client pick only one concern
(radio inputs, f.interest as a string). This patch turns it into a
multi-select: checkboxes, f.interest as an array of chosen concerns, with
the "Your choices" line, validation, "Something else" box and the summary
row all updated to handle more than one.

Applied to both shells (index.html, promotion.html). Run once from the NDM
folder:  python3 -I src/patches-applied/book_multi_concern_patch.py .
Then rebuild the generated pages. Idempotent: skips a file already patched.
"""
import sys, pathlib

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
SHELLS = ["index.html", "promotion.html"]

# (old, new, expected_count). expected_count None means "at least one".
REPLACEMENTS = [
    # --- BookPicker: single value -> array of values ---
    ("function BookPicker({ value, onPick, compact }) {",
     "function BookPicker({ values, onPick, compact }) {", 1),

    ("const found = BOOK_INTEREST_GROUPS.findIndex(([, xs]) => xs.includes(value));",
     "const found = BOOK_INTEREST_GROUPS.findIndex(([, xs]) => xs.some((x) => values.includes(x)));", 1),

    ("${xs.includes(value) && i !== cat ? 'book-tab-has' : ''}",
     "${xs.some((x) => values.includes(x)) && i !== cat ? 'book-tab-has' : ''}", 1),

    ('<input type="radio" name="interest" value={t} checked={value === t} onChange={() => onPick(t)} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />',
     '<input type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />', 1),

    ("${value === t ? 'bg-ndm-amber' : 'bg-ndm-ink/15'}",
     "${values.includes(t) ? 'bg-ndm-amber' : 'bg-ndm-ink/15'}", 1),

    ('{standing.map((t) => <BookChip key={t} name="interest" value={t} checked={value === t} onChange={() => onPick(t)}>{t}</BookChip>)}',
     '{standing.map((t) => <BookChip key={t} type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)}>{t}</BookChip>)}', 1),

    # the "Your choice" readout: now a wrapping list of choices
    ('<p className="mt-2.5 flex min-h-[20px] items-center gap-2 font-inter text-[13px] text-ndm-ink" aria-live="polite">',
     '<p className="mt-2.5 flex min-h-[20px] flex-wrap items-center gap-2 font-inter text-[13px] text-ndm-ink" aria-live="polite">', 1),

    ('{value ? <><i aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ndm-amber" /><span className="text-ndm-muted">Your choice:</span><b className="font-semibold">{value}</b></> : <span className="text-ndm-muted">Pick a category, then what you would like to address.</span>}',
     '{values.length ? <><i aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ndm-amber" /><span className="text-ndm-muted">Your choices:</span><b className="font-semibold">{values.join(\', \')}</b></> : <span className="text-ndm-muted">Pick a category, then one or more things you would like to address.</span>}', 1),

    # --- BookForm: interest state string -> array ---
    ("interest: '', clinic: 'Uptown'",
     "interest: [], clinic: 'Uptown'", 1),

    ("const pick = (t) => { setErr(''); setF((o) => ({ ...o, interest: t, visia: t.startsWith('Not sure') ? true : o.visia })); if (t === BOOK_OTHER) setTimeout(() => { const i = otherBox(); if (i) i.focus(); }, 60); };",
     "const pick = (t) => { setErr(''); const has = f.interest.includes(t); setF((o) => ({ ...o, interest: has ? o.interest.filter((x) => x !== t) : [...o.interest, t], visia: (!has && t.startsWith('Not sure')) ? true : o.visia })); if (t === BOOK_OTHER && !has) setTimeout(() => { const i = otherBox(); if (i) i.focus(); }, 60); };", 1),

    ("if (step === 0 && !f.interest) { setErr('Please choose one option.'); return; }",
     "if (step === 0 && !f.interest.length) { setErr('Please choose at least one option.'); return; }", 1),

    ("if (step === 0 && f.interest === BOOK_OTHER && !f.other.trim())",
     "if (step === 0 && f.interest.includes(BOOK_OTHER) && !f.other.trim())", 1),

    ("interest: '', other: ''",
     "interest: [], other: ''", 1),

    ("const concern = f.interest === BOOK_OTHER ? (f.other.trim() || BOOK_OTHER) : f.interest;",
     "const concern = f.interest.map((t) => t === BOOK_OTHER ? (f.other.trim() || BOOK_OTHER) : t).join(', ');", 1),

    ("[['Concern', concern]",
     "[['Concerns', concern]", 2),

    ("<BookPicker value={f.interest} onPick={pick} compact={compact} />",
     "<BookPicker values={f.interest} onPick={pick} compact={compact} />", 1),

    ("{f.interest === BOOK_OTHER && (",
     "{f.interest.includes(BOOK_OTHER) && (", 1),

    # a short hint under the step 0 legend
    ("<legend tabIndex={-1} className={legend}>What would you like to address?</legend>",
     "<legend tabIndex={-1} className={legend}>What would you like to address?</legend>\n          <p className=\"mt-2 font-inter text-[13.5px] leading-[1.5] text-ndm-muted\">Choose any that apply, you can pick more than one.</p>", 1),
]

SENTINEL = "function BookPicker({ values, onPick, compact })"

for name in SHELLS:
    p = ROOT / name
    text = p.read_text(encoding="utf-8")
    if SENTINEL in text:
        print(f"{name}: already patched, skipping")
        continue
    for old, new, n in REPLACEMENTS:
        count = text.count(old)
        if n is not None and count != n:
            raise SystemExit(f"{name}: expected {n} of <<{old[:60]}...>> but found {count}")
        if count == 0:
            raise SystemExit(f"{name}: not found: <<{old[:60]}...>>")
        text = text.replace(old, new)
    p.write_text(text, encoding="utf-8")
    print(f"{name}: patched ({len(REPLACEMENTS)} replacements)")

print("done")
