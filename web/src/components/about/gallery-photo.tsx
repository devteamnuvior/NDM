import Image from "next/image";

/** A gallery photo that fills its frame: local files are optimised, the clinic site's photos are shown as they are served. */
export function GalleryPhoto({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className: string }) {
  if (src.startsWith("/")) return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  /* eslint-disable-next-line @next/next/no-img-element -- remote photo, served by the clinic's own site as in the prototype */
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />;
}
