# 08. Checks run on this version

All checks ran on 8 November 2026 against the files in `NDM/`, in Chromium (Playwright) at 1440 x 900 (desktop) and 375 x 812 (phone).

| Check | Scope | Result |
|---|---|---|
| JSX structure (`node tools/jsxcheck.js <page>.html --html`) | All 192 pages | 192 OK |
| Page renders: script errors, sideways scroll, broken images | The 90 pages changed in the last round (all 54 treatment pages, Aptos, the concerns hub and 22 concern pages, home, promotion, pricing, about, shop, journal, gallery, cart, order confirmation, the campaign preview, one article, one product), at both sizes | 180 renders: 0 script errors (only Babel's note that `shop.html` is over 500 KB), 0 sideways scroll, 0 broken images |
| Page renders, earlier round | All 191 pages at both sizes (the obsolete test page excluded) | 0 errors, 0 sideways scroll, 0 broken images. The last round changed only the shared booking form on the remaining 101 pages (products, articles, checkout), the same code rendered on the 90 pages above |
| Links, images and videos resolve | 90 pages (last round), 191 pages (earlier round) | 0 broken; nothing points at the old live site |
| Live wording kept word for word | Rendered text compared with the crawled live pages | Treatments 2322 of 2322 text pieces (all tabs opened). Shop home 444 of 475: the gaps are the approved shop edits (E1 to E7). Products 1159 of 1292: the gaps sit in the inactive Size tab and were checked in the page data. Articles 1323 of 1383: the gaps are the rosacea article, kept in the design team's version as approved (D1). Gallery 53 of 54: the heading's dash is shown as a line break |
| Booking form | Home form (desktop), a treatment page's hero card (desktop), the phone form (375 px); both paths, every step | No errors; required fields and choices are enforced; the confirmation screens show the chosen details |
| Structured data | All 192 pages | Every JSON-LD block parses; one robots tag per page; 187 pages in `sitemap.xml` |
| Copy rules | All pages, `llms.txt` | 0 em dashes; "Individual results may vary" on every before and after view |
| Local server scripts | `run-local.sh` | Serves the pages, videos and `llms.txt` |

## Not covered

Real phones and tablets (only emulated sizes), Safari and Firefox, screen readers, real network speeds, and anything behind the forms (there is no back end yet). These belong in the production QA plan (`specs/07-launch-checklist.md`, part D).
