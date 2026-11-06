"""Build blog.html (Orléva journal layout and motion, NDM look) from promotion.html plus blog-ui.jsx.
usage: python3 build_blog.py <ndm-homepage dir> <scratch dir>
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

root, scratch = Path(sys.argv[1]), Path(sys.argv[2])
s = (root / 'promotion.html').read_text()
ui = (scratch / 'blog-ui.jsx').read_text()

# the shell's own breadcrumb data belongs to the promotion page
s = re.sub(r'\n<script type="application/ld\+json" id="ld-crumbs">.*?</script>', '', s, count=1)


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:90], c)
    s = s.replace(a, b)


# structured data from the same post list the page renders
NDM = 'https://newdermamedlaserclinic.com'
rows = re.findall(r"^  \['(.+?)', '(/[^']+/)', '([A-Z][a-z]+ \d{1,2}, \d{4})', \d+, '[^']+', '([^']+)'", ui, re.M)
assert len(rows) == 34, len(rows)
ld = {
    '@context': 'https://schema.org',
    '@graph': [
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Blog'},
        ]},
        {'@type': 'Blog', 'name': 'The NewDermaMed Journal', 'publisher': {'@type': 'MedicalOrganization', 'name': 'NewDermaMed'},
         'blogPost': [{'@type': 'BlogPosting', 'headline': t, 'url': NDM + u, 'image': f'{NDM}/wp-content/uploads/{img}',
                       'datePublished': datetime.strptime(d, '%B %d, %Y').date().isoformat()} for t, u, d, img in rows]},
    ],
}

# 1. title, description, structured data
rep('<title>Promotions, NewDermaMed Toronto</title>', '<title>Blog, Skin Care Tips &amp; Treatment Guides, NewDermaMed Toronto</title>')
rep('<meta name="description" content="NewDermaMed is Toronto\'s award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.">',
    '<meta name="description" content="Skin care tips and treatment guides from NewDermaMed in Toronto: lasers, injectables, thread lifts, body contouring and vein care.">\n'
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')

# 2. blog CSS: word blur reveal, growing tag line, pulsing rings, card image settle and hover
css = '''
  /* blog page (Orléva journal motion) */
  .rv.bw-wrap{opacity:1;transform:none;filter:none}
  .bw{display:inline-block;opacity:0;filter:blur(12px);transform:translate3d(0,42%,0);transition:opacity .9s var(--e-out),filter 1s var(--e-out),transform 1.15s var(--e-out);transition-delay:var(--d,0s)}
  .bw-wrap.in .bw{opacity:1;filter:none;transform:none}
  .blog-ring{animation:ringPulse 7s ease-in-out infinite;animation-delay:calc(var(--i) * -1.4s)}
  .blog-dot{animation:dotPulse 3.5s ease-in-out infinite}
  @keyframes ringPulse{0%,100%{opacity:.35;transform:scale(.985)}50%{opacity:1;transform:scale(1.02)}}
  @keyframes dotPulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.35);opacity:1}}
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
  @media (prefers-reduced-motion:reduce){.bw,.story-img{transition:none;opacity:1;filter:none;transform:none}.blog-ring,.blog-dot{animation:none}}
'''
anchor = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>'
i = s.rindex('</style>', 0, s.index(anchor))
s = s[:i] + css + s[i:]

# 3. the menu's Blog item lands here
rep("blog: 'blog.html'", "blog: '#top'")

# 4. blog UI before the app, then the blog app
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
  const [featured, ...rest] = BLOG_POSTS;
  return (
    <CartCtx.Provider value={cart}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-[90] focus:rounded-full focus:bg-ndm-amber focus:px-4 focus:py-2 focus:font-mont focus:text-white">Skip to content</a>
      <PromoBar hidden={false} />
      <Header dark={dark} top={36} visible onSearch={() => setSearch(true)} onDrawer={() => setDrawer(true)} onCart={() => setCartOpen(true)} cartCount={cart.count} />
      <main id="main">
        <Breadcrumb items={['Blog']} />
        <div id="top">
          <BlogHero />
        </div>
        <FeaturedStory p={featured} />
        <LatestStories posts={rest} />
        <BlogNewsletter />
        <Faq />
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
s = s[:a] + '\n' + ui + '\n/* ---------------------------------------------------------------- app (blog page) */' + app + s[b:]

(root / 'blog.html').write_text(s)
print('wrote blog.html', len(s))
