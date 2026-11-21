import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Inside our clinics section on the Next.js build. */

const SECTION = 'section[aria-labelledby="space"]';

test.use({ viewport: { width: 1440, height: 900 } });

test("the film is not fetched until the section is near, then plays muted; the frame opens with the scroll", async ({ page }) => {
  const film: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("ndm-clinic.mp4")) film.push(r.url());
  });
  await page.goto(NEXT_URL);
  await page.waitForTimeout(1500);
  expect(film).toEqual([]);
  const frame = page.locator(`${SECTION} .cl-frame`);
  const video = page.locator(`${SECTION} video`);
  await expect(video).not.toHaveAttribute("src", /.+/);
  const progress = () => frame.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--p")));
  await frame.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 150));
  await expect.poll(progress).toBeGreaterThan(0);
  expect(await progress()).toBeLessThan(0.5);
  expect((await frame.boundingBox())!.x).toBeGreaterThan(40); /* still inset on both sides */
  await frame.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60));
  await expect.poll(progress).toBe(1);
  expect((await frame.boundingBox())!.x).toBe(0); /* opened to the full width */
  await expect(video).toHaveAttribute("src", "/assets/clinic/ndm-clinic.mp4");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.muted), { timeout: 15_000 }).toBe(true);
  expect(film.length).toBeGreaterThan(0);
});

test("the sound button turns the voice on and off, and the header turns dark over the film", async ({ page }) => {
  await page.goto(NEXT_URL);
  const frame = page.locator(`${SECTION} .cl-frame`);
  await frame.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 20));
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color)).toBe("rgb(255, 255, 255)");
  const video = page.locator(`${SECTION} video`);
  await page.getByRole("button", { name: "Turn the sound on" }).click();
  await expect(page.getByRole("button", { name: "Turn the sound off" })).toHaveAttribute("aria-pressed", "true");
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
  await page.getByRole("button", { name: "Turn the sound off" }).click();
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
});
