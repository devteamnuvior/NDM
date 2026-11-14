"use client";

import { useEffect } from "react";

/**
 * Puts the class "bfs" on <html> while the Black Friday sale page is shown: the page's look (styles/page-bf-sale.css)
 * hangs on it, as in the prototype. The page also carries a tiny inline script that adds it before the first paint.
 */
export function BfsClass() {
  useEffect(() => {
    document.documentElement.classList.add("bfs");
    return () => document.documentElement.classList.remove("bfs");
  }, []);
  return null;
}
