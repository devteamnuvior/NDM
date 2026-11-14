/**
 * The address of a page made from a WordPress post: the post type's own folder, then the post's slug.
 *
 *   Concerns             /concerns/<slug>
 *   Procedures           /procedures/<slug>
 *   Injectables          /injectables/<slug>     (Botox: /injectables/botox)
 *   Laser                /laser/<slug>
 *   Body                 /body/<slug>
 *   Veins                /veins/<slug>
 *   Hair                 /hair/<slug>
 *   blog posts           /blog/<slug>
 *
 * The Aptos Thread Lift page is a standard WordPress page, not a post type, and keeps /aptos-thread-lift.
 * The same folders are written in the mu-plugin (`ndm_headless_site_path()`, includes/config.php), which
 * shows each post's address in wp-admin. An old one-part address ("/botox") redirects to the new one.
 */

/** The folder of each procedure post type, by the name WordPress gives the type ("Injectables"). */
export const PROCEDURE_FOLDERS = {
  Procedures: "procedures",
  Injectables: "injectables",
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

export const procedurePath = (type: string | undefined, slug: string): string => `/${procedureFolder(type)}/${slug}`;
export const concernPath = (slug: string): string => `/${CONCERN_FOLDER}/${slug}`;
export const articlePath = (slug: string): string => `/${BLOG_FOLDER}/${slug}`;
