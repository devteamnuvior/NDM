import type { CSSProperties, ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  /** For dark sections: a glass pill with white text. */
  dark?: boolean;
  /** The amber tag (booking pop-up). */
  amber?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** The tag above a section heading: a small pill with the logo mark. */
export function Eyebrow({ children, dark, amber, className = "", style }: EyebrowProps) {
  return (
    <p className={`eyebrow ${amber ? "is-amber" : ""} font-mont ${dark ? "is-dark" : ""} ${className}`} style={style}>
      <span className="eyebrow-mark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- small SVG mark */}
        <img src="/assets/icons/logo-mark.svg" alt="" width={20} height={20} />
      </span>
      {children}
    </p>
  );
}
