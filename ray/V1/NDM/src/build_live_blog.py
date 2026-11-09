"""Build the blog from the live site: blog.html (the team's listing, every card opening its own local article) and one article page
per live post (src/live/pages.json, 34 posts), text verbatim, in the article layout of what-causes-rosacea-redness.html.
usage: python3 src/build_live_blog.py <NDM dir> <src dir>
"""
import json, re, sys, html as H
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup

root, src = Path(sys.argv[1]), Path(sys.argv[2])
POSTS = json.load(open(src / 'live/pages.json', encoding='utf-8'))['posts']
BUILT = json.load(open(src / 'live/pages-built.json'))
IMG_MAP = json.load(open(src / 'live/images.json', encoding='utf-8')) if (src / 'live/images.json').exists() else {}
NDM = 'https://newdermamedlaserclinic.com'

shell = (root / 'promotion.html').read_text(encoding='utf-8')
shell = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', shell, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build
shell = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', shell, count=1)
blog_ui = (src / 'blog-ui.jsx').read_text(encoding='utf-8')
art_ui = (src / 'article-ui.jsx').read_text(encoding='utf-8')
art_ui = art_ui[art_ui.index('/* thin reading-progress line'):]          # components only; the Rosacea ARTICLE data stays with build_article.py
build_article = (src / 'build_article.py').read_text(encoding='utf-8')
CSS = build_article[build_article.index("css = '''") + 9:build_article.index("'''\nanchor")]
LIVE_LINKS = dict(BUILT, **{'about-us': 'about.html', 'contact-us': 'about.html#contact', 'promotion': 'promotion.html', 'blog': 'blog.html', 'fees-financing': 'pricing.html#prices'})

# every post opens its own page here
local = {}
TAKEN = set(BUILT.values()) | {'index.html', 'about.html', 'pricing.html', 'promotion.html', 'blog.html', 'shop.html', 'before-after.html', 'cart.html', 'checkout.html', 'order-confirmed.html', 'black-friday.html', 'aptos-thread-lift.html'}
for p in POSTS:
    p['key'] = p['url'].rstrip('/').split('/')[-1]   # the post's address on the live site (one post's WordPress slug differs from its address)
    if p['key'] + '.html' in TAKEN: p['key'] += '-article'   # the 2015 "Chemical Peels" post shares its address with the treatment page here
    local['/' + p['url'].rstrip('/').split('/')[-1] + '/'] = p['key'] + '.html'
blog_ui = re.sub(r"const BLOG_LOCAL = \{.*?\};", "const BLOG_LOCAL = " + json.dumps(local) + ";", blog_ui, count=1)

sys.path.insert(0, str(src))
from live_text import dashes   # noqa: E402  (approval item A1: dashes in the live copy become commas)


def first_lines(html, n=200):
    """the opening of the article, as the live blog shows it on its cards (approval item D2)"""
    t = re.sub(r'\s+', ' ', BeautifulSoup(html, 'lxml').get_text(' ')).strip()
    t = dashes(t)
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0].rstrip(',;:') + ' …'


def js_str(t):
    return "'" + t.replace('\\', '\\\\').replace("'", "\\'") + "'"


# the blog cards: summaries become the article's own first lines (D2)
for p in POSTS:
    u = '/' + p['url'].rstrip('/').split('/')[-1] + '/'
    row = re.search(r"\['((?:[^'\\]|\\.)*)', '" + re.escape(u) + r"', '([^']*)', (\d+), '([^']*)', '([^']*)', '((?:[^'\\]|\\.)*)'\]", blog_ui)
    assert row, u
    new_row = row.group(0)[:row.start(6) - row.start(0) - 1] + js_str(first_lines(p['html'])) + ']'
    blog_ui = blog_ui.replace(row.group(0), new_row)
(src / 'blog-ui.jsx').write_text(blog_ui, encoding='utf-8')   # kept on disk too, so the team's own build_blog.py links the same pages and shows the same lines
json.dump(local, open(src / 'live/posts-built.json', 'w'), indent=1)   # live address -> article file, for the link patches
if (root / 'blog.html').exists():   # the built listing carries its own copy of BLOG_LOCAL
    b = (root / 'blog.html').read_text(encoding='utf-8')
    b2 = re.sub(r"const BLOG_LOCAL = \{.*?\};", "const BLOG_LOCAL = " + json.dumps(local) + ";", b, count=1)
    if b2 != b: (root / 'blog.html').write_text(b2, encoding='utf-8')


# this file is gone from the live server (HTTP 410), so the live article shows a broken image there; it is left out here
BROKEN = {'https://www.newdermamedlaserclinic.com/wp-content/uploads/2019/11/How-To-Get-Rid-of-Spider-Veins-and-Varicose-Veins-1-1024x448.jpg'}


def img(url):
    return IMG_MAP.get(url, url)


# old addresses used inside the older articles (the live site redirects them); each opens the page that covers it here
LEGACY = {'botox-dermal-fillers-clinic/botox-cosmetic-treatment': 'botox.html', 'botox-dermal-fillers-clinic/lip-augmentation': 'lip-augmentation.html',
          'botox-dermal-fillers-clinic/juvederm': 'juvederm.html', 'botox-dermal-fillers-clinic/dermal-fillers': 'dermal-fillers.html',
          'botox-dermal-fillers-clinic/tear-trough-correction': 'tear-trough-correction.html', 'botox-dermal-fillers-clinic/hyperpigmentation': 'hyperpigmentation.html',
          'body-clinic/laser-vein-removal': 'laser-vein-removal.html', 'body-clinic/vein-removal': 'vein-removal-treatment.html', 'body-clinic/coolsculpting': 'coolsculpting.html',
          'procedures/body-clinic/coolsculpting': 'coolsculpting.html', 'face-clinic/microdermabrasion': 'microdermabrasion.html', 'face-clinic/dark-circle-removal': 'dark-circles.html',
          'book-free-consultation': '#/book', 'online-booking': '#/book', 'fees-financing': 'pricing.html#prices', '': 'index.html'}


def fix_links(html):
    def rep(m):
        href = H.unescape(m.group(1))
        k = re.sub(r'^https?://(www\.)?newdermamedlaserclinic\.com/?', '', href).strip('/')
        if re.match(r'^https?://(www\.)?newdermamedlaserclinic\.com', href) or href.startswith('/'):
            if k in LIVE_LINKS: return 'href="' + LIVE_LINKS[k] + '"'
            if k in LEGACY: return 'href="' + LEGACY[k] + '"'
            if k in local: return 'href="' + local['/' + k + '/'] + '"'
            if '/' + k + '/' in local: return 'href="' + local['/' + k + '/'] + '"'
        return m.group(0)
    return re.sub(r'href="([^"]+)"', rep, html)


def blocks_of(html):
    """the live article body as the article layout's blocks: headings, paragraphs (with their links and bold kept), lists, images"""
    s = BeautifulSoup('<div id="r">' + html + '</div>', 'lxml').find(id='r')
    out = []
    for el in s.find_all(recursive=False):
        if el.name in ('h2', 'h3', 'h4'):
            out.append([el.name if el.name != 'h4' else 'h3', el.get_text(' ', strip=True)])
        elif el.name in ('ul', 'ol'):
            out.append([el.name, [str(li.decode_contents()).strip() for li in el.find_all('li', recursive=False)]])
        elif el.name == 'img':
            if el.get('src', '') not in BROKEN: out.append(['img', img(el.get('src', '')), el.get('alt', '')])
        elif el.name == 'p':
            imgs = el.find_all('img')
            if imgs and not el.get_text(strip=True):
                for i in imgs:
                    if i.get('src', '') not in BROKEN: out.append(['img', img(i.get('src', '')), i.get('alt', '')])
                continue
            for i in imgs: i.decompose()
            inner = str(el.decode_contents()).strip()
            if inner: out.append(['html', inner])
        else:
            t = str(el.decode_contents()).strip()
            if t: out.append(['html', t])
    return out


def two_lines(title):
    w = title.split(' ')
    if len(w) < 3: return [title, '']
    k = max(1, len(w) * 3 // 5)
    return [' '.join(w[:k]), ' '.join(w[k:])]


APP = r'''
function App() {
  const cart = useCartState();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useOnScroll(() => {
    const probe = 70;
    setDark([...document.querySelectorAll('[data-nav="dark"]')].some((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
  }, []);
  useEffect(() => { lockScroll(search || drawer || cartOpen); }, [search, drawer, cartOpen]);
  const post = BLOG_POSTS.find((p) => p.slug === ARTICLE.slug);
  const related = BLOG_POSTS.filter((p) => p !== post && p.topic === post.topic).slice(0, 3);
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <ReadProgress />
      <main id="main">
        <Breadcrumb items={[['Blog', 'blog.html'], post.t]} />
        <article>
          <LiveArticleHead p={post} a={ARTICLE} />
          <LiveArticleBody a={ARTICLE} />
        </article>
        <RelatedStories items={related} />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onBrowse={() => { window.location.href = 'pricing.html#prices'; }} />
      <CartPill onOpen={() => setCartOpen(true)} hidden={cartOpen || drawer || search} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <FloatSearch onOpen={() => setSearch(true)} hidden={search || drawer || cartOpen} />
      <OfferPopup ready />
      <ChatBot ready hidden={cartOpen || drawer || search} />
    </CartCtx.Provider>
  );
}
'''

LIVE_ART_UI = r'''
/* ---------------------------------------------------------------- article pages from the live blog: the same layout, the post's own words */
function LiveArticleHead({ p, a }) {
  const ref = useRef(null), pic = useRef(null);
  useReveal(ref);
  useOnScroll(() => {
    const img = pic.current; if (!img || REDUCED) return;
    const h = img.parentElement.offsetHeight;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.15, h * 0.12).toFixed(1)}px,0)`;
  }, []);
  return (
    <div ref={ref} className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(170px,15vw,220px)]">
      <div className="mx-auto max-w-[980px] text-center">
        <div className="rv flex justify-center"><StoryMeta p={p} /></div>
        <BlurTitle as="h1" id="article-title" size="text-[clamp(38px,5vw,80px)]" className="mt-6" lead={a.lead[0]} strong={a.lead[1]} />
        <p className="rv mt-6 font-inter text-[14px] text-ndm-muted" style={{ transitionDelay: '.3s' }}>By the NewDermaMed team<span className="mx-2">·</span><time dateTime={a.iso}>{p.d}</time></p>
      </div>
      {a.hero && <div className="rv rv-clip relative mx-auto mt-[clamp(40px,5vw,72px)] aspect-[16/10] max-w-[1320px] overflow-hidden rounded-[20px] bg-ndm-line sm:aspect-[21/9]">
        <img ref={pic} src={a.hero} alt={a.heroAlt || ''} fetchpriority="high" className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover will-change-transform" />
      </div>}
    </div>
  );
}
function LiveArticleBody({ a }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} id="article-body" aria-labelledby="article-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(72px,8vw,120px)] pt-[clamp(48px,6vw,88px)]">
      <div className="article-prose live-article mx-auto max-w-[720px]">
        {a.intro && <p className="rv font-aeonik text-[clamp(21px,1.8vw,26px)] leading-[1.45] tracking-[-0.01em] text-ndm-ink" dangerouslySetInnerHTML={{ __html: a.intro }} />}
        {a.intro && <hr className="my-[clamp(36px,4vw,56px)] border-ndm-ink/10" />}
        {a.body.map((b, i) => {
          const [t, x, alt] = b;
          if (t === 'h2') return <h2 key={i} className="rv font-aeonik">{x}</h2>;
          if (t === 'h3') return <h3 key={i} className="rv font-aeonik">{x}</h3>;
          if (t === 'ul' || t === 'ol') { const L = t; return <L key={i} className="rv font-inter" role="list">{x.map((li, k) => <li key={k} dangerouslySetInnerHTML={{ __html: li }} />)}</L>; }
          if (t === 'img') return (
            <figure key={i} className="rv rv-clip">
              <img src={x} alt={alt} loading="lazy" decoding="async" className="w-full rounded-[10px] object-cover" />
              {alt && <figcaption className="mt-2 font-inter text-[13px] text-ndm-muted">{alt}</figcaption>}
            </figure>
          );
          return <p key={i} className="rv font-inter" dangerouslySetInnerHTML={{ __html: x }} />;
        })}
        <aside aria-label="Book a consultation" className="take-card mt-[clamp(48px,5vw,72px)] grid overflow-hidden rounded-[22px] md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:-mx-[clamp(0px,9vw,140px)]">
          <div className="rv rv-clip take-pic relative min-h-[300px] overflow-hidden bg-ndm-mist md:min-h-full">
            <img src="assets/testimonials/t-1.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
          </div>
          <div className="rv p-[clamp(24px,3vw,44px)]" style={{ transitionDelay: '.15s' }}>
            <Eyebrow>Your next step</Eyebrow>
            <p className="mt-5 font-aeonik text-[clamp(21px,1.8vw,26px)] leading-[1.4] tracking-[-0.01em] text-ndm-ink">Every plan starts with a free consultation at our Uptown or Downtown clinic.</p>
            <p className="mt-4 font-inter text-[14px] leading-[1.6] text-ndm-muted">Individual results may vary.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Btn href="#/book" v="book" hot>Book Free Consultation</Btn>
              <Btn href="blog.html" v="line">More articles</Btn>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
'''
LIVE_ART_CSS = '''
  .live-article p a,.live-article li a{color:#0F80C3;font-weight:600;text-decoration:underline;text-underline-offset:4px}
  .live-article strong{font-weight:600;color:#1B242B}
  .live-article ol{margin-top:16px;display:grid;gap:10px;counter-reset:li}
  .live-article ol li{position:relative;padding-left:26px;font-size:16.5px;line-height:1.6;color:rgba(27,36,43,.8)}
  .live-article ol li::before{counter-increment:li;content:counter(li) ".";position:absolute;left:0;top:0;color:#0F80C3;font-weight:600}
'''


def build_post(p):
    body = blocks_of(fix_links(dashes(p['html'])))
    intro = ''
    if body and body[0][0] == 'html' and len(BeautifulSoup(body[0][1], 'lxml').get_text()) > 120:
        intro = body.pop(0)[1]
    iso = p['date'][:10]
    d = {'slug': '/' + p['url'].rstrip('/').split('/')[-1] + '/', 'lead': two_lines(p['title']), 'hero': img(p['hero'][0][0]) if p['hero'] else '', 'heroAlt': p['hero'][0][1] if p['hero'] else '', 'iso': iso, 'intro': intro, 'body': body}
    out = p['key'] + '.html'
    s = shell
    i = s.rindex('</style>', 0, s.index('<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'))
    s = s[:i] + CSS + LIVE_ART_CSS + s[i:]
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'}, {'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'blog.html'}, {'@type': 'ListItem', 'position': 3, 'name': p['title']}]},
        {'@type': 'BlogPosting', 'headline': p['title'], 'datePublished': iso, 'dateModified': p['modified'][:10], 'image': d['hero'], 'author': {'@type': 'Organization', 'name': 'NewDermaMed'}, 'publisher': {'@type': 'MedicalOrganization', 'name': 'NewDermaMed'}, 'description': p['seo'].get('description') or p['excerpt']}]}
    title = p['seo'].get('title') or f"{p['title']}, NewDermaMed Blog"
    desc = p['seo'].get('description') or p['excerpt']
    assert s.count('<title>Promotions, NewDermaMed Toronto</title>') == 1
    s = s.replace('<title>Promotions, NewDermaMed Toronto</title>', '<title>' + H.escape(title) + '</title>')
    old_desc = '<meta name="description" content="Current offers on lip filler, microneedling, peels, laser and skin boosters at NewDermaMed, Toronto. Every treatment starts with a free consultation.">'
    assert s.count(old_desc) == 1
    s = s.replace(old_desc, '<meta name="description" content="' + H.escape(desc, quote=True) + '">\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')
    a = s.index('\nfunction App() {')
    b = s.index('ReactDOM.createRoot', a)
    data = '/* ---------------------------------------------------------------- this article: every word from ' + p['url'] + ' (src/live/pages.json) */\nconst ARTICLE = ' + json.dumps(d, ensure_ascii=False).replace('</script', '<\\/script') + ';\n'
    s = s[:a] + '\n' + blog_ui + '\n' + art_ui + '\n' + data + LIVE_ART_UI + '\n/* ---------------------------------------------------------------- app (article page, live content) */' + APP + s[b:]
    (root / out).write_text(s, encoding='utf-8')
    return out


built = [build_post(p) for p in POSTS]
print(len(built), 'article pages written')
