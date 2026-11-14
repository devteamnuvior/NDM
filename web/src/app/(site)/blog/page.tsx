import type { Metadata } from "next";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { FeaturedStory } from "@/components/blog/featured-story";
import { LatestStories } from "@/components/blog/latest-stories";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { JsonLd } from "@/components/ui/json-ld";
import { FAQS } from "@/config/home";
import { getBlog } from "@/lib/blog";
import { pagePath } from "@/lib/routes";
import { absolute, breadcrumbList, publisher } from "@/lib/seo";

const TITLE = "Blog, Skin Care Tips & Treatment Guides, NewDermaMed Toronto";
const DESCRIPTION = "Skin care tips and treatment guides from NewDermaMed in Toronto: lasers, injectables, thread lifts, body contouring and vein care.";

export async function generateMetadata(): Promise<Metadata> {
  const url = absolute(pagePath("blog"));
  /* the social card shows the latest article's wide photo */
  const hero = (await getBlog()).stories[0]?.hero;
  const images = hero?.src ? [{ url: hero.src, ...(hero.width && hero.height ? { width: hero.width, height: hero.height } : {}), alt: "The NewDermaMed blog" }] : undefined;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "NewDermaMed", locale: "en_CA", title: TITLE, description: DESCRIPTION, images },
    twitter: { card: images ? "summary_large_image" : "summary", title: TITLE, description: DESCRIPTION, images: images?.map((i) => i.url) },
  };
}

/** The journal: the latest article, every other story with topic filters, the newsletter and the FAQ. The stories are WordPress's posts. */
export default async function BlogPage() {
  const { stories, topics } = await getBlog();
  const [featured, ...rest] = stories;
  const url = absolute(pagePath("blog"));
  return (
    <main id="main" data-shell="inner" data-page="blog">
      <JsonLd
        graph={[
          breadcrumbList([["Blog", pagePath("blog")]]),
          {
            "@type": "Blog",
            "@id": `${url}#blog`,
            url,
            name: "The NewDermaMed Journal",
            description: DESCRIPTION,
            inLanguage: "en-CA",
            publisher: publisher(),
            blogPost: stories.map((s) => ({
              "@type": "BlogPosting",
              headline: s.title,
              /* the article's page here, or where it can be read for now */
              ...(s.href.startsWith("#") ? {} : { url: absolute(s.href) }),
              ...(s.hero.src ? { image: s.hero.src } : {}),
              ...(s.published ? { datePublished: s.published } : {}),
            })),
          },
          /* the questions and answers shown at the end of the page */
          { "@type": "FAQPage", mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
        ]}
      />
      <Breadcrumb items={["Blog"]} />
      <div id="top">
        <BlogHero />
      </div>
      {featured && <FeaturedStory post={featured} />}
      <LatestStories posts={rest} topics={topics} />
      <BlogNewsletter />
      <Faq items={FAQS} eyebrow="FAQ" />
    </main>
  );
}
