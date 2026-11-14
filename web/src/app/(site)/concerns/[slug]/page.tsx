import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConcernPage } from "@/components/concern/concern-page";
import { BUILT_IN_CONCERNS } from "@/config/concern";
import { getConcernSlugs, getConcernView } from "@/lib/concern";

/**
 * A concern page: a post of the WordPress post type "Concerns", at /concerns/<its slug> (for example
 * /concerns/wrinkles-fine-lines). A concern published later is shown without a new build.
 */
/* an address with no concern behind it must answer "not found": the page waits for WordPress before it sends anything */
export const instant = false;

export async function generateStaticParams() {
  const slugs = new Set([...Object.keys(BUILT_IN_CONCERNS), ...(await getConcernSlugs())]);
  return Array.from(slugs, (slug) => ({ slug }));
}

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description */
export async function generateMetadata({ params }: PageProps<"/concerns/[slug]">): Promise<Metadata> {
  const view = await getConcernView((await params).slug);
  return view ? { title: view.title, description: view.description } : {};
}

export default async function Concern({ params }: PageProps<"/concerns/[slug]">) {
  const view = await getConcernView((await params).slug);
  if (!view) notFound();
  return <ConcernPage view={view} />;
}
