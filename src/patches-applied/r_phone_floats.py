"""Phones, both shells (user, 2026-11-25; the same as the Next.js site): the chat note never opens on phones and the chat
button is 48px; no floating search button on the Pricing page (it has its own search box), so the chat button takes its
place; while the cart bar shows, the Black Friday tab steps out of its way; the cart bar is a little slimmer.
Applied once: python3 src/patches-applied/r_phone_floats.py .   (do not run again)
"""
import sys
from pathlib import Path

root = Path(sys.argv[1])
for name in ["index.html", "promotion.html"]:
    f = root / name
    s = f.read_text(encoding="utf-8")

    def rep(a, b):
        global s
        assert a in s, (name, a[:80])
        s = s.replace(a, b, 1)

    rep("  const bottom = small ? Math.max(16, avoid) + 64 : Math.max(24, avoid);",
        "  /* phones: above the floating search button, or in its place on the Pricing page, which has none (2026-11-25) */\n  const bottom = small ? Math.max(16, avoid) + (HERE === 'pricing.html' ? 0 : 64) : Math.max(24, avoid);")
    rep("      {note && !open && !off && (!small || clear) && (",
        "      {/* the note never opens on phones (user, 2026-11-25: it crowded the bottom of the screen) */}\n      {note && !open && !off && !small && (")
    rep("className={`chat-btn chat-launch fixed z-[61] grid size-[56px] place-items-center rounded-full text-white md:size-[62px] ${off ? 'is-off' : ''} ${note && !open ? 'has-note' : ''}",
        "className={`chat-btn chat-launch fixed z-[61] grid size-[48px] place-items-center rounded-full text-white md:size-[62px] ${off ? 'is-off' : ''} ${note && !open && !small ? 'has-note' : ''}")
    rep("        {note && !open && <i aria-hidden=\"true\" className=\"absolute -right-1 -top-1",
        "        {note && !open && !small && <i aria-hidden=\"true\" className=\"absolute -right-1 -top-1")
    if name == "index.html":
        rep("<FloatSearch onOpen={() => setSearch(true)} hidden={!introDone || search || drawer || cartOpen} />",
            "<FloatSearch onOpen={() => setSearch(true)} hidden={!introDone || search || drawer || cartOpen || HERE === 'pricing.html'} />")
    else:
        rep("<FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />",
            "<FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen || HERE === 'pricing.html'} />")
    rep("className={`cart-pill fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-full bg-ndm-deep py-2 pl-2 pr-2 text-left",
        "className={`cart-pill fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-full bg-ndm-deep py-1.5 pl-1.5 pr-1.5 sm:py-2 sm:pl-2 sm:pr-2 text-left")
    rep("  .chat-pop-msg{animation:chatNote .45s var(--e-out) both}\n",
        "  .chat-pop-msg{animation:chatNote .45s var(--e-out) both}\n"
        "  /* phones (user, 2026-11-25): while the cart bar shows, the Black Friday tab steps out of its way instead of sitting on it */\n"
        "  @media (max-width:767px){body:has(.cart-pill:not(.is-off)) .bfd-tab.is-on{transform:translate(-50%,110%);pointer-events:none}}\n")
    f.write_text(s, encoding="utf-8")
    print("patched", name)
# 2026-11-25, later (user): a smaller Black Friday tab on phones; the rule was written into both shells' styles directly
# (after "@media (max-width:420px){.bfd-badge{display:none}}"), the same as web/src/styles/black-friday.css.
