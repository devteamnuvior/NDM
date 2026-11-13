import { StartPanels } from "@/components/home/start-panels";
import { StartSearch } from "@/components/home/start-search";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { START_PANELS, type StartPanel } from "@/config/home-start";
import { getSitePrices } from "@/lib/site-prices";
import type { HomeCopy } from "@/types/home";

/** What a concern's option shows when WooCommerce has no price for it. */
const NO_PRICE = "At consultation";

/* Every option's price is read from WooCommerce, so this section always matches the pricing page; no
   price is written in the content. Done here, on the server, so the price list is not sent to the browser. */
async function pricedPanels(): Promise<StartPanel[]> {
  const prices = await getSitePrices();
  return START_PANELS.map((p) => ({
    ...p,
    concerns: p.concerns.map((c) => ({ ...c, options: c.options.map((o) => ({ ...o, price: prices?.book.priceFor(o.name) ?? (o.price || NO_PRICE) })) })),
  }));
}

/** "Where would you like to start?": the heading, a search field, and the expanding photo panels. */
export async function Start({ copy }: { copy: HomeCopy["start"] }) {
  const panels = await pricedPanels();
  return (
    <RevealSection id="start" aria-labelledby="start-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(32px,3.5vw,56px)] pb-[clamp(24px,3vw,48px)]">
      <div className="mb-[clamp(32px,3.6vw,52px)] flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <div>
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            as="h2"
            id="start-title"
            className="rv mt-4"
            size="text-[clamp(31px,4.2vw,62px)]"
            lead={
              <>
                {copy.lead}
                <br />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".05s" }}
          />
        </div>
        <StartSearch />
      </div>
      <StartPanels panels={panels} />
      <p className="mt-5 text-right">
        <a href="#/concerns" className="inline-flex items-center gap-2 font-inter text-[14.5px] font-semibold text-ndm-deep hover:underline">
          See all concerns <IconArrow />
        </a>
      </p>
    </RevealSection>
  );
}
