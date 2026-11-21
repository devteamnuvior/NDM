import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/blog/article-page";
import { getArticleSlugs, getArticleView } from "@/lib/blog";
import { articlePath } from "@/lib/post-paths";
import { absolute } from "@/lib/seo";
import type { ArticleView } from "@/types/blog";

/**
 * An article of the blog: an ordinary WordPress post that has text, at /blog/<its slug> (for example
 * /blog/what-causes-rosacea-redness). A post published later is shown without a new build.
 */
/* an address with no article behind it must answer "not found": the page waits for WordPress before it sends anything */
export const instant = false;

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

/** An article's tags for search engines and social cards: its own address, summary, dates and wide photo. */
function articleMetadata({ story: p }: ArticleView): Metadata {
  const url = absolute(articlePath(p.slug));
  const title = `${p.title}, NewDermaMed Blog`;
  const images = p.hero.src
    ? [
        {
          url: p.hero.src,
          ...(p.hero.width && p.hero.height ? { width: p.hero.width, height: p.hero.height } : {}),
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

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const article = await getArticleView((await params).slug);
  return article ? articleMetadata(article) : {};
}

export default async function BlogArticle({ params }: PageProps<"/blog/[slug]">) {
  const article = await getArticleView((await params).slug);
  if (!article) notFound();
  return <ArticlePage view={article} />;
}
