#!/usr/bin/env python3
"""
The Black Friday look of the VIP Sale page (user, 2026-11-19): /black-friday has the VIP Sale page's layout
(components/sale/vip-sale-v2.tsx) in the Black Friday colours (true black, signal red). This script writes
src/styles/page-black-friday-v2.css from the VIP Sale page's own colours, so the two never drift apart:

  * every colour of the VIP look is mapped: gold -> signal red (same lightness), the blue accent -> deep red,
    navy and the blue-greys -> warm neutral greys of the same lightness; other colours stay;
  * the rules of styles/page-vip-sale.css and page-vip-sale-v2.css that carry colours are repeated under
    html.vbf (the class the Black Friday page adds next to "vip") with the mapped colours;
  * the colours written in the page's Tailwind classes are CSS variables (--v-<hex>): their VIP value on :root,
    their Black Friday value under html.vbf. With --rewrite-tsx it turns new "[#hex]" classes into variables.

Run in web/: python3 scripts/make_bf_look.py [--rewrite-tsx]. Never edit the CSS file by hand.
"""
import colorsys
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TSX = ROOT / "src/components/sale/vip-sale-v2.tsx"
SOURCES = [ROOT / "src/styles/page-vip-sale.css", ROOT / "src/styles/page-vip-sale-v2.css"]
OUT = ROOT / "src/styles/page-black-friday-v2.css"

HEX = re.compile(r"#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b")
RGBA = re.compile(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+\s*)?\)")


def bf(r: int, g: int, b: int) -> tuple[int, int, int]:
    """One VIP colour in the Black Friday palette."""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    deg = h * 360
    if s > 0.25 and 28 <= deg <= 58 and l < 0.9:  # gold (the warm off-whites stay): mid golds become signal red (#D3121F is about 45% light), pale golds pale red
        nh, ns = 356 / 360, max(s, 0.84)
        nl = 0.42 + (l - 0.35) * 0.3 if 0.35 <= l <= 0.74 else l
    elif 185 <= deg <= 230 and s > 0.55 and 0.2 < l < 0.62:  # the blue accent
        nh, ns, nl = 356 / 360, 0.86, l * 0.98
    elif 185 <= deg <= 230:  # navy and the blue-greys; the dark ones go to the Black Friday page's true black
        nh, ns, nl = 10 / 360, s * 0.1, (l * 0.55 if l < 0.3 else l)
    else:
        return r, g, b
    nr, ng, nb = colorsys.hls_to_rgb(nh, nl, ns)
    return round(nr * 255), round(ng * 255), round(nb * 255)


def hex_of(rgb: tuple[int, int, int]) -> str:
    return "#%02X%02X%02X" % rgb


def parse_hex(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def map_colours(text: str) -> str:
    text = HEX.sub(lambda m: hex_of(bf(*parse_hex(m.group(0)))), text)
    return RGBA.sub(lambda m: "rgba(%d,%d,%d%s)" % (*bf(int(m.group(1)), int(m.group(2)), int(m.group(3))), (m.group(4) or ",1").replace(" ", "")), text)


def has_colour(text: str) -> bool:
    return bool(HEX.search(text) or RGBA.search(text))


def blocks(css: str):
    """Top-level (prelude, body) pairs of a stylesheet, comments removed."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    i, n = 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j < 0:
            return
        depth, k = 1, j + 1
        while k < n and depth:
            depth += {"{": 1, "}": -1}.get(css[k], 0)
            k += 1
        yield css[i:j].strip(), css[j + 1 : k - 1]
        i = k


def scope(selectors: str) -> str:
    out = []
    for sel in selectors.split(","):
        sel = sel.strip()
        if sel.startswith("html.vip"):
            out.append("html.vip.vbf" + sel[len("html.vip") :])
        elif sel.startswith("html") or sel.startswith(":root"):
            out.append(sel.replace("html", "html.vbf", 1))
        else:
            out.append("html.vbf " + sel)
    return ",".join(out)


def top_split(value: str) -> list[str]:
    """Split on commas that are not inside brackets."""
    parts, depth, cur = [], 0, ""
    for ch in value:
        depth += {"(": 1, ")": -1}.get(ch, 0)
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    return parts + [cur]


def longhand(d: str) -> str:
    """`background:` resets background-clip (text fills drawn with background-clip:text turn into blocks): the
    override sets only the image and the colour it carries."""
    prop, _, value = d.partition(":")
    if prop.strip() != "background" or "gradient(" not in value:
        return d
    layers = [x.strip() for x in top_split(value.replace("!important", ""))]
    colour = layers[-1] if "gradient(" not in layers[-1] and "url(" not in layers[-1] else ""
    images = layers[:-1] if colour else layers
    out = "background-image:" + ",".join(images)
    return out + (";background-color:" + colour if colour else "")


def declarations(body: str, renamed: dict[str, str]) -> str:
    keep = []
    for d in body.split(";"):
        d = d.strip()
        if not d:
            continue
        uses_frames = d.split(":", 1)[0].strip().startswith("animation") and any(re.search(rf"\b{k}\b", d) for k in renamed)
        if has_colour(d) or uses_frames:
            for old, new in renamed.items():
                d = re.sub(rf"\b{old}\b", new, d) if d.split(":", 1)[0].strip().startswith("animation") else d
            keep.append(map_colours(longhand(d)))
    return ";".join(keep)


def convert(css: str, renamed: dict[str, str]) -> list[str]:
    out = []
    for prelude, body in blocks(css):
        if prelude.startswith("@keyframes"):
            name = prelude.split()[1]
            if name in renamed:
                out.append(f"@keyframes {renamed[name]}{{{map_colours(body)}}}")
        elif prelude.startswith("@media") or prelude.startswith("@supports"):
            inner = convert(body, renamed)
            if inner:
                out.append(f"{prelude}{{{''.join(inner)}}}")
        elif prelude.startswith("@"):
            continue
        else:
            decl = declarations(body, renamed)
            if decl:
                out.append(f"{scope(prelude)}{{{decl}}}")
    return out


TW = re.compile(r"(?P<pre>(?:[a-z-]+:)*(?P<util>text|bg|border|decoration|from|via|to|ring|outline|fill|stroke|accent|caret|shadow)-)\[#(?P<hex>[0-9A-Fa-f]{6})\]")


def rewrite_tsx() -> None:
    src = TSX.read_text()
    # built in pieces: Tailwind reads every file in web/, and a class-shaped string here would become CSS
    open_, close = "[" + "color:var(--v-", ")" + "]"
    src = TW.sub(lambda m: m.group("pre") + open_ + m.group("hex").upper() + close, src)
    TSX.write_text(src)


def main() -> None:
    if "--rewrite-tsx" in sys.argv:
        rewrite_tsx()
    css_all = "".join(p.read_text() for p in SOURCES)
    frames = {}
    for prelude, body in blocks(css_all):
        if prelude.startswith("@keyframes") and has_colour(body):
            name = prelude.split()[1]
            frames[name] = name + "Bf"
    rules = convert(css_all, frames)
    tokens = sorted(set(re.findall(r"var\(--v-([0-9A-F]{6})\)", TSX.read_text())))
    root = ";".join(f"--v-{t}:#{t}" for t in tokens)
    dark = ";".join(f"--v-{t}:{hex_of(bf(*parse_hex(t)))}" for t in tokens)
    head = "/* Generated by scripts/make_bf_look.py from the VIP Sale page's colours: never edit by hand.\n   The Black Friday look (html.vbf) of the VIP Sale page's layout; the variables are the colours of its classes. */\n"
    OUT.write_text(head + f":root{{{root}}}\nhtml.vbf{{{dark}}}\n" + "\n".join(rules) + "\n")
    print(f"{OUT.relative_to(ROOT)}: {len(tokens)} variables, {len(rules)} rules")


if __name__ == "__main__":
    main()
