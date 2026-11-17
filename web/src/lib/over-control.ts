/**
 * Whether a floating piece of the site (the chat button, its note, the phone search button) lies over a control of
 * the page: a button or a short link counts, a whole card that is one link does not. Nine points of its box are
 * looked at, `dx` and `dy` in from its edges. The floating pieces themselves are never counted. Browser only.
 */
/**
 * Phones: whether the floating chat and search buttons wait their turn. While the opening screen of a page
 * marked `data-float-hold` (the home hero) still fills more than half of the window they stay away, so the
 * first screen is not crowded (user, 2026-11-17); they come in once it has scrolled past. Browser only.
 */
export function floatHeld(): boolean {
  if (window.innerWidth >= 640) return false;
  const el = document.querySelector("[data-float-hold]");
  return !!el && el.getBoundingClientRect().bottom > window.innerHeight * 0.5;
}

export function overControl(el: HTMLElement | null, dx: number, dy: number): boolean {
  if (!el) return false;
  const seen = el.getBoundingClientRect();
  if (!seen.width) return false;
  /* its full size around its middle: a piece that has stepped aside is drawn smaller (scaled down as it fades), and
     measured that way it would look clear, come back, cover the control again, and flicker */
  const cx = seen.left + seen.width / 2;
  const cy = seen.top + seen.height / 2;
  const w = el.offsetWidth / 2;
  const h = el.offsetHeight / 2;
  return [cx - w + dx, cx, cx + w - dx].some((x) =>
    [cy - h + dy, cy, cy + h - dy].some((y) =>
      document.elementsFromPoint(x, y).some((under) => {
        if (under.closest(".chat-pop, .chat-launch, .chat-panel, .float-search")) return false;
        const control = under.closest('a[href], button, input, select, textarea, [role="button"], [role="tab"]');
        return !!control && control.getBoundingClientRect().height <= 72;
      }),
    ),
  );
}
