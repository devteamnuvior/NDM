# NewDermaMed website (Next.js)

The NewDermaMed site, being migrated section by section from the static prototype in the repository
root (single-file HTML pages with React, Babel and Tailwind loaded from CDNs) to Next.js.

The design is frozen: every migrated section must look and behave exactly like the prototype.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS 4, Playwright for browser tests.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run build:parity` | Production build that passes un-migrated pages through to the prototype |
| `npm run test:e2e` | Browser tests (run `build:parity` first; needs Google Chrome) |

Pages that are not migrated yet can be served from the prototype while you work: start it with
`python3 -m http.server 5174` in the repository root and run Next.js with
`LEGACY_ORIGIN=http://localhost:5174`.

## Structure

```
scripts/
  port_page_css.py        copies each page's own CSS from the prototype's build scripts into src/styles/page-*.css
src/
  app/
    layout.tsx            every page: fonts, smooth scroll, the booking pop-up
    (site)/               pages inside the site header and footer: home, pricing, promotion, before-after,
                          aptos-thread-lift, botox, wrinkles-fine-lines, about, blog, the blog article, privacy, terms, refunds
    black-friday-sale/    the sale page, with its own header and footer
  assets/images/          photos imported by components (optimised by next/image)
  components/
    home/                 home page sections (several are reused on the inner pages)
    layout/               the site header, footer, smooth scroll, pop-ups
    booking/ cart/ chat/ black-friday/ reviews/ team/ specials/   site-wide features
    pricing/ promotion/ before-after/ about/ blog/ legal/ bf-sale/   page sections
    treatment/            treatment page sections (Aptos, Botox; also the header and several sections of concern pages)
    concern/              concern page sections (Wrinkles & fine lines)
    ui/                   shared building blocks: Button, icons, SiteLink, Eyebrow, TwoTone, Faq, Breadcrumb, SubNav
  config/                 content and settings: navigation, routes, clinics, prices, page content
  hooks/                  shared behaviour: scroll, header tone, reveal, in-view, cart
  lib/                    helpers with no UI: routes, prices, cart store, scroll, dom
    wordpress/            the server-only WordPress API client and content readers
  styles/                 ported CSS in the prototype's order; page-*.css holds one page's own rules (generated)
  types/                  shared TypeScript types
tests/
  parity/                 opens the prototype and this build side by side and compares them
  *.spec.ts               behaviour of the migrated sections and pages
```

Migrated: every page except My Account, Cart and Checkout (and the campaign preview `black-friday.html`), which
are still served by the prototype through `LEGACY_ORIGIN`. The old `.html` addresses redirect to the new ones.

## WordPress (headless backend)

Content will come from the headless WordPress in `../cms` (see its README). Nothing on the site reads
from it yet: every page still uses `src/config/`.

- `src/lib/wordpress/` is the only code that talks to WordPress, and it is server-only: `config.ts`
  (environment), `client.ts` (`wpFetch`: one GET with a time limit, every failure a `WordPressError`),
  `content.ts` (a collection page, an entry by slug), `posts.ts` / `pages.ts` (cached readers with
  `"use cache"`, `cacheLife` and `cacheTag`), `health.ts`, `tags.ts`. Import from `@/lib/wordpress`.
- Types of the API answers: `src/types/wordpress.ts`.
- Settings: copy `.env.example` to `.env.local`. `WORDPRESS_API_URL` and the optional credentials have no
  `NEXT_PUBLIC_` prefix, so they stay on the server.
- Server Components fetch and pass data down as props; UI components never fetch. A cached reader can be
  awaited anywhere; a read that must be fresh on every request goes inside `<Suspense>`. Use `settle()`
  where the page should fall back instead of failing when WordPress is down.
- `GET /api/cms/health` reports whether this server can reach WordPress.
- New content type: add its type, then a module like `posts.ts`, and export it from `index.ts`.

## Migrating a page or section

1. Port the JSX from the prototype into components, keeping the class names as they are.
   Tailwind 4 renames to apply: `shadow-sm` → `shadow-xs`, `outline-none` → `outline-hidden`,
   `bg-gradient-to-*` → `bg-linear-to-*/srgb`, `!class` → `class!`.
2. Port the CSS rules the section uses from the prototype's `<style>` block into `src/styles/`, with
   their original selectors and **not** inside any `@layer` (see the note at the top of
   `src/app/globals.css`: the stylesheet order reproduces the prototype's cascade), and import the file
   there before the utilities.
3. Move content into `src/config/` and type it.
4. When a whole page is served by Next.js, set `migrated: true` and its new path in `src/config/routes.ts`,
   and add a redirect from its `.html` address in `next.config.ts`.
   CSS the prototype gave to one page only: add the page to `scripts/port_page_css.py` and run it; it writes
   `src/styles/page-<name>.css`, every rule tied to `<main data-page="<name>">` with `:where(...)` (no added
   specificity). Import it in `globals.css` after `type-scale.css`.
5. Add a parity test (`tests/parity/<page>-page.spec.ts`, see `pageParity`) and behaviour tests, and make
   them pass before calling it done.

After adding a new CSS file, build from a clean cache once (`rm -rf .next`).
