"use client";

import { useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { BookIcon } from "@/components/booking/book-icons";
import { BookOnline } from "@/components/booking/book-online";
import { Button } from "@/components/ui/button";
import { IconArrow, IconCheckBadge, IconPhone } from "@/components/ui/icons";
import {
  BOOK_CALL_TIMES,
  BOOK_CLINIC_OPTIONS,
  BOOK_FLOW,
  BOOK_INTEREST_GROUPS,
  BOOK_INTEREST_SECTIONS,
  BOOK_NOT_SURE,
  BOOK_OTHER,
  type BookPath,
} from "@/config/booking";
import { CLINICS } from "@/config/site";
import { tel } from "@/lib/routes";
import { withBase } from "@/lib/base-path";
import { pushLead } from "@/lib/lead-event";

/* Note on borders: the prototype writes "border-ndm-ink/12" and "border-white/12" on a few elements, an
   opacity step its Tailwind 3 does not have, so those classes did nothing there and the borders took the
   default colour. Tailwind 4 would honour them and change the colour, so they are left out here. */

const FIELD =
  "block h-12 w-full rounded-[10px] border border-ndm-ink/15 bg-white px-3.5 font-inter text-[14.5px] text-ndm-ink placeholder:text-[#7D868D] outline-hidden transition focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";

interface ChipProps {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}

function BookChip({ type = "radio", name, value, checked, onChange, children }: ChipProps) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />
      <span className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-ndm-ink/15 bg-white px-3.5 font-inter text-[13.5px] leading-[1.3] text-ndm-ink transition-colors peer-checked:border-ndm-deep peer-checked:bg-ndm-deep peer-checked:text-white peer-hover:border-ndm-ink/40 peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25">
        {children}
      </span>
    </label>
  );
}

/* the organised picker: icon tiles for the categories (concerns, then treatments), the options of the open
   category as check rows, the two standing options, and the choices as chips that can be taken off */
function BookPicker({ values, onPick, compact }: { values: string[]; onPick: (t: string) => void; compact: boolean }) {
  const found = BOOK_INTEREST_GROUPS.findIndex(([, xs]) => xs.some((x) => values.includes(x)));
  const [cat, setCat] = useState(found >= 0 ? found : 0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const key = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + BOOK_INTEREST_GROUPS.length) % BOOK_INTEREST_GROUPS.length;
    setCat(n);
    tabs.current[n]?.focus();
  };
  const tab = (i: number) => {
    const [g, xs] = BOOK_INTEREST_GROUPS[i];
    const n = xs.filter((x) => values.includes(x)).length;
    return (
      <button
        key={g}
        ref={(el) => {
          tabs.current[i] = el;
        }}
        type="button"
        role="tab"
        aria-selected={i === cat}
        tabIndex={i === cat ? 0 : -1}
        onClick={() => setCat(i)}
        onKeyDown={(e) => key(e, i)}
        className={`book-cat font-inter ${i === cat ? "is-on" : ""}`}
      >
        <span className="book-cat-ic">
          <BookIcon name={g} size={compact ? 17 : 22} />
        </span>
        <span className="book-cat-t">{g}</span>
        {n > 0 && (
          <span key={n} className="book-cat-n">
            {n}
            <span className="sr-only"> chosen</span>
          </span>
        )}
      </button>
    );
  };
  let from = 0;
  return (
    <div className={`book-pick ${compact ? "is-compact" : ""}`}>
      <div role="tablist" aria-label="Type of concern" className={compact ? "book-cats-row no-scrollbar" : "book-cats"}>
        {compact
          ? BOOK_INTEREST_GROUPS.map((_, i) => tab(i))
          : BOOK_INTEREST_SECTIONS.map(([name, count]) => {
              const start = from;
              from += count;
              return (
                <div key={name} role="presentation">
                  <p className="book-cats-h font-inter">{name}</p>
                  <div role="presentation" className="book-cats-g">
                    {BOOK_INTEREST_GROUPS.slice(start, start + count).map((_, i) => tab(start + i))}
                  </div>
                </div>
              );
            })}
      </div>
      <div className={`grid ${compact ? "mt-2.5" : "mt-4"}`}>
        {BOOK_INTEREST_GROUPS.map(([g, xs], gi) => (
          <div
            key={g}
            role="tabpanel"
            aria-label={g}
            aria-hidden={gi !== cat || undefined}
            inert={gi !== cat}
            className={`book-panel grid content-start gap-1.5 [grid-area:1/1] ${gi === cat ? "is-on" : "invisible"} ${compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2"}`}
          >
            {xs.map((t, ti) => (
              <label key={t} className="relative flex cursor-pointer" style={{ "--i": ti } as CSSProperties}>
                <input type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)} tabIndex={gi === cat ? undefined : -1} className="book-in absolute inset-0 m-0 cursor-pointer opacity-0" />
                <span className="book-opt font-inter">
                  <Tick />
                  {t}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="book-alts">
        {(
          [
            [BOOK_NOT_SURE, "scan"],
            [BOOK_OTHER, "note"],
          ] as const
        ).map(([t, icon]) => (
          <label key={t} className="relative inline-flex cursor-pointer">
            <input type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)} className="book-in absolute inset-0 m-0 cursor-pointer opacity-0" />
            <span className="book-alt font-inter">
              <BookIcon name={icon} size={16} />
              {t}
            </span>
          </label>
        ))}
      </div>
      <div className="book-chosen font-inter" aria-live="polite">
        {values.length ? (
          <>
            <span className="book-chosen-h">Your choices</span>
            {values.map((t) => (
              <span key={t} className="book-chip">
                {t}
                <button type="button" onClick={() => onPick(t)} aria-label={`Remove ${t}`}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M2 2l6 6M8 2 2 8" />
                  </svg>
                </button>
              </span>
            ))}
          </>
        ) : (
          <span className="text-ndm-muted">Pick a category, then one or more things you would like to address.</span>
        )}
      </div>
    </div>
  );
}

/* the check box of an option row: the tick draws itself when the row is chosen */
function Tick() {
  return (
    <i aria-hidden="true" className="book-check">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} d="M2.5 6.4 5 8.8l4.5-5.3" />
      </svg>
    </i>
  );
}

interface FormState {
  interest: string[];
  via: string[];
  first: string;
  callTime: string;
  clinic: string;
  other: string;
  visia: boolean;
}

const EMPTY: FormState = { interest: [], via: ["Call", "Text"], first: "", callTime: "", clinic: "", other: "", visia: true };

interface BookFormProps {
  /** id for the confirmation heading, so a dialog can point at it. */
  thanksId?: string;
  /** Show the dark "Your appointment" summary beside the form on wide screens. */
  summary?: boolean;
  /** The smaller form used in treatment page heroes. */
  compact?: boolean;
}

/**
 * Consultation booking, shared by the booking section and the Book Free Consultation pop-up: the concern,
 * then contact details (so every request reaches the team), then a choice: book a time now, or ask us to
 * call. The request goes to POST /api/booking, which saves it in WordPress as a "Consultation" record.
 * "Book a time now" then opens the clinic's own online booking calendar (BookOnline), where the day and
 * time are chosen; a call request shows its thank-you only once it was saved. No payment is taken. The clinic is
 * chosen on the site for both (user, 2026-11-19), so the request and its email say which one.
 */
export function BookForm({ thanksId, summary = false, compact = false }: BookFormProps) {
  const box = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<BookPath | null>(null);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState<FormState>(EMPTY);
  const [hold, setHold] = useState(0);
  const [busy, setBusy] = useState(false);
  const [calendar, setCalendar] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setErr("");
    setF((o) => ({ ...o, [k]: v }));
  };
  const toggleVia = (v: string) => {
    setErr("");
    setF((o) => ({ ...o, via: o.via.includes(v) ? o.via.filter((x) => x !== v) : [...o.via, v] }));
  };
  const otherBox = () => box.current?.querySelector<HTMLInputElement>('input[name="other"]');
  /* "Something else" opens the text box; "Not sure, I'd like a skin analysis" switches the free VISIA analysis back on */
  const pick = (t: string) => {
    setErr("");
    const has = f.interest.includes(t);
    setF((o) => ({ ...o, interest: has ? o.interest.filter((x) => x !== t) : [...o.interest, t], visia: !has && t.startsWith("Not sure") ? true : o.visia }));
    if (t === BOOK_OTHER && !has) setTimeout(() => otherBox()?.focus(), 60);
  };

  const flow = BOOK_FLOW[path ?? "book"];
  const keyOf = (n: number) => (n < 3 ? String(n) : "3c");
  const cur = keyOf(step);
  const go = (n: number) => {
    setErr("");
    setStep(n);
    /* keeps the new step's question in view on phones */
    setTimeout(() => {
      const l = box.current?.querySelector<HTMLElement>(`[data-step="${keyOf(n)}"] legend`);
      if (l) {
        l.focus({ preventScroll: true });
        l.scrollIntoView({ block: "nearest" });
      }
    }, 30);
  };
  const detailsOk = () => {
    const fs = box.current?.querySelector('[data-step="1"]');
    const bad = fs ? Array.from(fs.querySelectorAll<HTMLInputElement>("input[required]")).find((i) => !i.checkValidity()) : null;
    if (bad) {
      setErr("Please add your name, mobile number and a valid email.");
      bad.focus();
      return false;
    }
    if (!f.via.length) {
      setErr("Please choose at least one way to reach you.");
      return false;
    }
    return true;
  };
  const choose = (p: BookPath) => {
    if (!f.clinic) {
      setErr("Please choose a clinic.");
      box.current?.querySelector<HTMLInputElement>('input[name="clinic"]')?.focus();
      return;
    }
    if (p === "book") {
      void send("book");
      return;
    }
    setPath(p);
    go(3);
  };
  const next = () => {
    if (step === 0 && !f.interest.length) {
      setErr("Please choose at least one option.");
      return;
    }
    if (step === 0 && f.interest.includes(BOOK_OTHER) && !f.other.trim()) {
      setErr("Please tell us in a few words what you’d like to address.");
      otherBox()?.focus();
      return;
    }
    if (step === 1 && !detailsOk()) return;
    go(step + 1);
  };
  /* Saves the request. "book": the details are saved, then the clinic's booking calendar opens; it opens
     too when they could not be saved (the calendar asks for them itself), unless the form's own checks
     turned them down. "call": the thank-you shows only once the request was saved. */
  const send = async (p: BookPath) => {
    const form = box.current;
    if (!form || busy) return;
    const field = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value ?? "";
    const height = form.offsetHeight;
    const done = () => {
      setHold(height);
      setPath(p);
      setSent(true);
      if (p === "book") setCalendar(true);
    };
    setErr("");
    setBusy(true);
    let problem = `Your request could not be sent right now. Please try again in a moment, or call ${clinicPhone}.`;
    try {
      const answer = await fetch(withBase("/api/booking"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: f.interest,
          other: f.other,
          visia: f.visia,
          first: f.first,
          last: field("last"),
          phone: field("phone"),
          email: field("email"),
          via: f.via,
          path: p === "book" ? "online" : "call",
          clinic: f.clinic,
          callTime: p === "call" ? f.callTime : undefined,
          page: window.location.pathname,
          company: field("ndm_hp"),
        }),
      });
      const result = (await answer.json().catch(() => null)) as { ok?: boolean; reason?: string; message?: string } | null;
      if (answer.ok && result?.ok === true) pushLead(compact ? "lead-page" : thanksId ? "lead-popup" : "lead-section", { bookPath: p === "book" ? "online" : "call" });
      if ((answer.ok && result?.ok === true) || (p === "book" && result?.reason !== "invalid")) {
        done();
        return;
      }
      if (typeof result?.message === "string" && result.message) problem = result.message;
    } catch {
      /* no connection: the message above, or on to the calendar */
      if (p === "book") {
        done();
        return;
      }
    } finally {
      setBusy(false);
    }
    setErr(problem);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (step === 2) {
      setErr("Choose how to continue: book a time now, or have us call you.");
      return;
    }
    if (step < flow.length - 1) {
      next();
      return;
    }
    if (!f.callTime) {
      setErr("Please choose a time of day.");
      return;
    }
    void send("call");
  };
  const reset = () => {
    setSent(false);
    setCalendar(false);
    setPath(null);
    setF((o) => ({ ...o, interest: [], other: "", visia: true, callTime: "", clinic: "" }));
    go(0);
  };

  const clinicName = (v: string) => (v === "Either" ? "Either clinic" : (BOOK_CLINIC_OPTIONS.find(([x]) => x === v)?.[1] ?? v));
  const clinicPhone = CLINICS[0].phone;
  const legend = `scroll-mt-24 font-aeonik ${compact ? "text-[20px]" : "text-[clamp(21px,1.9vw,26px)]"} font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink outline-hidden`;
  const label = "mb-1.5 block font-inter text-[13px] font-semibold text-ndm-ink";
  /* The prototype also puts "items-start" on the two choice tiles, but its Tailwind 3 lets "items-center"
     win when both are present, so the tiles are centred; "items-start" is left out to keep them that way. */
  const tile = "flex min-h-[64px] items-center gap-3 rounded-[14px] border px-4 py-3 text-left font-inter transition-colors focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-ndm-blue/25";
  const concern = f.interest.map((t) => (t === BOOK_OTHER ? f.other.trim() || BOOK_OTHER : t)).join(", ");
  const visiaRow: [string, string | null] = ["VISIA® skin analysis", f.visia ? "Included, free" : "Not added"];
  const rows: [string, string | null][] =
    path === "call"
      ? [["Concerns", concern], visiaRow, ["Next step", "We call you"], ["Best time", f.callTime], ["Clinic", clinicName(f.clinic)]]
      : [["Concerns", concern], visiaRow, ["Clinic", f.clinic ? clinicName(f.clinic) : null], ["Next step", null]];
  const stepClass = (k: string) => `book-step ${cur === k ? "" : "is-off"}`;
  const stepAttr = (k: string) => ({ "aria-hidden": cur !== k || undefined, inert: cur !== k });

  if (sent) {
    return (
      <div role="status" className="flex flex-1 flex-col items-start justify-center gap-3 py-4" style={{ minHeight: hold || undefined }}>
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-ndm-amber text-white">
          <IconCheckBadge />
        </span>
        {path === "book" ? (
          <>
            <p id={thanksId} className="font-aeonik text-[clamp(24px,2.2vw,30px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink">
              One last step{f.first ? `, ${f.first}` : ""}.
            </p>
            <p className="max-w-[46ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">
              {f.clinic && f.clinic !== "Either" ? `Choose ${clinicName(f.clinic).split(",")[0]}, then your day and time in our booking calendar.` : "Choose your clinic, day and time in our booking calendar."} Your free consultation{f.visia ? ", with your VISIA® skin analysis," : ""} is booked once the calendar confirms it.
            </p>
            <Button as="button" type="button" v="ink" onClick={() => setCalendar(true)}>
              Open the booking calendar
            </Button>
            <p className="font-inter text-[13px] leading-[1.5] text-ndm-muted">
              Prefer to talk? Call{" "}
              <a href={withBase(tel(clinicPhone))} className="font-semibold text-ndm-ink hover:underline">
                {clinicPhone}
              </a>
              .
            </p>
            <BookOnline open={calendar} onClose={() => setCalendar(false)} />
          </>
        ) : (
          <>
            <p id={thanksId} className="font-aeonik text-[clamp(24px,2.2vw,30px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink">
              Request sent{f.first ? `, ${f.first}` : ""}.
            </p>
            <p className="max-w-[46ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">
              We’ll call you in the <b className="font-semibold text-ndm-ink">{f.callTime.toLowerCase()}</b> within one business day to find a time for your consultation{f.visia ? " and VISIA® skin analysis" : ""}.
            </p>
          </>
        )}
        <button type="button" onClick={reset} className="font-inter text-[14px] font-semibold text-ndm-deep hover:underline">
          Book another visit
        </button>
      </div>
    );
  }

  const body = (
    <form ref={box} onSubmit={submit} noValidate className="flex min-w-0 flex-1 flex-col">
      {!compact && (
        <span className="book-badge mb-3 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 font-inter text-[12px] font-semibold text-[#8A5A12]">
          <i aria-hidden="true" className="book-badge-dot grid size-4 place-items-center rounded-full bg-ndm-amber text-white">
            <IconArrow size={8} />
          </i>
          Free consultation · VISIA® skin analysis included
        </span>
      )}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${flow.length},minmax(0,1fr))` }} aria-hidden="true">
        {flow.map((s, i) => (
          <span key={s} className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-ndm-amber" : "bg-ndm-ink/10"}`} />
        ))}
      </div>
      <p className="mt-2 font-inter text-[12.5px] text-ndm-muted">
        Step {step + 1} of {flow.length} · <span className="text-ndm-ink">{flow[step]}</span>
      </p>

      <div className="book-steps mt-5 grid">
        <fieldset data-step="0" className={stepClass("0")} {...stepAttr("0")}>
          <legend tabIndex={-1} className={legend}>
            What would you like to address?
          </legend>
          <p className={`mt-2 font-inter text-[13.5px] leading-[1.5] text-ndm-muted ${compact ? "hidden" : ""}`}>Choose any that apply, you can pick more than one.</p>
          <div className="mt-4">
            <BookPicker values={f.interest} onPick={pick} compact={compact} />
          </div>
          {f.interest.includes(BOOK_OTHER) && (
            <label className="mt-3 block max-w-[440px]">
              <span className={label}>Tell us in a few words</span>
              <input
                name="other"
                maxLength={80}
                autoComplete="off"
                value={f.other}
                onChange={(e) => set("other", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    next();
                  }
                }}
                placeholder="For example: neck lines, or a treatment you have in mind"
                className={`${FIELD} h-11!`}
              />
            </label>
          )}
          <label className={`flex cursor-pointer items-center gap-3 rounded-[14px] border bg-white px-4 font-inter ${compact ? "mt-3 py-2.5" : "mt-5 py-3"}`}>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ndm-ink">Include my free VISIA® skin analysis</span>
              <span className={`mt-0.5 block text-[12.5px] leading-[1.45] text-ndm-muted ${compact ? "hidden" : ""}`}>So you and your provider can see your skin in detail before planning anything.</span>
            </span>
            <input type="checkbox" role="switch" name="visia" checked={f.visia} onChange={(e) => set("visia", e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden="true"
              className="relative h-6 w-11 shrink-0 rounded-full bg-ndm-ink/20 transition-colors peer-checked:bg-ndm-deep peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(11,15,19,.3)] after:transition-transform peer-checked:after:translate-x-5"
            />
          </label>
        </fieldset>

        <fieldset data-step="1" className={stepClass("1")} {...stepAttr("1")}>
          <legend tabIndex={-1} className={legend}>
            How can we reach you?
          </legend>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <label>
              <span className={label}>First name</span>
              <input required name="first" autoComplete="given-name" value={f.first} onChange={(e) => set("first", e.target.value)} className={`${FIELD} h-11!`} />
            </label>
            <label>
              <span className={label}>Last name</span>
              <input required name="last" autoComplete="family-name" className={`${FIELD} h-11!`} />
            </label>
            <label>
              <span className={label}>Mobile number</span>
              <input required type="tel" name="phone" autoComplete="tel" className={`${FIELD} h-11!`} />
            </label>
            <label>
              <span className={label}>Email</span>
              <input required type="email" name="email" autoComplete="email" className={`${FIELD} h-11!`} />
            </label>
          </div>
          <div role="group" aria-label="Best way to reach you, choose any" className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-1.5 font-inter text-[13px] font-semibold text-ndm-ink">Reach me by</span>
            {["Call", "Text", "Email"].map((t) => (
              <BookChip key={t} type="checkbox" name="via" value={t} checked={f.via.includes(t)} onChange={() => toggleVia(t)}>
                {t}
              </BookChip>
            ))}
          </div>
          <p className="mt-3 font-inter text-[12px] text-ndm-muted">Please don’t include medical details. We use your details only to arrange your visit.</p>
          {/* left empty by people, filled in by form-filling robots */}
          <input type="text" name="ndm_hp" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" aria-hidden="true" className="hidden" />
        </fieldset>

        <fieldset data-step="2" className={stepClass("2")} {...stepAttr("2")}>
          <legend tabIndex={-1} className={legend}>
            How would you like to continue?
          </legend>
          <p className="mt-2 font-inter text-[14px] leading-[1.5] text-ndm-muted">Book a time yourself, or let us call you to find one.</p>
          <p className="mt-4 font-inter text-[13px] font-semibold text-ndm-ink">Which clinic?</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Which clinic">
            {[...BOOK_CLINIC_OPTIONS, ["Either", "Either clinic"] as [string, string]].map(([v, t]) => (
              <BookChip key={v} name="clinic" value={v} checked={f.clinic === v} onChange={() => set("clinic", v)}>
                {t}
              </BookChip>
            ))}
          </div>
          <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
            <button type="button" disabled={busy} aria-busy={busy || undefined} onClick={() => choose("book")} className={`${tile} min-h-[96px] border-ndm-deep bg-ndm-deep text-white hover:border-[#0A4F7A] hover:bg-[#0A4F7A]`}>
              <span aria-hidden="true" className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                  <path d="M3.5 9.5h17M8 3v4M16 3v4" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-aeonik text-[clamp(20px,1.6vw,23px)] leading-[1.15] tracking-[-0.01em]">Book a time now</span>
                <span className="mt-1.5 block text-[14px] leading-[1.45] text-white/85">Choose a day and time.</span>
              </span>
              <IconArrow size={15} className="mt-2 shrink-0" />
            </button>
            <button type="button" disabled={busy} onClick={() => choose("call")} className={`${tile} min-h-[96px] border-ndm-ink/15 bg-white text-ndm-ink hover:border-ndm-ink/40`}>
              <span aria-hidden="true" className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
                <IconPhone size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-aeonik text-[clamp(20px,1.6vw,23px)] leading-[1.15] tracking-[-0.01em]">Have us call you</span>
                <span className="mt-1.5 block text-[14px] leading-[1.45] text-ndm-muted">No payment. We call within one business day.</span>
              </span>
              <IconArrow size={15} className="mt-2 shrink-0 text-ndm-deep" />
            </button>
          </div>
        </fieldset>

        <fieldset data-step="3c" className={stepClass("3c")} {...stepAttr("3c")}>
          <legend tabIndex={-1} className={legend}>
            When’s a good time to call?
          </legend>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Time of day">
            {BOOK_CALL_TIMES.map((t) => (
              <BookChip key={t} name="calltime" value={t} checked={f.callTime === t} onChange={() => set("callTime", t)}>
                {t}
              </BookChip>
            ))}
          </div>
          <p className="mt-3 font-inter text-[12px] text-ndm-muted">No payment needed. Our team calls to find a time that suits you.</p>
        </fieldset>
      </div>

      <p role="alert" className="mt-3 min-h-[19px] font-inter text-[13px] leading-[19px] text-[#B4351F]">
        {err}
      </p>
      <div className="mt-auto flex min-h-[60px] items-center gap-2.5 pt-3 sm:flex-wrap">
        {step > 0 && (
          <Button as="button" type="button" v="line" sm disabled={busy} onClick={() => go(step - 1)}>
            Back
          </Button>
        )}
        {/* own keys, so Continue is never reused as the submit button (that would submit the step it just opened) */}
        {step === 2 ? null : step < flow.length - 1 ? (
          <Button key="next" as="button" type="button" v="ink" sm onClick={next}>
            Continue
          </Button>
        ) : (
          <Button key="call" as="button" type="submit" v="ink" disabled={busy} aria-busy={busy || undefined} className="min-w-0 flex-1 sm:flex-none">
            Request a call
          </Button>
        )}
      </div>
    </form>
  );

  if (!summary) return body;
  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
      {body}
      <aside className="book-sum hidden flex-col rounded-[20px] p-5 text-white lg:flex" aria-label="Your appointment">
        <p className="font-inter text-[11.5px] tracking-[.16em] text-white/60 uppercase">Your appointment</p>
        <dl className="mt-3 grid gap-3">
          {rows.map(([k, v]) => (
            <div key={k} className="border-b pb-3">
              <dt className="font-inter text-[11px] tracking-[.12em] text-white/55 uppercase">{k}</dt>
              <dd className={`mt-1 font-aeonik text-[16.5px] leading-[1.3] ${v ? "text-white" : "tt-strong text-white/45"}`}>{v || "Not chosen yet"}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-auto pt-5 font-inter text-[12.5px] leading-[1.5] text-white/65">
          Prefer to talk? Call{" "}
          {CLINICS.map((c) => (
            <a key={c.id} href={withBase(tel(c.phone))} className="block font-semibold text-white hover:underline">
              {c.name} {c.phone}
            </a>
          ))}
        </p>
      </aside>
    </div>
  );
}
