# 07. Launch checklist

Nothing goes live, to print or to any outside audience until Raymond Valadkhani has signed off. Tick every line below first.

## A. Publish gates (Raymond's written approval)

- [ ] **Practitioner names, photos and credentials.** Written approval for every name, face, credential and clinic affiliation on the site: the team section and profiles (for example Alin Gharibian, Clinic Director; Dr. Negin Mastouri, Medical Director; Dr. Luis Figueroa, Vascular Surgeon; Heather Bouchard, NP), the shop founder card (including its "Aptos Certified" line, approval item E2), and review quotes that name staff.
- [ ] **Health Canada wording.** A final pass on all treatment claims against approved indications, with qualified language ("may", "can", "results vary"). Prescription products (Botox®, Dysport®, Belkyra®) may not appear next to a benefit claim in consumer advertising (C.01.044). Known spots in the live copy: `botox.html`, `belkyra-kybella-double-chin.html`, `soft-lift.html` (its meta description pairs Botox with benefits), `wrinkle-treatments.html`, `hyperhidrosis.html`, `lip-augmentation.html`, and the articles `what-is-botox-and-how-does-newdermamed-use-it.html` and `newdermamed-toronto-offers-botox-treatments.html`. Raymond deferred this pass; it must happen before launch.
- [ ] **Concern pages.** The copy of `concerns.html` and the 22 concern pages is new and needs approval (approval page, group G).
- [ ] **Before and after.** Every before and after view keeps "Individual results may vary" (in place on all pages today).

## B. Decisions to confirm

- [ ] Uptown on Saturdays: the clinic brief says Monday to Friday only, while the footer, the chat answer and the booking calendar offer Saturday at both clinics. The structured data and the "Visit us" block follow the brief. Make all of them agree.
- [ ] Deposit amount: $50 or $100 (`BOOK_DEPOSIT`); the 24-hour change window and the missed-visit wording.
- [ ] Payment plans: which providers the clinic offers (Affirm, Klarna and Afterpay logos are shown).
- [ ] The "10% off your first treatment" pop-up: offer terms and end date.
- [ ] The Google rating shown (4.5) and the review quotes: keep them current and compliant with the College of Physicians and Surgeons of Ontario rules on testimonials.
- [ ] Shop: keep the current shop platform or build a checkout; rules for the monthly member draw.
- [ ] Chat: a live chat or a reviewed FAQ assistant; sign-off on the persona.
- [ ] Live typos kept word for word: "Tear Trough Correcion" (H1 of `tear-trough-correction.html`) and live titles ending in "- NDM".
- [ ] Map coordinates in the structured data (approximate today): confirm against the Google Business Profiles.

## C. Replace before launch

- [ ] Images loaded from other websites (licence and reliability): four journal card images and the phone mock-up (`HAND_PHONE`) from framerusercontent.com, in the shells' journal and social data; the NAMICA badge, `face-glow.jpg` and `prod-visage-ha-cut.png` from the nuvior.com theme folder, used in the home page's Aptos section; the payment provider logos (host locally).
- [ ] The two home films are placeholders made from clinic photos: replace with real clinic footage (same file names, H.264 MP4, under 3 MB).
- [ ] The base64 Aeonik font in every page: remove it, or confirm a web licence.
- [ ] The about page map tiles (Esri): confirm the terms for commercial use, or switch tile provider.
- [ ] Placeholder links (`#/privacy-policy`, `#/terms`, `#/refunds`, `#/policies-privacy-terms-refunds`, `#/financing`, `#/account`, `#/procedures`, `#/treatments`, `#/skincare-shop`, `#/book-online`, `#/trusculpt`): build the pages or point them at existing ones (`specs/04-integrations.md`).
- [ ] Remove the review tools from the public build: the campaign switch ("Default look" pill), `black-friday.html` (campaign on hold), `index-fraunces.html` (obsolete).

## D. Build and infrastructure

- [ ] Pre-rendered HTML for every page, compiled scripts, built CSS, self-hosted fonts (`specs/01-architecture.md`).
- [ ] Back end for every form, booking software availability, deposit payments, confirmations (`specs/03-booking-form.md`, `specs/04-integrations.md`).
- [ ] Privacy policy, terms and refunds pages; a 404 page (none exists yet).
- [ ] Health information handling for form submissions (PHIPA): HTTPS, approved storage, access limits, retention.
- [ ] Consent banner and analytics; marketing consent kept separate and unticked (CASL).
- [ ] 301 redirects from every old live address (`NDM/REDIRECTS.md`), checked after the switch.
- [ ] Final URL pattern chosen; canonical addresses, sitemap and `llms.txt` regenerated for it (`specs/06-seo-geo.md`).
- [ ] Performance: images in responsive sizes through a CDN; Core Web Vitals in the green on a mid-range phone.
- [ ] Accessibility: keyboard use of menus, booking form, cart and dialogs; visible focus; text contrast on photos and dark bands (WCAG 2.1 AA).
- [ ] Security: HTTPS everywhere, security headers, server-side validation and rate limits on forms.
- [ ] Launch day: prices checked against the clinic's current price list, offer dates, hours, phone numbers.
- [ ] After launch: Google Search Console with the sitemap, Google Business Profiles linked to the new pages, uptime monitoring.
