"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AWARD_BADGES } from "@/components/reviews/award-badges";

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const LAST = YEARS.length + 3;

/**
 * Top Choice Award motion: the badges appear left to right with their year, then "8", then the words;
 * a short hold, a soft fade, and it starts again. It runs only while it is on screen.
 */
export function AwardsMotion({ className = "" }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  /* the server and reduced motion show everything; the motion starts from nothing once it is on screen */
  const [step, setStep] = useState(LAST);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    const play = () => {
      setOut(false);
      setStep(0);
      let i = 0;
      const tick = () => {
        i += 1;
        setStep(i);
        if (i < LAST) t = setTimeout(tick, i < YEARS.length ? 240 : 480);
        else
          t = setTimeout(() => {
            setOut(true);
            t = setTimeout(play, 650);
          }, 3400);
      };
      t = setTimeout(tick, 250);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          play();
        } else if (!e.isIntersecting && running) {
          running = false;
          clearTimeout(t);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);
  return (
    <div ref={box} className={`aw-motion ${out ? "is-out" : ""} ${className}`}>
      <ul className="aw-row" role="list" aria-label="Top Choice Award, every year from 2019 to 2026">
        {YEARS.map((y, i) => (
          <li key={y} className={`aw-b ${step > i ? "on" : ""}`}>
            <Image src={AWARD_BADGES[y]} alt={`Top Choice Award ${y}`} sizes="80px" draggable={false} />
            <span>{y}</span>
          </li>
        ))}
      </ul>
      <p className="aw-txt">
        <span className={`aw-n font-aeonik ${step > YEARS.length ? "on" : ""}`}>8</span>
        <span className="aw-words">
          <span className={`aw-t1 font-aeonik ${step > YEARS.length + 1 ? "on" : ""}`}>Years of Excellence</span>
          <span className={`aw-t2 font-inter ${step > YEARS.length + 2 ? "on" : ""}`}>Toronto’s Top Choice Cosmetic Clinic</span>
        </span>
      </p>
    </div>
  );
}
