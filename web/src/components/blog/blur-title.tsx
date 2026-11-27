import { Fragment, type CSSProperties } from "react";

/** Words that rise out of a blur one after another once the heading reveals. */
function BlurWords({ text, className = "", start = 0 }: { text: string; className?: string; start?: number }) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      <span className={`bw ${className}`} style={{ "--d": `${start + i * 0.06}s` } as CSSProperties}>
        {w}
      </span>{" "}
    </Fragment>
  ));
}

interface BlurTitleProps {
  as?: "h1" | "h2";
  id: string;
  lead: string;
  strong: string;
  size?: string;
  className?: string;
}

/** The journal's two-tone heading: the second colour starts on a new line, and the words sharpen in one by one. */
export function BlurTitle({ as: Tag = "h2", id, lead, strong, size = "text-[clamp(36px,4.2vw,62px)]", className = "" }: BlurTitleProps) {
  const n = lead.split(" ").length;
  return (
    <Tag id={id} className={`rv bw-wrap font-aeonik leading-[1.08] font-normal tracking-[-0.035em] text-ndm-ink ${size} ${className}`}>
      <BlurWords text={lead} />
      <br />
      <BlurWords text={strong} start={n * 0.06} className="tt-strong text-ndm-deep" />
    </Tag>
  );
}
