"use client";

import { useEffect } from "react";

/**
 * Puts the class "vip" on <html> while the VIP Sale page is shown: the page's look (styles/page-vip-sale.css)
 * hangs on it, as in the prototype. The page also carries a tiny inline script that adds it before the first paint.
 */
export function VipClass() {
  useEffect(() => {
    document.documentElement.classList.add("vip");
    return () => document.documentElement.classList.remove("vip");
  }, []);
  return null;
}
