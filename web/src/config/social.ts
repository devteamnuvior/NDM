/** The clinic's social accounts, the reels on the home page's phone, and the journal posts. */

export const SOCIAL = {
  instagram: "https://www.instagram.com/newdermamed/",
  facebook: "https://www.facebook.com/NewDermaMed-171490486329211/",
  youtube: "https://www.youtube.com/channel/UCEu0ghSIa-ZPqNh087WAY3w",
  x: "https://twitter.com/NewDermaMed",
  linkedin: "https://www.linkedin.com/company/3636680",
} as const;

export type SocialNetwork = keyof typeof SOCIAL;

const REEL_BASE = "https://newdermamedlaserclinic.com/wp-content/uploads/";

/** Reels from @newdermamed, served by the clinic's own site. */
export const REELS: { src: string; tag: string }[] = [
  { src: `${REEL_BASE}2025/09/Filler-.mp4`, tag: "Dermal Fillers" },
  { src: `${REEL_BASE}2025/09/botox-.mp4`, tag: "Injectables" },
  { src: `${REEL_BASE}2025/11/exosome-.mp4`, tag: "Exosome Skin Therapy" },
  { src: `${REEL_BASE}2025/10/dermamelan-1-.mp4`, tag: "Dermamelan®" },
  { src: `${REEL_BASE}2025/10/laser-.mp4`, tag: "Laser Treatments" },
  { src: `${REEL_BASE}2025/10/dermamelan-2-.mp4`, tag: "Pigmentation Care" },
];

/** Hand holding a phone (1288 x 1968): the screen sits at left 25.5%, top 7%, 49% x 70% of the image. */
export const HAND_PHONE_SRC = "https://framerusercontent.com/images/6JwcFXiz7bhRBVNBWRZP2M0ow.png?width=1288&height=1968";

export interface Post {
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  image: string;
  /** Focus point of the photo. */
  position: string;
  href: string;
}

/** Journal posts on the home page: the first is the large one. Articles open on the live blog. */
export const POSTS: Post[] = [
  {
    title: "What causes rosacea redness",
    excerpt: "The everyday triggers that can make rosacea flare, and why they affect some skin more than others.",
    date: "Nov 26, 2025",
    tag: "Skin Concerns",
    image: "https://framerusercontent.com/images/ds9SwQ920y1cwOE01qALF129VI.jpg?scale-down-to=1024",
    position: "50% 50%",
    href: "https://newdermamedlaserclinic.com/what-causes-rosacea-redness/",
  },
  {
    title: "Your complete guide to laser hair removal",
    excerpt: "How laser hair removal works, what it can cost in Toronto, how to choose a clinic and how to prepare for your sessions.",
    date: "Nov 24, 2025",
    tag: "Laser",
    image: "https://framerusercontent.com/images/yQ5s6EDabiPjifaCC5JSRGEy24.jpg?scale-down-to=512",
    position: "50% 35%",
    href: "https://newdermamedlaserclinic.com/your-complete-guide-to-laser-hair-removal/",
  },
  {
    title: "What is microdermabrasion?",
    excerpt: "What microdermabrasion is, how it works and how it compares with treatments like microneedling.",
    date: "Nov 15, 2025",
    tag: "Treatments",
    image: "https://framerusercontent.com/images/pmbu8ybv1LJ7ypjy7VNsCqO2ouQ.jpg?scale-down-to=512",
    position: "50% 50%",
    href: "https://newdermamedlaserclinic.com/what-is-microdermabrasion/",
  },
  {
    title: "Chemical peel treatment in Toronto",
    excerpt: "How chemical peels can help with sun damage, uneven tone, enlarged pores and fine lines.",
    date: "Nov 7, 2025",
    tag: "Skin Health",
    image: "https://framerusercontent.com/images/3BY9JF7AVX8rFYwrCs7NxJm584.jpg?scale-down-to=512",
    position: "50% 50%",
    href: "https://newdermamedlaserclinic.com/chemical-peel-treatment-toronto/",
  },
];
