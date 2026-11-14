"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base-path";

/* the midface thread vectors, drawn from one entry point */
const FACE_PATHS = [
  "M544.2,609.5 Q417.4,657.4 309.3,738.9",
  "M544.2,609.5 Q441.9,689.8 357.8,789.4",
  "M544.2,609.5 Q503.4,720.8 406.4,825.0",
  "M544.2,609.5 Q546.1,719.5 454.2,860.6",
  "M544.2,609.5 Q594.0,729.9 512.5,883.2",
];
/* the body chart: one fan of threads per area, [entry point, curves] */
const BODY_FANS: [point: [number, number], curves: string[]][] = [
  [[1285, 300], ["Q1302,385 1294,470", "Q1272,388 1252,466"]],
  [[1162, 150], ["Q1062,138 962,176", "Q1082,176 1002,232"]],
  [[1212, 520], ["Q1122,498 1032,520", "Q1132,560 1042,602", "Q1152,602 1082,662"]],
  [[762, 700], ["Q792,780 812,860", "Q842,752 902,822"]],
  [[1002, 960], ["Q1042,1052 1062,1152", "Q1012,1062 992,1162"]],
  [[1052, 1240], ["Q1092,1292 1112,1352", "Q1062,1302 1062,1372"]],
];
const BODY_IMG = "https://newdermamedlaserclinic.com/wp-content/uploads/2025/10/aptos.jpg";
const SWITCH_MS = 5200;

interface AptosFigureProps {
  className?: string;
  /** Only the face: its thread lines redraw every few seconds instead of switching to the body chart. */
  faceOnly?: boolean;
}

/**
 * The Aptos figure: the midface thread vectors drawn over a photo. Every few seconds, while it is on
 * screen, it cross-fades to the body chart with its own vectors and back (or, with `faceOnly`, redraws
 * the face lines). Still with reduced motion.
 */
export function AptosFigure({ className = "h-full min-h-[480px] rounded-[22px] shadow-[0_26px_60px_-30px_rgba(53,40,98,.55)]", faceOnly = false }: AptosFigureProps) {
  const box = useRef<HTMLElement>(null);
  const [body, setBody] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(() => (faceOnly ? setRun((v) => v + 1) : setBody((v) => !v)), SWITCH_MS);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [faceOnly]);

  const layer = "absolute inset-0 transition-opacity duration-1000";
  return (
    <figure ref={box} className={`relative m-0 overflow-hidden bg-[#2A2050] ${className}`}>
      <div className={layer} style={{ opacity: body ? 0 : 1 }} aria-hidden={body}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn over by an SVG with the same box; used at its own size */}
        <img src={withBase("/assets/aptos/midface-vectors.jpg")} alt="Aptos Visage Excellence midface thread vectors" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <svg key={`f${body}${run}`} className="absolute inset-0 h-full w-full" viewBox="0 0 880 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {FACE_PATHS.map((d, i) => (
            <path key={i} className="ind-run" pathLength="1" d={d} style={{ animationDelay: `${i * 0.32}s` }} />
          ))}
          <circle className="ind-o" cx="544.2" cy="609.5" r="9" />
          <circle className="ind-o2" cx="544.2" cy="609.5" r="9" />
        </svg>
      </div>
      {!faceOnly && (
        <div className={layer} style={{ opacity: body ? 1 : 0 }} aria-hidden={!body}>
          {/* eslint-disable-next-line @next/next/no-img-element -- served by the clinic's own site, as in the prototype */}
          <img src={withBase(BODY_IMG)} alt="Body areas where Aptos threads can be placed: décolleté, arms, abdomen, buttocks, inner thighs and knees" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-right" />
          <svg key={`b${body}`} className="absolute inset-0 h-full w-full" viewBox="0 0 1406 1406" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
            {BODY_FANS.map(([[x, y], curves], f) => (
              <g key={f}>
                {curves.map((q, i) => (
                  <path key={i} className="ind-run" pathLength="1" d={`M${x},${y} ${q}`} style={{ strokeWidth: 9, animationDelay: `${(f * 0.22 + i * 0.3).toFixed(2)}s` }} />
                ))}
                <circle className="ind-o" cx={x} cy={y} r="11" />
                <circle className="ind-o2" cx={x} cy={y} r="11" style={{ animationDelay: `${(f * 0.3).toFixed(2)}s` }} />
              </g>
            ))}
          </svg>
        </div>
      )}
    </figure>
  );
}
