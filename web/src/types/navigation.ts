import type { PageId } from "@/config/routes";

/** Top-level sections the header can mark as "you are here". */
export type NavSectionId = "home" | "procedures" | "concerns" | "pricing" | "promotion" | "about" | "shop";

/** Which dropdown panel a top-level item opens. */
export type NavMenuId = "procedures" | "concerns" | "about";

export interface NavItem {
  id: NavSectionId;
  label: string;
  /** Opens a dropdown panel instead of navigating. */
  menu?: NavMenuId;
  /** Explicit target; when missing, the label is resolved through the route table. */
  href?: string;
  /** Opens in a new tab and shows the external-link icon. */
  external?: boolean;
}

export interface TreatmentGroup {
  title?: string;
  items: string[];
}

export interface ProcedureCategory {
  id: string;
  label: string;
  blurb: string;
  groups: TreatmentGroup[];
}

export interface ConcernGroup {
  title: string;
  items: string[];
}

export interface SearchEntry {
  name: string;
  category: string;
}

/** A resolved link: where it goes, and which page it is (when it is one of ours). */
export interface ResolvedLink {
  href: string;
  page?: PageId;
}
