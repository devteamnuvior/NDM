import type { PageId } from "@/config/routes";

/** Top-level sections the header can mark as "you are here". */
export type NavSectionId = "home" | "procedures" | "concerns" | "pricing" | "promotion" | "about" | "shop";

/** Which dropdown panel a top-level item opens. */
export type NavMenuId = "procedures" | "concerns" | "about";

export interface SearchEntry {
  name: string;
  category: string;
}

/** A resolved link: where it goes, and which page it is (when it is one of ours). */
export interface ResolvedLink {
  href: string;
  page?: PageId;
  /** A page of this site that is not in the route table (a concern page from WordPress). */
  internal?: boolean;
}
