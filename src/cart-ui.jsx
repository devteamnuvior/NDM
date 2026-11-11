/* ---------------------------------------------------------------- cart, checkout and order confirmation (after the Bellair Laser Clinic
   cart > checkout > confirmation flow, in the NDM look). Prototype: nothing is charged or sent. Payment is taken at the clinic;
   no card fields exist. The cart is the shared browser cart (CartCtx, localStorage 'ndm-cart'); the last order request is kept in
   localStorage 'ndm-last-order' (order number, lines, totals, first name and clinic only: no email, phone or address). */
const ORDER_KEY = 'ndm-last-order';
const HST = 0.13; /* Ontario HST, shown as an estimate */
const round2 = (n) => Math.round(n * 100) / 100;
const totalsOf = (lines) => {
  const sub = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const saved = lines.reduce((n, l) => n + (l.was ? l.qty * (l.was - l.price) : 0), 0);
  const tax = round2(sub * HST);
  return { sub: round2(sub), saved: round2(saved), tax, total: round2(sub + tax) };
};
const money2 = (n) => '$' + n.toLocaleString('en-CA', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const CO_STEPS = [['Cart', 'cart.html'], ['Checkout', 'checkout.html'], ['Confirmation', null]];
const PROVINCES = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];
/* pairs well with your treatment: lines straight from the price list (same keys as the Pricing page, so the cart stays one cart) */
const CART_PAIRS = [
  { key: 'Microneedling-Face|Single session', cat: 'Microneedling', name: 'Microneedling-Face', label: 'Single session', price: 245, was: 490, unit: '' },
  { key: 'Skin Booster – HA (Hyaluronic Acid)|1 syringe', cat: 'Skin Booster and Bio-stimulators', name: 'Skin Booster – HA (Hyaluronic Acid)', label: '1 syringe', price: 399, was: 0, unit: '' },
  { key: 'Age Element Facial|Single session', cat: 'Facial', name: 'Age Element Facial', label: 'Single session', price: 249, was: 0, unit: '' },
  { key: 'Purifying Light Peel|Single session', cat: 'Chemical Peel', name: 'Purifying Light Peel', label: 'Single session', price: 149, was: 0, unit: '' },
];

/* 1 Cart · 2 Checkout · 3 Confirmation */
function CheckoutSteps({ at }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 font-inter text-[12.5px] font-semibold uppercase tracking-[.12em]" role="list" aria-label="Checkout progress">
      {CO_STEPS.map(([t, h], i) => {
        const done = i < at, now = i === at;
        const dot = <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full text-[12px] tracking-normal ${now ? 'bg-ndm-deep text-white' : done ? 'bg-ndm-deep/10 text-ndm-deep' : 'bg-white text-ndm-muted ring-1 ring-ndm-ink/15'}`}>{done ? <IconTick size={12} /> : i + 1}</span>;
        const label = <span className={now ? 'text-ndm-ink' : done ? 'text-ndm-deep' : 'text-ndm-muted'}>{t}</span>;
        return (
          <Fragment key={t}>
            <li {...(now ? { 'aria-current': 'step' } : {})}>
              {done && h ? <a href={h} className="flex items-center gap-2 hover:underline underline-offset-4">{dot}{label}</a> : <span className="flex items-center gap-2">{dot}{label}</span>}
            </li>
            {i < CO_STEPS.length - 1 && <li aria-hidden="true" className={`h-px w-6 sm:w-10 ${done ? 'bg-ndm-deep/40' : 'bg-ndm-ink/15'}`} />}
          </Fragment>
        );
      })}
    </ol>
  );
}
const IconTick = ({ size = 14, ...p }) => <Svg size={size} vb="0 0 14 14" {...p}><path d="m3 7.3 2.6 2.6L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
const IconLock = (p) => <Svg size={15} vb="0 0 16 16" {...p}><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" /></Svg>;

/* the page head every step shares: steps, heading, one line of help */
function CoHead({ at, lead, strong, text }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <CheckoutSteps at={at} />
        <TwoTone as="h1" id="co-title" className="mt-7" size="text-[clamp(40px,4.6vw,68px)]" lead={<>{lead}<br /></>} strong={strong} />
      </div>
      {text && <p className="max-w-[44ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted">{text}</p>}
    </div>
  );
}

function SumRows({ t }) {
  const row = 'flex items-baseline justify-between gap-4 font-inter text-[14.5px]';
  return (
    <dl className="grid gap-2.5">
      <div className={row}><dt className="text-ndm-muted">Subtotal</dt><dd className="tabular-nums text-ndm-ink">{money2(t.sub)}</dd></div>
      {t.saved > 0 && <div className={`${row} text-ndm-deep`}><dt>You save</dt><dd className="font-semibold tabular-nums">{money2(t.saved)}</dd></div>}
      <div className={row}><dt className="text-ndm-muted">Estimated HST (13%)</dt><dd className="tabular-nums text-ndm-ink">{money2(t.tax)}</dd></div>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-ndm-ink/10 pt-4">
        <dt className="font-inter text-[15px] font-semibold text-ndm-ink">Estimated total</dt>
        <dd className="font-aeonik text-[28px] leading-none tracking-[-0.02em] text-ndm-ink tabular-nums">{money2(t.total)}</dd>
      </div>
    </dl>
  );
}

/* a cart line on the cart page: what it is, the quantity, the line price */
function CartLine({ l }) {
  const cart = React.useContext(CartCtx);
  const label = `${l.name}, ${l.label}`;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(110px,auto)] sm:items-center sm:gap-x-8">
      <div className="min-w-0">
        <p className="font-inter text-[12px] uppercase tracking-[.12em] text-ndm-muted">{l.cat}</p>
        <p className="mt-1 font-aeonik text-[20px] leading-[1.25] tracking-[-0.01em] text-ndm-ink">{l.name}</p>
        <p className="mt-0.5 font-inter text-[14px] text-ndm-muted">{l.label} · {money(l.price)}{l.unit} each</p>
      </div>
      <p className="text-right sm:order-3">
        {l.was ? <s className="pr-was block"><span className="sr-only">Regular price </span>{money(l.was * l.qty)}</s> : null}
        <span className={`block font-aeonik text-[22px] leading-tight tabular-nums ${l.was ? 'text-ndm-deep' : 'text-ndm-ink'}`}>{money(l.price * l.qty)}</span>
        {l.was ? <span className="co-save mt-1 inline-block">Save {money((l.was - l.price) * l.qty)}</span> : null}
      </p>
      <div className="col-span-2 flex items-center gap-5 sm:order-2 sm:col-span-1">
        <QtyControl line={l} label={label} />
        <button type="button" onClick={() => cart.setQty(l, 0)} className="font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:text-ndm-ink hover:underline">Remove<span className="sr-only"> {label}</span></button>
      </div>
    </li>
  );
}

/* pairs well with your treatment / add to your plan */
function CartPairs({ title = 'Pairs well with your treatment', kicker = 'Complete your plan', max = 4, compact }) {
  const cart = React.useContext(CartCtx);
  const list = CART_PAIRS.filter((x) => !cart.lines.some((l) => l.key === x.key)).slice(0, max);
  if (!list.length) return null;
  return (
    <div className={compact ? '' : 'mt-12'}>
      <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">{kicker}</p>
      <h2 className={`mt-2 font-aeonik font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink ${compact ? 'text-[22px]' : 'text-[clamp(26px,2.4vw,34px)]'}`}>{title}</h2>
      <ul className={`mt-5 grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`} role="list">
        {list.map((x) => (
          <li key={x.key} className="flex items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3.5 ring-1 ring-ndm-ink/[.07]">
            <span className="min-w-0">
              <span className="block font-inter text-[14.5px] font-medium leading-[1.3] text-ndm-ink">{x.name}</span>
              <span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">{x.label} · {x.was ? <><s className="mr-1">{money(x.was)}</s><b className="font-semibold text-ndm-deep">{money(x.price)}</b></> : money(x.price)}</span>
            </span>
            <QtyControl line={x} label={`${x.name}, ${x.label}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const CO_CARD = 'rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(27,36,43,.45)]';
const coWrap = 'relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(168px,16vw,200px)] pb-[clamp(72px,8vw,120px)]';

/* ---------------------------------------------------------------- 1. cart */
function CartPage() {
  const cart = React.useContext(CartCtx);
  const t = totalsOf(cart.lines);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const empty = cart.lines.length === 0;
  return (
    <section aria-labelledby="co-title" className={`co-band ${coWrap}`}>
      <CoHead at={0} lead="Your" strong="cart" text={empty ? null : 'Check your treatments, then continue to checkout. Nothing is charged online: you pay at the clinic.'} />
      {empty ? (
        <div className={`${CO_CARD} mt-10 flex flex-col items-center px-6 py-14 text-center`}>
          <span className="grid size-16 place-items-center rounded-full bg-ndm-mist text-ndm-deep"><IconBag size={26} /></span>
          <p className="mt-5 font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Your cart</p>
          <h2 className="mt-2 font-aeonik text-[clamp(28px,2.8vw,38px)] font-normal leading-[1.1] tracking-[-0.02em] text-ndm-ink">Your cart is empty</h2>
          <p className="mt-3 max-w-[44ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">Browse treatment packages and prices, or book a free consultation and we’ll recommend a plan for you.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Btn href="pricing.html#prices" v="ink">Browse prices</Btn>
            <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
          </div>
          <div className="mt-12 w-full max-w-[760px] text-left"><CartPairs title="Popular treatments" kicker="Most chosen" /></div>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start">
          <div>
            <div className={`${CO_CARD} px-[clamp(18px,2.4vw,32px)]`}>
              <div className="flex items-baseline justify-between border-b border-ndm-ink/10 py-5">
                <h2 className="font-aeonik text-[22px] font-normal tracking-[-0.01em] text-ndm-ink">Treatments in your cart</h2>
                <span className="font-inter text-[13.5px] text-ndm-muted">{cart.count} {cart.count === 1 ? 'item' : 'items'}</span>
              </div>
              <ul className="divide-y divide-ndm-ink/10" role="list">{cart.lines.map((l) => <CartLine key={l.key} l={l} />)}</ul>
            </div>
          </div>
          {/* the summary and the suggestions stay together; on wide screens the column sticks and scrolls on its own when it is taller than the window */}
          <div className="co-side grid gap-4" data-lenis-prevent="">
          <aside className={`${CO_CARD} p-[clamp(20px,2.4vw,28px)]`} aria-label="Cart summary">
            <h2 className="font-aeonik text-[22px] font-normal tracking-[-0.01em] text-ndm-ink">Summary</h2>
            <div className="mt-3"><SumRows t={t} /></div>
            <details className="co-code mt-4 rounded-[14px] bg-ndm-mist px-4 py-3">
              <summary className="cursor-pointer font-inter text-[14px] font-medium text-ndm-ink">Have a promo code?</summary>
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); setCodeMsg(code.trim() ? 'Thanks. Our team checks promo codes before you pay at the clinic.' : 'Please enter a code.'); }}>
                <input value={code} onChange={(e) => setCode(e.target.value)} aria-label="Promo code" placeholder="Promo code" className={`${fieldCls} h-11`} />
                <Btn as="button" type="submit" v="line" sm>Apply</Btn>
              </form>
              {codeMsg && <p role="status" className="mt-2 font-inter text-[13px] text-ndm-muted">{codeMsg}</p>}
            </details>
            <Btn href="checkout.html" v="ink" block className="mt-5">Proceed to checkout</Btn>
            <p className="mt-2.5 flex items-center justify-center gap-2 font-inter text-[12.5px] text-ndm-muted"><IconLock />Nothing is charged online</p>
            <p className="mt-4 flex items-start gap-2 border-t border-ndm-ink/10 pt-4 font-inter text-[12.5px] leading-[1.45] text-ndm-muted"><IconCheckBadge className="mt-0.5 shrink-0 text-ndm-deep" />Every treatment starts with a free, in-person consultation. You pay at the clinic once your plan is confirmed.</p>
          </aside>
          <div className={`${CO_CARD} p-[clamp(18px,2.2vw,24px)]`}><CartPairs compact max={2} kicker="Before you finish" title="Pairs well with your treatment" /></div>
          </div>
        </div>
      )}
      {/* phones: the total and the next step stay in reach */}
      {!empty && (
        <div data-float-avoid="" className="co-bar fixed inset-x-0 bottom-0 z-[58] flex items-center justify-between gap-4 border-t border-ndm-ink/10 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <span><span className="block font-inter text-[12px] text-ndm-muted">Estimated total</span><span className="font-aeonik text-[22px] leading-none tabular-nums">{money2(t.total)}</span></span>
          <Btn href="checkout.html" v="ink">Checkout</Btn>
        </div>
      )}
    </section>
  );
}

/* the order summary used on the checkout page */
function OrderSummary({ t, lines, scroll }) {
  return (
    <>
      <ul className={`divide-y divide-ndm-ink/10 ${scroll ? 'co-list' : ''}`} role="list" {...(scroll ? { tabIndex: 0, 'aria-label': 'Treatments in your order', 'data-lenis-prevent': '' } : {})}>
        {lines.map((l) => (
          <li key={l.key} className="flex items-start justify-between gap-4 py-3.5">
            <span className="min-w-0">
              <span className="block font-inter text-[14.5px] font-medium leading-[1.3] text-ndm-ink">{l.name}</span>
              <span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">{l.label} · Qty {l.qty}</span>
            </span>
            <span className="shrink-0 text-right font-inter text-[14.5px] tabular-nums text-ndm-ink">{money(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-ndm-ink/10 pt-4"><SumRows t={t} /></div>
    </>
  );
}

/* ---------------------------------------------------------------- 2. checkout */
function CheckoutPage() {
  const cart = React.useContext(CartCtx);
  const t = totalsOf(cart.lines);
  const [apt, setApt] = useState(false);
  const [province, setProvince] = useState('Ontario');
  const [clinic, setClinic] = useState('Uptown');
  const [busy, setBusy] = useState(false);
  const empty = cart.lines.length === 0;
  const legend = 'font-aeonik text-[20px] font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink';
  const label = 'mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80';
  const fld = `${fieldCls} co-fld`;
  const block = 'co-fs';
  const place = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const order = {
      no: 'NDM-' + String(Math.floor(10000 + Math.random() * 90000)), date: new Date().toISOString(),
      lines: cart.lines.map(({ key, cat, name, label: lb, price, was, unit, qty }) => ({ key, cat, name, label: lb, price, was, unit, qty })),
      ...t, first: String(fd.get('first') || '').trim(), clinic, pay: 'Pay at your appointment',
    };
    setBusy(true);
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); localStorage.setItem(CART_KEY, '[]'); } catch (err) { /* storage blocked: the confirmation shows a general message */ }
    setTimeout(() => { window.location.href = 'order-confirmed.html'; }, 450);
  };
  return (
    <section aria-labelledby="co-title" className={`co-band ${coWrap}`}>
      <CoHead at={1} lead="Almost" strong="there" text="Your details are used only to arrange your treatment. Nothing is charged online: you pay at the clinic." />
      {empty ? (
        <div className={`${CO_CARD} mt-10 flex flex-col items-center px-6 py-14 text-center`}>
          <h2 className="font-aeonik text-[clamp(26px,2.6vw,34px)] font-normal leading-[1.15] text-ndm-ink">There is nothing to check out yet</h2>
          <p className="mt-3 max-w-[42ch] font-inter text-[15px] text-ndm-muted">Add a treatment from the price list first.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Btn href="pricing.html#prices" v="ink">Browse prices</Btn><Btn href="cart.html" v="line">Back to cart</Btn></div>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          {/* phones: the order summary folds above the form */}
          <details className={`co-sum ${CO_CARD} px-5 py-4 lg:hidden`}>
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-inter text-[14.5px] font-medium text-ndm-deep">
              <span>Show order summary</span><span className="font-aeonik text-[20px] tabular-nums text-ndm-ink">{money2(t.total)}</span>
            </summary>
            <div className="mt-2"><OrderSummary t={t} lines={cart.lines} /></div>
          </details>

          <form onSubmit={place} className={`${CO_CARD} co-form grid gap-5 p-[clamp(18px,2.4vw,32px)]`}>
            <fieldset className={block}>
              <legend className={legend}>Contact information</legend>
              <p className="mt-0.5 font-inter text-[13px] text-ndm-muted">You are checking out as a guest.</p>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                <label><span className={label}>First name</span><input required name="first" autoComplete="given-name" className={fld} /></label>
                <label><span className={label}>Last name</span><input required name="last" autoComplete="family-name" className={fld} /></label>
                <label className="col-span-2 sm:col-span-1"><span className={label}>Email address</span><input required type="email" name="email" autoComplete="email" className={fld} /></label>
                <label className="col-span-2 sm:col-span-1"><span className={label}>Phone <span className="font-normal text-ndm-muted">(optional)</span></span><input type="tel" name="phone" autoComplete="tel" className={fld} /></label>
              </div>
            </fieldset>

            <fieldset className={block}>
              <legend className={legend}>Billing address</legend>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-6">
                <label className="col-span-2 sm:col-span-4"><span className={label}>Address</span><input required name="address" autoComplete="street-address" className={fld} /></label>
                <label className="col-span-2 sm:col-span-2"><span className={label}>Country</span><input readOnly value="Canada" className={`${fld} bg-ndm-mist text-ndm-muted`} /></label>
                {apt ? (
                  <label className="col-span-2 sm:col-span-6"><span className={label}>Apartment, suite, etc. <span className="font-normal text-ndm-muted">(optional)</span></span><input name="apt" autoComplete="address-line2" className={fld} /></label>
                ) : (
                  <button type="button" onClick={() => setApt(true)} className="justify-self-start font-inter text-[14px] font-medium text-ndm-deep hover:underline col-span-2 sm:col-span-6">+ Add apartment, suite, etc.</button>
                )}
                <label className="col-span-2 sm:col-span-2"><span className={label}>City</span><input required name="city" autoComplete="address-level2" className={fld} /></label>
                <label className="sm:col-span-2"><span className={label}>Province</span>
                  <BookSelect name="province" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Select a province">
                    {PROVINCES.map((x) => <option key={x} className="text-ndm-ink">{x}</option>)}
                  </BookSelect>
                </label>
                <label className="sm:col-span-2"><span className={label}>Postal code</span><input required name="postal" autoComplete="postal-code" className={`${fld} uppercase`} /></label>
              </div>
            </fieldset>

            <fieldset className={block}>
              <legend className={legend}>Your clinic</legend>
              <p className="mt-0.5 font-inter text-[13px] text-ndm-muted">Where you would like your treatment.</p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {CLINICS.map((c) => (
                  <label key={c.name} className={`co-opt ${clinic === c.name ? 'is-on' : ''}`}>
                    <input type="radio" name="clinic" value={c.name} checked={clinic === c.name} onChange={() => setClinic(c.name)} className="mt-1 size-4 shrink-0 accent-[#0F80C3]" />
                    <span><span className="block font-inter text-[14.5px] font-semibold text-ndm-ink">NewDermaMed {c.name}</span><span className="mt-0.5 block font-inter text-[12.5px] leading-[1.45] text-ndm-muted">{c.addr}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={block}>
              <legend className={legend}>Payment</legend>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <label className="co-opt is-on">
                  <input type="radio" name="pay" value="clinic" defaultChecked className="mt-1 size-4 shrink-0 accent-[#0F80C3]" />
                  <span><span className="block font-inter text-[14.5px] font-semibold text-ndm-ink">Pay at your appointment</span><span className="mt-0.5 block font-inter text-[12.5px] leading-[1.45] text-ndm-muted">Nothing is charged online. You pay at the clinic once your provider confirms your plan.</span></span>
                </label>
                <div className="co-opt is-off" aria-disabled="true">
                  <span aria-hidden="true" className="mt-1 size-4 shrink-0 rounded-full border border-ndm-ink/25" />
                  <span><span className="block font-inter text-[15px] font-semibold text-ndm-muted">Card payment online</span><span className="mt-0.5 block font-inter text-[12.5px] leading-[1.45] text-ndm-muted">Not available in this preview.</span></span>
                </div>
              </div>
            </fieldset>

            <fieldset className={block}>
              <legend className={legend}>Additional information</legend>
              <label className="mt-3 block"><span className={label}>Note for our team <span className="font-normal text-ndm-muted">(optional)</span></span>
                <textarea name="note" rows={2} className={`${fld} h-auto resize-none py-2.5`} /></label>
              <p className="mt-2.5 rounded-[12px] bg-ndm-mist px-3.5 py-2.5 font-inter text-[12.5px] leading-[1.5] text-ndm-muted">Please don’t include medical details here. Your provider reviews your health history in person at your consultation.</p>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-ndm-ink/10 pt-5">
              <p className="font-inter text-[13px] leading-[1.55] text-ndm-muted">By placing your order request you agree to our <a href="#/policies" className="text-ndm-deep underline-offset-4 hover:underline">Terms and Conditions</a> and <a href="#/policies" className="text-ndm-deep underline-offset-4 hover:underline">Privacy Policy</a>.</p>
              <Btn as="button" type="submit" v="ink" block disabled={busy}>{busy ? 'Placing your request…' : `Place order request · ${money2(t.total)}`}</Btn>
              <p className="flex items-center justify-center gap-2 font-inter text-[12.5px] text-ndm-muted"><IconLock />Prototype: nothing is charged or sent</p>
            </div>
          </form>

          <aside className="co-side grid gap-4" aria-label="Order summary" data-lenis-prevent="">
            <div className={`${CO_CARD} hidden p-[clamp(20px,2.4vw,28px)] lg:block`}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">Order summary</h2>
                <a href="cart.html" className="font-inter text-[13.5px] font-medium text-ndm-deep hover:underline">Edit cart</a>
              </div>
              <div className="mt-3"><OrderSummary t={t} lines={cart.lines} scroll /></div>
            </div>
            <div className={`${CO_CARD} p-[clamp(18px,2.2vw,24px)]`}><CartPairs compact max={2} kicker="Before you finish" title="Add to your plan" /></div>
          </aside>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- 3. confirmation */
function ConfirmPage() {
  const [o] = useState(() => { try { return JSON.parse(localStorage.getItem(ORDER_KEY)); } catch (e) { return null; } });
  const date = o ? new Date(o.date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const clinic = o && CLINICS.find((c) => c.name === o.clinic);
  return (
    <section aria-labelledby="co-title" className={`co-band ${coWrap}`}>
      <CheckoutSteps at={2} />
      {!o ? (
        <div className={`${CO_CARD} mt-10 flex flex-col items-center px-6 py-14 text-center`}>
          <h1 id="co-title" className="font-aeonik text-[clamp(30px,3vw,42px)] font-normal leading-[1.1] text-ndm-ink">No recent order request</h1>
          <p className="mt-3 max-w-[44ch] font-inter text-[15px] text-ndm-muted">Your order requests show here right after you place them.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Btn href="pricing.html#prices" v="ink">Browse prices</Btn><Btn href="index.html" v="line">Back to home</Btn></div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          <div className={`${CO_CARD} p-[clamp(22px,3vw,44px)]`}>
            <span aria-hidden="true" className="co-tick grid size-[72px] place-items-center rounded-full bg-ndm-deep text-white"><IconTick size={30} /></span>
            <TwoTone as="h1" id="co-title" className="mt-6" size="text-[clamp(34px,3.6vw,54px)]" lead={<>Thank you{o.first ? `, ${o.first}` : ''},<br /></>} strong="your request is in" />
            <p className="mt-4 max-w-[52ch] font-inter text-[16px] leading-[1.65] text-ndm-muted">We have your order request. Our team contacts you within one business day to book your visit{clinic ? ` at NewDermaMed ${clinic.name}` : ''}. Nothing has been charged.</p>
            <dl className="mt-7 grid grid-cols-2 overflow-hidden rounded-[18px] border border-ndm-line bg-ndm-line [gap:1px] sm:grid-cols-4">
              {[['Order number', o.no], ['Date', date], ['Total', money2(o.total)], ['Payment', o.pay]].map(([k, v]) => (
                <div key={k} className="bg-white px-4 py-3.5"><dt className="font-inter text-[12px] text-ndm-muted">{k}</dt><dd className="mt-1 font-inter text-[14.5px] font-medium leading-[1.35] text-ndm-ink">{v}</dd></div>
              ))}
            </dl>
            <h2 className="mt-10 font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">What happens next</h2>
            <ol className="mt-4 grid gap-3" role="list">
              {[
                ['We call you', 'Within one business day, to find a time for your free consultation and treatment.'],
                ['Your consultation', 'Your provider confirms your plan in person. Treatments are given only when they suit you.'],
                ['Pay at the clinic', 'You pay at your appointment. Individual results may vary.'],
              ].map(([h, d], i) => (
                <li key={h} className="flex items-start gap-4 rounded-[16px] bg-ndm-paper px-4 py-3.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ndm-deep/10 font-inter text-[13px] font-semibold text-ndm-deep">{i + 1}</span>
                  <span><span className="block font-inter text-[15px] font-semibold text-ndm-ink">{h}</span><span className="mt-0.5 block font-inter text-[14px] leading-[1.5] text-ndm-muted">{d}</span></span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3"><Btn href="index.html" v="ink">Back to home</Btn><Btn href="pricing.html#prices" v="line">Browse more treatments</Btn></div>
          </div>
          <aside className="grid gap-4 lg:sticky lg:top-[140px]">
            <div className={`${CO_CARD} p-[clamp(20px,2.4vw,28px)]`}>
              <h2 className="font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">Order details</h2>
              <div className="mt-3"><OrderSummary t={o} lines={o.lines} /></div>
            </div>
            {clinic && (
              <div className={`${CO_CARD} p-[clamp(20px,2.4vw,28px)]`}>
                <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-deep">Your clinic</p>
                <p className="mt-2 font-aeonik text-[21px] leading-[1.2] text-ndm-ink">NewDermaMed {clinic.name}</p>
                <p className="mt-1 font-inter text-[14px] leading-[1.5] text-ndm-muted">{clinic.addr}</p>
                <div className="mt-4"><Btn href={tel(clinic.phone)} v="line" sm>Call {clinic.phone}</Btn></div>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
