import Script from "next/script";

/** The clinic's Google Tag Manager container (marketing team, 2026-11-18). */
const GTM_ID = "GTM-TMLTWS56";

/** Only the live site sends anything: local work, previews and the tests have another SITE_URL or none. */
const LIVE_SITE = "https://newdermamedlaserclinic.com";

export function tagManagerOn(): boolean {
  return (process.env.SITE_URL ?? "").replace(/\/+$/, "") === LIVE_SITE;
}

/** Google's own snippet, loaded once the page can be used so it never holds back the first paint. */
export function TagManager() {
  if (!tagManagerOn()) return null;
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

/** The part of Google's snippet for browsers without JavaScript: first thing inside <body>. */
export function TagManagerNoScript() {
  if (!tagManagerOn()) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
