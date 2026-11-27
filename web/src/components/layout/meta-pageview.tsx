"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { metaTrack } from "@/lib/meta-pixel";

/** A PageView for every page reached inside the site; the first one is sent by the pixel's own snippet. */
export function MetaPageView() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    metaTrack("PageView");
  }, [path]);
  return null;
}
