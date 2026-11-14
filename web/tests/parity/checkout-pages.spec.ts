import { expect, test, type Browser, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";

/**
 * Cart, checkout and order confirmation pages against the prototype, at every window size, with the same
 * cart (real entries of the price list) and the same last order saved in both. Deliberate differences,
 * put aside before measuring: the prototype's closing line "Prototype: nothing is charged or sent" (the
 * real page says "Nothing is charged online"), its "Not available in this preview" under card payment,
 * and the real form's hidden field that tells people from robots.
 */
const LINES = [
  { key: "wc:42:44", cat: "Dermal Fillers", name: "Lip Enhancement", label: "2 Syringes", price: 1125, unit: "", was: 1500, productId: 42, variationId: 44, qty: 1 },
  { key: "wc:18:20", cat: "Botox / Dysport", name: "Botox Cosmetic", label: "60 units", price: 648, unit: "", was: 720, productId: 18, variationId: 20, qty: 2 },
];
const ORDER = { no: "1042", date: "2026-11-12T15:00:00.000Z", lines: LINES, sub: 2421, saved: 519, tax: 314.73, total: 2735.73, first: "Sam", clinic: "Uptown", pay: "Pay at your appointment" };
const SECTION = 'main > section[aria-labelledby="co-title"]';

const PAGES = [
  { name: "cart", legacy: "/cart.html", next: "/cart", cart: LINES },
  { name: "cart-empty", legacy: "/cart.html", next: "/cart", cart: [] },
  { name: "checkout", legacy: "/checkout.html", next: "/checkout", cart: LINES },
  { name: "order-confirmed", legacy: "/order-confirmed.html", next: "/order-confirmed", cart: [] },
];

async function openBoth(browser: Browser, vp: { width: number; height: number }, page: (typeof PAGES)[number]): Promise<[Page, Page]> {
  const pages = await Promise.all([open(browser, "legacy", vp, "", { legacy: page.legacy, next: page.next }), open(browser, "next", vp, "", { legacy: page.legacy, next: page.next })]);
  for (const p of pages) {
    await p.evaluate(([cart, order]) => { localStorage.setItem("ndm-cart", JSON.stringify(cart)); localStorage.setItem("ndm-last-order", JSON.stringify(order)); }, [page.cart, ORDER] as const);
    await p.reload();
    await p.waitForSelector(SECTION, { state: "visible", timeout: 60_000 });
    await p.addStyleTag({ content: ".offer-pop-root{display:none!important} input[name=company]{display:none!important}" });
    await p.evaluate(() => {
      for (const el of Array.from(document.querySelectorAll("main p, main span"))) {
        if (el.children.length <= 1 && /Prototype: nothing is charged or sent/.test(el.textContent ?? "")) el.lastChild!.textContent = "Nothing is charged online";
        if (el.textContent === "Not available in this preview.") el.textContent = "Not available online.";
      }
      window.scrollTo(0, 0);
    });
    await p.mouse.move(2, 2);
    await p.waitForTimeout(1800);
  }
  return pages as [Page, Page];
}

for (const vp of VIEWPORTS) {
  test.describe(`cart and checkout pages parity @ ${vp.name}`, () => {
    for (const page of PAGES) {
      test(page.name, async ({ browser }, testInfo) => {
        const [legacy, next] = await openBoth(browser, vp, page);
        const fa = await fingerprint(legacy, SECTION);
        const d = diff(fa, await fingerprint(next, SECTION));
        report(`${vp.name}-${page.name}-page`, d);
        expect(fa.length, "elements measured").toBeGreaterThan(8);
        expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
        const heights = await Promise.all([legacy, next].map((p) => p.evaluate(() => document.documentElement.scrollHeight)));
        expect(heights[1], "page height").toBe(heights[0]);
        await expectSamePixels(testInfo, `${vp.name}-${page.name}-page`, legacy, next, { x: 0, y: 0, width: vp.width, height: vp.height });
        await legacy.context().close();
        await next.context().close();
      });
    }
  });
}
