import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { LegalToc } from "@/components/legal/legal-toc";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SiteLink } from "@/components/ui/site-link";
import { TwoTone } from "@/components/ui/two-tone";
import { LEGAL, LEGAL_DOCS, LEGAL_UPDATED, type LegalDocId } from "@/config/legal";
import { getLegalDocument, type LegalDocument } from "@/lib/legal";
import { pageLink } from "@/lib/routes";

const MAIN = { id: "main", "data-shell": "inner", "data-page": "legal", className: "pt-[176px] xl:pt-[204px]" } as const;

/**
 * A legal document: the title, the switch between the three documents, "On this page", then the text.
 * The title, the date, the headings and the text are the WordPress page with the document's slug (cached,
 * refreshed the moment the page is saved there). `children` is the site's built-in copy of the text: it
 * shows only when WordPress has no published page for the document or cannot be reached.
 */
export function LegalPage({ doc, children }: { doc: LegalDocId; children: ReactNode }) {
  return (
    <Suspense fallback={<main {...MAIN} style={{ minHeight: "100vh" }} />}>
      <LegalDocumentView doc={doc}>{children}</LegalDocumentView>
    </Suspense>
  );
}

async function LegalDocumentView({ doc, children }: { doc: LegalDocId; children: ReactNode }) {
  let live: LegalDocument | null = null;
  try {
    live = await getLegalDocument(doc);
  } catch (error) {
    unstable_rethrow(error);
    console.error(`[legal] "${doc}" could not be read from WordPress, showing the built-in text:`, error instanceof Error ? error.message : error);
    await connection(); /* not kept: the next request asks WordPress again */
  }

  const d = live ?? { ...LEGAL[doc], updated: LEGAL_UPDATED };
  const current = LEGAL_DOCS.find((x) => x.id === doc)!;
  return (
    <main {...MAIN}>
      <Breadcrumb items={["Legal", current.label]} />
      <section aria-labelledby="lg-title" className="px-[var(--gx)] pt-[clamp(28px,3vw,44px)] pb-6">
        <TwoTone
          as="h1"
          id="lg-title"
          size="text-[clamp(40px,4.6vw,64px)]"
          lead={
            <>
              {d.lead}
              <br />
            </>
          }
          strong={d.strong}
        />
        <nav aria-label="Legal documents" className="no-scrollbar -mx-[var(--gx)] mt-6 overflow-x-auto px-[var(--gx)]">
          <ul role="list" className="flex w-max gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_rgba(27,36,43,.08)]">
            {LEGAL_DOCS.map((x) => (
              <li key={x.id}>
                <SiteLink
                  to={pageLink(x.page)}
                  aria-current={x.id === doc ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 font-inter text-[14px] whitespace-nowrap transition-colors ${x.id === doc ? "bg-ndm-ink font-medium text-white" : "text-ndm-ink/75 hover:bg-ndm-paper hover:text-ndm-ink"}`}
                >
                  {x.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
        {d.updated ? <p className="mt-5 font-inter text-[13px] text-ndm-muted">Last updated {d.updated}</p> : null}
      </section>
      {d.toc.length ? <LegalToc toc={d.toc} /> : null}
      <section className="px-[var(--gx)] pt-2 pb-[clamp(72px,8vw,120px)]">
        {live ? (
          <article className="lg-doc-body max-w-[820px]" dangerouslySetInnerHTML={{ __html: live.html }} />
        ) : (
          <article className="lg-doc-body max-w-[820px]">{children}</article>
        )}
      </section>
    </main>
  );
}
