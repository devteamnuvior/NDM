import type { Page } from "@playwright/test";

/** What one visible element looks like: where it is and how it is styled. */
export interface Mark {
  key: string;
  rect: [x: number, y: number, w: number, h: number];
  style: Record<string, string>;
}

/**
 * Measures every visible element under the given roots. Runs inside the page, so it works the same on
 * the original prototype and on the Next.js build. Colours are read back through a canvas so that
 * `rgba()`, `oklab()` and `color-mix()` spellings of the same colour compare equal.
 */
export async function fingerprint(page: Page, roots: string): Promise<Mark[]> {
  return page.evaluate((rootSel) => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const rgba = (c: string): string => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return a === 0 ? "transparent" : `${r},${g},${b},${a}`;
    };
    const family = (f: string): string =>
      f
        .split(",")
        .map((s) => s.trim().replace(/["']/g, ""))
        .filter((s) => !/fallback/i.test(s))
        .map((s) => s.replace(/^_+/, "").replace(/_[0-9a-f]{4,}$/i, "").replace(/_/g, " "))
        .join(",");
    const px = (v: string): string => (v.endsWith("px") ? String(Math.round(parseFloat(v) * 100) / 100) : v);
    /* Tailwind 3 writes a full radius as 9999px, Tailwind 4 as "infinity": the same pill */
    const radius = (v: string): string => String(Math.min(parseFloat(v) || 0, 9999));

    /* gradients and shadows: every colour inside is read back through the canvas, so spellings do not matter */
    const paint = (v: string): string => {
      if (v === "none") return "";
      let out = v
        .replace(/(rgba?|oklab|oklch|lab|lch|color|color-mix|hsla?)\((?:[^()]|\([^()]*\))*\)/g, (c) => `[${rgba(c)}]`)
        .replace(/\s+in (srgb|oklab)\b/g, "")
        .replace(/\s+/g, " ");
      /* Tailwind pads a shadow list with zero-size layers (3 and 4 pad differently): an invisible layer is not a difference */
      out = out
        .split(/,\s*(?=\[)/)
        .filter((layer) => !/^\[[^\]]*\] 0px 0px 0px 0px$/.test(layer.trim()))
        .join(", ");
      /* Tailwind 4 writes evenly spread gradient stops out ("a 0%, b 50%, c 100%"): the same as leaving them off */
      const stops = out.match(/\] (\d+)%(?=[,)])/g);
      if (stops && /^(linear|radial)-gradient/.test(out)) {
        const at = stops.map((x) => Number(x.match(/\d+/)![0]));
        const even = at.every((x, i) => Math.abs(x - (100 * i) / (at.length - 1)) < 0.6);
        const colours = (out.match(/\[/g) ?? []).length;
        if (even && at.length === colours && at.length > 1) out = out.replace(/\] \d+%(?=[,)])/g, "]");
      }
      /* the build shortens "0%" to "0px" where they mean the same */
      return out.replace(/\b0(px|%)(?=[ ,)]|$)/g, "0");
    };
    /* an overlay drawn with ::before / ::after: what it is filled with, how it blends, and its size */
    const pseudo = (el: Element, which: string): string => {
      const c = getComputedStyle(el, which);
      if (c.content === "none" || c.content === "normal" || c.display === "none") return "";
      return [c.content.slice(0, 12), paint(c.backgroundImage), rgba(c.backgroundColor), c.mixBlendMode, c.position, px(c.width), px(c.height), c.opacity, c.transform === "none" && c.translate === "none" ? "" : "t" /* moved: Tailwind 3 uses transform, Tailwind 4 translate */].join("|");
    };

    const out: { key: string; rect: [number, number, number, number]; style: Record<string, string> }[] = [];
    const seen = new Map<string, number>();
    for (const root of Array.from(document.querySelectorAll(rootSel))) {
      const els = [root, ...Array.from(root.querySelectorAll("a,button,img,p,span,li,i,input,ul,nav,aside,svg,h1,h2,h3,h4,video,small,b,dl,dt,dd,figure,figcaption,article,address,blockquote,label,legend,fieldset,select"))];
      for (const el of els) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (cs.display === "none" || cs.visibility === "hidden" || r.width === 0 || r.height === 0) continue;
        /* skip anything inside a faded-out ancestor (hidden dropdown panels, off-screen ticker lines) */
        let faded = false;
        for (let p: Element | null = el; p; p = p.parentElement) if (getComputedStyle(p).opacity === "0") faded = true;
        if (faded) continue;
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        const label = el.getAttribute("aria-label") ?? "";
        const base = `${el.tagName.toLowerCase()}|${own.slice(0, 48)}|${label}`;
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        /* a rotating element's bounding box changes from frame to frame: its size is not comparable */
        const spinning = cs.animationName !== "none" && /turn|spin/i.test(cs.animationName);
        /* Tailwind 3 draws a divider as the next item's top border, Tailwind 4 as this item's bottom border:
           the line is in the same place, so the border is not compared for children of a divided list */
        const divided = !!el.parentElement?.className.toString().includes("divide-y");
        out.push({
          key: `${base}#${n}`,
          /* for a divided item the box is measured inside its divider line (see `divided` above) */
          rect: (spinning
            ? [0, 0, 0, 0]
            : [r.x, r.y + (divided ? parseFloat(cs.borderTopWidth) : 0), r.width, r.height - (divided ? parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) : 0)].map((v) => Math.round(v * 2) / 2)) as [number, number, number, number],
          style: {
            color: el.tagName === "IMG" ? "" : rgba(cs.color),
            background: rgba(cs.backgroundColor),
            fontFamily: family(cs.fontFamily),
            fontSize: px(cs.fontSize),
            fontWeight: cs.fontWeight,
            letterSpacing: px(cs.letterSpacing),
            lineHeight: px(cs.lineHeight),
            textTransform: cs.textTransform,
            padding: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px).join(" "),
            radius: radius(cs.borderTopLeftRadius),
            borderBottom: divided ? "" : `${px(cs.borderBottomWidth)} ${cs.borderBottomWidth === "0px" ? "" : rgba(cs.borderBottomColor)}`.trim(),
            opacity: cs.opacity,
            display: cs.display,
            backgroundImage: paint(cs.backgroundImage),
            shadow: paint(cs.boxShadow),
            filter: cs.filter,
            blend: cs.mixBlendMode,
            before: pseudo(el, "::before"),
            after: pseudo(el, "::after"),
          },
        });
      }
    }
    return out;
  }, roots);
}

export interface Difference {
  key: string;
  what: string;
  legacy: string;
  next: string;
}

const COLOUR_KEYS = new Set(["color", "background", "borderBottom"]);
const PAINT_KEYS = new Set(["backgroundImage", "shadow", "before", "after"]);

/** Colours may differ by a rounding step per channel; every other value has to match to 0.05px. */
const closeEnough = (key: string, a: string, b: string): boolean => {
  if (a === b) return true;
  if (PAINT_KEYS.has(key)) {
    /* same structure; lengths within 0.05; colours within a rounding step (a wider one for very faint
       colours, which cannot be read back from the canvas exactly) */
    const split = (v: string) => {
      const colours: number[][] = [];
      const rest = v.replace(/\[(\d+),(\d+),(\d+),(\d+)\]/g, (_m, r, g, b2, al) => {
        colours.push([Number(r), Number(g), Number(b2), Number(al)]);
        return "[c]";
      });
      return { colours, nums: (rest.match(/-?\d*\.?\d+/g) ?? []).map(Number), shape: rest.replace(/-?\d*\.?\d+/g, "#") };
    };
    const [x, y] = [split(a), split(b)];
    if (x.shape !== y.shape || x.nums.length !== y.nums.length || x.colours.length !== y.colours.length) return false;
    if (!x.nums.every((v, i) => Math.abs(v - y.nums[i]) <= 0.05)) return false;
    return x.colours.every((c, i) => {
      const d = y.colours[i];
      const tolerance = Math.max(2, Math.ceil(320 / Math.max(1, Math.min(c[3], d[3]))));
      return Math.abs(c[3] - d[3]) <= 2 && [0, 1, 2].every((k) => Math.abs(c[k] - d[k]) <= tolerance);
    });
  }
  const na = a.split(/[ ,]/).map(Number);
  const nb = b.split(/[ ,]/).map(Number);
  if (na.length !== nb.length || na.some(Number.isNaN) || nb.some(Number.isNaN)) return false;
  const tolerance = COLOUR_KEYS.has(key) ? 2 : 0.05;
  return na.every((v, i) => Math.abs(v - nb[i]) <= tolerance);
};

/** Every way the new page differs from the original: missing or extra elements, moved boxes, changed styles. */
export function diff(legacy: Mark[], next: Mark[], tolerancePx = 0.5): Difference[] {
  const out: Difference[] = [];
  const b = new Map(next.map((m) => [m.key, m]));
  const a = new Map(legacy.map((m) => [m.key, m]));
  for (const m of legacy) {
    const o = b.get(m.key);
    if (!o) {
      out.push({ key: m.key, what: "missing in next", legacy: m.rect.join(" "), next: "" });
      continue;
    }
    if (m.rect.some((v, i) => Math.abs(v - o.rect[i]) > tolerancePx)) out.push({ key: m.key, what: "rect", legacy: m.rect.join(" "), next: o.rect.join(" ") });
    for (const k of Object.keys(m.style)) {
      if (!closeEnough(k, m.style[k], o.style[k])) out.push({ key: m.key, what: k, legacy: m.style[k], next: o.style[k] });
    }
  }
  for (const m of next) if (!a.has(m.key)) out.push({ key: m.key, what: "extra in next", legacy: "", next: m.rect.join(" ") });
  return out;
}
