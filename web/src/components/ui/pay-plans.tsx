import { AFFIRM_PREQUAL_URL, PAYMENT_LOGOS } from "@/config/specials";
import { withBase } from "@/lib/base-path";

const IconCard = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 9.5h18M7 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** Flexible payment plans: a white card with the providers' logos and the link to start a plan. */
export function PayPlans({ className = "" }: { className?: string }) {
  const start = (
    <>
      Start my plan<span className="sr-only"> (opens Affirm in a new tab)</span>
    </>
  );
  return (
    <div className={`w-full max-w-[760px] rounded-[22px] border border-ndm-ink/[.08] bg-white p-4 text-left shadow-[0_24px_50px_-40px_rgba(27,36,43,.5)] sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
            <IconCard />
          </span>
          <div className="min-w-0">
            <p className="font-aeonik text-[19px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">Flexible payment plans</p>
            <p className="mt-0.5 font-inter text-[13.5px] text-ndm-muted">Start today, pay later.</p>
          </div>
        </div>
        <a href={withBase(AFFIRM_PREQUAL_URL)} target="_blank" rel="noopener" className="btn btn-ink btn-sm hidden shrink-0 sm:inline-flex">
          {start}
        </a>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-ndm-ink/[.07] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <ul className="flex flex-wrap items-center gap-2" role="list" aria-label="Payment plan providers">
          {PAYMENT_LOGOS.map((l) => (
            <li key={l.name} className="grid h-10 min-w-[84px] place-items-center rounded-[12px] bg-ndm-paper px-3.5 ring-1 ring-ndm-ink/[.06]">
              {/* eslint-disable-next-line @next/next/no-img-element -- the provider's own logo, from its CDN */}
              <img src={withBase(l.src)} alt={l.name} loading="lazy" className={`${l.height} w-auto`} />
            </li>
          ))}
        </ul>
        <p className="font-inter text-[11.5px] leading-[1.45] text-ndm-muted sm:max-w-[32ch] sm:text-right">Subject to approval. Affirm: Canadian residents 19+, minimum $500 purchase.</p>
      </div>
      <a href={withBase(AFFIRM_PREQUAL_URL)} target="_blank" rel="noopener" className="btn btn-ink btn-sm btn-block mt-4 sm:hidden">
        {start}
      </a>
    </div>
  );
}
