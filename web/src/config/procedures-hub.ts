/**
 * The treatments hub at /procedures (user, 2026-11-18): the words, the taxonomy and the guidance of the page.
 *
 * Which treatments exist, their names and their addresses always come from WordPress (`getProcedureList`);
 * this file only adds what a hub card needs: the group it sits in, a one-line description, the areas and
 * concerns used by the finder, and the photo when the site has a chosen one. A procedure WordPress holds
 * that is not listed here still shows, under "More treatments"; one listed here that WordPress no longer
 * holds is left out. Parent pages with no content of their own are skipped (`HUB_SKIP`).
 *
 * Wording rules (Health Canada, the clinic's compliance notes): qualified language ("may", "can"), no
 * guaranteed results, and no consumer benefit next to the name of a prescription drug (Botox®, Dysport®,
 * Belkyra® / Kybella®): those cards describe what the treatment is and send people to a consultation.
 * Every claim here was written for clinical review before launch (see the hub report).
 */

export type HubArea = "face" | "skin" | "body" | "hair" | "veins";

export const HUB_AREAS: [id: HubArea, label: string][] = [
  ["face", "Face"],
  ["skin", "Skin"],
  ["body", "Body"],
  ["hair", "Hair"],
  ["veins", "Legs & veins"],
];

export interface HubTreatment {
  /** The WordPress slug of the procedure ("aptos-thread-lift" is the Aptos page, not a procedure post). */
  slug: string;
  /** One line, under 120 characters, in the clinic's measured voice. */
  text: string;
  areas: HubArea[];
  /** Concerns it is often considered for: shown as small tags and matched by the search box. */
  concerns: string[];
  /** A photo chosen for this treatment (the home page's "Browse the menu" set); else the page's own header photo. */
  img?: string;
}

export interface HubGroup {
  id: string;
  title: string;
  /** One sentence under the group title. */
  intro: string;
  items: HubTreatment[];
}

const M = "/assets/home/menu/";

export const HUB_GROUPS: HubGroup[] = [
  {
    id: "injectables",
    title: "Injectables & fillers",
    intro: "Prescription treatments and hyaluronic acid fillers, planned around your features after an in-person assessment.",
    items: [
      { slug: "botox", text: "Botox® Cosmetic, a prescription treatment. Your provider explains whether it suits you at a consultation.", areas: ["face"], concerns: ["Consultation required"] },
      { slug: "dermal-fillers", text: "Hyaluronic acid fillers that can restore lost volume and soften folds, placed conservatively.", areas: ["face"], concerns: ["Volume loss", "Folds"], img: `${M}dermal-fillers.jpg` },
      { slug: "juvederm", text: "The Juvéderm® family of hyaluronic acid fillers, chosen by area and the result you have in mind.", areas: ["face"], concerns: ["Volume loss", "Lips"] },
      { slug: "lip-augmentation", text: "Lip filler for shape, balance and hydration, planned to keep a natural proportion.", areas: ["face"], concerns: ["Thin lips"], img: `${M}lip-fillers.jpg` },
      { slug: "tear-trough-correction", text: "Careful filler placement that may soften under-eye hollows and the shadow they cast.", areas: ["face"], concerns: ["Under-eye hollows"], img: `${M}under-eye-filler.jpg` },
      { slug: "soft-lift", text: "A combined injectable plan for the mid and lower face, mapped at your consultation.", areas: ["face"], concerns: ["Volume loss", "Sagging"] },
      { slug: "belkyra-kybella", text: "Belkyra® / Kybella®, a prescription injectable for the area under the chin. Suitability is assessed in person.", areas: ["face"], concerns: ["Consultation required"] },
      { slug: "mesotherapy-skin-boosters", text: "Fine injections of hyaluronic acid and nutrients that may improve hydration and skin quality.", areas: ["face", "skin"], concerns: ["Dull skin", "Fine lines"], img: `${M}skin-boosters.jpg` },
    ],
  },
  {
    id: "collagen",
    title: "Collagen stimulators & thread lift",
    intro: "Options that work with your own collagen over weeks to months, for gradual and natural-looking support.",
    items: [
      { slug: "sculptra", text: "A poly-L-lactic acid biostimulator that supports collagen, usually planned over a few visits.", areas: ["face", "body"], concerns: ["Volume loss", "Skin laxity"], img: `${M}sculptra.jpg` },
      { slug: "radiesse", text: "A calcium hydroxylapatite biostimulator that adds structure and supports collagen in the face and hands.", areas: ["face"], concerns: ["Volume loss", "Jawline"], img: `${M}radiesse.jpg` },
      { slug: "aptos-thread-lift", text: "Absorbable APTOS threads that lift and support the skin without surgery, in one session for most plans.", areas: ["face"], concerns: ["Sagging", "Jowls"] },
      { slug: "exosome-skin-therapy", text: "Exosome serums applied after microneedling or resurfacing to support the skin's recovery.", areas: ["skin"], concerns: ["Texture", "Fine lines"] },
    ],
  },
  {
    id: "laser",
    title: "Laser & light",
    intro: "Medical lasers and intense pulsed light, set for your skin type and the concern being treated.",
    items: [
      { slug: "laser-skin-resurfacing", text: "Laser resurfacing that can refine texture, tone and fine lines, from light to deeper settings.", areas: ["face", "skin"], concerns: ["Texture", "Fine lines", "Scars"], img: `${M}laser-skin-resurfacing.jpg` },
      { slug: "micro-laser-peel", text: "A light laser peel for brightness and smoother texture, with a short recovery for most skin.", areas: ["face", "skin"], concerns: ["Texture", "Dull skin"] },
      { slug: "photo-rejuvenation", text: "Intense pulsed light that may reduce the look of sun spots, redness and uneven tone.", areas: ["face", "skin"], concerns: ["Sun spots", "Redness"], img: `${M}photo-rejuvenation.jpg` },
      { slug: "skin-tightening", text: "Non-invasive energy treatments that gently heat deeper layers to improve the look of mild laxity.", areas: ["face", "body"], concerns: ["Skin laxity", "Sagging"], img: `${M}laser-skin-tightening.jpg` },
      { slug: "laser-hair-removal", text: "Medical-grade laser hair reduction for the face and body, planned for your skin and hair type.", areas: ["face", "body"], concerns: ["Unwanted hair"], img: `${M}laser-hair-removal.jpg` },
    ],
  },
  {
    id: "skin",
    title: "Skin treatments & facials",
    intro: "Clinical skin care, from collagen induction and peels to medical facials, chosen after a skin analysis.",
    items: [
      { slug: "visia-skin-analysis", text: "Imaging that maps spots, wrinkles, texture, pores and redness. Included with every consultation.", areas: ["skin"], concerns: ["Skin analysis"], img: `${M}visia-skin-analysis.jpg` },
      { slug: "microneedling", text: "Collagen induction with Dermapen 4, with PRP or exosomes as options for your skin's needs.", areas: ["face", "skin"], concerns: ["Acne scars", "Texture", "Fine lines"], img: `${M}microneedling.jpg` },
      { slug: "chemical-peels", text: "Professional peels, light to deeper, chosen for your skin type, tone and the concern being treated.", areas: ["face", "skin"], concerns: ["Texture", "Pigmentation", "Acne"], img: `${M}chemical-peels.jpg` },
      { slug: "dermamelan", text: "A professional depigmenting protocol by Mesoestetic for stubborn pigmentation and uneven tone.", areas: ["face", "skin"], concerns: ["Melasma", "Pigmentation"], img: `${M}cosmelan-dermamelan.jpg` },
      { slug: "acnelan", text: "A clinical program by Mesoestetic for oily, acne-prone skin, combining an in-clinic step and home care.", areas: ["face", "skin"], concerns: ["Acne"] },
      { slug: "age-element-facial", text: "A clinical facial by Mesoestetic for skin showing early signs of aging, tailored at each visit.", areas: ["face", "skin"], concerns: ["Fine lines", "Dull skin"], img: `${M}medical-facials.jpg` },
      { slug: "microdermabrasion", text: "Gentle mechanical exfoliation for a smoother surface and a fresher look, with no recovery for most.", areas: ["face", "skin"], concerns: ["Texture", "Dull skin"] },
    ],
  },
  {
    id: "conditions",
    title: "Acne, scars & pigmentation",
    intro: "Treatment plans for specific skin conditions, often combining several of the treatments above.",
    items: [
      { slug: "acne-treatments", text: "Plans for active breakouts that may combine peels, laser and medical skin care.", areas: ["face", "skin"], concerns: ["Acne"], img: `${M}laser-acne-treatment.jpg` },
      { slug: "acne-scar", text: "Resurfacing and collagen-building plans for rolling, boxcar and icepick acne scars.", areas: ["face", "skin"], concerns: ["Acne scars"] },
      { slug: "scar-removal", text: "Options that can soften the look of acne, surgical and other scars over a series of sessions.", areas: ["skin", "body"], concerns: ["Scars"] },
      { slug: "hyperpigmentation", text: "Plans for sun spots, post-acne marks and uneven tone, set for your skin type.", areas: ["skin"], concerns: ["Pigmentation", "Sun spots"] },
      { slug: "melasma", text: "A careful, long-term approach to melasma, combining in-clinic treatment and home care.", areas: ["face", "skin"], concerns: ["Melasma"] },
      { slug: "rosacea", text: "Plans that may calm visible redness and flushing, starting with what triggers your flare-ups.", areas: ["face", "skin"], concerns: ["Redness", "Rosacea"] },
      { slug: "dark-circles", text: "An assessment of what causes your dark circles, then the options that fit: filler, skin or light.", areas: ["face"], concerns: ["Under-eye hollows"] },
      { slug: "wrinkle-treatments", text: "A plan for lines and wrinkles that may combine resurfacing, fillers and collagen support.", areas: ["face", "skin"], concerns: ["Fine lines", "Wrinkles"] },
      { slug: "mole-removal", text: "Removal of benign moles and skin lesions after a medical evaluation of each one.", areas: ["skin", "body"], concerns: ["Moles"] },
    ],
  },
  {
    id: "body",
    title: "Body contouring",
    intro: "Non-surgical options for stubborn fat, skin laxity and contour, after an assessment of the area.",
    items: [
      { slug: "coolsculpting", text: "Controlled cooling that can reduce stubborn fat in treated areas, without surgery.", areas: ["body"], concerns: ["Stubborn fat"], img: `${M}coolsculpting.jpg` },
      { slug: "tightsculpting", text: "Fotona laser body contouring that may reduce fat and tighten skin in the same treatment.", areas: ["body"], concerns: ["Stubborn fat", "Skin laxity"], img: `${M}tightsculpting.jpg` },
      { slug: "non-surgical-bbl", text: "Injectable collagen stimulators planned to improve the shape and contour of the buttocks and hips.", areas: ["body"], concerns: ["Contour"], img: `${M}non-surgical-bbl.jpg` },
      { slug: "stretch-marks", text: "Collagen-building treatments that may soften the look of stretch marks over a series of sessions.", areas: ["body", "skin"], concerns: ["Stretch marks"] },
      { slug: "hyperhidrosis", text: "Medical treatment options for excessive underarm, hand or foot sweating, assessed in person.", areas: ["body"], concerns: ["Excessive sweating"] },
    ],
  },
  {
    id: "hair",
    title: "Hair restoration",
    intro: "Non-surgical options for thinning hair, after a look at the pattern and the likely cause.",
    items: [
      { slug: "hair-loss-treatments", text: "Plans for thinning hair that may include platelet-rich plasma (PRP) from your own blood.", areas: ["hair"], concerns: ["Thinning hair"], img: `${M}prp-hair-restoration.jpg` },
      { slug: "exosome-therapy-for-hair", text: "Exosome treatment for the scalp, offered as part of a plan for thinning hair.", areas: ["hair"], concerns: ["Thinning hair"] },
      { slug: "laser-hair-rejuvenation", text: "A gentle Fotona laser treatment for the scalp that may support thinning hair, with no needles.", areas: ["hair"], concerns: ["Thinning hair"], img: `${M}laser-hair-rejuvenation.jpg` },
    ],
  },
  {
    id: "veins",
    title: "Vein treatments",
    intro: "From small spider veins to larger varicose veins, chosen after a vascular assessment and, where needed, an ultrasound.",
    items: [
      { slug: "spider-vein-removal", text: "Laser and injection options for small visible veins on the face and legs.", areas: ["veins", "face"], concerns: ["Spider veins"], img: `${M}laser-vein-removal.jpg` },
      { slug: "sclerotherapy", text: "Injections that close small spider and reticular veins on the legs, after a vascular assessment.", areas: ["veins"], concerns: ["Spider veins"], img: `${M}sclerotherapy.jpg` },
      { slug: "varicose-vein-treatment", text: "An overview of the options for varicose veins, and how the right one is chosen for you.", areas: ["veins"], concerns: ["Varicose veins"] },
      { slug: "venaseal", text: "A minimally invasive treatment that closes larger varicose veins with a medical adhesive.", areas: ["veins"], concerns: ["Varicose veins"], img: `${M}venaseal.jpg` },
      { slug: "endovenous-laser-evlt", text: "Endovenous laser treatment that closes a diseased vein from the inside, under local anaesthetic.", areas: ["veins"], concerns: ["Varicose veins"] },
      { slug: "radiofrequency-ablation-rfa", text: "Radiofrequency energy that closes a diseased vein from the inside, decided after an ultrasound.", areas: ["veins"], concerns: ["Varicose veins"] },
    ],
  },
  {
    id: "wellness",
    title: "Laser wellness treatments",
    intro: "Non-cosmetic laser treatments offered at the clinic, each after a medical assessment.",
    items: [
      { slug: "snoring-treatment", text: "NightLase®, a non-invasive laser treatment that may reduce snoring for some people.", areas: ["face"], concerns: ["Snoring"] },
      { slug: "vaginal-tightening", text: "A non-surgical laser treatment for vaginal laxity and mild stress urinary incontinence.", areas: ["body"], concerns: ["Intimate health"] },
      { slug: "nail-fungus-treatment", text: "A laser treatment for nail fungus, usually planned as a short series of sessions.", areas: ["body"], concerns: ["Nail fungus"] },
    ],
  },
];

/** Parent pages that hold no content of their own (their children are listed). */
export const HUB_SKIP = new Set(["aesthetic", "double-chin", "cellulite-fat-reduction"]);

/** The concern pages, by where they show, in the order people tend to look for them. Slugs of WordPress concerns. */
export const HUB_CONCERN_GROUPS: [title: string, slugs: string[]][] = [
  ["Face", ["wrinkles-fine-lines", "volume-loss", "sagging-skin-jowls", "under-eye-hollows-dark-circles", "thin-lips", "double-chin"]],
  ["Skin", ["acne-breakouts", "acne-scars", "hyperpigmentation-sun-spots", "melasma-concern", "rosacea-redness", "uneven-texture-pores", "moles-skin-lesions"]],
  ["Body", ["stubborn-fat", "cellulite", "loose-skin", "stretch-marks-concern", "excessive-sweating", "spider-varicose-veins"]],
  ["Hair", ["unwanted-hair", "thinning-hair", "hair-loss"]],
];

/** One comparison: the treatments side by side (WordPress slugs), then the rows. General guidance for clinical review. */
export interface HubCompare {
  id: string;
  title: string;
  /** What the comparison helps with, one sentence. */
  question: string;
  cols: string[];
  rows: [label: string, values: string[]][];
}

export const HUB_COMPARE: HubCompare[] = [
  {
    id: "texture",
    title: "Texture, lines & scars",
    question: "Three common ways to improve skin texture, fine lines and acne scarring.",
    cols: ["microneedling", "laser-skin-resurfacing", "chemical-peels"],
    rows: [
      ["How it works", ["Fine needles create controlled micro-channels that prompt your skin to build collagen.", "Laser energy removes or heats thin layers of skin, prompting renewal and new collagen.", "A professional acid solution exfoliates the skin at a chosen depth."]],
      ["Often chosen for", ["Acne scars, enlarged pores, fine lines and overall texture.", "Fine lines, uneven texture, sun damage and scarring.", "Dullness, uneven tone, mild pigmentation and acne-prone skin."]],
      ["Sessions", ["Usually a series, a few weeks apart.", "One to several, depending on the depth chosen.", "Usually a series; deeper peels are done less often."]],
      ["Recovery", ["Redness for a short time is common.", "From little to several days, depending on the setting.", "From mild flaking to a week of peeling, by depth."]],
      ["Good to know", ["Can be combined with PRP or exosomes.", "Settings depend on your skin type and tone.", "Sun protection before and after matters."]],
    ],
  },
  {
    id: "volume",
    title: "Volume & lift",
    question: "How fillers, collagen stimulators and threads differ when the goal is volume or lift.",
    cols: ["dermal-fillers", "sculptra", "aptos-thread-lift"],
    rows: [
      ["How it works", ["Hyaluronic acid gel adds volume where it is placed.", "A biostimulator prompts your own collagen over the following months.", "Absorbable threads placed under the skin lift and support it."]],
      ["Often chosen for", ["Lost volume, folds, lips and under-eye hollows.", "Gradual, overall volume and skin quality.", "Mild to moderate sagging of the mid face, jowls and neck."]],
      ["When results show", ["Right after treatment, settling over about two weeks.", "Gradually, over several weeks to months.", "A lift right away that continues as collagen builds."]],
      ["Sessions", ["Often one, with touch-ups over time.", "Usually a few sessions, weeks apart.", "One session for most plans."]],
      ["Good to know", ["Hyaluronic acid fillers can be dissolved if needed.", "Results build slowly by design.", "Often combined with fillers or biostimulators."]],
    ],
  },
  {
    id: "body",
    title: "Body contouring",
    question: "Two non-surgical approaches to stubborn fat, compared.",
    cols: ["coolsculpting", "tightsculpting"],
    rows: [
      ["How it works", ["Controlled cooling of fat cells in the treated area.", "Laser energy that heats fat and tightens the skin above it."]],
      ["Often chosen for", ["Pinchable fat on the abdomen, flanks, thighs or under the chin.", "Fat reduction together with mild skin laxity."]],
      ["Sessions", ["One or more per area, depending on the plan.", "Usually a short series."]],
      ["Good to know", ["Not a weight-loss treatment; best near a stable weight.", "Not a weight-loss treatment; results build over weeks."]],
    ],
  },
];

/** The technology the clinic's own pages name, and the treatments that use it (WordPress slugs). */
export const HUB_TECH: { name: string; what: string; slugs: string[] }[] = [
  { name: "VISIA® skin analysis", what: "Imaging that measures spots, wrinkles, texture, pores and redness, so a plan starts from what your skin shows.", slugs: ["visia-skin-analysis"] },
  { name: "Fotona lasers", what: "Laser platforms used for body contouring, scalp treatments and NightLase® snoring treatment at the clinic.", slugs: ["tightsculpting", "laser-hair-rejuvenation", "snoring-treatment"] },
  { name: "Cutera Limelight IPL", what: "Intense pulsed light for the look of sun damage, redness and uneven tone.", slugs: ["photo-rejuvenation"] },
  { name: "CoolSculpting®", what: "Controlled cooling for non-surgical fat reduction in treated areas.", slugs: ["coolsculpting"] },
  { name: "Dermapen 4", what: "A microneedling pen for collagen induction, with PRP or exosomes as options.", slugs: ["microneedling"] },
  { name: "APTOS threads", what: "Absorbable lifting threads for a non-surgical lift of the face and neck.", slugs: ["aptos-thread-lift"] },
  { name: "Mesoestetic", what: "Professional protocols for pigmentation, acne and aging skin, including Dermamelan® and Acnelan®.", slugs: ["dermamelan", "acnelan", "age-element-facial", "chemical-peels"] },
];

export const HUB_STEPS: [title: string, text: string][] = [
  ["Free consultation", "You meet a member of our medical team at the Uptown or Downtown clinic. There is no charge and no obligation."],
  ["Assessment & skin analysis", "We look at your skin, features and health history, and include a VISIA® skin analysis where it helps."],
  ["Your options, explained", "You hear which treatments may suit you, what each involves, the likely number of sessions, risks and costs."],
  ["Preparation & consent", "If you go ahead, you get clear preparation steps and sign an informed consent before treatment."],
  ["Treatment & aftercare", "Your treatment is carried out by a trained provider, with written aftercare and a way to reach us."],
  ["Follow-up", "Where it is useful, we review your progress and adjust the plan. Individual results may vary."],
];

export const HUB_FAQS: [question: string, answer: string][] = [
  [
    "Which cosmetic treatments does NewDermaMed offer?",
    "Around 50 treatments at our two Toronto clinics: injectables and fillers, collagen stimulators and the APTOS thread lift, laser and light treatments, skin treatments and medical facials, body contouring, hair restoration and vein treatments. Each one has its own page with what it involves.",
  ],
  [
    "How do I know which treatment is right for me?",
    "Start with a free consultation. A member of our medical team assesses your skin and goals, often with a VISIA® skin analysis, and explains which options may suit you, what to expect, and the risks and costs. Suitability is always decided in person.",
  ],
  [
    "Do I need a consultation before treatment?",
    "Yes. Every treatment begins with a consultation, which is free. It is where your provider checks that a treatment is safe and suitable for you and answers your questions before you decide.",
  ],
  [
    "Which treatments have little or no downtime?",
    "Many skin treatments, such as microdermabrasion, light peels and most injectable appointments, let people return to their day soon after, though redness, swelling or bruising can occur. Deeper laser resurfacing and peels need more recovery. Your provider gives you a realistic timeline for your plan.",
  ],
  [
    "Are laser treatments suitable for all skin types?",
    "Many are, with the right device and settings, but some lasers carry a higher risk of pigment changes on darker skin tones. Your skin type and history are assessed at your consultation, and settings are chosen for you, or a different option is suggested.",
  ],
  [
    "What affects the cost of a treatment?",
    "The treatment, the area, the amount of product and the number of sessions. Current prices and packages are on our pricing page, and your provider confirms the cost of your plan at the consultation before anything is booked.",
  ],
  [
    "Are your treatments non-surgical?",
    "Yes. Every treatment at NewDermaMed is non-surgical or minimally invasive, from injectables and lasers to the APTOS thread lift and vein treatments.",
  ],
  [
    "Where are your clinics?",
    "Uptown at 4763 Yonge Street, North York, near Sheppard-Yonge Station, and Downtown at 790 Bay Street, Suite 900, near College Station. Both are open Monday to Friday, 10am to 7pm, and Saturday, 10am to 5pm.",
  ],
  [
    "How do I book a consultation?",
    "Book online from any page with the Book Free Consultation button, or call Uptown at 416-224-8800 or Downtown at 416-671-9766.",
  ],
];
