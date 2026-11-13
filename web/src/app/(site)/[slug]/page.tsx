import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConcernPage } from "@/components/concern/concern-page";
import { ProcedurePage } from "@/components/treatment/procedure-page";
import { BUILT_IN_CONCERNS } from "@/config/concern";
import { BUILT_IN_PROCEDURES } from "@/config/procedure";
import { getConcernSlugs, getConcernView } from "@/lib/concern";
import { getProcedureSlugs, getProcedureView } from "@/lib/procedure";

/**
 * The pages whose address is the slug of a WordPress post: a procedure (the post type "Procedures",
 * for example /botox, in the Botox page's design) or a concern (the post type "Concerns", for example
 * /wrinkles-fine-lines). A post published later is shown without a new build; WordPress tells the site
 * when one changes. A procedure comes first when both have the same slug.
 */
/*
 * The address decides which page is shown, and an address with no post behind it must answer "not
 * found": the page waits for WordPress before it sends anything, instead of sending an empty shell first.
 * (Without this, Next.js reports "URL data during prerendering" for reading `params` outside Suspense.)
 */
export const instant = false;

export async function generateStaticParams() {
  const slugs = new Set([...Object.keys(BUILT_IN_PROCEDURES), ...Object.keys(BUILT_IN_CONCERNS), ...(await getProcedureSlugs()), ...(await getConcernSlugs())]);
  return Array.from(slugs, (slug) => ({ slug }));
}

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description are kept. */
export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const view = (await getProcedureView(slug)) ?? (await getConcernView(slug));
  return view ? { title: view.title, description: view.description } : {};
}

export default async function PostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const procedure = await getProcedureView(slug);
  if (procedure) return <ProcedurePage view={procedure} />;
  const concern = await getConcernView(slug);
  if (!concern) notFound();
  return <ConcernPage view={concern} />;
}
