"""Build what-causes-rosacea-redness.html (Orléva article layout, NDM design system) from promotion.html + blog-ui.jsx + article-ui.jsx.
usage: python3 build_article.py <ndm-homepage dir> <scratch dir>
"""
import json
import re
import sys
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()
s = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', s, count=1, flags=re.S)   # the shell's own SEO head block (src/patches-applied/seo_patch.py) is per page: strip it, the patch re-adds it after the build
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)
blog = (scratch / 'blog-ui.jsx').read_text()
art = (scratch / 'article-ui.jsx').read_text()
OUT = 'what-causes-rosacea-redness.html'
NDM = 'https://newdermamedlaserclinic.com'


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'blog.html'},
        {'@type': 'ListItem', 'position': 3, 'name': 'What Causes Rosacea Redness'}]},
    {'@type': 'BlogPosting', 'headline': 'What Causes Rosacea Redness', 'datePublished': '2025-11-26',
     'image': f'{NDM}/wp-content/uploads/2025/11/1-What-Causes-Rosacea-Redness.webp',
     'author': {'@type': 'Organization', 'name': 'NewDermaMed'}, 'publisher': {'@type': 'MedicalOrganization', 'name': 'NewDermaMed'},
     'description': 'The everyday triggers that can make rosacea flare, why they affect some skin more than others, and how redness can be managed.'},
]}
rep('<title>Promotions, NewDermaMed Toronto</title>', '<title>What Causes Rosacea Redness, NewDermaMed Blog</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    '<meta name="description" content="What causes rosacea redness, the everyday triggers that can make it flare, and how NewDermaMed in Toronto approaches care for calmer skin.">\n'
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')

# same blog motion CSS (word blur, card image settle) plus article typography
css = '''
  /* blog + article motion */
  .rv.bw-wrap{opacity:1;transform:none;filter:none}
  .bw{display:inline-block;opacity:0;filter:blur(12px);transform:translate3d(0,42%,0);transition:opacity .9s var(--e-out),filter 1s var(--e-out),transform 1.15s var(--e-out);transition-delay:var(--d,0s)}
  .bw-wrap.in .bw{opacity:1;filter:none;transform:none}
  .story-img{transform:scale(1.1);transition:transform 1.4s var(--e-out)}
  .story-card.in .story-img{transform:scale(1)}
  .story-card article:hover .story-img{transform:scale(1.05)}
  /* article cards: plain white, neutral shadow, a small lift on hover */
  .story-box{background:#fff;border:1px solid #E3E9EF;box-shadow:0 22px 44px -36px rgba(27,36,43,.28);transition:transform .6s var(--e-out),box-shadow .6s ease}
  @media (hover:hover){.story-box:hover{transform:translateY(-4px);box-shadow:0 30px 56px -38px rgba(27,36,43,.34)}}
  /* white cards in the promotion-card look */
  .lead-card,.take-card{background:#fff;border:1px solid #E3E9EF;box-shadow:0 26px 50px -34px rgba(15,60,95,.3)}
  .take-pic img{transform:scale(1.14);transition:transform 1.8s var(--e-out) .1s}
  .take-pic.in img{transform:scale(1)}
  /* phones: related articles swipe sideways */
  @media (max-width:639px){.related-row>li{flex:0 0 min(84vw,340px);scroll-snap-align:start}}
  /* article text column */
  .article-prose h2{margin-top:clamp(48px,5vw,72px);font-size:clamp(28px,2.6vw,38px);line-height:1.12;letter-spacing:-.025em;color:#1B242B}
  .article-prose h3{margin-top:clamp(28px,3vw,40px);font-size:clamp(20px,1.6vw,24px);line-height:1.25;letter-spacing:-.01em;color:#1B242B}
  .article-prose h2,.article-prose h3{font-weight:400}
  .article-prose p{margin-top:14px;font-size:16.5px;line-height:1.75;color:rgba(27,36,43,.8)}
  .article-prose ul{margin-top:16px;display:grid;gap:10px}
  .article-prose ul li{position:relative;padding-left:22px;font-size:16.5px;line-height:1.6;color:rgba(27,36,43,.8)}
  .article-prose ul li::before{content:"";position:absolute;left:4px;top:.62em;width:7px;height:7px;border-radius:99px;background:#209ED9}
  .article-prose figure{margin-top:clamp(28px,3vw,40px)}
  @media (prefers-reduced-motion:reduce){.bw,.story-img{transition:none;opacity:1;filter:none;transform:none}}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

a = s.index('\nfunction App() {')
b = s.index('ReactDOM.createRoot', a)
app = r'''
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
          <ArticleHead p={post} a={ARTICLE} />
          <ArticleBody a={ARTICLE} />
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
s = s[:a] + '\n' + blog + '\n' + art + '\n/* ---------------------------------------------------------------- app (article page) */' + app + s[b:]
(root / OUT).write_text(s)
print('wrote', OUT, len(s))
