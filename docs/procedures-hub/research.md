# NewDermaMed /procedures hub: competitive SEO research

Prepared 2026-11-18. Research only; no site files changed.
Internal working material. Nothing here is cleared for external publication.

## Method and caveats

- SERP data comes from the WebSearch tool, which is a **US-based search API, not Google.ca**. The "who appears for which query" table below shows **what the search tool returned**, not true Google rankings, positions, or local-pack results. Treat it as a directional signal only.
- **No search volume, keyword difficulty, or CTR data was available.** Priorities below are qualitative.
- Competitor pages were read with raw HTML (curl, to see title, meta, canonical, robots, JSON-LD) and with a rendering fetch for layout. JS-rendered content (for example Dermapure's treatment grid) may be under-represented.
- Competitor copy is summarized, not reproduced.

---

## 1. NewDermaMed current state

### 1.1 Page-level metadata

| URL | Title | H1 | Meta description (summary) | Canonical | OG tags | JSON-LD |
|---|---|---|---|---|---|---|
| /procedures | "All Procedures, NewDermaMed Toronto" | "Every treatment, by category" | Every treatment by category, free consultation, Uptown or Downtown | none | none | none |
| /concerns | "All Concerns, NewDermaMed Toronto" | "Start from your concern" | Skin, face, body, hair concerns; free consultation at both clinics | none | none | none |
| /about | "About Us, NewDermaMed Cosmetic & Laser Clinic in Toronto" | "Toronto's cosmetic and laser clinic" | Medical team, both clinics, hours, parking, gallery, FAQ | none | none | none |
| / (home) | "NewDermaMed, Cosmetic & Laser Clinic, Toronto" | n/a | n/a | none | n/a | none |

Spot checks of treatment pages (/injectables/botox, /laser/laser-hair-removal, /skin/aesthetic, /concerns/acne-scars, /pricing) also returned **0 JSON-LD blocks** and no canonical.

### 1.2 What /procedures shows today

- Breadcrumb, H1, one-line intro, a category jump bar, then **7 H2 category groups listing 53 treatment names as plain text links** (no image, no description, no price, no concern, no location).
  - Injectables 11, Thread lift 1, Skin 22, Laser 1, Body 9, Veins 6, Hair 3.
- One closing line with "Individual results may vary", a "Book Free Consultation" CTA and a link to prices.
- No trust block (team, awards, reviews), no location block, no FAQ, no cross-link to concerns from inside the grid.
- Taxonomy issues visible on the page:
  - "Aesthetic" (/skin/aesthetic) is listed as a treatment; it is really a sub-category parent.
  - "Laser" has a single item (Laser Hair Removal), while laser resurfacing, micro laser peel, photo rejuvenation and EVLT sit in Skin or Veins. A one-item "Laser" bucket is a weak signal for "laser clinic Toronto".
  - "Thread lift" is its own category with one item.
  - Concern-named items sit inside the treatments list (Melasma, Rosacea, Hyperpigmentation, Dark Circles, Acne Scar, Stretch Marks, Hyperhidrosis), which overlap with /concerns/* pages: possible keyword cannibalization (for example /skin/melasma vs /concerns/melasma-concern, /skin/rosacea vs /concerns/rosacea-redness, /body/stretch-marks vs /concerns/stretch-marks-concern).
  - "Double Chin" and "Belkyra/Kybella (Double Chin)" are two entries for nearly the same intent.
- /about already has strong assets the hub does not reuse: named team (Alin Gharibian; Dr. Negin Mastouri, Medical Director; Dr. Luis Figueroa), both addresses with hours and phone numbers, parking, an awards line ("Top Choice Award, 8 consecutive years"), brands, a 3-step journey, and an FAQ.

### 1.3 Procedure URLs (linked from /procedures, 53)

**Injectables (11)**
/injectables/double-chin/belkyra-kybella, /injectables/botox, /injectables/dermal-fillers, /injectables/double-chin, /injectables/juvederm, /injectables/lip-augmentation, /injectables/mesotherapy-skin-boosters, /injectables/radiesse, /injectables/sculptra, /injectables/soft-lift, /injectables/tear-trough-correction

**Thread lift (1)**: /aptos-thread-lift

**Skin (22)**
/skin/aesthetic/acne-scar, /skin/acne-treatments, /skin/aesthetic/acnelan, /skin/aesthetic, /skin/aesthetic/age-element-facial, /skin/aesthetic/chemical-peels, /skin/dark-circles, /skin/aesthetic/dermamelan, /skin/aesthetic/exosome-skin-therapy, /skin/hyperpigmentation, /skin/laser-skin-resurfacing, /skin/melasma, /skin/micro-laser-peel, /skin/aesthetic/microdermabrasion, /skin/aesthetic/microneedling, /skin/mole-removal, /skin/aesthetic/photo-rejuvenation, /skin/rosacea, /skin/aesthetic/scar-removal, /skin/skin-tightening, /skin/aesthetic/visia-skin-analysis, /skin/aesthetic/wrinkle-treatments

**Laser (1)**: /laser/laser-hair-removal

**Body (9)**
/body/cellulite-fat-reduction, /body/coolsculpting, /body/hyperhidrosis, /body/nail-fungus-treatment, /body/non-surgical-bbl, /body/snoring-treatment, /body/stretch-marks, /body/tightsculpting, /body/vaginal-tightening

**Veins (6)**
/veins/endovenous-laser-evlt, /veins/radiofrequency-ablation-rfa, /veins/sclerotherapy, /veins/spider-vein-removal, /veins/varicose-vein-treatment, /veins/venaseal

**Hair (3)**: /hair/exosome-therapy-for-hair, /hair/hair-loss-treatments, /hair/laser-hair-rejuvenation

### 1.4 Concern URLs (linked from /concerns, 22)

/concerns/acne-breakouts, /concerns/acne-scars, /concerns/cellulite, /concerns/double-chin, /concerns/excessive-sweating, /concerns/hair-loss, /concerns/hyperpigmentation-sun-spots, /concerns/loose-skin, /concerns/melasma-concern, /concerns/moles-skin-lesions, /concerns/rosacea-redness, /concerns/sagging-skin-jowls, /concerns/spider-varicose-veins, /concerns/stretch-marks-concern, /concerns/stubborn-fat, /concerns/thin-lips, /concerns/thinning-hair, /concerns/under-eye-hollows-dark-circles, /concerns/uneven-texture-pores, /concerns/unwanted-hair, /concerns/volume-loss, /concerns/wrinkles-fine-lines

### 1.5 Sitemap and robots

- **/sitemap.xml lists 35 URLs, all blog: /blog plus 34 posts.** It lists **0 procedure URLs and 0 concern URLs**, and also omits /, /procedures, /concerns, /about, /pricing and every treatment and concern page.
- 34 of 35 `<lastmod>` values are the identical timestamp (2026-11-15T17:21:11Z), which looks build-generated rather than real edit dates; Google tends to ignore lastmod that is not trustworthy.
- **/robots.txt does not exist as a text file.** It serves the Next.js HTML "page could not be found" document (with `<meta name="robots" content="noindex">`). The HTTP status was inconsistent across requests (one 404 from a cached response, later 200). So there is no robots file and no `Sitemap:` directive.

### 1.6 Other technical issues

1. **Soft 404s:** non-existent URLs (for example /zz-does-not-exist-123, /procedures/foo, /injectables/not-real, /sitemap_index.xml) return **HTTP 200** with the not-found page plus `noindex`. They should return a real 404 status.
2. **No canonical tags** on any page checked. Next.js `metadata.alternates.canonical` should be set per route, especially because the site has query-string booking flows and possible trailing-slash variants.
3. **No Open Graph / Twitter tags**, so social shares have no controlled title or image.
4. **No structured data at all**: no MedicalClinic or LocalBusiness for the two clinics, no BreadcrumbList (even though breadcrumbs are visible), no ItemList on the hub, no FAQPage, no Physician. Most ranking competitors ship at least Organization + BreadcrumbList; the strongest (Dermapure city pages, Bar Beauty) ship MedicalClinic plus dozens of MedicalProcedure entities.
5. **URL taxonomy is inconsistent:** /aptos-thread-lift sits at root, /skin/aesthetic/* is a third level for some skin items but not others, and the hub lives at /procedures while no treatment is under /procedures/*. Not a blocker, but the hub's breadcrumb trail and internal linking need to make the hierarchy explicit.
6. **Possible NAP inconsistency (verify):** a Fresha directory listing surfaced in search showed NewDermaMed at 4763 Yonge St with phone 416-222-8188, while the site shows 416-224-8800 (Uptown) and 416-671-9766 (Downtown). Third-party listings with a different phone weaken local signals.
7. HEAD requests with a minimal user agent got 403 from the LiteSpeed edge. Browsers and Googlebot UA got 200, so this is probably not an SEO problem, but worth knowing for uptime monitors and SEO crawlers.

---

## 2. What the search tool returned per query

US search tool, not Google.ca. Domain list is what appeared in results, roughly in returned order. "(dir)" means directory or aggregator.

| Query | Clinic domains returned | Directories / media returned |
|---|---|---|
| cosmetic clinic Toronto | canadamedlaser.ca (/location/toronto/cosmetic-injections), dermapure.com (/en/locations/yorkville), solomonfacialplastic.com (2 medispa pages), canadiandermatology.com, my.clevelandclinic.org/canada, mdskinlab.ca, pearlrejuvenation.com, vicpark.com, healthoneskinclinictoronto.janeapp.com, laserbodymd (Google Sites) | whatclinic (dir), zipleaf (dir), poyst (dir), medboundtimes listicle, businesswire (Laser Clinics PR), cynosure locator |
| medical aesthetics Toronto | vicpark.com, mdskinlab.ca, dermapure.com, glamourmd.janeapp.com, laserbodymd | whatclinic (dir), fresha (dir), narcity (sponsored), businesswire (Canada MedLaser PR), poyst (Skin Vitality listing) |
| laser clinic Toronto | canadamedlaser.ca (home), dermapure.com (/clinics/toronto/fractional-lasers), drtorgerson.com, violalaser.janeapp.com | businesswire (Laser Clinics), whatclinic (Skinatomy, Skin Vitality profiles), fresha, cortico, cynosure locator |
| cosmetic treatments Toronto | my.clevelandclinic.org/canada, canadamedlaser.ca (x2), pearlrejuvenation.com, mdskinlab.ca, vicpark.com, drtorgerson.com, fourseasons.com spa | whatclinic, medboundtimes, curiocity, businesswire |
| non-surgical cosmetic treatments Toronto | mdskinlab.ca, pearlrejuvenation.com, solomonfacialplastic.com (blog + medispa), canadamedlaser.ca (Queen West) | fresha (many neighbourhood pages; one Yonge-Doris page lists NewDermaMed), whatclinic (Skin Vitality), medboundtimes |
| med spa North York | none directly (La Vitalité only via Cynosure locator) | fresha (about 12 neighbourhood pages; NewDermaMed listed), bbb.org |
| laser treatments North York | dermapure.com (Don Mills vascular lasers, Toronto laser hair removal), violalaser.janeapp.com | fresha (many), whatclinic (North York laser skin resurfacing, ibody) |
| skin rejuvenation Toronto | pearlrejuvenation.com (2 pages), dermapure.com (Yorkville photorejuvenation), canadamedlaser.ca (/services/laser-skin-treatments/skin-rejuvenation), drtorgerson.com, solomonfacialplastic.com (blog) | fresha, whatclinic, realself, blogto |

Observations:
- **newdermamedlaserclinic.com did not appear for any of the 8 queries**; NewDermaMed only showed up inside Fresha listings.
- **skinvitality.ca and barbeauty.ca did not appear directly** for any query in this tool.
- Clinics that do appear tend to rank with **treatment x location pages** (Canada MedLaser /location/toronto/cosmetic-injections, Dermapure /clinics/toronto/fractional-lasers, /en/locations/toronto/don-mills/vascular-lasers) rather than with a generic hub.
- North York queries are dominated by **Fresha neighbourhood pages**, which suggests weak clinic-level competition for North York modifiers. NewDermaMed's Uptown clinic at Yonge & Sheppard is a natural fit.

Extra competitors chosen from these results: **SFP Medispa (solomonfacialplastic.com), Dr. Cory Torgerson (drtorgerson.com), PearlMD (pearlrejuvenation.com), MD Skin Lab (mdskinlab.ca), Victoria Park Medispa Toronto Bay (vicpark.com).** Victoria Park's Toronto clinic is on Bay Street, close to NDM Downtown.

---

## 3. Competitor hub pages

### 3.1 Bar Beauty Medical (barbeauty.ca)
- **Hub:** no single "all treatments" page. Two hub-type pages: **/treatment-finder/** (quiz) and **/skin-concerns/** (concern hub). The nav groups treatments as Facial, Injectables, Body, Threads, Skin Concerns, plus a device/brand index (/devices/, /brand-*/) and /price-list/.
- **Title / H1:** "Treatment Finder | Bar Beauty Medical Toronto" / "Find Your Treatment". Concern hub: "Skin Concerns | Bar Beauty Medical Toronto" / "Skin Concerns, Treatment Guide Toronto".
- **Meta:** both promise matching a concern to the right treatment, with prices.
- **Organization:** 3-question quiz (concern with 6 options, cadence, needle comfort), then a decision matrix by concern, a comparison table (goal, treatment, sessions, downtime, starting price), common combinations, consultation prep, Toronto seasonal planning, a "what we won't treat" section, and an FAQ of about 15 questions. Nav references about 80 entries (about 40+ unique treatments).
- **Cards:** quiz answer cards; prices shown for many treatments.
- **Trust:** claims 5.0 Google rating from 222+ reviews; medical director with CPSO number; nurse/NP/physician injectors; product licensing claims.
- **Local SEO:** one address (CityPlace, downtown), open 7 days, plus **about 60 programmatic neighbourhood pages** (/north-york-medical-aesthetics/, /yorkville-, /don-mills-, /yorkdale-, /lawrence-park- and so on) and a Toronto price index page.
- **Structured data:** very heavy: about 107 MedicalProcedure entities, MedicalClinic+DaySpa, MedicalOrganization, MedicalBusiness, Person (x3-4), FAQPage, GeoCircle service area, 13 City entities, SpeakableSpecification, MedicalWebPage. robots.txt explicitly tuned for AI crawlers.
- **CTAs:** JaneApp booking, free consultation, phone, WhatsApp, SMS, email signup discount.
- **Standout:** the quiz, decision matrix, and comparison table answer the "which treatment is right for me" question on the hub itself.
- **Weaknesses:** very long and repetitive; quiz output not in static HTML; several absolute or superlative claims, and a drug name paired with a benefit in a comparison table (not a pattern NDM can copy under Health Canada rules); medical director credential is in a non-dermatology specialty; one location only; DaySpa schema type undercuts "medical" positioning.

### 3.2 Skin Vitality (skinvitality.ca)
- **Hub:** **/cosmetic-procedures/** (also linked as "SERVICES").
- **Title:** "Skin Vitality Procedures | Medical Spa Near Me | Skin Vitality Medical". **H1:** "Cosmetic Procedures".
- **Meta:** leads with a low-price Botox unit offer, award claim, 14 locations, same-day appointments.
- **Robots:** **`noindex, follow`** on the hub (confirmed with a Googlebot UA). Their hub is deliberately or accidentally kept out of the index.
- **Organization:** tabs by area/audience: Face (about 12), Body (10), Intimacy (2), Hair (2), Laser (11), Men (11); about 48 links, about 32 unique treatments. Hub taxonomy differs from the mega-menu taxonomy.
- **Cards:** text links only, no image, description or price.
- **Trust:** physician supervision line, "#1 provider" claims, "since 1992", testimonials and press links. No before/after on the hub.
- **Local:** 14 Ontario locations listed without street addresses on this page.
- **Structured data:** CollectionPage, BreadcrumbList, Organization, WebSite+SearchAction.
- **CTAs:** free consultation everywhere; call/text; promos (discount opt-in, referral, influencer program).
- **Weaknesses:** noindex hub, discount-led messaging, duplicate links, staging-domain URLs in the footer, unsupported superlatives.

### 3.3 Canada MedLaser (canadamedlaser.ca)
- **Hub:** **/services/**.
- **Title:** "Laser & Skin Treatment Services | Canada MedLaser". **H1:** same.
- **Meta:** laser hair removal specialist plus body and skin services for every skin type.
- **Organization:** 7 groups: Laser Hair Removal (7), Body Contouring (4), Hair Regrowth (1), Cosmetic Injections (13), Skin Treatments (15), Women's Wellness (1), **Skin Concerns (13)**; about 50 unique pages. "Most Popular Treatments" grid of about 9 image cards (image + title only).
- **Trust:** Google 4.7 from 315 reviews shown with written reviews; Before & After and "Result Guarantee Policy" links. No clinician credentials on the hub.
- **Local:** clinic finder with geolocation, radius and map; 17 location links (GTA, Barrie, Kitchener, Calgary). **Location x treatment pages** (for example /location/toronto/cosmetic-injections) were the URLs that appeared in search.
- **Structured data:** WebPage, BreadcrumbList, Organization, WebSite, plus **Product + AggregateRating** (self-serving review markup on a service page; risky and usually not eligible for stars).
- **CTAs:** "Book A Consultation" (Zenoti), Shop Now, Black Friday lead form, promo code in header.
- **Weaknesses:** no prices or descriptions on cards, duplicated menu items, discount-heavy, placeholder location link.

### 3.4 Dermapure (dermapure.com)
- **Hub:** **/treatments** (national), plus city/clinic hubs such as /en/locations/toronto (redirects to /clinics/toronto).
- **/treatments title:** just "Treatments"; **no meta description; no canonical.** H1: a generic best-in-class med spa line.
- **Organization:** JS-rendered grid with search filters (filter UI present in HTML, options not visible statically). Category tree from nav: Facials, Hair removal, HIFU (Ulthera), Injections (Belkyra, biostimulator, body enhancement, fillers, muscle relaxer, sclerotherapy), Laser & light (endovenous, gynecological, photorejuvenation, pigment, resurfacing, specialty energy, vascular), Lipolysis (CoolSculpting), Microneedling, Muscle stimulation, Other specialties (dermatology, hormone therapy), Peels, Radiofrequency.
- **Trust:** none on the national hub. The Toronto city hub has "Meet Toronto's Experts" with doctors and nurses.
- **Local:** about 55 clinics in Canada. **Toronto city page ships 5 MedicalClinic entities with addresses, geo and opening hours plus 76 MedicalProcedure entities in an ItemList**, and per-clinic treatment pages (Don Mills vascular lasers, Yorkville photorejuvenation) were what appeared in search.
- **CTAs:** "Book an Appointment" (short consult framing), newsletter discount.
- **Weaknesses:** the national hub is thin for SEO (generic title, no description, JS content); "med spa" positioning; no trust signals on the hub.

### 3.5 SFP Medispa (solomonfacialplastic.com/medispa/toronto-medical-spa-services/)
- **Title:** "Medical Spa Services | Medispa Toronto | SFP". **H1:** "SFP MEDISPA TORONTO – MEDICAL SPA SERVICES".
- **Organization:** 5 sections that mix treatment type and concern (laser resurfacing, skin tightening, pigment & sun damage, acne scars, injectables); each section has a concern-keyword subtitle listing what it addresses, then linked treatments (about 20 unique), then explanatory prose.
- **Trust:** facial plastic surgeon as medical director; about 200 Google reviews widget; RateMDs/RealSelf links.
- **Local:** Davenport Rd (Toronto) and Thornhill.
- **Structured data:** MedicalBusiness with address/geo, AggregateRating + Review, Person, BreadcrumbList.
- **CTAs:** consultation (fee credited to treatment), nurse booking, virtual consults.
- **Weaknesses:** "medispa" framing, three different phone numbers, inconsistent consult fee, outcome language without qualifiers, drug/benefit pairings.

### 3.6 Dr. Cory Torgerson (drtorgerson.com/non-surgical-procedures/)
- **Title:** "Non-Surgical Procedures in Toronto | Dr. Cory Torgerson". **H1:** "Non-Surgical Procedures".
- **Meta:** one generic line.
- **Organization:** 3 categories (Injectables & Fillers, Laser, Skin & Body) with **filter + search box** above an image card grid of about 60 items.
- **Cards:** image, name, one-line description, "Learn more", often a **"Before & after" link on the card**.
- **Trust:** surgeon credentials (FRCSC, MD, PhD), before/after galleries by category, video.
- **Local:** Yorkville address, Mandarin-language phone line.
- **Structured data:** Physician, ProfessionalService, **ItemList with about 60 ListItems**, BreadcrumbList, PostalAddress/Geo.
- **Weaknesses:** long mixed list (snoring, nail fungus, warts next to cosmetic), thin card copy, no pricing.

### 3.7 PearlMD (pearlrejuvenation.com/services/)
- **Title:** "Services - Pearl Rejuvenation". **H1:** "Our Services".
- **Organization:** category blocks (Health, Face, Body, Hormone) with bullets and "Learn More"; "Top Treatments" 4 image cards (title only); about 40-45 unique items across a dense mega-menu.
- **Trust:** named physician founder with bio; reviews and gallery linked but not shown on the hub; podcast/blog; AI beauty simulator.
- **Local:** 1650 Yonge St plus a Muskoka clinic.
- **Structured data:** basic Yoast (WebPage, BreadcrumbList, WebSite).
- **Weaknesses:** no pricing or details, vague promotional copy, template leftovers in FAQ, positioning drifts to wellness/hormones.

### 3.8 MD Skin Lab (mdskinlab.ca/pages/services)
- **Title:** "Services – MD Skin Lab Canada". **H1:** "Our Services". **No meta description.**
- **Organization:** 8 filter tabs (Facials, Peels, Microneedling, Skin Tightening, Laser & Light, Hair Restoration, Injectables, Skin Analysis & Lashes); about 30 services as an e-commerce menu.
- **Cards:** name, duration, short description, area options, 3/6-session package, struck-through price with % saving, Add to cart / Book now. Injectables route to consult-first booking.
- **Trust:** skincare brand logos, "physician-led" statement; few credentials.
- **Local:** single King St W address with map link.
- **Structured data:** LocalBusiness with address, geo, hours; Person.
- **Weaknesses:** discount-led, duplicated images/descriptions, no meta description.

### 3.9 Victoria Park Medispa, Toronto Bay (vicpark.com/clinics/toronto-bay-street/)
- No dedicated treatment hub; treatments live in a mega-menu with **two parallel taxonomies: /treatment/{category}/... and /concern/{facial-aesthetics|body-aesthetics}/...**. The Toronto location page acts as the local hub.
- **Title:** "Toronto Bay | Victoria Park Medispa". **H1:** "TORONTO BAY".
- **Trust:** named dermatologist, experts and nurses sections, customer reviews, "results from our experts".
- **Structured data:** HealthAndBeautyBusiness with address/geo, MedicalWebPage + FAQPage.
- **Weaknesses:** promo-led H2s (per-unit pricing, $100 off, financing), "medispa" branding, Montreal phone number in the site header.

---

## 4. Comparison matrix

| | NDM /procedures (today) | Bar Beauty | Skin Vitality | Canada MedLaser | Dermapure | SFP Medispa | Dr. Torgerson | PearlMD | MD Skin Lab |
|---|---|---|---|---|---|---|---|---|---|
| Hub URL | /procedures | /treatment-finder/, /skin-concerns/ | /cosmetic-procedures/ | /services/ | /treatments (+ city hubs) | /medispa/toronto-medical-spa-services/ | /non-surgical-procedures/ | /services/ | /pages/services |
| Indexable | yes (no canonical) | yes | **no (noindex)** | yes | yes (no canonical) | yes | yes | yes | yes |
| Title targets "Toronto + treatments" | weak | yes | no ("near me") | no | no | yes | yes | no | no |
| Meta description | yes | yes | promo | yes | **none** | yes | thin | yes | **none** |
| Organization | 7 categories | quiz + concern matrix | area/audience tabs | type + concern group | type tree + filters | type x concern sections | 3 categories + filter + search | category blocks | 8 filter tabs |
| By concern on hub | no (separate page) | yes | no | yes (13) | filter (JS) | yes (subtitles) | no | no | no |
| Search / filter | no | quiz | search (site) | header search | filters | no | **filter + search** | no | tabs |
| Approx. treatments | 53 | 40+ | about 32 | about 50 | large (national) | about 20 | about 60 | about 40-45 | about 30 |
| Card content | name only | answer cards, prices | name only | image + name (popular) | JS grid | linked names under concern | image, line, Learn more, B/A link | title only | price, duration, package, cart |
| Prices on hub | no (link) | yes | no | no | no | partial | no | no | yes (discounted) |
| Clinicians shown | no | yes (claims) | supervision line | no | city page only | yes | yes (surgeon) | yes (founder) | minimal |
| Reviews / rating | no | 222+ claim | links | 4.7 / 315 shown | no | about 200 widget | no | link | no |
| Before/after | no | no | footer only | link | no | no | **card-level links** | link | no |
| Awards | no (exists on /about) | no | "#1" claims | no | no | no | no | no | no |
| Locations on hub | no | 1 + 60 neighbourhood pages | 14, no addresses | finder + map, 17 | 55 clinics | 2 | 1 | 2 | 1 |
| JSON-LD | **none** | very heavy (MedicalProcedure x107, MedicalClinic, FAQ) | CollectionPage, Breadcrumb | Product+AggregateRating, Breadcrumb | LocalBusiness (hub); MedicalClinic x5 + MedicalProcedure x76 (city) | MedicalBusiness, Review | Physician, ItemList (60) | basic | LocalBusiness |
| FAQ on hub | no | yes (about 15) | no | no | no | no | no | yes | no |
| Primary CTA | Free consultation | Book / free consult | Free consultation | Book consultation | Book appointment | Book consult (fee) | Book consultation | Book now | Book / Add to cart |
| Positioning tone | medical, calm | medical + spa schema | discount, "med spa" | discount, promo code | "med spa" | "medispa" | surgeon-led | wellness / longevity | discount e-commerce |

---

## 5. Gaps NewDermaMed can realistically own (priority order)

1. **Two-clinic local hub that no competitor does well.** Competitors are either single-location (Bar Beauty, MD Skin Lab, Torgerson, SFP) or chains that hide addresses (Skin Vitality, Canada MedLaser). NDM can show both clinics on the hub (Uptown/North York at Yonge & Sheppard, Downtown at Bay & College) with address, hours, phone, parking, map link, and per-treatment availability ("offered at Uptown / Downtown / both"). North York queries returned almost only Fresha directory pages, so this is the most open lane.
2. **Concern-first entry point on the hub itself.** Today concerns live on a separate page. A "start from a concern" strip (22 concerns, grouped Face / Skin / Body / Hair / Veins) at the top of /procedures, linking to /concerns/*, plus each treatment card listing 2-3 concerns it may address. Bar Beauty, Canada MedLaser and SFP all bridge concern and treatment on one page; NDM can do it more cleanly without a long quiz.
3. **Physician-led trust block on the hub.** Reuse the /about assets: medical director and team, credentials, "Top Choice Award, 8 consecutive years", device/brand partners, the 3-step journey. Most chain competitors show no clinicians on their hub. (Publish gate: written approval from Raymond on file for every name, face, credential and affiliation before go-live.)
4. **Richer treatment cards.** Each card: name, category, one neutral line on what it is (not a benefit promise), typical session time, downtime, "from" price where NDM publishes it, clinic availability, and links to the concern(s) and to before/after where available. No competitor except MD Skin Lab shows practical details on the hub, and MD Skin Lab does it in a discount-led way. NDM can do it in a premium, medical register. For prescription-drug items (Botox and similar), keep cards to the product name and a link with no benefit claim attached (Health Canada C.01.044), and flag the card copy to Raymond before publishing.
5. **Client-side filter and search across 53 treatments.** Filter by category, by concern, by area (face, body, hair, veins), by clinic, and a text search. Only Torgerson and MD Skin Lab offer this; render all items in server HTML so the list stays crawlable (unlike Dermapure's JS grid).
6. **Fix the taxonomy on the hub.** Merge or re-label the one-item "Laser" and "Thread lift" groups (for example a "Laser & energy" group holding laser hair removal, laser resurfacing, micro laser peel, photo rejuvenation, laser hair rejuvenation; thread lift under injectables / lifting). Remove "Aesthetic" as a card or present it as a group. Show concern-named treatment pages (melasma, rosacea, hyperpigmentation, dark circles, stretch marks) as treatments with clear treatment naming to reduce overlap with /concerns/*.
7. **A medical veins category as a differentiator.** NDM has 6 vein treatments (EVLT, RFA, VenaSeal, sclerotherapy). Among the competitors reviewed, only Dermapure and Victoria Park touch veins, and none showcase them. Giving veins visible weight on the hub supports the "medical-grade, not a medspa" positioning.
8. **Structured data that matches the page.** BreadcrumbList; ItemList of the treatments (name + URL); MedicalClinic (x2, with address, geo, hours, phone) referenced from the hub; FAQPage only if the FAQ is visible. Avoid self-serving AggregateRating on the hub (Canada MedLaser's pattern). This alone puts NDM ahead of every competitor here except Bar Beauty and Dermapure's city pages.
9. **A short, honest FAQ on the hub** (how to choose, consultation cost, which clinic, how pricing works, results vary, who performs treatments). Competitors either have none or bury a very long FAQ. Use qualified language and keep "Individual results may vary" visible.
10. **Technical basics that competitors also get wrong** (sitemap, robots, canonical, soft 404s; see section 1). Skin Vitality's hub is noindexed and Dermapure's has no title/description, so a fully indexable, well-titled NDM hub has a real chance to compete for "cosmetic treatments Toronto" style queries.

Suggested title / H1 direction for the hub (not final copy):
- Title: "Cosmetic & Laser Treatments in Toronto | NewDermaMed" (or include "North York & Downtown" if length allows).
- H1: something that contains "treatments" and "Toronto" rather than "Every treatment, by category".

---

## 6. Keyword-intent map: hub vs. individual pages

No volume or difficulty data was available; priority is qualitative (H / M / L) based on intent fit and what the search tool returned.

### Broad commercial: target the hub (/procedures) and home
| Keyword | Page | Priority |
|---|---|---|
| cosmetic treatments Toronto | /procedures | H |
| non-surgical cosmetic treatments Toronto | /procedures | H |
| medical aesthetics Toronto | home or /procedures | H |
| cosmetic clinic Toronto | home | H |
| laser clinic Toronto | home + /procedures (laser group) | H |
| cosmetic and laser clinic Toronto | home | M |
| aesthetic treatments Toronto | /procedures | M |
| non-invasive skin treatments Toronto | /procedures | M |
| physician-led aesthetic clinic Toronto | /about or home | M |

### Treatment-specific: target individual treatment pages, hub links to them
| Keyword pattern | Page | Priority |
|---|---|---|
| laser hair removal Toronto | /laser/laser-hair-removal | H |
| dermal fillers Toronto, lip filler Toronto, tear trough filler Toronto | /injectables/* | H |
| Botox Toronto (drug-name page; copy restricted under C.01.044) | /injectables/botox | H (compliance review) |
| CoolSculpting Toronto | /body/coolsculpting | H |
| microneedling Toronto, chemical peel Toronto, laser skin resurfacing Toronto | /skin/* | H |
| Sculptra Toronto, Radiesse Toronto, Juvéderm Toronto | /injectables/* | M |
| VenaSeal Toronto, EVLT Toronto, sclerotherapy Toronto, varicose vein treatment Toronto | /veins/* | M-H |
| Aptos thread lift Toronto | /aptos-thread-lift | M |
| exosome therapy Toronto, PRP hair Toronto | /skin/aesthetic/exosome-skin-therapy, /hair/* | M |
| Dermamelan Toronto, VISIA skin analysis Toronto | /skin/aesthetic/* | L-M |

### Concern / problem: target /concerns/* pages; hub surfaces them
| Keyword pattern | Page | Priority |
|---|---|---|
| acne scar treatment Toronto | /concerns/acne-scars | H |
| melasma treatment Toronto, hyperpigmentation treatment Toronto | /concerns/melasma-concern, /concerns/hyperpigmentation-sun-spots | H |
| rosacea treatment Toronto | /concerns/rosacea-redness | M-H |
| double chin treatment Toronto | /concerns/double-chin | M |
| spider veins Toronto, varicose veins Toronto | /concerns/spider-varicose-veins | M-H |
| hair loss treatment Toronto | /concerns/hair-loss | M |
| excessive sweating treatment Toronto | /concerns/excessive-sweating | M |
| under eye hollows treatment Toronto, sagging jowls treatment, stubborn fat removal Toronto | /concerns/* | M |

Decide one owner page per concern to avoid cannibalization (for example /concerns/melasma-concern owns the problem query, /skin/melasma is framed as the treatment protocol).

### Comparison: blog or treatment pages (not the hub)
| Keyword pattern | Page | Priority |
|---|---|---|
| CoolSculpting vs liposuction / vs SculpSure / vs cavitation | existing blog posts | M |
| filler vs Sculptra, Radiesse vs Sculptra | treatment pages or new blog | M |
| microneedling vs laser resurfacing, chemical peel vs microdermabrasion | blog | M |
| EVLT vs RFA vs VenaSeal | /veins/* or blog | M |
| med spa vs medical clinic (positioning content) | blog / about | L-M |

### Local: hub + location sections (and later location pages)
| Keyword pattern | Page | Priority |
|---|---|---|
| med spa North York / medical aesthetics North York / cosmetic clinic North York | hub location block, future Uptown page | H |
| laser treatments North York, laser clinic Yonge and Sheppard | Uptown section / future page | H |
| cosmetic clinic downtown Toronto, Bay and College, near Toronto General / UofT | Downtown section / future page | M-H |
| [treatment] North York (laser hair removal North York, fillers North York) | treatment pages with clinic availability block | M |
| near me variants | handled by GBP + location pages, not hub copy | M |

Note: "med spa" is a search term people use; target it in location metadata if needed, but keep page copy medical (brand standard: not a medspa).

### Research / informational: blog and FAQ, hub links out
| Keyword pattern | Page | Priority |
|---|---|---|
| how much does [treatment] cost in Toronto | /pricing + treatment pages | M-H |
| what is [treatment], how long does [treatment] last, downtime | treatment page FAQ / blog | M |
| does insurance cover cosmetic / vein treatment (OHIP) | existing blog | M |
| best treatment for acne scars / melasma | concern pages | M |
| is [treatment] safe for darker skin | treatment pages | M |

---

## 7. Compliance and publish-gate notes for the page build

- Keep "Individual results may vary" on the hub (already present) and on any before/after links or thumbnails.
- Avoid absolute claims ("permanent", "guaranteed"); several competitors use these. Use "may", "can", "results vary".
- Drug-name cards (Botox and similar prescription products): name only, no consumer benefit next to it; flag copy to Raymond Valadkhani (raymond@nuvior.com) before go-live.
- Clinician names, photos, credentials, and the award line can be used in the build; written approval from Raymond must be on file for each before the page goes live.
- Competitor ratings and pricing seen here are their self-reported claims and were not verified.

## Sources consulted

- NDM: newdermamedlaserclinic.com /procedures, /concerns, /about, /, /sitemap.xml, /robots.txt, sample treatment pages.
- Competitor hubs: barbeauty.ca/treatment-finder/, barbeauty.ca/skin-concerns/, barbeauty.ca page-sitemap; skinvitality.ca/cosmetic-procedures/; canadamedlaser.ca/services/, /location/toronto/; dermapure.com/treatments, /clinics/toronto; solomonfacialplastic.com/medispa/toronto-medical-spa-services/; drtorgerson.com/non-surgical-procedures/; pearlrejuvenation.com/services/; mdskinlab.ca/pages/services; vicpark.com/clinics/toronto-bay-street/.
- SERP snapshots: WebSearch tool for the 8 queries listed in section 2 (US search API, 2026-11-18).
