import { BookForm } from "@/components/booking/book-form";
import { IconArrow } from "@/components/ui/icons";

/** The booking form of a treatment page (hero card on desktop, its own block on phones): the shared form, compact. */
export function ProcForm({ id, className = "" }: { id: string; className?: string }) {
  const headingId = `${id}-title`;
  return (
    <div className={`proc-form book-compact rounded-[22px] bg-white p-[clamp(20px,2.2vw,28px)] text-ndm-ink ${className}`} role="region" aria-labelledby={headingId}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id={headingId} className="font-aeonik text-[clamp(24px,2vw,28px)] leading-[1.1] font-normal tracking-[-0.025em]">
          Book your <br />
          <span className="tt-strong text-ndm-deep">free consultation</span>
        </h2>
        <span aria-hidden="true" className="book-badge-dot mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-ndm-amber text-white">
          <IconArrow size={13} />
        </span>
      </div>
      <div className="flex flex-col">
        <BookForm compact thanksId={`${id}-thanks`} />
      </div>
      <p className="mt-3 font-inter text-[12px] leading-[1.5] text-ndm-muted">Free and no obligation. VISIA® skin analysis included.</p>
    </div>
  );
}
