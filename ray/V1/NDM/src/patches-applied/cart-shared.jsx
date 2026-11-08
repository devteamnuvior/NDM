const money = (n) => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

/* ---------------------------------------------------------------- cart (kept in this browser only; the clinic store takes over at checkout) */
const CartCtx = React.createContext(null);
const CART_KEY = 'ndm-cart';
const CART_MAX = 20;
function useCartState() {
  const [lines, setLines] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem(CART_KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  });
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch (e) { /* storage blocked: the cart lasts for this visit */ } }, [lines]);
  const setQty = (line, qty) => setLines((ls) => {
    const i = ls.findIndex((l) => l.key === line.key);
    if (qty <= 0) return ls.filter((l) => l.key !== line.key);
    if (i < 0) return [...ls, { ...line, qty }];
    const next = ls.slice(); next[i] = { ...next[i], qty }; return next;
  });
  const qtyOf = (key) => { const l = lines.find((x) => x.key === key); return l ? l.qty : 0; };
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const saved = lines.reduce((n, l) => n + (l.was ? l.qty * (l.was - l.price) : 0), 0);
  return { lines, setQty, qtyOf, count, total, saved };
}

const IconPlusSm = () => <Svg size={16} vb="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Svg>;
const IconMinusSm = () => <Svg size={16} vb="0 0 16 16"><path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Svg>;
const IconTrash = () => <Svg size={16} vb="0 0 16 16"><path d="M2.5 4h11M6.5 4V2.6h3V4M4 4l.7 9.4h6.6L12 4M6.6 6.5v4.5M9.4 6.5v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></Svg>;

/* Add to cart turns into a quantity stepper once the option is in the cart */
function QtyControl({ line, label }) {
  const cart = React.useContext(CartCtx);
  const q = cart.qtyOf(line.key);
  if (!q) {
    return <button type="button" onClick={() => cart.setQty(line, 1)} aria-label={`Add ${label} to cart`} className="btn btn-sm btn-buy pr-add"><span>Add to cart</span></button>;
  }
  return (
    <div className="pr-qty" role="group" aria-label={`Quantity, ${label}`}>
      <button type="button" onClick={() => cart.setQty(line, q - 1)} aria-label={q === 1 ? `Remove ${label} from cart` : `One less, ${label}`}>{q === 1 ? <IconTrash /> : <IconMinusSm />}</button>
      <output aria-live="polite">{q}</output>
      <button type="button" onClick={() => cart.setQty(line, Math.min(CART_MAX, q + 1))} disabled={q >= CART_MAX} aria-label={`One more, ${label}`}><IconPlusSm /></button>
    </div>
  );
}

/* ---------------------------------------------------------------- cart drawer (header bag on every page) */
function CartDrawer({ open, onClose, onBrowse }) {
  const cart = React.useContext(CartCtx);
  const closeBtn = useRef(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeBtn.current && closeBtn.current.focus({ preventScroll: true }), 80);
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { clearTimeout(t); window.removeEventListener('keydown', k); };
  }, [open]);
  const n = cart.count;
  return (
    <div className={`fixed inset-0 z-[76] overflow-hidden ${open ? 'visible' : 'invisible pointer-events-none'}`} style={{ visibility: open ? 'visible' : 'hidden', transition: `visibility 0s linear ${open ? '0s' : '.5s'}` }} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-[#0B0F13]/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside role="dialog" aria-modal="true" aria-labelledby="cart-title"
        className="absolute right-0 top-0 flex h-[100dvh] w-full flex-col bg-ndm-paper text-ndm-ink transition-transform duration-500 sm:w-[480px]"
        style={{ transform: open ? 'none' : 'translateX(100%)', transitionTimingFunction: 'var(--e-out)' }}>
        <div className="flex items-center justify-between border-b border-ndm-ink/10 px-6 py-5">
          <h2 id="cart-title" className="font-aeonik text-[28px] font-normal leading-none tracking-[-0.02em]">Your cart <span className="ml-1 font-inter text-[14px] tracking-normal text-ndm-muted">{n} {n === 1 ? 'item' : 'items'}</span></h2>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close cart" className="grid size-11 place-items-center rounded-full hover:bg-ndm-mist"><IconClose /></button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-white text-ndm-deep ring-1 ring-ndm-ink/10"><IconBag size={26} /></span>
            <p className="mt-5 font-aeonik text-[24px]">Your cart is empty</p>
            <p className="mt-2 max-w-[30ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">Open any treatment in the price list and choose Add to cart.</p>
            <Btn v="line" sm className="mt-6" onClick={() => { onClose(); onBrowse(); }}>Browse prices</Btn>
          </div>
        ) : (
          <>
            <ul data-lenis-prevent="" className="flex-1 divide-y divide-ndm-ink/10 overflow-y-auto overscroll-contain px-6" role="list">
              {cart.lines.map((l) => (
                <li key={l.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-4">
                  <div className="min-w-0">
                    <p className="font-inter text-[12px] uppercase tracking-[.12em] text-ndm-muted">{l.cat}</p>
                    <p className="mt-1 font-aeonik text-[18px] leading-[1.25] tracking-[-0.01em]">{l.name}</p>
                    <p className="mt-0.5 font-inter text-[14px] text-ndm-muted">{l.label} · {money(l.price)}{l.unit}</p>
                  </div>
                  <p className="text-right">
                    {l.was ? <s className="pr-was block"><span className="sr-only">Regular price </span>{money(l.was * l.qty)}</s> : null}
                    <span className={`block font-aeonik text-[20px] leading-tight ${l.was ? 'text-ndm-deep' : ''}`}>{money(l.price * l.qty)}</span>
                  </p>
                  <div className="col-span-2 flex items-center justify-between">
                    <QtyControl line={l} label={`${l.name}, ${l.label}`} />
                    <button type="button" onClick={() => cart.setQty(l, 0)} className="font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:text-ndm-ink hover:underline">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="shrink-0 border-t border-ndm-ink/10 bg-white px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
              {cart.saved > 0 && (
                <p className="flex items-baseline justify-between font-inter text-[13.5px] text-ndm-deep"><span>You save</span><span className="font-semibold tabular-nums">{money(cart.saved)}</span></p>
              )}
              <p className="mt-0.5 flex items-baseline justify-between"><span className="font-inter text-[14.5px]">Subtotal</span><span className="font-aeonik text-[22px] tracking-[-0.02em] tabular-nums">{money(cart.total)}</span></p>
              <p className="mt-1.5 font-inter text-[12px] leading-[1.45] text-ndm-muted">Taxes added at checkout. Your plan is confirmed at a free consultation. Affirm payments available on orders of $500 or more (Canadian citizens and residents, 19+).</p>
              <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-3">
                <Btn href="#/checkout" v="ink" block className="btn-buy">Checkout</Btn>
                <button type="button" onClick={onClose} className="px-2 font-inter text-[14px] text-ndm-ink underline-offset-4 hover:underline">Continue browsing</button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

