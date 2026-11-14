import type { BeforeAfterCase } from "@/config/before-after";

/** The header of a treatment page. */
export interface TxHeroContent {
  title: [lead: string, strong: string];
  sub: string;
  hero: { desktop: string; mobile: string; position: string; alt?: string };
  /** The clinics, in one line under the intro. */
  where?: string;
  /** The current offer as a glass card under the intro. */
  offer?: { tag: string; title: string; big: [before: string, figure: string, after: string]; href: string; cta: string };
}

/** Content of the Aptos Thread Lift page. Each section of components/treatment reads its own part. */
export interface TreatmentPage {
  /** Breadcrumb trail after Home; the last one is this page. */
  crumbs: string[];
  title: TxHeroContent["title"];
  sub: string;
  hero: TxHeroContent["hero"];
  facts: [label: string, value: string][];
  /** Section bar: [section id, label], in page order. */
  nav: [id: string, label: string][];
  intro: TxIntroContent;
  steps: { tag: string; lead: string; strong: string; text: string; items: [title: string, text: string][] };
  safety: {
    tag: string;
    lead: string;
    strong: string;
    product: { img: string; alt: string; tag: string; name: string; note: string };
    text: string[];
    safeguards: string[];
  };
  duration: { lead: string; strong: string; text: string; logo: string; logoAlt: string; stat: string; unit: string; label: string; note: string };
  fit: { tag: string; lead: string; strong: string; text: string; yes: string[]; no: string[]; img: string; alt: string; position: string };
  expect: { tag?: string; lead: string; strong: string; text?: string; items: [when: string, title: string, text: string][] };
  results: TxResultsContent;
  care: { lead: string; strong: string; text: string; before: string[]; after: string[] };
  pair: {
    tag: string;
    lead: string;
    strong: string;
    text: string;
    groups: [when: string, treatments: string[]][];
    /** Menu label of each treatment that pairs well; its link comes from the route table. */
    links: { name: string; menu: string; tag: string; img: string; line: string }[];
  };
  prices: {
    lead: string;
    strong: string;
    intro: string;
    title: string;
    /** Cart line name and price-list category name. */
    name: string;
    category: string;
    blurb: string;
  };
  sessions: { stat: string; unit: string; text: string; chips: string[] };
  why: TxWhyContent;
  faqs: [question: string, answer: string][];
}

export interface TxIntroContent {
  /** Section id, "what" when left out. */
  id?: string;
  tag: string;
  lead: string;
  strong: string;
  /** Words on the turning badge over the photo. */
  ring?: string;
  text: string[];
  /** Short labels under the text. */
  chips?: string[];
  note?: string;
  /** A file under /assets, or a remote photo served by the clinic's site as in the prototype. */
  img: string;
  alt: string;
  position?: string;
  /** Show the whole picture on this background (a diagram), instead of filling the frame. */
  contain?: string;
  points: [title: string, text: string][];
}

export interface TxResultsContent {
  lead: string;
  strong: string;
  text: string;
  /** Compare cards (a before and an after photo each). */
  cases?: BeforeAfterCase[];
  /** Or: photos that already show before and after side by side (files under /assets). */
  pics?: { src: string; label: string }[];
}

export interface TxWhyContent {
  alt: string;
  position: string;
  lead: string;
  strong: string;
  items: [figure: string, unit: string, text: string][];
}

/** Content of the Botox page: the shared treatment sections plus its own (film, About tabs, Why choose, reel, guide). */
export interface ProcedurePage extends TxHeroContent {
  crumbs: string[];
  facts: [label: string, value: string][];
  nav: [id: string, label: string][];
  intro: TxIntroContent;
  film: { src: string; poster: string; lead: string; strong: string; text: string; chips: string[] };
  overview: { tag: string; lead: string; strong: string; tabs: { label: string; stat: [figure: string, label: string]; text: string[]; link?: [href: string, label: string] }[] };
  choose: { img: string; alt: string; tag: string; lead: string; strong: string; cards: [title: string, text: string][] };
  reel: { src: string; poster: string; tag: string; lead: string; strong: string; text: string };
  why: TxWhyContent;
  results: TxResultsContent;
  prices: {
    lead: string;
    strong: string;
    /** Price-list category name (cart lines). */
    category: string;
    /** The option label that is the price of one unit. */
    unitLabel: string;
    groups: { name: string; title: string; blurb: string }[];
  };
  guide: {
    tag: string;
    lead: string;
    strong: string;
    intro: string;
    items: { q: string; a: string[]; list?: string[] }[];
    updated: [iso: string, text: string];
    /** Related treatments: menu label (its link comes from the route table), photo and group. */
    related: { name: string; img: string; kind: string }[];
  };
  faq: { lead: string; strong: string; sub: string };
  faqs: [question: string, answer: string][];
}
