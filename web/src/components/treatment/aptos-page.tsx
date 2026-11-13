import { Saying } from "@/components/home/saying";
import { Team } from "@/components/home/team";
import { ProcAnalysis } from "@/components/treatment/proc-analysis";
import { ProcForm } from "@/components/treatment/proc-form";
import { ProcHero } from "@/components/treatment/proc-hero";
import { TxCare } from "@/components/treatment/tx-care";
import { TxExpect } from "@/components/treatment/tx-expect";
import { TxFit } from "@/components/treatment/tx-fit";
import { TxGlance } from "@/components/treatment/tx-glance";
import { txNumber } from "@/components/treatment/tx-head";
import { TxIntro } from "@/components/treatment/tx-intro";
import { TxLasting } from "@/components/treatment/tx-lasting";
import { TxNav } from "@/components/treatment/tx-nav";
import { TxPair } from "@/components/treatment/tx-pair";
import { TxPrices } from "@/components/treatment/tx-prices";
import { TxResults } from "@/components/treatment/tx-results";
import { TxSafety } from "@/components/treatment/tx-safety";
import { TxSteps } from "@/components/treatment/tx-steps";
import { TxVisit } from "@/components/treatment/tx-visit";
import { TxWhy } from "@/components/treatment/tx-why";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import type { AptosView } from "@/lib/aptos";

/**
 * A page of the Aptos Thread Lift design: header with the booking form, quick facts, the section bar,
 * then the treatment sections. Its content is the WordPress page with the template "Aptos Thread Lift
 * page"; the price rows are WooCommerce's and the before and after photos are cases of the gallery. A
 * section the page has no content for is left out. `data-page="aptos"` ties the page-only CSS to it.
 */
export function AptosPage({ view }: { view: AptosView }) {
  const { page: p, groups, has, faq } = view;
  const n = (id: string) => txNumber(p.nav, id);
  return (
    <main id="main" data-shell="inner" data-page="aptos">
      <Breadcrumb items={[[p.crumbs[0]], p.crumbs[1]]} dark />
      <ProcHero title={p.title} sub={p.sub} hero={p.hero} />
      {p.facts.length > 0 && <TxGlance facts={p.facts} />}
      <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden">
        <ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" />
      </section>
      <TxNav nav={p.nav} />
      {has.what && <TxIntro intro={p.intro} number={n("what")} />}
      {has.how && <TxSteps steps={p.steps} number={n("how")} />}
      {has.safety && <TxSafety safety={p.safety} number={n("safety")} />}
      {has.duration && <TxLasting duration={p.duration} number={n("duration")} />}
      {has.candidate && <TxFit fit={p.fit} number={n("candidate")} />}
      {has.expect && <TxExpect expect={p.expect} number={n("expect")} />}
      {has.results && <TxResults results={p.results} number={n("results")} />}
      {has.care && <TxCare care={p.care} number={n("care")} />}
      {has.combinations && <TxPair pair={p.pair} number={n("combinations")} />}
      {has.prices && <TxPrices prices={p.prices} sessions={has.sessions ? p.sessions : undefined} number={n("prices")} groups={groups} />}
      {has.why && <TxWhy why={p.why} number={n("why")} />}
      <Team inner />
      <Saying />
      <TxVisit number={n("visit")} />
      <ProcAnalysis />
      {has.faq && <Faq items={p.faqs} eyebrow="FAQ" lead={faq.lead || undefined} strong={faq.strong || undefined} intro={faq.intro || undefined} />}
    </main>
  );
}
