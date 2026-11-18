import { expect, type Browser, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { LEGACY_URL, NEXT_URL } from "../../playwright.config";
import type { Difference } from "./fingerprint";
import { salePhase } from "../price-list";

export const SHOTS = "test-results/parity";

export const VIEWPORTS = [
  { name: "phone-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
] as const;

export type Site = "legacy" | "next";

/** Opens the home page of the prototype or of the Next.js build, settled and ready to measure. */
/** A page's address on each site; the home page when left out. */
export interface PagePaths {
  legacy: string;
  next: string;
  /** Changes the prototype page's HTML before it loads, for content that was deliberately changed since (said where it is used). */
  legacyHtml?: (html: string) => string;
}
const HOME: PagePaths = { legacy: "/index.html", next: "/" };

/**
 * Words the site changed on purpose after the prototype pages were written. The prototype page's HTML gets
 * the same words before it loads, so the comparison is of the layout and not of these known differences:
 *   - the Uptown clinic is in North York and its parking is the Hullmark Centre (2026-11-14);
 *   - Monday to Friday the clinics open at 10am, in the words and in the booking calendar (2026-11-16);
 *   - during the VIP Sale the announcement that points to the offers names the sale (lib/site-settings.ts);
 *   - below xl the header bar is two columns, so the logo takes the room the actions leave (2026-11-17);
 *   - the About page's team is three cards in three columns (2026-11-16);
 *   - procedure pages show the clinic film after Why NewDermaMed (2026-11-16);
 *   - the booking form lists Aptos Thread Lift under the Thread lift tab only (2026-11-14);
 *   - "Book a time now" opens the clinic's own booking calendar, so the form has no clinic, day and time of
 *     its own and its summary card has no such rows (2026-11-17);
 *   - phones, home hero (2026-11-17): no pause button, the first two proof points, the brand band as a strip
 *     under the first screen, and the chat and search buttons away until the hero has scrolled past.
 */
const PHONE_HERO = `<style id="parity-now">@media (max-width:639px){.hf-toggle,.hs-dots{display:none}.hf-band{display:flex}.hf-in{padding-bottom:76px}.hf{min-height:0}.hf-in{display:flex;min-height:max(620px,100svh);flex-direction:column;justify-content:flex-end}.hf-band{background:#0b0f13;border-top:0;padding-left:0}.hf-in>ul>li:nth-child(n+3){display:none}.hf::before{background:linear-gradient(180deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.12) 18%,rgba(11,15,19,.56) 38%,rgba(11,15,19,.7) 60%,rgba(11,15,19,.9) 100%),linear-gradient(90deg,rgba(11,15,19,.5),rgba(11,15,19,0) 62%)}.hf-in>div>div.flex-wrap{flex-wrap:nowrap;gap:8px}.hf-in>div>div.flex-wrap .btn{flex:1 1 auto;min-width:0;height:46px;padding:0 12px;font-size:clamp(12.5px,3.55vw,14.5px)}.hf-in>div>div.flex-wrap .btn-book{justify-content:center}.hf-in>div>div.flex-wrap .btn-dot{display:none}.hf-in>ul{display:flex;flex-wrap:wrap;column-gap:20px;row-gap:8px}html.float-held .chat-launch,html.float-held .chat-pop,html.float-held .float-search{opacity:0!important;pointer-events:none!important}}@media (max-width:349px){.hf-in>div>div.flex-wrap{flex-wrap:wrap}.hf-in>div>div.flex-wrap .btn{flex-basis:100%;font-size:15px}}</style><script>(function(){function t(){var el=document.querySelector("section.hf");document.documentElement.classList.toggle("float-held",innerWidth<640&&!!el&&el.getBoundingClientRect().bottom>innerHeight*0.5)}setInterval(t,150);addEventListener("scroll",t,{passive:true})})()</script>`;
const SALE_HEADLINE = 70; /* src/config/sale.ts */
export function prototypeNow(html: string, phase: string | null): string {
  let out = html
    .replaceAll("4763 Yonge Street, Toronto, ON", "4763 Yonge Street, North York, ON")
    .replaceAll("'4763 Yonge Street', 'Toronto, ON M2N 5M5'", "'4763 Yonge Street', 'North York, ON M2N 5M5'")
    .replaceAll("4763 Yonge Street Toronto, ON", "4763 Yonge Street North York, ON")
    .replaceAll("Hallmark Centre", "Hullmark Centre")
    .replace(/(Mon(?:day)? (?:to|–) Fri(?:day)?(?:', '|, | ))9(am)/g, "$110$2")
    .replace(/(w === 6 \? \[10, 16\] : )\[9, 18\]/g, "$1[10, 18]")
    .replaceAll("grid-cols-[auto_1fr_auto] xl:grid-cols-[1fr_auto_1fr] items-center gap-4 xl:gap-3", "grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 xl:gap-3")
    .replaceAll('<div className="flex items-center justify-self-end gap-1 sm:gap-1.5">', '<div className="flex items-center justify-self-end gap-1 max-sm:-mr-2 sm:gap-1.5">')
    .replaceAll('sm:grid-cols-2 xl:grid-cols-4" role="list"', 'sm:grid-cols-2 xl:grid-cols-3" role="list"')
    /* Aptos Thread Lift is listed under the Thread lift tab only (2026-11-14) */
    .replaceAll("'Skin boosters', 'Aptos Thread Lift', ", "'Skin boosters', ")
    .replaceAll("'Bio-stimulator · Aptos Thread Lift', ", "")
    /* the clinic, day and time are chosen in the clinic's booking calendar: the summary card has no rows for them (2026-11-17) */
    .replaceAll("['Clinic', clinicName(f.clinic)], ['Day and time', when]]", "['Next step', null]]")
    /* procedure pages: the clinic film follows Why NewDermaMed, in the page and in the section bar (2026-11-16) */
    .replace("['film', 'The clinic'], ['prices', 'Prices'], ['guide', 'Good to know'], ['why', 'Why NewDermaMed'],", "['prices', 'Prices'], ['guide', 'Good to know'], ['why', 'Why NewDermaMed'], ['film', 'The clinic'],")
    .replace(/(<TxFilm p=\{PROC\} \/>)(\s*)(<ProcPrices p=\{PROC\} \/>\s*<ProcGuide p=\{PROC\} \/>\s*<TxWhy p=\{PROC\} \/>)/, "$3$2$1")
    /* 2026-11-17, prototype only: the announcement bar's Black Friday look and the magnifier on the Start search button */
    .replace("const bfLook = !useBfClock(60000).over;", "const bfLook = false;")
    .replace('group-hover:bg-[#0A4F7A]" aria-hidden="true"><IconSearch size={20} /></span>', 'group-hover:bg-[#0A4F7A]" aria-hidden="true"><IconArrow /></span>')
    /* 2026-11-17, prototype only: its own calmer phone hero (smaller words, no second button, no brand band on phones). The
       site keeps the phone hero the user approved that day, so the prototype's hero gets its earlier classes back; and the
       photo header's labels are given the site's words */
    .replace('<p className="font-inter text-[13px] font-medium text-white/75 sm:text-[clamp(14px,1.05vw,16px)] sm:text-white/80">', '<p className="font-inter text-[clamp(14px,1.05vw,16px)] font-medium text-white/80">')
    .replace('<p className="mt-4 max-w-[34ch] font-inter text-[15px] leading-[1.55] text-white/80 sm:mt-5 sm:max-w-[46ch] sm:text-[clamp(16px,1.1vw+3px,20px)] sm:leading-[1.5] sm:text-white/85">', '<p className="mt-5 max-w-[46ch] font-inter text-[clamp(16px,1.1vw+3px,20px)] leading-[1.5] text-white/85">')
    .replace('<div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">', '<div className="mt-7 flex flex-wrap items-center gap-3">')
    .replace('<span className="max-sm:hidden"><Btn href="#start" v="glass">Find your treatment</Btn></span>', '<Btn href="#start" v="glass">Find your treatment</Btn>')
    .replace('<ul className="mt-5 grid max-w-[calc(100%-8px)] grid-cols-2 gap-x-4 gap-y-2.5 font-inter text-[12.5px] font-medium', '<ul className="mt-6 grid max-w-[calc(100%-8px)] grid-cols-2 gap-x-4 gap-y-2.5 font-inter text-[13px] font-medium')
    .replace('<p className="sr-only" aria-live="polite">{`Photo ${slide + 1} of ${n}: ${HERO_SLIDES[slide].alt}`}</p>', "")
    .replace("paused ? 'Play header slideshow' : 'Pause header slideshow'", "paused ? 'Play header photos' : 'Pause header photos'")
    .replace("aria-label={`Show photo ${i + 1}: ${h.alt}`}", "aria-label={`Show header photo ${i + 1}`}")
    /* 2026-11-18, treatment heroes on phones (user): a stronger night colour behind the words, and the offer card in two rows */
    .replace('className="absolute inset-0 -z-10 lg:hidden"', 'className="absolute inset-0 -z-10 max-sm:!bg-[linear-gradient(180deg,rgba(11,15,19,.62)_0%,rgba(11,15,19,.58)_30%,rgba(11,15,19,.7)_62%,rgba(11,15,19,.9)_100%)] lg:hidden"')
    .replace('overflow-hidden rounded-[18px] lg:mb-0 py-3 pl-4 pr-3"', 'overflow-hidden rounded-[18px] lg:mb-0 py-3 pl-4 pr-3 max-sm:grid max-sm:w-full max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:gap-y-2 max-sm:py-3.5"')
    .replace(/<span className="min-w-0">(\s*<span className="offer-pill [^"]*)"/, '<span className="min-w-0 max-sm:col-span-2">$1 max-sm:whitespace-nowrap"')
    .replace('className="offer-big flex items-baseline gap-1.5 whitespace-nowrap"', 'className="offer-big flex items-baseline gap-1.5 whitespace-nowrap max-sm:!border-l-0 max-sm:!pl-0"')
    .replace("</head>", `${PHONE_HERO}</head>`);
  if (phase === "vip") {
    out = out
      .replace(/New-patient offers this month, (<a href="[^"]*" className="font-medium underline-offset-4 hover:underline">)see current offers →(<\/a>)/g, `VIP Sale: up to ${SALE_HEADLINE}%\u00a0off selected packages $1→$2`)
      .replace(/New-patient offers this month (<span className="font-medium">→<\/span>)/g, `VIP Sale: up to ${SALE_HEADLINE}%\u00a0off $1`);
  }
  return out;
}

export async function open(browser: Browser, site: Site, vp: { width: number; height: number }, query = "", paths: PagePaths = HOME, opts: { saleTab?: boolean } = {}): Promise<Page> {
  /* reduced motion stops the announcement ticker, the film and entrance animations, so both pages hold still */
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: "reduce", deviceScaleFactor: 1 });
  /* the chat's "Hi, how can I help?" note pops up 4.5 s after load, once per visit: marked as already seen,
     so it cannot appear on one page and not yet on the other while they are compared */
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("ndm-chat-note", "closed");
    } catch {
      /* storage blocked */
    }
  });
  if (!opts.saleTab) {
    /* the sale tab at the bottom of the window follows the running sale's phase on the new site ("VIP Sale") and
       is always "Black Friday" in the prototype: out of every comparison but its own (bf-dock.spec.ts). Added
       on every load, so it also holds after a test reloads the page */
    await ctx.addInitScript(() => {
      const add = () => {
        const style = document.createElement("style");
        style.textContent = "button.bfd-tab,#bfd-panel{visibility:hidden!important}";
        document.head.appendChild(style);
      };
      if (document.head) add();
      else document.addEventListener("DOMContentLoaded", add);
    });
  }
  const page = await ctx.newPage();
  /* one fixed date and time for both pages, so the Black Friday countdown and the booking calendar's
     "today" are the same on both (timers still run; only the clock's reading is fixed) */
  await page.clock.setFixedTime(new Date("2026-11-16T15:00:00-05:00"));
  if (site === "legacy") {
    const phase = await salePhase();
    await page.route(`${LEGACY_URL}${paths.legacy}*`, async (route) => {
      const response = await route.fetch();
      const html = await response.text();
      await route.fulfill({ response, body: prototypeNow(paths.legacyHtml ? paths.legacyHtml(html) : html, phase) });
    });
  }
  await page.goto(site === "legacy" ? `${LEGACY_URL}${paths.legacy}${query}` : `${NEXT_URL}${paths.next}${query}`);
  await page.waitForSelector("header nav, header button", { state: "attached", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  if (site === "legacy" && !query.includes("offer")) {
    /* the new site never shows the first-visit offer to an automated browser (a test asks for it with "?offer") */
    await page.addStyleTag({ content: ".offer-pop-root{display:none!important}" });
  }
  await page.waitForTimeout(1800); /* the header's own tone probes run at 50, 500 and 1500 ms */
  return page;
}

/**
 * The floating chat button, its note and the phone search button step aside while they lie over a button of the
 * page, at moments that depend on timing: they are compared in their own tests (chat.spec.ts, header.spec.ts)
 * and kept out of the pictures of page sections.
 */
export async function hideFloats(...pages: Page[]): Promise<void> {
  for (const p of pages) await p.addStyleTag({ content: ".chat-launch,.chat-pop,.float-search{visibility:hidden!important}" });
}

export function report(name: string, d: Difference[]): void {
  mkdirSync(SHOTS, { recursive: true });
  writeFileSync(`${SHOTS}/${name}.diff.json`, JSON.stringify(d, null, 2));
}

export async function shot(page: Page, name: string, clip?: { x: number; y: number; width: number; height: number }): Promise<Buffer> {
  mkdirSync(SHOTS, { recursive: true });
  return page.screenshot({ path: `${SHOTS}/${name}.png`, clip, animations: "disabled" });
}

/** Scrolls a section to the top of the window, waits for its images, and returns the section's height. */
export async function showSection(page: Page, selector: string): Promise<number> {
  const height = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    return el.offsetHeight;
  }, selector);
  await page.waitForFunction(
    /* only the images on screen: lazy ones further along a carousel or below the fold never load */
    (sel) =>
      Array.from(document.querySelectorAll<HTMLImageElement>(`${sel} img`)).every((i) => {
        const r = i.getBoundingClientRect();
        const onScreen = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
        return !onScreen || (i.complete && i.naturalWidth > 0);
      }),
    selector,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(900);
  return height;
}

/**
 * Pixel comparison: the prototype's screenshot becomes the reference the Next.js screenshot is held to.
 * @param maxDiffPixelRatio share of pixels allowed to differ (0.001 = one in a thousand)
 */
export async function expectSamePixels(testInfo: TestInfo, name: string, legacy: Page, next: Page, clip: { x: number; y: number; width: number; height: number }, maxDiffPixelRatio = 0.001, legacyClip = clip): Promise<void> {
  const original = await shot(legacy, `${name}-legacy`, legacyClip);
  const migrated = await shot(next, `${name}-next`, clip);
  const reference = testInfo.snapshotPath(`${name}.png`);
  mkdirSync(dirname(reference), { recursive: true });
  writeFileSync(reference, original);
  expect(migrated).toMatchSnapshot(`${name}.png`, { maxDiffPixelRatio });
}
