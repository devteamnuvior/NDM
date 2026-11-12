import type { Metadata } from "next";
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
import { APTOS, APTOS_PRICE } from "@/config/aptos";
import { fillPricesDeep, getSitePrices } from "@/lib/site-prices";
import { priceGroup } from "@/lib/treatment-prices";

export const metadata: Metadata = {
  title: "Aptos Thread Lift in Toronto, a Lift Without Surgery, NewDermaMed",
  description: "Aptos Thread Lift at NewDermaMed, Uptown and Downtown Toronto: bioabsorbable threads for the midface, about an hour in clinic, results that may last up to 24 months. Free consultation.",
};

/** Aptos Thread Lift: header with the booking form, quick facts, the section bar, then the treatment sections. */
export default async function AptosPage() {
  /* the price rows, and the amount inside the copy ({{aptos}}), are read from WooCommerce; nothing is typed.
     When WooCommerce cannot be reached the price table and the sentence with the price are left out. */
  const prices = await getSitePrices();
  const options = (prices?.book.priceRows(APTOS_PRICE.category, APTOS_PRICE.item) ?? []).filter((o) => APTOS_PRICE.area.test(o.label));
  const group = options.length ? priceGroup({ name: APTOS.prices.name, title: APTOS.prices.title, blurb: APTOS.prices.blurb }, options) : null;
  const p = fillPricesDeep(APTOS, { aptos: group?.from });
  const n = (id: string) => txNumber(p.nav, id);
  return (
    <main id="main" data-shell="inner" data-page="aptos">
      <Breadcrumb items={[[p.crumbs[0]], p.crumbs[1]]} dark />
      <ProcHero title={p.title} sub={p.sub} hero={p.hero} />
      <TxGlance facts={p.facts} />
      <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden">
        <ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" />
      </section>
      <TxNav nav={p.nav} />
      <TxIntro intro={p.intro} number={n("what")} />
      <TxSteps steps={p.steps} number={n("how")} />
      <TxSafety safety={p.safety} number={n("safety")} />
      <TxLasting duration={p.duration} number={n("duration")} />
      <TxFit fit={p.fit} number={n("candidate")} />
      <TxExpect expect={p.expect} number={n("expect")} />
      <TxResults results={p.results} number={n("results")} />
      <TxCare care={p.care} number={n("care")} />
      <TxPair pair={p.pair} number={n("combinations")} />
      {group && <TxPrices prices={p.prices} sessions={p.sessions} number={n("prices")} group={group} />}
      <TxWhy why={p.why} number={n("why")} />
      <Team inner />
      <Saying />
      <TxVisit number={n("visit")} />
      <ProcAnalysis />
      <Faq items={p.faqs} eyebrow="FAQ" lead="Your top questions," strong="answered" intro="What to know about the Aptos Thread Lift, from our medical team." />
    </main>
  );
}
