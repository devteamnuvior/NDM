import "server-only";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";

/**
 * Consultation requests (the "Book a free consultation" form), kept by WordPress as private posts of
 * the post type "Consultation" (the ndm-headless plugin's ndm/v1/bookings route). This site
 * only writes them: nothing here can read a request back.
 */

const PATH = "ndm/v1/bookings";

export interface BookingRequestInput {
  first: string;
  last: string;
  phone: string;
  email: string;
  /** "Call", "Text", "Email". */
  via: string[];
  interests: string[];
  /** The visitor's own words for "Something else". */
  other: string;
  visia: boolean;
  path: "book" | "call";
  /** "Uptown", "Downtown" or "Either clinic". */
  clinic: string;
  /** "2026-12-01" and the hour (24 h), when a time was picked. */
  day?: string;
  hour?: number;
  /** "Morning", "Afternoon" or "Early evening", when a call was asked for. */
  callTime?: string;
  /** Path of the page the form was sent from. */
  page: string;
}

/** Saves one request. Needs the secret the two servers share (REVALIDATE_SECRET). */
export async function saveBookingRequest(input: BookingRequestInput): Promise<{ number: string }> {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new WordPressError("config", "REVALIDATE_SECRET is not set: consultation requests cannot be saved.", { path: PATH });
  }
  const { data } = await wpFetch<{ saved?: boolean; number?: string }>(PATH, { body: input, headers: { "X-NDM-Site-Key": secret }, timeoutMs: 15_000 });
  if (data.saved !== true || typeof data.number !== "string") {
    throw new WordPressError("parse", "WordPress did not confirm the consultation request.", { path: PATH });
  }
  return { number: data.number };
}
