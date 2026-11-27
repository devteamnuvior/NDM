import type { Metadata } from "next";

/** The management area: for signed-in administrators only, never for search engines, with no site header or footer. */
export const metadata: Metadata = {
  title: "Pricing manager, NewDermaMed",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function ManageLayout({ children }: LayoutProps<"/manage">) {
  return children;
}
