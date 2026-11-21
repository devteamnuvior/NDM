import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPage } from "@/components/checkout/cart-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getCartPairs } from "@/lib/cart-pairs";
import { pageLink } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Your cart, NewDermaMed Toronto",
  description: "Review the treatments in your cart before checkout.",
  robots: { index: false, follow: false },
};

/** The suggestions carry WooCommerce's current prices, so they are read on the server. */
async function Content() {
  return <CartPage pairs={await getCartPairs()} />;
}

export default function Page() {
  return (
    <main id="main" data-shell="inner" data-page="cart">
      <Breadcrumb items={[["Pricing", pageLink("pricing")], "Cart"]} />
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </main>
  );
}
