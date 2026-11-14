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
wp-content/themes/ndm-headless/    the one theme: name and screenshot only, never renders (no templates)
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

**A price list copied in another way** (for example with WooCommerce's own product importer) lacks
this plugin's settings: its categories are hidden, so the Pricing page is empty, and its products have
no import key, so `import` would duplicate them and the offers import finds none. `wp ndm-pricing
repair` (same JSON on standard input) matches each category by slug and each product by its exact
name and sets, only where missing, the category settings (visible, order, per unit, product order),
the import keys and the offer labels. It creates, deletes and reprices nothing (a price that differs
from the original list is only reported). Without `--apply` it is a dry run:

```
node --experimental-strip-types ../web/scripts/export-price-list.mjs > /tmp/price-list.json
wp ndm-pricing repair < /tmp/price-list.json
wp ndm-pricing repair --apply < /tmp/price-list.json
```

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

WordPress posts are not searched yet (the blog reads WordPress since 2026-11-13, see "Blog"; adding
its articles to the search is the next step).

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
| Search Engines | page title and description |
| Overview | opening paragraphs, the "On our site" links, whether to link the Before & after gallery |
| The Concern | what you may notice, what causes it |
| Assessment | text, what we look at |
| Treatment Options | one row per treatment: the WooCommerce product (searched and picked; its price is the row's price), then an optional title, label, image, subtitle and summary that replace the product's own, links, visit, course, downtime, when changes may appear; the prescription note and its links |
| What To Expect | the steps |
| Before And After Photos | cases of the "Before & After" post type, searched and picked, in any number and order. Each takes the case's photo and first category: nothing is typed |
| Home Care | cards, each with an optional product of the skincare shop |
| From The Journal | WordPress posts, searched and picked, in any number and order (left out when empty). Each card takes the post's title, date, first category, featured image and excerpt: nothing is typed |
| Related Treatments | one row per card: the WooCommerce product (searched and picked), then an optional title, tag and image that replace the product's name, category and image, and an optional link. A row without a product shows what is typed |
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

## Procedure pages

A procedure page of the site (for example `/botox`) is a post of the **post type "Procedures"**
(`ndm_procedure`, in the admin menu). Every procedure has the same design, the Botox page's; a post
carries only its own content. The post's **slug is the page's address** on the site, so a new
published procedure is a new page, without a new build. The fields work like those of a concern
(same boxes, rows, photo and search fields).

Typed into the post (boxes under the title, stored as one post meta, `_ndm_procedure`; the list of
fields is `ndm_headless_procedure_schema()` in `includes/procedures.php`):

| Box | Fields |
|---|---|
| Title, Slug, Header photo | the procedure's name, the address, the wide header photo (featured image) |
| Header | heading in two lines, text under it, the tall photo for phones, photo focus, the menu group (breadcrumb), the quick facts, the title of the offer card |
| Search Engines | page title and description |
| Benefits | heading, paragraphs, short labels, the safety note, the picture (and whether it is a diagram) |
| About (Tabs) | heading; one row per tab: name, large figure, words under it, paragraphs, an optional link |
| Why Choose | heading, photo, cards |
| Watch | the video's address, the picture shown before it plays, text |
| Before And After Photos | cases of the "Before & After" post type, searched and picked. Nothing is typed |
| Price List | heading; **one row per WooCommerce product, searched and picked** (or a whole category: every product of it), with an optional title and text that replace the product's name and short description |
| Good To Know | heading, intro, questions (answer paragraphs and an optional list of points), related treatments |
| FAQ | questions and answers |

**No price is ever typed.** The Price list box only says which products the section shows; their
options, prices, regular prices and offer labels are read from WooCommerce by the site and are changed
in the price manager only. In a category priced per unit, the option called "Regular" is the price of
one unit. An amount inside the copy is written as a token, filled in from those same products:

| Token | Becomes |
|---|---|
| `{{price}}`, `{{price2}}` | the price of one unit of the first (second...) product of the price list; its lowest price when it is not priced per unit |
| `{{pricex20}}`, `{{price2x20}}` | that price times 20 (any number) |
| `{{off}}`, `{{maxoff}}` | the percentage offers on the first product ("10% to 30%"), and the largest ("30%"); `{{off2}}`, `{{maxoff2}}` for the second |

A sentence whose amount is not in WooCommerce is left out of the page, so no stale amount can show.

Also filled in by the site: the section bar and its numbering (a section whose box is empty is left
out of both), the clinics line, the booking form, the offer card's figure (only while WooCommerce has
an offer on the first product), the "Page updated" date (the day the post was last saved), and the
sections every procedure page shares (the clinic film, Why NewDermaMed, Our team, Testimonials, Visit
us, Start your journey).

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /procedures` | public | the name and slug of every published procedure |
| `GET /procedures/<slug>` | public | one published procedure with its photos and the products picked for its price list (no prices) |

When a procedure changes (or a product, or a Before & After case it may show), WordPress tells the
site to drop its cached copy (tag `procedures` through `/api/revalidate`). The post type has no pages
of its own in WordPress. The Aptos Thread Lift page has its own design and is a standard page (see "Aptos Thread Lift page").

One-time import of the original Botox page (created only when its slug is free; photos go into the
media library; the price list's rows pick the existing products "Botox Cosmetic" and "Dysport"):

```
node ../web/scripts/export-procedures.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm procedures-import --images=/tmp/site
```

Before anything is published: the Botox copy is the live site's wording and names Botox® beside its
effects, which Health Canada (C.01.044) does not allow in consumer advertising of a prescription
drug; it also names the Medical Director. Raymond Valadkhani's written approval is needed first.

## Aptos Thread Lift page

`/aptos-thread-lift` is an ordinary WordPress **page** (Pages in the admin), like the home page and
the About page: one page, so no post type of its own. It is recognised by its page template **"Aptos
Thread Lift page"** (`ndm-aptos`, under Page Attributes), or failing that by the top-level slug
`aptos-thread-lift` (it gets the template on its next save). No page ID is stored: the address on the
site is always `/aptos-thread-lift`, and the title and slug are only its name in the admin. In Pages it
carries the label "Aptos Thread Lift page of the site". It keeps its own design, separate from
Procedures (the Botox design).

On that page only, the block editor and the page's own text box are switched off and the boxes
appear under the title (every other page keeps its editor). The fields work like those of a concern
or a procedure (same boxes, rows, photo and search fields), stored as one post meta, `_ndm_aptos`;
the list of fields is `ndm_headless_aptos_schema()` in `includes/aptos.php`:

| Box | Fields |
|---|---|
| Title, Featured image | the treatment's name, the wide header photo |
| Header | heading in two lines, text under it, the tall photo for phones, photo focus, the quick facts |
| Search Engines | page title and description |
| What It Is | tag, heading, paragraphs, note, photo and its focus, the words on the turning badge, the points |
| How It Works | tag, heading, text, the steps |
| Is It Safe | tag, heading, paragraphs, the safeguards, the product card (photo, tag, name, text) |
| How Long It Lasts | heading, text, the large figure with its unit, label and note |
| Good Candidates | tag, heading, text, "may suit" and "when to wait" lists, photo and its focus |
| What To Expect | heading, the steps (when, title, text) |
| Before And After Photos | heading, text, and the **cases**: searched and picked from the "Before & After" post type (each shows the case's photo and first category). No case: no section |
| Pre And Post Care | heading, text, the before and after lists |
| Elevate Your Results | tag, heading, text, the groups of treatments, the treatment cards (title, menu name it links to, tag, photo, text) |
| Price List | heading, text; one row per **WooCommerce product** (searched and picked, or a whole category), with an optional title, text and "Options shown" (the names of the options this page shows; empty: all); then "How many you need" |
| Why NewDermaMed | heading, the figures |
| FAQ | heading, text, the questions |

A section's tag is also its name in the section bar. A section whose box is empty is left out of the
page and of the section bar. No price is typed: the options, prices and offers of the picked products
are read from WooCommerce, and an amount in the copy is the token `{{price}}` (the lowest price shown
for the first product; `{{price2}}` for the second). Filled in by the site: the booking form, the
Aptos logo, the team photo, Our team, Testimonials, Visit us and Start your journey.

**Revisions.** `_ndm_aptos` is revisioned post meta: every Update that changes the fields saves a
revision with a copy of them, Revisions compares them as "Aptos Thread Lift page fields", and
restoring a revision restores them.

**When something is wrong.** No Aptos page, or not published: the route answers 404
(`ndm_aptos_missing`, `ndm_aptos_unpublished`), the site shows its built-in copy, and the Pages screens
warn (also when two pages have the template, the page is found by its slug only, or it is empty).

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /aptos-page` | public | the published page with its photos, picked cases and picked products (no prices; 404 with the reason when there is none) |

When the page changes (or a product, or a Before & After case), WordPress tells the site to drop its
cached copy (tag `aptos` through `/api/revalidate`).

One-time import of the original page (created only when there is no Aptos page yet). Photos go into the media
library: files from `web/public`, and the five photos the original page showed straight from
newdermamedlaserclinic.com and nuvior.com are fetched from those addresses. The price list picks the
existing product "Aptos Excellence Visage Method EV PLA/PCL (up to 24 months)" and shows its
"Mid face" option only (Visage Excellence is licensed for the midface in Canada). No case is picked:
the gallery has no Aptos case yet, so the Before & after section stays out until one is picked.

```
node ../web/scripts/export-aptos.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm aptos-import --images=/tmp/site
node ../web/scripts/export-aptos.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm aptos-import --images=/tmp/site --fill-empty
```

With `--fill-empty` an Aptos page that already exists gets only its empty fields filled, the template
"Aptos Thread Lift page" and the header photo if it has none; nothing that holds words is replaced,
and the page's title and state stay as they are (a draft stays a draft).

Until 2026-11-13 the page was a post of its own post type ("Aptos Pages", `ndm_aptos`, no longer
registered). `wp ndm aptos-migrate` copies its title, state, fields and header photo exactly (same
media library photos) onto a page as above and checks them; `--delete-old` then deletes the old post.
It never overwrites a page that already holds different fields. Local site: page 908.

## About page

`/about` is an ordinary WordPress **page** (Pages in the admin, marked "About page of the site" in the
list). It is recognised by its **template "About page"** (`ndm-about`, under Page Attributes > Template),
so its title and slug can change without losing it; a top-level page with the slug `about` and no such
template is recognised too, and gets the template the next time it is saved. The address on the site
is always `/about`; the title is only its name in the admin. No page ID is written anywhere.

On that page only, the block editor and the text box are switched off and the About boxes appear
under the title; every other page keeps its normal editor. The fields work like those of a concern
(same boxes, rows and photo field).

Typed into the page (boxes under the title, stored as one post meta, `_ndm_about`; the list of fields
is `ndm_headless_about_schema()` in `includes/about.php`):

| Box | Fields |
|---|---|
| Header | tag, heading in two lines, text under it, the numbers beside it (number such as "16+", words, line under it) |
| Search Engines | page title and description |
| Our Team | tag, heading, text beside it |
| Our Clinics | tag, heading |
| Gallery And Awards | the gallery **photos** (photo from the media library and its title; the description is the photo's alternative text), then the awards tag, the line under the stars, heading in two lines, text |
| FAQ | tag, heading, text, the questions. No question: no section |
| Contact Us | tag, heading, text |

The mosaic has fourteen places, filled in the order of the photos; a place without a photo stays
empty and photos after the fourteenth show in the viewer only. Filled in by the site, not typed: the
clinic film, the team members and their profiles, the two clinics (addresses, phones, hours, maps,
parking: the same on every page), the Top Choice Award badges, How it works, the message form and
@newdermamed.

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /about-page` | public | the published About page with its photos; 404 when there is none (`ndm_about_missing`) or it is not published or behind a password (`ndm_about_unpublished`) |

**Revisions.** The fields are part of the page's revisions: a save that changes them makes a revision,
Revisions compares them (as "About page fields", one line per field) and restoring a revision puts
them back.

**When something is wrong** the Pages screens say so in a yellow notice: no About page, the page not
published, more than one page with the "About page" template (the site shows the published one, else
the oldest), the page recognised by its slug only, or the page with no content. In each case the site
keeps working: it shows its built-in copy (`ABOUT_COPY` in `web/src/config/about.ts`), as it does when
WordPress cannot be reached.

When a page changes (or its template, or a photo's alternative text), WordPress tells the site to drop
its cached copy (tag `about` through `/api/revalidate`).

One-time import of the original page on a new WordPress (created only when there is no About page and
no page with the slug `about`, the trash included). The fourteen gallery photos go into the media
library: four files from `web/public`, and the ten the original page showed straight from
newdermamedlaserclinic.com are fetched from that address.

```
node ../web/scripts/export-about.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm about-import --images=/tmp/site
node ../web/scripts/export-about.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm about-import --images=/tmp/site --fill-empty
```

With `--fill-empty` an About page that already exists (an empty page saved before the import, for
example) gets only its empty fields filled and the template "About page" if it has none; nothing
that holds words is replaced, and the page's title and state stay as they are.

Until 2026-11-13 the About page was a post of its own post type ("About Page", `ndm_about`). A
WordPress that still has that post moves it onto a page once (same title, state, fields and photos;
nothing is uploaded again; a page that already holds other fields is never overwritten), checks that
the page holds exactly the same fields, and only then, with `--delete-old`, deletes the old post:

```
docker compose run --rm -T cli wp ndm about-migrate
docker compose run --rm -T cli wp ndm about-migrate --delete-old
```

## Home page

`/` is an ordinary WordPress **page**: the one chosen under **Settings > Reading > "Your homepage
displays" > A static page > Homepage**. No page ID is written anywhere: choosing another page there
moves the home page (and its boxes) to it. In Pages it carries WordPress's "Front Page" label; its title
is only its name in the admin.

On that page only, the block editor and the page's own text box are switched off and the home page's
boxes appear under the title (every other page keeps its normal editor). The words are stored as one
post meta, `_ndm_home`; the list of fields is `ndm_headless_home_schema()` in `includes/home.php`. The
fields work like those of a concern. One box per section, in page order:

| Box | Fields |
|---|---|
| Header | line above the heading, heading in two lines, text, second button's words, the points beside the heading (icon and words), the brands in the moving band (one per line) |
| Search Engines | page title and description (empty description: none written) |
| About NewDermaMed | tag, heading, text (lights up word by word), the word in blue, the numbers ("16+" and the line under it) |
| Where To Start | tag, heading, and the **panels** (title, line under it, heading and text when open, photo with its focus closed and open, link for a panel without concerns); in each panel its **concerns** (button, card title, card text, the **treatments**, facts, small print, link at the bottom); a treatment picks a WooCommerce product or category (optional), with a name, a line and a link |
| Treatments, Inside Our Clinics, Journal | tag and heading (Treatments also its text) |
| Our Signature | tag, heading, text, the chip on the figure (words, number, words), the dials (number, unit, line, screen-reader sentence, ring fill in percent), the points (icon and words), then Treatment areas: tag, heading, text and the **photos** (photo from the media library and the line under it; the description is the photo's alternative text) |
| Our Team, Before And After, Testimonials, Our Clinics, Booking, Skincare Shop, Social | tag (not Booking), heading, text; Testimonials and Social also their small line (keep "individual results may vary"), Shop and Social their button |
| How It Works | tag, heading, the three steps (title, text, button) |
| FAQ | tag, heading, text, the questions. No question: no section |

**Prices of the Start panels** come from WooCommerce only: the product or category a treatment picks,
else the treatment found by its name on the price list, else "At consultation". A panel without a photo,
a concern without its button words and a treatment without a name are left out; no panel at all: the
site shows its built-in panels (`START_PANELS` in `web/src/config/home-start.ts`). The panels' photos
are served with WordPress's own sizes.

Lists inside lists (panel > concern > treatment) are fine in the edit screen: each level has its own
placeholder for its "Add" button. PHP accepts at most `max_input_vars` fields per save (1000 here; the
home page sends about 530): a save that reaches it keeps the words as they were and says so, instead of
losing rows.

Filled in by the site, not typed: the films, the treatment cards (prices from WooCommerce), the team members, the before and after cases, the photos and links of How it works, the
monthly specials (WooCommerce), the reviews and awards, the two clinics, the booking form, the shop's
products, the journal posts and the reels. Sections other pages also show (Our Team, Before And After,
How It Works, Testimonials, Booking, Social) take these words on the home page only; the other pages
keep the built-in copy.

**Revisions.** `_ndm_home` is revisioned post meta: every Update that changes the words saves a
revision with a copy of them, Revisions on the edit screen compares them field by field ("Header:
Heading, first line"), and restoring a revision restores the words (and tells the site).

**When something is wrong.** If no page is chosen under Reading, the chosen page is missing or not
published, or it holds no home page words yet, the route answers 404 with the reason
(`ndm_home_not_set`, `ndm_home_missing`, `ndm_home_unpublished`, `ndm_home_empty`), the site shows its
built-in copy (`web/src/config/home-copy.json`) and logs the reason, and WordPress shows a warning on
the Dashboard, Pages, Settings > Reading and the page itself. A newly chosen page that holds no words
yet opens with its boxes filled from the page that held them last; Update saves them to it.

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /home-page` | public | the home page's words with their photos (404 with the reason when there are none to show) |

When the home page, its words, a photo's alternative text or the Reading setting change, WordPress
tells the site to drop its cached copy (tag `home` through `/api/revalidate`).

Fresh install, one-time import of the original page (the words go to the page chosen under Reading,
or to a page "home" that is created and chosen when none is; left alone when the home page already
holds its words; the four Aptos marking photos the original showed from nuvior.com and the four panel
photos from `web/public` go into the media library). A box added after that import is filled in with
`--fill-empty=<field keys>` (only those fields, only where empty; the Start panels were added this way):

```
node ../web/scripts/export-home.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm home-import --images=/tmp/site
node ../web/scripts/export-home.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm home-import --images=/tmp/site --fill-empty=start_panels
```

Until 2026-11-13 the home page was a post of its own post type ("Home Page", `ndm_home`). `wp ndm
home-migrate` copies its words exactly (same media library photos) to the home page as above and
checks them; `--dry-run` reports only, `--remove-old` then deletes the old post. It never overwrites a
page that already holds different words.

## Blog (the list and the articles)

The blog of the site (`/blog`) and its articles are WordPress's ordinary **posts**. A post that has
text has its own page on the site, at its **slug** (`/what-causes-rosacea-redness`), without a new
build. A post without text shows on the list only; its card opens the "Opens at" address (the article
on the clinic's earlier site) until its text is written here.

| On the site | In WordPress |
|---|---|
| Title, date, summary (card and search engines) | the post's title, date and excerpt |
| Topic (the filter chips and the tag on the card) | the post's first category |
| The text | the block editor: headings, paragraphs, lists, photos, quotes. The first paragraph is set large, as the article's opening |
| The wide photo at the top of the article (also the social card) | the featured image |
| The tall photo of the card, the heading in two lines, the key takeaway, the reading time, "Opens at" | the **Article page** box under the editor (one post meta, `_ndm_post`; fields in `ndm_headless_blog_fields()`, `includes/blog.php`) |

Empty fields fall back: the card photo to the featured image, the heading to the title broken in the
middle, the takeaway to the excerpt, the reading time to the length of the text. A photo's alternative
text is typed in the media library. Photos are served in several sizes (WordPress makes the copies).

The site writes each article's search-engine tags by itself: canonical address, social card,
`BlogPosting` and breadcrumb data, and a line in `/sitemap.xml`. They need the site's own address
(`SITE_URL` in `web/.env.local`, set when the site is built).

| Route (`ndm/v1`) | Who | What |
|---|---|---|
| `GET /blog` | public | every published post as a card, newest first |
| `GET /blog/<slug>` | public | one published post that has text, with it (404 for a post without text) |

When a post, its photo, its fields or a category changes, WordPress tells the site to drop its cached
copy (tag `blog` through `/api/revalidate`).

One-time import of the original 34 posts (created only when the slug is free; the three posts the
concern import had made keep their text and photo and only get their Article page fields; the photos
are the clinic's own, kept in `assets/blog`). Only "What Causes Rosacea Redness" came with its text:

```
node ../web/scripts/export-blog.mjs | docker compose run --rm -T -v "$PWD/../assets/blog:/tmp/blog:ro" cli wp ndm blog-import --images=/tmp/blog
```

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

## Consultation requests ("Book a free consultation")

The booking form of the Next.js site (the booking section of the home page, the pop-up behind every
Book Free Consultation button, and the forms in the treatment pages' headers) saves each request in
WordPress. The team reads them in wp-admin under **Consultation**.

| Route | Who | What |
|---|---|---|
| `POST /bookings` | the Next.js server (header `X-NDM-Site-Key` = `NDM_REVALIDATE_SECRET`) | saves one request as a private post of the post type `ndm_booking`; answers only `{ saved, number }` |

- Mu-plugin `includes/bookings.php`. The post type is private: no public address, not in the REST API,
  not searchable, not exported. No route returns a request. Editors, shop managers and administrators
  see the list; nobody can add one by hand.
- A request holds the name, mobile number, email, how to be reached, the chosen concerns, the VISIA
  choice, and either a clinic with a day and hour ("Book a time") or a time of day and clinic ("Call
  back"), plus the page it was sent from (post meta `_ndm_booking`).
- Status (post meta `_ndm_booking_status`): New, Contacted, Booked, Closed, set by hand on the request's
  screen. The menu shows how many are still New. The title and visibility cannot be changed.
- The site checks the form first (`web/src/app/api/booking/route.ts`): only the options the form
  offers, a day the clinics are open, an hour still ahead (Toronto time), same-site requests only, a
  hidden anti-robot field and a small per-address limit.
- A picked time is a **request**: nothing checks it against the clinic calendar, two visitors can pick
  the same hour, and no email or text is sent. The team confirms each one.
- These records are personal information (PHIPA / PIPEDA): decide how long they are kept, and host
  the database in Canada, before production.
- Test: `web/tests/admin/booking.spec.ts` (`npm run test:admin`; makes two records and deletes them).

## Site Settings (header and footer)

General settings of the Next.js site, the same on every page, on one screen: wp-admin > **Site
Settings** (administrators only, capability `manage_options`). One tab per area; each tab is saved on
its own and leaves the other tabs as they are.

| Route | Who | What |
|---|---|---|
| `GET /site-settings` | public | the saved settings (photos as `{ id, src, width, height, alt }`); 404 `ndm_settings_empty` before the first save |

- Mu-plugin `includes/settings.php`: the fields are listed once in `ndm_headless_settings_schema()`
  (each box has a `tab`), stored in one option, `ndm_site_settings` (`{ content, modified }`, not
  autoloaded). The fields are the Concerns ones (`includes/concerns.php`); the screen asks for their
  styles and script through the filter `ndm_headless_field_screens`.
- **Header** tab: the announcement bar (hide it, the badge, seconds per message, the wide-screen and
  phone messages, a phone message can be "Clinic phone numbers", the shop link at the right) and the
  header bar (booking button words, the short phone word, the skincare shop's address, which the
  menu, the phone menu and the bar open).
- **Footer** tab: the closing call (heading, text, booking button, optional second button), the film
  (MP4 address, poster from the media library), the text and two badges under the logo, the link
  columns (a list of columns, each with its links), the contact column's title and email, the
  copyright line and the five social addresses (empty: no icon).
- Kept in the site's code because other parts share them: the menu and its panels, the logo, the two
  clinics (names, addresses, phone numbers), the Privacy, Terms and Refunds links. The home page's
  @newdermamed section keeps the built-in social addresses.
- Empty fields: a label (booking button, heading, column title) falls back to the site's built-in
  words; an optional piece (badge, text, second button, email, copyright, social icon) is left out.
  No column: the built-in columns. No message in one ticker: the other ticker's messages; none in
  either: the bar is hidden.
- A save tells the site to drop its cached copy (tag `site-settings`). Nothing saved, or WordPress
  unreachable: the site shows its built-in header and footer (`web/src/config/site-settings.json`).
- One-time import of the built-in settings (kept when settings exist; `--fill-empty` fills only
  their empty fields):
  `node ../web/scripts/export-site-settings.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm settings-import --images=/tmp/site`

## Production (not set up yet)

Open decisions: where WordPress is hosted and the public address of the Next.js site. When they are
known, production needs: the `mu-plugins` folder deployed as is, WooCommerce and the `plugins/ndm-pricing` folder, the four settings above plus `NDM_REVALIDATE_URL` and
`NDM_REVALIDATE_SECRET` in its own
environment or `wp-config.php` (with `WP_ENVIRONMENT_TYPE=production`), its own database credentials
and salts, HTTPS, and `DISALLOW_FILE_EDIT`. Nothing in `.env` or `docker-compose.yml` is used there.
