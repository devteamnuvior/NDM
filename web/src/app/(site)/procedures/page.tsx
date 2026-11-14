import type { Metadata } from "next";
import { PostIndex, type PostIndexGroup } from "@/components/index/post-index";
import { APTOS_SLUG } from "@/config/aptos";
import { PROCEDURE_FOLDERS, procedureFolder, procedurePath } from "@/lib/post-paths";
import { getProcedureList, settle } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "All Procedures, NewDermaMed Toronto",
  description: "Every treatment at NewDermaMed, Toronto's cosmetic and laser clinic, by category. Each one begins with a free consultation at our Uptown or Downtown clinic.",
};

/** The order of the groups, and what the list of the post type "Procedures" itself is called. */
const GROUPS: [folder: string, title: string][] = [...Object.entries(PROCEDURE_FOLDERS).filter(([, folder]) => folder !== "procedures").map(([name, folder]): [string, string] => [folder, name]), ["procedures", "More procedures"]];

/**
 * Every procedure page WordPress holds, by its list (Injectables, Skin, Laser, Body, Veins, Hair), each
 * under its own #section ("/procedures#skin", where a breadcrumb's category leads). The Aptos Thread
 * Lift page is a standard page, listed on its own.
 */
export default async function ProceduresIndex() {
  const read = await settle(getProcedureList);
  const list = read.ok ? read.data : [];
  const groups: PostIndexGroup[] = GROUPS.map(([folder, title]) => ({
    id: folder,
    title,
    items: list.filter((p) => procedureFolder(p.type) === folder).map((p) => ({ title: p.title, path: procedurePath(p.type, p.slug) })).sort((a, b) => a.title.localeCompare(b.title)),
  }));
  groups.splice(1, 0, { id: "thread-lift", title: "Thread lift", items: [{ title: "Aptos Thread Lift", path: `/${APTOS_SLUG}` }] });
  return (
    <PostIndex
      crumb="Procedures"
      tag="Procedures"
      lead="Every treatment,"
      strong="by category"
      intro="All treatments offered at NewDermaMed, in Uptown and Downtown Toronto. Open one to read about it, or book a free consultation and we will help you choose."
      noun="treatment"
      groups={groups}
      empty="The list of treatments is not available right now. Please try again in a moment."
    />
  );
}
