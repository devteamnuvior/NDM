import { ArticleBody, ArticleHead, ReadProgress, RelatedStories } from "@/components/blog/article";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/ui/json-ld";
import { pageLink, pagePath } from "@/lib/routes";
import { absolute, breadcrumbList, publisher } from "@/lib/seo";
import type { ArticleView } from "@/types/blog";

/** A blog article: head with the photo, the text column with the takeaway card, then related articles. */
export function ArticlePage({ view }: { view: ArticleView }) {
  const p = view.story;
  const url = absolute(`/${p.slug}`);
  return (
    <>
      <JsonLd
        graph={[
          breadcrumbList([
            ["Blog", pagePath("blog")],
            [p.title, `/${p.slug}`],
          ]),
          {
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            mainEntityOfPage: url,
            url,
            headline: p.title,
            description: p.excerpt,
            ...(p.hero.src ? { image: p.hero.width && p.hero.height ? { "@type": "ImageObject", url: p.hero.src, width: p.hero.width, height: p.hero.height } : p.hero.src } : {}),
            ...(p.published ? { datePublished: p.published } : {}),
            ...(p.modified ? { dateModified: p.modified } : {}),
            ...(p.topic ? { articleSection: p.topic } : {}),
            ...(view.words ? { wordCount: view.words } : {}),
            ...(p.minutes ? { timeRequired: `PT${p.minutes}M` } : {}),
            inLanguage: "en-CA",
            /* the page's own byline: "By the NewDermaMed team" */
            author: { "@type": "Organization", name: "NewDermaMed" },
            publisher: publisher(),
          },
        ]}
      />
      <ReadProgress />
      <main id="main" data-shell="inner" data-page="article">
        <Breadcrumb items={[["Blog", pageLink("blog")], p.title]} />
        <article>
          <ArticleHead view={view} />
          <ArticleBody view={view} />
        </article>
        {view.related.length > 0 && <RelatedStories items={view.related} />}
      </main>
    </>
  );
}
