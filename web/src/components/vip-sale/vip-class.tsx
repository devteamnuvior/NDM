"use client";

import { useEffect } from "react";

/**
 * Puts the class "vip" on <html> while the VIP Sale page is shown: the page's look (styles/page-vip-sale.css)
 * hangs on it, as in the prototype. `extra` adds one more class: "vbf" is the Black Friday look of the same page. The page also carries a tiny inline script that adds it before the first paint.
 */
export function VipClass({ extra }: { extra?: string }) {
  useEffect(() => {
    const names = ["vip", ...(extra ? [extra] : [])];
    document.documentElement.classList.add(...names);
    return () => document.documentElement.classList.remove(...names);
  }, [extra]);
  return null;
}
