/**
 * The journal: every post on the clinic's blog, newest first. Generated from the prototype's src/blog-ui.jsx.
 * Titles, dates, images and links are the clinic's; summaries are short and in qualified language. A post
 * with `external: false` has its own page on this site (see BLOG_LOCAL); the rest open on the clinic's live site.
 */
import type { PageId } from "@/config/routes";

export interface BlogPost {
  title: string;
  /** The post's address on the clinic's blog ("/what-causes-rosacea-redness/"). */
  slug: string;
  /** Where the post opens when it is not on this site yet; empty for local posts. */
  url: string;
  external: boolean;
  date: string;
  /** Reading time. */
  minutes: number;
  topic: string;
  img: string;
  excerpt: string;
}

/** Posts that have their own page here. */
export const BLOG_LOCAL: Record<string, PageId> = { "/what-causes-rosacea-redness/": "article" };

export const BLOG_TOPICS = ["All", "Skin", "Laser", "Injectables", "Thread lift", "Body", "Veins", "Guides"];

/** How many stories the list shows at first, and adds with each "Load more". */
export const BLOG_STEP = 9;

export const BLOG_POSTS: BlogPost[] = [
  {
    "title": "What Causes Rosacea Redness",
    "slug": "/what-causes-rosacea-redness/",
    "url": "",
    "external": false,
    "date": "November 26, 2025",
    "minutes": 9,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/1-What-Causes-Rosacea-Redness-m.webp",
    "excerpt": "The everyday triggers that can make rosacea flare, and why they affect some skin more than others."
  },
  {
    "title": "Your Complete Guide to Laser Hair Removal",
    "slug": "/your-complete-guide-to-laser-hair-removal/",
    "url": "https://newdermamedlaserclinic.com/your-complete-guide-to-laser-hair-removal/",
    "external": true,
    "date": "November 24, 2025",
    "minutes": 5,
    "topic": "Laser",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/2-Your-Complete-Guide-to-Laser-Hair-Removal-m.webp",
    "excerpt": "How laser hair removal works, what it can cost in Toronto, how to choose a clinic and how to prepare for your sessions."
  },
  {
    "title": "Best Way to Treat Rosacea",
    "slug": "/best-way-to-treat-rosacea/",
    "url": "https://newdermamedlaserclinic.com/best-way-to-treat-rosacea/",
    "external": true,
    "date": "November 22, 2025",
    "minutes": 5,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/3-Best-Way-to-Treat-Rosacea-m.webp",
    "excerpt": "Why rosacea often responds best to a full care plan rather than a single treatment, and where to start."
  },
  {
    "title": "How to Get Rid of Acne Scars?",
    "slug": "/how-to-get-rid-of-acne-scars/",
    "url": "https://newdermamedlaserclinic.com/how-to-get-rid-of-acne-scars/",
    "external": true,
    "date": "November 20, 2025",
    "minutes": 5,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/4-How-to-Get-Rid-of-Acne-Scars-m.webp",
    "excerpt": "What acne scars are, why they form and how to choose a treatment plan together with your clinic."
  },
  {
    "title": "What is PRP therapy and how does it help with skin rejuvenation or hair loss",
    "slug": "/what-is-prp-therapy/",
    "url": "https://newdermamedlaserclinic.com/what-is-prp-therapy/",
    "external": true,
    "date": "November 17, 2025",
    "minutes": 6,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/5-What-is-PRP-therapy-and-how-does-it-help-with-skin-rejuvenation-or-hair-loss-m.webp",
    "excerpt": "What platelet-rich plasma therapy is, and how it may support skin rejuvenation and hair density."
  },
  {
    "title": "What is Microdermabrasion?",
    "slug": "/what-is-microdermabrasion/",
    "url": "https://newdermamedlaserclinic.com/what-is-microdermabrasion/",
    "external": true,
    "date": "November 15, 2025",
    "minutes": 5,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/6-What-is-Microdermabrasion-m.webp",
    "excerpt": "What microdermabrasion is, how it works and how it compares with treatments like microneedling."
  },
  {
    "title": "What Is Laser Hair Removal And How Does It Work?",
    "slug": "/what-is-laser-hair-removal-and-how-does-it-work/",
    "url": "https://newdermamedlaserclinic.com/what-is-laser-hair-removal-and-how-does-it-work/",
    "external": true,
    "date": "November 13, 2025",
    "minutes": 8,
    "topic": "Laser",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/7-What-Is-Laser-Hair-Removal-And-How-Does-It-Work-m.webp",
    "excerpt": "How focused light targets the hair follicle to slow regrowth, and what to expect over a course of sessions."
  },
  {
    "title": "Juvederm at NewDermaMed Toronto",
    "slug": "/juvederm-at-newdermamed-toronto/",
    "url": "https://newdermamedlaserclinic.com/juvederm-at-newdermamed-toronto/",
    "external": true,
    "date": "November 11, 2025",
    "minutes": 7,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/8-Juvederm-at-NewDermaMed-Toronto-m.webp",
    "excerpt": "How Juvéderm hyaluronic acid fillers can add volume, soften lines and refine facial contours."
  },
  {
    "title": "How Do You Get Rid of Hyperpigmentation",
    "slug": "/how-do-you-get-rid-of-hyperpigmentation/",
    "url": "https://newdermamedlaserclinic.com/how-do-you-get-rid-of-hyperpigmentation/",
    "external": true,
    "date": "November 9, 2025",
    "minutes": 9,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/9-How-Do-You-Get-Rid-of-Hyperpigmentation-m.webp",
    "excerpt": "Why dark spots and uneven patches appear, and the treatment options that may help them fade."
  },
  {
    "title": "Chemical Peel Treatment Toronto",
    "slug": "/chemical-peel-treatment-toronto/",
    "url": "https://newdermamedlaserclinic.com/chemical-peel-treatment-toronto/",
    "external": true,
    "date": "November 7, 2025",
    "minutes": 7,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/10-Chemical-Peel-Treatment-Toronto-m.webp",
    "excerpt": "How chemical peels can help with sun damage, uneven tone, enlarged pores and fine lines."
  },
  {
    "title": "NewDermaMed Toronto Offers Botox Treatments",
    "slug": "/newdermamed-toronto-offers-botox-treatments/",
    "url": "https://newdermamedlaserclinic.com/newdermamed-toronto-offers-botox-treatments/",
    "external": true,
    "date": "November 5, 2025",
    "minutes": 6,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/11-NewDermaMed-Toronto-Offers-Botox-Treatments-m.webp",
    "excerpt": "What this prescription treatment is and what a visit to NewDermaMed involves, from consultation to aftercare."
  },
  {
    "title": "What Is Botox? And How Does NewDermaMed Use It?",
    "slug": "/what-is-botox-and-how-does-newdermamed-use-it/",
    "url": "https://newdermamedlaserclinic.com/what-is-botox-and-how-does-newdermamed-use-it/",
    "external": true,
    "date": "November 3, 2025",
    "minutes": 8,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/12-What-Is-Botox-And-How-Does-NewDermaMed-Use-It-m.webp",
    "excerpt": "A plain-language guide to this prescription treatment and what happens during and after an appointment."
  },
  {
    "title": "Aptos Excellence Visage Thread Lift is available at NewDermaMed in Toronto",
    "slug": "/aptos-excellence-visage-thread-lift-is-available-at-newdermamed-in-toronto/",
    "url": "https://newdermamedlaserclinic.com/aptos-excellence-visage-thread-lift-is-available-at-newdermamed-in-toronto/",
    "external": true,
    "date": "November 1, 2025",
    "minutes": 8,
    "topic": "Thread lift",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/13-Aptos-Excellence-Visage-Thread-Lift-is-available-m.webp",
    "excerpt": "An introduction to the Aptos Excellence Visage thread lift, a non-surgical option for lifting and refining facial contours."
  },
  {
    "title": "How to Prepare for Sclerotherapy – Before and After Care",
    "slug": "/how-to-prepare-for-sclerotherapy-before-and-after-care/",
    "url": "https://newdermamedlaserclinic.com/how-to-prepare-for-sclerotherapy-before-and-after-care/",
    "external": true,
    "date": "October 26, 2021",
    "minutes": 3,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/14-How-to-Prepare-for-Sclerotherapy-m.webp",
    "excerpt": "How to prepare for sclerotherapy, and the aftercare steps that support your recovery."
  },
  {
    "title": "What You Should Know About Compression Stockings and Varicose Veins",
    "slug": "/what-you-should-know-about-compression-stockings-and-varicose-veins/",
    "url": "https://newdermamedlaserclinic.com/what-you-should-know-about-compression-stockings-and-varicose-veins/",
    "external": true,
    "date": "October 26, 2021",
    "minutes": 3,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/15-What-You-Should-Know-About-Compression-Stockings-m.webp",
    "excerpt": "What compression stockings do, and when they may be recommended for varicose and spider veins."
  },
  {
    "title": "Do Varicose Veins Hurt?",
    "slug": "/do-varicose-veins-hurt/",
    "url": "https://newdermamedlaserclinic.com/do-varicose-veins-hurt/",
    "external": true,
    "date": "August 26, 2021",
    "minutes": 4,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/16-Do-Varicose-Veins-Hurt-m.webp",
    "excerpt": "Why varicose veins can cause leg discomfort, and when it is worth speaking with a specialist."
  },
  {
    "title": "Can You Tattoo Over Varicose Veins?",
    "slug": "/can-you-tattoo-over-varicose-veins/",
    "url": "https://newdermamedlaserclinic.com/can-you-tattoo-over-varicose-veins/",
    "external": true,
    "date": "August 26, 2021",
    "minutes": 4,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/17-Can-You-Tattoo-Over-Varicose-Veins-m.webp",
    "excerpt": "What to consider before tattooing over varicose veins, and the treatment options to discuss first."
  },
  {
    "title": "Things to Keep in Mind When Considering Juvéderm",
    "slug": "/things-to-keep-in-mind-when-considering-juvederm/",
    "url": "https://newdermamedlaserclinic.com/things-to-keep-in-mind-when-considering-juvederm/",
    "external": true,
    "date": "April 29, 2021",
    "minutes": 5,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/18-Things-to-Keep-in-Mind-m.webp",
    "excerpt": "Questions to ask and points to consider before choosing Juvéderm fillers for the lips, cheeks or smile lines."
  },
  {
    "title": "Tips on Reducing Bruising and Swelling After Lip Filler",
    "slug": "/tips-on-reducing-bruising-and-swelling-after-lip-filler/",
    "url": "https://newdermamedlaserclinic.com/tips-on-reducing-bruising-and-swelling-after-lip-filler/",
    "external": true,
    "date": "February 24, 2021",
    "minutes": 5,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/19-Tips-on-Reducing-Bruising-and-Swelling-m.webp",
    "excerpt": "Practical steps that may help reduce bruising and swelling after a lip filler appointment."
  },
  {
    "title": "How Long Do Under Eye Fillers Last?",
    "slug": "/how-long-do-under-eye-fillers-last/",
    "url": "https://newdermamedlaserclinic.com/how-long-do-under-eye-fillers-last/",
    "external": true,
    "date": "October 21, 2020",
    "minutes": 3,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/20-How-Long-Do-Under-Eye-Fillers-Last-m.webp",
    "excerpt": "How long tear trough fillers typically last, and what can affect how long results stay."
  },
  {
    "title": "How to Prepare for Dermal Fillers",
    "slug": "/how-to-prepare-for-dermal-fillers/",
    "url": "https://newdermamedlaserclinic.com/how-to-prepare-for-dermal-fillers/",
    "external": true,
    "date": "October 21, 2020",
    "minutes": 3,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2025/11/21-How-to-Prepare-for-Dermal-Fillers-m.webp",
    "excerpt": "What to do in the days before a dermal filler appointment to help your visit go smoothly."
  },
  {
    "title": "What’s the Difference Between 3D Lipo and CoolSculpting",
    "slug": "/whats-the-difference-between-3d-lipo-and-coolsculpting/",
    "url": "https://newdermamedlaserclinic.com/whats-the-difference-between-3d-lipo-and-coolsculpting/",
    "external": true,
    "date": "August 26, 2020",
    "minutes": 4,
    "topic": "Body",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/22-Whats-the-Difference-Between-3D-Lipo-and-CoolSculpting-m.webp",
    "excerpt": "How 3D Lipo and CoolSculpting approach fat reduction differently, and how to choose between them."
  },
  {
    "title": "What’s the Difference Between CoolSculpting and Ultrasonic Cavitation",
    "slug": "/whats-the-difference-between-coolsculpting-and-ultrasonic-cavitation/",
    "url": "https://newdermamedlaserclinic.com/whats-the-difference-between-coolsculpting-and-ultrasonic-cavitation/",
    "external": true,
    "date": "August 26, 2020",
    "minutes": 4,
    "topic": "Body",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/23-Whats-the-Difference-Between-CoolSculpting-and-Ultrasonic-Cavitation-m.webp",
    "excerpt": "Comparing two non-surgical fat reduction options for specific areas of the body."
  },
  {
    "title": "What’s the Difference Between CoolSculpting and SculpSure",
    "slug": "/whats-the-difference-between-coolsculpting-and-sculpsure/",
    "url": "https://newdermamedlaserclinic.com/whats-the-difference-between-coolsculpting-and-sculpsure/",
    "external": true,
    "date": "November 27, 2019",
    "minutes": 5,
    "topic": "Body",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/24-Whats-the-Difference-Between-CoolSculpting-and-SculpSure-m.webp",
    "excerpt": "Two non-surgical approaches to stubborn fat, how each one works and which may suit you."
  },
  {
    "title": "What’s The Difference Between Liposuction and CoolSculpting",
    "slug": "/whats-the-difference-between-liposuction-and-coolsculpting/",
    "url": "https://newdermamedlaserclinic.com/whats-the-difference-between-liposuction-and-coolsculpting/",
    "external": true,
    "date": "November 27, 2019",
    "minutes": 5,
    "topic": "Body",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2019/11/Whats-The-Difference-Between-Liposuction-and-CoolSculpting.jpg",
    "excerpt": "Surgical and non-surgical fat reduction compared, from how each works to what recovery involves."
  },
  {
    "title": "Pregnancy and Varicose Veins",
    "slug": "/pregnancy-and-varicose-veins/",
    "url": "https://newdermamedlaserclinic.com/pregnancy-and-varicose-veins/",
    "external": true,
    "date": "November 19, 2019",
    "minutes": 4,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/25-Pregnancy-and-Varicose-Veins-m.webp",
    "excerpt": "Why varicose veins can appear during pregnancy, and ways to manage them before and after birth."
  },
  {
    "title": "How to Hide Bulging Varicose Veins",
    "slug": "/how-to-hide-bulging-varicose-veins/",
    "url": "https://newdermamedlaserclinic.com/how-to-hide-bulging-varicose-veins/",
    "external": true,
    "date": "November 19, 2019",
    "minutes": 4,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/26-How-to-Hide-Bulging-Varicose-Veins-m.webp",
    "excerpt": "Everyday ways to make bulging varicose veins less visible, and longer-term treatment options."
  },
  {
    "title": "Are Varicose Veins Dangerous?",
    "slug": "/are-varicose-veins-dangerous/",
    "url": "https://newdermamedlaserclinic.com/are-varicose-veins-dangerous/",
    "external": true,
    "date": "November 3, 2019",
    "minutes": 5,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/27-Are-Varicose-Veins-Dangerous-m.webp",
    "excerpt": "When varicose veins are mainly a cosmetic concern, and the signs that mean you should see a doctor."
  },
  {
    "title": "Is Cosmetic Surgery the Same as Plastic Surgery?",
    "slug": "/is-cosmetic-surgery-the-same-as-plastic-surgery/",
    "url": "https://newdermamedlaserclinic.com/is-cosmetic-surgery-the-same-as-plastic-surgery/",
    "external": true,
    "date": "November 3, 2019",
    "minutes": 5,
    "topic": "Guides",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/28-Is-Cosmetic-Surgery-the-Same-as-Plastic-Surgery-m.webp",
    "excerpt": "How cosmetic surgery and plastic surgery differ, even though the terms are often used interchangeably."
  },
  {
    "title": "How To Get Rid of Spider Veins and Varicose Veins",
    "slug": "/how-to-get-rid-of-spider-veins-and-varicose-veins/",
    "url": "https://newdermamedlaserclinic.com/how-to-get-rid-of-spider-veins-and-varicose-veins/",
    "external": true,
    "date": "September 25, 2019",
    "minutes": 6,
    "topic": "Veins",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/29-How-To-Get-Rid-of-Spider-Veins-and-Varicose-Veins-m.webp",
    "excerpt": "The difference between spider veins and varicose veins, and the treatments used to reduce them."
  },
  {
    "title": "Does Insurance Cover Cosmetic Surgery?",
    "slug": "/does-insurance-cover-cosmetic-surgery/",
    "url": "https://newdermamedlaserclinic.com/does-insurance-cover-cosmetic-surgery/",
    "external": true,
    "date": "July 17, 2019",
    "minutes": 5,
    "topic": "Guides",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/30-Does-Insurance-Cover-Cosmetic-Surgery-m.webp",
    "excerpt": "When insurance may or may not cover cosmetic procedures, and other ways to plan for the cost."
  },
  {
    "title": "Chemical Peels",
    "slug": "/chemical-peels/",
    "url": "https://newdermamedlaserclinic.com/chemical-peels/",
    "external": true,
    "date": "June 30, 2015",
    "minutes": 4,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/31-CHEMICAL-PEELS-m.webp",
    "excerpt": "A personal look at what chemical peels can do for fine lines and early sun spots."
  },
  {
    "title": "Juvéderm Vycross Technology",
    "slug": "/juvederm-vycross-technology/",
    "url": "https://newdermamedlaserclinic.com/juvederm-vycross-technology/",
    "external": true,
    "date": "June 22, 2015",
    "minutes": 3,
    "topic": "Injectables",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/32-JUVEDERM-VYCROSS-TECHNOLOGY-m.webp",
    "excerpt": "An introduction to the Juvéderm Vycross filler range and how it differs from earlier generations."
  },
  {
    "title": "Pineapple, Cucumber & Apple Smoothie for Healthy Skin!",
    "slug": "/pineapple-cucumber-apple-smoothie-for-healthy-skin/",
    "url": "https://newdermamedlaserclinic.com/pineapple-cucumber-apple-smoothie-for-healthy-skin/",
    "external": true,
    "date": "October 23, 2013",
    "minutes": 2,
    "topic": "Skin",
    "img": "https://newdermamedlaserclinic.com/wp-content/uploads/2020/08/33-Pineapple-Cucumber-Apple-Smoothie-for-Healthy-Skin-m.webp",
    "excerpt": "A simple pineapple, cucumber and apple smoothie made with skin-friendly ingredients."
  }
];
