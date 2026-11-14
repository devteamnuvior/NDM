import type { ReactNode } from "react";
import { ConcernPathsProvider } from "@/components/layout/concern-paths";
import { DragScroll } from "@/components/layout/drag-scroll";
import { SiteHeader } from "@/components/layout/header/site-header";
import { OfferPopup } from "@/components/layout/offer-popup";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteSettingsProvider } from "@/components/layout/site-settings";
import { FEATURES } from "@/config/features";
import { getAptosSlugs } from "@/lib/aptos";
import { getArticleSlugs } from "@/lib/blog";
import { getConcernPaths } from "@/lib/concern";
import { articlePath } from "@/lib/post-paths";
import { getProcedurePaths } from "@/lib/procedure";
import { getSiteSettings } from "@/lib/site-settings";

/** Pages inside the site's header and footer (every page except the Black Friday sale page, which has its own). */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  /* the concern and procedure pages published in WordPress (the pages of the Aptos design are procedures too): the header links them and starts dark on them; on an article it marks About */
  /* the header and footer settings (WordPress: Site Settings) */
  const [concerns, procedures, aptos, articles, settings] = await Promise.all([getConcernPaths(), getProcedurePaths(), getAptosSlugs(), getArticleSlugs(), getSiteSettings()]);
  return (
    <SiteSettingsProvider value={settings}>
    <ConcernPathsProvider concerns={concerns} procedures={[...procedures, ...aptos.map((slug) => ({ slug, path: `/${slug}` }))]} articles={articles.map((slug) => ({ slug, path: articlePath(slug) }))}>
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
      {/* switched off for now (config/features.ts) */}
      {FEATURES.offerPopup && <OfferPopup />}
    </ConcernPathsProvider>
    </SiteSettingsProvider>
  );
}
