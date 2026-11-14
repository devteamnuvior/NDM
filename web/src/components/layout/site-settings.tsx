"use client";

import { createContext, use, type ReactNode } from "react";
import { SITE_SETTINGS } from "@/config/site-settings";
import type { SiteSettings } from "@/types/site-settings";

const SiteSettingsContext = createContext<SiteSettings>(SITE_SETTINGS);

/** Hands the site settings (read on the server, see lib/site-settings) to the header and footer. */
export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <SiteSettingsContext value={value}>{children}</SiteSettingsContext>;
}

/** The header and footer settings; the built-in ones outside the provider. */
export function useSiteSettings(): SiteSettings {
  return use(SiteSettingsContext);
}
