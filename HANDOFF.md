# Handoff: NewDermaMed website prototype, branch `Pooria-Dev`

State as of 11 November 2026 (rounds 11 to 28). Read `CLAUDE.md` first: it has the stack, the build commands, the working rules and a note for every round.
The earlier handoff (state on 2 November, with the original page-by-page status and publish blockers 1 to 20) is kept as `HANDOFF-2026-11-02.md`; its blockers still apply unless listed as changed below.

## 1. Goal

Redesign newdermamed.com as single-file HTML pages (React + Babel + Tailwind, see `CLAUDE.md`). This branch is the designer's own version ("my version"): it takes selected pieces from Ray's newest build (`../NDM-Ray-Dev/ray/V1/NDM`, branch `Ray-Dev`) and restyles them in this site's design system. The user is an NDM designer who writes in Persian; answer in plain English.

Standing instructions from the user:
- Work only on branch `Pooria-Dev`, in this folder (`NDM-pooria`). Commit and push only when asked.
- Campaign looks are hidden; only Black Friday is wanted.
- No black buttons (the Black Friday page is the one exception, it has its own look). Only "Book Free Consultation" is amber.
- Check every change on desktop (1440) and phone (375) with no sideways scroll.

## 2. Current state

- **Git:** branch `Pooria-Dev`, latest commit `8943bb0`, pushed; local and `origin/Pooria-Dev` are identical. 32 commits ahead of `main`. The only uncommitted change is this handoff (new `HANDOFF.md`, old one renamed).
- **Other branches:** `main` (first setup commit only), `Ray-Dev` (Ray's build; a push there deploys to cPanel, never push to it). The local branch `pooria` is an older pointer and the GitHub branch `Pooria` was deleted; ignore both.
- **Folders:** `../NDM` = `main` (preview port 5174), `../NDM-Ray-Dev` = Ray's branch (5175), this folder = `Pooria-Dev` (5176, `ndm-pooria` in `../.claude/launch.json`).
- **Push login:** saved in the Mac Keychain for GitHub user `Design-NUV`; the remote URL carries that user name. No `gh` or SSH key on this Mac.
- **All 15 pages pass** `node tools/jsxcheck.js <page>.html --html` and have no duplicate top-level names.

### Pages
| Page | Built from | State |
|---|---|---|
| `index.html` | edited directly (shell) | Home. Clinic video in "Inside our clinics", new chat bot, Black Friday tab. |
| `promotion.html` | edited directly (shell for every other page) | Ray's ten offers with red deal badges, home-style Before & after and How it works, @newdermamed. |
| `pricing.html` | `src/build_pricing.py` | Clinic video header (loops, light shade), monthly specials cards, price list, @newdermamed. |
| `about.html` | `src/build_about.py` | Compact clinic cards side by side (map on top), @newdermamed. |
| `botox.html` | `src/build_procedure.py` | Ray's Botox content in this site's sections, SEO head and structured data. Run prerender after each build. |
| `aptos-thread-lift.html` | `src/build_aptos.py` | Icon section bar, clinic cards, compact booking form. |
| `wrinkles-fine-lines.html` | `src/build_concern.py` | Concern page after Ray's, Botox look. Run prerender after each build. |
| `before-after.html` | `src/build_before_after.py` | Gallery, 50 cases. |
| `black-friday-sale.html` | `src/build_bf_sale.py` + `src/bf-sale-ui.jsx` | Black Friday landing page (new). |
| `black-friday.html` | `src/build_blackfriday.py` (from index) | Older mood preview of the home page; not linked. |
| `blog.html`, `what-causes-rosacea-redness.html`, `cart.html`, `checkout.html`, `order-confirmed.html` | their builders | Only site-wide changes (menu, chat, tab). |

Rebuild order after any change to `promotion.html`: `build_pricing build_about build_blog build_article build_procedure build_aptos build_cart build_before_after build_concern build_bf_sale` (each `python3 src/<name>.py . src`), then `python3 src/build_blackfriday.py .`, then `python3 tools/prerender.py . botox.html` and `python3 tools/prerender.py . wrinkles-fine-lines.html`.

## 3. What changed (by area)

- **From Ray's build (rounds 12 to 13, 20 to 22):** the few-steps booking form (`BookForm`, `BookPicker`), Home menu item, warm photo grade, icon section bar (`TxNav`), Uptown/Downtown cards (`TxVisit`), before & after page, Botox content and SEO structure, the concern page structure and copy, his ten promotion offers, and his earlier "Exclusive monthly specials" cards (commit `8b887a5` on Ray-Dev) on pricing.
- **Botox (13 to 24):** sections Benefits, The clinic, About (tabs), Why choose, Watch (reel in an iPhone frame, played from the NDM site), Results, Prices, Good to know (numbered questions, Book card, six related treatments), Why NewDermaMed, Visit us, Start your journey card, FAQ. Title, description, canonical, Open Graph and JSON-LD written by the builder.
- **One clinic video (22, 25):** `assets/clinic/ndm-clinic.mp4` (15 MB, with voice; poster `ndm-clinic-poster.jpg`) plays in the home "Inside our clinics" frame, the Botox clinic film and the pricing header. One file only; never copy it. Home and Botox have a sound button.
- **Black Friday (23 to 28):** landing page with hero (night clinic photo, turning offer tickets `BfsFan`, countdown, crossed tapes), four-number strip, step 1 concerns, step 2 deal cards built from the price list (`PRICE_CATS`; area and package pickers, "Add to my plan", plan kept in `localStorage` key `ndm-bf-plan`), six specials, how it works, step 3 plan, clinics, simple footer. Sale dates are in `BF_SALE` (shells) and `BFS` (`bf-sale-ui.jsx`): Nov 27 00:00 to Nov 30 23:59 ET. Every other page shows a black tab at the bottom centre (`BfDock`) that opens a full-width panel with the timer; it hides on the landing page and after the sale. The Campaign looks switcher is no longer mounted.
- **Site-wide (17 to 27):** purple NAMICA card in the Aptos menu panel; booking form keeps one height; the 16 years mark is a gold image; testimonials card row runs edge to edge on treatment and concern pages; chat bot redesigned (photo launcher, blue header, quick actions, question rows).
- **Tooling:** `tools/prerender.py` (from Ray, plus `data-pre-keep`) writes the static copy crawlers read; needs Chrome, `bs4`, `lxml`.

## 4. Files touched (vs `main`)

- **Shells:** `index.html`, `promotion.html`. Shell changes are made with patches in `src/patches-applied/` (already applied, do not rerun): `r11_concern_links`, `r12_ray_port`, `r17_aptos_menu_card`, `r18_book_picker_height`, `r18b_book_compact`, `r21_promotion`, `r22_clinic_video`, `r22_mark16`, `r22_promotion`, `r23_bf_menu`, `r24_bf_dock`, `r27_chat`.
- **Sources:** `src/procedure-ui.jsx`, `src/treatment-ui.jsx`, `src/media-ui.jsx`, `src/aptos-ui.jsx`, `src/concern-ui.jsx`, `src/concern-data.json`, `src/pricing-ui.jsx`, `src/pricing-data.jsx`, `src/about-ui.jsx`, `src/bf-sale-ui.jsx`, `src/before-after-data.json`.
- **Builders:** `src/build_procedure.py`, `build_aptos.py`, `build_concern.py`, `build_pricing.py`, `build_about.py`, `build_before_after.py`, `build_bf_sale.py`, `build_blackfriday.py`.
- **Generated pages:** every `.html` except `index-fraunces.html`.
- **Assets added:** `assets/before-after/` (50), `assets/home/` (65), `assets/live/` (16), `assets/clinic/` (video, poster, photos), `assets/treatments/`, `assets/promotion/`, `assets/botox/`, `assets/pricing/`, `assets/team/`, `assets/hero/`, `assets/icons/16-years-gold.svg`.
- **Docs and tools:** `CLAUDE.md`, `HANDOFF.md`, `tools/prerender.py`.

## 5. What failed, and how it was handled

- **Pushing from this Mac:** no GitHub credential at first. An email was typed as the user name, then the token was pasted at the shell prompt, so both attempts failed. Fixed by pushing with the user name `Design-NUV` in the URL and pasting a personal access token at the Password prompt; the Keychain now holds it. **The token was pasted into the chat, so it should be revoked and replaced** (github.com/settings/tokens); the next push will then ask for the new one.
- **GitHub branch `Pooria`:** deleted on GitHub while the first upload was running, so that push was rejected. `Pooria-Dev` replaced it.
- **Video size:** macOS `avconvert` could not make the 15 MB clinic video smaller, and `ffmpeg` is not installed. The original file is used and loaded only when its section is near (home, Botox); on pricing it loads with the page.
- **Tailwind Play CDN quirks:** the `grid` class overrides the `hidden` attribute (use conditional classes); an arbitrary `mt-[...]` can beat a later `lg:mt-*` (use `lg:!mt-*`).
- **Clipped elements never report as visible** to IntersectionObserver (Start your journey card): observe the parent section.
- **Shop section:** its stage had a fixed height, so the product cards rode up under the button; it is now `min-height`.
- **Seamless pages** force paper backgrounds with `!important`; a section that needs its own background needs its own `!important` rule (see `#home-care` in `build_concern.py`).
- **Preview pane:** it pauses animations and scroll effects while hidden, and the offer pop-up reopens on every page load, so screenshots can look blurred or frozen. Verify with JavaScript, and close the pop-up before a screenshot.
- **`black-friday.html` builder** broke twice when the shells changed (the switcher mount line, a duplicate `useBfClock`); both fixed in `build_blackfriday.py`.

## 7. Round 29 (11 November 2026), in progress

Asked by the user in one message; status of each item:

| Item | Status |
|---|---|
| Remove Book Free Consultation from the Black Friday bottom panel | Done (`r29_quick.py`) |
| One price source: every price comes from the pricing page | Done. `src/pricing-data.jsx` + `src/price-lib.jsx` are copied into both shells by `src/sync_prices.py` (markers `PRICES:BEGIN/END`). `priceFrom(id, item)` = lowest price after the discount, per unit / syringe / session; `priceFor(name)` maps card names (`PRICE_NAMES`). Used by the pricing page From prices, home menu cards and Start panels, SPECIALS (wheel, Black Friday page), Botox price table (`priceRows`), Aptos price, concern options. |
| Botox / Dysport shows the discount effect: From $7.70 / unit | Done |
| Home link in the Black Friday page menu | Done |
| Remove treatments NDM does not offer from consultation choices (RF Microneedling, truSculpt®); Start panel prices = lowest of each procedure | Done (Fotona 4D renamed 4D Rejuvalift). Booking form choices already matched the live menu. |
| No thousands comma in prices ($1000) | Done (`money()`, `money2()`, `pfmt()`, written prices) |
| Favicon like the live site | Done (`assets/icons/favicon-48.png`, `apple-touch-icon.png`, `logo-mark.svg`) |
| Header blurred from the start | Done (home header no longer waits for the intro) |
| Monthly specials like the promotion page (red deal tags) + "alpha" entrance (cards travel along the circle from the left) | Done on home, promotion and pricing (`r29_specials.py`; revert alpha by restoring the old ox/oy/or sweep there) |
| Remove the Dark / Light switch on promotion | Done |
| "Save on cosmetic treatment" above the financing button, centred | Done |
| About menu like Procedures (links left, the two clinic boxes right) | To do |
| Our signature (home Aptos): remove the price, make it less text-based | To do |
| Black Friday page: booking form in the Black Friday style | To do |
| Botox About section: redesign with its own theme, light motion, keep the 5 tabs | To do |
| Account page (from `../new website Odoo/nuvior-account_3.html`, "premium membership" instead of Nuvicoin, NDM-specific), cart and checkout steps after `nuvior-checkout-flow-prp-requirement (1).html`, privacy page after `nuvior-legal-privacy_1.html` | To do |

Rebuild everything with `./src/rebuild_all.sh pre` (syncs prices, builds every page, checks JSX and duplicate names, refreshes the Botox and concern crawler copies). `black-friday.html` (old preview) now skips the steps that no longer match the home page instead of failing.

## 6. What should be done next

1. **Raymond's written approval before anything goes live** (raymond@nuvior.com):
   - Black Friday: the page shows the current price-list offers as the Black Friday deals and "Up to 60% off"; the real offers, dates and wording need confirming. Its red sale look also goes against the "never discount-looking" brand rule and the 4 November brief.
   - Botox: the live wording names Botox® beside its effects (C.01.044); the new Benefits, Good to know and FAQ copy; Dr. Mastouri's name in one FAQ answer.
   - Concern page copy (Ray's, not live wording), the promotion deal labels, the pricing specials (including the $3,999 Non-Surgical BBL card Ray later dropped), team names and photos, the chat assistant persona and photo.
2. **Replace the GitHub token** (see section 5).
3. **Pages that links point to but do not exist yet:** treatment pages for Dermal Fillers, Lip Augmentation, Skin Boosters, Sculptra®, Microneedling, Laser Skin Resurfacing and the other concerns. They are `#/slug` placeholders; add each new page to `PAGE_LINKS` in both shells so `slug()` opens it. New treatment pages should reuse `src/treatment-ui.jsx`; new concern pages `src/concern-ui.jsx` with their own data file.
4. **Clinic video:** get a web-sized export (H.264, about 3 to 5 MB, plus a smaller phone version) and keep the same file name.
5. **Black Friday plan:** "Add to my plan" only keeps a list in the browser. Decide whether the plan should be sent with the booking request or to the cart.
6. **Still open from the 2 November handoff:** forms only show a thank-you, checkout is a placeholder, images and reels are hotlinked from the live site and the shop, map tiles use Esri's free service, photo licences need confirming.
7. **Merging with Ray's work:** `Pooria-Dev` and `Ray-Dev` have diverged widely (Ray's build has 54 live treatment pages, shop pages and its own SEO patch). Agree with Ray which branch is the base before either is merged into `main`.
8. `black-friday.html` (old preview) and `index-fraunces.html` are unused; ask the user before deleting.
