import type { SiteSettings } from "@/types/site-settings";
import json from "./site-settings.json";

/**
 * The site's built-in header and footer settings: what the site shows when WordPress cannot be reached
 * or Site Settings were never saved, and the source of the one-time import
 * (`node scripts/export-site-settings.mjs | wp ndm settings-import`). Edit the live settings in
 * WordPress (Site Settings), not here.
 */
export const SITE_SETTINGS: SiteSettings = json as SiteSettings;
