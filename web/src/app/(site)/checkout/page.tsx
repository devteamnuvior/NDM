import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPage } from "@/components/checkout/checkout-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getCartPairs } from "@/lib/cart-pairs";
import { pageLink } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Checkout, NewDermaMed Toronto",
  description: "Place your order request. You pay at the clinic.",
  robots: { index: false, follow: false },
};

/** The suggestions carry WooCommerce's current prices, so they are read on the server. */
async function Content() {
  return <CheckoutPage pairs={await getCartPairs()} />;
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
