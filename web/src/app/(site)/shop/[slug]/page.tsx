import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/shop/product-page";
import { JsonLd } from "@/components/ui/json-ld";
import { productPath, SHOP_PAGE } from "@/config/shop";
import { getShopProduct, getShopSlugs } from "@/lib/shop-store";
import { absolute, breadcrumbList, publisher } from "@/lib/seo";

/**
 * /shop/<slug>: one product of the online store (its slug there), read from the store's public API with the rest
 * of the catalogue (cached). A product added to the store later gets its page without a new build.
 */
/* an address with no product behind it must answer "not found": the page waits for the store before it sends anything */
export const instant = false;

export async function generateStaticParams() {
  return (await getShopSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const found = await getShopProduct((await params).slug);
  if (!found) return {};
  const { product: p } = found;
  const url = absolute(productPath(p.slug));
  const title = `${p.name}${p.brand ? ` by ${p.brand}` : ""} | NewDermaMed Skincare Shop`;
  const description = [p.text, p.size, `Order online from the NewDermaMed skincare shop in Toronto.`].filter(Boolean).join(" ");
  const images = p.image ? [{ url: p.image.large, alt: p.name }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "NewDermaMed", locale: "en_CA", title, description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: images?.map((i) => i.url) },
  };
}

export default async function ShopProductRoute({ params }: PageProps<"/shop/[slug]">) {
  const found = await getShopProduct((await params).slug);
  if (!found) notFound();
  const { product: p, line, related, all } = found;
  const url = absolute(productPath(p.slug));
  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "Product",
            "@id": `${url}#product`,
            name: p.name,
            url,
            ...(p.sku ? { sku: p.sku } : {}),
            ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
            ...(p.gallery.length ? { image: p.gallery.map((g) => g.large) } : {}),
            description: p.description || p.text,
            ...(p.categories[0] ? { category: p.categories[0] } : {}),
            offers: {
              "@type": "Offer",
              url,
              price: (p.price / 100).toFixed(2),
              priceCurrency: "CAD",
              availability: `https://schema.org/${p.inStock ? "InStock" : "OutOfStock"}`,
              seller: publisher(),
            },
          },
          breadcrumbList([
            ["Skincare shop", SHOP_PAGE],
            [p.name, productPath(p.slug)],
          ]),
        ]}
      />
      <ProductPage p={p} line={line} related={related} all={all} />
    </>
  );
}
