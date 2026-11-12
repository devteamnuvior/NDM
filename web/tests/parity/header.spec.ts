import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { open, report, shot, VIEWPORTS } from "./helpers";

/**
 * Header parity: the original prototype's home page and the Next.js home page are opened at the same
 * window size, put in the same state, and every visible element of the header is measured on both
 * (position, size, font, colours, spacing). Any difference above one pixel fails the test.
 */

const BAR = '[aria-label="Clinic announcements"]';
const HEADER = "header";

/** Scrolls until the header is over a light section, as on any inner page. */
async function toLight(page: Page): Promise<void> {
  await page.evaluate(() => {
    const hero = document.querySelector('[data-nav="dark"]') as HTMLElement;
    window.scrollTo(0, hero.offsetTop + hero.offsetHeight + 40);
  });
  await page.waitForFunction(() => getComputedStyle(document.querySelector("header > div.hdr-bar")!).color === "rgb(51, 51, 51)", null, { timeout: 15_000 });
  await page.waitForTimeout(700);
}

for (const vp of VIEWPORTS) {
  test.describe(`header parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    const both = async (fn: (p: Page) => Promise<unknown>) => {
      await fn(legacy);
      await fn(next);
    };
    const compare = async (name: string, roots: string) => {
      const d = diff(await fingerprint(legacy, roots), await fingerprint(next, roots));
      report(`${vp.name}-${name}`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    };
    const strip = { x: 0, y: 0, width: vp.width, height: 130 };

    test("dark tone, top of the page", async () => {
      await both((p) => shot(p, `${vp.name}-dark-${p === legacy ? "legacy" : "next"}`, strip));
      await compare("dark", `${BAR}, ${HEADER}`);
    });

    test("light tone, over the page content", async () => {
      await both(toLight);
      await both((p) => shot(p, `${vp.name}-light-${p === legacy ? "legacy" : "next"}`, strip));
      await compare("light", `${BAR}, ${HEADER}`);
    });

    if (vp.width >= 1280) {
      for (const menu of ["Procedures", "Concerns", "About"] as const) {
        test(`${menu} dropdown`, async () => {
          await both(async (p) => {
            await p.mouse.move(5, 400);
            await p.getByRole("button", { name: menu, exact: true }).hover();
            await p.waitForTimeout(900);
            await shot(p, `${vp.name}-menu-${menu.toLowerCase()}-${p === legacy ? "legacy" : "next"}`);
          });
          await compare(`menu-${menu.toLowerCase()}`, HEADER);
          await both(async (p) => {
            await p.keyboard.press("Escape");
            await p.mouse.move(5, 700);
            await p.waitForTimeout(700);
          });
        });
      }

      test("search overlay", async () => {
        await both(async (p) => {
          await p.locator("header").getByRole("button", { name: "Search treatments" }).click();
          await p.waitForTimeout(900);
          await p.locator("#site-search").fill("acne");
          await p.waitForTimeout(300);
          await shot(p, `${vp.name}-search-${p === legacy ? "legacy" : "next"}`);
        });
        await compare("search", '[role="dialog"][aria-label="Search treatments"]');
        await both(async (p) => {
          await p.keyboard.press("Escape");
          await p.waitForTimeout(700);
        });
      });
    } else {
      test("menu drawer", async () => {
        await both(async (p) => {
          await p.getByRole("button", { name: "Open menu" }).click();
          await p.waitForTimeout(900);
          await p.getByRole("dialog", { name: "Menu" }).getByRole("button", { name: "Procedures" }).click();
          await p.getByRole("dialog", { name: "Menu" }).getByRole("button", { name: "Injectables" }).click();
          await p.waitForTimeout(300);
          await shot(p, `${vp.name}-drawer-${p === legacy ? "legacy" : "next"}`);
        });
        await compare("drawer", '[role="dialog"][aria-label="Menu"]');
        await both(async (p) => {
          await p.getByRole("button", { name: "Close menu" }).click();
          await p.waitForTimeout(700);
        });
      });
    }
  });
}
