"""Remove the $50 consultation deposit from the booking form (Eileen's request, 2026-11-08).
The 'book' path no longer has a Deposit step; booking a time just sends the request.
Applied to both shells (index.html, promotion.html); rebuild all generated pages after."""
import sys
import pathlib

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SHELLS = ['index.html', 'promotion.html']

REPL = [
    # drop the Deposit step from the book flow
    ("book: ['Your concern', 'Your details', 'Book or call', 'Clinic, day and time', 'Deposit']",
     "book: ['Your concern', 'Your details', 'Book or call', 'Clinic, day and time']"),
    # the final book step now just validates the chosen day/time (no deposit agreement)
    ("    if (path === 'book' && !f.agree) { setErr('Please confirm the deposit terms.'); return; }",
     "    if (path === 'book' && (!f.day || !f.time)) { setErr('Please pick a day and a time.'); return; }"),
    # confirmation: drop the deposit sentence
    (" Your ${BOOK_DEPOSIT} deposit is applied to any treatment you choose, or refunded at your visit.",
     ""),
    # appointment summary: drop the deposit row
    (", ['Deposit', `$${BOOK_DEPOSIT}, refundable`]",
     ""),
    # "Book a time now" card: drop the deposit line
    ("Choose a clinic, day and time. A ${BOOK_DEPOSIT} refundable deposit holds it.",
     "Choose a clinic, day and time."),
    # clinic/time step note: no deposit, we confirm by email/text
    ("Your time is held once the deposit is paid on the next step.",
     "We will confirm your time by email and text."),
    # submit button label
    ("Pay ${BOOK_DEPOSIT} deposit and book",
     "Book this time"),
]

for name in SHELLS:
    p = root / name
    s = p.read_text(encoding='utf-8')
    for old, new in REPL:
        assert s.count(old) == 1, (name, 'want 1x', repr(old[:46]), 'got', s.count(old))
        s = s.replace(old, new)
    # remove the whole deposit fieldset (step 4b), keeping everything up to the next step (3c)
    a = s.index('        <fieldset data-step="4b"')
    b = s.index('        <fieldset data-step="3c"')
    assert a < b, (name, 'deposit fieldset not found before 3c')
    s = s[:a] + s[b:]
    p.write_text(s, encoding='utf-8')
    print('patched', name)
print('done')
