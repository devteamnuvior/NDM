/* ---------------------------------------------------------------- /procedures, the treatments hub (2026-11-18): the prototype copy of
   the Next.js page (web/src/components/procedures/). Data: PH, from src/procedures-data.json (a snapshot of the live WordPress
   procedures and concerns plus the hub's words in web/src/config/procedures-hub.ts). Links to pages this prototype does not have
   open the live site. */
const PH_NAV = [['treatments', 'Treatments'], ['concerns', 'By concern'], ['compare', 'Compare'], ['technology', 'Technology'], ['your-visit', 'Your visit'], ['clinics', 'Clinics'], ['faq', 'FAQ']];
const PH_PROOF = [
  ['Physician-led care', <path d="M4 2v3.5a3 3 0 006 0V2M7 8.5v1.8a3 3 0 006 0V9" />],
  ['Top Choice Award, 2019 to 2026', <path d="M5.6 9.1L4.5 14l3.5-1.8 3.5 1.8-1.1-4.9M8 2.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6z" />],
  ['Two Toronto clinics', <path d="M8 14.5s4.5-4.2 4.5-7.8A4.5 4.5 0 008 2.2a4.5 4.5 0 00-4.5 4.5c0 3.6 4.5 7.8 4.5 7.8z" />],
  ['Free VISIA® skin analysis', <path d="M8 1.5l1.4 4.1 4.1 1.4-4.1 1.4L8 12.5 6.6 8.4 2.5 7l4.1-1.4z" />],
];
const phNorm = (s) => s.normalize('NFKD').replace(/[̀-ͯ®™]/g, '').toLowerCase();
const phTel = (n) => `tel:+1${n.replace(/\D/g, '')}`;
const phExt = (href) => /^https?:/.test(href) ? { target: '_blank', rel: 'noopener' } : {};

function PhNav() {
  const [on, setOn] = useState(PH_NAV[0][0]);
  useOnScroll(() => {
    let cur = PH_NAV[0][0];
    PH_NAV.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 240) cur = id; });
    setOn(cur);
  }, []);
  const go = (id, e) => { e.preventDefault(); const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 170); };
  return <SubNav label="On this page" items={PH_NAV} on={on} onPick={go} />;
}

function PhCard({ c }) {
  return (
    <a href={c.href} {...phExt(c.href)} className="ph-card group flex h-full flex-row overflow-hidden rounded-[18px] bg-white ring-1 ring-ndm-ink/[.06] sm:flex-col sm:rounded-[22px]">
      <span className="relative block w-[104px] shrink-0 overflow-hidden bg-ndm-mist sm:aspect-[5/4] sm:w-auto">
        {c.img
          ? <img src={c.img} alt="" loading="lazy" decoding="async" className="ph-card-img absolute inset-0 h-full w-full object-cover" style={{ objectPosition: c.pos }} />
          : <span aria-hidden="true" className="ph-card-blank absolute inset-0" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col px-4 py-3.5 sm:px-5 sm:pb-5 sm:pt-5">
        <span className="font-aeonik text-[18px] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep sm:text-[21px]">{c.title}</span>
        <span className="mt-1.5 line-clamp-3 font-inter text-[13.5px] leading-[1.5] text-ndm-muted sm:mt-2 sm:line-clamp-none sm:text-[14px] sm:leading-[1.55]">{c.text}</span>
        {c.concerns.length > 0 && (
          <span className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
            {c.concerns.slice(0, 3).map((t) => <span key={t} className="rounded-full bg-ndm-paper px-2.5 py-1 font-inter text-[12px] text-ndm-ink/75 ring-1 ring-ndm-ink/[.06]">{t}</span>)}
          </span>
        )}
        <span className="mt-auto hidden items-center gap-2 pt-5 font-inter text-[14px] font-medium text-ndm-deep sm:flex">
          Learn about {c.title.replace(/\s*\(.*\)$/, '')}<IconArrow size={13} className="transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </a>
  );
}

function PhDirectory() {
  const ref = useRef(null);
  useReveal(ref);
  const [q, setQ] = useState('');
  const [area, setArea] = useState('all');
  const words = phNorm(q.trim()).split(/\s+/).filter(Boolean);
  const match = (c) => (area === 'all' || c.areas.includes(area)) && words.every((w) => phNorm(`${c.title} ${c.text} ${c.concerns.join(' ')}`).includes(w));
  const shown = PH.groups.map((g) => ({ ...g, cards: g.cards.filter(match) }));
  const total = shown.reduce((n, g) => n + g.cards.length, 0);
  const filtered = words.length > 0 || area !== 'all';
  return (
    <section ref={ref} id="treatments" aria-labelledby="hub-find" className="relative z-10 scroll-mt-[170px] px-[var(--gx)] pt-[clamp(56px,6vw,96px)]">
      <div className="rv rounded-[28px] bg-white p-[clamp(20px,2.6vw,36px)] ring-1 ring-ndm-ink/[.06]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
          <div className="min-w-0">
            <p className="font-mont text-[12px] uppercase tracking-[.16em] text-ndm-deep">Find your treatment</p>
            <TwoTone id="hub-find" className="mt-3" size="text-[clamp(28px,3vw,42px)]" lead={<>Search {PH.count} treatments,<br /></>} strong="or narrow by area" />
          </div>
          <div className="min-w-0">
            <label htmlFor="hub-q" className="sr-only">Search treatments by name or concern</label>
            <div className="flex items-center gap-3 rounded-full bg-ndm-paper px-5 ring-1 ring-ndm-ink/[.08] focus-within:ring-2 focus-within:ring-ndm-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-ndm-muted"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input id="hub-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “acne scars”, “lips” or “laser”" autoComplete="off"
                className="h-14 w-full min-w-0 bg-transparent font-inter text-[16px] text-ndm-ink outline-none placeholder:text-ndm-muted/80" />
            </div>
            <div role="group" aria-label="Filter by area" className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
              {[['all', 'All areas'], ...PH.areas].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={area === id} onClick={() => setArea(id)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-inter text-[14px] transition-colors ${area === id ? 'bg-ndm-deep text-white' : 'bg-ndm-paper text-ndm-ink/80 ring-1 ring-ndm-ink/[.08] hover:text-ndm-ink'}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        <nav aria-label="Treatment categories" className="mt-6 border-t border-ndm-ink/[.07] pt-5">
          <ul role="list" className="flex flex-wrap gap-x-5 gap-y-2.5">
            {PH.groups.map((g) => (
              <li key={g.id}><a href={`#${g.id}`} className="inline-flex items-center gap-2 font-inter text-[14.5px] text-ndm-ink/85 transition-colors hover:text-ndm-deep">{g.title}<span className="rounded-full bg-ndm-mist px-2 py-0.5 text-[12px] tabular-nums text-ndm-muted">{g.cards.length}</span></a></li>
            ))}
          </ul>
        </nav>
        <p aria-live="polite" className="sr-only">{filtered ? `${total} ${total === 1 ? 'treatment matches' : 'treatments match'}` : ''}</p>
      </div>
      {filtered && total === 0 && (
        <div className="mt-10 rounded-[22px] bg-ndm-mist px-6 py-8 text-center">
          <p className="font-inter text-[16px] text-ndm-ink">No treatment matches that search.</p>
          <p className="mt-2 font-inter text-[14.5px] text-ndm-muted">Try a concern such as “wrinkles” or “pigmentation”, or browse the concerns below. A free consultation can also help you choose.</p>
          <button type="button" onClick={() => { setQ(''); setArea('all'); }} className="btn btn-line btn-sm mt-5"><span>Show all treatments</span></button>
        </div>
      )}
      {shown.map((g) => (
        <div key={g.id} id={g.id} hidden={g.cards.length === 0} className="scroll-mt-[190px] pt-[clamp(40px,4.4vw,64px)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
            <h2 className="font-aeonik text-[clamp(26px,2.5vw,36px)] font-normal leading-[1.1] tracking-[-0.03em] text-ndm-ink">{g.title}<span className="ml-3 align-middle font-inter text-[14px] tabular-nums tracking-normal text-ndm-muted">{g.cards.length}</span></h2>
            <p className="max-w-[52ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">{g.intro}</p>
          </div>
          <ul role="list" className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {g.cards.map((c) => <li key={c.slug}><PhCard c={c} /></li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}

function PhCompare() {
  const [on, setOn] = useState(0);
  const tabs = useRef([]);
  const key = (e, i) => {
    const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + PH.compare.length) % PH.compare.length;
    setOn(n); tabs.current[n] && tabs.current[n].focus();
  };
  return (
    <div className="rv mt-8" style={{ transitionDelay: '.1s' }}>
      <div role="tablist" aria-label="Comparisons" className="no-scrollbar flex gap-1 overflow-x-auto">
        {PH.compare.map((c, i) => (
          <button key={c.id} ref={(el) => (tabs.current[i] = el)} type="button" role="tab" id={`cmp-t-${c.id}`} aria-selected={on === i} aria-controls={`cmp-${c.id}`} tabIndex={on === i ? 0 : -1}
            onClick={() => setOn(i)} onKeyDown={(e) => key(e, i)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 font-inter text-[14px] transition-colors ${on === i ? 'bg-ndm-ink text-white' : 'bg-white text-ndm-ink/80 ring-1 ring-ndm-ink/[.08] hover:text-ndm-ink'}`}>{c.title}</button>
        ))}
      </div>
      {PH.compare.map((c, i) => (
        <div key={c.id} id={`cmp-${c.id}`} role="tabpanel" aria-labelledby={`cmp-t-${c.id}`} hidden={on !== i} className="mt-5">
          <p className="font-inter text-[15px] text-ndm-muted">{c.question}</p>
          <div className="no-scrollbar mt-4 overflow-x-auto rounded-[22px] bg-white ring-1 ring-ndm-ink/[.06]">
            <table className="w-full min-w-[720px] table-fixed border-collapse font-inter text-[14.5px]">
              <caption className="sr-only">{`${c.title}: ${c.cols.map((x) => x.title).join(', ')}`}</caption>
              <thead><tr><td className="w-[160px]" />
                {c.cols.map((col) => (
                  <th key={col.href} scope="col" className="px-5 pb-4 pt-6 text-left align-bottom font-aeonik text-[19px] font-normal tracking-[-0.01em] text-ndm-ink">
                    <a href={col.href} {...phExt(col.href)} className="group inline-flex items-center gap-1.5 hover:text-ndm-deep">{col.title}<IconArrow size={12} className="opacity-60 transition-transform group-hover:translate-x-0.5" /></a>
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {c.rows.map(([label, vals]) => (
                  <tr key={label} className="border-t border-ndm-ink/[.07]">
                    <th scope="row" className="px-5 py-4 text-left align-top text-[13px] font-semibold text-ndm-muted">{label}</th>
                    {vals.map((v, k) => <td key={k} className="px-5 py-4 align-top leading-[1.55] text-ndm-ink">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="mt-4 max-w-[80ch] font-inter text-[13px] leading-[1.55] text-ndm-muted">General information, not medical advice. Sessions, recovery and results vary from person to person; which option suits you is decided with a qualified provider at your consultation.</p>
    </div>
  );
}

/* one section of the page that reveals its .rv elements on scroll */
function PhSection({ id, label, className = '', children }) {
  const ref = useRef(null);
  useReveal(ref);
  return <section ref={ref} id={id} aria-labelledby={label} className={`scroll-mt-[170px] px-[var(--gx)] pt-[clamp(80px,8vw,128px)] ${className}`}>{children}</section>;
}

function ProceduresPage() {
  const [up, down] = PH.clinics;
  return (
    <div data-page="procedures" className="ph">
      {/* hero */}
      <section aria-labelledby="ph-title" className="relative px-[var(--gx)] pt-[clamp(24px,3vw,44px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(40px,5vw,88px)]">
          <div>
            <Eyebrow>Treatments</Eyebrow>
            <TwoTone as="h1" id="ph-title" className="mt-5 max-w-[15ch]" size="text-[clamp(40px,5vw,72px)]" lead={<>Cosmetic &amp; laser treatments<br /></>} strong="in Toronto" />
            <p className="mt-6 max-w-[54ch] font-inter text-[clamp(16px,1.15vw,18px)] leading-[1.6] text-ndm-ink/80">
              {PH.count} non-surgical treatments for the face, skin, body, hair and veins, at our Uptown clinic in North York and our Downtown clinic on Bay Street. Every plan starts with a free consultation, where a member of our medical team assesses your skin and goals and explains which options may suit you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
              <Btn href="#treatments" v="line" onClick={(e) => { e.preventDefault(); const el = document.getElementById('treatments'); el && scrollToY(el.getBoundingClientRect().top + window.scrollY - 170); }}>Explore treatments</Btn>
            </div>
            <ul role="list" className="mt-9 grid max-w-[560px] grid-cols-2 gap-x-5 gap-y-3 font-inter text-[14px] text-ndm-ink/85">
              {PH_PROOF.map(([label, d]) => (
                <li key={label} className="flex items-center gap-2.5">
                  <svg viewBox="0 0 16 16" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ndm-deep">{d}</svg>{label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-[28px] bg-ndm-mist lg:aspect-[4/4.2]">
              <img src="assets/hero/clinic-reception.jpg" alt="The reception of the NewDermaMed clinic in Toronto" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="ph-glass absolute bottom-4 left-4 right-4 grid grid-cols-3 rounded-[20px] px-2 py-4 sm:left-6 sm:right-auto sm:w-[min(420px,calc(100%-48px))] lg:-left-10">
              {[[String(PH.count), 'Treatments'], [String(PH.concernCount), 'Concerns'], ['2', 'Toronto clinics']].map(([n, l]) => (
                <p key={l} className="flex flex-col items-center border-r border-ndm-ink/10 text-center last:border-r-0">
                  <span className="font-aeonik text-[clamp(26px,2.4vw,34px)] leading-none tracking-[-0.03em] text-ndm-ink tabular-nums">{n}</span>
                  <span className="mt-1.5 font-inter text-[12px] text-ndm-muted">{l}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-[clamp(40px,5vw,72px)]" />
      <PhNav />
      <PhDirectory />

      {/* by concern */}
      <PhSection id="concerns" label="ph-concerns">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-[clamp(40px,6vw,110px)]">
          <div>
            <Eyebrow className="rv">Start from a concern</Eyebrow>
            <TwoTone id="ph-concerns" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={<>Not sure of the treatment?<br /></>} strong="Start with what you see" style={{ transitionDelay: '.06s' }} />
            <p className="rv mt-5 max-w-[42ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.1s' }}>Each concern page explains common causes, how it is assessed and the treatments that may help, side by side.</p>
            <a href="https://newdermamedlaserclinic.com/concerns" target="_blank" rel="noopener" className="rv group mt-6 inline-flex items-center gap-2 font-inter text-[15px] font-medium text-ndm-deep" style={{ transitionDelay: '.14s' }}>See all concerns<IconArrow size={13} className="transition-transform group-hover:translate-x-1" /></a>
          </div>
          <div className="rv grid gap-x-8 gap-y-8 sm:grid-cols-2" style={{ transitionDelay: '.1s' }}>
            {PH.concerns.map((g) => (
              <div key={g.title}>
                <h3 className="font-mont text-[12px] uppercase tracking-[.16em] text-ndm-muted">{g.title}</h3>
                <ul role="list" className="mt-3 border-t border-ndm-ink/10">
                  {g.items.map((c) => (
                    <li key={c.href} className="border-b border-ndm-ink/10">
                      <a href={c.href} {...phExt(c.href)} className="group flex items-center justify-between gap-4 py-3.5 font-inter text-[16px] text-ndm-ink transition-colors hover:text-ndm-deep">{c.title}<IconArrow size={12} className="shrink-0 text-ndm-ink/35 transition-all group-hover:translate-x-1 group-hover:text-ndm-deep" /></a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </PhSection>

      {/* compare */}
      <PhSection id="compare" label="ph-compare">
        <Eyebrow className="rv">Compare</Eyebrow>
        <TwoTone id="ph-compare" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={<>Similar goals,<br /></>} strong="different approaches" style={{ transitionDelay: '.06s' }} />
        <PhCompare />
      </PhSection>

      {/* technology */}
      <PhSection id="technology" label="ph-tech">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="rv">Technology</Eyebrow>
            <TwoTone id="ph-tech" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={<>The tools behind<br /></>} strong="your treatment" style={{ transitionDelay: '.06s' }} />
          </div>
          <p className="rv max-w-[400px] font-inter text-[15px] leading-[1.6] text-ndm-muted md:mb-2" style={{ transitionDelay: '.1s' }}>A device is only as good as the plan around it. Your provider chooses the technology and settings for your skin type and goals.</p>
        </div>
        <ul role="list" className="rv mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ transitionDelay: '.12s' }}>
          {PH.tech.map((t) => (
            <li key={t.name} className="flex flex-col rounded-[22px] bg-white p-6 ring-1 ring-ndm-ink/[.06]">
              <h3 className="font-aeonik text-[20px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{t.name}</h3>
              <p className="mt-2.5 font-inter text-[14px] leading-[1.55] text-ndm-muted">{t.what}</p>
              {t.links.length > 0 && (
                <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 font-inter text-[13.5px]">
                  {t.links.map((l) => <a key={l.href} href={l.href} {...phExt(l.href)} className="text-ndm-deep underline-offset-4 hover:underline">{l.title}</a>)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </PhSection>

      {/* your visit */}
      <PhSection id="your-visit" label="ph-visit">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-[clamp(40px,6vw,96px)]">
          <div className="lg:sticky lg:top-[190px] lg:self-start">
            <Eyebrow className="rv">Your visit</Eyebrow>
            <TwoTone id="ph-visit" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={<>What to expect<br /></>} strong="at NewDermaMed" style={{ transitionDelay: '.06s' }} />
            <div className="rv relative mt-7 aspect-[4/3] overflow-hidden rounded-[24px] bg-ndm-mist" style={{ transitionDelay: '.1s' }}>
              <img src="assets/home/visia-consult.jpg" alt="A VISIA skin analysis consultation at NewDermaMed" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <ol className="rv grid gap-3" style={{ transitionDelay: '.1s' }}>
            {PH.steps.map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[44px_1fr] gap-4 rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] md:p-6">
                <span className="grid size-11 place-items-center rounded-full bg-ndm-paper font-aeonik text-[18px] tabular-nums text-ndm-deep ring-1 ring-ndm-ink/[.08]">{i + 1}</span>
                <span><span className="block font-aeonik text-[21px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{title}</span><span className="mt-1.5 block font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{text}</span></span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rv mt-[clamp(40px,4vw,64px)] grid gap-3 md:grid-cols-3" style={{ transitionDelay: '.1s' }}>
          {[['Real results', 'Before and after photos of treatments at our clinics. Individual results may vary.', 'before-after.html', 'See before & after'],
            ['Our medical team', 'Meet the physicians and practitioners who assess and treat you.', 'about.html#team', 'Meet the team'],
            ['Clear prices', 'Current treatment prices and packages, before you book.', 'pricing.html', 'See all prices']].map(([title, text, href, cta]) => (
            <a key={href} href={href} className="ph-trust group flex flex-col rounded-[22px] p-6">
              <span className="font-aeonik text-[22px] tracking-[-0.02em] text-ndm-ink">{title}</span>
              <span className="mt-2 font-inter text-[14.5px] leading-[1.55] text-ndm-muted">{text}</span>
              <span className="mt-5 inline-flex items-center gap-2 font-inter text-[14px] font-medium text-ndm-deep">{cta}<IconArrow size={13} className="transition-transform group-hover:translate-x-1" /></span>
            </a>
          ))}
        </div>
      </PhSection>

      {/* clinics */}
      <PhSection id="clinics" label="ph-clinics">
        <Eyebrow className="rv">Our clinics</Eyebrow>
        <TwoTone id="ph-clinics" className="rv mt-5" size="text-[clamp(32px,3.4vw,50px)]" lead={<>Two clinics,<br /></>} strong="North York and Downtown Toronto" style={{ transitionDelay: '.06s' }} />
        <div className="rv mt-8 grid gap-4 md:grid-cols-2" style={{ transitionDelay: '.1s' }}>
          {[up, down].map((c) => (
            <article key={c.id} className="flex flex-col rounded-[24px] bg-white p-[clamp(22px,2.4vw,32px)] ring-1 ring-ndm-ink/[.06]">
              <p className="font-mont text-[12px] uppercase tracking-[.16em] text-ndm-deep">{c.near}</p>
              <h3 className="mt-2 font-aeonik text-[clamp(26px,2.4vw,34px)] leading-[1.1] tracking-[-0.03em] text-ndm-ink">NewDermaMed {c.name}</h3>
              <address className="mt-4 font-inter text-[15.5px] not-italic leading-[1.6] text-ndm-ink/85">{c.address}</address>
              <p className="mt-1 font-inter text-[14.5px] text-ndm-muted">{c.note}</p>
              <dl className="mt-5 grid gap-1.5 border-t border-ndm-ink/10 pt-4 font-inter text-[14px]">
                {PH.hours.map(([d, h]) => <div key={d} className="flex justify-between gap-4"><dt className="text-ndm-muted">{d}</dt><dd className="text-ndm-ink">{h}</dd></div>)}
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <Btn href={phTel(c.phone)} v="ink" sm>{`Call ${c.phone}`}</Btn>
                <Btn href={c.map} v="line" sm target="_blank" rel="noopener">Directions</Btn>
              </div>
            </article>
          ))}
        </div>
        <p className="rv mt-4 font-inter text-[13.5px] text-ndm-muted" style={{ transitionDelay: '.12s' }}>Parking and getting there: <a href="about.html#clinics" className="text-ndm-deep underline-offset-4 hover:underline">see our clinics</a>.</p>
      </PhSection>

      <div id="faq" className="scroll-mt-[150px] pt-[clamp(40px,4vw,64px)]">
        <Faq items={PH.faqs} lead={<>Choosing a treatment,<br /></>} strong="answered plainly" intro="What people ask us most before their first consultation." />
      </div>

      {/* closing consultation card */}
      <section aria-labelledby="ph-book" className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)]">
        <div className="ph-book relative overflow-hidden rounded-[30px] px-[clamp(24px,4vw,64px)] py-[clamp(40px,5vw,72px)] text-white">
          <img src="assets/hero/clinic-exterior.jpg" alt="" loading="lazy" className="ph-book-img absolute inset-y-0 right-0 hidden h-full w-[52%] object-cover lg:block" />
          <div className="relative max-w-[640px]">
            <Eyebrow dark>Free consultation</Eyebrow>
            <TwoTone id="ph-book" dark className="mt-5" size="text-[clamp(32px,3.6vw,52px)]" lead={<>Not sure where to start?<br /></>} strong="Let us help you choose" />
            <p className="mt-5 max-w-[50ch] font-inter text-[16px] leading-[1.6] text-white/80">Book a free, no-obligation consultation with a VISIA® skin analysis. You leave with a clear plan, the costs and the time it may take, then decide in your own time.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
              <Btn href={phTel(up.phone)} v="glass">Call Uptown</Btn>
              <Btn href={phTel(down.phone)} v="glass">Call Downtown</Btn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
