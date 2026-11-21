import type { ConcernPage } from "@/types/concern";

/**
 * Wrinkles & fine lines page content, generated from the prototype's src/concern-data.json (Ray's concern
 * copy). Links are written as the prototype writes them and resolved with contentLink(). The option cards'
 * prices come from the price list when the treatment is on it (see the page); the values here are the fallback.
 * PUBLISH GATE: the Results photos are labelled Botox® (a prescription drug shown with before and after
 * photos); Raymond Valadkhani's written approval is needed before this page goes live.
 */
export const WRINKLES: ConcernPage = {
  "short": "Wrinkles & Fine Lines",
  "crumbs": [
    "Concerns",
    "Wrinkles & Fine Lines"
  ],
  "title": [
    "Wrinkles &",
    "fine lines"
  ],
  "sub": "Lines tell a story. Whether they appear when you smile or stay when your face is at rest, there are ways to soften them that still look like you.",
  "hero": {
    "desktop": "/assets/live/main/uploads/2025/09/16.jpg",
    "mobile": "/assets/live/main/uploads/2025/09/16.1.jpg",
    "position": "50% 30%",
    "alt": "Wrinkles and fine lines treatments at NewDermaMed, Toronto"
  },
  "where": "At our Uptown clinic, Yonge & Sheppard, and our Downtown clinic, Bay & College, Toronto.",
  "facts": [
    [
      "Treatment options",
      "11 to compare"
    ],
    [
      "Consultation",
      "Free, in person"
    ],
    [
      "Skin analysis",
      "VISIA®, included"
    ],
    [
      "Starting price",
      ""
    ]
  ],
  "nav": [
    [
      "about",
      "Overview"
    ],
    [
      "understand",
      "The concern"
    ],
    [
      "assess",
      "Assessment"
    ],
    [
      "options",
      "Options"
    ],
    [
      "compare",
      "Side by side"
    ],
    [
      "expect",
      "What to expect"
    ],
    [
      "results",
      "Results"
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
  "lede": [
    "Not every line is the same, and that is the whole point of a good plan. Fine surface lines, creases from repeated expressions, deeper folds at rest and lines that come from lost volume each respond to different treatments. At NewDermaMed your consultation starts by working out which kind you have, then matches the option to the line.",
    "Most plans combine a treatment for the surface with one for structure, and the change is gradual and subtle. The aim is a rested version of you, never a frozen or overfilled one."
  ],
  "pages": [
    {
      "name": "Wrinkle Treatments",
      "href": "#/wrinkle-treatments"
    },
    {
      "name": "Laser Skin Resurfacing",
      "href": "#/laser-skin-resurfacing"
    },
    {
      "name": "Microneedling",
      "href": "#/microneedling"
    },
    {
      "name": "Dermal Fillers",
      "href": "#/dermal-fillers"
    }
  ],
  "gallery": true,
  "notice": [
    "Fine lines around the eyes and mouth that deepen when the skin is dry",
    "Creases on the forehead and between the brows that stay after the expression has gone",
    "Folds from the nose to the mouth, and lines from the mouth down to the chin",
    "Crepey texture on the cheeks, neck or chest",
    "A tired look that does not match how you feel"
  ],
  "cause": [
    "Collagen and elastin decline from the late twenties, and sun exposure speeds the loss. The skin holds less water, so fine lines show more easily, and repeated expressions gradually etch lines into the surface.",
    "Deeper folds usually have another cause: the fat pads and bone that support the face change with age, so the skin above them folds. That is why fillers or bio-stimulators, which restore support, can soften a fold that no surface treatment would reach."
  ],
  "assess": {
    "text": "Your free consultation includes a VISIA® skin analysis, which maps wrinkles, texture, UV damage and pores so we can see which lines are surface deep and which come from structure. Your provider then explains the options in order of priority, with prices, and you decide in your own time.",
    "points": [
      "Where the lines sit and whether they show at rest",
      "Skin quality: hydration, texture and sun damage",
      "Volume and support in the cheeks, temples and jawline",
      "Your downtime, budget and how gradual you want the change to be"
    ]
  },
  "options": [
    {
      "key": "laser-skin-resurfacing",
      "name": "Laser Skin Resurfacing",
      "role": "Primary",
      "fit": "Fine lines, texture and sun damage, from a light laser peel to deeper resurfacing",
      "line": "Precise laser energy that removes or heats damaged outer layers so new skin and collagen can form.",
      "price": "",
      "priceHref": "pricing.html#pg-laser-skin-resurfacing-h",
      "href": "#/laser-skin-resurfacing",
      "img": "/assets/live/thumbs/26.webp",
      "visit": "45 to 90 minutes",
      "course": "1 to 3 ablative or 3 to 6 non-ablative sessions",
      "down": "From little (non-ablative) to several days of redness and peeling (ablative)",
      "res": "Days to weeks, building as collagen renews"
    },
    {
      "key": "microneedling",
      "name": "Microneedling",
      "role": "Primary",
      "fit": "Gradual collagen support for fine lines and texture, with little downtime",
      "line": "Collagen induction with fine needles, with the option to add PRP, PDRN or exosomes.",
      "price": "",
      "priceHref": "pricing.html#pg-microneedling-h",
      "href": "#/microneedling",
      "img": "/assets/live/thumbs/11-1.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 6 sessions, 4 to 6 weeks apart",
      "down": "Redness for 24 to 48 hours",
      "res": "Often after the first session, best after a series"
    },
    {
      "key": "dermal-fillers",
      "name": "Dermal Fillers",
      "role": "Primary",
      "fit": "Deeper folds that stay at rest, such as smile lines",
      "line": "Hyaluronic acid gel placed beneath the skin to restore volume, soften folds and refine contours.",
      "price": "",
      "priceHref": "pricing.html#pg-dermal-fillers-h",
      "href": "#/dermal-fillers",
      "img": "/assets/live/thumbs/Dermal-Fillers-Treatment-Toronto.webp",
      "visit": "30 to 45 minutes",
      "course": "Usually one visit, with a review",
      "down": "Mild tenderness or swelling for a few days",
      "res": "Right away"
    },
    {
      "key": "micro-laser-peel",
      "name": "Micro Laser Peel",
      "role": "Supporting",
      "fit": "A lighter laser refresh for superficial lines and dullness",
      "line": "A laser that gently removes thin top layers of damaged skin, with a shorter recovery than deeper resurfacing.",
      "price": "",
      "priceHref": "pricing.html#pg-laser-skin-resurfacing-h",
      "href": "#/micro-laser-peel",
      "img": "/assets/live/thumbs/27.webp",
      "visit": "30 to 60 minutes",
      "course": "Planned at your consultation",
      "down": "Redness for a few days; most people are back to normal in 3 to 5 days",
      "res": "As new skin grows in, over the following weeks"
    },
    {
      "key": "mesotherapy-skin-boosters",
      "name": "Mesotherapy & Skin Boosters",
      "role": "Supporting",
      "fit": "Hydration and skin quality for crepey, dry skin",
      "line": "Tiny injections of hyaluronic acid, vitamins and minerals that hydrate and nourish the skin.",
      "price": "",
      "priceHref": "pricing.html#pg-skin-booster-and-bio-stimulators-h",
      "href": "#/mesotherapy-skin-boosters",
      "img": "/assets/live/thumbs/Soft-Lift.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 6 sessions, a few weeks apart",
      "down": "Mild redness or swelling for a day or two",
      "res": "Often after the first few sessions"
    },
    {
      "key": "exosome-skin-therapy",
      "name": "Exosome Skin Therapy",
      "role": "Supporting",
      "fit": "Cell renewal and collagen support, often paired with microneedling",
      "line": "Exosomes applied or injected, often with microneedling, to support cell renewal and collagen.",
      "price": "",
      "priceHref": "pricing.html#pg-microneedling-h",
      "href": "#/exosome-skin-therapy",
      "img": "/assets/live/thumbs/15.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 4 sessions, a few weeks apart",
      "down": "Redness for a day or two when combined with microneedling",
      "res": "Hydration and glow within the first week, improving over months"
    },
    {
      "key": "laser-skin-tightening",
      "name": "Laser Skin Tightening",
      "role": "Supporting",
      "fit": "Firmness and fine lines, with no downtime",
      "line": "Fotona 4D laser that warms several layers of the skin to tighten existing collagen and build new.",
      "price": "",
      "priceHref": "pricing.html#pg-2d-3d-laser-skin-tightening-h",
      "href": "#/laser-skin-tightening",
      "img": "/assets/live/thumbs/7.webp",
      "visit": "45 to 60 minutes",
      "course": "3 to 5 sessions, a few weeks apart",
      "down": "Mild redness for a few hours",
      "res": "A firmer feel after the first session, improving over weeks"
    },
    {
      "key": "chemical-peels",
      "name": "Chemical Peels",
      "role": "Supporting",
      "fit": "Regular surface renewal between other treatments",
      "line": "Mesopeel® professional peels, from light to deep, chosen for your skin and the downtime you can take.",
      "price": "",
      "priceHref": "pricing.html#pg-chemical-peel-h",
      "href": "#/chemical-peels",
      "img": "/assets/live/thumbs/19.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 6 treatments, a few weeks apart",
      "down": "Redness and light peeling for a few days",
      "res": "Within the first week"
    }
  ],
  "bio": [
    {
      "key": "aptos-thread-lift",
      "name": "Aptos Thread Lift",
      "role": "Bio-stimulator",
      "fit": "Folds that come with early sagging of the midface",
      "line": "A non-surgical lift with absorbable Aptos threads that is also a long-lasting bio-stimulator.",
      "price": "",
      "priceHref": "pricing.html#pg-aptos-thread-method-h",
      "href": "aptos-thread-lift.html",
      "img": "/assets/live/thumbs/1-1.webp",
      "visit": "45 to 60 minutes",
      "course": "Usually one session",
      "down": "Mild bruising or swelling; most people resume normal activities within days",
      "res": "Right away, improving over the following weeks"
    },
    {
      "key": "sculptra",
      "name": "Sculptra®",
      "role": "Bio-stimulator",
      "fit": "Lines and folds that come from gradual volume loss",
      "line": "A poly-L-lactic acid bio-stimulator: volume that builds gradually through your own collagen.",
      "price": "",
      "priceHref": "pricing.html#pg-skin-booster-and-bio-stimulators-h",
      "href": "#/sculptra",
      "img": "/assets/live/thumbs/9.webp",
      "visit": "30 to 45 minutes",
      "course": "2 to 3 sessions, a few weeks apart",
      "down": "Mild swelling or tenderness for a few days",
      "res": "After a few weeks, improving over several months"
    },
    {
      "key": "radiesse",
      "name": "Radiesse®",
      "role": "Bio-stimulator",
      "fit": "Moderate to deep folds and jawline support",
      "line": "A calcium hydroxylapatite bio-stimulator: structure right away, collagen support over the months after.",
      "price": "",
      "priceHref": "pricing.html#pg-skin-booster-and-bio-stimulators-h",
      "href": "#/radiesse",
      "img": "/assets/live/thumbs/8.webp",
      "visit": "30 to 45 minutes",
      "course": "Usually one visit per area",
      "down": "Mild swelling, redness or tenderness for a few days",
      "res": "Right away, improving over months"
    }
  ],
  "rx": {
    "text": "Prescription treatments for expression lines are available after an in-person medical assessment. Your provider discusses them privately at your consultation.",
    "links": [
      {
        "name": "Botox®",
        "href": "botox.html"
      },
      {
        "name": "Soft Lift™",
        "href": "#/soft-lift"
      }
    ]
  },
  "compare": [
    {
      "key": "laser-skin-resurfacing",
      "name": "Laser Skin Resurfacing",
      "role": "Primary",
      "fit": "Fine lines, texture and sun damage, from a light laser peel to deeper resurfacing",
      "line": "Precise laser energy that removes or heats damaged outer layers so new skin and collagen can form.",
      "price": "",
      "priceHref": "pricing.html#pg-laser-skin-resurfacing-h",
      "href": "#/laser-skin-resurfacing",
      "img": "/assets/live/thumbs/26.webp",
      "visit": "45 to 90 minutes",
      "course": "1 to 3 ablative or 3 to 6 non-ablative sessions",
      "down": "From little (non-ablative) to several days of redness and peeling (ablative)",
      "res": "Days to weeks, building as collagen renews"
    },
    {
      "key": "microneedling",
      "name": "Microneedling",
      "role": "Primary",
      "fit": "Gradual collagen support for fine lines and texture, with little downtime",
      "line": "Collagen induction with fine needles, with the option to add PRP, PDRN or exosomes.",
      "price": "",
      "priceHref": "pricing.html#pg-microneedling-h",
      "href": "#/microneedling",
      "img": "/assets/live/thumbs/11-1.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 6 sessions, 4 to 6 weeks apart",
      "down": "Redness for 24 to 48 hours",
      "res": "Often after the first session, best after a series"
    },
    {
      "key": "dermal-fillers",
      "name": "Dermal Fillers",
      "role": "Primary",
      "fit": "Deeper folds that stay at rest, such as smile lines",
      "line": "Hyaluronic acid gel placed beneath the skin to restore volume, soften folds and refine contours.",
      "price": "",
      "priceHref": "pricing.html#pg-dermal-fillers-h",
      "href": "#/dermal-fillers",
      "img": "/assets/live/thumbs/Dermal-Fillers-Treatment-Toronto.webp",
      "visit": "30 to 45 minutes",
      "course": "Usually one visit, with a review",
      "down": "Mild tenderness or swelling for a few days",
      "res": "Right away"
    },
    {
      "key": "micro-laser-peel",
      "name": "Micro Laser Peel",
      "role": "Supporting",
      "fit": "A lighter laser refresh for superficial lines and dullness",
      "line": "A laser that gently removes thin top layers of damaged skin, with a shorter recovery than deeper resurfacing.",
      "price": "",
      "priceHref": "pricing.html#pg-laser-skin-resurfacing-h",
      "href": "#/micro-laser-peel",
      "img": "/assets/live/thumbs/27.webp",
      "visit": "30 to 60 minutes",
      "course": "Planned at your consultation",
      "down": "Redness for a few days; most people are back to normal in 3 to 5 days",
      "res": "As new skin grows in, over the following weeks"
    },
    {
      "key": "mesotherapy-skin-boosters",
      "name": "Mesotherapy & Skin Boosters",
      "role": "Supporting",
      "fit": "Hydration and skin quality for crepey, dry skin",
      "line": "Tiny injections of hyaluronic acid, vitamins and minerals that hydrate and nourish the skin.",
      "price": "",
      "priceHref": "pricing.html#pg-skin-booster-and-bio-stimulators-h",
      "href": "#/mesotherapy-skin-boosters",
      "img": "/assets/live/thumbs/Soft-Lift.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 6 sessions, a few weeks apart",
      "down": "Mild redness or swelling for a day or two",
      "res": "Often after the first few sessions"
    },
    {
      "key": "exosome-skin-therapy",
      "name": "Exosome Skin Therapy",
      "role": "Supporting",
      "fit": "Cell renewal and collagen support, often paired with microneedling",
      "line": "Exosomes applied or injected, often with microneedling, to support cell renewal and collagen.",
      "price": "",
      "priceHref": "pricing.html#pg-microneedling-h",
      "href": "#/exosome-skin-therapy",
      "img": "/assets/live/thumbs/15.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 4 sessions, a few weeks apart",
      "down": "Redness for a day or two when combined with microneedling",
      "res": "Hydration and glow within the first week, improving over months"
    },
    {
      "key": "laser-skin-tightening",
      "name": "Laser Skin Tightening",
      "role": "Supporting",
      "fit": "Firmness and fine lines, with no downtime",
      "line": "Fotona 4D laser that warms several layers of the skin to tighten existing collagen and build new.",
      "price": "",
      "priceHref": "pricing.html#pg-2d-3d-laser-skin-tightening-h",
      "href": "#/laser-skin-tightening",
      "img": "/assets/live/thumbs/7.webp",
      "visit": "45 to 60 minutes",
      "course": "3 to 5 sessions, a few weeks apart",
      "down": "Mild redness for a few hours",
      "res": "A firmer feel after the first session, improving over weeks"
    },
    {
      "key": "chemical-peels",
      "name": "Chemical Peels",
      "role": "Supporting",
      "fit": "Regular surface renewal between other treatments",
      "line": "Mesopeel® professional peels, from light to deep, chosen for your skin and the downtime you can take.",
      "price": "",
      "priceHref": "pricing.html#pg-chemical-peel-h",
      "href": "#/chemical-peels",
      "img": "/assets/live/thumbs/19.webp",
      "visit": "30 to 45 minutes",
      "course": "3 to 6 treatments, a few weeks apart",
      "down": "Redness and light peeling for a few days",
      "res": "Within the first week"
    },
    {
      "key": "aptos-thread-lift",
      "name": "Aptos Thread Lift",
      "role": "Bio-stimulator",
      "fit": "Folds that come with early sagging of the midface",
      "line": "A non-surgical lift with absorbable Aptos threads that is also a long-lasting bio-stimulator.",
      "price": "",
      "priceHref": "pricing.html#pg-aptos-thread-method-h",
      "href": "aptos-thread-lift.html",
      "img": "/assets/live/thumbs/1-1.webp",
      "visit": "45 to 60 minutes",
      "course": "Usually one session",
      "down": "Mild bruising or swelling; most people resume normal activities within days",
      "res": "Right away, improving over the following weeks"
    },
    {
      "key": "sculptra",
      "name": "Sculptra®",
      "role": "Bio-stimulator",
      "fit": "Lines and folds that come from gradual volume loss",
      "line": "A poly-L-lactic acid bio-stimulator: volume that builds gradually through your own collagen.",
      "price": "",
      "priceHref": "pricing.html#pg-skin-booster-and-bio-stimulators-h",
      "href": "#/sculptra",
      "img": "/assets/live/thumbs/9.webp",
      "visit": "30 to 45 minutes",
      "course": "2 to 3 sessions, a few weeks apart",
      "down": "Mild swelling or tenderness for a few days",
      "res": "After a few weeks, improving over several months"
    },
    {
      "key": "radiesse",
      "name": "Radiesse®",
      "role": "Bio-stimulator",
      "fit": "Moderate to deep folds and jawline support",
      "line": "A calcium hydroxylapatite bio-stimulator: structure right away, collagen support over the months after.",
      "price": "",
      "priceHref": "pricing.html#pg-skin-booster-and-bio-stimulators-h",
      "href": "#/radiesse",
      "img": "/assets/live/thumbs/8.webp",
      "visit": "30 to 45 minutes",
      "course": "Usually one visit per area",
      "down": "Mild swelling, redness or tenderness for a few days",
      "res": "Right away, improving over months"
    }
  ],
  "expect": {
    "tag": "What to expect",
    "lead": "Your plan,",
    "strong": "step by step",
    "text": "How a typical plan unfolds. Yours is built at your free consultation.",
    "items": [
      [
        "Visit 1",
        "Consultation and skin analysis",
        "VISIA® imaging and a conversation about what bothers you most. You leave with a plan, in order of priority, with prices."
      ],
      [
        "Weeks 1 to 6",
        "Structure first, surface second",
        "Where a fold needs support, fillers or a bio-stimulator usually come first. Surface treatments such as laser, microneedling or peels follow once the area has settled."
      ],
      [
        "Months 2 to 6",
        "Collagen builds",
        "Laser and microneedling results develop over months as new collagen forms. Fillers show right away and settle over about two weeks."
      ],
      [
        "Ongoing",
        "Maintenance",
        "Daily sun protection, medical-grade skincare and occasional maintenance sessions help the result last. Individual results may vary."
      ]
    ]
  },
  "results": {
    "lead": "Before",
    "strong": "and after photos",
    "text": "Cases from our before and after gallery for this concern, photographed at NewDermaMed.",
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
  "home": [
    {
      "title": "Anti-ageing",
      "category": "Anti-ageing & anti-wrinkle",
      "text": "Retinol, peptides and antioxidants support collagen between visits.",
      "product": {
        "name": "Activ Retinol 0.5",
        "size": "30 ml",
        "img": "RET0.5030-Activ-Retinol-0.5-30-ml-1.0-fl.-oz.png",
        "href": "https://shop.newdermamedlaserclinic.com/product/activ-retinol-0-5/"
      }
    },
    {
      "title": "Hydration",
      "category": "Moisturising",
      "text": "Hyaluronic acid and ceramides make fine lines less visible by keeping the skin plump.",
      "product": {
        "name": "age element anti-wrinkle cream",
        "size": "50 ml",
        "img": "T-DAWS0003-age-element-anti-wrinkle-cream-50-ml-1.69-fl.-oz.png",
        "href": "https://shop.newdermamedlaserclinic.com/product/age-element-anti-wrinkle-cream/"
      }
    },
    {
      "title": "Sun protection",
      "category": "Daily protection",
      "text": "Daily SPF is the single most useful habit for preventing new lines. Ask us for a recommendation at your visit."
    }
  ],
  "articles": [
    {
      "title": "Chemical Peel Treatment Toronto",
      "href": "https://newdermamedlaserclinic.com/chemical-peel-treatment-toronto/",
      "date": "November 7, 2025",
      "topic": "Skin",
      "img": "/assets/live/main/uploads/2025/11/10-Chemical-Peel-Treatment-Toronto-m.webp",
      "excerpt": "In the lively city of Toronto, where beauty and medical precision meet, a lot of people are getting advanced skincare treatments that give them amazing results with very little downtime. Chemical …"
    },
    {
      "title": "Juvederm at NewDermaMed Toronto",
      "href": "https://newdermamedlaserclinic.com/juvederm-at-newdermamed-toronto/",
      "date": "November 11, 2025",
      "topic": "Injectables",
      "img": "/assets/live/main/uploads/2025/11/8-Juvederm-at-NewDermaMed-Toronto-m.webp",
      "excerpt": "Surgery is no longer the only way to make your face look younger. Juvederm and other treatments can help you look younger by enhancing your features, smoothing out fine lines, and adding volume to …"
    },
    {
      "title": "How to Prepare for Dermal Fillers",
      "href": "https://newdermamedlaserclinic.com/how-to-prepare-for-dermal-fillers/",
      "date": "October 21, 2020",
      "topic": "Injectables",
      "img": "/assets/live/main/uploads/2025/11/21-How-to-Prepare-for-Dermal-Fillers-m.webp",
      "excerpt": "Dermal fillers are a great choice for anyone who is looking to feel as good about their outside appearance as they do about their inside. For those who feel that laugh lines and bags under their eyes …"
    }
  ],
  "related": [
    {
      "name": "Aptos Thread Lift",
      "menu": "Aptos Thread Lift",
      "img": "/assets/live/thumbs/1-1.webp",
      "kind": "Lifting"
    },
    {
      "name": "Dermal Fillers",
      "menu": "Dermal Fillers",
      "img": "/assets/live/thumbs/Dermal-Fillers-Treatment-Toronto.webp",
      "kind": "Injectable"
    },
    {
      "name": "Skin Boosters",
      "menu": "Skin Boosters",
      "img": "/assets/live/thumbs/Soft-Lift.webp",
      "kind": "Injectable"
    },
    {
      "name": "Sculptra®",
      "menu": "Sculptra®",
      "img": "/assets/live/thumbs/9.webp",
      "kind": "Bio-stimulator"
    },
    {
      "name": "Microneedling",
      "menu": "Microneedling",
      "img": "/assets/live/thumbs/11-1.webp",
      "kind": "Skin"
    },
    {
      "name": "Laser Skin Resurfacing",
      "menu": "Laser Skin Resurfacing",
      "img": "/assets/live/thumbs/26.webp",
      "kind": "Laser"
    }
  ],
  "why": {
    "alt": "The NewDermaMed team celebrating their Top Choice Award at the clinic",
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
  "faqs": [
    [
      "Which treatment works best for wrinkles?",
      "It depends on whether the lines are on the surface, come from movement, or come from volume loss. A surface line often responds to laser resurfacing, microneedling or peels; a fold at rest may need a filler or a bio-stimulator. Your skin analysis helps us match the right option to each line."
    ],
    [
      "Can I treat wrinkles without injections?",
      "Yes. Laser skin resurfacing, Fotona laser tightening, microneedling, exosome therapy and professional peels all work on the skin itself. They suit fine lines and texture best; deep folds usually need support beneath the skin as well."
    ],
    [
      "How soon will I see a change?",
      "Fillers show right away and settle over about two weeks. Laser, microneedling and bio-stimulators build gradually over two to six months as collagen forms. Individual results may vary."
    ],
    [
      "Will I look overdone?",
      "Our approach is restraint. We treat the cause of each line rather than filling everything, and larger plans are spread over more than one visit so you can see the result settle first."
    ],
    [
      "What about prescription treatments for expression lines?",
      "They are available after an in-person medical assessment with our medical team, who discuss them with you privately. Health Canada limits what we can say about them online."
    ],
    [
      "How much does it cost?",
      "Starting prices are listed with each option above and on our pricing page. Your exact plan and price are confirmed at your free consultation."
    ]
  ]
};
