import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated legal pages (Privacy, Terms, Refunds) on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

const DOCS = [
  { id: "privacy", title: "Privacy Policy, NewDermaMed Toronto", h1: "Privacy Policy", crumb: "Home/Legal/Privacy Policy", sections: 8 },
  { id: "terms", title: "Terms of Service, NewDermaMed Toronto", h1: "Terms of Service", crumb: "Home/Legal/Terms of Service", sections: 11 },
  { id: "refunds", title: "Refund and Cancellation Policy, NewDermaMed Toronto", h1: "Refunds & Cancellations", crumb: "Home/Legal/Refunds & Cancellations", sections: 9 },
];

for (const d of DOCS) {
  test(`${d.id}: the old address redirects; title, one h1, breadcrumb, every section on the bar; no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${NEXT_URL}/${d.id}.html`);
    await expect(page).toHaveURL(`${NEXT_URL}/${d.id}`);
    await expect(page).toHaveTitle(d.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(d.h1);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText(d.crumb);
    await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link")).toHaveCount(d.sections);
    await expect(page.locator(".lg-doc-body h2")).toHaveCount(d.sections);
    await expect(page.getByRole("navigation", { name: "Legal documents" }).locator('[aria-current="page"]')).toHaveCount(1);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

test("the bar scrolls to a section and marks the one being read; the documents link to each other", async ({ page }) => {
  await page.goto(`${NEXT_URL}/terms`);
  const bar = page.getByRole("navigation", { name: "On this page" });
  await bar.getByRole("link", { name: /Payments/ }).click();
  await expect(page.locator("#t5")).toBeInViewport();
  await expect(bar.getByRole("link", { name: /Payments/ })).toHaveAttribute("aria-current", "true");
  await page.locator(".lg-doc-body").getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(`${NEXT_URL}/privacy`);
  await page.getByRole("navigation", { name: "Legal documents" }).getByRole("link", { name: "Refunds & Cancellations" }).click();
  await expect(page).toHaveURL(`${NEXT_URL}/refunds`);
  await expect(page.locator("h1:visible")).toHaveText("Refunds & Cancellations");
});

test("the footer's legal links open these pages; the first-visit offer never shows here", async ({ page }) => {
  await page.goto(`${NEXT_URL}/privacy?offer`);
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  await page.waitForTimeout(2500);
  await expect(page.getByRole("dialog", { name: /offer|10%/i })).toHaveCount(0);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("no sideways scroll", async ({ page }) => {
    for (const d of DOCS) {
      await page.goto(`${NEXT_URL}/${d.id}`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), d.id).toBe(375);
    }
  });
});
