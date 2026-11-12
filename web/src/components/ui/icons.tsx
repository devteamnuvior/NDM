import type { SVGProps } from "react";

/* Icons: Figma paths recoloured to currentColor. No client code, usable from Server and Client Components. */

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & { size?: number };

function Svg({ size = 24, vb = "0 0 24 24", children, ...p }: IconProps & { vb?: string }) {
  return (
    <svg width={size} height={size} viewBox={vb} fill="none" aria-hidden="true" {...p}>
      {children}
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20.7555 11.7666C20.7555 16.7308 16.7311 20.7552 11.7669 20.7552C6.80265 20.7552 2.77834 16.7308 2.77834 11.7666C2.77834 6.80235 6.80265 2.77804 11.7669 2.77804C16.7311 2.77804 20.7555 6.80235 20.7555 11.7666Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.0186 18.4851L21.5426 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M16 6.75C16 8.95914 14.2091 10.75 12 10.75C9.79086 10.75 8 8.95914 8 6.75C8 4.54086 9.79086 2.75 12 2.75C14.2091 2.75 16 4.54086 16 6.75Z" stroke="currentColor" strokeLinecap="round" />
      <path d="M3 22V19.75C3 16.4363 6.2 13.75 12 13.75C17.8 13.75 21 16.4363 21 19.75V22" stroke="currentColor" />
    </Svg>
  );
}

export function IconBag(p: IconProps) {
  return (
    <Svg size={20} vb="0 0 20 20" {...p}>
      <path d="M5 1.66667L2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5L15 1.66667H5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 5H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.3333 8.33333C13.3333 10.1743 11.8409 11.6667 10 11.6667C8.15905 11.6667 6.66667 10.1743 6.66667 8.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconChevron(p: Omit<SVGProps<SVGSVGElement>, "viewBox">) {
  return (
    <svg width="11" height="6" viewBox="0 0 11 6" fill="none" aria-hidden="true" {...p}>
      <path d="M0.320975 1.38843L4.43473 5.50218C4.66914 5.73652 4.98702 5.86816 5.31848 5.86816C5.64993 5.86816 5.96782 5.73652 6.20223 5.50218L10.3135 1.39093L9.72431 0.801765L5.61306 4.91301C5.53492 4.99113 5.42896 5.03501 5.31848 5.03501C5.20799 5.03501 5.10203 4.99113 5.02389 4.91301L0.910142 0.799265L0.320975 1.38843Z" fill="currentColor" />
    </svg>
  );
}

export function IconPhone(p: IconProps) {
  return (
    <Svg size={14} {...p}>
      <path d="M21 16.5v2.6a1.8 1.8 0 0 1-2 1.8 17.8 17.8 0 0 1-7.7-2.7 17.5 17.5 0 0 1-5.4-5.4A17.8 17.8 0 0 1 3.2 5a1.8 1.8 0 0 1 1.8-2h2.6a1.8 1.8 0 0 1 1.8 1.5c.1.9.4 1.7.7 2.5a1.8 1.8 0 0 1-.4 1.9L8.6 10a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.6 2.5.7a1.8 1.8 0 0 1 1.5 1.9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconArrow({ size = 14, ...p }: IconProps) {
  return (
    <Svg size={size} vb="0 0 16 16" {...p}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconExternal({ size = 12, ...p }: IconProps) {
  return (
    <Svg size={size} vb="0 0 16 16" {...p}>
      <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconMenu(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 8h16M4 16h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheckBadge(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Star(p: Omit<SVGProps<SVGSVGElement>, "viewBox">) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M10 1.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L10 15l-5.3 2.8 1.1-5.9L1.4 7.8l6-.8z" />
    </svg>
  );
}

/** Five stars, gold up to `rating`. */
export function Stars({ rating = 5, className = "" }: { rating?: number; className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`} role="img" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={i < rating ? "text-[#F2B01E]" : "text-ndm-ink/15"} />
      ))}
    </div>
  );
}

export function IconPin(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </Svg>
  );
}

/* social networks */
export function IconInstagram(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </Svg>
  );
}
export function IconFacebook(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <path d="M14 8.5h2.2V5.2h-2.6C11 5.2 9.8 6.8 9.8 9.3v2H7.8v3.2h2V21H13v-6.5h2.5l.5-3.2h-3V9.6c0-.7.3-1.1 1-1.1Z" fill="currentColor" />
    </Svg>
  );
}
export function IconYouTube(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="m10.2 9.3 4.6 2.7-4.6 2.7V9.3Z" fill="currentColor" />
    </Svg>
  );
}
export function IconX(p: IconProps) {
  return (
    <Svg size={15} {...p}>
      <path d="M4 4h4.6l11.4 16h-4.6L4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M19.6 4 13.3 11M4.4 20l6.3-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
export function IconLinkedIn(p: IconProps) {
  return (
    <Svg size={15} {...p}>
      <rect x="3.5" y="9" width="3.6" height="11" fill="currentColor" />
      <circle cx="5.3" cy="5.4" r="2" fill="currentColor" />
      <path d="M10.2 9h3.4v1.6c.6-1 1.8-1.9 3.6-1.9 3 0 3.6 2 3.6 4.6V20h-3.6v-5.9c0-1.4-.1-2.7-1.8-2.7s-1.9 1.2-1.9 2.6v6h-3.4V9Z" fill="currentColor" />
    </Svg>
  );
}

export function IconMail(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
export function IconAward(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <circle cx="12" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.6 13.4-1.4 7 4.8-2.4 4.8 2.4-1.4-7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconInfo(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="7.9" r="1.05" fill="currentColor" />
    </Svg>
  );
}
