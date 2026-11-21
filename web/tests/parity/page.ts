import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, hideFloats, open, report, showSection, VIEWPORTS, type PagePaths } from "./helpers";
import { saleRuns } from "../price-list";

export interface PageSection {
  /** Short name for reports and screenshots. */
  name: string;
  /** CSS selector, the same on the prototype and on the Next.js build. */
  selector: string;
  /** Share of pixels allowed to differ; raise it only for sections with photos served resized. */
  pixelRatio?: number;
  /** Window widths the section exists at (some blocks are phone or desktop only); every width when left out. */
  widths?: (width: number) => boolean;
  /** Runs on both pages once the section is on screen, to put it in the state to compare. */
  prepare?: (page: Page) => Promise<unknown>;
  /**
   * The section shows WooCommerce's prices, offer tags or the checkout code. While a sale campaign runs these
   * are the campaign's and cannot match the prototype's fixed price list: the section is skipped until it ends.
   */
  prices?: boolean;
}

interface PageParityOptions {
  name: string;
  paths: PagePaths;
  /** How many <section> elements <main> must hold. */
  sectionCount: number;
  sections: PageSection[];
  /**
   * Sections (by id, or by `aria-labelledby`) that differ from the prototype on purpose: the outline
   * compares neither their height nor their share of the page's total height.
   */
  differs?: string[];
  /** Sections (same naming as `differs`) whose height follows WooCommerce's prices: left out of the outline while a sale campaign runs. */
  priceSections?: string[];
  /**
   * The page is mostly prices (Pricing, Promotion): while a sale campaign runs nothing on it is compared, since
   * the sections after the price list also sit a pixel off when its height differs.
   */
  pricePage?: boolean;
}

/**
 * The standard comparison of a whole page, at every window size: the page's outline (its sections, their
 * order and heights, the footer, the total height), then each listed section scrolled to the top of the
 * window, measured element by element and compared pixel by pixel.
 */
export function pageParity({ name, paths, sectionCount, sections, differs = [], priceSections = [], pricePage = false }: PageParityOptions): void {
  for (const vp of VIEWPORTS) {
    test.describe(`${name} page parity @ ${vp.name}`, () => {
      let legacy: Page;
      let next: Page;
      let sale = false;

      test.beforeAll(async ({ browser }) => {
        sale = await saleRuns().catch(() => false);
        test.skip(sale && pricePage, "a sale campaign is running: this page shows its prices and tags, which the prototype's fixed price list does not have");
        [legacy, next] = await Promise.all([open(browser, "legacy", vp, "", paths), open(browser, "next", vp, "", paths)]);
        await hideFloats(legacy, next);
      });
      test.afterAll(async () => {
        await legacy?.context().close();
        await next?.context().close();
      });

      test("outline: sections, order, heights", async () => {
        const outline = (skip: string[]) => {
          const all = Array.from(document.querySelectorAll<HTMLElement>("main > section")).map((s) => ({ key: s.id || s.getAttribute("aria-labelledby"), height: s.offsetHeight }));
          const skipped = all.filter((s) => skip.includes(String(s.key)));
          return {
            sections: all.map((s) => (skipped.includes(s) ? `${s.key}:(differs)` : `${s.key}:${Math.round(s.height)}`)),
            footer: Math.round((document.querySelector("footer") as HTMLElement).offsetHeight),
            total: Math.round(document.documentElement.scrollHeight - skipped.reduce((n, s) => n + s.height, 0)),
          };
        };
        /* Lazy images without stated dimensions take no room in the prototype until they arrive, while the
           migrated page reserves it: compare the settled layout, once every image in <main> has loaded. */
        const settle = (p: Page) =>
          p.evaluate(async () => {
            const wait = Array.from(document.querySelectorAll<HTMLImageElement>("main img")).map((img) => {
              img.loading = "eager";
              return img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; setTimeout(r, 15_000); });
            });
            await Promise.all(wait);
          });
        await Promise.all([settle(legacy), settle(next)]);
        await Promise.all([legacy.waitForTimeout(300), next.waitForTimeout(300)]);
        const skip = sale ? [...differs, ...priceSections] : differs;
        const a = await legacy.evaluate(outline, skip);
        const b = await next.evaluate(outline, skip);
        expect(a.sections.length).toBe(sectionCount);
        expect(b).toEqual(a);
      });

      for (const s of sections) {
        if (s.widths && !s.widths(vp.width)) continue;
        test(`section: ${s.name}`, async ({}, testInfo) => {
          test.skip(sale && !!s.prices, "a sale campaign is running: this section shows its prices and tags, which the prototype's fixed price list does not have");
          const [a, b] = [await showSection(legacy, s.selector), await showSection(next, s.selector)];
          /* a section bar (treatment pages) slides its current link to the middle after each scroll: let it settle */
          if (await next.locator(".tx-nav-scroll").count()) await Promise.all([legacy.waitForTimeout(350), next.waitForTimeout(350)]);
          if (s.prepare) {
            await s.prepare(legacy);
            await s.prepare(next);
            await legacy.mouse.move(2, 2);
            await next.mouse.move(2, 2);
            await legacy.waitForTimeout(700);
            await next.waitForTimeout(700);
          }
          const fa = await fingerprint(legacy, s.selector);
          const fb = await fingerprint(next, s.selector);
          /* a page scrolls to whole pixels: when what lies above the section differs in height by a fraction (or, during
             a sale, by a price row), the section sits up to a pixel higher or lower in the window. Measured from its own top */
          const [ya, yb] = await Promise.all([legacy, next].map((p) => p.locator(s.selector).first().evaluate((el) => el.getBoundingClientRect().top)));
          const shift = Math.abs(yb - ya) <= 1.01 ? yb - ya : 0;
          if (shift) for (const m of fb) m.rect[1] = Math.round((m.rect[1] - shift) * 2) / 2;
          const d = diff(fa, fb);
          report(`${vp.name}-${name}-${s.name}`, d);
          expect(fa.length, "elements measured").toBeGreaterThan(3);
          expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
          if (!s.prepare) expect(b, "section height").toBe(a);
          const box = (await next.locator(s.selector).first().boundingBox())!;
          const top = Math.max(0, Math.round(box.y));
          const height = Math.max(40, Math.min(vp.height - top, Math.round(box.height)));
          const legacyTop = Math.max(0, Math.round(top - shift));
          await expectSamePixels(testInfo, `${vp.name}-${name}-${s.name}`, legacy, next, { x: 0, y: top, width: vp.width, height }, s.pixelRatio ?? 0.002, { x: 0, y: legacyTop, width: vp.width, height: Math.min(height, vp.height - legacyTop) });
        });
      }
    });
  }
}
