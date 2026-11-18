import { expect, test, type Browser, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";
import { saleRuns } from "../price-list";

/**
 * Cart, checkout and order confirmation pages against the prototype, at every window size, with the same
 * cart (real entries of the price list) and the same last order saved in both. Deliberate differences,
 * put aside before measuring: the prototype's closing line "Prototype: nothing is charged or sent" (the
 * real page says "Nothing is charged online"), its "Not available in this preview" under card payment,
 * and the real form's hidden field that tells people from robots. Also put aside, in both pages: the page
 * head (steps, heading, help line), which the user changed on 2026-11-14 (steps and heading on one line
 * each, the head a block of its own above the cards), and the clinic choice the site's details step
 * carries since the appointment step was taken out (user, 2026-11-18).
 */
const LINES = [
  { key: "wc:42:44", cat: "Dermal Fillers", name: "Lip Enhancement", label: "2 Syringes", price: 1125, unit: "", was: 1500, productId: 42, variationId: 44, qty: 1 },
  { key: "wc:18:20", cat: "Botox / Dysport", name: "Botox Cosmetic", label: "60 units", price: 648, unit: "", was: 720, productId: 18, variationId: 20, qty: 2 },
];
const ORDER = { no: "1042", date: "2026-11-12T15:00:00.000Z", lines: LINES, sub: 2421, saved: 519, tax: 314.73, taxLabel: "HST (13%)", total: 2735.73, first: "Sam", clinic: "Uptown", pay: "Pay at your appointment" };
const SECTION = 'main > section[aria-labelledby="co-title"]';

const PAGES = [
  /* prices: the page shows WooCommerce's prices (the cart's lines, the suggestions under an empty cart), the campaign's while a sale runs */
  { name: "cart", legacy: "/cart.html", next: "/cart", cart: LINES, prices: true },
  { name: "cart-empty", legacy: "/cart.html", next: "/cart", cart: [], prices: true },
  { name: "checkout", legacy: "/checkout.html", next: "/checkout", cart: LINES, prices: true },
  { name: "order-confirmed", legacy: "/order-confirmed.html", next: "/order-confirmed", cart: [], prices: false },
];

async function openBoth(browser: Browser, vp: { width: number; height: number }, page: (typeof PAGES)[number]): Promise<[Page, Page]> {
  const pages = await Promise.all([open(browser, "legacy", vp, "", { legacy: page.legacy, next: page.next }), open(browser, "next", vp, "", { legacy: page.legacy, next: page.next })]);
  for (const p of pages) {
    await p.evaluate(([cart, order]) => { localStorage.setItem("ndm-cart", JSON.stringify(cart)); localStorage.setItem("ndm-last-order", JSON.stringify(order)); }, [page.cart, ORDER] as const);
    await p.reload();
    await p.waitForSelector(SECTION, { state: "visible", timeout: 60_000 });
    await p.addStyleTag({ content: `.offer-pop-root{display:none!important} [data-step="0"] fieldset:has(input[name=clinic]){display:none!important} ${SECTION} > div:first-child:has(#co-title), ol[aria-label="Checkout progress"]{display:none!important}` });
    await p.evaluate(() => {
      for (const el of Array.from(document.querySelectorAll("main p, main span"))) {
        if (el.children.length <= 1 && /Prototype: nothing is charged or sent/.test(el.textContent ?? "")) el.lastChild!.textContent = "Nothing is charged online";
        if (el.textContent === "Not available in this preview.") el.textContent = "Not available online.";
      }
      /* no appointment step for now (user, 2026-11-18): the site has two checkout steps (no review step either) and asks for the clinic with the details */
      for (const el of Array.from(document.querySelectorAll("main p, main button"))) {
        if (el.textContent === "Step 1 of 4") el.textContent = "Step 1 of 2";
      }
      /* the phone is required (the card processor refuses a payment without one): no "(optional)" beside it */
      for (const el of Array.from(document.querySelectorAll("main label span span"))) {
        if (el.textContent === "(optional)" && el.parentElement?.textContent?.trim().startsWith("Phone")) el.remove();
      }
      for (const el of Array.from(document.querySelectorAll("main p, main button"))) {
        if (el.textContent?.trim() === "Continue to appointment") el.firstChild!.textContent = "Continue to payment";
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
        test.skip(page.prices && (await saleRuns().catch(() => false)), "a sale campaign is running: this page shows its prices");
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
