import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";
import { money, optionsOf } from "./price-list";

/** The lip filler card as the price list has it now: its lowest price per syringe, and that option's offer. */
async function lipCard(): Promise<{ price: string; badge: string }> {
  const perSyringe = (await optionsOf("Lip Enhancement")).map((o) => ({ each: o.price / (Number.parseInt(o.label, 10) || 1), tag: o.tag }));
  const low = perSyringe.reduce((a, b) => (b.each < a.each ? b : a));
  return { price: money(low.each), badge: low.tag ? `%${low.tag.charAt(0)}${low.tag.slice(1).toLowerCase()}` : "" };
}


/** Behaviour of the migrated monthly specials wheel on the Next.js build. */

const SECTION = 'section[aria-labelledby="specials"]';
const stage = (page: Page) => page.locator(`${SECTION} [aria-roledescription="carousel"]`);
const current = (page: Page) => page.locator(`${SECTION} article.is-on`);

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
  await expect(page.locator("#specials")).toHaveClass(/\bin\b/);
  await page.waitForTimeout(2600); /* the cards sweep onto the arc */
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("eleven offers; price, unit and offer come from the price list", async ({ page }) => {
    await goToSection(page);
    await expect(page.locator(`${SECTION} article`)).toHaveCount(11);
    await expect(stage(page)).toHaveAttribute("aria-label", "Monthly specials, offer 1 of 11");
    await expect(current(page).locator("h3")).toHaveText("Botox");
    await expect(current(page)).toContainText("per unit");
    await expect(current(page).getByRole("link", { name: "Buy now" })).toHaveAttribute("href", "/pricing#pg-botox-dysport-h");
    /* the third offer, Lip Filler, shows the price list's own figures */
    for (let i = 0; i < 2; i++) await page.locator(SECTION).getByRole("button", { name: "Next offer" }).click();
    await expect(current(page).locator("h3")).toHaveText("Lip Filler");
    const lip = await lipCard();
    await expect(current(page).locator(".sw-price")).toHaveText(lip.price);
    if (lip.badge) await expect(current(page).locator(".deal-badge")).toHaveText(lip.badge);
    else await expect(current(page).locator(".deal-badge")).toHaveCount(0);
    await expect(current(page)).toContainText("per syringe");
    await expect(current(page).getByRole("link", { name: "Buy now" })).toHaveAttribute("href", "/pricing#pg-dermal-fillers-h");
    await expect(page.locator(SECTION).getByRole("link", { name: "View all offers" })).toHaveAttribute("href", /^\/(promotion#offers|vip-sale)$/); /* the sale's page in the VIP Sale's days */
  });

  test("arrows, arrow keys and a click on a side card turn the wheel; it wraps round", async ({ page }) => {
    await goToSection(page);
    await page.locator(SECTION).getByRole("button", { name: "Next offer" }).click();
    await expect(current(page).locator("h3")).toHaveText("Laser Hair Removal");
    await stage(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(current(page).locator("h3")).toHaveText("Lip Filler");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(current(page).locator("h3")).toHaveText("PRP Face");
    await expect(stage(page)).toHaveAttribute("aria-label", "Monthly specials, offer 11 of 11");
    /* the side card to the right: click its outer edge, clear of the centre card */
    await page.locator(`${SECTION} article`).filter({ has: page.locator("h3", { hasText: /^Botox$/ }) }).click({ position: { x: 270, y: 40 } });
    await expect(current(page).locator("h3")).toHaveText("Botox");
    /* only the centre card's button can be reached or followed */
    await expect(page.locator(`${SECTION} article:not(.is-on) a.btn`).first()).toHaveAttribute("tabindex", "-1");
  });

  test("a sideways drag turns the wheel", async ({ page }) => {
    await goToSection(page);
    const b = (await stage(page).boundingBox())!;
    await page.mouse.move(b.x + b.width / 2 + 100, b.y + 120);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 - 60, b.y + 120, { steps: 5 });
    await page.mouse.up();
    await expect(current(page).locator("h3")).toHaveText("Laser Hair Removal");
  });

  test("the payment plans card links to the provider", async ({ page }) => {
    await goToSection(page);
    const start = page.locator(SECTION).getByRole("link", { name: /Start my plan/ }).first();
    await expect(start).toHaveAttribute("href", /^https:\/\/www\.affirm\.ca\/apps\/prequal\//);
    await expect(start).toHaveAttribute("target", "_blank");
    await expect(page.locator(SECTION).getByRole("list", { name: "Payment plan providers" }).getByRole("listitem")).toHaveCount(3);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the wheel fits the screen with no sideways scroll and no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await goToSection(page);
    await expect(current(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    expect(errors).toEqual([]);
  });

  test("on the scaled-down wheel every card keeps a full Buy button and holds its content, offer tag or not", async ({ page }) => {
    await goToSection(page);
    await expect(current(page)).toBeVisible();
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".sw-card")].map((card) => {
        const button = card.querySelector<HTMLElement>("a.btn")!;
        const middle = button.previousElementSibling as HTMLElement;
        return { button: button.offsetHeight, spill: middle.scrollHeight - middle.clientHeight };
      }),
    );
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) expect(card).toEqual({ button: 40, spill: 0 });
  });
});
