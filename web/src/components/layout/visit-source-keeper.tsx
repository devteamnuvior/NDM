"use client";

import { useEffect } from "react";
import { rememberVisitSource } from "@/lib/visit-source";

/** Reads where the visit came from once per page load (lib/visit-source.ts); draws nothing. */
export function VisitSourceKeeper() {
  useEffect(() => {
    rememberVisitSource();
  }, []);
  return null;
}
