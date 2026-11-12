import type { Metadata } from "next";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { FeaturedStory } from "@/components/blog/featured-story";
import { LatestStories } from "@/components/blog/latest-stories";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { BLOG_POSTS } from "@/config/blog";
import { FAQS } from "@/config/home";

export const metadata: Metadata = {
  title: "Blog, Skin Care Tips & Treatment Guides, NewDermaMed Toronto",
  description: "Skin care tips and treatment guides from NewDermaMed in Toronto: lasers, injectables, thread lifts, body contouring and vein care.",
};

/** The journal: the latest article, every other story with topic filters, the newsletter and the FAQ. */
export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;
  return (
    <main id="main" data-shell="inner" data-page="blog">
      <Breadcrumb items={["Blog"]} />
      <div id="top">
        <BlogHero />
      </div>
      <FeaturedStory post={featured} />
      <LatestStories posts={rest} />
      <BlogNewsletter />
      <Faq items={FAQS} eyebrow="FAQ" />
    </main>
  );
}
