/* ---------------------------------------------------------------- my account (account.html, round 29)
   After the NUVIOR account sample (../new website Odoo/nuvior-account_3.html): the same sidebar and sections, fitted to a patient of
   the clinic. Nuvicoin becomes the NDM Premium membership; B2B verification becomes health and consent forms (status only: no
   health information is ever shown or stored here, PHIPA); reorder lists become saved treatment plans. Prototype with sample data
   only (a made-up member, "Alex M."): nothing is loaded from or sent to a server. Figures marked "To confirm" wait for the clinic. */
const ACC_TABS = [
  ['dashboard', 'Dashboard'], ['plans', 'My plans & saved treatments'], ['orders', 'Orders & receipts'], ['payment', 'Payment methods', 'Soon'],
  ['membership', 'Premium membership'], ['wishlist', 'Wishlist'], ['forms', 'Health & consent forms'], ['details', 'Account details'],
];
const ACC_ORDERS = [
  ['NDM-20418', 'Nov 3, 2026', 'Microneedling-Face, package of 3', 735, 'Booked', 'Uptown'],
  ['NDM-20377', 'Oct 12, 2026', 'Age Element Facial, single session', 249, 'Completed', 'Downtown'],
  ['NDM-20290', 'Sep 21, 2026', 'Activ Retinol 0.5, 30 ml (shop)', 0, 'Delivered', 'Online'],
];
const accTodo = (t = 'To confirm') => <span className="acc-todo">{t}</span>;
function AccCard({ children, className = '' }) { return <div className={`rounded-[24px] bg-white p-[clamp(18px,2.2vw,28px)] ring-1 ring-ndm-ink/[.06] shadow-[0_24px_50px_-42px_rgba(27,36,43,.45)] ${className}`}>{children}</div>; }
function AccHead({ k, title, text }) {
  return (
    <div className="mb-5">
      <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">{k}</p>
      <h2 className="mt-1.5 font-aeonik text-[clamp(28px,2.6vw,38px)] font-normal leading-[1.08] tracking-[-0.025em] text-ndm-ink">{title}</h2>
      {text && <p className="mt-2 max-w-[60ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>}
    </div>
  );
}
function AccStatus({ s }) { const tone = s === 'Completed' || s === 'Delivered' || s === 'Approved' || s === 'Complete' ? 'is-ok' : s === 'Booked' || s === 'Active' ? 'is-on' : 'is-wait'; return <span className={`acc-status ${tone}`}>{s}</span>; }
function AccOrders({ rows }) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse font-inter text-[14px]">
        <thead><tr className="text-left text-[12px] uppercase tracking-[.12em] text-ndm-muted">{['Order', 'Date', 'Items', 'Clinic', 'Total', 'Status', ''].map((h) => <th key={h} className="border-b border-ndm-line pb-2.5 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map(([no, d, it, tot, st, cl]) => (
          <tr key={no} className="border-b border-ndm-line last:border-0">
            <td className="py-3.5 font-medium text-ndm-ink">{no}</td><td className="py-3.5 text-ndm-muted">{d}</td><td className="py-3.5 text-ndm-ink">{it}</td><td className="py-3.5 text-ndm-muted">{cl}</td>
            <td className="py-3.5 tabular-nums text-ndm-ink">{tot ? money(tot) : accTodo('Shop order')}</td><td className="py-3.5"><AccStatus s={st} /></td>
            <td className="py-3.5 text-right"><a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-ndm-deep hover:underline">Receipt</a></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function AccountPage() {
  const [tab, setTab] = useState(() => { const h = (window.location.hash || '').slice(1); return ACC_TABS.some(([k]) => k === h) ? h : 'dashboard'; });
  const go = (k) => { setTab(k); try { history.replaceState(null, '', '#' + k); } catch (e) {} window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); };
  const [plan] = useState(() => { try { return JSON.parse(localStorage.getItem('ndm-bf-plan') || '[]'); } catch (e) { return []; } });
  const [wish, setWish] = useState(() => PRODUCTS.slice(0, 6));
  const [notes, setNotes] = useState({ orders: true, offers: false, news: true, events: false });
  const label = 'mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80';
  const fld = `${fieldCls} co-fld`;
  return (
    <section aria-labelledby="acc-title" className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)]">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TwoTone as="h1" id="acc-title" size="text-[clamp(40px,4.6vw,64px)]" lead={<>My<br /></>} strong="account" />
          <p className="font-inter text-[14px] text-ndm-muted">Signed in as <b className="font-semibold text-ndm-ink">Alex M.</b> · <a href="#" onClick={(e) => e.preventDefault()} className="text-ndm-deep hover:underline">Sign out</a></p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <nav aria-label="Account" className="acc-side no-scrollbar -mx-[var(--gx)] flex gap-2 overflow-x-auto px-[var(--gx)] lg:sticky lg:top-[150px] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-[22px] lg:bg-white lg:p-2 lg:ring-1 lg:ring-ndm-ink/[.06]">
            {ACC_TABS.map(([k, t, soon]) => (
              <button key={k} type="button" onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined} className={`acc-link shrink-0 ${tab === k ? 'is-on' : ''}`}>
                <span>{t}</span>{k === 'wishlist' && <span className="acc-count">{wish.length}</span>}{soon && <span className="acc-soon">{soon}</span>}
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            {tab === 'dashboard' && (<>
              <AccHead k="Dashboard" title="Welcome back, Alex" text="Your appointments, plans, orders and membership in one place." />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[['Next appointment', 'Nov 18', 'Uptown, 10:30 am', 'plans'], ['Premium membership', 'Active', 'Member since Jan 2026', 'membership'], ['Saved plans', String(1 + (plan.length ? 1 : 0)), 'Ready to book', 'plans'], ['Health forms', 'Complete', 'Reviewed at your visit', 'forms']].map(([k, v, d, to]) => (
                  <button key={k} type="button" onClick={() => go(to)} className="acc-tile text-left">
                    <span className="font-inter text-[12.5px] text-ndm-muted">{k}</span>
                    <span className="mt-2 block font-aeonik text-[30px] leading-none tracking-[-0.03em] text-ndm-ink">{v}</span>
                    <span className="mt-1.5 block font-inter text-[13px] text-ndm-muted">{d}</span>
                  </button>
                ))}
              </div>
              <AccCard className="mt-5">
                <div className="mb-3 flex items-center justify-between"><h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Recent orders &amp; receipts</h3><button type="button" onClick={() => go('orders')} className="font-inter text-[14px] font-medium text-ndm-deep hover:underline">View all</button></div>
                <AccOrders rows={ACC_ORDERS.slice(0, 2)} />
              </AccCard>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <AccCard>
                  <h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Upcoming appointment</h3>
                  <p className="mt-2 font-inter text-[15px] text-ndm-ink">Microneedling-Face, session 1 of 3</p>
                  <p className="mt-1 font-inter text-[14px] text-ndm-muted">Tuesday, November 18 · 10:30 am · Uptown clinic</p>
                  <div className="mt-5 flex flex-wrap gap-2.5"><Btn href="#/book" v="ink" sm>Reschedule</Btn><Btn href="#/book" v="line" sm>Add to calendar</Btn></div>
                </AccCard>
                <AccCard className="acc-member-mini">
                  <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-white/70">Premium membership</p>
                  <p className="mt-2 font-aeonik text-[26px] leading-[1.1] text-white">Member pricing on your plan</p>
                  <p className="mt-2 font-inter text-[14px] text-white/75">See your benefits and renewal date.</p>
                  <button type="button" onClick={() => go('membership')} className="btn btn-glass btn-sm mt-5">Open membership</button>
                </AccCard>
              </div>
            </>)}

            {tab === 'plans' && (<>
              <AccHead k="My plans & saved treatments" title="Book again in a tap" text="Treatment plans you saved, and packages with sessions left." />
              <div className="grid gap-4 md:grid-cols-2">
                <AccCard>
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Microneedling-Face</h3><p className="mt-1 font-inter text-[13.5px] text-ndm-muted">Package of 3 · 2 sessions left</p></div><AccStatus s="Active" /></div>
                  <div className="acc-meter mt-5" aria-label="1 of 3 sessions used"><i style={{ width: '33%' }} /></div>
                  <div className="mt-5 flex flex-wrap gap-2.5"><Btn href="#/book" v="book" hot sm>Book Free Consultation</Btn><Btn href="pricing.html#pg-microneedling-h" v="line" sm>View prices</Btn></div>
                </AccCard>
                <AccCard>
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Black Friday plan</h3><p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{plan.length ? `${plan.length} treatments, ${money(plan.reduce((n, x) => n + x.price, 0))}` : 'Build one on the Black Friday page'}</p></div><AccStatus s={plan.length ? 'Saved' : 'Empty'} /></div>
                  {plan.length > 0 && <ul className="mt-4 grid gap-1.5 font-inter text-[13.5px] text-ndm-ink" role="list">{plan.slice(0, 4).map((x) => <li key={x.key}>{x.cat} · {x.item}</li>)}</ul>}
                  <div className="mt-5 flex flex-wrap gap-2.5"><Btn href="black-friday-sale.html#plan" v="ink" sm>{plan.length ? 'Open my plan' : 'See the deals'}</Btn></div>
                </AccCard>
              </div>
            </>)}

            {tab === 'orders' && (<>
              <AccHead k="Orders & receipts" title="Your orders" text="Treatment requests from the cart and orders from the skincare shop." />
              <AccCard>
                <div className="mb-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
                  <input type="search" placeholder="Search orders" className={fld} aria-label="Search orders" />
                  <BookSelect value="All" onChange={() => {}} placeholder="Status">{['All', 'Booked', 'Completed', 'Delivered'].map((x) => <option key={x} className="text-ndm-ink">{x}</option>)}</BookSelect>
                  <BookSelect value="This year" onChange={() => {}} placeholder="Date range">{['This year', 'Last 90 days', 'All time'].map((x) => <option key={x} className="text-ndm-ink">{x}</option>)}</BookSelect>
                </div>
                <AccOrders rows={ACC_ORDERS} />
              </AccCard>
            </>)}

            {tab === 'payment' && (<>
              <AccHead k="Payment methods" title="Coming soon" text="Treatments are paid at your appointment for now. Saved cards and financing will appear here." />
              <AccCard><p className="font-inter text-[15px] text-ndm-muted">Flexible payment plans are available through Affirm at the clinic, for Canadian residents aged 19 and over, with a minimum $500 purchase.</p></AccCard>
            </>)}

            {tab === 'membership' && (<>
              <AccHead k="Premium membership" title="Your NewDermaMed membership" text="A membership for our patients, used only at our Uptown and Downtown clinics." />
              <div className="acc-member relative overflow-hidden rounded-[28px] p-[clamp(22px,3vw,40px)] text-white">
                <span aria-hidden="true" className="acc-member-glow" />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/70">NewDermaMed Premium</p>
                    <p className="mt-3 font-aeonik text-[clamp(34px,3.4vw,48px)] leading-none tracking-[-0.03em]">Alex M.</p>
                    <p className="mt-2 font-inter text-[14px] text-white/75">Member since January 2026 · Renews {accTodo('date')}</p>
                  </div>
                  <AccStatus s="Active" />
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[['Member pricing', 'Pricing on selected treatments and packages.'], ['Priority booking', 'Earlier access to appointment times.'], ['Skincare savings', 'Savings on clinic skincare from our shop.']].map(([t, d]) => (
                  <AccCard key={t}><h3 className="font-aeonik text-[21px] font-normal text-ndm-ink">{t}</h3><p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-muted">{d}</p><p className="mt-3">{accTodo()}</p></AccCard>
                ))}
              </div>
              <AccCard className="mt-5">
                <h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Membership history</h3>
                <div className="no-scrollbar mt-3 overflow-x-auto"><table className="w-full min-w-[520px] font-inter text-[14px]"><thead><tr className="text-left text-[12px] uppercase tracking-[.12em] text-ndm-muted">{['Date', 'Description', 'Type'].map((h) => <th key={h} className="border-b border-ndm-line pb-2.5 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>{[['Jan 8, 2026', 'Membership started', 'Joined'], ['Nov 3, 2026', 'Member pricing on Microneedling package', 'Benefit']].map((r) => <tr key={r[1]} className="border-b border-ndm-line last:border-0">{r.map((c, i) => <td key={i} className="py-3 text-ndm-ink">{c}</td>)}</tr>)}</tbody></table></div>
                <p className="mt-4 font-inter text-[13px] text-ndm-muted">Membership price, benefits and terms are being finalised by the clinic {accTodo()}</p>
              </AccCard>
            </>)}

            {tab === 'wishlist' && (<>
              <AccHead k="Wishlist" title={`${wish.length} saved products`} text="Clinic skincare you saved from our online shop." />
              {wish.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {wish.map(([n, sz, img, sl]) => (
                    <div key={sl} className="flex items-center gap-3 rounded-[18px] bg-white p-3 ring-1 ring-ndm-ink/[.06]">
                      <span className="grid size-[68px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-ndm-mist"><img src={SHOP_IMG + img} alt="" loading="lazy" className="h-[86%] w-[86%] object-contain" /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate font-inter text-[14.5px] capitalize text-ndm-ink">{n}</span><span className="block font-inter text-[13px] text-ndm-muted">{sz}</span>
                        <span className="mt-1.5 flex gap-3 font-inter text-[13px]"><a href={`https://shop.newdermamedlaserclinic.com/product/${sl}/`} target="_blank" rel="noopener" className="font-medium text-ndm-deep hover:underline">Shop</a><button type="button" onClick={() => setWish(wish.filter((x) => x[3] !== sl))} className="text-ndm-muted hover:text-ndm-ink">Remove</button></span></span>
                    </div>
                  ))}
                </div>
              ) : <AccCard><p className="font-inter text-[15px] text-ndm-muted">Your wishlist is empty. <button type="button" onClick={() => setWish(PRODUCTS.slice(0, 6))} className="text-ndm-deep hover:underline">Restore sample items (prototype only)</button></p></AccCard>}
            </>)}

            {tab === 'forms' && (<>
              <AccHead k="Health & consent forms" title="Before your treatment" text="Status only. Your health history is reviewed in person by your provider and is never shown here." />
              <div className="grid gap-3">
                {[['Medical history form', 'Reviewed with your provider at your first visit', 'Complete'], ['Treatment consent', 'Signed at the clinic for each treatment', 'Complete'], ['Photo consent', 'Optional, for your own before and after record', 'Not given'], ['Communication preferences (CASL)', 'Manage below in Account details', 'Set']].map(([t, d, s]) => (
                  <AccCard key={t} className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-inter text-[15.5px] font-semibold text-ndm-ink">{t}</h3><p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{d}</p></div><AccStatus s={s} /></AccCard>
                ))}
              </div>
              <p className="mt-4 font-inter text-[13px] text-ndm-muted">Questions about your records? See our <a href="privacy.html" className="text-ndm-deep hover:underline">Privacy Policy</a>.</p>
            </>)}

            {tab === 'details' && (<>
              <AccHead k="Account details" title="Your profile" />
              <form onSubmit={(e) => e.preventDefault()} className="grid gap-5">
                <AccCard>
                  <h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Profile</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label><span className={label}>First name</span><input defaultValue="Alex" className={fld} /></label>
                    <label><span className={label}>Last name</span><input defaultValue="M." className={fld} /></label>
                    <label><span className={label}>Email</span><input type="email" defaultValue="alex@example.com" className={fld} /></label>
                    <label><span className={label}>Phone</span><input type="tel" defaultValue="" placeholder="Optional" className={fld} /></label>
                    <label className="sm:col-span-2"><span className={label}>Preferred clinic</span><BookSelect value="Uptown" onChange={() => {}} placeholder="Clinic">{CLINICS.map((c) => <option key={c.name} className="text-ndm-ink">{c.name}</option>)}</BookSelect></label>
                  </div>
                  <div className="mt-5"><Btn as="button" type="submit" v="ink" sm>Save changes</Btn></div>
                </AccCard>
                <AccCard>
                  <h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Password</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">{['Current password', 'New password', 'Confirm new password'].map((x) => <label key={x}><span className={label}>{x}</span><input type="password" autoComplete="off" className={fld} /></label>)}</div>
                  <div className="mt-5"><Btn as="button" type="submit" v="line" sm>Update password</Btn></div>
                </AccCard>
                <AccCard>
                  <h3 className="font-aeonik text-[22px] font-normal text-ndm-ink">Notifications</h3>
                  <ul className="mt-3 divide-y divide-ndm-line" role="list">
                    {[['orders', 'Appointment and order updates', 'Confirmations and reminders. Always on for booked appointments.', true], ['offers', 'Offers and promotions (CASL consent)', 'Commercial electronic messages. You can withdraw consent at any time.'], ['news', 'Newsletter', 'Skincare tips and clinic news, once a month.'], ['events', 'Events', 'Invitations to clinic events and open days.']].map(([k, t, d, lock]) => (
                      <li key={k} className="flex items-start justify-between gap-4 py-3.5">
                        <span><span className="block font-inter text-[15px] font-medium text-ndm-ink">{t}</span><span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">{d}</span></span>
                        <button type="button" role="switch" aria-checked={notes[k]} disabled={lock} onClick={() => setNotes({ ...notes, [k]: !notes[k] })} className={`acc-switch ${notes[k] ? 'is-on' : ''}`}><i /></button>
                      </li>
                    ))}
                  </ul>
                </AccCard>
              </form>
            </>)}
          </div>
        </div>
        <p className="mt-10 font-inter text-[12.5px] text-ndm-muted">Prototype: sample account data only. Nothing is loaded from or sent to a server.</p>
      </div>
    </section>
  );
}
