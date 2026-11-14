import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";

const NOTICES = {
  loading: ["Loading the current offers", "One moment, this month's offers are on their way."],
  empty: ["New offers are on their way", "Please check back shortly, or ask our team about current offers at your free consultation."],
  error: ["The offers are not available right now", "Please try again in a few minutes, or ask our team about current offers at your free consultation."],
} as const;

/**
 * Stands where the offers go while they load, when there are none, or when WooCommerce cannot be
 * reached. It never shows a price: offers and prices only ever come from WooCommerce.
 */
export function PromoNotice({ state }: { state: keyof typeof NOTICES }) {
  const [title, text] = NOTICES[state];
  return (
    <section aria-labelledby="offers" aria-busy={state === "loading"} className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(120px,12vw,180px)] pb-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px] text-center">
        <Eyebrow>Promotions</Eyebrow>
        <TwoTone
          as="h1"
          id="offers"
          className="mt-5"
          lead={
            <>
              All current
              <br />
            </>
          }
          strong="offers"
        />
        <div role={state === "error" ? "alert" : "status"} className="mx-auto mt-10 max-w-[560px] rounded-[20px] border border-ndm-ink/10 bg-white px-6 py-8">
          <p className="font-aeonik text-[clamp(20px,1.8vw,24px)] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{title}</p>
          <p className="mt-3 font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>
        </div>
      </div>
    </section>
  );
}
