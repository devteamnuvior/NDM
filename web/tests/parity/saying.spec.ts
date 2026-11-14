import { sectionParity } from "./section";

/* Testimonials. With reduced motion the row does not drift, so both pages hold still. The award badges
   are served resized, so their pixels are close, not identical. */
sectionParity({ name: "testimonials", selector: 'section[aria-labelledby="testimonials"]', minElements: 60, pixelRatio: 0.004 });
