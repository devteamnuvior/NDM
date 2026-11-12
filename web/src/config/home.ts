import { ACTIONS } from "@/config/routes";

/** Home page content. Source: the original prototype. */

export type ProofIcon = "physician" | "award" | "clinics" | "analysis";

export interface HeroContent {
  film: { poster: string; mobile: string; desktop: string };
  tagline: string;
  /** Two-tone headline: the second line is the coloured, italic one. */
  heading: [lead: string, strong: string];
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  proof: { icon: ProofIcon; label: string }[];
  /** Technology and brands in the band along the bottom edge. */
  brands: string[];
}

export const HERO: HeroContent = {
  film: {
    poster: "/assets/home/v3/hero-poster-1440.webp",
    mobile: "/assets/home/v3/hero-960.mp4",
    desktop: "/assets/home/v3/hero-1600.mp4",
  },
  tagline: "NewDermaMed, medical aesthetics in Toronto",
  heading: ["Refined,", "not redone."],
  intro: "Aesthetic, laser and skin treatments planned around your features, your skin and your pace.",
  primaryCta: { label: "Book Free Consultation", href: ACTIONS.book },
  secondaryCta: { label: "Find your treatment", href: "#start" },
  proof: [
    { icon: "physician", label: "Physician-led care" },
    { icon: "award", label: "Top Choice Award, 2019 to 2026" },
    { icon: "clinics", label: "Two Toronto clinics" },
    { icon: "analysis", label: "Free VISIA® skin analysis" },
  ],
  brands: ["Fotona", "Cutera", "VISIA®", "Dermapen 4", "Aptos", "Juvéderm®", "Sculptra®", "Radiesse®", "Mesoestetic", "Dermaceutic", "CoolSculpting®"],
};

export interface AboutContent {
  eyebrow: string;
  heading: [lead: string, strong: string];
  /** Shown word by word as the section scrolls into view. */
  statement: string;
  /** The word in the statement that is set in the brand colour. */
  highlight: string;
  stats: { value: number; suffix: string; label: string }[];
}

export const ABOUT: AboutContent = {
  eyebrow: "About NewDermaMed",
  heading: ["Toronto’s cosmetic", "and laser clinic"],
  statement:
    "NewDermaMed offers convenience, privacy, and exceptional results with advanced skin rejuvenation and body contouring. Our expert staff delivers personalized care to help you achieve your most desirable appearance.",
  highlight: "NewDermaMed",
  stats: [
    { value: 16, suffix: "+", label: "Years in Toronto" },
    { value: 8, suffix: "", label: "Top Choice Awards" },
    { value: 2, suffix: "", label: "Toronto clinics" },
    { value: 20, suffix: "+", label: "Treatment categories" },
  ],
};

export interface AptosCareContent {
  eyebrow: string;
  heading: [lead: string, strong: string];
  intro: string;
  /** Chip on the figure: "Up to 24 months of lift and support". */
  figure: { prefix: string; value: number; label: string };
  /** `share` is how far the dial's ring fills (0 to 1). `spoken` is the full sentence for screen readers. */
  dials: { value: string; unit: string; label: string; spoken: string; share: number }[];
  /** `icon` is the SVG path of the chip's icon. */
  points: { label: string; icon: string }[];
  explore: { label: string; page: "aptos" };
  areas: {
    eyebrow: string;
    heading: [lead: string, strong: string];
    text: string;
    photos: { src: string; label: string; alt: string }[];
  };
}

/* clinical marking photos, served by nuvior.com exactly as in the prototype */
const NUVIOR_IMG = "https://nuvior.com/wp-content/themes/nuvior/assets/img/";

export const APTOS_CARE: AptosCareContent = {
  eyebrow: "Our signature",
  heading: ["A non-surgical facelift,", "with Aptos threads"],
  intro: "Fine bioabsorbable threads that can lift and support facial tissue through a few tiny entry points, with no incisions.",
  figure: { prefix: "Up to ", value: 24, label: "months of lift and support" },
  dials: [
    { value: "60", unit: "min", label: "Treatment time", spoken: "About 60 minutes", share: 0.34 },
    { value: "2", unit: "weeks", label: "Downtime", spoken: "Up to about 2 weeks", share: 0.5 },
    { value: "24", unit: "months", label: "May last", spoken: "Up to 24 months", share: 0.82 },
  ],
  points: [
    { label: "No surgery, no incisions", icon: "M5 12l4 4 10-10" },
    { label: "Bioabsorbable P(LA/CL) threads", icon: "M4 18c4-10 12-2 16-12" },
    { label: "Placed by trained medical professionals", icon: "M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4Z" },
  ],
  explore: { label: "Explore Aptos Thread Lift", page: "aptos" },
  areas: {
    eyebrow: "Treatment areas",
    heading: ["Where is Aptos", "used in Canada?"],
    text: "Visage Excellence is licensed in Canada for one clearly defined area, the midface. Every treatment starts with a careful marking of the zones.",
    photos: [
      { src: `${NUVIOR_IMG}marking-1.jpg`, label: "Marking · Front", alt: "Clinical marking of Visage Excellence treatment zones, front view" },
      { src: `${NUVIOR_IMG}marking-2.jpg`, label: "Marking · Midface", alt: "Clinical marking of Visage Excellence treatment zones, three-quarter view" },
      { src: `${NUVIOR_IMG}marking-3.jpg`, label: "Marking · Vectors", alt: "Clinical marking of Visage Excellence treatment zones, vector lines" },
      { src: `${NUVIOR_IMG}marking-5.png`, label: "Marking · Valium", alt: "Clinical marking of Visage Excellence treatment zones, Valium view" },
    ],
  },
};

export interface ProcessStep {
  title: string;
  text: string;
  photoAlt: string;
  href: string;
  cta: string;
  /** Button style: the booking button, or a plain blue pill. */
  button: "book" | "ink";
}

/** How it works: the three steps of a treatment journey. */
export const PROCESS: ProcessStep[] = [
  {
    title: "Free consultation",
    text: "Meet our team at either Toronto clinic for a free consultation and VISIA® skin analysis.",
    photoAlt: "A provider and a patient reviewing VISIA® skin analysis results",
    href: ACTIONS.book,
    cta: "Book Free Consultation",
    button: "book",
  },
  {
    title: "Your personal plan",
    text: "Your provider recommends treatments for your goals and explains pricing before anything begins.",
    photoAlt: "VISIA® skin analysis results on the consultation room screen",
    href: "#treatments",
    cta: "Explore treatments",
    button: "ink",
  },
  {
    title: "Treatment and follow-up",
    text: "Licensed medical professionals perform your treatment and check in on your progress afterwards.",
    photoAlt: "A patient checking her skin in a hand mirror in the treatment chair",
    href: "#visit",
    cta: "Find a clinic",
    button: "ink",
  },
];

/** Questions and answers on the home page. */
export const FAQS: [question: string, answer: string][] = [
  ["Is the first consultation really free?", "Yes. NewDermaMed offers complimentary consultations so you can discuss your goals and explore treatment options before committing."],
  ["Where are your clinics?", "Uptown: 4763 Yonge Street, Toronto, ON M2N 5M5. Downtown: 790 Bay Street, Suite 900, Toronto, ON M5G 1N8."],
  ["What are your clinic hours?", "Both clinics are open Monday to Friday, 9am – 7pm, and Saturday, 10am – 5pm."],
  ["How do I check the price of a treatment?", "Prices are listed by category on our pricing page, along with current offers. Your provider confirms the final price after your consultation."],
  ["Are prices the same at both locations?", "Yes. Listed prices and promotions apply at both clinics unless otherwise noted."],
  ["Is financing available?", "Yes. We offer flexible payment plans through Affirm for Canadian residents aged 19+, with a minimum $500 purchase."],
  ["Is laser hair removal permanent?", "Most people see long-term reduction. Maintenance sessions may be needed, and results vary by individual."],
  ["How can I book an appointment?", "Call or text either clinic, email info@newdermamed.com, or book online, we’ll confirm your time and location."],
];
