import type { SaleWords } from "@/types/vip-sale";

/* The dates of a sale in words, worked out from its first and last minute on a Toronto clock. */

const ZONE = "America/Toronto";

/** "2026-11-27 00:00" on a Toronto clock as a moment in time; null when it is not such a date. */
export function torontoTime(local: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  if (new Date(wall).getUTCDate() !== d || h > 23 || mi > 59) return null;
  /* what a Toronto clock shows at a moment, read back as if it were UTC */
  const shown = (t: number): number => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(t).map((x) => [x.type, Number(x.value)]));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  };
  let t = wall;
  for (let i = 0; i < 2; i++) t += wall - shown(t);
  return t;
}

/** The sale's dates in words. */
export function saleWords(start: number, end: number): SaleWords {
  const part = (t: number, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, ...options }).format(t);
  const of = (t: number) => ({
    weekday: part(t, { weekday: "long" }),
    wd: part(t, { weekday: "short" }).replace(".", ""),
    month: part(t, { month: "long" }),
    mon: part(t, { month: "short" }).replace(".", ""),
    day: part(t, { day: "numeric" }),
    date: part(t, { year: "numeric", month: "2-digit", day: "2-digit" }),
  });
  const a = of(start);
  const b = of(end);
  const sameMonth = a.month === b.month;
  const days = Math.round((Date.parse(b.date) - Date.parse(a.date)) / 864e5) + 1;
  return {
    full: `${a.weekday}, ${a.mon} ${a.day} to ${b.weekday}, ${b.mon} ${b.day}`,
    short: a.date === b.date ? `${a.mon} ${a.day}` : `${a.mon} ${a.day} to ${sameMonth ? "" : `${b.mon} `}${b.day}`,
    long: a.date === b.date ? `${a.month} ${a.day}` : `${a.month} ${a.day} to ${sameMonth ? "" : `${b.month} `}${b.day}`,
    startDay: `${a.wd}, ${a.mon} ${a.day}`,
    endDay: `${b.wd}, ${b.mon} ${b.day}`,
    end: `${b.month} ${b.day}`,
    days,
    span: days === 1 ? a.weekday : `${a.weekday} to ${b.weekday}`,
  };
}

