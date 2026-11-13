import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/account/account-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ACCOUNT_ORDERS, type AccountOrderRow } from "@/config/account";
import { getSitePrices } from "@/lib/site-prices";

export const metadata: Metadata = {
  title: "My account, NewDermaMed Toronto",
  description: "Your NewDermaMed account: appointments, plans, orders, membership and preferences.",
  robots: { index: false, follow: false },
};

const same = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The sample orders with their totals: each one is the WooCommerce price of the treatment and option it names. */
async function Content() {
  const prices = await getSitePrices();
  const orders: AccountOrderRow[] = ACCOUNT_ORDERS.map((order) => {
    const priced = order.priced;
    const item = priced && prices?.categories.flatMap((c) => c.items).find((it) => same(it.name, priced.item));
    const option = priced && item ? item.options.find((o) => same(o.label, priced.option)) : undefined;
    return { ...order, total: option?.price ?? null };
  });
  return <AccountPage orders={orders} />;
}

export default function Page() {
  return (
    <main id="main" data-shell="inner" data-page="account" className="pt-[176px] xl:pt-[204px]">
      <Breadcrumb items={["My account"]} />
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </main>
  );
}
