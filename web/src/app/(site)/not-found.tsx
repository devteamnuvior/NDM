import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found/not-found-view";

export const metadata: Metadata = {
  title: "Page not found | NewDermaMed",
  robots: { index: false },
};

/** An address inside the site that has no page (a treatment, concern or article that is gone): the site's 404, with its header and footer. */
export default function NotFound() {
  return <NotFoundView />;
}
