import type { Deal } from "@/components/bf-sale/data";

/** The words and settings of a sale landing page (the VIP Sale page reads them from WordPress). */
export interface SaleCopy {
  /** For search engines. Tokens: {{max}}, {{dates}}, {{dates_long}}, {{dates_full}}, {{end}}, {{code}}. */
  title: string;
  description: string;
  /** Keeps the page out of search engines. */
  noindex: boolean;
  /** The sale's name in sentences ("VIP Sale ends in"). */
  name: string;
  /** First and last minute of the sale, Toronto time: "2026-11-14 00:00". Used when WooCommerce holds no campaign. */
  starts: string;
  ends: string;
  hero: { lead: string; strong: string; offer: string; text: string; photo: { src: string; width: number; height: number } };
  /** The line under the header: "+$200 gift with your purchase · first 20 purchases · given in clinic". Empty: no bar. */
  gift: string;
  /** The lines of the moving tapes. */
  tape: string[];
  how: { title: string; text: string }[];
  concerns: { lead: string; strong: string; text: string; items: { name: string; text: string; categories: string[] }[] };
  /** `groups`: which price-list categories are in the sale, and the tab each sits under. */
  deals: { lead: string; strong: string; text: string; groups: { category: string; tab: string }[] };
  specials: { tag: string; lead: string; strong: string; count: number };
  plan: { lead: string; strong: string; note: string };
  clinics: { tag: string; lead: string; strong: string };
  footer: { lead: string; text: string; terms: string };
}

/** A stretch of the sale with its own labels (VIP Sale; Black Friday, Cyber Monday, Black Friday Extended). */
export interface SalePhase {
  from: number;
  to: number;
  /** Above the heading: "VIP Sale", "Cyber Monday". */
  eyebrow: string;
  /** Beside the countdown: "VIP Sale ends in", "Offers end in", "Ends". */
  timer: string;
  /** Its last day: "Thu, Nov 19" and "Nov 19". */
  day: string;
  date: string;
  /** On the deal cards: "SALE PRICE", "BLACK FRIDAY PRICE". */
  badge: string;
}

/** A card of "Sale prices": a title, a quantity and WooCommerce's price for it; nothing else. */
export interface SalePriceCard {
  title: string;
  qty: string;
  price: number;
  /** Struck-through price, 0 when there is none. */
  regular: number;
  /** A prescription product: shown by name, quantity and price only, and kept out of the header's tickets. */
  drug: boolean;
  /** The product's photo in WooCommerce, when it has one. */
  img: string;
  set?: string;
  pos: string;
  /** Its deal card on this page (the price-list category), when it has one. */
  cat: string | null;
}

/** The colours and class prefix of a sale page's look. */
export interface SaleLook {
  /** Class prefix of the page's own CSS: "vip" or "bfs". */
  p: string;
  bar: string;
  night: string;
  focus: string;
  skip: string;
  ink: string;
  inkHover: string;
  accent: string;
  accentBg: string;
  light: string;
  lightBg: string;
  pale: string;
  photo: string;
}

/** Everything a sale landing page shows. */
export interface SaleView {
  look: "vip" | "bfs";
  /** Where the visitor's plan is kept in the browser. */
  planKey: string;
  copy: SaleCopy;
  /** The page's own window (the VIP Sale: its phase; Black Friday: from its first phase to the campaign's end). */
  start: number;
  end: number;
  /** "Fri, Nov 20": the day the window opens. */
  startDay: string;
  phases: SalePhase[];
  /** Where the page sends visitors once its window has closed ("/black-friday" for the VIP Sale); empty: it says the sale has ended. */
  after: string;
  /** The checkout code and what it takes off, when WooCommerce holds a campaign. */
  code: string;
  percent: number;
  /** "Up to N%": the campaign's stated headline, or the best percentage among the deals. */
  max: number;
  deals: Deal[];
  /** "All deals", then the tabs that hold a deal. */
  tabs: string[];
  cards: SalePriceCard[];
}
