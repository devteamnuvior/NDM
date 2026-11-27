import type { ComponentType, ReactNode, SVGProps } from "react";

/* Small line icons for the team's areas of focus. Paths are the prototype's. */

type TeamIconProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & { size?: number };

function TeamSvg({ children, size = 16, ...p }: TeamIconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <g stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

const TeamIconSpark = (p: TeamIconProps) => <TeamSvg {...p}><path d="M10.5 3.5c.7 4.2 2.3 5.8 6.5 6.5-4.2.7-5.8 2.3-6.5 6.5-.7-4.2-2.3-5.8-6.5-6.5 4.2-.7 5.8-2.3 6.5-6.5Z" /><path d="M18 15v5M15.5 17.5h5" /></TeamSvg>;
const TeamIconSyringe = (p: TeamIconProps) => <TeamSvg {...p}><path d="m18 3 3 3M19.5 4.5 16 8M14 6l4 4" /><path d="m15 7 2 2-7.5 7.5-2-2Z" /><path d="m13 10 1 1M11 12l1 1M8.5 15.5 4 20" /></TeamSvg>;
const TeamIconLaser = (p: TeamIconProps) => <TeamSvg {...p}><rect x="8.5" y="2.5" width="7" height="6" rx="1.5" /><path d="M12 8.5v9M4.5 20.5h15M7.5 16.5l2 2M16.5 16.5l-2 2" /></TeamSvg>;
const TeamIconDrop = (p: TeamIconProps) => <TeamSvg {...p}><path d="M12 3.5c-3.2 3.6-6 7.3-6 10.5a6 6 0 0 0 12 0c0-3.2-2.8-6.9-6-10.5Z" /><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" /></TeamSvg>;
const TeamIconSkin = (p: TeamIconProps) => <TeamSvg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="9" cy="9.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="10.2" r=".9" fill="currentColor" stroke="none" /><circle cx="11.6" cy="15" r="1.3" fill="currentColor" stroke="none" /></TeamSvg>;
const TeamIconHeart = (p: TeamIconProps) => <TeamSvg {...p}><path d="M12 20s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.6 12 20 12 20Z" /></TeamSvg>;
const TeamIconShield = (p: TeamIconProps) => <TeamSvg {...p}><path d="M12 3 5 6v5.5c0 4.2 3 8 7 9.5 4-1.5 7-5.3 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2 3.8-3.9" /></TeamSvg>;
const TeamIconVein = (p: TeamIconProps) => <TeamSvg {...p}><path d="M12 21v-6M12 15c0-3-6-3.5-6-8.5V3M12 15c0-3 6-3.5 6-8.5V3M6 8.5 3.5 10M18 8.5l2.5 1.5" /></TeamSvg>;
const TeamIconCap = (p: TeamIconProps) => <TeamSvg {...p}><path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z" /><path d="M6.5 11.2V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.8M21.5 9v5.5" /></TeamSvg>;
const TeamIconHospital = (p: TeamIconProps) => <TeamSvg {...p}><path d="M4.5 20.5V8A1.5 1.5 0 0 1 6 6.5h3V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5h3A1.5 1.5 0 0 1 19.5 8v12.5M3 20.5h18M12 7v4.5M9.75 9.25h4.5M10 20.5V17h4v3.5" /></TeamSvg>;
const TeamIconHourglass = (p: TeamIconProps) => <TeamSvg {...p}><path d="M6.5 3.5h11M6.5 20.5h11M8 3.5v2.2c0 2 1.6 3.4 4 6.3 2.4-2.9 4-4.3 4-6.3V3.5M8 20.5v-2.2c0-2 1.6-3.4 4-6.3 2.4 2.9 4 4.3 4 6.3v2.2" /></TeamSvg>;
const TeamIconFlask = (p: TeamIconProps) => <TeamSvg {...p}><path d="M9.5 3.5h5M10.5 3.5v5.3L5 18.2a1.6 1.6 0 0 0 1.4 2.3h11.2a1.6 1.6 0 0 0 1.4-2.3l-5.5-9.4V3.5M7.6 14h8.8" /></TeamSvg>;
const TeamIconPlan = (p: TeamIconProps) => <TeamSvg {...p}><path d="M9 4.5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="3" rx="1" /><path d="m9 13.5 2 2 4-4.2" /></TeamSvg>;

export type TeamIconId = "spark" | "syringe" | "laser" | "drop" | "skin" | "heart" | "shield" | "vein" | "cap" | "hospital" | "hourglass" | "flask" | "plan";

export const TEAM_ICONS: Record<TeamIconId, ComponentType<TeamIconProps>> = {
  spark: TeamIconSpark,
  syringe: TeamIconSyringe,
  laser: TeamIconLaser,
  drop: TeamIconDrop,
  skin: TeamIconSkin,
  heart: TeamIconHeart,
  shield: TeamIconShield,
  vein: TeamIconVein,
  cap: TeamIconCap,
  hospital: TeamIconHospital,
  hourglass: TeamIconHourglass,
  flask: TeamIconFlask,
  plan: TeamIconPlan,
};
