# 01. Architecture of the prototype, and the production setup

## How a page works today

Every page is one self-contained HTML file (about 530 to 800 KB) with no build step:

1. `<head>`: title, description, the SEO block (between `<!-- seo -->` and `<!-- /seo -->`), Google Fonts links, an embedded Aeonik font (base64, about 136 KB, unused while `FONT_CHANGE = true`), the Tailwind Play CDN 3.4.5 with an inline `tailwind.config` (colours and fonts), and the page CSS (about 60 KB of custom rules: buttons, motion, sections).
2. `<body>`: `<div id="root">` and `<div id="book-root">`, then CDN scripts (React 18.3.1 and ReactDOM UMD from unpkg, Babel standalone 7.24.7, Lenis 1.1.13 for smooth scrolling), then one `<script type="text/babel" data-presets="react">` of about 440 KB holding:
   - the shared shell: promo bar, header and mega menus, search overlay, phone drawer, footer, booking form and booking pop-up, cart drawer and cart pill, chat assistant, offer pop-up, campaign switch;
   - the page's components and the page's data (for example `const PROC = {...}` on treatment pages, `const CN = {...}` on concern pages);
   - `ReactDOM.createRoot(...).render(<App />)`, plus roots for the booking pop-up and the campaign switch.

Babel compiles the JSX in the browser on every load and Tailwind builds its CSS at runtime. All visible content is rendered by React in the browser.

## Where the pages come from

- `index.html` (home) and `promotion.html` are edited by hand. `promotion.html` is also the **shell**: every other page is generated from it by a Python build script that swaps in the page's components, data, title, description and structured data.
- A change to the shared shell (header, menus, footer, booking form, colours) is written as a small idempotent Python patch in `src/patches-applied/`, applied to both `index.html` and `promotion.html`, and then every page is rebuilt. Past patches are kept as a record; they are already applied.

| Pages | Build script | Parts and data |
|---|---|---|
| 54 treatment pages (incl. `botox.html`) | `src/build_live_treatments.py` | `src/live-treatment-ui.jsx`, `src/treatment-ui.jsx`, `src/procedure-ui.jsx`, `src/live-media-ui.jsx`; data `src/live/services.json`, `pricing.json`, `menu.json`, `images.json`, media from `src/live_media.py` |
| `aptos-thread-lift.html` | `src/build_aptos.py` | `src/aptos-ui.jsx` (the one page whose copy the team rewrote), plus the treatment parts |
| `concerns.html` + 22 `concern-*.html` | `src/build_concerns.py` | `src/concern-ui.jsx`; copy and treatment registry in `src/concerns_data.py` |
| `shop.html` + 68 `shop-*.html` | `src/build_live_shop.py` | `src/shop-ui.jsx`; data `src/live/shop.json`, `shop-home.json` |
| 34 article pages | `src/build_live_blog.py`, then `src/build_article.py` for `what-causes-rosacea-redness.html` | `src/article-ui.jsx`, `src/blog-ui.jsx`; data `src/live/pages.json` |
| `blog.html` | `src/build_blog.py` | `src/blog-ui.jsx` |
| `before-after.html` | `src/build_live_pages.py` | data `src/live/pages.json` (the live gallery) |
| `pricing.html` | `src/build_pricing.py` | `src/pricing-ui.jsx`, `src/pricing-data.jsx` |
| `about.html` | `src/build_about.py` | `src/about-ui.jsx` |
| `cart.html`, `checkout.html`, `order-confirmed.html` | `src/build_cart.py` | `src/cart-ui.jsx` |
| `black-friday.html` (campaign preview, on hold) | `src/build_blackfriday.py` | built from `index.html` |

`src/build_procedure.py` is the team's earlier Botox page, kept for reference only. Do not run it: it would overwrite `botox.html`. `index-fraunces.html` and `tools/make_serif.py` are obsolete.

The content in `src/live/*.json` was crawled from newdermamedlaserclinic.com on 7 November 2026 and is used word for word, apart from the edits Raymond approved (see `NDM/HANDOFF.md`, section 9). Generated maps: `pages-built.json` (live path to file), `posts-built.json`, `concerns-built.json`, `concerns-map.json`.

## Rebuild everything

From the `NDM/` folder, with Python 3.10 or newer and Pillow (`pip install pillow`), and Node for the check:

```
python3 -I src/build_pricing.py . src
python3 -I src/build_about.py . src
python3 -I src/build_aptos.py . src
python3 -I src/build_cart.py . src
python3 -I src/build_blackfriday.py . src
python3 -I src/build_live_treatments.py . src
python3 -I src/build_live_shop.py . src
python3 -I src/build_live_blog.py . src
python3 -I src/build_blog.py . src
python3 -I src/build_article.py . src
python3 -I src/build_live_pages.py . src
python3 -I src/build_concerns.py . src
python3 -I src/patches-applied/live_images_patch.py .
python3 -I src/patches-applied/live_links_r2_patch.py .
python3 -I src/patches-applied/seo_patch.py .
for f in *.html; do node tools/jsxcheck.js "$f" --html; done
```

`seo_patch.py` must always run last: the build scripts strip the shell's SEO block and the patch writes each page's own. If the concern data changes, run `build_concerns.py` and then `build_live_treatments.py` and `build_aptos.py` again (they read `concerns-map.json` for the "Concerns it may help with" strip).

## Media

| Folder | Content |
|---|---|
| `assets/live/main/`, `assets/live/shop/` | Every picture and clip taken over from the live site and its shop (about 168 MB), same file names as on the live server |
| `assets/live/thumbs/` | 720 px WebP copies of the treatment photos, used on concern-page cards |
| `assets/home/` | Home page photos and films; `assets/home/v3/film/` holds the poster frames of the clinic films and reels |
| `assets/clinic/`, `assets/space/`, `assets/hero/` | Clinic interiors and hero media |
| `assets/team/`, `assets/awards/`, `assets/logos/`, `assets/icons/` | Team portraits, award badges, partner logos, logo files and icons |
| `assets/footer/` | The footer clinic film and its poster |

## Recommended production setup

The prototype setup is meant for design review. For production we recommend:

1. **Serve finished HTML (pre-render).** Today the page text lives inside a script and appears only after React runs. Google renders JavaScript, but many crawlers do not, including most AI search crawlers and social link previews: they would see only the head. Static generation (SSG) or server rendering of every page is the most important step for search and AI visibility.
2. **Compile ahead of time.** Replace Babel standalone with a build (for example Vite or esbuild with React), and the Tailwind Play CDN with a Tailwind 3.4 build using the same theme (copy `tailwind.config` from the page head). Expect a large drop in page weight and load time.
3. **Share the shell.** The header, menus, footer, booking form, cart and chat are repeated inside every page. They are plain React function components and can move into shared modules as they are.
4. **Fonts.** Self-host Fraunces, Manrope and Inter (open licences), and remove the base64 Aeonik embed unless the clinic holds an Aeonik web licence and wants it back.
5. **Images and video.** Serve responsive sizes and modern formats through a CDN (many live photos are 1440 px JPEGs). Keep the clinic films and reels muted, `playsInline`, `preload="none"` with poster frames, playing only on screen, as the prototype does.
6. **CMS, if wanted.** The page data is already separated from the layout (`services.json`, `shop.json`, `pages.json`, `concerns_data.py`), so it maps to CMS fields directly. A WordPress or headless setup can use these pages as the visual and content spec.
7. **Keep the head data and URLs.** Whatever the stack, keep each page's title, description, canonical address and structured data, and choose the final URL pattern before launch (see `specs/06-seo-geo.md`).
