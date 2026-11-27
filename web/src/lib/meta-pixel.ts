/**
 * The clinic's Meta pixel "NewDermaMed" (user, 2026-11-25), loaded on the live site only (`MetaPixel` in
 * components/layout/tag-manager.tsx). Events carry amounts, product IDs and which form, never anything the
 * visitor typed or a treatment or concern name (PHIPA, and Meta's rules on health data).
 */
export const META_PIXEL_ID = "945760760941830";

type Fbq = (kind: "track" | "trackCustom", name: string, data?: Record<string, unknown>, opts?: { eventID?: string }) => void;

/** Sends one standard event when the pixel is on the page; nothing otherwise. Never throws. */
export function metaTrack(name: string, data: Record<string, unknown> = {}, eventID?: string): void {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    fbq?.("track", name, data, eventID ? { eventID } : undefined);
  } catch {
    /* a blocked pixel never breaks the page */
  }
}
