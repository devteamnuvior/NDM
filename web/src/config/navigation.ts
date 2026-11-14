import type { PageId } from "@/config/routes";
import type { ConcernGroup, NavItem, NavSectionId, ProcedureCategory, SearchEntry } from "@/types/navigation";

export const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "procedures", label: "Procedures", menu: "procedures" },
  { id: "concerns", label: "Concerns", menu: "concerns" },
  { id: "pricing", label: "Pricing" },
  { id: "promotion", label: "Promotion" },
  { id: "about", label: "About", menu: "about" },
  { id: "shop", label: "Skincare shop", href: "#/shop", external: true },
];

export const PROCEDURES: ProcedureCategory[] = [
  {
    id: "aptos",
    label: "Aptos Thread Lift",
    blurb: "Non-surgical lifting with absorbable threads, planned around your facial structure.",
    groups: [{ items: ["Aptos Thread Lift", "Non-Surgical Facelift (Neck, Jawline, Eyebrow & Nose Lift)"] }],
  },
  {
    id: "injectables",
    label: "Injectables",
    blurb: "Neuromodulators, fillers and biostimulators, dosed conservatively for a natural-looking finish.",
    groups: [
      {
        items: [
          "Botox®",
          "Juvederm®",
          "Dermal Fillers",
          "Belkyra® / Kybella® (Double Chin)",
          "Lip Augmentation",
          "Tear Trough Correction",
          "Soft Lift™",
          "Radiesse®",
          "Sculptra®",
          "Mesotherapy & Skin Boosters",
        ],
      },
    ],
  },
  {
    id: "skin",
    label: "Skin",
    blurb: "Aesthetic and medical dermatology, from VISIA® analysis to laser resurfacing.",
    groups: [
      {
        title: "Aesthetic",
        items: [
          "VISIA® Skin Analysis",
          "Microneedling",
          "Age Element® Facial",
          "Acnelan®",
          "Dermamelan®",
          "Exosome Skin Therapy",
          "Wrinkle Treatments",
          "Dark Circles",
          "Scar Removal",
          "Acne Scar",
          "Photo Rejuvenation",
          "Microdermabrasion",
          "Chemical Peels",
          "Micro Laser Peel",
          "Laser Skin Resurfacing",
          "Skin Tightening",
        ],
      },
      {
        title: "Medical Dermatology",
        items: ["Mole Removal", "Rosacea", "Melasma", "Hyperpigmentation", "Acne Treatments"],
      },
    ],
  },
  {
    id: "lhr",
    label: "Laser Hair Removal",
    blurb: "Long-term hair reduction for face and body, with settings matched to your skin and hair type.",
    groups: [{ items: ["Laser Hair Removal"] }],
  },
  {
    id: "body",
    label: "Body",
    blurb: "Non-surgical contouring, tightening and medical body treatments.",
    groups: [
      {
        items: [
          "CoolSculpting®",
          "Non-Surgical BBL",
          "Cellulite & Fat Reduction",
          "TightSculpting®",
          "Vaginal Tightening",
          "Nail Fungus Treatment",
          "Snoring Treatment",
          "Stretch Marks",
          "Hyperhidrosis",
        ],
      },
    ],
  },
  {
    id: "veins",
    label: "Veins",
    blurb: "Assessment and treatment of spider and varicose veins.",
    groups: [
      {
        items: [
          "Spider Vein Removal",
          "Varicose Vein Treatment",
          "Sclerotherapy",
          "VenaSeal™",
          "Endovenous Laser (EVLT)",
          "Radiofrequency Ablation (RFA)",
        ],
      },
    ],
  },
  {
    id: "hair",
    label: "Hair Loss",
    blurb: "Options to support thinning hair and scalp health.",
    groups: [{ items: ["Hair Loss Treatments", "Exosome Therapy for Hair", "Laser Hair Rejuvenation"] }],
  },
];

export const CONCERNS: ConcernGroup[] = [
  {
    title: "Face & Aging",
    items: [
      "Wrinkles & Fine Lines",
      "Volume Loss",
      "Sagging Skin & Jowls",
      "Double Chin",
      "Thin Lips",
      "Under-Eye Hollows & Dark Circles",
    ],
  },
  {
    title: "Skin",
    items: [
      "Acne & Breakouts",
      "Acne Scars",
      "Rosacea & Redness",
      "Melasma",
      "Hyperpigmentation & Sun Spots",
      "Uneven Texture & Pores",
      "Moles & Skin Lesions",
    ],
  },
  {
    title: "Body",
    items: [
      "Stubborn Fat",
      "Cellulite",
      "Stretch Marks",
      "Loose Skin",
      "Excessive Sweating",
      "Spider & Varicose Veins",
      "Unwanted Hair",
    ],
  },
  { title: "Hair", items: ["Thinning Hair", "Hair Loss"] },
];

export const ABOUT_LINKS: string[] = [
  "Our Doctors & Team",
  "Our Clinics",
  "Awards & Recognition",
  "Contact Us",
  "Blog",
  "Policies (Privacy, Terms, Refunds)",
];

/** Which top-level section each page belongs to (the header marks it). */
export const PAGE_SECTION: Partial<Record<PageId, NavSectionId>> = {
  home: "home",
  pricing: "pricing",
  promotion: "promotion",
  about: "about",
  blog: "about",
  article: "about",
  botox: "procedures",
  aptos: "procedures",
  wrinkles: "concerns",
};

/** Everything the search overlay can find. */
export const SEARCH_ENTRIES: SearchEntry[] = [
  ...PROCEDURES.flatMap((c) => c.groups.flatMap((g) => g.items.map((name) => ({ name, category: g.title ?? c.label })))),
  ...CONCERNS.flatMap((g) => g.items.map((name) => ({ name, category: "Concern" }))),
];

export const POPULAR_SEARCHES: string[] = [
  "Laser Hair Removal",
  "Dermal Fillers",
  "Microneedling",
  "VISIA® Skin Analysis",
  "CoolSculpting®",
  "Acne Scar",
];

/** Pages that open on a dark hero: their header starts in the dark tone, so it never flashes light first. */
export const DARK_START_PAGES: PageId[] = ["home", "pricing", "aptos", "botox", "wrinkles", "about"];

/** Pages where the first-visit offer pop-up never shows. */
export const NO_OFFER_PAGES: PageId[] = ["privacy", "terms", "refunds"];
