import { BOOK_CALL_TIMES, BOOK_CLINIC_OPTIONS, BOOK_INTEREST_GROUPS, BOOK_NOT_SURE, BOOK_OTHER } from "@/config/booking";
import { WordPressError, isWordPressConfigured, saveBookingRequest, type BookingRequestInput } from "@/lib/wordpress";

/**
 * POST /api/booking: the "Book a free consultation" form (the booking section, the pop-up behind every
 * Book Free Consultation button, and the forms of the treatment pages). The request is checked here and
 * saved in WordPress as a private "Consultation" record; the answer to the browser says only whether
 * it was saved. Nothing about the visitor is kept on this server or written to its logs.
 */

type Result = { ok: true } | { ok: false; reason: "invalid" | "busy" | "unreachable"; message: string };

const CALL_US = "please call the clinic.";
const reply = (body: Result, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
const invalid = (message: string) => reply({ ok: false, reason: "invalid", message }, 400);

const INTERESTS = new Set<string>([...BOOK_INTEREST_GROUPS.flatMap(([, options]) => options), BOOK_NOT_SURE, BOOK_OTHER]);
const VIA = ["Call", "Text", "Email"];
const CLINICS = BOOK_CLINIC_OPTIONS.map(([value]) => value);

/* a small brake on repeated requests from one address, in memory, never stored; a real limiter belongs in front of the site */
const WINDOW_MS = 10 * 60_000;
const MAX_IN_WINDOW = 6;
const recent = new Map<string, number[]>();
function tooMany(address: string): boolean {
  const now = Date.now();
  const times = (recent.get(address) ?? []).filter((t) => now - t < WINDOW_MS);
  times.push(now);
  recent.set(address, times);
  if (recent.size > 5000) recent.clear();
  return times.length > MAX_IN_WINDOW;
}

const text = (value: unknown, max: number): string | null => (typeof value === "string" && value.trim().length <= max ? value.trim() : null);
/* the link's utm values kept for the visit: five short plain values at most, anything else is dropped */
function utmOf(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "content", "term"]) {
    const v = text((value as Record<string, unknown>)[k], 100);
    if (v && /^[\w\-.~+ ]+$/.test(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}
const list = (value: unknown, allowed: (item: string) => boolean, max: number): string[] | null =>
  Array.isArray(value) && value.length <= max && value.every((item) => typeof item === "string" && allowed(item)) ? [...new Set(value as string[])] : null;

export async function POST(request: Request) {
  /* only this site's own pages may send the form */
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin) {
    let from = "";
    try {
      from = new URL(origin).host;
    } catch {
      /* not an address */
    }
    if (!host || from !== host) return reply({ ok: false, reason: "invalid", message: `The request could not be sent, ${CALL_US}` }, 403);
  }

  let form: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw new Error("not an object");
    form = body as Record<string, unknown>;
  } catch {
    return invalid("The request could not be read. Please reload the page and try again.");
  }

  /* left empty by people, filled in by form-filling robots */
  if (form.company) return reply({ ok: false, reason: "busy", message: `The request could not be sent, ${CALL_US}` }, 400);

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(address)) return reply({ ok: false, reason: "busy", message: `Too many requests in a short time. Please wait a few minutes, or ${CALL_US}` }, 429);

  const interests = list(form.interests, (item) => INTERESTS.has(item), 60);
  if (!interests?.length) return invalid("Please choose at least one option.");
  const other = text(form.other, 80);
  if (other === null || (interests.includes(BOOK_OTHER) && !other)) return invalid("Please tell us in a few words what you’d like to address.");

  const first = text(form.first, 60);
  const last = text(form.last, 60);
  const phone = text(form.phone, 30);
  const email = text(form.email, 120);
  if (!first || !last || !phone || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (phone.match(/\d/g) ?? []).length < 7 || !/^[\d\s()+.\-x]+$/i.test(phone)) {
    return invalid("Please add your name, mobile number and a valid email.");
  }
  const via = list(form.via, (item) => VIA.includes(item), 3);
  if (!via?.length) return invalid("Please choose at least one way to reach you.");

  const page = text(form.page, 200);
  const input: BookingRequestInput = {
    first,
    last,
    phone,
    email,
    via,
    interests,
    other: interests.includes(BOOK_OTHER) ? other : "",
    visia: form.visia === true,
    path: "call",
    clinic: "",
    page: page && /^\/[\w\-./]*$/.test(page) ? page : "",
    utm: utmOf(form.utm),
  };

  const clinicOk = typeof form.clinic === "string" && (form.clinic === "Either" || CLINICS.includes(form.clinic));
  if (form.path === "online") {
    /* the day and time are chosen in the clinic's own booking calendar, which opens next; the clinic is chosen on
       the site (user, 2026-11-19). A page loaded before that sends none: WordPress then says "Online calendar". */
    if (form.clinic !== undefined && !clinicOk) return invalid("Please choose a clinic.");
    Object.assign(input, { path: "online", clinic: !clinicOk ? "" : form.clinic === "Either" ? "Either clinic" : form.clinic });
  } else if (form.path === "call") {
    if (typeof form.callTime !== "string" || !BOOK_CALL_TIMES.includes(form.callTime)) return invalid("Please choose a time of day.");
    if (!clinicOk) return invalid("Please choose a clinic.");
    Object.assign(input, { clinic: form.clinic === "Either" ? "Either clinic" : form.clinic, callTime: form.callTime });
  } else {
    return invalid("Choose how to continue: book a time now, or have us call you.");
  }

  const unreachable = () => reply({ ok: false, reason: "unreachable", message: `Your request could not be sent right now. Please try again in a moment, or ${CALL_US}` }, 503);
  if (!isWordPressConfigured()) return unreachable();

  try {
    await saveBookingRequest(input);
    return reply({ ok: true }, 201);
  } catch (error) {
    if (!(error instanceof WordPressError)) throw error;
    /* "online": the visitor goes on to the booking calendar either way, so only the form's own checks above hold them back */
    if (error.kind === "http" && error.status === 400 && input.path !== "online") return invalid("Please check your details and try again.");
    /* the kind of failure only: never the visitor's details */
    console.error("[booking] the consultation request could not be saved:", error.kind, error.status ?? "");
    return unreachable();
  }
}
