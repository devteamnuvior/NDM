import type { ProcedurePage } from "@/types/treatment";

/**
 * Botox page content, generated from the prototype's src/procedure-ui.jsx (PROC), word for word.
 * PUBLISH GATE: this is the live site's wording. It names Botox® beside the treatment's effects, which
 * Health Canada (C.01.044) does not allow in consumer advertising of a prescription drug, and it names
 * the Medical Director. Raymond Valadkhani's written approval is needed before this page goes live.
 * The price rows come from the price list (see the page), not from here.
 */
export const BOTOX: ProcedurePage = {
  "crumbs": [
    "Procedures",
    "Injectables",
    "Botox®"
  ],
  "nav": [
    [
      "benefits",
      "Benefits"
    ],
    [
      "film",
      "The clinic"
    ],
    [
      "overview",
      "About"
    ],
    [
      "why-choose",
      "Why choose"
    ],
    [
      "watch",
      "Watch"
    ],
    [
      "results",
      "Results"
    ],
    [
      "prices",
      "Prices"
    ],
    [
      "guide",
      "Good to know"
    ],
    [
      "why",
      "Why NewDermaMed"
    ],
    [
      "visit",
      "Visit us"
    ],
    [
      "faq",
      "FAQ"
    ]
  ],
  "title": [
    "Botox®",
    "in Toronto"
  ],
  "sub": "Smooth wrinkles with trusted Botox® safe, expert care for natural, youthful results.",
  "hero": {
    "desktop": "/assets/botox/hero.jpg",
    "mobile": "/assets/botox/hero-m.jpg",
    "position": "50% 30%",
    "alt": "A woman with her fingertips at her temples, Botox® Cosmetic at NewDermaMed, Toronto"
  },
  "where": "At our Uptown clinic, Yonge & Sheppard, and our Downtown clinic, Bay & College, Toronto.",
  "offer": {
    "tag": "Current offer",
    "title": "Botox® Cosmetic packages",
    "big": [
      "Up to",
      "{{botoxMax}}",
      "off"
    ],
    "href": "#prices",
    "cta": "See the prices"
  },
  "facts": [
    [
      "Treatment Type",
      "Injectable"
    ],
    [
      "Duration",
      "30 minutes"
    ],
    [
      "Recovery Time",
      "Minimal downtime"
    ]
  ],
  "intro": {
    "id": "benefits",
    "tag": "Benefits",
    "lead": "What is Botox® Cosmetic",
    "strong": "and how does it work?",
    "img": "/assets/botox/why-choose.jpg",
    "contain": "#EFEDE7",
    "alt": "Treatment areas: forehead lines, frown lines, crow’s feet, jawline slimming, neck bands and hyperhidrosis",
    "text": [
      "Botox® Cosmetic is a Health Canada approved prescription neuromodulator. At NewDermaMed it is given only by our licensed medical team, after a free in-person assessment at our Uptown clinic near Yonge and Sheppard or our Downtown clinic near Bay and College.",
      "The treatment briefly quiets the nerve signal that tells a small facial muscle to contract. As the muscle relaxes, the lines that form when you frown, squint or raise your brows may soften, and over about three to four months movement gradually returns. Your provider plans the dose around how your face moves, often starting conservatively. Individual results may vary.",
      "Pregnancy, breastfeeding, some neuromuscular conditions and certain medications can mean it is not the right choice, so your health history is reviewed first."
    ],
    "chips": [
      "Forehead lines",
      "Frown lines",
      "Crow’s feet",
      "Brow lift",
      "Gummy smile",
      "Jawline slimming"
    ],
    "note": "When administered by a qualified, licensed professional, Botox® has a demonstrated safety profile. The injection site may experience mild redness, swelling, or bruising, but these side effects are rare and usually go away in a few hours to days.",
    "points": []
  },
  "film": {
    "src": "/assets/clinic/ndm-clinic.mp4",
    "poster": "/assets/clinic/ndm-clinic-poster.jpg",
    "lead": "Botox®",
    "strong": "at NewDermaMed Toronto",
    "text": "Two clinics, Uptown on Yonge Street and Downtown on Bay Street. Every visit starts with a free consultation and a VISIA® skin analysis with our licensed medical team.",
    "chips": [
      "4763 Yonge St, Uptown",
      "790 Bay St, Downtown",
      "Free consultation",
      "VISIA® skin analysis"
    ]
  },
  "overview": {
    "tag": "About",
    "lead": "What can I expect",
    "strong": "from Botox® treatment?",
    "tabs": [
      {
        "label": "Treatment Overview",
        "stat": [
          "20+",
          "years of clinical research"
        ],
        "text": [
          "By momentarily relaxing the underlying muscles that cause expression lines, Botox® Cosmetic is a reliable, non-surgical procedure that reduces wrinkles and fine lines. Botox® is one of the most researched and secure cosmetic procedures in the world, having been used in more than 78 countries and undergoing more than 20 years of clinical research. Our experts at NewDermaMed use precise injections to produce refreshed, natural-looking results without changing your distinctive facial expressions."
        ]
      },
      {
        "label": "What to Expect",
        "stat": [
          "15–20",
          "minutes per treatment"
        ],
        "text": [
          "A typical Botox® session lasts 15 to 20 minutes, making it quick and convenient. Our skilled injector will assess your facial structure during your visit and use a tiny needle to carefully apply the treatment. The majority of patients describe the slight discomfort as a momentary pinch. It’s the ideal “lunchtime procedure” because you can get back to your regular activities right away. Within three to seven days, noticeable progress is made, and in roughly two weeks, the full effects are achieved."
        ]
      },
      {
        "label": "How it Works",
        "stat": [
          "3–7",
          "days to a visible change"
        ],
        "text": [
          "Purified botulinum toxin type A, which temporarily stops nerve signals to the targeted muscles, is an ingredient in Botox®. The skin above these muscles smoothes out and wrinkles like frown lines, forehead lines, and crow’s feet are lessened by lowering repetitive contractions. Instead of adding volume, the treatment prevents and corrects dynamic wrinkles brought on by facial movement."
        ]
      },
      {
        "label": "Maintenance",
        "stat": [
          "3–4",
          "months, typical duration"
        ],
        "text": [
          "Although longevity can vary depending on lifestyle, metabolism, and treatment area, Botox® results typically last three to four months. Patients are advised to arrange maintenance procedures three to four times a year in order to preserve a young, refreshed appearance. Over time, results might last longer with regular treatments."
        ]
      },
      {
        "label": "Pricing",
        "stat": [
          "{{botox}}",
          "per unit"
        ],
        "text": [
          "Treatment plans are completely customized because each face is different. We invite you to schedule a free consultation with one of our experts so that you can go over your options, talk about your objectives, and create a plan that is specifically for you."
        ],
        "link": [
          "#prices",
          "See the price list"
        ]
      }
    ]
  },
  "choose": {
    "img": "/assets/botox/benefits.webp",
    "alt": "A provider giving Botox® Cosmetic at NewDermaMed, Toronto",
    "tag": "Why choose",
    "lead": "Why choose",
    "strong": "Botox®?",
    "cards": [
      [
        "Smooths Fine Lines & Wrinkles",
        "Softens crow’s feet, frown lines, and forehead creases."
      ],
      [
        "Prevents New Wrinkle Formation",
        "Relaxes facial muscles to reduce future expression lines."
      ],
      [
        "Quick & Convenient",
        "Treatment takes only minutes with no downtime required."
      ],
      [
        "Natural-Looking Results",
        "Refreshes appearance without affecting facial expressions."
      ],
      [
        "Clinically Proven & Safe",
        "Backed by 20+ years of research and global trust."
      ],
      [
        "A Good Candidate",
        "People seeking a non-invasive anti-aging treatment who have moderate to severe fine lines or wrinkles, anyone seeking understated, organic improvements, and those looking for preventative wrinkle care."
      ]
    ]
  },
  "reel": {
    "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/botox-.mp4",
    "poster": "/assets/botox/reel.webp",
    "tag": "Botox®",
    "lead": "See it",
    "strong": "at NewDermaMed",
    "text": "A short clip from our Instagram, filmed at the clinic. Follow @newdermamed for more."
  },
  "why": {
    "alt": "The NewDermaMed medical team with their Top Choice Award at the Toronto clinic",
    "position": "50% 35%",
    "lead": "Expert care at",
    "strong": "two Toronto clinics",
    "items": [
      [
        "16+",
        "Years",
        "Caring for patients in Toronto"
      ],
      [
        "8",
        "Awards",
        "Top Choice Award, 2019 to 2026"
      ],
      [
        "Licensed",
        "Medical team",
        "Treatments are given only by our licensed medical team"
      ],
      [
        "Free",
        "Consultation",
        "Every plan starts with an in-person assessment"
      ]
    ]
  },
  "results": {
    "lead": "Botox® before",
    "strong": "and after photos",
    "text": "Cases from our before and after gallery, photographed at NewDermaMed.",
    "pics": [
      {
        "src": "/assets/botox/case-1.webp",
        "label": "Botox®"
      },
      {
        "src": "/assets/botox/case-2.webp",
        "label": "Botox®"
      },
      {
        "src": "/assets/botox/case-3.webp",
        "label": "Botox®"
      }
    ]
  },
  "prices": {
    "lead": "How much does Botox®",
    "strong": "cost in Toronto?",
    "category": "Botox / Dysport",
    "unitLabel": "Regular",
    "groups": [
      {
        "name": "Botox Cosmetic",
        "title": "Botox® Cosmetic",
        "blurb": "A prescription product priced per unit, given only after an in-person medical assessment."
      },
      {
        "name": "Dysport",
        "title": "Dysport®",
        "blurb": "A prescription product priced per unit, given only after an in-person medical assessment."
      }
    ]
  },
  "guide": {
    "tag": "Good to know",
    "lead": "Botox® in Toronto:",
    "strong": "cost, care and choices",
    "intro": "Short answers to what people ask most before their first Botox® visit. Your provider confirms everything at your free consultation.",
    "items": [
      {
        "q": "How many units of Botox® will I need?",
        "a": [
          "Your dose depends on the areas treated and how strong those muscles are. As a guide, the approved doses are about 20 units for the frown lines between the brows and about 24 units for crow’s feet across both eyes. Your provider confirms your units at your free consultation."
        ]
      },
      {
        "q": "How much does Botox® cost per area?",
        "a": [
          "Botox® Cosmetic is {{botox}} per unit at NewDermaMed, and packages of 60 to 220 units are currently {{botoxOff}} off. At the regular price, 20 units are {{botox20}} and 24 units are {{botox24}}. Your final price is confirmed after your assessment."
        ]
      },
      {
        "q": "Who performs Botox® at NewDermaMed?",
        "a": [
          "Botox® is given only by our licensed medical team, under the medical direction of Dr. Negin Mastouri, and only after an in-person assessment of your health history, your goals and how your face moves."
        ]
      },
      {
        "q": "What should I do before and after my appointment?",
        "a": [
          "Your provider gives you written aftercare for your treatment. Common advice includes:"
        ],
        "list": [
          "Tell your provider about any medicines or supplements you take, especially blood thinners",
          "Avoid alcohol the day before, as it can make bruising more likely",
          "Stay upright and avoid rubbing or massaging the treated area for the rest of the day",
          "Skip strenuous exercise, saunas and hot yoga until the next day"
        ]
      },
      {
        "q": "Botox® or Dysport®: which is right for me?",
        "a": [
          "Both are Health Canada approved prescription neuromodulators that work in a similar way. Their formulations differ and their units are not interchangeable, so each is dosed on its own. At NewDermaMed, Botox® Cosmetic is {{botox}} per unit and Dysport® is {{dysport}} per unit. Your provider recommends the one that suits your goals."
        ]
      }
    ],
    "updated": [
      "2026-11-10",
      "November 10, 2026"
    ],
    "related": [
      {
        "name": "Dermal Fillers",
        "img": "/assets/home/v3/jawline-720.webp",
        "kind": "Injectable"
      },
      {
        "name": "Lip Augmentation",
        "img": "/assets/home/v3/lips-720.webp",
        "kind": "Injectable"
      },
      {
        "name": "Skin Boosters",
        "img": "/assets/home/v3/booster-720.webp",
        "kind": "Injectable"
      },
      {
        "name": "Aptos Thread Lift",
        "img": "/assets/aptos/midface-vectors.jpg",
        "kind": "Bio-stimulator"
      },
      {
        "name": "Sculptra®",
        "img": "/assets/home/v3/sculptra-720.webp",
        "kind": "Bio-stimulator"
      },
      {
        "name": "Microneedling",
        "img": "/assets/home/v3/mneedle-720.webp",
        "kind": "Skin"
      }
    ]
  },
  "faq": {
    "lead": "FAQ For",
    "strong": "Botox®",
    "sub": "Everything you need to know before starting your journey with us."
  },
  "faqs": [
    [
      "What is Botox®?",
      "Botox® is an FDA- and Health Canada-approved injectable treatment that relaxes facial muscles to smooth fine lines and wrinkles."
    ],
    [
      "What areas can Botox® treat?",
      "Common areas include forehead lines, frown lines, crow’s feet, brow lift, gummy smile, and jawline slimming."
    ],
    [
      "How soon will I see results from Botox®?",
      "Results typically appear within 3–7 days, with full effects visible in about 2 weeks after treatment."
    ],
    [
      "How long do Botox® results last?",
      "Results generally last 3–4 months, with maintenance treatments recommended to preserve a youthful, refreshed look."
    ],
    [
      "Is Botox® safe?",
      "Yes. Botox® has been extensively studied with over 20 years of clinical use worldwide, and is safe when performed by licensed professionals."
    ],
    [
      "Does Botox® hurt?",
      "Most patients describe the slight discomfort as a momentary pinch. A very fine needle is used, and each injection takes only a few seconds."
    ],
    [
      "Will I bruise after Botox®?",
      "Mild redness, swelling or bruising at the injection sites may occur. These effects are uncommon and usually settle within a few hours to days."
    ],
    [
      "How soon can I go back to work?",
      "Most people return to their regular activities, including work, straight after treatment."
    ],
    [
      "When can I exercise after Botox®?",
      "Many providers suggest waiting until the next day before strenuous exercise. Your provider gives you aftercare for your treatment."
    ],
    [
      "How many units of Botox® will I need?",
      "It depends on the areas treated. As a guide, frown lines often need about 20 units and crow’s feet about 24 units across both eyes. Your provider confirms your units at your free consultation."
    ],
    [
      "Is Botox® covered by OHIP or insurance?",
      "Cosmetic treatments are not covered by OHIP, and most private insurance plans do not cover them. We offer flexible payment plans instead."
    ],
    [
      "Do you offer payment plans?",
      "Yes. We offer flexible payment plans through Affirm for Canadian residents aged 19+, with a minimum $500 purchase."
    ],
    [
      "Can I reschedule or cancel my appointment?",
      "Yes. Please call your clinic at least 24 hours before your appointment to change or cancel it."
    ],
    [
      "Botox® or Dysport®, which is better?",
      "Neither is better for everyone. Both are Health Canada approved neuromodulators, dosed separately because their units differ. Your provider recommends the one that suits your goals."
    ],
    [
      "Where are your Toronto clinics?",
      "Uptown: 4763 Yonge Street, near Sheppard-Yonge Station, with parking at Hallmark Centre, 4800 Yonge or 25 Sheppard Ave W. Downtown: 790 Bay Street, Suite 900, near College Station, with parking at 88 or 100 College Street."
    ]
  ]
};

/** Price-list category the page's groups come from. */
export const BOTOX_PRICE_CATEGORY = "botox-dysport";
