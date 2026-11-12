import type { Metadata } from "next";
import { Saying } from "@/components/home/saying";
import { Team } from "@/components/home/team";
import { ProcAnalysis } from "@/components/treatment/proc-analysis";
import { ProcChoose } from "@/components/treatment/proc-choose";
import { ProcForm } from "@/components/treatment/proc-form";
import { ProcGuide } from "@/components/treatment/proc-guide";
import { ProcHero } from "@/components/treatment/proc-hero";
import { ProcOverview } from "@/components/treatment/proc-overview";
import { ProcPrices } from "@/components/treatment/proc-prices";
import { TxFilm } from "@/components/treatment/tx-film";
import { TxGlance } from "@/components/treatment/tx-glance";
import { txNumber } from "@/components/treatment/tx-head";
import { TxIntro } from "@/components/treatment/tx-intro";
import { TxNav } from "@/components/treatment/tx-nav";
import { TxReel } from "@/components/treatment/tx-reel";
import { TxResults } from "@/components/treatment/tx-results";
import { TxVisit } from "@/components/treatment/tx-visit";
import { TxWhy } from "@/components/treatment/tx-why";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { BOTOX, BOTOX_PRICE_CATEGORY } from "@/config/botox";
import { priceRows } from "@/lib/prices";
import { priceGroup } from "@/lib/treatment-prices";

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description are kept. */
export const metadata: Metadata = {
  title: "Botox Toronto from $12/Unit, Free Consultation | NewDermaMed",
  description: "Botox® Cosmetic in Toronto from $12 per unit, packages up to 30% off. Free consultation and VISIA® skin analysis at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.",
};

/* the price groups come from the price list, resolved here on the server */
const GROUPS = BOTOX.prices.groups.map((g) => priceGroup(g, priceRows(BOTOX_PRICE_CATEGORY, g.name), BOTOX.prices.unitLabel));

/** Botox: header with the booking form, quick facts, the section bar, then the page's sections. */
export default function BotoxPage() {
  const p = BOTOX;
  const n = (id: string) => txNumber(p.nav, id);
  return (
    <main id="main" data-shell="inner" data-page="botox">
      <Breadcrumb items={[[p.crumbs[0]], [p.crumbs[1]], p.crumbs[2]]} dark />
      <ProcHero title={p.title} sub={p.sub} hero={p.hero} where={p.where} offer={p.offer} />
      <TxGlance facts={p.facts} />
      <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden">
        <ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" />
      </section>
      <TxNav nav={p.nav} />
      <TxIntro intro={p.intro} number={n("benefits")} />
      <TxFilm film={p.film} number={n("film")} />
      <ProcOverview overview={p.overview} facts={p.facts} number={n("overview")} />
      <ProcChoose choose={p.choose} number={n("why-choose")} />
      <TxReel reel={p.reel} facts={p.facts} number={n("watch")} />
      <TxResults results={p.results} number={n("results")} />
      <ProcPrices lead={p.prices.lead} strong={p.prices.strong} category={p.prices.category} number={n("prices")} groups={GROUPS} />
      <ProcGuide guide={p.guide} number={n("guide")} />
      <TxWhy why={p.why} number={n("why")} />
      <Team inner />
      <Saying />
      <TxVisit number={n("visit")} />
      <ProcAnalysis />
      <Faq
        items={p.faqs}
        eyebrow="FAQ"
        lead={
          <>
            {p.faq.lead}
            <br />
          </>
        }
        strong={p.faq.strong}
        intro={p.faq.sub}
      />
    </main>
  );
}
