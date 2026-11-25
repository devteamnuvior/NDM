import { SALE_SHARED } from "@/config/sale";

/*
 * The redesigned VIP Sale page (at /vip-sale since 2026-11-18; first a clone at /vip-sale-v2, kept out of
 * search engines). Its words follow the marketing team's redesign document of 2026-11-17 ("VIP Sale page
 * redesign", phase 1 and phase 2). No price, percentage or date is written here: prices and the best saving are
 * read from WooCommerce, the deadline from the campaign.
 * Tokens: {{day}} "Thu, Nov 19", {{max}} the best saving on the page.
 * Before publishing: Raymond's written approval of the prices, the gift wording and every claim on this page.
 */

export const VIP2_PATH = "/vip-sale";

/** Where the visitor's list is kept in the browser. */
export const VIP2_LIST_KEY = "ndm-vip2-list";

export const VIP2 = {
  /** The sale's name and the page's own pieces (the same component draws /black-friday with BLACK_FRIDAY_V2). */
  page: {
    name: "VIP Sale",
    /** The hero heading: first word plain, second in the shine. */
    heading: ["VIP", "Sale"] as [string, string],
    nav: "VIP Sales",
    navLabel: "VIP Sale page",
    ended: "The VIP Sale has ended",
    empty: "Your list is empty. Add a treatment from the VIP price list to see your total and your saving.",
    total: "Your VIP total",
    logo: "/assets/icons/logo-vip.svg",
    /** Prefix of the tag manager's events ("vip_sale_AddToCart"); the Meta pixel gets it as the parameter `sale`. */
    event: "vip_sale",
    /** The bottom bar's button before anything is in the list (it shares the phone's width with the sale's name). */
    barButton: "See all VIP prices",
    /** The colours of the ticket that flies into the list (lib/fly-to.ts). */
    fly: "vip" as "vip" | "bf",
  },
  title: "VIP Sale: Up to {{max}}% Off Treatment Packages | NewDermaMed Toronto",
  description: "The NewDermaMed VIP Sale ends {{day}}: up to {{max}}% off selected treatment packages at our Uptown and Downtown Toronto clinics. New clients welcome.",
  /** The gold line above the header. */
  bar: ["VIP Sale ends {{day}}", "New clients welcome", "Sale prices shown, no code needed"],
  barPhone: ["New clients welcome", "No code needed"],
  hero: {
    sub: "On selected treatment packages,",
    gift: "plus $200 in skincare for the first 20 purchases",
    welcome: "New clients welcome.",
    button: "See all VIP prices",
    link: "Not ready to buy? Book a free consultation and keep your VIP price",
    card: "Top VIP prices",
    cardFoot: "left at these prices",
  },
  strip: {
    award: "Top Choice Award",
    awardYears: "2019 to 2026",
    years: "16+ years",
    yearsIn: "in Toronto",
    visit: "Free consultation and VISIA® analysis",
  },
  clinic: {
    tag: "New here?",
    lead: "See the clinic",
    strong: "before you book",
    text: "Two medical-grade clinics in Toronto, open Monday to Saturday.",
    videoLabel: "Play the clinic film",
    /** The four photos under the film. */
    photos: [
      { src: "/assets/clinic/clinic-5.jpg", alt: "The reception at NewDermaMed", label: "Reception" },
      { src: "/assets/clinic/clinic-2.jpg", alt: "A treatment room at NewDermaMed", label: "Treatment room" },
      { src: "/assets/home/hero/visia.jpg", alt: "A VISIA® skin analysis at NewDermaMed", label: "VISIA® analysis" },
      { src: "/assets/home/hero/exterior.jpg", alt: "The NewDermaMed clinic from the street", label: "The clinic" },
    ],
    awardLead: "Toronto’s Top Choice Cosmetic & Laser Clinic",
    awardText: "Eight years in a row, 2019 to 2026.",
    facts: [
      { figure: "16+", label: "Years in Toronto" },
      { figure: "8", label: "Top Choice Awards" },
      { figure: "2", label: "Clinics, Uptown and Downtown" },
    ],
  },
  list: {
    lead: "The VIP",
    strong: "price list",
    text: "Sale prices shown. No code needed. Ends {{day}}.",
    add: "Add to my list",
    added: "Added",
    fine: "Every package includes a free consultation and VISIA® skin analysis. Prices in CAD, before tax. Individual results may vary.",
  },
  name: "My VIP list",
  checkout: "Check out",
  next: {
    tag: "After you buy",
    lead: "Pay online,",
    strong: "then meet your provider",
    steps: [
      { title: "Pay online", text: "Check out with your VIP list at the sale price." },
      { title: "Book your visit", text: "A free consultation and VISIA® skin analysis at either clinic." },
      { title: "Meet your provider", text: "Your provider confirms the right treatment before anything starts." },
    ],
    keep: {
      tag: "Not ready to buy?",
      title: "Keep your VIP price",
      text: "Book a free consultation before {{day}} and your VIP price is held until that visit.",
    },
  },
  faq: {
    tag: "Good to know",
    lead: "Questions",
    strong: "new clients ask",
    items: [
      ["Is the VIP Sale open to new clients?", "Yes. New clients are welcome and get the same VIP prices."],
      ["What is the $200 gift?", "Skincare worth $200 for the first 20 purchases, handed to you at your first visit."],
      ["What happens after I buy?", "You book your free consultation and VISIA® skin analysis at either clinic. Your provider confirms the right treatment before anything starts."],
      ["Can I visit first and keep the price?", "Yes. Book a free consultation before {{day}} and your VIP price is held until that visit."],
      ["Can I pay over time?", "Yes. We offer flexible payment plans through Affirm for Canadian citizens and residents aged 19 and over, with a minimum $500 purchase."],
      ["What is not included?", "Single sessions and a short list of treatments are not part of the sale. The full list is at the foot of the page."],
    ] as [question: string, answer: string][],
    gallery: "See results in our before and after gallery",
    galleryNote: "Individual results may vary.",
  },
  footer: { line: "Two clinics in Toronto. Top Choice Award, 2019 to 2026.", hoursTag: "Both clinics", hours: "Hours" },
  final: { tag: "VIP Sale", lead: "The VIP Sale ends", text: "Sale prices are shown as they are, with no code needed. Buy online today, or call either clinic and we will help you choose. New clients welcome." },
  chat: {
    button: "Chat",
    title: "Chat with NewDermaMed",
    hello: "Hi, welcome to NewDermaMed. Ask me about VIP prices, the gift or booking.",
    /** Quick replies: the same answers as the questions block. */
    replies: [
      ["Open to new clients?", "Yes. New clients are welcome and get the same VIP prices."],
      ["What is the $200 gift?", "Skincare worth $200 for the first 20 purchases, handed to you at your first visit."],
      ["Can I visit first?", "Yes. Book a free consultation before {{day}} and your VIP price is held until that visit."],
      ["Talk to a person", "{{phones}}"],
    ] as [question: string, answer: string][],
    foot: "Sale and booking questions only. For medical questions, book a free consultation.",
  },
  /** The sale's terms, without the checkout code (every price on this page is the final price). */
  terms: SALE_SHARED.finePrint.replace(" Code {{code}} applies to eligible packages.", ""),
};

/** The words of the page, the VIP Sale's or Black Friday's. */
export type SaleWords = typeof VIP2;
