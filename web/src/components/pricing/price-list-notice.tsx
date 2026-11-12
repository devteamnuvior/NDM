import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";

const NOTICES = {
  loading: ["Loading the price list", "One moment, the current prices are on their way."],
  empty: ["The price list is being updated", "Please check back shortly, or ask our team for current prices at your free consultation."],
  error: ["The price list is not available right now", "Please try again in a few minutes, or ask our team for current prices at your free consultation."],
} as const;

/**
 * Stands where the price list goes while it loads, when it is empty, or when WooCommerce cannot be
 * reached. It never shows a price: prices only ever come from WooCommerce.
 */
export function PriceListNotice({ state }: { state: keyof typeof NOTICES }) {
  const [title, text] = NOTICES[state];
  return (
    <section id="prices" aria-labelledby="prices-title" aria-busy={state === "loading"} className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,110px)] pb-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px] text-center">
        <Eyebrow>Price list</Eyebrow>
        <TwoTone id="prices-title" className="mt-5" lead="Prices and" strong="current offers" />
        <div role={state === "error" ? "alert" : "status"} className="mx-auto mt-10 max-w-[560px] rounded-[20px] border border-ndm-ink/10 bg-white px-6 py-8">
          <p className="font-aeonik text-[clamp(20px,1.8vw,24px)] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{title}</p>
          <p className="mt-3 font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>
        </div>
      </div>
    </section>
  );
}
