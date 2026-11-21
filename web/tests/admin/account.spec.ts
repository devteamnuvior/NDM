import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * My account, end to end against the local WordPress + WooCommerce (see ../../../cms): a new account is
 * a WooCommerce customer, its details and choices are saved there, the customer's WooCommerce orders
 * show under Orders, and a password change ends every other sign-in. It creates a customer and an
 * order (and deletes both afterwards), so it runs with the admin tests: npm run test:admin.
 */
const CMS = path.resolve(__dirname, "../../../cms");
const WP = "http://localhost:8080";
const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();

const tag = randomBytes(4).toString("hex");
const EMAIL = `account-test-${tag}@example.test`;
const EMAIL_2 = `account-test-${tag}-b@example.test`;
const PASS = randomBytes(12).toString("base64url");
const PASS_2 = randomBytes(12).toString("base64url");
const PASS_3 = randomBytes(12).toString("base64url");
const user = (email: string) => `get_user_by( 'email', '${email}' )`;

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(300_000);

test.afterAll(() => {
  for (const email of [EMAIL, EMAIL_2]) {
    try {
      wp("eval", `$u = ${user(email)}; if ( $u ) { foreach ( wc_get_orders( array( 'customer_id' => $u->ID, 'limit' => -1 ) ) as $o ) { $o->delete( true ); } require_once ABSPATH . 'wp-admin/includes/user.php'; wp_delete_user( $u->ID ); }`);
    } catch {
      /* already gone */
    }
  }
});

test("the account routes are closed to visitors", async ({ request }) => {
  for (const route of ["sign-in", "register", "view", "profile", "notifications", "password", "reset-request", "reset"]) {
    expect((await request.post(`${WP}/wp-json/ndm/v1/account/${route}`, { data: { id: 1, stamp: "x", email: "a@example.test", password: "x" } })).status(), route).toBe(401);
  }
});

test("create an account, edit it, see its orders, change the password, use a reset link", async ({ page, browser }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${NEXT_URL}/account`);
  const main = page.locator("main:visible");
  await expect(main.getByRole("heading", { level: 2, name: "Sign in" })).toBeVisible();
  await page.waitForLoadState("networkidle"); /* the form answers once the page's scripts run */

  /* a wrong sign-in says nothing about which part was wrong */
  await main.getByLabel("Email").fill(EMAIL);
  await main.getByLabel("Password").fill("not-the-password");
  await main.getByRole("button", { name: "Sign in" }).click();
  await expect(main.getByRole("alert")).toHaveText("The email address or the password is not right.");

  /* a new account */
  await main.getByRole("tab", { name: "Create account" }).click();
  await main.getByLabel("First name").fill("Testa");
  await main.getByLabel("Last name").fill("Account");
  await main.getByLabel("Email").fill(EMAIL);
  await main.getByLabel(/^Password/).fill(PASS);
  await main.getByRole("checkbox").check();
  await main.getByRole("button", { name: "Create account" }).click();
  await expect(main.getByRole("heading", { level: 2, name: "Welcome back, Testa" })).toBeVisible({ timeout: 30_000 });
  await expect(main).toContainText("Signed in as Testa Account");
  expect(wp("eval", `echo implode( ',', ${user(EMAIL)}->roles );`)).toBe("customer");

  /* the bar: no appointments, membership, wishlist or forms */
  const bar = page.getByRole("navigation", { name: "Account" });
  await expect(bar.getByRole("link")).toHaveText([/Dashboard/, /My plans/, /Orders/, /Payment methods/, /Account details/]);
  await expect(main).not.toContainText(/next appointment|membership/i);
  await expect(main).toContainText("No orders yet");

  /* the session cookie cannot be read by scripts */
  const cookie = (await page.context().cookies()).find((c) => c.name === "ndm_account");
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");

  /* details and choices are saved in WooCommerce */
  await bar.getByRole("link", { name: "Account details" }).click();
  await main.getByLabel("Last name").fill("Changed");
  await main.getByLabel("Phone").fill("416-555-0100");
  await main.getByLabel("Email").fill(EMAIL_2);
  await main.getByLabel("Clinic").selectOption("Downtown");
  await main.getByRole("button", { name: "Save changes" }).click();
  await expect(main.getByRole("status").filter({ hasText: "Your details are saved." })).toBeVisible();
  await expect(main).toContainText("Signed in as Testa Changed");
  await main.getByRole("switch", { name: /Offers and promotions/ }).click();
  await expect(main.getByRole("switch", { name: /Offers and promotions/ })).toHaveAttribute("aria-checked", "true");
  await expect(main.getByRole("switch", { name: /Appointment and order updates/ })).toBeDisabled();
  await expect
    .poll(() => wp("eval", `$u = ${user(EMAIL_2)}; $n = get_user_meta( $u->ID, 'ndm_notify', true ); echo $u->last_name, '|', get_user_meta( $u->ID, 'billing_phone', true ), '|', get_user_meta( $u->ID, 'ndm_clinic', true ), '|', empty( $n['offers'] ) ? 'off' : 'on', '|', empty( $n['offers_at'] ) ? 'undated' : 'dated';`))
    .toBe("Changed|416-555-0100|Downtown|on|dated");

  /* the customer's WooCommerce orders, with WooCommerce's own total and status */
  const made = wp(
    "eval",
    `$t = ndm_pricing_public_tree(); $p = $t['categories'][0]['products'][0]; $id = $p['variations'] ? $p['variations'][0]['id'] : $p['id']; $o = wc_create_order( array( 'customer_id' => ${user(EMAIL_2)}->ID ) ); $o->add_product( wc_get_product( $id ), 1 ); $o->update_meta_data( '_ndm_clinic', 'NewDermaMed Uptown' ); $o->calculate_totals(); $o->set_status( 'on-hold' ); $o->save(); echo $o->get_order_number(), '|', $o->get_total();`,
  );
  const [number, amount] = made.split("|");
  await page.reload(); /* orders are read when the page loads */
  await page.waitForLoadState("networkidle");
  await bar.getByRole("link", { name: /Orders/ }).click();
  const row = main.locator("tbody tr").filter({ hasText: number });
  await expect(row).toContainText("Uptown");
  await expect(row).toContainText("On hold");
  await expect(row.locator("td").nth(4)).toHaveText(`$${Number(amount)}`);

  /* the password: a second browser, signed in with the old one, is signed out by the change */
  const other = await (await browser.newContext()).newPage();
  await other.goto(`${NEXT_URL}/account`);
  await other.waitForLoadState("networkidle");
  await other.getByLabel("Email").fill(EMAIL_2);
  await other.getByLabel("Password").fill(PASS);
  await other.getByRole("button", { name: "Sign in" }).click();
  await expect(other.getByRole("heading", { level: 2, name: "Welcome back, Testa" })).toBeVisible({ timeout: 30_000 });

  await bar.getByRole("link", { name: "Account details" }).click();
  await main.getByLabel("Current password").fill(PASS);
  await main.getByLabel("New password", { exact: true }).fill(PASS_2);
  await main.getByLabel("Confirm new password").fill(PASS_2);
  await main.getByRole("button", { name: "Update password" }).click();
  await expect(main.getByRole("status").filter({ hasText: "Your password is changed." })).toBeVisible();
  await page.reload();
  await expect(main).toContainText("Signed in as Testa Changed"); /* this browser stays signed in */
  await other.reload();
  await expect(other.getByRole("heading", { level: 2, name: "Sign in" })).toBeVisible();
  await other.context().close();

  /* sign out, then the new password opens the account; the old one does not */
  await main.getByRole("button", { name: "Sign out" }).click();
  await expect(main.getByRole("heading", { level: 2, name: "Sign in" })).toBeVisible();
  await main.getByLabel("Email").fill(EMAIL_2);
  await main.getByLabel("Password").fill(PASS);
  await main.getByRole("button", { name: "Sign in" }).click();
  await expect(main.getByRole("alert")).toBeVisible();
  await main.getByLabel("Password").fill(PASS_2);
  await main.getByRole("button", { name: "Sign in" }).click();
  await expect(main).toContainText("Signed in as Testa Changed", { timeout: 30_000 }); /* the address still names #details */

  /* a reset link works once, and ends the sign-in made with the old password */
  const [login, key] = wp("eval", `$u = ${user(EMAIL_2)}; echo $u->user_login, '|', get_password_reset_key( $u );`).split("|");
  const link = `${NEXT_URL}/account/reset?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`;
  await page.goto(link);
  await main.getByLabel(/^New password/).fill(PASS_3);
  await main.getByLabel("Confirm new password").fill(PASS_3);
  await main.getByRole("button", { name: "Save new password" }).click();
  await expect(main.getByRole("status")).toContainText("Your new password is saved.");
  await page.goto(`${NEXT_URL}/account`);
  await expect(main.getByRole("heading", { level: 2, name: "Sign in" })).toBeVisible();
  await page.goto(link);
  await main.getByLabel(/^New password/).fill(PASS_2);
  await main.getByLabel("Confirm new password").fill(PASS_2);
  await main.getByRole("button", { name: "Save new password" }).click();
  await expect(main.getByRole("alert")).toContainText("expired or was already used");

  expect(errors).toEqual([]);
});
