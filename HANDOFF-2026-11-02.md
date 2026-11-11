# Handoff: NewDermaMed website prototype

State as of 2 November 2026. Work started 27 October 2026 in a single long chat; this file replaces that chat history.
Read `CLAUDE.md` first for the stack, build commands and rules. This file gives the page-by-page status, where the content came from, and what still blocks publishing.

## 1. Files

| Path | What it is |
|---|---|
| `index.html` | Home page. Edited directly. **Active page.** |
| `promotion.html` | Promotions page. Edited directly; also the shell all generated pages are built from. Frozen. |
| `pricing.html` | Treatments & pricing. Generated. Frozen. |
| `about.html` | About us (team, clinics, gallery, awards, contact). Generated. Frozen. |
| `blog.html` | Blog listing. Generated. Frozen. |
| `what-causes-rosacea-redness.html` | First article page (template for others). Generated. Frozen. |
| `botox.html` | Botox procedure page. Generated. Active. |
| `aptos-thread-lift.html` | Aptos Thread Lift page (menu Aptos links go here). Generated. Active. Template for new treatment pages. |
| `src/` | Build scripts and page parts for the generated pages (see CLAUDE.md). |
| `src/patches-applied/` | Site-wide patch scripts already applied to index + promotion. Reference only. |
| `assets/` | Local images, icons, team photos, clinic photos. |
| `tools/jsxcheck.js` | JSX balance checker. `tools/make_serif.py` and `index-fraunces.html` are obsolete. |

### How pages share code
promotion.html contains every shared component (Header, menus, PromoBar, Footer, Team, Process, BeforeAfter, PromoReviews, Faq, cart, Breadcrumb, CartPill, BookPopup, FloatSearch, SearchOverlay, Drawer, OfferPopup). Each `src/build_*.py` reads promotion.html, swaps the title, description and JSON-LD, adds page CSS, inserts its page components before `function App()`, and replaces `App`. So a shared change goes into index.html + promotion.html, then all five generated pages are rebuilt.

## 2. Site-wide features (all pages)
- **Header:** PromoBar (36px, rotating messages) + header bar (64px, 84px at xl). Menu: Procedures (mega menu, Aptos first), Concerns, Pricing, Promotion, About (menu), Skincare shop (external, new tab). No "View all" links in menus. Under 768px the header search icon is hidden and a floating search button sits bottom right (`FloatSearch`), lifting above anything marked `data-float-avoid`.
- **Menu links** (`PAGE_LINKS` in each page): pricing.html, promotion.html, about.html (#team, #clinics, #uptown, #downtown, #awards, #contact), blog.html, botox.html. On about.html and blog.html their own links become same-page anchors. Links with no page yet go to `#/slug` placeholders.
- **Menus:** menu items are plain text links with a blue arrow right after the text (moves on hover). The Aptos panel shows the treatment list, then the purple NAMICA card at exactly the size of the consultation photo card, side by side.
- **Testimonials rows** (`ReviewRow`, inner pages): drift a little faster (about 20%), never pause on hover, and can be grabbed with the mouse (or swiped) and dragged either way.
- **Menu "you are here"** (site-wide, `HERE` / `NAV_HERE` / `here()` in both shells): the top item for the open page gets a short blue line under the label (no dot, per the user) and turns blue; the dropdown link to the open page is bold blue with a blue dot (`aria-current="page"`); the Procedures mega menu and the phone drawer open on the category that holds the page. New pages need an entry in `NAV_HERE`.
- **Section tags** (`Eyebrow`, `.eyebrow` CSS): redesigned site-wide as a pill with a round brand-mark chip, a fine blue-to-amber edge and a slow light sweep; 15px on phones, 16px from 768px. The hand-built copies (Our medical team, About NewDermaMed, Inside our clinics, @newdermamed, booking-form tags) now use the same `.eyebrow` classes.
- **Photos:** promotion offer cards use `assets/promotion/*.webp` (Liquid Facelift keeps its old photo: 8 photos for 9 offers); the "most popular treatments" cards use `assets/treatments/*.jpg` (on home and promotion).
- **Campaign looks** (site-wide, `CAMPAIGNS` / `CAMPAIGN` / `CampaignSwitch` in both shells, mounted into its own root after `book-root`): a switch at the bottom left previews the Nov 4 holiday brief's five campaigns in three looks (Black Friday: black + champagne gold; Holiday: deep green, burgundy, gold; New Year: white, silver, slate). It swaps colour tokens on `html[data-campaign]`, the announcement bar (`data-campaign-bar`, on every page), the home hero's first slide (live text, badge, countdown) and a badge on treatment and offer cards. Logo, fonts, menu and booking never change; Botox, Aptos and the rosacea article keep their colours and only get the bar (`CAMPAIGN_SKIP`). The choice is saved in localStorage (`ndm-campaign`); `?campaign=<id>` gives a preview link, `?campaign=default` clears it. Copy fits the brief's limits (headline 40, subhead 90, button 18, bar 70) except the fixed "Book Free Consultation" label.
- **Home hero:** slide 2 says "#1 Aptos training centre in Canada" and shows only the face figure (`AptosFigure faceOnly`, the thread lines redraw instead of switching to the body chart); slide 3 is "Injectables": "Botox®, Dermal fillers, Biostimulator / with 16+ years of experience". Slide tabs now show from 1280px (dots below that), since they covered the button at 1024px.
- **Home stats:** the labels (Years in Toronto, etc.) now lead: larger serif text under a short blue line, numbers in blue.
- **Team:** four portraits (2 x 2 on phones); the fourth is `team-sample` (`assets/team/sample.svg`, not clickable) until the real photo and profile arrive. About page filters the sample out.
- **Before & after band:** warm graphite (`.ba-dark`) instead of slate blue.
- **Chat pop-up:** about 4.5 s after load (once per visit) a message card shows the assistant typing, then "How can I help you today?" with "Ask a question" and "Book a consultation", a "1" badge and a soft pulse on the button, and a two-note chime (Web Audio). Browsers only allow the sound after the visitor has clicked, tapped or pressed a key, so an untouched first visit stays silent.
- **Consultation form** (`Appointment`) now also sits above the footer on promotion and pricing.
- **Black Friday full theme** (`black-friday.html`, generated by `src/build_blackfriday.py` from index.html, noindex): the designer's mood preview of the home page as a Black Friday event, kept apart from the real site. r20 direction (user, 2026-11-05): the page stays light, black + red only, no yellow, and no "Black Friday" hero slide (the event should read from the details). The build remaps every brand blue and the amber to red and the blue-black ink to true black across the whole file (PALETTE list), so red repeats wherever blue was; the Aptos band and its face-line glow keep their purple look. Details: black/red promo bar, the red tape alone crossing the light page at a slight angle (after the hero, before Treatments, before the offers; r21: no black backing strip, no tape at the bottom), treatment cards as black tickets (ticket line, side notches, dashed tear line, price + red Book on the stub, no barcode), the monthly specials renamed "Black Friday offers" (eyebrow = campaign dates): gold tickets (r22: gold from the live site's promotion cards #B4915F / #C2A473 / #FAE1A0, dark brown text, an inner stroke that bends around the notches, a dashed tear line, a slow light sweep, black Buy now with gold text turning red on hover) on a black panel with a red glow that follows the pointer and a film grain, a flip-clock countdown to the campaign `until` date, a slowly turning round stamp, and a white "View all offers"; mega menu (r21): a black event strip on top (badge, dates, live countdown, red "See the offers"), a black category rail with a red active item, and the consultation card as a black ticket with a small countdown and a red Book button; a quiet pulsing red dot beside Promotion in the header; red review stars, red "View cart", the three How it works buttons equal (all `book`, 300 x 48), and a black "Back to the site" pill. Rebuild after every index.html change.
- **Normal site, Nov 5:** slide 2 headline is "#1 Aptos training centre / in Canada"; slide 3 is three lines, "Botox®, Dermal fillers / & Biostimulators / with 16+ years of experience" (last line in the italic sky accent, `accent: true`). Light (white) buttons on photos now turn brand blue on hover. Before & after band is back to its original slate. Photos get a faint peach light (soft-light overlay on hero, statement, treatment, team, offer and journal photos; never on before & after photos), and a few light sections get soft peach glows.
- **Footer video card** is shorter (less space above the heading and before the link panel, smaller heading).
- **Chat button** lifts above the cart bar when the bar shows (both sit bottom right on wide screens).
- **Top Choice Award motion** (`AwardsMotion`, home reviews block and About awards): the eight badges appear one by one with their years, then "8 Years of Excellence", then it fades and loops. Replaces NDM's GIF. The GIF's "Toronto's Best Cosmetic Clinic" is written as "Toronto's Top Choice Cosmetic Clinic" (no superlative claim).
- **Promotion carousel cards** use the same photo circle as the home cards.
- **Chat assistant** on every page (`ChatBot`, persona Olivia with a model photo, labelled as a virtual assistant). Prototype answers from the clinic's facts and FAQ.
- **Payment plans strip** (`PayPlans`): home and promotion specials, and treatment price sections. Affirm is real; Klarna and Afterpay logos are placeholders (hotlinked from their CDNs).
- **Sideways rows** (any overflow-x row) can be dragged with the mouse; cards snap after release.
- **Phone header** shows a compact amber Book button; the mobile menu's Book button is amber.
- **Booking thank-you:** after sending, the popup, the home booking form and the procedure form show `BookThanks` (NDM's own screen: amber tick, 24-hour call back, Schedule free consult now → NDM /online-booking/).
- **Social icons** in the footer (and the home Social section) take each network's brand colour on hover.
- **Booking popup:** every link with `href="#/book"` opens `BookPopup` (its own React root `#book-root`): the home page "Book now at our two Toronto locations / 2 simple steps" form. Bottom sheet under 640px, centred card above. Form is a prototype (shows a thank-you only).
- **Cart:** header bag icon with count, cart drawer, floating cart bar (`CartPill`) on every page. The bar shows only when the cart has items, stays hidden on the first screen (and during the home header slides), and hides over `data-pill-avoid` areas. Cart is stored in localStorage `ndm-cart`; checkout is a placeholder (`#/checkout`).
- **Breadcrumb** top left under the header on every page except home.
- **Offer popup** shows once per visitor.
- **Popup style (all popups):** same as the booking popup: dark see-through blurred backdrop (ink 55%, 6px blur), white rounded card (bottom sheet on phones), close button in the card, a click or tap outside the card closes it, Esc closes. Applies to the booking form, offer popup and team profile. Exception: the about-page photo popup has no card and no close button, only the bare photo on the same backdrop with a row of small thumbnails below (tap one to switch); swipe and arrow keys switch photos, a click off the photo or Esc closes.
- **Background** is paper #FAFAF8 everywhere (user found the earlier cream too warm).

## 3. Pages

### index.html (home), active
Order (by visitor journey, offers and prices after the clinic, team, treatments and proof): hero (4 slides, 400vh: 16 years; Aptos Thread Lift and training centre on the team photo with the moving Aptos figure; dermal fillers with the two syringe pictures; natural results on the VISIA consultation photo `assets/home/visia-consult.jpg` with the TruSkin Age picture) → About NewDermaMed → partners marquee → inside our clinics (Space) → our medical team → most popular treatments → Aptos (fits one screen: One thread / Three actions, "Aptos 10 thread methods" card with P(LA/CL) + HA small, checklist with the Health Canada seal beside its words; then the four NUVIOR treatment-area marking photos, hotlinked) → before & after (eye area blurred) → patient reviews + awards → how it works (Process photos: visia-consult, visia-screen, mirror-check) → monthly specials (a photo in each card's circle; a small Flexible payment plans strip with Affirm + two placeholder providers and Start my plan) → our Toronto clinics (slideshows; Downtown uses `assets/clinic/downtown/`, all other clinic photos are Uptown) → questions & answers → booking form → medical-grade skincare (20 products turning, Visit Skincare shop under the text) → skin insights journal → social → footer. A chat assistant button sits bottom right (above the floating search on phones); a note pops up a few seconds after load (on phones only after the header slides); preset questions or free text, answered from the clinic's own facts and FAQ (prototype, no live agent).

### promotion.html, frozen
Specials carousel as the h1 header (light theme by default) → all offers grid (Face/Body filter) → Team → Process → Before & after (not pinned) → reviews marquee (real Google reviews, shortened names, Botox-mentioning reviews left out) → FAQ (NDM promotion FAQs) → footer.

### pricing.html, frozen
Video hero (NDM fees page desktop/mobile MP4, full screen height) with a 3-item strip and a bouncing scroll arrow at the bottom centre → price list: all 23 categories stacked and folded, every treatment folds too; categories open with treatments folded. 128 treatments, prices and badges copied exactly from NDM's fees page (verified). Red offer badges, struck-out regular price, blue sale price, Add to cart → quantity stepper → Team → Process → Before & after → reviews → FAQ → footer.

### about.html (About us), frozen
Hero (reception photo, "About us" tag, two-line h1, links to team / clinics / contact) → About NewDermaMed (statement + stats + Top Choice line) → team (order Alin, Negin, Luis; 260px photo, facts row, short bio with "Read full bio", highlight card, focus chips) → one section per clinic (Uptown, Downtown): tag, two-line title, blurb, Book + Directions; a Leaflet map in a rounded box (Esri light grey tiles, zoom capped at 16), clinic photo card on a stem above the pin, blue "P" parking pins with the address on hover/tap; then address, phone & email, hours → gallery + awards in one section (WorkNook-style mosaic: 14 clinic photos in 8 staggered columns, 4 on phones, each opens the photo popup; under the middle columns the original Awards & recognition text: tag, stars, Top Choice line, "Trusted brands & awards / for excellence", paragraph, awards and brands image; `#awards` anchor there) → process → FAQ → contact (call/text cards per clinic + message form) → footer.

### blog.html, frozen
Light type-led header with pulsing rings (layout and motion after Orléva journal) → latest article card → story grid with topic filters and "Load more" (all 34 NDM posts; cards in the promotion card style, blue "Read article") → newsletter (prototype form) → FAQ → footer. Only the rosacea post has its own page; other cards open the post on NDM's current site in a new tab.

### what-causes-rosacea-redness.html, frozen
Orléva article layout: centred meta/title/byline, wide photo, 720px text column, "Key takeaway" card with a model photo and amber Book button, related articles (swipe on phones). NDM text lightly edited for qualified language; prescription medicines described generally, not by name. To add more articles: add an entry to `BLOG_LOCAL` in `src/blog-ui.jsx` and an `ARTICLE` object (copy the pattern in `src/article-ui.jsx` / `src/build_article.py`).

### botox.html, active
Same layout system as the Aptos page: hero → at-a-glance strip → What is this treatment (TxIntro) → treatment overview (4 counting cards in a row, no video) → why choose → before & after (3 compact sample cards) → price list → why NewDermaMed (team award photo) → Team → reviews → FAQ.

### aptos-thread-lift.html, active (treatment template)
All treatment sections are centred in one 1180px column (`TX_WRAP`, centred headings via `TxHead`), like the Pricing price list. Hero (NDM Aptos header photo, booking form) → at-a-glance strip pulled up over the header (icon per fact + call buttons, `TxGlance`) → sticky row of section links 01 to 10 (`TxNav`) → the reference's ten topics in its order: 01 What it is (photo with NUVIOR's turning NAMICA ring) · 02 How it works · 03 Is it safe (NUVIOR product box on a purple card) · 04 How long it lasts (purple card with NUVIOR's HA release motion) · 05 How many you need · 06 Good candidates · 07 What to expect (timeline) · 08 Results (3 real Aptos cases) · 09 Pre & post care · 10 Elevate your results → price (TxPrices + PayPlans) → why NewDermaMed (team award photo `assets/home/team-award.jpg`) → Team → reviews → FAQ. To add another treatment page: copy `src/aptos-ui.jsx` and `src/build_aptos.py`, change the data and the output name.

## 4. Content sources (NDM site, newdermamedlaserclinic.com)
- Prices: `/fees-financing/` (accordion `.accordion-item > .variable`).
- Promotions: `/promotion/`. Blog: `/blog/` (4 pages, 34 posts) and each post's page.
- About: `/about-us/` (team, clinics, parking, FAQ, gallery `wp-content/uploads/2025/09/About-us-gallery-01..10.png`).
- Botox: `/injectables/botox/` (header `wp-content/uploads/2025/09/2.jpg`, mobile `2.1.jpg`).
- Clinic and parking coordinates came from the Google Maps short links on the About page (their `!3d…!4d…` values).
- Figma file `spchZj0gZhW1XJHLaZanvS` (Frame 7, node 233:8730) holds the original homepage design.

## 5. Open items and publish blockers
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

## 6. Ideas the user mentioned for later
- A dedicated before & after page.
- More procedure pages using the Botox template, and more article pages using the rosacea template.
