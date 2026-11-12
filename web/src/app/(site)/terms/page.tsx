import type { Metadata } from "next";
import { TermsBody } from "@/components/legal/bodies";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service, NewDermaMed Toronto",
  description: "The terms for using the NewDermaMed website, online booking and online shop.",
};

export default function Page() {
  return (
    <LegalPage doc="terms">
      <TermsBody />
    </LegalPage>
  );
}
