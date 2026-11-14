import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated About page on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; the header marks About and starts dark; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/about.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/about`);
  await expect(page).toHaveTitle("About Us, NewDermaMed Cosmetic & Laser Clinic in Toronto");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Toronto’s cosmetic and laser clinic");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/About us");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color)).toBe("rgb(255, 255, 255)");
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test("a link to a part of the page lands on it", async ({ page }) => {
  await page.goto(`${NEXT_URL}/about#contact`);
  await expect(page.locator("#contact")).toBeInViewport();
});

test("team cards open the profile dialog; a member without a profile stays a plain card", async ({ page }) => {
  await page.goto(`${NEXT_URL}/about`);
  const team = page.locator("#team");
  await expect(team.locator("article")).toHaveCount(4);
  await team.getByRole("button", { name: /Alin Gharibian/ }).click();
  const dialog = page.getByRole("dialog", { name: "Alin Gharibian" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Alin Gharibian");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(team.locator("#team-heather")).toContainText("Full profile coming soon");
  await expect(team.locator("#team-heather button")).toHaveCount(0);
});

test("each clinic has a map with its pin and three parking pins, its details and directions", async ({ page }) => {
  await page.goto(`${NEXT_URL}/about`);
  const uptown = page.locator("#uptown");
  await uptown.scrollIntoViewIfNeeded();
  await expect(uptown.locator(".leaflet-container")).toBeVisible();
  await expect(uptown.locator(".map-park")).toHaveCount(3);
  await expect(uptown.locator(".map-clinic")).toHaveCount(1);
  await expect(uptown.locator(".clinic-map")).toHaveClass(/is-on/);
  await expect(uptown.getByRole("link", { name: "416-224-8800" })).toHaveAttribute("href", "tel:+14162248800");
  await expect(uptown.getByRole("link", { name: /Get directions/ })).toHaveAttribute("href", "https://maps.app.goo.gl/Gm8Wg4B1Q3yHGnkE7");
  await uptown.locator(".map-park").first().click();
  await expect(uptown.locator(".leaflet-popup-content")).toContainText("Lot #56, Hullmark Centre");
  await expect(page.locator("#downtown .map-park")).toHaveCount(3);
});

test("the gallery opens a viewer; arrows change the photo; Escape closes it and focus returns", async ({ page }) => {
  await page.goto(`${NEXT_URL}/about`);
  const tile = page.locator("#gallery").getByRole("button", { name: "View photo: Front desk" });
  /* the photos are the ones picked in WordPress (the page with the template "About page"), served from its media library */
  await expect(tile.locator("img")).toHaveAttribute("src", /\/wp-content\/uploads\/.*About-us-gallery-05/);
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  const viewer = page.getByRole("dialog", { name: "Clinic gallery" });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator("p[aria-live]")).toHaveText("Photo 5 of 14: Front desk");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.locator("p[aria-live]")).toHaveText("Photo 6 of 14: Waiting lounge");
  await viewer.getByRole("button", { name: "Photo 14: Treatment suite" }).click();
  await expect(viewer.locator("p[aria-live]")).toHaveText("Photo 14 of 14: Treatment suite");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.locator("p[aria-live]")).toHaveText("Photo 1 of 14: Reception");
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await expect(tile).toBeFocused();
});

test("the message form needs its fields, then thanks; nothing is sent anywhere", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") posts.push(r.url());
  });
  await page.goto(`${NEXT_URL}/about`);
  const form = page.locator("#contact form");
  await form.scrollIntoViewIfNeeded();
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(form).toBeVisible();
  await form.getByLabel("Your name").fill("Test Person");
  await form.getByLabel("Your email").fill("test@example.com");
  await form.getByLabel("Which clinic?").selectOption("Downtown Clinic");
  await form.getByLabel("How can we help?").fill("A question about parking.");
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact").getByRole("status")).toContainText("Thank you, your message is in.");
  await page.locator("#contact").getByRole("button", { name: "Send another message" }).click();
  await expect(page.locator("#contact form")).toBeVisible();
  expect(posts).toEqual([]);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("no sideways scroll down the whole page", async ({ page }) => {
    await page.goto(`${NEXT_URL}/about`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
