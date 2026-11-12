import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * The cart, checkout and order request, end to end against the local WordPress + WooCommerce (see
 * ../../../cms): the cart is corrected from WooCommerce when it loads, the order request becomes a real
 * WooCommerce order at WooCommerce's prices, and nothing personal is kept in the browser. It creates an
 * order (and deletes it afterwards), so it runs with the admin tests: npm run test:admin.
 */
const CMS = path.resolve(__dirname, "../../../cms");
const WP = "http://localhost:8080";
const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
const placed: string[] = [];

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(180_000);

test.afterAll(() => {
  for (const no of placed) {
    try {
      wp("eval", `wc_get_order(${Number(no)})->delete(true);`);
    } catch {
      /* already gone */
    }
  }
});

test("the order route is closed to visitors", async ({ request }) => {
  const body = { lines: [{ productId: 18, variationId: 20, qty: 1 }], customer: {}, clinic: "x" };
  expect((await request.post(`${WP}/wp-json/ndm/v1/orders`, { data: body })).status()).toBe(401);
});

test("the cart is corrected from WooCommerce, and the order request becomes a WooCommerce order", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  /* a cart as an older page (or a curious visitor) could have left it: no IDs, a made-up price, and
     something that is not on the price list */
  await page.goto(`${NEXT_URL}/pricing`);
  await page.evaluate(() =>
    localStorage.setItem(
      "ndm-cart",
      JSON.stringify([
        { key: "Botox Cosmetic|60 units", cat: "Anything", name: "Botox Cosmetic", label: "60 units", price: 1, unit: "", qty: 2 },
        { key: "gone", cat: "Anything", name: "Gone Treatment", label: "Single session", price: 5, unit: "", qty: 1 },
      ]),
    ),
  );

  await page.goto(`${NEXT_URL}/cart`);
  const main = page.locator("main:visible"); /* after a link the previous page can stay in the document, hidden */
  await expect(main.getByRole("status").filter({ hasText: "Your cart was updated" })).toContainText("Gone Treatment, Single session");
  await expect(main).toContainText("Botox / Dysport"); /* the category, as WooCommerce names it */
  await expect(main).toContainText("60 units · $648 each");
  await expect(main).toContainText("Regular price $1440");
  await expect(main.getByLabel("Cart summary")).toContainText("Subtotal$1296.00");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("ndm-cart") ?? "[]") as Record<string, unknown>[]);
  expect(stored).toEqual([{ key: "wc:18:20", cat: "Botox / Dysport", name: "Botox Cosmetic", label: "60 units", price: 648, unit: "", was: 720, productId: 18, variationId: 20, qty: 2 }]);

  /* the Pricing page's own button adds to the same cart, by WooCommerce ID */
  await page.goto(`${NEXT_URL}/pricing`);
  await page.locator("#pg-botox-dysport-h").click();
  await page.locator("#pr-botox-dysport-0-h").click();
  const option = page.locator("#pr-botox-dysport-0 .pr-opt").nth(1);
  await expect(option.getByRole("group", { name: "Quantity, Botox Cosmetic, 60 units" })).toContainText("2"); /* already in the cart */
  await page.locator("#pr-botox-dysport-0 .pr-opt").first().getByRole("button", { name: "Add Botox Cosmetic, Regular to cart" }).click();

  /* checkout: details, appointment, payment, review */
  await page.goto(`${NEXT_URL}/checkout`);
  await expect(page.locator("h1:visible")).toHaveText(/Your\s*details/);
  await page.getByLabel("First name").fill("Sam");
  await page.getByLabel("Last name").fill("Tester");
  await page.getByLabel("Email address").fill("sam.tester@example.test");
  await page.getByLabel("Address", { exact: true }).fill("1 Test Street");
  await page.getByLabel("City").fill("Toronto");
  await page.getByLabel("Postal code").fill("123");
  await page.getByRole("button", { name: "Continue to appointment" }).click();
  await expect(main.getByRole("alert").filter({ hasText: "A few details are missing" })).toBeVisible(); /* not a postal code */
  await page.getByLabel("Postal code").fill("m2n 5m5");
  await page.getByRole("button", { name: "Continue to appointment" }).click();
  await expect(page.locator("h1:visible")).toHaveText(/Your\s*appointment/);
  await page.getByLabel("Preferred day").fill("2026-12-01");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await page.getByRole("button", { name: "Continue to review" }).click();
  await expect(main).toContainText("2 in your cart, $1478.04 estimated"); /* (2 x 648 + 12) + 13% */
  await page.getByRole("checkbox", { name: /I accept/ }).check();
  await page.getByRole("button", { name: /Place order request/ }).click();

  /* confirmation, with WooCommerce's own order number */
  await page.waitForURL(`${NEXT_URL}/order-confirmed`);
  await expect(page.locator("h1:visible")).toContainText("Thank you, Sam,");
  const no = (await main.locator("b.tabular-nums").first().innerText()).trim();
  expect(no).toMatch(/^\d+$/);
  placed.push(no);
  await expect(main).toContainText("Nothing has been charged");
  await expect(main.getByText("Botox Cosmetic").first()).toBeVisible();

  /* the order is in WooCommerce: on hold, unpaid, at WooCommerce's prices */
  const order = JSON.parse(
    wp("eval", `$o = wc_get_order(${Number(no)}); echo wp_json_encode(array('status' => $o->get_status(), 'total' => (float) $o->get_total(), 'via' => $o->get_created_via(), 'pay' => $o->get_payment_method_title(), 'email' => $o->get_billing_email(), 'postcode' => $o->get_billing_postcode(), 'clinic' => $o->get_meta('_ndm_clinic'), 'when' => $o->get_meta('_ndm_preferred_time'), 'items' => array_values(array_map(fn($i) => array($i->get_variation_id(), $i->get_quantity(), (float) $i->get_total()), $o->get_items()))));`),
  ) as Record<string, unknown>;
  expect(order).toEqual({
    status: "on-hold",
    total: 1308,
    via: "ndm-site",
    pay: "Pay at the clinic",
    email: "sam.tester@example.test",
    postcode: "M2N 5M5",
    clinic: "NewDermaMed Uptown",
    when: "2026-12-01, morning",
    items: [
      [20, 2, 1296],
      [19, 1, 12],
    ],
  });

  /* the browser keeps the cart empty and, of the order, nothing personal beyond the first name */
  expect(await page.evaluate(() => localStorage.getItem("ndm-cart"))).toBe("[]");
  const kept = await page.evaluate(() => localStorage.getItem("ndm-last-order") ?? "");
  expect(kept).toContain(`"no":"${no}"`);
  expect(kept).not.toMatch(/sam\.tester|Test Street|M2N|Tester/);
  expect(errors).toEqual([]);
});
