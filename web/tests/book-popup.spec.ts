import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/**
 * Behaviour of the migrated booking pop-up and the booking form on the Next.js build. The form's request
 * (POST /api/booking, which saves it in WordPress) is answered here, so no record is made; the real
 * round trip is tests/admin/booking.spec.ts.
 */

test.use({ viewport: { width: 1440, height: 900 } });

/** Answers the form's request and keeps what was sent. */
async function answerBooking(page: Page, status = 201, body: Record<string, unknown> = { ok: true }) {
  const sent: Record<string, unknown>[] = [];
  await page.route("**/api/booking", async (route) => {
    sent.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({ status, json: body });
  });
  return sent;
}

test("every booking button opens the pop-up; Escape, the backdrop and the button close it; focus returns", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  const opener = page.locator("header").getByRole("link", { name: "Book Free Consultation" });
  await opener.click();
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect(page).not.toHaveURL(/#\/book/); /* the link is intercepted, the address does not change */
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  await page.locator("#top").getByRole("link", { name: "Book Free Consultation" }).click();
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Close booking form" }).click();
  await expect(dialog).toBeHidden();
  await opener.click();
  await page.mouse.click(30, 450); /* the dimmed page */
  await expect(dialog).toBeHidden();
});

test("the form: validation at each step, the call-back path, and a fresh form each time", async ({ page }) => {
  const sent = await answerBooking(page);
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  const alert = dialog.getByRole("alert");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please choose at least one option.");
  await dialog.getByRole("checkbox", { name: "Something else" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please tell us in a few words what you’d like to address.");
  await dialog.locator('input[name="other"]').fill("neck lines");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("Step 2 of 4 · Your details")).toBeVisible();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please add your name, mobile number and a valid email.");
  await dialog.locator('input[name="first"]').fill("Sam");
  await dialog.locator('input[name="last"]').fill("Tester");
  await dialog.locator('input[name="phone"]').fill("416 555 0100");
  await dialog.locator('input[name="email"]').fill("not-an-email");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please add your name, mobile number and a valid email.");
  await dialog.locator('input[name="email"]').fill("sam@example.com");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("Step 3 of 4 · Book or call")).toBeVisible();
  await dialog.getByRole("button", { name: /Have us call you/ }).click();
  await expect(dialog.getByText("Step 4 of 4 · Best time to call")).toBeVisible();
  await dialog.getByRole("button", { name: "Request a call" }).click();
  await expect(alert).toHaveText("Please choose a time of day.");
  await dialog.getByRole("radio", { name: "Afternoon" }).check();
  await dialog.getByRole("button", { name: "Request a call" }).click();
  await expect(dialog.getByRole("status")).toContainText("Request sent, Sam.");
  await expect(dialog.getByRole("status")).toContainText("We’ll call you in the afternoon within one business day");
  expect(sent).toEqual([
    { interests: ["Something else"], other: "neck lines", visia: true, first: "Sam", last: "Tester", phone: "416 555 0100", email: "sam@example.com", via: ["Call", "Text"], path: "call", clinic: "Either", callTime: "Afternoon", page: "/", company: "" },
  ]);
  /* closing and opening again starts from an empty form */
  await page.keyboard.press("Escape");
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  await expect(dialog.getByText("Step 1 of 4 · Your concern")).toBeVisible();
  await expect(dialog.getByRole("checkbox", { name: "Something else" })).not.toBeChecked();
});

/** The clinic's booking calendar is another company's page: answered here, so no test reaches it. */
const answerCalendar = (page: Page) => page.route("https://www.myaestheticspro.com/**", (route) => route.fulfill({ contentType: "text/html", body: "<p>calendar</p>" }));

/** Fills the pop-up as far as the book-or-call choice. */
async function toChoice(page: Page) {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  await dialog.getByRole("checkbox", { name: "Volume loss" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.locator('input[name="first"]').fill("Sam");
  await dialog.locator('input[name="last"]').fill("Tester");
  await dialog.locator('input[name="phone"]').fill("416 555 0100");
  await dialog.locator('input[name="email"]').fill("sam@example.com");
  await dialog.getByRole("button", { name: "Continue" }).click();
  return dialog;
}

test("Book a time now saves the details and opens the clinic's booking calendar", async ({ page }) => {
  const sent = await answerBooking(page);
  await answerCalendar(page);
  const dialog = await toChoice(page);
  await dialog.getByRole("button", { name: /Book a time now/ }).click();
  const calendar = page.getByRole("dialog", { name: "Choose your time" });
  await expect(calendar).toBeVisible();
  await expect(calendar.locator("iframe")).toHaveAttribute("src", /^https:\/\/www\.myaestheticspro\.com\/BN\/index\.cfm\?/);
  expect(sent).toEqual([{ interests: ["Volume loss"], other: "", visia: true, first: "Sam", last: "Tester", phone: "416 555 0100", email: "sam@example.com", via: ["Call", "Text"], path: "online", page: "/", company: "" }]);
  /* the whole panel is on the screen */
  const box = await calendar.boundingBox();
  expect(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= 1440.5 && box.y + box.height <= 900.5).toBe(true);
  /* Escape closes the calendar only; the pop-up under it stays and can open the calendar again */
  await page.keyboard.press("Escape");
  await expect(calendar).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status")).toContainText("One last step, Sam.");
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await dialog.getByRole("button", { name: "Open the booking calendar" }).click();
  await expect(calendar).toBeVisible();
  await calendar.getByRole("button", { name: "Close booking calendar" }).click();
  await expect(calendar).toBeHidden();
});

test("the booking calendar still opens when the details could not be saved, but not when they are turned down", async ({ page }) => {
  await answerCalendar(page);
  await answerBooking(page, 400, { ok: false, reason: "invalid", message: "Please add your name, mobile number and a valid email." });
  const dialog = await toChoice(page);
  const calendar = page.getByRole("dialog", { name: "Choose your time" });
  await dialog.getByRole("button", { name: /Book a time now/ }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Please add your name, mobile number and a valid email.");
  await expect(calendar).toHaveCount(0);
  await page.unroute("**/api/booking");
  await answerBooking(page, 503, { ok: false, reason: "unreachable", message: "Your request could not be sent right now." });
  await dialog.getByRole("button", { name: /Book a time now/ }).click();
  await expect(calendar).toBeVisible();
});

test("a request that could not be saved is not confirmed: the form stays, with the reason", async ({ page }) => {
  await answerBooking(page, 503, { ok: false, reason: "unreachable", message: "Your request could not be sent right now. Please try again in a moment, or please call the clinic." });
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  await dialog.getByRole("checkbox", { name: "Volume loss" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.locator('input[name="first"]').fill("Sam");
  await dialog.locator('input[name="last"]').fill("Tester");
  await dialog.locator('input[name="phone"]').fill("416 555 0100");
  await dialog.locator('input[name="email"]').fill("sam@example.com");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /Have us call you/ }).click();
  await dialog.getByRole("radio", { name: "Morning" }).check();
  await dialog.getByRole("button", { name: "Request a call" }).click();
  await expect(dialog.getByRole("alert")).toContainText("could not be sent right now");
  await expect(dialog.getByRole("status")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Request a call" })).toBeEnabled();
});

/* every page with a Book Free Consultation button: the button opens the pop-up, on a desktop and on a phone */
const PAGES = ["/", "/pricing", "/promotion", "/before-after", "/aptos-thread-lift", "/injectables/botox", "/concerns/wrinkles-fine-lines", "/about", "/blog", "/blog/what-causes-rosacea-redness", "/privacy", "/cart", "/black-friday-sale"];
for (const size of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 375, height: 812 },
]) {
  test(`the pop-up opens from a booking button on every page @ ${size.name}`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize(size);
    for (const path of PAGES) {
      await page.goto(`${NEXT_URL}${path}`);
      await page.waitForTimeout(900);
      const links = page.locator('a[href="#/book"]:visible');
      expect(await links.count(), `${path}: a booking button`).toBeGreaterThan(0);
      await links.first().click();
      const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
      await expect(dialog, path).toBeVisible();
      await expect(dialog.getByText("Step 1 of 4 · Your concern"), path).toBeVisible();
      await page.waitForTimeout(700); /* the card slides in */
      /* the whole card is on the screen, with no sideways scroll */
      const box = await dialog.boundingBox();
      expect(box && box.x >= 0 && box.x + box.width <= size.width + 0.5 && box.y >= 0 && box.y + box.height <= size.height + 0.5, `${path}: the card fits the window`).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path}: no sideways scroll`).toBe(true);
      await dialog.getByRole("button", { name: "Close booking form" }).click();
      await expect(dialog, path).toBeHidden();
    }
  });
}
