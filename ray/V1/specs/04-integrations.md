# 04. Interactive features and integrations

What each interactive piece does in the prototype, and what production needs. Shell features are on every page; their code is in `index.html` and `promotion.html`.

## Forms

| Form | Where | Fields | Prototype | Production needs |
|---|---|---|---|---|
| Booking | Every page (pop-up), home, hero and phone block of treatment and concern pages | See `03-booking-form.md` | Shows a confirmation, sends nothing, charges nothing | Booking software, payment provider for the deposit, confirmations |
| Contact ("Send us a message") | `about.html` | Name, phone (optional), email, clinic, message | Shows "Thank you, your message is in." | Endpoint to the clinic inbox or CRM over HTTPS; the form already asks people not to include health details |
| Newsletter | `blog.html` ("Skin notes from our team"), `shop.html` (newsletter block) | Email | Shows a thank-you line | Email platform signup with express consent (CASL); a confirmation email (double opt-in) is recommended |
| Monthly member draw | `shop.html` | First name, last name, email address, phone number, and the live site's consent checkbox (emails about the draw, skincare education and offers) | Shows "you are entered" | Entry storage, the email platform signup for those who consent, official contest rules and eligibility text reviewed before launch |
| Checkout request | `checkout.html` | First and last name, email, phone, address, apartment, city, province, postal code, clinic, note, payment choice "Pay at your appointment" | Saves the order summary in the browser only (`localStorage` `ndm-last-order`: order number, lines, totals, first name, clinic), then opens `order-confirmed.html` | Decide: order requests by email or CRM, or a real e-commerce checkout (the clinic's current shop runs at shop.newdermamedlaserclinic.com) |
| Promo code | `cart.html` | Code | Shows "our team checks promo codes" | Validation against real codes, or remove |
| Chat question | Chat panel, every page | Free text | Answers locally from six preset questions and keyword matching (`CHAT_PRESETS`, `chatAnswer`), otherwise gives both clinic phone numbers | A live chat or a reviewed FAQ bot; the persona ("Olivia", a model photo, labelled virtual assistant) needs sign-off |

## Shell features

| Feature | Prototype | Production needs |
|---|---|---|
| Header and mega menus (Procedures, Concerns, About), phone drawer | Fully built; menu data in the shells (`PROCEDURES`, `CONCERNS`, `ABOUT`); "you are here" marking per page | Keep; move menu data to the CMS if one is used |
| Search overlay | Client-side search over the menu items and concerns (`ALL_TREATMENTS`) | Keep as is, or replace with site search once the pages are pre-rendered |
| Cart drawer and cart pill | Shared browser cart (`localStorage` `ndm-cart`); "Add to cart" (turning into a quantity stepper) on the pricing page, the price lists of treatment pages and the shop products (`QtyControl`) | Connect to the chosen checkout, or remove "Add to cart" from treatment prices if treatments should only be booked |
| Offer pop-up ("10% off your first treatment") | Appears once after 15 seconds, 45% scroll or exit intent; remembered with `localStorage` `ndm-offer-closed` and per page with `sessionStorage` `ndm-offer-<page>`; `?offer` in the URL previews it; links to `promotion.html` | Confirm the offer and its terms; keep the frequency rules |
| Promo bar | Both phone numbers, current offers link, shop link | Keep |
| Campaign switch ("Default look" pill, bottom left) | A review tool for the design team to preview campaign colour looks (`CAMPAIGN_LOOKS`, `CAMPAIGNS`, `localStorage` `ndm-campaign`); campaign looks are on hold | Remove from the public site, or hide behind a staff-only flag |
| Payment plans card | Affirm pre-qualification link (`AFFIRM_PREQUAL`, a public key in the URL); Affirm, Klarna and Afterpay logos loaded from each provider's CDN (`PAY_LOGOS`) | Confirm which providers the clinic actually offers; host the logos locally under each provider's brand rules |
| Reviews row | Static quotes with first name and initial, and a Google rating of 4.5 shown as a figure | Confirm the rating and keep it current (or pull it from the Google Business Profile); review quotes need the compliance review listed in `07-launch-checklist.md` |
| Chat note | A short "Hi, how can I help?" note once per visit (`sessionStorage` `ndm-chat-note`) | Keep or remove with the chat |

## Media and embeds

| Feature | Where | Notes |
|---|---|---|
| Hero film, clinic films and the footer film | Home, every page's footer, treatment and concern pages ("Inside the clinic" band) | Local MP4 files; muted, looping, `playsInline`; the new bands use `preload="none"`, a poster frame and play only while on screen. The home hero films are placeholders made from clinic photos: replace with real footage under the same file names |
| Instagram reels | Home, 15 treatment pages ("Watch") | Local copies of the clinic's reels; they show the Instagram header and follower count as filmed |
| Before and after | Home, promotion, `before-after.html`, 23 treatment pages and 14 concern pages | Local images; tap to enlarge; "Individual results may vary" on every view |
| Clinic map | `about.html` | Leaflet 1.9.4 from cdnjs with Esri basemap tiles; check Esri's terms for commercial use (an ArcGIS key or another tile provider) |
| Phone and map links | Everywhere | `tel:` links and Google Maps links |
| Social links | Footer, reels | Instagram, Facebook, YouTube, X, LinkedIn |

## Browser storage used

`localStorage`: `ndm-cart`, `ndm-last-order`, `ndm-offer-closed`, `ndm-campaign`. `sessionStorage`: `ndm-chat-note`, `ndm-offer-<page>`. None of them holds contact or health details. List them in the privacy policy and the consent banner as needed.

## Links still pointing at placeholders

These `#/...` links appear on every page (mostly footer and menus) and need a page or a decision:

| Placeholder | Suggested target |
|---|---|
| `#/privacy-policy`, `#/terms`, `#/refunds`, `#/policies-privacy-terms-refunds` | New policy pages (required before launch) |
| `#/financing` | `pricing.html#prices` (payment plans block) or a financing page |
| `#/account` | Patient account, if the booking software offers one; otherwise remove |
| `#/procedures`, `#/treatments` | A procedures hub page, or the Procedures menu |
| `#/skincare-shop` | `shop.html` |
| `#/book-online` | The booking pop-up (`#/book`) or the booking software's page |
| `#/trusculpt` | A TruSculpt page (device listed by the clinic, page not built yet) |

`#/book` is not a placeholder: it opens the booking pop-up.
