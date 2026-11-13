import Image, { type StaticImageData } from "next/image";
import { Fragment } from "react";
import clinicFront from "@/assets/images/clinic/clinic-1.jpg";
import clinicLounge from "@/assets/images/clinic/clinic-4.jpg";
import reception from "@/assets/images/hero/clinic-reception.jpg";
import treatmentRoom from "@/assets/images/hero/treatment-room.jpg";
import { AboutStage } from "@/components/home/about-stage";
import { CountUp } from "@/components/ui/count-up";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import type { HomeCopy } from "@/types/home";

type Pair = [back: StaticImageData, front: StaticImageData];
const PHOTOS: { left: Pair; right: Pair } = { left: [clinicFront, treatmentRoom], right: [clinicLounge, reception] };

/* two overlapping clinic photos floating beside the copy (wide screens only) */
function PhotoPair({ pics, side }: { pics: Pair; side: "l" | "r" }) {
  const frame = "rv rv-clip about-bob relative overflow-hidden rounded-[18px] shadow-[0_24px_50px_-30px_rgba(27,36,43,.5)]";
  return (
    <div aria-hidden="true" data-drift={side === "l" ? 60 : -60} className={`absolute top-[clamp(40px,5vw,84px)] hidden xl:block ${side === "l" ? "left-[clamp(0px,2.4vw,56px)]" : "right-[clamp(0px,2.4vw,56px)]"}`}>
      <div className={`${frame} size-[clamp(176px,14.5vw,236px)]`} style={{ transitionDelay: ".1s" }}>
        <Image src={pics[0]} alt="" sizes="236px" className="h-full w-full object-cover" />
      </div>
      <div
        className={`${frame} about-bob-2 -mt-[clamp(28px,2.6vw,44px)] size-[clamp(184px,15vw,248px)] border-4 border-ndm-paper ${side === "l" ? "ml-[clamp(72px,6vw,104px)]" : "-ml-[clamp(72px,6vw,104px)]"}`}
        style={{ transitionDelay: ".25s" }}
      >
        <Image src={pics[1]} alt="" sizes="248px" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

/** About NewDermaMed: centred copy that lights up word by word, floating photo pairs, and a stats row. */
/* a number of the row: a whole number counts up, its sign ("+") stays after it; anything else is shown as typed */
function Figure({ figure }: { figure: string }) {
  const look = "block font-aeonik text-[clamp(42px,4.4vw,66px)] leading-none tracking-[-0.03em] text-ndm-deep tabular-nums";
  const [, number, suffix] = /^(\d+)(.*)$/.exec(figure) ?? [];
  if (!number) return <span className={look}>{figure}</span>;
  return <CountUp to={Number(number)} suffix={suffix} threshold={0.4} within="[data-about-stats]" className={look} />;
}

export function About({ copy }: { copy: HomeCopy["about"] }) {
  const { tag, lead, strong, text, highlight, stats } = copy;
  const words = text.split(" ");

  return (
    <AboutStage labelledBy="approach" className="relative z-10 overflow-hidden bg-ndm-paper px-[var(--gx)] pt-[clamp(112px,12vw,190px)] pb-[clamp(40px,4.5vw,72px)]">
      <PhotoPair pics={PHOTOS.left} side="l" />
      <PhotoPair pics={PHOTOS.right} side="r" />
      <div className="relative mx-auto max-w-[760px] text-center">
        <Eyebrow className="rv">{tag}</Eyebrow>
        <TwoTone
          id="approach"
          className="rv mx-auto mt-5"
          style={{ transitionDelay: ".06s" }}
          lead={
            <>
              {lead}
              <br />
            </>
          }
          strong={strong}
        />
        <p data-about-copy className="mx-auto mt-5 max-w-[58ch] font-inter text-[clamp(15px,1.2vw,18px)] leading-[1.6] text-ndm-ink">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span data-w="" style={{ opacity: 0.22, transition: "opacity .25s linear" }} className={highlight && w.includes(highlight) ? "text-ndm-deep" : ""}>
                {w}
              </span>
              {i < words.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </p>
      </div>
      <ul data-about-stats className="relative mx-auto mt-[clamp(56px,7vw,104px)] grid max-w-[1240px] grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4" role="list">
        {stats.map((s, i) => (
          <li key={i} className="rv px-2 text-center md:border-l md:border-ndm-ink/10 md:px-6 md:py-2 md:first:border-0" style={{ transitionDelay: `${0.08 * i}s` }}>
            <Figure figure={s.figure} />
            <span aria-hidden="true" className="mx-auto mt-4 block h-[3px] w-8 rounded-full bg-linear-to-r/srgb from-ndm-deep to-ndm-sky" />
            <span className="mx-auto mt-3 block max-w-[18ch] font-aeonik text-[clamp(18px,1.55vw,24px)] leading-[1.22] tracking-[-0.015em] text-ndm-ink">{s.label}</span>
          </li>
        ))}
      </ul>
    </AboutStage>
  );
}
