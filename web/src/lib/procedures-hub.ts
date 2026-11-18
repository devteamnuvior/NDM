import "server-only";
import { APTOS_SLUG } from "@/config/aptos";
import { HUB_COMPARE, HUB_CONCERN_GROUPS, HUB_GROUPS, HUB_SKIP, HUB_TECH, type HubArea } from "@/config/procedures-hub";
import { concernPath, procedurePath } from "@/lib/post-paths";
import { getConcernList, getProcedure, getProcedureList, settle } from "@/lib/wordpress";

/** One treatment card of the hub: what WordPress says it is called and where it lives, plus the hub's words. */
export interface HubCard {
  slug: string;
  title: string;
  path: string;
  text: string;
  areas: HubArea[];
  concerns: string[];
  /** The card photo: the chosen one, else the page's own header photo from WordPress; empty when neither exists. */
  img: string;
  /** Where the photo is cropped (WordPress's "photo focus"), "50% 50%" when not set. */
  pos: string;
}

export interface HubView {
  groups: { id: string; title: string; intro: string; cards: HubCard[] }[];
  /** How many treatment pages the hub links to. */
  count: number;
  concerns: { title: string; items: { title: string; path: string }[] }[];
  compare: { id: string; title: string; question: string; cols: { title: string; path: string }[]; rows: [string, string[]][] }[];
  tech: { name: string; what: string; links: { title: string; path: string }[] }[];
  /** False when WordPress could not be reached: the page then says so instead of listing anything. */
  ok: boolean;
}

const APTOS = { slug: APTOS_SLUG, title: "Aptos Thread Lift", path: `/${APTOS_SLUG}` };

/**
 * The /procedures hub: every published procedure (and the Aptos page) in the hub's groups, with a photo,
 * the concern pages by area, the comparisons and the technology, each pointing at the page WordPress holds.
 * Anything WordPress no longer holds is left out; any procedure the hub does not know yet is listed under
 * "More treatments", so a new page is never missing from the hub.
 */
export async function getProceduresHub(): Promise<HubView> {
  const [procs, concernsRead] = await Promise.all([settle(getProcedureList), settle(getConcernList)]);
  const list = procs.ok ? procs.data : [];
  const pages = new Map<string, { title: string; path: string }>(list.map((p) => [p.slug, { title: p.title, path: procedurePath(p.type, p.slug, p.parents) }]));
  if (procs.ok) pages.set(APTOS.slug, { title: APTOS.title, path: APTOS.path });

  /* the page's own header photo for every card without a chosen one (the same cached read the procedure page makes) */
  const known = new Set(HUB_GROUPS.flatMap((g) => g.items.map((i) => i.slug)));
  const needPhoto = [...HUB_GROUPS.flatMap((g) => g.items.filter((i) => !i.img).map((i) => i.slug)), ...list.filter((p) => !known.has(p.slug)).map((p) => p.slug)].filter((s) => s !== APTOS.slug && pages.has(s));
  const heroes = new Map<string, { src: string; pos: string }>();
  await Promise.all(
    needPhoto.map(async (slug) => {
      const read = await settle(() => getProcedure(slug));
      const hero = read.ok ? read.data?.hero : null;
      if (hero?.src) heroes.set(slug, { src: hero.src, pos: read.ok ? read.data?.content?.hero_position || "50% 50%" : "50% 50%" });
    }),
  );

  const card = (slug: string, text: string, areas: HubArea[], concerns: string[], img?: string): HubCard | null => {
    const page = pages.get(slug);
    if (!page) return null;
    const own = slug === APTOS.slug ? { src: "/assets/aptos/midface-vectors.jpg", pos: "50% 40%" } : heroes.get(slug);
    return { slug, title: page.title, path: page.path, text, areas, concerns, img: img ?? own?.src ?? "", pos: img ? "50% 40%" : (own?.pos ?? "50% 50%") };
  };

  const groups = HUB_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    intro: g.intro,
    cards: g.items.map((i) => card(i.slug, i.text, i.areas, i.concerns, i.img)).filter((c): c is HubCard => !!c),
  }));
  const extra = list
    .filter((p) => !known.has(p.slug) && !HUB_SKIP.has(p.slug))
    .map((p) => card(p.slug, "Read what the treatment involves and whether it may suit you.", [], []))
    .filter((c): c is HubCard => !!c);
  if (extra.length) groups.push({ id: "more", title: "More treatments", intro: "Other treatments offered at our clinics.", cards: extra });
  const shown = groups.filter((g) => g.cards.length);

  const concernList = concernsRead.ok ? concernsRead.data : [];
  const concernPages = new Map(concernList.map((c) => [c.slug, { title: c.title, path: concernPath(c.slug, c.parents) }]));
  const placed = new Set(HUB_CONCERN_GROUPS.flatMap(([, s]) => s));
  const concerns = HUB_CONCERN_GROUPS.map(([title, slugs]) => ({ title, items: slugs.map((s) => concernPages.get(s)).filter((x): x is { title: string; path: string } => !!x) }));
  const otherConcerns = concernList.filter((c) => !placed.has(c.slug)).map((c) => concernPages.get(c.slug)!);
  if (otherConcerns.length) concerns.push({ title: "More", items: otherConcerns });

  const link = (slug: string) => pages.get(slug);
  const compare = HUB_COMPARE.map((c) => ({ ...c, cols: c.cols.map(link) })).filter((c): c is HubView["compare"][number] => c.cols.every(Boolean));
  const tech = HUB_TECH.map((t) => ({ name: t.name, what: t.what, links: t.slugs.map(link).filter((x): x is { title: string; path: string } => !!x) }));

  return { groups: shown, count: shown.reduce((n, g) => n + g.cards.length, 0), concerns: concerns.filter((g) => g.items.length), compare, tech, ok: procs.ok };
}
