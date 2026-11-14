"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { usePlaceholderLink } from "@/components/layout/concern-paths";

/**
 * A link written as a "#/slug" placeholder in a section's own markup ("#/visia-skin-analysis"): it opens
 * the page WordPress has for that slug (lib/post-links.ts). Content read from WordPress or the built-in
 * copy gets its links on the server; this is for the few links a component writes itself.
 */
export function PostLink({ href, prefer, children, ...rest }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefer?: "concerns" | "procedures" }) {
  const real = usePlaceholderLink(prefer)(href);
  return (
    <Link href={real} {...rest}>
      {children}
    </Link>
  );
}
