import type { Metadata } from "next";
import { notFound } from "next/navigation";

/*
 * The earlier VIP Sale design was parked here on 2026-11-18, when the redesigned page took over /vip-sale. Since
 * the same day (user) the address answers "not found" for everyone: the design itself is still in
 * components/sale/sale-page.tsx (the Black Friday page uses it), so it can be shown again from there.
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function VipSaleEarlierRoute() {
  notFound();
}
