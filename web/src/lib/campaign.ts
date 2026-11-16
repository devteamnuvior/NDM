import "server-only";
import { getPricingTree, settle } from "@/lib/wordpress";
import type { WooCampaign } from "@/types/pricing";

/*
 * The sale campaign (the 2026 holiday sale: VIP Sale, Black Friday, Cyber Monday, Black Friday Extended).
 * It lives in WooCommerce beside the price list (the ndm-pricing plugin's campaign): its window, its phases,
 * its checkout code, and the price of every line in it. This site types none of that.
 */

/** A phase with its moments as numbers and its days in words. */
export interface CampaignPhase {
  id: string;
  /** "VIP Sale", "Black Friday", "Cyber Monday", "Black Friday Extended" */
  label: string;
  from: number;
  to: number;
  /** "Fri, Nov 20": the day it opens. */
  firstDay: string;
  /** "Thu, Nov 19" and "Nov 19": its last day. */
  lastDay: string;
  lastDate: string;
}

export interface Campaign {
  code: string;
  percent: number;
  start: number;
  end: number;
  /** The phase WooCommerce was in when it answered (null outside the window), and whether the window had closed. */
  phase: string | null;
  over: boolean;
  phases: CampaignPhase[];
}

const part = (t: number, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", ...options }).format(t).replaceAll(".", "");
/** "Thu, Nov 19" */
export const dayWords = (t: number): string => `${part(t, { weekday: "short" })}, ${part(t, { month: "short" })} ${part(t, { day: "numeric" })}`;
/** "Nov 19" */
export const dateWords = (t: number): string => `${part(t, { month: "short" })} ${part(t, { day: "numeric" })}`;

export function toCampaign(wp: WooCampaign | null | undefined): Campaign | null {
  if (!wp) return null;
  return {
    code: wp.code,
    percent: wp.percent,
    start: Date.parse(wp.start),
    end: Date.parse(wp.end),
    phase: wp.phase,
    over: wp.over,
    phases: wp.phases.map((p) => {
      const from = Date.parse(p.from);
      const to = Date.parse(p.to);
      return { id: p.id, label: p.label, from, to, firstDay: dayWords(from), lastDay: dayWords(to), lastDate: dateWords(to) };
    }),
  };
}

/** The campaign stored in WooCommerce; null when there is none or WooCommerce cannot be reached. */
export async function getCampaign(): Promise<Campaign | null> {
  const read = await settle(getPricingTree);
  return read.ok ? toCampaign(read.data.campaign) : null;
}

/** The look of the offer tags while the campaign runs: the VIP Sale keeps the site's red and blue, the later phases black and gold. Null outside the sale. */
export function saleTagsOf(c: Campaign | null): { look: "vip" | "bf"; percent: number } | null {
  if (!c || c.over || !c.phase) return null;
  return { look: c.phase === "vip" ? "vip" : "bf", percent: c.percent };
}
