/**
 * A soft two-note chime for an incoming chat message. Browsers only allow sound after the visitor has
 * clicked, tapped or pressed a key on the page, so on a first, untouched visit it stays silent.
 */
let ctx: AudioContext | null = null;
let armed = false;

function unlock(): void {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) ctx = new Ctor();
    }
    if (ctx?.state === "suspended") void ctx.resume();
  } catch {
    /* no audio: stay silent */
  }
}

/** Call once on the client: the first interaction makes sound possible. */
export function armChime(): void {
  if (armed) return;
  armed = true;
  for (const ev of ["pointerdown", "keydown", "touchend"]) window.addEventListener(ev, unlock, { once: true, passive: true });
}

export function playChime(): void {
  const c = ctx;
  if (!c || c.state !== "running") return;
  const t0 = c.currentTime + 0.02;
  for (const [freq, delay] of [
    [880, 0],
    [1318.5, 0.12],
  ]) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + delay);
    gain.gain.linearRampToValueAtTime(0.11, t0 + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.55);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0 + delay);
    osc.stop(t0 + delay + 0.6);
  }
}
