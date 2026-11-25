/* ---------------------------------------------------------------- the 404 page (user, 2026-11-25: calm and premium, nothing playful)
   The prototype copy of the Next.js NotFoundView (web/src/components/not-found/not-found-view.tsx): a large hairline "404" in the
   heading font, the two-tone heading, two ways back, a short numbered list of the pages people look for, both clinics' phone
   numbers, and a quiet photo of a treatment room beside it. */
const NF_WAYS = [
  ['Treatments', 'Every treatment, by area and concern', 'procedures.html'],
  ['Prices and offers', 'The full price list and current offers', 'pricing.html'],
  ['Before & after', 'Treatment cases, photographed in clinic', 'before-after.html'],
  ['Our clinics', 'Uptown and Downtown Toronto', 'about.html#clinics'],
];
function NotFoundPage() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} aria-labelledby="nf-title" className="nf-hero relative z-10 bg-ndm-paper px-[var(--gx)]">
      <div className="nf-wrap mx-auto grid w-full max-w-[1180px] items-center gap-[clamp(40px,5vw,80px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <div className="nf-copy">
          <p className="nf-code rv" aria-hidden="true">404</p>
          <Eyebrow className="rv">Page not found</Eyebrow>
          <TwoTone as="h1" id="nf-title" className="rv mt-5" size="text-[clamp(38px,4.4vw,64px)]" lead={<>This page is<br /></>} strong="no longer here" style={{ transitionDelay: '.06s' }} />
          <p className="rv mt-5 max-w-[46ch] font-inter text-[16px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: '.1s' }}>
            The address may have changed, or the page may have moved. Everything you came for is still close at hand.
          </p>
          <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: '.14s' }}>
            <Btn href="index.html" v="line">Back to home</Btn>
            <Btn href="#/book" v="book">Book Free Consultation</Btn>
          </div>
          <nav aria-label="Popular pages" className="nf-ways rv" style={{ transitionDelay: '.18s' }}>
            <ul role="list">
              {NF_WAYS.map(([t, d, href], i) => (
                <li key={href}>
                  <a href={href} className="nf-way group">
                    <span className="nf-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="nf-way-words"><span className="nf-way-title">{t}</span><span className="nf-way-text">{d}</span></span>
                    <span className="nf-way-arrow" aria-hidden="true"><IconArrow size={14} /></span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="nf-help rv" style={{ transitionDelay: '.22s' }}>
            Prefer to talk?{' '}
            {PHONES.map((p, i) => (
              <span key={p.label}>{i > 0 && <span aria-hidden="true"> · </span>}{p.label} <a href={tel(p.num)} className="nf-tel">{p.num}</a></span>
            ))}
          </p>
        </div>
        <figure className="nf-photo rv" style={{ transitionDelay: '.1s' }}>
          <img src="assets/hero/treatment-room.jpg" alt="A treatment room at NewDermaMed, Toronto" loading="lazy" className="nf-img" />
          <figcaption className="nf-cap"><span className="nf-cap-dot" aria-hidden="true" />Free consultation and VISIA® skin analysis at both clinics</figcaption>
        </figure>
      </div>
    </section>
  );
}
