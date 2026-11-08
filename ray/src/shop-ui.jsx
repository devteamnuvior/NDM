/* ---------------------------------------------------------------- skincare shop, built from shop.newdermamedlaserclinic.com (src/live/shop.json,
   src/live/shop-home.json): the shop page (every section of the live shop home, its text verbatim, plus the full catalogue with
   filters) and one page per product. Products go into the site's cart like treatment options do. */
const SHOP_CSS = `
.sh-chip{display:inline-flex;align-items:center;border-radius:999px;padding:6px 12px;font:500 12.5px/1.2 Manrope,sans-serif;background:rgba(32,158,217,.1);color:#0F80C3}
.sh-chip.is-ink{background:rgba(27,36,43,.06);color:#1B242B}
.sh-card{box-shadow:0 0 0 1px rgba(27,36,43,.06),0 24px 50px -42px rgba(27,36,43,.4)}
.sh-pic{background:radial-gradient(80% 80% at 50% 40%,#fff,#F2F2EF)}
.sh-pic img{mix-blend-mode:multiply}
.sh-sale{background:#C0182C;color:#fff}
.sh-marq{display:flex;gap:12px;width:max-content;animation:sh-marq 48s linear infinite}
.sh-marq:hover{animation-play-state:paused}
@keyframes sh-marq{to{transform:translate3d(-50%,0,0)}}
@media (prefers-reduced-motion:reduce){.sh-marq{animation:none;width:auto;flex-wrap:wrap}}
.sh-quote{font-family:Fraunces,Georgia,serif;font-style:italic}
.sh-tab[aria-selected="true"]{background:#fff;color:#0F80C3;box-shadow:0 6px 16px -10px rgba(27,36,43,.45)}
.sh-filter summary{list-style:none;cursor:pointer}
.sh-filter summary::-webkit-details-marker{display:none}
.sh-tier.is-top{background:#0F80C3;color:#fff}
.sh-tier.is-top .sh-chip{background:rgba(255,255,255,.18);color:#fff}
.sh-ing{aspect-ratio:1/1}
`;
const shopMoney = (n) => money(n);
function Html({ html, className = '' }) { return <div className={`live-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />; }
const SHOP_BY_NAME = Object.fromEntries(SHOP.products.map((p) => [p.name.toLowerCase(), p]));
const shopLink = (href) => {
  if (!href) return '#';
  const m = /(?:^|\/)product\/([^/#?]+)/.exec(href);   // '/product/x', 'product/x' or 'https://shop…/product/x/'
  if (m) { const p = SHOP.products.find((x) => x.slug === m[1]); if (p) return 'shop-' + p.slug + '.html'; }
  if (/\/brand\//.test(href)) return 'shop.html#catalog';
  if (/\/product-category\/|\/product-tag\//.test(href)) return 'shop.html#catalog';
  if (/^#Article-/.test(href)) return '#guides';   // the live page's guide cards point at anchors that have no page yet
  const t = /newdermamedlaserclinic\.com\/(?!$)([^#?]+)/.exec(href.replace('https://shop.', 'https://x.'));
  if (t && !/^shop\./.test(href.replace('https://', ''))) { const k = t[1].replace(/\/$/, ''); if (LIVE_LINKS[k]) return LIVE_LINKS[k]; if (/fees-financing/.test(k)) return 'pricing.html#prices'; }
  if (/\/shop\/?$/.test(href) || href === '/shop') return 'shop.html#catalog';
  if (href === '#zo-price-section') return '#routine';
  if (href === '#zo-best-seller-section') return '#bestsellers';
  if (href === '#Editorial') return '#editorial';
  if (/newdermamedlaserclinic\.com\/?$/.test(href)) return 'index.html';
  return href;
};
const strip = (s) => s.replace(/\s*→\s*$/, '');

/* one card's text blocks in the site's type: labels, headings, paragraphs, chips and links */
function Blocks({ b, chips = true, linkAs = 'link', className = '' }) {
  const out = [];
  let chipRun = [];
  const flush = () => { if (chipRun.length) { out.push(<ul key={'c' + out.length} className="mt-3 flex flex-wrap gap-1.5" role="list">{chipRun.map((t, i) => <li key={i} className="sh-chip">{t}</li>)}</ul>); chipRun = []; } };
  const cta = (tag, text, href) => href && (tag === 'a' || tag === 'button' || /^(Shop|Learn|Read|View|Buy|Book|See|Start|Explore)\b|→\s*$/.test(text));
  b.forEach(([tag, text, href], i) => {
    const code = /^<a href="([^"]+)"[^>]*>([^<]*)<\/a>$/.exec(text);   // two buttons the live page shows as a line of code: shown as the buttons they were meant to be
    if (code) { tag = 'a'; href = code[1]; text = code[2]; }
    if (tag === 'li' && href) { flush(); out.push(<a key={i} href={shopLink(href)} className="mt-2 flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep hover:underline">{strip(text)}<IconArrow size={12} /></a>); return; }
    if (tag === 'li') { if (chips) chipRun.push(text); else out.push(<p key={i} className="mt-2 font-inter text-[14.5px] text-ndm-ink/85">{text}</p>); return; }
    flush();
    if (cta(tag, text, href) && tag !== 'a' && tag !== 'button') { out.push(linkAs === 'button' ? <Btn key={i} href={shopLink(href)} v="line" sm className="mt-3 mr-2">{strip(text)}</Btn> : <a key={i} href={shopLink(href)} className="mt-3 mr-4 inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep hover:underline">{strip(text)}<IconArrow size={12} /></a>); return; }
    if (tag === 'h2' || tag === 'h3' || tag === 'h4') out.push(<h3 key={i} className="mt-2 font-aeonik text-[clamp(20px,1.7vw,24px)] leading-[1.2] tracking-[-0.015em] text-ndm-ink">{href ? <a href={shopLink(href)} className="hover:text-ndm-deep">{text}</a> : text}</h3>);
    else if (tag === 'p' || tag === 'blockquote') out.push(<p key={i} className={`mt-2 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/80 ${tag === 'blockquote' ? 'sh-quote text-[clamp(18px,1.6vw,22px)] text-ndm-ink' : ''}`}>{text}</p>);
    else if (tag === 'strong') out.push(<p key={i} className="mt-1 font-inter text-[15px] font-semibold text-ndm-ink">{text}</p>);
    else if (tag === 'a' || tag === 'button') out.push(linkAs === 'button' ? <Btn key={i} href={shopLink(href)} v="line" sm className="mt-3 mr-2">{strip(text)}</Btn> : <a key={i} href={shopLink(href)} className="mt-3 mr-4 inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep hover:underline">{strip(text)}<IconArrow size={12} /></a>);
    else out.push(<p key={i} className="font-inter text-[12.5px] font-medium uppercase tracking-[.14em] text-ndm-muted">{text}</p>);
  });
  flush();
  return <div className={className}>{out}</div>;
}

/* a section heading from the live page's title block: the small line, the two-line title, the lead */
function ShopHead({ head, dark, align = 'center', id }) {
  const eyebrow = (head.find((b) => b[0] === 'span') || [])[1];
  const t1 = (head.find((b) => b[0] === 'strong') || [])[1] || (head.find((b) => b[0] === 'h2') || [])[1] || '';
  const t2 = (head.find((b) => b[0] === 'small') || [])[1] || '';
  const spans = head.filter((b) => b[0] === 'span').slice(1);
  const rest = [...spans.map((b) => ['sub', b[1]]), ...head.filter((b) => !['span', 'strong', 'small'].includes(b[0]) && b[1] !== t1)];
  return (
    <div className={`mx-auto max-w-[760px] ${align === 'center' ? 'text-center' : ''}`}>
      {eyebrow && <Eyebrow dark={dark} className={`rv ${align === 'center' ? '' : ''}`}>{eyebrow}</Eyebrow>}
      <TwoTone id={id} dark={dark} className={`rv mt-5 ${align === 'center' ? 'mx-auto' : ''}`} size="text-[clamp(30px,3.2vw,46px)]" lead={<>{t1}<br /></>} strong={t2} style={{ transitionDelay: '.06s' }} />
      {rest.map(([tag, text, href], i) => tag === 'a'
        ? <div key={i} className="rv mt-5"><Btn href={shopLink(href)} v="line" sm>{strip(text)}</Btn></div>
        : <p key={i} className={`rv mx-auto mt-4 max-w-[60ch] font-inter leading-[1.65] ${tag === 'blockquote' ? 'sh-quote text-[clamp(19px,1.7vw,24px)] text-ndm-ink' : tag === 'sub' ? 'text-[17px] font-medium text-ndm-ink' : 'text-[15.5px]'} ${dark ? (tag === 'sub' ? 'text-white' : 'text-white/80') : (tag === 'sub' ? '' : 'text-ndm-muted')}`} style={{ transitionDelay: '.1s' }}>{text}</p>)}
    </div>
  );
}

/* ---------------------------------------------------------------- product card (catalogue, bestsellers, related) */
function ProductCard({ p, i = 0 }) {
  const line = { key: `shop|${p.slug}`, cat: 'Skincare', name: p.name, label: (p.attributes.Size || [''])[0] || 'Product', price: p.price, was: p.on_sale ? p.regular : 0, unit: '' };
  const href = 'shop-' + p.slug + '.html';
  return (
    <li className="rv flex flex-col rounded-[20px] bg-white p-3 sh-card" style={{ transitionDelay: `${0.04 * (i % 8)}s` }}>
      <a href={href} className="sh-pic relative block aspect-[1/1] overflow-hidden rounded-[14px]">
        {p.images[0] && <img src={p.images[0][2] || p.images[0][0]} alt={p.images[0][1] || p.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-5" />}
        {p.on_sale && <span className="sh-sale absolute left-3 top-3 rounded-full px-2.5 py-1 font-inter text-[11.5px] font-semibold">Sale {Math.round((1 - p.price / p.regular) * 100)}%</span>}
      </a>
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3">
        <span className="font-inter text-[11.5px] font-medium uppercase tracking-[.14em] text-ndm-muted">{p.brands[0] || p.categories[0] || ''}</span>
        <a href={href} className="mt-1 font-aeonik text-[19px] leading-[1.2] tracking-[-0.01em] text-ndm-ink hover:text-ndm-deep">{p.name}</a>
        {p.short && <p className="mt-1 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">{p.short}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <span className="flex items-baseline gap-2">
            {p.on_sale && <s className="font-inter text-[13px] text-ndm-muted">{shopMoney(p.regular)}</s>}
            <span className={`font-aeonik text-[20px] leading-none tracking-[-0.02em] ${p.on_sale ? 'text-ndm-deep' : 'text-ndm-ink'}`}>{shopMoney(p.price)}</span>
          </span>
          <QtyControl line={line} label={p.name} />
        </div>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- the full catalogue: brand, type and availability filters, sorting */
function ShopCatalog({ sec }) {
  const ref = useRef(null);
  useReveal(ref);
  const [brand, setBrand] = useState('');
  const [cat, setCat] = useState('');
  const [avail, setAvail] = useState('');
  const [sort, setSort] = useState('default');
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(24);
  const brands = [...new Set(SHOP.products.flatMap((p) => p.brands))].sort();
  const cats = SHOP.categories.filter((c) => c.name !== 'Uncategorized');
  let list = SHOP.products.filter((p) => (!brand || p.brands.includes(brand)) && (!cat || p.categories.includes(cat)) && (!q || (p.name + ' ' + p.short + ' ' + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase())));
  if (avail === 'sale') list = list.filter((p) => p.on_sale);
  if (avail === 'stock') list = list.filter((p) => p.in_stock);
  if (avail === 'new') list = [...list].sort((a, b) => b.id - a.id).slice(0, 12);
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const pill = (on) => `rounded-full px-3.5 py-2 font-inter text-[13.5px] transition-colors ${on ? 'bg-ndm-deep text-white' : 'bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep'}`;
  const clear = () => { setBrand(''); setCat(''); setAvail(''); setQ(''); setSort('default'); setShown(24); };
  return (
    <section ref={ref} id="catalog" aria-labelledby="catalog-title" className="relative z-10 scroll-mt-[120px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <ShopHead head={sec.head} id="catalog-title" />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]`}>
        <aside className="rv lg:sticky lg:top-[130px] lg:self-start">
          <div className="rounded-[20px] bg-white p-5 sh-card">
            <div className="flex items-center justify-between"><span className="font-aeonik text-[20px] text-ndm-ink">Filters</span><button type="button" onClick={clear} className="font-inter text-[13px] font-semibold text-ndm-deep hover:underline">Clear All</button></div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className={`${fieldCls} mt-4 !h-11`} />
            <p className="mt-5 font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Brand</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{brands.map((b) => <button key={b} type="button" onClick={() => setBrand(brand === b ? '' : b)} className={pill(brand === b)}>{b} <span className="opacity-60">{SHOP.products.filter((p) => p.brands.includes(b)).length}</span></button>)}</div>
            <p className="mt-5 font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Product Type</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{cats.map((c) => <button key={c.id} type="button" onClick={() => setCat(cat === c.name ? '' : c.name)} className={pill(cat === c.name)}>{c.name} <span className="opacity-60">{c.count}</span></button>)}</div>
            <p className="mt-5 font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Availability</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{[['stock', 'In Stock'], ['sale', 'On Sale'], ['new', 'New Arrivals']].map(([k, t]) => <button key={k} type="button" onClick={() => setAvail(avail === k ? '' : k)} className={pill(avail === k)}>{t}</button>)}</div>
          </div>
        </aside>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-inter text-[14px] text-ndm-muted"><span className="font-semibold text-ndm-ink">{list.length}</span> {list.length === 1 ? 'product' : 'products'}</p>
            <label className="flex items-center gap-2 font-inter text-[13.5px] text-ndm-muted">Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-[10px] border border-ndm-ink/15 bg-white px-3 text-ndm-ink">
                <option value="default">Default</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name</option>
              </select>
            </label>
          </div>
          {list.length ? <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="list">{list.slice(0, shown).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</ul>
            : <p className="mt-8 rounded-[18px] bg-white p-8 text-center font-inter text-[15px] text-ndm-muted">No products match these filters.</p>}
          {list.length > shown && <div className="mt-6 flex justify-center"><Btn as="button" type="button" v="line" onClick={() => setShown(shown + 24)}>Show more ({list.length - shown} more)</Btn></div>}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the shop page sections, each in the site's look, text from the live shop home */
function ShopHero({ sec }) {
  const ref = useRef(null);
  useReveal(ref);
  const g = (tag) => (sec.tail.find((b) => b[0] === tag) || [])[1] || '';
  const btns = sec.tail.filter((b) => b[0] === 'li');
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="shop-title" className="relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20"><img src="assets/space/space-2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg,rgba(11,15,19,.82) 0%,rgba(11,15,19,.55) 55%,rgba(11,15,19,.3) 100%)' }} />
      <div className="px-[var(--gx)] pb-[clamp(48px,6vw,96px)] pt-[184px] sm:pt-[170px] lg:min-h-[min(80svh,720px)] lg:flex lg:flex-col lg:justify-center">
        <p className="rv font-inter text-[12.5px] font-medium uppercase tracking-[.24em] text-ndm-sky">{g('h1')}</p>
        <h1 id="shop-title" className="rv mt-4 max-w-[14ch] font-aeonik text-[clamp(38px,5vw,76px)] font-normal leading-[1.06] tracking-[-0.035em]">{g('h2')}</h1>
        <p className="rv mt-5 max-w-[54ch] font-inter text-[clamp(16px,1.25vw,18px)] leading-[1.6] text-white/85">{g('p')}</p>
        <div className="rv mt-7 flex flex-wrap gap-3">{btns.map(([, t], i) => <Btn key={t} href={i ? '#bestsellers' : '#routine'} v={i ? 'glass' : 'light'}>{t}</Btn>)}</div>
      </div>
    </section>
  );
}
function ShopPerks({ sec }) {
  return (
    <section aria-label="Shop perks" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-8">
      <ul className={`${TX_WRAP} grid gap-3 sm:grid-cols-2 lg:grid-cols-4`} role="list">
        {sec.items.map((it, i) => (
          <li key={i} className="flex items-center gap-3.5 rounded-[18px] bg-white px-4 py-3.5 sh-card">
            {it.imgs[0] && <img src={it.imgs[0][0]} alt="" className="size-10 shrink-0 object-contain" loading="lazy" />}
            <span><span className="block font-inter text-[14.5px] font-semibold text-ndm-ink">{(it.blocks.find((b) => b[0] === 'strong') || [])[1]}</span><span className="block font-inter text-[13px] text-ndm-muted">{(it.blocks.find((b) => b[0] === 'span') || [])[1]}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
function ShopGlimpse({ sec }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} aria-labelledby="glimpse-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,88px)]">
      <ShopHead head={sec.head} id="glimpse-title" />
      <ul className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid grid-cols-2 gap-3 md:grid-cols-4`} role="list">
        {sec.imgs.map(([src, alt], i) => <li key={i} className={`rv peach relative overflow-hidden rounded-[18px] bg-ndm-mist ${i === 0 ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-[4/3]'}`} style={{ transitionDelay: `${0.05 * i}s` }}><img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></li>)}
      </ul>
    </section>
  );
}
function ShopCards({ sec, id, cols = 'md:grid-cols-3', dark, linkAs = 'link', pic = 'cover', chips = true, tail = true, wrap = TX_WRAP }) {
  const ref = useRef(null);
  useReveal(ref);
  const isIcon = (src) => /\/icons\/|\.svg$|cart\.png|star\.png|stars\.svg|buy\.svg|arrow/.test(src);
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-title`} className={`relative z-10 scroll-mt-[120px] px-[var(--gx)] py-[clamp(56px,6vw,96px)] ${dark ? 'bg-ndm-night text-white' : 'bg-ndm-paper'}`} data-nav={dark ? 'dark' : undefined}>
      <ShopHead head={sec.head} id={`${id}-title`} dark={dark} />
      <ul className={`${wrap} mt-[clamp(28px,3.4vw,44px)] grid gap-3 ${cols}`} role="list">
        {sec.items.map((it, i) => {
          const photo = it.imgs.find(([s]) => !isIcon(s));
          const icon = it.imgs.find(([s]) => isIcon(s) && !/cart|star|buy|arrow/.test(s));
          return (
            <li key={i} className="rv flex flex-col rounded-[22px] bg-white p-5 sh-card md:p-6" style={{ transitionDelay: `${0.05 * i}s` }}>
              {photo && <div className={`sh-pic relative mb-4 overflow-hidden rounded-[14px] ${pic === 'cover' ? 'aspect-[4/3]' : 'aspect-[1/1]'}`}><img src={photo[0]} alt={photo[1]} loading="lazy" className={`absolute inset-0 h-full w-full ${pic === 'cover' ? 'object-cover' : 'object-contain p-4'}`} /></div>}
              {!photo && icon && <img src={icon[0]} alt="" className="mb-3 size-12 object-contain" loading="lazy" />}
              <Blocks b={it.blocks} chips={chips} linkAs={linkAs} />
            </li>
          );
        })}
      </ul>
      {tail && sec.tail.length > 0 && <div className={`${wrap} mt-6`}><Blocks b={sec.tail} linkAs="button" className="font-inter text-[13.5px] text-ndm-muted" /></div>}
    </section>
  );
}
function ShopProducts({ sec, id, names }) {
  const ref = useRef(null);
  useReveal(ref);
  const list = names.map((n) => SHOP_BY_NAME[n.toLowerCase()]).filter(Boolean);
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-title`} className="relative z-10 scroll-mt-[120px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <ShopHead head={sec.head} id={`${id}-title`} />
      <ul className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-4`} role="list">{list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</ul>
    </section>
  );
}
function ShopText({ sec, id, dark, align = 'left', side = 'right' }) {
  const ref = useRef(null);
  useReveal(ref);
  const photos = sec.imgs.filter(([s]) => !/\.svg$/.test(s));
  const icons = sec.imgs.filter(([s]) => /\.svg$/.test(s));
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-title`} className={`relative z-10 scroll-mt-[120px] px-[var(--gx)] py-[clamp(56px,6vw,96px)] ${dark ? 'bg-ndm-night text-white' : 'bg-ndm-mist'}`} data-nav={dark ? 'dark' : undefined}>
      <div className={`${TX_WRAP} grid items-center gap-8 lg:grid-cols-2 lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className={side === 'left' ? 'lg:order-2' : ''}>
          <ShopHead head={sec.head} id={`${id}-title`} dark={dark} align="left" />
          {icons.length > 0 && <ul className="mt-5 flex flex-wrap gap-3" role="list">{icons.slice(0, 4).map(([s, a], i) => <li key={i}><img src={s} alt={a} className="size-10 object-contain" loading="lazy" /></li>)}</ul>}
          <Blocks b={sec.tail} linkAs="button" className="mt-4" />
        </div>
        <div className={`grid gap-3 ${photos.length > 1 ? 'grid-cols-2' : ''} ${side === 'left' ? 'lg:order-1' : ''}`}>
          {photos.slice(0, 4).map(([s, a], i) => <div key={i} className={`sh-pic relative overflow-hidden rounded-[22px] ${photos.length > 1 ? 'aspect-[1/1]' : 'aspect-[4/3]'}`}><img src={s} alt={a} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>)}
        </div>
      </div>
    </section>
  );
}
function ShopRoutine({ sec }) {
  const ref = useRef(null);
  useReveal(ref);
  const sale = sec.tail.find((b) => b[0] === 'a' && /Summer/.test(b[1]));
  const rest = sec.tail.filter((b) => b !== sale);
  return (
    <section ref={ref} id="routine" aria-labelledby="routine-title" className="relative z-10 scroll-mt-[120px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <ShopHead head={sec.head} id="routine-title" />
      <ul className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-3 md:grid-cols-3`} role="list">
        {sec.items.map((it, i) => {
          const top = it.blocks.some((b) => /Most Popular/i.test(b[1]));
          const b = it.blocks.filter((x) => !/Most Popular/i.test(x[1]));
          const name = (b.find((x) => x[0] === 'strong') || [])[1];
          const n = (b.find((x) => x[0] === 'small') || [])[1];
          const pct = (b.filter((x) => x[0] === 'strong')[1] || [])[1];
          const spans = b.filter((x) => x[0] === 'span').slice(1);
          return (
            <li key={i} className={`sh-tier rv relative flex flex-col rounded-[22px] bg-white p-6 sh-card ${top ? 'is-top' : ''}`} style={{ transitionDelay: `${0.06 * i}s` }}>
              {top && <span className="absolute right-5 top-5 rounded-full bg-ndm-amber px-2.5 py-1 font-inter text-[11.5px] font-semibold text-white">Most Popular</span>}
              <span className={`font-inter text-[12px] font-medium uppercase tracking-[.16em] ${top ? 'text-white/70' : 'text-ndm-muted'}`}>{n}</span>
              <span className="mt-2 font-aeonik text-[28px] leading-[1.1] tracking-[-0.02em]">{name}</span>
              <span className="mt-4 font-aeonik text-[clamp(36px,3.4vw,48px)] leading-none tracking-[-0.03em]">{pct}</span>
              {spans.map((x, k) => <span key={k} className={`mt-2 font-inter text-[14px] leading-[1.5] ${top ? 'text-white/85' : 'text-ndm-ink/75'}`}>{x[1]}</span>)}
            </li>
          );
        })}
      </ul>
      {sale && <a href={shopLink(sale[2])} className={`${TX_WRAP} rv mt-4 block rounded-[22px] bg-ndm-night p-6 text-white md:p-8`}><span className="font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.2]">{sale[1].split(' Shop the ')[0]}</span><span className="mt-3 block font-inter text-[14px] font-semibold text-ndm-sky">Shop the {sale[1].split(' Shop the ')[1]}</span></a>}
      <div className={`${TX_WRAP} mt-5`}><Blocks b={rest} linkAs="button" className="font-inter text-[13.5px] text-ndm-muted" /></div>
    </section>
  );
}
function ShopDraw({ sec }) {
  const ref = useRef(null);
  useReveal(ref);
  const [sent, setSent] = useState(false);
  const form = sec.tail;
  const g = (re) => (form.find((b) => re.test(b[1])) || [])[1] || '';
  return (
    <section ref={ref} id="draw" aria-labelledby="draw-title" data-nav="dark" className="relative z-10 scroll-mt-[120px] bg-ndm-night px-[var(--gx)] py-[clamp(56px,6vw,96px)] text-white">
      <ShopHead head={sec.head} id="draw-title" dark />
      <ul className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-3 md:grid-cols-3`} role="list">
        {sec.items.map((it, i) => (
          <li key={i} className="rv rounded-[22px] bg-white/[.06] p-6 ring-1 ring-white/10" style={{ transitionDelay: `${0.06 * i}s` }}>
            {it.imgs[0] && <img src={it.imgs[0][0]} alt="" className="mb-4 size-12 object-contain" loading="lazy" />}
            {it.blocks.map(([tag, text], k) => tag === 'h2' || tag === 'h3' ? <h3 key={k} className="mt-1 font-aeonik text-[22px] leading-[1.2]">{text}</h3> : tag === 'p' ? <p key={k} className="mt-2 font-inter text-[14px] leading-[1.6] text-white/75">{text}</p> : <p key={k} className="font-inter text-[12px] font-medium uppercase tracking-[.16em] text-ndm-sky">{text}</p>)}
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className={`${TX_WRAP} rv mt-6 rounded-[22px] bg-white p-6 text-ndm-ink md:p-8`}>
        {sent ? <p className="font-inter text-[16px]">Thank you, you are entered in the monthly draw.</p> : (<>
          <p className="font-aeonik text-[24px] leading-[1.15] text-ndm-ink">{(form.find((b) => b[0] === 'strong') || [])[1]}</p>
          <p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{g(/One entry/)} · {(form.find((b) => /every month/.test(b[1])) || [])[1]}</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {g(/First Name/).split(/\s(?=[A-Z])/).reduce((a, w) => { const last = a[a.length - 1]; if (last && /^(Name|Address|Number)$/.test(w)) a[a.length - 1] = last + ' ' + w; else a.push(w); return a; }, []).map((f) => (
              <input key={f} required type={/Email/.test(f) ? 'email' : /Phone/.test(f) ? 'tel' : 'text'} name={f.toLowerCase().replace(/\s+/g, '-')} placeholder={f} aria-label={f} className={fieldCls} />
            ))}
          </div>
          <label className="mt-3 flex items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-ndm-muted"><input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-ndm-deep" />{g(/consent/i)}</label>
          <div className="mt-4 flex flex-wrap items-center gap-4"><Btn as="button" type="submit" v="ink">{(form.find((b) => b[0] === 'strong') || ['', 'Enter the Draw'])[1]}</Btn><span className="font-inter text-[12.5px] text-ndm-muted">{g(/Winners/)}</span></div>
        </>)}
      </form>
    </section>
  );
}
function ShopIngredients({ sec }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="ingredients" aria-labelledby="ingredients-title" className="relative z-10 scroll-mt-[120px] bg-ndm-mist px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <ShopHead head={sec.head} id="ingredients-title" />
      <ul className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid grid-cols-2 gap-3 md:grid-cols-4`} role="list">
        {sec.items.map((it, i) => {
          const b = it.blocks.map((x) => x[1]);
          return (
            <li key={i} className="sh-ing rv flex flex-col rounded-[22px] bg-white p-5 sh-card" style={{ transitionDelay: `${0.04 * i}s` }}>
              <span className="font-inter text-[12px] text-ndm-muted">{b[0]}</span>
              <span className="mt-auto font-aeonik text-[clamp(26px,2.4vw,34px)] leading-none tracking-[-0.03em] text-ndm-deep">{b[1]}</span>
              <span className="mt-1 font-inter text-[12.5px] uppercase tracking-[.12em] text-ndm-muted">{b[2]}</span>
              <span className="mt-3 font-aeonik text-[20px] leading-[1.15] text-ndm-ink">{b[3]}</span>
              <span className="font-inter text-[13.5px] text-ndm-muted">{b[4]}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
/* the live shop's "Shoppable Social" row: six short clinic clips drifting across (the same clips as the home reels), then the Instagram handle */
function ShopSocial({ sec }) {
  const ref = useRef(null), box = useRef(null);
  useReveal(ref);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  const clips = sec.clips || [];
  const handle = (sec.tail.find((b) => b[0] === 'a') || [])[1] || '@newdermamed';
  const handleHref = (sec.tail.find((b) => b[0] === 'a') || [])[2] || SOCIAL.instagram;
  const row = (hidden) => (
    <ul className="flex shrink-0 gap-3" role={hidden ? undefined : 'list'} aria-hidden={hidden || undefined}>
      {clips.map((src, i) => (
        <li key={i} className="relative w-[clamp(150px,16vw,210px)] shrink-0 overflow-hidden rounded-[18px] bg-black" style={{ aspectRatio: '9 / 16' }}>
          <video src={on ? src : undefined} muted loop playsInline autoPlay={!REDUCED} preload={on ? 'metadata' : 'none'} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        </li>
      ))}
    </ul>
  );
  return (
    <section ref={ref} id="social" aria-labelledby="social-title" className="relative z-10 scroll-mt-[120px] overflow-hidden bg-ndm-paper py-[clamp(56px,6vw,96px)]">
      <div className="px-[var(--gx)]"><ShopHead head={sec.head} id="social-title" /></div>
      <div ref={box} className="mt-[clamp(28px,3.4vw,44px)] overflow-hidden">
        <div className="sh-marq px-[var(--gx)]">{row(false)}{row(true)}</div>
      </div>
      <div className="mt-6 flex justify-center px-[var(--gx)]"><a href={handleHref} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep hover:underline">{handle}<IconArrow size={12} /></a></div>
    </section>
  );
}
function ShopCta({ sec }) {
  const t = sec.tail;
  return (
    <section aria-labelledby="shop-cta-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <div className={`${TX_WRAP} rounded-[26px] bg-ndm-night px-6 py-10 text-center text-white md:px-10 md:py-14`}>
        <h2 id="shop-cta-title" className="font-aeonik text-[clamp(30px,3.2vw,46px)] font-normal leading-[1.1] tracking-[-0.03em]">{(t.find((b) => b[0] === 'h2') || [])[1]}</h2>
        <p className="mx-auto mt-4 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-white/80">{(t.find((b) => b[0] === 'p') || [])[1]}</p>
        <div className="mt-7"><Btn href="#/book" v="book" hot onDark>Book Free Consultation</Btn></div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the shop page */
function ShopPage() {
  const S = Object.fromEntries(SHOP_HOME.map((s) => [s.kind, s]));
  const best = S.bestsellers.items.map((it) => (it.blocks.find((b) => b[0] === 'h2') || [])[1]).filter(Boolean);
  return (<>
    <ShopHero sec={S.hero} />
    <ShopPerks sec={S.perks} />
    <ShopGlimpse sec={S.glimpse} />
    <ShopCards sec={S.flagship} id="flagship" cols="md:grid-cols-2" pic="contain" linkAs="button" />
    <ShopText sec={S.line} id="regen" side="right" />
    <ShopText sec={S.founder} id="founder" side="left" />
    <ShopRoutine sec={S.routine} />
    <ShopCards sec={S.brands} id="brands" cols="md:grid-cols-2" pic="cover" />
    <ShopCards sec={S.match} id="match" cols="sm:grid-cols-2 lg:grid-cols-3" chips={false} />
    <ShopProducts sec={S.bestsellers} id="bestsellers" names={best} />
    <ShopCards sec={S.patients} id="results" cols="md:grid-cols-3" pic="cover" />
    <ShopText sec={S.editorial} id="editorial" side="right" />
    <ShopCatalog sec={S.catalog} />
    <ShopDraw sec={S.draw} />
    <ShopCards sec={S.services} id="services" cols="sm:grid-cols-2 lg:grid-cols-4" />
    <ShopIngredients sec={S.ingredients} />
    {S.social && <ShopSocial sec={S.social} />}
    <ShopCards sec={S.follow} id="follow" cols="sm:grid-cols-2 lg:grid-cols-4" />
    <ShopCards sec={S.articles} id="guides" cols="md:grid-cols-3" />
    <ShopCta sec={S.cta} />
  </>);
}

/* ---------------------------------------------------------------- one product */
function ProductPage({ p }) {
  const ref = useRef(null), rel = useRef(null);
  useReveal(ref); useReveal(rel);
  const [tab, setTab] = useState(0);
  const [pic, setPic] = useState(0);
  const tabs = Object.entries(p.panels || {});
  const line = { key: `shop|${p.slug}`, cat: 'Skincare', name: p.name, label: (p.attributes.Size || [''])[0] || 'Product', price: p.price, was: p.on_sale ? p.regular : 0, unit: '' };
  const related = SHOP.products.filter((x) => x.slug !== p.slug && x.categories.some((c) => p.categories.includes(c))).slice(0, 4);
  const meta = [['SKU', p.sku], ['Category', p.categories.join(', ')], ['Tags', p.tags.join(', ')], ['Brand', p.brands.join(', ')]].filter(([, v]) => v);
  return (<>
    <section ref={ref} aria-labelledby="product-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(40px,5vw,72px)] pt-[150px] sm:pt-[160px]">
      <div className={`${TX_WRAP} grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[clamp(40px,5vw,80px)]`}>
        <div className="rv">
          <div className="sh-pic relative aspect-[1/1] overflow-hidden rounded-[26px] sh-card">
            {p.images[pic] && <img key={pic} src={p.images[pic][0]} alt={p.images[pic][1] || p.name} fetchpriority="high" className="absolute inset-0 h-full w-full object-contain p-8" />}
            {p.on_sale && <span className="sh-sale absolute left-4 top-4 rounded-full px-3 py-1.5 font-inter text-[12.5px] font-semibold">Sale {Math.round((1 - p.price / p.regular) * 100)}%</span>}
          </div>
          {p.images.length > 1 && (
            <ul className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Product photos">
              {p.images.map((im, i) => (
                <li key={im[0]}><button type="button" onClick={() => setPic(i)} aria-pressed={pic === i} aria-label={`Photo ${i + 1}`} className={`sh-pic block size-[72px] overflow-hidden rounded-[12px] bg-white ring-1 transition-shadow ${pic === i ? 'ring-2 ring-ndm-deep' : 'ring-ndm-ink/10 hover:ring-ndm-deep/60'}`}><img src={im[2] || im[0]} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5" /></button></li>
              ))}
            </ul>
          )}
        </div>
        <div className="rv" style={{ transitionDelay: '.08s' }}>
          <p className="font-inter text-[12.5px] font-medium uppercase tracking-[.2em] text-ndm-deep">{p.brands[0] || ''}</p>
          <h1 id="product-title" className="mt-3 font-aeonik text-[clamp(34px,3.6vw,54px)] font-normal leading-[1.08] tracking-[-0.03em] text-ndm-ink">{p.name}</h1>
          <p className="mt-4 flex items-baseline gap-3">
            {p.on_sale && <s className="font-inter text-[16px] text-ndm-muted">{shopMoney(p.regular)}</s>}
            <span className={`font-aeonik text-[clamp(28px,2.6vw,36px)] leading-none tracking-[-0.02em] ${p.on_sale ? 'text-ndm-deep' : 'text-ndm-ink'}`}>{shopMoney(p.price)}</span>
          </p>
          {p.short && <p className="mt-4 max-w-[52ch] font-inter text-[16.5px] leading-[1.6] text-ndm-ink/85">{p.short}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyControl line={line} label={p.name} />
            <a href="cart.html" className="font-inter text-[14px] font-semibold text-ndm-deep hover:underline">View cart</a>
          </div>
          <dl className="mt-7 grid gap-2 border-t border-ndm-ink/10 pt-5 font-inter text-[13.5px]">
            {meta.map(([k, v]) => <div key={k} className="flex gap-3"><dt className="w-20 shrink-0 text-ndm-muted">{k}</dt><dd className="text-ndm-ink">{v}</dd></div>)}
          </dl>
          <ul className="mt-5 flex flex-wrap gap-2" role="list">{Object.entries(p.attributes).filter(([k]) => k !== 'Size').flatMap(([k, vs]) => vs.map((v) => <li key={k + v} className="sh-chip is-ink">{v}</li>))}</ul>
        </div>
      </div>
    </section>
    <section aria-label="About this product" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(56px,6vw,96px)]">
      <div className={`${TX_WRAP} overflow-hidden rounded-[26px] bg-white sh-card`}>
        <div role="tablist" className="no-scrollbar mx-[clamp(14px,2.2vw,28px)] mt-[clamp(14px,2.2vw,28px)] flex gap-1 overflow-x-auto rounded-full bg-ndm-mist p-1">
          {tabs.map(([k], i) => <button key={k} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="sh-tab shrink-0 rounded-full px-5 py-2.5 font-inter text-[14px] font-medium text-ndm-muted transition-colors sm:flex-1">{(p.tabs || [])[i] || k}</button>)}
        </div>
        {tabs[tab] && <div role="tabpanel" className="p-[clamp(20px,2.8vw,40px)]"><Html html={tabs[tab][1].html} className="max-w-[70ch]" /></div>}
      </div>
    </section>
    {related.length > 0 && (
      <section ref={rel} aria-labelledby="related-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
        <div className={TX_WRAP}>
          <TwoTone id="related-title" size="text-[clamp(26px,2.6vw,38px)]" lead={<>{(p.related_title || 'Related products').split(' ').slice(0, -1).join(' ')}<br /></>} strong={(p.related_title || 'Related products').split(' ').slice(-1)[0]} />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">{related.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</ul>
        </div>
      </section>
    )}
  </>);
}
