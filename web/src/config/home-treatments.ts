/**
 * "Treatments, by what they do" on the home page: one tab per category, each with its treatment cards.
 * Content comes from the original prototype, unchanged. The "All" tab is built from these in the
 * component. Links starting with "#/" are pages that do not exist yet.
 */

export interface TreatmentCard {
  name: string;
  text: string;
  /** Fallback only: the shown price comes from the price list when the treatment is on it. */
  price: string;
  href: string;
  image: { src: string; srcSet: string };
  /** Category label on the photo. */
  tag: string;
}

export interface TreatmentTab {
  id: string;
  label: string;
  /** The button under the cards: where "all of this category" lives. */
  all: { href: string; label: string };
  cards: TreatmentCard[];
}

export const TREATMENT_TABS: TreatmentTab[] = [
  {
    "id": "injectables",
    "label": "Injectables",
    "all": {
      "href": "#/injectables",
      "label": "All injectables"
    },
    "cards": [
      {
        "name": "Dermal Fillers",
        "text": "Hyaluronic acid fillers that can restore lost volume, soften folds and refine contours, placed with restraint.",
        "price": "From $750",
        "href": "#/dermal-fillers",
        "image": {
          "src": "/assets/home/v3/sface-1000.webp",
          "srcSet": "/assets/home/v3/sface-720.webp 720w, /assets/home/v3/sface-1000.webp 1000w"
        },
        "tag": "Injectables"
      },
      {
        "name": "Lip Fillers",
        "text": "Hyaluronic acid lip enhancement for definition, balance and hydration, planned to suit your face.",
        "price": "From $750",
        "href": "#/lip-fillers",
        "image": {
          "src": "/assets/home/v3/lips-1000.webp",
          "srcSet": "/assets/home/v3/lips-720.webp 720w, /assets/home/v3/lips-1000.webp 1000w"
        },
        "tag": "Injectables"
      },
      {
        "name": "Under-Eye Filler",
        "text": "Careful placement of a soft filler that can soften hollows under the eyes and the shadow they cast.",
        "price": "From $850",
        "href": "#/under-eye-filler",
        "image": {
          "src": "/assets/home/v3/p1-683.webp",
          "srcSet": "/assets/home/v3/p1-683.webp 683w"
        },
        "tag": "Injectables"
      },
      {
        "name": "Sculptra®",
        "text": "A poly-L-lactic acid biostimulator that supports your own collagen, for gradual, natural-looking volume.",
        "price": "From $699",
        "href": "#/sculptra",
        "image": {
          "src": "/assets/home/v3/sculptra-1000.webp",
          "srcSet": "/assets/home/v3/sculptra-720.webp 720w, /assets/home/v3/sculptra-1000.webp 1000w"
        },
        "tag": "Injectables"
      },
      {
        "name": "Radiesse®",
        "text": "A calcium hydroxylapatite biostimulator that gives structure and supports collagen, for facial contour and the hands.",
        "price": "From $599",
        "href": "#/radiesse",
        "image": {
          "src": "/assets/home/v3/collagen-1000.webp",
          "srcSet": "/assets/home/v3/collagen-720.webp 720w, /assets/home/v3/collagen-1000.webp 1000w"
        },
        "tag": "Injectables"
      },
      {
        "name": "Skin Boosters",
        "text": "Micro-injections of hyaluronic acid that can improve hydration, smoothness and skin quality.",
        "price": "From $399",
        "href": "#/skin-boosters",
        "image": {
          "src": "/assets/home/v3/booster-1000.webp",
          "srcSet": "/assets/home/v3/booster-720.webp 720w, /assets/home/v3/booster-1000.webp 1000w"
        },
        "tag": "Injectables"
      }
    ]
  },
  {
    "id": "laser",
    "label": "Laser & Energy",
    "all": {
      "href": "#/laser",
      "label": "All laser & energy"
    },
    "cards": [
      {
        "name": "Laser Skin Resurfacing",
        "text": "Fotona laser resurfacing that can refine texture, tone and fine lines, from a light laser peel to fractional and deeper options.",
        "price": "From $200",
        "href": "#/laser-skin-resurfacing",
        "image": {
          "src": "/assets/home/v3/resurf-1000.webp",
          "srcSet": "/assets/home/v3/resurf-720.webp 720w, /assets/home/v3/resurf-1000.webp 1000w"
        },
        "tag": "Laser & Energy"
      },
      {
        "name": "Laser Skin Tightening",
        "text": "Non-invasive Fotona protocols that gently heat deeper layers of skin to improve the look of mild laxity.",
        "price": "From $480",
        "href": "#/laser-skin-tightening",
        "image": {
          "src": "/assets/home/v3/jawline-1000.webp",
          "srcSet": "/assets/home/v3/jawline-720.webp 720w, /assets/home/v3/jawline-1000.webp 1000w"
        },
        "tag": "Laser & Energy"
      },
      {
        "name": "4D Rejuvalift",
        "text": "Multi-step Fotona protocols, including 4D Rejuvalift, for tone, texture and firmness in a single visit.",
        "price": "From $600",
        "href": "#/laser-rejuvenation",
        "image": {
          "src": "/assets/home/v3/facial-1000.webp",
          "srcSet": "/assets/home/v3/facial-720.webp 720w, /assets/home/v3/facial-1000.webp 1000w"
        },
        "tag": "Laser & Energy"
      },
      {
        "name": "Photo-Rejuvenation (IPL)",
        "text": "Intense pulsed light that can reduce the look of sun spots, redness and uneven tone.",
        "price": "From $275",
        "href": "#/photo-rejuvenation",
        "image": {
          "src": "/assets/home/v3/ipl-1000.webp",
          "srcSet": "/assets/home/v3/ipl-720.webp 720w, /assets/home/v3/ipl-1000.webp 1000w"
        },
        "tag": "Laser & Energy"
      },
      {
        "name": "Laser Hair Removal",
        "text": "Medical-grade laser hair reduction for the face and body, planned for your skin and hair type.",
        "price": "From $90",
        "href": "#/laser-hair-removal",
        "image": {
          "src": "/assets/home/v3/p6-1024.webp",
          "srcSet": "/assets/home/v3/p6-720.webp 720w, /assets/home/v3/p6-1024.webp 1024w"
        },
        "tag": "Laser & Energy"
      },
      {
        "name": "Laser Acne Treatment",
        "text": "Laser sessions that can calm active breakouts on the face and upper back.",
        "price": "From $375",
        "href": "#/laser-acne-treatment",
        "image": {
          "src": "/assets/home/v3/peel-1000.webp",
          "srcSet": "/assets/home/v3/peel-720.webp 720w, /assets/home/v3/peel-1000.webp 1000w"
        },
        "tag": "Laser & Energy"
      }
    ]
  },
  {
    "id": "skin",
    "label": "Skin",
    "all": {
      "href": "#/skin",
      "label": "All skin"
    },
    "cards": [
      {
        "name": "VISIA® Skin Analysis",
        "text": "Included free with every consultation: imaging that maps spots, wrinkles, texture, pores and redness, so your plan starts from facts.",
        "price": "Free",
        "href": "#/visia-skin-analysis",
        "image": {
          "src": "/assets/home/v3/visia-720.webp",
          "srcSet": "/assets/home/v3/visia-720.webp 720w, /assets/home/v3/visia-1440.webp 1440w"
        },
        "tag": "Skin Treatments"
      },
      {
        "name": "Microneedling",
        "text": "Collagen induction with Dermapen 4, with options to add PRP, PDRN or exosomes for your skin’s needs.",
        "price": "From $245",
        "href": "#/microneedling",
        "image": {
          "src": "/assets/home/v3/mneedle-1000.webp",
          "srcSet": "/assets/home/v3/mneedle-720.webp 720w, /assets/home/v3/mneedle-1000.webp 1000w"
        },
        "tag": "Skin Treatments"
      },
      {
        "name": "Chemical Peels",
        "text": "Light, medium and deep professional peels, including Acnelan®, chosen for your skin type and goals.",
        "price": "From $149",
        "href": "#/chemical-peels",
        "image": {
          "src": "/assets/home/v3/peel-1000.webp",
          "srcSet": "/assets/home/v3/peel-720.webp 720w, /assets/home/v3/peel-1000.webp 1000w"
        },
        "tag": "Skin Treatments"
      },
      {
        "name": "Cosmelan® & Dermamelan®",
        "text": "Professional depigmenting protocols by Mesoestetic for melasma, sun spots and uneven tone.",
        "price": "From $799.20",
        "href": "#/cosmelan-dermamelan",
        "image": {
          "src": "/assets/home/v3/p3-682.webp",
          "srcSet": "/assets/home/v3/p3-682.webp 682w"
        },
        "tag": "Skin Treatments"
      },
      {
        "name": "Medical Facials",
        "text": "Clinical facials, including Age Element®, Purifying Acne Relief and Glass Glow, tailored at each visit.",
        "price": "From $249",
        "href": "#/medical-facials",
        "image": {
          "src": "/assets/home/v3/facial-1000.webp",
          "srcSet": "/assets/home/v3/facial-720.webp 720w, /assets/home/v3/facial-1000.webp 1000w"
        },
        "tag": "Skin Treatments"
      }
    ]
  },
  {
    "id": "body",
    "label": "Body",
    "all": {
      "href": "#/body",
      "label": "All body"
    },
    "cards": [
      {
        "name": "CoolSculpting®",
        "text": "Controlled cooling that can reduce stubborn fat in treated areas, without surgery.",
        "price": "From $850",
        "href": "#/coolsculpting",
        "image": {
          "src": "/assets/home/v3/knee-1000.webp",
          "srcSet": "/assets/home/v3/knee-720.webp 720w, /assets/home/v3/knee-1000.webp 1000w, /assets/home/v3/knee-1122.webp 1122w"
        },
        "tag": "Body Contouring"
      },
      {
        "name": "TightSculpting®",
        "text": "Fotona laser body contouring that can reduce fat and tighten skin in the same treatment.",
        "price": "From $600",
        "href": "#/tightsculpting",
        "image": {
          "src": "/assets/home/v3/arms-1000.webp",
          "srcSet": "/assets/home/v3/arms-720.webp 720w, /assets/home/v3/arms-1000.webp 1000w"
        },
        "tag": "Body Contouring"
      },
      {
        "name": "Non-Surgical Butt Lift",
        "text": "Injectable collagen stimulators planned to improve the shape and contour of the buttocks and hips, without surgery.",
        "price": "From $1999",
        "href": "#/non-surgical-bbl",
        "image": {
          "src": "/assets/home/v3/bbl-1000.webp",
          "srcSet": "/assets/home/v3/bbl-720.webp 720w, /assets/home/v3/bbl-1000.webp 1000w"
        },
        "tag": "Body Contouring"
      }
    ]
  },
  {
    "id": "veins",
    "label": "Veins",
    "all": {
      "href": "#/veins",
      "label": "All veins"
    },
    "cards": [
      {
        "name": "Laser Vein Removal",
        "text": "Cutera Excel V+ laser for small visible veins and spider veins on the face and legs.",
        "price": "From $240",
        "href": "#/laser-vein-removal",
        "image": {
          "src": "/assets/home/v3/p6-1024.webp",
          "srcSet": "/assets/home/v3/p6-720.webp 720w, /assets/home/v3/p6-1024.webp 1024w"
        },
        "tag": "Vein Treatments"
      },
      {
        "name": "Sclerotherapy",
        "text": "Injections that close small spider and reticular veins on the legs, after a vascular assessment.",
        "price": "Priced at consultation",
        "href": "#/sclerotherapy",
        "image": {
          "src": "/assets/home/v3/d4-720.webp",
          "srcSet": "/assets/home/v3/d4-720.webp 720w, /assets/home/v3/d4-1440.webp 1440w"
        },
        "tag": "Vein Treatments"
      },
      {
        "name": "VenaSeal™",
        "text": "A minimally invasive treatment that seals larger varicose veins with a medical adhesive, decided after an ultrasound assessment.",
        "price": "Priced at consultation",
        "href": "#/venaseal",
        "image": {
          "src": "/assets/home/v3/d3-720.webp",
          "srcSet": "/assets/home/v3/d3-720.webp 720w, /assets/home/v3/d3-1440.webp 1440w"
        },
        "tag": "Vein Treatments"
      }
    ]
  },
  {
    "id": "hair",
    "label": "Hair",
    "all": {
      "href": "#/hair",
      "label": "All hair"
    },
    "cards": [
      {
        "name": "PRP Hair Restoration",
        "text": "Platelet-rich plasma from your own blood, applied to the scalp to support thinning hair.",
        "price": "From $399",
        "href": "#/prp-hair-restoration",
        "image": {
          "src": "/assets/home/v3/u2-1000.webp",
          "srcSet": "/assets/home/v3/u2-720.webp 720w, /assets/home/v3/u2-1000.webp 1000w"
        },
        "tag": "Hair Restoration"
      },
      {
        "name": "Laser Hair Rejuvenation",
        "text": "A gentle Fotona laser treatment for the scalp that may support thinning hair, with no needles and little downtime.",
        "price": "From $350",
        "href": "#/laser-hair-rejuvenation",
        "image": {
          "src": "/assets/home/v3/u4-720.webp",
          "srcSet": "/assets/home/v3/u4-720.webp 720w, /assets/home/v3/u4-1400.webp 1400w"
        },
        "tag": "Hair Restoration"
      }
    ]
  }
];
