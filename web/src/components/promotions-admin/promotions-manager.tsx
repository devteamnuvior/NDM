"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type DragEvent } from "react";
import { searchProductsAction, signOutAction } from "@/app/manage/pricing/actions";
import { savePromotionsAction } from "@/app/manage/promotions/actions";
import { OfferImg } from "@/components/specials/offer-photo";
import { SpecialIcon } from "@/components/specials/special-icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import type { OfferPriceChoice } from "@/lib/offers";
import type { WooAdminProduct } from "@/types/pricing";
import { PROMO_AREAS, PROMO_ICONS, PROMO_MAX, type PromoArea, type PromoIcon, type PromoScope, type PromotionInput, type WooAdminPromotion } from "@/types/promotions";
import { withBase } from "@/lib/base-path";

/**
 * The offers' management screen: the Promotion page's own "All current offers" cards, each with a
 * pencil (edit), arrows and a handle (rearrange) and a remove button, plus a box that adds a WooCommerce
 * product as an offer. It only collects changes: the server and WordPress check and write them, and
 * nothing reaches visitors until Save.
 */

const NAME_MAX = 200;
const TEXT_MAX = 600;

interface DraftOffer {
  productId: number;
  productName: string;
  name: string;
  text: string;
  area: PromoArea;
  icon: PromoIcon;
  focus: string;
  scope: PromoScope;
  photo: { src: string; srcSet: string } | null;
  /** A photo uploaded on this screen and not saved yet. */
  imageId?: number;
}

const toDraft = (offers: WooAdminPromotion[]): DraftOffer[] =>
  offers.map((o) => ({ productId: o.productId, productName: o.productName, name: o.name, text: o.text, area: o.area, icon: o.icon, focus: o.focus, scope: o.scope, photo: o.image ? { src: o.image.src, srcSet: o.image.srcSet } : null }));

const toInput = (o: DraftOffer): PromotionInput => ({ productId: o.productId, name: o.name.trim(), text: o.text.trim(), area: o.area, icon: o.icon, focus: o.focus, scope: o.scope, ...(o.imageId ? { imageId: o.imageId } : {}) });

const field =
  "w-full rounded-[12px] border border-ndm-ink/15 bg-white px-3.5 py-2.5 font-inter text-[15px] text-ndm-ink outline-hidden transition placeholder:text-[#8A949B] focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";
const caption = "block font-inter text-[13px] font-medium text-ndm-muted";
const pill = "inline-flex items-center rounded-full px-2.5 py-1 font-inter text-[12px] font-medium whitespace-nowrap";
const quiet =
  "inline-flex items-center justify-center rounded-full border border-ndm-ink/15 px-3.5 py-2 font-inter text-[13.5px] whitespace-nowrap text-ndm-ink transition-colors hover:border-ndm-deep hover:text-ndm-deep disabled:pointer-events-none disabled:opacity-40";
const round = "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ndm-ink/20 bg-white text-ndm-ink transition-colors hover:border-ndm-deep hover:text-ndm-deep disabled:pointer-events-none disabled:opacity-30";

const Svg = ({ d, w = "1.6" }: { d: string; w?: string }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const focusOf = (focus: string): [number, number] => {
  const m = /^(\d{1,3})% (\d{1,3})%$/.exec(focus);
  return m ? [Number(m[1]), Number(m[2])] : [50, 50];
};

/** Search WooCommerce products and add one as an offer. */
function AddOffer({ csrf, exclude, full, onAdd, onSignedOut }: { csrf: string; exclude: number[]; full: boolean; onAdd: (p: WooAdminProduct) => void; onSignedOut: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WooAdminProduct[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, start] = useTransition();

  const search = () =>
    start(async () => {
      setMessage("");
      const r = await searchProductsAction(csrf, query, exclude);
      if (r.ok) setResults(r.data.filter((p) => !exclude.includes(p.id)));
      else if (r.reason === "signed-out") onSignedOut();
      else setMessage(r.message);
    });

  return (
    <div className="mt-8 rounded-[22px] border border-dashed border-ndm-ink/25 p-5">
      <p className="font-aeonik text-[22px] leading-[1.1] tracking-[-0.02em] text-ndm-ink">Add an offer</p>
      <p className="mt-1.5 font-inter text-[14px] leading-[1.55] text-ndm-muted">
        An offer is a treatment from WooCommerce. Its price and red offer tag come from the price list; here you choose which treatments are shown and how their cards read.
      </p>
      {full ? (
        <p className="mt-3 font-inter text-[14px] text-[#8A5A00]">The page shows at most {PROMO_MAX} offers. Remove one to add another.</p>
      ) : (
        <form
          className="mt-3 flex flex-wrap gap-2"
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
      )}
      {message && (
        <p role="alert" className="mt-3 font-inter text-[13.5px] text-[#B42318]">
          {message}
        </p>
      )}
      {results && !full && (
        <ul className="mt-3 grid gap-1.5" role="list" aria-live="polite">
          {results.length === 0 && <li className="font-inter text-[14px] text-ndm-muted">No other WooCommerce product matches. New products are created in WooCommerce.</li>}
          {results.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-[12px] bg-white px-3.5 py-2.5">
              <span className="min-w-0">
                <span className="block font-inter text-[15px] text-ndm-ink">{p.name}</span>
                <span className="block font-inter text-[12px] text-ndm-muted">
                  Product #{p.id}
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
                Add as an offer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface PromotionsManagerProps {
  offers: WooAdminPromotion[];
  /** Every treatment on the public price list, by product ID, with what its card would show. */
  prices: Record<number, OfferPriceChoice>;
  user: string;
  csrf: string;
}

export function PromotionsManager({ offers, prices, user, csrf }: PromotionsManagerProps) {
  const [saved, setSaved] = useState<DraftOffer[]>(() => toDraft(offers));
  const [draft, setDraft] = useState<DraftOffer[]>(saved);
  const [editing, setEditing] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [busy, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadFor = useRef<number | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft.map(toInput)) !== JSON.stringify(saved.map(toInput)), [draft, saved]);
  const problems = useMemo(() => {
    const list: string[] = [];
    if (draft.some((o) => o.name.trim().length > NAME_MAX)) list.push(`A card title is longer than ${NAME_MAX} characters.`);
    if (draft.some((o) => o.text.trim().length > TEXT_MAX)) list.push(`A card text is longer than ${TEXT_MAX} characters.`);
    return list;
  }, [draft]);
  const blocked = problems.length > 0;

  /* leaving with unsaved changes asks first */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const signedOut = () => window.location.reload(); /* the page then shows the sign-in */
  const change = (id: number, patch: Partial<DraftOffer>) => setDraft((list) => list.map((o) => (o.productId === id ? { ...o, ...patch } : o)));
  const move = (from: number, to: number) =>
    setDraft((list) => {
      if (to < 0 || to >= list.length || from === to) return list;
      const next = list.slice();
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });

  const save = () =>
    start(async () => {
      setNotice(null);
      const r = await savePromotionsAction(csrf, draft.map(toInput));
      if (r.ok) {
        const fresh = toDraft(r.data);
        setSaved(fresh);
        setDraft(fresh);
        setEditing(null);
        setNotice({ kind: "ok", text: "Saved. The Promotion page, the home page and the Black Friday page now show these offers." });
      } else if (r.reason === "signed-out") signedOut();
      else setNotice({ kind: "error", text: r.message });
    });

  const upload = async (file: File) => {
    const id = uploadFor.current;
    if (id === null) return;
    setUploading(id);
    setNotice(null);
    try {
      const body = new FormData();
      body.set("photo", file);
      const response = await fetch(withBase("/manage/promotions/photo"), { method: "POST", headers: { "x-ndm-csrf": csrf }, body });
      const answer = (await response.json()) as { ok: boolean; id?: number; src?: string; message?: string };
      if (response.status === 401) return signedOut();
      if (!answer.ok || !answer.id || !answer.src) setNotice({ kind: "error", text: answer.message ?? "That photo could not be uploaded." });
      else change(id, { imageId: answer.id, photo: { src: answer.src, srcSet: "" } });
    } catch {
      setNotice({ kind: "error", text: "That photo could not be uploaded. Please try again." });
    } finally {
      setUploading(null);
    }
  };

  const grip = (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      const card = e.currentTarget.closest("[data-card]");
      if (card) e.dataTransfer.setDragImage(card, 28, 28);
      setDrag(index);
    },
    onDragEnd: () => {
      setDrag(null);
      setOver(null);
    },
  });

  return (
    <div className="min-h-[100svh] bg-ndm-paper text-ndm-ink">
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />

      <header className="sticky top-0 z-30 border-b border-ndm-ink/10 bg-ndm-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-4 gap-y-2.5 px-[var(--gx)] py-3">
          <div className="mr-auto min-w-0">
            <p className="font-aeonik text-[22px] leading-[1.1] tracking-[-0.02em]">Promotions manager</p>
            <p className="font-inter text-[12.5px] text-ndm-muted">Signed in as {user}</p>
          </div>
          <p role="status" className={`${pill} ${dirty ? "bg-ndm-amber/20 text-[#8A5A00]" : "bg-[#E7F6EC] text-[#1B6B3A]"}`}>
            {busy ? "Working" : dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <a
            href={withBase("/manage/pricing")}
            className={quiet}
            onClick={(e) => {
              if (dirty && !window.confirm("Open the price list and lose the unsaved changes?")) e.preventDefault();
            }}
          >
            Price list
          </a>
          <a href={withBase("/promotion")} target="_blank" rel="noreferrer" className={quiet}>
            View page
          </a>
          <button
            type="button"
            className={quiet}
            onClick={() => {
              setDraft(saved);
              setEditing(null);
              setNotice(null);
            }}
            disabled={!dirty || busy}
          >
            Discard
          </button>
          <button type="button" className="btn btn-sm btn-ink disabled:pointer-events-none disabled:opacity-40" onClick={save} disabled={!dirty || busy || blocked || uploading !== null}>
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
        {(blocked || (notice && !(notice.kind === "ok" && dirty))) && (
          <div className="mx-auto max-w-[1320px] px-[var(--gx)] pb-3">
            {blocked ? (
              <p role="alert" className="rounded-[12px] bg-[#FFF4E5] px-4 py-2.5 font-inter text-[14px] text-[#8A5A00]">
                Before saving: {problems.join(" ")}
              </p>
            ) : (
              notice && (
                <p role={notice.kind === "error" ? "alert" : "status"} className={`rounded-[12px] px-4 py-2.5 font-inter text-[14px] ${notice.kind === "error" ? "bg-[#FDECEA] text-[#B42318]" : "bg-[#E7F6EC] text-[#1B6B3A]"}`}>
                  {notice.text}
                </p>
              )
            )}
          </div>
        )}
      </header>

      {/* the Promotion page's own offers section, with its styles; only the edit and move controls are added */}
      <section aria-labelledby="offers" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(48px,5vw,80px)] pb-[clamp(64px,7vw,110px)]">
        <div className="text-center">
          <Eyebrow>Promotions</Eyebrow>
          <TwoTone
            as="h1"
            id="offers"
            className="mt-5"
            lead={
              <>
                All current
                <br />
              </>
            }
            strong="offers"
          />
          <p className="mx-auto mt-5 max-w-[62ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted">
            These are the cards of the Promotion page, the home page&rsquo;s offers wheel and the Black Friday page, in this order. Use the pencil on a card to edit it and its arrows or handle to rearrange. Prices and red offer tags come from the price list. Nothing
            reaches visitors until you save.
          </p>
          <p className="mx-auto mt-2 max-w-[62ch] font-inter text-[13.5px] leading-[1.6] text-ndm-muted">Keep card text qualified (&ldquo;may&rdquo;, &ldquo;can&rdquo;), and never pair a prescription drug&rsquo;s name with a benefit.</p>
        </div>

        {draft.length === 0 && <p className="mt-10 rounded-[20px] border border-ndm-ink/10 bg-white px-6 py-8 text-center font-inter text-[15px] text-ndm-muted">No offers yet. Visitors see a short note instead of the offers until you add one.</p>}

        <ul role="list" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {draft.map((o, i) => {
            const choice = prices[o.productId];
            const shown = choice ? (o.scope === "product" ? choice.product : choice.category) : null;
            const on = editing === o.productId;
            const title = o.name.trim() || o.productName;
            const [fx, fy] = focusOf(o.focus);
            return (
              <li
                key={o.productId}
                data-card=""
                data-product={o.productId}
                className={`min-w-0 ${on ? "sm:col-span-2 lg:col-span-3" : ""}`}
                style={drag !== null && over === i && drag !== i ? { boxShadow: drag < i ? "3px 0 0 0 #0F80C3" : "-3px 0 0 0 #0F80C3", borderRadius: 22 } : undefined}
                onDragOver={
                  drag !== null
                    ? (e) => {
                        e.preventDefault();
                        setOver(i);
                      }
                    : undefined
                }
                onDrop={
                  drag !== null
                    ? (e) => {
                        e.preventDefault();
                        move(drag, i);
                        setDrag(null);
                        setOver(null);
                      }
                    : undefined
                }
              >
                <article className={`promo-card relative flex h-full flex-col overflow-hidden rounded-[22px] p-3 pb-6 ${on ? "lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-x-6" : ""}`}>
                  <div className="flex min-w-0 flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist">
                      <OfferImg photo={o.photo} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: o.focus }} />
                      {!o.photo && <span className="absolute inset-0 grid place-items-center px-4 text-center font-inter text-[13px] text-ndm-muted">No photo yet. Upload one with the pencil.</span>}
                      {shown?.deal && (
                        <span className="deal-badge absolute top-3 left-3">
                          <i aria-hidden="true">%</i>
                          {shown.deal}
                        </span>
                      )}
                    </div>

                    <div className="relative mt-3 flex items-center gap-1.5 px-1">
                      <button type="button" className={round} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${title} earlier`} title="Earlier">
                        <Svg d="M10 4 6 8l4 4" />
                      </button>
                      <span {...grip(i)} role="img" aria-label={`Drag to move ${title}`} title="Drag to rearrange" className={`${round} cursor-grab active:cursor-grabbing`}>
                        <svg width={14} height={14} viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                          {[3, 7, 11].flatMap((y) => [4.5, 9.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" />))}
                        </svg>
                      </span>
                      <button type="button" className={round} onClick={() => move(i, i + 1)} disabled={i === draft.length - 1} aria-label={`Move ${title} later`} title="Later">
                        <Svg d="M6 4l4 4-4 4" />
                      </button>
                      <span className="mr-auto pl-1 font-inter text-[12.5px] text-ndm-muted">{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setEditing(on ? null : o.productId)}
                        aria-label={on ? `Finish editing ${title}` : `Edit ${title}`}
                        aria-pressed={on}
                        title={on ? "Done" : "Edit"}
                        className={`${round} ${on ? "!border-ndm-deep !bg-ndm-deep !text-white" : ""}`}
                      >
                        {on ? <Svg d="M3 8.5 6.5 12 13 4.5" /> : <Svg d="M10.6 2.9 13.1 5.4M2.5 13.5l.6-3.1 7.5-7.5 2.5 2.5-7.5 7.5-3.1.6Z" w="1.4" />}
                      </button>
                      <button
                        type="button"
                        className={`${round} hover:!border-[#B42318] hover:!text-[#B42318]`}
                        aria-label={`Remove ${title} from the offers`}
                        title="Remove from the offers"
                        onClick={() => {
                          setDraft((list) => list.filter((x) => x.productId !== o.productId));
                          if (on) setEditing(null);
                        }}
                      >
                        <Svg d="M4 4l8 8M12 4l-8 8" />
                      </button>
                    </div>

                    <div className="relative mt-4 flex items-center justify-between gap-2 px-3">
                      <span className="promo-badge grid size-12 shrink-0 place-items-center rounded-full">
                        <SpecialIcon name={o.icon} />
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className={`${pill} bg-ndm-ink/10 text-ndm-ink`}>{o.area}</span>
                        <span className="promo-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] tracking-[.12em] uppercase">{choice?.tag ?? "Not on the price list"}</span>
                      </span>
                    </div>
                    <h2 className="relative mt-5 px-3 font-aeonik text-[clamp(24px,2vw,28px)] leading-[1.1] font-normal tracking-[-0.025em] text-ndm-ink">{title}</h2>
                    <p className="relative mt-2 px-3 font-inter text-[15px] leading-[1.55] text-ndm-muted">{o.text}</p>
                    <div className="relative mt-auto px-3 pt-6">
                      {shown ? (
                        <>
                          <span className="block font-inter text-[11px] tracking-[.18em] text-ndm-muted uppercase">From</span>
                          <span className="mt-1 block font-aeonik text-[38px] leading-none tracking-[-0.035em] whitespace-nowrap text-ndm-deep">
                            <span className="sw-cur">$</span>
                            {shown.price}
                          </span>
                          <span className="mt-1.5 block min-h-[1em] font-inter text-[12.5px] text-ndm-muted">{shown.unit}</span>
                        </>
                      ) : (
                        <p role="note" className="rounded-[12px] bg-[#FFF4E5] px-3.5 py-2.5 font-inter text-[13.5px] leading-[1.5] text-[#8A5A00]">
                          Not shown to visitors: this treatment is not on the public price list, so it has no price to show. Add it to a visible category in the price list.
                        </p>
                      )}
                    </div>
                  </div>

                  {on && (
                    <div className="relative mt-5 grid min-w-0 content-start gap-4 rounded-[18px] border border-ndm-blue/40 bg-[#EEF7FC] p-4 lg:mt-0">
                      <p className="font-inter text-[13px] text-ndm-muted">
                        WooCommerce product: <strong className="font-medium text-ndm-ink">{o.productName}</strong> (#{o.productId})
                      </p>
                      <label>
                        <span className={caption}>Card title</span>
                        <input type="text" value={o.name} maxLength={NAME_MAX} placeholder={o.productName} onChange={(e) => change(o.productId, { name: e.target.value })} className={`${field} mt-1.5`} />
                        <span className="mt-1 block font-inter text-[12px] text-ndm-muted">Empty shows the product&rsquo;s own name.</span>
                      </label>
                      <label>
                        <span className={caption}>Card text</span>
                        <textarea value={o.text} maxLength={TEXT_MAX} rows={2} onChange={(e) => change(o.productId, { text: e.target.value })} className={`${field} mt-1.5 resize-y`} />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <fieldset>
                          <legend className={caption}>Filter</legend>
                          <div className="mt-1.5 flex gap-2">
                            {PROMO_AREAS.map((a) => (
                              <button key={a} type="button" aria-pressed={o.area === a} onClick={() => change(o.productId, { area: a })} className={`h-9 rounded-full border px-4 font-inter text-[13.5px] transition-colors ${o.area === a ? "border-ndm-deep bg-ndm-deep text-white" : "border-ndm-ink/15 bg-white text-ndm-ink hover:border-ndm-deep"}`}>
                                {a}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                        <fieldset>
                          <legend className={caption}>Icon</legend>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {PROMO_ICONS.map((name) => (
                              <button key={name} type="button" aria-pressed={o.icon === name} aria-label={`Icon: ${name}`} title={name} onClick={() => change(o.productId, { icon: name })} className={`grid size-10 place-items-center rounded-full border transition-colors ${o.icon === name ? "border-ndm-deep bg-ndm-deep text-white" : "border-ndm-ink/15 bg-white text-ndm-deep hover:border-ndm-deep"}`}>
                                <SpecialIcon name={name} />
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      </div>
                      <fieldset>
                        <legend className={caption}>Price and offer tag shown</legend>
                        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                          {(
                            [
                              ["product", "This treatment only", choice?.product],
                              ["category", `Lowest in its category${choice ? ` (${choice.tag})` : ""}`, choice?.category],
                            ] as const
                          ).map(([scope, label, value]) => (
                            <label key={scope} className={`flex cursor-pointer items-start gap-2.5 rounded-[12px] border bg-white px-3.5 py-2.5 ${o.scope === scope ? "border-ndm-deep" : "border-ndm-ink/15"}`}>
                              <input type="radio" name={`scope-${o.productId}`} checked={o.scope === scope} onChange={() => change(o.productId, { scope })} className="mt-1 accent-[#0F80C3]" />
                              <span className="min-w-0 font-inter text-[14px] text-ndm-ink">
                                {label}
                                <span className="block text-[12.5px] text-ndm-muted">{value ? `From $${value.price}${value.unit ? ` ${value.unit}` : ""}${value.deal ? `, ${value.deal}` : ""}` : "No price on the public list"}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className={caption}>Photo</legend>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            className={quiet}
                            disabled={uploading !== null}
                            onClick={() => {
                              uploadFor.current = o.productId;
                              fileInput.current?.click();
                            }}
                          >
                            {uploading === o.productId ? "Uploading" : o.photo ? "Replace photo" : "Upload photo"}
                          </button>
                          <span className="font-inter text-[12.5px] text-ndm-muted">JPEG, PNG or WebP, up to 8 MB. It becomes this product&rsquo;s image in WooCommerce when you save.</span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label>
                            <span className={caption}>Focus, left to right ({fx}%)</span>
                            <input type="range" min={0} max={100} value={fx} onChange={(e) => change(o.productId, { focus: `${e.target.value}% ${fy}%` })} className="mt-2 w-full accent-[#0F80C3]" />
                          </label>
                          <label>
                            <span className={caption}>Focus, top to bottom ({fy}%)</span>
                            <input type="range" min={0} max={100} value={fy} onChange={(e) => change(o.productId, { focus: `${fx}% ${e.target.value}%` })} className="mt-2 w-full accent-[#0F80C3]" />
                          </label>
                        </div>
                      </fieldset>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>

        <AddOffer
          csrf={csrf}
          exclude={draft.map((o) => o.productId)}
          full={draft.length >= PROMO_MAX}
          onSignedOut={signedOut}
          onAdd={(p) => {
            setDraft((list) => [...list, { productId: p.id, productName: p.name, name: "", text: "", area: "Face", icon: "drop", focus: "50% 50%", scope: "product", photo: null }]);
            setEditing(p.id);
          }}
        />
      </section>
    </div>
  );
}
