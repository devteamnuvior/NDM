/* ---------------------------------------------------------------- about page data (NDM About page: clinics, parking, gallery) */
const ABOUT_UP = `${NDM}/wp-content/uploads/2025/09/`;
const ABOUT_EMAIL = 'info@newdermamed.com';
const ABOUT_CLINICS = [
  {
    id: 'uptown', name: 'Uptown', area: 'Yonge Street, near Sheppard-Yonge Station', tag: 'Uptown clinic · Yonge Street', title: ['NewDermaMed', 'Uptown'], inside: `${ABOUT_UP}About-us-gallery-01.png`,
    addr: ['4763 Yonge Street', 'Toronto, ON M2N 5M5'], phone: '416-224-8800', map: 'https://maps.app.goo.gl/Gm8Wg4B1Q3yHGnkE7', ll: [43.7606276, -79.4103338],
    img: `${ABOUT_UP}upClinic.png`, alt: 'NewDermaMed signage above the Uptown clinic entrance on Yonge Street',
    blurb: 'At NewDermaMed Uptown, our team is here to help you look and feel your best. The clinic is a short walk from Sheppard-Yonge Station, with several parking options within a few minutes of the door.',
    parking: [
      ['Lot #56, Hullmark Centre', 'Bales Ave, Toronto, ON M2N 5M5', 'https://maps.app.goo.gl/rbQRgrwuKf5pBBfB6', [43.7609673, -79.4099159]],
      ['uPark', '9 Bogert Ave, Toronto, ON M2N 0H3', 'https://maps.app.goo.gl/SG57huVnJwDJjqfu9', [43.7603126, -79.4116059]],
      ['Parking Indigo, 25 Sheppard Ave W', '25 Sheppard Ave W, North York, ON M2N 6S7', 'https://maps.app.goo.gl/DpgB6iGLc9Vc8YvA7', [43.760647, -79.4117844]],
    ],
  },
  {
    id: 'downtown', name: 'Downtown', area: 'Bay Street, near College Station', tag: 'Downtown clinic · Bay Street', title: ['NewDermaMed', 'Downtown'], inside: `${ABOUT_UP}About-us-gallery-07.png`,
    addr: ['790 Bay Street, Suite 900', 'Toronto, ON M5G 1N8'], phone: '416-671-9766', map: 'https://maps.app.goo.gl/McaiszUJaKqPem5R7', ll: [43.6604681, -79.3860463],
    img: `${ABOUT_UP}downClinic.png`, alt: 'Front entrance of 790 Bay Street, home of the NewDermaMed Downtown clinic',
    blurb: 'NewDermaMed Downtown brings our treatments to the centre of the city. The clinic is steps from College Station, with parking at 790 Bay Street and on Elizabeth and College Streets.',
    parking: [
      ['Parking for 790 Bay Street', '790 Bay St, Toronto, ON M5G 1N8', 'https://maps.app.goo.gl/sYrf33nW6XimJqHA7', [43.6604363, -79.386293]],
      ['SP+ Parking', '201 Elizabeth St, Toronto, ON M5G 2C4', 'https://maps.app.goo.gl/PeePBqKrqdkcrDgc9', [43.659828, -79.3866552]],
      ['Parking lot, 76 College Street', '76 College St, Toronto, ON M5G 1L1', 'https://maps.app.goo.gl/NCWjPWqFGUKtDzBP9', [43.660937, -79.386625]],
    ],
  },
];
const ABOUT_GALLERY = [
  ['01', 'Reception', 'Reception & lounges', 'Reception with a sculpted white wall feature and lounge chairs'],
  ['02', 'Treatment corridor', 'Treatment rooms', 'Bright corridor lined with frosted glass treatment rooms'],
  ['03', 'Front counter', 'Reception & lounges', 'Framed beauty portraits above the front counter'],
  ['04', 'Treatment room', 'Treatment rooms', 'A provider preparing a treatment in a bright treatment room'],
  ['05', 'Front desk', 'Reception & lounges', 'Orchids and skincare display at the front desk'],
  ['06', 'Waiting lounge', 'Reception & lounges', 'Waiting lounge with black chairs and pendant lights'],
  ['07', 'Reception desk', 'Reception & lounges', 'Reception desk with glass treatment rooms behind it'],
  ['08', 'Treatment room', 'Treatment rooms', 'Treatment room with a white treatment bed and side desk'],
  ['09', 'Downtown, 790 Bay Street', 'Exteriors', 'Entrance of 790 Bay Street, home of the Downtown clinic'],
  ['10', 'Uptown, Yonge Street', 'Exteriors', 'NewDermaMed signage on the Uptown clinic on Yonge Street'],
].map(([n, t, cat, alt]) => ({ src: `${ABOUT_UP}About-us-gallery-${n}.png`, t, cat, alt }));
/* four local clinic photos join the ten NDM gallery photos so the mosaic has fourteen tiles */
const GAL_EXTRA = [
  ['assets/clinic/clinic-2.jpg', 'Treatment room', 'Treatment rooms', 'Bright treatment room with a white treatment chair'],
  ['assets/clinic/clinic-3.jpg', 'Lounge', 'Reception & lounges', 'Clinic lounge with a sculpted white wall feature'],
  ['assets/clinic/clinic-5.jpg', 'Skincare wall', 'Reception & lounges', 'Skincare display wall beside the reception desk'],
  ['assets/hero/treatment-room.jpg', 'Treatment suite', 'Treatment rooms', 'Private treatment suite with a treatment bed'],
].map(([src, t, cat, alt]) => ({ src, t, cat, alt }));
const GAL_ALL = [...ABOUT_GALLERY, ...GAL_EXTRA];
/* the mosaic, column by column: [placement classes, top offset (% of the column width), drift on scroll (px), [photo index, aspect]...].
   Desktop: 8 columns, the middle four end higher so the heading sits under them. Phones: the four marked columns, heading below. */
const GAL_COLS = [
  ['hidden md:flex md:col-start-1 md:row-start-1 md:row-span-2', 36, 46, [0, '135/192'], [5, '135/192']],
  ['flex col-start-1 row-start-1 md:col-start-2 md:row-span-2', 16, 26, [4, '1/1'], [2, '1/1'], [6, '1/1']],
  ['hidden md:flex md:col-start-3 md:row-start-1', 36, 10, [10, '135/300']],
  ['flex col-start-2 row-start-1 mt-[18%] md:col-start-4 md:mt-0', 0, -12, [8, '135/300']],
  ['flex col-start-3 row-start-1 md:col-start-5', 0, -12, [9, '135/300']],
  ['hidden md:flex md:col-start-6 md:row-start-1', 36, 10, [3, '135/300']],
  ['flex col-start-4 row-start-1 md:col-start-7 md:row-span-2', 16, 26, [7, '1/1'], [12, '1/1'], [1, '1/1']],
  ['hidden md:flex md:col-start-8 md:row-start-1 md:row-span-2', 36, 46, [11, '135/192'], [13, '135/192']],
];

const scrollToId = (id) => { const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 100); };

/* ---------------------------------------------------------------- banner */
function AboutHero() {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    img.style.transform = `translate3d(0,${(Math.min(window.scrollY, 900) * 0.18).toFixed(1)}px,0) scale(1.08)`;
  }, []);
  const go = (id) => (e) => { e.preventDefault(); scrollToId(id); };
  const links = [['team', 'Our team', 'Doctors and specialists'], ['clinics', 'Our clinics', 'Uptown and Downtown'], ['contact', 'Contact us', 'Call, text or email']];
  return (
    <section ref={ref} id="top" data-nav="dark" aria-labelledby="about-title" className="relative isolate flex min-h-[84svh] flex-col justify-end overflow-hidden bg-ndm-night pt-[150px] text-white md:min-h-[max(600px,84svh)] xl:pt-[180px]">
      <img ref={pic} src="assets/hero/clinic-reception.jpg" alt="" fetchpriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover will-change-transform" style={{ transform: 'scale(1.08)' }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.2) 65%,rgba(11,15,19,0) 100%),linear-gradient(180deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.34) 32%,rgba(11,15,19,.46) 58%,rgba(11,15,19,.9) 100%)' }} />
      <div className="px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-[820px]">
            <Eyebrow dark className="rv">About us</Eyebrow>
            <TwoTone as="h1" id="about-title" dark className="rv mt-5" size="text-[clamp(40px,5.2vw,80px)]" lead="About NewDermaMed," strong="Toronto’s cosmetic and laser clinic" style={{ transitionDelay: '.06s' }} />
            <p className="rv mt-5 max-w-[54ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.12s' }}>
              NewDermaMed offers convenience, privacy and advanced skin rejuvenation and body contouring at two Toronto clinics. Our medical team delivers personalized care, starting with a free consultation.
            </p>
            <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: '.18s' }}>
              <Btn href="#team" onClick={go('team')} v="glass">Meet our team</Btn>
              <Btn href="#/book" v="book" onDark>Book Free Consultation</Btn>
            </div>
          </div>
          {/* on-page links, styled like the index hero scene tabs */}
          <nav aria-label="On this page" data-float-avoid="" className="rv border-t border-white/15 pt-6 lg:border-0 lg:pt-0" style={{ transitionDelay: '.24s' }}>
            <ul className="flex items-center" role="list">
              {links.map(([id, t, l], k) => (
                <Fragment key={id}>
                  <li className="min-w-0 flex-1 lg:w-[clamp(170px,11.5vw,220px)] lg:flex-none">
                    <a href={`#${id}`} onClick={go(id)} className="group block px-1 py-1 text-center">
                      <span className="block font-inter text-[13px] font-medium leading-[1.3] text-white transition-colors group-hover:text-ndm-sky sm:text-[15px]">{t}</span>
                      <span className="mt-1.5 block font-inter text-[11.5px] leading-[1.35] text-ndm-soft sm:mt-2.5 sm:text-[13px]">{l}</span>
                    </a>
                  </li>
                  {k < links.length - 1 && <li role="presentation" aria-hidden="true" className="h-[50px] w-px shrink-0 bg-[#B9B9B9]/60" />}
                </Fragment>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- our team: every profile in full on the page (the home page opens them in a dialog) */
function TeamBio({ m }) {
  const hid = `${m.id}-name`, fid = `${m.id}-focus`, bid = `${m.id}-bio`;
  const [more, setMore] = useState(false);
  const [first, ...rest] = m.bio;
  return (
    <article id={m.id} aria-labelledby={hid} className="grid scroll-mt-[110px] grid-cols-[104px_minmax(0,1fr)] gap-x-5 gap-y-6 border-t border-ndm-ink/10 pt-[clamp(32px,4vw,56px)] sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-[clamp(40px,5vw,80px)]">
      <div className="lg:row-span-2">
        <div className="lg:sticky lg:top-[136px]">
          <div className="rv rv-clip relative aspect-[4/5] overflow-hidden rounded-[18px] bg-ndm-mist shadow-[0_24px_48px_-32px_rgba(27,36,43,.5)] lg:rounded-[22px]">
            <img src={m.img} alt={`Portrait of ${m.name}, ${m.role}`} width="800" height="1000" loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_15%]" />
          </div>
        </div>
      </div>
      <div className="self-end lg:self-start">
        <p className={`rv ${TEAM_CRED} text-[10.5px] sm:text-[11.5px]`}>{m.cred}</p>
        <h3 id={hid} className="rv mt-2 font-aeonik text-[clamp(26px,3vw,44px)] font-normal leading-[1.05] tracking-[-0.03em] text-ndm-ink" style={{ transitionDelay: '.05s' }}>{m.name}</h3>
        <p className="rv mt-1.5 font-inter text-[14px] text-ndm-muted sm:text-[15px]" style={{ transitionDelay: '.08s' }}>{m.role}</p>
      </div>
      <div className="col-span-2 min-w-0 lg:col-span-1 lg:col-start-2">
        <dl className="rv grid gap-4 border-y border-ndm-ink/10 py-5 sm:grid-cols-3 sm:gap-6">
          {m.facts.map(([k, v]) => (
            <div key={k}>
              <dt className={TEAM_LABEL}>{k}</dt>
              <dd className="mt-1 font-inter text-[15px] leading-[1.45] text-ndm-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="rv mt-6 max-w-[66ch] font-inter text-[15.5px] leading-[1.7] text-ndm-ink/80">
          <p>{first}</p>
          {rest.length > 0 && (
            <>
              <div id={bid} className={`team-more grid ${more ? 'is-open' : ''}`} {...(more ? {} : { inert: '' })}>
                <div className="min-h-0 overflow-hidden">{rest.map((p) => <p key={p.slice(0, 24)} className="mt-4">{p}</p>)}</div>
              </div>
              <button type="button" onClick={() => setMore(!more)} aria-expanded={more} aria-controls={bid}
                className="mt-3 inline-flex items-center gap-1.5 font-inter text-[14px] font-medium text-ndm-deep underline-offset-4 hover:underline">
                {more ? 'Show less' : 'Read full bio'}<IconChevron className={`transition-transform duration-300 ${more ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
        </div>
        <p className="rv mt-6 max-w-[60ch] rounded-[16px] bg-white px-5 py-4 font-aeonik text-[17px] leading-[1.45] tracking-[-0.01em] text-ndm-ink ring-1 ring-ndm-ink/[.06]">{m.highlight}</p>
        <div className="rv mt-6">
          <h4 id={fid} className={TEAM_LABEL}>{m.focusLabel}</h4>
          <ul className="mt-3 flex flex-wrap gap-2" role="list" aria-labelledby={fid}>
            {m.focus.map(([Icon, label]) => (
              <li key={label} className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 font-inter text-[13.5px] text-ndm-ink ring-1 ring-ndm-ink/10">
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep [&_svg]:size-4"><Icon /></span>{label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function AboutTeam() {
  const ref = useRef(null);
  useReveal(ref);
  /* four compact cards, Alin first: each one fits on a single screen; the full bios live in the home page's profile dialog */
  const people = TEAM_ORDER.map((id) => TEAM.find((m) => m.id === id)).filter(Boolean);
  /* each card opens the same profile dialog as the home page; a member whose profile has not arrived (sample) stays a plain card */
  const [sel, setSel] = useState(null);
  const opener = useRef(null);
  const open = (m) => (e) => { opener.current = e.currentTarget; setSel(m); };
  const closed = useCallback(() => {
    setSel(null);
    const btn = opener.current;
    requestAnimationFrame(() => { if (btn && btn.isConnected) btn.focus({ preventScroll: true }); });
  }, []);
  return (
    <section ref={ref} id="team" aria-labelledby="team-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <SectionHead id="team-title" eyebrow="Our team" lead={<>The people<br /></>} strong="behind your care"
        intro="Physicians, a vascular surgeon, a nurse practitioner and medical aesthetics specialists. Every treatment plan starts with a consultation and is guided by medical training." />
      <ul className="mt-[clamp(36px,4vw,56px)] grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list">
        {people.map((m, i) => (
          <li key={m.id} id={m.id} className="rv scroll-mt-[110px]" style={{ transitionDelay: `${0.06 * i}s` }}>
            <article aria-labelledby={`${m.id}-name`} className={`team-card group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] transition-shadow ${m.sample ? '' : 'hover:shadow-[0_30px_60px_-36px_rgba(27,36,43,.45)]'}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-ndm-mist xl:aspect-square">
                <img src={m.img} alt={`Portrait of ${m.name}, ${m.role}`} width="800" height="1000" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_18%] transition-transform duration-[1200ms] hover:scale-[1.04]" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-inter text-[12px] font-medium text-ndm-ink backdrop-blur-[6px]">{m.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {m.cred && <p className={`${TEAM_CRED} truncate text-[10.5px]`} title={m.cred}>{m.cred}</p>}
                <h3 id={`${m.id}-name`} className="mt-1.5 font-aeonik text-[clamp(22px,1.7vw,26px)] font-normal leading-[1.1] tracking-[-0.02em] text-ndm-ink">
                  {m.sample ? m.name : <button type="button" onClick={open(m)} aria-haspopup="dialog" className="text-left after:absolute after:inset-0 after:z-[1] after:content-[''] hover:text-ndm-deep focus-visible:outline-none">{m.name}<span className="sr-only">, view full profile</span></button>}
                </h3>
                <p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{m.role}</p>
                <p className="mt-3 line-clamp-3 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/80">{m.short || 'A nurse practitioner on our medical team.'}</p>
                {m.focus && (
                  <ul className="mt-4 flex flex-wrap gap-1.5" role="list" aria-label={m.focusLabel}>
                    {m.focus.slice(0, 2).map(([, label]) => <li key={label} className="rounded-full bg-ndm-mist px-2.5 py-1 font-inter text-[12px] text-ndm-ink">{label}</li>)}
                  </ul>
                )}
                <p aria-hidden="true" className={`mt-auto flex items-center gap-2 pt-5 font-inter text-[13.5px] font-semibold ${m.sample ? 'text-ndm-muted' : 'text-ndm-deep'}`}>
                  {m.sample ? 'Full profile coming soon' : <>View full profile<IconArrow size={13} className="transition-transform group-hover:translate-x-1" /></>}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {sel && ReactDOM.createPortal(<TeamProfile m={sel} onClose={closed} />, document.body)}
    </section>
  );
}

/* ---------------------------------------------------------------- about NewDermaMed, over the clinic film (same as the home page):
   the framed film opens to full width as it comes into view; the numbers sit in the pricing-hero strip */
const ABOUT_FILM = { poster: 'assets/home/v3/tour-poster-1440.webp', src: 'assets/home/v3/tour-1600.mp4' };
const ABOUT_STATS = [[16, '+', 'years', 'In Toronto'], [8, '', 'Top Choice Awards', 'In a row, 2019 to 2026'], [2, '', 'Toronto clinics', 'Uptown and Downtown'], [20, '+', 'categories', 'Of treatment']];
function AboutFilm({ hero = false }) {
  const ref = useRef(null), frame = useRef(null), vid = useRef(null), stats = useRef(null);
  useReveal(ref);
  const run = useInView(stats, { threshold: 0.4 });
  useEffect(() => {
    const v = vid.current; if (!v) return;
    v.muted = true;
    if (REDUCED || (navigator.connection && navigator.connection.saveData)) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { const q = v.play(); if (q && q.catch) q.catch(() => {}); } else v.pause(); }, { rootMargin: '100% 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  useOnScroll(() => {
    const el = frame.current; if (!el || REDUCED) return;
    if (hero) { el.style.setProperty('--p', '1'); return; } /* as the page header it is full width from the start */
    const h = window.innerHeight, r = el.getBoundingClientRect();
    el.style.setProperty('--p', clamp01((h * 1.3 - r.top) / (h * 0.5)).toFixed(3));
  }, []);
  const go = (id) => (e) => { e.preventDefault(); scrollToId(id); };
  const H = hero ? 'h1' : 'h2';
  return (
    <section ref={ref} id={hero ? 'top' : 'about-ndm'} aria-labelledby="about-ndm-title" data-nav="dark" className="relative z-10 bg-ndm-night">
      <div ref={frame} className={`cf-frame ${hero ? 'is-hero' : ''}`} style={hero ? { '--p': 1 } : undefined}>
        <video ref={vid} muted loop playsInline preload="auto" poster={ABOUT_FILM.poster} aria-hidden="true"><source src={ABOUT_FILM.src} type="video/mp4" /></video>
        <div className="absolute inset-x-0 bottom-0 z-[2] grid gap-8 px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <Eyebrow dark className="rv">About NewDermaMed</Eyebrow>
            <TwoTone as={H} dark id="about-ndm-title" className="rv mt-4" size={hero ? 'text-[clamp(38px,4.8vw,72px)]' : 'text-[clamp(32px,4vw,60px)]'} lead={<>Toronto’s cosmetic<br /></>} strong="and laser clinic" style={{ transitionDelay: '.05s' }} />
            <p className="rv mt-3 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-white/80" style={{ transitionDelay: '.1s' }}>{STATEMENT} Recognized as Toronto’s Top Choice Cosmetic &amp; Laser Clinic for eight consecutive years.</p>
            {hero && (
              <div className="rv mt-7 flex flex-wrap gap-3" style={{ transitionDelay: '.14s' }}>
                <Btn href="#/book" v="book" onDark>Book Free Consultation</Btn>
                <Btn href="#team" onClick={go('team')} v="glass">Meet our team</Btn>
              </div>
            )}
          </div>
          <ul ref={stats} className="rv grid grid-cols-2 gap-y-5 border-t border-white/15 pt-6 sm:flex sm:items-center lg:border-0 lg:pt-0" role="list" style={{ transitionDelay: '.18s' }}>
            {ABOUT_STATS.map(([n, suf, t, l], k) => (
              <Fragment key={t}>
                <li className="min-w-0 px-1 py-1 text-center sm:flex-1 lg:w-[clamp(160px,11.5vw,220px)] lg:flex-none">
                  <span className="block font-inter text-[14px] font-medium leading-[1.3] text-white sm:text-[15px]"><span className="tabular-nums"><CountUp to={n} run={run} suffix={suf} /></span> {t}</span>
                  <span className="mt-1.5 block font-inter text-[12px] leading-[1.35] text-ndm-soft sm:mt-2.5 sm:text-[13px]">{l}</span>
                </li>
                {k < ABOUT_STATS.length - 1 && <li role="presentation" aria-hidden="true" className="hidden h-[50px] w-px shrink-0 bg-[#B9B9B9]/60 sm:block" />}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- our clinics: one compact light section per clinic.
   A full-width map (Leaflet + Esri light grey tiles) with the clinic photo popped up on its pin and numbered parking pins; the details sit below in one tidy row. */
function ClinicMap({ c, h = 'h-[clamp(320px,40vw,500px)]' }) {
  const box = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current, L = window.L; if (!el || !L) return;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const map = L.map(el, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: false, attributionControl: true, minZoom: 12, maxZoom: 16 });
    if (!touch) L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.setPrefix(false);
    const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_';
    L.tileLayer(`${esri}Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, attribution: 'Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors' }).addTo(map);
    L.tileLayer(`${esri}Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16 }).addTo(map);
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const pin = L.divIcon({
      className: 'map-clinic', iconSize: [160, 190], iconAnchor: [80, 190],
      html: `<div class="map-card"><span class="map-photo"><img src="${c.img}" alt=""></span><span class="map-name">${esc(c.name)} clinic</span></div><i class="map-stem"></i><i class="map-dot"></i>`,
    });
    L.marker(c.ll, { icon: pin, title: `NewDermaMed ${c.name} clinic`, zIndexOffset: 1000, keyboard: false }).addTo(map);
    c.parking.forEach(([n, ad, href, ll], k) => {
      const icon = L.divIcon({ className: 'map-park', iconSize: [30, 30], iconAnchor: [15, 15], html: '<span>P</span>' });
      const info = `<strong>${esc(n)}</strong><br>${esc(ad)}`;
      L.marker(ll, { icon, title: `Parking: ${n}`, keyboard: false, zIndexOffset: 2000 }).addTo(map)
        .bindTooltip(info, { direction: 'top', offset: [0, -16], className: 'map-tip' })
        .bindPopup(`${info}<br><a href="${href}" target="_blank" rel="noopener">Directions</a>`, { offset: [0, -14] });
    });
    map.fitBounds(L.latLngBounds([c.ll, ...c.parking.map((x) => x[3])]), { paddingTopLeft: [40, 200], paddingBottomRight: [40, 50], maxZoom: 16 });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); map.remove(); };
  }, []);
  return (
    <div className={`clinic-map relative isolate overflow-hidden rounded-[22px] ring-1 ring-ndm-ink/[.08] ${on ? 'is-on' : ''}`}>
      <div ref={box} role="img" aria-label={`Map of the ${c.name} clinic at ${c.addr.join(', ')} and ${c.parking.length} nearby parking lots`} className={`${h} w-full bg-[#F2F2EF]`} />
      <div className="pointer-events-none absolute bottom-7 left-3 z-[500] flex flex-wrap gap-2 sm:bottom-8 sm:left-4">
        <span className="map-legend"><i className="map-legend-dot" />Clinic</span>
        <span className="map-legend"><i className="map-legend-p">P</i><span>Parking<span className="map-hint-hover">, hover for address</span><span className="map-hint-tap">, tap for address</span></span></span>
      </div>
    </div>
  );
}

/* round 22: the two clinics side by side in one section (stacked on phones), each a white card with its map and details */
function ClinicCard({ c, i }) {
  const hid = `clinic-${c.id}`;
  const num = tel(c.phone).replace('tel:', '');
  const label = 'font-inter text-[11px] uppercase tracking-[.14em] text-ndm-muted';
  const link = 'underline-offset-4 transition-colors hover:text-ndm-deep hover:underline';
  return (
    <article id={c.id} aria-labelledby={hid} className="rv flex scroll-mt-[100px] flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(15,60,95,.45)]" style={{ transitionDelay: `${0.08 * i}s` }}>
      <div className="relative">
        <ClinicMap c={c} h="h-[clamp(250px,22vw,310px)]" />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-start justify-between gap-3">
          <span className="rounded-[16px] bg-white/95 px-4 py-2.5 shadow-[0_14px_30px_-18px_rgba(11,15,19,.5)] backdrop-blur-[8px]">
            <span className="flex items-center gap-1.5 font-inter text-[11.5px] font-medium text-ndm-deep"><IconPin size={12} />{c.area}</span>
            <h3 id={hid} className="mt-0.5 font-aeonik text-[clamp(22px,1.9vw,27px)] font-normal leading-[1.1] tracking-[-0.02em] text-ndm-ink">{c.title[0]} <span className="tt-strong text-ndm-deep">{c.title[1]}</span></h3>
          </span>
        </div>
      </div>
      <div className="grid gap-x-5 gap-y-4 px-5 pt-5 sm:grid-cols-[1.15fr_1fr_1fr]">
        <div>
          <p className={label}>Address</p>
          <p className="mt-1.5 font-inter text-[14px] leading-[1.45] text-ndm-ink"><a href={c.map} target="_blank" rel="noopener" className={link}>{c.addr[0]}<br />{c.addr[1]}<span className="sr-only"> (opens Google Maps)</span></a></p>
        </div>
        <div>
          <p className={label}>Contact</p>
          <p className="mt-1.5 font-inter text-[14px] leading-[1.45] text-ndm-ink">
            <a href={tel(c.phone)} className={link}>{c.phone}</a> · <a href={`sms:${num}`} className={`${link} text-ndm-muted`}>Text</a><br />
            <a href={`mailto:${ABOUT_EMAIL}`} className={`${link} break-all`}>{ABOUT_EMAIL}</a>
          </p>
        </div>
        <div>
          <p className={label}>Hours</p>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 font-inter text-[14px] leading-[1.45]">
            {HOURS.map(([d, h]) => <Fragment key={d}><dt className="text-ndm-muted">{d.replace(' – ', ' to ').replace('Monday', 'Mon').replace('Friday', 'Fri').replace('Saturday', 'Sat')}</dt><dd className="text-ndm-ink">{h.replace(' – ', ' to ')}</dd></Fragment>)}
          </dl>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2.5 px-5 pb-5 pt-5">
        <Btn href="#/book" v="book" hot sm>Book Free Consultation</Btn>
        <Btn href={c.map} target="_blank" rel="noopener" v="line" sm>Get directions<span className="sr-only"> to the {c.name} clinic (opens in a new tab)</span></Btn>
      </div>
    </article>
  );
}

function AboutClinics() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="clinics" aria-labelledby="clinics-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <Eyebrow className="rv">Our clinics</Eyebrow>
      <TwoTone id="clinics-title" className="rv mt-4" lead={<>Visit us in<br /></>} strong="Uptown or Downtown" style={{ transitionDelay: '.05s' }} />
      <div className="mt-[clamp(28px,3.4vw,48px)] grid gap-5 lg:grid-cols-2 lg:gap-6">
        {ABOUT_CLINICS.map((c, i) => <ClinicCard key={c.id} c={c} i={i} />)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- contact us: details for both clinics and a message form */
function AboutContact() {
  const ref = useRef(null);
  useReveal(ref);
  const [sent, setSent] = useState(false);
  const [clinic, setClinic] = useState('');
  return (
    <section ref={ref} id="contact" aria-labelledby="contact-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-[clamp(48px,6vw,110px)]">
        <div>
          <Eyebrow className="rv">Contact us</Eyebrow>
          <TwoTone id="contact-title" className="rv mt-5" lead={<>We’re here<br /></>} strong="to help" style={{ transitionDelay: '.06s' }} />
          <p className="rv mt-5 max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Call or text either clinic, email us, or send a message and our team will get back to you.</p>
          <ul className="rv mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" role="list" style={{ transitionDelay: '.14s' }}>
            {ABOUT_CLINICS.map((c) => (
              <li key={c.id} className="rounded-[20px] bg-white p-5 ring-1 ring-ndm-ink/[.07]">
                <p className="font-aeonik text-[21px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{c.name} clinic</p>
                <p className="mt-1.5 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">{c.addr[0]}<br />{c.addr[1]}</p>
                <p className="mt-2 font-inter text-[15px] font-medium tabular-nums text-ndm-ink">{c.phone}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn href={tel(c.phone)} v="ink" sm className="btn-buy" aria-label={`Call the ${c.name} clinic at ${c.phone}`}>Call</Btn>
                  <Btn href={`sms:${tel(c.phone).replace('tel:', '')}`} v="line" sm aria-label={`Text the ${c.name} clinic at ${c.phone}`}>Text</Btn>
                </div>
              </li>
            ))}
          </ul>
          <p className="rv mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-inter text-[14.5px] text-ndm-ink" style={{ transitionDelay: '.16s' }}>
            <a href={`mailto:${ABOUT_EMAIL}`} className="inline-flex items-center gap-2 underline-offset-4 hover:text-ndm-deep hover:underline"><IconMail size={15} />{ABOUT_EMAIL}</a>
            <span className="text-ndm-muted">Mon to Fri 9am to 7pm · Sat 10am to 5pm</span>
          </p>
        </div>
        <div className="rv rounded-[22px] bg-white p-[clamp(20px,2.4vw,32px)] ring-1 ring-ndm-ink/[.07]" style={{ transitionDelay: '.12s' }}>
          {sent ? (
            <div role="status" className="flex min-h-[360px] flex-col items-start justify-center">
              <span className="grid size-11 place-items-center rounded-full bg-ndm-blue/10 text-ndm-blue"><IconCheckBadge /></span>
              <p className="mt-4 font-aeonik text-[26px] tracking-[-0.02em] text-ndm-ink">Thank you, your message is in.</p>
              <p className="mt-2 font-inter text-[14.5px] leading-[1.55] text-ndm-muted">Our team will get back to you during clinic hours.</p>
              <button onClick={() => setSent(false)} className="mt-5 font-inter text-[14px] text-ndm-deep underline-offset-4 hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} aria-label="Send us a message">
              <h3 className="font-aeonik text-[26px] font-normal leading-[1.15] tracking-[-0.02em] text-ndm-ink">Send us a message</h3>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <input required name="name" autoComplete="name" placeholder="Your name" aria-label="Your name" className={fieldCls} />
                <input type="tel" name="phone" autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone (optional)" className={fieldCls} />
                <span className="sm:col-span-2"><input required type="email" name="email" autoComplete="email" placeholder="Your email" aria-label="Your email" className={fieldCls} /></span>
                <span className="sm:col-span-2">
                  <BookSelect name="clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Which clinic?">
                    {BOOK_CLINICS.map(([n, ad]) => <option key={n} value={n} className="text-ndm-ink">{n}, {ad}</option>)}
                  </BookSelect>
                </span>
                <textarea required name="message" rows={4} placeholder="How can we help?" aria-label="How can we help?" className={`${fieldCls} h-auto resize-none py-3 sm:col-span-2`} />
              </div>
              <Btn v="ink" block className="btn-buy mt-4" type="submit">Send message</Btn>
              <p className="mt-3 font-inter text-[12px] leading-[1.5] text-ndm-muted">Please don’t include personal health details in this form. We’ll discuss those with you in person.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- gallery: filters, a bento grid with labels, and a viewer with thumbnails and swipe */
const IconExpand = () => <Svg size={16} vb="0 0 16 16"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></Svg>;

function Lightbox({ items, index, onClose, onStep, onPick }) {
  /* bare photo on the booking popup's scrim (book-pop classes from the shell), small thumbnails underneath;
     a click anywhere off the photo and thumbnails closes it */
  const closeBtn = useRef(null), strip = useRef(null), touch = useRef(null), timer = useRef(0);
  const [on, setOn] = useState(false);
  const close = useCallback(() => {
    setOn(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(onClose, REDUCED ? 0 : 420);
  }, [onClose]);
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setOn(true)); });
    const t = setTimeout(() => closeBtn.current && closeBtn.current.focus({ preventScroll: true }), 140);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onStep, close]);
  /* keep the current thumbnail centred (jump on open, glide after) */
  const placed = useRef(false);
  useEffect(() => {
    const el = strip.current, b = el && el.children[index];
    if (b) el.scrollTo({ left: b.offsetLeft - el.clientWidth / 2 + b.offsetWidth / 2, behavior: REDUCED || !placed.current ? 'auto' : 'smooth' });
    placed.current = true;
  }, [index]);
  const it = items[index];
  const start = (e) => { touch.current = e.touches[0].clientX; };
  const end = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
    if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
  };
  return ReactDOM.createPortal(
    <div className={`book-pop fixed inset-0 z-[95] ${on ? 'is-on' : ''}`}>
      <div className="book-scrim absolute inset-0 bg-[#0B0F13]/55 backdrop-blur-[6px]" onClick={close} />
      <div role="dialog" aria-modal="true" aria-label="Clinic gallery" data-lenis-prevent=""
        className="gal-view pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-[var(--gx)] py-6 md:gap-5">
        <button ref={closeBtn} type="button" onClick={close} className="sr-only">Close gallery</button>
        <p className="sr-only" aria-live="polite">Photo {index + 1} of {items.length}: {it.t}</p>
        <img key={it.src} src={it.src} alt={it.alt} onTouchStart={start} onTouchEnd={end}
          className="gal-img pointer-events-auto block h-auto max-h-[min(72dvh,760px)] w-auto max-w-full rounded-[14px] object-contain shadow-[0_40px_80px_-30px_rgba(11,15,19,.6)] md:max-w-[min(1100px,100%)] md:rounded-[18px]" />
        <div ref={strip} className="no-scrollbar pointer-events-auto relative flex max-w-full gap-2 overflow-x-auto p-1" role="group" aria-label="Choose a photo">
          {items.map((g, k) => (
            <button key={g.src} type="button" onClick={() => onPick(k)} aria-label={`Photo ${k + 1}: ${g.t}`} aria-current={k === index ? 'true' : undefined}
              className={`gal-thumb relative h-11 w-[60px] shrink-0 overflow-hidden rounded-[8px] md:h-14 md:w-20 ${k === index ? 'is-on' : ''}`}>
              <img src={g.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* gallery with awards & recognition (WorkNook "Trusted by creatives and leaders" layout):
   a mosaic of clinic photos in columns of different heights, the awards text under the middle columns */
function AboutGallery() {
  const ref = useRef(null), opener = useRef(null);
  useReveal(ref);
  const [idx, setIdx] = useState(null);
  const open = idx !== null;
  useOnScroll(() => {
    const el = ref.current; if (!el || REDUCED) return;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    const p = clamp01((vh - r.top) / (vh + r.height)) - 0.5;
    el.querySelectorAll('[data-drift]').forEach((c) => { c.style.transform = `translate3d(0,${(p * Number(c.dataset.drift) * -2).toFixed(1)}px,0)`; });
  }, []);
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);
  const close = useCallback(() => {
    setIdx(null);
    const b = opener.current;
    requestAnimationFrame(() => { if (b && b.isConnected) b.focus({ preventScroll: true }); });
  }, []);
  const step = useCallback((d) => setIdx((i) => (i + d + GAL_ALL.length) % GAL_ALL.length), []);
  return (
    <section ref={ref} id="gallery" aria-labelledby="awards-title" className="relative z-10 scroll-mt-[100px] overflow-hidden bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,120px)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-x-2.5 gap-y-8 md:grid-cols-8 md:gap-x-[clamp(10px,1.3vw,18px)] md:gap-y-0">
        {GAL_COLS.map(([place, top, drift, ...tiles], ci) => (
          <div key={ci} data-drift={drift} className={`gal-col flex-col gap-2.5 md:gap-[clamp(10px,1.3vw,18px)] ${place}`} style={{ paddingTop: `${top}%` }}>
            {tiles.map(([pi, ratio], ti) => {
              const g = GAL_ALL[pi];
              /* phones: the outer columns keep two photos so all four columns end level */
              const deskOnly = ti === 2 ? 'hidden md:block' : 'block';
              return (
                <button key={pi} type="button" onClick={(e) => { opener.current = e.currentTarget; setIdx(pi); }} aria-label={`View photo: ${g.t}`}
                  className={`rv rv-clip gal-tile group relative w-full overflow-hidden rounded-[14px] bg-ndm-line md:rounded-[18px] ${deskOnly}`}
                  style={{ aspectRatio: ratio, transitionDelay: `${(Math.abs(ci - 3.5) * 0.07).toFixed(2)}s` }}>
                  <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="gal-photo absolute inset-0 h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        ))}
        <div id="awards" className="col-span-4 col-start-1 row-start-2 scroll-mt-[120px] pt-2 text-center md:col-span-4 md:col-start-3 md:row-start-2 md:pt-[clamp(20px,2.4vw,36px)]">
          <Eyebrow className="rv">Awards &amp; recognition</Eyebrow>
          <div className="rv mt-6 flex flex-col items-center gap-2" style={{ transitionDelay: '.04s' }}>
            <Stars className="justify-center" />
            <p className="font-inter text-[14px] text-ndm-slate">Top Choice Award · 8 consecutive years</p>
          </div>
          {/* same words as the home page awards block */}
          <h2 id="awards-title" className="rv mx-auto mt-4 font-aeonik text-[clamp(28px,2.8vw,44px)] font-normal leading-[1.08] tracking-[-0.035em] text-ndm-ink [text-wrap:balance]" style={{ transitionDelay: '.08s' }}>
            Trusted brands &amp; awards for excellence<br className="hidden md:block" /> in aesthetic medicine.
          </h2>
          <p className="rv mx-auto mt-4 max-w-[60ch] font-inter text-[15px] leading-[1.6] text-ndm-muted [text-wrap:balance]" style={{ transitionDelay: '.12s' }}>
            Recognized as Toronto’s Top Choice Cosmetic &amp; Laser Clinic for eight consecutive years, a reflection of 16+ years of dedication to patient care, innovation and consistent, high-quality treatment.
          </p>
          <AwardsMotion className="mt-8" />
        </div>
      </div>
      {open && <Lightbox items={GAL_ALL} index={idx} onClose={close} onStep={step} onPick={setIdx} />}
    </section>
  );
}
