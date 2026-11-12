import { sectionParity } from "./section";

/* Skincare shop. With reduced motion the product circle does not turn, so both pages hold still. */
sectionParity({ name: "shop", selector: 'section[aria-labelledby="shop"]', minElements: 60, pixelRatio: 0.002 });
