/** Structured data for search engines (schema.org), written into the page as one JSON-LD block. */
export function JsonLd({ graph }: { graph: Record<string, unknown>[] }) {
  /* "<" is written as an escape so the text can never close the script tag */
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
