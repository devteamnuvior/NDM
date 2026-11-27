"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { QtyControl } from "@/components/cart/qty-control";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconSearch } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { useReveal } from "@/hooks/use-reveal";
import { cartKey } from "@/lib/cart";
import { type PriceCategoryView, type PriceItemView } from "@/lib/pricing-view";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";
import { jumpToPriceGroup, PRICE_GROUP_HASH } from "@/lib/price-jump";
import { FromPrice, IconHalfProvider, OfferTag, SaleNameProvider, type SaleLook } from "@/components/pricing/sale-tags";
import { OptionRow } from "@/components/pricing/option-row";
import { JumpMenu } from "@/components/pricing/jump-menu";

const Stroke = ({ d }: { d: string }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

type Hit = [item: PriceItemView, index: number];


/**
 * The sale that is running, as the price list shows it: the checkout code and its percentage (the line under
 * every package the code applies to), and the banner above the list while the sale has one.
 */
export interface PriceListSale {
  code: string;
  percent: number;
  banner?: { name: string; text: string; cta: string; href: string; ends: string };
  /** The colours of the offer tags: "vip" (red and blue), "bf" (black and gold), "holiday" (green and gold), "newyear" (slate). */
  look: SaleLook;
}
const SaleContext = createContext<PriceListSale | null>(null);

/** The options of one treatment, each with Add to cart; the blue dot on the one the category's "from" price is read from. */
function OptionList({ cat, it, mark, className = "grid gap-2 pb-5" }: { cat: PriceCategoryView; it: PriceItemView; mark: boolean; className?: string }) {
  const sale = useContext(SaleContext);
  return (
    <ul className={className} role="list">
      {it.options.map((o) => {
        const line = { key: cartKey(o.productId, o.variationId), cat: cat.name, name: it.name, label: o.label, price: o.price, was: o.was, unit: o.unit, productId: o.productId, variationId: o.variationId };
        return (
          <OptionRow
            key={o.variationId || o.label}
            data={{ "data-product": o.productId, "data-variation": o.variationId || undefined }}
            label={o.label}
            price={o.price}
            was={o.was}
            code={sale ? o.code : undefined}
            mark={mark && o.label === cat.fromSource?.label}
            codeName={sale?.code}
            codePercent={sale?.percent}
            tag={o.tag}
            unit={o.unit}
            action={<QtyControl fly line={line} label={`${it.name}, ${o.label}`} />}
          />
        );
      })}
    </ul>
  );
}

function TreatmentRow({ cat, it, uid, open, onToggle }: { cat: PriceCategoryView; it: PriceItemView; uid: string; open: boolean; onToggle: () => void }) {
  /* the treatment (and below, its option) the category's "from" price is read from: marked with the blue dot */
  const isSource = cat.items.length > 1 ? it.name === cat.fromSource?.item : it.options.length > 1;
  return (
    <li className={`pr-item ${open ? "is-open" : ""}`}>
      <h4 className="m-0">
        <button
          type="button"
          id={`${uid}-h`}
          aria-expanded={open}
          aria-controls={uid}
          onClick={onToggle}
          className="pr-head group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[18px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6"
        >
          <span className="min-w-0">
            <span className="block font-aeonik text-[clamp(18px,1.45vw,22px)] leading-[1.22] tracking-[-0.015em] text-ndm-ink transition-colors group-hover:text-ndm-deep">
              {it.name}
            </span>
            {it.note && <span className="mt-1 block font-inter text-[13.5px] leading-[1.45] text-ndm-muted">{it.note}</span>}
          </span>
          <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
            <OfferTag offer={it.offer} badge={it.badge} coded={it.coded} small />
            {/* inside a category the prices carry no note of where they come from (only the category's own "from" does) */}
            <FromPrice from={it.from} unit={it.fromUnit} source={it.fromSource && { ...it.fromSource, label: "", count: 1 }} mark={isSource} />
          </span>
          <span aria-hidden="true" className="pr-plus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
            <i />
            <i />
          </span>
        </button>
      </h4>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body">
        <div>
          <OptionList cat={cat} it={it} mark={isSource} />
        </div>
      </div>
    </li>
  );
}

interface PriceGroupProps {
  c: PriceCategoryView;
  on: boolean;
  onToggle: () => void;
  /** The treatments matching the search, when there is one. */
  hits: Hit[] | null;
  openItem: (i: number) => boolean;
  toggleItem: (i: number) => void;
  setItems: (indexes: number[], open: boolean) => void;
}

function PriceGroup({ c, on, onToggle, hits, openItem, toggleItem, setItems }: PriceGroupProps) {
  const shown: Hit[] = hits ?? c.items.map((it, i) => [it, i]);
  const allOpen = shown.every(([, i]) => openItem(i));
  const uid = `pg-${c.id}`;
  const count = shown.length;
  /* one treatment only (e.g. Aptos): no treatment row to open, its options straight under the category (user, 2026-11-25) */
  const single = c.items.length === 1;
  return (
    <li className={`pr-group ${on ? "is-open" : ""}`}>
      <h3 className="pr-ghead m-0">
        <button
          type="button"
          id={`${uid}-h`}
          aria-expanded={on}
          aria-controls={uid}
          onClick={onToggle}
          className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6"
        >
          <span className="pr-gtop min-w-0">
            <span className="pr-gcount block font-inter text-[12.5px] text-ndm-muted tabular-nums">
              {count} {hits ? (count === 1 ? "match" : "matches") : count === 1 ? "treatment" : "treatments"}
            </span>
            <span className="pr-gname mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.name}</span>
          </span>
          <span className="pr-gmeta col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
            <OfferTag offer={c.offer} badge={c.badge} coded={c.coded} />
            <FromPrice from={c.from} unit={c.fromUnit} big source={c.fromSource} withItem={c.items.length > 1} />
          </span>
          <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
            <i />
            <i />
          </span>
        </button>
      </h3>
      <div id={uid} role="region" aria-labelledby={`${uid}-h`} className="pr-body" inert={!on}>
        <div>
          <div className="pr-gintro flex items-center justify-between gap-x-4 pb-2 sm:gap-x-8">
            <p className="max-w-[60ch] min-w-0 font-inter text-[15px] leading-[1.55] text-ndm-muted">{c.blurb}</p>
            {!single && count > 1 && (
              <button
                type="button"
                onClick={() => setItems(shown.map(([, i]) => i), !allOpen)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ndm-ink/15 px-4 py-2 font-inter text-[13.5px] whitespace-nowrap text-ndm-ink transition-colors hover:border-ndm-ink hover:bg-ndm-ink hover:text-white"
              >
                {allOpen ? <Stroke d="M3 8h10" /> : <Stroke d="M8 3v10M3 8h10" />}
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>
          {/* treatments sit on their own white panel, flush with the category title, so they read as part of the category */}
          {single ? (
            <div className="pr-sub">
              <OptionList cat={c} it={c.items[0]} mark={c.items[0].options.length > 1} className="grid gap-2 py-[18px]" />
            </div>
          ) : (
            <ul className="pr-sub" role="list">
              {shown.map(([it, i]) => (
                <TreatmentRow key={i} cat={c} it={it} uid={`pr-${c.id}-${i}`} open={openItem(i)} onToggle={() => toggleItem(i)} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

const itemKey = (c: PriceCategoryView, i: number) => `${c.id}:${i}`;
function flipped(set: Set<string>, k: string): Set<string> {
  const n = new Set(set);
  if (n.has(k)) n.delete(k);
  else n.add(k);
  return n;
}

/**
 * The price list: every category folds, and every treatment inside it folds to show its sessions,
 * packages and offers, each with Add to cart. The search narrows it to matching treatments.
 */
export function PriceList({ categories, total, sale = null }: { categories: PriceCategoryView[]; total: number; sale?: PriceListSale | null }) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Set<string>>(() => new Set()); /* open categories */
  const [shut, setShut] = useState<Set<string>>(() => new Set()); /* categories closed by hand during a search */
  const [open, setOpen] = useState<Set<string>>(() => new Set()); /* open treatments */
  const q = query.trim().toLowerCase();

  const results = q
    ? categories
        .map((c) => ({ c, hits: c.items.map((it, i): Hit => [it, i]).filter(([it]) => `${c.name} ${it.name} ${it.note}`.toLowerCase().includes(q)) }))
        .filter((r) => r.hits.length)
    : null;
  const hitCount = results ? results.reduce((n, r) => n + r.hits.length, 0) : 0;
  const search = (value: string) => {
    setQuery(value);
    setShut(new Set()); /* a new search shows every match again */
  };
  const groups: { c: PriceCategoryView; hits: Hit[] | null }[] = results ?? categories.map((c) => ({ c, hits: null }));

  /* other pages' empty cart links here with #prices: go there once the page has loaded, so the
     browser's own scroll restoration cannot undo it */
  useEffect(() => {
    const hash = window.location.hash;
    /* the site search links to one category (#pg-<slug>-h): open it and go there */
    const group = PRICE_GROUP_HASH.test(hash);
    if (hash !== "#prices" && !group) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      t = setTimeout(() => {
        if (group) {
          jumpToPriceGroup(hash.slice(1), true);
          return;
        }
        const el = byId("prices");
        if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 40, true);
      }, 120);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", go);
    };
  }, []);

  return (
    <SaleContext value={sale}>
      <SaleNameProvider shown={false}>
      {/* every pill is two halves, black and plain red (user, 2026-11-26): an offer of one part gets a red half with the flame
          icon alone */}
      <IconHalfProvider shown>
      <section ref={section} id="prices" data-sale={sale?.look} aria-labelledby="prices-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,110px)] pb-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        {sale?.banner && (
          <aside aria-label={sale.banner.name} className="pr-sale rv mb-[clamp(36px,4vw,56px)] flex flex-col gap-4 rounded-[22px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <span className="sb sb-split sb-sm shrink-0 self-start sm:self-center">
                <span className="sb-a">{sale.banner.name.toUpperCase()}</span>
                <span className="sb-b">ENDS {sale.banner.ends.toUpperCase()}</span>
              </span>
              <p className="pr-sale-text font-inter text-[14.5px] leading-[1.55]">
                <strong className="font-semibold">{sale.banner.name}:</strong> {sale.banner.text}
              </p>
            </div>
            <span className="shrink-0">
              <Button href={sale.banner.href} v="line">
                {sale.banner.cta}
              </Button>
            </span>
          </aside>
        )}
        <div className="text-center">
          <Eyebrow className="rv">Price list</Eyebrow>
          <TwoTone id="prices-title" className="rv mt-5" lead="Prices and" strong="current offers" style={{ transitionDelay: ".06s" }} />
          <p className="rv mx-auto mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            Open a category, then any treatment to see its sessions, packages and current offers.
          </p>
          <label className="rv relative mx-auto mt-6 block max-w-[560px]" style={{ transitionDelay: ".14s" }}>
            <span className="sr-only">Search treatments</span>
            <IconSearch size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ndm-muted" />
            <input
              id="prices-search"
              type="search"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder={`Search ${total} treatments`}
              className="h-14 w-full rounded-full border border-ndm-ink/10 bg-white pr-5 pl-12 font-inter text-[15px] text-ndm-ink outline-hidden transition placeholder:text-[#8A949B] focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15"
            />
          </label>
        </div>

        <div className="mt-[clamp(40px,4.5vw,64px)]">
          {results && (
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
              <p className="font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink" aria-live="polite">
                {hitCount ? `${hitCount} ${hitCount === 1 ? "treatment matches" : "treatments match"} “${query.trim()}”` : `No treatments match “${query.trim()}”`}
              </p>
              <button type="button" onClick={() => search("")} className="font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline">
                Clear search
              </button>
            </div>
          )}
          {results && !hitCount && <p className="font-inter text-[15px] text-ndm-muted">Try another name, or ask our team at your free consultation.</p>}
          {/* the categories as a menu above the list (user, 2026-11-18): a tap opens that category and scrolls to it */}
          {!results && (
            <JumpMenu categories={categories} />
          )}
          <ul className="pr-groups" role="list">
            {groups.map(({ c, hits }) => (
              <PriceGroup
                key={c.id}
                c={c}
                hits={hits}
                on={q ? !shut.has(c.id) : cats.has(c.id)}
                /* a category opens with every treatment folded */
                onToggle={() => (q ? setShut((s) => flipped(s, c.id)) : setCats((s) => flipped(s, c.id)))}
                openItem={(i) => open.has(itemKey(c, i))}
                toggleItem={(i) => setOpen((s) => flipped(s, itemKey(c, i)))}
                setItems={(indexes, on) =>
                  setOpen((s) => {
                    const n = new Set(s);
                    indexes.forEach((i) => (on ? n.add(itemKey(c, i)) : n.delete(itemKey(c, i))));
                    return n;
                  })
                }
              />
            ))}
          </ul>
          <p className="mt-10 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation. Individual results may vary.</p>
        </div>
      </div>
      </section>
      </IconHalfProvider>
      </SaleNameProvider>
    </SaleContext>
  );
}
