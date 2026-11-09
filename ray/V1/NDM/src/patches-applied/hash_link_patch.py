"""Site audit, 8 Nov 2026: links to a section of another page land on that section (both shells).
The pages are drawn by script after the browser has looked for the #anchor, so every link such as
pricing.html#pg-dermal-fillers-h (offer cards, "see prices"), about.html#contact or concerns.html#face-aging opened the
page at the top, with the price group still folded. Now, once the target exists, a folded price group (or the group the
target sits in) opens, and the page scrolls it just below the header. "#/..." links (booking, placeholders) are left alone.
Idempotent."""
import re
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
MOUNT = "ReactDOM.createRoot(document.getElementById('root')).render(<App />);"
ADD = MOUNT + r'''
/* a link to a section of this page (pricing.html#pg-dermal-fillers-h, about.html#contact): the page is drawn after the
   browser looked for the anchor, so find it once it exists, unfold its price group, and bring it under the header */
(() => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || id.startsWith('/')) return;
  let tries = 0;
  const go = () => {
    const el = document.getElementById(id);
    if (!el) { if (++tries < 50) setTimeout(go, 100); return; }
    for (let a = el.parentElement; a; a = a.parentElement) {
      const b = a.id && document.querySelector(`[aria-controls="${a.id}"][aria-expanded="false"]`);
      if (b) b.click();
    }
    if (el.getAttribute('aria-expanded') === 'false') el.click();
    /* an instant jump, like a plain anchor link, then two checks in case images or sections above it are still growing */
    const jump = () => {
      const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 110);
      if (Math.abs(el.getBoundingClientRect().top - 110) < 24) return;
      window.scrollTo(0, y);
      if (lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: true, force: true }); }
    };
    [150, 600, 1500].forEach((t) => setTimeout(jump, t));
  };
  setTimeout(go, 60);
})();'''

for name in ('index.html', 'promotion.html'):
    p = root / name
    s = p.read_text(encoding='utf-8')
    if ADD in s:
        print(f'{name}: already patched'); continue
    s = re.sub(re.escape(MOUNT) + r'\n/\* a link to a section of this page.*?\n\}\)\(\);', lambda m: MOUNT, s, count=1, flags=re.S)   # an earlier version
    assert s.count(MOUNT) == 1, name
    p.write_text(s.replace(MOUNT, ADD), encoding='utf-8')
    print(f'{name}: patched')
