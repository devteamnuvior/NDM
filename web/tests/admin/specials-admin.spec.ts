import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * The two card lists of the price list's management screen (the Pricing page's Monthly specials, and the
 * offers carousel of the home and Promotion pages), end to end against the local WordPress + WooCommerce
 * (see ../cms): a treatment is searched and added, its card renamed and moved, another card removed; the
 * public page follows at once and the other list stays as it was; then the list is put back.
 *
 * It changes the live list while it runs (and puts it back): npm run build && npm run test:admin
 */

const CMS = path.resolve(__dirname, "../../../cms");
const LISTS = [
  { kind: "specials", option: "ndm_pricing_specials", name: "Monthly specials", page: "/pricing", cards: "#specials li", other: { page: "/promotion", cards: ".sw-card" } },
  { kind: "carousel", option: "ndm_pricing_carousel", name: "the carousel", page: "/promotion", cards: ".sw-card", other: { page: "/pricing", cards: "#specials li" } },
] as const;
const env = Object.fromEntries(
  readFileSync(path.join(CMS, ".env"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const secret = /^REVALIDATE_SECRET=(.+)$/m.exec(readFileSync(path.resolve(__dirname, "../../.env.local"), "utf8"))?.[1].trim() ?? "";

const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();

/** Each list as it was stored before the test; null when it had never been saved (it then follows the offers). */
const stored: Record<string, string | null> = {};

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(180_000);

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  for (const { option } of LISTS) {
    try {
      stored[option] = wp("option", "get", option, "--format=json");
    } catch {
      stored[option] = null;
    }
  }
});

/** A request to the site; a connection the server has already closed is tried again. */
async function ask(url: string, init?: RequestInit) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await (await fetch(url, { ...init, headers: { ...init?.headers, connection: "close" } })).text();
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

async function restore() {
  for (const { option } of LISTS) {
    const was = stored[option];
    if (was === null) {
      try {
        wp("option", "delete", option);
      } catch {
        /* never saved */
      }
    } else {
      wp("option", "update", option, was, "--format=json");
    }
  }
  wp("transient", "delete", "ndm_pricing_public_tree");
  /* told this way the site serves its old page once more while it reads the new list: ask for it, so the next visit is fresh */
  await ask(`${NEXT_URL}/api/revalidate`, { method: "POST", headers: { "content-type": "application/json", "x-ndm-revalidate": secret }, body: JSON.stringify({ tag: "pricing" }) });
  for (const { page } of LISTS) await ask(`${NEXT_URL}${page}`);
}

test.afterAll(restore);

async function signIn(page: Page) {
  await page.goto(`${NEXT_URL}/manage/pricing`);
  await page.getByRole("link", { name: "Sign in with WordPress" }).click();
  await page.waitForURL(/wp-login\.php/);
  await page.locator("#user_login").fill(env.WP_ADMIN_USER);
  await page.locator("#user_pass").fill(env.WP_ADMIN_PASSWORD);
  await page.locator("#wp-submit").click();
  await page.waitForURL(/authorize-application\.php/);
  await page.locator("#approve").click();
  await page.waitForURL(/\/manage\/pricing(\?.*)?$/);
}

const cardsOf = async (page: Page, where: { page: string; cards: string }) => {
  await page.goto(`${NEXT_URL}${where.page}`);
  await expect(page.locator(where.cards).first()).toBeAttached();
  return page.locator(where.cards).evaluateAll((list) => list.map((li) => (li.textContent ?? "").replace(/\s+/g, " ").trim()));
};

for (const list of LISTS) test(`an administrator adds, renames, moves and removes cards of ${list.name}; ${list.page} follows`, async ({ page, browser }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const visitor = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  /* starts from what WooCommerce holds now, not from an earlier run's page */
  await restore();
  await expect.poll(async () => (await cardsOf(visitor, list)).join(), { timeout: 30_000 }).not.toContain("Zz Special");
  const before = await cardsOf(visitor, list);
  expect(before.length).toBeGreaterThan(2);
  const otherBefore = await cardsOf(visitor, list.other);

  await signIn(page);
  const status = page.getByRole("status").first();
  await expect(status).toHaveText("All changes saved", { timeout: 30_000 });
  const section = page.locator(`#${list.kind}`);
  const rows = section.locator("li[data-row]");
  /* the screen lists the page's own cards, in the page's order */
  await expect(rows).toHaveCount(before.length);
  const last = (await rows.last().locator("span.font-aeonik").first().textContent())!.trim();
  expect(before[before.length - 1]).toContain(last);

  /* search WooCommerce and add a treatment that has no card yet */
  await section.getByPlaceholder("Search WooCommerce products by name").fill("Dysport");
  await section.getByRole("button", { name: "Search" }).click();
  const add = section.getByRole("button", { name: `Add to ${list.name}` });
  await expect(add.first()).toBeVisible();
  await add.first().click();
  await expect(rows).toHaveCount(before.length + 1);
  await expect(status).toHaveText("1 unsaved change");

  /* its card gets a title of its own and moves up one place */
  await rows.last().getByRole("button", { name: /^Edit the .+ card$/ }).click();
  await section.getByLabel("Card title").fill("Zz Special");
  await section.getByRole("button", { name: "Move Zz Special up" }).click();
  await expect(rows.nth(before.length - 1)).toContainText("Zz Special");
  await expect(rows.nth(before.length - 1)).toContainText(/From \$\d/);

  /* the card that was last is removed; a treatment already on the list is not offered again */
  await section.getByRole("button", { name: `Edit the ${last} card` }).click();
  await section.getByRole("button", { name: `Remove from ${list.name}` }).click();
  await expect(rows).toHaveCount(before.length);

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(status).toHaveText("All changes saved", { timeout: 60_000 });
  await expect(rows).toHaveCount(before.length);
  await expect(rows.last()).toContainText("Zz Special");

  /* the public page shows the new list on its next visit; the other cards are untouched */
  const after = await cardsOf(visitor, list);
  expect(after.slice(0, -1)).toEqual(before.slice(0, -1));
  expect(after[after.length - 1]).toContain("Zz Special");
  expect(after[after.length - 1]).toMatch(/\$\s?[\d.]+/);
  /* the other list is a list of its own: its page did not change */
  expect(await cardsOf(visitor, list.other)).toEqual(otherBefore);

  /* a reload reads the saved list back from WooCommerce */
  await page.reload();
  await expect(rows.last()).toContainText("Zz Special");

  await restore();
  await expect.poll(() => cardsOf(visitor, list), { timeout: 30_000 }).toEqual(before);
  expect(errors).toEqual([]);
});
