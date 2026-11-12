import type { PageId } from "@/config/routes";

/** The legal documents: titles, and each one's "On this page" list ([heading id, label]). */

export type LegalDocId = "privacy" | "terms" | "refunds";

export const LEGAL_DOCS: { id: LegalDocId; page: PageId; label: string }[] = [
  { id: "privacy", page: "privacy", label: "Privacy Policy" },
  { id: "terms", page: "terms", label: "Terms of Service" },
  { id: "refunds", page: "refunds", label: "Refunds & Cancellations" },
];

export const LEGAL: Record<LegalDocId, { lead: string; strong: string; toc: [id: string, label: string][] }> = {
  privacy: {
    lead: "Privacy",
    strong: "Policy",
    toc: [["s1", "Confidentiality and Security"], ["s2", "Purposes"], ["s3", "Information We Disclose"], ["s4", "Consent"], ["s5", "SMS Messaging"], ["s6", "Sharing Your Information"], ["s7", "Your Rights"], ["s8", "Contact"]],
  },
  terms: {
    lead: "Terms of",
    strong: "Service",
    toc: [["t1", "Medical Information"], ["t2", "Using the Site"], ["t3", "Bookings and Prices"], ["t4", "Promotions"], ["t5", "Payments"], ["t6", "Products"], ["t7", "Content and Links"], ["t8", "Liability"], ["t9", "Privacy"], ["t10", "Governing Law"], ["t11", "Contact"]],
  },
  refunds: {
    lead: "Refunds &",
    strong: "Cancellations",
    toc: [["r1", "Consultations"], ["r2", "Changing a Treatment"], ["r3", "Treatments Received"], ["r4", "Packages"], ["r5", "Gift Cards"], ["r6", "Product Returns"], ["r7", "How Refunds Are Paid"], ["r8", "Your Rights"], ["r9", "Contact"]],
  },
};

export const LEGAL_UPDATED = "November 2026";
