import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * Booking section parity at every window size, step by step: the concern picker, the contact details,
 * the book-or-call choice, the calendar with a day and time picked, and the confirmation. In each state
 * every element is measured on the prototype and on the Next.js build and a screenshot compared.
 */
const SECTION = 'section[aria-labelledby="book"]';

for (const vp of VIEWPORTS) {
  test.describe(`booking parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
      /* the prototype sends nothing; the new form saves the request in WordPress, answered here so no record is made */
      await next.route("**/api/booking", (route) => route.fulfill({ status: 201, json: { ok: true } }));
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    const both = async (fn: (p: Page) => Promise<unknown>) => {
      await fn(legacy);
      await fn(next);
    };
    /* The new form no longer promises an email and a text (nothing sends them yet): the prototype is given
       the same two sentences, so everything else is still compared. */
    const reword = () =>
      legacy.evaluate((sel) => {
        const swaps: [string, string][] = [
          ["You’ll receive the details by email and text.", "Our team will contact you to confirm it."],
          ["We will confirm your time by email and text.", "Our team will contact you to confirm your time."],
        ];
        const root = document.querySelector(sel);
        if (!root) return;
        const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let n = walk.nextNode(); n; n = walk.nextNode()) {
          for (const [from, to] of swaps) if (n.nodeValue?.includes(from)) n.nodeValue = n.nodeValue.replace(from, to);
        }
      }, SECTION);
    const check = async (state: string, testInfo: Parameters<typeof expectSamePixels>[0]) => {
      await reword();
      const [a, b] = [await showSection(legacy, SECTION), await showSection(next, SECTION)];
      const d = diff(await fingerprint(legacy, SECTION), await fingerprint(next, SECTION));
      report(`${vp.name}-booking-${state}`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      expect(b, "section height").toBe(a);
      /* the photo behind the card is served resized, so its pixels are close, not identical */
      await expectSamePixels(testInfo, `${vp.name}-booking-${state}`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, a) }, 0.02);
    };
    const form = (p: Page) => p.locator(`${SECTION} form`);

    test("step 1: the concern picker, with two options chosen", async ({}, testInfo) => {
      await both(async (p) => {
        await showSection(p, SECTION);
        await form(p).getByRole("tab", { name: "Skin" }).click();
        /* each option is a label with an invisible checkbox laid over it: tick the checkbox itself */
        await form(p).getByRole("checkbox", { name: "Acne scars", exact: true }).check();
        await form(p).getByRole("checkbox", { name: "Melasma", exact: true }).check();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(500);
      });
      await check("concern", testInfo);
    });

    test("step 2: contact details", async ({}, testInfo) => {
      await both(async (p) => {
        await form(p).getByRole("button", { name: "Continue" }).click();
        await p.waitForTimeout(300);
        await form(p).locator('input[name="first"]').fill("Sam");
        await form(p).locator('input[name="last"]').fill("Tester");
        await form(p).locator('input[name="phone"]').fill("416 555 0100");
        await form(p).locator('input[name="email"]').fill("sam@example.com");
        await form(p).locator('input[name="email"]').blur();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(500);
      });
      await check("details", testInfo);
    });

    test("step 3: book or call", async ({}, testInfo) => {
      await both(async (p) => {
        await form(p).getByRole("button", { name: "Continue" }).click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(600);
      });
      await check("choice", testInfo);
    });

    test("step 4: the calendar, with a day and a time picked", async ({}, testInfo) => {
      await both(async (p) => {
        await form(p).getByRole("button", { name: /Book a time now/ }).click();
        await p.waitForTimeout(400);
        await form(p).getByRole("button", { name: "Next month" }).click();
        await form(p).getByRole("group", { name: "Choose a day" }).locator("button:not([disabled])").nth(8).click();
        await form(p).getByRole("group", { name: "Choose a time" }).locator("button").nth(2).click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(600);
      });
      await check("calendar", testInfo);
    });

    test("the confirmation", async ({}, testInfo) => {
      await both(async (p) => {
        await form(p).getByRole("button", { name: "Book this time" }).click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(600);
      });
      await check("booked", testInfo);
    });
  });
}
