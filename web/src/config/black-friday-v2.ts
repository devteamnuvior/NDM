import { VIP2, type SaleWords } from "@/config/vip-sale-v2";

/*
 * The Black Friday page (/black-friday since 2026-11-19, user): the VIP Sale page's layout and words, with the sale
 * named Black Friday, in the Black Friday colours (styles/page-black-friday-v2.css, class "vbf" on <html>). It runs
 * through every phase after the VIP Sale (Black Friday, Cyber Monday, Black Friday Extended); {{day}} is the last
 * day of the last of them. The earlier Black Friday page is kept at /black-friday-2.
 * No price, percentage or date is written here. Before publishing: Raymond's written approval, as for the VIP Sale.
 */

/** Where the visitor's list is kept in the browser (not the VIP list: a list from the VIP Sale may hold its prices). */
export const BLACK_FRIDAY_V2_LIST_KEY = "ndm-bf2-list";

export const BLACK_FRIDAY_V2: SaleWords = {
  ...VIP2,
  page: {
    name: "Black Friday",
    heading: ["Black", "Friday"],
    nav: "Black Friday",
    navLabel: "Black Friday page",
    ended: "The Black Friday sale has ended",
    empty: "Your list is empty. Add a treatment from the Black Friday price list to see your total and your saving.",
    total: "Your Black Friday total",
    logo: "/assets/icons/logo-bf.svg",
    event: "bf_sale",
    barButton: "See all prices",
    fly: "bf",
  },
  title: "Black Friday 2026: Up to {{max}}% Off Treatment Packages | NewDermaMed Toronto",
  description: "NewDermaMed Black Friday, until {{day}}: up to {{max}}% off selected treatment packages at our Uptown and Downtown Toronto clinics. New clients welcome.",
  bar: ["Black Friday sale until {{day}}", "New clients welcome", "Sale prices shown, no code needed"],
  hero: {
    ...VIP2.hero,
    button: "See all Black Friday prices",
    link: "Not ready to buy? Book a free consultation and keep your Black Friday price",
    card: "Top Black Friday prices",
  },
  list: { ...VIP2.list, lead: "The Black Friday", text: "Sale prices shown. No code needed. Until {{day}}." },
  name: "My list",
  next: {
    ...VIP2.next,
    keep: { tag: "Not ready to buy?", title: "Keep your Black Friday price", text: "Book a free consultation before {{day}} and your Black Friday price is held until that visit." },
  },
  faq: {
    ...VIP2.faq,
    items: [
      ["Is the Black Friday sale open to new clients?", "Yes. New clients are welcome and get the same Black Friday prices."],
      ...VIP2.faq.items.slice(1, 3),
      ["Can I visit first and keep the price?", "Yes. Book a free consultation before {{day}} and your Black Friday price is held until that visit."],
      ...VIP2.faq.items.slice(4),
    ],
  },
  final: { ...VIP2.final, tag: "Black Friday", lead: "The Black Friday sale ends" },
  chat: {
    ...VIP2.chat,
    hello: "Hi, welcome to NewDermaMed. Ask me about Black Friday prices, the gift or booking.",
    replies: [
      ["Open to new clients?", "Yes. New clients are welcome and get the same Black Friday prices."],
      VIP2.chat.replies[1],
      ["Can I visit first?", "Yes. Book a free consultation before {{day}} and your Black Friday price is held until that visit."],
      VIP2.chat.replies[3],
    ],
  },
};
