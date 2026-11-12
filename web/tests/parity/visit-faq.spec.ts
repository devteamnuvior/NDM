import { sectionParity } from "./section";

/* Visit us: the clinic photos are served resized, so their pixels are close, not identical. */
sectionParity({ name: "visit", selector: 'section[aria-labelledby="visit"]', minElements: 60, pixelRatio: 0.01 });

/* FAQ: the first answer is open on both pages. */
sectionParity({ name: "faq", selector: 'section[aria-labelledby="faq"]', minElements: 50, pixelRatio: 0.002 });
