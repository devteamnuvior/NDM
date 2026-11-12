import Image from "next/image";
import type { CSSProperties } from "react";

interface TxPhotoProps {
  /** A file under /assets (optimised by next/image), or a remote photo, shown as the prototype shows it. */
  src: string;
  alt: string;
  /** Rendered width, for the optimised sizes. */
  sizes: string;
  className: string;
  style?: CSSProperties;
}

/** A photo that fills its frame (the frame is positioned and sets the size). */
export function TxPhoto({ src, alt, sizes, className, style }: TxPhotoProps) {
  if (src.startsWith("/")) return <Image src={src} alt={alt} fill sizes={sizes} className={className} style={style} />;
  /* eslint-disable-next-line @next/next/no-img-element -- remote photo, served by its own site as in the prototype */
  return <img src={src} alt={alt} loading="lazy" className={className} style={style} />;
}
