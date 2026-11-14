import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/*
 * Pages made from a WordPress post live in their post type's folder (src/lib/post-paths.ts): concerns
 * in /concerns/, the procedure lists in /procedures/, /injectables/, /laser/, /body/, /veins/, /hair/,
 * blog posts in /blog/. The old one-part addresses, and a procedure asked for in another list's folder,
 * send the visitor on. Needs WordPress running (Botox is in Injectables).
 */

const MOVED: [from: string, to: string][] = [
  ["/botox", "/injectables/botox"],
  ["/wrinkles-fine-lines", "/concerns/wrinkles-fine-lines"],
  ["/what-causes-rosacea-redness", "/blog/what-causes-rosacea-redness"],
  ["/procedures/botox", "/injectables/botox"],
  ["/laser/botox", "/injectables/botox"],
  ["/botox.html", "/injectables/botox"],
  ["/wrinkles-fine-lines.html", "/concerns/wrinkles-fine-lines"],
  ["/what-causes-rosacea-redness.html", "/blog/what-causes-rosacea-redness"],
];

for (const [from, to] of MOVED) {
  test(`${from} opens ${to}`, async ({ page }) => {
    /* an HTTP redirect, or (for a post added later) one written into the streamed page */
    await page.goto(`${NEXT_URL}${from}`);
    await expect(page).toHaveURL(`${NEXT_URL}${to}`);
    await expect(page.locator("main h1")).toHaveCount(1);
  });
}

test("the Aptos page keeps its one-part address", async ({ page }) => {
  const answer = await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  await expect(page).toHaveURL(`${NEXT_URL}/aptos-thread-lift`);
  expect(answer?.status()).toBe(200);
});

test("the old addresses of today's pages are real HTTP redirects", async ({ request }) => {
  for (const [from, to] of MOVED.slice(0, 3)) {
    const answer = await request.get(`${NEXT_URL}${from}`, { maxRedirects: 0 });
    expect(answer.status(), from).toBe(307);
    expect(answer.headers().location, from).toBe(to);
  }
});

/* the pages stream, so "not found" is the framework's not-found page (marked noindex), not a 404 status */
test("an address with no post behind it is not found", async ({ page }) => {
  for (const path of ["/concerns/nothing-here", "/injectables/nothing-here", "/blog/nothing-here", "/nothing-here/botox", "/concerns/botox", "/nothing-here"]) {
    await page.goto(`${NEXT_URL}${path}`);
    await expect(page.getByText("This page could not be found."), path).toBeVisible();
    await expect(page, path).toHaveURL(`${NEXT_URL}${path}`);
  }
});

test("the menu links Botox and Wrinkles at their new addresses", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${NEXT_URL}/`);
  await page.getByRole("button", { name: "Procedures", exact: true }).hover();
  /* Botox is listed under Injectables in the Procedures panel */
  await page.locator("header").getByRole("button", { name: /^Injectables/ }).first().hover();
  const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>("header a")).map((a) => a.getAttribute("href")));
  expect(hrefs).toContain("/injectables/botox");
  expect(hrefs).toContain("/concerns/wrinkles-fine-lines");
  expect(hrefs).not.toContain("/botox");
  expect(hrefs).not.toContain("/wrinkles-fine-lines");
});
