import { expect, test, type Locator } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";
import { money, optionOf } from "./price-list";

/**
 * Behaviour of the Botox page on the Next.js build. The page is a post of the WordPress post type
 * "Procedures" and its prices are WooCommerce's: these tests need WordPress running.
 */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; the header starts dark; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/botox.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/injectables/botox`);
  await expect(page).toHaveTitle("Botox Toronto from $12/Unit, Free Consultation | NewDermaMed");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Botox® in Toronto");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Procedures/Injectables/Botox®");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color)).toBe("rgb(255, 255, 255)");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("the offer card in the header jumps to the prices", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const offer = page.getByRole("link", { name: /Current offer: Botox® Cosmetic packages, Up to 30% off/ });
  await expect(offer).toHaveAttribute("href", "#prices");
});

test("About tabs: one panel at a time, arrow keys move between them, every panel stays in the page", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const about = page.locator("#overview");
  await about.scrollIntoViewIfNeeded();
  const tabs = about.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  await expect(about.locator('[role="tabpanel"]')).toHaveCount(4);
  await expect(about.getByRole("tabpanel")).toHaveCount(1);
  await expect(about.getByRole("tabpanel")).toContainText("20+");
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(about.getByRole("tabpanel")).toContainText("minutes per treatment");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  /* from the first tab, left wraps to the last one; there is no Pricing tab (removed on the user's request, 2026-11-13) */
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await expect(about.getByRole("tabpanel")).toContainText("typical duration");
  await expect(about.getByRole("tab", { name: /Pricing/ })).toHaveCount(0);
});

test("prices come from the price list, per unit; groups fold on their own; a package goes into the cart", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const prices = page.locator("#prices");
  await prices.scrollIntoViewIfNeeded();
  const [botox, dysport] = [prices.locator("#proc-pr-h0"), prices.locator("#proc-pr-h1")];
  await expect(botox).toHaveAttribute("aria-expanded", "true");
  await expect(dysport).toHaveAttribute("aria-expanded", "false");
  await expect(botox).toContainText("5 options");
  /* while a sale runs the regular price is struck through before the "from" price, and the offer is the sale's pill */
  await expect(botox).toContainText(/From\s*(Regular price \$\d+(\.\d\d)?\s*)?\$\d+(\.\d\d)? \/ unit/);
  await expect(botox.locator(".pr-badge, .sb")).toContainText(/30%\s*off/i);
  await expect(dysport).toContainText(/From\s*(Regular price \$\d+(\.\d\d)?\s*)?\$\d+(\.\d\d)? \/ unit/);
  const rows = prices.locator("#proc-pr0 .pr-opt");
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0)).toContainText("Per unit");
  /* WooCommerce's prices now: struck through only while the option is on sale */
  const [unit, units] = await Promise.all([optionOf("Botox Cosmetic", "Regular"), optionOf("Botox Cosmetic", "60 units")]);
  await expect(rows.nth(0)).toContainText(`${money(unit.price)} / unit`);
  if (units.regular) await expect(rows.nth(1)).toContainText(`Regular price ${money(units.regular)}`);
  else await expect(rows.nth(1)).not.toContainText("Regular price");
  await expect(rows.nth(1)).toContainText(money(units.price));
  await rows.nth(1).getByRole("button", { name: "Add Botox Cosmetic, 60 units to cart" }).click();
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem("ndm-cart") ?? "[]"));
  expect(cart[0]).toMatchObject({ cat: "Botox / Dysport", name: "Botox Cosmetic", label: "60 units", price: units.price, qty: 1 });
  expect(cart[0].was ?? 0).toBe(units.regular);
  await dysport.click();
  await expect(dysport).toHaveAttribute("aria-expanded", "true");
  await expect(botox).toHaveAttribute("aria-expanded", "true");
  await expect(prices.locator("#proc-pr1 .pr-opt")).toHaveCount(5);
});

test("each price group reads as its row on the Pricing page: the same From price, offer tag and checkout code lines", async ({ page }) => {
  /* what a folding row shows when closed (the "from" price with the struck regular price before it, the offer tag or
     sale pill), and how many of its options carry the checkout code's line ("Extra 30% with PLUS30") */
  const read = (rows: Locator) =>
    rows.evaluateAll((els) =>
      els.map((el) => {
        const head = el.querySelector("button")!;
        const text = head.textContent!.replace(/\s+/g, " ");
        return {
          from: /From\s*(Regular price\s*\$[\d.]+\s*)?\$[\d.]+(\s*\/\s*unit)?/.exec(text)?.[0].replace(/\s+/g, " ") ?? "",
          badge: head.querySelector(".pr-badge, .sb")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
          code: [...el.querySelectorAll(".pr-opt2-with")].filter((w) => /Extra \d+% with/.test(w.textContent ?? "")).length,
        };
      }),
    );
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const groups = await read(page.locator("#prices .pr-group"));
  expect(groups.length).toBeGreaterThan(0);
  for (const g of groups) expect(g.from).toMatch(/^From (Regular price )?\$/);
  await page.goto(`${NEXT_URL}/pricing`);
  const rows = await read(page.locator("#pg-botox-dysport .pr-item"));
  for (const g of groups) expect(rows).toContainEqual(g);
});

test("the clinic film has a sound button; the reel is not downloaded before it is on screen", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const film = page.locator("#film");
  await film.scrollIntoViewIfNeeded();
  const sound = film.getByRole("button", { name: "Turn the sound on" });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(film.getByRole("button", { name: "Turn the sound off" })).toHaveAttribute("aria-pressed", "true");
  expect(await film.locator("video").evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
  const reel = page.locator("#watch video");
  await expect(reel).toHaveAttribute("preload", "none");
  /* the picture is the procedure's, from WordPress's media library */
  await expect(reel).toHaveAttribute("poster", /\/wp-content\/uploads\/.*reel.*\.webp$/);
});

test("results show the photos with the results line; Good to know links to related treatments", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const results = page.locator("#results");
  await expect(results.locator("figure")).toHaveCount(3);
  await expect(results).toContainText("Individual results may vary.");
  const guide = page.locator("#guide");
  await expect(guide.locator("ol > li")).toHaveCount(5);
  const related = guide.getByRole("navigation", { name: "Related treatments" });
  await expect(related.getByRole("link")).toHaveCount(6);
  await expect(related.getByRole("link", { name: /Aptos Thread Lift/ })).toHaveAttribute("href", "/aptos-thread-lift");
  await expect(related.getByRole("link", { name: /Dermal Fillers/ })).toHaveAttribute("href", /^\/(injectables\/dermal-fillers|procedures)$/); /* its page when WordPress has one, else the list of procedures */
});

test("the section bar turns dark over the dark Before and after band", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const bar = page.getByRole("navigation", { name: "On this page" });
  await expect(bar.getByRole("link")).toHaveCount(12);
  await bar.getByRole("link", { name: "Results" }).click();
  await expect(bar.getByRole("link", { name: "Results" })).toHaveAttribute("aria-current", "true");
  /* the link lands with the band's top edge just under the bar: a little further and the bar is over it */
  await page.mouse.wheel(0, 240);
  await expect(bar).toHaveClass(/bg-\[rgba\(10,13,16,\.42\)\]/);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("no sideways scroll down the whole page", async ({ page }) => {
    await page.goto(`${NEXT_URL}/injectables/botox`);
    await expect(page.locator("#mobile-form-title")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});

test("the content is the WordPress procedure's; the price list shows the products picked there", async ({ page, request }) => {
  const api = process.env.WORDPRESS_API_URL || "http://localhost:8080/wp-json";
  const wp = await (await request.get(`${api}/ndm/v1/procedures/botox`)).json();
  /* a row of the price list is a pick of a WooCommerce product: it carries no price */
  expect(wp.content.price_list.map((r: { price_source: string }) => r.price_source)).toEqual([expect.stringMatching(/^product:\d+$/), expect.stringMatching(/^product:\d+$/)]);
  for (const row of wp.content.price_list) expect(Object.keys(row).sort()).toEqual(["blurb", "name", "price_source", "product"]);
  expect(JSON.stringify(wp.content.price_list)).not.toMatch(/\$\d|price"/);
  await page.goto(`${NEXT_URL}/injectables/botox`);
  await expect(page.locator("#proc-title, h1").first()).toContainText(wp.content.heading_1);
  await expect(page.locator("#prices .pr-group")).toHaveCount(wp.content.price_list.length);
  await expect(page.locator("#prices .pr-group h3").first()).toContainText(wp.content.price_list[0].name);
  await expect(page.locator("#guide")).toContainText(`Page updated ${wp.updated[1]}`);
  await expect(page.locator("main")).toHaveAttribute("data-page", "botox");
});
