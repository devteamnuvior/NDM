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
import type { ProcedureView } from "@/lib/procedure";

/**
 * A procedure page (for example /botox): one design, the Botox page's, for every post of the WordPress
 * post type "Procedures". Header with the booking form, quick facts, the section bar, then the sections
 * the procedure has content for (the section bar lists exactly those).
 *
 * Every price and offer is WooCommerce's: the price table shows the products picked for the procedure,
 * and the amounts inside the copy were filled in from those same products (lib/procedure.ts).
 */
export function ProcedurePage({ view }: { view: ProcedureView }) {
  const { page: p, groups } = view;
  const has = (id: string) => p.nav.some(([k]) => k === id);
  const n = (id: string) => txNumber(p.nav, id);
  return (
    /* data-page="botox": the page-only styles of this design are tied to that name (styles/page-botox.css) */
    <main id="main" data-shell="inner" data-page="botox">
      <Breadcrumb items={[...p.crumbs.slice(0, -1).map((x): [string] => [x]), p.crumbs[p.crumbs.length - 1]]} dark />
      <ProcHero title={p.title} sub={p.sub} hero={p.hero} where={p.where} offer={p.offer} />
      {p.facts.length > 0 && <TxGlance facts={p.facts} />}
      <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden">
        <ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" />
      </section>
      <TxNav nav={p.nav} />
      {has("benefits") && <TxIntro intro={p.intro} number={n("benefits")} />}
      <TxFilm film={p.film} number={n("film")} />
      {has("overview") && <ProcOverview overview={p.overview} facts={p.facts} number={n("overview")} />}
      {has("why-choose") && <ProcChoose choose={p.choose} number={n("why-choose")} />}
      {has("watch") && <TxReel reel={p.reel} facts={p.facts} number={n("watch")} />}
      {has("results") && <TxResults results={p.results} number={n("results")} />}
      {has("prices") && <ProcPrices lead={p.prices.lead} strong={p.prices.strong} category={p.prices.category} number={n("prices")} groups={groups} />}
      {has("guide") && <ProcGuide guide={p.guide} number={n("guide")} />}
      {/* the same on every procedure page */}
      <TxWhy why={p.why} number={n("why")} />
      <Team inner />
      <Saying />
      <TxVisit number={n("visit")} />
      <ProcAnalysis />
      {has("faq") && (
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
      )}
    </main>
  );
}
