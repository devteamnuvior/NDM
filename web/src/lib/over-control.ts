/**
 * Whether a floating piece of the site (the chat button, its note, the phone search button) lies over a control of
 * the page: a button or a short link counts, a whole card that is one link does not. Nine points of its box are
 * looked at, `dx` and `dy` in from its edges. The floating pieces themselves are never counted. Browser only.
 */
export function overControl(el: HTMLElement | null, dx: number, dy: number): boolean {
  if (!el) return false;
  const box = el.getBoundingClientRect();
  if (!box.width) return false;
  return [box.left + dx, box.left + box.width / 2, box.right - dx].some((x) =>
    [box.top + dy, box.top + box.height / 2, box.bottom - dy].some((y) =>
      document.elementsFromPoint(x, y).some((under) => {
        if (under.closest(".chat-pop, .chat-launch, .chat-panel, .float-search")) return false;
        const control = under.closest('a[href], button, input, select, textarea, [role="button"], [role="tab"]');
        return !!control && control.getBoundingClientRect().height <= 72;
      }),
    ),
  );
}
