import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * The price list's management screen, end to end against the local WordPress + WooCommerce (see ../cms):
 * who gets in, that changes land in WooCommerce without changing any ID, that the public Pricing page
 * follows at once, and that everything can be put back. Needs the cms containers running.
 *
 * It changes the live price list while it runs (and puts it back), so it is kept out of the normal run:
 *   npm run build && npm run test:admin
 */

const CMS = path.resolve(__dirname, "../../../cms");
const WP = "http://localhost:8080";
const env = Object.fromEntries(
  readFileSync(path.join(CMS, ".env"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const VISITOR = { login: "ndm-test-visitor", password: `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}` };
const TEST_CATEGORY = "Zz Test Category";

const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(180_000);

test.beforeAll(() => {
  try {
    wp("user", "get", VISITOR.login, "--field=ID");
  } catch {
    wp("user", "create", VISITOR.login, "visitor@example.test", "--role=subscriber");
  }
  wp("user", "update", VISITOR.login, `--user_pass=${VISITOR.password}`, "--skip-email");
});

test.afterAll(() => {
  /* the screen never deletes anything, so the test's own category is removed here */
  try {
    const id = wp("term", "list", "product_cat", "--slug=zz-test-category", "--field=term_id");
    if (id) wp("term", "delete", "product_cat", id);
  } catch {
    /* nothing to clean up */
  }
  try {
    /* the option the test added and removed sits in WooCommerce's trash */
    const trashed = wp("post", "list", "--post_type=product_variation", "--post_status=trash", "--format=ids");
    if (trashed) wp("post", "delete", ...trashed.split(/\s+/), "--force");
  } catch {
    /* nothing in the trash */
  }
  try {
    wp("user", "delete", VISITOR.login, "--yes");
  } catch {
    /* already gone */
  }
});

async function signIn(page: Page, login: string, password: string) {
  await page.goto(`${NEXT_URL}/manage/pricing`);
  await page.getByRole("link", { name: "Sign in with WordPress" }).click();
  await page.waitForURL(/wp-login\.php/);
  await page.locator("#user_login").fill(login);
  await page.locator("#user_pass").fill(password);
  await page.locator("#wp-submit").click();
  await page.waitForURL(/authorize-application\.php/);
  await page.locator("#approve").click();
  await page.waitForURL(/\/manage\/pricing(\?.*)?$/);
}

const botox = (page: Page) => page.locator("#pg-botox-dysport");
async function openBotox(page: Page) {
  await page.goto(`${NEXT_URL}/pricing`);
  await page.locator("#pg-botox-dysport-h").click();
  await page.locator("#pr-botox-dysport-0-h").click();
}

test("WordPress can tell the site to drop its cached price list", async ({ request }) => {
  /* also makes sure this run starts from what WooCommerce holds now, not from an earlier run's page */
  const secret = /^REVALIDATE_SECRET=(.+)$/m.exec(readFileSync(path.resolve(__dirname, "../../.env.local"), "utf8"))?.[1].trim() ?? "";
  const ok = await request.post(`${NEXT_URL}/api/revalidate`, { data: { tag: "pricing" }, headers: { "x-ndm-revalidate": secret } });
  expect(ok.status()).toBe(200);
  /* only the tags it knows */
  expect((await request.post(`${NEXT_URL}/api/revalidate`, { data: { tag: "everything" }, headers: { "x-ndm-revalidate": secret } })).status()).toBe(400);
});

test("visitors get the sign-in only, and the WordPress routes refuse them", async ({ page, request }) => {
  const response = await page.goto(`${NEXT_URL}/manage/pricing`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Sign in to manage prices" })).toBeVisible();
  await expect(page.getByText("Save changes")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  for (const route of ["me", "tree", "products"]) {
    expect((await request.get(`${WP}/wp-json/ndm/v1/pricing/admin/${route}`)).status()).toBe(401);
  }
  expect((await request.post(`${WP}/wp-json/ndm/v1/pricing/admin/save`, { data: { products: [{ id: 18, name: "x" }] } })).status()).toBe(401);
  /* a made-up cookie opens nothing */
  await page.context().addCookies([{ name: "ndm_pricing_admin", value: "bm90LWEtc2Vzc2lvbg", url: `${NEXT_URL}/manage` }]);
  await page.goto(`${NEXT_URL}/manage/pricing`);
  await expect(page.getByRole("heading", { name: "Sign in to manage prices" })).toBeVisible();
  /* the cache-clearing route needs its secret */
  expect((await request.post(`${NEXT_URL}/api/revalidate`, { data: { tag: "pricing" } })).status()).toBe(401);
  expect((await request.post(`${NEXT_URL}/api/revalidate`, { data: { tag: "pricing" }, headers: { "x-ndm-revalidate": "wrong".repeat(13) } })).status()).toBe(401);
});

test("a WordPress account without the right to manage WooCommerce is turned away", async ({ page }) => {
  /* WooCommerce keeps such accounts out of wp-admin, so they cannot even reach the approval screen... */
  await page.goto(`${NEXT_URL}/manage/pricing`);
  await page.getByRole("link", { name: "Sign in with WordPress" }).click();
  await page.waitForURL(/wp-login\.php/);
  await page.locator("#user_login").fill(VISITOR.login);
  await page.locator("#user_pass").fill(VISITOR.password);
  await page.locator("#wp-submit").click();
  await page.waitForLoadState("load");
  expect(page.url()).not.toContain("authorize-application.php");
  await page.context().clearCookies();

  /* ...and if one arrived with an application password of its own anyway, this site refuses it */
  const password = wp("user", "application-password", "create", VISITOR.login, "pricing-admin-test", "--porcelain");
  const start = await page.request.get(`${NEXT_URL}/manage/pricing/auth/start`, { maxRedirects: 0 });
  expect(start.status()).toBe(303);
  const success = new URL(new URL(start.headers().location).searchParams.get("success_url")!);
  expect(success.origin + success.pathname).toBe(`${NEXT_URL}/manage/pricing/auth/callback`);
  success.searchParams.set("site_url", WP);
  success.searchParams.set("user_login", VISITOR.login);
  success.searchParams.set("password", password);
  await page.goto(success.toString());
  await expect(page).toHaveURL(`${NEXT_URL}/manage/pricing?problem=forbidden`);
  await expect(page.getByRole("alert").filter({ hasText: "may not manage the price list" })).toBeVisible();
  await expect(page.getByText("Save changes")).toHaveCount(0);
  /* the access it arrived with is taken away again in WordPress */
  expect(wp("user", "application-password", "list", VISITOR.login, "--format=count")).toBe("0");

  /* an answer that does not belong to a sign-in this browser started is refused as well */
  const admin = wp("user", "application-password", "create", env.WP_ADMIN_USER, "pricing-admin-test", "--porcelain");
  await page.goto(`${NEXT_URL}/manage/pricing/auth/callback?state=made-up&site_url=${encodeURIComponent(WP)}&user_login=${env.WP_ADMIN_USER}&password=${admin}`);
  await expect(page).toHaveURL(`${NEXT_URL}/manage/pricing?problem=expired`);
  await expect(page.getByText("Save changes")).toHaveCount(0);
  /* only the one made here: an administrator who is signed in on the screen stays signed in */
  const mine = wp("user", "application-password", "list", env.WP_ADMIN_USER, "--name=pricing-admin-test", "--field=uuid");
  for (const uuid of mine.split(/\s+/).filter(Boolean)) wp("user", "application-password", "delete", env.WP_ADMIN_USER, uuid);
});

test("an administrator edits, previews, saves and restores; IDs stay; the public page follows", async ({ page, browser }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const visitor = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await openBotox(visitor);
  const firstRow = visitor.locator("#pr-botox-dysport-0");
  await expect(firstRow.locator(".pr-opt")).toHaveCount(5);
  const productId = await firstRow.locator(".pr-opt").nth(1).getAttribute("data-product");
  const variationId = await firstRow.locator(".pr-opt").nth(1).getAttribute("data-variation");
  expect(Number(productId)).toBeGreaterThan(0);
  expect(Number(variationId)).toBeGreaterThan(0);

  await signIn(page, env.WP_ADMIN_USER, env.WP_ADMIN_PASSWORD);
  await expect(page.getByText("Pricing manager").first()).toBeVisible();
  await expect(page.getByRole("status").first()).toHaveText("All changes saved");
  const list = page.locator("#prices");
  const groups = list.locator(".pr-group");
  await expect(groups).toHaveCount(24); /* 23 on the page + WooCommerce's Uncategorized */
  /* the screen is the Pricing page's own list: same order, same boxes */
  await expect(groups.nth(0)).toContainText("Aptos Thread Method");
  await expect(groups.nth(1)).toContainText("From $7.70 / unit");
  const group = (name: string) => groups.filter({ has: page.locator("h3", { hasText: name }) });
  const botoxGroup = group("Botox / Dysport");
  const save = async () => {
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved to WooCommerce")).toBeVisible({ timeout: 40_000 });
    await expect(page.getByRole("status").first()).toHaveText("All changes saved");
  };

  /* --- the pencil on a treatment and on its options: a name, a label, an option's visibility --- */
  await botoxGroup.getByRole("button", { name: /treatments Botox \/ Dysport/ }).click();
  const item = botoxGroup.locator(".pr-item").first();
  await item.getByRole("button", { name: "Edit Botox Cosmetic", exact: true }).click();
  await item.getByLabel("Product name").fill("Botox Cosmetic Test");
  await item.getByRole("button", { name: "Edit 60 units", exact: true }).click();
  await item.getByLabel("Promotional label, 60 units").fill("Best Value");
  /* its price too: the regular and the sale price are WooCommerce's own fields */
  await item.getByLabel("Regular price, 60 units").fill("730");
  await item.getByLabel("Sale price, 60 units").fill("900");
  await expect(item.getByRole("alert")).toContainText("the sale price must be lower than the regular price");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await item.getByLabel("Sale price, 60 units").fill("650");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  await item.getByRole("button", { name: "Edit 120 units", exact: true }).click();
  await item.getByRole("switch", { name: "Show 120 units on the Pricing page" }).click();
  await expect(page.getByRole("status").first()).toHaveText("3 unsaved changes");
  /* --- rearranging: an option with its arrow, a category by dragging its handle --- */
  await item.getByRole("button", { name: "Move 220 units up" }).click();
  await expect(item.locator(".pr-opt").nth(3)).toContainText("220 units");
  /* --- a new option: a name and a price --- */
  await item.getByRole("button", { name: "Add an option" }).click();
  await item.getByLabel(/^Option name/).fill("Zz test option");
  await item.getByLabel("Regular price, Zz test option").fill("999");
  await expect(page.getByRole("status").first()).toHaveText("4 unsaved changes");
  /* (folded first, so handle and target are on screen together: the test's pointer cannot scroll mid-drag) */
  await botoxGroup.getByRole("button", { name: /treatments Botox \/ Dysport/ }).click();
  await page.getByRole("img", { name: "Drag to move Laser Vein" }).dragTo(groups.nth(0).locator("h3"), { targetPosition: { x: 300, y: 4 } });
  await botoxGroup.getByRole("button", { name: /treatments Botox \/ Dysport/ }).click();
  await expect(groups.nth(0)).toContainText("Laser Vein");
  await expect(groups.nth(1)).toContainText("Aptos Thread Method");
  await expect(page.getByRole("status").first()).toHaveText("5 unsaved changes");

  /* --- the preview shows the draft; the public page does not yet --- */
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  const preview = page.getByRole("dialog", { name: "Preview of the Pricing page" });
  await expect(preview).toContainText("Includes 5 unsaved changes");
  await expect(preview.locator(".pr-group").first()).toContainText("Laser Vein");
  await preview.locator("#pg-botox-dysport-h").click();
  await preview.locator("#pr-botox-dysport-0-h").click();
  await expect(preview.locator("#pr-botox-dysport-0-h")).toContainText("Botox Cosmetic Test");
  await expect(preview.locator("#pr-botox-dysport-0 .pr-opt")).toHaveCount(5);
  await expect(preview.locator("#pr-botox-dysport-0 .pr-opt").nth(1)).toContainText("Best Value");
  await expect(preview.locator("#pr-botox-dysport-0 .pr-opt").nth(1)).toContainText("now $650");
  await expect(preview.locator("#pr-botox-dysport-0 .pr-opt").last()).toContainText("Zz test option");
  await expect(preview.locator("#pr-botox-dysport-0 .pr-opt").last()).toContainText("$999");
  await expect(preview.locator("#pr-botox-dysport-0 .pr-opt").nth(2)).toContainText("220 units");
  await preview.getByRole("button", { name: "Close preview" }).click();
  await openBotox(visitor);
  await expect(visitor.locator("#pr-botox-dysport-0-h")).toContainText("Botox Cosmetic");
  await expect(visitor.locator("#pr-botox-dysport-0-h")).not.toContainText("Test");
  await expect(visitor.locator("#prices .pr-group").first()).toContainText("Aptos Thread Method");

  /* --- save: WooCommerce has it, the public page shows it at once, with the same IDs --- */
  await save();
  expect(wp("post", "get", productId!, "--field=post_title")).toBe("Botox Cosmetic Test");
  await openBotox(visitor);
  await expect(visitor.locator("#prices .pr-group").first()).toContainText("Laser Vein");
  await expect(visitor.locator("#pr-botox-dysport-0-h")).toContainText("Botox Cosmetic Test");
  await expect(firstRow.locator(".pr-opt")).toHaveCount(5);
  await expect(firstRow.locator(".pr-opt").nth(1)).toContainText("Best Value");
  await expect(firstRow.locator(".pr-opt").nth(1)).toContainText("Regular price $730");
  await expect(firstRow.locator(".pr-opt").nth(1)).toContainText("now $650");
  expect(wp("post", "meta", "get", variationId!, "_sale_price")).toBe("650"); /* the price is in WooCommerce itself */
  await expect(firstRow.locator(".pr-opt").last()).toContainText("Zz test option");
  await expect(firstRow.locator(".pr-opt").last()).toContainText("$999");
  expect(Number(await firstRow.locator(".pr-opt").last().getAttribute("data-variation"))).toBeGreaterThan(0); /* a real WooCommerce variation */
  await expect(firstRow.locator(".pr-opt").nth(2)).toContainText("220 units");
  expect(await firstRow.locator(".pr-opt").nth(1).getAttribute("data-product")).toBe(productId);
  expect(await firstRow.locator(".pr-opt").nth(1).getAttribute("data-variation")).toBe(variationId);

  /* --- a new category with a product found by search, moved to the top --- */
  await page.getByRole("button", { name: "New category" }).click();
  const fresh = groups.last();
  await fresh.getByLabel("Category name").fill(TEST_CATEGORY);
  await fresh.getByLabel(/^Description/).fill("A category made by the test.");
  await fresh.getByPlaceholder("Search WooCommerce products by name").fill("Hyperhidrosis");
  await fresh.getByRole("button", { name: "Search", exact: true }).click();
  await fresh.getByRole("button", { name: "Add to category" }).first().click();
  for (let i = 0; i < 24; i++) await page.getByRole("button", { name: `Move ${TEST_CATEGORY} up` }).click();
  await expect(groups.first()).toContainText(TEST_CATEGORY);
  await save();
  await visitor.goto(`${NEXT_URL}/pricing`);
  await expect(visitor.locator("#prices .pr-group")).toHaveCount(24);
  await expect(visitor.locator("#prices .pr-group").first()).toContainText(TEST_CATEGORY);
  /* the product keeps its ID and still sits in its first category too */
  await expect(visitor.locator("#pg-botox-dysport .pr-item")).toHaveCount(3);

  /* --- put everything back --- */
  const mine = group(TEST_CATEGORY);
  if ((await mine.getByRole("switch", { name: "Show this category on the Pricing page" }).count()) === 0) await mine.getByRole("button", { name: `Edit ${TEST_CATEGORY}`, exact: true }).click();
  await mine.getByRole("switch", { name: "Show this category on the Pricing page" }).click();
  await mine.getByRole("button", { name: "Edit Hyperhidrosis", exact: true }).click();
  await mine.getByRole("button", { name: "Remove from this category" }).click();
  await page.getByRole("button", { name: "Move Laser Vein down" }).click(); /* after Aptos */
  await page.getByRole("button", { name: "Move Laser Vein down" }).click(); /* after Botox / Dysport: where it was */
  await item.getByRole("button", { name: "Edit 60 units", exact: true }).click();
  await item.getByLabel("Promotional label, 60 units").fill("10%\u00a0OFF");
  await item.getByLabel("Regular price, 60 units").fill("720");
  await item.getByLabel("Sale price, 60 units").fill("648");
  /* removing an option asks first, then its variation goes to WooCommerce's trash on save */
  await item.getByRole("button", { name: "Edit Zz test option", exact: true }).click();
  page.once("dialog", (d) => void d.accept());
  await item.getByRole("button", { name: "Remove this option" }).click();
  await expect(item.locator(".pr-opt")).toHaveCount(5);
  await item.getByRole("button", { name: "Edit 120 units", exact: true }).click();
  await item.getByRole("switch", { name: "Show 120 units on the Pricing page" }).click();
  await item.getByRole("button", { name: "Move 220 units down" }).click();
  await item.getByRole("button", { name: "Edit Botox Cosmetic Test", exact: true }).click();
  await item.getByLabel("Product name").fill("Botox Cosmetic");
  await save();
  await openBotox(visitor);
  await expect(visitor.locator("#prices .pr-group")).toHaveCount(23);
  await expect(visitor.locator("#prices .pr-group").nth(0)).toContainText("Aptos Thread Method");
  await expect(visitor.locator("#prices .pr-group").nth(2)).toContainText("Laser Vein");
  await expect(visitor.locator("#pr-botox-dysport-0-h")).toContainText("Botox Cosmetic");
  await expect(visitor.locator("#pr-botox-dysport-0-h")).not.toContainText("Test");
  await expect(firstRow.locator(".pr-opt")).toHaveCount(5);
  await expect(firstRow.locator(".pr-opt").nth(1)).toContainText("Regular price $720");
  await expect(firstRow.locator(".pr-opt").nth(1)).toContainText("now $648");
  await expect(firstRow.locator(".pr-opt").nth(4)).toContainText("220 units");
  expect(wp("post", "list", "--post_type=product_variation", "--post_status=trash", `--post_parent=${productId}`, "--format=count")).toBe("1");
  await expect(botox(visitor).locator(".pr-item")).toHaveCount(3);
  expect(await firstRow.locator(".pr-opt").nth(1).getAttribute("data-variation")).toBe(variationId);

  /* --- sign out: the screen closes and WordPress forgets the access --- */
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to manage prices" })).toBeVisible();
  expect(wp("user", "application-password", "list", env.WP_ADMIN_USER, "--format=csv", "--fields=name")).not.toContain("NewDermaMed pricing manager");
  expect(errors).toEqual([]);
});
