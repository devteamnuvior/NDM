import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/**
 * Links on the Next.js build: no link is left as a "#/slug" placeholder (only "#/book", which opens the
 * booking form); the placeholders open the page WordPress has for them, else the list of procedures or of
 * concerns. Needs WordPress running.
 */

test.use({ viewport: { width: 1440, height: 900 } });

const SHOP = "https://shop.newdermamedlaserclinic.com/shop/";

for (const path of ["/", "/concerns/wrinkles-fine-lines", "/injectables/botox", "/aptos-thread-lift", "/about", "/pricing", "/promotion", "/procedures", "/concerns"]) {
  test(`${path}: no link points to a #/ placeholder, and every link to the site answers`, async ({ page, request }) => {
    await page.goto(NEXT_URL + path);
    await page.waitForTimeout(1500);
    const hrefs = await page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"), (a) => a.getAttribute("href") ?? ""))));
    expect(hrefs.filter((h) => h.includes("#/") && !h.endsWith("#/book"))).toEqual([]);
    /* the two lists, and every procedure and concern page that is linked */
    for (const h of hrefs.filter((x) => /^\/(procedures|concerns|injectables|skin|laser|body|veins|hair)(\/|#|$)/.test(x))) {
      const [address, section] = h.split("#");
      const response = await request.get(NEXT_URL + address);
      expect(response.status(), h).toBe(200);
      if (section) expect(await response.text(), h).toMatch(new RegExp(`\\bid="${section}"`));
    }
  });
}

test("the skincare shop opens the shop in a new tab from the top bar, the header and the footer", async ({ page }) => {
  await page.goto(NEXT_URL);
  const links = page.getByRole("link", { name: /skincare shop|shop skincare/i });
  expect(await links.count()).toBeGreaterThanOrEqual(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", SHOP);
    await expect(link).toHaveAttribute("target", "_blank");
  }
});

test("the footer's Procedures and Concerns open their lists; the lists link every page WordPress holds", async ({ page }) => {
  await page.goto(NEXT_URL);
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Procedures", exact: true })).toHaveAttribute("href", "/procedures");
  await expect(footer.getByRole("link", { name: "Concerns", exact: true })).toHaveAttribute("href", "/concerns");
  await page.goto(`${NEXT_URL}/procedures`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every treatment");
  await expect(page.locator("main").getByRole("link", { name: /Botox/ })).toHaveAttribute("href", "/injectables/botox");
  await expect(page.locator("main").getByRole("link", { name: "Aptos Thread Lift" })).toHaveAttribute("href", "/aptos-thread-lift");
  await page.goto(`${NEXT_URL}/concerns`);
  await expect(page.locator("main").getByRole("link", { name: /Wrinkles/ })).toHaveAttribute("href", "/concerns/wrinkles-fine-lines");
});

test("breadcrumbs: Procedures and the procedure list's name are links", async ({ page }) => {
  await page.goto(`${NEXT_URL}/injectables/botox`);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Procedures" })).toHaveAttribute("href", "/procedures");
  await expect(crumbs.getByRole("link", { name: "Injectables" })).toHaveAttribute("href", "/procedures#injectables");
  await page.goto(`${NEXT_URL}/concerns/wrinkles-fine-lines`);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Concerns" })).toHaveAttribute("href", "/concerns");
});

test("How it works: the plan step opens the list of procedures, the last step the clinics on the About page", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing`);
  await expect(page.getByRole("link", { name: "Explore treatments" })).toHaveAttribute("href", "/procedures");
  await expect(page.getByRole("link", { name: "Find a clinic" })).toHaveAttribute("href", "/about#clinics");
});

test("search: the cursor is in the box when it opens; no results says so, with the booking button", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("button", { name: "Search treatments" }).click();
  const dialog = page.getByRole("dialog", { name: "Search treatments" });
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await page.keyboard.type("zzqqxx");
  await expect(dialog.getByText("No treatments found. Book a free consultation and we’ll help you choose.")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Book Free Consultation" })).toBeVisible();
});

test("/promotion#offers lands on the offers heading, just under the header", async ({ page }) => {
  await page.goto(`${NEXT_URL}/promotion#offers`);
  const top = () => page.locator("#offers:visible").last().evaluate((el) => Math.round(el.getBoundingClientRect().top));
  await page.waitForTimeout(3500);
  const header = await page.locator("header").first().evaluate((el) => Math.round(el.getBoundingClientRect().bottom));
  expect(await top()).toBeGreaterThanOrEqual(header);
  expect(await top()).toBeLessThan(header + 140);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the checkout shows no floating sale tab and no floating search button", async ({ page }) => {
    await page.goto(`${NEXT_URL}/checkout`);
    await page.waitForTimeout(2500);
    await expect(page.locator("button.bfd-tab")).toHaveCount(0);
    await expect(page.locator("button.float-search")).toHaveClass(/is-off/);
  });
});
