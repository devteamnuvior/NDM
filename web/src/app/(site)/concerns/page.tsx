import type { Metadata } from "next";
import { PostIndex } from "@/components/index/post-index";
import { concernPath } from "@/lib/post-paths";
import { getConcernList, settle } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "All Concerns, NewDermaMed Toronto",
  description: "Skin, face, body and hair concerns treated at NewDermaMed, Toronto's cosmetic and laser clinic. Each plan begins with a free consultation at our Uptown or Downtown clinic.",
};

/** Every concern page WordPress holds, by name: where "See all concerns" and the footer's Concerns link lead. */
export default async function ConcernsIndex() {
  const read = await settle(getConcernList);
  const items = (read.ok ? read.data : []).map((c) => ({ title: c.title, path: concernPath(c.slug, c.parents) })).sort((a, b) => a.title.localeCompare(b.title));
  return (
    <PostIndex
      crumb="Concerns"
      tag="Concerns"
      lead="Start from"
      strong="your concern"
      intro="Choose what you would like to improve. Each page explains the concern and the options that may help; your provider confirms a plan at your free consultation."
      noun="concern"
      groups={[{ id: "all", title: "All concerns", items }]}
      empty="The list of concerns is not available right now. Please try again in a moment."
    />
  );
}
