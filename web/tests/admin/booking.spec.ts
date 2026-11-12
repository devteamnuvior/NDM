import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../../playwright.config";

/**
 * "Book a free consultation", end to end against the local WordPress (see ../../../cms): a request sent
 * from the pop-up and one from a treatment page's own form are saved as private "Consultation
 * requests", and nothing can read them back from outside. It creates records (and deletes them
 * afterwards), so it runs with the admin tests: npm run test:admin.
 */
const CMS = path.resolve(__dirname, "../../../cms");
const WP = "http://localhost:8080";
const wp = (...args: string[]) => execFileSync("docker", ["compose", "run", "--rm", "-T", "cli", "wp", ...args], { cwd: CMS, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
const EMAIL = "booking.test@example.test";
/** The saved test requests: ID, title, record and status. */
const saved = () =>
  JSON.parse(
    wp(
      "eval",
      `$out = array(); foreach ( get_posts( array( 'post_type' => 'ndm_booking', 'post_status' => 'any', 'numberposts' => 50, 'orderby' => 'ID', 'order' => 'ASC' ) ) as $p ) { $r = get_post_meta( $p->ID, '_ndm_booking', true ); if ( '${EMAIL}' === $r['email'] ) { $out[] = array( 'id' => $p->ID, 'title' => $p->post_title, 'post' => $p->post_status, 'status' => get_post_meta( $p->ID, '_ndm_booking_status', true ), 'record' => $r ); } } echo wp_json_encode( $out );`,
    ),
  ) as { id: number; title: string; post: string; status: string; record: Record<string, unknown> }[];
const clean = () => {
  for (const { id } of saved()) wp("post", "delete", String(id), "--force");
};

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(180_000);
test.beforeAll(clean);
test.afterAll(clean);

test("the WordPress route is closed to visitors, and requests are not in the public API", async ({ request }) => {
  expect((await request.post(`${WP}/wp-json/ndm/v1/bookings`, { data: { first: "x" } })).status()).toBe(401);
  expect((await request.post(`${WP}/wp-json/ndm/v1/bookings`, { data: { first: "x" }, headers: { "X-NDM-Site-Key": "wrong" } })).status()).toBe(401);
  expect((await request.get(`${WP}/wp-json/ndm/v1/bookings`)).status()).toBe(404);
  expect((await request.get(`${WP}/wp-json/wp/v2/ndm_booking`)).status()).toBe(404);
});

test("the site's route refuses other sites, robots and anything that is not on the form", async ({ request }) => {
  const good = { interests: ["Acne"], other: "", visia: true, first: "Sam", last: "Tester", phone: "416 555 0100", email: EMAIL, via: ["Call"], path: "call", clinic: "Either", callTime: "Morning", page: "/" };
  const post = (data: unknown, headers: Record<string, string> = {}) => request.post(`${NEXT_URL}/api/booking`, { data, headers });
  expect((await post(good, { Origin: "https://elsewhere.example" })).status()).toBe(403);
  expect((await post({ ...good, company: "Acme" })).status()).toBe(400);
  expect((await post({ ...good, interests: ["Not on the form"] })).status()).toBe(400);
  expect((await post({ ...good, email: "nope" })).status()).toBe(400);
  expect((await post({ ...good, path: "book", clinic: "Uptown", day: "2020-01-06", hour: 10 })).status()).toBe(400); /* in the past */
  expect((await post({ ...good, path: "book", clinic: "Uptown", day: "2030-01-06", hour: 10 })).status()).toBe(400); /* more than a year ahead */
  expect(saved()).toEqual([]);
});

test("a call request from the pop-up and a booked time from the Botox form are saved in WordPress", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  /* the pop-up, from the home page's header button: ask for a call */
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  await dialog.getByRole("checkbox", { name: "Volume loss" }).check();
  await dialog.getByRole("checkbox", { name: "Something else" }).check();
  await dialog.locator('input[name="other"]').fill("neck lines");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.locator('input[name="first"]').fill("Sam");
  await dialog.locator('input[name="last"]').fill("Popup");
  await dialog.locator('input[name="phone"]').fill("416 555 0100");
  await dialog.locator('input[name="email"]').fill(EMAIL);
  await dialog.getByRole("checkbox", { name: "Email" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /Have us call you/ }).click();
  await dialog.getByRole("radio", { name: "Afternoon" }).check();
  await dialog.getByRole("radio", { name: "Downtown, Bay & College" }).check();
  await dialog.getByRole("button", { name: "Request a call" }).click();
  await expect(dialog.getByRole("status")).toContainText("Request sent, Sam.");

  /* the form in the Botox page's header: book a time */
  await page.goto(`${NEXT_URL}/botox`);
  await page.waitForTimeout(800);
  const form = page.locator(".proc-form:visible form");
  await form.getByRole("checkbox", { name: "Wrinkles & fine lines" }).check();
  /* the switch is a visually hidden checkbox under its label */
  await form.getByRole("switch").evaluate((el: HTMLInputElement) => el.click());
  await expect(form.getByRole("switch")).not.toBeChecked();
  await form.getByRole("button", { name: "Continue" }).click();
  await form.locator('input[name="first"]').fill("Sam");
  await form.locator('input[name="last"]').fill("Botox");
  await form.locator('input[name="phone"]').fill("(416) 555-0100");
  await form.locator('input[name="email"]').fill(EMAIL);
  await form.getByRole("button", { name: "Continue" }).click();
  await form.getByRole("button", { name: /Book a time now/ }).click();
  await form.getByRole("button", { name: "Next month" }).click();
  await form.getByRole("group", { name: "Choose a day" }).locator("button:not([disabled])").nth(3).click();
  await form.getByRole("group", { name: "Choose a time" }).locator("button").first().click();
  await form.getByRole("button", { name: "Book this time" }).click();
  await expect(page.locator(".proc-form:visible").getByRole("status")).toContainText("You’re booked, Sam.");

  const rows = saved();
  expect(rows).toHaveLength(2);
  const [call, book] = rows;
  expect(call.post).toBe("private");
  expect(call.status).toBe("new");
  expect(call.title).toBe("Sam Popup, Call back: Afternoon, Downtown");
  expect(call.record).toEqual({ first: "Sam", last: "Popup", phone: "416 555 0100", email: EMAIL, via: ["Call", "Text", "Email"], interests: ["Volume loss", "Something else"], other: "neck lines", visia: true, path: "call", clinic: "Downtown", day: "", hour: 0, call_time: "Afternoon", page: "/" });
  expect(book.post).toBe("private");
  expect(book.title).toMatch(/^Sam Botox, Book a time: (Mon|Tue|Wed|Thu|Fri|Sat), \w{3} \d{1,2}, \d{4}, (9|10):00 am, Uptown$/);
  expect(book.record).toMatchObject({ last: "Botox", phone: "(416) 555-0100", interests: ["Wrinkles & fine lines"], visia: false, path: "book", clinic: "Uptown", call_time: "", page: "/botox" });
  expect(String(book.record.day)).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  /* nothing about the visitor stays in the browser */
  const kept = await page.evaluate(() => JSON.stringify([{ ...localStorage }, { ...sessionStorage }, document.cookie]));
  expect(kept).not.toContain(EMAIL);
  expect(kept).not.toContain("555");
  expect(errors).toEqual([]);
});
