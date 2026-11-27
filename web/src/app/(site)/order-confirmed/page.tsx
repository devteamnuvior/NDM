import type { Metadata } from "next";
import { ConfirmPage } from "@/components/checkout/confirm-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { pageLink } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Order request received, NewDermaMed Toronto",
  description: "Your order request has been received.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main id="main" data-shell="inner" data-page="cart">
      <Breadcrumb items={[["Pricing", pageLink("pricing")], "Order received"]} />
      <ConfirmPage />
    </main>
  );
}
