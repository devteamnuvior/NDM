/**
 * "Fly to cart" (after code.xr's reel): a small ticket with the treatment's name and price lifts off the button
 * that added it and swoops on a curve into the cart (or list) count, which bumps when it lands. There is no
 * product photo yet, so the ticket carries the words instead.
 *
 * The target is asked for on the first frame after the click, once React has drawn the change (a bar that only
 * appears with its first item exists by then), and its place is read again on every frame, so a bar that slides
 * in or a header that moves away is still met. Plain DOM and requestAnimationFrame: nothing in React's tree
 * changes. With reduced motion only the count bumps. Styles: `styles/fly-to.css`.
 */

export interface FlyOptions {
  name: string;
  price: string;
  /** Where to land; null when there is nowhere on screen (then nothing flies). */
  target: () => HTMLElement | null;
  /** "vip": navy and gold (VIP Sale); default: NewDermaMed blue. */
  look?: "vip";
}

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const shrink = (u: number) => u * u * u;

function bump(el: HTMLElement): void {
  el.classList.remove("fly-bump");
  void el.offsetWidth;
  el.classList.add("fly-bump");
}

function onScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

/** The first of these elements that is on screen and not hidden. */
export function firstShown(...els: (HTMLElement | null | undefined)[]): HTMLElement | null {
  return els.find((el): el is HTMLElement => !!el && onScreen(el) && !el.closest(".is-off,[aria-hidden='true']")) ?? null;
}

export function flyTo(from: HTMLElement, { name, price, target, look }: FlyOptions): void {
  const a = from.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height / 2;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => {
    const to = target();
    if (!to) return;
    if (still) {
      bump(to);
      return;
    }

    const fly = document.createElement("div");
    fly.className = `fly${look ? ` fly-${look}` : ""}`;
    fly.setAttribute("aria-hidden", "true");
    fly.style.transform = `translate(${x0}px,${y0}px)`;
    const card = document.createElement("div");
    card.className = "fly-card";
    const mark = document.createElement("i");
    mark.textContent = "+";
    const words = document.createElement("span");
    const title = document.createElement("b");
    title.textContent = name;
    const cost = document.createElement("small");
    cost.textContent = price;
    words.append(title, cost);
    card.append(mark, words);
    fly.append(card);
    document.body.append(fly);

    const end = () => {
      const r = to.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const first = end();
    const dx = first.x - x0;
    const dy = first.y - y0;
    const dist = Math.hypot(dx, dy) || 1;
    /* the curve bows away from the straight line: upward, or to the left when the target is straight above or below */
    let nx = dy / dist;
    let ny = -dx / dist;
    if (ny > 0.2 || (Math.abs(ny) <= 0.2 && nx > 0)) {
      nx = -nx;
      ny = -ny;
    }
    const bow = Math.min(190, 70 + dist * 0.22);
    const pop = 260;
    const time = Math.round(Math.min(1050, Math.max(720, 420 + dist * 0.55)));
    const t0 = performance.now();

    const frame = (now: number) => {
      const ms = now - t0;
      if (!to.isConnected) {
        fly.remove();
        return;
      }
      if (ms < pop) {
        /* the ticket pops out of the button first */
        const u = ms / pop;
        const s = u < 0.55 ? 0.6 + (0.46 * u) / 0.55 : 1.06 - (0.06 * (u - 0.55)) / 0.45;
        fly.style.transform = `translate(${x0}px,${y0}px)`;
        card.style.transform = `translate(-50%,-50%) scale(${s.toFixed(3)})`;
        card.style.opacity = String(Math.min(1, u * 2));
        requestAnimationFrame(frame);
        return;
      }
      const u = Math.min(1, (ms - pop) / time);
      const t = ease(u);
      const m = 1 - t;
      const e = end();
      const cx = x0 + (e.x - x0) / 2 + nx * bow;
      const cy = y0 + (e.y - y0) / 2 + ny * bow;
      const x = m * m * x0 + 2 * m * t * cx + t * t * e.x;
      const y = m * m * y0 + 2 * m * t * cy + t * t * e.y;
      const k = shrink(u);
      const turn = Math.sin(u * Math.PI) * -5;
      fly.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      card.style.transform = `translate(-50%,-50%) scale(${(1 - 0.84 * k).toFixed(3)}) rotate(${turn.toFixed(2)}deg)`;
      card.style.opacity = String(1 - 0.8 * k);
      if (u < 1) {
        requestAnimationFrame(frame);
        return;
      }
      fly.remove();
      bump(to);
    };
    requestAnimationFrame(frame);
  });
}
