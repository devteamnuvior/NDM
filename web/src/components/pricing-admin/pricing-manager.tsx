"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type CSSProperties, type DragEvent, type ReactNode } from "react";
import { reloadTreeAction, saveChangesAction, searchProductsAction, signOutAction } from "@/app/manage/pricing/actions";
import { PriceList } from "@/components/pricing/price-list";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconSearch } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { money } from "@/lib/cart";
import { buildPricingView } from "@/lib/pricing-view";
import { lockScroll } from "@/lib/scroll-lock";
import type { WooAdminProduct, WooAdminTree, WooAdminVariation, WooPromoLabel } from "@/types/pricing";
import { changesOf, moved, newVariation, priceProblem, relocated, toDraft, toPublicTree, withPrices, type Changes, type Draft, type DraftCategory } from "./model";

/**
 * The price list's management screen: the Pricing page's own price list, with an edit button on every
 * box (category, treatment, option) and a handle to rearrange them. It edits a draft in the browser;
 * Save sends the difference to WooCommerce through the server, and the screen then shows what
 * WooCommerce holds. Prices, options and labels edited here are written to WooCommerce's own products
 * and variations; the screen keeps nothing of its own.
 */

const LABEL_MAX = 60;
const LABEL_IDEAS = ["Limited Time Offer", "Special Offer", "Best Value", "Popular Choice"];

const field =
  "w-full rounded-[12px] border border-ndm-ink/15 bg-white px-3.5 py-2.5 font-inter text-[15px] text-ndm-ink outline-hidden transition placeholder:text-[#8A949B] focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";
const caption = "block font-inter text-[13px] font-medium text-ndm-muted";
const pill = "inline-flex items-center rounded-full px-2.5 py-1 font-inter text-[12px] font-medium whitespace-nowrap";
const quiet =
  "inline-flex items-center justify-center rounded-full border border-ndm-ink/15 px-3.5 py-2 font-inter text-[13.5px] whitespace-nowrap text-ndm-ink transition-colors hover:border-ndm-deep hover:text-ndm-deep disabled:pointer-events-none disabled:opacity-40";
const editor = "rounded-[18px] border border-ndm-blue/40 bg-[#EEF7FC] p-4";

const Svg = ({ d, size = 16, w = "1.6" }: { d: string; size?: number; w?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-ndm-deep" : "bg-ndm-ink/20"}`}>
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

/** The round pencil button every box carries. */
function EditButton({ what, on, onClick }: { what: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={on ? `Finish editing ${what}` : `Edit ${what}`}
      aria-pressed={on}
      title={on ? "Done" : "Edit"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${on ? "border-ndm-deep bg-ndm-deep text-white" : "border-ndm-ink/20 bg-white text-ndm-ink hover:border-ndm-deep hover:text-ndm-deep"}`}
    >
      {on ? <Svg d="M3 8.5 6.5 12 13 4.5" /> : <Svg d="M10.6 2.9 13.1 5.4M2.5 13.5l.6-3.1 7.5-7.5 2.5 2.5-7.5 7.5-3.1.6Z" w="1.4" />}
    </button>
  );
}

const Unsaved = () => <span className={`${pill} bg-ndm-amber/20 text-[#8A5A00]`}>Unsaved</span>;
const Muted = ({ children }: { children: ReactNode }) => <span className={`${pill} bg-ndm-ink/10 text-ndm-ink`}>{children}</span>;

/* ---- rearranging: drag a box by its handle, or step it with the arrows (touch and keyboard) ---- */

type DragKind = "category" | "product" | "variation";
interface Dragging {
  kind: DragKind;
  /** What the list belongs to: "" for categories, a category key, or a product ID. */
  parent: string;
  from: number;
}

function useReorder() {
  const [drag, setDrag] = useState<Dragging | null>(null);
  const [over, setOver] = useState<{ index: number; after: boolean } | null>(null);
  const end = () => {
    setDrag(null);
    setOver(null);
  };

  /** Props of the grip that starts a drag. */
  const grip = (kind: DragKind, parent: string, from: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(from));
      const row = e.currentTarget.closest("[data-row]");
      if (row) e.dataTransfer.setDragImage(row, 28, 28);
      setDrag({ kind, parent, from });
    },
    onDragEnd: end,
  });

  /** Props of a box that can take a dragged box of the same list. */
  const row = (kind: DragKind, parent: string, index: number, onMove: (from: number, to: number) => void) => {
    const mine = drag !== null && drag.kind === kind && drag.parent === parent;
    const after = (e: DragEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      return e.clientY > r.top + r.height / 2;
    };
    const style: CSSProperties | undefined = mine && over?.index === index && drag.from !== index ? { boxShadow: over.after ? "0 3px 0 0 #0F80C3" : "0 -3px 0 0 #0F80C3" } : undefined;
    return {
      "data-row": "",
      style,
      onDragOver: mine
        ? (e: DragEvent<HTMLElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const a = after(e);
            setOver((o) => (o && o.index === index && o.after === a ? o : { index, after: a }));
          }
        : undefined,
      onDrop: mine
        ? (e: DragEvent<HTMLElement>) => {
            e.preventDefault();
            e.stopPropagation();
            let to = index + (after(e) ? 1 : 0);
            if (drag.from < to) to -= 1;
            if (to !== drag.from) onMove(drag.from, to);
            end();
          }
        : undefined,
    };
  };

  return { grip, row };
}
type Reorder = ReturnType<typeof useReorder>;

function Mover({ what, first, last, onStep, grip, small }: { what: string; first: boolean; last: boolean; onStep: (by: -1 | 1) => void; grip: ReturnType<Reorder["grip"]>; small?: boolean }) {
  const arrow = `grid w-7 place-items-center text-ndm-muted transition-colors hover:text-ndm-deep disabled:pointer-events-none disabled:opacity-25 ${small ? "h-4" : "h-5"}`;
  return (
    <span className="flex shrink-0 flex-col items-center">
      <button type="button" className={arrow} onClick={() => onStep(-1)} disabled={first} aria-label={`Move ${what} up`}>
        <Svg d="M4 10 8 6l4 4" size={14} />
      </button>
      <span {...grip} role="img" aria-label={`Drag to move ${what}`} title="Drag to rearrange" className={`grid w-7 cursor-grab place-items-center text-ndm-muted hover:text-ndm-deep active:cursor-grabbing ${small ? "h-4" : "h-5"}`}>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
          {[3, 7, 11].flatMap((y) => [4.5, 9.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" />))}
        </svg>
      </span>
      <button type="button" className={arrow} onClick={() => onStep(1)} disabled={last} aria-label={`Move ${what} down`}>
        <Svg d="M4 6l4 4 4-4" size={14} />
      </button>
    </span>
  );
}

/** A promotional label: its text, whether it shows, and a way to take it away. Never a price. */
function LabelEditor({ value, onChange, what }: { value: WooPromoLabel; onChange: (l: WooPromoLabel) => void; what: string }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
      <input
        type="text"
        value={value.text}
        maxLength={LABEL_MAX}
        list="pm-label-ideas"
        onChange={(e) => onChange({ text: e.target.value, enabled: e.target.value.trim() ? (value.text.trim() ? value.enabled : true) : false })}
        placeholder="No label"
        aria-label={`Promotional label, ${what}`}
        className={`${field} max-w-[300px]`}
      />
      {value.text.trim() !== "" && (
        <>
          <span className="flex items-center gap-2 font-inter text-[13px] text-ndm-muted">
            <Switch on={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} label={`Show the label, ${what}`} />
            {value.enabled ? "Label on" : "Label off"}
          </span>
          <button type="button" onClick={() => onChange({ text: "", enabled: false })} className="font-inter text-[13px] text-ndm-deep underline-offset-4 hover:underline">
            Remove label
          </button>
        </>
      )}
    </div>
  );
}

/** Regular and sale price of one option (or of a product without options), as WooCommerce stores them. */
function PriceFields({ regular, sale, onChange, what }: { regular: string; sale: string; onChange: (regular: string, sale: string) => void; what: string }) {
  const bad = regular.trim() || sale.trim() ? priceProblem(regular, sale) : "";
  const input = (value: string, set: (v: string) => void, label: string, placeholder: string) => (
    <label className="min-w-0">
      <span className={caption}>{label}</span>
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-inter text-[15px] text-ndm-muted">$</span>
        <input type="text" inputMode="decimal" value={value} maxLength={10} placeholder={placeholder} onChange={(e) => set(e.target.value.replace(/[^0-9.]/g, ""))} aria-label={`${label}, ${what}`} className={`${field} !pl-7`} />
      </span>
    </label>
  );
  return (
    <div>
      <div className="grid max-w-[420px] grid-cols-2 gap-3">
        {input(regular, (v) => onChange(v, sale), "Regular price", "0")}
        {input(sale, (v) => onChange(regular, v), "Sale price", "None")}
      </div>
      {bad && (
        <p role="alert" className="mt-2 font-inter text-[13px] text-[#B42318]">
          Please {bad}
        </p>
      )}
    </div>
  );
}

const Shown = ({ shown, onChange, what }: { shown: boolean; onChange: (shown: boolean) => void; what: string }) => (
  <span className="flex items-center gap-3 font-inter text-[14.5px] text-ndm-ink">
    <Switch on={shown} onChange={onChange} label={`Show ${what} on the Pricing page`} />
    {shown ? "Shown on the Pricing page" : "Hidden on the Pricing page"}
  </span>
);

/* ---- one price option (a WooCommerce variation), as the Pricing page's option row ---- */

interface OptionRowProps {
  v: WooAdminVariation;
  /** The product's own label, which an option without a label of its own shows. */
  inherited: WooPromoLabel;
  unit: string;
  dirty: boolean;
  editing: boolean;
  onEdit: () => void;
  onChange: (v: WooAdminVariation) => void;
  onRemove: () => void;
  mover: ReactNode;
  rowProps: ReturnType<Reorder["row"]>;
}

function OptionRow({ v, inherited, unit, dirty, editing, onEdit, onChange, onRemove, mover, rowProps }: OptionRowProps) {
  const fresh = v.id < 0; /* not in WooCommerce yet */
  const what = v.label.trim() || (fresh ? "the new option" : `variation ${v.id}`);
  const priced = v.price !== "" && Number.isFinite(Number(v.price));
  const own = v.promo.text.trim();
  const tag = own ? { text: own, on: v.promo.enabled } : inherited.enabled && inherited.text.trim() ? { text: inherited.text.trim(), on: true } : null;
  const was = v.onSale && Number(v.regularPrice) > Number(v.price) ? Number(v.regularPrice) : 0;
  const off = v.hidden || !v.enabled || !priced;
  return (
    <li {...rowProps} className="pr-opt rounded-[14px] bg-white py-3 pr-3 pl-1.5 sm:pl-2">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-5">
        <span className="row-span-2 sm:row-span-1">{mover}</span>
        <span className={`flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 ${off ? "opacity-50" : ""}`}>
          <span className="font-inter text-[15px] text-ndm-ink">{v.label || (fresh ? "New option" : "Any option")}</span>
          {tag && (
            <span className={`pr-tag ${tag.on ? "" : "line-through opacity-50"}`} title={tag.on ? undefined : "Label off"}>
              {tag.text}
            </span>
          )}
          {v.hidden && <Muted>Hidden</Muted>}
          {!v.enabled && <Muted>Off in WooCommerce</Muted>}
          {dirty && <Unsaved />}
        </span>
        <span className={`col-start-2 row-start-2 flex items-baseline gap-2.5 sm:col-start-3 sm:row-start-1 sm:justify-end ${off ? "opacity-50" : ""}`}>
          {!priced ? (
            <span className="font-inter text-[13.5px] text-ndm-muted">No price set</span>
          ) : (
            <>
              {was ? <s className="pr-was">{money(was)}</s> : null}
              <span className={`font-aeonik text-[22px] leading-none tracking-[-0.02em] ${was ? "text-ndm-deep" : "text-ndm-ink"}`}>
                {money(Number(v.price))}
                {unit && <span className="font-inter text-[13px] tracking-normal text-ndm-muted">{unit}</span>}
              </span>
            </>
          )}
        </span>
        <span className="col-start-3 row-span-2 row-start-1 sm:col-start-4 sm:row-span-1">
          <EditButton what={what} on={editing} onClick={onEdit} />
        </span>
      </div>
      {editing && (
        <div className={`${editor} mt-3 ml-1.5`}>
          {fresh && (
            <label className="mb-4 block max-w-[420px]">
              <span className={caption}>Option name (for example &ldquo;Package of 3&rdquo;)</span>
              <input type="text" value={v.label} maxLength={100} autoFocus onChange={(e) => onChange({ ...v, label: e.target.value })} className={`${field} mt-1.5`} />
            </label>
          )}
          <PriceFields regular={v.regularPrice} sale={v.salePrice} onChange={(regular, sale) => onChange(withPrices(v, regular, sale))} what={what} />
          <div className="mt-4">
            <span className={caption}>Promotional label for this option</span>
            <LabelEditor value={v.promo} onChange={(promo) => onChange({ ...v, promo })} what={what} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Shown shown={!v.hidden} onChange={(shown) => onChange({ ...v, hidden: !shown })} what={what} />
            <button type="button" className={quiet} onClick={onRemove}>
              Remove this option
            </button>
          </div>
          <p className="mt-3 font-inter text-[12.5px] text-ndm-muted">
            {fresh ? "Not saved yet: it becomes a WooCommerce variation when you save." : `Variation #${v.id}${v.sku ? `, SKU ${v.sku}` : ""}. Its ID stays the same when its price changes; its name is changed in WooCommerce.`}
          </p>
        </div>
      )}
    </li>
  );
}

/** Search WooCommerce products and add one to the category. */
function ProductSearch({ csrf, exclude, onAdd, onSignedOut }: { csrf: string; exclude: number[]; onAdd: (p: WooAdminProduct) => void; onSignedOut: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WooAdminProduct[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, start] = useTransition();

  const search = () =>
    start(async () => {
      setMessage("");
      const r = await searchProductsAction(csrf, query, exclude);
      if (r.ok) setResults(r.data);
      else if (r.reason === "signed-out") onSignedOut();
      else setMessage(r.message);
    });

  return (
    <div className="mb-5 rounded-[18px] border border-dashed border-ndm-ink/25 p-4">
      <p className={caption}>Add a WooCommerce product to this category</p>
      <form
        className="mt-2 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <label className="min-w-0 flex-1 basis-[220px]">
          <span className="sr-only">Search WooCommerce products</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search WooCommerce products by name" className={field} />
        </label>
        <button type="submit" disabled={busy} className="btn btn-sm btn-ink">
          <span>{busy ? "Searching" : "Search"}</span>
        </button>
      </form>
      {message && (
        <p role="alert" className="mt-3 font-inter text-[13.5px] text-[#B42318]">
          {message}
        </p>
      )}
      {results && (
        <ul className="mt-3 grid gap-1.5" role="list" aria-live="polite">
          {results.length === 0 && <li className="font-inter text-[14px] text-ndm-muted">No other WooCommerce product matches. New products are created in WooCommerce.</li>}
          {results.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-[12px] bg-ndm-paper px-3.5 py-2.5">
              <span className="min-w-0">
                <span className="block font-inter text-[15px] text-ndm-ink">{p.name}</span>
                <span className="block font-inter text-[12px] text-ndm-muted">
                  Product #{p.id}, {p.variations.length ? `${p.variations.length} variations` : "no variations"}
                  {p.status !== "publish" ? ", not published" : ""}
                </span>
              </span>
              <button
                type="button"
                className={quiet}
                onClick={() => {
                  onAdd(p);
                  setResults((list) => list?.filter((x) => x.id !== p.id) ?? null);
                }}
              >
                Add to category
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The public price list as it would look with the draft, in a full-screen layer. */
function Preview({ draft, pending, onClose }: { draft: Draft; pending: number; onClose: () => void }) {
  const view = useMemo(() => buildPricingView(toPublicTree(draft)), [draft]);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lockScroll(true);
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Preview of the Pricing page" data-lenis-prevent className="fixed inset-0 z-[200] overflow-y-auto bg-ndm-paper">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-ndm-night px-[var(--gx)] py-3 text-white">
        <p className="font-inter text-[14px]">
          <strong className="font-medium">Preview of the Pricing page.</strong> {pending ? `Includes ${pending} unsaved ${pending === 1 ? "change" : "changes"}: visitors do not see ${pending === 1 ? "it" : "them"} until you save.` : "This is what visitors see now."} Add to cart is switched off here.
        </p>
        <button ref={close} type="button" onClick={onClose} className="btn btn-sm btn-light">
          <span>Close preview</span>
        </button>
      </div>
      {/* the page's own list, with its real styles; the cart buttons are for visitors only */}
      <div className="[&_.pr-add]:pointer-events-none [&_.pr-add]:opacity-50 [&_.pr-qty]:pointer-events-none">
        {view.categories.length ? (
          <PriceList categories={view.categories} total={view.total} />
        ) : (
          <p className="px-[var(--gx)] py-24 text-center font-inter text-[15px] text-ndm-muted">Nothing would show on the Pricing page: no visible category has a visible, published product with a price.</p>
        )}
      </div>
    </div>
  );
}

type Editing = { kind: "category"; key: string } | { kind: "product"; key: string; id: number } | { kind: "variation"; key: string; id: number; product: number } | null;
const sameEdit = (a: Editing, b: Editing): boolean => !!a && !!b && a.kind === b.kind && a.key === b.key && ("id" in a ? a.id : 0) === ("id" in b ? b.id : 0);

interface PricingManagerProps {
  tree: WooAdminTree;
  /** The signed-in person's display name. */
  user: string;
  /** The session's own token, sent back with every request. */
  csrf: string;
  /** Address of WordPress, for the "Change prices in WooCommerce" links. */
  wpAdmin: string;
}

const flipped = (set: Set<string>, k: string, on?: boolean): Set<string> => {
  const n = new Set(set);
  if (on ?? !n.has(k)) n.add(k);
  else n.delete(k);
  return n;
};

export function PricingManager({ tree, user, csrf, wpAdmin }: PricingManagerProps) {
  const [saved, setSaved] = useState<Draft>(() => toDraft(tree));
  const [draft, setDraft] = useState<Draft>(saved);
  const [cats, setCats] = useState<Set<string>>(() => new Set()); /* open categories */
  const [items, setItems] = useState<Set<string>>(() => new Set()); /* open treatments, "category:product" */
  const [editing, setEditing] = useState<Editing>(null);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, start] = useTransition();
  const newCount = useRef(0);
  const reorder = useReorder();
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  /* an open category's title sticks right under this screen's bar, however tall the bar is */
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const set = () => root.current?.style.setProperty("--pm-top", `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const watch = new ResizeObserver(set);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const changes: Changes = useMemo(() => changesOf(saved, draft), [saved, draft]);
  const dirty = changes.count > 0;
  const blocked = changes.problems.length > 0;

  /* what visitors would see, for each box's "From" price and offer line */
  const view = useMemo(() => {
    const v = buildPricingView(toPublicTree(draft));
    return new Map(v.categories.map((c) => [c.id, { ...c, byId: new Map(c.items.map((it) => [it.id, it])) }]));
  }, [draft]);
  const total = useMemo(() => new Set(draft.categories.flatMap((c) => c.productIds)).size, [draft]);

  /* leaving with unsaved changes asks first */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const signedOut = () => window.location.reload();
  const setCategory = (key: string, change: (c: DraftCategory) => DraftCategory) => setDraft((d) => ({ ...d, categories: d.categories.map((c) => (c.key === key ? change(c) : c)) }));
  const setProduct = (p: WooAdminProduct) => setDraft((d) => ({ ...d, products: { ...d.products, [p.id]: p } }));
  const isEditing = (e: Editing) => sameEdit(editing, e);
  const toggleEdit = (e: NonNullable<Editing>) => {
    /* a box that is edited opens, and stays open when the editing is done */
    setCats((s) => (s.has(e.key) ? s : flipped(s, e.key, true)));
    if (e.kind !== "category") {
      const item = `${e.key}:${e.kind === "product" ? e.id : e.product}`;
      setItems((s) => (s.has(item) ? s : flipped(s, item, true)));
    }
    setEditing((now) => (sameEdit(now, e) ? null : e));
  };

  const addCategory = () => {
    newCount.current += 1;
    const key = `new-${Date.now().toString(36)}-${newCount.current}`;
    setDraft((d) => ({ ...d, categories: [...d.categories, { key, id: null, slug: "", name: "", description: "", visible: true, perUnit: false, productIds: [] }] }));
    setQuery("");
    setCats((s) => flipped(s, key, true));
    setEditing({ kind: "category", key });
    requestAnimationFrame(() => document.getElementById(`pm-${key}`)?.scrollIntoView({ block: "center" }));
  };

  const save = () =>
    start(async () => {
      setNotice(null);
      const r = await saveChangesAction(csrf, changes.patch);
      if (!r.ok) {
        if (r.reason === "signed-out") return signedOut();
        setNotice({ kind: "error", text: r.message });
        return;
      }
      const next = toDraft(r.data.tree);
      const renamed = (key: string) => (r.data.created[key] ? `c${r.data.created[key]}` : key);
      setSaved(next);
      setDraft(next);
      setCats((s) => new Set([...s].map(renamed)));
      setItems((s) => new Set([...s].map((k) => `${renamed(k.slice(0, k.lastIndexOf(":")))}${k.slice(k.lastIndexOf(":"))}`)));
      setEditing(null);
      setNotice({ kind: "ok", text: "Saved to WooCommerce. The Pricing page shows the changes on its next visit." });
    });

  const discard = () => {
    if (!window.confirm("Discard every unsaved change and go back to what WooCommerce holds?")) return;
    start(async () => {
      setNotice(null);
      const r = await reloadTreeAction(csrf);
      if (!r.ok) {
        if (r.reason === "signed-out") return signedOut();
        setNotice({ kind: "error", text: r.message });
        return;
      }
      const next = toDraft(r.data);
      setSaved(next);
      setDraft(next);
      setEditing(null);
    });
  };

  const q = query.trim().toLowerCase();
  const shown = draft.categories
    .map((c, index) => ({ c, index, hits: q ? c.productIds.filter((id) => `${c.name} ${draft.products[id]?.name ?? ""} ${draft.products[id]?.note ?? ""}`.toLowerCase().includes(q)) : null }))
    .filter((r) => !r.hits || r.hits.length > 0);
  const canMove = !q; /* a filtered list shows only part of the order */

  return (
    <div ref={root} className="min-h-[100svh] bg-ndm-paper text-ndm-ink [&_.pr-group.is-open>.pr-ghead]:top-[var(--pm-top,70px)]">
      <datalist id="pm-label-ideas">
        {LABEL_IDEAS.map((idea) => (
          <option key={idea} value={idea} />
        ))}
      </datalist>

      <header ref={bar} className="sticky top-0 z-30 border-b border-ndm-ink/10 bg-ndm-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-4 gap-y-2.5 px-[var(--gx)] py-3">
          <div className="mr-auto min-w-0">
            <p className="font-aeonik text-[22px] leading-[1.1] tracking-[-0.02em]">Pricing manager</p>
            <p className="font-inter text-[12.5px] text-ndm-muted">Signed in as {user}</p>
          </div>
          <p role="status" className={`${pill} ${dirty ? "bg-ndm-amber/20 text-[#8A5A00]" : "bg-[#E7F6EC] text-[#1B6B3A]"}`}>
            {busy ? "Working" : dirty ? `${changes.count} unsaved ${changes.count === 1 ? "change" : "changes"}` : "All changes saved"}
          </p>
          <button type="button" className={quiet} onClick={() => setPreview(true)}>
            Preview
          </button>
          <button type="button" className={quiet} onClick={discard} disabled={!dirty || busy}>
            Discard
          </button>
          <button type="button" className="btn btn-sm btn-ink disabled:pointer-events-none disabled:opacity-40" onClick={save} disabled={!dirty || busy || blocked}>
            <span>{busy ? "Saving" : "Save changes"}</span>
          </button>
          <button
            type="button"
            className="font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:text-ndm-ink hover:underline"
            onClick={() => {
              if (dirty && !window.confirm("Sign out and lose the unsaved changes?")) return;
              start(() => signOutAction(csrf));
            }}
          >
            Sign out
          </button>
        </div>
        {((notice && !(notice.kind === "ok" && dirty)) || blocked) && (
          <div className="mx-auto max-w-[1320px] px-[var(--gx)] pb-3">
            {blocked && (
              <p role="alert" className="rounded-[12px] bg-[#FFF4E5] px-4 py-2.5 font-inter text-[14px] text-[#8A5A00]">
                Before saving: {changes.problems.join(" ")}
              </p>
            )}
            {notice && !blocked && !(notice.kind === "ok" && dirty) && (
              <p role={notice.kind === "error" ? "alert" : "status"} className={`rounded-[12px] px-4 py-2.5 font-inter text-[14px] ${notice.kind === "error" ? "bg-[#FDECEA] text-[#B42318]" : "bg-[#E7F6EC] text-[#1B6B3A]"}`}>
                {notice.text}
              </p>
            )}
          </div>
        )}
      </header>

      {/* the Pricing page's own price list section, with its styles; only the edit and move controls are added */}
      <section id="prices" aria-labelledby="prices-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(48px,5vw,80px)] pb-[clamp(64px,7vw,110px)]">
        <div className="mx-auto max-w-[1040px]">
          <div className="text-center">
            <Eyebrow>Price list</Eyebrow>
            <TwoTone id="prices-title" className="mt-5" lead="Prices and" strong="current offers" />
            <p className="mx-auto mt-5 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted">
              This is the Pricing page&rsquo;s list. Use the pencil on any box to edit it (names, prices, labels, options), and its handle or arrows to rearrange. Nothing reaches visitors until you save.
            </p>
            <label className="relative mx-auto mt-6 block max-w-[560px]">
              <span className="sr-only">Search treatments</span>
              <IconSearch size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ndm-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${total} treatments`}
                className="h-14 w-full rounded-full border border-ndm-ink/10 bg-white pr-5 pl-12 font-inter text-[15px] text-ndm-ink outline-hidden transition placeholder:text-[#8A949B] focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15"
              />
            </label>
          </div>

          <div className="mt-[clamp(40px,4.5vw,64px)]">
            {q && (
              <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
                <p className="font-inter text-[14px] text-ndm-muted" aria-live="polite">
                  {shown.length ? "Showing matches only. Clear the search to rearrange." : `No treatments match “${query.trim()}”.`}
                </p>
                <button type="button" onClick={() => setQuery("")} className="font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline">
                  Clear search
                </button>
              </div>
            )}

            <ul className="pr-groups" role="list">
              {shown.map(({ c, index, hits }) => {
                const ids = hits ?? c.productIds;
                const pub = view.get(c.id ? c.slug : c.key);
                const editingCat = isEditing({ kind: "category", key: c.key });
                const on = q ? true : cats.has(c.key);
                const uid = `pm-${c.key}`;
                const name = c.name || "the new category";
                return (
                  <li key={c.key} {...reorder.row("category", "", index, (from, to) => setDraft((d) => ({ ...d, categories: relocated(d.categories, from, to) })))} className={`pr-group ${on ? "is-open" : ""}`}>
                    <h3 className="pr-ghead m-0 flex items-center gap-2 sm:gap-3">
                      {canMove && (
                        <Mover
                          what={name}
                          first={index === 0}
                          last={index === draft.categories.length - 1}
                          onStep={(by) => setDraft((d) => ({ ...d, categories: moved(d.categories, index, by) }))}
                          grip={reorder.grip("category", "", index)}
                        />
                      )}
                      <button
                        type="button"
                        id={uid}
                        aria-expanded={on}
                        aria-controls={`${uid}-body`}
                        onClick={() => setCats((s) => flipped(s, c.key))}
                        className="group grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6"
                      >
                        <span className={`min-w-0 ${c.visible ? "" : "opacity-50"}`}>
                          <span className="block font-inter text-[12.5px] text-ndm-muted tabular-nums">
                            {ids.length} {hits ? (ids.length === 1 ? "match" : "matches") : ids.length === 1 ? "treatment" : "treatments"}
                          </span>
                          <span className="mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.name || "New category"}</span>
                        </span>
                        <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                          {changes.categories.has(c.key) && <Unsaved />}
                          {!c.visible && <Muted>Hidden</Muted>}
                          {c.visible && !pub && <Muted>Nothing to show</Muted>}
                          {pub?.offer && <span className="pr-badge">{pub.offer}</span>}
                          {pub && (
                            <span className="font-inter text-[13px] whitespace-nowrap text-ndm-muted">
                              From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(pub.from)}</span>
                              {pub.fromUnit}
                            </span>
                          )}
                        </span>
                        <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
                          <i />
                          <i />
                        </span>
                      </button>
                      <EditButton what={name} on={editingCat} onClick={() => toggleEdit({ kind: "category", key: c.key })} />
                    </h3>

                    <div id={`${uid}-body`} role="region" aria-labelledby={uid} className="pr-body" inert={!on}>
                      <div>
                        {editingCat ? (
                          <div className={`${editor} mb-3`}>
                            <div className="grid gap-4 md:grid-cols-2">
                              <label>
                                <span className={caption}>Category name</span>
                                <input type="text" value={c.name} maxLength={200} autoFocus={!c.name} onChange={(e) => setCategory(c.key, (x) => ({ ...x, name: e.target.value }))} className={`${field} mt-1.5`} />
                              </label>
                              <div className="grid content-start gap-3 md:pt-6">
                                <Shown shown={c.visible} onChange={(visible) => setCategory(c.key, (x) => ({ ...x, visible }))} what="this category" />
                                <span className="flex items-center gap-3 font-inter text-[14.5px] text-ndm-ink">
                                  <Switch on={c.perUnit} onChange={(perUnit) => setCategory(c.key, (x) => ({ ...x, perUnit }))} label="This category is priced per unit" />
                                  Priced per unit
                                </span>
                              </div>
                              <label className="md:col-span-2">
                                <span className={caption}>Description (shown when the category is opened)</span>
                                <textarea value={c.description} maxLength={600} rows={2} onChange={(e) => setCategory(c.key, (x) => ({ ...x, description: e.target.value }))} className={`${field} mt-1.5 resize-y`} />
                              </label>
                            </div>
                            <p className="mt-3 font-inter text-[12.5px] text-ndm-muted">{c.id ? `WooCommerce category #${c.id}. Its ID stays the same when it is renamed.` : "Not saved yet: it becomes a WooCommerce product category when you save."}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-x-4 pb-2 sm:gap-x-8">
                            <p className="max-w-[60ch] min-w-0 font-inter text-[15px] leading-[1.55] text-ndm-muted">{c.description || "No description."}</p>
                            {ids.length > 1 &&
                              (() => {
                                const keys = ids.map((id) => `${c.key}:${id}`);
                                const allOpen = keys.every((k) => items.has(k));
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setItems((s) => keys.reduce((n, k) => flipped(n, k, !allOpen), s))}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ndm-ink/15 px-4 py-2 font-inter text-[13.5px] whitespace-nowrap text-ndm-ink transition-colors hover:border-ndm-ink hover:bg-ndm-ink hover:text-white"
                                  >
                                    <Svg d={allOpen ? "M3 8h10" : "M8 3v10M3 8h10"} />
                                    {allOpen ? "Collapse all" : "Expand all"}
                                  </button>
                                );
                              })()}
                          </div>
                        )}

                        {ids.length > 0 && (
                          <ul className="pr-sub" role="list">
                            {ids.map((id) => {
                              const p = draft.products[id];
                              if (!p) return null;
                              const i = c.productIds.indexOf(id);
                              const itemKey = `${c.key}:${id}`;
                              const editingItem = isEditing({ kind: "product", key: c.key, id });
                              const open = items.has(itemKey);
                              const pubItem = pub?.byId.get(id);
                              const itemName = p.name || `product ${id}`;
                              const itemDirty = changes.products.has(id) || p.variations.some((v) => changes.variations.has(v.id));
                              return (
                                <li key={id} {...reorder.row("product", c.key, i, (from, to) => setCategory(c.key, (x) => ({ ...x, productIds: relocated(x.productIds, from, to) })))} className={`pr-item ${open ? "is-open" : ""}`}>
                                  <h4 className="m-0 flex items-center gap-2 sm:gap-3">
                                    {canMove && (
                                      <Mover
                                        what={itemName}
                                        first={i === 0}
                                        last={i === c.productIds.length - 1}
                                        onStep={(by) => setCategory(c.key, (x) => ({ ...x, productIds: moved(x.productIds, i, by) }))}
                                        grip={reorder.grip("product", c.key, i)}
                                      />
                                    )}
                                    <button
                                      type="button"
                                      id={`${uid}-${id}`}
                                      aria-expanded={open}
                                      aria-controls={`${uid}-${id}-body`}
                                      onClick={() => setItems((s) => flipped(s, itemKey))}
                                      className="pr-head group grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[18px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6"
                                    >
                                      <span className={`min-w-0 ${p.hidden || p.status !== "publish" ? "opacity-50" : ""}`}>
                                        <span className="block font-aeonik text-[clamp(18px,1.45vw,22px)] leading-[1.22] tracking-[-0.015em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{p.name || "Unnamed product"}</span>
                                        {p.note && <span className="mt-1 block font-inter text-[13.5px] leading-[1.45] text-ndm-muted">{p.note}</span>}
                                      </span>
                                      <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                                        {itemDirty && <Unsaved />}
                                        {p.hidden && <Muted>Hidden</Muted>}
                                        {p.status !== "publish" && <Muted>Not published in WooCommerce</Muted>}
                                        {pubItem?.offer && <span className="pr-badge">{pubItem.offer}</span>}
                                        {pubItem && (
                                          <span className="font-inter text-[13px] whitespace-nowrap text-ndm-muted">
                                            From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{money(pubItem.from)}</span>
                                            {pubItem.fromUnit}
                                          </span>
                                        )}
                                      </span>
                                      <span aria-hidden="true" className="pr-plus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
                                        <i />
                                        <i />
                                      </span>
                                    </button>
                                    <EditButton what={itemName} on={editingItem} onClick={() => toggleEdit({ kind: "product", key: c.key, id })} />
                                  </h4>

                                  <div id={`${uid}-${id}-body`} role="region" aria-labelledby={`${uid}-${id}`} className="pr-body" inert={!open}>
                                    <div>
                                      {editingItem && (
                                        <div className={`${editor} mb-3`}>
                                          <div className="grid gap-4 md:grid-cols-2">
                                            <label>
                                              <span className={caption}>Product name</span>
                                              <input type="text" value={p.name} maxLength={200} onChange={(e) => setProduct({ ...p, name: e.target.value })} className={`${field} mt-1.5`} />
                                            </label>
                                            <label>
                                              <span className={caption}>Short description (optional, shown under the name)</span>
                                              <input type="text" value={p.note} maxLength={600} onChange={(e) => setProduct({ ...p, note: e.target.value })} className={`${field} mt-1.5`} />
                                            </label>
                                          </div>
                                          <div className="mt-4">
                                            <span className={caption}>Promotional label for the whole product (shows on every option without a label of its own)</span>
                                            <LabelEditor value={p.label} onChange={(label) => setProduct({ ...p, label })} what={itemName} />
                                          </div>
                                          {p.variations.length === 0 && (
                                            <div className="mt-4">
                                              <PriceFields regular={p.regularPrice} sale={p.salePrice} onChange={(regular, sale) => setProduct(withPrices(p, regular, sale))} what={itemName} />
                                            </div>
                                          )}
                                          <div className="mt-4 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
                                            <span className="flex flex-wrap items-center gap-3">
                                              <a href={`${wpAdmin}/wp-admin/post.php?post=${id}&action=edit`} target="_blank" rel="noopener noreferrer" className="font-inter text-[13.5px] text-ndm-deep underline-offset-4 hover:underline">
                                                Open in WooCommerce
                                              </a>
                                              <button
                                                type="button"
                                                className={quiet}
                                                onClick={() => {
                                                  setCategory(c.key, (x) => ({ ...x, productIds: x.productIds.filter((pid) => pid !== id) }));
                                                  setEditing(null);
                                                }}
                                              >
                                                Remove from this category
                                              </button>
                                            </span>
                                          </div>
                                          <p className="mt-3 font-inter text-[12.5px] text-ndm-muted">Product #{id}. Its ID stays the same when it is renamed.</p>
                                        </div>
                                      )}

                                      {p.variations.length ? (
                                        <ul className="grid gap-2 pb-5" role="list">
                                          {p.variations.map((v, k) => (
                                            <OptionRow
                                              key={v.id}
                                              v={v}
                                              inherited={p.label}
                                              unit={c.perUnit && v.label === "Regular" ? " / unit" : ""}
                                              dirty={changes.variations.has(v.id)}
                                              editing={isEditing({ kind: "variation", key: c.key, id: v.id, product: id })}
                                              onEdit={() => toggleEdit({ kind: "variation", key: c.key, id: v.id, product: id })}
                                              onChange={(next) => setProduct({ ...p, variations: p.variations.map((x) => (x.id === next.id ? next : x)) })}
                                              onRemove={() => {
                                                if (v.id > 0 && !window.confirm(`Remove “${v.label}” from ${itemName}? When you save, its WooCommerce variation is moved to the trash.`)) return;
                                                setProduct({ ...p, variations: p.variations.filter((x) => x.id !== v.id) });
                                                setEditing(null);
                                              }}
                                              rowProps={reorder.row("variation", String(id), k, (from, to) => setProduct({ ...p, variations: relocated(p.variations, from, to) }))}
                                              mover={
                                                canMove ? (
                                                  <Mover
                                                    small
                                                    what={v.label || `variation ${v.id}`}
                                                    first={k === 0}
                                                    last={k === p.variations.length - 1}
                                                    onStep={(by) => setProduct({ ...p, variations: moved(p.variations, k, by) })}
                                                    grip={reorder.grip("variation", String(id), k)}
                                                  />
                                                ) : null
                                              }
                                            />
                                          ))}
                                        </ul>
                                      ) : p.type === "variable" ? (
                                        <p className="pb-4 font-inter text-[14.5px] text-ndm-muted">This product has no options left. Without an option it does not show on the Pricing page.</p>
                                      ) : (
                                        <p className="pr-opt mb-5 rounded-[14px] bg-white px-5 py-3 font-inter text-[15px] text-ndm-ink">
                                          {p.price === "" || !Number.isFinite(Number(p.price)) ? (
                                            "No price set. Use the pencil to set one."
                                          ) : (
                                            <>
                                              This product has no variations. Its price is <span className="font-aeonik text-[20px] tracking-[-0.02em]">{money(Number(p.price))}</span>.
                                            </>
                                          )}
                                        </p>
                                      )}

                                      {p.type === "variable" &&
                                        (p.addable ? (
                                          <div className="pb-5">
                                            <button
                                              type="button"
                                              className={quiet}
                                              onClick={() => {
                                                newCount.current += 1;
                                                const fresh = newVariation(-(Date.now() % 1_000_000_000) - newCount.current, p.variations.length);
                                                setProduct({ ...p, variations: [...p.variations, fresh] });
                                                setEditing({ kind: "variation", key: c.key, id: fresh.id, product: id });
                                              }}
                                            >
                                              Add an option
                                            </button>
                                          </div>
                                        ) : (
                                          <p className="pb-5 font-inter text-[12.5px] text-ndm-muted">This product uses several attributes or a shared one, so new options for it are added in WooCommerce.</p>
                                        ))}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {ids.length === 0 && <p className="pb-4 font-inter text-[14.5px] text-ndm-muted">No products yet. A category without products does not show on the Pricing page.</p>}

                        {!q && (
                          <ProductSearch
                            csrf={csrf}
                            exclude={c.productIds}
                            onSignedOut={signedOut}
                            onAdd={(p) => {
                              setDraft((d) => ({
                                products: d.products[p.id] ? d.products : { ...d.products, [p.id]: p },
                                categories: d.categories.map((x) => (x.key === c.key && !x.productIds.includes(p.id) ? { ...x, productIds: [...x.productIds, p.id] } : x)),
                              }));
                              /* what WooCommerce holds for a product that was not on the screen before */
                              setSaved((s) => (s.products[p.id] ? s : { ...s, products: { ...s.products, [p.id]: p } }));
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {!q && (
              <div className="mt-8 text-center">
                <button type="button" className="btn btn-ink" onClick={addCategory}>
                  <span>New category</span>
                </button>
              </div>
            )}

            <p className="mx-auto mt-10 max-w-[70ch] text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">
              Prices and options changed here are saved to WooCommerce. Labels are promotional wording only, never a price. Prescription products: a label must not join the product name with a benefit claim. When in doubt, leave the label empty and ask Raymond Valadkhani before publishing.
            </p>
          </div>
        </div>
      </section>

      {preview && <Preview draft={draft} pending={changes.count} onClose={() => setPreview(false)} />}
    </div>
  );
}
