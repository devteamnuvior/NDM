import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AptosPage } from "@/components/treatment/aptos-page";
import { BUILT_IN_APTOS } from "@/config/aptos";
import { getAptosSlugs, getAptosView } from "@/lib/aptos";
import { getArticleView } from "@/lib/blog";
import { getConcernView } from "@/lib/concern";
import { articlePath, concernPath } from "@/lib/post-paths";
import { getProcedureView } from "@/lib/procedure";

/**
 * One-part addresses. The Aptos Thread Lift page (/aptos-thread-lift, a standard WordPress page with the
 * template "Aptos Thread Lift page") lives here. Pages made from a post type have their type's folder
 * (`@/lib/post-paths`): their old one-part address sends the visitor on, a procedure first
 * ("/botox" -> "/injectables/botox"), then a concern ("/wrinkles-fine-lines" ->
 * "/concerns/wrinkles-fine-lines"), then an article ("/what-causes-rosacea-redness" ->
 * "/blog/what-causes-rosacea-redness").
 */
/* an address with no page behind it must answer "not found": the page waits for WordPress before it sends anything */
export const instant = false;

export async function generateStaticParams() {
  const slugs = new Set([...Object.keys(BUILT_IN_APTOS), ...(await getAptosSlugs())]);
  return Array.from(slugs, (slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const view = await getAptosView((await params).slug);
  return view ? { title: view.title, description: view.description } : {};
}

/** Where a page that used to have this one-part address lives now, or null. */
async function movedTo(slug: string): Promise<string | null> {
  const procedure = await getProcedureView(slug);
  if (procedure) return procedure.path;
  if (await getConcernView(slug)) return concernPath(slug);
  if (await getArticleView(slug)) return articlePath(slug);
  return null;
}

export default async function OnePart({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const aptos = await getAptosView(slug);
  if (aptos) return <AptosPage view={aptos} />;
  const to = await movedTo(slug);
  if (!to) notFound();
  redirect(to);
}

