import type { ReactNode } from "react";
import { ConcernPathsProvider } from "@/components/layout/concern-paths";
import { DragScroll } from "@/components/layout/drag-scroll";
import { SiteHeader } from "@/components/layout/header/site-header";
import { OfferPopup } from "@/components/layout/offer-popup";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAptosSlugs } from "@/lib/aptos";
import { getArticleSlugs } from "@/lib/blog";
import { getConcernSlugs } from "@/lib/concern";
import { getProcedureSlugs } from "@/lib/procedure";

/** Pages inside the site's header and footer (every page except the Black Friday sale page, which has its own). */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  /* the concern and procedure pages published in WordPress (the pages of the Aptos design are procedures too): the header links them and starts dark on them; on an article it marks About */
  const [concerns, procedures, aptos, articles] = await Promise.all([getConcernSlugs(), getProcedureSlugs(), getAptosSlugs(), getArticleSlugs()]);
  return (
    <ConcernPathsProvider slugs={concerns} procedures={[...procedures, ...aptos]} articles={articles}>
      <div className="site-root">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-12 focus:left-4 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <DragScroll />
        {children}
        <SiteFooter />
      </div>
      <OfferPopup />
    </ConcernPathsProvider>
  );
}
