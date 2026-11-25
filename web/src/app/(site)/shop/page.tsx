import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";
import { JsonLd } from "@/components/ui/json-ld";
import { getShopSale } from "@/lib/shop-sale";
import { getShopCatalog } from "@/lib/shop-store";
import { absolute, breadcrumbList, publisher } from "@/lib/seo";

const TITLE = "Medical-Grade Skincare Shop | NewDermaMed Toronto";
const DESCRIPTION = "Shop the medical-grade skincare we carry at our Toronto clinics, including Dermaceutic and Mesoestetic. Filter by concern, skin type, ingredient and price, and order online.";
const PATH = "/shop";

export function generateMetadata(): Metadata {
  const url = absolute(PATH);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "NewDermaMed",
      locale: "en_CA",
      title: TITLE,
      description: DESCRIPTION,
    },
    twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
  };
}

/**
 * /shop: every product of the online store (shop.newdermamedlaserclinic.com), read from its public API at
 * request time and cached (`getShopCatalog`). Prices are never typed here; checkout stays on the store.
 */
export default async function ShopRoute() {
  const [catalog, sale] = await Promise.all([getShopCatalog(), getShopSale()]);
  const url = absolute(PATH);
  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "CollectionPage",
            "@id": `${url}#page`,
            url,
            name: "Medical-grade skincare shop",
            description: DESCRIPTION,
            inLanguage: "en-CA",
            publisher: publisher(),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: catalog.products.length,
              itemListElement: catalog.products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Product",
                  name: p.name,
                  url: absolute(`/shop/${p.slug}`),
                  ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
                  ...(p.image ? { image: p.image.src } : {}),
                  ...(p.text ? { description: p.text } : {}),
                  offers: {
                    "@type": "Offer",
                    price: (p.price / 100).toFixed(2),
                    priceCurrency: "CAD",
                    availability: `https://schema.org/${p.inStock ? "InStock" : "OutOfStock"}`,
                    url: p.link,
                  },
                },
              })),
            },
          },
          breadcrumbList([["Skincare shop", PATH]]),
        ]}
      />
      <ShopPage catalog={catalog} sale={sale} />
    </>
  );
}
