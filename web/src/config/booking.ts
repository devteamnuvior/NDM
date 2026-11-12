/** Consultation booking: the picker's categories and the fixed choices of the form. */

/** The picker's categories; labels match the concern and treatment pages. An option may sit in more than one. */
export const BOOK_INTEREST_GROUPS: [category: string, options: string[]][] = [
  ["Face", ["Wrinkles & fine lines", "Volume loss", "Sagging skin & jowls", "Double chin", "Thin lips", "Dark circles & under-eye hollows"]],
  ["Skin", ["Acne", "Acne scars", "Rosacea & redness", "Melasma", "Pigmentation & sun spots", "Texture & pores", "Moles & skin lesions"]],
  ["Body", ["Stubborn fat", "Cellulite", "Stretch marks", "Loose skin", "Excessive sweating", "Spider & varicose veins", "Unwanted hair"]],
  ["Hair", ["Thinning hair", "Hair loss"]],
  ["Injectables", ["Botox®", "Dermal Fillers", "Lip fillers", "Under-eye filler", "Skin boosters", "Aptos Thread Lift", "Bio-stimulator · Sculptra®", "Bio-stimulator · Radiesse®"]],
  ["Bio-stimulators", ["Bio-stimulator · Aptos Thread Lift", "Bio-stimulator · Sculptra®", "Bio-stimulator · Radiesse®"]],
  ["Thread lift", ["Aptos Thread Lift", "Non-surgical facelift", "Neck lift", "Jawline lift", "Eyebrow lift", "Nose lift"]],
  ["Treatments", ["Laser Hair Removal", "Microneedling", "Laser skin resurfacing", "Laser skin tightening", "Photo-rejuvenation (IPL)", "Chemical peels", "CoolSculpting®", "VISIA® skin analysis"]],
];

export const BOOK_NOT_SURE = "Not sure, I’d like a skin analysis";
/** Last concern option: opens a short text box. */
export const BOOK_OTHER = "Something else";

/** Free reschedule or cancel up to this long before the visit. */
export const BOOK_NOTICE = "24 hours";

export type BookPath = "book" | "call";
/** Step names of each path: book a time now, or ask for a call. */
export const BOOK_FLOW: Record<BookPath, string[]> = {
  book: ["Your concern", "Your details", "Book or call", "Clinic, day and time"],
  call: ["Your concern", "Your details", "Book or call", "Best time to call"],
};
export const BOOK_CALL_TIMES = ["Morning", "Afternoon", "Early evening"];
export const BOOK_CLINIC_OPTIONS: [value: string, label: string][] = [
  ["Uptown", "Uptown, Yonge & Sheppard"],
  ["Downtown", "Downtown, Bay & College"],
];

/** The clinic's live online booking calendar. */
export const BOOK_ONLINE_URL = "https://newdermamedlaserclinic.com/online-booking/";

/**
 * Request times of a day, as hours. Monday to Friday 9 to 7, Saturday 10 to 5, Sunday closed; one slot
 * every hour, the last an hour before closing. Today: only the times still ahead.
 */
export function bookSlots(d: Date): number[] {
  const w = d.getDay();
  if (w === 0) return [];
  const [a, b] = w === 6 ? [10, 16] : [9, 18];
  const now = new Date();
  const from = d.toDateString() === now.toDateString() ? now.getHours() + 1 : 0;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((h) => h >= from);
}
export const bookHour = (h: number): string => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "pm" : "am"}`;
export const bookDay = (d: Date): string => d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
