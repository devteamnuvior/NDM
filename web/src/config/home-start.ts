/**
 * "Where would you like to start?" on the home page: one panel per area, each with its concerns and the
 * options that may help. Content and prices come from the original prototype (generated there from the
 * price list), unchanged. Links starting with "#/" are pages that do not exist yet.
 */

export interface StartOption {
  name: string;
  what: string;
  /** "From $200", or a plain note when there is no price. */
  price: string;
  href: string;
}

export interface StartConcern {
  id: string;
  /** Short name on the chip. */
  label: string;
  title: string;
  lede: string;
  options: StartOption[];
  facts: { term: string; text: string }[];
  /** Small print about prescription treatments, where it applies. */
  note?: string;
  more: { href: string; label: string };
}

export interface StartPanel {
  id: string;
  title: string;
  sub: string;
  heading: string;
  text: string;
  image: { src: string; srcSet: string; position: string; positionOpen: string };
  concerns: StartConcern[];
  /** Only on the "Not sure?" panel, which has no concerns: the skin analysis page. */
  analysisHref?: string;
}

export const START_PANELS: StartPanel[] = [
  {
    "id": "face",
    "title": "Face",
    "sub": "6 concerns",
    "heading": "Face",
    "text": "Lines, volume and contour.",
    "image": {
      "src": "/assets/home/v3/mirror-1000.webp",
      "srcSet": "/assets/home/v3/mirror-720.webp 720w, /assets/home/v3/mirror-1000.webp 1000w, /assets/home/v3/mirror-1440.webp 1440w",
      "position": "center 18%",
      "positionOpen": "center 100%"
    },
    "concerns": [
      {
        "id": "xo-wrinkles",
        "label": "Wrinkles & fine lines",
        "title": "Wrinkles & fine lines",
        "lede": "Lines tell a story. Whether they appear when you smile or stay when your face is at rest, there are ways to soften them that still look like you.",
        "options": [
          {
            "name": "Laser Skin Resurfacing",
            "what": "Surface renewal for fine lines and texture",
            "price": "From $200",
            "href": "#/laser-skin-resurfacing"
          },
          {
            "name": "Dermal Fillers",
            "what": "Can soften deeper folds at rest",
            "price": "From $750",
            "href": "#/dermal-fillers"
          },
          {
            "name": "Skin Boosters",
            "what": "Hydration and quality for crepey skin",
            "price": "From $399",
            "href": "#/skin-boosters"
          }
        ],
        "facts": [],
        "note": "Prescription treatments for expression lines are available after an in-person medical assessment. Your provider discusses them privately at your consultation.",
        "more": {
          "href": "/wrinkles-fine-lines",
          "label": "Compare all 6 options"
        }
      },
      {
        "id": "xo-volume-loss",
        "label": "Volume loss",
        "title": "Volume loss",
        "lede": "Hollow cheeks, flatter temples or a tired look that sleep doesn’t fix often come from volume loss, and it can be restored subtly.",
        "options": [
          {
            "name": "Dermal Fillers",
            "what": "Can restore volume right away",
            "price": "From $750",
            "href": "#/dermal-fillers"
          },
          {
            "name": "Sculptra®",
            "what": "Gradual volume through your own collagen",
            "price": "From $699",
            "href": "#/sculptra"
          },
          {
            "name": "Radiesse®",
            "what": "Structure plus collagen support",
            "price": "From $599",
            "href": "#/radiesse"
          },
          {
            "name": "Aptos Thread Lift",
            "what": "Repositions tissue alongside volume",
            "price": "From $2500",
            "href": "/aptos-thread-lift"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/volume-loss",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-sagging-skin",
        "label": "Sagging skin & jowls",
        "title": "Sagging skin & jowls",
        "lede": "When the jawline softens or the cheeks start to drop, lift and support can be restored without surgery for many people.",
        "options": [
          {
            "name": "Aptos Thread Lift",
            "what": "Can lift mild to moderate laxity",
            "price": "From $2500",
            "href": "/aptos-thread-lift"
          },
          {
            "name": "Laser Skin Tightening",
            "what": "Gradual firming, little to no downtime",
            "price": "From $480",
            "href": "#/laser-skin-tightening"
          },
          {
            "name": "Radiesse®",
            "what": "Jawline structure and collagen support",
            "price": "From $599",
            "href": "#/radiesse"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/sagging-skin",
          "label": "Compare all 5 options"
        }
      },
      {
        "id": "xo-under-eye-hollows",
        "label": "Dark circles & hollows",
        "title": "Dark circles & under-eye hollows",
        "lede": "Shadows under the eyes have different causes, and the right treatment depends on which one you have.",
        "options": [
          {
            "name": "Under-Eye Filler",
            "what": "Can soften a true hollow",
            "price": "From $850",
            "href": "#/under-eye-filler"
          },
          {
            "name": "Skin Boosters",
            "what": "Hydration for thin, crepey skin",
            "price": "From $399",
            "href": "#/skin-boosters"
          },
          {
            "name": "Laser Skin Tightening",
            "what": "Smooth Eye for fine lines and firmness",
            "price": "From $480",
            "href": "#/laser-skin-tightening"
          },
          {
            "name": "Microneedling",
            "what": "Skin quality and fine texture",
            "price": "From $245",
            "href": "#/microneedling"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/under-eye-hollows",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-double-chin",
        "label": "Double chin",
        "title": "Double chin",
        "lede": "Fullness under the chin can hide a defined jawline even at a healthy weight. Non-surgical options can help define it.",
        "options": [
          {
            "name": "CoolSculpting®",
            "what": "Mini applicator for fat under the chin",
            "price": "From $850",
            "href": "#/coolsculpting"
          },
          {
            "name": "Radiesse®",
            "what": "Jawline definition",
            "price": "From $599",
            "href": "#/radiesse"
          },
          {
            "name": "Aptos Thread Lift",
            "what": "Lift for the lower face and neck",
            "price": "From $2500",
            "href": "/aptos-thread-lift"
          }
        ],
        "facts": [],
        "note": "Prescription options for fat under the chin are available after an in-person medical assessment. Your provider discusses them privately at your consultation.",
        "more": {
          "href": "#/double-chin",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-lip-fillers",
        "label": "Thin lips",
        "title": "Thin lips",
        "lede": "Hyaluronic acid lip enhancement for definition, balance and hydration, planned to suit your face.",
        "options": [
          {
            "name": "Lip Fillers",
            "what": "Usually one session",
            "price": "From $750",
            "href": "#/lip-fillers"
          }
        ],
        "facts": [
          {
            "term": "Downtime",
            "text": "Swelling for 2 to 3 days is common; bruising is possible"
          },
          {
            "term": "When results may appear",
            "text": "Visible right away, settling over about 2 weeks"
          }
        ],
        "more": {
          "href": "#/lip-fillers",
          "label": "About lip fillers"
        }
      }
    ]
  },
  {
    "id": "skin",
    "title": "Skin",
    "sub": "6 concerns",
    "heading": "Skin",
    "text": "Tone, texture and clarity.",
    "image": {
      "src": "/assets/home/v3/skinx-1000.webp",
      "srcSet": "/assets/home/v3/skinx-720.webp 720w, /assets/home/v3/skinx-1000.webp 1000w, /assets/home/v3/skinx-1366.webp 1366w",
      "position": "center 6%",
      "positionOpen": "center 6%"
    },
    "concerns": [
      {
        "id": "xo-acne",
        "label": "Acne",
        "title": "Acne",
        "lede": "Breakouts can be calmed with the right combination of clinic treatments and skincare, at any age.",
        "options": [
          {
            "name": "Laser Acne Treatment",
            "what": "May calm active inflammatory acne",
            "price": "From $375",
            "href": "#/laser-acne-treatment"
          },
          {
            "name": "Chemical Peels",
            "what": "Acnelan® and peels to unclog and calm",
            "price": "From $149",
            "href": "#/chemical-peels"
          },
          {
            "name": "Medical Facials",
            "what": "Purifying Acne Relief facial between treatments",
            "price": "From $249",
            "href": "#/medical-facials"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/acne",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-acne-scars",
        "label": "Acne scars",
        "title": "Acne scars",
        "lede": "Not every scar responds to the same treatment. Matching your scar type to the right option is what makes the difference.",
        "options": [
          {
            "name": "Microneedling",
            "what": "Collagen induction for texture",
            "price": "From $245",
            "href": "#/microneedling"
          },
          {
            "name": "Laser Skin Resurfacing",
            "what": "Fractional laser for deeper texture",
            "price": "From $200",
            "href": "#/laser-skin-resurfacing"
          },
          {
            "name": "Chemical Peels",
            "what": "Evens tone and marks",
            "price": "From $149",
            "href": "#/chemical-peels"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/acne-scars",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-pigmentation",
        "label": "Pigmentation & sun spots",
        "title": "Pigmentation & sun spots",
        "lede": "Sun spots, uneven tone and marks after breakouts can be brightened once we know what is causing them.",
        "options": [
          {
            "name": "Photo-Rejuvenation (IPL)",
            "what": "Light-based treatment for sun spots",
            "price": "From $275",
            "href": "#/photo-rejuvenation"
          },
          {
            "name": "Cosmelan® & Dermamelan®",
            "what": "Depigmenting protocol for stubborn pigment",
            "price": "From $799.20",
            "href": "#/cosmelan-dermamelan"
          },
          {
            "name": "Chemical Peels",
            "what": "Brightening peels for tone",
            "price": "From $149",
            "href": "#/chemical-peels"
          },
          {
            "name": "Laser Skin Resurfacing",
            "what": "Surface renewal for sun damage",
            "price": "From $200",
            "href": "#/laser-skin-resurfacing"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/pigmentation",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-melasma",
        "label": "Melasma",
        "title": "Melasma",
        "lede": "Melasma needs a careful plan. The right protocol can lighten it while avoiding treatments that make it worse.",
        "options": [
          {
            "name": "Cosmelan® & Dermamelan®",
            "what": "Depigmenting protocol designed for melasma",
            "price": "From $799.20",
            "href": "#/cosmelan-dermamelan"
          },
          {
            "name": "Chemical Peels",
            "what": "Gentle brightening peels",
            "price": "From $149",
            "href": "#/chemical-peels"
          },
          {
            "name": "Microneedling",
            "what": "With depigmenting serums, case by case",
            "price": "From $245",
            "href": "#/microneedling"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/melasma",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-rosacea-redness",
        "label": "Rosacea & redness",
        "title": "Rosacea & redness",
        "lede": "Flushing and visible vessels can often be calmed with light-based treatments and a skin plan built around your triggers.",
        "options": [
          {
            "name": "Photo-Rejuvenation (IPL)",
            "what": "Light-based treatment for diffuse redness",
            "price": "From $275",
            "href": "#/photo-rejuvenation"
          },
          {
            "name": "Laser Vein Removal",
            "what": "Excel V+ for visible vessels",
            "price": "From $240",
            "href": "#/laser-vein-removal"
          },
          {
            "name": "Medical Facials",
            "what": "Calming facials for sensitive skin",
            "price": "From $249",
            "href": "#/medical-facials"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/rosacea-redness",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-texture-pores",
        "label": "Pores & texture",
        "title": "Enlarged pores & texture",
        "lede": "Rough texture and visible pores can be refined with treatments that renew the surface and support collagen.",
        "options": [
          {
            "name": "Microneedling",
            "what": "Collagen induction for pores and texture",
            "price": "From $245",
            "href": "#/microneedling"
          },
          {
            "name": "4D Rejuvalift",
            "what": "Surface renewal and firmness",
            "price": "From $600",
            "href": "#/laser-rejuvenation"
          },
          {
            "name": "Chemical Peels",
            "what": "Regular exfoliation",
            "price": "From $149",
            "href": "#/chemical-peels"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/texture-pores",
          "label": "Compare all 5 options"
        }
      }
    ]
  },
  {
    "id": "body-hair",
    "title": "Body & hair",
    "sub": "5 concerns",
    "heading": "Body & hair",
    "text": "Contour, veins and hair.",
    "image": {
      "src": "/assets/home/v3/knee-1000.webp",
      "srcSet": "/assets/home/v3/knee-720.webp 720w, /assets/home/v3/knee-1000.webp 1000w, /assets/home/v3/knee-1122.webp 1122w",
      "position": "center 42%",
      "positionOpen": "center 100%"
    },
    "concerns": [
      {
        "id": "xo-stubborn-fat",
        "label": "Stubborn fat",
        "title": "Stubborn fat",
        "lede": "Areas that don’t change with diet and exercise can be contoured without surgery or downtime.",
        "options": [
          {
            "name": "CoolSculpting®",
            "what": "Controlled cooling for pinchable fat",
            "price": "From $850",
            "href": "#/coolsculpting"
          },
          {
            "name": "TightSculpting®",
            "what": "Laser contouring with skin tightening",
            "price": "From $600",
            "href": "#/tightsculpting"
          },
          {
            "name": "Non-Surgical Butt Lift",
            "what": "Shape and contour for the buttocks and hips",
            "price": "From $1999",
            "href": "#/non-surgical-bbl"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/stubborn-fat",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-laser-hair-removal",
        "label": "Unwanted hair",
        "title": "Unwanted hair",
        "lede": "Medical-grade laser hair reduction for the face and body, planned for your skin and hair type.",
        "options": [
          {
            "name": "Laser Hair Removal",
            "what": "Usually 6 to 8 sessions, 4 to 8 weeks apart",
            "price": "From $90",
            "href": "#/laser-hair-removal"
          }
        ],
        "facts": [
          {
            "term": "Downtime",
            "text": "Redness for a few hours"
          },
          {
            "term": "When results may appear",
            "text": "Gradual reduction after each session"
          }
        ],
        "more": {
          "href": "#/laser-hair-removal",
          "label": "About laser hair removal"
        }
      },
      {
        "id": "xo-spider-veins",
        "label": "Spider veins",
        "title": "Spider veins",
        "lede": "Small red, blue or purple veins on the legs or face can be treated, with a vascular surgeon on our team for anything more.",
        "options": [
          {
            "name": "Laser Vein Removal",
            "what": "Excel V+ laser for fine veins",
            "price": "From $240",
            "href": "#/laser-vein-removal"
          },
          {
            "name": "Sclerotherapy",
            "what": "Injections for leg spider veins",
            "price": "At consultation",
            "href": "#/sclerotherapy"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/spider-veins",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-varicose-veins",
        "label": "Varicose veins",
        "title": "Varicose veins",
        "lede": "Bulging or aching veins are assessed by our vascular surgeon, with minimally invasive treatment where appropriate.",
        "options": [
          {
            "name": "VenaSeal™",
            "what": "Medical adhesive closes the diseased vein",
            "price": "At consultation",
            "href": "#/venaseal"
          },
          {
            "name": "Sclerotherapy",
            "what": "For smaller veins and branches",
            "price": "At consultation",
            "href": "#/sclerotherapy"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/varicose-veins",
          "label": "Compare these options"
        }
      },
      {
        "id": "xo-hair-loss",
        "label": "Hair loss & thinning",
        "title": "Hair loss & thinning",
        "lede": "Thinning hair is common in men and women, and earlier treatment usually gives better options.",
        "options": [
          {
            "name": "PRP Hair Restoration",
            "what": "Your own platelets to support follicles",
            "price": "From $399",
            "href": "#/prp-hair-restoration"
          },
          {
            "name": "Laser Hair Rejuvenation",
            "what": "Needle-free laser for the scalp",
            "price": "From $350",
            "href": "#/laser-hair-rejuvenation"
          }
        ],
        "facts": [],
        "more": {
          "href": "#/hair-loss",
          "label": "Compare these options"
        }
      }
    ]
  },
  {
    "id": "not-sure",
    "title": "Not sure?",
    "sub": "Free skin analysis",
    "heading": "Not sure?",
    "text": "Every consultation includes a free VISIA® skin analysis, so your plan starts from what your skin actually needs.",
    "image": {
      "src": "/assets/home/v3/visia-720.webp",
      "srcSet": "/assets/home/v3/visia-720.webp 720w, /assets/home/v3/visia-1440.webp 1440w",
      "position": "28% 60%",
      "positionOpen": "28% 60%"
    },
    "concerns": [],
    "analysisHref": "#/visia-skin-analysis"
  }
];
