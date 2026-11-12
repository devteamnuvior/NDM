/**
 * Patient reviews, from the testimonials block on newdermamedlaserclinic.com. Reviewer names are shortened
 * for privacy. Shown with: "individual results may vary".
 */

export interface Review {
  name: string;
  /** Treatment the review is about. */
  tag: string;
  /** Reviewer photo, on the clinic's own site. */
  photo: string;
  quote: string;
}

const UPLOADS = "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/";

export const REVIEWS: Review[] = [
  {
    "name": "Anna H.",
    "tag": "Laser Skin",
    "photo": `${UPLOADS}1-5.png`,
    "quote": "I’ve been going to NewDermaMed since 2016 for laser treatments. While my early experiences were mixed, I’m now a happy returning customer thanks to Nadia. Her passion, attention to detail, and great advice make every visit enjoyable. I only trust her with my treatments now, thank you, Nadia, for your continued excellence!"
  },
  {
    "name": "Celina B.",
    "tag": "Laser Skin",
    "photo": `${UPLOADS}2-5.png`,
    "quote": "This clinic is amazing! I did a series of laser skin resurfacing treatments and had a wonderful experience. The staff are friendly, professional, and made me feel completely at ease. I loved the Saturday appointments, and after three treatments my skin is glowing, people have even noticed! I’ll definitely be back for more. Highly recommend!"
  },
  {
    "name": "Luiza C.",
    "tag": "Mole Removal",
    "photo": `${UPLOADS}3-4.png`,
    "quote": "Dr. Mastouri’s treatment at NewDermaMed was truly exceptional! Her expertise and reassuring demeanor made my mole removal surgery a breeze. I felt in safe hands throughout the entire process, and the results are fantastic. No pain, soreness, or itchiness at all. The clinic is also super clean and it has a nice relaxing atmosphere."
  },
  {
    "name": "A. M.",
    "tag": "Laser Hair Removal",
    "photo": `${UPLOADS}5-2.png`,
    "quote": "I am still in the process of completing my laser hair removal treatment, but have so far had a wonderful experience here. I think it’s rare to give a five-star review to a place that literally burns the hair out of your skin every time you go in. However, I’ve really enjoyed my appointments at NewDermaMed and think they deserve it."
  },
  {
    "name": "Preeti S.",
    "tag": "Microneedling",
    "photo": `${UPLOADS}6-1.png`,
    "quote": "I am a regular customer of NewDermaMed for almost 1 year now. I mostly visit the Uptown clinic, though downtown clinic is equally good. During the free consultation they listen to your concerns and suggest the treatments accordingly. The technicians are well trained and polite."
  },
  {
    "name": "Ahmad N.",
    "tag": "Multiple Sessions",
    "photo": `${UPLOADS}8.png`,
    "quote": "This clinic stands out as an exceptional establishment, offering professional services with state-of-the-art equipment tailored for cosmetic and skincare treatments. My personal experience, having undergone multiple skincare sessions here, has been thoroughly satisfying with remarkable results."
  },
  {
    "name": "Valeriia C.",
    "tag": "Microneedling",
    "photo": `${UPLOADS}9.png`,
    "quote": "Absolutely amazing experience at Newdermamed! The staff was very professional and kind! The receptionist Sarah was very friendly and walked me though the e-forms. Alicia did my treatment with great professionalism!! She was very nice and informative, and made me feel comfortable. My face has never looked better!"
  }
];

export const GOOGLE_RATING = 4.5;

export type AwardLook = "ink" | "blue" | "amber";

/** Awards and recognition cards, shown between the reviews: three looks so they stand out. */
export interface AwardCardContent {
  look: AwardLook;
  label: string;
  big: string;
  text: string;
  /** Show the row of yearly Top Choice badges. */
  years?: boolean;
  /** Show one large badge for this year in the corner. */
  badge?: number;
  /** Show the 16 years mark and the clinics line. */
  mark?: boolean;
}

export const AWARD_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const AWARD_CARDS: AwardCardContent[] = [
  { look: "ink", label: "Awards & recognition", big: "8 consecutive years", text: "Recognized as Toronto’s Top Choice Cosmetic & Laser Clinic, 2019 to 2026.", years: true },
  { look: "blue", label: "Top Choice Award", big: "2026", text: "Toronto’s Top Choice Cosmetic & Laser Clinic, for the eighth year in a row.", badge: 2026 },
  { look: "amber", label: "Patient care", mark: true, big: "16+ years", text: "Of dedication to patient care, innovation and consistent, high-quality treatment." },
];

/** How many copies of the cards the looping row holds, so the loop never shows a gap. */
export const REVIEW_COPIES = 3;
