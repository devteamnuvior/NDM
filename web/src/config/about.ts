/** About page content. Source: the original prototype (src/about-ui.jsx, src/build_about.py). */

import type { AboutCopy } from "@/types/about";

const UPLOADS = "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/";

export const ABOUT_EMAIL = "info@newdermamed.com";

export interface AboutClinic {
  id: "uptown" | "downtown";
  name: string;
  area: string;
  title: [lead: string, strong: string];
  address: [street: string, city: string];
  phone: string;
  /** Google Maps link. */
  map: string;
  position: [lat: number, lng: number];
  /** Photo on the map pin, served by the clinic's site. */
  img: string;
  parking: { name: string; address: string; map: string; position: [lat: number, lng: number] }[];
}

export const ABOUT_CLINICS: AboutClinic[] = [
  {
    id: "uptown",
    name: "Uptown",
    area: "Yonge Street, near Sheppard-Yonge Station",
    title: ["NewDermaMed", "Uptown"],
    address: ["4763 Yonge Street", "Toronto, ON M2N 5M5"],
    phone: "416-224-8800",
    map: "https://maps.app.goo.gl/Gm8Wg4B1Q3yHGnkE7",
    position: [43.7606276, -79.4103338],
    img: `${UPLOADS}upClinic.png`,
    parking: [
      { name: "Lot #56, Hullmark Centre", address: "Bales Ave, Toronto, ON M2N 5M5", map: "https://maps.app.goo.gl/rbQRgrwuKf5pBBfB6", position: [43.7609673, -79.4099159] },
      { name: "uPark", address: "9 Bogert Ave, Toronto, ON M2N 0H3", map: "https://maps.app.goo.gl/SG57huVnJwDJjqfu9", position: [43.7603126, -79.4116059] },
      { name: "Parking Indigo, 25 Sheppard Ave W", address: "25 Sheppard Ave W, North York, ON M2N 6S7", map: "https://maps.app.goo.gl/DpgB6iGLc9Vc8YvA7", position: [43.760647, -79.4117844] },
    ],
  },
  {
    id: "downtown",
    name: "Downtown",
    area: "Bay Street, near College Station",
    title: ["NewDermaMed", "Downtown"],
    address: ["790 Bay Street, Suite 900", "Toronto, ON M5G 1N8"],
    phone: "416-671-9766",
    map: "https://maps.app.goo.gl/McaiszUJaKqPem5R7",
    position: [43.6604681, -79.3860463],
    img: `${UPLOADS}downClinic.png`,
    parking: [
      { name: "Parking for 790 Bay Street", address: "790 Bay St, Toronto, ON M5G 1N8", map: "https://maps.app.goo.gl/sYrf33nW6XimJqHA7", position: [43.6604363, -79.386293] },
      { name: "SP+ Parking", address: "201 Elizabeth St, Toronto, ON M5G 2C4", map: "https://maps.app.goo.gl/PeePBqKrqdkcrDgc9", position: [43.659828, -79.3866552] },
      { name: "Parking lot, 76 College Street", address: "76 College St, Toronto, ON M5G 1L1", map: "https://maps.app.goo.gl/NCWjPWqFGUKtDzBP9", position: [43.660937, -79.386625] },
    ],
  },
];

export interface GalleryColumn {
  /** Where the column sits in the grid, and whether phones show it. */
  place: string;
  /** Top offset, in percent of the column width. */
  top: number;
  /** How far the column drifts on scroll, in px. */
  drift: number;
  /** Each tile: the place of its photo in the gallery's list, and its shape. */
  tiles: [photo: number, aspect: string][];
}

/* The mosaic, column by column. Desktop: 8 columns, the middle four end higher so the heading sits under them.
   Phones: the four columns that are not hidden, heading below. */
export const ABOUT_GALLERY_COLUMNS: GalleryColumn[] = [
  { place: "hidden md:flex md:col-start-1 md:row-start-1 md:row-span-2", top: 36, drift: 46, tiles: [[0, "135/192"], [5, "135/192"]] },
  { place: "flex col-start-1 row-start-1 md:col-start-2 md:row-span-2", top: 16, drift: 26, tiles: [[4, "1/1"], [2, "1/1"], [6, "1/1"]] },
  { place: "hidden md:flex md:col-start-3 md:row-start-1", top: 36, drift: 10, tiles: [[10, "135/300"]] },
  { place: "flex col-start-2 row-start-1 mt-[18%] md:col-start-4 md:mt-0", top: 0, drift: -12, tiles: [[8, "135/300"]] },
  { place: "flex col-start-3 row-start-1 md:col-start-5", top: 0, drift: -12, tiles: [[9, "135/300"]] },
  { place: "hidden md:flex md:col-start-6 md:row-start-1", top: 36, drift: 10, tiles: [[3, "135/300"]] },
  { place: "flex col-start-4 row-start-1 md:col-start-7 md:row-span-2", top: 16, drift: 26, tiles: [[7, "1/1"], [12, "1/1"], [1, "1/1"]] },
  { place: "hidden md:flex md:col-start-8 md:row-start-1 md:row-span-2", top: 36, drift: 46, tiles: [[11, "135/192"], [13, "135/192"]] },
];

export const ABOUT_FILM = { poster: "/assets/home/v3/tour-poster-1440.webp", src: "/assets/home/v3/tour-1600.mp4" };

/** The contact form's clinic choices. */
export const ABOUT_CLINIC_CHOICES: [name: string, street: string][] = [
  ["Uptown Clinic", "4763 Yonge Street"],
  ["Downtown Clinic", "790 Bay Street"],
];

/**
 * The page's own words and gallery photos as the original prototype had them. The page is edited in
 * WordPress (the page with the template "About page"): this copy is shown only when WordPress cannot be reached, has no
 * About page or the page is not published, and it is what `scripts/export-about.mjs` imports once. Plain JSON on
 * purpose: the export reads it as it is.
 */
export const ABOUT_COPY: AboutCopy = {
  "title": "About Us, NewDermaMed Cosmetic & Laser Clinic in Toronto",
  "description": "Meet the NewDermaMed medical team and visit our Uptown and Downtown Toronto clinics: addresses, hours, parking, a clinic gallery and answers to common questions.",
  "header": {
    "tag": "About NewDermaMed",
    "lead": "Toronto’s cosmetic",
    "strong": "and laser clinic",
    "text": "At NewDermaMed, we combine advanced dermatology, innovative aesthetic treatments, and personalized care to enhance your skin’s natural beauty, so it can look healthier, smoother, and more radiant. Recognized as Toronto’s Top Choice Cosmetic & Laser Clinic for eight consecutive years.",
    "stats": [
      {
        "figure": "16+",
        "unit": "years",
        "label": "In Toronto"
      },
      {
        "figure": "8",
        "unit": "Top Choice Awards",
        "label": "In a row, 2019 to 2026"
      },
      {
        "figure": "2",
        "unit": "Toronto clinics",
        "label": "Uptown and Downtown"
      },
      {
        "figure": "20+",
        "unit": "categories",
        "label": "Of treatment"
      }
    ]
  },
  "team": {
    "tag": "Our team",
    "lead": "The people",
    "strong": "behind your care",
    "intro": "Physicians, a vascular surgeon, a nurse practitioner and medical aesthetics specialists. Every treatment plan starts with a consultation and is guided by medical training."
  },
  "clinics": {
    "tag": "Our clinics",
    "lead": "Visit us in",
    "strong": "Uptown or Downtown"
  },
  "gallery": {
    "photos": [
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-01.png",
        "title": "Reception",
        "alt": "Reception with a sculpted white wall feature and lounge chairs"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-02.png",
        "title": "Treatment corridor",
        "alt": "Bright corridor lined with frosted glass treatment rooms"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-03.png",
        "title": "Front counter",
        "alt": "Framed beauty portraits above the front counter"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-04.png",
        "title": "Treatment room",
        "alt": "A provider preparing a treatment in a bright treatment room"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-05.png",
        "title": "Front desk",
        "alt": "Orchids and skincare display at the front desk"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-06.png",
        "title": "Waiting lounge",
        "alt": "Waiting lounge with black chairs and pendant lights"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-07.png",
        "title": "Reception desk",
        "alt": "Reception desk with glass treatment rooms behind it"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-08.png",
        "title": "Treatment room",
        "alt": "Treatment room with a white treatment bed and side desk"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-09.png",
        "title": "Downtown, 790 Bay Street",
        "alt": "Entrance of 790 Bay Street, home of the Downtown clinic"
      },
      {
        "src": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/09/About-us-gallery-10.png",
        "title": "Uptown, Yonge Street",
        "alt": "NewDermaMed signage on the Uptown clinic on Yonge Street"
      },
      {
        "src": "/assets/clinic/clinic-2.jpg",
        "title": "Treatment room",
        "alt": "Bright treatment room with a white treatment chair"
      },
      {
        "src": "/assets/clinic/clinic-3.jpg",
        "title": "Lounge",
        "alt": "Clinic lounge with a sculpted white wall feature"
      },
      {
        "src": "/assets/clinic/clinic-5.jpg",
        "title": "Skincare wall",
        "alt": "Skincare display wall beside the reception desk"
      },
      {
        "src": "/assets/hero/treatment-room.jpg",
        "title": "Treatment suite",
        "alt": "Private treatment suite with a treatment bed"
      }
    ],
    "tag": "Awards & recognition",
    "line": "Top Choice Award · 8 consecutive years",
    "lead": "Trusted brands & awards for excellence",
    "strong": "in aesthetic medicine.",
    "text": "Recognized as Toronto’s Top Choice Cosmetic & Laser Clinic for eight consecutive years, a reflection of 16+ years of dedication to patient care, innovation and consistent, high-quality treatment."
  },
  "faq": {
    "tag": "FAQ",
    "lead": "Your top questions,",
    "strong": "answered",
    "intro": "Everything you need to know about our team, our clinics and your first visit.",
    "items": [
      [
        "What treatments are available at NewDermaMed?",
        "NewDermaMed focuses on advanced non-surgical medical aesthetics, including laser hair removal, injectables and dermal fillers, acne and scar treatments, skin tightening, medical facials, body contouring, chemical peels, and skin rejuvenation with microneedling and PRP."
      ],
      [
        "What devices and technologies does the clinic use?",
        "We use Health Canada approved medical devices, including Candela GentleMax Pro for laser hair removal, Cutera Excel V+ for vascular and pigmentation concerns, Morpheus8 for skin tightening and collagen stimulation, and CoolSculpting® for non-surgical fat reduction."
      ],
      [
        "Are the treatments safe and effective?",
        "Treatments are performed by trained medical professionals using FDA and Health Canada approved devices and products, and each plan is tailored to your skin type and goals. As with any medical treatment, results and side effects can vary, and your provider reviews them with you at your consultation."
      ],
      [
        "Where are your clinics?",
        "Uptown: 4763 Yonge Street, Toronto, ON M2N 5M5, near Sheppard-Yonge Station. Downtown: 790 Bay Street, Suite 900, Toronto, ON M5G 1N8, near College Station."
      ],
      [
        "Where can I park?",
        "Uptown: Lot #56 at the Hullmark Centre, uPark at 9 Bogert Ave, or Parking Indigo at 25 Sheppard Ave W. Downtown: parking at 790 Bay Street, SP+ Parking at 201 Elizabeth St, or the lot at 76 College St."
      ],
      [
        "What are your clinic hours?",
        "Both clinics are open Monday to Friday, 9am to 7pm, and Saturday, 10am to 5pm."
      ],
      [
        "How do I book a consultation?",
        "You can book a free consultation by calling either clinic, filling out the online booking form, or visiting us in person. At your consultation, a specialist assesses your needs and recommends the treatment options that suit you."
      ]
    ]
  },
  "contact": {
    "tag": "Contact us",
    "lead": "We’re here",
    "strong": "to help",
    "text": "Call or text either clinic, email us, or send a message and our team will get back to you."
  }
};
