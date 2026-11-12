import { OFFERS } from "@/components/specials/offers";
import { SpecialsWheel, type WheelOffer } from "@/components/specials/specials-wheel";
import { PayPlans } from "@/components/ui/pay-plans";
import { pagePath } from "@/lib/routes";

/* the wheel only needs these fields: the rest of an offer is not sent to the browser with it */
const WHEEL: WheelOffer[] = OFFERS.map(({ name, photo, position, tag, price, unit, deal, href }) => ({ name, photo, position, tag, price, unit, deal, href }));

interface SpecialsProps {
  /** Heading level: h1 when the wheel opens a page, h2 inside one. */
  level?: "h1" | "h2";
  /** The page has its own list of all offers (id "offers"): the button scrolls to it instead of leaving. */
  offersOnPage?: boolean;
}

/** Exclusive monthly specials: the offers wheel, the financing links and the payment plans card. */
export function Specials({ level = "h2", offersOnPage = false }: SpecialsProps) {
  return (
    <SpecialsWheel offers={WHEEL} level={level} offersHref={offersOnPage ? "#offers" : `${pagePath("promotion")}#offers`}>
      <PayPlans className="mt-3" />
    </SpecialsWheel>
  );
}
