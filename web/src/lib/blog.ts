import "server-only";
import { ROSACEA_ARTICLE } from "@/config/article-rosacea";
import { BLOG_POSTS, BLOG_TOPICS, type BlogPost } from "@/config/blog";
import { articleBlocks, wordCount } from "@/lib/article-html";
import { getBlogList, getBlogPost, settle } from "@/lib/wordpress";
import type { ArticleBlock, ArticleView, BlogPhoto, Story, WPBlogCard, WPBlogImage } from "@/types/blog";

/**
 * The blog as its pages show it. The stories are WordPress's posts (see "Blog" in cms/README.md); the
 * list in src/config/blog.ts and the one article in src/config/article-rosacea.ts are only what is
 * shown while WordPress cannot be reached (and what was imported into WordPress once).
 */
export interface Blog {
  stories: Story[];
  /** The filter chips: "All", then the topics that have stories. */
  topics: string[];
}

const NO_PHOTO: BlogPhoto = { src: "", alt: "" };
const photo = (image: WPBlogImage | null): BlogPhoto => (image ? { src: image.src, srcSet: image.srcset || undefined, width: image.width, height: image.height, alt: image.alt } : NO_PHOTO);

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function fromWordPress(p: WPBlogCard): Story {
  return {
    slug: p.slug,
    title: p.title,
    href: p.page ? `/${p.slug}` : p.external || `#/${p.slug}`,
    external: !p.page && !!p.external,
    date: p.date,
    published: p.published,
    modified: p.modified,
    minutes: p.minutes,
    topic: p.topic,
    photo: photo(p.image),
    hero: photo(p.hero),
    excerpt: p.excerpt,
  };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "November 26, 2025" -> "2025-11-26T09:00:00+00:00" (the hour the import gives every post). */
function isoOf(date: string): string {
  const m = /^(\w+) (\d+), (\d{4})$/.exec(date);
  const month = m ? MONTHS.indexOf(m[1]) + 1 : 0;
  return m && month ? `${m[3]}-${String(month).padStart(2, "0")}-${m[2].padStart(2, "0")}T09:00:00+00:00` : "";
}

function fromBuiltIn(p: BlogPost): Story {
  const slug = p.slug.replace(/^\/+|\/+$/g, "");
  const own = p.slug === ROSACEA_ARTICLE.slug;
  const card: BlogPhoto = { src: p.img, alt: "" };
  return {
    slug,
    title: p.title,
    href: own ? `/${slug}` : p.url,
    external: !own,
    date: p.date,
    published: isoOf(p.date),
    modified: isoOf(p.date),
    minutes: p.minutes,
    topic: p.topic,
    photo: card,
    hero: own ? { src: ROSACEA_ARTICLE.hero, alt: "" } : card,
    excerpt: p.excerpt,
  };
}

/** "All", the known topics in their designed order, then any topic added in WordPress, by name. */
function topicsOf(stories: Story[]): string[] {
  const used = new Set(stories.map((s) => s.topic).filter(Boolean));
  const known = BLOG_TOPICS.filter((t) => t === "All" || used.has(t));
  const added = [...used].filter((t) => !BLOG_TOPICS.includes(t)).sort((a, b) => a.localeCompare(b));
  return [...known, ...added];
}

/** Every story, newest first, with the filter topics. */
export async function getBlog(): Promise<Blog> {
  const read = await settle(getBlogList);
  const stories = read.ok ? read.data.posts.map(fromWordPress) : BLOG_POSTS.map(fromBuiltIn);
  return { stories, topics: topicsOf(stories) };
}

/** The addresses of the articles that have a page on this site (the built-in one when WordPress cannot be reached). */
export async function getArticleSlugs(): Promise<string[]> {
  const { stories } = await getBlog();
  return stories.filter((s) => !s.external && s.href.startsWith("/")).map((s) => s.slug);
}

/** A title in two lines: broken after its first half, as the designed headings are. */
function twoLines(title: string): [string, string] {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 2) return ["", title];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

function builtInBlocks(): ArticleBlock[] {
  return ROSACEA_ARTICLE.body.map((b): ArticleBlock => {
    if (b.type === "ul") return { tag: "ul", html: b.items.map((li) => `<li>${escape(li)}</li>`).join("") };
    if (b.type === "img") return { tag: "img", photo: { src: b.src, alt: b.alt } };
    return { tag: b.type, html: escape(b.text) };
  });
}

/**
 * The article at this address, or null when there is none. Read from WordPress; when WordPress cannot
 * be reached the one built-in article is still shown.
 */
export async function getArticleView(slug: string): Promise<ArticleView | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const read = await settle(() => getBlogPost(slug));
  if (read.ok && !read.data) return null;

  const { stories } = await getBlog();
  const related = (story: Story) => stories.filter((s) => s.slug !== story.slug && s.topic === story.topic).slice(0, 3);

  if (read.ok && read.data) {
    const wp = read.data;
    const story = fromWordPress(wp);
    const all = articleBlocks(wp.content);
    /* the opening paragraph is set large, above a line; the rest follows */
    const first = all[0]?.tag === "p" ? all[0] : null;
    const blocks = first ? all.slice(1) : all;
    const [lead, strong] = wp.heading[0] || wp.heading[1] ? wp.heading : twoLines(wp.title);
    return { story, lead, strong, intro: first ? first.html : escape(wp.excerpt), blocks, takeaway: wp.takeaway || wp.excerpt, related: related(story), words: wordCount(all) };
  }

  const own = BLOG_POSTS.find((p) => p.slug === ROSACEA_ARTICLE.slug);
  if (!own || slug !== ROSACEA_ARTICLE.slug.replace(/^\/+|\/+$/g, "")) return null;
  const story = fromBuiltIn(own);
  const blocks = builtInBlocks();
  return {
    story,
    lead: ROSACEA_ARTICLE.lead[0],
    strong: ROSACEA_ARTICLE.lead[1],
    intro: escape(ROSACEA_ARTICLE.intro),
    blocks,
    takeaway: ROSACEA_ARTICLE.takeaway,
    related: related(story),
    words: wordCount(blocks) + ROSACEA_ARTICLE.intro.split(/\s+/).length,
  };
}
