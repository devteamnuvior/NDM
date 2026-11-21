import { pageParity } from "./page";

/* Blog article: the head with its photo, the text, Start your journey, related articles. */
pageParity({
  name: "article",
  paths: { legacy: "/what-causes-rosacea-redness.html", next: "/blog/what-causes-rosacea-redness" },
  sectionCount: 1,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "head", selector: "main > article > div", pixelRatio: 0.004 },
    { name: "body", selector: "#article-body", pixelRatio: 0.004 },
    { name: "analysis", selector: 'section[aria-labelledby="analysis-title"]', pixelRatio: 0.01 },
    { name: "related", selector: 'section[aria-labelledby="related-title"]', pixelRatio: 0.004 },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
