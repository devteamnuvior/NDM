"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { IconArrow, IconClose, IconPhone } from "@/components/ui/icons";
import { CHAT_AGENT, CHAT_PRESETS, chatAnswer, type ChatLink } from "@/config/chat";
import { ACTIONS } from "@/config/routes";
import { CLINICS } from "@/config/site";
import { useMedia } from "@/hooks/use-media";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { armChime, playChime } from "@/lib/chime";
import { tel } from "@/lib/routes";

/* the agent's photo is a small local file, shown at its own size */
/* eslint-disable @next/next/no-img-element */

const NOTE_KEY = "ndm-chat-note";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const IconChat = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4.5 18.5V7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4.5 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
const IconSend = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 12 20 4l-6 16-2.5-6.5L4 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const Dots = () => (
  <>
    {[0, 1, 2].map((d) => (
      <i key={d} className="chat-dot size-1.5 rounded-full bg-ndm-muted" style={{ animationDelay: `${d * 0.15}s` }} />
    ))}
  </>
);

interface Message {
  me?: boolean;
  text: string;
  link?: ChatLink;
}

/**
 * Chat assistant: a launcher in the bottom corner, a note that pops up a few seconds after the page
 * settles (once per visit), and a panel offering common questions or a free-text box. Client only.
 * @param hidden another overlay is open: the launcher steps out of the way
 */
export function ChatBot({ hidden }: { hidden: boolean }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(false);
  const [noteTyping, setNoteTyping] = useState(true);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [avoid, setAvoid] = useState(0);
  const [clear, setClear] = useState(false); /* phones: true once nothing marked data-pill-avoid sits mid-screen, so the note never covers it */
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const small = useMedia("(max-width: 767px)");

  /* the note appears once per visit, a few seconds after the page settles */
  useEffect(() => {
    armChime();
    let seen = false;
    try {
      seen = sessionStorage.getItem(NOTE_KEY) === "closed";
    } catch {
      /* storage blocked */
    }
    if (seen) return;
    const t = setTimeout(() => setNote(true), 4500);
    return () => clearTimeout(t);
  }, []);

  /* the pop-up first shows the assistant typing, then the message arrives with a soft chime */
  useEffect(() => {
    if (!note) return;
    const start = requestAnimationFrame(() => setNoteTyping(true));
    const t = setTimeout(
      () => {
        setNoteTyping(false);
        playChime();
      },
      reduced() ? 0 : 1500,
    );
    return () => {
      cancelAnimationFrame(start);
      clearTimeout(t);
    };
  }, [note]);

  /* on phones the button sits above the floating search button and lifts over the cart bar like it; on
     wide screens it sits above the cart bar. Also re-checked every half second, since the cart bar slides
     in without a scroll */
  const measure = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    let top = vh;
    document.querySelectorAll("[data-float-avoid]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.top < vh && r.bottom > vh - 120 && r.right > vw - 90) top = Math.min(top, r.top);
    });
    setAvoid(top < vh ? vh - top + 12 : 0);
    setClear(
      !Array.from(document.querySelectorAll("[data-pill-avoid]")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < vh * 0.5 && r.bottom > vh * 0.5;
      }),
    );
  };
  useOnScroll(measure);
  const remeasure = useEffectEvent(measure);
  useEffect(() => {
    const t = setInterval(remeasure, 500);
    return () => clearInterval(t);
  }, []);

  /* a new message, or the typing dots, scrolls the conversation to its end; the greeting itself starts from the top */
  const started = useRef(false);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [msgs, typing]);

  const noteOff = () => {
    setNote(false);
    try {
      sessionStorage.setItem(NOTE_KEY, "closed");
    } catch {
      /* storage blocked */
    }
  };
  const openPanel = () => {
    noteOff();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (!window.matchMedia("(max-width: 767px)").matches) input.current?.focus({ preventScroll: true });
    }, 200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ask = (q: string, preset?: (typeof CHAT_PRESETS)[number]) => {
    const v = q.trim();
    if (!v || typing) return;
    setMsgs((m) => [...m, { me: true, text: v }]);
    setText("");
    setTyping(true);
    const r = preset ? { answer: preset[1], link: preset[2] } : chatAnswer(v);
    setTimeout(
      () => {
        setTyping(false);
        setMsgs((m) => [...m, { text: r.answer, link: r.link }]);
      },
      reduced() ? 0 : 700,
    );
  };

  const asked = new Set(msgs.filter((m) => m.me).map((m) => m.text));
  const left = CHAT_PRESETS.filter(([q]) => !asked.has(q));
  /* wide screens: sits above the cart bar when it shows (same corner) */
  const bottom = small ? Math.max(16, avoid) + 64 : Math.max(24, avoid);
  const off = hidden && !open;

  return (
    <>
      {note && !open && !off && (!small || clear) && (
        <div
          role="status"
          className="chat-pop fixed z-[61] flex max-w-[calc(100vw-88px)] items-center gap-2.5 rounded-[18px] rounded-br-[6px] bg-white py-2 pr-9 pl-2 shadow-[0_24px_50px_-22px_rgba(11,15,19,.5)] ring-1 ring-ndm-ink/[.06]"
          style={small ? { right: 16, bottom: `calc(${bottom + 64}px + env(safe-area-inset-bottom))` } : { right: 24 + 58 + 12, bottom: bottom + 8 }}
        >
          <span className="relative size-9 shrink-0">
            <img src={CHAT_AGENT.img} alt="" className="size-9 rounded-full object-cover" />
            <i className="absolute right-0 bottom-0 size-2.5 rounded-full bg-[#3DDC84] ring-2 ring-white" />
          </span>
          {noteTyping ? (
            <span className="flex gap-1 px-1 py-2" aria-label="Typing">
              <Dots />
            </span>
          ) : (
            <button type="button" onClick={openPanel} className="chat-pop-msg py-1 text-left font-inter text-[14px] font-medium whitespace-nowrap text-ndm-ink hover:text-ndm-deep">
              Hi, how can I help?
            </button>
          )}
          <button type="button" onClick={noteOff} aria-label="Dismiss message" className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ndm-muted hover:bg-ndm-mist hover:text-ndm-ink">
            <IconClose size={13} />
          </button>
        </div>
      )}
      <button
        ref={btn}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close chat" : "Chat with NewDermaMed"}
        tabIndex={off ? -1 : 0}
        className={`chat-btn chat-launch fixed z-[61] grid size-[56px] place-items-center rounded-full text-white md:size-[62px] ${off ? "is-off" : ""} ${note && !open ? "has-note" : ""} ${open ? "is-open" : ""}`}
        style={{ right: small ? 16 : 24, bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}
      >
        {open ? (
          <IconClose />
        ) : (
          <>
            <img src={CHAT_AGENT.img} alt="" className="chat-launch-img" />
            <span aria-hidden="true" className="chat-launch-badge">
              <IconChat size={13} />
            </span>
          </>
        )}
        {note && !open && (
          <i aria-hidden="true" className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#E5484D] px-1 font-inter text-[11px] leading-none font-semibold text-white not-italic ring-2 ring-white">
            1
          </i>
        )}
      </button>
      <section
        id="chat-panel"
        role="dialog"
        aria-label={`Chat with ${CHAT_AGENT.name} from NewDermaMed`}
        aria-hidden={!open}
        inert={!open}
        data-lenis-prevent=""
        className={`chat-panel fixed z-[62] flex flex-col overflow-hidden bg-white shadow-[0_40px_80px_-30px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/[.06] ${open ? "is-on" : ""} ${small ? "inset-x-2 top-[76px] bottom-2 rounded-[26px]" : "h-[min(640px,calc(100vh-140px))] w-[400px] rounded-[26px]"}`}
        style={small ? {} : { right: 24, bottom: bottom + 76 }}
      >
        <header className={`chat-head relative px-5 pt-4 text-white ${msgs.length ? "pb-4" : "pb-14"}`}>
          <div className="flex items-center gap-3">
            <span className="relative size-11 shrink-0">
              <img src={CHAT_AGENT.img} alt="" className="size-11 rounded-full object-cover ring-2 ring-white/40" />
              <i className="absolute right-0 bottom-0 size-3 rounded-full bg-[#3DDC84] ring-2 ring-[#0F80C3]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-inter text-[15px] font-semibold">
                {CHAT_AGENT.name} <span className="font-normal text-white/75">· NewDermaMed</span>
              </span>
              <span className="block font-inter text-[12px] text-white/75">Virtual assistant, our care team follows up</span>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <IconClose size={16} />
            </button>
          </div>
          {!msgs.length && (
            <p className="mt-5 font-aeonik text-[26px] leading-[1.1] tracking-[-0.02em]">
              Hi there,
              <br />
              <span className="tt-strong">how can we help?</span>
            </p>
          )}
        </header>
        {!msgs.length && (
          <div className="chat-quick relative z-[1] -mt-9 grid grid-cols-3 gap-2 px-4">
            <a href={ACTIONS.book} onClick={() => setOpen(false)}>
              <i aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3.5" y="5" width="17" height="15" rx="3" />
                  <path d="M8 3v4M16 3v4M3.5 10h17" />
                </svg>
              </i>
              Book a free consultation
            </a>
            {CLINICS.map((c) => (
              <a key={c.id} href={tel(c.phone)}>
                <i aria-hidden="true">
                  <IconPhone />
                </i>
                Call {c.name}
                <span className="-mt-1.5 block text-[11px] font-normal tracking-[-0.01em] whitespace-nowrap text-ndm-muted tabular-nums">{c.phone}</span>
              </a>
            ))}
          </div>
        )}
        <div ref={list} className="chat-body flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
          <div className="chat-msg max-w-[88%] rounded-[16px] rounded-tl-[6px] bg-white px-3.5 py-2.5 font-inter text-[14px] leading-[1.5] text-ndm-ink shadow-[0_6px_16px_-12px_rgba(27,36,43,.4)]">
            Hi, I’m {CHAT_AGENT.name} from NewDermaMed. I can help with booking, our two Toronto clinics, hours, payment plans and treatments. Pick a question or type your own.
          </div>
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg flex ${m.me ? "justify-end" : ""}`}>
              <div className={`max-w-[88%] rounded-[16px] px-3.5 py-2.5 font-inter text-[14px] leading-[1.5] ${m.me ? "rounded-tr-[6px] bg-ndm-deep text-white" : "rounded-tl-[6px] bg-white text-ndm-ink shadow-[0_6px_16px_-12px_rgba(27,36,43,.4)]"}`}>
                {m.text}
                {m.link && (
                  <a
                    href={m.link[1]}
                    {...(/^http/.test(m.link[1]) ? { target: "_blank", rel: "noopener" } : {})}
                    onClick={() => {
                      if (m.link && m.link[1].startsWith("#") && m.link[1] !== ACTIONS.book) setOpen(false);
                    }}
                    className="mt-2 flex w-fit items-center gap-1.5 font-medium text-ndm-deep underline-offset-4 hover:underline"
                  >
                    {m.link[0]}
                    <IconArrow size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg flex w-fit gap-1 rounded-[16px] rounded-tl-[6px] bg-white px-3.5 py-3 shadow-[0_6px_16px_-12px_rgba(27,36,43,.4)]" aria-label="Typing">
              <Dots />
            </div>
          )}
          {left.length > 0 && !typing && (
            <div className="pt-1">
              <p className="font-inter text-[11.5px] font-medium tracking-[.12em] text-ndm-muted uppercase">{msgs.length ? "You can also ask" : "Common questions"}</p>
              <ul className="mt-2 grid gap-1.5" role="list">
                {left.slice(0, msgs.length ? 3 : 5).map((pq) => (
                  <li key={pq[0]}>
                    <button
                      type="button"
                      onClick={() => ask(pq[0], pq)}
                      className="group flex w-full items-center justify-between gap-3 rounded-[14px] bg-white px-3.5 py-2.5 text-left font-inter text-[13.5px] text-ndm-ink ring-1 ring-ndm-ink/[.07] transition hover:text-ndm-deep hover:ring-ndm-deep/50"
                    >
                      {pq[0]}
                      <IconArrow size={11} className="shrink-0 text-ndm-deep transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(text);
          }}
          className="border-t border-ndm-ink/[.08] bg-white p-3"
        >
          <div className="flex items-center gap-2 rounded-full border border-ndm-ink/15 bg-white pr-1.5 pl-4 focus-within:border-ndm-blue focus-within:ring-4 focus-within:ring-ndm-blue/15">
            <input
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your question"
              aria-label="Type your question"
              maxLength={300}
              className="h-11 min-w-0 flex-1 bg-transparent font-inter text-[15px] text-ndm-ink outline-hidden placeholder:text-[#8A949B]"
            />
            <button type="submit" disabled={!text.trim() || typing} aria-label="Send" className="grid size-9 shrink-0 place-items-center rounded-full bg-ndm-deep text-white transition disabled:opacity-35">
              <IconSend />
            </button>
          </div>
          <p className="mt-2 px-1 font-inter text-[11px] leading-[1.4] text-ndm-muted">General information only, not medical advice. Please do not share personal health details here.</p>
        </form>
      </section>
    </>
  );
}
