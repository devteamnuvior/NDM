"use client";

import { useCart } from "@/hooks/use-cart";
import { CART_MAX, money, type CartLine } from "@/lib/cart";
import { byId } from "@/lib/dom";
import { firstShown, flyTo } from "@/lib/fly-to";

const Icon = ({ d, w = "1.6" }: { d: string; w?: string }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPlus = () => <Icon d="M8 3v10M3 8h10" />;
const IconMinus = () => <Icon d="M3 8h10" />;
const IconTrash = () => <Icon d="M2.5 4h11M6.5 4V2.6h3V4M4 4l.7 9.4h6.6L12 4M6.6 6.5v4.5M9.4 6.5v4.5" w="1.3" />;

/** Where an added option flies: the floating cart bar when it is on screen, else the header's cart count. */
const cartTarget = () => firstShown(byId("cart-pill-count"), byId("cart-head-count"));

/**
 * Add to cart, which turns into a quantity stepper once the option is in the cart. With `fly`, adding sends a
 * ticket with the option's name and price into the cart (lib/fly-to.ts).
 */
export function QtyControl({ line, label, fly }: { line: Omit<CartLine, "qty">; label: string; fly?: boolean }) {
  const cart = useCart();
  const q = cart.qtyOf(line.key);
  if (!q) {
    return (
      <button
        type="button"
        onClick={(e) => {
          cart.setQty(line, 1);
          if (fly) flyTo(e.currentTarget, { name: line.name, price: `${money(line.code && line.code < line.price ? line.code : line.price)}${line.unit ?? ""}`, target: cartTarget });
        }} aria-label={`Add ${label} to cart`} className="btn btn-sm btn-buy pr-add">
        <span>Add to cart</span>
      </button>
    );
  }
  return (
    <div className="pr-qty" role="group" aria-label={`Quantity, ${label}`}>
      <button type="button" onClick={() => cart.setQty(line, q - 1)} aria-label={q === 1 ? `Remove ${label} from cart` : `One less, ${label}`}>
        {q === 1 ? <IconTrash /> : <IconMinus />}
      </button>
      <output aria-live="polite">{q}</output>
      <button type="button" onClick={() => cart.setQty(line, Math.min(CART_MAX, q + 1))} disabled={q >= CART_MAX} aria-label={`One more, ${label}`}>
        <IconPlus />
      </button>
    </div>
  );
}
