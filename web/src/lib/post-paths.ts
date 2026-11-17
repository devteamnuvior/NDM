/**
 * The address of a page made from a WordPress post: the post type's own folder, then the post's slug.
 *
 *   Concerns             /concerns/<slug>
 *   Procedures           /procedures/<slug>
 *   Injectables          /injectables/<slug>     (Botox: /injectables/botox)
 *   Skin                 /skin/<slug>
 *   Laser                /laser/<slug>
 *   Body                 /body/<slug>
 *   Veins                /veins/<slug>
 *   Hair                 /hair/<slug>
 *   blog posts           /blog/<slug>
 *
 * A procedure or a concern with a parent page (WordPress's "Parent Page" box) has its parents' slugs
 * before its own: /injectables/double-chin/belkyra-kybella.
 *
 * The Aptos Thread Lift page is a standard WordPress page, not a post type, and keeps /aptos-thread-lift.
 * The same folders are written in the mu-plugin (`ndm_headless_site_path()`, includes/config.php), which
 * shows each post's address in wp-admin. An old one-part address ("/botox") redirects to the new one.
 */

/** The folder of each procedure post type, by the name WordPress gives the type ("Injectables"). */
export const PROCEDURE_FOLDERS = {
  Procedures: "procedures",
  Injectables: "injectables",
  Skin: "skin",
  Laser: "laser",
  Body: "body",
  Veins: "veins",
  Hair: "hair",
} as const;

export type ProcedureFolder = (typeof PROCEDURE_FOLDERS)[keyof typeof PROCEDURE_FOLDERS];

export const CONCERN_FOLDER = "concerns";
export const BLOG_FOLDER = "blog";

const FOLDERS: readonly string[] = Object.values(PROCEDURE_FOLDERS);

/** "Injectables" -> "injectables"; a type the site does not know yet (or none) -> "procedures". */
export function procedureFolder(type: string | undefined): ProcedureFolder {
  return (type && PROCEDURE_FOLDERS[type as keyof typeof PROCEDURE_FOLDERS]) || "procedures";
}

/** Whether the first part of an address is the folder of a procedure post type. */
export function isProcedureFolder(folder: string): folder is ProcedureFolder {
  return FOLDERS.includes(folder);
}

/** The slugs of a page's address after its folder: its parents' slugs, from the top down, then its own. */
const trail = (slug: string, parents: readonly { slug: string }[] = []): string => [...parents.map((p) => p.slug), slug].join("/");

/** A procedure's address. With parent pages: "/injectables/double-chin/belkyra-kybella". */
export const procedurePath = (type: string | undefined, slug: string, parents?: readonly { slug: string }[]): string => `/${procedureFolder(type)}/${trail(slug, parents)}`;
/** A concern's address. With parent pages: "/concerns/<parent>/<slug>". */
export const concernPath = (slug: string, parents?: readonly { slug: string }[]): string => `/${CONCERN_FOLDER}/${trail(slug, parents)}`;

/** The pages above a post with their own addresses, for the breadcrumb: each one's address runs through the ones before it. */
export function parentCrumbs(parents: readonly { slug: string; title: string }[] | undefined, path: (slug: string, above: readonly { slug: string }[]) => string): PostCrumb[] {
  return (parents ?? []).map((p, i, all) => ({ title: p.title, path: path(p.slug, all.slice(0, i)) }));
}
export const articlePath = (slug: string): string => `/${BLOG_FOLDER}/${slug}`;

/** A page above the current one, in the breadcrumb. */
export interface PostCrumb {
  title: string;
  path: string;
}

/** A page published in WordPress: the post's slug and its address on the site ("/injectables/botox"). */
export interface PostPath {
  slug: string;
  path: string;
  /** The post's title written as a slug ("Belkyra® / Kybella® (Double Chin)" -> "belkyra-kybella-double-chin"), when it differs from the post's own slug: a menu entry or a link that names the page by its title still finds it. */
  name?: string;
}

/** A page's entry for the lists of post addresses; `titleSlug` is the title written as a slug (`toSlug`). */
export function postPath(slug: string, path: string, titleSlug: string): PostPath {
  return titleSlug && titleSlug !== slug ? { slug, path, name: titleSlug } : { slug, path };
}

/** The page with this slug, else the page whose title reads as this slug. */
export function postNamed(list: readonly PostPath[], slug: string): PostPath | undefined {
  return list.find((p) => p.slug === slug) ?? list.find((p) => p.name === slug);
}

/**
 * The WordPress page a menu entry links to, by the slug of its label. The Concerns menu (`prefer`
 * "concerns") looks for a concern first, also under the slug with "-concern" added, because a concern may
 * share its name with a procedure ("Melasma": /skin/melasma and /concerns/melasma-concern). Every other
 * menu looks for a procedure first.
 */
export function menuPost(slug: string, concerns: readonly PostPath[], procedures: readonly PostPath[], prefer: "concerns" | "procedures" = "procedures"): PostPath | undefined {
  const concern = () => concerns.find((p) => p.slug === slug) ?? concerns.find((p) => p.slug === `${slug}-concern`) ?? concerns.find((p) => p.name === slug);
  const procedure = () => postNamed(procedures, slug);
  return prefer === "concerns" ? (concern() ?? procedure()) : (procedure() ?? concern());
}
