import type { ReactNode } from "react";

/* Line icons of the booking picker's categories. Each has one or two moving parts (classes "bi-*") that
   booking.css plays once when the category is hovered or opened. */

const ICONS: Record<string, ReactNode> = {
  Face: (
    <>
      <path d="M12 3.5c-3.7 0-6.2 2.7-6.2 6.6 0 4.8 2.8 10.4 6.2 10.4s6.2-5.6 6.2-10.4c0-3.9-2.5-6.6-6.2-6.6Z" />
      <g className="bi-blink">
        <path d="M9.3 9.9v1.3M14.7 9.9v1.3" />
      </g>
      <path className="bi-smile" d="M9.7 14.8c.7.7 1.4 1 2.3 1s1.6-.3 2.3-1" />
    </>
  ),
  Skin: (
    <>
      <g className="bi-drop">
        <path d="M11 4.5s-5 5.6-5 9.4a5 5 0 0 0 10 0c0-3.8-5-9.4-5-9.4Z" />
        <path d="M8.6 14.3a2.5 2.5 0 0 0 2 2.3" />
      </g>
      <path className="bi-twinkle" d="M18.5 3.5v3.4M16.8 5.2h3.4" />
    </>
  ),
  Body: (
    <g className="bi-breathe">
      <path d="M8 3.5c0 3.2 1.7 4.3 1.7 6.6S7.4 14 7.4 20.5" />
      <path d="M16 3.5c0 3.2-1.7 4.3-1.7 6.6s2.3 3.9 2.3 10.4" />
      <path d="M12 14.6h.01" strokeWidth="2" />
    </g>
  ),
  Hair: (
    <>
      <path className="bi-sway" d="M7 4c2 2.6-2 5.2 0 8s-2 5.4 0 8" />
      <path className="bi-sway bi-sway-2" d="M12 4c2 2.6-2 5.2 0 8s-2 5.4 0 8" />
      <path className="bi-sway bi-sway-3" d="M17 4c2 2.6-2 5.2 0 8s-2 5.4 0 8" />
    </>
  ),
  Injectables: (
    <g transform="rotate(-45 12 12)">
      <rect x="7.5" y="9" width="9" height="6" rx="1.2" />
      <path d="M7.5 12H3.6M10.5 9v2.2M13.5 9v2.2" />
      <g className="bi-plunge">
        <path d="M16.5 12h3.6M20.1 9.6v4.8" />
      </g>
      <path className="bi-bead" d="M1.7 12h.01" strokeWidth="2" />
    </g>
  ),
  "Bio-stimulators": (
    <>
      <path className="bi-turn" d="m12 3.5 6.9 4v8l-6.9 4-6.9-4v-8Z" />
      <circle className="bi-pulse" cx="12" cy="11.5" r="2.3" />
    </>
  ),
  "Thread lift": (
    <>
      <path className="bi-draw" pathLength={1} d="M4 18c3-6.5 5.5 2 8.5-4s3.5-5.5 7-7.5" />
      <path className="bi-rise" d="M16.3 5.5h3.7v3.7" />
    </>
  ),
  Treatments: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path className="bi-rays" d="M12 3.5V6M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M6 18l1.8-1.8M16.2 7.8 18 6" />
    </>
  ),
  /* the two standing choices under the options */
  scan: (
    <>
      <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
      <path d="M8 12h8" />
    </>
  ),
  note: <path d="M4.5 19.5 5.3 16 15.8 5.5a1.7 1.7 0 0 1 2.4 0l.3.3a1.7 1.7 0 0 1 0 2.4L8 18.7ZM13.8 7.5l2.7 2.7" />,
};

export function BookIcon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}
