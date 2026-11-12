import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";

interface SectionHeadProps {
  id: string;
  eyebrow: string;
  lead: ReactNode;
  strong: ReactNode;
  /** Short text to the right of the heading on wide screens. */
  intro?: string;
  className?: string;
}

/** The shared section header: tag and two-tone heading on the left, a short intro on the right. */
export function SectionHead({ id, eyebrow, lead, strong, intro, className = "" }: SectionHeadProps) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        <Eyebrow className="rv">{eyebrow}</Eyebrow>
        <TwoTone id={id} className="rv mt-5 max-w-[19ch]" lead={lead} strong={strong} style={{ transitionDelay: ".06s" }} />
      </div>
      {intro && (
        <p className="rv max-w-[360px] font-inter text-[15px] leading-[1.6] text-ndm-muted md:mb-2" style={{ transitionDelay: ".12s" }}>
          {intro}
        </p>
      )}
    </div>
  );
}
