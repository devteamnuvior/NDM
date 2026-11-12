import type { TreatmentPage, TxHeroContent, TxResultsContent, TxWhyContent } from "@/types/treatment";

/** One treatment option of a concern: a card in Options and a row in Side by side. */
export interface ConcernOption {
  key: string;
  name: string;
  role: "Primary" | "Supporting" | "Combination" | "Bio-stimulator";
  /** What it often suits. */
  fit: string;
  line: string;
  /** "From $245"; replaced from the price list on the option cards. */
  price: string;
  priceHref: string;
  /** The treatment's own page. */
  href: string;
  img: string;
  visit: string;
  course: string;
  down: string;
  res: string;
}

/** Content of a concern page. The header, glance card, section bar and several sections are the treatment pages'. */
export interface ConcernPage extends TxHeroContent {
  /** The concern's name, used inside sentences and headings. */
  short: string;
  crumbs: string[];
  facts: [label: string, value: string][];
  nav: [id: string, label: string][];
  lede: string[];
  /** Pages on the site about this concern. */
  pages: { name: string; href: string }[];
  /** Link the before & after gallery in the Overview card. */
  gallery: boolean;
  notice: string[];
  cause: string[];
  assess: { text: string; points: string[] };
  options: ConcernOption[];
  bio: ConcernOption[];
  /** The note about prescription treatments, with their pages. */
  rx: { text: string; links: { name: string; href: string }[] };
  compare: ConcernOption[];
  expect: TreatmentPage["expect"];
  results: TxResultsContent;
  home: { title: string; category: string; text: string; product?: { name: string; size: string; img: string; href: string } }[];
  articles: { title: string; href: string; date: string; topic: string; img: string; excerpt: string }[];
  related: { name: string; menu: string; img: string; kind: string }[];
  why: TxWhyContent;
  faqs: [question: string, answer: string][];
}
