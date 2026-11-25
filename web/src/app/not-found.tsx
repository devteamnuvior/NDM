import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found/not-found-view";
import { withBase } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Page not found | NewDermaMed",
  robots: { index: false },
};

/**
 * A missing page outside the site's own layout (the root layout has no header or footer): the same 404 with the logo
 * above it, linking home.
 */
export default function NotFound() {
  return (
    <>
      <header className="nf-bare px-[var(--gx)]">
        <a href={withBase("/")} aria-label="NewDermaMed home" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element -- the logo file, as in the site header */}
          <img src={withBase("/assets/icons/logo-color.svg")} alt="NewDermaMed" width={168} height={40} className="h-10 w-auto" />
        </a>
      </header>
      <NotFoundView />
    </>
  );
}
