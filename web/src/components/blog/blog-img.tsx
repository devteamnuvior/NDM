import type { ImgHTMLAttributes, Ref } from "react";
import type { BlogPhoto } from "@/types/blog";
import { withBase, withBaseSrcSet } from "@/lib/base-path";

interface BlogImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "alt" | "width" | "height"> {
  photo: BlogPhoto;
  /** How wide the photo is drawn, so the browser picks the smallest copy that is sharp enough. */
  sizes: string;
  /** Alternative text; the photo's own (typed in WordPress's media library) when left out. */
  alt?: string;
  ref?: Ref<HTMLImageElement>;
}

/**
 * A photo of a blog post, served by WordPress's media library with its smaller copies: the browser
 * downloads the copy that fits the screen, and the photo's size is known before it loads.
 */
export function BlogImg({ photo, sizes, alt, ref, ...rest }: BlogImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- WordPress already makes the smaller copies; the photo is served from its media library
    <img ref={ref} src={withBase(photo.src || undefined)} srcSet={withBaseSrcSet(photo.srcSet)} sizes={photo.srcSet ? sizes : undefined} width={photo.width} height={photo.height} alt={alt ?? photo.alt} decoding="async" {...rest} />
  );
}
