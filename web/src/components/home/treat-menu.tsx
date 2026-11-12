import { TreatMenuView } from "@/components/home/treat-menu-view";
import { TREATMENT_TABS, type TreatmentTab } from "@/config/home-treatments";
import { priceFor } from "@/lib/prices";

/* every card's price comes from the price list (resolved here, on the server); the price written in the
   content is only used for a treatment that is not on the list */
const categories: TreatmentTab[] = TREATMENT_TABS.map((t) => ({ ...t, cards: t.cards.map((c) => ({ ...c, price: priceFor(c.name) ?? c.price })) }));
const tabs: TreatmentTab[] = [{ id: "all", label: "All", all: { href: "#/treatments", label: "All treatments" }, cards: categories.flatMap((t) => t.cards) }, ...categories];

/** "Treatments, by what they do": the home page's treatment carousel. */
export function TreatMenu() {
  return <TreatMenuView tabs={tabs} />;
}
