import { sectionParity } from "./section";

/* Journal: four posts with their photos. */
sectionParity({ name: "journal", selector: 'section[aria-labelledby="journal"]', minElements: 30, pixelRatio: 0.002 });

/* Social: with reduced motion the phone shows the first reel's still frame and does not play. */
sectionParity({ name: "social", selector: 'section[aria-labelledby="social"]', minElements: 25, pixelRatio: 0.003 });
