import { expect, test } from "@playwright/test";
import { open, VIEWPORTS } from "./helpers";

/** The home page as a whole: the same sections in the same order, and the same total height, at every window size. */
for (const vp of VIEWPORTS) {
  test(`home page structure and height @ ${vp.name}`, async ({ browser }) => {
    const [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    const outline = () => ({
      sections: Array.from(document.querySelectorAll("main > section")).map((s) => `${s.id || s.getAttribute("aria-labelledby")}:${Math.round((s as HTMLElement).offsetHeight)}`),
      footer: Math.round((document.querySelector("footer") as HTMLElement).offsetHeight),
      total: document.documentElement.scrollHeight,
    });
    const a = await legacy.evaluate(outline);
    const b = await next.evaluate(outline);
    expect(a.sections.length).toBe(17);
    expect(b).toEqual(a);
    await legacy.context().close();
    await next.context().close();
  });
}
