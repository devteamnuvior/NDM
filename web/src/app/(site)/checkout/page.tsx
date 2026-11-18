import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPage } from "@/components/checkout/checkout-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getCartPairs } from "@/lib/cart-pairs";
import { pageLink } from "@/lib/routes";
import { getPaymentOptions } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Checkout, NewDermaMed Toronto",
  description: "Place your order request. Pay online by card or at the clinic.",
  robots: { index: false, follow: false },
};

/** The suggestions carry WooCommerce's current prices, and card payment is offered only while the
 * gateway is switched on in WooCommerce: both are read on the server, on every visit. */
async function Content() {
  const [pairs, payments] = await Promise.all([getCartPairs(), getPaymentOptions()]);
  return <CheckoutPage pairs={pairs} card={payments.card} />;
}

export default function Page() {
  return (
    <main id="main" data-shell="inner" data-page="cart">
      <Breadcrumb items={[["Pricing", pageLink("pricing")], ["Cart", pageLink("cart")], "Checkout"]} />
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </main>
  );
}
