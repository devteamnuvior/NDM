# 03. The booking form

One form, used everywhere: every "Book Free Consultation" button opens it, and it is built into the home page and the top of every treatment and concern page. In the prototype nothing is sent or charged; this spec describes the flow to keep and the back end to build.

## Where it appears

| Place | Component | Layout |
|---|---|---|
| Home page booking section ("Book a free consultation in a few short steps") | `Appointment` in `index.html` | Full width, with the dark "Your appointment" summary card on desktop |
| Booking pop-up, on every page, opened by any link to `#/book` | `BookPopup` in both shells | Full width |
| Treatment, concern, Aptos and Botox pages: the card in the hero (desktop, 1024 px and up) and the block under the hero (phones) | `ProcForm` in `src/procedure-ui.jsx` | `compact`: one column, smaller headings, under the title "Book your free consultation" with the amber arrow dot |

All three render the same `BookForm` (in `index.html` and `promotion.html`), with its helpers `BookPicker`, `BookCalendar` and `BookChip`.

## The flow

Two paths share the first three steps. The step bar is amber; "Step X of Y" names the current step.

**Booking path (5 steps):** Your concern, Your details, Book or call, Clinic day and time, Deposit.
**Call path (4 steps):** Your concern, Your details, Book or call, Best time to call.

### Step 1: Your concern ("What would you like to address?")

A picker with category tabs; the options of the open tab appear below. An option can sit in more than one category. Picking one shows "Your choice: ..." with an amber dot.

| Category | Options |
|---|---|
| Face | Wrinkles & fine lines, Volume loss, Sagging skin & jowls, Double chin, Thin lips, Dark circles & under-eye hollows |
| Skin | Acne, Acne scars, Rosacea & redness, Melasma, Pigmentation & sun spots, Texture & pores, Moles & skin lesions |
| Body | Stubborn fat, Cellulite, Stretch marks, Loose skin, Excessive sweating, Spider & varicose veins, Unwanted hair |
| Hair | Thinning hair, Hair loss |
| Injectables | Botox®, Dermal Fillers, Lip fillers, Under-eye filler, Skin boosters, Aptos Thread Lift, Bio-stimulator · Sculptra®, Bio-stimulator · Radiesse® |
| Bio-stimulators | Bio-stimulator · Aptos Thread Lift, Bio-stimulator · Sculptra®, Bio-stimulator · Radiesse® |
| Thread lift | Aptos Thread Lift, Non-surgical facelift, Neck lift, Jawline lift, Eyebrow lift, Nose lift |
| Treatments | Laser Hair Removal, Microneedling, Laser skin resurfacing, Laser skin tightening, Photo-rejuvenation (IPL), Chemical peels, CoolSculpting®, VISIA® skin analysis |

Always shown under the tabs: "Not sure, I'd like a skin analysis" (turns the VISIA switch back on) and "Something else" (opens "Tell us in a few words", required, 80 characters).

Switch: "Include my free VISIA® skin analysis", on by default.

Validation: one option is required; "Something else" needs its text.

### Step 2: Your details ("How can we reach you?")

First name, last name, mobile number, email (all required, browser validation for email and phone). "Reach me by": Call, Text, Email (choose any, at least one; Call and Text are selected by default). Note under the fields: "Please don't include medical details. We use your details only to arrange your visit."

### Step 3: Book or call ("How would you like to continue?")

Two large tiles: **Book a time now** ("Choose a clinic, day and time. A $50 refundable deposit holds it.") and **Have us call you** ("No payment. We call within one business day."). Choosing a tile moves straight to the next step.

### Step 4, booking path: Clinic, day and time ("Where and when?")

Clinic: Uptown (Yonge & Sheppard) or Downtown (Bay & College). A month calendar (six rows, past days and Sundays disabled, months ahead allowed) and hourly start times: Monday to Friday 9am to 6pm, Saturday 10am to 4pm, today only from the next full hour (`bookSlots`). Day and time are required. Note: "Your time is held once the deposit is paid on the next step."

### Step 5, booking path: Deposit ("Hold your time with a $50 deposit")

Shows the day, time and clinic, then the terms: the consultation (and VISIA® analysis, if chosen) is free; the $50 is applied to any treatment chosen or refunded at the visit; reschedule or cancel free up to 24 hours before; the deposit is not refunded for a missed visit without notice. A marked panel shows where the payment provider's secure card form goes (no card fields exist in the prototype). Checkbox "I understand the deposit terms" (required). Button: "Pay $50 deposit and book".

Confirmation: "You're booked, {first name}." with the day, time and clinic, the deposit terms, and "Need to change it? Call {clinic phone} at least 24 hours before."

### Step 4, call path: Best time to call ("When's a good time to call?")

Time of day: Morning, Afternoon, Early evening (required). Preferred clinic: Either clinic, Uptown, Downtown. Button: "Request a call".

Confirmation: "Request sent, {first name}." and "We'll call you in the {time of day} within one business day to find a time for your consultation (and VISIA® skin analysis)."

## Data to send

A suggested payload (one per submission):

```json
{
  "path": "book",
  "concern": "Bio-stimulator · Sculptra®",
  "concern_other": "",
  "visia": true,
  "first_name": "",
  "last_name": "",
  "mobile": "",
  "email": "",
  "reach_by": ["Call", "Text"],
  "clinic": "Uptown",
  "start": "2026-11-09T09:00:00-05:00",
  "deposit": { "amount": 50, "currency": "CAD", "terms_accepted": true, "payment_reference": "" },
  "call_time": null,
  "call_clinic": null,
  "source": { "page": "juvederm.html", "form": "hero" }
}
```

For the call path, `clinic`, `start` and `deposit` are empty and `call_time` and `call_clinic` are set. `source.form` is one of `home`, `popup`, `hero`, `mobile`.

## Back end to build

1. **Availability:** replace the fixed hours in `bookSlots` with free slots from the clinic's booking software, per clinic, and hold the chosen slot while the deposit is paid.
2. **Deposit:** a payment provider with a hosted or embedded card form (the provider handles card data), CAD 50 (`BOOK_DEPOSIT`, possibly changing to 100), applied to treatment or refunded at the visit, kept for a missed visit without notice; free changes up to 24 hours before (`BOOK_NOTICE`).
3. **Confirmations:** email and text confirmation on the channels the person chose, and ideally a reminder before the visit.
4. **Call requests:** create a task for the front desk with the time of day and clinic; the promise on screen is a call within one business day.
5. **Abuse protection:** server-side validation, rate limiting and an invisible bot check.
6. **Analytics:** events for each step shown, the path chosen and the submission.

## Data handling

- A name and contact details together with a treatment concern are personal health information under Ontario's PHIPA, and the clinic is responsible for them. Send over HTTPS only, store submissions in the booking system or another system approved for health information (not in plain email), limit staff access, set a retention period, and prefer Canadian hosting.
- "Reach me by" covers messages about this booking. Marketing emails or texts need a separate, unticked consent checkbox (CASL).
- Link the privacy policy next to the submit buttons once that page exists.

## Keep as built

Each step is a `fieldset` with a `legend`; focus moves to the new step's question and scrolls it into view; errors appear in a `role="alert"` line; the picker is a `tablist` with arrow-key support and the options are radio inputs; Continue and the final button keep separate React keys (reusing one button submitted the next step on arrival). On phones only the open step takes space.

## Settings in the code

In `index.html` and `promotion.html`: `BOOK_INTEREST_GROUPS` (picker), `BOOK_NOT_SURE`, `BOOK_OTHER`, `BOOK_FLOW` (step names), `BOOK_DEPOSIT`, `BOOK_NOTICE`, `BOOK_CALL_TIMES`, `BOOK_CLINIC_OPTS`, `bookSlots` (hours). History of changes: `src/patches-applied/booking_deposit_patch.py`, `book_form_patch.py`, `book_form_r2_patch.py`.

## Open decisions

- Deposit amount: $50 or $100.
- Uptown on Saturdays: the calendar and the site footer offer Saturday at both clinics, while the clinic brief lists Uptown as Monday to Friday only. To confirm with Raymond.
