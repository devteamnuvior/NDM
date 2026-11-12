/**
 * The price list: one source for every price on the site (CAD). Item for item from
 * newdermamedlaserclinic.com/fees-financing, generated from the prototype's src/pricing-data.jsx.
 * Tags are the clinic's own offer labels ("20% OFF", "BUY 1 GET 1 FREE", ...).
 */

export interface PriceOption {
  /** "Single session", "Package of 3", "60 units", "1 Syringe"... */
  label: string;
  price: number;
  /** Regular price before the offer; 0 when there is none. */
  regular: number;
  tag?: string;
}

export interface PriceItem {
  name: string;
  note: string;
  options: PriceOption[];
}

export interface PriceCategory {
  id: string;
  name: string;
  /** Priced per unit (prescription products). */
  perUnit?: boolean;
  blurb: string;
  items: PriceItem[];
}

export const PRICE_CATEGORIES: PriceCategory[] = [
  {
    "id": "aptos-thread-method",
    "name": "Aptos Thread Method",
    "blurb": "Bioabsorbable PLA/PCL threads that can lift and support facial tissue, placed without surgery.",
    "items": [
      {
        "name": "Aptos Excellence Visage Method EV PLA/PCL (up to 24 months)",
        "note": "",
        "options": [
          {
            "label": "Nose lift/correction",
            "price": 2500,
            "regular": 0
          },
          {
            "label": "Fox eyebrow / eyebrow lift",
            "price": 2500,
            "regular": 0
          },
          {
            "label": "Mid face",
            "price": 2500,
            "regular": 0
          },
          {
            "label": "Lower face or submental",
            "price": 2500,
            "regular": 0
          },
          {
            "label": "Face – Mid & Lower",
            "price": 2900,
            "regular": 3900,
            "tag": "Save $1000 Off"
          },
          {
            "label": "Neck",
            "price": 2900,
            "regular": 3900,
            "tag": "Save $1000 Off"
          },
          {
            "label": "Face + neck",
            "price": 5900,
            "regular": 6900,
            "tag": "Save $1000 Off"
          }
        ]
      }
    ]
  },
  {
    "id": "botox-dysport",
    "name": "Botox / Dysport",
    "perUnit": true,
    "blurb": "Prescription products priced per unit, given only after an in-person medical assessment.",
    "items": [
      {
        "name": "Botox Cosmetic",
        "note": "",
        "options": [
          {
            "label": "Regular",
            "price": 12,
            "regular": 0
          },
          {
            "label": "60 units",
            "price": 648,
            "regular": 720,
            "tag": "10% OFF"
          },
          {
            "label": "120 units",
            "price": 1152,
            "regular": 1440,
            "tag": "20% OFF"
          },
          {
            "label": "180 units",
            "price": 1512,
            "regular": 2160,
            "tag": "30% OFF"
          },
          {
            "label": "220 units",
            "price": 1848,
            "regular": 2640,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Dysport",
        "note": "",
        "options": [
          {
            "label": "Regular",
            "price": 11,
            "regular": 0
          },
          {
            "label": "60 units",
            "price": 594,
            "regular": 660,
            "tag": "10% OFF"
          },
          {
            "label": "120 units",
            "price": 1056,
            "regular": 1320,
            "tag": "20% OFF"
          },
          {
            "label": "180 units",
            "price": 1386,
            "regular": 1980,
            "tag": "30% OFF"
          },
          {
            "label": "220 units",
            "price": 1694,
            "regular": 2420,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Hyperhidrosis",
        "note": "",
        "options": [
          {
            "label": "Regular",
            "price": 9,
            "regular": 0
          },
          {
            "label": "50 units",
            "price": 450,
            "regular": 0
          },
          {
            "label": "100 units",
            "price": 900,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "laser-vein",
    "name": "Laser Vein",
    "blurb": "Laser treatment for visible veins, priced by area size.",
    "items": [
      {
        "name": "Laser Vein Removal One Small Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 240,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 576,
            "regular": 720,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1004,
            "regular": 1440,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Vein Removal One Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 450,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1080,
            "regular": 1350,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1890,
            "regular": 2700,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "dermal-fillers",
    "name": "Dermal Fillers",
    "blurb": "Hyaluronic acid fillers priced per syringe, with combination packages for common areas.",
    "items": [
      {
        "name": "Lip Enhancement",
        "note": "definition, volume, hydration",
        "options": [
          {
            "label": "1 Syringe",
            "price": 750,
            "regular": 0
          },
          {
            "label": "2 Syringes",
            "price": 1125,
            "regular": 1500,
            "tag": "BUY 1 GET 1 50% OFF"
          }
        ]
      },
      {
        "name": "Standard Contour Areas",
        "note": "Cheeks (mid-face / cheek enhancement), Smile Lines (Nasolabial folds), Marionette Lines, Pre-jowl sulcus, Temples",
        "options": [
          {
            "label": "1 Syringe",
            "price": 800,
            "regular": 0
          },
          {
            "label": "2 Syringes",
            "price": 1125,
            "regular": 1600,
            "tag": "BUY 1 GET 1 50% OFF"
          },
          {
            "label": "3 Syringes",
            "price": 1800,
            "regular": 2400,
            "tag": "BUY 1 GET 1 50% OFF"
          },
          {
            "label": "4 Syringes",
            "price": 2400,
            "regular": 3200,
            "tag": "BUY 1 GET 1 50% OFF"
          }
        ]
      },
      {
        "name": "Precision / Advanced Areas",
        "note": "Under-Eye Filler (Tear Trough), Chin Enhancement, Jawline Contouring",
        "options": [
          {
            "label": "1 Syringe",
            "price": 850,
            "regular": 0
          },
          {
            "label": "2 Syringes",
            "price": 1700,
            "regular": 0,
            "tag": "BUY 1 GET 1 50% OFF"
          },
          {
            "label": "3 Syringes",
            "price": 2550,
            "regular": 0,
            "tag": "BUY 1 GET 1 50% OFF"
          },
          {
            "label": "4 Syringes",
            "price": 3400,
            "regular": 0,
            "tag": "BUY 1 GET 1 50% OFF"
          }
        ]
      },
      {
        "name": "Profile Balance Package",
        "note": "Lip Enhancement + Chin Enhancement",
        "options": [
          {
            "label": "2 Syringes",
            "price": 995,
            "regular": 0
          }
        ]
      },
      {
        "name": "Refreshed Eye Package",
        "note": "Cheeks (mid-face / cheek enhancement) + Under-Eye Filler (Tear Trough)",
        "options": [
          {
            "label": "2 Syringes",
            "price": 995,
            "regular": 0
          }
        ]
      },
      {
        "name": "Lower Face Contour Package",
        "note": "Jawline Contouring + Chin Enhancement",
        "options": [
          {
            "label": "2 Syringes",
            "price": 1100,
            "regular": 0
          }
        ]
      },
      {
        "name": "Midface Lift Package",
        "note": "Cheeks (mid-face / cheek enhancement) + Smile Lines (Nasolabial folds)",
        "options": [
          {
            "label": "2 Syringes",
            "price": 995,
            "regular": 0
          }
        ]
      },
      {
        "name": "Full Midface Rejuvenation",
        "note": "Cheeks (mid-face / cheek enhancement) + Under-Eye Filler (Tear Trough) + Temples",
        "options": [
          {
            "label": "3 Syringes",
            "price": 1658,
            "regular": 0
          }
        ]
      },
      {
        "name": "Upper Face Support Package",
        "note": "",
        "options": [
          {
            "label": "2 Syringes",
            "price": 995,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "skin-booster-and-bio-stimulators",
    "name": "Skin Booster and Bio-stimulators",
    "blurb": "Hyaluronic acid skin boosters and collagen bio-stimulators, priced per syringe or vial.",
    "items": [
      {
        "name": "Bio-Stimulator – Above the Knee Tightening",
        "note": "",
        "options": [
          {
            "label": "1 Syringe",
            "price": 599,
            "regular": 0
          }
        ]
      },
      {
        "name": "Skin Booster – HA (Hyaluronic Acid)",
        "note": "",
        "options": [
          {
            "label": "1 syringe",
            "price": 399,
            "regular": 0
          },
          {
            "label": "2 syringe",
            "price": 798,
            "regular": 0,
            "tag": "BUY 1 GET 1 50% OFF"
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Radiesse",
        "note": "",
        "options": [
          {
            "label": "1 Syringe",
            "price": 599,
            "regular": 0
          },
          {
            "label": "2 Syringes",
            "price": 1198,
            "regular": 1700,
            "tag": "BUY 1 GET 1 50% OFF"
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Sculptra Liquid Facelift",
        "note": "",
        "options": [
          {
            "label": "1 Vial",
            "price": 699,
            "regular": 0
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Sculptra",
        "note": "",
        "options": [
          {
            "label": "1 Vial",
            "price": 699,
            "regular": 0
          },
          {
            "label": "2 Vials",
            "price": 1398,
            "regular": 0,
            "tag": "BUY 1 GET 1 50% OFF"
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Crepey Arm Rejuvenation with Radiesse",
        "note": "",
        "options": [
          {
            "label": "Per Syringe",
            "price": 599,
            "regular": 0
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Hand Rejuvenation with Radiesse",
        "note": "",
        "options": [
          {
            "label": "1 Syringe",
            "price": 599,
            "regular": 0
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Radiesse Collagen Lift",
        "note": "",
        "options": [
          {
            "label": "1 Syringe",
            "price": 599,
            "regular": 0
          }
        ]
      },
      {
        "name": "Bio-Stimulator – Radiesse Jawline Lift",
        "note": "",
        "options": [
          {
            "label": "1 Syringe",
            "price": 599,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "non-surgical-butt-lift",
    "name": "Non-Surgical Butt Lift",
    "blurb": "Non-surgical contouring for the buttocks and hips, planned at your consultation.",
    "items": [
      {
        "name": "Non-Surgical Butt Lift",
        "note": "",
        "options": [
          {
            "label": "60 mL",
            "price": 3999,
            "regular": 0
          }
        ]
      },
      {
        "name": "Hip Dip Contouring",
        "note": "",
        "options": [
          {
            "label": "Standard",
            "price": 1999,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "microneedling",
    "name": "Microneedling",
    "blurb": "Collagen induction for the face and neck, with optional PRP, PDRN or exosomes.",
    "items": [
      {
        "name": "Microneedling-Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 245,
            "regular": 490,
            "tag": "50% OFF"
          },
          {
            "label": "Package of 3",
            "price": 735,
            "regular": 1470,
            "tag": "50% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1470,
            "regular": 2940,
            "tag": "50% OFF"
          }
        ]
      },
      {
        "name": "Microneedling with PRP - Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 590,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1416,
            "regular": 1770,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2478,
            "regular": 3540,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Microneedling with PDRN (Salmon DNA) - Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 590,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1416,
            "regular": 1770,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2478,
            "regular": 3540,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Microneedling with Exosomes - Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 590,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1416,
            "regular": 1770,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2478,
            "regular": 3540,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Microneedling - Neck",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 490,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1176,
            "regular": 1470,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2058,
            "regular": 2940,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "laser-acne-treatment",
    "name": "Laser Acne Treatment",
    "blurb": "Laser sessions for acne on the face or upper back.",
    "items": [
      {
        "name": "Laser Acne Full Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 375,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 895,
            "regular": 1125,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1575,
            "regular": 2250,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Acne Upper Back",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 4500,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1800,
            "regular": 2250,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3150,
            "regular": 4500,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "laser-skin-resurfacing",
    "name": "Laser Skin Resurfacing",
    "blurb": "Ablative, fractional and laser peel options, priced by treatment area.",
    "items": [
      {
        "name": "Laser Skin Resurfacing Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 990,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2376,
            "regular": 2970,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 4158,
            "regular": 5940,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Skin Resurfacing Face & Neck",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1800,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 4320,
            "regular": 5400,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 7560,
            "regular": 10800,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Skin Resurfacing Extra Small Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 200,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 480,
            "regular": 600,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 840,
            "regular": 1200,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Skin Resurfacing Small Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 300,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 720,
            "regular": 900,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1260,
            "regular": 1800,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Skin Resurfacing Medium Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 600,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1440,
            "regular": 1800,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2520,
            "regular": 3600,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Skin Resurfacing Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 990,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2376,
            "regular": 2970,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 4158,
            "regular": 5940,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Fractional Laser Skin Resurfacing Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1270,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 3048,
            "regular": 3810,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 5334,
            "regular": 7620,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Fractional Laser Skin Resurfacing Face & Neck",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 2080,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 4992,
            "regular": 6240,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 8736,
            "regular": 12480,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Fractional Laser Skin Resurfacing Extra Small Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 300,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 720,
            "regular": 900,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1260,
            "regular": 1800,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Fractional Laser Skin Resurfacing Small Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 650,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1560,
            "regular": 1950,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2730,
            "regular": 3900,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Fractional Laser Skin Resurfacing Medium Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 850,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2040,
            "regular": 2550,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3570,
            "regular": 5100,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Fractional Laser Skin Resurfacing Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1270,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 3048,
            "regular": 3810,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 5334,
            "regular": 7620,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Micro Laser Peel Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 679,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1629.6,
            "regular": 2037,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2851.8,
            "regular": 4074,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Micro Laser Peel Face + Neck",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1178,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2827,
            "regular": 3534,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 4947,
            "regular": 7068,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Micro Laser Peel Extra Small",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 300,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 720,
            "regular": 900,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1260,
            "regular": 1800,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Micro Laser Peel Small",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 589,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1413.6,
            "regular": 1767,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2473.8,
            "regular": 3534,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Micro Laser Peel Medium",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 900,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2160,
            "regular": 2700,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3780,
            "regular": 5400,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Micro Laser Peel Large",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1180,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2832,
            "regular": 3540,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 4956,
            "regular": 7080,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Ultra Laser Peel Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 489,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1173.6,
            "regular": 1467,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2053.8,
            "regular": 2934,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "photo-rejuvenation",
    "name": "Photo-Rejuvenation",
    "blurb": "IPL light therapy that can reduce the look of redness and sun spots.",
    "items": [
      {
        "name": "Photo-Rejuvenation Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 395,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 948,
            "regular": 1185,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1659,
            "regular": 2370,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Photo-Rejuvenation Extra Small",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 275,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 660,
            "regular": 825,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1155,
            "regular": 1650,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Photo-Rejuvenation Small",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 390,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 936,
            "regular": 1170,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1638,
            "regular": 2340,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Photo-Rejuvenation Medium",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 790,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1896,
            "regular": 2370,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3318,
            "regular": 4740,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Photo-Rejuvenation Large",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1185,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2844,
            "regular": 3555,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2844,
            "regular": 7110,
            "tag": "60% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "4d-rejuvalift",
    "name": "4D Rejuvalift",
    "blurb": "A multi-step laser protocol for the face and larger areas.",
    "items": [
      {
        "name": "4D Rejuvalift Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1200,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2880,
            "regular": 3600,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 5040,
            "regular": 7200,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "4D Rejuvalift Large",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1200,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2880,
            "regular": 3600,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 5040,
            "regular": 7200,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "2d-3d-laser-skin-tightening",
    "name": "2D & 3D Laser Skin Tightening",
    "blurb": "Laser protocols that can improve the look of skin laxity.",
    "items": [
      {
        "name": "2D Skin Tightening Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 480,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1440,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 2880,
            "regular": 0
          }
        ]
      },
      {
        "name": "2D Skin Tightening Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 960,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2880,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 5760,
            "regular": 0
          }
        ]
      },
      {
        "name": "Smooth Eye Tightening",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 600,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1440,
            "regular": 1800,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2520,
            "regular": 3600,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "3D Skin Tightening Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 810,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2160,
            "regular": 2700,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3780,
            "regular": 5400,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "3D Skin Tightening Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 810,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2160,
            "regular": 2700,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3780,
            "regular": 5400,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "2d-3d-laser-rejuvenation",
    "name": "2D & 3D Laser Rejuvenation",
    "blurb": "Laser protocols for skin tone and texture.",
    "items": [
      {
        "name": "2D Skin Rejuvenation Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 600,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1440,
            "regular": 1800,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2520,
            "regular": 3600,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "2D Skin Rejuvenation Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 960,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2880,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 5760,
            "regular": 0
          }
        ]
      },
      {
        "name": "3D Skin Rejuvenation Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 900,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 2700,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 5400,
            "regular": 0
          }
        ]
      },
      {
        "name": "3D Skin Rejuvenation Large Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1200,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 3600,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 7200,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "facial",
    "name": "Facial",
    "blurb": "Medical-grade facials tailored to your skin at each visit.",
    "items": [
      {
        "name": "Age Element Facial",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 249,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 597.6,
            "regular": 747,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1045.8,
            "regular": 1494,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Purifying Acne Relief Facial",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 249,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 597.6,
            "regular": 747,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1045.8,
            "regular": 1494,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Glass Glow Facial",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 249,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 597.6,
            "regular": 747,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1045.8,
            "regular": 1494,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "chemical-peel",
    "name": "Chemical Peel",
    "blurb": "Light, medium and deep peels, chosen for your skin type and goals.",
    "items": [
      {
        "name": "Purifying Light Peel",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 149,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 355.6,
            "regular": 447,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 625.8,
            "regular": 894,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Brightening Medium Peel",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 299,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 717.6,
            "regular": 897,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1255.8,
            "regular": 1794,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "PRO Deep Peel",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 399,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 957,
            "regular": 1197,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1675.8,
            "regular": 2394,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Acnelan",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 249,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 597.6,
            "regular": 747,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1045.8,
            "regular": 1494,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "depigmenting-treatment",
    "name": "Depigmenting Treatment",
    "blurb": "Professional depigmentation protocols for the look of dark spots and uneven tone.",
    "items": [
      {
        "name": "Cosmelan",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 799.2,
            "regular": 999,
            "tag": "20% OFF"
          }
        ]
      },
      {
        "name": "Dermamelan",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1119.2,
            "regular": 1399,
            "tag": "20% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "hair-loss",
    "name": "Hair Loss",
    "blurb": "PRP scalp treatments and laser hair rejuvenation, priced by area.",
    "items": [
      {
        "name": "PRP Scalp - Small",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 399,
            "regular": 1000,
            "tag": "60% OFF"
          },
          {
            "label": "Package of 3",
            "price": 1197,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 2394,
            "regular": 0
          }
        ]
      },
      {
        "name": "PRP Scalp - Medium",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1500,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 3600,
            "regular": 4500,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 6300,
            "regular": 9000,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "PRP Scalp - Full",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 2100,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 5040,
            "regular": 6300,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 8820,
            "regular": 12600,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Laser Hair Rejuvenation",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 350,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1050,
            "regular": 0
          },
          {
            "label": "Package of 6",
            "price": 2100,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "laser-hair-removal",
    "name": "Laser Hair Removal",
    "blurb": "Medical-grade laser hair reduction, priced per area and session.",
    "items": [
      {
        "name": "LHR - Abdomen",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 190,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 570,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1520,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Arms (Full)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 290,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 870,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2320,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Arms (Lower)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 190,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 570,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1520,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Arms (Upper)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 219,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 657,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1095,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1752,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Hands & Fingers",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 150,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Back (Full)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 390,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1170,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 3120,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Back (Lower)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 250,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1250,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2000,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Back (Upper)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 250,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1250,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2000,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Full Back & Shoulders",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 520,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1560,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 2600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 4160,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Upper Back & Shoulders",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 450,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1350,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 2250,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 3600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Chest",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 290,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 870,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2320,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Chest & Abdomen",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 450,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1350,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 2250,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 3600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Chest, Abdomen & Shoulders",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 550,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1650,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 2750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 4400,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Legs (Full)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 490,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1470,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 2450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 3920,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Legs (Upper)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 290,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 870,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2320,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Legs (Lower)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 290,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 870,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2320,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Full Legs & Brazilian",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 650,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 3250,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 5200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Full Legs & Bikini",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 620,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1860,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 3100,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 4960,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Brazilian",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 190,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 570,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1520,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Bikini",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 150,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Buttocks",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 350,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1050,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2800,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Linea Alba",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 120,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 360,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 960,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Full face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 290,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 870,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2320,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Half Face",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 190,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 570,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1520,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Chin",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 120,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 360,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 960,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Chin & Anterior Neck",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 190,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 570,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1520,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Lip (Upper & Lower)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 120,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 360,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 960,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Lip (Upper)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 90,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 270,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 720,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Sideburns",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 120,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 360,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 960,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Eyebrows",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 120,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 360,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Entire Neck",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 250,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 1250,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 2000,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Neck (Front)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 150,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Neck (Back)",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 150,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "Areola",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 120,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 360,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 600,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 960,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Feet & Toes",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 150,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Shoulders",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 190,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 570,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 950,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1520,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      },
      {
        "name": "LHR - Underarms",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 150,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 450,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 5",
            "price": 750,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          },
          {
            "label": "Package of 8",
            "price": 1200,
            "regular": 0,
            "tag": "BUY 1 GET 1 FREE"
          }
        ]
      }
    ]
  },
  {
    "id": "laser-vaginal-tightening",
    "name": "Laser Vaginal Tightening",
    "blurb": "Non-surgical laser treatment, discussed privately at your consultation.",
    "items": [
      {
        "name": "Vaginal Tightening",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 1250,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 3000,
            "regular": 3750,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 5250,
            "regular": 7500,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "coolsculpting-tight-sculpting",
    "name": "Coolsculpting & Tight Sculpting",
    "blurb": "Non-invasive body contouring, priced per zone or area.",
    "items": [
      {
        "name": "Regular Treatment Zone",
        "note": "",
        "options": [
          {
            "label": "Single zone",
            "price": 850,
            "regular": 0
          },
          {
            "label": "2 zones",
            "price": 1360,
            "regular": 1700,
            "tag": "20% OFF"
          },
          {
            "label": "4 zones and more",
            "price": 3400,
            "regular": 0
          },
          {
            "label": "8 zones",
            "price": 4760,
            "regular": 6800,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Coolsculpting Mini",
        "note": "",
        "options": [
          {
            "label": "Single zone",
            "price": 1000,
            "regular": 0
          },
          {
            "label": "2 zones",
            "price": 1600,
            "regular": 2000,
            "tag": "20% OFF"
          },
          {
            "label": "4 zones and more",
            "price": 4000,
            "regular": 0
          },
          {
            "label": "8 zones",
            "price": 5600,
            "regular": 8000,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Coolsculpting Smooth",
        "note": "",
        "options": [
          {
            "label": "Single zone",
            "price": 1000,
            "regular": 0
          },
          {
            "label": "2 zones",
            "price": 2000,
            "regular": 0
          },
          {
            "label": "4 zones and more",
            "price": 4000,
            "regular": 0
          },
          {
            "label": "8 zones",
            "price": 8000,
            "regular": 0
          }
        ]
      },
      {
        "name": "Coolsculpting Double",
        "note": "",
        "options": [
          {
            "label": "Single zone",
            "price": 1600,
            "regular": 0
          },
          {
            "label": "2 zones",
            "price": 2560,
            "regular": 3200,
            "tag": "20% OFF"
          },
          {
            "label": "4 zones and more",
            "price": 6400,
            "regular": 0
          },
          {
            "label": "8 zones",
            "price": 8960,
            "regular": 12800,
            "tag": "30% OFF"
          }
        ]
      },
      {
        "name": "Tight Sculpting - Small Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 600,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1440,
            "regular": 1800,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 2520,
            "regular": 3600,
            "tag": "30% OFF"
          },
          {
            "label": "Package of 8",
            "price": 4800,
            "regular": 0
          }
        ]
      },
      {
        "name": "Tight Sculpting - Medium Area",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 800,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1920,
            "regular": 2400,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 3360,
            "regular": 4800,
            "tag": "30% OFF"
          },
          {
            "label": "Package of 8",
            "price": 6400,
            "regular": 0
          }
        ]
      }
    ]
  },
  {
    "id": "snoring-treatment",
    "name": "Snoring Treatment",
    "blurb": "A non-invasive laser treatment, given as a series of sessions.",
    "items": [
      {
        "name": "Snoring Treatment",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 450,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 1080,
            "regular": 1350,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1890,
            "regular": 2700,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "toenail-fungus-removal",
    "name": "Toenail Fungus Removal",
    "blurb": "Laser treatment, given as a series of sessions.",
    "items": [
      {
        "name": "Toenail Fungus Removal",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 300,
            "regular": 0
          },
          {
            "label": "Package of 3",
            "price": 719,
            "regular": 900,
            "tag": "20% OFF"
          },
          {
            "label": "Package of 6",
            "price": 1260,
            "regular": 1800,
            "tag": "30% OFF"
          }
        ]
      }
    ]
  },
  {
    "id": "latisse",
    "name": "Latisse",
    "blurb": "Prescription product, available after a medical assessment.",
    "items": [
      {
        "name": "Latisse",
        "note": "",
        "options": [
          {
            "label": "Single session",
            "price": 245,
            "regular": 0
          }
        ]
      }
    ]
  }
];

/**
 * Names used on the site's cards and menus, mapped to the price list: [category id, treatment].
 * Keys are normalised names (lower case, no ® or ™).
 */
export const PRICE_NAMES: Record<string, [categoryId: string, item?: string]> = {
  "botox": [
    "botox-dysport",
    "Botox Cosmetic"
  ],
  "dysport": [
    "botox-dysport",
    "Dysport"
  ],
  "botox / dysport": [
    "botox-dysport"
  ],
  "dermal fillers": [
    "dermal-fillers"
  ],
  "juvederm": [
    "dermal-fillers"
  ],
  "lip fillers": [
    "dermal-fillers",
    "Lip Enhancement"
  ],
  "lip filler": [
    "dermal-fillers",
    "Lip Enhancement"
  ],
  "lip augmentation": [
    "dermal-fillers",
    "Lip Enhancement"
  ],
  "under eye filler": [
    "dermal-fillers",
    "Precision"
  ],
  "tear trough correction": [
    "dermal-fillers",
    "Precision"
  ],
  "skin boosters": [
    "skin-booster-and-bio-stimulators",
    "Skin Booster"
  ],
  "skin booster": [
    "skin-booster-and-bio-stimulators",
    "Skin Booster"
  ],
  "mesotherapy & skin boosters": [
    "skin-booster-and-bio-stimulators",
    "Skin Booster"
  ],
  "sculptra": [
    "skin-booster-and-bio-stimulators",
    "Sculptra"
  ],
  "sculptra liquid facelift": [
    "skin-booster-and-bio-stimulators",
    "Sculptra"
  ],
  "radiesse": [
    "skin-booster-and-bio-stimulators",
    "Radiesse"
  ],
  "hand rejuvenation with radiesse": [
    "skin-booster-and-bio-stimulators",
    "Radiesse"
  ],
  "aptos thread lift": [
    "aptos-thread-method"
  ],
  "aptos": [
    "aptos-thread-method"
  ],
  "microneedling": [
    "microneedling"
  ],
  "laser skin resurfacing": [
    "laser-skin-resurfacing"
  ],
  "micro laser peel": [
    "laser-skin-resurfacing",
    "Laser Peel"
  ],
  "photo rejuvenation": [
    "photo-rejuvenation"
  ],
  "photo rejuvenation (ipl)": [
    "photo-rejuvenation"
  ],
  "ipl": [
    "photo-rejuvenation"
  ],
  "4d rejuvalift": [
    "4d-rejuvalift"
  ],
  "laser skin tightening": [
    "2d-3d-laser-skin-tightening"
  ],
  "skin tightening": [
    "2d-3d-laser-skin-tightening"
  ],
  "chemical peels": [
    "chemical-peel"
  ],
  "chemical peel": [
    "chemical-peel"
  ],
  "medical facials": [
    "facial"
  ],
  "age element facial": [
    "facial",
    "Age Element"
  ],
  "facial": [
    "facial"
  ],
  "acnelan": [
    "chemical-peel",
    "Acnelan"
  ],
  "cosmelan & dermamelan": [
    "depigmenting-treatment"
  ],
  "dermamelan": [
    "depigmenting-treatment",
    "Dermamelan"
  ],
  "cosmelan": [
    "depigmenting-treatment",
    "Cosmelan"
  ],
  "laser acne treatment": [
    "laser-acne-treatment"
  ],
  "acne treatments": [
    "laser-acne-treatment"
  ],
  "laser hair removal": [
    "laser-hair-removal"
  ],
  "laser vein removal": [
    "laser-vein"
  ],
  "spider vein removal": [
    "laser-vein"
  ],
  "coolsculpting": [
    "coolsculpting-tight-sculpting",
    "Coolsculpting"
  ],
  "tightsculpting": [
    "coolsculpting-tight-sculpting",
    "Tight Sculpting"
  ],
  "non surgical butt lift": [
    "non-surgical-butt-lift"
  ],
  "non surgical bbl": [
    "non-surgical-butt-lift"
  ],
  "prp hair restoration": [
    "hair-loss",
    "PRP Scalp"
  ],
  "hair loss treatments": [
    "hair-loss"
  ],
  "laser hair rejuvenation": [
    "hair-loss"
  ],
  "vaginal tightening": [
    "laser-vaginal-tightening"
  ],
  "snoring treatment": [
    "snoring-treatment"
  ],
  "nail fungus treatment": [
    "toenail-fungus-removal"
  ]
};
