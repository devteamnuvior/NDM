"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { useReveal } from "@/hooks/use-reveal";
import { byId } from "@/lib/dom";
import { lockScroll } from "@/lib/scroll-lock";
import { scrollToY } from "@/lib/smooth-scroll";
import { ProductCard } from "@/components/shop/product-card";
import type { ShopCard, ShopFacet, ShopFacetId } from "@/types/shop";

const PER_PAGE = 12;
const FACET_KEYS: ShopFacetId[] = ["brand", "category", "concern", "skin", "type", "area", "ingredient"];
/** Filters open when the page loads (the store's own filters); the rest start folded. */
const OPEN_AT_START = new Set(["brand", "category", "price", "availability"]);
/** A long list shows this many options until "Show all". */
const SHORT_LIST = 6;

type Avail = "instock" | "sale" | "new";
type SortId = "name" | "newest" | "price-asc" | "price-desc" | "saving";
const SORTS: [SortId, string][] = [
  ["name", "Name, A to Z"],
  ["newest", "Newest"],
  ["price-asc", "Price, low to high"],
  ["price-desc", "Price, high to low"],
  ["saving", "Biggest saving"],
];
const AVAIL: [Avail, string][] = [
  ["instock", "In stock"],
  ["sale", "On sale"],
  ["new", "New arrivals"],
];

interface Filters {
  q: string;
  picked: Partial<Record<ShopFacetId, string[]>>;
  avail: Avail[];
  min: string;
  max: string;
  sort: SortId;
  page: number;
}
const EMPTY: Filters = {
  q: "",
  picked: {},
  avail: [],
  min: "",
  max: "",
  sort: "name",
  page: 1,
};

const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ®™]/g, "").toLowerCase();
const valuesOf = (p: ShopCard, id: ShopFacetId): string[] =>
  id === "brand" ? [p.brand] : id === "category" ? p.categories : id === "concern" ? p.concerns : id === "skin" ? p.skinTypes : id === "type" ? p.productTypes : id === "area" ? p.areas : p.ingredients;
const dollars = (s: string) => {
  const n = Number.parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

/** The filters as the address keeps them (?brand=Mesoestetic&avail=sale&page=2), so a filtered list can be shared. */
function fromUrl(search: string): Filters {
  const q = new URLSearchParams(search);
  const picked: Filters["picked"] = {};
  for (const k of FACET_KEYS) if (q.getAll(k).length) picked[k] = q.getAll(k);
  const sort = q.get("sort") as SortId | null;
  return {
    q: q.get("q") ?? "",
    picked,
    avail: q.getAll("avail").filter((a): a is Avail => AVAIL.some(([id]) => id === a)),
    min: q.get("min") ?? "",
    max: q.get("max") ?? "",
    sort: sort && SORTS.some(([id]) => id === sort) ? sort : "name",
    page: Math.max(1, Number.parseInt(q.get("page") ?? "1", 10) || 1),
  };
}
function toUrl(f: Filters): string {
  const q = new URLSearchParams();
  if (f.q.trim()) q.set("q", f.q.trim());
  for (const k of FACET_KEYS) for (const v of f.picked[k] ?? []) q.append(k, v);
  for (const a of f.avail) q.append("avail", a);
  if (f.min) q.set("min", f.min);
  if (f.max) q.set("max", f.max);
  if (f.sort !== "name") q.set("sort", f.sort);
  if (f.page > 1) q.set("page", String(f.page));
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** The products that pass every filter (one option of a filter is enough; every filter must pass), in the chosen order. */
function apply(products: ShopCard[], f: Filters, query: string): ShopCard[] {
  const words = norm(query.trim()).split(/\s+/).filter(Boolean);
  const lo = dollars(f.min);
  const hi = dollars(f.max);
  const list = products.filter(
    (p) =>
      FACET_KEYS.every((k) => !f.picked[k]?.length || valuesOf(p, k).some((v) => f.picked[k]!.includes(v))) &&
      (!f.avail.includes("instock") || p.inStock) &&
      (!f.avail.includes("sale") || p.onSale) &&
      (!f.avail.includes("new") || p.isNew) &&
      (lo === null || p.price >= lo) &&
      (hi === null || p.price <= hi) &&
      words.every((w) => norm(`${p.name} ${p.brand} ${p.text} ${p.categories.join(" ")} ${p.concerns.join(" ")} ${p.ingredients.join(" ")}`).includes(w)),
  );
  const byName = (a: ShopCard, b: ShopCard) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  const order: Record<SortId, (a: ShopCard, b: ShopCard) => number> = {
    name: byName,
    newest: (a, b) => a.newest - b.newest,
    "price-asc": (a, b) => a.price - b.price || byName(a, b),
    "price-desc": (a, b) => b.price - a.price || byName(a, b),
    saving: (a, b) => b.regular - b.price - (a.regular - a.price) || byName(a, b),
  };
  return list.sort(order[f.sort]);
}

/**
 * Every product of the online store with its filters, search, sorting and pages. The filters sit in a
 * column on wide screens and in a sheet on phones; the list follows each change at once (the store's
 * "Filter" button is not needed). Product links and Add to cart open the online store, where checkout is.
 */
export function ShopCatalogView({ products, facets }: { products: ShopCard[]; facets: ShopFacet[] }) {
  const box = useRef<HTMLElement>(null);
  useReveal(box);
  const [f, setF] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const loaded = useRef(false);
  const query = useDeferredValue(f.q);

  /* the address's filters, once the page is in the browser */
  useEffect(() => {
    const from = fromUrl(window.location.search);
    loaded.current = true;
    if (window.location.search) setF(from); // eslint-disable-line react-hooks/set-state-in-effect -- the address is only known in the browser
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    const next = `${window.location.pathname}${toUrl(f)}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      /* a page opened from disk (the prototype) may not change its address: the filters still work */
      try {
        window.history.replaceState(window.history.state, "", next);
      } catch {}
    }
  }, [f]);
  useEffect(() => {
    lockScroll(sheet);
    if (!sheet) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      lockScroll(false);
    };
  }, [sheet]);

  const shown = useMemo(() => apply(products, f, query), [products, f, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const page = Math.min(f.page, pages);
  const slice = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const counts = {
    instock: products.filter((p) => p.inStock).length,
    sale: products.filter((p) => p.onSale).length,
    new: products.filter((p) => p.isNew).length,
  };
  const prices = products.map((p) => p.price);
  const range = [Math.floor(Math.min(...prices) / 100), Math.ceil(Math.max(...prices) / 100)];

  const set = (patch: Partial<Filters>) => setF((old) => ({ ...old, page: 1, ...patch }));
  const toggle = (k: ShopFacetId, v: string) =>
    setF((old) => {
      const now = old.picked[k] ?? [];
      return {
        ...old,
        page: 1,
        picked: {
          ...old.picked,
          [k]: now.includes(v) ? now.filter((x) => x !== v) : [...now, v],
        },
      };
    });
  const toggleAvail = (a: Avail) =>
    setF((old) => ({
      ...old,
      page: 1,
      avail: old.avail.includes(a) ? old.avail.filter((x) => x !== a) : [...old.avail, a],
    }));
  const clear = () => setF((old) => ({ ...EMPTY, sort: old.sort }));
  const goPage = (n: number) => {
    setF((old) => ({ ...old, page: n }));
    const top = byId("products");
    if (top) scrollToY(top.getBoundingClientRect().top + window.scrollY - 120);
  };

  const chips: { key: string; label: string; off: () => void }[] = [
    ...FACET_KEYS.flatMap((k) =>
      (f.picked[k] ?? []).map((v) => ({
        key: `${k}:${v}`,
        label: v,
        off: () => toggle(k, v),
      })),
    ),
    ...f.avail.map((a) => ({
      key: `a:${a}`,
      label: AVAIL.find(([id]) => id === a)![1],
      off: () => toggleAvail(a),
    })),
    ...(f.min ? [{ key: "min", label: `From $${f.min}`, off: () => set({ min: "" }) }] : []),
    ...(f.max ? [{ key: "max", label: `Up to $${f.max}`, off: () => set({ max: "" }) }] : []),
    ...(f.q.trim() ? [{ key: "q", label: `“${f.q.trim()}”`, off: () => set({ q: "" }) }] : []),
  ];

  const panel = <FilterPanel facets={facets} f={f} counts={counts} range={range} toggle={toggle} toggleAvail={toggleAvail} set={set} />;

  return (
    <section ref={box} id="products" aria-labelledby="sp-products" className="sp-catalog relative z-10 scroll-mt-[130px] px-[var(--gx)] pt-[clamp(56px,6vw,96px)]">
      <div className="rv flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="font-mont text-[12px] tracking-[.16em] text-ndm-deep uppercase">Browse everything</p>
          <TwoTone
            id="sp-products"
            className="mt-3"
            size="text-[clamp(28px,3vw,42px)]"
            lead={
              <>
                {products.length} products,
                <br />
              </>
            }
            strong="ready to order online"
          />
        </div>
        <div className="sp-search flex w-full items-center gap-3 rounded-full bg-white px-5 ring-1 ring-ndm-ink/[.08] focus-within:ring-2 focus-within:ring-ndm-blue md:max-w-[420px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-ndm-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <label htmlFor="sp-q" className="sr-only">
            Search products
          </label>
          <input
            id="sp-q"
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search products or ingredients"
            autoComplete="off"
            className="h-[52px] w-full min-w-0 bg-transparent font-inter text-[16px] text-ndm-ink outline-none placeholder:text-ndm-muted/80"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* wide screens: the filters in a column that stays in view */}
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sp-side sticky top-[120px]" data-lenis-prevent>
            <div className="flex items-center justify-between pb-3">
              <p className="font-aeonik text-[22px] leading-none text-ndm-ink">Filters</p>
              <button type="button" onClick={clear} disabled={!chips.length} className="font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline disabled:text-ndm-muted/60 disabled:no-underline">
                Clear all
              </button>
            </div>
            {panel}
          </div>
        </aside>

        <div className="min-w-0">
          {/* toolbar: count, phone filter button, sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="font-inter text-[14.5px] text-ndm-muted">
              {shown.length ? `Showing ${(page - 1) * PER_PAGE + 1} to ${(page - 1) * PER_PAGE + slice.length} of ${shown.length} ${shown.length === 1 ? "product" : "products"}` : "No products match"}
            </p>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setSheet(true)}
                className="sp-pill flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 font-inter text-[14.5px] text-ndm-ink ring-1 ring-ndm-ink/[.1] sm:flex-none lg:hidden"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filters
                {chips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-ndm-deep text-[11px] text-white tabular-nums">{chips.length}</span>}
              </button>
              <label className="sp-sort relative flex h-11 flex-1 items-center rounded-full bg-white ring-1 ring-ndm-ink/[.1] sm:flex-none">
                <span className="sr-only">Sort by</span>
                <select
                  value={f.sort}
                  onChange={(e) => set({ sort: e.target.value as SortId })}
                  className="h-full w-full appearance-none rounded-full bg-transparent pr-10 pl-4 font-inter text-[14.5px] text-ndm-ink outline-none"
                >
                  {SORTS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="pointer-events-none absolute right-4 text-ndm-muted">
                  <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
                </svg>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul role="list" aria-label="Active filters" className="mt-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={c.off}
                    className="inline-flex items-center gap-2 rounded-full bg-ndm-deep/[.08] py-1.5 pr-2.5 pl-3.5 font-inter text-[13.5px] text-ndm-deep transition-colors hover:bg-ndm-deep/[.14]"
                  >
                    {c.label}
                    <IconClose size={10} />
                    <span className="sr-only">(remove this filter)</span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clear} className="px-2 py-1.5 font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:text-ndm-ink hover:underline">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {shown.length === 0 ? (
            <div className="mt-6 rounded-[22px] bg-ndm-mist px-6 py-10 text-center">
              <p className="font-inter text-[16px] text-ndm-ink">No products match these filters.</p>
              <p className="mt-2 font-inter text-[14.5px] text-ndm-muted">Try fewer filters or another word. Our team can also suggest products at your free consultation.</p>
              <button type="button" onClick={clear} className="btn btn-line btn-sm mt-5">
                <span>Show all products</span>
              </button>
            </div>
          ) : (
            <ul role="list" className="mt-6 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 xl:grid-cols-3">
              {slice.map((p, i) => (
                <li key={p.id}>
                  <ProductCard p={p} eager={page === 1 && i < 3} />
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav aria-label="Product pages" className="mt-10 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              <button type="button" onClick={() => goPage(page - 1)} disabled={page === 1} className="sp-page is-wide" aria-label="Previous page">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M7.5 2.5 4 6l3.5 3.5" />
                </svg>
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => goPage(n)} aria-current={n === page ? "page" : undefined} className="sp-page">
                  {n}
                </button>
              ))}
              <button type="button" onClick={() => goPage(page + 1)} disabled={page === pages} className="sp-page is-wide" aria-label="Next page">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="m4.5 2.5 3.5 3.5-3.5 3.5" />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* phones and tablets: the filters in a sheet */}
      {sheet &&
        createPortal(
          <div data-page="shop" className="fixed inset-0 z-[130] flex items-end justify-center bg-[#08131D]/55 backdrop-blur-[3px] sm:items-center sm:p-6" onClick={() => setSheet(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sp-sheet-title"
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              className="sp-sheet flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] bg-ndm-paper sm:max-w-[520px] sm:rounded-[26px]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-ndm-ink/[.08] px-5 py-4">
                <h2 id="sp-sheet-title" className="font-aeonik text-[24px] leading-none font-normal text-ndm-ink">
                  Filters
                </h2>
                <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" autoFocus className="grid size-10 place-items-center rounded-full bg-ndm-ink/[.05] text-ndm-ink">
                  <IconClose size={14} />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain px-5 pb-4">{panel}</div>
              <div className="flex items-center gap-3 border-t border-ndm-ink/[.08] bg-white px-5 py-4">
                <button type="button" onClick={clear} disabled={!chips.length} className="btn btn-line btn-sm">
                  <span>Clear all</span>
                </button>
                <button type="button" onClick={() => setSheet(false)} className="btn btn-ink btn-sm btn-block">
                  <span>{shown.length ? `Show ${shown.length} ${shown.length === 1 ? "product" : "products"}` : "No products match"}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

interface PanelProps {
  facets: ShopFacet[];
  f: Filters;
  counts: Record<Avail, number>;
  range: number[];
  toggle: (k: ShopFacetId, v: string) => void;
  toggleAvail: (a: Avail) => void;
  set: (patch: Partial<Filters>) => void;
}

/** The filter groups, shared by the column and the sheet. */
function FilterPanel({ facets, f, counts, range, toggle, toggleAvail, set }: PanelProps) {
  const [all, setAll] = useState<Record<string, boolean>>({});
  const group = (id: string, label: string, body: React.ReactNode, picked: number) => (
    <details key={id} className="sp-group border-t border-ndm-ink/[.08]" open={OPEN_AT_START.has(id) || picked > 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-inter text-[15px] font-medium text-ndm-ink">
        <span>
          {label}
          {picked > 0 && <span className="ml-2 rounded-full bg-ndm-deep px-1.5 py-0.5 text-[11px] text-white tabular-nums">{picked}</span>}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="sp-chev text-ndm-muted">
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
        </svg>
      </summary>
      <div className="pb-4">{body}</div>
    </details>
  );
  const option = (key: string, label: string, count: number, on: boolean, flip: () => void) => (
    <li key={key}>
      <label className={`sp-opt flex cursor-pointer items-center gap-3 py-1.5 font-inter text-[14.5px] ${count ? "text-ndm-ink/85" : "text-ndm-muted/60"}`}>
        <input type="checkbox" checked={on} onChange={flip} disabled={!count && !on} className="sp-check" />
        <span className="min-w-0 flex-1">{label}</span>
        <span className="text-[12.5px] text-ndm-muted tabular-nums">{count}</span>
      </label>
    </li>
  );

  return (
    <div>
      {facets.map((fc) => {
        const picked = f.picked[fc.id] ?? [];
        const long = fc.options.length > SHORT_LIST + 2;
        const open = all[fc.id] || !long;
        const list = open ? fc.options : fc.options.filter((o, i) => i < SHORT_LIST || picked.includes(o.value));
        return group(
          fc.id,
          fc.label,
          <>
            <ul role="list">{list.map((o) => option(o.value, o.value, o.count, picked.includes(o.value), () => toggle(fc.id, o.value)))}</ul>
            {long && (
              <button type="button" onClick={() => setAll((a) => ({ ...a, [fc.id]: !open }))} className="mt-1.5 font-inter text-[13.5px] text-ndm-deep underline-offset-4 hover:underline">
                {open ? "Show fewer" : `Show all ${fc.options.length}`}
              </button>
            )}
          </>,
          picked.length,
        );
      })}
      {group(
        "price",
        "Price",
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <label className="sp-field flex h-11 items-center gap-1 rounded-[12px] bg-white px-3 ring-1 ring-ndm-ink/[.1] focus-within:ring-2 focus-within:ring-ndm-blue">
            <span className="font-inter text-[14px] text-ndm-muted">$</span>
            <span className="sr-only">Lowest price</span>
            <input
              inputMode="decimal"
              value={f.min}
              onChange={(e) => set({ min: e.target.value.replace(/[^\d.]/g, "") })}
              placeholder={`Min ${range[0]}`}
              className="w-full min-w-0 bg-transparent font-inter text-[15px] text-ndm-ink outline-none placeholder:text-ndm-muted/70"
            />
          </label>
          <span aria-hidden="true" className="text-ndm-muted">
            to
          </span>
          <label className="sp-field flex h-11 items-center gap-1 rounded-[12px] bg-white px-3 ring-1 ring-ndm-ink/[.1] focus-within:ring-2 focus-within:ring-ndm-blue">
            <span className="font-inter text-[14px] text-ndm-muted">$</span>
            <span className="sr-only">Highest price</span>
            <input
              inputMode="decimal"
              value={f.max}
              onChange={(e) => set({ max: e.target.value.replace(/[^\d.]/g, "") })}
              placeholder={`Max ${range[1]}`}
              className="w-full min-w-0 bg-transparent font-inter text-[15px] text-ndm-ink outline-none placeholder:text-ndm-muted/70"
            />
          </label>
        </div>,
        f.min || f.max ? 1 : 0,
      )}
      {group("availability", "Availability", <ul role="list">{AVAIL.map(([id, label]) => option(id, label, counts[id], f.avail.includes(id), () => toggleAvail(id)))}</ul>, f.avail.length)}
    </div>
  );
}
