import { FAQS } from "@/config/home";
import { ACTIONS } from "@/config/routes";
import { AFFIRM_PREQUAL_URL } from "@/config/specials";
import { pagePath } from "@/lib/routes";

/**
 * Chat assistant. A prototype: answers come from the clinic's own facts and FAQ, there is no live agent
 * yet. The persona is a first name and a model photo; the panel says it is a virtual assistant.
 */
export const CHAT_AGENT = { name: "Olivia", img: "/assets/home/chat-avatar.jpg" };

export type ChatLink = [label: string, href: string];

/** Ready-made questions: [question, answer, optional link]. */
export const CHAT_PRESETS: [question: string, answer: string, link?: ChatLink][] = [
  [
    "How do I book a free consultation?",
    "Consultations are free. Use any “Book Free Consultation” button on this site, or call Uptown at 416-224-8800 or Downtown at 416-671-9766. Our team will contact you within 24 hours.",
    ["Book Free Consultation", ACTIONS.book],
  ],
  [
    "Where are your clinics?",
    "Uptown: 4763 Yonge Street, near Sheppard-Yonge Station, with parking at Hallmark Centre, 4800 Yonge or 25 Sheppard Ave W. Downtown: 790 Bay Street, Suite 900, near College Station, with parking at 88 or 100 College Street.",
    ["See both clinics", "#visit"],
  ],
  ["What are your hours?", "Both clinics are open Monday to Friday, 9am to 7pm, and Saturday, 10am to 5pm."],
  [
    "Do you offer payment plans?",
    "Yes. Flexible payment plans are available through Affirm for Canadian residents aged 19 and over, with a minimum $500 purchase, subject to approval.",
    ["Start my plan", AFFIRM_PREQUAL_URL],
  ],
  [
    "What is the Aptos Thread Lift?",
    "A minimally invasive treatment with bioabsorbable threads, placed by trained medical professionals in the midface. Your provider explains whether it suits you at a free consultation. Individual results may vary.",
    ["Explore Aptos Thread Lift", pagePath("aptos")],
  ],
  ["Is VISIA® skin analysis included?", "Yes, a complimentary VISIA® skin analysis comes with your consultation, so you and your provider can see your skin in detail before planning anything."],
];

export const CHAT_FALLBACK =
  "Thank you for your question. A member of our team can answer that properly: call Uptown at 416-224-8800 or Downtown at 416-671-9766, or book a free consultation and we will contact you within 24 hours.";

const words = (t: string): string[] =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9® ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

/** The best-matching answer for a typed question, from the ready-made questions and the FAQ. */
export function chatAnswer(question: string): { answer: string; link?: ChatLink } {
  const asked = words(question);
  const pool: [string, string, ChatLink?][] = [...CHAT_PRESETS, ...FAQS.map(([q, a]) => [q, a] as [string, string])];
  let best: [string, string, ChatLink?] | null = null;
  let score = 0;
  for (const entry of pool) {
    const known = words(`${entry[0]} ${entry[1]}`);
    const n = asked.filter((w) => known.some((k) => k.startsWith(w) || w.startsWith(k))).length;
    if (n > score) {
      score = n;
      best = entry;
    }
  }
  return best && score >= 1 ? { answer: best[1], link: best[2] } : { answer: CHAT_FALLBACK, link: ["Book Free Consultation", ACTIONS.book] };
}
