import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CnArticles } from "@/components/concern/cn-articles";
import { CnAssess } from "@/components/concern/cn-assess";
import { CnCompare } from "@/components/concern/cn-compare";
import { CnHome } from "@/components/concern/cn-home";
import { CnIntro } from "@/components/concern/cn-intro";
import { CnOptions } from "@/components/concern/cn-options";
import { CnRelated } from "@/components/concern/cn-related";
import { CnUnderstand } from "@/components/concern/cn-understand";
import { Saying } from "@/components/home/saying";
import { Team } from "@/components/home/team";
import { ProcAnalysis } from "@/components/treatment/proc-analysis";
import { ProcForm } from "@/components/treatment/proc-form";
import { ProcHero } from "@/components/treatment/proc-hero";
import { TxExpect } from "@/components/treatment/tx-expect";
import { TxGlance } from "@/components/treatment/tx-glance";
import { txNumber } from "@/components/treatment/tx-head";
import { TxNav } from "@/components/treatment/tx-nav";
import { TxResults } from "@/components/treatment/tx-results";
import { TxVisit } from "@/components/treatment/tx-visit";
import { TxWhy } from "@/components/treatment/tx-why";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { BUILT_IN_CONCERNS } from "@/config/concern";
import { getConcernSlugs, getConcernView } from "@/lib/concern";

/**
 * A concern page (for example /wrinkles-fine-lines): one design for every post of the WordPress post
 * type "Concerns". The post's slug is the address. A concern published later is shown without a new
 * build; WordPress tells the site when one changes.
 */
/*
 * The address decides which concern is shown, and an address with no concern must answer "not found":
 * the page waits for WordPress before it sends anything, instead of sending an empty shell first.
 * (Without this, Next.js reports "URL data during prerendering" for reading `params` outside Suspense.)
 */
export const instant = false;

export async function generateStaticParams() {
  const slugs = new Set([...Object.keys(BUILT_IN_CONCERNS), ...(await getConcernSlugs())]);
  return Array.from(slugs, (concern) => ({ concern }));
}

/* SEO (structured data, canonical and social tags) is out of scope for now: only the title and description are kept. */
export async function generateMetadata({ params }: PageProps<"/[concern]">): Promise<Metadata> {
  const view = await getConcernView((await params).concern);
  return view ? { title: view.title, description: view.description } : {};
}

export default async function ConcernPage({ params }: PageProps<"/[concern]">) {
  const view = await getConcernView((await params).concern);
  if (!view) notFound();
  const p = view.page;
  const n = (id: string) => txNumber(p.nav, id);
  return (
    <main id="main" data-shell="inner" data-page="concern">
      <Breadcrumb items={[[p.crumbs[0]], p.crumbs[1]]} dark />
      <ProcHero title={p.title} sub={p.sub} hero={p.hero} where={p.where} />
      <TxGlance facts={p.facts} />
      <section aria-label="Book a free consultation" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-6 lg:hidden">
        <ProcForm id="mobile-form" className="ring-1 ring-ndm-ink/[.06]" />
      </section>
      <TxNav nav={p.nav} />
      <CnIntro page={p} number={n("about")} />
      <CnUnderstand notice={p.notice} cause={p.cause} number={n("understand")} />
      <CnAssess assess={p.assess} short={p.short} number={n("assess")} />
      <CnOptions short={p.short} options={p.options} bio={p.bio} rx={p.rx} number={n("options")} />
      <CnCompare rows={p.compare} number={n("compare")} />
      <TxExpect expect={p.expect} number={n("expect")} />
      <TxResults results={p.results} number={n("results")} />
      <CnHome home={p.home} number={n("home-care")} />
      {/* the same on every concern page */}
      <TxWhy why={p.why} number={n("why")} />
      <Team inner />
      <Saying />
      <CnArticles articles={p.articles} short={p.short} />
      <CnRelated related={p.related} />
      <TxVisit number={n("visit")} />
      <ProcAnalysis />
      <Faq
        items={p.faqs}
        eyebrow="FAQ"
        lead={
          <>
            Questions about
            <br />
          </>
        }
        strong={p.short.toLowerCase()}
        intro="The things people ask us most about this concern."
      />
    </main>
  );
}
