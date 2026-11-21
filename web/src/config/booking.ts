/** Consultation booking: the picker's categories and the fixed choices of the form. */

/** The picker's categories; labels match the concern and treatment pages. An option may sit in more than one. */
export const BOOK_INTEREST_GROUPS: [category: string, options: string[]][] = [
  ["Face", ["Wrinkles & fine lines", "Volume loss", "Sagging skin & jowls", "Double chin", "Thin lips", "Dark circles & under-eye hollows"]],
  ["Skin", ["Acne", "Acne scars", "Rosacea & redness", "Melasma", "Pigmentation & sun spots", "Texture & pores", "Moles & skin lesions"]],
  ["Body", ["Stubborn fat", "Cellulite", "Stretch marks", "Loose skin", "Excessive sweating", "Spider & varicose veins", "Unwanted hair"]],
  ["Hair", ["Thinning hair", "Hair loss"]],
  ["Injectables", ["Botox®", "Dermal Fillers", "Lip fillers", "Under-eye filler", "Skin boosters", "Bio-stimulator · Sculptra®", "Bio-stimulator · Radiesse®"]],
  ["Bio-stimulators", ["Bio-stimulator · Sculptra®", "Bio-stimulator · Radiesse®"]],
  ["Thread lift", ["Aptos Thread Lift", "Non-surgical facelift", "Neck lift", "Jawline lift", "Eyebrow lift", "Nose lift"]],
  ["Treatments", ["Laser Hair Removal", "Microneedling", "Laser skin resurfacing", "Laser skin tightening", "Photo-rejuvenation (IPL)", "Chemical peels", "CoolSculpting®", "VISIA® skin analysis"]],
];

/** How the picker lays the categories out: a heading and how many categories, in order, sit under it. */
export const BOOK_INTEREST_SECTIONS: [heading: string, categories: number][] = [
  ["By concern", 4],
  ["By treatment", 4],
];

export const BOOK_NOT_SURE = "Not sure, I’d like a skin analysis";
/** Last concern option: opens a short text box. */
export const BOOK_OTHER = "Something else";

export type BookPath = "book" | "call";
/** Step names of each path: book a time now, or ask for a call. */
export const BOOK_FLOW: Record<BookPath, string[]> = {
  book: ["Your concern", "Your details", "Book or call", "Choose your time"],
  call: ["Your concern", "Your details", "Book or call", "Best time to call"],
};
export const BOOK_CALL_TIMES = ["Morning", "Afternoon", "Early evening"];
export const BOOK_CLINIC_OPTIONS: [value: string, label: string][] = [
  ["Uptown", "Uptown, Yonge & Sheppard"],
  ["Downtown", "Downtown, Bay & College"],
];

/**
 * The clinic's live online booking calendar (AestheticsPro), the one the earlier site showed on its
 * "online booking" page. "Book a time now" opens it in a frame; the clinic, day and time are chosen there.
 */
export const BOOK_ONLINE_URL = "https://www.myaestheticspro.com/BN/index.cfm?859AD66127D677B2BA176D96A89CCD06";
