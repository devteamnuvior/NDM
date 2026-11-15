import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * The Monthly specials section of the price list's management screen, end to end against the local
 * WordPress + WooCommerce (see ../cms): a treatment is searched and added, its card renamed and moved,
 * another card removed; the public Pricing page follows at once; then the list is put back.
 *
 * It changes the live list while it runs (and puts it back): npm run build && npm run test:admin
 */

const CMS = path.resolve(__dirname, "../../../cms");
const OPTION = "ndm_pricing_specials";
const env = Object.fromEntries(
  readFileSync(path.join(CMS, ".env"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const secret = /^REVALIDATE_SECRET=(.+)$/m.exec(readFileSync(path.resolve(__dirname, "../../.env.local"), "utf8"))?.[1].trim() ?? "";

const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();

/** The list as it was stored before the test; null when it had never been saved (it then follows the offers). */
let stored: string | null = null;

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(180_000);

test.beforeAll(() => {
  try {
    stored = wp("option", "get", OPTION, "--format=json");
  } catch {
    stored = null;
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
  if (stored === null) {
    try {
      wp("option", "delete", OPTION);
    } catch {
      /* never saved */
    }
  } else {
    wp("option", "update", OPTION, stored, "--format=json");
  }
  wp("transient", "delete", "ndm_pricing_public_tree");
  /* told this way the site serves its old page once more while it reads the new list: ask for it, so the next visit is fresh */
  await ask(`${NEXT_URL}/api/revalidate`, { method: "POST", headers: { "content-type": "application/json", "x-ndm-revalidate": secret }, body: JSON.stringify({ tag: "pricing" }) });
  await ask(`${NEXT_URL}/pricing`);
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

const cardsOf = async (page: Page) => {
  await page.goto(`${NEXT_URL}/pricing`);
  await expect(page.locator("#specials li").first()).toBeVisible();
  return page.locator("#specials li").evaluateAll((list) => list.map((li) => (li.textContent ?? "").replace(/\s+/g, " ").trim()));
};

test("an administrator adds, renames, moves and removes Monthly specials; the Pricing page follows", async ({ page, browser }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const visitor = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  /* starts from what WooCommerce holds now, not from an earlier run's page */
  await restore();
  await expect.poll(async () => (await cardsOf(visitor)).join(), { timeout: 30_000 }).not.toContain("Zz Special");
  const before = await cardsOf(visitor);
  expect(before.length).toBeGreaterThan(2);

  await signIn(page);
  const status = page.getByRole("status").first();
  await expect(status).toHaveText("All changes saved", { timeout: 30_000 });
  const section = page.locator("#specials");
  const rows = section.locator("li[data-row]");
  /* the screen lists the page's own cards, in the page's order */
  await expect(rows).toHaveCount(before.length);
  const last = (await rows.last().locator("span.font-aeonik").first().textContent())!.trim();
  expect(before[before.length - 1]).toContain(last);

  /* search WooCommerce and add a treatment that has no card yet */
  await section.getByPlaceholder("Search WooCommerce products by name").fill("Dysport");
  await section.getByRole("button", { name: "Search" }).click();
  const add = section.getByRole("button", { name: "Add to Monthly specials" });
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
  await section.getByRole("button", { name: "Remove from Monthly specials" }).click();
  await expect(rows).toHaveCount(before.length);

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(status).toHaveText("All changes saved", { timeout: 60_000 });
  await expect(rows).toHaveCount(before.length);
  await expect(rows.last()).toContainText("Zz Special");

  /* the public page shows the new list on its next visit; the other cards are untouched */
  const after = await cardsOf(visitor);
  expect(after.slice(0, -1)).toEqual(before.slice(0, -1));
  expect(after[after.length - 1]).toMatch(/From\$[\d.]+.*Zz SpecialBuy/);

  /* a reload reads the saved list back from WooCommerce */
  await page.reload();
  await expect(rows.last()).toContainText("Zz Special");

  await restore();
  await expect.poll(() => cardsOf(visitor), { timeout: 30_000 }).toEqual(before);
  expect(errors).toEqual([]);
});
