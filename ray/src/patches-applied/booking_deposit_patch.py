"""Booking: details first, then book a time with a refundable deposit or ask for a call (Nov 2026, for Raymond).

New flow of the shared BookForm (booking section and Book Free Consultation pop-up, every page):
  1. What would you like to address?   (one tap; "Something else" opens a short text box; free VISIA analysis switch, on by default)
  2. How can we reach you?             (name, mobile, email; every request reaches the team from here)
  3. Book a time now ->  clinic, day and time  ->  deposit step ($50, refundable; "Pay $50 deposit and book")
     Have us call you ->  best time to call (no payment)
Prototype only: no payment is taken. The deposit step shows where the clinic's payment provider opens.
BOOK_DEPOSIT and BOOK_NOTICE are the two values to change (for example 100 and '48 hours').
Also: the booking headings say "in a few short steps" (the booking path now has four), and the calendar no longer
offers times that have already passed today (a paid booking has to hold a real time). On phones only the open step
takes space, so the short deposit and call steps don't leave a gap above their buttons.

Applied to index.html, promotion.html (the shell) and every page built from them, so a rebuild keeps it.
Run from the project folder: python3 src/patches-applied/booking_deposit_patch.py  (safe to run twice)
"""
import os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PAGES = ['index.html', 'promotion.html', 'about.html', 'aptos-thread-lift.html', 'black-friday.html', 'blog.html', 'botox.html',
         'cart.html', 'checkout.html', 'order-confirmed.html', 'pricing.html', 'what-causes-rosacea-redness.html']

OLD_STEPS = "const BOOK_STEPS = ['Your concern', 'Clinic, day and time', 'Your details'];\n"
NEW_STEPS = """const BOOK_DEPOSIT = 50; /* refundable consultation deposit in dollars: applied to treatment or refunded at the visit */
const BOOK_NOTICE = '24 hours'; /* free reschedule or cancel up to this long before the visit */
const BOOK_FLOW = { book: ['Your concern', 'Your details', 'Clinic, day and time', 'Deposit'], call: ['Your concern', 'Your details', 'Best time to call'] };
const BOOK_CALL_TIMES = ['Morning', 'Afternoon', 'Early evening'];
const BOOK_OTHER = 'Something else'; /* last concern option, opens a short text box */
"""
START = "/* the three-step request form, shared by the booking section and the Book Free Consultation pop-up */\nfunction BookForm("
NEW_FORM = r"""/* consultation booking, shared by the booking section and the Book Free Consultation pop-up: the concern, then contact
   details (so every request reaches the team), then a choice: book a time now with a refundable deposit, or ask us to call.
   Prototype: no payment is taken; the clinic's payment provider opens at the deposit step. */
function BookForm({ thanksId, summary = false }) {
  const box = useRef(null);
  const [step, setStep] = useState(0);
  const [path, setPath] = useState(null); /* 'book' (pick a time, deposit) or 'call' (we call you) */
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ interest: '', clinic: 'Uptown', day: null, time: null, via: ['Call'], first: '', callTime: '', callClinic: 'Either', agree: false, other: '', visia: true });
  const set = (k, v) => { setErr(''); setF((o) => ({ ...o, [k]: v })); };
  const toggle = (k, v) => { setErr(''); setF((o) => ({ ...o, [k]: o[k].includes(v) ? o[k].filter((x) => x !== v) : [...o[k], v] })); };
  const otherBox = () => box.current && box.current.querySelector('input[name="other"]');
  /* "Something else" opens the text box; "Not sure, I'd like a skin analysis" switches the free VISIA analysis back on */
  const pick = (t) => { setErr(''); setF((o) => ({ ...o, interest: t, visia: t.startsWith('Not sure') ? true : o.visia })); if (t === BOOK_OTHER) setTimeout(() => { const i = otherBox(); if (i) i.focus(); }, 60); };
  const [hold, setHold] = useState(0);
  const flow = BOOK_FLOW[path || 'book'];
  const keyOf = (n, p) => (n < 2 ? String(n) : `${n}${p === 'call' ? 'c' : 'b'}`);
  const cur = keyOf(step, path);
  const go = (n, p = path) => {
    setErr(''); setStep(n);
    setTimeout(() => { const l = box.current && box.current.querySelector(`[data-step="${keyOf(n, p)}"] legend`); if (l) { l.focus({ preventScroll: true }); l.scrollIntoView({ block: 'nearest' }); } }, 30); /* keeps the new step's question in view on phones */
  };
  const detailsOk = () => {
    const fs = box.current && box.current.querySelector('[data-step="1"]');
    const bad = fs ? [...fs.querySelectorAll('input[required]')].find((i) => !i.checkValidity()) : null;
    if (bad) { setErr('Please add your name, mobile number and a valid email.'); bad.focus(); return false; }
    if (!f.via.length) { setErr('Please choose at least one way to reach you.'); return false; }
    return true;
  };
  const choose = (p) => { if (!detailsOk()) return; setPath(p); go(2, p); };
  const next = () => {
    if (step === 0 && !f.interest) { setErr('Please choose one option.'); return; }
    if (step === 0 && f.interest === BOOK_OTHER && !f.other.trim()) { setErr('Please tell us in a few words what you’d like to address.'); const i = otherBox(); if (i) i.focus(); return; }
    if (step === 2 && path === 'book' && (!f.day || !f.time)) { setErr('Please pick a day and a time.'); return; }
    go(step + 1);
  };
  const submit = (e) => {
    e.preventDefault();
    if (step === 1) { setErr('Choose how to continue: book a time now, or have us call you.'); return; }
    if (step < flow.length - 1) { next(); return; }
    if (path === 'call' && !f.callTime) { setErr('Please choose a time of day.'); return; }
    if (path === 'book' && !f.agree) { setErr('Please confirm the deposit terms.'); return; }
    setHold(box.current ? box.current.offsetHeight : 0); setSent(true);
  };
  const reset = () => { setSent(false); setPath(null); setF((o) => ({ ...o, interest: '', other: '', visia: true, day: null, time: null, callTime: '', agree: false })); go(0, null); };
  const when = f.day && f.time ? `${bookDay(f.day)}, ${bookHour(f.time)}` : null;
  const clinicName = (v) => (v === 'Either' ? 'Either clinic' : BOOK_CLINIC_OPTS.find(([x]) => x === v)[1]);
  const clinicPhone = (CLINICS.find((c) => c.name === f.clinic) || CLINICS[0]).phone;
  const legend = 'scroll-mt-24 font-aeonik text-[clamp(21px,1.9vw,26px)] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink outline-none';
  const label = 'mb-1.5 block font-inter text-[13px] font-semibold text-ndm-ink';
  const tile = 'flex min-h-[64px] items-center gap-3 rounded-[14px] border px-4 py-3 text-left font-inter transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ndm-blue/25';
  const concern = f.interest === BOOK_OTHER ? (f.other.trim() || BOOK_OTHER) : f.interest;
  const visiaRow = ['VISIA® skin analysis', f.visia ? 'Included, free' : 'Not added'];
  const rows = path === 'call'
    ? [['Concern', concern], visiaRow, ['Next step', 'We call you'], ['Best time', f.callTime], ['Clinic', clinicName(f.callClinic)]]
    : [['Concern', concern], visiaRow, ['Clinic', clinicName(f.clinic)], ['Day and time', when], ['Deposit', `$${BOOK_DEPOSIT}, refundable`]];
  const stepCls = (k) => `book-step ${cur === k ? '' : 'is-off'}`;
  const stepAttr = (k) => ({ 'aria-hidden': cur !== k || undefined, inert: cur !== k ? '' : undefined });

  if (sent) return (
    <div role="status" className="flex flex-1 flex-col items-start justify-center gap-3 py-4" style={{ minHeight: hold || undefined }}>
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-ndm-amber text-white"><IconCheckBadge /></span>
      {path === 'book' ? (<>
        <p id={thanksId} className="font-aeonik text-[clamp(24px,2.2vw,30px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink">You’re booked{f.first ? `, ${f.first}` : ''}.</p>
        <p className="max-w-[46ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">Your free consultation{f.visia ? ', with your VISIA® skin analysis,' : ''} is on <b className="font-semibold text-ndm-ink">{when}</b> at our {f.clinic} clinic. Your ${BOOK_DEPOSIT} deposit is applied to any treatment you choose, or refunded at your visit. You’ll receive the details by email and text.</p>
        <p className="font-inter text-[13px] leading-[1.5] text-ndm-muted">Need to change it? Call <a href={tel(clinicPhone)} className="font-semibold text-ndm-ink hover:underline">{clinicPhone}</a> at least {BOOK_NOTICE} before.</p>
      </>) : (<>
        <p id={thanksId} className="font-aeonik text-[clamp(24px,2.2vw,30px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink">Request sent{f.first ? `, ${f.first}` : ''}.</p>
        <p className="max-w-[46ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">We’ll call you in the <b className="font-semibold text-ndm-ink">{f.callTime.toLowerCase()}</b> within one business day to find a time for your consultation{f.visia ? ' and VISIA® skin analysis' : ''}.</p>
      </>)}
      <button type="button" onClick={reset} className="font-inter text-[14px] font-semibold text-ndm-deep hover:underline">Book another visit</button>
    </div>
  );

  const body = (
    <form ref={box} onSubmit={submit} noValidate className="flex min-w-0 flex-1 flex-col">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${flow.length},minmax(0,1fr))` }} aria-hidden="true">
        {flow.map((s, i) => <span key={s} className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-ndm-deep' : 'bg-ndm-ink/10'}`} />)}
      </div>
      <p className="mt-2 font-inter text-[12.5px] text-ndm-muted">Step {step + 1} of {flow.length} · <span className="text-ndm-ink">{flow[step]}</span></p>

      <div className="book-steps mt-5 grid">
        <fieldset data-step="0" className={stepCls('0')} {...stepAttr('0')}>
          <legend tabIndex={-1} className={legend}>What would you like to address?</legend>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {[...BOOK_INTERESTS, BOOK_OTHER].map((t) => <BookChip key={t} name="interest" value={t} checked={f.interest === t} onChange={() => pick(t)}>{t}</BookChip>)}
          </div>
          {f.interest === BOOK_OTHER && (
            <label className="mt-3 block max-w-[440px]"><span className={label}>Tell us in a few words</span>
              <input name="other" maxLength={80} autoComplete="off" value={f.other} onChange={(e) => set('other', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } }}
                placeholder="For example: neck lines, or a treatment you have in mind" className={`${fieldCls} !h-11`} /></label>
          )}
          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-[14px] border border-ndm-ink/12 bg-white px-4 py-3 font-inter">
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-ndm-ink">Include my free VISIA® skin analysis</span><span className="mt-0.5 block text-[12.5px] leading-[1.45] text-ndm-muted">So you and your provider can see your skin in detail before planning anything.</span></span>
            <input type="checkbox" role="switch" name="visia" checked={f.visia} onChange={(e) => set('visia', e.target.checked)} className="peer sr-only" />
            <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-ndm-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(11,15,19,.3)] after:transition-transform peer-checked:bg-ndm-deep peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25" />
          </label>
        </fieldset>
        <fieldset data-step="1" className={stepCls('1')} {...stepAttr('1')}>
          <legend tabIndex={-1} className={legend}>How can we reach you?</legend>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <label><span className={label}>First name</span><input required name="first" autoComplete="given-name" value={f.first} onChange={(e) => set('first', e.target.value)} className={`${fieldCls} !h-11`} /></label>
            <label><span className={label}>Last name</span><input required name="last" autoComplete="family-name" className={`${fieldCls} !h-11`} /></label>
            <label><span className={label}>Mobile number</span><input required type="tel" name="phone" autoComplete="tel" className={`${fieldCls} !h-11`} /></label>
            <label><span className={label}>Email</span><input required type="email" name="email" autoComplete="email" className={`${fieldCls} !h-11`} /></label>
          </div>
          <div role="group" aria-label="Best way to reach you, choose any" className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-1.5 font-inter text-[13px] font-semibold text-ndm-ink">Reach me by</span>
            {['Call', 'Text', 'Email'].map((t) => <BookChip key={t} type="checkbox" name="via" value={t} checked={f.via.includes(t)} onChange={() => toggle('via', t)}>{t}</BookChip>)}
          </div>
          <p className="mt-3 font-inter text-[12px] text-ndm-muted">Please don’t include medical details. We use your details only to arrange your visit.</p>
          <p className="mt-5 font-inter text-[13px] font-semibold text-ndm-ink">How would you like to continue?</p>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={() => choose('book')} className={`${tile} border-ndm-deep bg-ndm-deep text-white hover:border-[#0A4F7A] hover:bg-[#0A4F7A]`}>
              <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-semibold">Book a time now</span><span className="mt-0.5 block text-[12.5px] leading-[1.4] text-white/80">Choose a clinic, day and time. A ${BOOK_DEPOSIT} refundable deposit holds it.</span></span>
              <IconArrow size={13} className="shrink-0" />
            </button>
            <button type="button" onClick={() => choose('call')} className={`${tile} border-ndm-ink/15 bg-white text-ndm-ink hover:border-ndm-ink/40`}>
              <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-semibold">Have us call you</span><span className="mt-0.5 block text-[12.5px] leading-[1.4] text-ndm-muted">No payment. We call within one business day.</span></span>
              <IconArrow size={13} className="shrink-0" />
            </button>
          </div>
        </fieldset>
        <fieldset data-step="2b" className={stepCls('2b')} {...stepAttr('2b')}>
          <legend tabIndex={-1} className={legend}>Where and when?</legend>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Clinic">
            {BOOK_CLINIC_OPTS.map(([v, t]) => <BookChip key={v} name="clinic" value={v} checked={f.clinic === v} onChange={() => set('clinic', v)}>{t}</BookChip>)}
          </div>
          <div className="mt-4"><BookCalendar day={f.day} time={f.time} onDay={(d) => setF((o) => ({ ...o, day: d, time: null }))} onTime={(h) => set('time', h)} /></div>
          <p className="mt-3 font-inter text-[12px] text-ndm-muted">Your time is held once the deposit is paid on the next step.</p>
        </fieldset>
        <fieldset data-step="3b" className={stepCls('3b')} {...stepAttr('3b')}>
          <legend tabIndex={-1} className={legend}>Hold your time with a ${BOOK_DEPOSIT} deposit</legend>
          <p className="mt-3 font-inter text-[14.5px] leading-[1.5] text-ndm-ink"><b className="font-semibold">{when || 'Your time'}</b> · {clinicName(f.clinic)}</p>
          <ul className="mt-3 grid gap-2 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">
            {[f.visia ? 'Your consultation and VISIA® skin analysis are free.' : 'Your consultation is free.', `The $${BOOK_DEPOSIT} is applied to any treatment you choose, or refunded at your visit.`, `Reschedule or cancel free up to ${BOOK_NOTICE} before. The deposit isn’t refunded if you miss your visit without notice.`].map((t) => (
              <li key={t} className="flex gap-2"><IconCheckBadge className="mt-[3px] shrink-0 text-ndm-deep" /><span>{t}</span></li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-dashed border-ndm-ink/20 bg-ndm-mist/70 px-4 py-3">
            <IconCard className="shrink-0 text-ndm-deep" />
            <p className="font-inter text-[12.5px] leading-[1.5] text-ndm-muted"><b className="font-semibold text-ndm-ink">Secure card payment</b><br />Prototype: the clinic’s payment provider opens here. No card details are taken on this page.</p>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 font-inter text-[13.5px] leading-[1.45] text-ndm-ink">
            <input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-ndm-deep" />
            <span>I understand the deposit terms.</span>
          </label>
        </fieldset>
        <fieldset data-step="2c" className={stepCls('2c')} {...stepAttr('2c')}>
          <legend tabIndex={-1} className={legend}>When’s a good time to call?</legend>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Time of day">
            {BOOK_CALL_TIMES.map((t) => <BookChip key={t} name="calltime" value={t} checked={f.callTime === t} onChange={() => set('callTime', t)}>{t}</BookChip>)}
          </div>
          <p className="mt-5 font-inter text-[13px] font-semibold text-ndm-ink">Preferred clinic</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Preferred clinic">
            {[['Either', 'Either clinic'], ...BOOK_CLINIC_OPTS].map(([v, t]) => <BookChip key={v} name="callclinic" value={v} checked={f.callClinic === v} onChange={() => set('callClinic', v)}>{t}</BookChip>)}
          </div>
          <p className="mt-3 font-inter text-[12px] text-ndm-muted">No payment needed. Our team calls to find a time that suits you.</p>
        </fieldset>
      </div>

      <p role="alert" className="mt-3 min-h-[19px] font-inter text-[13px] leading-[19px] text-[#B4351F]">{err}</p>
      <div className="mt-auto flex min-h-[60px] items-center gap-2.5 pt-3 sm:flex-wrap">
        {step > 0 && <Btn as="button" type="button" v="line" sm onClick={() => go(step - 1)}>Back</Btn>}
        {/* own keys, so Continue is never reused as the submit button (that would submit the step it just opened) */}
        {step === 1 ? null : step < flow.length - 1 ? <Btn key="next" as="button" type="button" v="ink" sm onClick={next}>Continue</Btn>
          : path === 'book' ? <Btn key="pay" as="button" type="submit" v="ink" className="min-w-0 flex-1 sm:flex-none">Pay ${BOOK_DEPOSIT} deposit and book</Btn>
          : <Btn key="call" as="button" type="submit" v="ink" className="min-w-0 flex-1 sm:flex-none">Request a call</Btn>}
      </div>
    </form>
  );
  if (!summary) return body;
  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
      {body}
      <aside className="book-sum hidden flex-col rounded-[20px] p-5 text-white lg:flex" aria-label="Your appointment">
        <p className="font-inter text-[11.5px] uppercase tracking-[.16em] text-white/60">Your appointment</p>
        <dl className="mt-3 grid gap-3">
          {rows.map(([k, v]) => (
            <div key={k} className="border-b border-white/12 pb-3">
              <dt className="font-inter text-[11px] uppercase tracking-[.12em] text-white/55">{k}</dt>
              <dd className={`mt-1 font-aeonik text-[16.5px] leading-[1.3] ${v ? 'text-white' : 'tt-strong text-white/45'}`}>{v || 'Not chosen yet'}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-auto pt-5 font-inter text-[12.5px] leading-[1.5] text-white/65">Prefer to talk? Call {CLINICS.map((c) => <a key={c.name} href={tel(c.phone)} className="block font-semibold text-white hover:underline">{c.name} {c.phone}</a>)}</p>
      </aside>
    </div>
  );
}
"""

OLD_SLOTS = "const bookSlots = (d) => { const w = d.getDay(); if (w === 0) return []; const [a, b] = w === 6 ? [10, 16] : [9, 18]; return Array.from({ length: b - a + 1 }, (_, i) => a + i); };\n"
NEW_SLOTS = ("const bookSlots = (d) => { const w = d.getDay(); if (w === 0) return []; const [a, b] = w === 6 ? [10, 16] : [9, 18]; "
             "const now = new Date(); const from = d.toDateString() === now.toDateString() ? now.getHours() + 1 : 0; /* today: only times still ahead, since a paid booking holds a real time */ "
             "return Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((h) => h >= from); };\n")
OLD_CSS = "  .book-step{grid-area:1/1;min-width:0;transition:opacity .35s ease}.book-step.is-off{visibility:hidden;opacity:0}\n"
NEW_CSS = OLD_CSS + ("  /* phones: the steps differ a lot in height (tall calendar, short deposit and call steps), so only the open step takes space */\n"
                     "  @media (max-width:639px){.book-step.is-off{display:none}}\n")
OLD_CLOSED = "const closed = d < today || d.getDay() === 0;"
NEW_CLOSED = "const closed = d < today || !bookSlots(d).length; /* Sundays, past days, and today once its last time has gone */"

for name in PAGES:
    p = os.path.join(ROOT, name)
    s = open(p, encoding='utf-8').read()
    if 'const BOOK_DEPOSIT = ' in s:
        print('already applied:', name); continue
    i = s.find(START)
    j = s.find('\n}\n', i)
    if i < 0 or j < 0 or s.count(OLD_STEPS) != 1 or s.count(OLD_SLOTS) != 1 or s.count(OLD_CLOSED) != 1 or s.count(OLD_CSS) != 1:
        print('booking form not found, skipped:', name); continue
    s = s[:i] + NEW_FORM + s[j + 3:]
    s = s.replace(OLD_STEPS, NEW_STEPS).replace(OLD_SLOTS, NEW_SLOTS).replace(OLD_CLOSED, NEW_CLOSED).replace(OLD_CSS, NEW_CSS)
    s = s.replace('strong="in three short steps"', 'strong="in a few short steps"')
    open(p, 'w', encoding='utf-8').write(s)
    print('patched:', name)
