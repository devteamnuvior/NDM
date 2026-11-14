import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { diff, fingerprint } from "./fingerprint";
import { open, report, shot, VIEWPORTS } from "./helpers";

/**
 * Home hero parity. Two checks at every window size:
 *   1. every visible element of the hero is measured on the prototype and on the Next.js build
 *      (position, size, font, colours, spacing);
 *   2. a screenshot of the first screen (announcement bar, header and hero over the film's poster)
 *      is compared pixel by pixel.
 */
for (const vp of VIEWPORTS) {
  test.describe(`hero parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    test("every element matches", async () => {
      const a = await fingerprint(legacy, "#top");
      const b = await fingerprint(next, "#top");
      expect(a.length).toBeGreaterThan(40);
      const d = diff(a, b);
      report(`${vp.name}-hero`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    });

    test("first screen matches pixel by pixel", async ({}, testInfo) => {
      const name = `${vp.name}-first-screen.png`;
      /* The phone search button steps up above the brand band. The prototype only works that out on the
         first scroll event (its first measurement runs before its styles exist); the new page has it right
         from the start. A scroll event with no movement puts both in the settled state. */
      for (const p of [legacy, next]) {
        await p.evaluate(() => window.dispatchEvent(new Event("scroll")));
        await p.waitForTimeout(700);
      }
      const original = await shot(legacy, `${vp.name}-hero-legacy`);
      const migrated = await shot(next, `${vp.name}-hero-next`);
      /* the prototype's screenshot is the reference the new page is held to */
      const reference = testInfo.snapshotPath(name);
      mkdirSync(dirname(reference), { recursive: true });
      writeFileSync(reference, original);
      expect(migrated).toMatchSnapshot(name, { maxDiffPixelRatio: 0.001 });
    });
  });
}
