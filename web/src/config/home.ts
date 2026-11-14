import { ACTIONS } from "@/config/routes";
import { START_PANELS } from "@/config/home-start";
import type { HomeCopy } from "@/types/home";
import copy from "./home-copy.json";

/**
 * Home page content. Source: the original prototype.
 *
 * The page's words are edited in WordPress (the page chosen as the homepage under Settings > Reading, see `@/lib/home`). `HOME_COPY`
 * (home-copy.json) is the built-in copy: what the page shows when WordPress cannot be reached or the
 * page is not published, what other pages show for the sections they share with the home page, and the
 * source of the one-time import (scripts/export-home.mjs).
 */
/* the JSON file holds the words; the panels' built-in list lives in home-start.ts */
const words = copy as unknown as Omit<HomeCopy, "start"> & { start: Omit<HomeCopy["start"], "panels"> };
export const HOME_COPY: HomeCopy = { ...words, start: { ...words.start, panels: START_PANELS } };

/** The hero's film, and where its two buttons lead. */
export const HERO = {
  film: {
    poster: "/assets/home/v3/hero-poster-1440.webp",
    mobile: "/assets/home/v3/hero-960.mp4",
    desktop: "/assets/home/v3/hero-1600.mp4",
  },
  primaryCta: { label: "Book Free Consultation", href: ACTIONS.book },
  secondaryHref: "#start",
};

/** Where the Aptos section's second button leads, and what it says. */
export const APTOS_EXPLORE = {
  label: "Explore Aptos Thread Lift",
  page: "aptos",
} as const;

export interface ProcessStepLink {
  photoAlt: string;
  href: string;
  /** Button style: the booking button, or a plain blue pill. */
  buttonStyle: "book" | "ink";
}

/** How it works: what each of the three steps opens (their words are in the copy, their photos in the section). */
export const PROCESS_LINKS: ProcessStepLink[] = [
  {
    photoAlt: "A provider and a patient reviewing VISIA® skin analysis results",
    href: ACTIONS.book,
    buttonStyle: "book",
  },
  {
    photoAlt: "VISIA® skin analysis results on the consultation room screen",
    href: "#treatments",
    buttonStyle: "ink",
  },
  {
    photoAlt: "A patient checking her skin in a hand mirror in the treatment chair",
    href: "#visit",
    buttonStyle: "ink",
  },
];

/** The site's general questions and answers (the blog page and the chat assistant; the home page's own are edited in WordPress). */
export const FAQS: [question: string, answer: string][] = HOME_COPY.faq.items;
