# NewDermaMed CMS (headless WordPress)

WordPress is the content backend only. It serves data through its REST API; the Next.js app in
`../web` is the only frontend (pages, routing, SEO). There is no theme work here and there never
should be: no `header.php`, no templates, no page builder.

## What is in this folder

```
docker-compose.yml                 local WordPress 7.1 (PHP 8.3) + MariaDB 11.8 + wp-cli
.env.example                       local settings; copy to .env (ignored by git)
bin/setup.sh                       first-time install and headless baseline (safe to run again)
wp-content/mu-plugins/
  ndm-headless.php                 must-use plugin loader
  ndm-headless/includes/
    config.php                     settings from constants / environment, validated
    cors.php                       CORS allow-list for the REST API
    frontend.php                   no public pages: redirect to the Next.js site, noindex
    security.php                   XML-RPC off, users endpoint private, application passwords over HTTPS
    rest.php                       the site's own namespace, ndm/v1 (health check)
    search.php                     popular searches of the site search (see "Site search" below)
    pages.php                      WordPress pages the site shows (see "Legal pages" below)
    before-after.php               the Before & After gallery (see "Before & After gallery" below)
    concerns.php                   the concern pages (see "Concern pages" below)
```

wp-content/plugins/ndm-pricing/    the Pricing page's link to WooCommerce (see "Pricing page" below)
```

WordPress core, WooCommerce, uploads and the database are not in git (they live in Docker volumes).
`bin/setup.sh` installs WooCommerce and switches `ndm-pricing` on.

```

## Run it locally

```bash
cp .env.example .env      # then set the passwords and the admin user
./bin/setup.sh
```

- Admin: http://localhost:8080/wp-admin/
- REST API: http://localhost:8080/wp-json/
- Health: http://localhost:8080/wp-json/ndm/v1/health

Daily use: `docker compose up -d` / `docker compose stop`. wp-cli: `docker compose run --rm cli wp <command>`.
`docker compose down -v` deletes the local database and WordPress files.

## Settings

Read from constants in `wp-config.php` or from environment variables, never from the database.

| Name | Meaning |
|---|---|
| `NDM_FRONTEND_URL` | Address of the Next.js site. Any WordPress page request is redirected there. |
| `NDM_FRONTEND_ORIGINS` | Comma separated browser origins allowed by CORS. Exact origins only, never `*`. |
| `NDM_CMS_URL` | Address of WordPress itself (local compose file only; sets `WP_HOME` / `WP_SITEURL`). |
| `WP_ENVIRONMENT_TYPE` | `local`, `development`, `staging` or `production`. |

In production: plain `http` origins are refused, redirects to the site are permanent (301), and
application passwords need HTTPS.

## What the must-use plugin does

- **No frontend.** Posts, pages, archives, feeds and search on the WordPress host redirect to the same
  path on the Next.js site; `robots.txt` and an `X-Robots-Tag` header close the host to search engines.
- **CORS.** WordPress's default (repeat back any origin, with credentials) is replaced by the allow-list:
  read-only methods, no credentials. Server-to-server calls from Next.js are not affected by CORS.
- **Access.** Public content is readable without signing in; `/wp/v2/users` needs a signed-in caller;
  XML-RPC is off. Anything not public needs a WordPress user and an application password.
- **`ndm/v1/health`.** Says the backend is up, nothing else.

## Pricing page (WooCommerce)

WooCommerce is the single source of truth for the Pricing page of the Next.js site: categories are
product categories (`product_cat`), treatments are products, price options are variations, prices and
sale prices are WooCommerce's own. The `ndm-pricing` plugin adds no tables and never recreates
anything, so every product, variation and category keeps its ID. Administrators can change regular and
sale prices, add an option (a new variation, for products with one simple option list) and remove one
(its variation goes to WooCommerce's trash); products and categories are never deleted.

**Display settings (metadata)**

| Where | Key | Meaning |
|---|---|---|
| category (term meta) | `ndm_pricing_visible` | `1` shows the category on the Pricing page; missing means hidden |
| category | `ndm_pricing_order` | position on the page, 0 first |
| category | `ndm_pricing_per_unit` | `1` when priced per unit |
| category | `ndm_pricing_product_order` | product IDs in display order inside this category |
| product, variation (post meta) | `_ndm_pricing_hidden` | `1` hides it on the Pricing page only |
| product, variation | `_ndm_pricing_label` | promotional label text ("Save $1000 Off"); never a price |
| product, variation | `_ndm_pricing_label_on` | `1` when the label shows |

**Routes (`ndm/v1`)**

| Route | Who | What |
|---|---|---|
| `GET /pricing` | public | the list visitors see (visible categories, published products, shown variations with a price) |
| `GET /pricing/admin/me` | manager | who is signed in |
| `GET /pricing/admin/tree` | manager | everything, with the display settings |
| `GET /pricing/admin/products?search=&exclude=` | manager | search WooCommerce products |
| `POST /pricing/admin/save` | manager | one set of changes (the order of variations is WooCommerce's own menu order), checked as a whole before anything is written (format: `includes/save.php`) |

"Manager" is a signed-in WordPress user with the `manage_woocommerce` capability (Administrator or Shop
manager), checked on the server for every request. The management screen is on the Next.js site at
`/manage/pricing`; it signs in through WordPress's own "authorize application" screen and uses the
application password WordPress issues (revocable on the user's profile, deleted on sign-out).

**Cache.** The public list is kept in a transient and dropped whenever a product, variation or product
category changes, wherever the change was made. WordPress then calls `NDM_REVALIDATE_URL` with
`NDM_REVALIDATE_SECRET` so the Next.js site drops its copy too.

**First import.** `web/scripts/export-price-list.mjs` prints the site's original price list;
`wp ndm-pricing import` (reads it from standard input) creates the categories, variable products and
variations once. It never touches anything that already exists.

## Current offers (Promotion page, offers wheel)

An offer is a WooCommerce product with one piece of post meta, `_ndm_promo`: `order`, `name` (card
title, empty shows the product's name), `text`, `area` (`Face` or `Body`), `icon`, `focus` (photo focus
point, `50% 40%`) and `scope` (`product`: the card shows this treatment's lowest price and offer;
`category`: the lowest of its whole category). It holds no price: the site works the price and the
offer line out from the price list. The photo is the product's own image.

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /promotions` | public | the offers visitors see, in order (only treatments on the public price list) |
| `GET /promotions/admin` | manager | every offer, including ones the page cannot show yet |
| `POST /promotions/admin/save` | manager | the whole list in its new order; products on it become offers, the others stop being one |

The price list's own save (`POST /pricing/admin/save`) takes the same settings per product: `products[].promo` is `null`
(take it out of the offers) or `{ name, text, area, icon, focus, scope, position?, imageId? }`.

No product is created, deleted or re-priced by these routes. Photos are uploaded through WordPress's own
`wp/v2/media` (the account needs `upload_files`, which Administrators and Shop managers have). The
management screen is on the Next.js site at `/manage/promotions`. The public list is stored with the
price list and thrown away with it.

One-time import of the site's original ten offers (does nothing when offers already exist):

```
node ../web/scripts/export-promotions.mjs | docker compose run --rm -T -v "<folder with the photos>:/tmp/promo:ro" cli wp ndm-pricing promotions --images=/tmp/promo
```

## Site search

The search in the site header finds the menu's treatments and concerns plus the price list in
WooCommerce (the same categories and treatments `GET /pricing` serves); a price-list result opens its
category on the Pricing page. The Popular chips under the search field come from the searches people
made.

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /search/popular?limit=` | public | names of the most searched results, most searched first, last 90 days |
| `POST /search/log` | the Next.js server (header `X-NDM-Search-Key` = `NDM_REVALIDATE_SECRET`) | adds one to a result's count: `{ "label": "..." }` |

Counts live in one small table, `<prefix>ndm_search_terms` (name of the result, count, last date),
created by the must-use plugin on first load. It never holds what a visitor typed or anything about
the visitor: the Next.js server (`web/src/app/api/search/log`) runs the search again and sends the
name of the result the visitor chose, which must be one of its own results. A chip is shown only while
a result with that name still exists; until six results have been searched, the built-in list
(`POPULAR_SEARCHES` in `web/src/config/navigation.ts`) fills the row. To start the counts again:
`docker compose run --rm cli wp db query "TRUNCATE $(docker compose run --rm -T cli wp db prefix)ndm_search_terms"`.

WordPress posts are not searched yet: the site's blog is not read from WordPress, so a post found
would have no page to open.

## Legal pages (Privacy, Terms, Refunds)

The site's `/privacy`, `/terms` and `/refunds` show three ordinary WordPress pages, found by their
slugs: `privacy`, `terms`, `refunds` (Pages in wp-admin; do not change the slugs). The site reads them
from WordPress's own `GET wp/v2/pages?slug=`, published pages only.

- **What comes from WordPress:** the title, the text, the "On this page" bar (one entry per Heading 2,
  in order) and "Last updated" (the month the page was last saved).
- **Blocks:** the text is normal blocks (paragraph, heading, list, group). The site's look hangs on a
  few "Additional CSS class" names: `lg-lede` (opening paragraph), `no-num` (a Heading 2 without a
  number), `lg-alpha` / `lg-roman` (lists numbered (a), (b) / (i), (ii); a list's "Start value" is
  respected), and on a Group `lg-callout` (blue note) or `lg-card` (white card).
- **Headings:** the original headings carry an HTML anchor (`s1`, `t1`, `r1`, ...) that gives them
  their short name in the bar; a new Heading 2 shows in the bar with its own words.
- **Text stays as typed:** WordPress's automatic punctuation (dashes, curly quotes) is switched off.
- **Refresh:** saving, trashing or deleting any page calls `NDM_REVALIDATE_URL` (tag `wp:pages`), so
  the site shows the change at once.
- **Fallback:** when a page is not published or WordPress cannot be reached, the site shows its
  built-in copy of the original text (`web/src/components/legal/bodies.tsx`).

One-time import of the original text (a page whose slug already exists is never touched):

```
node ../web/scripts/export-legal-pages.mjs | docker compose run --rm -T cli wp ndm legal-import
```

The Terms and Refunds texts are first drafts: they need a legal review and Raymond Valadkhani's
approval before the site goes public.

## Before & After gallery

The site's `/before-after` page shows what WordPress holds:

- **Post type "Before & After"** (`ndm_before_after`, in the admin menu): one post is one case. Its
  featured image is the before and after photo, its title is the editor's own name for it, and "Order"
  places it in the gallery (lowest first, then newest first). A case without a photo is not shown.
- **Taxonomy "Category"** (`ndm_ba_category`): the treatment a case belongs to. The gallery's filter
  buttons are the categories in use, in the order their first case appears; the card shows the case's
  first category.
- **Page "Before & After"** (slug `before-after`): the page every case is shown on. Its paragraphs are
  the intro under the site's heading (the built-in intro shows when the page is empty or unpublished).

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /before-after` | public | the page and every published case with its categories and photo, in gallery order |

When a case, a category or the page changes, WordPress tells the site to drop its cached copy (tag
`before-after` through `/api/revalidate`). The post type has no pages of its own in WordPress.

One-time import of the original 50 cases and the page (the page is created only when its slug is free,
the cases only when WordPress holds none):

```
node ../web/scripts/export-before-after.mjs | docker compose run --rm -T -v "$PWD/../assets/before-after:/tmp/ba:ro" cli wp ndm before-after-import --images=/tmp/ba
```

Before anything is published: every before/after asset must say "Individual results may vary" (the
site adds it), and prescription-drug cases (the "Botox" category) need Raymond Valadkhani's review.

## Concern pages

A concern page of the site (for example `/wrinkles-fine-lines`) is a post of the **post type "Concerns"**
(`ndm_concern`, in the admin menu). Every concern has the same design; a post carries only its own
content. The post's **slug is the page's address** on the site, so a new published concern is a new
page, without a new build.

Typed into the post (boxes under the title, stored as one post meta, `_ndm_concern`; the list of
fields is `ndm_headless_concern_schema()` in `includes/concerns.php`):

| Box | Fields |
|---|---|
| Title, Slug, Header photo | the concern's name, the address, the wide header photo (featured image) |
| Header | heading in two lines, text under it, the tall photo for phones, photo focus |
| Search engines | page title and description |
| Overview | opening paragraphs, the "On our site" links, whether to link the Before & after gallery |
| The concern | what you may notice, what causes it |
| Assessment | text, what we look at |
| Treatment options | one row per treatment: the WooCommerce product (searched and picked; its price is the row's price), then an optional title, label, image, subtitle and summary that replace the product's own, links, visit, course, downtime, when changes may appear; the prescription note and its links |
| What to expect | the steps |
| Before and after photos | cases of the "Before & After" post type, searched and picked, in any number and order. Each takes the case's photo and first category: nothing is typed |
| Home care | cards, each with an optional product of the skincare shop |
| From the journal | WordPress posts, searched and picked, in any number and order (left out when empty). Each card takes the post's title, date, first category, featured image and excerpt: nothing is typed |
| Related treatments | name, tag, photo |
| FAQ | questions and answers |

**No price is ever typed.** Every "From" price on the option cards and in the table is read from
WooCommerce: from the product (or whole category) picked in the row, else from the product with
the row's title. A treatment without a product shows no price. Also filled in by the site: the
number of options, the starting price (the lowest option), the
"In short" sentence, the section bar and its numbering, the clinics line, the booking form, section
headings, and the sections every concern page shares (Why NewDermaMed, Our team, Testimonials, Visit
us, Start your journey).

A link field takes a page of the site (`/botox`, `/pricing#pg-microneedling-h`) or a full address;
left empty, the site links the page that has the row's name, once that page exists.

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /concerns` | public | the name and slug of every published concern |
| `GET /concerns/<slug>` | public | one published concern with its photos |

When a concern changes, WordPress tells the site to drop its cached copy (tag `concerns` through
`/api/revalidate`). The post type has no pages of its own in WordPress.

One-time import of the original Wrinkles & fine lines page (created only when its slug is free; photos
go into the media library):

```
node ../web/scripts/export-concerns.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm concerns-import --images=/tmp/site
```

Before anything is published: copy must follow Health Canada's qualified language, a prescription drug
is never named beside a benefit, and before/after photos of prescription treatments need Raymond
Valadkhani's review.

## Order requests (cart and checkout)

The Next.js site's cart remembers only what was chosen (WooCommerce product and variation IDs and
quantities). Names and prices always come from WooCommerce: the cart is checked against the public
price list when it loads, and "Place order request" creates a real WooCommerce order.

| Route | Who | What |
|---|---|---|
| `POST /orders` | the website's own account | creates an order, **on hold and unpaid** ("Pay at the clinic"), from IDs and quantities; WooCommerce puts its own current prices on it. Only what is on the public price list can be ordered. |

- The caller is a dedicated WordPress account, `ndm-site`, whose role `ndm_site` (made by the plugin) can
  do one thing: place order requests (`ndm_place_order_requests`). `bin/setup.sh` creates the account;
  its application password goes in `web/.env.local` (`WORDPRESS_AUTH_USER`, `WORDPRESS_AUTH_APP_PASSWORD`).
- The order holds the billing details the visitor entered, the clinic (`_ndm_clinic`) and the preferred
  time (`_ndm_preferred_time`), and a note saying nothing has been charged. `created_via` is `ndm-site`.
- WooCommerce sends its usual emails for an on-hold order (to the store and to the customer) once
  outgoing mail is set up.
- Tax: WooCommerce tax is off, so the order total has no tax; the site shows 13% HST as an estimate.
  When taxes are switched on in WooCommerce, the site shows WooCommerce's tax instead.

## Production (not set up yet)

Open decisions: where WordPress is hosted and the public address of the Next.js site. When they are
known, production needs: the `mu-plugins` folder deployed as is, WooCommerce and the `plugins/ndm-pricing` folder, the four settings above plus `NDM_REVALIDATE_URL` and
`NDM_REVALIDATE_SECRET` in its own
environment or `wp-config.php` (with `WP_ENVIRONMENT_TYPE=production`), its own database credentials
and salts, HTTPS, and `DISALLOW_FILE_EDIT`. Nothing in `.env` or `docker-compose.yml` is used there.
