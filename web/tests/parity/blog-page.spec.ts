import { pageParity } from "./page";

/* Blog: header, the latest article, the stories (filtered by a topic, and with more loaded), newsletter, FAQ. */
const by = (id: string) => `section[aria-labelledby="${id}"]`;

pageParity({
  name: "blog",
  paths: { legacy: "/blog.html", next: "/blog" },
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
