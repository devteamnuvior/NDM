import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ConcernPage } from "@/components/concern/concern-page";
import { BUILT_IN_CONCERNS } from "@/config/concern";
import { getConcernPaths, getConcernView } from "@/lib/concern";
import { concernPath } from "@/lib/post-paths";

/**
 * A concern page: a post of the WordPress post type "Concerns", at /concerns/<its slug> (for example
 * /concerns/wrinkles-fine-lines). A concern with a parent page has its parents' slugs before its own
 * (/concerns/<parent>/<slug>): the last part of the address is the post's slug, by which the page is
 * found, and a concern asked for without its parents is sent to its own address. A concern published
 * later is shown without a new build.
 */
/* an address with no concern behind it must answer "not found": the page waits for WordPress before it sends anything */
export const instant = false;

export async function generateStaticParams() {
  const paths = new Set([...Object.keys(BUILT_IN_CONCERNS).map((slug) => concernPath(slug)), ...(await getConcernPaths()).map((p) => p.path)]);
  return Array.from(paths, (path) => ({ slug: path.split("/").slice(2) }));
}

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description */
export async function generateMetadata({ params }: PageProps<"/concerns/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const view = await getConcernView(slug[slug.length - 1]);
  return view ? { title: view.title, description: view.description } : { title: "Page not found | NewDermaMed", robots: { index: false } }; /* no page: the 404's own title */
}

export default async function Concern({ params }: PageProps<"/concerns/[...slug]">) {
  const { slug } = await params;
  const view = await getConcernView(slug[slug.length - 1]);
  if (!view) notFound();
  if (view.path !== concernPath(slug[slug.length - 1], slug.slice(0, -1).map((s) => ({ slug: s })))) redirect(view.path);
  return <ConcernPage view={view} />;
}
