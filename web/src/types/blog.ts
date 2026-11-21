/** A photo of WordPress's media library with its smaller copies. */
export interface WPBlogImage {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** "url 1440w, url 768w, ..."; empty when the photo has no smaller copies. */
  srcset: string;
}

/** A post as `ndm/v1/blog` lists it: everything but its text. */
export interface WPBlogCard {
  id: number;
  slug: string;
  title: string;
  /** "November 26, 2025" */
  date: string;
  /** ISO 8601 with the zone. */
  published: string;
  modified: string;
  /** First category; empty when it has none. */
  topic: string;
  /** Reading time: typed in WordPress, else worked out from the text; 0 when unknown. */
  minutes: number;
  /** The card's photo: the tall "Card photo", else the featured image. */
  image: WPBlogImage | null;
  /** The wide photo at the top of the article: the featured image, else the card photo. */
  hero: WPBlogImage | null;
  excerpt: string;
  /** The post has text, so it has its own page on this site. */
  page: boolean;
  /** For a post without text: where its card opens. */
  external: string;
}

/** One post as `ndm/v1/blog/<slug>` gives it. */
export interface WPBlogPost extends WPBlogCard {
  /** The two lines of the article's heading; both empty when not typed. */
  heading: [string, string];
  takeaway: string;
  /** The text as HTML (blocks rendered by WordPress). */
  content: string;
}

export interface WPBlogList {
  posts: WPBlogCard[];
}

/** A photo as the blog's sections show it. */
export interface BlogPhoto {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  alt: string;
}

/** A story of the blog as its card shows it. */
export interface Story {
  /** The post's slug, without slashes. */
  slug: string;
  title: string;
  /** Where the card opens: the article's page here, else the address typed for it, else a `#/slug` placeholder. */
  href: string;
  /** Opens in a new tab (the article is not on this site). */
  external: boolean;
  /** "November 26, 2025" */
  date: string;
  /** ISO 8601. */
  published: string;
  modified: string;
  /** Reading time; 0 when unknown (the line is then left out). */
  minutes: number;
  topic: string;
  photo: BlogPhoto;
  /** The wide photo (article header, social cards). */
  hero: BlogPhoto;
  excerpt: string;
}

/** One piece of an article's text, top to bottom. `html` is inline HTML written by the clinic's WordPress editors, scrubbed. */
export type ArticleBlock =
  | { tag: "h2" | "h3" | "h4" | "p" | "ul" | "ol" | "blockquote" | "div"; html: string }
  | { tag: "img"; photo: BlogPhoto; sizes?: string; caption?: string }
  | { tag: "hr" };

/** An article ready to show. */
export interface ArticleView {
  story: Story;
  /** The heading's two lines. */
  lead: string;
  strong: string;
  /** The opening paragraph (inline HTML). */
  intro: string;
  blocks: ArticleBlock[];
  takeaway: string;
  related: Story[];
  /** Words in the text, for search engines. */
  words: number;
}
