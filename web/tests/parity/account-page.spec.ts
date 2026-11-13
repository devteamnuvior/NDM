import { expect, test, type Browser, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";

/**
 * My account against the prototype: each of its eight sections, at every window size, with the same Black
 * Friday plan saved in both (the "plans" section shows it). The order totals are WooCommerce's prices on
 * the new site, so WordPress must be running. The footer is the shared one (its own test).
 */
const PLAN = [
  { key: "microneedling|Microneedling-Face|Package of 3", cat: "Microneedling", item: "Microneedling-Face", price: 735, reg: 1470 },
  { key: "medical-facials|Age Element Facial|Single session", cat: "Medical Facials", item: "Age Element Facial", price: 249, reg: 0 },
];
const TABS = ["dashboard", "plans", "orders", "payment", "membership", "wishlist", "forms", "details"];
const PATHS = { legacy: "/account.html", next: "/account" };

async function openBoth(browser: Browser, vp: { width: number; height: number }, tab: string, plan: unknown[]): Promise<[Page, Page]> {
  const pages = await Promise.all([open(browser, "legacy", vp, `#${tab}`, PATHS), open(browser, "next", vp, `#${tab}`, PATHS)]);
  for (const p of pages) {
    await p.evaluate((list) => localStorage.setItem("ndm-bf-plan", JSON.stringify(list)), plan);
    await p.reload();
    await p.waitForSelector("#acc-title", { state: "visible", timeout: 60_000 });
    await p.evaluate(() => document.fonts.ready);
    await p.addStyleTag({ content: ".offer-pop-root{display:none!important}" });
    /* the wishlist's photos come from the shop's own site: wait for them, so both pages show the same ones */
    await p.evaluate(async () => {
      const wait = Array.from(document.querySelectorAll<HTMLImageElement>("main img")).map((img) => {
        img.loading = "eager";
        return img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; setTimeout(r, 15_000); });
      });
      await Promise.all(wait);
      window.scrollTo(0, 0);
    });
    await p.mouse.move(2, 2);
    await p.waitForTimeout(1800);
  }
  return pages as [Page, Page];
}

for (const vp of VIEWPORTS) {
  test.describe(`account page parity @ ${vp.name}`, () => {
    for (const tab of [...TABS, "plans-empty"]) {
      test(tab, async ({ browser }, testInfo) => {
        const [legacy, next] = await openBoth(browser, vp, tab.replace("-empty", ""), tab === "plans" ? PLAN : []);
        const fa = await fingerprint(legacy, "main");
        const d = diff(fa, await fingerprint(next, "main"));
        report(`${vp.name}-account-${tab}`, d);
        expect(fa.length, "elements measured").toBeGreaterThan(20);
        expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
        const heights = await Promise.all([legacy, next].map((p) => p.evaluate(() => document.documentElement.scrollHeight)));
        expect(heights[1], "page height").toBe(heights[0]);
        await expectSamePixels(testInfo, `${vp.name}-account-${tab}`, legacy, next, { x: 0, y: 0, width: vp.width, height: vp.height }, tab === "wishlist" ? 0.01 : 0.002);
        await legacy.context().close();
        await next.context().close();
      });
    }
  });
}
