import type { Metadata } from "next";
import { ArticleBody, ArticleHead, ReadProgress, RelatedStories } from "@/components/blog/article";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ROSACEA_ARTICLE } from "@/config/article-rosacea";
import { BLOG_POSTS } from "@/config/blog";
import { pageLink } from "@/lib/routes";

export const metadata: Metadata = {
  title: "What Causes Rosacea Redness, NewDermaMed Blog",
  description: "What causes rosacea redness, the everyday triggers that can make it flare, and how NewDermaMed in Toronto approaches care for calmer skin.",
};

const POST = BLOG_POSTS.find((p) => p.slug === ROSACEA_ARTICLE.slug)!;
const RELATED = BLOG_POSTS.filter((p) => p !== POST && p.topic === POST.topic).slice(0, 3);

/** A blog article: head with the photo, the text column with the takeaway card, then related articles. */
export default function ArticlePage() {
  return (
    <>
      <ReadProgress />
      <main id="main" data-shell="inner" data-page="article">
        <Breadcrumb items={[["Blog", pageLink("blog")], POST.title]} />
        <article>
          <ArticleHead post={POST} article={ROSACEA_ARTICLE} />
          <ArticleBody article={ROSACEA_ARTICLE} />
        </article>
        <RelatedStories items={RELATED} />
      </main>
    </>
  );
}
