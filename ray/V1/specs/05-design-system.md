# 05. Design system

The values below come from the page head (`tailwind.config`, the CSS variables and the custom CSS). Copy them as they are into the production theme.

## Colours (Tailwind `ndm-*`)

| Token | Hex | Use |
|---|---|---|
| `ndm-blue` | `#209ED9` | Links, accents, icons |
| `ndm-sky` | `#26B1E7` | Accent text on dark backgrounds (two-tone headings) |
| `ndm-deep` | `#0F80C3` | Primary blue: buttons, active states, two-tone headings on light backgrounds |
| `ndm-amber` | `#FFA617` | The "Book Free Consultation" button and the booking form's accents (step bar, badge, chosen dot) |
| `ndm-red` | `#EA364B` | Defined, not used yet (price-list offer badges use `#C0182C` in `.pr-badge`) |
| `ndm-ink` | `#1B242B` | Body text and headings |
| `ndm-slate` | `#24303A` | Dark panels |
| `ndm-muted` | `#5A646C` | Secondary text |
| `ndm-soft` | `#B6B6B6` | Soft grey text and lines |
| `ndm-line` | `#E2E4E6` | Dividers |
| `ndm-mist` | `#F2F2EF` | Light grey sections and chips |
| `ndm-paper` | `#FAFAF8` | Page background |
| `ndm-night` | `#0B0F13` | Dark sections and the hero |

Dark bands use gradients defined in the CSS: `.ba-dark` (before and after, navy), `.tx-why-dark` ("Why NewDermaMed"), `.tx-film` (clinic film), `.book-sum` (booking summary card), `.cn-bio` (bio-stimulator group, deep violet).

## Typography

`FONT_CHANGE = true` (in the page head) selects the current fonts. The Tailwind class names were kept from the earlier fonts, so they read differently from the font they show:

| Class | Font | Use |
|---|---|---|
| `font-aeonik` | Fraunces (serif), Georgia fallback | Headings and large numbers |
| `font-inter` | Manrope, Helvetica Neue fallback | Paragraphs and most UI text |
| `font-mont` | Helvetica Neue, Inter fallback | Menu, buttons, labels, form fields |

Two-tone headings (`TwoTone`): the first line in ink, the second in blue italic (`.tt-strong`, Fraunces italic at weight 350). Most section headings use `clamp()` sizes, for example `text-[clamp(32px,3.4vw,50px)]`.

## Layout

- Page gutter: `--gx: clamp(20px, 5vw, 96px)`, used as `px-[var(--gx)]` on every section.
- Content width on treatment and concern pages: `max-w-[1180px]` (`TX_WRAP`).
- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536). The hero booking card shows from `lg`; below it the form sits under the hero.
- Minimum supported width: 375 px with no sideways scrolling.
- Radii: cards 18 to 28 px, buttons and chips fully round.

## Buttons (`Btn`)

| Variant | Look | Rule |
|---|---|---|
| `v="book"` with `hot` | Amber pill with a white arrow dot | Only for "Book Free Consultation" |
| `v="book"` | Blue pill with the arrow dot | "Book Free Consultation" on light sections where amber is not used |
| `v="book"` with `onDark` | White pill with a blue dot | "Book Free Consultation" on dark bands |
| `v="ink"` | Blue `#0F80C3`, darker on hover | Form steps (Continue, Pay, Request a call) and other primary actions |
| `v="line"` | Outline, fills ink on hover | Secondary actions (Back, See all) |
| `v="light"`, `v="glass"` | White, or frosted on dark backgrounds | Secondary actions on dark bands |
| `btn-buy` | Blue, ink on hover | Add to cart, call buttons |

Rules from the design team: no black buttons; the amber book button is the one signature button; every page except home starts with a breadcrumb.

## Motion

- Easing variables: `--e-out: cubic-bezier(.16,1,.3,1)`, `--e-inout: cubic-bezier(.87,0,.13,1)`, `--e-quart: cubic-bezier(.165,.84,.44,1)`.
- Reveal on scroll: elements with `.rv` fade, rise 28 px and sharpen from a blur when their section enters the viewport (`useReveal`); a `transitionDelay` staggers items.
- Smooth scrolling with Lenis; parallax on hero photos and the clinic film; counters count up once in view (`CountUp`); marquee for partner logos.
- `prefers-reduced-motion` is respected everywhere (`REDUCED` in the code switches motion off and videos stay paused).
- The header switches to its light-on-dark style over any section marked `data-nav="dark"`.

## Section tags and headings

- `Eyebrow`: a pill with the brand mark and a slow light sweep, above every section heading; numbered on pages with a chapter bar ("01 Benefits").
- `TxNav`: the sticky numbered chapter bar on treatment, concern and Aptos pages; it highlights the section in view.

## Component catalogue

| Area | Components | File |
|---|---|---|
| Shell (every page) | `PromoBar`, `Header`, `MegaMenu`, `ConcernsMenu`, `AboutMenu`, `SearchOverlay`, `Drawer`, `Footer`, `Breadcrumb`, `BookForm`, `BookPicker`, `BookCalendar`, `BookPopup`, `CartDrawer`, `CartPill`, `ChatBot`, `OfferPopup`, `CampaignSwitch`, `Btn`, `Eyebrow`, `TwoTone`, `Faq`, `Team`, `PromoReviews`, `Partners`, `CountUp`, `useReveal`, `useInView` | `index.html`, `promotion.html` |
| Home | `Hero`, `Start`, `TreatMenu`, `AptosCare`, `Space`, `BeforeAfter`, `Appointment`, `VisitUs`, `Journal`, `Social`, `Shop` | `index.html` |
| Treatment pages | `LiveHero`, `LiveBenefits`, `LiveTabs`, `LiveWhy`, `LivePrices` | `src/live-treatment-ui.jsx`, `src/build_live_treatments.py` |
| Shared treatment sections | `TxGlance`, `TxNav`, `TxHead`, `TxExpect`, `TxWhy`, `TxConcerns`, `TxResults`, `TxPrices` and the Aptos sections | `src/treatment-ui.jsx` |
| Media sections | `TxFilm` (clinic film band), `TxReel` (Instagram reel in a phone frame), `TxCases` (dark before and after), `TxVisit` (both clinics) | `src/live-media-ui.jsx` |
| Hero, booking card, skin analysis band | `ProcHero`, `ProcForm`, `ProcAnalysis` | `src/procedure-ui.jsx` |
| Concern pages and hub | `ConcernHero`, `CnIntro`, `CnUnderstand`, `CnAssess`, `CnOptions`, `CnCompare`, `CnHome`, `CnArticles`, `CnRelated`, `HubHero`, `HubGroups` | `src/concern-ui.jsx` |
| Other pages | Pricing, about, shop, blog and articles, cart | `src/pricing-ui.jsx`, `src/about-ui.jsx`, `src/shop-ui.jsx`, `src/blog-ui.jsx`, `src/article-ui.jsx`, `src/cart-ui.jsx` |
