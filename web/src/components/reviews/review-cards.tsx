import Image from "next/image";
import { AWARD_BADGES } from "@/components/reviews/award-badges";
import { Star, Stars } from "@/components/ui/icons";
import { AWARD_YEARS, type AwardCardContent, type AwardLook, type Review } from "@/config/reviews";
import { clamp01 } from "@/lib/math";
import { withBase } from "@/lib/base-path";

const AWARD_LOOK: Record<AwardLook, string> = {
  ink: "bg-ndm-ink text-white",
  blue: "bg-[linear-gradient(150deg,#0F80C3_0%,#209ED9_55%,#26B1E7_100%)] text-white",
  amber: "bg-[#FFF4E0] text-ndm-ink border border-[#FFA617]/30",
};

/** An awards and recognition card, the same size as a review card. */
export function AwardCard({ a }: { a: AwardCardContent }) {
  const dark = a.look !== "amber";
  return (
    <li className="w-[min(82vw,400px)] shrink-0">
      <figure className={`relative m-0 flex h-full flex-col overflow-hidden rounded-[22px] p-6 shadow-[0_24px_50px_-40px_rgba(27,36,43,.45)] ${AWARD_LOOK[a.look]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG mark */}
        {a.mark && <img src={withBase("/assets/icons/16-years-gold.svg")} alt="NewDermaMed, 16 years" width="84" height="84" draggable={false} className="mark-16 mb-5" />}
        <div className="flex items-center justify-between gap-4">
          <span className={`font-inter text-[12px] tracking-[.16em] uppercase ${dark ? "text-white/70" : "text-ndm-muted"}`}>{a.label}</span>
        </div>
        <p className="mt-4 font-aeonik text-[clamp(34px,3vw,44px)] leading-none tracking-[-0.03em]">{a.big}</p>
        <p className={`mt-3 max-w-[32ch] font-inter text-[15px] leading-[1.55] ${dark ? "text-white/80" : "text-ndm-muted"}`}>{a.text}</p>
        {a.years && (
          <ul role="list" className="mt-auto flex gap-1 pt-6" aria-label="Top Choice Award, 2019 to 2026">
            {AWARD_YEARS.map((y) => (
              <li key={y}>
                <Image src={withBase(AWARD_BADGES[y])} alt="" sizes="38px" draggable={false} className="size-[clamp(30px,8vw,38px)] object-contain" />
              </li>
            ))}
          </ul>
        )}
        {a.badge && <Image src={withBase(AWARD_BADGES[a.badge])} alt={`Top Choice Award ${a.badge}`} sizes="120px" draggable={false} className="pointer-events-none absolute -right-3 -bottom-3 size-[120px] rotate-[-8deg] object-contain opacity-95" />}
        {a.mark && <p className="mt-auto pt-6 font-inter text-[13px] text-ndm-muted">Uptown and Downtown Toronto</p>}
      </figure>
    </li>
  );
}

/** A patient review card: stars, the quote, then the reviewer. */
export function ReviewCard({ r }: { r: Review }) {
  return (
    <li className="w-[min(82vw,400px)] shrink-0">
      <figure className="m-0 flex h-full flex-col rounded-[22px] border border-ndm-ink/[.06] bg-white p-6 shadow-[0_24px_50px_-40px_rgba(27,36,43,.35)]">
        <Stars />
        <blockquote className="mt-4 font-inter text-[15.5px] leading-[1.6] text-ndm-ink">“{r.quote}”</blockquote>
        <figcaption className="mt-auto flex items-center gap-3 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- reviewer photo on the clinic's own site */}
          <img src={withBase(r.photo)} alt="" loading="lazy" className="size-11 shrink-0 rounded-full bg-ndm-mist object-cover" />
          <span>
            <span className="block font-inter text-[14.5px] font-medium text-ndm-ink">{r.name}</span>
            <span className="block font-inter text-[13px] text-ndm-muted">{r.tag}</span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

export const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

/** Five gold stars filled to a fractional score (4.5 shows four and a half). */
export function GoogleStars({ value }: { value: number }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`Rated ${value} out of 5 on Google`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="relative inline-block size-[18px]">
          <Star width="18" height="18" className="absolute inset-0 text-ndm-ink/15" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${clamp01(value - i) * 100}%` }}>
            <Star width="18" height="18" className="text-[#F2B01E]" />
          </span>
        </span>
      ))}
    </span>
  );
}
