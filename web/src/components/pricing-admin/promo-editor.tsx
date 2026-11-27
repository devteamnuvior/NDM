"use client";

import { useRef, useState } from "react";
import { SpecialIcon } from "@/components/specials/special-icon";
import type { WooAdminProduct, WooProductPromo } from "@/types/pricing";
import { PROMO_AREAS, PROMO_ICONS, PROMO_MAX } from "@/types/promotions";
import { withBase, withBaseSrcSet } from "@/lib/base-path";

/**
 * "Show in Promotions" for one treatment, inside its editor on the price list's management screen:
 * whether the treatment is one of the current offers (the Promotion page's cards and the offers
 * wheel), and how its card reads. The card's price and red offer tag are the price list's own. Like
 * everything on the screen it only edits the draft; the photo alone is uploaded at once (to
 * WordPress's media library) and tied to the product when the changes are saved.
 */

const field =
  "w-full rounded-[12px] border border-ndm-ink/15 bg-white px-3.5 py-2.5 font-inter text-[15px] text-ndm-ink outline-hidden transition placeholder:text-[#8A949B] focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";
const caption = "block font-inter text-[13px] font-medium text-ndm-muted";
const quiet =
  "inline-flex items-center justify-center rounded-full border border-ndm-ink/15 bg-white px-3.5 py-2 font-inter text-[13.5px] whitespace-nowrap text-ndm-ink transition-colors hover:border-ndm-deep hover:text-ndm-deep disabled:pointer-events-none disabled:opacity-40";
const choice = (on: boolean) => `h-9 rounded-full border px-4 font-inter text-[13.5px] transition-colors ${on ? "border-ndm-deep bg-ndm-deep text-white" : "border-ndm-ink/15 bg-white text-ndm-ink hover:border-ndm-deep"}`;

const focusOf = (focus: string): [number, number] => {
  const m = /^(\d{1,3})% (\d{1,3})%$/.exec(focus);
  return m ? [Number(m[1]), Number(m[2])] : [50, 50];
};

interface PromoEditorProps {
  product: WooAdminProduct;
  /** How many treatments are in Promotions in the draft, this one included when it is. */
  count: number;
  csrf: string;
  /** Changes the product in the draft; given the latest copy, so a finished upload never undoes later typing. */
  onChange: (change: (p: WooAdminProduct) => WooAdminProduct) => void;
  onSignedOut: () => void;
}

export function PromoEditor({ product: p, count, csrf, onChange, onSignedOut }: PromoEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const promo = p.promo;
  const what = p.name.trim() || `product ${p.id}`;
  const set = (patch: Partial<WooProductPromo>) => onChange((x) => (x.promo ? { ...x, promo: { ...x.promo, ...patch } } : x));
  const full = !promo && count >= PROMO_MAX;

  const upload = async (photo: File) => {
    setUploading(true);
    setProblem("");
    try {
      const body = new FormData();
      body.set("photo", photo);
      const response = await fetch(withBase("/manage/promotions/photo"), { method: "POST", headers: { "x-ndm-csrf": csrf }, body });
      const answer = (await response.json()) as { ok: boolean; id?: number; src?: string; message?: string };
      if (response.status === 401) return onSignedOut();
      const { id, src } = answer;
      if (!answer.ok || !id || !src) setProblem(answer.message ?? "That photo could not be uploaded.");
      else onChange((x) => (x.promo ? { ...x, image: { id, src, srcSet: "", width: 0, height: 0 }, promo: { ...x.promo, imageId: id } } : x));
    } catch {
      setProblem("That photo could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const [fx, fy] = focusOf(promo?.focus ?? "");

  return (
    <div className="mt-4 rounded-[14px] border border-ndm-ink/10 bg-white p-4" data-promo={p.id}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          role="switch"
          aria-checked={!!promo}
          aria-label={`Show ${what} in Promotions`}
          disabled={full}
          onClick={() => onChange((x) => ({ ...x, promo: x.promo ? null : { order: count, name: "", text: "", area: "Face", icon: "drop", focus: "50% 50%", scope: "product" } }))}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${promo ? "bg-ndm-deep" : "bg-ndm-ink/20"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${promo ? "translate-x-5" : ""}`} />
        </button>
        <span className="font-inter text-[14.5px] text-ndm-ink">{promo ? "Shown in Promotions" : "Not shown in Promotions"}</span>
        <span className="basis-full font-inter text-[12.5px] leading-[1.5] text-ndm-muted">
          {full
            ? `Promotions already shows ${PROMO_MAX} treatments. Take one out to add this one.`
            : "Promotions is the offers carousel (home page and Promotion page) and the “All current offers” cards on the Promotion page. The card's price and red tag come from this price list."}
        </span>
      </div>

      {promo && (
        <div className="mt-4 grid gap-4">
          {(p.hidden || p.status !== "publish") && (
            <p role="note" className="rounded-[12px] bg-[#FFF4E5] px-3.5 py-2.5 font-inter text-[13.5px] leading-[1.5] text-[#8A5A00]">
              Visitors will not see this card yet: the treatment is hidden or not published, so it has no price to show.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={caption}>Card title</span>
              <input type="text" value={promo.name} maxLength={200} placeholder={p.name} onChange={(e) => set({ name: e.target.value })} className={`${field} mt-1.5`} />
              <span className="mt-1 block font-inter text-[12px] text-ndm-muted">Empty shows the treatment&rsquo;s own name.</span>
            </label>
            <label>
              <span className={caption}>Card text (one line under the title)</span>
              <input type="text" value={promo.text} maxLength={600} onChange={(e) => set({ text: e.target.value })} className={`${field} mt-1.5`} />
              <span className="mt-1 block font-inter text-[12px] text-ndm-muted">Keep it qualified (&ldquo;may&rdquo;, &ldquo;can&rdquo;); never pair a prescription drug&rsquo;s name with a benefit.</span>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-start">
            <fieldset>
              <legend className={caption}>Filter</legend>
              <div className="mt-1.5 flex gap-2">
                {PROMO_AREAS.map((a) => (
                  <button key={a} type="button" aria-pressed={promo.area === a} onClick={() => set({ area: a })} className={choice(promo.area === a)}>
                    {a}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className={caption}>Icon</legend>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {PROMO_ICONS.map((name) => (
                  <button key={name} type="button" aria-pressed={promo.icon === name} aria-label={`Icon: ${name}`} title={name} onClick={() => set({ icon: name })} className={`grid size-9 place-items-center rounded-full border transition-colors ${promo.icon === name ? "border-ndm-deep bg-ndm-deep text-white" : "border-ndm-ink/15 bg-white text-ndm-deep hover:border-ndm-deep"}`}>
                    <SpecialIcon name={name} />
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="sm:justify-self-end">
              <span className={caption}>Position in Promotions</span>
              <select value={Math.min(promo.order, count - 1)} onChange={(e) => set({ order: Number(e.target.value) })} className={`${field} mt-1.5 w-auto min-w-[120px]`}>
                {Array.from({ length: Math.max(count, 1) }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1} of {Math.max(count, 1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset>
            <legend className={caption}>Price and offer tag on the card</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button type="button" aria-pressed={promo.scope === "product"} onClick={() => set({ scope: "product" })} className={choice(promo.scope === "product")}>
                This treatment only
              </button>
              <button type="button" aria-pressed={promo.scope === "category"} onClick={() => set({ scope: "category" })} className={choice(promo.scope === "category")}>
                Lowest in its category
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend className={caption}>Photo</legend>
            <div className="mt-1.5 flex flex-wrap items-center gap-4">
              <span className="relative block h-[90px] w-[144px] shrink-0 overflow-hidden rounded-[12px] bg-ndm-mist">
                {p.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- served and sized by WordPress */
                  <img src={withBase(p.image.src)} srcSet={withBaseSrcSet(p.image.srcSet || undefined)} sizes="144px" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: promo.focus }} />
                ) : (
                  <span className="absolute inset-0 grid place-items-center px-2 text-center font-inter text-[12px] text-ndm-muted">No photo yet</span>
                )}
              </span>
              <span className="grid min-w-0 flex-1 basis-[240px] gap-2">
                <span className="flex flex-wrap items-center gap-3">
                  <input
                    ref={file}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(e) => {
                      const photo = e.target.files?.[0];
                      e.target.value = "";
                      if (photo) void upload(photo);
                    }}
                  />
                  <button type="button" className={quiet} disabled={uploading} onClick={() => file.current?.click()}>
                    {uploading ? "Uploading" : p.image ? "Replace photo" : "Upload photo"}
                  </button>
                  <span className="font-inter text-[12.5px] text-ndm-muted">JPEG, PNG or WebP, up to 8 MB. It becomes this product&rsquo;s image in WooCommerce when you save.</span>
                </span>
                {problem && (
                  <span role="alert" className="font-inter text-[13.5px] text-[#B42318]">
                    {problem}
                  </span>
                )}
                <span className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className={caption}>Focus, left to right ({fx}%)</span>
                    <input type="range" min={0} max={100} value={fx} onChange={(e) => set({ focus: `${e.target.value}% ${fy}%` })} className="mt-1.5 w-full accent-[#0F80C3]" />
                  </label>
                  <label>
                    <span className={caption}>Focus, top to bottom ({fy}%)</span>
                    <input type="range" min={0} max={100} value={fy} onChange={(e) => set({ focus: `${fx}% ${e.target.value}%` })} className="mt-1.5 w-full accent-[#0F80C3]" />
                  </label>
                </span>
              </span>
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
