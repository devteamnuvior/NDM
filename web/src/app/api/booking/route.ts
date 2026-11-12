import { BOOK_CALL_TIMES, BOOK_CLINIC_OPTIONS, BOOK_INTEREST_GROUPS, BOOK_NOT_SURE, BOOK_OTHER, bookHours } from "@/config/booking";
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
const list = (value: unknown, allowed: (item: string) => boolean, max: number): string[] | null =>
  Array.isArray(value) && value.length <= max && value.every((item) => typeof item === "string" && allowed(item)) ? [...new Set(value as string[])] : null;

/** Today's date and hour at the clinics (Toronto), whatever clock this server runs on. */
function clinicNow(): { day: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

/** A pickable request time: a real day that is not closed, an hour the clinic offers, still ahead, within a year. */
function slotProblem(day: unknown, hour: unknown): string | null {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day) || typeof hour !== "number" || !Number.isInteger(hour)) return "Please pick a day and a time.";
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day) return "Please pick a day and a time.";
  const hours = bookHours(date.getUTCDay());
  if (!hours || hour < hours[0] || hour > hours[1]) return "That time is not open. Please pick another day or time.";
  const now = clinicNow();
  if (day < now.day || (day === now.day && hour <= now.hour)) return "That time has passed. Please pick another day or time.";
  const limit = new Date(`${now.day}T00:00:00Z`);
  limit.setUTCFullYear(limit.getUTCFullYear() + 1);
  if (date > limit) return "Please pick a day within the next twelve months.";
  return null;
}

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
  };

  if (form.path === "book") {
    if (typeof form.clinic !== "string" || !CLINICS.includes(form.clinic)) return invalid("Please choose a clinic.");
    const problem = slotProblem(form.day, form.hour);
    if (problem) return invalid(problem);
    Object.assign(input, { path: "book", clinic: form.clinic, day: form.day, hour: form.hour });
  } else if (form.path === "call") {
    if (typeof form.callTime !== "string" || !BOOK_CALL_TIMES.includes(form.callTime)) return invalid("Please choose a time of day.");
    if (typeof form.clinic !== "string" || (form.clinic !== "Either" && !CLINICS.includes(form.clinic))) return invalid("Please choose a clinic.");
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
    if (error.kind === "http" && error.status === 400) return invalid("Please check your details and try again.");
    /* the kind of failure only: never the visitor's details */
    console.error("[booking] the consultation request could not be saved:", error.kind, error.status ?? "");
    return unreachable();
  }
}
