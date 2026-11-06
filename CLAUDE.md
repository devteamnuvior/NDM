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
- Rebuild (run from this folder): `python3 src/build_pricing.py . src` (same pattern for about, blog, article, procedure, aptos). After any change to promotion.html, rebuild all six; after any change to index.html, rebuild black-friday.
- **Site-wide change** (header, menu, footer, cart, popup, colours): write a small Python patch, apply it to index.html and promotion.html, then rebuild the five generated pages. Past patches are kept in `src/patches-applied/` for reference; they are already applied, do not run them again.
- `index-fraunces.html` and `tools/make_serif.py` are obsolete (replaced by `FONT_CHANGE`).
- **Campaign looks:** colours that change with a campaign must use the `--cmp-*` tokens under `html[data-campaign]` (see the CSS near `.menu-item-m`); add new campaigns to `CAMPAIGNS` in both shells, and new treatment / medical pages to `CAMPAIGN_SKIP`.
- `src/process-old.jsx` holds **Process-old**, the home page's original pinned Process section. The user will say where to use it; do not delete it.

## Working rules (from the user)
- Only build what is asked in each message. Never build sections ahead of the ask.
- When the user picks a new page to work on, every previously worked page is frozen. Edit a frozen page only for site-wide changes the user asks for. Frozen now: promotion, pricing, about, blog, article. Active (worked on 2026-11-04): index.html, aptos-thread-lift.html and botox.html. New treatment pages should reuse the sections in `src/treatment-ui.jsx`.
- Reference sites give **layout and motion only**. Buttons, tags, colours, cards and form fields must stay in our design system so pages never look mismatched.
- Buttons: only "Book Free Consultation" uses `Btn v="book"` (amber pill with arrow dot; `hot` = amber everywhere incl. headers). Every other button is a plain pill with no icon (`ink`, `line`, `light`, `glass`; blue `btn-buy` for Add to cart / Read article / call buttons).
- Section tags use the `Eyebrow` component. Every h2 is two-tone (`TwoTone`, `dark` on dark bands), and the second colour always starts on a new line (`lead={<>Text<br /></>}`).
- Breadcrumb on every page except home: shared `Breadcrumb` component, top left under the header, never inside a hero.
- Never invent facts, prices, hours or claims. Content comes from newdermamedlaserclinic.com (scrape via the browser; curl gets 403 on most pages).
- Mobile matters most (about 90% of visitors): check every change at 375px wide, with no sideways scroll.
- Verify every change in the browser (desktop and phone) before reporting.

## Compliance (organization rules, always)
- No em dash ("—") anywhere in copy, labels, alt text or titles: use commas.
- Health Canada qualified language: "may", "can", "results vary"; never "will", "guaranteed", "permanent", "cures".
- Prescription drugs (Botox®, Dysport®): never combine the drug name with a consumer benefit claim in external content (C.01.044). Name + price + quantity is fine; describe effects as "the treatment".
- Any before/after asset must say "Individual results may vary".
- No patient names, DOBs, contact details or treatment records (PHIPA). Shorten reviewer names.
- Doctor / team names and photos are used normally in drafts, but written approval from Raymond Valadkhani (raymond@nuvior.com) is required before anything is published. When in doubt, do not publish; flag to Raymond.
- Brand: medical-grade, results-focused, premium; never a medspa, discount or volume look.
