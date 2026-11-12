import { TreatMenuView } from "@/components/home/treat-menu-view";
import { TREATMENT_TABS, type TreatmentTab } from "@/config/home-treatments";
import { getSitePrices } from "@/lib/site-prices";

/**
 * "Treatments, by what they do": the home page's treatment carousel. Every card's price is read from
 * WooCommerce (here, on the server); a treatment without a product there shows its note ("Free", "Priced at consultation") or nothing, never a written price.
 */
export async function TreatMenu() {
  const prices = await getSitePrices();
  const categories: TreatmentTab[] = TREATMENT_TABS.map((t) => ({ ...t, cards: t.cards.map((c) => ({ ...c, price: prices?.book.priceFor(c.name) ?? c.price })) }));
  const tabs: TreatmentTab[] = [{ id: "all", label: "All", all: { href: "#/treatments", label: "All treatments" }, cards: categories.flatMap((t) => t.cards) }, ...categories];
  return <TreatMenuView tabs={tabs} />;
}
