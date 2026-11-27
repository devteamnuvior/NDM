import { pageParity } from "./page";

/* The three legal documents: title block, "On this page" bar, the text, the footer. */
for (const id of ["privacy", "terms", "refunds"]) {
  pageParity({
    name: id,
    paths: { legacy: `/${id}.html`, next: `/${id}` },
    sectionCount: 2,
    sections: [
      { name: "breadcrumb", selector: "nav.crumbs" },
      { name: "title", selector: 'main > section[aria-labelledby="lg-title"]' },
      { name: "on-this-page", selector: "main > nav.tx-nav" },
      { name: "text", selector: "main > section:last-of-type" },
      /* Deliberate difference, as on Before & After: the prototype's simple pages never turn the header dark over
         the dark footer. The shared header does, so the header bar is left out of this picture. */
      { name: "footer", selector: "footer", pixelRatio: 0.004, prepare: (p) => p.addStyleTag({ content: "header{visibility:hidden!important}" }) },
    ],
  });
}
