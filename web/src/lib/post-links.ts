import { SHOP_PAGE } from "@/config/shop";
import { FINANCING_URL } from "@/config/specials";
import { postNamed, PROCEDURE_FOLDERS, type PostPath } from "@/lib/post-paths";

/*
 * The prototype wrote a link to a page that did not exist yet as "#/slug" ("#/microneedling"). The pages
 * exist now, as posts in WordPress, so every such link is given its real address before it reaches the
 * page: the post of that slug (or of the slug the table below names for it), else the list of all
 * procedures or of all concerns. "#/book" is not a page: it opens the booking form and stays as it is.
 */

/** The list of every procedure, with one section per procedure list ("/procedures#skin"). */
export const PROCEDURES_INDEX = "/procedures";
/** The list of every concern. */
export const CONCERNS_INDEX = "/concerns";

/** The pages published in WordPress, as the links need them. */
export interface PostLists {
  concerns: readonly PostPath[];
  procedures: readonly PostPath[];
}

/** A placeholder whose page has another slug: a procedure. */
const PROCEDURE_ALIASES: Readonly<Record<string, string>> = {
  "lip-fillers": "lip-augmentation",
  "lip-filler": "lip-augmentation",
  "under-eye-filler": "tear-trough-correction",
  "skin-boosters": "mesotherapy-skin-boosters",
  "laser-skin-tightening": "skin-tightening",
  "laser-acne-treatment": "acne-treatments",
  "cosmelan-dermamelan": "dermamelan",
  "medical-facials": "age-element-facial",
  "laser-vein-removal": "spider-vein-removal",
  "prp-hair-restoration": "hair-loss-treatments",
  "non-surgical-butt-lift": "non-surgical-bbl",
  "chemical-peel": "chemical-peels",
};

/** A placeholder whose page has another slug: a concern. Two of them name a procedure elsewhere ("#/lip-fillers"), so these count only where a concern is meant. */
const CONCERN_ALIASES: Readonly<Record<string, string>> = {
  "sagging-skin": "sagging-skin-jowls",
  "under-eye-hollows": "under-eye-hollows-dark-circles",
  "lip-fillers": "thin-lips",
  acne: "acne-breakouts",
  pigmentation: "hyperpigmentation-sun-spots",
  melasma: "melasma-concern",
  "texture-pores": "uneven-texture-pores",
  "laser-hair-removal": "unwanted-hair",
  "spider-veins": "spider-varicose-veins",
  "varicose-veins": "spider-varicose-veins",
};

/** Placeholders that are not a post: the two lists, a procedure list's section, the shop, financing. */
const FIXED: Readonly<Record<string, string>> = {
  treatments: PROCEDURES_INDEX,
  procedures: PROCEDURES_INDEX,
  concerns: CONCERNS_INDEX,
  ...Object.fromEntries(Object.values(PROCEDURE_FOLDERS).filter((f) => f !== "procedures").map((f) => [f, `${PROCEDURES_INDEX}#${f}`])),
  shop: SHOP_PAGE,
  "skincare-shop": SHOP_PAGE,
  financing: FINANCING_URL,
  /* "Book Online" in the footer: the booking form */
  "book-online": "#/book",
};

const find = (list: readonly PostPath[], slug: string, aliases: Readonly<Record<string, string>>): PostPath | undefined => list.find((p) => p.slug === slug) ?? (aliases[slug] ? list.find((p) => p.slug === aliases[slug]) : undefined) ?? postNamed(list, slug);

/**
 * The real address of a "#/slug" placeholder. `prefer` says what the link means where a slug could be
 * either ("Compare these options" under a concern is a concern). A slug with no page opens the list
 * of procedures, or of concerns. Anything that is not a placeholder, and "#/book", is returned as it is.
 */
export function realLink(href: string, lists: PostLists, prefer: "concerns" | "procedures" = "procedures"): string {
  const slug = /^#\/([a-z0-9-]+)$/.exec(href)?.[1];
  if (!slug || slug === "book") return href;
  if (FIXED[slug]) return FIXED[slug];
  const concern = () => find(lists.concerns, slug, CONCERN_ALIASES);
  const procedure = () => find(lists.procedures, slug, PROCEDURE_ALIASES);
  const post = prefer === "concerns" ? (concern() ?? procedure()) : (procedure() ?? concern());
  return post?.path ?? (prefer === "concerns" ? CONCERNS_INDEX : PROCEDURES_INDEX);
}

/** A page's old one-part address ("/wrinkles-fine-lines") as its address now, when a post has that slug. */
function movedLink(href: string, lists: PostLists): string {
  const slug = /^\/([a-z0-9-]+)$/.exec(href)?.[1];
  const post = slug ? (lists.procedures.find((p) => p.slug === slug) ?? lists.concerns.find((p) => p.slug === slug)) : undefined;
  return post && post.path !== href ? post.path : href;
}

/** Fields whose link names a concern ("Compare these options" of a concern on the home page). */
const CONCERN_KEYS: ReadonlySet<string> = new Set(["more_link", "moreLink", "more"]);

/** `realLink` over every text of a page's content that is a placeholder or an old one-part address; everything else is left untouched. */
export function linkPlaceholders<T>(content: T, lists: PostLists): T {
  const walk = (value: unknown, key: string): unknown => {
    if (typeof value === "string") {
      if (value.startsWith("#/")) return realLink(value, lists, CONCERN_KEYS.has(key) ? "concerns" : "procedures");
      return value.startsWith("/") ? movedLink(value, lists) : value;
    }
    if (Array.isArray(value)) return value.map((x) => walk(x, key));
    if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) return Object.fromEntries(Object.entries(value).map(([k, x]) => [k, walk(x, CONCERN_KEYS.has(key) ? key : k)]));
    return value;
  };
  return walk(content, "") as T;
}

/** The breadcrumb's links above a procedure or a concern: "Procedures" and "Concerns" open their list, a procedure list's name ("Injectables") its section there. */
export function crumbLink(label: string): { href: string; internal: true } {
  if (label === "Concerns") return { href: CONCERNS_INDEX, internal: true };
  const folder = (PROCEDURE_FOLDERS as Record<string, string>)[label];
  return { href: folder && folder !== "procedures" ? `${PROCEDURES_INDEX}#${folder}` : PROCEDURES_INDEX, internal: true };
}
