import type { ReactNode } from "react";

/** The centred page behind the sign-in and the "cannot load" panels of the management screen. */
export function ManagerFrame({ children }: { children: ReactNode }) {
  return <div className="grid min-h-[100svh] place-items-center bg-ndm-paper px-[var(--gx)] py-16">{children}</div>;
}
