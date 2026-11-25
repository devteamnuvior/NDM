import { ABOUT_CLINIC_CHOICES } from "@/config/about";
import { WordPressError, isWordPressConfigured, saveContactMessage } from "@/lib/wordpress";

/**
 * POST /api/contact: the About page's "Send us a message" form. The message is checked here and saved
 * in WordPress as a private "Messages" record, which WordPress also emails to the clinic; the answer to
 * the browser says only whether it was saved. Nothing about the visitor is kept on this server or
 * written to its logs. Built like /api/booking.
 */

type Result = { ok: true } | { ok: false; reason: "invalid" | "busy" | "unreachable"; message: string };

const CALL_US = "please call or email the clinic.";
const reply = (body: Result, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
const invalid = (message: string) => reply({ ok: false, reason: "invalid", message }, 400);

const CLINICS = ABOUT_CLINIC_CHOICES.map(([name]) => name);

/* a small brake on repeated messages from one address, in memory, never stored */
const WINDOW_MS = 10 * 60_000;
const MAX_IN_WINDOW = 5;
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
    if (!host || from !== host) return reply({ ok: false, reason: "invalid", message: `The message could not be sent, ${CALL_US}` }, 403);
  }

  let form: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw new Error("not an object");
    form = body as Record<string, unknown>;
  } catch {
    return invalid("The message could not be read. Please reload the page and try again.");
  }

  /* left empty by people, filled in by form-filling robots */
  if (form.company) return reply({ ok: false, reason: "busy", message: `The message could not be sent, ${CALL_US}` }, 400);

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(address)) return reply({ ok: false, reason: "busy", message: `Too many messages in a short time. Please wait a few minutes, or ${CALL_US}` }, 429);

  const name = text(form.name, 80);
  const email = text(form.email, 120);
  const phone = text(form.phone, 30);
  const message = text(form.message, 2000);
  if (!name) return invalid("Please add your name.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid("Please add a valid email address.");
  if (phone === null || (phone && !/^[\d\s()+.\-x]+$/i.test(phone))) return invalid("Please check your phone number, or leave it empty.");
  if (typeof form.clinic !== "string" || !CLINICS.includes(form.clinic)) return invalid("Please choose a clinic.");
  if (!message) return invalid("Please write your message (at most 2000 characters).");
  const page = text(form.page, 200);

  const unreachable = () => reply({ ok: false, reason: "unreachable", message: `Your message could not be sent right now. Please try again in a moment, or ${CALL_US}` }, 503);
  if (!isWordPressConfigured()) return unreachable();

  try {
    await saveContactMessage({ name, email, phone, clinic: form.clinic, message, page: page && /^\/[\w\-./]*$/.test(page) ? page : "" });
    return reply({ ok: true }, 201);
  } catch (error) {
    if (!(error instanceof WordPressError)) throw error;
    if (error.kind === "http" && error.status === 400) return invalid("Please check your details and try again.");
    /* the kind of failure only: never the visitor's details */
    console.error("[contact] the message could not be saved:", error.kind, error.status ?? "");
    return unreachable();
  }
}
