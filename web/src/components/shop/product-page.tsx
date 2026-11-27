import Link from "next/link";
import { ProductBuy, ProductGallery, RecentlyViewed } from "@/components/shop/product-buy";
import { ProductCard, cad, percentOff } from "@/components/shop/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { SHOP_PAGE } from "@/config/shop";
import { CLINICS } from "@/config/site";
import { tel } from "@/lib/routes";
import type { ShopCard, ShopProduct } from "@/types/shop";

const shopFilter = (key: string, value: string) => `${SHOP_PAGE}?${key}=${encodeURIComponent(value)}#products`;
const shortSize = (size: string) => size.replace(/\s*\(.*\)$/, "");

/** Chips that open the shop filtered by that value. */
function Chips({ k, list }: { k: string; list: string[] }) {
  return (
    <span className="flex flex-wrap gap-2">
      {list.map((v) => (
        <Link key={v} href={shopFilter(k, v)} className="spp-chip">
          {v}
        </Link>
      ))}
    </span>
  );
}

/** A folding section of the details, with a plus that turns into a minus. */
function Fold({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="spp-fold border-b border-ndm-ink/[.1]" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-inter text-[15px] font-medium text-ndm-ink">
        {title}
        <span aria-hidden="true" className="spp-plus" />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

/** A row of products under a two-tone heading. */
function Row({ id, lead, strong, text, list }: { id: string; lead: string; strong: string; text?: string; list: ShopCard[] }) {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <TwoTone
          id={id}
          size="text-[clamp(34px,4vw,58px)]"
          lead={
            <>
              {lead}
              <br />
            </>
          }
          strong={strong}
        />
        {text && <p className="max-w-[40ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>}
      </div>
      <ul role="list" className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
        {list.map((c) => (
          <li key={c.id}>
            <ProductCard p={c} sizes="(min-width: 1024px) 22vw, 46vw" />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * /shop/<slug>, after auna.framer.media's product page in the site's own design: the photo grid on the left, and on
 * the right a column that stays in view: brand and type, name, price and size, what it is, skin types and areas,
 * ingredient chips, size, quantity, Add to cart and Buy now (the online store's cart and checkout), three promises, a
 * short table, the description and folds. Then "Complete the routine" (the rest of its line, on a soft band), "You
 * may also like" and the products this browser opened before. Everything comes from the store.
 */
export function ProductPage({ p, line, related, all }: { p: ShopProduct; line: ShopCard[]; related: ShopCard[]; all: ShopCard[] }) {
  const [uptown, downtown] = CLINICS;
  const off = p.onSale ? percentOff(p) : 0;
  const crumbs: Parameters<typeof Breadcrumb>[0]["items"] = [["Skincare shop", { href: SHOP_PAGE, internal: true }], ...(p.brand ? [[p.brand, { href: shopFilter("brand", p.brand), internal: true }] as [string, { href: string; internal: true }]] : []), p.name];
  const facts: [string, string][] = (
    [
      ["Brand", p.brand],
      ["Product line", p.line.replace(/^[^:]*:\s*/, "")],
      ["Concerns", p.concerns.join(", ")],
      ["Product type", p.productTypes.join(", ")],
    ] as [string, string][]
  ).filter(([, v]) => v);

  return (
    <main id="main" data-shell="inner" data-page="shop" className="sp spp pt-[150px] xl:pt-[176px]">
      <Breadcrumb items={crumbs} />

      <section aria-labelledby="spp-title" className="px-[var(--gx)] pt-[clamp(20px,2.4vw,36px)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-[clamp(36px,4vw,72px)]">
          <ProductGallery p={p} />

          <div className="spp-info self-start lg:sticky lg:top-[120px]">
            <p className="font-inter text-[13.5px] text-ndm-muted">
              {p.brand && (
                <Link href={shopFilter("brand", p.brand)} className="font-mont text-[12px] tracking-[.16em] text-ndm-deep uppercase underline-offset-4 hover:underline">
                  {p.brand}
                </Link>
              )}
              {p.productTypes[0] && <span className="ml-2">{`· ${p.productTypes[0]}`}</span>}
            </p>
            <h1 id="spp-title" className="sp-name mt-3 font-aeonik text-[clamp(36px,3.6vw,54px)] leading-[1.04] font-normal tracking-[-0.03em] text-ndm-ink">
              {p.name}
            </h1>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-inter">
              <b className="text-[26px] font-semibold tracking-[-0.02em] text-ndm-ink tabular-nums">
                {cad(p.price)}
                {p.onSale && <span className="sr-only">, was {cad(p.regular)}</span>}
              </b>
              {p.onSale && (
                <s aria-hidden="true" className="text-[16px] text-ndm-muted/80 tabular-nums">
                  {cad(p.regular)}
                </s>
              )}
              {p.size && <span className="text-[14px] text-ndm-muted">{shortSize(p.size)}</span>}
              {off > 0 && <span className="sp-tag is-sale">{`Save ${off}% · ${cad(p.regular - p.price)}`}</span>}
            </p>
            {p.text && <p className="mt-4 max-w-[46ch] font-inter text-[17px] leading-[1.55] text-ndm-ink/80">{p.text}</p>}

            {(p.areas.length > 0 || p.skinTypes.length > 0) && (
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-inter text-[14px] text-ndm-ink/80">
                {p.areas.length > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <i aria-hidden="true" className="size-1.5 rounded-full bg-ndm-deep" />
                    {p.areas.join(", ")}
                  </span>
                )}
                {p.skinTypes.length > 0 && <span>{p.skinTypes.length >= 5 ? "All skin types" : `${p.skinTypes.join(", ")} skin`}</span>}
              </p>
            )}

            {p.ingredients.length > 0 && (
              <div className="mt-5">
                <Chips k="ingredient" list={p.ingredients} />
              </div>
            )}

            {p.size && (
              <div className="mt-6">
                <p className="font-inter text-[13.5px] text-ndm-muted">Size</p>
                <p className="spp-size mt-2 inline-flex">{p.size}</p>
              </div>
            )}

            <ProductBuy p={p} />

            <ul role="list" className="mt-6 space-y-1.5 font-inter text-[14px] leading-[1.55] text-ndm-muted">
              <li>
                <b className="font-medium text-ndm-ink">Secure checkout</b> on the NewDermaMed online store
              </li>
              <li>
                <b className="font-medium text-ndm-ink">Prices in CAD</b>, taxes and any delivery costs shown at checkout
              </li>
              <li>
                <b className="font-medium text-ndm-ink">Free consultation</b> with a VISIA® skin analysis,{" "}
                <a href={ACTIONS.book} className="text-ndm-deep underline-offset-4 hover:underline">
                  book one
                </a>
              </li>
            </ul>

            {facts.length > 0 && (
              <dl className="mt-6 border-t border-ndm-ink/[.1]">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-ndm-ink/[.1] py-3 font-inter text-[14px]">
                    <dt className="text-ndm-muted">{k}</dt>
                    <dd className="font-medium text-ndm-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-7">
              <h2 className="font-inter text-[15px] font-medium text-ndm-ink">Details</h2>
              <div className="mt-3 space-y-3 font-inter text-[15.5px] leading-[1.7] text-ndm-ink/80">
                {(p.description || p.text).split("\n\n").map((para) => (
                  <p key={para}>{para}</p>
                ))}
                <p className="text-[13.5px] text-ndm-muted">Individual results may vary. Ask our team before using a new product during a course of treatment.</p>
              </div>
            </div>

            <div className="mt-5 border-t border-ndm-ink/[.1]">
              {p.ingredients.length > 0 && (
                <Fold title="Key ingredients">
                  <Chips k="ingredient" list={p.ingredients} />
                  <p className="mt-3 font-inter text-[14px] leading-[1.6] text-ndm-muted">The main ingredients the store lists. The full ingredient list is on the packaging.</p>
                </Fold>
              )}
              <Fold title="Product details">
                <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 font-inter text-[14px]">
                  {(
                    [
                      ["Category", p.categories.join(", ")],
                      ["Size", p.size],
                      ["Skin type", p.skinTypes.join(", ")],
                      ["Area", p.areas.join(", ")],
                      ["SKU", p.sku],
                    ] as [string, string][]
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-ndm-muted">{k}</dt>
                        <dd className="text-ndm-ink">{v}</dd>
                      </div>
                    ))}
                </dl>
              </Fold>
              <Fold title="Ordering and returns">
                <div className="space-y-2.5 font-inter text-[14.5px] leading-[1.65] text-ndm-ink/80">
                  <p>Add to cart and Buy now open the NewDermaMed online store with this product in your cart, where you check out securely.</p>
                  <p>
                    Returns follow our{" "}
                    <Link href="/refunds" className="text-ndm-deep underline-offset-4 hover:underline">
                      refund policy
                    </Link>
                    . Questions about an order? Call Uptown at{" "}
                    <a href={tel(uptown.phone)} className="text-ndm-deep underline-offset-4 hover:underline">
                      {uptown.phone}
                    </a>{" "}
                    or Downtown at{" "}
                    <a href={tel(downtown.phone)} className="text-ndm-deep underline-offset-4 hover:underline">
                      {downtown.phone}
                    </a>
                    .
                  </p>
                </div>
              </Fold>
            </div>
          </div>
        </div>
      </section>

      {line.length > 0 && (
        <section aria-labelledby="spp-line" className="spp-band mt-[clamp(72px,8vw,128px)] px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
          <Row id="spp-line" lead="Complete" strong="the routine" text={`More from ${p.line.replace(/^[^:]*:\s*/, "") || p.brand}, to use alongside it as your provider advises.`} list={line} />
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="spp-related" className={`px-[var(--gx)] ${line.length ? "pt-[clamp(56px,6vw,96px)]" : "pt-[clamp(72px,8vw,128px)]"}`}>
          <Row id="spp-related" lead="You may" strong="also like" text="Products that share its concerns and ingredients." list={related} />
        </section>
      )}

      <RecentlyViewed slug={p.slug} all={all} />
      <div aria-hidden="true" className="h-[clamp(72px,8vw,120px)]" />
    </main>
  );
}
