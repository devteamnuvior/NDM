# NewDermaMed website prototype (newdermamed.com)

Single-file HTML pages for the NewDermaMed (NDM) website redesign. Claude works as product / UI designer and front-end developer.
The user is an NDM designer who writes in Persian; answer in clear, plain English unless asked otherwise.
Read `HANDOFF.md` before starting: it has the page-by-page status, content sources and open publish blockers.

## Stack
- Each page is one HTML file: React 18.3.1 UMD + Babel standalone 7.24.7 (JSX in a `<script type="text/babel">`), Tailwind Play CDN 3.4.5 with `ndm.*` colours, Lenis 1.1.13 smooth scroll. about.html also loads Leaflet 1.9.4 from cdnjs.
- `const FONT_CHANGE = true` in the Tailwind config: Fraunces headings (`font-aeonik` class), Manrope text (`font-inter`), Helvetica Neue / Inter for menu, buttons and fields.
- Colours: ink #1B242B, muted #5A646C, brand blue #209ED9 / deep #0F80C3 / sky #26B1E7, amber #FFA617, paper #FAFAF8 (page background), mist #F2F2EF, night #0B0F13.
- Side gutter is the CSS var `--gx`; every section uses `px-[var(--gx)]`.

## Run and check
- Preview: the `ndm-site` entry in `../.claude/launch.json` serves this folder at http://localhost:5174 (or run `python3 -m http.server 5174` here). Add `?v=N` to bust the browser cache after a rebuild.
- JSX check after every change: `node tools/jsxcheck.js <page>.html --html` (must print `OK`).
- If the browser preview serves an old copy of a page, the app may still be running the server from a previous session folder: compare `curl -s localhost:5173/<page>` with the local file before trusting a screenshot.
- The preview pane pauses `requestAnimationFrame` and CSS animations while hidden; scroll reveals (`.rv`) and scroll handlers may look frozen in screenshots. That is a tool artifact, not a bug.

## Which files are edited, which are generated
- **Edited directly:** `index.html` and `promotion.html`. promotion.html is also the "shell" every other page is built from.
- **Generated (never hand-edit, edit `src/` and rebuild):**
  - `pricing.html` ← `src/build_pricing.py` + `src/pricing-data.jsx` + `src/pricing-ui.jsx`
  - `about.html` ← `src/build_about.py` + `src/about-ui.jsx`
  - `blog.html` ← `src/build_blog.py` + `src/blog-ui.jsx`
  - `what-causes-rosacea-redness.html` ← `src/build_article.py` + `src/blog-ui.jsx` + `src/article-ui.jsx`
  - `botox.html` ← `src/build_procedure.py` + `src/procedure-ui.jsx` + `src/treatment-ui.jsx`
  - `aptos-thread-lift.html` ← `src/build_aptos.py` + `src/procedure-ui.jsx` (hero, form, glance card) + `src/treatment-ui.jsx` (shared treatment sections) + `src/aptos-ui.jsx` (content)
  - `black-friday.html` ← `src/build_blackfriday.py` (from index.html; Black Friday mood preview, rebuild after index changes)
  - `cart.html`, `checkout.html`, `order-confirmed.html` ← `src/build_cart.py` + `src/cart-ui.jsx` (cart → checkout → confirmation, after bellairlaserclinic.ca; payment is "pay at your appointment" only, no card fields)
- Rebuild (run from this folder): `python3 src/build_pricing.py . src` (same pattern for about, blog, article, procedure, aptos, cart). After any change to promotion.html, rebuild all six; after any change to index.html, rebuild black-friday.
- **Site-wide change** (header, menu, footer, cart, popup, colours): write a small Python patch, apply it to index.html and promotion.html, then rebuild the five generated pages. Past patches are kept in `src/patches-applied/` for reference; they are already applied, do not run them again.
- `index-fraunces.html` and `tools/make_serif.py` are obsolete (replaced by `FONT_CHANGE`).
- **Campaign looks:** colours that change with a campaign must use the `--cmp-*` tokens under `html[data-campaign]` (see the CSS near `.menu-item-m`); add new campaigns to `CAMPAIGNS` in both shells, and new treatment / medical pages to `CAMPAIGN_SKIP`.
- **Home order (2026-11-06, round 6):** hero, About NewDermaMed (`Statement`, original, no logo strip), Start, `TreatMenu` (card carousel on paper, tabs, arrows; no scroll-jacking), `AptosCare`, `Space` ("Inside our clinics": a large photo slider of the v3 clinic photos whose frame opens to both sides on scroll), Team, Before & after (row of seven cases, side arrows), testimonials (one looping row), How it works (cards), Monthly specials (fades in and out of the page colour), booking (one card on a photo). Patches: `src/patches-applied/r6_*`, `r7_*`.
- **Home sections from the website v3 prototype (2026-11-06):** film hero with the brand band (replaced the scroll slides and the logo strip), `Start` ("Where would you like to start?"), `AptosCare` (v3 "A non-surgical facelift" band in NDM colours, nuvior.com/aptos style photo cards with the turning NAMICA badge, marking photos below), `TreatMenu` (All tab first; pinned, cards move left on scroll) and `Space` (the expanding clinic film carrying the About NewDermaMed text and numbers; the separate About section, Most popular treatments and the old patient reviews are gone). `BeforeAfter` is the v3 four-card grid and `Saying` is now the inner-page testimonials rows with awards cards in between. Patches and pieces: `src/patches-applied/home_v3_*`; media: `assets/home/v3/`. The two films are placeholders made from clinic photos: replace with real footage (same file names, H.264 MP4, under 3 MB). Links to pages not built yet use `#/slug`.
- **Team:** the fourth member is Heather Bouchard, NP (`team-heather`, photo `assets/team/heather.jpg`). Her profile (bio, focus, facts) has not arrived, so her entry keeps `sample: true`: the card shows, but it opens no profile and the About page bios skip her.
- **Shared behaviour (both shells, 2026-11-06):** one three-step booking form (`BookForm`) serves the booking section and the Book Free Consultation pop-up; every About menu link opens about.html from the top; the offer pop-up shows once on every page until it is closed (`ndm-offer-closed`); the chat note shows on every page until the chat is opened or the note dismissed; the Procedures mega menu has its original look (two columns, no lines) and Aptos shares the same layout.
- **Round 8 (2026-11-06):** home order is now hero, About NewDermaMed, Start, TreatMenu, AptosCare, Space, Team, Before & after, How it works, Monthly specials, testimonials (`Saying`, moved before the clinics), VisitUs, FAQ, booking, shop, journal, social. `Space` changes clinic photos on its own with a slow pan and zoom (no arrows, no counter). Booking (`BookForm`, both shells) is three steps: concern, clinic plus a month calendar with hourly time slots from `HOURS` (Sundays closed), details; a short "Request sent" thanks; the dark "Your appointment" summary shows on desktop only. Submenu items have thin lines between them (`.panel .menu-item`). Inner pages use the home testimonials row (`PromoReviews`). Botox: no Compare section, the glance card sits half over the hero photo (`TxGlance`, shared with Aptos), "Start your journey" free skin analysis band before the FAQ. Aptos: "How many you need" lives in the price section (`#sessions`). Pieces: `src/patches-applied/r8_*`.
- **Round 9 (2026-11-06):** clinic photos (`Space`) start loading two screens early and only advance once the next photo is ready; the testimonials row (`ReviewRow`, both shells) loops from three copies, moves faster (`dur` 22) and follows trackpad swipes; the booking card keeps one height on every step (steps stacked in one grid cell, six-week calendar); the chat note is one line ("Hi, how can I help?"); the offer pop-up shows once on every page per visit (sessionStorage), even after it was closed; the Procedures menu no longer lists Aptos twice (the panel title links to the page). Botox and Aptos end with the "Start your journey" band (`ProcAnalysis`, photo `assets/treatments/journey-skin.webp`, opens from the middle, words sharpen from a blur). Promotion and pricing use `main.seamless` (paper sections with edge-faded glows; main look only). Aptos logo files: `assets/aptos/aptos-logo*.svg`. Patches: `src/patches-applied/r9_*`.
- **Round 10 (2026-11-06):** about.html opens with the About NewDermaMed film as its header (`AboutFilm hero`, h1, id `top`; `AboutHero` is no longer rendered); its team cards open the shared `TeamProfile` dialog (Heather shows "Full profile coming soon"). Testimonials drift at `dur` 28; the Start your journey band is a little taller.
- **Campaign looks are on hold:** do not change campaign styles or black-friday.html looks until the user says so; all work goes on the main (default) version.
- `src/process-old.jsx` holds **Process-old**, the home page's original pinned Process section. The user will say where to use it; do not delete it.

## Working rules (from the user)
- Only build what is asked in each message. Never build sections ahead of the ask.
- When the user picks a new page to work on, every previously worked page is frozen. Edit a frozen page only for site-wide changes the user asks for. Frozen now: promotion, pricing, about, blog, article. Active (worked on 2026-11-04): index.html, aptos-thread-lift.html and botox.html. New treatment pages should reuse the sections in `src/treatment-ui.jsx`.
- Reference sites give **layout and motion only**. Buttons, tags, colours, cards and form fields must stay in our design system so pages never look mismatched.
- Buttons: only "Book Free Consultation" uses `Btn v="book"` (amber pill with arrow dot; `hot` = amber everywhere incl. headers). Every other button is a plain pill with no icon (`ink`, `line`, `light`, `glass`; blue `btn-buy` for Add to cart / Read article / call buttons). No black buttons: since 2026-11-06 `ink` and the non-hot `book` pill are theme blue #0F80C3 with a deep navy hover #0A4F7A (also the floating search, the cart bar and open price toggles).
- Section tags use the `Eyebrow` component. Every h2 is two-tone (`TwoTone`, `dark` on dark bands), and the second colour always starts on a new line (`lead={<>Text<br /></>}`).
- Breadcrumb on every page except home: shared `Breadcrumb` component, top left under the header, never inside a hero.
- Never invent facts, prices, hours or claims. Content comes from newdermamedlaserclinic.com (scrape via the browser; curl gets 403 on most pages).
- Mobile matters most (about 90% of visitors): check every change at 375px wide, with no sideways scroll.
- Verify every change in the browser (desktop and phone) before reporting.

## Git commits
- Repo: https://github.com/devteamnuvior/NDM, branch `main`. Commit and push only when the user asks.
- Every commit follows Conventional Commits: `type(scope): short descriptive message`.
- Types: `feat` (new feature), `fix` (bug fix), `chore` (maintenance, config, tooling), `refactor` (restructure, same behaviour), `docs` (documentation), `style` (formatting, styling), `test` (tests), `perf` (performance), `build` (build system or dependencies), `ci` (CI/CD config).
- Rules:
  1. Type, scope and description are all lowercase.
  2. Keep it concise, clear and meaningful.
  3. Include a scope whenever one applies (a page such as `index`, `botox`, `pricing`; or an area such as `header`, `footer`, `build`, `git`).
  4. Write in English.
  5. Never use vague messages like "update", "changes" or "fixes".
  6. Pick the type from what actually changed.
  7. Separate unrelated changes into separate commits.
- Examples: `feat(botox): add pricing table section`, `fix(header): close mobile menu on link tap`, `chore(git): ignore claude local settings folder`.

## Compliance (organization rules, always)
- No em dash ("—") anywhere in copy, labels, alt text or titles: use commas.
- Health Canada qualified language: "may", "can", "results vary"; never "will", "guaranteed", "permanent", "cures".
- Prescription drugs (Botox®, Dysport®): never combine the drug name with a consumer benefit claim in external content (C.01.044). Name + price + quantity is fine; describe effects as "the treatment".
- Any before/after asset must say "Individual results may vary".
- No patient names, DOBs, contact details or treatment records (PHIPA). Shorten reviewer names.
- Doctor / team names and photos are used normally in drafts, but written approval from Raymond Valadkhani (raymond@nuvior.com) is required before anything is published. When in doubt, do not publish; flag to Raymond.
- Brand: medical-grade, results-focused, premium; never a medspa, discount or volume look.
