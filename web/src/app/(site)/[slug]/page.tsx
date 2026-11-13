import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AptosPage } from "@/components/treatment/aptos-page";
import { ArticlePage } from "@/components/blog/article-page";
import { ConcernPage } from "@/components/concern/concern-page";
import { ProcedurePage } from "@/components/treatment/procedure-page";
import { BUILT_IN_APTOS } from "@/config/aptos";
import { BUILT_IN_CONCERNS } from "@/config/concern";
import { BUILT_IN_PROCEDURES } from "@/config/procedure";
import { getAptosSlugs, getAptosView } from "@/lib/aptos";
import { getArticleSlugs, getArticleView } from "@/lib/blog";
import { getConcernSlugs, getConcernView } from "@/lib/concern";
import { getProcedureSlugs, getProcedureView } from "@/lib/procedure";
import { absolute } from "@/lib/seo";
import type { ArticleView } from "@/types/blog";

/**
 * The pages whose address is the slug of a WordPress post: a procedure (the post type "Procedures",
 * for example /botox, in the Botox page's design), a page of the Aptos design (the post type "Aptos
 * Pages", for example /aptos-thread-lift) or a concern (the post type "Concerns", for example
 * /wrinkles-fine-lines), or an article of the blog (an ordinary post that has text, for example
 * /what-causes-rosacea-redness). A post published later is shown without a new build; WordPress tells
 * the site when one changes. When two have the same slug a procedure comes first, then a page of the Aptos design, then a concern.
 */
/*
 * The address decides which page is shown, and an address with no post behind it must answer "not
 * found": the page waits for WordPress before it sends anything, instead of sending an empty shell first.
 * (Without this, Next.js reports "URL data during prerendering" for reading `params` outside Suspense.)
 */
export const instant = false;

export async function generateStaticParams() {
  const slugs = new Set([...Object.keys(BUILT_IN_PROCEDURES), ...Object.keys(BUILT_IN_APTOS), ...Object.keys(BUILT_IN_CONCERNS), ...(await getProcedureSlugs()), ...(await getAptosSlugs()), ...(await getConcernSlugs()), ...(await getArticleSlugs())]);
  return Array.from(slugs, (slug) => ({ slug }));
}

/** An article's tags for search engines and social cards: its own address, summary, dates and wide photo. */
function articleMetadata({ story: p }: ArticleView): Metadata {
  const url = absolute(`/${p.slug}`);
  const title = `${p.title}, NewDermaMed Blog`;
  const images = p.hero.src
    ? [
        {
          url: p.hero.src,
          ...(p.hero.width && p.hero.height
            ? { width: p.hero.width, height: p.hero.height }
            : {}),
          alt: p.hero.alt || p.title,
        },
      ]
    : undefined;
  return {
    title,
    description: p.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "NewDermaMed",
      locale: "en_CA",
      title: p.title,
      description: p.excerpt,
      images,
      ...(p.published ? { publishedTime: p.published } : {}),
      ...(p.modified ? { modifiedTime: p.modified } : {}),
      ...(p.topic ? { section: p.topic } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: p.title,
      description: p.excerpt,
      images: images?.map((i) => i.url),
    },
  };
}

/* Procedures and concerns: SEO (structured data, canonical and social tags) is out of scope for now, only the title and description are kept. */
export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const view = (await getProcedureView(slug)) ?? (await getAptosView(slug)) ?? (await getConcernView(slug));
  if (view) return { title: view.title, description: view.description };
  const article = await getArticleView(slug);
  return article ? articleMetadata(article) : {};
}

export default async function PostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const procedure = await getProcedureView(slug);
  if (procedure) return <ProcedurePage view={procedure} />;
  const aptos = await getAptosView(slug);
  if (aptos) return <AptosPage view={aptos} />;
  const concern = await getConcernView(slug);
  if (concern) return <ConcernPage view={concern} />;
  const article = await getArticleView(slug);
  if (!article) notFound();
  return <ArticlePage view={article} />;
}
