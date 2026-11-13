import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Blog page and blog article on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("blog: the old address redirects; no errors; the header marks About; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/blog.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/blog`);
  await expect(page).toHaveTitle("Blog, Skin Care Tips & Treatment Guides, NewDermaMed Toronto");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(/Skin care tips and\s+honest treatment guides\./);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Blog");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("blog: the latest article opens its page here; other posts open the clinic's blog in a new tab", async ({ page }) => {
  await page.goto(`${NEXT_URL}/blog`);
  const featured = page.locator('section[aria-labelledby="featured-title"]');
  await expect(featured.locator("h2")).toHaveText("What Causes Rosacea Redness");
  const read = featured.getByRole("link", { name: "Read article" });
  await expect(read).toHaveAttribute("href", "/what-causes-rosacea-redness");
  await expect(read).not.toHaveAttribute("target", "_blank");
  const first = page.locator("#stories li").first();
  const link = first.getByRole("link", { name: /Read article/ });
  await expect(link).toHaveAttribute("href", "https://newdermamedlaserclinic.com/your-complete-guide-to-laser-hair-removal/");
  await expect(link).toHaveAttribute("target", "_blank");
  await read.click();
  await expect(page).toHaveURL(`${NEXT_URL}/what-causes-rosacea-redness`);
});

test("blog: topic filters show their counts and narrow the list; Load more adds nine", async ({ page }) => {
  await page.goto(`${NEXT_URL}/blog`);
  const stories = page.locator("#stories");
  const cards = stories.locator("li.story-card");
  await expect(cards).toHaveCount(9);
  await expect(stories).toContainText("Showing 9 of 33 stories");
  await stories.getByRole("button", { name: "Load more stories" }).click();
  await expect(cards).toHaveCount(18);
  const veins = stories.getByRole("button", { name: /^Veins/ });
  await expect(veins).toHaveText("Veins8");
  await veins.click();
  await expect(veins).toHaveAttribute("aria-pressed", "true");
  await expect(cards).toHaveCount(8);
  await expect(stories.getByRole("button", { name: "Load more stories" })).toHaveCount(0);
  for (const t of await cards.locator(".promo-tag").allInnerTexts()) expect(t.toLowerCase()).toBe("veins");
  await stories.getByRole("button", { name: /^Guides/ }).click();
  await expect(cards).toHaveCount(2);
});

test("blog: the newsletter form thanks; nothing is sent anywhere", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") posts.push(r.url());
  });
  await page.goto(`${NEXT_URL}/blog`);
  const news = page.locator('section[aria-labelledby="news-title"]');
  await news.getByPlaceholder("Your email address").fill("test@example.com");
  await news.getByRole("button", { name: "Subscribe" }).click();
  await expect(news.getByRole("status")).toHaveText("Thank you, you are on the list.");
  expect(posts).toEqual([]);
});

test("article: redirect, title, breadcrumb back to the blog, reading progress, related articles", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/what-causes-rosacea-redness.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/what-causes-rosacea-redness`);
  await expect(page).toHaveTitle("What Causes Rosacea Redness, NewDermaMed Blog");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
  await expect(page.locator("#article-body h2")).toHaveCount(7);
  await expect(page.locator("#article-body")).toContainText("Individual results may vary.");
  const bar = page.locator("div.fixed.h-\\[2px\\] > div");
  expect(await bar.evaluate((el: HTMLElement) => el.style.transform)).toBe("scaleX(0)");
  await page.locator("#takeaway").scrollIntoViewIfNeeded();
  await expect.poll(() => bar.evaluate((el: HTMLElement) => Number(/scaleX\((.+)\)/.exec(el.style.transform)?.[1]))).toBeGreaterThan(0.8);
  const related = page.locator('section[aria-labelledby="related-title"]');
  await expect(related.locator("li.story-card")).toHaveCount(3);
  await expect(related.getByRole("link", { name: "Explore all articles" })).toHaveAttribute("href", "/blog");
  expect(errors).toEqual([]);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("blog and article: no sideways scroll", async ({ page }) => {
    for (const path of ["/blog", "/what-causes-rosacea-redness"]) {
      await page.goto(`${NEXT_URL}${path}`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(375);
    }
  });
});

/* The blog reads WordPress: these need the cms containers running, and SITE_URL at build time for full addresses. */
test.describe("search engines", () => {
  const graphOf = async (page: import("@playwright/test").Page) => {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    return blocks.flatMap((b) => (JSON.parse(b) as { "@graph": Record<string, unknown>[] })["@graph"]);
  };

  test("blog: canonical and social tags, structured data for the list and the FAQ", async ({ page }) => {
    await page.goto(`${NEXT_URL}/blog`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/blog$/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /What-Causes-Rosacea-Redness\.webp$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const graph = await graphOf(page);
    expect(graph.map((g) => g["@type"])).toEqual(["BreadcrumbList", "Blog", "FAQPage"]);
    const posts = graph[1].blogPost as { headline: string; url: string; datePublished: string }[];
    expect(posts).toHaveLength(34);
    expect(posts[0]).toMatchObject({ headline: "What Causes Rosacea Redness", datePublished: "2025-11-26T09:00:00+00:00" });
    expect(posts[0].url).toMatch(/\/what-causes-rosacea-redness$/);
    expect((graph[2].mainEntity as unknown[]).length).toBe(await page.locator("#faq").locator("xpath=ancestor::section").locator("dt, summary, button[aria-expanded]").count());
  });

  test("article: canonical, article tags, BlogPosting; photos come in sizes; it is in the sitemap", async ({ page, request }) => {
    await page.goto(`${NEXT_URL}/what-causes-rosacea-redness`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/what-causes-rosacea-redness$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "The everyday triggers that can make rosacea flare, and why they affect some skin more than others.");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", "2025-11-26T09:00:00+00:00");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1440");
    const graph = await graphOf(page);
    expect(graph.map((g) => g["@type"])).toEqual(["BreadcrumbList", "BlogPosting"]);
    expect(graph[1]).toMatchObject({ headline: "What Causes Rosacea Redness", articleSection: "Skin", timeRequired: "PT9M", author: { "@type": "Organization", name: "NewDermaMed" } });
    expect((graph[0].itemListElement as { name: string }[]).map((i) => i.name)).toEqual(["Home", "Blog", "What Causes Rosacea Redness"]);

    const hero = page.locator("main > article > div img");
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect(hero).toHaveAttribute("srcset", /768w/);
    await expect(hero).toHaveAttribute("width", "1440");
    const inText = page.locator("#article-body figure img");
    await expect(inText).toHaveAttribute("alt", "Main reasons for rosacea redness");
    await expect(inText).toHaveAttribute("loading", "lazy");
    await expect(inText).toHaveAttribute("srcset", /300w/);

    const sitemap = await (await request.get(`${NEXT_URL}/sitemap.xml`)).text();
    expect(sitemap).toContain("/what-causes-rosacea-redness</loc>");
    expect(sitemap).toContain("/blog</loc>");
    /* a post without text has no page here, so it is not listed */
    expect(sitemap).not.toContain("best-way-to-treat-rosacea");
  });

  test("a post without text has no page; an unknown address is not found", async ({ page }) => {
    /* a one-part address is answered by the route of the WordPress pages, which sends its "not found" page marked noindex */
    for (const path of ["/best-way-to-treat-rosacea", "/no-such-article"]) {
      await page.goto(`${NEXT_URL}${path}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
      await expect(page.locator("#article-body")).toHaveCount(0);
    }
  });
});
