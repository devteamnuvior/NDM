import { getCampaign } from "@/lib/campaign";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { SpecialsWheel, type WheelOffer } from "@/components/specials/specials-wheel";
import { PayPlans } from "@/components/ui/pay-plans";
import { getCarousel } from "@/lib/offers";
import { pagePath } from "@/lib/routes";

interface SpecialsProps {
  /** Heading level: h1 when the wheel opens a page, h2 inside one. */
  level?: "h1" | "h2";
  /** The page has its own list of all offers (id "offers"): the button scrolls to it instead of leaving. */
  offersOnPage?: boolean;
}

/**
 * Exclusive monthly specials: the offers wheel, the financing links and the payment plans card. The
 * wheel has its own list of treatments in WooCommerce (lib/offers.ts, `getCarousel`), managed in the
 * price manager; when WooCommerce cannot be reached, or the list is empty, the section is left out
 * rather than showing prices nobody can vouch for.
 */
export async function Specials({ level = "h2", offersOnPage = false }: SpecialsProps) {
  let wheel: WheelOffer[];
  try {
    wheel = await getCarousel();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[offers] the offers carousel could not be read from WooCommerce:", error instanceof Error ? error.message : error);
    await connection(); /* not kept: the next request asks again */
    return null;
  }
  if (!wheel.length) return null;

  /* "View all offers": the Promotion page's list; in the VIP Sale's days the Black Friday page (user, 2026-11-19) */
  const campaign = offersOnPage ? null : await getCampaign();
  const all = campaign && !campaign.over && campaign.phase === "vip" ? pagePath("blackFridaySale") : `${pagePath("promotion")}#offers`;

  return (
    <SpecialsWheel offers={wheel} level={level} offersHref={offersOnPage ? "#offers" : all}>
      <PayPlans className="mt-3" />
    </SpecialsWheel>
  );
}
