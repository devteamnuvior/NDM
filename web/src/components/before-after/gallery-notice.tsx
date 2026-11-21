import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { GALLERY } from "@/config/gallery";

const NOTICES = {
  loading: ["Loading the gallery", "One moment, the before and after photos are on their way."],
  empty: ["New photos are on their way", "Please check back shortly, or ask our team to show you results at your free consultation."],
  error: ["The gallery is not available right now", "Please try again in a few minutes, or ask our team to show you results at your free consultation."],
} as const;

/**
 * Stands where the gallery goes while it loads, when WordPress holds no case, or when WordPress cannot
 * be reached. The cases only ever come from WordPress.
 */
export function GalleryNotice({ state }: { state: keyof typeof NOTICES }) {
  const [title, text] = NOTICES[state];
  return (
    <section aria-labelledby="gallery-title" aria-busy={state === "loading"} className="ba-gallery relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(160px,14vw,210px)] pb-[clamp(72px,8vw,120px)]">
      <div className="mx-auto max-w-[860px] text-center">
        <Eyebrow>{GALLERY.eyebrow}</Eyebrow>
        <TwoTone
          as="h1"
          id="gallery-title"
          className="mx-auto mt-5"
          size="text-[clamp(34px,4.2vw,62px)]"
          lead={
            <>
              {GALLERY.lead}
              <br />
            </>
          }
          strong={GALLERY.strong}
        />
        <div role={state === "error" ? "alert" : "status"} className="mx-auto mt-10 max-w-[560px] rounded-[20px] border border-ndm-ink/10 bg-white px-6 py-8">
          <p className="font-aeonik text-[clamp(20px,1.8vw,24px)] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{title}</p>
          <p className="mt-3 font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>
        </div>
      </div>
    </section>
  );
}
