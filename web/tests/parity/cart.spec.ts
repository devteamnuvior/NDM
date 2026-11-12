import { expect, test, type Browser, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";

/**
 * Cart parity at every window size, with the same two lines saved in both pages' cart: the floating cart
 * bar once the page is scrolled, then the cart drawer opened from the header. Every element is measured
 * and the drawer compared pixel by pixel. The empty drawer is compared too.
 */
const LINES = [
  { key: "dermal-fillers|Lip Enhancement|2 Syringes", cat: "Dermal Fillers", name: "Lip Enhancement", label: "2 Syringes", price: 1125, unit: "", was: 1500, qty: 1 },
  { key: "microneedling|Microneedling Face|Single session", cat: "Microneedling", name: "Microneedling-Face", label: "Single session", price: 245, unit: "", was: 490, qty: 2 },
];
const DRAWER = '[role="dialog"][aria-labelledby="cart-title"]';

async function openBoth(browser: Browser, vp: { width: number; height: number }, lines: unknown[]): Promise<[Page, Page]> {
  const pages = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
  for (const p of pages) {
    await p.evaluate((v) => localStorage.setItem("ndm-cart", JSON.stringify(v)), lines);
    await p.reload();
    await p.waitForSelector("header nav, header button", { state: "attached", timeout: 60_000 });
    await p.addStyleTag({ content: ".offer-pop-root{display:none!important}" });
    await p.waitForTimeout(1800);
  }
  return pages as [Page, Page];
}

for (const vp of VIEWPORTS) {
  test.describe(`cart parity @ ${vp.name}`, () => {
    test("the floating cart bar and the filled drawer", async ({ browser }, testInfo) => {
      const [legacy, next] = await openBoth(browser, vp, LINES);
      for (const p of [legacy, next]) {
        await p.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
        await p.waitForTimeout(1200);
      }
      const pill = diff(await fingerprint(legacy, "button.cart-pill"), await fingerprint(next, "button.cart-pill"));
      report(`${vp.name}-cart-pill`, pill);
      expect(pill, JSON.stringify(pill.slice(0, 12), null, 1)).toEqual([]);
      expect((await fingerprint(next, "button.cart-pill")).length).toBeGreaterThan(5);

      for (const p of [legacy, next]) {
        await p.locator("header").getByRole("button", { name: /^Cart, 3 items/ }).click();
        await p.waitForSelector(DRAWER, { state: "visible" });
        await p.mouse.move(2, 2);
        await p.waitForTimeout(900);
      }
      const d = diff(await fingerprint(legacy, DRAWER), await fingerprint(next, DRAWER));
      report(`${vp.name}-cart-drawer`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      const b = (await next.locator(DRAWER).boundingBox())!;
      await expectSamePixels(testInfo, `${vp.name}-cart-drawer`, legacy, next, { x: Math.ceil(b.x), y: 0, width: Math.floor(b.width), height: vp.height });
      await legacy.context().close();
      await next.context().close();
    });

    test("the empty drawer", async ({ browser }, testInfo) => {
      const [legacy, next] = await openBoth(browser, vp, []);
      for (const p of [legacy, next]) {
        await p.locator("header").getByRole("button", { name: /^Cart, 0 items/ }).click();
        await p.waitForSelector(DRAWER, { state: "visible" });
        await p.mouse.move(2, 2);
        await p.waitForTimeout(900);
      }
      const d = diff(await fingerprint(legacy, DRAWER), await fingerprint(next, DRAWER));
      report(`${vp.name}-cart-empty`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      const b = (await next.locator(DRAWER).boundingBox())!;
      await expectSamePixels(testInfo, `${vp.name}-cart-empty`, legacy, next, { x: Math.ceil(b.x), y: 0, width: Math.floor(b.width), height: vp.height });
      await legacy.context().close();
      await next.context().close();
    });
  });
}
