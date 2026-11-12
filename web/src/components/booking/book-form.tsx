"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconArrow, IconCheckBadge, IconPhone } from "@/components/ui/icons";
import {
  BOOK_CALL_TIMES,
  BOOK_CLINIC_OPTIONS,
  BOOK_FLOW,
  BOOK_INTEREST_GROUPS,
  BOOK_NOT_SURE,
  BOOK_NOTICE,
  BOOK_OTHER,
  bookDay,
  bookHour,
  bookSlots,
  type BookPath,
} from "@/config/booking";
import { CLINICS } from "@/config/site";
import { tel } from "@/lib/routes";

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

/* the organised picker: category tabs, the options of the open category, the two standing options */
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
  return (
    <div className="book-pick">
      <div role="tablist" aria-label="Type of concern" className={`flex gap-1 ${compact ? "no-scrollbar -mx-1 overflow-x-auto px-1" : "flex-wrap"}`}>
        {BOOK_INTEREST_GROUPS.map(([g, xs], i) => (
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
            className={`book-tab shrink-0 rounded-full ${compact ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-[15px]"} font-inter font-semibold transition-colors ${i === cat ? "bg-ndm-ink text-white" : "bg-ndm-mist text-ndm-ink/80 hover:text-ndm-ink"} ${xs.some((x) => values.includes(x)) && i !== cat ? "book-tab-has" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="mt-2.5 grid">
        {BOOK_INTEREST_GROUPS.map(([g, xs], gi) => (
          <div
            key={g}
            role="tabpanel"
            aria-label={g}
            aria-hidden={gi !== cat || undefined}
            inert={gi !== cat}
            className={`grid content-start gap-1.5 [grid-area:1/1] ${gi === cat ? "" : "invisible"} ${compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
          >
            {xs.map((t) => (
              <label key={t} className="relative flex cursor-pointer">
                <input type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)} tabIndex={gi === cat ? undefined : -1} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />
                <span
                  className={`book-opt flex w-full items-center gap-2.5 rounded-[12px] border bg-white px-3.5 font-inter ${compact ? "min-h-[36px] py-1.5 text-[13px]" : "min-h-[42px] py-2 text-[13.5px]"} leading-[1.3] text-ndm-ink transition-colors peer-checked:border-ndm-deep peer-checked:bg-ndm-deep peer-checked:text-white peer-hover:border-ndm-ink/35 peer-focus-visible:ring-4 peer-focus-visible:ring-ndm-blue/25`}
                >
                  <i aria-hidden="true" className={`size-2 shrink-0 rounded-full ${values.includes(t) ? "bg-ndm-amber" : "bg-ndm-ink/15"}`} />
                  {t}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {[BOOK_NOT_SURE, BOOK_OTHER].map((t) => (
          <BookChip key={t} type="checkbox" name="interest" value={t} checked={values.includes(t)} onChange={() => onPick(t)}>
            {t}
          </BookChip>
        ))}
      </div>
      <p className={`mt-2.5 flex flex-wrap content-start items-center gap-2 font-inter text-[13px] text-ndm-ink ${compact ? "min-h-[20px]" : "min-h-[40px]"}`} aria-live="polite">
        {values.length ? (
          <>
            <i aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ndm-amber" />
            <span className="text-ndm-muted">Your choices:</span>
            <b className="font-semibold">{values.join(", ")}</b>
          </>
        ) : (
          <span className="text-ndm-muted">Pick a category, then one or more things you would like to address.</span>
        )}
      </p>
    </div>
  );
}

interface CalendarProps {
  day: Date | null;
  time: number | null;
  onDay: (d: Date) => void;
  onTime: (h: number) => void;
  /** Times under the calendar instead of beside it (the compact form). */
  stack?: boolean;
}

/* a month calendar (Sundays and past days closed) and the open request times of the chosen day */
function BookCalendar({ day, time, onDay, onTime, stack = false }: CalendarProps) {
  /* Today is only known in the browser. Until it is, the calendar holds its full six-week size with empty
     cells, so the page the server sends has the same height as the live one. */
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<Date | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      setToday(t);
      setView(new Date(t.getFullYear(), t.getMonth(), 1));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const cells: (Date | null)[] = [];
  if (view) {
    const first = (view.getDay() + 6) % 7; /* weeks start on Monday */
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let i = 0; i < first; i++) cells.push(null);
    for (let i = 1; i <= days; i++) cells.push(new Date(view.getFullYear(), view.getMonth(), i));
  }
  while (cells.length < 42) cells.push(null); /* always six weeks, so the card never changes height between months */
  const canBack = !!view && !!today && view > new Date(today.getFullYear(), today.getMonth(), 1);
  const nav = "grid size-8 place-items-center rounded-full border text-ndm-ink transition-colors hover:bg-ndm-mist disabled:opacity-30";
  const shift = (months: number) => view && setView(new Date(view.getFullYear(), view.getMonth() + months, 1));

  return (
    <div className={`grid gap-4 ${stack ? "" : "md:grid-cols-[minmax(0,1fr)_minmax(0,200px)]"}`}>
      <div>
        <div className="flex items-center justify-between">
          <p className="font-aeonik text-[19px] text-ndm-ink">{view ? view.toLocaleDateString("en-CA", { month: "long", year: "numeric" }) : " "}</p>
          <span className="flex gap-1.5">
            <button type="button" disabled={!canBack} onClick={() => shift(-1)} aria-label="Previous month" className={nav}>
              <IconArrow size={12} className="rotate-180" />
            </button>
            <button type="button" onClick={() => shift(1)} aria-label="Next month" className={nav}>
              <IconArrow size={12} />
            </button>
          </span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center font-inter text-[11px] tracking-[.08em] text-ndm-muted uppercase" aria-hidden="true">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1" role="group" aria-label="Choose a day">
          {cells.map((d, i) => {
            if (!d || !today) return <span key={`e${i}`} className={view ? undefined : "h-8"} />;
            const closed = d < today || !bookSlots(d).length; /* Sundays, past days, and today once its last time has gone */
            const on = !!day && d.getTime() === day.getTime();
            return (
              <button
                key={d.getDate()}
                type="button"
                disabled={closed}
                onClick={() => onDay(d)}
                aria-pressed={on}
                aria-label={`${bookDay(d)}${closed ? ", closed" : ""}`}
                className={`relative grid h-8 place-items-center rounded-[10px] font-inter text-[13.5px] tabular-nums transition-colors ${on ? "bg-ndm-deep text-white" : closed ? "text-ndm-ink/25" : "bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep"}`}
              >
                {d.getDate()}
                {!closed && !on && <i aria-hidden="true" className="absolute bottom-1 size-1 rounded-full bg-ndm-sky" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="min-h-[176px] md:min-h-0">
        <p className="font-inter text-[13px] font-semibold text-ndm-ink">{day ? bookDay(day) : "Pick a day"}</p>
        {day ? (
          <div className={`mt-2 grid grid-cols-3 gap-1.5 ${stack ? "sm:grid-cols-4" : "md:grid-cols-2"}`} role="group" aria-label="Choose a time">
            {bookSlots(day).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onTime(h)}
                aria-pressed={time === h}
                className={`h-8 rounded-[10px] font-inter text-[13px] tabular-nums transition-colors ${time === h ? "bg-ndm-deep text-white" : "bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep"}`}
              >
                {bookHour(h)}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 font-inter text-[13px] leading-[1.5] text-ndm-muted">Open days are marked with a dot. Sundays are closed.</p>
        )}
      </div>
    </div>
  );
}

interface FormState {
  interest: string[];
  clinic: string;
  day: Date | null;
  time: number | null;
  via: string[];
  first: string;
  callTime: string;
  callClinic: string;
  other: string;
  visia: boolean;
}

const EMPTY: FormState = { interest: [], clinic: "Uptown", day: null, time: null, via: ["Call", "Text"], first: "", callTime: "", callClinic: "Either", other: "", visia: true };

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
 * call. Front end only for now: nothing is sent anywhere and no payment is taken.
 */
export function BookForm({ thanksId, summary = false, compact = false }: BookFormProps) {
  const box = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<BookPath | null>(null);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState<FormState>(EMPTY);
  const [hold, setHold] = useState(0);

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
  const keyOf = (n: number, p: BookPath | null) => (n < 3 ? String(n) : `${n}${p === "call" ? "c" : "b"}`);
  const cur = keyOf(step, path);
  const go = (n: number, p: BookPath | null = path) => {
    setErr("");
    setStep(n);
    /* keeps the new step's question in view on phones */
    setTimeout(() => {
      const l = box.current?.querySelector<HTMLElement>(`[data-step="${keyOf(n, p)}"] legend`);
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
    setPath(p);
    go(3, p);
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
    if (step === 3 && path === "book" && (!f.day || !f.time)) {
      setErr("Please pick a day and a time.");
      return;
    }
    go(step + 1);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      setErr("Choose how to continue: book a time now, or have us call you.");
      return;
    }
    if (step < flow.length - 1) {
      next();
      return;
    }
    if (path === "call" && !f.callTime) {
      setErr("Please choose a time of day.");
      return;
    }
    if (path === "book" && (!f.day || !f.time)) {
      setErr("Please pick a day and a time.");
      return;
    }
    setHold(box.current ? box.current.offsetHeight : 0);
    setSent(true);
  };
  const reset = () => {
    setSent(false);
    setPath(null);
    setF((o) => ({ ...o, interest: [], other: "", visia: true, day: null, time: null, callTime: "" }));
    go(0, null);
  };

  const when = f.day && f.time ? `${bookDay(f.day)}, ${bookHour(f.time)}` : null;
  const clinicName = (v: string) => (v === "Either" ? "Either clinic" : (BOOK_CLINIC_OPTIONS.find(([x]) => x === v)?.[1] ?? v));
  const clinicPhone = (CLINICS.find((c) => c.name === f.clinic) ?? CLINICS[0]).phone;
  const legend = `scroll-mt-24 font-aeonik ${compact ? "text-[20px]" : "text-[clamp(21px,1.9vw,26px)]"} font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink outline-hidden`;
  const label = "mb-1.5 block font-inter text-[13px] font-semibold text-ndm-ink";
  /* The prototype also puts "items-start" on the two choice tiles, but its Tailwind 3 lets "items-center"
     win when both are present, so the tiles are centred; "items-start" is left out to keep them that way. */
  const tile = "flex min-h-[64px] items-center gap-3 rounded-[14px] border px-4 py-3 text-left font-inter transition-colors focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-ndm-blue/25";
  const concern = f.interest.map((t) => (t === BOOK_OTHER ? f.other.trim() || BOOK_OTHER : t)).join(", ");
  const visiaRow: [string, string | null] = ["VISIA® skin analysis", f.visia ? "Included, free" : "Not added"];
  const rows: [string, string | null][] =
    path === "call"
      ? [["Concerns", concern], visiaRow, ["Next step", "We call you"], ["Best time", f.callTime], ["Clinic", clinicName(f.callClinic)]]
      : [["Concerns", concern], visiaRow, ["Clinic", clinicName(f.clinic)], ["Day and time", when]];
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
              You’re booked{f.first ? `, ${f.first}` : ""}.
            </p>
            <p className="max-w-[46ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">
              Your free consultation{f.visia ? ", with your VISIA® skin analysis," : ""} is on <b className="font-semibold text-ndm-ink">{when}</b> at our {f.clinic} clinic. You’ll receive the details by email and text.
            </p>
            <p className="font-inter text-[13px] leading-[1.5] text-ndm-muted">
              Need to change it? Call{" "}
              <a href={tel(clinicPhone)} className="font-semibold text-ndm-ink hover:underline">
                {clinicPhone}
              </a>{" "}
              at least {BOOK_NOTICE} before.
            </p>
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
        </fieldset>

        <fieldset data-step="2" className={stepClass("2")} {...stepAttr("2")}>
          <legend tabIndex={-1} className={legend}>
            How would you like to continue?
          </legend>
          <p className="mt-2 font-inter text-[14px] leading-[1.5] text-ndm-muted">Book a time yourself, or let us call you to find one.</p>
          <div className={`mt-5 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
            <button type="button" onClick={() => choose("book")} className={`${tile} min-h-[96px] border-ndm-deep bg-ndm-deep text-white hover:border-[#0A4F7A] hover:bg-[#0A4F7A]`}>
              <span aria-hidden="true" className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                  <path d="M3.5 9.5h17M8 3v4M16 3v4" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-aeonik text-[clamp(20px,1.6vw,23px)] leading-[1.15] tracking-[-0.01em]">Book a time now</span>
                <span className="mt-1.5 block text-[14px] leading-[1.45] text-white/85">Choose a clinic, day and time.</span>
              </span>
              <IconArrow size={15} className="mt-2 shrink-0" />
            </button>
            <button type="button" onClick={() => choose("call")} className={`${tile} min-h-[96px] border-ndm-ink/15 bg-white text-ndm-ink hover:border-ndm-ink/40`}>
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

        <fieldset data-step="3b" className={stepClass("3b")} {...stepAttr("3b")}>
          <legend tabIndex={-1} className={legend}>
            Where and when?
          </legend>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Clinic">
            {BOOK_CLINIC_OPTIONS.map(([v, t]) => (
              <BookChip key={v} name="clinic" value={v} checked={f.clinic === v} onChange={() => set("clinic", v)}>
                {t}
              </BookChip>
            ))}
          </div>
          <div className="mt-4">
            <BookCalendar day={f.day} time={f.time} stack={compact} onDay={(d) => setF((o) => ({ ...o, day: d, time: null }))} onTime={(h) => set("time", h)} />
          </div>
          <p className="mt-3 font-inter text-[12px] text-ndm-muted">We will confirm your time by email and text.</p>
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
          <p className="mt-5 font-inter text-[13px] font-semibold text-ndm-ink">Preferred clinic</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Preferred clinic">
            {[["Either", "Either clinic"] as [string, string], ...BOOK_CLINIC_OPTIONS].map(([v, t]) => (
              <BookChip key={v} name="callclinic" value={v} checked={f.callClinic === v} onChange={() => set("callClinic", v)}>
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
          <Button as="button" type="button" v="line" sm onClick={() => go(step - 1)}>
            Back
          </Button>
        )}
        {/* own keys, so Continue is never reused as the submit button (that would submit the step it just opened) */}
        {step === 2 ? null : step < flow.length - 1 ? (
          <Button key="next" as="button" type="button" v="ink" sm onClick={next}>
            Continue
          </Button>
        ) : path === "book" ? (
          <Button key="pay" as="button" type="submit" v="ink" className="min-w-0 flex-1 sm:flex-none">
            Book this time
          </Button>
        ) : (
          <Button key="call" as="button" type="submit" v="ink" className="min-w-0 flex-1 sm:flex-none">
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
            <a key={c.id} href={tel(c.phone)} className="block font-semibold text-white hover:underline">
              {c.name} {c.phone}
            </a>
          ))}
        </p>
      </aside>
    </div>
  );
}
