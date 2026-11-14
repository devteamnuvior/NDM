import { TreatMenuView } from "@/components/home/treat-menu-view";
import type { TreatmentTab } from "@/config/home-treatments";
import { fromText, getSitePrices, lowestOfSource } from "@/lib/site-prices";
import type { HomeCopy } from "@/types/home";

/**
 * "Treatments, by what they do": the home page's treatment carousel. The tabs and cards come from the
 * home page in WordPress (else the built-in ones). Every card's price is read from WooCommerce (here, on
 * the server): the product or category picked for the card, else the treatment's name on the price list;
 * a card without either shows its note ("Free") or nothing, never a written amount.
 */
export async function TreatMenu({ copy }: { copy: HomeCopy["treatments"] }) {
  const prices = await getSitePrices();
  const priced: TreatmentTab[] = copy.tabs.map((t) => ({
    ...t,
    /* `c.price` holds only a note ("Free", "Priced at consultation"), shown when WooCommerce has no price for the card */
    cards: t.cards.map((c) => ({ ...c, price: (prices && fromText((c.source && lowestOfSource(prices, c.source)) || prices.book.priceLow(c.name))) || c.price })),
  }));
  const tabs: TreatmentTab[] = [{ id: "all", label: copy.allTab.label, all: copy.allTab.all, cards: priced.flatMap((t) => t.cards) }, ...priced];
  return <TreatMenuView tabs={tabs} copy={copy} />;
}
