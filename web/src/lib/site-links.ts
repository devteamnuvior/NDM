import "server-only";
import { APTOS_SLUG } from "@/config/aptos";
import { linkPlaceholders, type PostLists } from "@/lib/post-links";
import { concernPath, procedurePath } from "@/lib/post-paths";
import { getConcernList, getProcedureList, settle } from "@/lib/wordpress";

/**
 * The pages published in WordPress that a link can open: every concern, every procedure and the Aptos
 * page (a standard page at its own address). Empty lists when WordPress cannot be reached: a placeholder
 * then opens the list of procedures or of concerns.
 */
export async function getPostLists(): Promise<PostLists> {
  const [concerns, procedures] = await Promise.all([settle(getConcernList), settle(getProcedureList)]);
  return {
    concerns: concerns.ok ? concerns.data.map((c) => ({ slug: c.slug, path: concernPath(c.slug) })) : [],
    procedures: [...(procedures.ok ? procedures.data.map((p) => ({ slug: p.slug, path: procedurePath(p.type, p.slug) })) : []), { slug: APTOS_SLUG, path: `/${APTOS_SLUG}` }],
  };
}

/** A page's content with every "#/slug" placeholder given its real address (see `lib/post-links.ts`). */
export async function withRealLinks<T>(content: T): Promise<T> {
  return linkPlaceholders(content, await getPostLists());
}
