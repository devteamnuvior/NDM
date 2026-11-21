/** The clinic's online skincare shop: its address and the products shown on the home page. */

export const SHOP_URL = "https://shop.newdermamedlaserclinic.com/shop/";

export interface Product {
  name: string;
  size: string;
  /** Product photo (300 px), on the shop's own site. */
  image: string;
  href: string;
}

const SHOP_IMG = "https://shop.newdermamedlaserclinic.com/wp-content/uploads/2026/06/";
const product = (name: string, size: string, file: string, slug: string): Product => ({
  name,
  size,
  image: SHOP_IMG + file.replace(/\.png$/, "-300x300.png"),
  href: `https://shop.newdermamedlaserclinic.com/product/${slug}/`,
});

export const PRODUCTS: Product[] = [
  product("Activ Retinol 0.5", "30 ml", "RET0.5030-Activ-Retinol-0.5-30-ml-1.0-fl.-oz.png", "activ-retinol-0-5"),
  product("age element anti-wrinkle cream", "50 ml", "T-DAWS0003-age-element-anti-wrinkle-cream-50-ml-1.69-fl.-oz.png", "age-element-anti-wrinkle-cream"),
  product("Advanced Cleanser", "150 ml", "ADVCLE150-Advanced-Cleanser-150-ml-5.1-fl.-oz.png", "advanced-cleanser"),
  product("age element brightening concentrate", "30 ml", "T-DABS0004-age-element-brightening-concentrate-30-ml-1.01-fl.-oz.png", "age-element-brightening-concentrate"),
  product("Activabiome", "40 ml", "ACTBIO040-Activabiome-40-ml-1.35-fl.-oz.png", "activabiome"),
  product("age element firming cream", "50 ml", "T-DAFS0003-age-element-firming-cream-50-ml-1.69-fl.-oz.png", "age-element-firming-cream"),
  product("Activ Retinol 1.0", "30 ml", "RET1.0030-Activ-Retinol-1.0-30-ml-1.0-fl.-oz.png", "activ-retinol-1-0"),
  product("age element anti-wrinkle eye contour", "15 ml", "T-DAWS0004-age-element-anti-wrinkle-eye-contour-15-ml-0.51-fl.-oz.png", "age-element-anti-wrinkle-eye-contour"),
  product("age element brightening cream", "50 ml", "T-DABS0002-age-element-brightening-cream-50-ml-1.69-fl.-oz.png", "age-element-brightening-cream"),
  product("age element anti-wrinkle night cream", "50 ml", "T-DAWS0007-age-element-anti-wrinkle-night-cream-50-ml-1.69-fl.-oz.png", "age-element-anti-wrinkle-night-cream"),
  product("age element firming concentrate", "30 ml", "T-DAFS0005-age-element-firming-concentrate-30-ml-1.01-fl.-oz.png", "age-element-firming-concentrate"),
  product("age element anti-wrinkle lip & contour", "15 ml", "T-DAWS0006-age-element-anti-wrinkle-lip-contour-15-ml-0.51-fl.-oz.png", "age-element-anti-wrinkle-lip-contour"),
  product("age element firming eye contour", "15 ml", "T-DAFS0004-age-element-firming-eye-contour-15-ml-0.51-fl.-oz.png", "age-element-firming-eye-contour"),
  product("age element brightening complex", "4 vials", "T-DABS0005-age-element-brightening-complex-4-x-55-ml-0.19-fl.-oz.-bottles.png", "age-element-brightening-complex"),
];

/** How many tiles sit on the turning circle (the products repeat to fill it). */
export const SHOP_ORBIT_TILES = 20;
