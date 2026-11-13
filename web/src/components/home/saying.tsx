import { Fragment } from "react";
import { AwardCard, GoogleG, GoogleStars, ReviewCard } from "@/components/reviews/review-cards";
import { ReviewRow } from "@/components/reviews/review-row";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { HOME_COPY } from "@/config/home";
import { AWARD_CARDS, GOOGLE_RATING, REVIEW_COPIES, REVIEWS as R } from "@/config/reviews";
import type { HomeCopy } from "@/types/home";

const [A1, A2, A3] = AWARD_CARDS;
/* one looping row: reviews with the three award cards in between */
const ROW = [R[0], A1, R[1], R[2], A3, R[3], R[4], A2, R[5], R[6]];

/** Testimonials: the heading with the Google rating, then one drifting row of review and award cards. */
export function Saying({ copy = HOME_COPY.reviews }: { copy?: HomeCopy["reviews"] }) {
  return (
    <RevealSection aria-labelledby="testimonials" className="relative z-10 overflow-hidden bg-ndm-paper py-[clamp(72px,8vw,128px)]">
      <div className="grid gap-6 px-[var(--gx)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="testimonials"
            className="rv mt-5"
            lead={
              <>
                {copy.lead}
                <br className="hidden sm:block" />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".06s" }}
          />
        </div>
        <div className="rv lg:justify-self-end" style={{ transitionDelay: ".1s" }}>
          <p className="font-inter text-[12px] tracking-[.16em] text-ndm-muted uppercase">Recognised</p>
          <div className="mt-2 flex items-center gap-4">
            <span className="font-aeonik text-[clamp(56px,5vw,76px)] leading-none tracking-[-0.04em] text-ndm-ink">{GOOGLE_RATING}</span>
            <span>
              <GoogleStars value={GOOGLE_RATING} />
              <span className="mt-1.5 flex items-center gap-2 font-inter text-[14px] text-ndm-muted">
                <GoogleG />
                Google Reviews
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="promo-rev-rows mt-10 grid gap-4 md:mt-14">
        <ReviewRow dir={1} dur={28}>
          {Array.from({ length: REVIEW_COPIES }, (_, copy) => (
            <Fragment key={copy}>{ROW.map((item, i) => ("look" in item ? <AwardCard key={i} a={item} /> : <ReviewCard key={i} r={item} />))}</Fragment>
          ))}
        </ReviewRow>
      </div>
      <p className="mt-6 px-[var(--gx)] font-inter text-[12px] text-ndm-muted/70">{copy.note}</p>
    </RevealSection>
  );
}
