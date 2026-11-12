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
