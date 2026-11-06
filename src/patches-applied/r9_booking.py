# round 9: the booking card keeps one height through every step: all three steps share one grid cell
# (the hidden ones invisible and inert), the calendar always shows six weeks, phones reserve room for the time
# slots, the error line is always reserved, and the thank-you keeps the form's height
import sys
R = [
 ("""  const go = (n) => {
    setErr(''); setStep(n);
    setTimeout(() => { const l = box.current && box.current.querySelector('legend'); if (l) l.focus({ preventScroll: true }); }, 30);
  };""",
  """  const [hold, setHold] = useState(0);
  const go = (n) => {
    setErr(''); setStep(n);
    setTimeout(() => { const l = box.current && box.current.querySelector(`[data-step="${n}"] legend`); if (l) l.focus({ preventScroll: true }); }, 30);
  };"""),
 ("""setErr('Please choose at least one way to reach you.'); return; } setSent(true); };""",
  """setErr('Please choose at least one way to reach you.'); return; } setHold(box.current ? box.current.offsetHeight : 0); setSent(true); };"""),
 ("""    <div role="status" className="flex flex-1 flex-col items-start justify-center gap-3 py-4">""",
  """    <div role="status" className="flex flex-1 flex-col items-start justify-center gap-3 py-4" style={{ minHeight: hold || undefined }}>"""),
 ("""      {step === 0 && (
        <fieldset className="mt-5">""",
  """      <div className="book-steps mt-5 grid">
        <fieldset data-step="0" className={`book-step ${step === 0 ? '' : 'is-off'}`} aria-hidden={step !== 0 || undefined} inert={step !== 0 ? '' : undefined}>"""),
 ("""        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="mt-5">""",
  """        </fieldset>
        <fieldset data-step="1" className={`book-step ${step === 1 ? '' : 'is-off'}`} aria-hidden={step !== 1 || undefined} inert={step !== 1 ? '' : undefined}>"""),
 ("""        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="mt-5">""",
  """        </fieldset>
        <fieldset data-step="2" className={`book-step ${step === 2 ? '' : 'is-off'}`} aria-hidden={step !== 2 || undefined} inert={step !== 2 ? '' : undefined}>"""),
 ("""          <p className="mt-3 font-inter text-[12px] text-ndm-muted">Please don’t include medical details. We use your details only to arrange your visit.</p>
        </fieldset>
      )}

      {err && <p role="alert" className="mt-3 font-inter text-[13px] text-[#B4351F]">{err}</p>}""",
  """          <p className="mt-3 font-inter text-[12px] text-ndm-muted">Please don’t include medical details. We use your details only to arrange your visit.</p>
        </fieldset>
      </div>

      <p role="alert" className="mt-3 min-h-[19px] font-inter text-[13px] leading-[19px] text-[#B4351F]">{err}</p>"""),
 ("""      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-6">
        {step > 0 && <Btn as="button" type="button" v="line" sm onClick={() => go(step - 1)}>Back</Btn>}""",
  """      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-3">
        {step > 0 && <Btn as="button" type="button" v="line" sm onClick={() => go(step - 1)}>Back</Btn>}"""),
 # calendar: always six weeks, and phones keep room for the time slots
 ("""  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];""",
  """  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];
  while (cells.length < 42) cells.push(null); /* always six weeks, so the card never changes height between months */"""),
 ("""      <div>
        <p className="font-inter text-[13px] font-semibold text-ndm-ink">{day ? bookDay(day) : 'Pick a day'}</p>""",
  """      <div className="min-h-[188px] md:min-h-0">
        <p className="font-inter text-[13px] font-semibold text-ndm-ink">{day ? bookDay(day) : 'Pick a day'}</p>"""),
 # CSS
 (""".book-sum{""", """.book-step{grid-area:1/1;min-width:0;transition:opacity .35s ease}.book-step.is-off{visibility:hidden;opacity:0}
.book-sum{"""),
]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b in R:
        c = s.count(a); assert c == 1, (p, a[:60], c)
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s); print('ok', p)

# follow-up: equal button row height on every step (the last step's Book button is taller) and a slightly smaller calendar
R2 = [('<div className="mt-auto flex flex-wrap items-center gap-2.5 pt-3">', '<div className="mt-auto flex min-h-[60px] flex-wrap items-center gap-2.5 pt-3">'), ('className={`relative grid h-9 place-items-center rounded-[10px] font-inter text-[13.5px] tabular-nums', 'className={`relative grid h-8 place-items-center rounded-[10px] font-inter text-[13.5px] tabular-nums'), ('className={`h-9 rounded-[10px] font-inter text-[13px] tabular-nums', 'className={`h-8 rounded-[10px] font-inter text-[13px] tabular-nums'), ('<div className="min-h-[188px] md:min-h-0">', '<div className="min-h-[176px] md:min-h-0">')]
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    for a, b in R2:
        assert s.count(a) == 1, (p, a[:50]); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s)

# follow-up 2: on phones Back and the Book button share one row (no wrap), so the last step keeps the same height
R3 = [('<div className="mt-auto flex min-h-[60px] flex-wrap items-center gap-2.5 pt-3">', '<div className="mt-auto flex min-h-[60px] items-center gap-2.5 pt-3 sm:flex-wrap">'), ('<Btn as="button" type="submit" v="book" hot>Book Free Consultation</Btn>}', '<Btn as="button" type="submit" v="book" hot className="min-w-0 flex-1 sm:flex-none">Book Free Consultation</Btn>}')]
