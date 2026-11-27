import type { CSSProperties, ElementType, ReactNode } from "react";

interface TwoToneProps {
  as?: ElementType;
  id?: string;
  /** First part, in the text colour. End it with <br /> so the second colour starts on a new line. */
  lead: ReactNode;
  /** Second part, in the accent colour and italic. */
  strong: ReactNode;
  /** For dark sections: white, with a sky-blue second part. */
  dark?: boolean;
  /** Font-size class. */
  size?: string;
  className?: string;
  style?: CSSProperties;
}

/** The two-tone section heading used across the site. */
export function TwoTone({ as: Tag = "h2", id, lead, strong, dark, size = "text-[clamp(36px,4.2vw,62px)]", className = "", style }: TwoToneProps) {
  return (
    <Tag id={id} className={`font-aeonik leading-[1.08] font-normal tracking-[-0.035em] ${dark ? "text-white" : "text-ndm-ink"} ${size} ${className}`} style={style}>
      {lead} <span className={`tt-strong ${dark ? "text-ndm-sky" : "text-ndm-deep"}`}>{strong}</span>
    </Tag>
  );
}
