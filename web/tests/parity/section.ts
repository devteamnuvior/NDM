import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

interface SectionParityOptions {
  /** Short name for reports and screenshots. */
  name: string;
  /** CSS selector of the section, the same on the prototype and on the Next.js build. */
  selector: string;
  /** The fewest elements the measurement must find, so an empty section cannot pass. */
  minElements?: number;
  /** Share of pixels allowed to differ; raise it only for sections with photos served resized. */
  pixelRatio?: number;
  /** Runs on both pages once the section is on screen, before anything is compared. */
  settle?: (page: Page) => Promise<unknown>;
}

/**
 * The standard comparison of one static section, at every window size: the section is scrolled to the top
 * of the window on the prototype and on the Next.js build, every visible element is measured on both
 * (position, size, font, colours, backgrounds, shadows, overlays), and a screenshot is compared pixel by pixel.
 */
export function sectionParity({ name, selector, minElements = 15, pixelRatio = 0.001, settle }: SectionParityOptions): void {
  for (const vp of VIEWPORTS) {
    test.describe(`${name} parity @ ${vp.name}`, () => {
      let legacy: Page;
      let next: Page;
      let height = 0;

      test.beforeAll(async ({ browser }) => {
        [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
        const [a, b] = [await showSection(legacy, selector), await showSection(next, selector)];
        height = a;
        if (settle) {
          await settle(legacy);
          await settle(next);
        }
        expect(b, "section height").toBe(a);
      });
      test.afterAll(async () => {
        await legacy?.context().close();
        await next?.context().close();
      });

      test("every element matches", async () => {
        const a = await fingerprint(legacy, selector);
        const b = await fingerprint(next, selector);
        expect(a.length).toBeGreaterThan(minElements);
        const d = diff(a, b);
        report(`${vp.name}-${name}`, d);
        expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      });

      test("the section matches pixel by pixel", async ({}, testInfo) => {
        await expectSamePixels(testInfo, `${vp.name}-${name}`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) }, pixelRatio);
      });
    });
  }
}
