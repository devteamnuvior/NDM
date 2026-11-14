import { sectionParity } from "./section";

/* Footer. With reduced motion its film stays on the poster on both pages. */
sectionParity({ name: "footer", selector: "footer", minElements: 60, pixelRatio: 0.003 });
