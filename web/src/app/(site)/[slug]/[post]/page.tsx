import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProcedurePage } from "@/components/treatment/procedure-page";
import { BUILT_IN_PROCEDURES } from "@/config/procedure";
import { isProcedureFolder, procedurePath } from "@/lib/post-paths";
import { getProcedurePaths, getProcedureView } from "@/lib/procedure";

/**
 * A procedure page, in the Botox page's design: a post of one of the procedure post types, at its type's
 * folder and its slug (/procedures/<slug>, /injectables/<slug>, /laser/<slug>, /body/<slug>,
 * /veins/<slug>, /hair/<slug>; for example /injectables/botox). `slug` here is the folder, `post` the
 * post's slug. A procedure asked for under another type's folder (it was moved to another list in
 * WordPress) is sent to its own address.
 */
/* an address with no procedure behind it must answer "not found": the page waits for WordPress before it sends anything */
export const instant = false;

export async function generateStaticParams() {
  const builtIn = Object.entries(BUILT_IN_PROCEDURES).map(([slug, p]) => procedurePath(p.type, slug));
  const paths = new Set([...builtIn, ...(await getProcedurePaths()).map((p) => p.path)]);
  return Array.from(paths, (path) => {
    const [, folder, post] = path.split("/");
    return { slug: folder, post };
  });
}

async function viewAt(folder: string, post: string) {
  return isProcedureFolder(folder) ? getProcedureView(post) : null;
}

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description */
export async function generateMetadata({ params }: PageProps<"/[slug]/[post]">): Promise<Metadata> {
  const { slug, post } = await params;
  const view = await viewAt(slug, post);
  return view ? { title: view.title, description: view.description } : {};
}

export default async function Procedure({ params }: PageProps<"/[slug]/[post]">) {
  const { slug, post } = await params;
  const view = await viewAt(slug, post);
  if (!view) notFound();
  if (view.path !== `/${slug}/${post}`) redirect(view.path);
  return <ProcedurePage view={view} />;
}
