import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";

/** Every treatment section shares one centred width. */
export const TX_WRAP = "mx-auto w-full max-w-[1180px]";

/** A section's number from the page's section bar ("01"), or nothing when it is not on the bar. */
export function txNumber(nav: [id: string, label: string][], id: string): string {
  const i = nav.findIndex(([k]) => k === id);
  return i < 0 ? "" : String(i + 1).padStart(2, "0");
}

/** The section tag with its number. */
export function TxTag({ number, children, dark, className = "rv" }: { number: string; children: string; dark?: boolean; className?: string }) {
  return (
    <Eyebrow dark={dark} className={className}>
      {number && <span className={`tabular-nums ${dark ? "text-ndm-sky" : "text-ndm-deep"}`}>{number}</span>}
      {children}
    </Eyebrow>
  );
}

interface TxHeadProps {
  number: string;
  tag: string;
  /** Id of the heading (the section is labelled by it). */
  headingId: string;
  lead: string;
  strong: string;
  text?: string;
}

/** Centred heading of a treatment section: numbered tag, two-tone title and an optional intro. */
export function TxHead({ number, tag, headingId, lead, strong, text }: TxHeadProps) {
  return (
    <div className="mx-auto max-w-[760px] text-center">
      <TxTag number={number}>{tag}</TxTag>
      <TwoTone
        id={headingId}
        className="rv mx-auto mt-5"
        size="text-[clamp(32px,3.4vw,50px)]"
        lead={
          <>
            {lead}
            <br />
          </>
        }
        strong={strong}
        style={{ transitionDelay: ".06s" }}
      />
      {text && (
        <p className="rv mx-auto mt-4 max-w-[58ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
          {text}
        </p>
      )}
    </div>
  );
}
