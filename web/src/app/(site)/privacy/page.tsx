import type { Metadata } from "next";
import { PrivacyBody } from "@/components/legal/bodies";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy, NewDermaMed Toronto",
  description: "How NewDermaMed collects, uses and discloses personal information, including personal health information.",
};

export default function Page() {
  return (
    <LegalPage doc="privacy">
      <PrivacyBody />
    </LegalPage>
  );
}
