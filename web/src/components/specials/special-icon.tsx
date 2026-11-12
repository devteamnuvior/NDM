import type { ReactNode } from "react";
import type { SpecialIconName } from "@/config/specials";

const PATHS: Record<SpecialIconName, ReactNode> = {
  pen: (
    <>
      <path d="M15.5 3.5 20.5 8.5 11 18l-5-5 9.5-9.5Z" />
      <path d="m6 13-2.5 2.5M8.5 15.5 6 18M11 18l-2.5 2.5" />
    </>
  ),
  lips: (
    <>
      <path d="M2.5 12c2.2-3.3 4.6-5 6.3-5 1.2 0 2.1.9 3.2.9s2-.9 3.2-.9c1.7 0 4.1 1.7 6.3 5-2.6 3.3-5.8 5-9.5 5s-6.9-1.7-9.5-5Z" />
      <path d="M2.5 12c3 .8 6.2 1.2 9.5 1.2s6.5-.4 9.5-1.2" />
    </>
  ),
  syringe: (
    <>
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 0 1 0-1.4L15 5" />
      <path d="m9 11 4 4" />
      <path d="m5 19-3 3" />
      <path d="m14 4 6 6" />
    </>
  ),
  hand: (
    <>
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </>
  ),
  drop: (
    <>
      <path d="M12 2.7s6.5 6.6 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.3 12 2.7 12 2.7Z" />
      <path d="M9 14.5a3 3 0 0 0 3 3" />
    </>
  ),
  face: (
    <>
      <path d="M12 3C8 3 5.5 6 5.5 10.5c0 5 3 9.5 6.5 9.5s6.5-4.5 6.5-9.5C18.5 6 16 3 12 3Z" />
      <path d="m8 15.5-2.2-2.2M16 15.5l2.2-2.2" />
      <path d="M12 7.5v3M10.5 9h3" />
    </>
  ),
};

/** Line icon of an offer (the prototype's SW_ICONS paths). */
export function SpecialIcon({ name }: { name: SpecialIconName }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
