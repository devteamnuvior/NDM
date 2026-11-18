"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconCheckBadge, IconChevron, IconMail } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ABOUT_CLINIC_CHOICES, ABOUT_CLINICS, ABOUT_EMAIL } from "@/config/about";
import { useReveal } from "@/hooks/use-reveal";
import { tel } from "@/lib/routes";
import type { AboutCopy } from "@/types/about";
import { withBase } from "@/lib/base-path";
import { pushLead } from "@/lib/lead-event";

const FIELD = "block h-12 w-full rounded-[10px] border border-ndm-ink/15 bg-white px-3.5 font-inter text-[14.5px] text-ndm-ink placeholder:text-[#7D868D] outline-hidden transition focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";

/**
 * Contact us: both clinics' details and a message form. The message goes to POST /api/contact, which
 * saves it in WordPress ("Messages") and emails it to the clinic; the thank-you shows only once it was
 * saved, and then the lead event goes to Tag Manager (lib/lead-event.ts, no visitor details).
 */
export function AboutContact({ copy }: { copy: AboutCopy["contact"] }) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const [sent, setSent] = useState(false);
  const [clinic, setClinic] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    const field = (name: string) => String(fd.get(name) ?? "").trim();
    setBusy(true);
    setErr("");
    let problem = `Your message could not be sent right now. Please try again in a moment, or email ${ABOUT_EMAIL}.`;
    try {
      const answer = await fetch(withBase("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: field("name"), phone: field("phone"), email: field("email"), clinic, message: field("message"), page: window.location.pathname, company: field("company") }),
      });
      const result = (await answer.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (answer.ok && result?.ok === true) {
        pushLead("contact");
        setSent(true);
        return;
      }
      if (typeof result?.message === "string" && result.message) problem = result.message;
    } catch {
      /* no connection: the message above */
    } finally {
      setBusy(false);
    }
    setErr(problem);
  };
  return (
    <section ref={section} id="contact" aria-labelledby="contact-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-[clamp(48px,6vw,110px)]">
        <div>
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="contact-title"
            className="rv mt-5"
            lead={
              <>
                {copy.lead}
                <br />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mt-5 max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {copy.text}
          </p>
          <ul className="rv mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" role="list" style={{ transitionDelay: ".14s" }}>
            {ABOUT_CLINICS.map((c) => (
              <li key={c.id} className="rounded-[20px] bg-white p-5 ring-1 ring-ndm-ink/[.07]">
                <p className="font-aeonik text-[21px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{c.name} clinic</p>
                <p className="mt-1.5 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">
                  {c.address[0]}
                  <br />
                  {c.address[1]}
                </p>
                <p className="mt-2 font-inter text-[15px] font-medium text-ndm-ink tabular-nums">{c.phone}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button href={tel(c.phone)} v="ink" sm className="btn-buy" aria-label={`Call the ${c.name} clinic at ${c.phone}`}>
                    Call
                  </Button>
                  <Button href={`sms:${tel(c.phone).replace("tel:", "")}`} v="line" sm aria-label={`Text the ${c.name} clinic at ${c.phone}`}>
                    Text
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="rv mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-inter text-[14.5px] text-ndm-ink" style={{ transitionDelay: ".16s" }}>
            <a href={withBase(`mailto:${ABOUT_EMAIL}`)} className="inline-flex items-center gap-2 underline-offset-4 hover:text-ndm-deep hover:underline">
              <IconMail size={15} />
              {ABOUT_EMAIL}
            </a>
            <span className="text-ndm-muted">Mon to Fri 10am to 7pm · Sat 10am to 5pm</span>
          </p>
        </div>
        <div className="rv rounded-[22px] bg-white p-[clamp(20px,2.4vw,32px)] ring-1 ring-ndm-ink/[.07]" style={{ transitionDelay: ".12s" }}>
          {sent ? (
            <div role="status" className="flex min-h-[360px] flex-col items-start justify-center">
              <span className="grid size-11 place-items-center rounded-full bg-ndm-blue/10 text-ndm-blue">
                <IconCheckBadge />
              </span>
              <p className="mt-4 font-aeonik text-[26px] tracking-[-0.02em] text-ndm-ink">Thank you, your message is in.</p>
              <p className="mt-2 font-inter text-[14.5px] leading-[1.55] text-ndm-muted">Our team will get back to you during clinic hours.</p>
              <button
                onClick={() => {
                  setSent(false);
                  setClinic("");
                }}
                className="mt-5 font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void send(e)} aria-label="Send us a message">
              <h3 className="font-aeonik text-[26px] leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink">Send us a message</h3>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <input required name="name" maxLength={80} autoComplete="name" placeholder="Your name" aria-label="Your name" className={FIELD} />
                <input type="tel" name="phone" maxLength={30} autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone (optional)" className={FIELD} />
                <span className="sm:col-span-2">
                  <input required type="email" name="email" maxLength={120} autoComplete="email" placeholder="Your email" aria-label="Your email" className={FIELD} />
                </span>
                <span className="sm:col-span-2">
                  <span className="relative block">
                    <select required name="clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} aria-label="Which clinic?" className={`${FIELD} appearance-none pr-10`} style={clinic === "" ? { color: "#7D868D" } : undefined}>
                      <option value="" disabled>
                        Which clinic?
                      </option>
                      {ABOUT_CLINIC_CHOICES.map(([name, street]) => (
                        <option key={name} value={name} className="text-ndm-ink">
                          {name}, {street}
                        </option>
                      ))}
                    </select>
                    <IconChevron className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ndm-muted" />
                  </span>
                </span>
                <textarea required name="message" maxLength={2000} rows={4} placeholder="How can we help?" aria-label="How can we help?" className={`${FIELD} h-auto resize-none py-3 sm:col-span-2`} />
              </div>
              {/* left empty by people, filled in by form-filling robots */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
              {err && (
                <p role="alert" className="mt-4 font-inter text-[13.5px] leading-[1.5] text-[#B42318]">
                  {err}
                </p>
              )}
              <Button v="ink" block className="btn-buy mt-4" type="submit" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
              </Button>
              <p className="mt-3 font-inter text-[12px] leading-[1.5] text-ndm-muted">Please don’t include personal health details in this form. We’ll discuss those with you in person.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
