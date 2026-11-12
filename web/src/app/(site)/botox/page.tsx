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
import { formatPrice } from "@/lib/prices";
import { fillPricesDeep, getSitePrices } from "@/lib/site-prices";
import { priceGroup } from "@/lib/treatment-prices";

/**
 * Everything on this page that is a price or an offer is read from WooCommerce: the price table, and the
 * amounts inside the copy (written there as {{botox}}, {{dysport}}...). Nothing is typed. When WooCommerce
 * cannot be reached the table and the sentences that carry a price are left out.
 */
async function botoxPrices() {
  const prices = await getSitePrices();
  const groups = BOTOX.prices.groups
    .map((g) => ({ g, rows: prices?.book.priceRows(BOTOX_PRICE_CATEGORY, g.name) ?? [] }))
    .filter((x) => x.rows.length)
    .map((x) => priceGroup(x.g, x.rows, BOTOX.prices.unitLabel));
  const rowsOf = (i: number) => groups.find((g) => g.name === BOTOX.prices.groups[i].name)?.rows ?? [];
  const unit = (i: number) => rowsOf(i).find((r) => r.label === BOTOX.prices.unitLabel)?.price;
  const [botox, dysport] = [unit(0), unit(1)];
  const offs = rowsOf(0)
    .map((r) => Number(/^(\d+)%\s*OFF$/i.exec(r.tag ?? "")?.[1] ?? 0))
    .filter(Boolean);
  const [low, high] = [Math.min(...offs), Math.max(...offs)];
  const values = {
    botox: botox ? formatPrice(botox) : undefined,
    botox20: botox ? formatPrice(botox * 20) : undefined,
    botox24: botox ? formatPrice(botox * 24) : undefined,
    dysport: dysport ? formatPrice(dysport) : undefined,
    botoxOff: offs.length ? (low === high ? `${high}%` : `${low}% to ${high}%`) : undefined,
    botoxMax: offs.length ? `${high}%` : undefined,
  };
  return { groups, values };
}

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description are kept. */
export async function generateMetadata(): Promise<Metadata> {
  const { values: v } = await botoxPrices();
  return {
    title: v.botox ? `Botox Toronto from ${v.botox}/Unit, Free Consultation | NewDermaMed` : "Botox Toronto, Free Consultation | NewDermaMed",
    description: `Botox® Cosmetic in Toronto${v.botox ? ` from ${v.botox} per unit` : ""}${v.botoxMax ? `, packages up to ${v.botoxMax} off` : ""}. Free consultation and VISIA® skin analysis at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.`,
  };
}

/** Botox: header with the booking form, quick facts, the section bar, then the page's sections. */
export default async function BotoxPage() {
  const { groups, values } = await botoxPrices();
  const p = fillPricesDeep(BOTOX, values);
  /* the offer card under the intro only while WooCommerce has an offer on the packages */
  const offer = values.botoxMax ? p.offer : undefined;
  const n = (id: string) => txNumber(p.nav, id);
  return (
    <main id="main" data-shell="inner" data-page="botox">
      <Breadcrumb items={[[p.crumbs[0]], [p.crumbs[1]], p.crumbs[2]]} dark />
      <ProcHero title={p.title} sub={p.sub} hero={p.hero} where={p.where} offer={offer} />
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
      {groups.length > 0 && <ProcPrices lead={p.prices.lead} strong={p.prices.strong} category={p.prices.category} number={n("prices")} groups={groups} />}
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
