# 02. Pages

`pages.csv` lists all 192 pages with their type, title, meta description, H1, canonical address, whether they are indexed and in the sitemap, the build script, the main content source and the file size.

| Type | Pages | Build script | Content |
|---|---|---|---|
| Home | `index.html` | edited by hand | Design team copy, live clinic facts |
| Promotions | `promotion.html` | edited by hand | Monthly specials |
| Pricing | `pricing.html` | `build_pricing.py` | The live price list (23 categories), live introduction and FAQ |
| About | `about.html` | `build_about.py` | Team, clinics, map, contact form |
| Treatments | 54 pages, for example `botox.html`, `juvederm.html`, `laser-hair-removal.html` | `build_live_treatments.py` | Live site wording, word for word apart from approved edits |
| Aptos Thread Lift | `aptos-thread-lift.html` | `build_aptos.py` | Design team copy (the one treatment page rewritten) |
| Concerns hub | `concerns.html` | `build_concerns.py` | New copy |
| Concerns | 22 pages, `concern-<name>.html` | `build_concerns.py` | New copy, prices from the live price list |
| Shop home | `shop.html` | `build_live_shop.py` | Live shop home sections, approved edits |
| Products | 68 pages, `shop-<product>.html` | `build_live_shop.py` | Live product data |
| Journal | `blog.html` | `build_blog.py` | Article cards with the live first lines |
| Articles | 34 pages | `build_live_blog.py` (33), `build_article.py` (the rosacea article, design team version) | Live articles |
| Before and after | `before-after.html` | `build_live_pages.py` | The live gallery, 50 cases, 16 filters |
| Cart flow | `cart.html`, `checkout.html`, `order-confirmed.html` | `build_cart.py` | Not indexed |
| Campaign preview | `black-friday.html` | `build_blackfriday.py` | On hold, not indexed |
| Obsolete | `index-fraunces.html` | none | An old font test, not indexed; remove at launch |

187 pages are indexed and listed in `sitemap.xml`.

## Treatment page structure

Breadcrumb, hero with the live photo and the booking card, quick facts card, a sticky numbered chapter bar, then (only the chapters the page has): Benefits, The clinic (film band), more benefit blocks, About (the five live tabs with an "In short" line and the facts card), Why choose, Watch (Instagram reel, 15 pages), Results (dark before and after band, 23 pages), Concerns it may help with, Prices (where the price list has a matching category), Why NewDermaMed (dark band with counting figures), partner logos, Team, Testimonials, Visit us (both clinics), the free skin analysis band, FAQ.

## Concern page structure

Breadcrumb, hero with the lead treatment's photo and the booking card, quick facts, chapter bar, then: the concern in plain words with an "In short" line and links to related pages, What you may notice and why it happens, The clinic (film band), How we assess it (VISIA® photo), Treatment options (cards with photos, roles and starting prices; the Bio-stimulators group; the prescription note), Compare the options (table on desktop, cards on phones), What to expect, Results (dark before and after band, 14 concerns), Skincare at home, Why NewDermaMed, partner logos, Team, Testimonials, Articles, Related concerns, Visit us, the free skin analysis band, FAQ.

## Menus

The Procedures menu follows the live site's menu, with a Bio-stimulators group (Aptos Thread Lift, Sculptra®, Radiesse®). The Concerns menu opens the 22 concern pages and the hub. Menu data lives in the shells (`PROCEDURES`, `CONCERNS`, `ABOUT`, `CONCERN_LINKS`).
