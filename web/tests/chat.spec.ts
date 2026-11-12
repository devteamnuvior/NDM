import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated chat assistant on the Next.js build. */

const panel = (page: Page) => page.getByRole("dialog", { name: "Chat with Olivia from NewDermaMed" });

test.use({ viewport: { width: 1440, height: 900 } });

test("the note pops up once per visit, shows typing first, and can be dismissed", async ({ page }) => {
  await page.goto(NEXT_URL);
  const note = page.locator(".chat-pop");
  await expect(note).toBeVisible({ timeout: 9000 });
  await expect(note.getByLabel("Typing")).toBeVisible();
  await expect(note.getByRole("button", { name: "Hi, how can I help?" })).toBeVisible({ timeout: 4000 });
  await expect(page.locator("button.chat-launch")).toHaveClass(/has-note/);
  await note.getByRole("button", { name: "Dismiss message" }).click();
  await expect(note).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("ndm-chat-note"))).toBe("closed");
  await page.reload();
  await page.waitForTimeout(6000);
  await expect(page.locator(".chat-pop")).toHaveCount(0);
});

test("ready-made questions are answered with their link; asked ones leave the list", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.getByRole("button", { name: "Chat with NewDermaMed" }).click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page).getByRole("textbox", { name: "Type your question" })).toBeFocused();
  await expect(panel(page).getByRole("listitem")).toHaveCount(5);
  await panel(page).getByRole("button", { name: "What is the Aptos Thread Lift?" }).click();
  await expect(panel(page).getByText("Individual results may vary.")).toBeVisible();
  await expect(panel(page).getByRole("link", { name: "Explore Aptos Thread Lift" })).toHaveAttribute("href", "/aptos-thread-lift");
  await expect(panel(page).getByText("You can also ask")).toBeVisible();
  await expect(panel(page).getByRole("button", { name: "What is the Aptos Thread Lift?" })).toHaveCount(0);
  await expect(panel(page).getByRole("listitem")).toHaveCount(3);
});

test("a typed question finds the closest answer, an unknown one gets the fallback, and Escape closes", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.getByRole("button", { name: "Chat with NewDermaMed" }).click();
  const box = panel(page).getByRole("textbox", { name: "Type your question" });
  await expect(panel(page).getByRole("button", { name: "Send" })).toBeDisabled();
  await box.fill("is financing available");
  await box.press("Enter");
  await expect(panel(page).getByText("We offer flexible payment plans through Affirm")).toBeVisible();
  await box.fill("xyzzy");
  await box.press("Enter");
  await expect(panel(page).getByText("A member of our team can answer that properly")).toBeVisible();
  await expect(panel(page).getByRole("link", { name: "Book Free Consultation" })).toHaveAttribute("href", "#/book");
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
  await expect(page.getByRole("button", { name: "Chat with NewDermaMed" })).toBeFocused();
});

test("the launcher steps aside while another overlay is open", async ({ page }) => {
  await page.goto(NEXT_URL);
  const launch = page.locator("button.chat-launch");
  await expect(launch).toBeVisible();
  await page.locator("header").getByRole("button", { name: "Search treatments" }).click();
  await expect(launch).toHaveClass(/is-off/);
  await expect(page.locator("#site-search")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(launch).not.toHaveClass(/is-off/);
});
