import type { StaticImageData } from "next/image";
import aboveKnee from "@/assets/images/promotion/above-knee.webp";
import crepeyArms from "@/assets/images/promotion/crepey-arms.webp";
import hands from "@/assets/images/promotion/hands.webp";
import sculptraFace from "@/assets/images/promotion/sculptra-face.webp";
import chemicalPeel from "@/assets/images/treatments/chemical-peel.jpg";
import laserResurfacing from "@/assets/images/treatments/laser-resurfacing.jpg";
import lipFiller from "@/assets/images/treatments/lip-filler.jpg";
import microneedling from "@/assets/images/treatments/microneedling.jpg";
import photoRejuvenation from "@/assets/images/treatments/photo-rejuvenation.jpg";
import skinBooster from "@/assets/images/treatments/skin-booster.jpg";
import { SPECIALS, type Special, type SpecialPhoto } from "@/config/specials";
import { lowestPrice, priceInfo } from "@/lib/prices";
import { pagePath } from "@/lib/routes";

const PHOTOS: Record<SpecialPhoto, StaticImageData> = {
  "lip-filler": lipFiller,
  microneedling,
  "chemical-peel": chemicalPeel,
  "laser-resurfacing": laserResurfacing,
  "photo-rejuvenation": photoRejuvenation,
  "skin-booster": skinBooster,
  "sculptra-face": sculptraFace,
  hands,
  "crepey-arms": crepeyArms,
  "above-knee": aboveKnee,
};

/** One current offer, with its price resolved from the price list. */
export interface Offer {
  name: string;
  photo: StaticImageData;
  position: string;
  tag: string;
  area: Special["area"];
  icon: Special["icon"];
  text: string;
  /** Lowest price, without the dollar sign. */
  price: string;
  unit: string;
  deal: string;
  href: string;
}

/* Each special shows the price list's lowest price after the offer, its unit and its offer, so the wheel
   always matches the pricing page. Import this from Server Components only: it reads the whole price list. */
export const OFFERS: Offer[] = SPECIALS.map((s) => {
  const found = priceInfo(s.name);
  const byCategory = lowestPrice(s.category);
  const info = found ?? (byCategory ? { id: s.category, ...byCategory } : null);
  const live = info && info.value ? info : null;
  return {
    name: s.name,
    photo: PHOTOS[s.photo],
    position: s.position,
    tag: s.tag,
    area: s.area,
    icon: s.icon,
    text: s.text,
    price: live ? (live.value % 1 ? live.value.toFixed(2) : String(live.value)) : s.price,
    unit: (live && live.per) || s.unit,
    deal: (live && live.offer) || s.deal,
    href: `${pagePath("pricing")}#pg-${s.category}-h`,
  };
});

