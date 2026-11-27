import type { ReactNode, SVGProps } from "react";

/* Icons of the treatment pages: the prototype's paths (TX_ICONS, NAV_ICONS and its small marks). */

export const FACT_ICONS = {
  type: (
    <>
      <path d="m17.5 3.5 3 3M15.5 5.5l3 3M18 7l-9.5 9.5-3-3L15 4" />
      <path d="m5.5 13.5-2 2 2.5 2.5 2-2M3.5 20.5l2-2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13.5 14-14-.5 9-6 14-14 14Z" />
      <path d="M5 19 13 11" />
    </>
  ),
  cal: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
} satisfies Record<string, ReactNode>;
export type FactIconName = keyof typeof FACT_ICONS;

/** The icon of a quick fact, picked from its label. */
export const factIcon = (label: string): FactIconName => (/type/i.test(label) ? "type" : /duration|session/i.test(label) ? "clock" : /recovery|downtime/i.test(label) ? "leaf" : "cal");

export function FactIcon({ name, size }: { name: FactIconName; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {FACT_ICONS[name]}
    </svg>
  );
}

export const NAV_ICONS = {
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.6h.01" />
    </>
  ),
  doc: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </>
  ),
  plus: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8.5v7M8.5 12h7" />
    </>
  ),
  results: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M12 5v14" />
    </>
  ),
  tag: (
    <>
      <path d="M4 12.5v-7A1.5 1.5 0 0 1 5.5 4h7l7.5 7.5a1.5 1.5 0 0 1 0 2.1l-5.9 5.9a1.5 1.5 0 0 1-2.1 0L4 12.5Z" />
      <circle cx="8.5" cy="8.5" r="1.1" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.1 2.3c-.7.26-1.2.9-1.2 1.6v.3M12 16.5h.01" />
    </>
  ),
  star: <path d="M12 3.6l2.4 4.9 5.4.6-4 3.6 1.1 5.3L12 15.7 7.1 18l1.1-5.3-4-3.6 5.4-.6L12 3.6Z" />,
  building: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 8h0M12 8h0M15 8h0M9 12h0M12 12h0M15 12h0M10 20.5V16h4v4.5" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.4l5.2 3.6L10 15.6Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5l7 3v5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9v-5l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  list: <path d="M9 6.5h10M9 12h10M9 17.5h10M5 6.5h.01M5 12h.01M5 17.5h.01" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11.5 12 4l8.5 7.5" />
      <path d="M5.5 10v9.5h13V10" />
      <path d="M10 19.5v-5h4v5" />
    </>
  ),
} satisfies Record<string, ReactNode>;
export type NavIconName = keyof typeof NAV_ICONS;

/** The icon of a section link, picked from the section's id and label. */
export function navIcon(id: string, label: string): NavIconName {
  const s = `${id} ${label}`.toLowerCase();
  if (/faq/.test(s)) return "help";
  if (/pric|fee|cost/.test(s)) return "tag";
  if (/result|before|after|gallery/.test(s)) return "results";
  if (/combin|elevate|pair|together/.test(s)) return "plus";
  if (/benefit/.test(s)) return "star";
  if (/visit|location|map/.test(s)) return "pin";
  if (/clinic|film|inside|space/.test(s)) return "building";
  if (/watch|video|reel/.test(s)) return "play";
  if (/why|safe|trust/.test(s)) return "shield";
  if (/duration|long|last|course|session/.test(s)) return "clock";
  if (/candidate|who|suit/.test(s)) return "user";
  if (/assess|analysis|consult/.test(s)) return "search";
  if (/overview|about|your treatment|expect|what to|understand/.test(s)) return "doc";
  if (/option|how|work|care|mainten/.test(s)) return "list";
  return "info";
}

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {NAV_ICONS[name]}
    </svg>
  );
}

type MarkProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & { size?: number };
const Mark = ({ size = 14, children, ...p }: MarkProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true" {...p}>
    {children}
  </svg>
);
export const IconTick = (p: MarkProps) => (
  <Mark {...p}>
    <path d="m3 7.3 2.6 2.6L11 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Mark>
);
export const IconCross = (p: MarkProps) => (
  <Mark {...p}>
    <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </Mark>
);
export const IconInfoSmall = (p: MarkProps) => (
  <Mark {...p}>
    <circle cx="7" cy="7" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 6.2v3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7" cy="4.2" r=".85" fill="currentColor" />
  </Mark>
);
