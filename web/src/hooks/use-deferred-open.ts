import { useEffect, useState } from "react";

/**
 * Follows `open` one frame late. A panel that mounts already open still gets its closed frame first,
 * so its slide-in transition always plays.
 */
export function useDeferredOpen(open: boolean): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(open));
    return () => cancelAnimationFrame(raf);
  }, [open]);
  return shown;
}
