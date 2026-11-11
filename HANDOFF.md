# Handoff: NewDermaMed website prototype, branch `Pooria-Dev`

State as of 11 November 2026 (rounds 11 to 28). Read `CLAUDE.md` first: it has the stack, the build commands, the working rules and a note for every round.
The content sources and publish blockers 1 to 20 from the 2 November handoff are kept in Appendix A and B at the end; the blockers still apply unless listed as changed below. Some of them are already out of date (for example, the policy pages now exist).

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

## 7. Round 29 (11 November 2026), done

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
| About menu like Procedures (links left, the two clinic boxes right) | Done (both shells) |
| Our signature (home Aptos): remove the price, make it less text-based | Done: three dials whose blue arcs draw in (60 min, 2 weeks, 24 months) and icon chips |
| Black Friday page: booking form in the Black Friday style | Done (black card, red accents, CSS in `BFS_CSS`) |
| Botox About section: redesign with its own theme, light motion, keep the 5 tabs | Done (`ProcOverview`, `.ov2-*` in build_procedure.py: navy band, drifting orbs, turning ring, numbered tabs, glass panel) |
| Account page, checkout steps, privacy page (from the three NUVIOR samples) | Done: `account.html` ← `src/build_account.py` + `src/account-ui.jsx` (Premium membership instead of Nuvicoin, health and consent forms instead of B2B verification, sample member "Alex M."; benefits, price and renewal marked "To confirm"); checkout is Cart, Details, Appointment, Payment, Review, Confirmation (`src/cart-ui.jsx`); `privacy.html` ← `src/build_legal.py` + `src/legal-ui.jsx` (the sample's PHIPA text with NewDermaMed, its duplicated section shown once; effective date and Privacy Officer marked COPY NEEDED). Both use `src/shellpage.py`. The header account icon opens account.html; policy links open privacy.html. |

Rebuild everything with `./src/rebuild_all.sh pre` (syncs prices, builds every page, checks JSX and duplicate names, refreshes the Botox and concern crawler copies). `black-friday.html` (old preview) now skips the steps that no longer match the home page instead of failing.

Still open after round 29: Raymond must approve the Premium membership (benefits, price, terms), the privacy text for NewDermaMed (it is NUVIOR's sample adapted, plus the Privacy Officer and effective date), and the per-unit "From" prices (for example $7.70 / unit is the 220-unit Dysport package). Terms, CASL, refunds and accessibility pages are linked as `#/...` placeholders.

**Round 30 (11 November 2026):** alpha reverted; pricing has its own specials grid again (red deal tags, live prices); privacy page has a sticky On this page bar with a Legal documents submenu; Black Friday page menu order, underline, plan count, arrows, empty plan state and a light, wide booking pop-up. See CLAUDE.md.

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

## Appendix A. Content sources (NDM site, newdermamedlaserclinic.com)
- Prices: `/fees-financing/` (accordion `.accordion-item > .variable`).
- Promotions: `/promotion/`. Blog: `/blog/` (4 pages, 34 posts) and each post's page.
- About: `/about-us/` (team, clinics, parking, FAQ, gallery `wp-content/uploads/2025/09/About-us-gallery-01..10.png`).
- Botox: `/injectables/botox/` (header `wp-content/uploads/2025/09/2.jpg`, mobile `2.1.jpg`).
- Clinic and parking coordinates came from the Google Maps short links on the About page (their `!3d…!4d…` values).
- Figma file `spchZj0gZhW1XJHLaZanvS` (Frame 7, node 233:8730) holds the original homepage design.

## Appendix B. Publish blockers 1 to 20 (from the 2 November handoff)
1. **Raymond's written approval** is needed for every team name, photo, credential and review before anything goes live.
2. **Botox page:** the overview video is a placeholder (NDM's brand animation, which shows other brands' logos such as CoolSculpting and Juvederm); swap it for a Botox-neutral clinic video. Headings use "this treatment" instead of NDM's "Benefits of Botox" / "Why choose Botox?" (C.01.044). The before & after section shows NDM's Aptos photos as **samples only**. Real, consented Botox® photos are needed, and before/after next to a prescription drug name may not be allowed at all (C.01.044). Raymond must also confirm the "Up to 30% off" offer shown next to the name. The whole page needs his review.
3. **Article page:** text is NDM's with compliance edits; Raymond should review. The original author ("moe") is replaced by "the NewDermaMed team".
4. **NDM price list errors** copied as-is: Laser Acne Upper Back single $4,500 vs 3-pack $1,800; Photo-Rejuvenation Large 6-pack $2,844 = 3-pack price with "60% OFF"; BUY 1 GET 1 badges without an old price.
5. **Downtown address:** NDM says Suite 900 at 790 Bay Street, Google Maps says #1012. Confirm.
6. **Images and video are hotlinked** from newdermamedlaserclinic.com (and one hand image from a template). Move them into `assets/` before launch.
7. **Map tiles** come from Esri's free service. Check the provider's terms or set up a business account for production.
8. **Placeholders:** all forms (booking popup, contact, newsletter, procedure form) only show a thank-you; checkout is a placeholder; many menu links point to `#/…` pages that don't exist yet (Awards page content lives on about.html; Policies, procedure pages other than Botox, concern pages, etc. are still to build).
9. **Photo labels:** which interior photo belongs to which clinic are guesses; the clinic should confirm. Dr. Abbas Ashrafsadeh (listed on NDM's About page) is not included; no bio available.
10. **Home page:** the Aptos slide uses the NDM team photo (faces and NUVIOR / Aptos branding) and says NDM is an Aptos training centre; Raymond must approve the photo and confirm the training-centre wording. The filler picture shows a Juvederm® Volbella® syringe (brand visible).
11. **Home page, more:** the Aptos figure cross-fades to a body chart, but NUVIOR's own page says Visage Excellence is licensed in Canada for the midface only, so the body chart may need to go (Health Canada indications). The payment strip shows Klarna and Medicard as placeholders, confirm the real providers. The chat assistant is a prototype (keyword answers); a real assistant or live chat needs a backend and a privacy review. The TruSkin Age picture is a VISIA demo screenshot (patient name cropped out).
12. **Aptos page:** NDM's price list also sells nose, brow, neck and lower-face Aptos, which are outside the Canadian midface licence; only the mid face price is shown. The menu still says "Non-Surgical Facelift (Neck, Jawline, Eyebrow & Nose Lift)", Raymond should review. The chat persona (name + model photo) needs approval; it is labelled as a virtual assistant so patients are not misled.
13. **Why NewDermaMed photo** (SON_4821) shows champagne; Raymond should confirm it suits a medical page. NUVIOR images (product box, NAMICA sphere, marking photos) are hotlinked from nuvior.com.
14. **Home slide 2** now says "Number one Aptos training centre in Canada". A "number one" ranking is a comparative claim: Raymond must confirm it can be substantiated before launch, otherwise soften it. Slide 4 is now "Free skin analysis with VISIA® imaging".
15. **Takeaway photo** on the article page reuses a home page reviewer photo; swap for a separate stock image.
16. **New treatment and offer photos** (assets/treatments, assets/promotion) look AI-generated or stock; confirm licence/source before launch, and note the before & after source photos carry white eye masks.
17. **Campaign looks:** offers, dollar values, the gift card bonus window (January to March) and Boxing Week details are placeholders from the Nov 4 brief; Raymond must approve the lineup and offers. "VISIA" is kept out of campaign copy until legal answers the CPSO brand-name question. Prices are not shown in any campaign copy.
18. **Home slide 3** names Botox® in a headline. It sits beside "16+ years of experience" (about the clinic, not the drug) and the subhead has no benefit claim, but under C.01.044 and the CPSO brand-name question Raymond should confirm it. Slide 2 still says "#1", a comparative claim (see 14).
19. **Chat pop-up** uses the virtual assistant persona and photo (see 12) and plays a sound; confirm both are acceptable before launch.
20. **Black Friday preview page** uses a red sale-event look, which goes against the Nov 4 brief ("no red sale stamps", black + champagne) and NDM's "never discount-looking" brand rule. It is a mood preview only; it must not be published as is. Raymond decides the final Black Friday look.
