# /procedures treatments hub: strategy, build and launch report

Prepared 2026-11-18, branch `revisions-pooria`. Internal working material, not cleared for publication.
Competitor research, SERP notes and the comparison matrix are in `research.md` in this folder.

## 1. What changed

| File | What |
|---|---|
| `web/src/app/(site)/procedures/page.tsx` | New title, description, canonical, Open Graph and Twitter tags; JSON-LD (CollectionPage with an ItemList of every linked treatment, BreadcrumbList, one MedicalClinic per clinic); renders the hub. |
| `web/src/lib/procedures-hub.ts` | Builds the page from WordPress: names, addresses (parents included) and header photos of every published procedure and concern. Nothing is listed that WordPress does not hold; a new procedure the hub does not know appears under "More treatments". |
| `web/src/config/procedures-hub.ts` | The hub's own words: taxonomy (9 groups), one-line card descriptions, areas and concerns for the finder, comparisons, technology, visit steps, FAQ. |
| `web/src/components/procedures/` | `hub-page.tsx` (sections), `hub-directory.tsx` (finder + directory, client), `hub-compare.tsx` (comparison tabs, client), `hub-nav.tsx` (sticky section bar, the site's `SubNav`). |
| `web/src/styles/procedures-hub.css` | Page-only styles under `main[data-page="procedures"]` (imported in `globals.css`). |
| `web/public/assets/home/menu/` | The 25 "Browse the menu" treatment photos (the designer's set), used on the cards. |

`components/index/post-index.tsx` stays (the `/concerns` index still uses it).

## 2. Strategy in one paragraph

Hub and spoke. `/procedures` targets broad discovery ("cosmetic treatments Toronto", "laser clinic Toronto", "non-surgical cosmetic treatments", "medical aesthetics North York") and hands every visitor to the right spoke: a treatment page or a concern page. It does not repeat the treatment pages, so they keep their own treatment-name queries. The skyscraper approach (one very long page) was rejected: the gap competitors leave is usefulness, not length, so the hub is a finder plus short, specific cards, compact comparisons, local detail and the visit, with depth left to the spokes.

## 3. Keyword-to-page map (qualitative: no volume or difficulty data was available)

| Intent | Example queries | Page | Notes |
|---|---|---|---|
| Broad commercial | cosmetic clinic Toronto, cosmetic treatments Toronto, medical aesthetics Toronto, non-surgical cosmetic treatments Toronto | `/procedures` | H1 "Cosmetic & laser treatments in Toronto", title, intro. |
| Local | med spa North York, laser treatments North York, cosmetic clinic Downtown Toronto | `/procedures` (clinics section), `/about` | Both clinics with address, hours, transit. Location landing pages only if they can carry real location-specific content (see roadmap). |
| Category | laser clinic Toronto, injectables Toronto, body contouring Toronto, vein treatment Toronto | `/procedures#<group>` now; category pages later | Group headings are H2s with anchors. |
| Treatment | Botox Toronto, dermal fillers Toronto, microneedling Toronto, CoolSculpting Toronto | each treatment page | Hub links with the treatment's name; never targets these itself. |
| Concern | acne scar treatment Toronto, melasma treatment, skin tightening Toronto | `/concerns/<slug>` | "Start from a concern" links all 22. |
| Comparison | microneedling vs laser resurfacing, filler vs Sculptra, CoolSculpting vs TightSculpting | `/procedures#compare` | Three comparisons of treatments the clinic offers. |
| Research | which treatment is right for me, laser on darker skin, cost of cosmetic treatments | `/procedures#faq` | Nine answers. |

**Cannibalization risks (flag, not changed):** `/skin/melasma` vs `/concerns/melasma-concern`, `/skin/rosacea` vs `/concerns/rosacea-redness`, `/body/stretch-marks` vs `/concerns/stretch-marks-concern`, `/skin/hyperpigmentation` vs `/concerns/hyperpigmentation-sun-spots`, `/skin/acne-scar` vs `/concerns/acne-scars`, `/injectables/double-chin` vs `/concerns/double-chin`. Decide per pair which page owns the query; the other should point to it.

## 4. Page outline (as built)

- H1 Cosmetic & laser treatments in Toronto
- Section bar: Treatments, By concern, Compare, Technology, Your visit, Clinics, FAQ (sticky)
- H2 Search N treatments, or narrow by area (search box, area chips, category links)
- H2 per group (9): Injectables & fillers, Collagen stimulators & thread lift, Laser & light, Skin treatments & facials, Acne scars & pigmentation, Body contouring, Hair restoration, Vein treatments, Laser wellness treatments (+ More treatments when WordPress has a page the hub does not know)
- H2 Not sure of the treatment? Start with what you see (H3 Face, Skin, Body, Hair)
- H2 Similar goals, different approaches (tabs: texture, volume and lift, body)
- H2 The tools behind your treatment (H3 per technology)
- H2 What to expect at NewDermaMed (6 steps) + Real results, Our medical team, Clear prices
- H2 Two clinics, North York and Downtown Toronto (H3 per clinic)
- H2 Choosing a treatment, answered plainly (9 FAQs, answers in the HTML)
- H2 Not sure where to start? Let us help you choose (Book, Call Uptown, Call Downtown)

CTA hierarchy: Book Free Consultation (hero, closing card, header) > Explore treatments > per card "Learn about ..." > Call either clinic / Directions. No pop-ups or urgency added. Clinic-specific booking was not added: the booking form already asks for the clinic.

## 5. SEO assets

- **Title:** Cosmetic & Laser Treatments in Toronto | NewDermaMed (53 characters)
- **Description:** Explore around 50 non-surgical cosmetic and laser treatments at our North York and Downtown Toronto clinics, by treatment or concern. Free consultation. (152)
- **Canonical:** https://newdermamedlaserclinic.com/procedures (needs `SITE_URL` at build, already set on the live server)
- **JSON-LD:** CollectionPage + ItemList (every linked treatment), BreadcrumbList, MedicalClinic x2 (address, phone, hours, geo, map; `@id` `/#clinic-uptown`, `/#clinic-downtown`). No ratings, reviews, offers, FAQPage or HowTo. Checked that it parses and carries the right values; not yet run through Google's Rich Results Test or the Schema.org validator (needs the page live or a public preview).
- **Internal links:** about 50 treatment links (anchor = treatment name), 22 concern links, comparison column links, technology links, `/before-after`, `/about#team`, `/pricing`, `/about#clinics`, `/concerns`.
- **Alt text:** treatment card photos are decorative (`alt=""`, the card's text names the treatment); hero and visit photos describe the clinic and the VISIA consultation.

## 6. QA (2026-11-18, local `next dev` reading the live WordPress, read-only)

| Check | Result |
|---|---|
| Type check, ESLint on the new files | Pass |
| Desktop 1440 x 900, every section | Checked visually |
| Phone 375 x 812 | Checked; no sideways scroll; cards become compact rows |
| Search, area filter, empty state, category links | Work; all cards are in the server HTML before any script runs |
| Sticky section bar, scroll marking | Works (fixed: it must sit directly in `<main>`) |
| Comparison tabs | Keyboard arrows work; hidden panels stay in the HTML |
| JSON-LD | Parses; 51 items; addresses correct |
| Canonical / description | Present and correct |
| Images | Load through the optimizer; one 504 seen in dev from a slow remote WordPress photo |
| Not tested | Production build, Core Web Vitals / PageSpeed, screen reader pass, Rich Results Test, the live booking flow from this page |

## 7. Needs approval before launch (Raymond Valadkhani)

1. **All new copy** in `config/procedures-hub.ts` (card lines, comparison rows, steps, FAQ answers). Written in qualified language for clinical review; nothing was copied from competitors.
2. **Comparison table rows** (sessions, recovery, "hyaluronic acid fillers can be dissolved") are general guidance and need a clinician's check.
3. **Prescription drugs:** the Botox® and Belkyra® / Kybella® cards name the product and say it is a prescription treatment assessed at a consultation, with no benefit claim (C.01.044). Hyperhidrosis card does not name the drug.
4. **Trust lines** reused from the site: "Physician-led care", "Top Choice Award, 2019 to 2026".
5. **Contradictions found on the site** (left as they are, please decide):
   - Devices: the About FAQ names Candela GentleMax Pro (laser hair removal) and Morpheus8 (skin tightening); the treatment pages name Cutera / Fotona and Fotona. The hub names no device for those two treatments.
   - Parking: `config/site.ts` (Hullmark, 4800 Yonge, 25 Sheppard; 88 / 100 College) differs from the About page (Lot 56 Hullmark, uPark 9 Bogert, Indigo 25 Sheppard; 790 Bay, SP+ 201 Elizabeth, 76 College). The hub links to About for parking.
   - Every treatment page in WordPress shows "30 to 60 minutes" and "Minimal downtime", including EVLT and RFA. The hub does not repeat these.
   - A Fresha listing shows Uptown as 416-222-8188; the site says 416-224-8800 (from the research).
   - "Medical Dermatology" (`/skin/medical-dermatology`) appeared in WordPress on 2026-11-18; it shows under "More treatments" with a generic line until it gets a card description and a group.

## 8. Technical recommendations (outside this page, not done)

1. `app/sitemap.ts` lists the blog only: add the core pages, `/procedures`, `/concerns`, every procedure and concern page.
2. Add `app/robots.ts` (allow all, `Sitemap:` line). `/robots.txt` currently returns the not-found HTML page.
3. Unknown addresses answer 200 with a "not found" page: they should answer 404.
4. Canonical and Open Graph tags exist only on the blog and now `/procedures`: add them to every page.
5. Decide the six cannibalizing pairs (section 3).
6. Move the "Aesthetic" and "Double Chin" parent pages out of the treatment lists (the hub already skips them).

## 9. Launch and growth roadmap

- **Launch:** Raymond's approval of section 7; deploy; Rich Results Test and URL Inspection in Search Console; PageSpeed mobile on `/procedures`; submit the sitemap once it lists the treatment pages.
- **Days 1 to 30:** sitemap, robots and 404 fixes; canonicals site-wide; decide the cannibalizing pairs; card description for Medical Dermatology; GA4 / GTM events (below) and their verification.
- **Days 31 to 60:** link every treatment page back to `/procedures#<group>` and to its concern pages; add clinic-specific Google Business Profile links; consider one strong page per category (Laser, Injectables, Body, Veins) if Search Console shows category queries.
- **Days 61 to 90:** location pages only if they carry real content (team on site, parking, transit, which treatments each clinic offers); add before and after cases per treatment (with consent, "Individual results may vary"); expand comparisons where Search Console shows comparison queries.

**Measure:** Search Console impressions, clicks and average position for the broad and local queries in section 3; organic sessions landing on `/procedures`; clicks from the hub to treatment pages (`treatment_card_click`), filter use (`hub_filter`, `hub_search`), comparison tab use, consultation CTA clicks (`book_click`), call clicks (`call_click`), booking starts and completed requests; and conversions per organic landing page. None of these events exist yet: the site sends no analytics events today, so this needs GA4 / GTM set up and verified first.
