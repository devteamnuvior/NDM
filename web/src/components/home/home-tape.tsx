import { Fragment } from "react";
import { SALE_HEADLINE } from "@/config/sale";
import { dateWords, getCampaign } from "@/lib/campaign";

/**
 * The sale's two crossed tapes under the home hero, on the page's paper (user, 2026-11-17): the first in red, the second in
 * ink, running in opposite directions. Only a banner, not a link. They name the phase of the sale that WooCommerce says is
 * running (VIP Sale, Black Friday, Cyber Monday, Black Friday Extended) with its days, as the price list and the sale
 * pages do, and are left out when no sale runs or WooCommerce cannot be reached. The page never reads the clock.
 *
 * Words: the prototype's, without "Buy 1 get 1 offers" (the campaign's price list has no such offer).
 */
export async function HomeTape() {
  const campaign = await getCampaign();
  const phase = campaign && !campaign.over ? campaign.phases.find((p) => p.id === campaign.phase) : undefined;
  if (!phase) return null;
  /* in the VIP Sale's days the tapes already name Black Friday, with its days (user, 2026-11-19) */
  const later = phase.id === "vip" ? campaign!.phases.filter((p) => p.id !== "vip") : [];
  const label = later.length ? "Black Friday" : phase.label;
  const days = later.length ? `${dateWords(later[0].from)} to ${dateWords(later.at(-1)!.to)}` : `${dateWords(phase.from)} to ${dateWords(phase.to)}`;
  const offer = `Up to ${SALE_HEADLINE}% off selected treatments`;
  const words = [`${label} · ${days}`, offer, "Free consultation and VISIA® skin analysis", "Uptown and Downtown Toronto"];
  const strip = (tone: "red" | "white", rev?: boolean) => {
    const row = (
      <span>
        {words.map((w) => (
          <Fragment key={w}>
            {w}
            <i />
          </Fragment>
        ))}
      </span>
    );
    return (
      <div className={`bfs-tape bfs-tape-${tone}`}>
        <div className={`bfs-tick-in ${rev ? "is-rev" : ""}`}>
          {row}
          {row}
          {row}
          {row}
        </div>
      </div>
    );
  };
  return (
    <div className="home-tape">
      <p className="sr-only">{`${label}, ${days}: ${offer.toLowerCase()}.`}</p>
      <div aria-hidden="true" className="bfs-tapes">
        {strip("red")}
        {strip("white", true)}
      </div>
    </div>
  );
}
