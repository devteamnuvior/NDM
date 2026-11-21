import "server-only";
import { APTOS_SLUG } from "@/config/aptos";
import { linkPlaceholders, type PostLists } from "@/lib/post-links";
import { concernPath, postPath, procedurePath } from "@/lib/post-paths";
import { toSlug } from "@/lib/routes";
import { getConcernList, getProcedureList, settle } from "@/lib/wordpress";

/**
 * The pages published in WordPress that a link can open: every concern, every procedure and the Aptos
 * page (a standard page at its own address). Empty lists when WordPress cannot be reached: a placeholder
 * then opens the list of procedures or of concerns.
 */
export async function getPostLists(): Promise<PostLists> {
  const [concerns, procedures] = await Promise.all([settle(getConcernList), settle(getProcedureList)]);
  return {
    concerns: concerns.ok ? concerns.data.map((c) => postPath(c.slug, concernPath(c.slug, c.parents), toSlug(c.title))) : [],
    procedures: [...(procedures.ok ? procedures.data.map((p) => postPath(p.slug, procedurePath(p.type, p.slug, p.parents), toSlug(p.title))) : []), { slug: APTOS_SLUG, path: `/${APTOS_SLUG}` }],
  };
}

/** A page's content with every "#/slug" placeholder given its real address (see `lib/post-links.ts`). */
export async function withRealLinks<T>(content: T): Promise<T> {
  return linkPlaceholders(content, await getPostLists());
}
