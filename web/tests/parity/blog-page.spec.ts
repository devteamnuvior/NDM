import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pageParity } from "./page";

/* Blog: header, the latest article, the stories (filtered by a topic, and with more loaded), newsletter, FAQ. */
const by = (id: string) => `section[aria-labelledby="${id}"]`;

/*
 * One post has one summary now (its excerpt in WordPress). Three posts were on two prototype pages with
 * two different summaries: a short one on the blog, the clinic's own opening lines on the Wrinkles page
 * ("From the journal"). WordPress holds the second (the concern import made those posts first), so the
 * prototype's blog is given the same three summaries before it is compared.
 */
const text = (path: string) => readFileSync(join(__dirname, path), "utf8");
const field = (source: string, title: string, key: string): string => {
  const from = source.indexOf(`"title": ${JSON.stringify(title)}`);
  const m = from < 0 ? null : new RegExp(`"${key}": ("(?:[^"\\\\]|\\\\.)*")`).exec(source.slice(from));
  return m ? (JSON.parse(m[1]) as string) : "";
};
const SHARED = ["Chemical Peel Treatment Toronto", "Juvederm at NewDermaMed Toronto", "How to Prepare for Dermal Fillers"];
const sameSummaries = (html: string): string => {
  const blog = text("../../src/config/blog.ts");
  const wrinkles = text("../../src/config/wrinkles.ts");
  return SHARED.reduce((out, title) => {
    const [short, long] = [field(blog, title, "excerpt"), field(wrinkles, title, "excerpt")];
    return short && long ? out.replace(`'${short}'`, JSON.stringify(long)) : out;
  }, html);
};

pageParity({
  name: "blog",
  paths: { legacy: "/blog.html", next: "/blog", legacyHtml: sameSummaries },
  sectionCount: 4,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "hero", selector: by("blog-title") },
    { name: "featured", selector: by("featured-title"), pixelRatio: 0.004 },
    { name: "stories", selector: "#stories", pixelRatio: 0.004 },
    {
      name: "stories-veins",
      selector: "#stories",
      pixelRatio: 0.004,
      prepare: async (p) => {
        await p.locator("#stories").getByRole("button", { name: /^Veins/ }).click();
        await p.waitForTimeout(400);
      },
    },
    {
      name: "stories-more",
      selector: "#stories",
      pixelRatio: 0.004,
      prepare: async (p) => {
        await p.locator("#stories").getByRole("button", { name: /^All/ }).click();
        await p.locator("#stories").getByRole("button", { name: "Load more stories" }).click();
        await p.waitForTimeout(400);
      },
    },
    { name: "newsletter", selector: by("news-title") },
    {
      name: "newsletter-sent",
      selector: by("news-title"),
      prepare: async (p) => {
        await p.locator(by("news-title")).getByPlaceholder("Your email address").fill("test@example.com");
        await p.locator(by("news-title")).getByRole("button", { name: "Subscribe" }).click();
      },
    },
    { name: "faq", selector: by("faq") },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
