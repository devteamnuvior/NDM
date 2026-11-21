import { sectionParity } from "./section";

/* How it works: three step cards. The photos are served resized, so their pixels are close, not identical. */
sectionParity({ name: "process", selector: 'section[aria-labelledby="process"]', minElements: 30, pixelRatio: 0.01 });
