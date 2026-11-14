import type { Metadata } from "next";
import { RefundsBody } from "@/components/legal/bodies";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy, NewDermaMed Toronto",
  description: "How appointment changes, deposits, packages, gift cards and product returns work at NewDermaMed.",
};

export default function Page() {
  return (
    <LegalPage doc="refunds">
      <RefundsBody />
    </LegalPage>
  );
}
