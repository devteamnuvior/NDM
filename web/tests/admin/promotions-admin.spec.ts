import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * The offers' management screen, end to end against the local WordPress + WooCommerce (see ../cms): who
 * gets in, that changes land in WooCommerce without changing any product, that the public Promotion
 * page follows at once, and that everything is put back. Needs the cms containers running.
 *
 * It changes the live offers while it runs (and puts them back), so it is kept out of the normal run:
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
const VISITOR = { login: "ndm-test-promo-visitor", password: `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}` };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
const php = (code: string) => wp("eval", code);

/** [product ID, its offer settings, its image ID] for every offer, and the newest media ID, before the run. */
let before = "";
let lastMedia = 0;

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(240_000);

test.beforeAll(() => {
  before = php('echo base64_encode(wp_json_encode(array_map(fn($o) => [$o["productId"], get_post_meta($o["productId"], "_ndm_promo", true), (int) get_post_thumbnail_id($o["productId"])], ndm_promotions(true))));');
  lastMedia = Number(php('global $wpdb; echo (int) $wpdb->get_var("SELECT MAX(ID) FROM $wpdb->posts");'));
  try {
    wp("user", "get", VISITOR.login, "--field=ID");
  } catch {
    wp("user", "create", VISITOR.login, "promo-visitor@example.test", "--role=subscriber");
  }
  wp("user", "update", VISITOR.login, `--user_pass=${VISITOR.password}`, "--skip-email");
});

test.afterAll(() => {
  /* the offers, their order and the products' images exactly as they were; the test's uploads deleted */
  php(
    `$was = json_decode(base64_decode("${before}"), true); $keep = array_column($was, 0);` +
      'foreach (get_posts(["post_type" => "product", "post_status" => "any", "meta_key" => "_ndm_promo", "posts_per_page" => -1, "fields" => "ids"]) as $id) { if (!in_array($id, $keep, true)) delete_post_meta($id, "_ndm_promo"); }' +
      'foreach ($was as [$id, $meta, $image]) { update_post_meta($id, "_ndm_promo", $meta); if ((int) get_post_thumbnail_id($id) !== $image) { $p = wc_get_product($id); $p->set_image_id($image); $p->save(); } }' +
      `foreach (get_posts(["post_type" => "attachment", "post_status" => "any", "posts_per_page" => -1, "fields" => "ids"]) as $id) { if ($id > ${lastMedia}) wp_delete_attachment($id, true); }` +
      "ndm_pricing_flush();",
  );
  try {
    wp("user", "delete", VISITOR.login, "--yes");
  } catch {
    /* already gone */
  }
});

async function signIn(page: Page) {
  await page.goto(`${NEXT_URL}/manage/promotions`);
  await page.getByRole("link", { name: "Sign in with WordPress" }).click();
  await page.waitForURL(/wp-login\.php/);
  await page.locator("#user_login").fill(env.WP_ADMIN_USER);
  await page.locator("#user_pass").fill(env.WP_ADMIN_PASSWORD);
  await page.locator("#wp-submit").click();
  await page.waitForURL(/authorize-application\.php/);
  await page.locator("#approve").click();
  /* back on the screen that asked, not on the price list */
  await page.waitForURL(/\/manage\/promotions(\?.*)?$/);
}

const cards = (page: Page) => page.locator("li[data-card]");
const publicTitles = async (page: Page) => {
  await page.goto(`${NEXT_URL}/promotion`);
  return page.locator('section[aria-labelledby="offers"] article.promo-card h3').allTextContents();
};
async function save(page: Page) {
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved." })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("All changes saved")).toBeVisible({ timeout: 30_000 });
}

test("visitors get the sign-in only; the WordPress routes and the photo upload refuse them", async ({ page, request }) => {
  await page.goto(`${NEXT_URL}/manage/promotions`);
  await expect(page.getByRole("heading", { name: "Sign in to manage offers" })).toBeVisible();
  await expect(page.getByText("Save changes")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  expect((await request.get(`${WP}/wp-json/ndm/v1/promotions/admin`)).status()).toBe(401);
  expect((await request.post(`${WP}/wp-json/ndm/v1/promotions/admin/save`, { data: { offers: [] } })).status()).toBe(401);
  /* the public list is public, and holds no management fields */
  const open = await request.get(`${WP}/wp-json/ndm/v1/promotions`);
  expect(open.status()).toBe(200);
  expect(JSON.stringify(await open.json())).not.toContain('"listed"');

  const photo = { name: "x.png", mimeType: "image/png", buffer: PNG };
  /* from another site: refused before anything else */
  expect((await request.post(`${NEXT_URL}/manage/promotions/photo`, { multipart: { photo }, headers: { origin: "https://example.com" } })).status()).toBe(403);
  /* from this site, without a session or with a made-up one */
  expect((await request.post(`${NEXT_URL}/manage/promotions/photo`, { multipart: { photo }, headers: { origin: NEXT_URL } })).status()).toBe(401);
  expect((await request.post(`${NEXT_URL}/manage/promotions/photo`, { multipart: { photo }, headers: { origin: NEXT_URL, "x-ndm-csrf": "made-up", cookie: "ndm_pricing_admin=bm90LWEtc2Vzc2lvbg" } })).status()).toBe(401);
});

test("a WordPress account without the right to manage WooCommerce changes nothing", async ({ request }) => {
  const password = wp("user", "application-password", "create", VISITOR.login, "promotions-admin-test", "--porcelain");
  const headers = { Authorization: `Basic ${Buffer.from(`${VISITOR.login}:${password}`).toString("base64")}` };
  expect((await request.get(`${WP}/wp-json/ndm/v1/promotions/admin`, { headers })).status()).toBe(403);
  expect((await request.post(`${WP}/wp-json/ndm/v1/promotions/admin/save`, { headers, data: { offers: [] } })).status()).toBe(403);
  expect((await (await request.get(`${WP}/wp-json/ndm/v1/promotions`)).json()).offers).toHaveLength(10);
});

test("an administrator edits, rearranges, removes, adds and uploads; products stay; the public page follows", async ({ page, browser }) => {
  const visitor = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const original = await publicTitles(visitor);
  expect(original).toHaveLength(10);
  const products = php('echo implode(",", array_column(ndm_promotions(true), "productId"));');

  await signIn(page);
  await expect(page.locator("header").getByText("Promotions manager")).toBeVisible();
  await expect(cards(page)).toHaveCount(10);
  /* on a phone: nothing runs off the side, with a card open for editing too */
  await page.setViewportSize({ width: 375, height: 812 });
  await cards(page).first().getByRole("button", { name: `Edit ${original[0]}` }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  expect(await cards(page).first().evaluate((el) => el.getBoundingClientRect().right)).toBeLessThanOrEqual(375);
  expect(await cards(page).first().getByLabel("Card title").evaluate((el) => el.getBoundingClientRect().right)).toBeLessThanOrEqual(375);
  await page.screenshot({ path: "test-results/promotions-manager-phone.png" });
  await cards(page).first().getByRole("button", { name: `Finish editing ${original[0]}` }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "test-results/promotions-manager-desktop.png" });
  /* the cards show the price list's prices, as the public page does */
  await expect(cards(page).first()).toContainText("562.50");
  await expect(cards(page).first().locator(".deal-badge")).toContainText(/Buy 1 get 1 50%\soff/);

  /* a card title: nothing reaches visitors before Save */
  await cards(page).first().getByRole("button", { name: `Edit ${original[0]}` }).click();
  await cards(page).first().getByLabel("Card title").fill("Lip Filler Test");
  await expect(page.getByText("Unsaved changes")).toBeVisible();
  expect(await publicTitles(visitor)).toEqual(original);
  await save(page);
  expect((await publicTitles(visitor))[0]).toBe("Lip Filler Test");

  /* rearranged: first card one place later */
  await cards(page).first().getByRole("button", { name: "Move Lip Filler Test later" }).click();
  await save(page);
  expect((await publicTitles(visitor)).slice(0, 2)).toEqual([original[1], "Lip Filler Test"]);

  /* the price setting: this treatment alone, or its whole category */
  const second = cards(page).nth(1);
  await second.getByRole("button", { name: "Edit Lip Filler Test" }).click();
  await second.getByLabel(/Lowest in its category/).check();
  await expect(second.locator(".promo-card > div").first()).toContainText("497.50");
  await second.getByLabel("This treatment only").check();
  await expect(second.locator(".promo-card > div").first()).toContainText("562.50");

  /* a file that is not an image is refused; a real one becomes the card's photo */
  const input = page.locator('input[type="file"]');
  await second.getByRole("button", { name: "Replace photo" }).click();
  await input.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("<?php echo 1;") });
  await expect(page.getByRole("alert").filter({ hasText: "Photos must be JPEG, PNG or WebP images." })).toBeVisible();
  const image = Number(php("echo (int) get_post_thumbnail_id(42);"));
  await second.getByRole("button", { name: "Replace photo" }).click();
  await input.setInputFiles({ name: "../../evil name.png", mimeType: "image/png", buffer: PNG });
  await expect(second.locator("img")).toHaveAttribute("src", /\/offer-\d+\.png$/);
  await save(page);
  expect(Number(php("echo (int) get_post_thumbnail_id(42);"))).toBeGreaterThan(image);

  /* removed: the product stays in WooCommerce, it only stops being an offer */
  await cards(page).last().getByRole("button", { name: `Remove ${original[9]} from the offers` }).click();
  await save(page);
  expect(await publicTitles(visitor)).toHaveLength(9);
  expect(wp("post", "get", "67", "--field=post_status")).toBe("publish");

  /* added again from WooCommerce */
  await page.getByPlaceholder("Search WooCommerce products by name").fill("Above the Knee");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("button", { name: "Add as an offer" }).first().click();
  await expect(cards(page)).toHaveCount(10);
  await cards(page).last().getByLabel("Card title").fill(original[9]);
  await save(page);
  expect(await publicTitles(visitor)).toHaveLength(10);

  /* the same products as before: nothing created, deleted or re-numbered */
  expect(php('echo implode(",", array_column(ndm_promotions(true), "productId"));').split(",").sort()).toEqual(products.split(",").sort());

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: /Sign in to manage/ })).toBeVisible({ timeout: 60_000 });
  await visitor.context().close();
});

test("on the price list's screen a treatment is put in Promotions, placed first and taken out again", async ({ page, browser }) => {
  const visitor = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const original = await publicTitles(visitor);
  expect(original).toHaveLength(10);

  await signIn(page);
  await page.goto(`${NEXT_URL}/manage/pricing`);
  const groups = page.locator("#prices .pr-group");
  const group = (name: string) => groups.filter({ has: page.locator("h3", { hasText: name }) });
  const saveList = async () => {
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved to WooCommerce")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("status").first()).toHaveText("All changes saved", { timeout: 30_000 });
  };
  const edit = async (item: ReturnType<typeof page.locator>, name: string) => {
    if (!(await item.locator("[data-promo]").count())) await item.getByRole("button", { name: `Edit ${name}`, exact: true }).click();
  };

  /* a treatment that already is an offer says so */
  await group("Dermal Fillers").getByRole("button", { name: /treatments Dermal Fillers/ }).click();
  const lip = group("Dermal Fillers").locator(".pr-item").filter({ hasText: "Lip Enhancement" }).first();
  await expect(lip.getByText("In Promotions")).toBeVisible();
  await edit(lip, "Lip Enhancement");
  await expect(lip.getByRole("switch", { name: "Show Lip Enhancement in Promotions" })).toHaveAttribute("aria-checked", "true");
  await expect(lip.getByLabel("Card title")).toHaveValue(/^Lip Filler/); /* the earlier test may have renamed it */

  /* one that is not: switched on, given a card, placed first */
  await group("Chemical Peel").getByRole("button", { name: /treatments Chemical Peel/ }).click();
  const peel = group("Chemical Peel").locator(".pr-item").filter({ hasText: "Acnelan" }).first();
  await expect(peel.getByText("In Promotions")).toHaveCount(0);
  await edit(peel, "Acnelan");
  const toggle = peel.getByRole("switch", { name: "Show Acnelan in Promotions" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await peel.getByLabel("Card title").fill("Acnelan Peel Test");
  await peel.getByLabel(/^Card text/).fill("A peel that may help with the look of blemishes.");
  await peel.getByLabel("Position in Promotions").selectOption({ label: "1 of 11" });
  expect(await publicTitles(visitor)).toEqual(original); /* nothing before Save */
  await saveList();

  const now = await publicTitles(visitor);
  expect(now).toEqual(["Acnelan Peel Test", ...original]);
  const card = visitor.locator('section[aria-labelledby="offers"] article.promo-card').first();
  await expect(card).toContainText("174.30"); /* its own lowest price in WooCommerce: 1045.80 for six */
  await expect(card.locator(".deal-badge")).toContainText(/Up to 30%\soff/);
  /* the carousel on the home page follows too */
  await visitor.goto(NEXT_URL);
  await expect(visitor.locator('section[aria-labelledby="specials"] article').filter({ hasText: "Acnelan Peel Test" })).toHaveCount(1);
  await expect(peel.getByText("In Promotions")).toBeVisible();

  /* and out again: the product itself is untouched */
  await edit(peel, "Acnelan");
  await peel.getByRole("switch", { name: "Show Acnelan in Promotions" }).click();
  await saveList();
  expect(await publicTitles(visitor)).toEqual(original);
  expect(wp("post", "get", "284", "--field=post_status")).toBe("publish");

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: /Sign in to manage/ })).toBeVisible({ timeout: 60_000 });
  await visitor.context().close();
});
