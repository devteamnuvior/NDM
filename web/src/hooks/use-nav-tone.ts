import { useEffect, useState } from "react";
import { useOnScroll } from "@/hooks/use-on-scroll";

/** The header reads the page 70px from the top: over a `data-nav="dark"` section it turns to dark glass. */
const PROBE_Y = 70;

function overDarkSection(): boolean {
  return Array.from(document.querySelectorAll('[data-nav="dark"]')).some((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= PROBE_Y && r.bottom >= PROBE_Y;
  });
}

/**
 * True while the header sits over a dark section.
 * @param initial what to render before the first measurement (the home page opens on a dark film)
 * @param resetKey re-measure when this changes (the pathname)
 */
export function useNavTone(initial: boolean, resetKey: string): boolean {
  const [dark, setDark] = useState(initial);

  useOnScroll(() => setDark(overDarkSection()));

  useEffect(() => {
    /* the layout can still be settling on the first frame (fonts, images), so measure again shortly after */
    const probe = () => setDark(overDarkSection());
    const timers = [setTimeout(probe, 50), setTimeout(probe, 500), setTimeout(probe, 1500)];
    window.addEventListener("load", probe);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", probe);
    };
  }, [resetKey]);

  return dark;
}
