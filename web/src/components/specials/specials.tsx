import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { SpecialsWheel, type WheelOffer } from "@/components/specials/specials-wheel";
import { PayPlans } from "@/components/ui/pay-plans";
import { getOffers } from "@/lib/offers";
import { pagePath } from "@/lib/routes";
import type { Offer } from "@/components/specials/offers";

interface SpecialsProps {
  /** Heading level: h1 when the wheel opens a page, h2 inside one. */
  level?: "h1" | "h2";
  /** The page has its own list of all offers (id "offers"): the button scrolls to it instead of leaving. */
  offersOnPage?: boolean;
  /** Offers already read by the page; without them the section reads them itself. */
  offers?: Offer[];
}

/**
 * Exclusive monthly specials: the offers wheel, the financing links and the payment plans card. The
 * offers come from WooCommerce; when it cannot be reached, or holds no offer, the section is left out
 * rather than showing prices nobody can vouch for.
 */
export async function Specials({ level = "h2", offersOnPage = false, offers }: SpecialsProps) {
  let list = offers;
  if (!list) {
    try {
      list = await getOffers();
    } catch (error) {
      unstable_rethrow(error);
      console.error("[offers] the current offers could not be read from WooCommerce:", error instanceof Error ? error.message : error);
      await connection(); /* not kept: the next request asks again */
      return null;
    }
  }
  if (!list.length) return null;

  /* the wheel only needs these fields: the rest of an offer is not sent to the browser with it */
  const wheel: WheelOffer[] = list.map(({ id, name, photo, position, tag, price, unit, deal, href }) => ({ id, name, photo, position, tag, price, unit, deal, href }));
  return (
    <SpecialsWheel offers={wheel} level={level} offersHref={offersOnPage ? "#offers" : `${pagePath("promotion")}#offers`}>
      <PayPlans className="mt-3" />
    </SpecialsWheel>
  );
}
