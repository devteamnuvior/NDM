import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated header on the Next.js build: interactions, links, errors, stability. */

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 375, height: 812 };
const barColor = (page: Page) => page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color);

/** Collects console errors and uncaught exceptions (hydration mismatches surface as both). */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /hydrat/i.test(m.text()))) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test.describe("desktop", () => {
  test.use({ viewport: DESKTOP });

  test("loads with no console, page or hydration errors, and no failed requests", async ({ page }) => {
    const errors = watchErrors(page);
    const failed: string[] = [];
    page.on("requestfailed", (r) => {
      /* browsers fetch a film in ranges and drop the first request by design: not a failure */
      if (r.resourceType() !== "media") failed.push(r.url());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Procedures", exact: true }).hover();
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });

  test("header images are all loaded once a panel is open", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    for (const name of ["Procedures", "Concerns", "About"]) {
      await page.getByRole("button", { name, exact: true }).hover();
      await page.waitForTimeout(700);
      const broken = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLImageElement>("header .panel[data-open='true'] img"))
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.currentSrc || i.src),
      );
      expect(broken, `${name} panel`).toEqual([]);
    }
  });

  test("layout does not shift while the page loads", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
  });

  test("header is fixed below the announcement bar and changes tone with the section under it", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1800);
    const header = page.locator("header.fixed"); /* the site header (the chat panel has a header of its own) */
    expect(await header.evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
    expect((await header.boundingBox())?.y).toBe(36);
    expect(await barColor(page)).toBe("rgb(255, 255, 255)"); /* over the dark section */
    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 60));
    await expect.poll(() => barColor(page)).toBe("rgb(51, 51, 51)"); /* over the paper section */
    expect((await header.boundingBox())?.y).toBe(36);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => barColor(page)).toBe("rgb(255, 255, 255)");
  });

  test("dropdowns open on hover, switch between panels, and close on leave, Escape and outside click", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    const procedures = page.getByRole("button", { name: "Procedures", exact: true });
    const concerns = page.getByRole("button", { name: "Concerns", exact: true });
    await procedures.hover();
    await expect(procedures).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("header .panel[data-open='true']")).toHaveCount(1);
    await expect.poll(() => barColor(page)).toBe("rgb(51, 51, 51)"); /* the bar turns solid white while a menu is open */
    await concerns.hover();
    await expect(concerns).toHaveAttribute("aria-expanded", "true");
    await expect(procedures).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Escape");
    await expect(concerns).toHaveAttribute("aria-expanded", "false");
    await procedures.hover();
    await expect(procedures).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(700, 850); /* off the menu: closes after a short delay */
    await expect(procedures).toHaveAttribute("aria-expanded", "false");
    await procedures.click();
    await expect(procedures).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(700, 850); /* the dimmed page */
    await expect(procedures).toHaveAttribute("aria-expanded", "false");
  });

  test("Procedures panel switches category on hover and on keyboard focus", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Procedures", exact: true }).hover();
    const panel = page.locator("header .panel[data-open='true']");
    await expect(panel.getByText("NAMICA technology")).toBeVisible();
    await panel.getByRole("button", { name: "Injectables" }).hover();
    await expect(panel.getByRole("link", { name: "Botox®" })).toBeVisible();
    await expect(panel.getByText("NAMICA technology")).toHaveCount(0);
    await panel.getByRole("button", { name: "Skin", exact: true }).focus();
    await expect(panel.getByText("Medical Dermatology", { exact: true })).toBeVisible();
  });

  test("keyboard: Tab reaches the menu, Enter opens it, links inside are reachable, Escape closes", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    const procedures = page.getByRole("button", { name: "Procedures", exact: true });
    await procedures.focus();
    await page.keyboard.press("Enter");
    await expect(procedures).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    const focusInPanel = () => page.evaluate(() => !!document.activeElement?.closest("header .panel[data-open='true']"));
    /* the closed panels are hidden, so focus goes straight into the open one */
    await expect.poll(async () => {
      if (!(await focusInPanel())) await page.keyboard.press("Tab");
      return focusInPanel();
    }).toBe(true);
    await page.keyboard.press("Escape");
    await expect(procedures).toHaveAttribute("aria-expanded", "false");
  });

  test("every header link points at a page that exists", async ({ page, request }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Procedures", exact: true }).hover();
    const hrefs = await page.evaluate(() =>
      Array.from(new Set(Array.from(document.querySelectorAll<HTMLAnchorElement>('header a, [aria-label="Clinic announcements"] a')).map((a) => a.getAttribute("href") ?? ""))),
    );
    expect(hrefs.length).toBeGreaterThan(20);
    const pages = hrefs.filter((h) => h.startsWith("/"));
    expect(pages).toEqual(expect.arrayContaining(["/", "/pricing", "/promotion", "/about", "/blog", "/account", "/aptos-thread-lift", "/wrinkles-fine-lines", "/privacy"]));
    for (const h of pages) expect((await request.get(NEXT_URL + h)).status(), h).toBe(200);
    /* everything else is a phone number or one of the prototype's placeholders */
    for (const h of hrefs.filter((x) => !x.startsWith("/"))) expect(h).toMatch(/^(tel:\+1\d{10}|#\/[a-z0-9-]+)$/);
  });

  test("search: opens from the header, focuses the field, filters, and closes with Escape", async ({ page }) => {
    /* the menu's own entries only; the price list and the counted searches have the next test */
    await page.route("**/api/search/popular", (r) => r.fulfill({ json: { terms: [] } }));
    await page.route("**/api/search?**", (r) => r.fulfill({ json: { hits: [] } }));
    await page.route("**/api/search/log", (r) => r.fulfill({ json: { counted: false } }));
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    await page.locator("header").getByRole("button", { name: "Search treatments" }).click();
    const dialog = page.getByRole("dialog", { name: "Search treatments" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("#site-search")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await dialog.getByRole("button", { name: "Microneedling" }).click();
    await expect(page.locator("#site-search")).toHaveValue("Microneedling");
    await expect(dialog.getByRole("listitem")).toHaveCount(1);
    await page.locator("#site-search").fill("zzzz");
    await expect(dialog.getByText("No match yet")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("search: finds the price list in WooCommerce, shows the counted Popular searches, counts a chosen result", async ({ page }) => {
    /* needs WordPress running (the cms containers); the count itself is caught here, so the test leaves no trace */
    const counted: unknown[] = [];
    await page.route("**/api/search/popular", (r) => r.fulfill({ json: { terms: ["Laser Acne Treatment", "Dermal Fillers"] } }));
    await page.route("**/api/search/log", (r) => {
      counted.push(r.request().postDataJSON());
      return r.fulfill({ json: { counted: true } });
    });
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    await page.locator("header").getByRole("button", { name: "Search treatments" }).click();
    const dialog = page.getByRole("dialog", { name: "Search treatments" });
    await expect(dialog.getByRole("button", { name: "Laser Acne Treatment" })).toBeVisible();
    await expect(dialog.locator(".flex-wrap button")).toHaveText(["Laser Acne Treatment", "Dermal Fillers"]);

    await page.locator("#site-search").fill("laser acne");
    const row = dialog.getByRole("link", { name: /^Laser Acne Treatment/ });
    await expect(row).toHaveAttribute("href", "/pricing#pg-laser-acne-treatment-h");
    await row.click();
    await expect(page).toHaveURL(/\/pricing#pg-laser-acne-treatment-h$/);
    await expect(page.locator("#pg-laser-acne-treatment-h:visible")).toHaveAttribute("aria-expanded", "true");
    expect(counted).toEqual([{ q: "laser acne", picked: "Laser Acne Treatment" }]);
  });

  test("search: only a result of the site can be counted, never typed text", async ({ request }) => {
    const send = async (data: unknown) => (await (await request.post(`${NEXT_URL}/api/search/log`, { data })).json()) as { counted: boolean };
    expect(await send({ q: "laser acne", picked: "someone's name" })).toEqual({ counted: false });
    expect(await send({ q: "zzzz", picked: "zzzz" })).toEqual({ counted: false });
    expect(await send({ q: "laser acne" })).toEqual({ counted: false });
  });

  test("cart badge shows the number of items saved by the original pages", async ({ page }) => {
    await page.goto(NEXT_URL);
    await expect(page.getByRole("button", { name: "Cart, 0 items" })).toBeVisible();
    /* real entries of the price list: the cart drops anything WooCommerce does not know */
    await page.evaluate(() =>
      localStorage.setItem(
        "ndm-cart",
        JSON.stringify([
          { key: "a", cat: "Botox / Dysport", name: "Botox Cosmetic", label: "60 units", qty: 2, price: 648 },
          { key: "b", cat: "Dermal Fillers", name: "Lip Enhancement", label: "2 Syringes", qty: 1, price: 1125 },
        ]),
      ),
    );
    await page.reload();
    await expect(page.getByRole("button", { name: "Cart, 3 items" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 3 items" }).locator("span")).toHaveText("3");
  });

  test("announcement bar rotates its messages and pauses under the pointer", async ({ page }) => {
    await page.goto(NEXT_URL);
    const bar = page.getByRole("region", { name: "Clinic announcements" });
    const current = () => bar.locator("div[aria-hidden='false']:visible").innerText();
    const first = await current();
    expect(["New-patient offers this month", "Complimentary VISIA® skin analysis", "Flexible payment plans"].some((m) => first.includes(m))).toBe(true);
    await expect.poll(current, { timeout: 8000 }).not.toBe(first);
    await bar.hover();
    const held = await current();
    await page.waitForTimeout(5600);
    expect(await current()).toBe(held);
  });
});

test.describe("phone", () => {
  test.use({ viewport: PHONE, hasTouch: true });

  test("loads with no errors and no sideways scroll", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(PHONE.width);
    await expect(page.locator("header nav[aria-label='Primary']")).toBeHidden();
    await expect(page.locator("header").getByRole("button", { name: "Search treatments" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Book a free consultation" })).toBeVisible();
  });

  test("the dropdown photos are not downloaded on phones", async ({ page }) => {
    const images: string[] = [];
    page.on("request", (r) => {
      if (/_next\/image/.test(r.url())) images.push(r.url());
    });
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    expect(images).toEqual([]);
  });

  test("menu drawer: opens, locks the page, expands its sections, closes with the button and Escape", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(drawer).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await drawer.getByRole("button", { name: "Procedures" }).click();
    await drawer.getByRole("button", { name: "Injectables" }).click();
    await expect(drawer.getByRole("link", { name: "Botox®" })).toHaveAttribute("href", "/botox");
    await drawer.getByRole("button", { name: "About" }).click();
    await expect(drawer.getByRole("link", { name: /Uptown Clinic/ })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await drawer.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("floating search button opens search and hides while an overlay is open", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(800);
    const float = page.locator("button.float-search");
    await expect(float).toBeVisible();
    await float.click();
    await expect(page.getByRole("dialog", { name: "Search treatments" })).toBeVisible();
    await expect(float).toHaveClass(/is-off/);
  });
});
